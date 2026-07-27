UI_FIELDS_CONFIGURATION_PREPARE.set('card', () => [
    { id: 'card-title', property: [ui_selected_card, 'title'], defaultProperty: [default_card_data, 'title'],
        eventListeners: {
            inputHandler: function () {
                if (typeof ui_render_selected_card_deferred === 'function' && window.PERF_SAFE_UPDATES?.scheduleInputPreviewRenders) {
                    ui_render_selected_card_deferred();
                } else {
                    ui_render_selected_card();
                }
                const card = ui_selected_card();
                if (card) $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').html(ui_deck_option_html_v2(card));
            },
            changeHandler: function () {
                ui_render_selected_card();
                const card = ui_selected_card();
                if (card) $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').html(ui_deck_option_html_v2(card));
            }
        },
        events: [['input', 'inputHandler'], ['change', 'changeHandler']]
    },
    { id: 'card-count', property: [ui_selected_card, 'count'], defaultProperty: [default_card_data, 'card_count'],
        eventListeners: {
            changeHandler: function () {
                const card = ui_selected_card();
                if (card) {
                    $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').html(ui_deck_option_html_v2(card));
                    ui_update_deck_total_count();
                }
            }
        },
        events: [['input', 'changeHandler']]
    },
    { id: 'monster-creature-artwork', property: [ui_selected_card, 'creature_artwork'], defaultProperty: [default_card_data, 'creature_artwork'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-art-credit', property: [ui_selected_card, 'creature_art_credit'], defaultProperty: [default_card_data, 'creature_art_credit'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-art-y', property: [ui_selected_card, 'creature_art_y'], defaultProperty: [default_card_data, 'creature_art_y'],
        events: [['input', ui_render_selected_card]]
    },
    { id: 'monster-art-fit', property: [ui_selected_card, 'creature_art_fit'], defaultProperty: [default_card_data, 'creature_art_fit'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-background-mode', property: [ui_selected_card, 'background_mode'], defaultProperty: [default_card_data, 'background_mode'],
        events: [['change', function () { if (typeof ui_on_background_mode_change === 'function') ui_on_background_mode_change(); }]]
    },
    { id: 'monster-level', property: [ui_selected_card, 'level'], defaultProperty: [default_card_data, 'level'],
        events: [['input', ui_render_selected_card], ['input', function () { if (typeof ui_update_monster_calculated_displays === 'function') ui_update_monster_calculated_displays(); }], ['change', ui_render_selected_card], ['change', function () { if (typeof ui_update_monster_calculated_displays === 'function') ui_update_monster_calculated_displays(); }]]
    },
    { id: 'monster-class', property: [ui_selected_card, 'npc_class'], defaultProperty: [default_card_data, 'npc_class'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-subclass', property: [ui_selected_card, 'subclass'], defaultProperty: [default_card_data, 'subclass'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-race', property: [ui_selected_card, 'race'], defaultProperty: [default_card_data, 'race'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-npc-alignment', property: [ui_selected_card, 'alignment'], defaultProperty: [default_card_data, 'alignment'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-challenge-rating', property: [ui_selected_card, 'challenge_rating'], defaultProperty: [default_card_data, 'challenge_rating'],
        events: [['change', ui_render_selected_card], ['change', function () { if (typeof ui_update_monster_calculated_displays === 'function') ui_update_monster_calculated_displays(); }]]
    },
    { id: 'monster-size', property: [ui_selected_card, 'size'], defaultProperty: [default_card_data, 'size'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-alignment', property: [ui_selected_card, 'alignment'], defaultProperty: [default_card_data, 'alignment'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-creature-type', property: [ui_selected_card, 'creature_type'], defaultProperty: [default_card_data, 'creature_type'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-creature-subtype', property: [ui_selected_card, 'creature_subtype'], defaultProperty: [default_card_data, 'creature_subtype'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'legendary-actions-per-round', property: [ui_selected_card, 'legendary_actions_per_round'], defaultProperty: [default_card_data, 'legendary_actions_per_round'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-str', property: [ui_selected_card, 'str'], defaultProperty: [default_card_data, 'str'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-dex', property: [ui_selected_card, 'dex'], defaultProperty: [default_card_data, 'dex'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-con', property: [ui_selected_card, 'con'], defaultProperty: [default_card_data, 'con'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-int', property: [ui_selected_card, 'int'], defaultProperty: [default_card_data, 'int'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-wis', property: [ui_selected_card, 'wis'], defaultProperty: [default_card_data, 'wis'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-cha', property: [ui_selected_card, 'cha'], defaultProperty: [default_card_data, 'cha'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-ac-type', property: [ui_selected_card, 'ac_type'], defaultProperty: [default_card_data, 'ac_type'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-natural-armor-type', property: [ui_selected_card, 'natural_armor_type'], defaultProperty: [default_card_data, 'natural_armor_type'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-hp-override', property: [ui_selected_card, 'hp_override'], defaultProperty: [default_card_data, 'hp_override'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-equipped-armor-type', property: [ui_selected_card, 'equipped_armor_type'], defaultProperty: [default_card_data, 'equipped_armor_type'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-unarmored-defense-type', property: [ui_selected_card, 'unarmored_defense_type'], defaultProperty: [default_card_data, 'unarmored_defense_type'],
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-custom-ac', property: [ui_selected_card, 'custom_ac_override'], defaultProperty: [default_card_data, 'custom_ac_override'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-wearing-shield', property: [ui_selected_card, 'wearing_shield'], defaultProperty: [default_card_data, 'wearing_shield'],
        valueGetter: function (v) { return v === true || v === 'true' || v === '1'; },
        events: [['change', ui_render_selected_card], ['change', ui_update_monster_calculated_displays]]
    },
    { id: 'monster-walk-speed', property: [ui_selected_card, 'walk_speed'], defaultProperty: [default_card_data, 'walk_speed'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-burrow-speed', property: [ui_selected_card, 'burrow_speed'], defaultProperty: [default_card_data, 'burrow_speed'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-climb-speed', property: [ui_selected_card, 'climb_speed'], defaultProperty: [default_card_data, 'climb_speed'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-fly-speed', property: [ui_selected_card, 'fly_speed'], defaultProperty: [default_card_data, 'fly_speed'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-hover', property: [ui_selected_card, 'hover'], defaultProperty: [default_card_data, 'hover'],
        valueGetter: function (v) { return v === true || v === 'true' || v === '1'; },
        events: [['change', ui_render_selected_card]]
    },
    { id: 'monster-swim-speed', property: [ui_selected_card, 'swim_speed'], defaultProperty: [default_card_data, 'swim_speed'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-blindsight', property: [ui_selected_card, 'blindsight'], defaultProperty: [default_card_data, 'blindsight'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-darkvision', property: [ui_selected_card, 'darkvision'], defaultProperty: [default_card_data, 'darkvision'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-tremorsense', property: [ui_selected_card, 'tremorsense'], defaultProperty: [default_card_data, 'tremorsense'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-truesight', property: [ui_selected_card, 'truesight'], defaultProperty: [default_card_data, 'truesight'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-telepathy-range', property: [ui_selected_card, 'telepathy_range'], defaultProperty: [default_card_data, 'telepathy_range'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]]
    },
    { id: 'monster-skill-acrobatics', property: [ui_selected_card, 'skill_acrobatics'], defaultProperty: [default_card_data, 'skill_acrobatics'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-animal_handling', property: [ui_selected_card, 'skill_animal_handling'], defaultProperty: [default_card_data, 'skill_animal_handling'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-arcana', property: [ui_selected_card, 'skill_arcana'], defaultProperty: [default_card_data, 'skill_arcana'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-athletics', property: [ui_selected_card, 'skill_athletics'], defaultProperty: [default_card_data, 'skill_athletics'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-deception', property: [ui_selected_card, 'skill_deception'], defaultProperty: [default_card_data, 'skill_deception'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-history', property: [ui_selected_card, 'skill_history'], defaultProperty: [default_card_data, 'skill_history'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-insight', property: [ui_selected_card, 'skill_insight'], defaultProperty: [default_card_data, 'skill_insight'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-intimidation', property: [ui_selected_card, 'skill_intimidation'], defaultProperty: [default_card_data, 'skill_intimidation'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-investigation', property: [ui_selected_card, 'skill_investigation'], defaultProperty: [default_card_data, 'skill_investigation'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-medicine', property: [ui_selected_card, 'skill_medicine'], defaultProperty: [default_card_data, 'skill_medicine'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-nature', property: [ui_selected_card, 'skill_nature'], defaultProperty: [default_card_data, 'skill_nature'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-perception', property: [ui_selected_card, 'skill_perception'], defaultProperty: [default_card_data, 'skill_perception'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-performance', property: [ui_selected_card, 'skill_performance'], defaultProperty: [default_card_data, 'skill_performance'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-persuasion', property: [ui_selected_card, 'skill_persuasion'], defaultProperty: [default_card_data, 'skill_persuasion'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-religion', property: [ui_selected_card, 'skill_religion'], defaultProperty: [default_card_data, 'skill_religion'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-sleight_of_hand', property: [ui_selected_card, 'skill_sleight_of_hand'], defaultProperty: [default_card_data, 'skill_sleight_of_hand'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-stealth', property: [ui_selected_card, 'skill_stealth'], defaultProperty: [default_card_data, 'skill_stealth'], events: [['change', ui_render_selected_card]] },
    { id: 'monster-skill-survival', property: [ui_selected_card, 'skill_survival'], defaultProperty: [default_card_data, 'skill_survival'], events: [['change', ui_render_selected_card]] },

    // NPC fields
    { id: 'monster-npc-title', property: [ui_selected_card, 'npc_title'], defaultProperty: [default_card_data, 'npc_title'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-appearance', property: [ui_selected_card, 'appearance'], defaultProperty: [default_card_data, 'appearance'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-roleplay-background', property: [ui_selected_card, 'roleplay_background'], defaultProperty: [default_card_data, 'roleplay_background'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-roleplay-personality', property: [ui_selected_card, 'roleplay_personality'], defaultProperty: [default_card_data, 'roleplay_personality'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-roleplay-quirk', property: [ui_selected_card, 'roleplay_quirk'], defaultProperty: [default_card_data, 'roleplay_quirk'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-roleplay-flaw', property: [ui_selected_card, 'roleplay_flaw'], defaultProperty: [default_card_data, 'roleplay_flaw'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-roleplay-goal', property: [ui_selected_card, 'roleplay_goal'], defaultProperty: [default_card_data, 'roleplay_goal'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-currency-pp', property: [ui_selected_card, 'currency_pp'], defaultProperty: [default_card_data, 'currency_pp'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-currency-gp', property: [ui_selected_card, 'currency_gp'], defaultProperty: [default_card_data, 'currency_gp'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-currency-sp', property: [ui_selected_card, 'currency_sp'], defaultProperty: [default_card_data, 'currency_sp'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-currency-ep', property: [ui_selected_card, 'currency_ep'], defaultProperty: [default_card_data, 'currency_ep'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-currency-cp', property: [ui_selected_card, 'currency_cp'], defaultProperty: [default_card_data, 'currency_cp'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-inventory-weapons', property: [ui_selected_card, 'inventory_weapons'], defaultProperty: [default_card_data, 'inventory_weapons'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'monster-inventory-loot', property: [ui_selected_card, 'inventory_loot'], defaultProperty: [default_card_data, 'inventory_loot'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },

    // Card template (NPC / Creature / Item) — drives which form sections show
    { id: 'card-template', property: [ui_selected_card, 'template'], defaultProperty: [default_card_data, 'template'],
        events: [['change', function () {
            if (typeof ui_on_template_change === 'function') ui_on_template_change();
        }]] },

    // Item fields
    { id: 'item-type', property: [ui_selected_card, 'item_type'], defaultProperty: [default_card_data, 'item_type'],
        events: [['change', function () { ui_item_hierarchy_changed('type'); }]] },
    { id: 'item-category', property: [ui_selected_card, 'item_category'], defaultProperty: [default_card_data, 'item_category'],
        events: [['change', function () { ui_item_hierarchy_changed('category'); }]] },
    { id: 'item-type-detail', property: [ui_selected_card, 'item_type_detail'], defaultProperty: [default_card_data, 'item_type_detail'],
        events: [['change', function () { ui_item_hierarchy_changed('detail'); }]] },
    { id: 'item-custom-type', property: [ui_selected_card, 'item_custom_type'], defaultProperty: [default_card_data, 'item_custom_type'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-subtype', property: [ui_selected_card, 'item_subtype'], defaultProperty: [default_card_data, 'item_subtype'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-tier', property: [ui_selected_card, 'item_tier'], defaultProperty: [default_card_data, 'item_tier'],
        events: [['change', ui_render_selected_card]] },
    { id: 'item-rarity', property: [ui_selected_card, 'item_rarity'], defaultProperty: [default_card_data, 'item_rarity'],
        events: [['change', ui_render_selected_card]] },
    { id: 'item-cost', property: [ui_selected_card, 'item_cost'], defaultProperty: [default_card_data, 'item_cost'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-weight', property: [ui_selected_card, 'item_weight'], defaultProperty: [default_card_data, 'item_weight'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-attunement', property: [ui_selected_card, 'item_attunement'], defaultProperty: [default_card_data, 'item_attunement'],
        events: [['change', function () {
            $('#item-attunement-req-group').toggle($(this).val() === 'required_by');
            ui_render_selected_card();
        }]] },
    { id: 'item-attunement-req', property: [ui_selected_card, 'item_attunement_req'], defaultProperty: [default_card_data, 'item_attunement_req'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-damage-dice', property: [ui_selected_card, 'item_damage_dice'], defaultProperty: [default_card_data, 'item_damage_dice'],
        events: [['change', ui_render_selected_card]] },
    { id: 'item-damage-type', property: [ui_selected_card, 'item_damage_type'], defaultProperty: [default_card_data, 'item_damage_type'],
        events: [['change', ui_render_selected_card]] },
    { id: 'item-range-normal', property: [ui_selected_card, 'item_range_normal'], defaultProperty: [default_card_data, 'item_range_normal'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-range-long', property: [ui_selected_card, 'item_range_long'], defaultProperty: [default_card_data, 'item_range_long'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-ac', property: [ui_selected_card, 'item_ac'], defaultProperty: [default_card_data, 'item_ac'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-curse-text', property: [ui_selected_card, 'item_curse_text'], defaultProperty: [default_card_data, 'item_curse_text'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-text', property: [ui_selected_card, 'item_sentient_text'], defaultProperty: [default_card_data, 'item_sentient_text'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-alignment', property: [ui_selected_card, 'item_sentient_alignment'], defaultProperty: [default_card_data, 'item_sentient_alignment'],
        events: [['change', ui_render_selected_card]] },
    { id: 'item-sentient-int', property: [ui_selected_card, 'item_sentient_int'], defaultProperty: [default_card_data, 'item_sentient_int'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-wis', property: [ui_selected_card, 'item_sentient_wis'], defaultProperty: [default_card_data, 'item_sentient_wis'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-cha', property: [ui_selected_card, 'item_sentient_cha'], defaultProperty: [default_card_data, 'item_sentient_cha'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-blindsight', property: [ui_selected_card, 'item_sentient_blindsight'], defaultProperty: [default_card_data, 'item_sentient_blindsight'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-darkvision', property: [ui_selected_card, 'item_sentient_darkvision'], defaultProperty: [default_card_data, 'item_sentient_darkvision'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-tremorsense', property: [ui_selected_card, 'item_sentient_tremorsense'], defaultProperty: [default_card_data, 'item_sentient_tremorsense'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-truesight', property: [ui_selected_card, 'item_sentient_truesight'], defaultProperty: [default_card_data, 'item_sentient_truesight'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-hearing', property: [ui_selected_card, 'item_sentient_hearing'], defaultProperty: [default_card_data, 'item_sentient_hearing'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-telepathy-range', property: [ui_selected_card, 'item_sentient_telepathy_range'], defaultProperty: [default_card_data, 'item_sentient_telepathy_range'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-personality', property: [ui_selected_card, 'item_sentient_personality'], defaultProperty: [default_card_data, 'item_sentient_personality'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-quirk', property: [ui_selected_card, 'item_sentient_quirk'], defaultProperty: [default_card_data, 'item_sentient_quirk'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-flaw', property: [ui_selected_card, 'item_sentient_flaw'], defaultProperty: [default_card_data, 'item_sentient_flaw'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-sentient-goal', property: [ui_selected_card, 'item_sentient_goal'], defaultProperty: [default_card_data, 'item_sentient_goal'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-description', property: [ui_selected_card, 'item_description'], defaultProperty: [default_card_data, 'item_description'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] },
    { id: 'item-flavour-text', property: [ui_selected_card, 'item_flavour_text'], defaultProperty: [default_card_data, 'item_flavour_text'],
        events: [['input', ui_render_selected_card], ['change', ui_render_selected_card]] }
]);
