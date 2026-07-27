// ============================================================================
// Card definition related functions
// ============================================================================
function default_card_options() {
  return {
    foreground_color: "white",
    background_color: "white",
    default_color_front: "black",
    default_color_back: "",
    default_icon_front: "",
    default_icon_back: "",
    default_icon_back_container: "rounded-square",
    default_title_size: "13",
    default_title_color: "white",
    default_card_font_size: "inherit",
    vertical_alignment_reference: "",
    page_size: "210mm,297mm",
    page_width: "210mm",
    page_height: "297mm",
    page_margin: "0in",
    page_rows: "3",
    page_columns: "3",
    page_zoom_width: "100",
    page_zoom_height: "100",
    card_arrangement: "doublesided",
    card_size: "63mm,88mm",
    card_width: "63mm",
    card_height: "88mm",
    card_zoom_width: "63mm",
    card_zoom_height: "88mm",
    card_count: null,
    icon_inline: true,
    rounded_corners: true,
    back_bleed_width: "2mm",
    back_bleed_height: "2mm",
    card_type: "",
    crop_marks: true
  };
}

var MONSTER_SKILL_IDS = ['acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight_of_hand', 'stealth', 'survival'];

function default_card_data() {
  const skillDefaults = {};
  MONSTER_SKILL_IDS.forEach(function (id) {
    skillDefaults['skill_' + id] = 'none';
  });
  return Object.assign({
    count: 1,
    title: '',
    contents: [],
    tags: [],
    template: 'npc',
    sections: null,
    creature_artwork: '',
    creature_art_credit: '',
    creature_art_y: 50,
    creature_art_fit: 'cover',
    background_mode: 'gradient',
    art_gradient: '',
    show_stat_block: false,
    // No UI selector anymore; default to Humanoid so the "Creature Type"
    // background mode shows humanoid.jpg for NPC cards.
    creature_type: 'Humanoid',
    creature_subtype: '',
    size: '',
    alignment: '',
    challenge_rating: '',
    str: '',
    dex: '',
    con: '',
    int: '',
    wis: '',
    cha: '',
    ac_type: '',
    custom_ac_override: '',
    wearing_shield: false,
    natural_armor_type: 'regular',
    equipped_armor_type: '',
    unarmored_defense_type: '',
    hp_override: '',
    walk_speed: '30',
    burrow_speed: '',
    climb_speed: '',
    fly_speed: '',
    swim_speed: '',
    hover: false,
    damage_resistances: [],
    damage_immunities: [],
    damage_vulnerabilities: [],
    condition_immunities: [],
    saving_throw_proficiencies: [],
    blindsight: '',
    darkvision: '',
    tremorsense: '',
    truesight: '',
    languages: [],
    telepathy_range: '',
    legendary_actions_per_round: '',
    // NPC fields
    npc_title: '',
    level: '',
    npc_class: '',
    subclass: '',
    race: '',
    appearance: '',
    roleplay_background: '',
    roleplay_personality: '',
    roleplay_quirk: '',
    roleplay_flaw: '',
    roleplay_goal: '',
    currency_pp: '',
    currency_gp: '',
    currency_sp: '',
    currency_ep: '',
    currency_cp: '',
    inventory_weapons: '',
    npc_weapons_detailed: [],
    inventory_loot: '',
    npc_loot_detailed: [],
    related_cards: [],
    // Item fields
    item_type: '',
    item_category: '',
    item_type_detail: '',
    item_custom_type: '',
    item_subtype: '',
    item_tier: '',
    item_rarity: '',
    item_properties: [],
    item_attunement: '',
    item_attunement_req: '',
    item_cost: '',
    item_weight: '',
    item_focus_classes: [],
    item_damage_dice: '',
    item_damage_type: '',
    item_range_normal: '',
    item_range_long: '',
    item_ac: '',
    item_cursed: false,
    item_curse_text: '',
    item_sentient: false,
    item_sentient_text: '',
    item_sentient_alignment: '',
    item_sentient_int: '',
    item_sentient_wis: '',
    item_sentient_cha: '',
    item_sentient_blindsight: '',
    item_sentient_darkvision: '',
    item_sentient_tremorsense: '',
    item_sentient_truesight: '',
    item_sentient_hearing: '',
    item_sentient_languages: [],
    item_sentient_telepathy_range: '',
    item_sentient_personality: '',
    item_sentient_quirk: '',
    item_sentient_flaw: '',
    item_sentient_goal: '',
    item_description: '',
    item_features: [],
    item_flavour_text: ''
  }, skillDefaults);
}

var ITEM_TYPE_FAMILIES = [
  'Armor',
  'Weapon',
  'Consumable',
  'Magic Item',
  'Equipment',
  'Vehicle or Mount',
  'Treasure or Trade',
  'Other'
];

var ITEM_LEGACY_TYPE_MAP = {
  'adventuring gear': { type: 'Equipment', category: 'Adventuring Gear' },
  'ammunition': { type: 'Weapon', category: 'Ammunition' },
  "artisan's tools": { type: 'Equipment', category: "Artisan's Tools" },
  'explosive': { type: 'Consumable', category: 'Explosive' },
  'firearm': { type: 'Weapon', category: 'Firearm' },
  'food and drink': { type: 'Consumable', category: 'Food and Drink' },
  'futuristic': { type: 'Weapon', category: 'Firearm', detail: 'Futuristic' },
  'gaming set': { type: 'Equipment', category: 'Gaming Set' },
  'generic variant': { type: 'Magic Item', category: 'Generic Variant' },
  'heavy armor': { type: 'Armor', category: 'Heavy' },
  'instrument': { type: 'Equipment', category: 'Instrument' },
  'light armor': { type: 'Armor', category: 'Light' },
  'martial weapon': { type: 'Weapon', category: 'Martial' },
  'medium armor': { type: 'Armor', category: 'Medium' },
  'melee weapon': { type: 'Weapon', detail: 'Melee' },
  'modern': { type: 'Weapon', category: 'Firearm', detail: 'Modern' },
  'mount': { type: 'Vehicle or Mount', category: 'Mount' },
  'poison': { type: 'Consumable', category: 'Poison' },
  'potion': { type: 'Consumable', category: 'Potion' },
  'ranged weapon': { type: 'Weapon', detail: 'Ranged' },
  'renaissance': { type: 'Weapon', category: 'Firearm', detail: 'Renaissance' },
  'ring': { type: 'Magic Item', category: 'Ring' },
  'rod': { type: 'Magic Item', category: 'Rod' },
  'scroll': { type: 'Consumable', category: 'Scroll' },
  'shield': { type: 'Armor', category: 'Shield' },
  'simple weapon': { type: 'Weapon', category: 'Simple' },
  'spellcasting focus': { type: 'Equipment', category: 'Spellcasting Focus' },
  'staff': { type: 'Magic Item', category: 'Staff' },
  'tack and harness': { type: 'Equipment', category: 'Tack and Harness' },
  'tattoo': { type: 'Magic Item', category: 'Tattoo' },
  'tool': { type: 'Equipment', category: 'Tool' },
  'trade bar': { type: 'Treasure or Trade', category: 'Trade Bar' },
  'trade good': { type: 'Treasure or Trade', category: 'Trade Good' },
  'treasure (art object)': { type: 'Treasure or Trade', category: 'Art Object' },
  'treasure (coinage)': { type: 'Treasure or Trade', category: 'Coinage' },
  'treasure (gemstone)': { type: 'Treasure or Trade', category: 'Gemstone' },
  'vehicle': { type: 'Vehicle or Mount', category: 'Vehicle' },
  'vehicle (air)': { type: 'Vehicle or Mount', category: 'Air' },
  'vehicle (land)': { type: 'Vehicle or Mount', category: 'Land' },
  'vehicle (space)': { type: 'Vehicle or Mount', category: 'Space' },
  'vehicle (water)': { type: 'Vehicle or Mount', category: 'Water' },
  'wand': { type: 'Magic Item', category: 'Wand' },
  'wondrous item': { type: 'Magic Item', category: 'Wondrous Item' }
};

/**
 * Convert the former flat Item Type values into the cascading hierarchy.
 * Unknown legacy values become a custom type so their original label is kept.
 */
function item_hierarchy_normalize_card(card) {
  if (!card || typeof card !== 'object') return card;
  var type = String(card.item_type || '').trim();
  if (!type || ITEM_TYPE_FAMILIES.indexOf(type) !== -1) return card;

  var legacy = ITEM_LEGACY_TYPE_MAP[type.toLowerCase()];
  if (legacy) {
    card.item_type = legacy.type;
    if (!String(card.item_category || '').trim()) card.item_category = legacy.category || '';
    if (!String(card.item_type_detail || '').trim()) card.item_type_detail = legacy.detail || '';
  } else {
    card.item_type = 'Other';
    if (!String(card.item_custom_type || '').trim()) card.item_custom_type = type;
  }
  return card;
}

function card_init(card) {
  const base = {
    ...card,
    title: card.title || "",
    contents: card.contents || [],
    tags: card.tags || []
  };
  const monsterDefaults = default_card_data();
  Object.keys(monsterDefaults).forEach(function (key) {
    if (base[key] === undefined) base[key] = monsterDefaults[key];
  });
  ['traits', 'actions', 'bonus_actions', 'reactions', 'legendary_actions', 'item_features'].forEach(function (key) {
    if (!Array.isArray(base[key])) base[key] = [];
    base[key] = base[key].slice().map(function (t) {
      var legacyAttackType = typeof t === 'object' && t ? (t.attack_type || '') : '';
      var normalizedAttackType = '';
      var normalizedClassification = '';
      if (legacyAttackType === 'melee_attack_roll') {
        normalizedAttackType = 'melee';
        normalizedClassification = 'weapon';
      } else if (legacyAttackType === 'ranged_attack_roll') {
        normalizedAttackType = 'ranged';
        normalizedClassification = 'weapon';
      } else if (legacyAttackType === 'spell_attack_roll') {
        normalizedAttackType = '';
        normalizedClassification = 'spell';
      } else {
        normalizedAttackType = legacyAttackType || '';
      }
      return typeof t === 'object' && t
        ? {
            title: t.title || '',
            action_kind: t.action_kind || (((normalizedAttackType || normalizedClassification || t.reach || t.range_normal || t.range_long || (t.attack_ability && t.attack_ability !== 'auto')) ? 'attack' : 'feature')),
            attack_type: t.attack_type === 'melee_attack_roll' || t.attack_type === 'ranged_attack_roll' || t.attack_type === 'spell_attack_roll'
              ? normalizedAttackType
              : (t.attack_type || ''),
            attack_classification: t.attack_classification || normalizedClassification || '',
            attack_ability: t.attack_ability || 'auto',
            reach: t.reach || '',
            range_normal: t.range_normal || '',
            range_long: t.range_long || '',
            legendary_cost: t.legendary_cost || '1',
            trigger: t.trigger || '',
            text: t.text || ''
          }
        : {
            title: '',
            action_kind: 'feature',
            attack_type: '',
            attack_classification: '',
            attack_ability: 'auto',
            reach: '',
            range_normal: '',
            range_long: '',
            legendary_cost: '1',
            trigger: '',
            text: String(t || '')
          };
    });
  });
  if (!Array.isArray(base.npc_weapons_detailed)) base.npc_weapons_detailed = [];
  base.npc_weapons_detailed = base.npc_weapons_detailed.slice().map(function (weapon) {
    return typeof weapon === 'object' && weapon
      ? {
        name: weapon.name || weapon.title || '',
        item_tag: weapon.item_tag || '',
        attack_ability: weapon.attack_ability || 'auto',
        attack_bonus_override: weapon.attack_bonus_override || '',
        damage_dice: weapon.damage_dice || '',
        damage_ability: weapon.damage_ability || 'auto',
        damage_type: weapon.damage_type || '',
          notes: weapon.notes || ''
        }
      : {
        name: String(weapon || ''),
        item_tag: '',
        attack_ability: 'auto',
        attack_bonus_override: '',
        damage_dice: '',
        damage_ability: 'auto',
        damage_type: '',
          notes: ''
        };
}).filter(function (weapon) {
  return weapon.name || weapon.item_tag || weapon.attack_bonus_override || weapon.damage_dice || weapon.damage_type || weapon.notes;
});
  if (!Array.isArray(base.npc_loot_detailed)) base.npc_loot_detailed = [];
  base.npc_loot_detailed = base.npc_loot_detailed.slice().map(function (item) {
    return typeof item === 'object' && item
      ? {
          name: item.name || item.title || '',
          item_tag: item.item_tag || '',
          notes: item.notes || item.text || ''
        }
      : {
          name: String(item || ''),
          item_tag: '',
          notes: ''
        };
  }).filter(function (item) {
    return item.name || item.item_tag || item.notes;
  });
  // Normalize array fields (multiselects)
  ['damage_resistances', 'damage_immunities', 'damage_vulnerabilities', 'condition_immunities', 'saving_throw_proficiencies', 'languages', 'item_properties', 'item_focus_classes', 'item_sentient_languages'].forEach(function (key) {
    if (!Array.isArray(base[key])) {
      base[key] = typeof base[key] === 'string' && base[key] ? base[key].split(',').map(function (s) { return s.trim(); }) : [];
    }
  });
  // Migrate legacy 'monster' template: cards using the stat block become
  // Creatures, the rest become NPCs.
  if (base.template === 'monster' || !base.template) {
    base.template = (base.show_stat_block === true || base.show_stat_block === 'true') ? 'creature' : 'npc';
  }
  item_hierarchy_normalize_card(base);
  base.sections = card_default_sections(base);
  if (base.template === 'item') {
    base.item_cursed = base.sections.curse === true;
    base.item_sentient = base.sections.sentience === true;
  }
  return base;
}

/**
 * Compute the card's enabled-sections map. Existing choices are preserved;
 * missing keys default on for NPCs, and data-driven elsewhere (a section that
 * already holds data starts enabled so nothing silently vanishes off a card).
 */
/** Keys of the combat-stat subsections shared by NPC (optional) and Creature. */
var COMBAT_SECTION_KEYS = ['ability_scores', 'defense', 'speeds', 'resistances', 'damage_immunities', 'vulnerabilities', 'condition_immunities', 'saving_throws', 'skills', 'senses', 'languages'];
var NPC_SECTION_KEYS = ['identity', 'roleplay', 'inventory', 'related', 'actions', 'bonus_actions', 'reactions', 'legendary_actions'].concat(COMBAT_SECTION_KEYS);
var CREATURE_SECTION_KEYS = ['challenge_identity'].concat(COMBAT_SECTION_KEYS, ['traits', 'actions', 'bonus_actions', 'reactions', 'legendary_actions']);
var ITEM_SECTION_KEYS = ['details', 'features', 'combat', 'curse', 'sentience'];
var NPC_SUBCLASS_AFFIXES = {
  barbarian: { prefix: 'Path of the ' },
  bard: { prefix: 'College of ' },
  cleric: { suffix: ' Domain' },
  druid: { prefix: 'Circle of ' },
  monk: { prefix: 'Way of the ' },
  paladin: { prefix: 'Oath of ' },
  ranger: { suffix: ' Conclave' },
  sorcerer: { suffix: ' Origin' },
  warlock: { prefix: 'The ' },
  wizard: { prefix: 'School of ' }
};

function npc_subclass_affixes(npcClass) {
  var key = String(npcClass || '').trim().toLowerCase();
  return NPC_SUBCLASS_AFFIXES[key] || { prefix: '', suffix: '' };
}

function npc_subclass_display(npcClass, subclass) {
  var text = String(subclass || '').trim();
  if (!text) return '';
  var affixes = npc_subclass_affixes(npcClass);
  return (affixes.prefix || '') + text + (affixes.suffix || '');
}

/** Non-empty entries in a {title, text} list (traits/actions/…). */
function card_entry_list_has(a) {
  return Array.isArray(a) && a.some(function (t) {
    return t && ((t.title || '').trim() || (t.text || '').trim());
  });
}

function card_default_sections(card) {
  var existing = (card.sections && typeof card.sections === 'object') ? card.sections : {};
  var has = function (v) { return v != null && String(v).trim() !== ''; };
  var anyHas = function (arr) { return arr.some(has); };
  var arrHas = function (a) { return Array.isArray(a) && a.length > 0; };
  var def = function (key, fallback) { if (s[key] === undefined) s[key] = !!fallback; };
  var req = function (key) { s[key] = true; };
  var t = card.template;
  var allowedKeys = t === 'item'
    ? ITEM_SECTION_KEYS
    : t === 'creature'
    ? CREATURE_SECTION_KEYS
    : NPC_SECTION_KEYS;
  var s = {};

  allowedKeys.forEach(function (key) {
    if (existing[key] !== undefined) s[key] = existing[key];
  });
  if (existing.combat_stats !== undefined) s.combat_stats = existing.combat_stats;

  var combatDataDefaults = function (fallbackAll) {
    def('resistances', fallbackAll && arrHas(card.damage_resistances));
    def('damage_immunities', fallbackAll && arrHas(card.damage_immunities));
    def('vulnerabilities', fallbackAll && arrHas(card.damage_vulnerabilities));
    def('condition_immunities', fallbackAll && arrHas(card.condition_immunities));
    def('saving_throws', fallbackAll && arrHas(card.saving_throw_proficiencies));
    def('skills', fallbackAll && MONSTER_SKILL_IDS.some(function (id) { return card['skill_' + id] && card['skill_' + id] !== 'none'; }));
    def('senses', fallbackAll && anyHas([card.blindsight, card.darkvision, card.tremorsense, card.truesight]));
    def('languages', fallbackAll && (arrHas(card.languages) || has(card.telepathy_range)));
  };

  if (t === 'item') {
    req('details');
    def('features', true);
    def('combat', anyHas([card.item_damage_dice, card.item_damage_type, card.item_range_normal, card.item_range_long, card.item_ac]) || arrHas(card.item_properties) || arrHas(card.item_focus_classes));
    var legacyMagicEnabled = existing.curse_sentience === true;
    def('curse', (legacyMagicEnabled && (card.item_cursed === true || has(card.item_curse_text))) || card.item_cursed === true || has(card.item_curse_text));
    def('sentience', (legacyMagicEnabled && (card.item_sentient === true || has(card.item_sentient_text))) ||
      card.item_sentient === true ||
      anyHas([
        card.item_sentient_text,
        card.item_sentient_alignment,
        card.item_sentient_int,
        card.item_sentient_wis,
        card.item_sentient_cha,
        card.item_sentient_blindsight,
        card.item_sentient_darkvision,
        card.item_sentient_tremorsense,
        card.item_sentient_truesight,
        card.item_sentient_hearing,
        card.item_sentient_telepathy_range,
        card.item_sentient_personality,
        card.item_sentient_quirk,
        card.item_sentient_flaw,
        card.item_sentient_goal
      ]) ||
      arrHas(card.item_sentient_languages));
  } else if (t === 'creature') {
    req('challenge_identity');
    req('ability_scores');
    req('defense');
    req('speeds');
    req('traits');
    req('actions');
    combatDataDefaults(true);
    def('bonus_actions', card_entry_list_has(card.bonus_actions));
    def('reactions', card_entry_list_has(card.reactions));
    def('legendary_actions', card_entry_list_has(card.legendary_actions));
  } else { // npc
    req('identity');
    req('roleplay');
    def('inventory', true);
    def('related', true);
    def('actions', card_entry_list_has(card.actions));
    def('bonus_actions', card_entry_list_has(card.bonus_actions));
    def('reactions', card_entry_list_has(card.reactions));
    def('legendary_actions', card_entry_list_has(card.legendary_actions));
    // Migration: NPCs that had the single "Combat Stats" toggle on get the
    // core combat panels plus whatever holds data; otherwise all stay off.
    var legacyCombat = s.combat_stats === true || (s.combat_stats === undefined && (card.show_stat_block === true || card.show_stat_block === 'true'));
    def('ability_scores', legacyCombat);
    def('defense', legacyCombat);
    def('speeds', legacyCombat);
    combatDataDefaults(legacyCombat);
  }
  return s;
}

/** True when the section should show; unknown keys default to enabled. */
function card_section_enabled(d, key) {
  if (!d || !d.sections || typeof d.sections !== 'object') return true;
  return d.sections[key] !== false;
}

/** Stat block on the back: always for Creatures; for NPCs when any combat subsection is on. */
function monster_show_stats(d) {
  if (d.template === 'creature') return true;
  if (d.template === 'item') return false;
  if (String(d.level || '').trim() || String(d.challenge_rating || '').trim()) return true;
  if (d.sections && typeof d.sections === 'object') {
    if (d.sections.combat_stats === true) return true; // legacy single toggle
    return COMBAT_SECTION_KEYS.some(function (k) { return d.sections[k] === true; });
  }
  return d.show_stat_block === true || d.show_stat_block === 'true';
}

/** Escape HTML for safe insertion of user content. */
function escape_html(str) {
  if (str == null || str === '') return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function card_has_tag(card, tag) {
  tag = tag.trim().toLowerCase();
  var index = card.tags.indexOf(tag);
  return index > -1;
}

function card_add_tag(card, tag) {
  tag = tag.trim().toLowerCase();
  var index = card.tags.indexOf(tag);
  if (index === -1) {
    card.tags.push(tag);
  }
}

function card_remove_tag(card, tag) {
  tag = tag.trim().toLowerCase();
  card.tags = card.tags.filter(function (t) {
    return tag !== t;
  });
}

// ============================================================================
// Card definition related functions
// ============================================================================

function card_data_color_front(card_data, options) {
  return (
    card_data.color_front || options.default_color_front
  );
}

function card_data_color_back(card_data, options) {
  return (
    card_data.color_back || options.default_color_back || card_data.color_front || options.default_color_front
  );
}

function card_data_icon_front(card_data, options) {
  return card_data.icon_front || options.default_icon_front || "";
}

function card_data_icon_back(card_data, options) {
  return card_data.icon_back || options.default_icon_back || "";
}

function card_data_icon_back_container(card_data, options) {
  return card_data.icon_back_container || options.default_icon_back_container || "";
}

function card_data_icon_back_rotation(card_data, options) {
  return card_data.icon_back_rotation || options.default_icon_back_rotation || "";
}

function card_data_back_image(card_data, options) {
  return card_data.background_image || options.default_background_image || "";
}

function card_data_split_params(value) {
  return value.split("|").map(function (str) {
    return str.trim();
  });
}

function card_element_class(card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);
  return "card-element card-description-line" + card_font_size_class;
}

function card_size_class(card_data, options) {
  var card_font_size =
    card_data.card_font_size || options.default_card_font_size || "";
  return card_font_size != "" && card_font_size != "inherit"
    ? " card-font-size-" + card_font_size
    : "";
}

// ============================================================================
// Card element generating functions
// ============================================================================

function card_element_title(card_data, options) {
  var title = card_data.title_display || card_data.title || "";
  var title_size = card_data.title_size || options.default_title_size || "normal";
  var title_color = card_data.title_color || options.default_title_color || "";
  return (
    '<div class="card-title card-title-' + title_size + '" style="color: ' + title_color + '">' + title + "</div>"
  );
}

function card_element_type(card_data, options) {
  var type = card_data.card_type || "";
  var title_color = card_data.title_color || options.default_title_color || "";
  return type
    ? '<div class="card-type card-title card-title-10" style="color: ' + title_color + '">' + type + "</div>"
    : "";
}

function card_element_icon(card_data, options) {
  const re = /url\(\s*(['"]?)(.*?)\1\s*\)/;
  var icons = card_data_icon_front(card_data, options)
    .split(/[\s\uFEFF\xA0]+/)
    .filter((icon) => icon);
  var icon_color = card_data.icon_front_color || "";
  var classname = "icon";
  if (options.icon_inline) {
    classname = "inlineicon";
  }
  var result = `<div class="card-title-${classname}-container">`;
  result += icons.map(function (icon) {
    // append a temporary image to retrive the icon url
    const img = new Image();
    img.style.position = 'absolute';
    img.style.visibility = 'hidden';
    img.style.pointerEvents = 'none';
    img.className = `icon-${icon}`;
    document.body.appendChild(img);
    const match = getComputedStyle(img).backgroundImage?.match(re);
    let imgUrl = match ? match[2] : null;
    // sanitize url
    const u = new URL(imgUrl);
    imgUrl = ['http:', 'https:'].includes(u.protocol) ? u.href : ''; // u.href is percent encoded
    // remove temporary image
    img.remove();
    // colorize
    const style = icon_color ? `mask:url('${imgUrl}') no-repeat center / contain;background-color:${icon_color};background-image:none;` : '';
    // return html
    return `<span class="card-title-${classname} icon-${icon}" data-onload="fix-icon-size" data-src="${imgUrl}" style="${style}"></span>`;
  }).join('');
  result += `</div>`
  return result;
}

/**
 * @summary Starts a pill section.
 * @description Starts a pill section. Must be closed with `pills_end`.
 * @example pills_start
 * @category Pills
 */
function card_element_pills_start() {
  return '<div class="card-pills">';
}

/**
 * @summary A pill.
 * @description Displays a pill.
 * @example pill | text | html-color
 * @category Pills
 */
function card_element_pill(params, card_data, options) {
  var text = params[0];
  var color = params[1] || card_data_color_front(card_data, options);

  var result = "";
  result +=
    '<span class="card-pill label label-default" style="background-color:' +
    color +
    ';">';
  result += text;
  result += "</span>";
  return result;
}

/**
 * @summary Ends a pill section.
 * @description Ends a pill section.
 * @example pills_end
 * @category Pills
 */
function card_element_pills_end() {
  return "</div>";
}

/**
 * @summary A paragraph of italic text.
 * @description Creates a paragraph of italic text.
 * @example italic | text
 * @category Basic
 */
function card_element_italic(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result +=
    '   <p class="card-p card-description-text"><i>' + params[0] + "</i></p>";
  result += "</div>";
  return result;
}

/**
 * @summary Start a new table finish with table_end
 * @description Starts a new table. Must be closed with `table_end`.
 * @example table_start
 * @category Table
 */
function card_element_table_start(params, card_data, options) {
  return '<!-- table_start --><table class="card-stats"><tbody>';
}

/**
 * @summary Add a table heading row
 * @description Adds a header row to the table.
 * @example table_head | heading1 | heading2 | heading3 | … | headingN
 * @category Table
 */
function card_element_table_head(params, card_data, options) {
  var result = "<!-- table_head --><tr>";
  for (var i = 0; i < params.length; ++i) {
    result += '<th class="card-stats-header">' + params[i] + "</th>";
  }
  result += "</tr>";
  return result;
}

/**
 * @summary Add a table row
 * @description Adds a row to the table.
 * @example table_row | value1 | value2 | value3 | … | valueN
 * @category Table
 */
function card_element_table_row(params, card_data, options) {
  var result = "<!-- table_row --><tr>";
  for (var i = 0; i < params.length; ++i) {
    result += '<td class="card-stats-cell">' + params[i] + "</td>";
  }
  result += "</tr>";
  return result;
}

/**
 * @summary End a table started with table_start
 * @description Ends a table started with `table_start`.
 * @example table_end
 * @category Table
 */
function card_element_table_end(params, card_data, options) {
  return "<!-- table_end --></tbody></table>";
}

/**
 * @summary Input raw HTML.
 * @description Inserts raw HTML into the card.
 * @example html | html
 * @category Basic
 */
function card_element_html(params) {
  return params[0];
}

/**
 * @summary Input raw HTML affected by some extra formatting but wrapped by a DIV container.
 * @description Inserts raw HTML into the card.
 * @example rawhtml | html
 * @category Basic
 */
function card_element_rawhtml(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result += params[0];
  result += "</div>";
  return result;
}

/**
 * @summary A subtitle.
 * @description Adds a subtitle to the card. The second parameter is optional and will be right-aligned.
 * @example subtitle | text | right-aligned-text
 * @category Basic
 */
function card_element_subtitle(params, card_data, options) {
  var subtitle = params[0] || "";
  var result = '<div class="card-element card-subtitle">';
  if (params[1]) {
    result += '<div style="float:right">' + params[1] + "</div>";
  }
  result += "<div>" + subtitle + "</div>";
  result += "</div>";
  return result;
}

/**
 * @summary An inline icon.
 * @description Displays an icon. The size and alignment are optional.
 * @example icon | icon-name | size | alignment
 * @category Layout
 */
function card_element_inline_icon(params, card_data, options) {
  var icon = params[0] || "";
  var size = params[1] || "40";
  var align = params[2] || "center";
  var color = card_data_color_front(card_data, options);
  return (
    '<div class="card-element card-inline-icon align-' +
    align +
    " icon-" +
    icon +
    '" style ="height:' +
    size +
    "px;min-height:" +
    size +
    "px;width: " +
    size +
    "px;background-color: " +
    color +
    '"></div>'
  );
}

/**
 * @summary A card footer with optional separated parts.
 * @description Displays a footer at the bottom of the card. If multiple parameters are provided, each is shown as a separate part with increasing font weight and separated by a ▹ symbol.
 * @example footer | text1 | text2 | text3 | ... | textN
 * @category Layout
 */
function card_element_footer(params, card_data, options) {
  var footer_text = params[0] || "";
  var color = card_data_color_front(card_data, options);
  // If there are multiple parameters, join them with separators
  if (params.length > 1) {
    var footer_parts = [];
    for (var i = 0; i < params.length; i++) {
      const oppositeLength = params.length - i - 1;
      const fontWeight = 200 + oppositeLength * 200;
      if (params[i] && params[i].trim() !== "") {
        footer_parts.push(
          '<span class="footer-part" style="font-weight: ' +
            fontWeight +
            ';">' +
            params[i].trim() +
            "</span>"
        );
      }
    }
    footer_text = footer_parts.join(
      '<span class="footer-separator"> ▹ </span>'
    );
  }
  return (
    '<div class="card-footer" style="background-color: ' +
    color +
    ';"><p class="card-footer-text">' +
    footer_text +
    "</p></div>"
  );
}

/**
 * @summary An inline picture.
 * @description Displays a picture from a URL.
 * @example picture | url | height
 * @category Layout
 */
function card_element_picture(params, card_data, options) {
  var url = params[0] || "";
  var height = params[1] || "";
  return (
    '<div class="card-element card-picture" style ="background-image: url(&quot;' +
    url +
    "&quot;); background-size: contain; background-position: center;background-repeat: no-repeat; height:" +
    height +
    'px"></div>'
  );
}

/**
 * @summary A horizontal ruler.
 * @description Displays a horizontal ruler.
 * @example ruler
 * @category Layout
 */
function card_element_ruler(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var fill = 'fill="' + color + '"';
  var stroke = 'stroke="' + color + '"';
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<svg class="card-ruler' +
    card_font_size_class +
    '" height="1" width="100" viewbox="0 0 100 1" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
  result += '    <polyline points="0,0 100,0.5 0,1" ' + fill + "></polyline>";
  result += "</svg>";
  return result;
}

/**
 * @summary A Pathfinder 2nd Edition horizontal ruler.
 * @description Displays a horizontal ruler with the Pathfinder 2nd Edition style.
 * @example p2e_ruler
 * @category Pathfinder 2e
 */
function card_element_p2e_ruler(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var fill = 'fill="' + color + '"';
  var stroke = 'stroke="' + color + '"';
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<svg class="card-p2e-ruler' +
    card_font_size_class +
    '" height="1" width="100" viewbox="0 0 100 5" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
  result += '    <polyline points="0,0 100,0.5 0,1" ' + fill + "></polyline>";
  result += "</svg>";
  return result;
}

/**
 * @summary A line of empty boxes.
 * @description Displays a number of empty boxes. The size and text are optional.
 * @example boxes | number | size | text
 * @category Layout
 */
function card_element_boxes(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var fill = ' fill="none"';
  var stroke = ' stroke="' + color + '"';
  var count = params[0] || 1;
  var size = params[1] || 3;
  var additional_text = params[2] || "";
  var style = 'style="width:' + size + "em;height:" + size + 'em"';
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  for (var i = 0; i < count; ++i) {
    result +=
      '<svg class="card-box" height="100" width="100" viewbox="0 0 100 100" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg" ' +
      style +
      ">";
    result +=
      '    <rect x="5" y="5" width="90" height="90" ' +
      fill +
      stroke +
      ' style="stroke-width:10">';
    result += "</svg>";
  }
  result += additional_text + "</div>";
  return result;
}

/**
 * @summary A property line.
 * @description Displays a property with a name and a value.
 * @example property | name | value
 * @category Basic
 */
function card_element_property(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<div class="card-element card-property-line' + card_font_size_class + '">';
  result += '   <h4 class="card-property-name">' + params[0] + "</h4>";
  result += '   <p class="card-p card-property-text">' + params[1] + "</p>";
  if (params[2]) {
    result += '   <div style="float:right">';
    result += '       <h4 class="card-property-name">' + params[2] + "</h4>";
    result +=
      '       <p class="card-p card-property-text">' + params[3] + "</p>";
    result += "   </div>";
  }
  result += "</div>";
  return result;
}

/**
 * @summary A description line.
 * @description Displays a description with a name and a value.
 * @example description | name | value
 */
function card_element_description(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result += '   <h4 class="card-description-name">' + params[0] + "</h4>";
  result += '   <p class="card-p card-description-text">' + params[1] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A paragraph of text.
 * @description Displays a paragraph of text.
 * @example text | text
 * @category Basic
 */
function card_element_text(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result += '   <p class="card-p card-description-text">' + params[0] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A centered paragraph of text.
 * @description Displays a centered paragraph of text.
 * @example center | text
 * @category Basic
 */
function card_element_center(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '" style="text-align: center">';
  result += '   <p class="card-p card-description-text">' + params[0] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A justified paragraph of text.
 * @description Displays a justified paragraph of text.
 * @example justify | text
 * @category Basic
 */
function card_element_justify(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result +=
    '<div class="' +
    element_class +
    '" style="text-align: justify; hyphens: auto">';
  result += '   <p class="card-p card-description-text">' + params[0] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A grey divider bar.
 * @description Adds a grey divider bar with optional centered text. Useful for visually separating sections within a card.
 * @example divider | text
 * @category Layout
 */
function card_element_divider(params, card_data, options) {
  var result = "";
  result +=
    '<div class="card-element card-description-line" style="text-align: center; background-color: lightgray">';
  result +=
    '   <p class="card-p card-description-text">' +
    (params[0] || "&nbsp;") +
    "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A D&D stat block.
 * @description Displays a D&D 5e stat block.
 * @example dndstats | STR | DEX | CON | INT | WIS | CHA
 * @category DnD
 */
function card_element_dndstats(params, card_data, options) {
  var stats = [10, 10, 10, 10, 10, 10];
  var mods = [0, 0, 0, 0, 0, 0];
  for (var i = 0; i < 6; ++i) {
    stats[i] = parseInt(params[i], 10) || 0;
    var mod = Math.floor((stats[i] - 10) / 2);
    if (mod >= 0) {
      mod = "+" + mod;
    } else {
      mod = "" + mod;
    }
    mods[i] = "&nbsp;(" + mod + ")";
  }
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result += '<table class="card-stats' + card_font_size_class + '">';
  result += "    <tbody><tr>";
  result += '      <th class="card-stats-header">STR</th>';
  result += '      <th class="card-stats-header">DEX</th>';
  result += '      <th class="card-stats-header">CON</th>';
  result += '      <th class="card-stats-header">INT</th>';
  result += '      <th class="card-stats-header">WIS</th>';
  result += '      <th class="card-stats-header">CHA</th>';
  result += "    </tr>";
  result += "    <tr>";
  result += '      <td class="card-stats-cell">' + stats[0] + mods[0] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[1] + mods[1] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[2] + mods[2] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[3] + mods[3] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[4] + mods[4] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[5] + mods[5] + "</td>";
  result += "    </tr>";
  result += "  </tbody>";
  result += "</table>";
  return result;
}

/**
 * @summary A Shadowrun 6th Edition spell block.
 * @description Displays a Shadowrun 6th Edition spell block.
 * @example sr6spell | Range | Type | Duration | Drain | Damage
 * @category Shadowrun 6e
 */
function card_element_sr6spell(params, card_data, options) {
  var stats = [];
  for (var i = 0; i < 5; ++i) {
    stats[i] = params[i] || "";
  }
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result += '<table class="card-stats' + card_font_size_class + '">';
  result += "    <tbody><tr>";
  result += '      <th class="card-stats-header">Range</th>';
  result += '      <th class="card-stats-header">Type</th>';
  result += '      <th class="card-stats-header">Duration</th>';
  result += '      <th class="card-stats-header">Drain</th>';
  result += '      <th class="card-stats-header">Damage</th>';
  result += "    </tr>";
  result += "    <tr>";
  result += '      <td class="card-stats-cell">' + stats[0] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[1] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[2] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[3] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[4] + "</td>";
  result += "    </tr>";
  result += "  </tbody>";
  result += "</table>";
  return result;
}

/**
 * @summary A Pathfinder 2nd Edition stat block.
 * @description Displays a Pathfinder 2nd Edition stat block.
 * @example p2e_stats | STR | DEX | CON | INT | WIS | CHA | AC | Fort | Ref | Will | HP
 * @category Pathfinder 2e
 */
function card_element_p2e_stats(params, card_data, options) {
  var result = "";
  result += '<div class="card-p2e-attribute-line">';
  result += '   <p class="card-p2e-attributes-text">';
  result +=
    "       <b>Str</b> " +
    params[0] +
    ", <b>Dex</b> " +
    params[1] +
    ", <b>Con</b> " +
    params[2] +
    ", <b>Int</b> " +
    params[3] +
    ", <b>Wis</b> " +
    params[4] +
    ", <b>Cha</b> " +
    params[5];
  result += "   </p>";
  result += "</div>";
  result += card_element_p2e_ruler(params, card_data, options);
  result += '<div class="card-p2e-attribute-line">';
  result += '   <p class="card-p2e-attributes-text">';
  result +=
    "       <b>AC </b> " +
    params[6] +
    "; <b>Fort</b> " +
    params[7] +
    "; <b>Ref</b> " +
    params[8] +
    "; <b>Will</b> " +
    params[9];
  result += "   </p>";
  result += '   <p class="card-p2e-attributes-text">';
  result += "       <b>HP </b> " + params[10];
  result += "   </p>";
  result += "</div>";
  return result;
}

/**
 * @summary Starts a Pathfinder 2nd Edition trait section.
 * @description Starts a Pathfinder 2nd Edition trait section. Must be closed with `p2e_end_trait_section`.
 * @example p2e_start_trait_section
 * @category Pathfinder 2e
 */
function card_element_start_p2e_trait() {
  return '<div class="card-p2e-trait-container">';
}

/**
 * @summary Ends a Pathfinder 2nd Edition trait section.
 * @description Ends a Pathfinder 2nd Edition trait section.
 * @example p2e_end_trait_section
 * @category Pathfinder 2e
 */
function card_element_end_p2e_trait() {
  return "</div>";
}

/**
 * @summary A Pathfinder 2nd Edition trait.
 * @description Displays a Pathfinder 2nd Edition trait.
 * @example p2e_trait | rarity | text
 * @category Pathfinder 2e
 */
function card_element_p2e_trait(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);
  var badge_type = " card-p2e-trait-" + params[0];

  var result = "";
  result +=
    '<span class="card-p2e-trait' + badge_type + card_font_size_class + '">';
  result += params[1];
  result += "</span>";
  return result;
}

/**
 * @summary A Pathfinder 2nd Edition activity.
 * @description Displays a Pathfinder 2nd Edition activity.
 * @example p2e_activity | name | actions | description
 * @category Pathfinder 2e
 */
function card_element_p2e_activity(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);

  var activity_icon;
  if (params[1] == "0") {
    activity_icon = "icon-p2e-free-action";
  } else if (params[1] == "1") {
    activity_icon = "icon-p2e-1-action";
  } else if (params[1] == "2") {
    activity_icon = "icon-p2e-2-actions";
  } else if (params[1] == "3") {
    activity_icon = "icon-p2e-3-actions";
  } else if (params[1] == "R") {
    activity_icon = "icon-p2e-reaction";
  }

  var result = "";
  result +=
    '<div class="card-element card-property-line' + card_font_size_class + '">';
  result += '   <h4 class="card-property-name">' + params[0] + "</h4>";
  result +=
    '   <div class="card-inline-icon ' +
    activity_icon +
    '" style="display: inline-block; vertical-align: middle; height: 10px; min-height: 10px; width: 10px; background-color: black;"></div>';
  result += '   <p class="card-p card-property-text">' + params[2] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A Savage Worlds stat block.
 * @description Displays a Savage Worlds stat block.
 * @example swstats | Agility | Smarts | Spirit | Strength | Vigor | Pace | Parry | Toughness | Loot
 * @category Savage Worlds
 */
function card_element_swstats(params, card_data, options) {
  var stats = [];
  for (var i = 0; i < 9; ++i) {
    stats[i] = params[i] || "-";
  }
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result += '<table class="card-stats' + card_font_size_class + '">';
  result += "    <tbody><tr>";
  result += '      <th class="card-stats-header">Agility</th>';
  result += '      <th class="card-stats-header">Smarts</th>';
  result += '      <th class="card-stats-header">Spirit</th>';
  result += '      <th class="card-stats-header">Strength</th>';
  result += '      <th class="card-stats-header">Vigor</th>';
  result += "    </tr>";
  result += "    <tr>";
  result += '      <td class="card-stats-cell">d' + stats[0] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[1] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[2] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[3] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[4] + "</td>";
  result += "    </tr>";
  result += "  </tbody>";
  result += "</table>";
  result += '<p class="card-stats-sw-derived">';
  result += " <b>Pace</b> " + stats[5];
  result += " <b>Parry</b> " + stats[6];
  result += " <b>Toughness</b> " + stats[7];
  result += stats[8] ? " <b>Loot</b> " + stats[8] : "";
  result += "</p>";
  return result;
}

/**
 * @summary A bulleted list item.
 * @description Displays a bulleted list item.
 * @example bullet | text
 * @category Basic
 */
function card_element_bullet(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<ul class="card-element card-bullet-line' + card_font_size_class + '">';
  result += '   <li class="card-bullet">' + params[0] + "</li>";
  result += "</ul>";
  return result;
}

/**
 * @summary A section header.
 * @description Displays a section header. The second parameter is optional and will be right-aligned.
 * @example section | title | right-aligned-text
 * @category Basic
 */
function card_element_section(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var section = params[0] || "";

  var result = '<h3 class="card-section" style="color:' + color + '">';
  if (params[1]) {
    result += '<div style="float:right">' + params[1] + "</div>";
  }
  result += "<div>" + section + "</div>";
  result += "</h3>";

  return result;
}

/**
 * @summary A flexible vertical space.
 * @description Adds a flexible vertical space that fills the available space.
 * @example fill | flex-grow
 * @category Layout
 */
function card_element_fill(params, card_data, options) {
  var flex = params[0] || "1";
  return '<span class="card-fill" style="flex:' + flex + '"></span>';
}

function card_element_unknown(params, card_data, options) {
  return "<div>Unknown element: " + params.join("<br />") + "</div>";
}

function card_element_empty(params, card_data, options) {
  return "";
}

const card_element_generators = {
  subtitle: card_element_subtitle,
  property: card_element_property,
  rule: card_element_ruler,
  ruler: card_element_ruler,
  p2e_rule: card_element_p2e_ruler,
  p2e_ruler: card_element_p2e_ruler,
  boxes: card_element_boxes,
  description: card_element_description,
  dndstats: card_element_dndstats,
  p2e_stats: card_element_p2e_stats,
  p2e_start_trait_section: card_element_start_p2e_trait,
  p2e_trait: card_element_p2e_trait,
  p2e_end_trait_section: card_element_end_p2e_trait,
  p2e_activity: card_element_p2e_activity,
  pills_start: card_element_pills_start,
  pill: card_element_pill,
  pills_end: card_element_pills_end,
  table_start: card_element_table_start,
  table_head: card_element_table_head,
  table_row: card_element_table_row,
  table_end: card_element_table_end,
  swstats: card_element_swstats,
  sr6spell: card_element_sr6spell,
  text: card_element_text,
  italic: card_element_italic,
  html: card_element_html,
  rawhtml: card_element_rawhtml,
  center: card_element_center,
  justify: card_element_justify,
  divider: card_element_divider,
  bullet: card_element_bullet,
  fill: card_element_fill,
  section: card_element_section,
  disabled: card_element_empty,
  picture: card_element_picture,
  icon: card_element_inline_icon,
  footer: card_element_footer,
};

// ============================================================================
// Card generating functions
// ============================================================================

function card_generate_contents(card_data, options) {
  let result = '';
  const contents = card_data.contents;

  let html = contents
    .map(function (value) {
      const [element_name, ...element_params] = card_data_split_params(value);
      const element_generator = card_element_generators[element_name];
      if (element_generator) {
        return element_generator(element_params, card_data, options);
      }
      if (element_name.length > 0) {
        return card_element_unknown(element_params, card_data, options);
      }
    })
    .join('\n');

  const tagNames = ['icon'];

  tagNames.forEach(function (tagName) {
    const tagRegExp = new RegExp(`<${tagName}[^>]*>`, 'g');
    const attrRegExp = new RegExp(`([\\w-]+)="([^"]+)"`, 'g');

    const matches = [];
    forEachMatch(tagRegExp, html, function (m) {
      matches.push(m);
    });
    if (!matches.length) return null;

    var tagResults = new Array(matches.length);
    matches.forEach(function (match, i) {
      if (tagName === "icon") {
        var attrs = {};
        forEachMatch(attrRegExp, match[0], function (m, i) {
          const [attrName, attrValue] = m.splice(1);
          if (attrName === "name") {
            if (!attrs.class) attrs.class = "";
            attrs.class += "game-icon game-icon-" + attrValue;
          } else if (attrName === "size") {
            if (!attrs.style) attrs.style = "";
            if (Number.isFinite(Number(attrValue))) attrs.style += "font-size:" + attrValue + "pt;";
            else attrs.style += "font-size:" + attrValue + ";";
          } else if (attrName === "color") {
            if (!attrs.style) attrs.style = "";
            attrs.style += "color:" + attrValue + ";";
          }
        });
        forEachMatch(attrRegExp, match[0], function (m, i) {
          var attrName = m[1];
          var attrValue = m[2];
          if (attrName === "style") {
            if (!attrs.style) attrs.style = "";
            attrs.style += attrValue;
          }
        });
        var tagResult = "<i";
        Object.keys(attrs).forEach(function (k) {
          tagResult += " " + k + '="' + attrs[k] + '"';
        });
        tagResult += "></i>";
        tagResults[i] = tagResult;
      }
    });

    html = html.replace(tagRegExp, function () {
      return tagResults.shift();
    });
  });

  result += `<div class="card-content-container">${html}</div>`;
  return result;
}

function card_repeat(card, count) {
  var result = [];
  for (var i = 0; i < count; ++i) {
    result.push(card);
  }
  return result;
}

function card_generate_crop_marks(card_data, options, params = {}) {
  const {
    isPreview
  } = params;

  const bleed_width_half = `calc(${options.back_bleed_width} / 2)`;
  const bleed_height_half = `calc(${options.back_bleed_height} / 2)`;
  
  if (!options.crop_marks || isPreview) return '';

  return `
      <div class="crop-mark crop-mark-top-left-v hide" style="left:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-top-right-v hide" style="right:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-bottom-left-v hide" style="left:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-bottom-right-v hide" style="right:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-top-left-h hide" style="top:${bleed_height_half};"></div>
      <div class="crop-mark crop-mark-bottom-left-h hide" style="bottom:${bleed_height_half};"></div>
      <div class="crop-mark crop-mark-top-right-h hide" style="top:${bleed_height_half};"></div>
      <div class="crop-mark crop-mark-bottom-right-h hide" style="bottom:${bleed_height_half};"></div>
  `;
}

function card_generate_color_front_style(color, data = {}, options = {}) {
  return `style="color:${color};border-color:${color};background-color:${color}"`;
}

function card_generate_color_back_style(color, data = {}, options = {}) {
  return `style="color:${color};background-color:${color}"`;
}

function card_generate_back_icon_style(color, data = {}, options = {}) {
  const rotation = card_data_icon_back_rotation(data, options);
  let bgStyle = '';
  if (data.icon_back_container !== 'none') {
    bgStyle = `background-repeat: no-repeat; transform: rotate(${rotation}deg);`;
  }
  return `style="${bgStyle}"`;
}

function card_generate_back_icon_container_style(color, data = {}, options = {}) {
  let bgStyle = '';
  if (data.icon_back_container !== 'none') {
    bgStyle = `border-color:${color}; background-color:${color}; display: flex; justify-content: center; align-items: center;`;
  }
  return `style="${bgStyle}"`;
}

function card_generate_color_gradient_style(color, options) {
  return `style="background: radial-gradient(ellipse at center, white 20%, ${color} 120%);"`;  
}

function add_to_style(style = ' style=""', css) {
  // style string example ----> `style="color:red;"`
  const finalQuote = style.slice(-1) === '"' ? '"' : '';
  let result = finalQuote ? style.slice(0, -1) : style;
  const lastChar = result.slice(-1);
  if (lastChar !== ';' && lastChar !== '"') {
    result += ';';
  }
  for (const [key, value] of Object.entries(css)) {
    result += `${key}:${value};`;
  }
  result += finalQuote;
  return result;
}

function add_size_to_style(style, width, height) {
  return add_to_style(style, { width, height });
}

function add_bleed_to_style(style) {
  return add_to_style(style, { padding: `calc(${card_options.back_bleed_height}/2) calc(${card_options.back_bleed_width}/2)` });
}

// ============================================================================
// Monster card front (D&D-style layout)
// ============================================================================

function monster_ability_mod(score) {
  const n = parseInt(score, 10);
  if (isNaN(n)) return '';
  const mod = Math.floor((n - 10) / 2);
  return mod >= 0 ? '+' + mod : String(mod);
}

function monster_action_attack_type_label(attackType) {
  switch (String(attackType || '').trim()) {
    case 'melee_attack_roll':
    case 'melee': return 'Melee';
    case 'ranged_attack_roll':
    case 'ranged': return 'Ranged';
    case 'spell_attack_roll': return 'Spell';
    default: return '';
  }
}

function monster_action_attack_classification_label(classification) {
  switch (String(classification || '').trim()) {
    case 'weapon': return 'Weapon';
    case 'spell': return 'Spell';
    case 'unarmed': return 'Unarmed';
    default: return '';
  }
}

function monster_action_entry_kind(entry) {
  const explicitKind = String(entry && entry.action_kind || '').trim();
  if (explicitKind === 'attack' || explicitKind === 'feature') return explicitKind;
  const attackType = String(entry && entry.attack_type || '').trim();
  const attackClassification = String(entry && entry.attack_classification || '').trim();
  const attackAbility = String(entry && entry.attack_ability || '').trim();
  const reach = String(entry && entry.reach || '').trim();
  return (attackType || attackClassification || reach || (attackAbility && attackAbility !== 'auto')) ? 'attack' : 'feature';
}

function monster_action_ability_label(ability) {
  switch (String(ability || '').trim()) {
    case 'str': return 'Strength';
    case 'dex': return 'Dexterity';
    case 'con': return 'Constitution';
    case 'int': return 'Intelligence';
    case 'wis': return 'Wisdom';
    case 'cha': return 'Charisma';
    default: return '';
  }
}

function monster_action_numeric_mod(score) {
  if (typeof window.monster_ability_mod === 'function') return window.monster_ability_mod(score);
  const n = parseInt(score, 10);
  return isNaN(n) ? 0 : Math.floor((n - 10) / 2);
}

function monster_action_best_ability(card, abilities) {
  return abilities.reduce(function (best, ability) {
    if (!best) return ability;
    const bestMod = monster_action_numeric_mod(card[best]);
    const nextMod = monster_action_numeric_mod(card[ability]);
    return nextMod > bestMod ? ability : best;
  }, '');
}

function monster_action_resolved_attack_ability(card, entry) {
  const explicitAbility = String(entry.attack_ability || 'auto').trim();
  if (explicitAbility && explicitAbility !== 'auto') return explicitAbility;
  const attackClassification = String(entry.attack_classification || '').trim();
  const attackType = String(entry.attack_type || '').trim();
  if (attackClassification === 'spell' || attackType === 'spell_attack_roll') {
    return monster_action_best_ability(card, ['cha', 'wis', 'int']);
  }
  return monster_action_best_ability(card, ['str', 'dex']);
}

function monster_action_attack_bonus(card, entry) {
  const type = String(entry.attack_type || '').trim();
  const classification = String(entry.attack_classification || '').trim();
  if (!type && !classification) return '';
  const ability = monster_action_resolved_attack_ability(card, entry);
  if (!ability) return '';
  const pb = typeof window.monster_pb === 'function' ? window.monster_pb(card.challenge_rating) : 2;
  return pb + monster_action_numeric_mod(card[ability]);
}

function monster_action_attack_meta_html(card, entry) {
  const attackTypeLabel = monster_action_attack_type_label(entry.attack_type);
  const attackClassificationLabel = monster_action_attack_classification_label(entry.attack_classification);
  const attackType = String(entry.attack_type || '').trim();
  const reach = String(entry.reach || '').trim();
  const rangeNormal = String(entry.range_normal || '').trim();
  const rangeLong = String(entry.range_long || '').trim();
  const parts = [];
  var attackLabel = '';
  if (attackTypeLabel && attackClassificationLabel) attackLabel = attackTypeLabel + ' ' + attackClassificationLabel + ' Attack Roll';
  else if (attackTypeLabel && !attackClassificationLabel) attackLabel = attackTypeLabel + ' Attack Roll';
  else if (!attackTypeLabel && attackClassificationLabel) attackLabel = attackClassificationLabel + ' Attack Roll';
  if (attackLabel) {
    const bonus = monster_action_attack_bonus(card, entry);
    const bonusText = typeof bonus === 'number' && !isNaN(bonus)
      ? (bonus >= 0 ? '+' + bonus : String(bonus))
      : '';
    parts.push(escape_html(attackLabel) + (bonusText ? ': ' + escape_html(bonusText) : ''));
  }
  if (attackType === 'ranged') {
    const rangeText = [rangeNormal, rangeLong].filter(Boolean).map(function (range) {
      return range + 'ft';
    }).join('/');
    if (rangeText) parts.push('range ' + escape_html(rangeText));
  } else if (reach) {
    parts.push('reach ' + escape_html(reach) + ' ft.');
  }
  return parts.length ? '<span class="monster-action-inline-meta">' + parts.join(', ') + '</span>' : '';
}

function monster_action_inline_save_text(card, entry, tokenBody) {
  const segments = String(tokenBody || '').split('|').map(function (part) { return part.trim(); }).filter(Boolean);
  if (!segments.length) return '@save[]';
  const saveAbilities = segments[0].split('/').map(function (part) { return part.trim().toLowerCase(); }).filter(Boolean);
  const saveAbilityLabels = saveAbilities.map(monster_action_ability_label);
  if (!saveAbilities.length || saveAbilityLabels.some(function (label) { return !label; })) return '@save[' + tokenBody + ']';
  const saveAbilityLabel = saveAbilityLabels.length === 1
    ? saveAbilityLabels[0]
    : saveAbilityLabels.slice(0, -1).join(', ') + ' or ' + saveAbilityLabels[saveAbilityLabels.length - 1];

  const options = {};
  segments.slice(1).forEach(function (segment) {
    const splitIndex = segment.indexOf('=');
    if (splitIndex === -1) return;
    const key = segment.slice(0, splitIndex).trim().toLowerCase();
    const value = segment.slice(splitIndex + 1).trim().toLowerCase();
    if (key) options[key] = value;
  });

  var dcText = '';
  const dcOption = options.dc || '';
  if (dcOption === 'auto') {
    const abilityOverride = options.ability || '';
    const resolvedAbility = abilityOverride && monster_action_ability_label(abilityOverride)
      ? abilityOverride
      : (monster_action_resolved_attack_ability(card, entry) || monster_action_best_ability(card, ['cha', 'wis', 'int']));
    if (resolvedAbility) {
      const pb = typeof window.monster_pb === 'function' ? window.monster_pb(card.challenge_rating) : 2;
      dcText = String(8 + pb + monster_action_numeric_mod(card[resolvedAbility]));
    }
  } else if (/^-?\d+$/.test(dcOption)) {
    dcText = dcOption;
  }

  if (dcText) {
    return '<span class="monster-action-inline-label">' + escape_html(saveAbilityLabel + ' Saving Throw:') + '</span> ' + escape_html('DC ' + dcText);
  }
  return '<span class="monster-action-inline-label">' + escape_html(saveAbilityLabel + ' Saving Throw') + '</span>';
}

function monster_action_damage_type_label(type) {
  const key = String(type || '').trim().toLowerCase();
  const standard = {
    acid: 'Acid',
    bludgeoning: 'Bludgeoning',
    cold: 'Cold',
    fire: 'Fire',
    force: 'Force',
    lightning: 'Lightning',
    necrotic: 'Necrotic',
    piercing: 'Piercing',
    poison: 'Poison',
    psychic: 'Psychic',
    radiant: 'Radiant',
    slashing: 'Slashing',
    thunder: 'Thunder'
  };
  if (standard[key]) return standard[key];
  return key ? key.replace(/\b\w/g, function (char) { return char.toUpperCase(); }) : '';
}

function monster_action_damage_type_text(typeText) {
  const types = String(typeText || '').split('/').map(monster_action_damage_type_label).filter(Boolean);
  if (!types.length) return '';
  return types.length === 1 ? types[0] : types.slice(0, -1).join(', ') + ' or ' + types[types.length - 1];
}

function monster_action_inline_damage_text(card, entry, tokenBody) {
  const segments = String(tokenBody || '').split('|').map(function (part) { return part.trim(); }).filter(Boolean);
  if (!segments.length) return '@damage[]';

  const options = {};
  let diceText = '';
  segments.forEach(function (segment) {
    const splitIndex = segment.indexOf('=');
    if (splitIndex === -1) {
      if (!diceText && /^\d+d(?:4|6|8|10|12|20)$/i.test(segment)) diceText = segment.toLowerCase();
      else if (!options.count && /^\d+$/.test(segment)) options.count = segment;
      else if (!options.die && /^d(?:4|6|8|10|12|20)$/i.test(segment)) options.die = segment.toLowerCase();
      return;
    }
    const key = segment.slice(0, splitIndex).trim().toLowerCase();
    const value = segment.slice(splitIndex + 1).trim().toLowerCase();
    if (key) options[key] = value;
  });

  if (!diceText && /^\d+d(?:4|6|8|10|12|20)$/i.test(options.dice || '')) diceText = options.dice;
  const diceMatch = diceText.match(/^(\d+)d(4|6|8|10|12|20)$/i);
  const count = diceMatch ? Number(diceMatch[1]) : Number(options.count || options.dice_count || 0);
  const die = diceMatch ? Number(diceMatch[2]) : Number(String(options.die || '').replace(/^d/i, ''));
  if (!Number.isFinite(count) || count <= 0 || ![4, 6, 8, 10, 12, 20].includes(die)) {
    return '@damage[' + tokenBody + ']';
  }

  const bonusOption = String(options.bonus || 'auto').trim().toLowerCase();
  var bonus = 0;
  if (bonusOption && bonusOption !== 'none') {
    const bonusAbility = bonusOption === 'auto'
      ? monster_action_resolved_attack_ability(card, entry)
      : bonusOption;
    if (!monster_action_ability_label(bonusAbility)) return '@damage[' + tokenBody + ']';
    bonus = monster_action_numeric_mod(card[bonusAbility]);
  }

  const diceFormula = count + 'd' + die;
  const bonusText = bonus > 0 ? '+' + bonus : (bonus < 0 ? String(bonus) : '');
  const average = Math.max(0, Math.floor(count * ((die + 1) / 2) + bonus));
  const damageType = monster_action_damage_type_text(options.type || options.damage || '');
  return escape_html(String(average) + ' (' + diceFormula + bonusText + ') ' + (damageType ? damageType + ' ' : '') + 'damage');
}

function monster_action_plain_text_html(text) {
  return escape_html(text).replace(/\r\n|\r|\n/g, '<br>');
}

function monster_action_text_html(card, entry) {
  const sourceText = String(entry.text || '');
  if (!sourceText) return '';
  const tokenPattern = /@(save|failure|fail|success|damage|dmg)\[([^\]]+)\]/gi;
  let cursor = 0;
  let html = '';
  let match;
  while ((match = tokenPattern.exec(sourceText))) {
    html += monster_action_plain_text_html(sourceText.slice(cursor, match.index));
    const tokenType = String(match[1] || '').toLowerCase();
    const tokenBody = String(match[2] || '');
    if (tokenType === 'save') {
      html += monster_action_inline_save_text(card, entry, tokenBody);
    } else if (tokenType === 'damage' || tokenType === 'dmg') {
      html += monster_action_inline_damage_text(card, entry, tokenBody);
    } else if (tokenType === 'failure' || tokenType === 'fail') {
      html += '<span class="monster-action-inline-label">Failure:</span> ' + escape_html(tokenBody);
    } else if (tokenType === 'success') {
      html += '<span class="monster-action-inline-label">Success:</span> ' + escape_html(tokenBody);
    } else {
      html += escape_html(match[0]);
    }
    cursor = match.index + match[0].length;
  }
  html += monster_action_plain_text_html(sourceText.slice(cursor));
  return html;
}

function monster_legendary_intro_html(d) {
  const perRound = String(d.legendary_actions_per_round || '').trim();
  if (!perRound) return '';
  const subtype = String(d.creature_subtype || '').trim() || 'creature';
  const actionWord = perRound === '1' ? 'legendary action' : 'legendary actions';
  return '<div class="monster-trait"><span class="monster-trait-desc">The ' +
    escape_html(subtype) + ' can take ' + escape_html(perRound) + ' ' + actionWord +
    ', choosing from the options below.</span></div>';
}

function monster_entry_title_html(key, entry) {
  const title = (entry.title || '').trim();
  if (!title) return '';
  var suffix = '';
  if (key === 'legendary_actions') {
    const cost = String(entry.legendary_cost || '1').trim();
    if (cost && cost !== '1') suffix = ' (Costs ' + cost + ' Actions)';
  }
  return '<strong class="monster-trait-name">' + escape_html(title + suffix) + '.</strong>';
}

function monster_cr_display(cr) {
  if (cr === '' || cr == null) return '';
  const n = Number(cr);
  if (isNaN(n)) return String(cr);
  if (n === 0.125) return '1/8';
  if (n === 0.25) return '1/4';
  if (n === 0.5) return '1/2';
  return String(Math.round(n));
}

/** Map creature type to background image filename in assets. */
function creature_type_to_background(creatureType) {
  const t = (creatureType || '').toLowerCase().trim();
  if (t === 'undead' || t === 'undeads') return 'undead.jpg';
  if (t === 'fiend' || t === 'fiends') return 'fiend.jpg';
  if (t === 'aberration' || t === 'aberrations') return 'aberration.jpg';
  if (t === 'dragon' || t === 'dragons') return 'dragon.jpg';
  if (t === 'celestial' || t === 'celestials') return 'celestial.jpg';
  if (t === 'construct' || t === 'constructs') return 'construct.jpg';
  if (t === 'fey' || t === 'feys') return 'fey.jpg';
  if (t === 'beast' || t === 'beasts') return 'beast.jpg';
  if (t === 'giant' || t === 'giants') return 'giant.jpg';
  if (t === 'humanoid' || t === 'humanoids') return 'humanoid.jpg';
  if (t === 'ooze' || t === 'oozes') return 'ooze.jpg';
  if (t === 'plant' || t === 'plants') return 'plant.jpg';
  return 'aberration.jpg';
}

function npc_class_to_background(npcClass) {
  const key = String(npcClass || '').trim().toLowerCase();
  const byClass = {
    barbarian: 'assets/class-backgrounds/BarbarianBackground.png',
    bard: 'assets/class-backgrounds/BardBackground.png',
    cleric: 'assets/class-backgrounds/ClericBackground.png',
    druid: 'assets/class-backgrounds/DruidBackground.png',
    fighter: 'assets/class-backgrounds/FighterBackground.png',
    monk: 'assets/class-backgrounds/MonkBackground.png',
    paladin: 'assets/class-backgrounds/PaladinBackground.png',
    ranger: 'assets/class-backgrounds/RangerBackground.png',
    rogue: 'assets/class-backgrounds/RogueBackground.png',
    sorcerer: 'assets/class-backgrounds/SorcererBackground.png',
    warlock: 'assets/class-backgrounds/WarlockBackground.png',
    wizard: 'assets/class-backgrounds/WizardBackground.png'
  };
  return byClass[key] || 'assets/humanoid.jpg';
}

function item_rarity_to_background(rarity) {
  const key = String(rarity || '').trim().toLowerCase();
  if (key === 'artifact') return 'assets/rarity-backgrounds/ArtifactBackground.png';
  if (key === 'legendary') return 'assets/rarity-backgrounds/LegendaryBackground.png';
  if (key === 'very rare') return 'assets/rarity-backgrounds/VeryRareBackground.png';
  if (key === 'rare') return 'assets/rarity-backgrounds/RareBackground.png';
  if (key === 'uncommon') return 'assets/rarity-backgrounds/UncommonBackground.png';
  if (key === 'common') return 'assets/rarity-backgrounds/CommonBackground.png';
  return '';
}

/** Neutral dark-slate gradient used in gradient mode when no artwork palette is available. */
const MONSTER_FALLBACK_GRADIENT =
  'radial-gradient(circle at 88% 0%, rgba(96,105,125,0.5) 0%, rgba(96,105,125,0) 55%), ' +
  'radial-gradient(circle at 12% 100%, rgba(72,80,98,0.5) 0%, rgba(72,80,98,0) 55%), ' +
  'linear-gradient(180deg, rgb(62,68,82) 0%, rgb(15,17,22) 100%)';

/**
 * The CSS background-image value used behind the whole card. Either a dark gradient
 * auto-derived from the uploaded artwork (the default) or the creature type jpg,
 * depending on the card's background_mode. Always returns a valid `background-image` value.
 */
function monster_bg_image_value(d) {
  if (d && d.background_mode === 'gradient') {
    return (d.art_gradient || '').trim() || MONSTER_FALLBACK_GRADIENT;
  }
  if (d && d.template === 'npc') {
    return "url('" + npc_class_to_background(d.npc_class) + "')";
  }
  const typeBgFile = creature_type_to_background(d ? d.creature_type : '');
  return "url('assets/" + typeBgFile + "')";
}

function card_texture_overlay_html(enabled) {
  return enabled ? '<div class="card-texture-overlay"></div>' : '';
}

/** Inline style for a label icon: filled with the card background, shaped by SVG mask. Uses embedded data URI when available (works from file://). */
function monster_label_icon_style(typeBgUrl, iconName) {
  const dataUri = typeof window.MONSTER_ICON_DATA !== 'undefined' && window.MONSTER_ICON_DATA[iconName];
  const iconUrl = dataUri ? "url('" + dataUri + "')" : 'url(\'assets/icons/' + iconName + '.svg\')';
  return 'background-image:' + typeBgUrl + ';-webkit-mask-image:' + iconUrl + ';mask-image:' + iconUrl + ';';
}

/** Reusable "paper box" section (header + divider + box of trait-style lines). */
function monster_traits_box_html(headerText, itemsHtml, sectionClass) {
  return '<div class="monster-traits-section' + (sectionClass ? ' ' + sectionClass : '') + '">' +
    '<div class="monster-traits-header">' + escape_html(headerText) + '</div>' +
    '<div class="monster-traits-divider"></div>' +
    '<div class="monster-traits-box">' + itemsHtml + '</div></div>';
}

/**
 * Trait/action group box ("Traits", "Actions", …): renders the non-empty
 * {title, text} entries of card[key] when the matching section is enabled.
 */
function monster_entry_group_html(d, key, headerText, sectionKey) {
  if (!card_section_enabled(d, sectionKey)) return '';
  const list = Array.isArray(d[key]) ? d[key] : [];
  const introHtml = key === 'legendary_actions' ? monster_legendary_intro_html(d) : '';
  const items = list.filter(function (t) {
    const attackAbility = String(t && t.attack_ability || '').trim();
    const attackClassification = String(t && t.attack_classification || '').trim();
    return t && (
      (t.title || '').trim() ||
      (t.attack_type || '').trim() ||
      attackClassification ||
      (attackAbility && attackAbility !== 'auto') ||
      (t.reach || '').trim() ||
      (t.range_normal || '').trim() ||
      (t.range_long || '').trim() ||
      (t.trigger || '').trim() ||
      (t.text || '').trim()
    );
  }).map(function (t) {
    const title = (t.title || '').trim();
    const trigger = (t.trigger || '').trim();
    const text = (t.text || '').trim();
    const isCreatureReaction = key === 'reactions';
    const usesRichText = key === 'traits' || key === 'actions' || key === 'bonus_actions' || key === 'reactions' || key === 'legendary_actions' || key === 'item_features';
    const isAction = key === 'actions' || key === 'bonus_actions';
    const isAttack = isAction && monster_action_entry_kind(t) === 'attack';
    const reactionBody = isCreatureReaction
      ? [
          trigger ? '<strong class="monster-reaction-inline-label">Trigger:</strong> ' + escape_html(trigger) : '',
          text ? '<strong class="monster-reaction-inline-label">Response:</strong> ' + monster_action_text_html(d, t) : ''
        ].filter(Boolean).join(' ')
      : '';
    const actionMeta = isAttack ? monster_action_attack_meta_html(d, t) : '';
    const actionText = usesRichText ? monster_action_text_html(d, t) : '';
    const actionBody = isAction
      ? (isAttack
          ? [
              actionMeta,
              text ? '<span class="monster-action-inline-label">Hit:</span> ' + actionText : ''
            ].filter(Boolean).join(' ')
          : actionText)
      : '';
    return '<div class="monster-trait">' +
      monster_entry_title_html(key, t) +
      (isCreatureReaction
        ? (reactionBody ? '<span class="monster-trait-desc"> ' + reactionBody + '</span>' : '')
        : (isAction
          ? (actionBody ? '<span class="monster-trait-desc"> ' + actionBody + '</span>' : '')
          : (text ? '<span class="monster-trait-desc"> ' + actionText + '</span>' : ''))) +
      '</div>';
  }).join('');
  const content = introHtml + items;
  return content ? monster_traits_box_html(headerText, content, 'monster-' + key.replace(/_/g, '-') + '-section') : '';
}

/** Appearance section (single free-text field), styled like the old traits box. */
function monster_appearance_section_html(text) {
  const t = (text || '').trim();
  if (!t) return '';
  const item = '<div class="monster-trait"><span class="monster-trait-desc">' + escape_html(t) + '</span></div>';
  return monster_traits_box_html('Appearance', item);
}

/** Meta row + ability-score table + optional row (the D&D stat block). */
function monster_languages_text(d) {
  const languages = Array.isArray(d.languages)
    ? d.languages.filter(function (language) { return String(language || '').trim(); })
    : (d.languages ? String(d.languages).split(',').map(function (language) { return language.trim(); }).filter(Boolean) : []);
  const telepathyRange = String(d.telepathy_range == null ? '' : d.telepathy_range).trim();
  if (telepathyRange) languages.push('telepathy ' + telepathyRange + ' ft.');
  return languages.join(', ');
}

function monster_stats_block_html(d) {
  const bgValue = monster_bg_image_value(d);
  const iconStyle = function (name) { return monster_label_icon_style(bgValue, name); };

  const speedVal = (typeof window.monster_speed_string === 'function') ? window.monster_speed_string(d) : (d.speed || '');
  const hasCr = String(d.challenge_rating || '').trim();
  const hasLevel = String(d.level || '').trim();
  const isCreatureStatsBlock = d.template === 'creature';
  const crVal = monster_cr_display(d.challenge_rating);
  const pbVal = (typeof window.monster_effective_pb === 'function')
    ? window.monster_effective_pb(d)
    : ((typeof window.monster_pb === 'function') ? window.monster_pb(d.challenge_rating) : (d.proficiency_bonus || ''));
  const dexMod = (typeof window.monster_ability_mod === 'function') ? window.monster_ability_mod(d.dex) : '';
  const initiativeVal = dexMod !== '' && dexMod !== undefined ? (dexMod >= 0 ? '+' + dexMod : String(dexMod)) : '';
  const showCrCell = isCreatureStatsBlock;
  const showPbCell = isCreatureStatsBlock || hasCr || hasLevel;
  const showLevelCell = !isCreatureStatsBlock && hasLevel;
  const showInitiativeCell = card_section_enabled(d, 'ability_scores') && initiativeVal;

  const speedCell = card_section_enabled(d, 'speeds')
    ? '<div class="monster-meta-cell monster-meta-cell-speed"><span class="monster-speed"><span class="monster-label-icon" style="' + iconStyle('speed') + '" title="Speed"></span><span class="monster-speed-text">' + escape_html(speedVal) + '</span></span></div>'
    : '';
  const initiativeCell = showInitiativeCell
    ? '<div class="monster-meta-cell monster-meta-cell-init"><span class="monster-init"><span class="monster-meta-label">Init</span> ' + escape_html(initiativeVal) + '</span></div>'
    : '';
  const levelCell = showLevelCell
    ? '<div class="monster-meta-cell monster-meta-cell-level"><span class="monster-level"><span class="monster-meta-label">Lvl</span> ' + escape_html(hasLevel) + '</span></div>'
    : '';
  const crCell = showCrCell
    ? '<div class="monster-meta-cell monster-meta-cell-cr"><span class="monster-cr"><span class="monster-label-icon" style="' + iconStyle('cr') + '" title="Challenge Rating"></span>' + escape_html(crVal) + '</span></div>'
    : '';
  const pbCell = showPbCell
    ? '<div class="monster-meta-cell monster-meta-cell-pb"><span class="monster-pb"><span class="monster-label-icon" style="' + iconStyle('pb') + '" title="Proficiency Bonus"></span>+' + escape_html(String(pbVal)) + '</span></div>'
    : '';
  const metaRow = '<div class="monster-meta-row">' +
    speedCell +
    initiativeCell +
    levelCell +
    crCell +
    pbCell +
    '</div>';

  const stats = [d.str, d.dex, d.con, d.int, d.wis, d.cha];
  const labels = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  let topCells = '';
  let modCells = '';
  for (let i = 0; i < 6; i++) {
    const val = stats[i] != null && stats[i] !== '' ? String(stats[i]).trim() : '\u2014';
    const mod = val && val !== '\u2014' ? monster_ability_mod(val) : '';
    const modStr = (mod !== '' && mod !== undefined) ? (mod >= 0 ? '+' + mod : String(mod)) : '';
    topCells += '<td class="monster-stat-cell">' + escape_html(labels[i]) + ' ' + escape_html(val) + '</td>';
    modCells += '<td class="monster-stat-mod">' + escape_html(modStr) + '</td>';
  }
  const abilitiesBlock = card_section_enabled(d, 'ability_scores')
    ? '<div class="monster-abilities-block">' +
      '<table class="monster-stats-table"><tr>' + topCells + '</tr><tr>' + modCells + '</tr></table>' +
      '</div>'
    : '';

  const savingThrowsStr = (typeof window.monster_saving_throws === 'function') ? window.monster_saving_throws(d) : (d.saving_throws || '');
  const skillsStr = (typeof window.monster_skills_string === 'function') ? window.monster_skills_string(d) : (d.skill_proficiencies || '');
  const sensesStr = (typeof window.monster_senses_string === 'function') ? window.monster_senses_string(d) : (d.senses || '');
  const passivePerceptionMatch = String(sensesStr || '').match(/passive Perception\s+\d+/i);
  const passivePerceptionStr = passivePerceptionMatch ? passivePerceptionMatch[0].replace(/^passive/i, 'passive') : '';
  const sensesDisplayStr = card_section_enabled(d, 'senses') ? sensesStr : passivePerceptionStr;
  const resistArr = Array.isArray(d.damage_resistances) ? d.damage_resistances : (d.damage_resistances ? String(d.damage_resistances).split(',') : []);
  const immuneArr = Array.isArray(d.damage_immunities) ? d.damage_immunities : (d.damage_immunities ? String(d.damage_immunities).split(',') : []);
  const vulnArr = Array.isArray(d.damage_vulnerabilities) ? d.damage_vulnerabilities : (d.damage_vulnerabilities ? String(d.damage_vulnerabilities).split(',') : []);
  const condArr = Array.isArray(d.condition_immunities) ? d.condition_immunities : (d.condition_immunities ? String(d.condition_immunities).split(',') : []);

  const optionalFields = [
    { key: 'skills', section: 'skills', label: 'Skills', icon: 'skills', val: skillsStr },
    { key: 'saving_throws', section: 'saving_throws', label: 'Saving Throws', icon: 'saving_throws', val: savingThrowsStr },
    { key: 'damage_resistances', section: 'resistances', label: 'Resist.', icon: 'resistances', val: resistArr.join(', ') },
    { key: 'damage_immunities', section: 'damage_immunities', label: 'Immune', icon: 'damage_immunities', val: immuneArr.join(', ') },
    { key: 'damage_vulnerabilities', section: 'vulnerabilities', label: 'Vuln.', icon: 'vulnerabilities', val: vulnArr.join(', ') },
    { key: 'condition_immunities', section: 'condition_immunities', label: 'Cond. Immune', icon: 'condition_immunities', val: condArr.join(', ') },
    { key: 'senses', section: 'senses', label: 'Senses', icon: 'senses', val: sensesDisplayStr, always: true },
    { key: 'languages', section: 'languages', label: 'Languages', icon: 'languages', val: monster_languages_text(d) }
  ];
  const optionalWithVal = optionalFields.filter(function (f) { return (f.val || '').trim() && (f.always || card_section_enabled(d, f.section)); });
  const optionalBoxes = optionalWithVal.map(function (f) {
    return '<div class="monster-optional-box">' +
      '<span class="monster-optional-label"><span class="monster-label-icon" style="' + iconStyle(f.icon) + '" title="' + escape_html(f.label) + '"></span></span> ' +
      '<span class="monster-optional-value">' + escape_html((f.val || '').trim()) + '</span>' +
      '</div>';
  });
  const row5 = optionalWithVal.length
    ? '<div class="monster-optional-row">' + optionalBoxes.join('') + '</div>'
    : '';

  return metaRow + abilitiesBlock + row5;
}

// ============================================================================
// Item card rendering
// ============================================================================

function item_display_rarity(rarity) {
  const value = String(rarity || '').trim();
  if (!value) return '';
  if (['None', 'Varies', 'Unknown', 'Unknown (Magic)', 'Other'].indexOf(value) !== -1) return '';
  return value;
}

function item_rarity_gem_asset(rarity) {
  const key = String(rarity || '').trim().toLowerCase();
  if (key === 'artifact') return 'assets/item-gems/artifact.png';
  if (key === 'legendary') return 'assets/item-gems/legendary.png';
  if (key === 'very rare') return 'assets/item-gems/very-rare.png';
  if (key === 'rare') return 'assets/item-gems/rare.png';
  if (key === 'uncommon') return 'assets/item-gems/uncommon.png';
  return 'assets/item-gems/common.png';
}

function item_type_icon_asset(itemType) {
  const type = String(itemType || '').trim().toLowerCase();
  if (!type) return 'assets/item-type-icons/wondrous-item.png';
  if (type.indexOf('staff') !== -1) return 'assets/item-type-icons/staff.png';
  if (type.indexOf('wand') !== -1 || type.indexOf('rod') !== -1) return 'assets/item-type-icons/wand.png';
  if (type.indexOf('ring') !== -1) return 'assets/item-type-icons/ring.png';
  if (type.indexOf('scroll') !== -1) return 'assets/item-type-icons/scroll.png';
  if (type.indexOf('shield') !== -1 || type.indexOf('armor') !== -1) return 'assets/item-type-icons/shield.png';
  if (type.indexOf('potion') !== -1 || type.indexOf('poison') !== -1) return 'assets/item-type-icons/potion-poison.png';
  if (type.indexOf('wondrous') !== -1) return 'assets/item-type-icons/wondrous-item.png';
  if (type.indexOf('ranged') !== -1 || type.indexOf('ammunition') !== -1 || type.indexOf('firearm') !== -1 ||
      type.indexOf('modern') !== -1 || type.indexOf('renaissance') !== -1 || type.indexOf('futuristic') !== -1) {
    return 'assets/item-type-icons/ranged-weapon.png';
  }
  if (type.indexOf('weapon') !== -1 || type.indexOf('sword') !== -1 || type.indexOf('axe') !== -1) {
    return 'assets/item-type-icons/melee-weapon.png';
  }
  return 'assets/item-type-icons/wondrous-item.png';
}

function item_corner_emblem_html(d) {
  const gemSrc = item_rarity_gem_asset(d.item_rarity);
  const iconSrc = item_type_icon_asset(item_type_line(d));
  return '<div class="item-corner-emblem">' +
    '<img class="item-corner-emblem-gem" src="' + gemSrc + '" alt="">' +
    '<img class="item-corner-emblem-icon" src="' + iconSrc + '" alt="">' +
    '</div>';
}

/** Item card background: gradient by default, or rarity background when selected. */
function item_bg_image_value(d) {
  if (d && d.background_mode === 'gradient') {
    return (d.art_gradient || '').trim() || MONSTER_FALLBACK_GRADIENT;
  }
  const rarityBg = item_rarity_to_background(d ? d.item_rarity : '');
  return rarityBg ? "url('" + rarityBg + "')" : ((d && (d.art_gradient || '').trim()) || MONSTER_FALLBACK_GRADIENT);
}

function card_front_artwork_underlay_value() {
  return "url('assets/artwork-front-underlay.png')";
}

function card_front_artwork_style(d) {
  const artUrl = (d.creature_artwork || '').trim();
  const artY = (d.creature_art_y != null && d.creature_art_y !== '') ? d.creature_art_y : 50;
  const artFit = (d.creature_art_fit || 'cover').trim() === 'contain' ? 'contain' : 'cover';
  const underlay = card_front_artwork_underlay_value();
  if (artUrl) {
    return 'background-image:url(\'' + escape_html(artUrl).replace(/'/g, '%27') + '\'),' + underlay + ';' +
      'background-size:' + artFit + ',cover;' +
      'background-position:center ' + artY + '%,center;' +
      'background-repeat:no-repeat,no-repeat;';
  }
  return 'background-image:' + underlay + ';background-size:cover;background-position:center;background-repeat:no-repeat;';
}

/** Conventional item classification line under the item name. */
function item_type_line(d) {
  const type = (d.item_type || '').trim();
  const category = (d.item_category || '').trim();
  const detail = (d.item_type_detail || '').trim();
  const customType = (d.item_custom_type || '').trim();
  const subtype = (d.item_subtype || '').trim();
  let line = '';

  if (type === 'Armor') {
    line = category === 'Shield' ? 'Shield' : (category ? category + ' Armor' : 'Armor');
  } else if (type === 'Weapon') {
    if (category === 'Simple' || category === 'Martial') {
      line = [category, detail, 'Weapon'].filter(Boolean).join(' ');
    } else if (category === 'Firearm') {
      line = [detail, 'Firearm'].filter(Boolean).join(' ');
    } else if (category === 'Ammunition') {
      line = 'Ammunition';
    } else {
      line = detail ? detail + ' Weapon' : 'Weapon';
    }
  } else if (type === 'Consumable' || type === 'Magic Item' || type === 'Equipment') {
    line = category || type;
  } else if (type === 'Vehicle or Mount') {
    if (category === 'Mount' || category === 'Vehicle') line = category;
    else if (category) line = 'Vehicle (' + category + ')';
    else line = type;
  } else if (type === 'Treasure or Trade') {
    if (category === 'Art Object' || category === 'Coinage' || category === 'Gemstone') {
      line = 'Treasure (' + category + ')';
    } else {
      line = category || type;
    }
  } else if (type === 'Other') {
    line = customType || 'Other';
  } else {
    // Pre-migration fallback for externally supplied card objects.
    line = type;
  }

  if (line && subtype && line.toLowerCase() !== subtype.toLowerCase()) line += ' (' + subtype + ')';
  if (!line && subtype) line = subtype;
  return line;
}

/** Attunement microline, e.g. "Requires Attunement by a Spellcaster". */
function item_attunement_line(d) {
  const mode = (d.item_attunement || '').trim();
  const req = (d.item_attunement_req || '').trim();
  if (mode === 'required') return 'Requires Attunement';
  if (mode === 'required_by') return 'Requires Attunement' + (req ? ' by ' + req : '');
  return '';
}

function item_rarity_attunement_line(d) {
  const rarity = item_display_rarity(d.item_rarity);
  const attune = item_attunement_line(d);
  if (rarity && attune) return rarity + ' (' + attune + ')';
  return rarity || attune;
}

/** Item description box (front), styled like the monster appearance box. */
function item_text_section_html(headerText, text, sectionClass, descClass) {
  const t = (text || '').trim();
  if (!t) return '';
  const classes = ['monster-trait-desc', 'item-rich-text'];
  if (descClass) classes.push(descClass);
  const item = '<div class="monster-trait"><span class="' + classes.join(' ') + '">' + escape_html(t) + '</span></div>';
  return monster_traits_box_html(headerText, item, sectionClass);
}

/** Item description box (front), styled like the monster appearance box. */
function item_description_section_html(text) {
  return item_text_section_html('Description', text, 'item-description-section');
}

function item_flavour_text_section_html(text) {
  const t = (text || '').trim();
  if (!t) return '';
  return '<div class="item-flavour-inline-section">' +
    '<div class="item-flavour-inline-divider"></div>' +
    '<p class="item-flavour-inline-text">' + escape_html(t) + '</p>' +
    '</div>';
}

function item_human_list(values) {
  const list = (Array.isArray(values) ? values : []).filter(Boolean);
  if (list.length <= 1) return list[0] || '';
  if (list.length === 2) return list[0] + ' and ' + list[1];
  return list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
}

function item_sentient_senses_text(senses) {
  const rangeGroups = [];
  const groupsByRange = Object.create(null);

  (Array.isArray(senses) ? senses : []).forEach(function (sense) {
    const label = String(sense[0] || '').trim();
    const range = String(sense[1] == null ? '' : sense[1]).trim();
    if (!label || !range) return;

    if (!groupsByRange[range]) {
      groupsByRange[range] = { range: range, labels: [] };
      rangeGroups.push(groupsByRange[range]);
    }
    groupsByRange[range].labels.push(label);
  });

  const descriptions = rangeGroups.map(function (group) {
    return item_human_list(group.labels) + ' out to a range of ' + group.range;
  });
  if (descriptions.length === 2 && rangeGroups.some(function (group) { return group.labels.length > 1; })) {
    return descriptions[0] + ', and ' + descriptions[1];
  }
  return item_human_list(descriptions);
}

function item_sentience_section_html(d) {
  const name = (d.title || '').trim() || 'This item';
  const alignment = (d.item_sentient_alignment || '').trim() || 'unaligned';
  const intScore = String(d.item_sentient_int == null ? '' : d.item_sentient_int).trim() || '\u2014';
  const wisScore = String(d.item_sentient_wis == null ? '' : d.item_sentient_wis).trim() || '\u2014';
  const chaScore = String(d.item_sentient_cha == null ? '' : d.item_sentient_cha).trim() || '\u2014';
  const senses = [
    ['Blindsight', d.item_sentient_blindsight],
    ['Darkvision', d.item_sentient_darkvision],
    ['Tremorsense', d.item_sentient_tremorsense],
    ['Truesight', d.item_sentient_truesight],
    ['Hearing', d.item_sentient_hearing]
  ];
  const sensesText = item_sentient_senses_text(senses);
  const languages = Array.isArray(d.item_sentient_languages)
    ? d.item_sentient_languages.filter(function (language) { return String(language || '').trim(); })
    : [];

  let firstParagraph = ' is a sentient ' + alignment + ' weapon with an Intelligence of ' +
    intScore + ', a Wisdom of ' + wisScore + ', and a Charisma of ' + chaScore + '.';
  if (sensesText) firstParagraph += ' It has ' + sensesText + '.';

  let secondParagraph = 'The weapon communicates telepathically with its wielder';
  const telepathyRange = String(d.item_sentient_telepathy_range == null ? '' : d.item_sentient_telepathy_range).trim();
  if (telepathyRange) secondParagraph += ' out to a range of ' + telepathyRange + ' feet';
  if (languages.length) {
    secondParagraph += ' and can speak, read, and understand ' + item_human_list(languages);
  }
  secondParagraph += '.';

  const additionalNotes = (d.item_sentient_text || '').trim();
  const body = '<div class="monster-trait item-sentience-copy">' +
    '<p><em>' + escape_html(name) + '</em>' + escape_html(firstParagraph) + '</p>' +
    '<p>' + escape_html(secondParagraph) + '</p>' +
    (additionalNotes ? '<p class="item-sentience-notes">' + escape_html(additionalNotes) + '</p>' : '') +
    '</div>';
  return monster_traits_box_html('Sentience', body, 'item-sentience-section');
}

function item_sentient_roleplay_section_html(d) {
  const roleplayFields = [
    ['Personality', d.item_sentient_personality, 'personality'],
    ['Quirk', d.item_sentient_quirk, 'quirk'],
    ['Flaw', d.item_sentient_flaw, 'flaw'],
    ['Goal', d.item_sentient_goal, 'goal']
  ];
  const items = roleplayFields.filter(function (field) {
    return String(field[1] || '').trim();
  }).map(function (field) {
    return '<div class="monster-trait monster-rp-' + field[2] + '">' +
      '<strong class="monster-trait-name">' + escape_html(field[0]) + '</strong>' +
      '<span class="monster-trait-desc"> ' + escape_html(String(field[1]).trim()) + '</span></div>';
  }).join('');
  return items ? monster_traits_box_html('Roleplay', items, 'monster-roleplay-section item-sentient-roleplay-section') : '';
}

function card_generate_front_item(data, options, { isPreview }) {
  const d = data;
  const artStyle = card_front_artwork_style(d);
  const innerStyle = 'background-image:' + item_bg_image_value(d) + ';background-size:cover;background-position:center;background-repeat:no-repeat;';
  const textureHtml = card_texture_overlay_html(true);

  const rarityLine = item_rarity_attunement_line(d);
  const typeLine = item_type_line(d);
  // Cursed / Sentient flags surface on the front as small marker tags so the
  // GM can spot them at a glance (curse details stay on the back).
  const flags = [];
  if (card_section_enabled(d, 'sentience')) flags.push('<span class="item-flag item-flag-sentient" title="Sentient Item">Sentient</span>');
  if (card_section_enabled(d, 'curse')) flags.push('<span class="item-flag item-flag-cursed" title="Cursed Item">Cursed</span>');
  const flagsHtml = flags.length ? '<div class="item-flags-overlay">' + flags.join('') + '</div>' : '';
  const emblemHtml = item_corner_emblem_html(d);

  const headerBlock = '<div class="monster-header-block header-align-center">' +
    '<div class="monster-header-main">' +
    (rarityLine ? '<p class="monster-subtitle item-rarity-line" style="color:#fff;">' + escape_html(rarityLine) + '</p>' : '') +
    '<h2 class="monster-name">' + escape_html((d.title || '').toUpperCase()) + '</h2>' +
    (typeLine ? '<p class="monster-npc-title item-type-line">' + escape_html(typeLine) + '</p>' : '') +
    '</div>' +
    '</div>';

  const flavourHtml = item_flavour_text_section_html(d.item_flavour_text);
  const frontTextSections = [flavourHtml].filter(Boolean).join('');
  const frontDescriptionWrap = frontTextSections
    ? '<div class="item-front-text-sections">' + frontTextSections + '</div>'
    : '';
  const artCreditHtml = (d.creature_art_credit || '').trim()
    ? '<div class="monster-art-credit">' + escape_html(d.creature_art_credit.trim()) + '</div>'
    : '';
  const textHtml = '<div class="monster-text">' +
    headerBlock + frontDescriptionWrap + artCreditHtml +
    '</div>';

  const artworkHtml = '<div class="monster-artwork" style="' + artStyle + '">' + emblemHtml + flagsHtml + '</div>';

  return '<div class="monster-card-inner item-card-inner" style="' + innerStyle + '">' + textureHtml + artworkHtml + textHtml + '</div>';
}

/** Detail rows (Type / Rarity / Cost / …) rendered like roleplay trait lines. */
function item_details_section_html(d) {
  const cells = [
    ['Attunement', item_attunement_line(d)],
    ['Cost', (d.item_cost || '').trim()],
    ['Weight', (d.item_weight || '').trim()]
  ].filter(function (r) { return r[1]; }).map(function (r) {
    return '<div class="item-detail-meta-cell">' +
      '<div class="item-detail-meta-label">' + escape_html(r[0]) + '</div>' +
      '<div class="item-detail-meta-value">' + escape_html(r[1]) + '</div>' +
      '</div>';
  }).join('');
  if (!cells) return '';
  return '<div class="monster-traits-section item-details-section">' +
    '<div class="item-detail-meta-row">' + cells + '</div>' +
    '</div>';
}

/** Combat tags: damage, range, AC, properties, focus classes — as tag chips. */
function item_combat_tags_html(d) {
  const tags = [];
  const dice = (d.item_damage_dice || '').trim();
  const dtype = (d.item_damage_type || '').trim();
  if (dice || dtype) tags.push([dice, dtype].filter(Boolean).join(' '));
  const rN = String(d.item_range_normal == null ? '' : d.item_range_normal).trim();
  const rL = String(d.item_range_long == null ? '' : d.item_range_long).trim();
  if (rN || rL) tags.push('Range ' + (rN || '—') + (rL ? '/' + rL : '') + ' ft.');
  const ac = String(d.item_ac == null ? '' : d.item_ac).trim();
  if (ac) tags.push('AC ' + ac);
  (Array.isArray(d.item_properties) ? d.item_properties : []).forEach(function (p) {
    if ((p || '').trim()) tags.push(p.trim());
  });
  const focus = Array.isArray(d.item_focus_classes) ? d.item_focus_classes.filter(Boolean) : [];
  if (focus.length) tags.push('Focus: ' + focus.join(', '));
  if (!tags.length) return '';
  const tagsHtml = tags.map(function (t) {
    return '<span class="monster-item-tag">' + escape_html(t) + '</span>';
  }).join('');
  return '<div class="monster-traits-section monster-tags-section">' +
    '<div class="monster-traits-header">Properties</div>' +
    '<div class="monster-traits-divider"></div>' +
    '<div class="monster-tags-row">' + tagsHtml + '</div></div>';
}

function card_generate_back_item(data, options, { isPreview }) {
  const d = data;
  const artUrl = (d.creature_artwork || '').trim();
  const artStyle = artUrl
    ? 'background-image:url(\'' + escape_html(artUrl).replace(/'/g, '%27') + '\');background-size:cover;background-position:center;background-repeat:no-repeat;'
    : '';
  const overlayStyle = 'background-image:' + item_bg_image_value(d) + ';background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0.5;';

  const detailsHtml = item_details_section_html(d);
  const descriptionHtml = item_description_section_html(d.item_description);
  const combatHtml = card_section_enabled(d, 'combat') ? item_combat_tags_html(d) : '';

  const cursed = card_section_enabled(d, 'curse');
  const curseText = (d.item_curse_text || '').trim();
  const curseHtml = cursed
    ? monster_traits_box_html('Curse', '<div class="monster-trait"><span class="monster-trait-desc">' + escape_html(curseText || 'This item is cursed.') + '</span></div>', 'item-curse-section')
    : '';

  const sentient = card_section_enabled(d, 'sentience');
  const sentientHtml = sentient ? item_sentience_section_html(d) : '';
  const sentientRoleplayHtml = sentient ? item_sentient_roleplay_section_html(d) : '';

  const featuresHtml = monster_entry_group_html(d, 'item_features', 'Benefits', 'features');
  const sections = [detailsHtml, descriptionHtml, featuresHtml, combatHtml, sentientHtml, sentientRoleplayHtml, curseHtml].filter(Boolean);
  const contentHtml = sections.length === 0 ? '' : '<div class="monster-back-content">' + sections.join('') + '</div>';
  const textureHtml = card_texture_overlay_html(true);

  return '<div class="monster-back-inner item-back-inner" style="' + artStyle + '">' +
    '<div class="monster-back-overlay" style="' + overlayStyle + '"></div>' +
    textureHtml +
    contentHtml +
    '</div>';
}

function card_generate_front_monster(data, options, { isPreview }) {
  const d = data;
  const artStyle = card_front_artwork_style(d);
  const innerStyle = 'background-image:' + monster_bg_image_value(d) + ';background-size:cover;background-position:center;background-repeat:no-repeat;';
  const textureHtml = card_texture_overlay_html(d && d.background_mode === 'gradient');

  const hpResult = (typeof window.monster_hp === 'function') ? window.monster_hp(d) : null;
  const hpVal = (hpResult && hpResult.total != null) ? String(hpResult.total) : (d.hp != null && d.hp !== '' ? String(d.hp) : '\u2014');
  const acVal = (typeof window.monster_ac === 'function') ? window.monster_ac(d) : (d.ac || '\u2014');
  const isCreatureCard = d.template === 'creature';
  // Creature: "Medium Humanoid (Goblinoid) \u00b7 Neutral Evil"; NPC: "Race \u2013 Class \u2013 Subclass"
  let subtitle = '';
  if (isCreatureCard) {
    const sizeType = [(d.size || '').trim(), (d.creature_type || '').trim()].filter(Boolean).join(' ');
    const withSub = sizeType + ((d.creature_subtype || '').trim() ? ' (' + d.creature_subtype.trim() + ')' : '');
    subtitle = [withSub, (d.alignment || '').trim()].filter(Boolean).join(' \u00b7 ');
  } else if (card_section_enabled(d, 'identity')) {
    subtitle = [
      (d.race || '').trim(),
      (d.npc_class || '').trim(),
      npc_subclass_display(d.npc_class, d.subclass),
      (d.roleplay_background || '').trim(),
      (d.alignment || '').trim()
    ].filter(Boolean).join(' \u2013 ');
  }
  const npcTitle = isCreatureCard ? '' : (d.npc_title || '').trim();
  const statsBlockFront = isCreatureCard
    ? '<div class="monster-stats-front">' + monster_stats_block_html(d) + '</div>'
    : '';

  // HP/AC badges follow the Defense & Health section (always on for Creatures).
  const showStats = monster_show_stats(d) && card_section_enabled(d, 'defense');
  const badgesHtml = showStats
    ? '<div class="monster-badges-overlay">' +
      '<span class="monster-hp-badge monster-badge-heart" title="Hit Points (average)"><span class="monster-badge-val">' + escape_html(String(hpVal)) + '</span></span>' +
      '<span class="monster-ac-badge monster-badge-shield" title="Armor Class"><span class="monster-badge-val">' + escape_html(String(acVal)) + '</span></span>' +
      '</div>'
    : '';

  // Hierarchy: name, then the epithet (gold italic), then race/class as a muted microline
  const headerBlock = '<div class="monster-header-block ' + (showStats ? 'header-align-left' : 'header-align-center') + '">' +
    '<div class="monster-header-main">' +
    (npcTitle ? '<p class="monster-npc-title npc-pretitle">' + escape_html(npcTitle) + '</p>' : '') +
    '<h2 class="monster-name">' + escape_html((d.title || '').toUpperCase()) + '</h2>' +
    (subtitle ? '<p class="monster-subtitle">' + escape_html(subtitle) + '</p>' : '') +
    '</div>' +
    '</div>';

  // Appearance is an NPC concept (lives in the Identity section now)
  const appearanceHtml = !isCreatureCard ? monster_appearance_section_html(d.appearance) : '';
  const frontAppearanceWrap = appearanceHtml
    ? '<div class="front-traits-container">' + appearanceHtml + '</div>'
    : '';
  const artCreditHtml = (d.creature_art_credit || '').trim()
    ? '<div class="monster-art-credit">' + escape_html(d.creature_art_credit.trim()) + '</div>'
    : '';
  const textHtml = '<div class="monster-text">' +
    headerBlock + statsBlockFront + frontAppearanceWrap + artCreditHtml +
    '</div>';

  const artworkHtml = '<div class="monster-artwork" style="' + artStyle + '">' + badgesHtml + '</div>';

  // Type background on whole card inner; text block has no fill (shows type bg through)
  return '<div class="monster-card-inner" style="' + innerStyle + '">' + textureHtml + artworkHtml + textHtml + '</div>';
}

function card_generate_front(data, options, { isPreview }) {
  var color = card_data_color_front(data, options);
  var style_color = card_generate_color_front_style(color, data, options);

  var width = options.card_width;
  var height = options.card_height;

  var back_bleed_width = options.back_bleed_width;
  var back_bleed_height = options.back_bleed_height;

  var card_width = "calc(" + width + " + " + back_bleed_width + ")";
  var card_height = "calc(" + height + " + " + back_bleed_height + ")";

  var card_style = isPreview ? add_size_to_style(style_color, width, height) : add_size_to_style(style_color, card_width, card_height);
  var card_content_style = isPreview ? '' : add_bleed_to_style();

  const cardClasses = ['card'];
  if (options.rounded_corners) cardClasses.push('rounded-corners');
  if (data.vertical_alignment_reference === 'content-area') cardClasses.push('valignref-content-area'); 

  const innerContent = (data.template === 'monster' || data.template === 'npc' || data.template === 'creature')
    ? card_generate_front_monster(data, options, { isPreview })
    : data.template === 'item'
    ? card_generate_front_item(data, options, { isPreview })
    : (data.header_show === 'none' ? '' : `<div class="card-header">
        ${card_element_title(data, options)}
        ${card_element_type(data, options)}
        ${card_element_icon(data, options)}
      </div>`) + card_generate_contents(data, options);

  return `<div class="${cardClasses.join(' ')}" ${card_style}>
    <div class="card-content" ${card_content_style}>
      ${innerContent}
    </div>
    <div>
      ${card_generate_crop_marks(data, options, { isPreview })}
    </div>
  </div>`;
}

/**
 * Item tags section ("Weapons" / "Loot"): the free-text field is split into
 * individual items (on '·', ',', ';' or newlines), each rendered as a
 * content-fit tag that wraps within the row.
 */
function monster_item_tags_section_html(headerText, value, extraTagsHtml) {
  const items = String(value || '').split(/[·,;\n]+/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  const extra = extraTagsHtml || '';
  if (!items.length && !extra) return '';
  const tags = items.map(function (item) {
    return '<span class="monster-item-tag">' + escape_html(item) + '</span>';
  }).join('');
  return '<div class="monster-traits-section monster-tags-section">' +
    '<div class="monster-traits-header">' + escape_html(headerText) + '</div>' +
    '<div class="monster-traits-divider"></div>' +
    '<div class="monster-tags-row">' + tags + extra + '</div></div>';
}

/** Coin tags (PP → CP) appended to the Loot tag row; only non-zero amounts show. */
function npc_weapon_resolved_ability(card, weapon) {
  const ability = String(weapon && weapon.attack_ability || 'auto').trim().toLowerCase();
  if (monster_action_ability_label(ability)) return ability;
  const strMod = monster_action_numeric_mod(card.str);
  const dexMod = monster_action_numeric_mod(card.dex);
  return dexMod > strMod ? 'dex' : 'str';
}

function npc_weapon_bonus_text(card, weapon) {
  const override = String(weapon && weapon.attack_bonus_override || '').trim();
  if (override) return override.charAt(0) === '+' || override.charAt(0) === '-' ? override : '+' + override;
  const ability = npc_weapon_resolved_ability(card, weapon);
  const pb = typeof window.monster_effective_pb === 'function'
    ? window.monster_effective_pb(card)
    : (typeof window.monster_pb === 'function' ? window.monster_pb(card.challenge_rating) : 2);
  const total = monster_action_numeric_mod(card[ability]) + pb;
  return total >= 0 ? '+' + total : String(total);
}

function npc_weapon_damage_text(card, weapon) {
  const dice = String(weapon && weapon.damage_dice || '').trim();
  const damageAbility = String(weapon && weapon.damage_ability || 'auto').trim().toLowerCase();
  const type = monster_action_damage_type_text(weapon && weapon.damage_type || '');
  let formula = dice;
  if (dice && damageAbility !== 'none') {
    const ability = monster_action_ability_label(damageAbility)
      ? damageAbility
      : npc_weapon_resolved_ability(card, weapon);
    const mod = monster_action_numeric_mod(card[ability]);
    if (mod > 0) formula += '+' + mod;
    else if (mod < 0) formula += String(mod);
  }
  return [formula, type].filter(Boolean).join(' ');
}

function npc_detailed_weapon_tags_html(d) {
  const weapons = Array.isArray(d.npc_weapons_detailed) ? d.npc_weapons_detailed : [];
  const visibleWeapons = weapons.filter(function (weapon) {
    return weapon && [weapon.name, weapon.item_tag, weapon.attack_bonus_override, weapon.damage_dice, weapon.damage_type, weapon.notes].some(function (value) {
      return String(value || '').trim();
    });
  });
  if (!visibleWeapons.length) return '';
  const rows = visibleWeapons.map(function (weapon) {
    const name = String(weapon.name || '').trim() || 'Unnamed Weapon';
    const itemTag = String(weapon.item_tag || '').trim();
    const hasReferenceTag = itemTag === 'magic-item' || itemTag === 'quest-item';
    const tagClass = hasReferenceTag ? (' npc-weapon-detail-tag-tagged monster-related-row rel-row-' + itemTag) : '';
    const glyph = npc_inventory_reference_glyph_html(itemTag);
    const hit = npc_weapon_bonus_text(d, weapon);
    const damage = npc_weapon_damage_text(d, weapon);
    const meta = [hit, damage].filter(Boolean).join(', ');
    const notes = String(weapon.notes || '').trim();
    return '<span class="monster-item-tag npc-weapon-detail-tag' + tagClass + '">' +
      glyph +
      '<span class="npc-weapon-detail-name">' + escape_html(name) + '</span>' +
      (meta ? '<span class="npc-weapon-detail-meta">(' + escape_html(meta) + ')</span>' : '') +
      (notes ? '<span class="npc-weapon-detail-notes">' + escape_html(notes) + '</span>' : '') +
      '</span>';
  }).join('');
  return rows;
}

function npc_inventory_reference_glyph_html(itemTag) {
  const tag = String(itemTag || '').trim();
  if (tag !== 'magic-item' && tag !== 'quest-item') return '';
  return '<span class="monster-related-glyph rel-tag-' + tag + '">' + (MONSTER_REL_ICONS[tag] || MONSTER_REL_ICONS['default']) + '</span>';
}

function npc_detailed_loot_tags_html(d) {
  const items = Array.isArray(d.npc_loot_detailed) ? d.npc_loot_detailed : [];
  return items.filter(function (item) {
    return item && [item.name, item.item_tag, item.notes].some(function (value) {
      return String(value || '').trim();
    });
  }).map(function (item) {
    const name = String(item.name || '').trim() || 'Unnamed Item';
    const notes = String(item.notes || '').trim();
    const itemTag = String(item.item_tag || '').trim();
    const hasReferenceTag = itemTag === 'magic-item' || itemTag === 'quest-item';
    const tagClass = hasReferenceTag ? (' npc-loot-detail-tag-tagged monster-related-row rel-row-' + itemTag) : '';
    const glyph = npc_inventory_reference_glyph_html(itemTag);
    return '<span class="monster-item-tag npc-loot-detail-tag' + tagClass + '">' +
      glyph +
      '<span class="npc-loot-detail-name">' + escape_html(name) + '</span>' +
      (notes ? '<span class="npc-loot-detail-notes">' + escape_html(notes) + '</span>' : '') +
      '</span>';
  }).join('');
}

function monster_coin_tags_html(d) {
  const coins = [
    ['pp', 'PP', d.currency_pp],
    ['gp', 'GP', d.currency_gp],
    ['ep', 'EP', d.currency_ep],
    ['sp', 'SP', d.currency_sp],
    ['cp', 'CP', d.currency_cp]
  ];
  return coins.filter(function (c) {
    const v = String(c[2] == null ? '' : c[2]).trim();
    return v !== '' && Number(v) > 0;
  }).map(function (c) {
    return '<span class="monster-item-tag monster-coin-tag">' +
      '<img class="monster-coin-img" src="assets/coins/' + c[0] + '.png" alt="' + c[1] + '" title="' + c[1] + '">' +
      '<span>' + escape_html(String(c[2]).trim()) + ' ' + c[1].toLowerCase() + '</span>' +
      '</span>';
  }).join('');
}

/** Small solid glyphs for the reference categories (fill follows text color). */
const MONSTER_REL_ICONS = {
  'stat-block': '<svg class="monster-rel-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 L20 5 V11 C20 17 16.4 20.8 12 22 C7.6 20.8 4 17 4 11 V5 Z"/></svg>',
  'companion': '<svg class="monster-rel-icon" viewBox="0 0 24 24"><circle fill="currentColor" cx="5.4" cy="9" r="2.3"/><circle fill="currentColor" cx="9.7" cy="5.8" r="2.4"/><circle fill="currentColor" cx="14.3" cy="5.8" r="2.4"/><circle fill="currentColor" cx="18.6" cy="9" r="2.3"/><path fill="currentColor" d="M12 10.2 C15.2 10.2 18.2 13 18.2 15.9 C18.2 18.2 16.5 19.3 14.8 18.8 C13.5 18.4 12.8 18.1 12 18.1 C11.2 18.1 10.5 18.4 9.2 18.8 C7.5 19.3 5.8 18.2 5.8 15.9 C5.8 13 8.8 10.2 12 10.2 Z"/></svg>',
  'magic-item': '<svg class="monster-rel-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1.5 L14.5 9.5 L22.5 12 L14.5 14.5 L12 22.5 L9.5 14.5 L1.5 12 L9.5 9.5 Z"/></svg>',
  'quest-item': '<svg class="monster-rel-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2.5 H18 V21.5 L12 16.8 L6 21.5 Z"/></svg>',
  'default': '<svg class="monster-rel-icon" viewBox="0 0 24 24"><circle fill="currentColor" cx="12" cy="12" r="7.5"/></svg>'
};

/** References section: legend of categories present, then icon + name rows. */
function monster_related_cards_section_html(d) {
  const REL_LABELS = {
    'stat-block': 'Stat Block',
    'companion': 'Companion',
    'magic-item': 'Magic Item',
    'quest-item': 'Quest Item'
  };
  const REL_ORDER = ['stat-block', 'companion', 'magic-item', 'quest-item'];
  const list = (Array.isArray(d.related_cards) ? d.related_cards : [])
    .filter(function (r) { return r && (r.name || '').trim(); });
  if (!list.length) return '';

  const rows = list.map(function (r) {
    const type = (r.type || '').trim();
    const rowClass = type && REL_LABELS[type] ? ('rel-row-' + type) : 'rel-row-default';
    const tagClass = type && REL_LABELS[type] ? ('rel-tag-' + type) : 'rel-tag-default';
    const icon = MONSTER_REL_ICONS[type] || MONSTER_REL_ICONS['default'];
    return '<div class="monster-related-row ' + rowClass + '">' +
      '<span class="monster-related-glyph ' + tagClass + '">' + icon + '</span>' +
      '<span class="monster-related-name">' + escape_html(r.name.trim()) + '</span>' +
      '<span class="monster-related-arrow">›</span>' +
      '</div>';
  }).join('');

  // Legend: only the categories actually referenced, in fixed order
  const present = REL_ORDER.filter(function (t) {
    return list.some(function (r) { return (r.type || '').trim() === t; });
  });
  const legendHtml = present.length
    ? '<div class="monster-related-legend">' + present.map(function (t) {
        return '<span class="monster-legend-item rel-tag-' + t + '">' + MONSTER_REL_ICONS[t] +
          '<span>' + escape_html(REL_LABELS[t]) + '</span></span>';
      }).join('') + '</div>'
    : '';

  return '<div class="monster-traits-section monster-related-section">' +
    '<div class="monster-traits-header">References</div>' +
    '<div class="monster-traits-divider"></div>' +
    '<div class="monster-related-list">' + legendHtml + rows + '</div></div>';
}

function card_generate_back_monster(data, options, { isPreview }) {
  const d = data;
  const artUrl = (d.creature_artwork || '').trim();
  const artStyle = artUrl
    ? 'background-image:url(\'' + escape_html(artUrl).replace(/'/g, '%27') + '\');background-size:cover;background-position:center;background-repeat:no-repeat;'
    : '';
  const overlayStyle = 'background-image:' + monster_bg_image_value(d) + ';background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0.5;';

  const isCreatureCard = d.template === 'creature';
  // Stat block always appears on the NPC back. Creature stats live on the front.
  const statsBlock = !isCreatureCard
    ? '<div class="monster-stats-top">' + monster_stats_block_html(d) + '</div>'
    : '';

  let sections;
  if (isCreatureCard) {
    // Creature back: trait/action groups below the stat block
    sections = [
      monster_entry_group_html(d, 'traits', 'Traits', 'traits'),
      monster_entry_group_html(d, 'actions', 'Actions', 'actions'),
      monster_entry_group_html(d, 'bonus_actions', 'Bonus Actions', 'bonus_actions'),
      monster_entry_group_html(d, 'reactions', 'Reactions', 'reactions'),
      monster_entry_group_html(d, 'legendary_actions', 'Legendary Actions', 'legendary_actions')
    ].filter(Boolean);
  } else {
    const roleplayFields = [
      ['Personality', d.roleplay_personality, 'personality'],
      ['Quirk', d.roleplay_quirk, 'quirk'],
      ['Flaw', d.roleplay_flaw, 'flaw'],
      ['Goal', d.roleplay_goal, 'goal']
    ];
    const roleplayItems = roleplayFields.filter(function (f) { return (f[1] || '').trim(); }).map(function (f) {
      return '<div class="monster-trait monster-rp-' + f[2] + '"><strong class="monster-trait-name">' + escape_html(f[0]) + '</strong><span class="monster-trait-desc"> ' + escape_html((f[1] || '').trim()) + '</span></div>';
    }).join('');
    const roleplayHtml = (roleplayItems && card_section_enabled(d, 'roleplay')) ? monster_traits_box_html('Roleplay', roleplayItems, 'monster-roleplay-section') : '';

    const showInventory = card_section_enabled(d, 'inventory');
    const weaponsHtml = showInventory ? monster_item_tags_section_html('Weapons', d.inventory_weapons, npc_detailed_weapon_tags_html(d)) : '';
    const lootHtml = showInventory ? monster_item_tags_section_html('Loot', d.inventory_loot, npc_detailed_loot_tags_html(d) + monster_coin_tags_html(d)) : '';
    const relatedHtml = card_section_enabled(d, 'related') ? monster_related_cards_section_html(d) : '';
    sections = [
      roleplayHtml,
      monster_entry_group_html(d, 'actions', 'Actions', 'actions'),
      monster_entry_group_html(d, 'bonus_actions', 'Bonus Actions', 'bonus_actions'),
      monster_entry_group_html(d, 'reactions', 'Reactions', 'reactions'),
      monster_entry_group_html(d, 'legendary_actions', 'Legendary Actions', 'legendary_actions'),
      weaponsHtml,
      lootHtml,
      relatedHtml
    ].filter(Boolean);
  }
  const contentHtml = sections.length === 0 ? '' : '<div class="monster-back-content">' + sections.join('') + '</div>';

  // Appearance lives here on the back by default; when the back content doesn't
  // fit, the .appearance-front class hides this copy and shows the front one.
  const overflowAppearance = !isCreatureCard ? monster_appearance_section_html(d.appearance) : '';
  const overflowAppearanceHtml = overflowAppearance
    ? '<div class="back-overflow-traits">' + overflowAppearance + '</div>'
    : '';
  const textureHtml = card_texture_overlay_html(d && d.background_mode === 'gradient');

  return '<div class="monster-back-inner" style="' + artStyle + '">' +
    '<div class="monster-back-overlay" style="' + overlayStyle + '"></div>' +
    textureHtml +
    statsBlock +
    overflowAppearanceHtml +
    contentHtml +
    '</div>';
}

function card_generate_back_html({
  renderInner = true,
  customBackContent = '',
  card_style = '',
  corners_class = '',
  card_content_style = '',
  card_background_style = '',
  icon_container,
  icon_container_style,
  icon,
  icon_style,
  crop_marks = ''
}) {
  let card = `<div class="card ${corners_class}" ${card_style}>`;

  card += `<div class="card-content" ${card_content_style}>`;
  card += `<div class="card-back ${customBackContent ? 'card-back-monster' : ''}" ${card_background_style}>`;

  if (customBackContent) {
    card += customBackContent;
  } else if (renderInner) {
    card += `
      <div class="card-back-inner">
        <div class="card-back-icon card-back-icon-${icon_container}" ${icon_container_style}>
          <div class="icon-${icon}" ${icon_style}></div>
        </div>
      </div>
    `;
  }

  card += `</div>`;
  card += `</div>`;

  if (crop_marks) {
    card += `<div>${crop_marks}</div>`;
  }

  card += `</div>`;

  return card;
}


function card_generate_back(data, options, { isPreview }) {
  var color = card_data_color_back(data, options);
  var style_color = card_generate_color_back_style(color, data, options);

  var width = options.card_width;
  var height = options.card_height;

  var back_bleed_width = options.back_bleed_width;
  var back_bleed_height = options.back_bleed_height;

  var card_width = "calc(" + width + " + " + back_bleed_width + ")";
  var card_height = "calc(" + height + " + " + back_bleed_height + ")";

  var card_style = isPreview ? add_size_to_style(style_color, width, height) : add_size_to_style(style_color, card_width, card_height);

  var isMonster = data.template === 'monster' || data.template === 'npc' || data.template === 'creature' || data.template === 'item';
  var customBackContent = data.template === 'item'
    ? card_generate_back_item(data, options, { isPreview })
    : (isMonster ? card_generate_back_monster(data, options, { isPreview }) : '');

  var iconContainerSize = 0;
  if (!isMonster) {
    const $tmpCard = $(card_generate_back_html({ card_style }));
    const $tmpCardContainer = $('<div style="position:absolute;visibility:hidden;pointer-events:none;"></div>');
    $("#preview-container").append($tmpCardContainer.append($tmpCard));
    var $tmpCardInner = $tmpCard.find(".card-back-inner");
    var innerWidth = $tmpCardInner.width();
    var innerHeight = $tmpCardInner.height();
    iconContainerSize = Math.min(innerWidth, innerHeight) / 2;
    $tmpCardContainer.remove();
  }

  var url = data.background_image;
  var card_background_style = "";
  if (isMonster) {
    card_background_style = "";
  } else if (url) {
    card_background_style = `style="background-image: url(&quot;${url}&quot;); background-size: contain; background-position: center; background-repeat: no-repeat;"`;
  } else {
    card_background_style = card_generate_color_gradient_style(color, options);
  }
  var icon = card_data_icon_back(data, options);
  var icon_container = card_data_icon_back_container(data, options);

  var icon_container_style = add_size_to_style(card_generate_back_icon_container_style(color, data, options), `${iconContainerSize}px`, `${iconContainerSize}px`);
  var icon_style = card_generate_back_icon_style(color, data, options);

  var card_content_style = isPreview ? '' : add_bleed_to_style();

  return card_generate_back_html({
    renderInner: !isMonster && !url,
    customBackContent: isMonster ? customBackContent : '',
    card_style,
    corners_class: options.rounded_corners  ? "rounded-corners" : "",
    card_content_style,
    card_background_style,
    url,
    icon_container,
    icon_container_style,
    icon,
    icon_style,
    crop_marks: card_generate_crop_marks(data, options, { isPreview })
  });
}

function card_generate_empty(count, options, is_back) {
  var card_width = options.card_width;
  var card_height = options.card_height;

    var style_color = card_generate_color_back_style("white");
    var back_bleed_width = options.back_bleed_width;
    var back_bleed_height = options.back_bleed_height;
    card_width = "calc(" + card_width + " + " + back_bleed_width + ")";
    card_height = "calc(" + card_height + " + " + back_bleed_height + ")";

  var card_style = add_size_to_style(style_color, card_width, card_height);
  var result = "";
  var back_front_class = is_back ? "back" : "front";
  result +=
    '<div class="card empty ' + back_front_class + '" ' + card_style + ">";
  result += card_generate_crop_marks({}, options);
  result += "</div>";

  return card_repeat(result, count);
}

// ============================================================================
// Functions that generate pages of cards
// ============================================================================

function card_pages_split(data, rows, cols) {
  var cards_per_page = rows * cols;
  var result = [];
  for (var i = 0; i < data.length; i += cards_per_page) {
    var page = data.slice(i, i + cards_per_page);
    result.push(page);
  }
  return result;
}

function card_pages_merge(front_pages, back_pages) {
  var result = [];
  for (var i = 0; i < front_pages.length; ++i) {
    result.push(front_pages[i]);
    result.push(back_pages[i]);
  }
  return result;
}

function card_pages_add_padding(cards, options, is_back) {
  var cards_per_page = options.page_rows * options.page_columns;
  var last_page_cards = cards.length % cards_per_page;
  if (last_page_cards !== 0) {
    return cards.concat(
      card_generate_empty(cards_per_page - last_page_cards, options, is_back)
    );
  } else {
    return cards;
  }
}

function card_pages_interleave_cards(front_cards, back_cards, options) {
  var result = [];
  var i = 0;
  while (i < front_cards.length) {
    result.push(front_cards[i]);
    result.push(back_cards[i]);
    if (options.page_columns > 2) {
      result.push(
        card_generate_empty(options.page_columns - 2, options, false)
      );
    }
    ++i;
  }
  return result;
}

function card_pages_interleave_cards_alt(front_cards, back_cards, options) {
  var result = [];
  var i = 0;
  while (i < front_cards.length) {
    if (i % 2) {
      result.push(back_cards[i]);
      result.push(front_cards[i]);
    } else {
      result.push(front_cards[i]);
      result.push(back_cards[i]);
    }
    if (options.page_columns > 2) {
      result.push(
        card_generate_empty(options.page_columns - 2, options, false)
      );
    }
    ++i;
  }
  return result;
}

function card_pages_wrap(pages, options) {
  // force portrait layout then rotate if landscape
  var orientation = getOrientation(options.page_width, options.page_height);
  var pageWidth = options.page_width;
  var pageHeight = options.page_height;

  var result = "";
  for (var i = 0; i < pages.length; ++i) {
    var style = 'style="';
    if (options.card_arrangement === "doublesided" && i % 2 === 1) {
      style += "background-color:" + options.background_color + ";";
    } else {
      style += "background-color:" + options.foreground_color + ";";
    }
    if (options.page_margin && options.page_margin !== '0in') {
      style += "padding:" + options.page_margin + ";";
    }
    style += '"';
    style = add_size_to_style(
      style,
      pageWidth,
      pageHeight
    );

    var zw = options.page_zoom_width / 100;
    var zh = options.page_zoom_height / 100;
    var zoomStyle = 'style="';
    zoomStyle += `transform: scale(${zw}, ${zh});`;
    if (options.card_arrangement === "doublesided" && i % 2 === 1) {
      zoomStyle += "flex-direction:" + "row-reverse" + ";";
    }
    zoomStyle += '"';
    zoomStyle = add_size_to_style(
      zoomStyle,
      `calc((${options.card_width} + ${options.back_bleed_width}) * ${options.page_columns})`,
      `calc((${options.card_height} + ${options.back_bleed_height}) * ${options.page_rows})`
    );

    result +=
      '<page class="page page-preview ' + orientation + '" ' + style + ">\n";
    result += '<div class="page-zoom page-zoom-preview" ' + zoomStyle + ">\n";
    result += pages[i].join("\n");
    result += "</div>\n";
    result += "</page>\n";
  }
  return result;
}

function card_pages_generate_style(options) {
  const page_width = options.page_width;
  const page_height = options.page_height;
  const portrait = parseFloat(page_width) < parseFloat(page_height);
  const pw = portrait ? page_width : page_height;
  const ph = portrait ? page_height : page_width;

  var result = `
  @page {
      margin: 0;
      size:${pw} ${ph};
      print-color-adjust: exact;
  }
  `;

  return `<style>${result}</style>`;
}

function card_pages_generate_html(card_data, options) {
  const defaultOptions = default_card_options();
  options = options || defaultOptions;
  var rows = options.page_rows || defaultOptions.page_rows;
  var cols = options.page_columns || defaultOptions.page_columns;

  // Generate the HTML for each card
  var front_cards = [];
  var back_cards = [];
  card_data.forEach(function (data, i) {
    var count = options.card_count || data.count || 1;
    var front = card_generate_front(data, options, { isPreview: false });
    var back = card_generate_back(data, options, { isPreview: false });
    front_cards = front_cards.concat(card_repeat(front, count));
    back_cards = back_cards.concat(card_repeat(back, count));
  });

  var pages = [];
  if (options.card_arrangement === "doublesided") {
    // Add padding cards so that the last page is full of cards
    front_cards = card_pages_add_padding(front_cards, options, false);
    back_cards = card_pages_add_padding(back_cards, options, true);
    // Split cards to pages
    var front_pages = card_pages_split(front_cards, rows, cols);
    var back_pages = card_pages_split(back_cards, rows, cols);
    // Interleave front and back pages so that we can print double-sided
    pages = card_pages_merge(front_pages, back_pages);
  } else if (options.card_arrangement === "front_only") {
    var cards = card_pages_add_padding(front_cards, options, false);
    pages = card_pages_split(cards, rows, cols);
  } else if (options.card_arrangement === "side_by_side") {
    var cards = card_pages_interleave_cards(front_cards, back_cards, options);
    cards = card_pages_add_padding(cards, options, false);
    pages = card_pages_split(cards, rows, cols);
  } else if (options.card_arrangement === "side_by_side_alt") {
    var cards = card_pages_interleave_cards_alt(
      front_cards,
      back_cards,
      options
    );
    cards = card_pages_add_padding(cards, options, false);
    pages = card_pages_split(cards, rows, cols);
  }

  return {
    style: card_pages_generate_style(options),
    html: card_pages_wrap(pages, options),
    pages
  };
}
