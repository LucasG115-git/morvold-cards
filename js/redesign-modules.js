/* ============================================================================
   RPG Card Generator — UI Restyle Stage 3: building-block modules
   ----------------------------------------------------------------------------
   Turns each accordion section into a "module": icon chip + title + live
   summary + On card/Hidden pill + chevron. Optional sections that are turned
   off drop out of the list and appear as "Add optional block" chips.

   This is a PRESENTATION layer only. It reads/writes the SAME `card.sections`
   flags the old checklist used, reuses the existing Bootstrap collapse wiring,
   and defers all show/hide to ui_apply_template_visibility(). No calculations,
   field bindings, or card templates are touched.
   ============================================================================ */
(function () {
    'use strict';
    var mvRefreshFrame = 0;

    function mvRunRefresh() {
        mvRefreshFrame = 0;
        try { mvUpdateModules(); } catch (err) { /* non-fatal */ }
    }

    function mvScheduleRefresh() {
        if (window.PERF_RENDER_DECORATORS && window.PERF_RENDER_DECORATORS.scheduleModuleRefresh === false) {
            mvRunRefresh();
            return;
        }
        if (mvRefreshFrame) return;
        mvRefreshFrame = requestAnimationFrame(mvRunRefresh);
    }

    // Section key → Font Awesome icon for the module chip.
    var MV_ICONS = {
        identity: 'fa-solid fa-id-badge',
        challenge_identity: 'fa-solid fa-dragon',
        roleplay: 'fa-solid fa-masks-theater',
        inventory: 'fa-solid fa-sack-dollar',
        related: 'fa-solid fa-diagram-project',
        ability_scores: 'fa-solid fa-dice-d20',
        defense: 'fa-solid fa-shield-halved',
        speeds: 'fa-solid fa-shoe-prints',
        resistances: 'fa-solid fa-shield',
        damage_immunities: 'fa-solid fa-ban',
        vulnerabilities: 'fa-solid fa-heart-crack',
        condition_immunities: 'fa-solid fa-hand',
        saving_throws: 'fa-solid fa-scroll',
        skills: 'fa-solid fa-hand-fist',
        senses: 'fa-solid fa-eye',
        languages: 'fa-solid fa-comment',
        traits: 'fa-solid fa-wand-sparkles',
        actions: 'fa-solid fa-khanda',
        bonus_actions: 'fa-solid fa-bolt',
        reactions: 'fa-solid fa-reply',
        legendary_actions: 'fa-solid fa-crown',
        details: 'fa-solid fa-scroll',
        features: 'fa-solid fa-align-left',
        combat: 'fa-solid fa-gavel',
        curse: 'fa-solid fa-skull',
        sentience: 'fa-solid fa-brain'
    };

    // panelId → { key, label, icon }, built from every type's section defs.
    var MV_PANEL_META = {};
    function mvBuildMeta() {
        MV_PANEL_META = {};
        if (typeof CARD_SECTION_DEFS === 'undefined') return;
        Object.keys(CARD_SECTION_DEFS).forEach(function (type) {
            CARD_SECTION_DEFS[type].forEach(function (d) {
                MV_PANEL_META[d.panel] = { key: d.key, label: d.label, icon: MV_ICONS[d.key] || 'fa-solid fa-cube' };
            });
        });
    }

    function mvFindDef(card, key) {
        var t = (typeof ui_card_template === 'function') ? ui_card_template(card) : 'npc';
        var defs = (typeof CARD_SECTION_DEFS !== 'undefined' && CARD_SECTION_DEFS[t]) || [];
        for (var i = 0; i < defs.length; i++) if (defs[i].key === key) return defs[i];
        return null;
    }

    var esc = function (s) { return (typeof escape_html === 'function') ? escape_html(s) : String(s == null ? '' : s); };
    var nonEmpty = function (v) { return v != null && String(v).trim() !== ''; };

    // ── Live summary line per section (mirrors the printed content) ──────────
    function mvSummary(card, key) {
        var join = function (arr) { return arr.filter(nonEmpty).join(' · '); };
        var arr = function (a) { return Array.isArray(a) ? a : []; };
        var entries = function (a) {
            var names = arr(card[a]).map(function (e) { return e && (e.title || '').trim(); }).filter(Boolean);
            if (names.length) return names.join(', ');
            var n = arr(card[a]).filter(function (e) { return e && ((e.title || '').trim() || (e.text || '').trim()); }).length;
            return n ? (n + ' entr' + (n === 1 ? 'y' : 'ies')) : 'None yet';
        };
        switch (key) {
            case 'challenge_identity': {
                var st = [card.size, card.creature_type].filter(nonEmpty).join(' ');
                if (nonEmpty(card.creature_subtype)) st += ' (' + card.creature_subtype.trim() + ')';
                var cr = nonEmpty(card.challenge_rating) ? ('CR ' + card.challenge_rating) : '';
                return join([st, card.alignment, cr]) || 'Not set';
            }
            case 'identity':
                return join([nonEmpty(card.level) ? ('Level ' + card.level) : '', card.race, card.npc_class, (typeof npc_subclass_display === 'function' ? npc_subclass_display(card.npc_class, card.subclass) : card.subclass)]) || 'Not set';
            case 'roleplay': {
                var f = [['Personality', card.roleplay_personality], ['Quirk', card.roleplay_quirk], ['Flaw', card.roleplay_flaw], ['Goal', card.roleplay_goal]]
                    .filter(function (x) { return nonEmpty(x[1]); }).map(function (x) { return x[0]; });
                return f.length ? f.join(', ') : 'None yet';
            }
            case 'inventory': {
                var parts = [];
                if (nonEmpty(card.inventory_weapons)) parts.push('Weapons');
                if (nonEmpty(card.inventory_loot)) parts.push('Loot');
                var coins = ['pp', 'gp', 'ep', 'sp', 'cp'].some(function (c) { return Number(card['currency_' + c]) > 0; });
                if (coins) parts.push('Coins');
                return parts.length ? parts.join(', ') : 'Empty';
            }
            case 'related': {
                var names = arr(card.related_cards).map(function (r) { return r && (r.name || '').trim(); }).filter(Boolean);
                return names.length ? names.join(', ') : 'None';
            }
            case 'ability_scores':
                return ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(function (k) { return k.toUpperCase() + ' ' + (card[k] || '—'); }).join(' · ');
            case 'defense': {
                var ac = (typeof window.monster_ac === 'function') ? window.monster_ac(card) : card.ac;
                var hpR = (typeof window.monster_hp === 'function') ? window.monster_hp(card) : null;
                var hp = (hpR && hpR.total != null) ? hpR.total : card.hp_override;
                return join([nonEmpty(ac) ? ('AC ' + ac) : '', nonEmpty(hp) ? ('HP ' + hp) : '']) || 'Not set';
            }
            case 'speeds': {
                var sp = [['Walk', card.walk_speed], ['Burrow', card.burrow_speed], ['Climb', card.climb_speed], ['Fly', card.fly_speed], ['Swim', card.swim_speed]]
                    .filter(function (x) { return Number(x[1]) > 0; }).map(function (x) { return x[0] + ' ' + x[1]; });
                if (card.hover) sp.push('hover');
                return sp.length ? sp.join(', ') : 'None';
            }
            case 'resistances': return join(arr(card.damage_resistances)) || 'None';
            case 'damage_immunities': return join(arr(card.damage_immunities)) || 'None';
            case 'vulnerabilities': return join(arr(card.damage_vulnerabilities)) || 'None';
            case 'condition_immunities': return join(arr(card.condition_immunities)) || 'None';
            case 'saving_throws': return join(arr(card.saving_throw_proficiencies)) || 'None';
            case 'skills': {
                var ids = (typeof MONSTER_SKILL_IDS !== 'undefined') ? MONSTER_SKILL_IDS : [];
                var prof = ids.filter(function (id) { return card['skill_' + id] && card['skill_' + id] !== 'none'; })
                    .map(function (id) { return id.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); });
                return prof.length ? prof.join(', ') : 'None assigned';
            }
            case 'senses': {
                var se = [['Blindsight', card.blindsight], ['Darkvision', card.darkvision], ['Tremorsense', card.tremorsense], ['Truesight', card.truesight]]
                    .filter(function (x) { return Number(x[1]) > 0; }).map(function (x) { return x[0] + ' ' + x[1]; });
                return se.length ? se.join(', ') : 'None';
            }
            case 'languages': return join(arr(card.languages)) || 'None';
            case 'traits': return entries('traits');
            case 'actions': return entries('actions');
            case 'bonus_actions': return entries('bonus_actions');
            case 'reactions': return entries('reactions');
            case 'legendary_actions': return entries('legendary_actions');
            case 'details':
                return join([
                    join([card.item_type, nonEmpty(card.item_subtype) ? '(' + card.item_subtype + ')' : '']),
                    nonEmpty(card.item_rarity) && card.item_rarity !== 'None' ? card.item_rarity : '',
                    card.item_cost
                ]) || 'Not set';
            case 'features': {
                var benefits = entries('item_features');
                if (benefits !== 'None yet') return benefits;
                return nonEmpty(card.item_description) ? 'Description added' : 'None yet';
            }
            case 'combat': {
                var c = [];
                if (nonEmpty(card.item_damage_dice) || nonEmpty(card.item_damage_type)) c.push([card.item_damage_dice, card.item_damage_type].filter(nonEmpty).join(' '));
                if (nonEmpty(card.item_range_normal)) c.push('Range ' + card.item_range_normal);
                if (nonEmpty(card.item_ac)) c.push('AC ' + card.item_ac);
                if (arr(card.item_properties).length) c.push(card.item_properties.join(', '));
                return c.length ? c.join(' · ') : 'None';
            }
            case 'curse': return nonEmpty(card.item_curse_text) ? 'Curse described' : 'No details yet';
            case 'sentience':
                return join([
                    card.item_sentient_alignment,
                    nonEmpty(card.item_sentient_int) ? ('INT ' + card.item_sentient_int) : '',
                    nonEmpty(card.item_sentient_wis) ? ('WIS ' + card.item_sentient_wis) : '',
                    nonEmpty(card.item_sentient_cha) ? ('CHA ' + card.item_sentient_cha) : ''
                ]) || 'Not set';
        }
        return '';
    }

    // ── One-time header enhancement: wrap each collapse toggle in a module head.
    function mvBuildModuleHeaders() {
        var toggles = document.querySelectorAll('#monster-form-accordion .panel.section-accordion > .panel-heading > .panel-title > a[data-toggle="collapse"]');
        toggles.forEach(function (a) {
            var panel = a.closest('.panel');
            if (!panel || panel.getAttribute('data-mv-module') === '1') return;
            var meta = MV_PANEL_META[panel.id];
            if (!meta) return;
            var href = a.getAttribute('href') || '';
            var parent = a.getAttribute('data-parent') || '';
            var pAttr = parent ? (' data-parent="' + parent + '"') : '';
            var titleEl = a.parentNode; // .panel-title
            // Preserve the completion counter (X/Y → ✓) so updateSectionCounters keeps working
            var counter = titleEl.querySelector('.section-counter');
            var counterHtml = counter ? counter.outerHTML : '';
            titleEl.innerHTML =
                '<div class="mv-module-head">' +
                    '<a class="mv-module-toggle" data-toggle="collapse"' + pAttr + ' href="' + href + '">' +
                        '<span class="mv-module-icon"><i class="' + meta.icon + '"></i></span>' +
                        '<span class="mv-module-titles">' +
                            '<span class="mv-module-title">' + esc(meta.label) + '</span>' +
                            '<span class="mv-module-summary"></span>' +
                        '</span>' +
                    '</a>' +
                    counterHtml +
                    '<button type="button" class="mv-pill" data-section-key="' + meta.key + '">' +
                        '<i class="fa-solid fa-eye"></i><span>On card</span>' +
                    '</button>' +
                    '<a class="mv-chevron" data-toggle="collapse"' + pAttr + ' href="' + href + '"><i class="fa-solid fa-chevron-down"></i></a>' +
                '</div>';
            panel.setAttribute('data-mv-module', '1');
        });
    }

    // ── The "Add optional block" chips panel at the bottom of the form. ──────
    function mvBuildChipsPanel() {
        var acc = document.getElementById('monster-form-accordion');
        if (!acc || document.getElementById('mv-optional-blocks')) return;
        var wrap = document.createElement('div');
        wrap.id = 'mv-optional-blocks';
        wrap.innerHTML =
            '<p class="mv-optional-title"><i class="fa-solid fa-layer-group"></i> Add optional block</p>' +
            '<div id="mv-optional-chips"></div>';
        acc.appendChild(wrap);
    }

    // ── Refresh pills, summaries, and chips for the current card. ────────────
    function mvUpdateModules() {
        var card = (typeof ui_selected_card === 'function') ? ui_selected_card() : null;
        var blocks = document.getElementById('mv-optional-blocks');
        if (!card) { if (blocks) blocks.style.display = 'none'; return; }
        if (blocks) blocks.style.display = '';

        var t = ui_card_template(card);
        var defs = (CARD_SECTION_DEFS[t] || []);
        var byKey = {}; defs.forEach(function (d) { byKey[d.key] = d; });
        var sections = (card.sections && typeof card.sections === 'object') ? card.sections : {};

        document.querySelectorAll('#monster-form-accordion .mv-pill').forEach(function (pill) {
            var key = pill.getAttribute('data-section-key');
            var def = byKey[key];
            var panel = pill.closest('.panel');
            var icon = pill.querySelector('i');
            var text = pill.querySelector('span');
            if (def && def.required) {
                pill.classList.add('mv-pill-locked');
                pill.setAttribute('title', 'Always included on this card type');
                if (icon) icon.className = 'fa-solid fa-lock';
                if (text) text.textContent = 'On card';
            } else {
                pill.classList.remove('mv-pill-locked');
                pill.setAttribute('title', 'On the card — click to hide');
                if (icon) icon.className = 'fa-solid fa-eye';
                if (text) text.textContent = 'On card';
            }
            var sum = panel && panel.querySelector('.mv-module-summary');
            if (sum) sum.textContent = mvSummary(card, key);
        });

        var chipsWrap = document.getElementById('mv-optional-chips');
        if (chipsWrap) {
            var chipDefs = defs.filter(function (d) { return !d.required && sections[d.key] !== true; });
            // Only rebuild the chip tray when the set actually changes, so live
            // summary refreshes (every keystroke) don't thrash the DOM.
            var sig = t + '|' + chipDefs.map(function (d) { return d.key; }).join(',');
            if (chipsWrap.getAttribute('data-mv-sig') !== sig) {
                chipsWrap.setAttribute('data-mv-sig', sig);
                chipsWrap.innerHTML = '';
                if (!chipDefs.length) {
                    chipsWrap.innerHTML = '<p class="mv-chips-empty">All blocks added.</p>';
                } else {
                    chipDefs.forEach(function (d) {
                        var b = document.createElement('button');
                        b.type = 'button';
                        b.className = 'mv-chip';
                        b.setAttribute('data-section-key', d.key);
                        b.innerHTML = '<i class="fa-solid fa-plus"></i> ' + esc(d.label);
                        chipsWrap.appendChild(b);
                    });
                }
            }
        }
    }

    // ── Enable/disable a section (same downstream effects as the old checkbox).
    function mvSetSection(key, enabled, expand) {
        var card = (typeof ui_selected_card === 'function') ? ui_selected_card() : null;
        if (!card) return;
        if (!card.sections || typeof card.sections !== 'object') card.sections = card_default_sections(card);
        card.sections[key] = enabled;
        if (typeof monster_show_stats === 'function') card.show_stat_block = monster_show_stats(card);
        if (typeof ui_apply_template_visibility === 'function') ui_apply_template_visibility();
        if (typeof ui_render_selected_card === 'function') ui_render_selected_card();
        if (typeof local_store_save === 'function') local_store_save();
        if (typeof updateSectionCounters === 'function') updateSectionCounters();
        if (enabled && expand) {
            var def = mvFindDef(card, key);
            var panel = def && document.getElementById(def.panel);
            var collapse = panel && panel.querySelector('.panel-collapse');
            if (collapse && window.jQuery) window.jQuery(collapse).collapse('show');
        }
    }

    // Pill and chip clicks (delegated).
    document.addEventListener('click', function (e) {
        var pill = e.target.closest && e.target.closest('.mv-pill');
        if (pill) {
            var card = (typeof ui_selected_card === 'function') ? ui_selected_card() : null;
            if (!card) return;
            var key = pill.getAttribute('data-section-key');
            var def = mvFindDef(card, key);
            if (def && def.required) return; // locked on
            mvSetSection(key, false);
            return;
        }
        var chip = e.target.closest && e.target.closest('.mv-chip');
        if (chip) {
            mvSetSection(chip.getAttribute('data-section-key'), true, true);
        }
    });

    // FRONT / BACK labels under the two preview cards. The renderer wipes and
    // rebuilds #preview-container on every edit, so this re-wraps after render.
    function mvLabelPreviewFaces() {
        var pc = document.getElementById('preview-container');
        if (!pc || pc.querySelector('.mv-card-face')) return;
        var cards = pc.querySelectorAll(':scope > .card');
        ['FRONT', 'BACK'].forEach(function (lbl, i) {
            var card = cards[i];
            if (!card) return;
            var wrap = document.createElement('div');
            wrap.className = 'mv-card-face';
            card.parentNode.insertBefore(wrap, card);
            wrap.appendChild(card);
            var p = document.createElement('p');
            p.className = 'mv-card-face-label';
            p.textContent = lbl;
            wrap.appendChild(p);
        });
    }

    // Patch the two functions the app calls on any state change so modules stay
    // in sync: ui_apply_template_visibility (card switch / template / section
    // toggles) and ui_render_selected_card (every field edit → live summaries).
    function mvPatchOne(name) {
        var fn = window[name];
        if (typeof fn !== 'function' || fn.__mvPatched) return;
        window[name] = function () {
            var r = fn.apply(this, arguments);
            try { mvLabelPreviewFaces(); } catch (err) { /* non-fatal */ }
            mvScheduleRefresh();
            return r;
        };
        window[name].__mvPatched = true;
    }
    function mvPatch() {
        mvPatchOne('ui_apply_template_visibility');
        mvPatchOne('ui_render_selected_card');
    }

    document.addEventListener('DOMContentLoaded', function () {
        mvBuildMeta();
        mvBuildModuleHeaders();
        mvBuildChipsPanel();
        mvPatch();
        // Initial paint once the app has selected a card.
        setTimeout(function () {
            try { mvLabelPreviewFaces(); } catch (e) {}
            mvScheduleRefresh();
        }, 0);
    });

    // Expose for debugging / manual refresh.
    window.mvUpdateModules = mvUpdateModules;
})();

/* ============================================================================
   Deck drag-to-reorder — reorders card_data to match the dropped order, then
   reuses the app's own ui_update_card_list + selection so nothing else changes.
   ============================================================================ */
(function () {
    'use strict';
    var LIST = 'deck-cards-list';
    var dragging = null;

    function list() { return document.getElementById(LIST); }

    function afterElement(container, y) {
        var els = [].slice.call(container.querySelectorAll('.radio:not(.dragging)'));
        var closest = { offset: -Infinity, el: null };
        els.forEach(function (el) {
            var box = el.getBoundingClientRect();
            var offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) closest = { offset: offset, el: el };
        });
        return closest.el;
    }

    function commitOrder() {
        if (typeof card_data === 'undefined') return;
        var container = list();
        if (!container) return;
        var order = [].slice.call(container.querySelectorAll('.radio')).map(function (r) { return r.getAttribute('data-uuid'); });
        var pos = {};
        order.forEach(function (u, i) { pos[u] = i; });
        // Preserve which card is selected across the reorder.
        var checked = container.querySelector('input[type="radio"]:checked');
        var selUuid = checked ? checked.closest('.radio').getAttribute('data-uuid') : null;
        // Reorder card_data in place to match the dropped DOM order.
        card_data.sort(function (a, b) {
            var pa = pos[a.uuid], pb = pos[b.uuid];
            return (pa == null ? 1e9 : pa) - (pb == null ? 1e9 : pb);
        });
        if (typeof local_store_save === 'function') local_store_save();
        if (typeof ui_update_card_list === 'function') ui_update_card_list();
        if (selUuid != null && typeof ui_select_card_by_index === 'function') {
            var idx = card_data.findIndex(function (c) { return c.uuid === selUuid; });
            if (idx >= 0) ui_select_card_by_index(idx);
        }
    }

    document.addEventListener('dragstart', function (e) {
        var item = e.target.closest && e.target.closest('#' + LIST + ' .radio');
        if (!item) return;
        dragging = item;
        item.classList.add('dragging');
        try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.getAttribute('data-uuid') || '');
        } catch (_) {}
    });

    document.addEventListener('dragover', function (e) {
        var container = list();
        if (!dragging || !container || !container.contains(dragging)) return;
        if (!(e.target.closest && e.target.closest('#' + LIST))) return;
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
        var after = afterElement(container, e.clientY);
        if (after == null) container.appendChild(dragging);
        else container.insertBefore(dragging, after);
    });

    document.addEventListener('drop', function (e) {
        if (dragging && e.target.closest && e.target.closest('#' + LIST)) e.preventDefault();
    });

    document.addEventListener('dragend', function () {
        if (!dragging) return;
        dragging.classList.remove('dragging');
        dragging = null;
        try { commitOrder(); } catch (err) { /* non-fatal */ }
    });

    function markDraggable() {
        var container = list();
        if (!container) return;
        container.querySelectorAll('.radio').forEach(function (r) {
            if (!r.getAttribute('draggable')) r.setAttribute('draggable', 'true');
        });
    }

    function patchList() {
        if (typeof window.ui_update_card_list === 'function' && !window.ui_update_card_list.__mvDrag) {
            var orig = window.ui_update_card_list;
            window.ui_update_card_list = function () {
                var r = orig.apply(this, arguments);
                try { markDraggable(); } catch (_) {}
                return r;
            };
            window.ui_update_card_list.__mvDrag = true;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        patchList();
        setTimeout(markDraggable, 0);
    });
})();
