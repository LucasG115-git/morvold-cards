/**
 * Card Preview Lightbox
 * Adds a zoom button to each preview card. Clicking it (or the card itself)
 * opens a full-screen scaled clone of the card. Front/Back toggle included.
 * Refreshes automatically whenever the preview re-renders.
 */
(function () {
    'use strict';

    var _isOpen      = false;
    var _side        = 'front'; // 'front' | 'back'
    var _domReady    = false;
    var _refreshFrame = 0;

    /* ── Lazy DOM init (creates the overlay elements once) ─────────────── */
    function ensureDOM() {
        if (_domReady) return;
        _domReady = true;

        var el = document.createElement('div');
        el.id        = 'card-lightbox';
        el.className = 'card-lightbox';
        el.innerHTML =
            '<div class="clb-backdrop"  id="clb-backdrop"></div>' +
            '<div class="clb-container" id="clb-container">' +
            '  <button class="clb-close" id="clb-close" title="Close (Esc)">&times;</button>' +
            '  <div    class="clb-wrap"  id="clb-wrap"></div>' +
            '  <div    class="clb-nav"   id="clb-nav">' +
            '    <button class="clb-nav-btn" id="clb-front-btn">Front</button>' +
            '    <button class="clb-nav-btn" id="clb-back-btn">Back</button>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(el);

        document.getElementById('clb-backdrop').addEventListener('click', close);
        document.getElementById('clb-close').addEventListener('click', close);
        document.getElementById('clb-front-btn').addEventListener('click', function () { switchSide('front'); });
        document.getElementById('clb-back-btn').addEventListener('click', function () { switchSide('back'); });

        // ESC key
        document.addEventListener('keydown', function (e) {
            if (_isOpen && (e.key === 'Escape' || e.keyCode === 27)) close();
        });

        // Re-scale on window resize
        window.addEventListener('resize', function () {
            if (_isOpen) renderCard();
        });
    }

    /* ── Helpers ────────────────────────────────────────────────────────── */
    function getPreviewCards() {
        return Array.from(document.querySelectorAll('#preview-container .card'));
    }

    function switchSide(side) {
        _side = side;
        renderCard();
    }

    /* ── Render the cloned card into the lightbox ───────────────────────── */
    function renderCard() {
        var cards  = getPreviewCards();
        var idx    = _side === 'back' ? 1 : 0;
        var cardEl = cards[idx] || cards[0];
        if (!cardEl) return;

        var wrap = document.getElementById('clb-wrap');
        if (!wrap) return;

        // Scale to fit 88% of viewport (minus space for nav + close btn)
        var cardW = cardEl.offsetWidth;
        var cardH = cardEl.offsetHeight;
        if (!cardW || !cardH) return;

        var maxW  = window.innerWidth  * 0.88;
        var maxH  = (window.innerHeight - 100) * 0.88;
        var scale = Math.min(maxW / cardW, maxH / cardH);
        scale = Math.max(0.5, Math.min(scale, 5)); // clamp 0.5× – 5×

        // Clone and clean up the clone
        var clone = cardEl.cloneNode(true);
        var zb = clone.querySelector('.card-zoom-btn');
        if (zb) zb.remove();
        clone.style.transform       = 'scale(' + scale + ')';
        clone.style.transformOrigin = 'top left';
        clone.style.cursor          = 'default';
        clone.style.pointerEvents   = 'none';
        clone.style.userSelect      = 'none';

        // Size the wrap to the visual (post-scale) dimensions
        wrap.style.width  = Math.round(cardW * scale) + 'px';
        wrap.style.height = Math.round(cardH * scale) + 'px';
        wrap.innerHTML = '';
        wrap.appendChild(clone);

        // Update nav
        var nav       = document.getElementById('clb-nav');
        var frontBtn  = document.getElementById('clb-front-btn');
        var backBtn   = document.getElementById('clb-back-btn');
        if (nav && frontBtn && backBtn) {
            nav.style.display = cards.length > 1 ? 'flex' : 'none';
            frontBtn.classList.toggle('active', _side === 'front');
            backBtn.classList.toggle('active',  _side === 'back');
        }
    }

    /* ── Open ───────────────────────────────────────────────────────────── */
    function open(side) {
        ensureDOM();
        _side   = side || 'front';
        _isOpen = true;
        renderCard();
        var lb = document.getElementById('card-lightbox');
        if (lb) lb.classList.add('active');
        document.body.classList.add('lightbox-open');
    }

    /* ── Close ──────────────────────────────────────────────────────────── */
    function close() {
        _isOpen = false;
        var lb = document.getElementById('card-lightbox');
        if (lb) lb.classList.remove('active');
        document.body.classList.remove('lightbox-open');
        // Clear the clone after the CSS fade finishes
        setTimeout(function () {
            if (_isOpen) return;
            var wrap = document.getElementById('clb-wrap');
            if (wrap) wrap.innerHTML = '';
        }, 250);
    }

    /* ── Called after every preview render ──────────────────────────────── */
    function refreshPreviewBindings() {
        _refreshFrame = 0;
        var cards = getPreviewCards();

        cards.forEach(function (card, i) {
            var side = i === 0 ? 'front' : 'back';
            var btn = card.querySelector('.card-zoom-btn');

            if (!btn) {
                btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'card-zoom-btn';
                btn.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i>';
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    open(btn.getAttribute('data-side') || 'front');
                });
                card.appendChild(btn);
            }

            btn.setAttribute('data-side', side);
            btn.title = 'Zoom preview (' + side + ')';

            if (card.__clbSide !== side) {
                card.style.cursor = 'zoom-in';
                card.onclick = function (e) {
                    if (btn.contains(e.target)) return;
                    open(btn.getAttribute('data-side') || 'front');
                };
                card.__clbSide = side;
            }
        });

        // If the lightbox is already open, refresh the displayed clone
        if (_isOpen) renderCard();
    }

    function onPreviewUpdate() {
        if (window.PERF_RENDER_DECORATORS && window.PERF_RENDER_DECORATORS.schedulePreviewLightboxDecorators === false) {
            refreshPreviewBindings();
            return;
        }
        if (_refreshFrame) return;
        _refreshFrame = requestAnimationFrame(refreshPreviewBindings);
    }

    /* ── Public API ─────────────────────────────────────────────────────── */
    window.cardLightbox = {
        open:           open,
        close:          close,
        onPreviewUpdate: onPreviewUpdate
    };
})();
