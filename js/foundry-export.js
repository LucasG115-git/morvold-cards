/**
 * Foundry VTT export module.
 * Transforms the app's card data format into a Foundry dnd5e (v2) actor JSON
 * suitable for importing into FoundryVTT via the Actor import dialog.
 */
(function () {
    'use strict';

    /* ── Reverse lookup tables (inverse of foundry-import.js maps) ───────── */
    var SIZE_REVERSE = {
        'Tiny': 'tiny',  'Small': 'sm',  'Medium': 'med',
        'Large': 'lg',   'Huge': 'huge', 'Gargantuan': 'grg'
    };

    var TYPE_REVERSE = {
        'Aberration': 'aberration', 'Beast': 'beast',         'Celestial': 'celestial',
        'Construct':  'construct',  'Dragon': 'dragon',       'Elemental': 'elemental',
        'Fey':        'fey',        'Fiend': 'fiend',         'Giant': 'giant',
        'Humanoid':   'humanoid',   'Monstrosity': 'monstrosity', 'Ooze': 'ooze',
        'Plant':      'plant',      'Undead': 'undead'
    };

    // App card field name → Foundry skill abbreviation
    var SKILL_REVERSE = {
        'skill_acrobatics':     'acr', 'skill_animal_handling': 'ani',
        'skill_arcana':         'arc', 'skill_athletics':       'ath',
        'skill_deception':      'dec', 'skill_history':         'his',
        'skill_insight':        'ins', 'skill_intimidation':    'itm',
        'skill_investigation':  'inv', 'skill_medicine':        'med',
        'skill_nature':         'nat', 'skill_perception':      'prc',
        'skill_performance':    'prf', 'skill_persuasion':      'per',
        'skill_religion':       'rel', 'skill_sleight_of_hand': 'slt',
        'skill_stealth':        'ste', 'skill_survival':        'sur'
    };

    var DAMAGE_REVERSE = {
        'Acid': 'acid', 'Bludgeoning': 'bludgeoning', 'Cold': 'cold',
        'Fire': 'fire', 'Force': 'force', 'Lightning': 'lightning',
        'Necrotic': 'necrotic', 'Piercing': 'piercing', 'Poison': 'poison',
        'Psychic': 'psychic', 'Radiant': 'radiant', 'Slashing': 'slashing',
        'Thunder': 'thunder'
    };

    var CONDITION_REVERSE = {
        'Blinded': 'blinded', 'Charmed': 'charmed', 'Deafened': 'deafened',
        'Diseased': 'diseased', 'Exhaustion': 'exhaustion', 'Frightened': 'frightened',
        'Grappled': 'grappled', 'Incapacitated': 'incapacitated',
        'Invisible': 'invisible', 'Paralyzed': 'paralyzed', 'Petrified': 'petrified',
        'Poisoned': 'poisoned', 'Prone': 'prone', 'Restrained': 'restrained',
        'Stunned': 'stunned', 'Unconscious': 'unconscious'
    };

    var LANGUAGE_REVERSE = {
        'Common': 'common',         'Dwarvish': 'dwarvish',   'Elvish': 'elvish',
        'Giant': 'giant',           'Gnomish': 'gnomish',     'Goblin': 'goblin',
        'Halfling': 'halfling',     'Orc': 'orc',             'Abyssal': 'abyssal',
        'Celestial': 'celestial',   'Draconic': 'draconic',   'Deep Speech': 'deep',
        'Infernal': 'infernal',     'Primordial': 'primordial', 'Sylvan': 'sylvan',
        'Undercommon': 'undercommon', 'Aquan': 'aquan',       'Auran': 'auran',
        'Ignan': 'ignan',           'Terran': 'terran'
    };

    var AB_TO_FULL = {
        'str': 'strength', 'dex': 'dexterity',  'con': 'constitution',
        'int': 'intelligence', 'wis': 'wisdom',  'cha': 'charisma'
    };

    /* ── Helper: convert display array back to a Foundry trait object ────── */
    function toTraitObj(arr, reverseMap) {
        var values = [], custom = [];
        (arr || []).forEach(function (item) {
            var key = reverseMap[item];
            if (key) { values.push(key); }
            else     { custom.push(item); }
        });
        return { value: values, custom: custom.join('; ') };
    }

    /* ── Main transform: card data → Foundry dnd5e actor JSON ───────────── */
    function cardToFoundryData(card) {
        var savingThrows = card.saving_throw_proficiencies || [];

        /* ── Abilities (scores + saving throw proficiency flags) ─────────── */
        var abilities = {};
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(function (ab) {
            abilities[ab] = {
                value:      card[ab] != null ? Number(card[ab]) : 10,
                proficient: savingThrows.indexOf(AB_TO_FULL[ab]) !== -1 ? 1 : 0
            };
        });

        /* ── Skills ──────────────────────────────────────────────────────── */
        var skills = {};
        Object.keys(SKILL_REVERSE).forEach(function (field) {
            var abbr  = SKILL_REVERSE[field];
            var level = card[field] || 'none';
            skills[abbr] = {
                value: level === 'expertise'  ? 2
                     : level === 'proficient' ? 1
                     : level === 'half'       ? 0.5
                     : 0
            };
        });

        /* ── Items (traits / actions / bonus / reactions / legendary) ─────── */
        var items = [];
        function pushItems(arr, activationType) {
            (arr || []).forEach(function (entry) {
                if (!entry || !entry.title) return;
                items.push({
                    name: entry.title,
                    type: 'feat',
                    system: {
                        description: { value: entry.text || '' },
                        activation:  { type: activationType || '' }
                    }
                });
            });
        }
        pushItems(card.traits,            '');
        pushItems(card.actions,           'action');
        pushItems(card.bonus_actions,     'bonus');
        pushItems(card.reactions,         'reaction');
        pushItems(card.legendary_actions, 'legendary');

        /* ── AC & HP ─────────────────────────────────────────────────────── */
        var acVal = (card.custom_ac_override != null && card.custom_ac_override !== '')
                    ? Number(card.custom_ac_override) : null;
        var hpMax = (card.hp_override != null && card.hp_override !== '')
                    ? Number(card.hp_override) : 0;

        /* ── Image ───────────────────────────────────────────────────────── */
        // Only pass through non-data-URI artwork URLs; data URIs are card-local
        var imgUrl = (card.creature_artwork || '');
        var foundryImg = (imgUrl && !imgUrl.startsWith('data:'))
                         ? imgUrl
                         : 'icons/svg/mystery-man.svg';

        return {
            name:  (card.title || 'Unknown').trim(),
            type:  'npc',
            img:   foundryImg,
            system: {
                abilities: abilities,
                attributes: {
                    ac: { flat: acVal, calc: 'flat', formula: '' },
                    hp: {
                        value:   hpMax,
                        min:     0,
                        max:     hpMax,
                        temp:    0,
                        tempmax: 0,
                        formula: ''
                    },
                    movement: {
                        walk:   Number(card.walk_speed)   || 0,
                        burrow: Number(card.burrow_speed) || 0,
                        climb:  Number(card.climb_speed)  || 0,
                        fly:    Number(card.fly_speed)    || 0,
                        swim:   Number(card.swim_speed)   || 0,
                        hover:  !!card.hover,
                        units:  'ft'
                    },
                    senses: {
                        darkvision:  Number(card.darkvision)  || 0,
                        blindsight:  Number(card.blindsight)  || 0,
                        tremorsense: Number(card.tremorsense) || 0,
                        truesight:   Number(card.truesight)   || 0,
                        units: 'ft'
                    }
                },
                details: {
                    type: {
                        value:   TYPE_REVERSE[card.creature_type] ||
                                 (card.creature_type || '').toLowerCase() ||
                                 'humanoid',
                        subtype: card.creature_subtype || '',
                        swarm:   '',
                        custom:  ''
                    },
                    cr:        card.challenge_rating != null ? Number(card.challenge_rating) : 0,
                    alignment: card.alignment || '',
                    biography: { value: '', public: '' }
                },
                traits: {
                    size:      SIZE_REVERSE[card.size] || 'med',
                    dr:        toTraitObj(card.damage_resistances,     DAMAGE_REVERSE),
                    di:        toTraitObj(card.damage_immunities,      DAMAGE_REVERSE),
                    dv:        toTraitObj(card.damage_vulnerabilities, DAMAGE_REVERSE),
                    ci:        toTraitObj(card.condition_immunities,   CONDITION_REVERSE),
                    languages: toTraitObj(card.languages,              LANGUAGE_REVERSE)
                },
                skills: skills
            },
            items: items,
            flags: {}
        };
    }

    /* ── Export trigger ──────────────────────────────────────────────────── */
    function foundry_export() {
        var card = typeof ui_selected_card === 'function' ? ui_selected_card() : null;
        if (!card) {
            alert('Please select a card first.');
            return;
        }
        if (card.template !== 'monster') {
            alert('Foundry Export is only available for monster / creature cards.');
            return;
        }

        var json     = cardToFoundryData(card);
        var filename = (card.title || 'monster')
                           .replace(/[^a-zA-Z0-9_\- ]/g, '')
                           .trim()
                           .replace(/\s+/g, '_')
                           .toLowerCase() + '.json';

        var blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href     = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /* ── Expose globals ──────────────────────────────────────────────────── */
    window.foundry_export    = foundry_export;
    window.cardToFoundryData = cardToFoundryData;

})();
