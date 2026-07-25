/**
 * Monster card computed values and option lists.
 * Used by cards.js for rendering and by the form for dropdowns.
 */

(function (window) {
  'use strict';

  const MONSTER_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

  const MONSTER_ALIGNMENTS = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
  ];

  const MONSTER_TYPES = [
    'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon',
    'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity',
    'Ooze', 'Plant', 'Undead'
  ];

  const MONSTER_AC_TYPES = [
    { value: 'natural', label: 'Natural Armor (10 + PB + DEX)' },
    { value: 'light_natural', label: 'Light Natural Armor ((PB/2) + DEX)' },
    { value: 'heavy_natural', label: 'Heavy Natural Armor ((PB*2) + DEX)' },
    { value: 'padded', label: 'Padded (11 + DEX)' },
    { value: 'leather', label: 'Leather (11 + DEX)' },
    { value: 'studded', label: 'Studded Leather (12 + DEX)' },
    { value: 'hide', label: 'Hide (12 + DEX, max 2)' },
    { value: 'chain_shirt', label: 'Chain Shirt (13 + DEX, max 2)' },
    { value: 'scale_mail', label: 'Scale Mail (14 + DEX, max 2)' },
    { value: 'spiked_armor', label: 'Spiked Armor (14 + DEX, max 2)' },
    { value: 'breastplate', label: 'Breastplate (14 + DEX, max 2)' },
    { value: 'halfplate', label: 'Half Plate (15 + DEX, max 2)' },
    { value: 'ring_mail', label: 'Ring Mail (14)' },
    { value: 'chain_mail', label: 'Chain Mail (16)' },
    { value: 'splint', label: 'Splint (17)' },
    { value: 'plate', label: 'Plate (18)' },
    { value: 'mage_armor', label: 'Mage Armor (13 + DEX)' },
    { value: 'unarmored_wis', label: 'Unarmored Defense (WIS) (10 + DEX + WIS)' },
    { value: 'unarmored_con', label: 'Unarmored Defense (CON) (10 + CON + WIS)' },
    { value: 'unarmored_cha', label: 'Unarmored Defense (CHA) (10 + CHA + WIS)' },
    { value: 'custom', label: 'Custom AC' }
  ];

  const MONSTER_VIGOR = [
    { value: 'weak', label: 'Weak' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'powerful', label: 'Powerful' }
  ];

  const DAMAGE_TYPES = [
    'Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning',
    'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'
  ];

  const CONDITION_IMMUNITIES_LIST = [
    'Bleeding', 'Blinded', 'Burning', 'Charmed', 'Cursed', 'Deadened',
    'Dehydration', 'Diseased', 'Exhaustion', 'Falling', 'Frightened',
    'Grappled', 'Incapacitated', 'Invisible', 'Malnutrition', 'Paralyzed',
    'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Silenced',
    'Stunned', 'Suffocation', 'Surprised', 'Transformed', 'Unconscious'
  ];

  const SAVING_THROW_ABILITIES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

  const SKILLS = [
    { id: 'acrobatics', ability: 'dex', label: 'Acrobatics' },
    { id: 'animal_handling', ability: 'wis', label: 'Animal Handling' },
    { id: 'arcana', ability: 'int', label: 'Arcana' },
    { id: 'athletics', ability: 'str', label: 'Athletics' },
    { id: 'deception', ability: 'cha', label: 'Deception' },
    { id: 'history', ability: 'int', label: 'History' },
    { id: 'insight', ability: 'wis', label: 'Insight' },
    { id: 'intimidation', ability: 'cha', label: 'Intimidation' },
    { id: 'investigation', ability: 'int', label: 'Investigation' },
    { id: 'medicine', ability: 'wis', label: 'Medicine' },
    { id: 'nature', ability: 'int', label: 'Nature' },
    { id: 'perception', ability: 'wis', label: 'Perception' },
    { id: 'performance', ability: 'cha', label: 'Performance' },
    { id: 'persuasion', ability: 'cha', label: 'Persuasion' },
    { id: 'religion', ability: 'int', label: 'Religion' },
    { id: 'sleight_of_hand', ability: 'dex', label: 'Sleight of Hand' },
    { id: 'stealth', ability: 'dex', label: 'Stealth' },
    { id: 'survival', ability: 'wis', label: 'Survival' }
  ];

  const PROFICIENCY_LEVELS = [
    { value: 'none', label: 'Not Proficient' },
    { value: 'proficient', label: 'Proficient' },
    { value: 'half', label: 'Half Proficient' },
    { value: 'expertise', label: 'Expertise' }
  ];

  const LANGUAGES_LIST = [
    'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc',
    'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 'Primordial',
    'Aquan', 'Auran', 'Ignan', 'Terran', 'Sylvan', 'Undercommon'
  ];

  function parseNum(v, def) {
    if (v === '' || v === null || v === undefined) return def;
    const n = Number(v);
    return isNaN(n) ? def : n;
  }

  /** Proficiency Bonus = MAX(FLOOR((CR - 1) / 4), 0) + 2. CR can be 0, 0.125, 0.25, 0.5, 1..30 */
  function monster_pb(cr) {
    const c = parseNum(cr, 0);
    return Math.max(0, Math.floor((c - 1) / 4)) + 2;
  }

  function monster_level_pb(level) {
    const levelNum = parseNum(level, 0);
    if (levelNum <= 0) return 2;
    return Math.min(6, Math.max(2, Math.ceil(levelNum / 4) + 1));
  }

  function monster_effective_pb(d) {
    if (d && d.template === 'npc' && !String(d.challenge_rating || '').trim() && String(d.level || '').trim()) {
      return monster_level_pb(d.level);
    }
    return monster_pb(d ? d.challenge_rating : '');
  }

  /** Ability modifier = (score - 10) / 2, floored */
  function monster_ability_mod(score) {
    const n = parseNum(score, 10);
    return Math.floor((n - 10) / 2);
  }

  /** Die average by size (for HP formula) */
  function davgBySize(size) {
    const s = (size || '').toLowerCase();
    if (s === 'tiny') return 2.5;
    if (s === 'small') return 3.5;
    if (s === 'medium') return 4.5;
    if (s === 'large') return 5.5;
    if (s === 'huge') return 6.5;
    if (s === 'gargantuan') return 10.5;
    return 4.5;
  }

  /** Die size for display (d4, d6, ...) */
  function dieSizeBySize(size) {
    const s = (size || '').toLowerCase();
    if (s === 'tiny') return 4;
    if (s === 'small') return 6;
    if (s === 'medium') return 8;
    if (s === 'large') return 10;
    if (s === 'huge') return 12;
    if (s === 'gargantuan') return 20;
    return 8;
  }

  /**
   * HP formula: average (healthy), or HP override. Total HP rounded up unless override.
   * When hp_override is set: target HP is given; numDice = round(target/k), flat = target - numDice*k.
   * Returns { numDice, total, display } or { display: 'INVALID...' }.
   */
  function monster_hp(d) {
    const m = monster_ability_mod(d.con);
    const size = d.size || 'Medium';
    const davg = davgBySize(size);
    const k = davg + m;

    if (k <= 0) {
      return { display: 'INVALID (die avg + CON mod must be > 0)' };
    }

    const dieSize = dieSizeBySize(size);
    const override = parseNum(d.hp_override, 0);

    if (override > 0) {
      const numDice = Math.max(1, Math.round(override / k));
      const flat = override - numDice * (davg + m);
      const conStr = flat >= 0 ? '+' + flat : String(flat);
      const display = override + ' (' + numDice + 'd' + dieSize + conStr + ')';
      return { numDice, total: override, display };
    }

    const c = parseNum(d.challenge_rating, 0);
    let minhp, maxhp;
    if (c < 2) {
      if (c <= 0) { minhp = 1; maxhp = 6; }
      else if (c <= 0.125) { minhp = 7; maxhp = 35; }
      else if (c <= 0.25) { minhp = 36; maxhp = 49; }
      else if (c <= 0.5) { minhp = 50; maxhp = 70; }
      else { minhp = 71; maxhp = 85; }
    } else {
      minhp = 15 * c + 56 + 30 * Math.max(0, c - 20);
      maxhp = 15 * c + 70 + 30 * Math.max(0, c - 19);
    }

    const avghp = Math.round((minhp + maxhp) / 2);
    const xguess = Math.round(avghp / k);
    const xmin = Math.max(1, Math.ceil(minhp / k));
    const xmax = Math.max(1, Math.floor(maxhp / k));

    if (xmin > xmax) {
      return { display: 'NO SOLUTION (change size/CON or accept out-of-band)' };
    }

    const numDice = Math.min(Math.max(xguess, xmin), xmax);
    const total = Math.max(1, Math.ceil(numDice * (davg + m)));
    const conPart = numDice * m;
    const conStr = conPart >= 0 ? '+' + conPart : String(conPart);
    const display = total + ' (' + numDice + 'd' + dieSize + conStr + ')';

    return { numDice, total, display };
  }

  /** Compute AC from ac_type (+ equipped_armor_type / unarmored_defense_type), then add ac_bonus and +2 if wearing_shield. */
  function monster_ac(d) {
    const pb = monster_effective_pb(d);
    const dexMod = monster_ability_mod(d.dex);
    const conMod = monster_ability_mod(d.con);
    const wisMod = monster_ability_mod(d.wis);
    const chaMod = monster_ability_mod(d.cha);
    const type = (d.ac_type || '').toLowerCase();

    let base = null;

    if (d.custom_ac_override !== '' && d.custom_ac_override != null) {
      base = parseNum(d.custom_ac_override, 0);
    } else if (type === 'equipped') {
      const armor = (d.equipped_armor_type || '').toLowerCase();
      switch (armor) {
        case 'padded': case 'leather': base = 11 + dexMod; break;
        case 'studded': case 'hide': base = 12 + Math.min(dexMod, 2); break;
        case 'chain_shirt': base = 13 + Math.min(dexMod, 2); break;
        case 'scale_mail': case 'spiked_armor': case 'breastplate': base = 14 + Math.min(dexMod, 2); break;
        case 'halfplate': base = 15 + Math.min(dexMod, 2); break;
        case 'ring_mail': base = 14; break;
        case 'chain_mail': base = 16; break;
        case 'splint': base = 17; break;
        case 'plate': base = 18; break;
        default: base = armor ? (10 + dexMod) : null;
      }
    } else if (type === 'unarmored_defense') {
      const def = (d.unarmored_defense_type || '').toLowerCase();
      if (def === 'wis' || def === 'wisdom (monk)') base = 10 + dexMod + wisMod;
      else if (def === 'cha' || def === 'charisma (bard)') base = 10 + dexMod + chaMod;
      else if (def === 'con' || def === 'constitution (barbarian)') base = 10 + conMod + wisMod;
      else base = def ? (10 + dexMod) : null;
    } else if (type === 'natural' || type === 'natural armor') {
      const nat = (d.natural_armor_type || 'regular').toLowerCase();
      if (nat === 'light') base = Math.floor(pb / 2) + dexMod + 10;
      else if (nat === 'heavy') base = (pb * 2) + dexMod + 10;
      else base = pb + dexMod + 10;
    } else if (type === 'mage_armor' || type === 'mage armor') {
      base = 13 + dexMod;
    } else if (type) {
      base = 10 + dexMod;
    }

    if (base == null) return '';
    const shield = (d.wearing_shield === true || d.wearing_shield === 'true' || d.wearing_shield === '1') ? 2 : 0;
    return String(base + shield);
  }

  /** Build speed string from walk, burrow, climb, fly, swim, hover. */
  function monster_speed_string(d) {
    const parts = [];
    const walk = parseNum(d.walk_speed, 0);
    if (walk > 0) parts.push(walk + ' ft.');
    const burrow = parseNum(d.burrow_speed, 0);
    if (burrow > 0) parts.push('burrow ' + burrow + ' ft.');
    const climb = parseNum(d.climb_speed, 0);
    if (climb > 0) parts.push('climb ' + climb + ' ft.');
    const fly = parseNum(d.fly_speed, 0);
    if (fly > 0) parts.push('fly ' + fly + ' ft.' + (d.hover ? ' (hover)' : ''));
    const swim = parseNum(d.swim_speed, 0);
    if (swim > 0) parts.push('swim ' + swim + ' ft.');
    return parts.length ? parts.join(', ') : '';
  }

  /** Saving throws: only proficiencies, format "Str +3, Dex +4". */
  function monster_saving_throws(d) {
    const list = d.saving_throw_proficiencies;
    const arr = Array.isArray(list) ? list : (typeof list === 'string' && list ? list.split(',').map(function (s) { return s.trim(); }) : []);
    if (!arr.length) return '';
    const abbr = { strength: 'Str', dexterity: 'Dex', constitution: 'Con', intelligence: 'Int', wisdom: 'Wis', charisma: 'Cha' };
    const keys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const stats = [d.str, d.dex, d.con, d.int, d.wis, d.cha];
    const pb = monster_effective_pb(d);
    const parts = [];
    keys.forEach(function (key, i) {
      if (arr.indexOf(key) !== -1 || arr.indexOf(abbr[key]) !== -1) {
        const mod = monster_ability_mod(stats[i]);
        const total = mod + pb;
        const sign = total >= 0 ? '+' : '';
        parts.push(abbr[key] + ' ' + sign + total);
      }
    });
    return parts.join(', ');
  }

  /** Skill bonus for one skill: ability mod + (0 | PB | PB/2 | PB*2). */
  function skillBonus(d, skillKey, level) {
    const skill = SKILLS.find(function (s) { return s.id === skillKey; });
    if (!skill) return null;
    const mod = monster_ability_mod(d[skill.ability]);
    const pb = monster_effective_pb(d);
    let add = 0;
    if (level === 'proficient') add = pb;
    else if (level === 'half') add = Math.floor(pb / 2);
    else if (level === 'expertise') add = pb * 2;
    return mod + add;
  }

  /** Build skills string: only skills not "none", e.g. "Perception +5, Stealth +4". */
  function monster_skills_string(d) {
    const parts = [];
    SKILLS.forEach(function (s) {
      const level = (d['skill_' + s.id] || 'none').toLowerCase();
      if (level === 'none') return;
      const bonus = skillBonus(d, s.id, level);
      if (bonus != null) {
        const sign = bonus >= 0 ? '+' : '';
        parts.push(s.label + ' ' + sign + bonus);
      }
    });
    return parts.join(', ');
  }

  /** Senses string: blindsight, darkvision, tremorsense, truesight (only if > 0), plus passive Perception/Insight/Investigation. */
  function monster_senses_string(d) {
    const parts = [];
    const blindsight = parseNum(d.blindsight, 0);
    if (blindsight > 0) parts.push('blindsight ' + blindsight + ' ft.');
    const darkvision = parseNum(d.darkvision, 0);
    if (darkvision > 0) parts.push('darkvision ' + darkvision + ' ft.');
    const tremorsense = parseNum(d.tremorsense, 0);
    if (tremorsense > 0) parts.push('tremorsense ' + tremorsense + ' ft.');
    const truesight = parseNum(d.truesight, 0);
    if (truesight > 0) parts.push('truesight ' + truesight + ' ft.');
    const pb = monster_effective_pb(d);
    function profBonus(level) {
      if (level === 'proficient') return pb;
      if (level === 'half') return Math.floor(pb / 2);
      if (level === 'expertise') return pb * 2;
      return 0;
    }
    const passivePerception = 10 + monster_ability_mod(d.wis) + profBonus(d.skill_perception);
    parts.push('passive Perception ' + passivePerception);
    if (d.skill_insight && d.skill_insight !== 'none') {
      parts.push('passive Insight ' + (10 + monster_ability_mod(d.wis) + profBonus(d.skill_insight)));
    }
    if (d.skill_investigation && d.skill_investigation !== 'none') {
      parts.push('passive Investigation ' + (10 + monster_ability_mod(d.int) + profBonus(d.skill_investigation)));
    }
    return parts.join(', ');
  }

  function arrayFromField(v) {
    if (Array.isArray(v)) return v;
    if (typeof v !== 'string') return [];
    return v.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function joinArray(arr) {
    return Array.isArray(arr) ? arr.join(', ') : (arr || '');
  }

  window.MONSTER_SIZES = MONSTER_SIZES;
  window.MONSTER_ALIGNMENTS = MONSTER_ALIGNMENTS;
  window.MONSTER_TYPES = MONSTER_TYPES;
  window.MONSTER_AC_TYPES = MONSTER_AC_TYPES;
  window.MONSTER_VIGOR = MONSTER_VIGOR;
  window.DAMAGE_TYPES = DAMAGE_TYPES;
  window.CONDITION_IMMUNITIES_LIST = CONDITION_IMMUNITIES_LIST;
  window.SAVING_THROW_ABILITIES = SAVING_THROW_ABILITIES;
  window.SKILLS = SKILLS;
  window.PROFICIENCY_LEVELS = PROFICIENCY_LEVELS;
  window.LANGUAGES_LIST = LANGUAGES_LIST;

  window.monster_pb = monster_pb;
  window.monster_level_pb = monster_level_pb;
  window.monster_effective_pb = monster_effective_pb;
  window.monster_ability_mod = monster_ability_mod;
  window.monster_hp = monster_hp;
  window.monster_ac = monster_ac;
  window.monster_speed_string = monster_speed_string;
  window.monster_saving_throws = monster_saving_throws;
  window.monster_skills_string = monster_skills_string;
  window.monster_senses_string = monster_senses_string;
  window.monster_davgBySize = davgBySize;
  window.monster_dieSizeBySize = dieSizeBySize;
  window.arrayFromField = arrayFromField;
  window.joinArray = joinArray;
})(window);
