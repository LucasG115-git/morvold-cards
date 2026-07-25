/**
 * Autocomplete for the Inventory (Weapons/Loot) and References (card name) fields.
 *
 * - Weapons / Loot: multi-item textareas. Typeahead completes the *current* item
 *   (the text after the last "·", ",", ";" or newline) against the SRD item list.
 * - Reference name inputs: single value. The suggestion source switches on the
 *   row's type — Stat Block / Companion → SRD creatures, Magic Item → magic items.
 *
 * Data: window.SRD_ITEMS (js/srd-items.js) and window.SRD_MONSTERS (js/srd_data.js).
 */
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        if (typeof window.jQuery === 'undefined' || !window.jQuery.fn.typeahead) return;
        var $ = window.jQuery;

        var items = Array.isArray(window.SRD_ITEMS) ? window.SRD_ITEMS : [];
        var itemNames = items.map(function (i) { return i.n; });
        var gearNames = items.filter(function (i) { return i.g; }).map(function (i) { return i.n; });
        var magicNames = items.filter(function (i) { return i.m; }).map(function (i) { return i.n; });
        var monsterNames = (Array.isArray(window.SRD_MONSTERS) ? window.SRD_MONSTERS : [])
            .map(function (m) { return m && m.title; })
            .filter(Boolean)
            .sort(function (a, b) { return a.localeCompare(b); });

        var SEP_RE = /[·,;\n]/;

        function lastToken(q) {
            var parts = String(q || '').split(SEP_RE);
            return parts[parts.length - 1].replace(/^\s+/, '');
        }

        function escapeRe(s) {
            return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function fireNative(el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Render the suggestion menu into <body> with fixed positioning so it isn't
        // clipped by the accordion (overflow:hidden) or the scrollable form column.
        function bodyShow() {
            var rect = this.$element[0].getBoundingClientRect();
            var sh = typeof this.options.scrollHeight === 'function'
                ? this.options.scrollHeight.call() : (this.options.scrollHeight || 0);
            this.$menu
                .css({
                    position: 'fixed',
                    top: (rect.bottom + sh) + 'px',
                    left: rect.left + 'px',
                    minWidth: rect.width + 'px',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    zIndex: 10000
                })
                .appendTo(document.body)
                .show();
            this.shown = true;
            return this;
        }

        function applyBodyShow(inst) {
            if (inst) inst.show = bodyShow;
        }

        // ── Token-aware typeahead for the multi-item Weapons/Loot textareas ──────
        var tokenOpts = {
            items: 8,
            minLength: 1,
            autoSelect: false,
            scrollHeight: 4,
            matcher: function (item) {
                var tok = lastToken(this.query).toLowerCase().trim();
                if (tok.length < 2) return false;
                return item.toLowerCase().indexOf(tok) !== -1;
            },
            sorter: function (list) {
                var tok = lastToken(this.query).toLowerCase().trim();
                var begins = [], contains = [], item;
                while ((item = list.shift())) {
                    (item.toLowerCase().indexOf(tok) === 0 ? begins : contains).push(item);
                }
                return begins.concat(contains);
            },
            highlighter: function (item) {
                var tok = lastToken(this.query).trim();
                if (!tok) return item;
                return item.replace(new RegExp('(' + escapeRe(tok) + ')', 'ig'), '<strong>$1</strong>');
            },
            updater: function (item) {
                var q = this.query;
                var idx = Math.max(q.lastIndexOf('·'), q.lastIndexOf(','), q.lastIndexOf(';'), q.lastIndexOf('\n'));
                return (idx >= 0 ? q.slice(0, idx + 1) + ' ' : '') + item;
            },
            afterSelect: function () { fireNative(this.$element[0]); }
        };

        function attachTokenTypeahead(id, source) {
            var el = document.getElementById(id);
            if (!el || !source.length) return;
            if ($(el).data('typeahead')) return;
            $(el).typeahead($.extend({ source: source }, tokenOpts));
            applyBodyShow($(el).data('typeahead'));
        }

        attachTokenTypeahead('monster-inventory-weapons', gearNames.length ? gearNames : itemNames);
        attachTokenTypeahead('monster-inventory-loot', itemNames);

        // ── Single-value typeahead for the draggable Weapons repeater name fields ─
        function attachSingleTypeaheadElement(el, source) {
            if (!el || !source.length) return;
            var $el = $(el);
            if ($el.data('typeahead')) return;
            $el.typeahead({
                source: source,
                items: 8,
                minLength: 1,
                autoSelect: false,
                scrollHeight: 4,
                sorter: function (list) {
                    var query = String(this.query || '').toLowerCase().trim();
                    var begins = [], contains = [], item;
                    while ((item = list.shift())) {
                        (String(item).toLowerCase().indexOf(query) === 0 ? begins : contains).push(item);
                    }
                    return begins.concat(contains);
                },
                highlighter: function (item) {
                    var query = String(this.query || '').trim();
                    if (!query) return item;
                    return String(item).replace(new RegExp('(' + escapeRe(query) + ')', 'ig'), '<strong>$1</strong>');
                },
                afterSelect: function () { fireNative(this.$element[0]); }
            });
            applyBodyShow($el.data('typeahead'));
        }

        window.attachNpcWeaponNameTypeahead = function (root) {
            var scope = root && root.querySelectorAll ? root : document;
            var source = gearNames.length ? gearNames : itemNames;
            scope.querySelectorAll('input.npc-inventory-name[id^="npc-weapon-"]').forEach(function (el) {
                attachSingleTypeaheadElement(el, source);
            });
        };

        window.attachNpcWeaponNameTypeahead(document);
        $(document).on('focusin', 'input.npc-inventory-name[id^="npc-weapon-"]', function () {
            attachSingleTypeaheadElement(this, gearNames.length ? gearNames : itemNames);
        });

        // ── Reference name inputs: source depends on the row's selected type ─────
        // NOTE: for a function source, bootstrap3-typeahead expects the array to be
        // RETURNED (the `process` callback is only for async sources). Returning
        // process(...) double-processes and hides the menu.
        function referenceSource() {
            var id = this.$element.attr('id') || '';
            var m = id.match(/monster-related-(\d+)-name/);
            var type = m ? ($('#monster-related-' + m[1] + '-type').val() || '') : '';
            if (type === 'stat-block' || type === 'companion') return monsterNames;
            if (type === 'magic-item') return magicNames;
            return []; // quest-item / unset → free text
        }

        for (var n = 1; n <= 5; n++) {
            var input = document.getElementById('monster-related-' + n + '-name');
            if (!input) continue;
            $(input).typeahead({
                source: referenceSource,
                items: 8,
                minLength: 2,
                autoSelect: false,
                scrollHeight: 4,
                afterSelect: function () { fireNative(this.$element[0]); }
            });
            applyBodyShow($(input).data('typeahead'));
        }
    });
})();
