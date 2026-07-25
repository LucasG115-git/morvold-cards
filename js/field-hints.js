/* ===================================================================
   Field Hints — content for each field's ? help button.
   To add a hint to a new field:
     1. Add a <button class="field-hint-btn" data-hint-for="FIELD_ID"> next to its label.
     2. Add an entry here keyed by FIELD_ID.
   =================================================================== */

var FIELD_HINTS = {
    'card-title': {
        title: 'Creature Name',
        body: '<b>Creature Name.</b> A good name is as important as any other part of your monster. If your creature is based on a real-world animal or mythological being, the name may be obvious. When inventing a name, aim for one that either reflects the monster\'s appearance or nature, or simply has a memorable ring to it.'
    },
    'monster-str': {
        title: 'Strength (STR)',
        body: '<b>Strength.</b> Physical power; used for melee attacks and feats of brute force.'
    },
    'monster-dex': {
        title: 'Dexterity (DEX)',
        body: '<b>Dexterity.</b> Agility and reflexes; used for ranged attacks, initiative, and often calculating AC.'
    },
    'monster-con': {
        title: 'Constitution (CON)',
        body: '<b>Constitution.</b> Endurance and vitality; its modifier is added to each Hit Die when calculating HP.'
    },
    'monster-int': {
        title: 'Intelligence (INT)',
        body: '<b>Intelligence.</b> Reasoning and memory; relevant for knowledge-based traits and certain save DCs.'
    },
    'monster-wis': {
        title: 'Wisdom (WIS)',
        body: '<b>Wisdom.</b> Perception and intuition; governs passive Perception and many mental defenses.'
    },
    'monster-cha': {
        title: 'Charisma (CHA)',
        body: '<b>Charisma.</b> Force of personality; relevant for social traits, fear effects, and some spellcasting.'
    },
    'monster-creature-type': {
        title: 'Creature Type',
        body: '<p><b>Creature Type.</b> A monster\'s type hints at its origins and fundamental nature. Choose the type that best fits your concept. When in doubt, browse the Monster Manual for creatures similar to yours.</p>'
            + '<div class="field-hint-note"><i class="fa-solid fa-circle-info"></i> <b>Note:</b> The Creature\'s Type determines the background image used for your card.</div>'
    },
    'monster-alignment': {
        title: 'Alignment',
        body: '<b>Alignment.</b> Alignment reflects the creature\'s moral and ethical outlook. If your monster has no concept of morality — such as a mindless construct or a simple beast — leave it Unaligned. Otherwise, choose the alignment that best fits its nature and behavior.'
    },
    'section-condition-immunities': {
        title: 'Condition Immunities',
        body: '<b>Condition Immunities.</b> A creature immune to a condition cannot be affected by it. Condition immunities have no bearing on CR calculation, but they should make logical sense. A stone golem, for instance, logically can\'t be poisoned, paralyzed, or put to sleep. Undead are often immune to conditions that affect living bodies, like exhaustion or being frightened.'
    },
    'section-vulnerabilities': {
        title: 'Vulnerabilities',
        body: '<b>Vulnerabilities.</b> A vulnerable creature takes double damage from the selected damage type(s). Monsters don\'t typically have more than one or two vulnerabilities. If a creature is vulnerable to multiple common damage types (especially bludgeoning, piercing, or slashing), consider halving its effective HP for CR calculation purposes.'
    },
    'section-damage-immunities': {
        title: 'Damage Immunities',
        body: '<p><b>Damage Immunities.</b> An immune creature takes no damage from the selected damage type(s). Immunity is a stronger defense than resistance and should be reserved for cases where it\'s logical and flavorful — a fire elemental being immune to fire, for example. Like resistances, damage immunities increase a creature\'s effective HP for CR purposes.</p>'
            + '<p>If your monster has at least one Damage Immunity, you can use the following table:</p>'
            + '<table class="table table-condensed field-hint-table">'
            + '<thead><tr><th>Expected CR</th><th>Effective HP Multiplier</th></tr></thead>'
            + '<tbody>'
            + '<tr><td>1–4</td><td>×2</td></tr>'
            + '<tr><td>5–10</td><td>×2</td></tr>'
            + '<tr><td>11–16</td><td>×1.5</td></tr>'
            + '<tr><td>17+</td><td>×1.25</td></tr>'
            + '</tbody></table>'
    },
    'monster-size': {
        title: 'Size',
        body: '<p><b>Size.</b> Size affects how much space a creature occupies on the battlefield and determines which die is used to calculate hit points.</p>'
            + '<table class="table table-condensed field-hint-table">'
            + '<thead><tr><th>Size</th><th>Hit Die</th><th>Avg HP per Die</th></tr></thead>'
            + '<tbody>'
            + '<tr><td>Tiny</td><td>d4</td><td>2.5</td></tr>'
            + '<tr><td>Small</td><td>d6</td><td>3.5</td></tr>'
            + '<tr><td>Medium</td><td>d8</td><td>4.5</td></tr>'
            + '<tr><td>Large</td><td>d10</td><td>5.5</td></tr>'
            + '<tr><td>Huge</td><td>d12</td><td>6.5</td></tr>'
            + '<tr><td>Gargantuan</td><td>d20</td><td>10.5</td></tr>'
            + '</tbody></table>'
    },
    'monster-walk-speed': {
        title: 'Walk Speed',
        body: '<b>Walk.</b> The creature\'s standard ground movement speed in feet. Immobile creatures have a walking speed of 0.'
    },
    'monster-burrow-speed': {
        title: 'Burrow Speed',
        body: '<b>Burrow.</b> The creature can move through earth or soft ground.'
    },
    'monster-climb-speed': {
        title: 'Climb Speed',
        body: '<b>Climb.</b> The creature can scale vertical surfaces without making checks.'
    },
    'monster-fly-speed': {
        title: 'Fly Speed',
        body: '<p><b>Fly.</b> The creature can move through the air.</p>'
            + '<div class="field-hint-note"><i class="fa-solid fa-circle-info"></i> <b>Note:</b> A flying creature that can also deal damage at range is harder to engage in melee. If its CR is 10 or lower, increase its effective AC by 2 when calculating final CR.</div>'
    },
    'monster-hover': {
        title: 'Hover',
        body: '<b>Hover.</b> Check this if the flying creature can hover in place and is immune to the prone condition while airborne.'
    },
    'monster-swim-speed': {
        title: 'Swim Speed',
        body: '<b>Swim.</b> The creature can move through water without penalty.'
    },
    'section-resistances': {
        title: 'Resistances',
        body: '<p><b>Resistances.</b> A resistant creature takes half damage from the selected damage type(s). Assign resistances only when they make intuitive sense for the creature\'s nature. A creature resistant to several damage types — especially bludgeoning, piercing, and slashing — is effectively much harder to kill; account for this when assessing its final CR.</p>'
            + '<p>If your monster has at least one Resistance, you can use the following table:</p>'
            + '<table class="table table-condensed field-hint-table">'
            + '<thead><tr><th>Expected CR</th><th>Effective HP Multiplier</th></tr></thead>'
            + '<tbody>'
            + '<tr><td>1–4</td><td>×2</td></tr>'
            + '<tr><td>5–10</td><td>×1.5</td></tr>'
            + '<tr><td>11–16</td><td>×1.25</td></tr>'
            + '<tr><td>17+</td><td>×1</td></tr>'
            + '</tbody></table>'
    },
    'monster-creature-subtype': {
        title: 'Creature Subtype',
        body: '<b>Creature Subtype.</b> Subtypes provide additional detail within a type — for example, a Humanoid might have the subtype goblinoid or shapechanger. Subtypes are optional and have no mechanical bearing on CR.'
    },
    'monster-blindsight': {
        title: 'Blindsight',
        body: '<b>Blindsight.</b> The creature perceives its surroundings without relying on sight, up to a specified range.'
    },
    'monster-darkvision': {
        title: 'Darkvision',
        body: '<b>Darkvision.</b> The creature can see in dim light as if it were bright light, and in darkness as if it were dim light, up to a specified range.'
    },
    'monster-tremorsense': {
        title: 'Tremorsense',
        body: '<b>Tremorsense.</b> The creature detects vibrations through the ground, sensing creatures in contact with the same surface.'
    },
    'monster-truesight': {
        title: 'Truesight',
        body: '<b>Truesight.</b> The creature can see in normal and magical darkness, see invisible creatures, and automatically detect visual illusions, up to a specified range.'
    },
    'monster-challenge-rating': {
        title: 'Challenge Rating (CR)',
        body: '<p><b>Challenge Rating.</b> CR determines how dangerous your monster is and shapes nearly every other statistic. A CR 0 creature poses almost no threat; CR 30 represents the most powerful beings in existence.</p>'
            + '<p>Your expected CR determines your proficiency bonus, and also sets baseline expectations for AC, HP, attack bonus, damage, and save DCs — all of which you\'ll fine-tune in later sections.</p>'
            + '<table class="table table-condensed field-hint-table">'
            + '<thead><tr><th>CR</th><th>Proficiency Bonus</th></tr></thead>'
            + '<tbody>'
            + '<tr><td>0–4</td><td>+2</td></tr>'
            + '<tr><td>5–8</td><td>+3</td></tr>'
            + '<tr><td>9–12</td><td>+4</td></tr>'
            + '<tr><td>13–16</td><td>+5</td></tr>'
            + '<tr><td>17–20</td><td>+6</td></tr>'
            + '<tr><td>21–24</td><td>+7</td></tr>'
            + '<tr><td>25–28</td><td>+8</td></tr>'
            + '<tr><td>29–30</td><td>+9</td></tr>'
            + '</tbody></table>'
    }
};

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.field-hint-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var fieldId = btn.getAttribute('data-hint-for');
        var hint = FIELD_HINTS[fieldId];
        if (!hint) return;
        document.getElementById('field-hint-modal-title').textContent = hint.title;
        document.getElementById('field-hint-modal-body').innerHTML = hint.body;
        $('#field-hint-modal').modal('show');
    });
});
