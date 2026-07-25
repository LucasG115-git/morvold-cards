/**
 * 5e Tools / RPG Cards JSON Builder → Card Builder import module.
 * Transforms an array of JSON Builder card objects into the app's card data format,
 * then populates the deck using ui_add_cards().
 */
(function () {
    'use strict';

    /* ── Helpers ────────────────────────────────────────────────────────── */
    function titleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        });
    }

    var SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

    /* Skill name → card field name */
    var SKILL_NAME_MAP = {
        'acrobatics':     'skill_acrobatics',
        'animal handling':'skill_animal_handling',
        'arcana':         'skill_arcana',
        'athletics':      'skill_athletics',
        'deception':      'skill_deception',
        'history':        'skill_history',
        'insight':        'skill_insight',
        'intimidation':   'skill_intimidation',
        'investigation':  'skill_investigation',
        'medicine':       'skill_medicine',
        'nature':         'skill_nature',
        'perception':     'skill_perception',
        'performance':    'skill_performance',
        'persuasion':     'skill_persuasion',
        'religion':       'skill_religion',
        'sleight of hand':'skill_sleight_of_hand',
        'stealth':        'skill_stealth',
        'survival':       'skill_survival'
    };

    /* Ability abbreviation → full name for saving throws */
    var SAVE_ABBR_MAP = {
        'str': 'strength', 'dex': 'dexterity', 'con': 'constitution',
        'int': 'intelligence', 'wis': 'wisdom', 'cha': 'charisma'
    };

    /* Challenge rating fraction strings → numeric */
    function parseCR(crStr) {
        var s = (crStr || '').trim().split(/[\s(]/)[0];
        if (s === '1/8') return 0.125;
        if (s === '1/4') return 0.25;
        if (s === '1/2') return 0.5;
        var n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    }

    /* Parse "20 ft., Fly 120 ft., Swim 30 ft." into speed fields */
    function parseSpeeds(card, value) {
        var parts = value.split(',');
        parts.forEach(function (part) {
            part = part.trim();
            var lower = part.toLowerCase();
            var match = part.match(/(\d+)\s*ft/i);
            var ft = match ? parseInt(match[1], 10) : 0;
            if (lower.indexOf('fly') !== -1) {
                card.fly_speed = ft;
                if (lower.indexOf('hover') !== -1) card.hover = true;
            } else if (lower.indexOf('swim') !== -1) {
                card.swim_speed = ft;
            } else if (lower.indexOf('burrow') !== -1) {
                card.burrow_speed = ft;
            } else if (lower.indexOf('climb') !== -1) {
                card.climb_speed = ft;
            } else {
                // bare number at start → walk speed
                card.walk_speed = ft;
            }
        });
    }

    /* Parse "darkvision 60 ft., tremorsense 30 ft." etc. */
    function parseSenses(card, value) {
        var lower = value.toLowerCase();
        var m;
        m = lower.match(/darkvision\s+(\d+)/);
        if (m) card.darkvision = parseInt(m[1], 10);
        m = lower.match(/blindsight\s+(\d+)/);
        if (m) card.blindsight = parseInt(m[1], 10);
        m = lower.match(/tremorsense\s+(\d+)/);
        if (m) card.tremorsense = parseInt(m[1], 10);
        m = lower.match(/truesight\s+(\d+)/);
        if (m) card.truesight = parseInt(m[1], 10);
    }

    /* Parse subtitle line: "Size Type (Subtype), Alignment" */
    function parseSubtitle(card, text) {
        // Find size
        var words = text.trim().split(/\s+/);
        var size = null;
        var rest = text;
        for (var i = 0; i < SIZES.length; i++) {
            if (words[0] && words[0].toLowerCase() === SIZES[i].toLowerCase()) {
                size = SIZES[i];
                rest = text.slice(words[0].length).trim();
                break;
            }
        }
        if (size) card.size = size;

        // Split on comma (first comma separates type from alignment)
        var commaIdx = rest.indexOf(',');
        var typePart = commaIdx !== -1 ? rest.slice(0, commaIdx) : rest;
        var alignPart = commaIdx !== -1 ? rest.slice(commaIdx + 1).trim() : '';

        // Extract parenthetical subtype from typePart
        var parenMatch = typePart.match(/\(([^)]+)\)/);
        if (parenMatch) {
            card.creature_subtype = parenMatch[1].trim();
            typePart = typePart.replace(/\([^)]+\)/, '').trim();
        }
        card.creature_type = typePart.trim();

        // Alignment — strip leading "typically " or "any "
        if (alignPart) {
            alignPart = alignPart.replace(/^(typically|any)\s+/i, '').trim();
            card.alignment = titleCase(alignPart);
        }
    }

    /* ── Main parser ────────────────────────────────────────────────────── */
    function jsonBuilderToCards(arr) {
        var cards = [];

        arr.forEach(function (item) {
            var card = {
                template: 'monster',
                title: (item.title || '').trim(),

                // Creature
                size: 'Medium',
                creature_type: '',
                creature_subtype: '',
                alignment: '',
                challenge_rating: 0,

                // Stats
                str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,

                // AC / HP
                ac_type: 'none',
                custom_ac_override: 0,
                hp_override: 0,

                // Speeds
                walk_speed: 0,
                fly_speed: 0,
                swim_speed: 0,
                burrow_speed: 0,
                climb_speed: 0,
                hover: false,

                // Senses
                darkvision: 0,
                blindsight: 0,
                tremorsense: 0,
                truesight: 0,

                // Saving throws / skills
                saving_throw_proficiencies: [],
                skill_acrobatics: 'none',
                skill_animal_handling: 'none',
                skill_arcana: 'none',
                skill_athletics: 'none',
                skill_deception: 'none',
                skill_history: 'none',
                skill_insight: 'none',
                skill_intimidation: 'none',
                skill_investigation: 'none',
                skill_medicine: 'none',
                skill_nature: 'none',
                skill_perception: 'none',
                skill_performance: 'none',
                skill_persuasion: 'none',
                skill_religion: 'none',
                skill_sleight_of_hand: 'none',
                skill_stealth: 'none',
                skill_survival: 'none',

                // Damage / conditions
                damage_resistances: [],
                damage_immunities: [],
                damage_vulnerabilities: [],
                condition_immunities: [],

                // Languages
                languages: [],

                // Actions/traits
                traits: [],
                actions: [],
                bonus_actions: [],
                reactions: [],
                legendary_actions: []
            };

            var contents = Array.isArray(item.contents) ? item.contents : [];

            // Current section for description/text/bullet entries
            var currentSection = 'traits'; // 'traits'|'actions'|'bonus_actions'|'reactions'|'legendary_actions'
            var lastEntry = null;

            contents.forEach(function (line) {
                if (typeof line !== 'string') return;
                var sepIdx = line.indexOf(' | ');
                if (sepIdx === -1) {
                    // No separator — treat as bare text type
                    return;
                }
                var type = line.slice(0, sepIdx).toLowerCase().trim();
                var remainder = line.slice(sepIdx + 3);

                if (type === 'subtitle') {
                    parseSubtitle(card, remainder);
                    lastEntry = null;
                    return;
                }

                if (type === 'dndstats') {
                    var parts = remainder.split('|').map(function (s) { return parseInt(s.trim(), 10) || 10; });
                    card.str = parts[0] || 10;
                    card.dex = parts[1] || 10;
                    card.con = parts[2] || 10;
                    card.int = parts[3] || 10;
                    card.wis = parts[4] || 10;
                    card.cha = parts[5] || 10;
                    lastEntry = null;
                    return;
                }

                if (type === 'rule') {
                    lastEntry = null;
                    return;
                }

                if (type === 'section') {
                    var sectionName = remainder.trim().toLowerCase();
                    if (sectionName === 'actions') {
                        currentSection = 'actions';
                    } else if (sectionName === 'bonus actions') {
                        currentSection = 'bonus_actions';
                    } else if (sectionName === 'reactions') {
                        currentSection = 'reactions';
                    } else if (sectionName.indexOf('legendary') !== -1) {
                        currentSection = 'legendary_actions';
                    } else {
                        currentSection = 'traits';
                    }
                    lastEntry = null;
                    return;
                }

                if (type === 'property') {
                    // Split on first " | " within remainder
                    var propSepIdx = remainder.indexOf(' | ');
                    if (propSepIdx === -1) { lastEntry = null; return; }
                    var propName = remainder.slice(0, propSepIdx).trim();
                    var propVal  = remainder.slice(propSepIdx + 3).trim();
                    var propLower = propName.toLowerCase();

                    if (propLower === 'armor class') {
                        card.ac_type = 'custom';
                        card.custom_ac_override = parseInt(propVal, 10) || 0;
                    } else if (propLower === 'hit points') {
                        card.hp_override = parseInt(propVal, 10) || 0;
                    } else if (propLower === 'speed') {
                        parseSpeeds(card, propVal);
                    } else if (propLower === 'challenge') {
                        card.challenge_rating = parseCR(propVal);
                    } else if (propLower === 'saving throws') {
                        var saves = propVal.split(',');
                        var profs = [];
                        saves.forEach(function (s) {
                            var abbr = s.trim().slice(0, 3).toLowerCase();
                            if (SAVE_ABBR_MAP[abbr]) profs.push(SAVE_ABBR_MAP[abbr]);
                        });
                        card.saving_throw_proficiencies = profs;
                    } else if (propLower === 'skills') {
                        var skillParts = propVal.split(',');
                        skillParts.forEach(function (sp) {
                            var skillName = sp.trim().replace(/[+-]\d+/, '').trim().toLowerCase();
                            if (SKILL_NAME_MAP[skillName]) {
                                card[SKILL_NAME_MAP[skillName]] = 'proficient';
                            }
                        });
                    } else if (propLower === 'damage resistances') {
                        card.damage_resistances = propVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                    } else if (propLower === 'damage immunities') {
                        card.damage_immunities = propVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                    } else if (propLower === 'damage vulnerabilities') {
                        card.damage_vulnerabilities = propVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                    } else if (propLower === 'condition immunities') {
                        card.condition_immunities = propVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                    } else if (propLower === 'senses') {
                        parseSenses(card, propVal);
                    } else if (propLower === 'languages') {
                        if (propVal !== '\u2014' && propVal !== '-') {
                            card.languages = propVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                        }
                    }
                    lastEntry = null;
                    return;
                }

                if (type === 'description') {
                    // "description | Title | Text"
                    var descSepIdx = remainder.indexOf(' | ');
                    var entryTitle, entryText;
                    if (descSepIdx !== -1) {
                        entryTitle = remainder.slice(0, descSepIdx).trim();
                        entryText  = remainder.slice(descSepIdx + 3).trim();
                    } else {
                        entryTitle = remainder.trim();
                        entryText  = '';
                    }
                    var entry = { title: entryTitle, text: entryText };
                    var sectionArr = card[currentSection];
                    if (sectionArr.length < 5) {
                        sectionArr.push(entry);
                        lastEntry = entry;
                    } else {
                        lastEntry = null;
                    }
                    return;
                }

                if (type === 'text') {
                    if (lastEntry) {
                        lastEntry.text += '\n' + remainder;
                    }
                    return;
                }

                if (type === 'bullet') {
                    if (lastEntry) {
                        lastEntry.text += '\n\u2022 ' + remainder;
                    }
                    return;
                }
            });

            cards.push(card);
        });

        return cards;
    }

    /* ── Module-level state ─────────────────────────────────────────────── */
    var _jbParsedCards = null;

    /* ── Preview helper ─────────────────────────────────────────────────── */
    function showJBPreview(msg, isError) {
        $('#jsonbuilder-preview')
            .text(msg)
            .show()
            .toggleClass('foundry-preview-ok',  !isError)
            .toggleClass('foundry-preview-err', isError);
        $('#jsonbuilder-load-btn').prop('disabled', isError || !_jbParsedCards);
    }

    function parseAndPreviewJB(text) {
        try {
            var data = JSON.parse(text);
            if (!Array.isArray(data)) {
                throw new Error('Expected a JSON array of card objects.');
            }
            _jbParsedCards = jsonBuilderToCards(data);
            var n = _jbParsedCards.length;
            showJBPreview('\u2713 Found ' + n + ' monster' + (n === 1 ? '' : 's') + ' \u2014 ready to add.', false);
        } catch (e) {
            _jbParsedCards = null;
            showJBPreview('\u2717 ' + (e.message || 'Invalid JSON'), true);
        }
    }

    /* ── Reset modal state ──────────────────────────────────────────────── */
    function resetJBModal() {
        _jbParsedCards = null;
        $('#jsonbuilder-paste-area').val('');
        $('#jsonbuilder-file-input').val('');
        $('#jsonbuilder-preview').hide().text('').removeClass('foundry-preview-ok foundry-preview-err');
        $('#jsonbuilder-load-btn').prop('disabled', true);
        $('#jsonbuilder-drop-zone')
            .removeClass('drag-over foundry-drop-loaded')
            .find('.jb-drop-label').show().end()
            .find('.jb-drop-filename').hide();
        $('#jsonbuilder-drop-filename-text').text('');
    }

    /* ── Open modal ─────────────────────────────────────────────────────── */
    function jsonbuilder_open_modal() {
        resetJBModal();
        $('#jsonbuilder-import-modal').modal('show');
    }

    /* ── Read a dropped/selected file ───────────────────────────────────── */
    function readJBFile(file) {
        if (!file.name.match(/\.json$/i)) {
            _jbParsedCards = null;
            showJBPreview('\u2717 Please select a .json file', true);
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var text = e.target.result || '';
            $('#jsonbuilder-paste-area').val(text);
            $('#jsonbuilder-drop-zone .jb-drop-label').hide();
            $('#jsonbuilder-drop-filename-text').text(file.name);
            $('#jsonbuilder-drop-zone .jb-drop-filename').show();
            $('#jsonbuilder-drop-zone').addClass('foundry-drop-loaded');
            parseAndPreviewJB(text);
        };
        reader.readAsText(file);
    }

    /* ── Expose globals ─────────────────────────────────────────────────── */
    window.jsonbuilder_open_modal = jsonbuilder_open_modal;
    window.jsonBuilderToCards     = jsonBuilderToCards;

    /* ── Wire events ────────────────────────────────────────────────────── */
    $(document).ready(function () {
        // Drop zone click → open file picker
        $('#jsonbuilder-drop-zone').on('click', function () {
            document.getElementById('jsonbuilder-file-input').click();
        });

        // Drag-and-drop
        $('#jsonbuilder-drop-zone').on('dragover dragenter', function (e) {
            e.preventDefault(); e.stopPropagation();
            $(this).addClass('drag-over');
        });
        $('#jsonbuilder-drop-zone').on('dragleave dragend', function () {
            $(this).removeClass('drag-over');
        });
        $('#jsonbuilder-drop-zone').on('drop', function (e) {
            e.preventDefault(); e.stopPropagation();
            $(this).removeClass('drag-over');
            var files = e.originalEvent.dataTransfer.files;
            if (files && files.length) readJBFile(files[0]);
        });

        // File input change
        $('#jsonbuilder-file-input').on('change', function () {
            if (this.files && this.files[0]) readJBFile(this.files[0]);
        });

        // Paste textarea — live parse
        $('#jsonbuilder-paste-area').on('input', function () {
            var val = $(this).val().trim();
            if (val) {
                parseAndPreviewJB(val);
            } else {
                _jbParsedCards = null;
                $('#jsonbuilder-preview').hide();
                $('#jsonbuilder-load-btn').prop('disabled', true);
            }
        });

        // Load button
        $('#jsonbuilder-load-btn').on('click', function () {
            if (_jbParsedCards && typeof window.ui_add_cards === 'function') {
                window.ui_add_cards(_jbParsedCards);
            }
            $('#jsonbuilder-import-modal').modal('hide');
        });

        // Reset on close
        $('#jsonbuilder-import-modal').on('hidden.bs.modal', function () {
            resetJBModal();
        });
    });
})();
