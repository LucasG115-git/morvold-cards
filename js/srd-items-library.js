/**
 * Item Library — browse modal + card population logic.
 * Uses official item data plus custom items generated from the illustration XML.
 */
(function () {
    'use strict';

    var _selected = null;
    var _filtered = [];
    var _artFilterActive = false;
    var _artLookup = null;

    var RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'];

    function srdLibrary() { return window.SRD_ITEM_LIBRARY || []; }
    function customLibrary() { return window.CUSTOM_ITEM_LIBRARY || []; }
    function artLibrary() { return window.ITEM_ART_LIBRARY || []; }
    function esc(s) { return (typeof escape_html === 'function') ? escape_html(s) : String(s == null ? '' : s); }

    function normalizeTitle(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/healer's/g, 'healer')
            .replace(/[^a-z0-9]/g, '');
    }

    function displayRarity(rarity) {
        var value = String(rarity || '').trim();
        if (!value) return '';
        if (['None', 'Varies', 'Unknown', 'Unknown (Magic)', 'Other'].indexOf(value) !== -1) return '';
        return value;
    }

    function library() {
        var official = srdLibrary();
        var seen = {};
        official.forEach(function (item) {
            seen[normalizeTitle(item && item.title)] = true;
        });
        return official.concat(customLibrary().filter(function (item) {
            return !seen[normalizeTitle(item && item.title)];
        }));
    }

    function artLookup() {
        if (_artLookup) return _artLookup;
        _artLookup = {};
        artLibrary().forEach(function (entry) {
            var key = normalizeTitle(entry && entry.title);
            if (!key) return;
            if (!_artLookup[key]) _artLookup[key] = [];
            _artLookup[key].push(entry);
        });
        return _artLookup;
    }

    function itemArtEntry(item) {
        var explicitUrl = String(item && item.creature_artwork || '').trim();
        if (explicitUrl) {
            return {
                image_url: explicitUrl,
                artist: String(item && item.creature_art_credit || '').replace(/^Art:\s*/i, '').trim()
            };
        }

        var matches = artLookup()[normalizeTitle(item && item.title)] || [];
        if (!matches.length) return null;

        var exactLower = String(item && item.title || '').trim().toLowerCase();
        for (var i = 0; i < matches.length; i += 1) {
            if (String(matches[i].title || '').trim().toLowerCase() === exactLower) return matches[i];
        }
        return matches[0];
    }

    function hasArt(item) {
        return !!itemArtEntry(item);
    }

    function artCredit(item, entry) {
        var existing = String(item && item.creature_art_credit || '').trim();
        if (existing) return existing;
        return entry && entry.artist ? ('Art: ' + entry.artist) : '';
    }

    function refreshList() {
        var q = ($('#srd-item-search').val() || '').toLowerCase().trim();
        var type = $('#srd-item-type-filter').val() || '';
        var rarity = $('#srd-item-rarity-filter').val() || '';

        _filtered = library().filter(function (it) {
            if (q && String(it.title || '').toLowerCase().indexOf(q) === -1) return false;
            if (type && (it.item_type || '') !== type) return false;
            if (rarity && displayRarity(it.item_rarity) !== rarity) return false;
            if (_artFilterActive && !hasArt(it)) return false;
            return true;
        });

        _filtered.sort(function (a, b) { return String(a.title || '').localeCompare(String(b.title || '')); });

        var rows = _filtered.map(function (it, i) {
            var artIcon = hasArt(it)
                ? ' <i class="fa-solid fa-image srd-art-icon" title="Art available"></i>'
                : '';
            var rarityText = displayRarity(it.item_rarity);
            return '<tr class="srd-monster-row" data-idx="' + i + '">' +
                '<td>' + esc(it.title) + artIcon + '</td>' +
                '<td>' + esc(it.item_type || '') + '</td>' +
                '<td class="srd-cr-cell">' + esc(rarityText || '—') + '</td>' +
                '<td>' + esc(it.item_cost || '—') + '</td>' +
                '</tr>';
        }).join('');

        var tbody = document.getElementById('srd-item-list');
        if (tbody) {
            tbody.innerHTML = rows || '<tr><td colspan="4" class="srd-empty">No items match your search.</td></tr>';
        }

        $('#srd-item-list .srd-monster-row').on('click', function () {
            $('#srd-item-list .srd-monster-row').removeClass('srd-selected');
            $(this).addClass('srd-selected');
            _selected = _filtered[parseInt($(this).data('idx'), 10)];
            $('#srd-item-load-btn, #srd-item-load-new-btn').prop('disabled', false);
        }).on('dblclick', function () {
            if (_selected) applyToCurrentCard();
        });

        _selected = null;
        $('#srd-item-load-btn, #srd-item-load-new-btn').prop('disabled', true);
    }

    var SCALAR_FIELDS = [
        'item_type', 'item_subtype', 'item_rarity', 'item_attunement', 'item_attunement_req',
        'item_damage_dice', 'item_damage_type', 'item_range_normal', 'item_range_long',
        'item_weight', 'item_cost', 'item_description'
    ];

    function applyItemDataToCard(item, card) {
        SCALAR_FIELDS.forEach(function (f) { card[f] = ''; });
        card.item_tier = '';
        card.item_ac = '';
        card.item_properties = [];
        card.item_focus_classes = [];
        card.item_cursed = false;
        card.item_sentient = false;
        card.item_curse_text = '';
        card.item_sentient_text = '';
        card.creature_artwork = '';
        card.creature_art_credit = '';
        card.art_gradient = '';

        card.title = item.title || 'Item';
        SCALAR_FIELDS.forEach(function (f) { if (item[f] !== undefined) card[f] = item[f]; });
        card.item_properties = Array.isArray(item.item_properties) ? item.item_properties.slice() : [];

        var art = itemArtEntry(item);
        if (art) {
            card.creature_artwork = art.image_url || '';
            card.creature_art_credit = artCredit(item, art);
        }

        card.template = 'item';
        card.sections = null;
        if (typeof card_default_sections === 'function') card.sections = card_default_sections(card);

        if (typeof ui_update_card_list === 'function') ui_update_card_list();
        if (typeof ui_update_selected_card === 'function') ui_update_selected_card();
        if (typeof ui_render_selected_card === 'function') ui_render_selected_card();
        if (typeof local_store_save === 'function') local_store_save();
    }

    function applyToCurrentCard() {
        if (!_selected) return;
        var card = (typeof ui_selected_card === 'function') ? ui_selected_card() : null;
        if (!card) {
            alert('Please select a card first, or use "Create as New Card".');
            return;
        }
        applyItemDataToCard(_selected, card);
        $('#srd-item-modal').modal('hide');
    }

    function applyAsNewCard() {
        if (!_selected) return;
        if (typeof ui_add_new_card === 'function') ui_add_new_card();
        var card = (typeof ui_selected_card === 'function') ? ui_selected_card() : null;
        if (!card) return;
        applyItemDataToCard(_selected, card);
        $('#srd-item-modal').modal('hide');
    }

    function srd_item_open_modal() {
        var items = library();
        if (!items.length) {
            alert('Item data is not available.');
            return;
        }

        var types = Array.from(new Set(items.map(function (it) { return it.item_type; }).filter(Boolean))).sort();
        $('#srd-item-type-filter').html('<option value="">All Types</option>' + types.map(function (t) {
            return '<option value="' + esc(t) + '">' + esc(t) + '</option>';
        }).join(''));

        var present = new Set(items.map(function (it) { return displayRarity(it.item_rarity); }).filter(Boolean));
        var rarities = RARITY_ORDER.filter(function (r) { return present.has(r); });
        $('#srd-item-rarity-filter').html('<option value="">All Rarities</option>' + rarities.map(function (r) {
            return '<option value="' + r + '">' + r + '</option>';
        }).join(''));

        $('#srdItemModalLabel').html('<i class="fa-solid fa-gem"></i> Item Library');
        $('#srd-item-modal .srd-modal-subtitle').text('Select an item to load it into a card.');
        $('#srd-item-search').val('');
        $('#srd-item-type-filter').val('');
        $('#srd-item-rarity-filter').val('');
        _artFilterActive = false;
        $('#srd-item-art-filter').removeClass('active');
        refreshList();

        $('#srd-item-modal').modal('show');
    }

    window.srd_item_open_modal = srd_item_open_modal;
    window.applyItemDataToCard = applyItemDataToCard;

    $(document).ready(function () {
        $('#srd-item-search').on('input', refreshList);
        $('#srd-item-type-filter, #srd-item-rarity-filter').on('change', refreshList);
        $('#srd-item-art-filter').on('click', function () {
            _artFilterActive = !_artFilterActive;
            $(this).toggleClass('active', _artFilterActive);
            refreshList();
        });
        $('#srd-item-load-btn').on('click', applyToCurrentCard);
        $('#srd-item-load-new-btn').on('click', applyAsNewCard);
        $('#srd-item-modal').on('hidden.bs.modal', function () {
            _selected = null;
            _filtered = [];
            _artFilterActive = false;
            $('#srd-item-art-filter').removeClass('active');
            $('#srd-item-load-btn, #srd-item-load-new-btn').prop('disabled', true);
        });
    });
})();
