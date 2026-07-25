/**
 * Foundry VTT → Card Builder import module.
 * Transforms a Foundry dnd5e actor JSON export into the app's card data format,
 * then populates a card using the shared applyMonsterDataToCard() function.
 */
(function () {
    'use strict';

    /* ── HTML → plain text ──────────────────────────────────────────────── */
    function htmlToText(html) {
        if (!html) return '';
        try {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
        } catch (e) {
            return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    function titleCase(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /* ── Lookup tables ──────────────────────────────────────────────────── */
    var SIZE_MAP = {
        'tiny': 'Tiny', 'sm': 'Small', 'med': 'Medium',
        'lg': 'Large', 'huge': 'Huge', 'grg': 'Gargantuan'
    };

    var TYPE_MAP = {
        'aberration': 'Aberration', 'beast': 'Beast', 'celestial': 'Celestial',
        'construct': 'Construct', 'dragon': 'Dragon', 'elemental': 'Elemental',
        'fey': 'Fey', 'fiend': 'Fiend', 'giant': 'Giant', 'humanoid': 'Humanoid',
        'monstrosity': 'Monstrosity', 'ooze': 'Ooze', 'plant': 'Plant', 'undead': 'Undead'
    };

    // Foundry skill abbreviation → app card field name
    var SKILL_MAP = {
        'acr': 'skill_acrobatics',     'ani': 'skill_animal_handling',
        'arc': 'skill_arcana',         'ath': 'skill_athletics',
        'dec': 'skill_deception',      'his': 'skill_history',
        'ins': 'skill_insight',        'itm': 'skill_intimidation',
        'inv': 'skill_investigation',  'med': 'skill_medicine',
        'nat': 'skill_nature',         'prc': 'skill_perception',
        'prf': 'skill_performance',    'per': 'skill_persuasion',
        'rel': 'skill_religion',       'slt': 'skill_sleight_of_hand',
        'ste': 'skill_stealth',        'sur': 'skill_survival'
    };

    var DAMAGE_MAP = {
        'acid': 'Acid', 'bludgeoning': 'Bludgeoning', 'cold': 'Cold',
        'fire': 'Fire', 'force': 'Force', 'lightning': 'Lightning',
        'necrotic': 'Necrotic', 'piercing': 'Piercing', 'poison': 'Poison',
        'psychic': 'Psychic', 'radiant': 'Radiant', 'slashing': 'Slashing',
        'thunder': 'Thunder'
    };

    var CONDITION_MAP = {
        'blinded': 'Blinded', 'charmed': 'Charmed', 'deafened': 'Deafened',
        'diseased': 'Diseased', 'exhaustion': 'Exhaustion', 'frightened': 'Frightened',
        'grappled': 'Grappled', 'incapacitated': 'Incapacitated',
        'invisible': 'Invisible', 'paralyzed': 'Paralyzed', 'petrified': 'Petrified',
        'poisoned': 'Poisoned', 'prone': 'Prone', 'restrained': 'Restrained',
        'stunned': 'Stunned', 'unconscious': 'Unconscious'
    };

    var LANGUAGE_MAP = {
        'common': 'Common', 'dwarvish': 'Dwarvish', 'elvish': 'Elvish',
        'giant': 'Giant', 'gnomish': 'Gnomish', 'goblin': 'Goblin',
        'halfling': 'Halfling', 'orc': 'Orc', 'abyssal': 'Abyssal',
        'celestial': 'Celestial', 'draconic': 'Draconic',
        'deep': 'Deep Speech', 'deepspeech': 'Deep Speech',
        'infernal': 'Infernal', 'primordial': 'Primordial', 'sylvan': 'Sylvan',
        'undercommon': 'Undercommon', 'aquan': 'Aquan', 'auran': 'Auran',
        'ignan': 'Ignan', 'terran': 'Terran'
    };

    /* ── Helper: map a Foundry trait object to a title-case array ───────── */
    function mapTraitObj(traitObj, lookupMap) {
        if (!traitObj) return [];
        var values = Array.isArray(traitObj.value) ? traitObj.value : [];
        var result = values.map(function (v) {
            return lookupMap[(v || '').toLowerCase()] || titleCase(v);
        }).filter(Boolean);
        // custom field (semicolon-separated freeform strings)
        var custom = (traitObj.custom || '').trim();
        if (custom) {
            custom.split(';').forEach(function (c) {
                c = c.trim();
                if (c) result.push(c);
            });
        }
        return result;
    }

    /* ── Main transform ─────────────────────────────────────────────────── */
    function foundryToCardData(json) {
        var d   = typeof json === 'string' ? JSON.parse(json) : json;
        // Support both modern 'system' key and legacy 'data' key
        var sys = d.system || d.data;
        if (!sys) throw new Error('Could not find a "system" or "data" block — is this a Foundry actor export?');

        var attrs     = sys.attributes || {};
        var details   = sys.details    || {};
        var traitsObj = sys.traits     || {};
        var skills    = sys.skills     || {};
        var abilities = sys.abilities  || {};

        var card = { template: 'monster' };

        /* Name */
        card.title = (d.name || 'Unknown Monster').trim();

        /* Creature type & subtype */
        var typeBlock  = details.type || {};
        // Foundry v2 system: details.type is an object {value, subtype, ...}
        // Foundry v1 / legacy: details.type may be a plain string
        var rawType    = (typeof typeBlock === 'object' ? typeBlock.value : typeBlock) || '';
        card.creature_type    = TYPE_MAP[rawType.toLowerCase()] || titleCase(rawType) || 'Humanoid';
        card.creature_subtype = (typeBlock.subtype || '').trim();

        /* Size */
        card.size = SIZE_MAP[(traitsObj.size || '').toLowerCase()] || 'Medium';

        /* Alignment */
        card.alignment = (details.alignment || '').trim();

        /* Challenge Rating */
        var cr = parseFloat(details.cr);
        card.challenge_rating = isNaN(cr) ? 0 : cr;

        /* Ability scores */
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(function (ab) {
            var abData = abilities[ab] || {};
            card[ab] = abData.value != null ? Number(abData.value) : 10;
        });

        /* AC — try flat first (v2 system), fall back to legacy value */
        card.ac_type = 'custom';
        var ac    = attrs.ac || {};
        var acVal = ac.flat != null ? ac.flat : (ac.value != null ? ac.value : '');
        card.custom_ac_override = acVal !== '' ? Number(acVal) : '';

        /* HP — use max HP as the override target */
        var hp = attrs.hp || {};
        card.hp_override = hp.max != null ? Number(hp.max) : '';

        /* Speeds */
        var mv = attrs.movement || {};
        card.walk_speed   = parseInt(mv.walk,   10) || 0;
        card.burrow_speed = parseInt(mv.burrow, 10) || 0;
        card.climb_speed  = parseInt(mv.climb,  10) || 0;
        card.fly_speed    = parseInt(mv.fly,    10) || 0;
        card.swim_speed   = parseInt(mv.swim,   10) || 0;
        card.hover        = !!mv.hover;

        /* Senses */
        var senses = attrs.senses || {};
        card.darkvision  = parseInt(senses.darkvision,  10) || 0;
        card.blindsight  = parseInt(senses.blindsight,  10) || 0;
        card.tremorsense = parseInt(senses.tremorsense, 10) || 0;
        card.truesight   = parseInt(senses.truesight,   10) || 0;

        /* Saving throws — proficient: 1 = proficient, 0 = not */
        var savingThrows = [];
        var AB_NAMES = { str:'strength', dex:'dexterity', con:'constitution',
                         int:'intelligence', wis:'wisdom', cha:'charisma' };
        Object.keys(AB_NAMES).forEach(function (ab) {
            var abData = abilities[ab] || {};
            if (abData.proficient && Number(abData.proficient) > 0) {
                savingThrows.push(AB_NAMES[ab]);
            }
        });
        card.saving_throw_proficiencies = savingThrows;

        /* Skills — value: 0=none, 0.5=half, 1=proficient, 2=expertise */
        Object.keys(SKILL_MAP).forEach(function (abbr) {
            var level  = Number((skills[abbr] || {}).value) || 0;
            var field  = SKILL_MAP[abbr];
            card[field] = level >= 2 ? 'expertise'
                        : level === 1 ? 'proficient'
                        : level === 0.5 ? 'half'
                        : 'none';
        });

        /* Damage types */
        card.damage_resistances     = mapTraitObj(traitsObj.dr, DAMAGE_MAP);
        card.damage_immunities      = mapTraitObj(traitsObj.di, DAMAGE_MAP);
        card.damage_vulnerabilities = mapTraitObj(traitsObj.dv, DAMAGE_MAP);

        /* Condition immunities */
        card.condition_immunities = mapTraitObj(traitsObj.ci, CONDITION_MAP);

        /* Languages */
        var langObj    = traitsObj.languages || {};
        var langValues = Array.isArray(langObj.value) ? langObj.value : [];
        var langs = langValues.map(function (l) {
            return LANGUAGE_MAP[(l || '').toLowerCase()] || titleCase(l);
        }).filter(Boolean);
        var langCustom = (langObj.custom || '').trim();
        if (langCustom) {
            langCustom.split(';').forEach(function (lc) {
                lc = lc.trim();
                if (lc) langs.push(lc);
            });
        }
        card.languages = langs;

        /* ── Items → traits / actions / bonus / reactions / legendary ───── */
        var allTraits  = [], allActions = [], allBonus = [],
            allReact   = [], allLegend  = [], spellItems = [];

        var SKIP_TYPES = { equipment: 1, 'class': 1, background: 1, race: 1,
                           subclass: 1, subrace: 1, feat: 0 };

        (Array.isArray(d.items) ? d.items : []).forEach(function (item) {
            var iSys    = item.system || item.data || {};
            var actType = ((iSys.activation || {}).type || '').toLowerCase();
            var iType   = (item.type || '').toLowerCase();

            // Skip non-ability items
            if (iType === 'equipment' || iType === 'class' || iType === 'background' ||
                iType === 'race'      || iType === 'subclass' || iType === 'subrace') return;

            // Collect spells for grouping
            if (iType === 'spell') {
                spellItems.push(item);
                return;
            }

            var name = (item.name || '').trim();
            var desc = htmlToText((iSys.description || {}).value || '');
            if (!name) return;

            var entry = { title: name, text: desc };

            if      (actType === 'action')    allActions.push(entry);
            else if (actType === 'bonus')     allBonus.push(entry);
            else if (actType === 'reaction')  allReact.push(entry);
            else if (actType === 'legendary') allLegend.push(entry);
            else if (actType === 'lair' || actType === 'mythic') { /* skip */ }
            else                              allTraits.push(entry); // passive / no activation
        });

        /* ── Spells: build a Spellcasting summary trait ─────────────────── */
        if (spellItems.length > 0) {
            var hasSpellcastingTrait = allTraits.some(function (t) {
                return t.title.toLowerCase().indexOf('spellcasting') !== -1;
            });

            if (!hasSpellcastingTrait) {
                var atWill = [], per3 = [], per2 = [], per1 = [];

                spellItems.forEach(function (sp) {
                    var spSys = sp.system || sp.data || {};
                    var uses  = spSys.uses || {};
                    var lvl   = spSys.level != null ? Number(spSys.level) : 1;
                    var name  = (sp.name || '').trim();
                    if (!name) return;

                    if (lvl === 0) {
                        atWill.push(name); // cantrips
                    } else if (uses.per === 'day') {
                        var max = Number(uses.max) || 1;
                        if (max >= 3) per3.push(name);
                        else if (max === 2) per2.push(name);
                        else per1.push(name);
                    } else {
                        // Innate / at-will / unknown — treat as at-will
                        atWill.push(name);
                    }
                });

                var parts = [];
                if (atWill.length) parts.push('At will: ' + atWill.join(', '));
                if (per3.length)   parts.push('3/day each: ' + per3.join(', '));
                if (per2.length)   parts.push('2/day each: ' + per2.join(', '));
                if (per1.length)   parts.push('1/day each: ' + per1.join(', '));

                if (parts.length) {
                    allTraits.unshift({
                        title: 'Spellcasting',
                        text:  parts.join('. ') + '.'
                    });
                }
            }
        }

        // Traits and action groups now use repeaters, so preserve the full
        // imported list.
        card.traits            = allTraits.slice();
        card.actions           = allActions.slice();
        card.bonus_actions     = allBonus.slice();
        card.reactions         = allReact.slice();
        card.legendary_actions = allLegend.slice();

        return card;
    }

    /* ── UI state ───────────────────────────────────────────────────────── */
    var _parsedCard = null;

    function showPreview(msg, isError) {
        $('#foundry-preview')
            .text(msg)
            .show()
            .toggleClass('foundry-preview-ok',  !isError)
            .toggleClass('foundry-preview-err', isError);
        $('#foundry-load-btn, #foundry-load-new-btn').prop('disabled', isError || !_parsedCard);
    }

    function parseAndPreview(text) {
        try {
            var json  = JSON.parse(text);
            _parsedCard = foundryToCardData(json);
            var cr    = _parsedCard.challenge_rating;
            var crStr = cr === 0.125 ? '1/8' : cr === 0.25 ? '1/4' : cr === 0.5 ? '1/2' : String(cr);
            showPreview(
                '\u2713  ' + _parsedCard.title +
                ' \u2014 CR ' + crStr +
                ' ' + (_parsedCard.creature_type || ''),
                false
            );
        } catch (e) {
            _parsedCard = null;
            showPreview('\u2717  ' + (e.message || 'Invalid JSON'), true);
        }
    }

    function readFile(file) {
        if (!file.name.match(/\.json$/i)) {
            _parsedCard = null;
            showPreview('\u2717  Please select a .json file', true);
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var text = e.target.result || '';
            $('#foundry-json-paste').val(text);
            $('#foundry-drop-label').hide();
            $('#foundry-drop-filename-text').text(file.name);
            $('#foundry-drop-filename').show();
            $('#foundry-drop-zone').addClass('foundry-drop-loaded');
            parseAndPreview(text);
        };
        reader.readAsText(file);
    }

    /* ── Apply helpers ──────────────────────────────────────────────────── */
    function applyToCurrentCard() {
        if (!_parsedCard) return;
        var card = typeof ui_selected_card === 'function' ? ui_selected_card() : null;
        if (!card) { alert('Please select a card first, or use "Create as New Card".'); return; }
        applyMonsterDataToCard(_parsedCard, card);
        $('#foundry-import-modal').modal('hide');
    }

    function applyAsNewCard() {
        if (!_parsedCard) return;
        if (typeof ui_add_new_card === 'function') ui_add_new_card();
        var card = typeof ui_selected_card === 'function' ? ui_selected_card() : null;
        if (!card) return;
        applyMonsterDataToCard(_parsedCard, card);
        $('#foundry-import-modal').modal('hide');
    }

    /* ── Open modal ─────────────────────────────────────────────────────── */
    function foundry_open_modal() {
        _parsedCard = null;
        $('#foundry-json-paste').val('');
        $('#foundry-file-input').val('');
        $('#foundry-preview').hide().text('').removeClass('foundry-preview-ok foundry-preview-err');
        $('#foundry-load-btn, #foundry-load-new-btn').prop('disabled', true);
        $('#foundry-drop-zone').removeClass('drag-over foundry-drop-loaded');
        $('#foundry-drop-label').show();
        $('#foundry-drop-filename').hide();
        $('#foundry-drop-filename-text').text('');
        $('#foundry-import-modal').modal('show');
    }

    /* ── Expose globals ─────────────────────────────────────────────────── */
    window.foundry_open_modal = foundry_open_modal;
    window.foundryToCardData  = foundryToCardData;   // reusable by future code

    /* ── Wire events ────────────────────────────────────────────────────── */
    $(document).ready(function () {
        // Browse button (native click to satisfy Safari)
        $('#foundry-browse-btn').on('click', function () {
            document.getElementById('foundry-file-input').click();
        });

        // Clicking anywhere in the zone also opens file picker
        $('#foundry-drop-zone').on('click', function (e) {
            if (!$(e.target).closest('#foundry-browse-btn').length) {
                document.getElementById('foundry-file-input').click();
            }
        });

        // Drag-and-drop
        $('#foundry-drop-zone').on('dragover dragenter', function (e) {
            e.preventDefault(); e.stopPropagation();
            $(this).addClass('drag-over');
        });
        $('#foundry-drop-zone').on('dragleave dragend', function () {
            $(this).removeClass('drag-over');
        });
        $('#foundry-drop-zone').on('drop', function (e) {
            e.preventDefault(); e.stopPropagation();
            $(this).removeClass('drag-over');
            var files = e.originalEvent.dataTransfer.files;
            if (files && files.length) readFile(files[0]);
        });

        // File input
        $('#foundry-file-input').on('change', function () {
            if (this.files && this.files[0]) readFile(this.files[0]);
        });

        // Paste textarea — live parse as user types/pastes
        $('#foundry-json-paste').on('input', function () {
            var val = $(this).val().trim();
            if (val) {
                parseAndPreview(val);
            } else {
                _parsedCard = null;
                $('#foundry-preview').hide();
                $('#foundry-load-btn, #foundry-load-new-btn').prop('disabled', true);
            }
        });

        // Load buttons
        $('#foundry-load-btn').on('click', applyToCurrentCard);
        $('#foundry-load-new-btn').on('click', applyAsNewCard);

        // Reset on close
        $('#foundry-import-modal').on('hidden.bs.modal', function () {
            _parsedCard = null;
        });
    });
})();
