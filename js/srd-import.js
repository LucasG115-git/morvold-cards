/**
 * SRD Monster Library — import modal and card population logic.
 */
(function () {
    'use strict';

    var _selectedMonster = null;
    var _filteredMonsters = [];
    var _artFilterActive = false;
    // 'npc' → humanoids only (NPC Library); 'creature' → all creatures (Creature Library)
    var _mode = 'npc';

    /* ── Restrict the library to humanoids only ───────────────────────────── */
    function humanoidMonsters() {
        return (window.SRD_MONSTERS || []).filter(function (m) {
            return (m.creature_type || '').toLowerCase() === 'humanoid';
        });
    }

    /* ── The set of monsters shown, per library mode ──────────────────────── */
    function baseMonsters() {
        return _mode === 'creature' ? (window.SRD_MONSTERS || []) : humanoidMonsters();
    }

    /* ── CR display helper ────────────────────────────────────────────────── */
    function crDisplay(cr) {
        if (cr === 0.125) return '1/8';
        if (cr === 0.25)  return '1/4';
        if (cr === 0.5)   return '1/2';
        return String(cr);
    }

    /* ── List rendering ───────────────────────────────────────────────────── */
    function refreshList() {
        var q    = ($('#srd-search').val() || '').toLowerCase().trim();
        var type = $('#srd-type-filter').val() || '';

        var monsters = baseMonsters();

        _filteredMonsters = monsters.filter(function (m) {
            if (q    && m.title.toLowerCase().indexOf(q) === -1) return false;
            if (type && m.creature_type !== type)                 return false;
            if (_artFilterActive && !m.creature_artwork)          return false;
            return true;
        });

        _filteredMonsters.sort(function (a, b) {
            var diff = a.challenge_rating - b.challenge_rating;
            return diff !== 0 ? diff : a.title.localeCompare(b.title);
        });

        var rows = _filteredMonsters.map(function (m, i) {
            var artIcon = m.creature_artwork
                ? ' <i class="fa-solid fa-image srd-art-icon" title="Art available"></i>'
                : '';
            return '<tr class="srd-monster-row" data-idx="' + i + '">' +
                '<td>' + m.title + artIcon + '</td>' +
                '<td class="srd-cr-cell">' + crDisplay(m.challenge_rating) + '</td>' +
                '<td>' + (m.creature_type || '') + (m.creature_subtype ? ' (' + m.creature_subtype + ')' : '') + '</td>' +
                '<td>' + (m.size || '') + '</td>' +
                '</tr>';
        }).join('');

        var tbody = document.getElementById('srd-monster-list');
        if (tbody) {
            tbody.innerHTML = rows || '<tr><td colspan="4" class="srd-empty">No monsters match your search.</td></tr>';
        }

        // Re-attach row click handlers
        $('#srd-monster-list .srd-monster-row').on('click', function () {
            $('#srd-monster-list .srd-monster-row').removeClass('srd-selected');
            $(this).addClass('srd-selected');
            _selectedMonster = _filteredMonsters[parseInt($(this).data('idx'), 10)];
            $('#srd-load-btn, #srd-load-new-btn').prop('disabled', false);
        }).on('dblclick', function () {
            // Double-click: load into current card immediately
            if (_selectedMonster) {
                applyToCurrentCard();
            }
        });

        // Reset selection state
        _selectedMonster = null;
        $('#srd-load-btn, #srd-load-new-btn').prop('disabled', true);
    }

    /* ── Apply monster data to a card object ──────────────────────────────── */
    function applyMonsterDataToCard(monster, card) {
        // --- Reset all skill fields to 'none' first ---
        var ALL_SKILL_FIELDS = [
            'skill_acrobatics', 'skill_animal_handling', 'skill_arcana', 'skill_athletics',
            'skill_deception', 'skill_history', 'skill_insight', 'skill_intimidation',
            'skill_investigation', 'skill_medicine', 'skill_nature', 'skill_perception',
            'skill_performance', 'skill_persuasion', 'skill_religion', 'skill_sleight_of_hand',
            'skill_stealth', 'skill_survival'
        ];
        ALL_SKILL_FIELDS.forEach(function (f) { card[f] = 'none'; });

        // --- Reset speed / sense fields that may linger from previous card ---
        var RESET_ZERO = [
            'walk_speed', 'burrow_speed', 'climb_speed', 'fly_speed', 'swim_speed',
            'blindsight', 'darkvision', 'tremorsense', 'truesight'
        ];
        RESET_ZERO.forEach(function (f) { card[f] = 0; });
        card.hover          = false;
        card.wearing_shield = false;
        card.hp_override    = '';
        card.custom_ac_override = '';
        card.natural_armor_type     = '';
        card.equipped_armor_type    = '';
        card.unarmored_defense_type = '';
        card.creature_subtype = '';
        card.creature_artwork   = '';
        card.creature_art_credit = '';
        card.art_gradient = '';

        // --- Reset array fields ---
        var ARRAY_FIELDS = [
            'damage_resistances', 'damage_immunities', 'damage_vulnerabilities',
            'condition_immunities', 'saving_throw_proficiencies', 'languages',
            'traits', 'actions', 'bonus_actions', 'reactions', 'legendary_actions'
        ];
        ARRAY_FIELDS.forEach(function (f) { card[f] = []; });

        // --- Apply all scalar fields from preset ---
        var SCALAR_FIELDS = [
            'title', 'template', 'creature_type', 'creature_subtype', 'size', 'alignment',
            'challenge_rating', 'str', 'dex', 'con', 'int', 'wis', 'cha',
            'ac_type', 'custom_ac_override', 'hp_override', 'wearing_shield',
            'walk_speed', 'burrow_speed', 'climb_speed', 'fly_speed', 'swim_speed', 'hover',
            'blindsight', 'darkvision', 'tremorsense', 'truesight',
            'natural_armor_type', 'equipped_armor_type', 'unarmored_defense_type',
            'creature_artwork', 'creature_art_credit'
        ];
        SCALAR_FIELDS.concat(ALL_SKILL_FIELDS).forEach(function (f) {
            if (monster[f] !== undefined) card[f] = monster[f];
        });

        // --- Apply array fields from preset ---
        ARRAY_FIELDS.forEach(function (f) {
            if (Array.isArray(monster[f])) card[f] = monster[f].slice();
        });

        // --- Card type follows the library: NPC Library → npc, Creature → creature.
        //     Either way the imported stat block turns on the combat sections. ---
        card.template = (_mode === 'npc') ? 'npc' : 'creature';
        card.show_stat_block = true;
        card.sections = null;
        if (typeof card_default_sections === 'function') card.sections = card_default_sections(card);

        // --- Refresh the UI ---
        if (typeof ui_update_selected_card === 'function') ui_update_selected_card();
        if (typeof ui_render_selected_card === 'function') ui_render_selected_card();
    }

    /* ── Load helpers ─────────────────────────────────────────────────────── */
    function applyToCurrentCard() {
        if (!_selectedMonster) return;
        var card = (typeof ui_selected_card === 'function') ? ui_selected_card() : null;
        if (!card) {
            alert('Please select a card first, or use "Create as New Card".');
            return;
        }
        applyMonsterDataToCard(_selectedMonster, card);
        $('#srd-monster-modal').modal('hide');
    }

    function applyAsNewCard() {
        if (!_selectedMonster) return;
        if (typeof ui_add_new_card === 'function') ui_add_new_card();
        var card = (typeof ui_selected_card === 'function') ? ui_selected_card() : null;
        if (!card) return;
        applyMonsterDataToCard(_selectedMonster, card);
        $('#srd-monster-modal').modal('hide');
    }

    /* ── Open modal ───────────────────────────────────────────────────────── */
    function srd_open_modal(mode) {
        _mode = (mode === 'creature') ? 'creature' : 'npc';

        var monsters = baseMonsters();
        if (!monsters || !monsters.length) {
            alert('SRD monster data is not available.');
            return;
        }

        // Title + subtitle per mode
        if (_mode === 'creature') {
            $('#srdModalLabel').html('<i class="fa-solid fa-dragon"></i> Creature Library');
            $('.srd-modal-subtitle').text('Select a creature to load it into a card.');
        } else {
            $('#srdModalLabel').html('<i class="fa-solid fa-book-open-reader"></i> NPC Library');
            $('.srd-modal-subtitle').text('Select a humanoid to load it into an NPC card.');
        }

        // Creature mode: offer a Type filter across all creature types.
        // NPC mode: humanoids only, so the type filter is hidden.
        if (_mode === 'creature') {
            var types = Array.from(new Set((window.SRD_MONSTERS || []).map(function (m) { return m.creature_type; }).filter(Boolean))).sort();
            var opts = '<option value="">All Types</option>' + types.map(function (t) {
                return '<option value="' + t + '">' + t + '</option>';
            }).join('');
            $('#srd-type-filter').html(opts).show();
        } else {
            $('#srd-type-filter').html('<option value="">All Types</option>').hide();
        }

        // Reset search and filters
        $('#srd-search').val('');
        $('#srd-type-filter').val('');
        _artFilterActive = false;
        $('#srd-art-filter').removeClass('active');
        refreshList();

        $('#srd-monster-modal').modal('show');
    }

    /* ── Expose globally ─────────────────────────────────────────────────── */
    window.srd_open_modal       = srd_open_modal;
    window.applyMonsterDataToCard = applyMonsterDataToCard;   // for future Foundry import

    /* ── Wire up events after DOM ready ──────────────────────────────────── */
    $(document).ready(function () {
        $('#srd-search').on('input', refreshList);
        $('#srd-type-filter').on('change', refreshList);

        $('#srd-art-filter').on('click', function () {
            _artFilterActive = !_artFilterActive;
            $(this).toggleClass('active', _artFilterActive);
            refreshList();
        });

        $('#srd-load-btn').on('click', applyToCurrentCard);
        $('#srd-load-new-btn').on('click', applyAsNewCard);

        $('#srd-monster-modal').on('hidden.bs.modal', function () {
            _selectedMonster = null;
            _filteredMonsters = [];
            _artFilterActive = false;
            $('#srd-art-filter').removeClass('active');
            $('#srd-load-btn, #srd-load-new-btn').prop('disabled', true);
        });
    });
})();
