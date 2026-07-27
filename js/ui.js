// Ugly global variable holding the current card deck
var card_data = [];
var card_options = default_card_options();
var app_settings = default_app_settings();

function default_app_settings() {
    return {
        file_name: 'morvold_card_deck',
        browser_asks_where_save: false,
        open_save_dialog: false,
        show_download_settings: true,
        page_zoom_keep_ratio: true
    }
}

window.PERF_SAFE_UPDATES = Object.assign({
    silentCardSwitchFieldSync: true,
    scheduleInputPreviewRenders: true,
    scheduleGroupRowPreviewRenders: true
}, window.PERF_SAFE_UPDATES || {});

window.PERF_PNG_EXPORT = Object.assign({
    scale: 3,
    compositeMaskedElements: true,
    prerasterizeMode: 'auto',
    maxPrerasterizeArea: 50000,
    perSideDelayMs: 300,
    useBlobIntermediateImages: true,
    useBlobDownloads: true
}, window.PERF_PNG_EXPORT || {});

window.PERF_PNG_EXPORT_FAST = Object.assign({
    scale: 3,
    compositeMaskedElements: true,
    prerasterizeMode: 'artwork-only',
    maxPrerasterizeArea: 25000,
    perSideDelayMs: 80,
    useBlobIntermediateImages: true,
    useBlobDownloads: true
}, window.PERF_PNG_EXPORT_FAST || {});

var ui_render_selected_card_frame = 0;
var ui_script_load_promises = {};
var ui_export_data_url_cache = {};

window.PERF_RENDER_DECORATORS = Object.assign({
    scheduleModuleRefresh: true,
    schedulePreviewLightboxDecorators: true
}, window.PERF_RENDER_DECORATORS || {});

window.ARTWORK_PROXY_BASE = window.ARTWORK_PROXY_BASE === undefined
    ? (window.location && (window.location.protocol === 'http:' || window.location.protocol === 'https:')
        ? window.location.origin + '/api'
        : 'http://127.0.0.1:8787')
    : window.ARTWORK_PROXY_BASE;
window.DEBUG_ART_GRADIENT = window.DEBUG_ART_GRADIENT === undefined
    ? true
    : window.DEBUG_ART_GRADIENT;

function ui_cancel_scheduled_card_render() {
    if (!ui_render_selected_card_frame) return;
    cancelAnimationFrame(ui_render_selected_card_frame);
    ui_render_selected_card_frame = 0;
}

function ui_render_selected_card_deferred() {
    if (!window.PERF_SAFE_UPDATES?.scheduleInputPreviewRenders) {
        if (typeof window.ui_render_selected_card === 'function') window.ui_render_selected_card();
        return;
    }
    if (ui_render_selected_card_frame) return;
    ui_render_selected_card_frame = requestAnimationFrame(function () {
        ui_render_selected_card_frame = 0;
        if (typeof window.ui_render_selected_card === 'function') window.ui_render_selected_card();
    });
}

function ui_resolve_script_url(url) {
    try {
        return new URL(url, document.baseURI).href;
    } catch (err) {
        return url;
    }
}

function ui_load_script_once(url, isReady) {
    if (typeof isReady === 'function' && isReady()) return Promise.resolve();
    var resolvedUrl = ui_resolve_script_url(url);
    if (ui_script_load_promises[resolvedUrl]) return ui_script_load_promises[resolvedUrl];
    ui_script_load_promises[resolvedUrl] = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = resolvedUrl;
        script.async = true;
        script.charset = 'utf-8';
        script.onload = function () {
            if (!isReady || isReady()) {
                resolve();
                return;
            }
            reject(new Error('Loaded script but dependency was unavailable: ' + resolvedUrl));
        };
        script.onerror = function () {
            reject(new Error('Failed to load script: ' + resolvedUrl));
        };
        document.head.appendChild(script);
    }).catch(function (err) {
        delete ui_script_load_promises[resolvedUrl];
        throw err;
    });
    return ui_script_load_promises[resolvedUrl];
}

async function ui_ensure_export_dependencies() {
    var loaders = [];
    if (typeof html2canvas !== 'function') {
        loaders.push(ui_load_script_once(
            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
            function () { return typeof html2canvas === 'function'; }
        ));
    }
    if (typeof embedded_asset_data === 'undefined') {
        loaders.push(ui_load_script_once(
            'js/asset_data.js?v=npc30',
            function () { return typeof embedded_asset_data !== 'undefined'; }
        ));
    }
    if (!loaders.length) return;
    await Promise.all(loaders);
}

/* ----- Skill select proficiency icon & style updater ----- */
var SKILL_ICON_MAP = {
    none:       'fa-regular fa-circle',
    proficient: 'fa-solid fa-circle',
    half:       'fa-solid fa-circle-half-stroke',
    expertise:  'fa-regular fa-circle-dot'
};

function updateSkillSelectStyle(select) {
    var val = select.value;
    var wrapper = select.closest('.skill-select-wrapper');
    if (!wrapper) return;
    var icon = wrapper.querySelector('.skill-icon');
    if (icon) {
        icon.className = 'skill-icon ' + (SKILL_ICON_MAP[val] || SKILL_ICON_MAP.none);
    }
    select.classList.remove('skill-proficient', 'skill-half', 'skill-expertise');
    if (val === 'proficient') select.classList.add('skill-proficient');
    else if (val === 'half') select.classList.add('skill-half');
    else if (val === 'expertise') select.classList.add('skill-expertise');
}

function updateAllSkillSelects() {
    document.querySelectorAll('select.skill-select').forEach(updateSkillSelectStyle);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('select.skill-select').forEach(function(sel) {
        sel.addEventListener('change', function() { updateSkillSelectStyle(sel); });
    });
    updateAllSkillSelects();
});

function mergeSort(arr, compare) {
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);

    return merge(mergeSort(left, compare), mergeSort(right, compare), compare);
}

function merge(left, right, compare) {
    var result = [];

    while (left.length && right.length) {
        if (compare(left[0], right[0]) <= 0) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

function swapInputValues(id1, id2) {
    const field1 = getField(id1);
    const field2 = getField(id2);
    if (field1 && field2) {
        const v1 = field1.getData();
        const v2 = field2.getData();
        field1.changeValue(v2);
        field2.changeValue(v1);
    } else {
        const e1 = document.getElementById(e1);
        const e2 = document.getElementById(e2);
        const v1 = e1.value;
        const v2 = e2.value;
        e1.value = v2;
        e1.dispatchEvent(new Event('input'));
        e2.value = v1;
        e2.dispatchEvent(new Event('input'));
    }
}

function ui_generate() {
    if (card_data.length === 0) {
        alert("Your deck is empty. Please define some cards first, or load the sample deck.");
        return;
    }

    // Generate output HTML
    var { style, html, pages } = card_pages_generate_html(card_data, card_options);

    // Open a new window for the output
    // Use a separate window to avoid CSS conflicts
    var tab = window.open("output.html", 'rpg-cards-output');

    if (!tab || tab.closed || typeof tab.closed === 'undefined') {
        alert(`It looks like your browser blocked the popup window. Please allow popups for this site to continue.`)
    }

    // Send the generated HTML to the new window
    // Use a delay to give the new window time to set up a message listener
    setTimeout(function () {
        tab.postMessage({ style, html, pages, options: card_options }, '*');
    }, 500);
}

async function ui_export_card_png_with_options(buttonId, buttonHtml, activeHtml, exportOverrides) {
    var card = ui_selected_card();
    if (!card) {
        alert('Please select a card first.');
        return;
    }
    try {
        await ui_ensure_export_dependencies();
    } catch (err) {
        console.error(err);
    }
    if (typeof html2canvas !== 'function') {
        alert('Export requires html2canvas. Please ensure you have an internet connection to load the library.');
        return;
    }
    var container = document.getElementById('preview-container');
    var cardEls = container ? container.querySelectorAll('.card') : [];
    if (!cardEls.length) {
        alert('Preview not available. Please wait for the card to render.');
        return;
    }

    var baseName = (card.title || 'card').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'card';
    var btn = document.getElementById(buttonId);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = activeHtml;
    }

    var exportConfig = Object.assign({}, window.PERF_PNG_EXPORT || {}, exportOverrides || {});

    // html2canvas often fails on file:// when any CSS background-image / <img> is loaded from a URL,
    // because the canvas becomes "tainted". To improve reliability, we clone the card into an offscreen
    // container and inline as many image URLs as possible as data: URIs.
    // Must match the scale: option passed to html2canvas below.
    var HTML2CANVAS_SCALE = Math.max(1, Number(exportConfig.scale) || 3);

    // Keep the container off-screen so page content never bleeds through semi-transparent
    // card areas. Remove the width:0/height:0/overflow:hidden constraints so the card's
    // internal flex layout (e.g. .monster-artwork flex:1) resolves correctly.
    var offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-100000px';
    offscreen.style.top = '0';
    offscreen.style.pointerEvents = 'none';
    document.body.appendChild(offscreen);

    var tempObjectUrls = [];

    function registerTempObjectUrl(url) {
        if (url && String(url).indexOf('blob:') === 0) tempObjectUrls.push(url);
        return url;
    }

    function canvasToImageSrc(canvas, mimeType, quality) {
        mimeType = mimeType || 'image/png';
        return new Promise(function (resolve) {
            if (exportConfig.useBlobIntermediateImages !== false && typeof canvas.toBlob === 'function') {
                canvas.toBlob(function (blob) {
                    if (!blob) {
                        resolve(canvas.toDataURL(mimeType, quality));
                        return;
                    }
                    resolve(registerTempObjectUrl(URL.createObjectURL(blob)));
                }, mimeType, quality);
                return;
            }
            resolve(canvas.toDataURL(mimeType, quality));
        });
    }

    function downloadCanvas(canvas, filename) {
        return new Promise(function (resolve) {
            var a = document.createElement('a');
            a.download = filename;
            if (exportConfig.useBlobDownloads !== false && typeof canvas.toBlob === 'function') {
                canvas.toBlob(function (blob) {
                    if (!blob) {
                        a.href = canvas.toDataURL('image/png');
                        a.click();
                        resolve();
                        return;
                    }
                    a.href = registerTempObjectUrl(URL.createObjectURL(blob));
                    a.click();
                    resolve();
                }, 'image/png');
                return;
            }
            a.href = canvas.toDataURL('image/png');
            a.click();
            resolve();
        });
    }

    function extractUrls(cssValue) {
        var urls = [];
        if (!cssValue) return urls;
        var re = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
        var m;
        while ((m = re.exec(cssValue)) !== null) {
            if (m[2]) urls.push(m[2]);
        }
        return urls;
    }

    function splitCssTopLevel(value) {
        var parts = [];
        var current = '';
        var depth = 0;
        var quote = '';
        for (var i = 0; i < String(value || '').length; i++) {
            var ch = value[i];
            if (quote) {
                current += ch;
                if (ch === quote && value[i - 1] !== '\\') quote = '';
                continue;
            }
            if (ch === '"' || ch === "'") {
                quote = ch;
                current += ch;
                continue;
            }
            if (ch === '(') {
                depth++;
                current += ch;
                continue;
            }
            if (ch === ')') {
                depth = Math.max(0, depth - 1);
                current += ch;
                continue;
            }
            if (ch === ',' && depth === 0) {
                parts.push(current.trim());
                current = '';
                continue;
            }
            current += ch;
        }
        if (current.trim()) parts.push(current.trim());
        return parts;
    }

    function pickCssLayerValue(list, index, fallback) {
        if (!Array.isArray(list) || !list.length) return fallback;
        var value = list[Math.min(index, list.length - 1)];
        value = (value == null ? '' : String(value)).trim();
        return value || fallback;
    }

    async function fetchAsDataUrl(url) {
        if (ui_export_data_url_cache[url]) return ui_export_data_url_cache[url];

        // Check pre-embedded asset data first (works on file:// protocol)
        if (typeof embedded_asset_data !== 'undefined') {
            var filename = url.split('/').pop();
            if (embedded_asset_data[filename]) {
                ui_export_data_url_cache[url] = embedded_asset_data[filename];
                return embedded_asset_data[filename];
            }
        }

        // Helper: fetch a URL, read as blob, return data URI string.
        async function blobToDataUrl(fetchUrl) {
            var res = await fetch(fetchUrl);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var blob = await res.blob();
            return new Promise(function (resolve, reject) {
                var r = new FileReader();
                r.onload = function () { resolve(String(r.result || '')); };
                r.onerror = reject;
                r.readAsDataURL(blob);
            });
        }

        // Try a direct fetch first (works when running on http/https with CORS headers).
        var dataUrl;
        try {
            dataUrl = await blobToDataUrl(url);
        } catch (directErr) {
            // Direct fetch failed — likely a CORS block (common on file:// where origin is
            // "null" and the image server doesn't allow it).  Fall back to a CORS proxy so
            // the request appears to come from a valid origin.
            try {
                // allorigins.win proxies the request from a real HTTPS origin so that
                // the response carries Access-Control-Allow-Origin: * and the browser
                // allows reading it.  Works from any http/https page; won't help when
                // the page itself is on file:// (null origin).
                var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
                dataUrl = await blobToDataUrl(proxyUrl);
            } catch (proxyErr) {
                // Both attempts failed; propagate so the caller can drop this image.
                throw proxyErr;
            }
        }

        ui_export_data_url_cache[url] = dataUrl;
        return dataUrl;
    }

    async function inlineCssImageProp(el, prop, styleProp) {
        var cs = window.getComputedStyle(el);
        var v = cs[prop];
        if (!v || v === 'none') return { changed: false, droppedAny: false };

        var urls = extractUrls(v);
        if (!urls.length) return { changed: false, droppedAny: false };

        var droppedAny = false;
        var newValue = v;
        for (var i = 0; i < urls.length; i++) {
            var raw = urls[i];
            if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) continue;
            try {
                var abs = new URL(raw, window.location.href).href;
                var dataUrl = await fetchAsDataUrl(abs);
                // Replace only this URL instance.
                newValue = newValue.replace(raw, dataUrl);
            } catch (e) {
                // If we cannot inline, drop that URL to avoid tainting the canvas.
                droppedAny = true;
                // Replace the whole url(...) token with "none" in a simple way.
                var tokenRe = new RegExp("url\\(\\s*(['\"]?)" + raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\1\\s*\\)", 'g');
                newValue = newValue.replace(tokenRe, 'none');
            }
        }
        if (newValue !== v) {
            el.style[styleProp] = newValue;
            return { changed: true, droppedAny: droppedAny };
        }
        return { changed: false, droppedAny: droppedAny };
    }

    // Load an image from a data URI or URL and return an HTMLImageElement
    function loadImage(src) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = reject;
            img.src = src;
        });
    }

    function svgDataUriToText(dataUri) {
        if (!dataUri || typeof dataUri !== 'string' || dataUri.indexOf('data:image/svg+xml') !== 0) return '';
        var commaIndex = dataUri.indexOf(',');
        if (commaIndex < 0) return '';
        var payload = dataUri.slice(commaIndex + 1);
        if (dataUri.indexOf(';base64,') >= 0) {
            try {
                return atob(payload);
            } catch (err) {
                return '';
            }
        }
        try {
            return decodeURIComponent(payload);
        } catch (err) {
            return payload;
        }
    }

    function svgTextToDataUri(svgText) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(String(svgText || ''));
    }

    function recolorSvgDataUri(dataUri, fillColor) {
        var svgText = svgDataUriToText(dataUri);
        if (!svgText) return dataUri;
        var next = svgText.replace(/fill=(['"])(?!none\b)[^'"]*\1/gi, 'fill="' + fillColor + '"');
        if (next === svgText && svgText.indexOf('<path') >= 0) {
            next = svgText.replace(/<path\b/gi, '<path fill="' + fillColor + '" ');
        }
        return svgTextToDataUri(next);
    }

    async function replaceMonsterLabelIcon(el) {
        if (!el || !el.classList || !el.classList.contains('monster-label-icon')) return false;
        if (el.getAttribute('data-export-icon-flattened') === '1') return true;

        var cs = window.getComputedStyle(el);
        var maskVal = cs.webkitMaskImage || cs.maskImage || '';
        var maskUrls = extractUrls(maskVal);
        if (!maskUrls.length) return false;

        var maskSrc = maskUrls[0];
        if (!maskSrc.startsWith('data:') && !maskSrc.startsWith('blob:')) {
            try {
                maskSrc = await fetchAsDataUrl(new URL(maskSrc, window.location.href).href);
            } catch (err) {
                return false;
            }
        }

        var color = cs.color || '#0C0C0C';
        var iconSrc = recolorSvgDataUri(maskSrc, color);

        el.style.backgroundImage = 'none';
        el.style.webkitMaskImage = 'none';
        el.style.maskImage = 'none';
        el.style.backgroundColor = 'transparent';
        el.style.position = 'relative';
        el.textContent = '';

        var imgEl = document.createElement('img');
        imgEl.src = iconSrc;
        imgEl.alt = '';
        imgEl.setAttribute('aria-hidden', 'true');
        imgEl.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;';
        el.appendChild(imgEl);
        el.setAttribute('data-export-icon-flattened', '1');
        return true;
    }

    // For elements using CSS mask-image (e.g. monster-label-icon), html2canvas
    // doesn't support masks. We manually composite the background through the
    // mask shape onto a canvas and replace the element's background with the result.
    async function compositeMaskedElement(el) {
        if (exportConfig.compositeMaskedElements === false) return;
        if (await replaceMonsterLabelIcon(el)) return;
        var cs = window.getComputedStyle(el);
        var maskVal = cs.webkitMaskImage || cs.maskImage;
        var bgVal = cs.backgroundImage;
        if (!maskVal || maskVal === 'none' || !bgVal || bgVal === 'none') return;

        var maskUrls = extractUrls(maskVal);
        var bgUrls = extractUrls(bgVal);
        if (!maskUrls.length || !bgUrls.length) return;

        // Resolve the mask and background to data URIs
        var maskSrc, bgSrc;
        try {
            maskSrc = maskUrls[0];
            if (!maskSrc.startsWith('data:') && !maskSrc.startsWith('blob:')) {
                maskSrc = await fetchAsDataUrl(new URL(maskSrc, window.location.href).href);
            }
            bgSrc = bgUrls[0];
            if (!bgSrc.startsWith('data:') && !bgSrc.startsWith('blob:')) {
                bgSrc = await fetchAsDataUrl(new URL(bgSrc, window.location.href).href);
            }
        } catch (e) { return; }

        // HTML2CANVAS_SCALE is defined in the outer export scope — must match scale: below.
        var w = el.offsetWidth || 16;
        var h = el.offsetHeight || 16;
        var cw = w * HTML2CANVAS_SCALE;
        var ch = h * HTML2CANVAS_SCALE;

        var bgImg = await loadImage(bgSrc);
        var maskImg = await loadImage(maskSrc);

        var c = document.createElement('canvas');
        c.width = cw;
        c.height = ch;
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw background (cover)
        var bgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        var elRatio = cw / ch;
        var sw, sh, sx, sy;
        if (bgRatio > elRatio) {
            sh = bgImg.naturalHeight;
            sw = sh * elRatio;
            sx = (bgImg.naturalWidth - sw) / 2;
            sy = 0;
        } else {
            sw = bgImg.naturalWidth;
            sh = sw / elRatio;
            sx = 0;
            sy = (bgImg.naturalHeight - sh) / 2;
        }
        ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, cw, ch);

        // Apply mask (contained). Use an intermediate canvas to force the SVG to
        // rasterize at the exact target dimensions — SVGs have small intrinsic px sizes
        // (e.g. width="37" height="18") and if drawn directly, some browsers rasterize
        // at that tiny size then upscale, causing jagged mask edges.
        ctx.globalCompositeOperation = 'destination-in';
        var mRatio = (maskImg.naturalWidth || 1) / (maskImg.naturalHeight || 1);
        var dw, dh, dx, dy;
        if (mRatio > elRatio) {
            dw = cw;
            dh = cw / mRatio;
            dx = 0;
            dy = (ch - dh) / 2;
        } else {
            dh = ch;
            dw = ch * mRatio;
            dx = (cw - dw) / 2;
            dy = 0;
        }
        dw = Math.round(dw); dh = Math.round(dh);
        dx = Math.round(dx); dy = Math.round(dy);
        var maskCanvas = document.createElement('canvas');
        maskCanvas.width = dw;
        maskCanvas.height = dh;
        var maskCtx = maskCanvas.getContext('2d');
        maskCtx.imageSmoothingEnabled = true;
        maskCtx.imageSmoothingQuality = 'high';
        maskCtx.drawImage(maskImg, 0, 0, dw, dh);
        ctx.drawImage(maskCanvas, dx, dy, dw, dh);

        // Replace the element with an <img> instead of a CSS background.
        // html2canvas handles <img> tags far more reliably than background-image +
        // background-size for data URIs. The img is sized to the element's CSS pixels
        // so html2canvas renders it at exactly CSS×scale = cw×ch output pixels (1:1).
        var resultDataUrl = await canvasToImageSrc(c, 'image/png');
        el.style.backgroundImage = 'none';
        el.style.webkitMaskImage = 'none';
        el.style.maskImage = 'none';
        el.style.position = 'relative';
        var imgEl = document.createElement('img');
        imgEl.src = resultDataUrl;
        imgEl.style.cssText = 'display:block;position:absolute;top:0;left:0;width:' + w + 'px;height:' + h + 'px;pointer-events:none;';
        el.appendChild(imgEl);
    }

    // Compute draw offset for a background image given its position string.
    // For cover/contain the drawn image may be larger or smaller than the canvas.
    function parseBgPos(posStr, containerW, containerH, imgW, imgH) {
        var parts = (posStr || 'center center').trim().split(/\s+/);
        var xStr = parts[0] || 'center';
        var yStr = parts[1] || 'center';
        function offset(str, containerSize, imgSize) {
            var overflow = imgSize - containerSize; // negative = smaller than container
            if (str === 'center') return -overflow / 2;
            if (str === 'left' || str === 'top' || str === '0%' || str === '0px') return 0;
            if (str === 'right' || str === 'bottom' || str === '100%') return -overflow;
            if (str.endsWith('%')) return -(parseFloat(str) / 100) * overflow;
            if (str.endsWith('px')) return parseFloat(str);
            return -overflow / 2;
        }
        return { x: offset(xStr, containerW, imgW), y: offset(yStr, containerH, imgH) };
    }

    function shouldPrerasterizeBg(el, w, h, bgSz) {
        var mode = exportConfig.prerasterizeMode;
        if (mode === false || mode === 'off') return false;
        if (mode === true || mode === 'always') return true;
        if (mode === 'artwork-only') {
            return !!(
                el &&
                el.classList &&
                (
                    el.classList.contains('monster-artwork') ||
                    el.classList.contains('monster-card-inner') ||
                    el.classList.contains('item-card-inner') ||
                    el.classList.contains('monster-back-inner') ||
                    el.classList.contains('monster-back-overlay')
                )
            );
        }
        if (bgSz === 'contain') return true;
        var area = w * h;
        if (area > (Number(exportConfig.maxPrerasterizeArea) || 50000)) return false;
        return bgSz === 'cover';
    }

    // Pre-rasterise a CSS background-image element onto a canvas at the exact html2canvas
    // output resolution (CSS px × HTML2CANVAS_SCALE), then replace the CSS background
    // with the result at background-size:100% 100%.  This ensures html2canvas draws the
    // image 1:1 in the output canvas rather than sampling it at CSS-pixel size and then
    // upscaling via ctx.scale(), which causes pixelation for small or detailed images.
    // Only handles background-size: cover and background-size: contain.
    async function prerasterizeBgElement(el) {
        var cs = window.getComputedStyle(el);
        // Skip masked elements — they're already handled by compositeMaskedElement.
        var maskVal = cs.webkitMaskImage || cs.maskImage;
        if (maskVal && maskVal !== 'none') return;

        // Prefer the element's inline style (artwork sets it inline); fall back to computed.
        var bgVal = el.style.backgroundImage || cs.backgroundImage;
        if (!bgVal || bgVal === 'none') return;

        var w = el.offsetWidth;
        var h = el.offsetHeight;
        if (!w || !h) return;

        var bgLayers = splitCssTopLevel(bgVal);
        if (!bgLayers.length) return;

        var bgSizeLayers = splitCssTopLevel(el.style.backgroundSize || cs.backgroundSize || '');
        var bgPosLayers = splitCssTopLevel(el.style.backgroundPosition || cs.backgroundPosition || '');
        var drawLayers = [];

        for (var layerIndex = 0; layerIndex < bgLayers.length; layerIndex++) {
            var layerVal = (bgLayers[layerIndex] || '').trim();
            if (!layerVal || layerVal === 'none') continue;
            var layerUrls = extractUrls(layerVal);
            if (!layerUrls.length) return;
            var layerSrc = layerUrls[0];
            if (!layerSrc || !layerSrc.startsWith('data:')) return;

            var layerSize = pickCssLayerValue(bgSizeLayers, layerIndex, 'cover');
            if (layerSize !== 'cover' && layerSize !== 'contain') return;

            drawLayers.push({
                src: layerSrc,
                size: layerSize,
                position: pickCssLayerValue(bgPosLayers, layerIndex, 'center center')
            });
        }

        if (!drawLayers.length) return;
        if (!shouldPrerasterizeBg(el, w, h, drawLayers[0].size)) return;

        var images = [];
        for (var imgIndex = 0; imgIndex < drawLayers.length; imgIndex++) {
            try {
                images[imgIndex] = await loadImage(drawLayers[imgIndex].src);
            } catch (e) {
                return;
            }
            if (!images[imgIndex].naturalWidth || !images[imgIndex].naturalHeight) return;
        }

        var cw = w * HTML2CANVAS_SCALE;
        var ch = h * HTML2CANVAS_SCALE;

        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        var s, dw, dh, pos;
        for (var drawIndex = drawLayers.length - 1; drawIndex >= 0; drawIndex--) {
            var layer = drawLayers[drawIndex];
            var img = images[drawIndex];
            if (layer.size === 'cover') {
                s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
            } else {
                s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
            }
            dw = img.naturalWidth * s;
            dh = img.naturalHeight * s;
            pos = parseBgPos(layer.position, cw, ch, dw, dh);
            ctx.drawImage(img, pos.x, pos.y, dw, dh);
        }

        // Replace CSS background with an absolutely-positioned <img>.
        // html2canvas handles <img> tags far more reliably than background-image
        // data URIs — it renders img elements at their native resolution 1:1,
        // whereas background-image with large data URIs can get downsampled internally.
        el.style.backgroundImage = 'none';
        if (getComputedStyle(el).position === 'static') {
            el.style.position = 'relative';
        }
        // Give the element z-index:0 so it forms its own stacking context.
        // This makes z-index:-1 on the img paint *behind* all children of this
        // element (including static-positioned ones like .monster-text) rather
        // than behind the entire page's stacking context.
        if (!el.style.zIndex || el.style.zIndex === 'auto') {
            el.style.zIndex = '0';
        }
        var imgEl = document.createElement('img');
        imgEl.src = await canvasToImageSrc(canvas, 'image/png');
        // Size to CSS pixels so html2canvas draws at CSS×scale = cw×ch output pixels.
        // z-index:-1 ensures it paints behind all sibling content within this element.
        imgEl.style.cssText = 'display:block;position:absolute;top:0;left:0;width:' + w + 'px;height:' + h + 'px;pointer-events:none;z-index:-1;';
        // Insert as first child so it is lowest in DOM paint order too.
        el.insertBefore(imgEl, el.firstChild || null);
    }

    async function inlineImages(root) {
        var nodes = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
        var dropped = false;

        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];

            // Composite masked elements (icons) before inlining, since
            // html2canvas doesn't support CSS mask-image
            var cs = window.getComputedStyle(el);
            var hasMask = (cs.webkitMaskImage && cs.webkitMaskImage !== 'none') ||
                          (cs.maskImage && cs.maskImage !== 'none');
            if (hasMask && exportConfig.compositeMaskedElements !== false) {
                await compositeMaskedElement(el);
                // After compositing, the background is already a data URI and mask is removed.
                // Still run inlineCssImageProp in case there are other background layers.
            }

            // Background images (paper, stone, type backgrounds, artwork backgrounds, etc.)
            var r1 = await inlineCssImageProp(el, 'backgroundImage', 'backgroundImage');
            if (r1.droppedAny) dropped = true;

            // Pre-rasterise cover/contain backgrounds at 4× CSS size so html2canvas
            // renders them 1:1 rather than sampling at CSS dimensions then upscaling.
            await prerasterizeBgElement(el);

            // <img> tags (not common for cards, but handle anyway)
            if (el.tagName === 'IMG') {
                var src = el.getAttribute('src') || '';
                if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
                    try {
                        var absImg = new URL(src, window.location.href).href;
                        el.setAttribute('src', await fetchAsDataUrl(absImg));
                    } catch (e) {
                        dropped = true;
                        el.removeAttribute('src');
                    }
                }
            }
        }
        return { droppedAny: dropped };
    }

    // Export both front and back cards
    var sides = ['front', 'back'];
    var anyDropped = false;

    try {
        for (var s = 0; s < Math.min(cardEls.length, sides.length); s++) {
            var clone = cardEls[s].cloneNode(true);
            offscreen.appendChild(clone);

            var inlineResult = await inlineImages(clone);
            if (inlineResult.droppedAny) anyDropped = true;

            var canvas = await html2canvas(clone, {
                scale: HTML2CANVAS_SCALE,
                useCORS: true,
                allowTaint: false,
                backgroundColor: null
            });

            await downloadCanvas(canvas, baseName + '_' + sides[s] + '.png');

            clone.remove();

            // Brief delay between downloads so the browser doesn't block the second one
            if (s < cardEls.length - 1) {
                await new Promise(function (r) {
                    setTimeout(r, Math.max(0, Number(exportConfig.perSideDelayMs) || 0));
                });
            }
        }

        if (anyDropped) {
            console.warn('Export PNG: some images were dropped due to CORS/permissions.');
        }
    } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed. If your creature artwork is a remote URL, it may block export due to CORS. Using the file upload (data-URI) typically works best.');
    } finally {
        offscreen.remove();
        tempObjectUrls.forEach(function (url) {
            try { URL.revokeObjectURL(url); } catch (e) { /* best effort */ }
        });
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = buttonHtml;
        }
    }
}

async function ui_export_card_png() {
    return ui_export_card_png_with_options(
        'button-export-png',
        '<i class="fa-solid fa-image"></i> Card (PNG)',
        '<i class="fa-solid fa-image"></i> Exporting\u2026'
    );
}

async function ui_export_card_png_fast() {
    return ui_export_card_png_with_options(
        'button-export-png-fast',
        '<i class="fa-solid fa-bolt"></i> Fast PNG (Beta)',
        '<i class="fa-solid fa-bolt"></i> Fast Export\u2026',
        window.PERF_PNG_EXPORT_FAST || {}
    );
}

// ── Sidebar tooltip modals ──────────────────────────────────────────────────
var SIDEBAR_TOOLTIPS = {
    'deck': {
        title: 'Deck',
        body: '<p>The Deck panel is your main workspace. Use it to add, arrange, and manage individual cards or your entire deck.</p>' +
              '<p>When you\'re ready to export, use the <strong>Generate Deck (PDF)</strong> or <strong>Generate Card (PNG)</strong> buttons above the card preview.</p>'
    },
    'add-cards': {
        title: 'Add Cards',
        body: '<ul>' +
              '<li><strong>Add New</strong> &mdash; Creates a blank card and adds it to your deck, ready to fill in.</li>' +
              '<li><strong>SRD Library</strong> &mdash; Opens the System Reference Document monster library. Browse, filter, and import pre-built creature stat blocks directly into your deck.</li>' +
              '<li><strong>Foundry</strong> &mdash; Import a single creature from a FoundryVTT actor JSON export. You can load it into the currently selected card or create it as a new card.</li>' +
              '</ul>'
    },
    'manage': {
        title: 'Manage Cards',
        body: '<ul>' +
              '<li><strong>Duplicate</strong> &mdash; Adds an exact copy of the selected card to your deck.</li>' +
              '<li><strong>Copy</strong> &mdash; Copies the selected card to your clipboard.</li>' +
              '<li><strong>Copy All</strong> &mdash; Copies every card in your deck to your clipboard.</li>' +
              '<li><strong>Paste</strong> &mdash; Pastes a previously copied card into your deck.</li>' +
              '<li><strong>Delete</strong> &mdash; Removes the selected card from your deck.</li>' +
              '<li><strong>Delete All</strong> &mdash; Removes every card from your deck.</li>' +
              '</ul>' +
              '<p>Enable <strong>Ask before deleting</strong> to require a confirmation prompt before any card is removed.</p>'
    },
    'import-export': {
        title: 'Import / Export',
        body: '<ul>' +
              '<li><strong>JSON Import</strong> &mdash; Import a JSON file. Accepts files previously exported from this tool, as well as JSON files generated by the <a href="https://5e.tools/makecards.html" target="_blank">5e.tools card builder</a>. Both formats are detected automatically.</li>' +
              '<li><strong>Foundry Export</strong> &mdash; Export the currently selected creature card as a FoundryVTT actor JSON file, ready to import directly into Foundry.</li>' +
              '</ul>' +
              '<p>Enter a file name and click <strong>Download</strong> to save your deck as a JSON file. You can reload this file at any time to continue editing.</p>' +
              '<p>To export as a PDF or PNG, use the <strong>Generate Deck (PDF)</strong> and <strong>Generate Card (PNG)</strong> buttons above the card preview.</p>'
    }
};

window.openSidebarTooltip = function (key) {
    var tip = SIDEBAR_TOOLTIPS[key];
    if (!tip) return;
    document.getElementById('sidebar-tooltip-title').textContent = tip.title;
    document.getElementById('sidebar-tooltip-body').innerHTML = tip.body;
    $('#sidebar-tooltip-modal').modal('show');
};
// ────────────────────────────────────────────────────────────────────────────

function ui_load_sample() {
    // card_data = card_data_example;
    // ui_init_cards(card_data);
    // ui_update_card_list();
    const firstAddedCardIndex = card_data.length;
    ui_add_cards(card_data_example);
    ui_select_card_by_index(firstAddedCardIndex);
}

function ui_clear_all(enableAsking) {
    if (!card_data.length) {
        return true;
    }
    const proceed = enableAsking && document.getElementById('ask-before-delete').checked ? confirm('Delete all cards?') : true;
    if (proceed) {
        card_data = [];
        ui_update_card_list();
        getField('file-name').reset();
    }
    return proceed;
}

function ui_load_files(evt) {
    const target = evt.target;
    const files = target.files;
    const isOpening = Boolean(evt.target.getAttribute('data-opening'));
    const clearAll = Boolean(evt.target.getAttribute('data-clear-all'));
    const firstAddedCardIndex = card_data.length;

    for (let i = 0; i < files.length; i++) {
        let f = files[i];
        const reader = new FileReader();

        reader.onload = function () {
            const result = (this.result || '').trim();
            if (!result) {
                showToast(`The file ${f.name} is empty.`);
                return;
            }
            try {
                const data = JSON.parse(result);
                // Auto-detect JSON Builder format: objects have a pipe-delimited 'contents' array
                const isJsonBuilder = Array.isArray(data) && data.length > 0 &&
                    Array.isArray(data[0].contents) &&
                    data[0].contents.some(s => typeof s === 'string' && s.includes(' | '));
                const cardArray = (isJsonBuilder && typeof window.jsonBuilderToCards === 'function')
                    ? window.jsonBuilderToCards(data)
                    : data;
                const newData = legacy_card_data(cardArray);
                if (isOpening && clearAll) {
                    ui_clear_all(false);
                }
                ui_add_cards(newData);
                if (isOpening) {
                    getField('file-name').changeValue(f.name.replace(/\.[^/.]+$/, ''));
                } else {
                    ui_select_card_by_index(firstAddedCardIndex);
                }
            } catch (err) {
                console.error(`Error parsing ${f.name}:`, err);
                showToast(`Error parsing ${f.name}:`, 'danger');
            }
        };

        reader.readAsText(f);
    }

    // Reset file input
    $("#file-load-form")[0].reset();
}

function ui_init_cards(data) {
    return legacy_card_data(data);
}

function ui_add_cards(data) {
    const newData = ui_init_cards(data);
    card_data = card_data.concat(newData);
    ui_update_card_list();
    ui_select_card_by_index(0);
    local_store_save(true);
}

function ui_add_new_card() {
    card_data.push(legacy_card_data([{
        ...default_card_data(),
        title: 'New card',
        icon_back_container: card_options.default_icon_back_container 
    }])[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
    local_store_save(true);
}

function ui_duplicate_card() {
    var old_card = ui_selected_card();
    if (old_card && card_data.length > 0) {
        var new_card = $.extend({}, old_card);
        card_data.push(new_card);
        new_card.title = new_card.title + " (Copy)";
        new_card.uuid = crypto.randomUUID();
    } else {
        card_data.push({
        ...default_card_data(),
        uuid: crypto.randomUUID(),
        icon_back_container: card_options.default_icon_back_container 
    });
    }
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
    local_store_save(true);
}

function ui_copy_card() {
    const card = ui_selected_card();
    if (card && card_data.length > 0) {
        navigator.clipboard.writeText(JSON.stringify(card, null, 2)).then(function() {
            showToast('Card "' + card.title + '" was copied to the clipboard');
        }, function() {
            showToast('Failure to copy: Check permissions for clipboard or try with another browser');
        });
    }
}

function ui_copy_all_cards() {
    navigator.clipboard.writeText(JSON.stringify(card_data, null, 2)).then(function() {
        showToast('All cards were copied to the clipboard');
    }, function() {
        showToast('Failure to copy: Check permissions for clipboard or try with another browser');
    });
}

function ui_paste_card() {
    navigator.clipboard.readText().then(function(s) {
        try {
            const prev_data_length = card_data.length;
            const pasted_content = JSON.parse(s);
            const content = Array.isArray(pasted_content) ? pasted_content : [pasted_content];
            content.forEach(c => {
                c.uuid = crypto.randomUUID();
                c.title += " (Pasted)";
                card_data.push(c);
            });
            ui_update_card_list();
            ui_select_card_by_index(prev_data_length);
        } catch (e) {
            alert('Could not paste clipboard as card or list of cards.\n' + e);
        }
    }, function() {
        alert('Failure to paste: Check permissions for clipboard or try with another browser')
    })
}

function ui_select_card_by_index(index) {
    $(`#deck-cards-list .radio:nth-child(${index + 1}) input[type="radio"]`).prop('checked', true);
    ui_update_selected_card();
}

function ui_selected_card_index() {
    const $checkedInput = $('#deck-cards-list input[type="radio"]:checked');
    if (!$checkedInput) return -1;
    return $checkedInput.closest('.radio').index();
}

function ui_selected_card() {
    return card_data[ui_selected_card_index()];
}

function ui_delete_card() {
    var index = ui_selected_card_index();
    if (index === -1) return;
    const proceed = document.getElementById('ask-before-delete').checked ? confirm('Delete ' + card_data[index].title + '?') : true;
    if (!proceed) return;
    card_data.splice(index, 1);
    ui_update_card_list();
    ui_select_card_by_index(Math.min(index, card_data.length - 1));
    local_store_save(true);
}

const ui_deck_option_text = (card) => {
    return `${card.count}x ${card.title}`;
}

/** Normalized card template ('npc' | 'creature' | 'item'), handling legacy 'monster'. */
const ui_card_template = (card) => {
    var t = (card && card.template) || 'npc';
    if (t === 'monster') {
        t = (card.show_stat_block === true || card.show_stat_block === 'true') ? 'creature' : 'npc';
    }
    return t;
}

const DECK_COPY_ICON_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M28,0H12C9.791,0,8,1.791,8,4v16c0,2.209,1.791,4,4,4h16c2.209,0,4-1.791,4-4V4C32,1.791,30.209,0,28,0z M6,21V8H4c-2.209,0-4,1.791-4,4v16c0,2.209,1.791,4,4,4h16c2.209,0,4-1.791,4-4v-2H11C8.791,26,6,23.209,6,21z"/></svg>';
const DECK_DELETE_ICON_SVG = '<svg viewBox="0 0 26 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7,15c0-0.552,0.448-1,1-1s1,0.448,1,1v12c0,0.553-0.448,1-1,1s-1-0.447-1-1V15z M12,15c0-0.552,0.448-1,1-1s1,0.448,1,1v12c0,0.553-0.448,1-1,1s-1-0.447-1-1V15z M17,15c0-0.552,0.448-1,1-1s1,0.448,1,1v12c0,0.553-0.448,1-1,1s-1-0.447-1-1V15z M2,28c0,2.209,1.791,4,4,4h14c2.209,0,4-1.791,4-4V12H2V28z M16,4h-6V3c0-0.553,0.448-1,1-1h4c0.552,0,1,0.447,1,1V4z M24,4h-6V2c0-1.104-0.896-2-2-2h-6C8.896,0,8,0.896,8,2v2H2C0.896,4,0,4.896,0,6v2c0,1.104,0.895,1.999,1.999,2H24.002C25.105,9.999,26,9.104,26,8V6C26,4.896,25.104,4,24,4z"/></svg>';
const DECK_MOVE_UP_ICON_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 20.695l7.997-11.39L24 20.695z"/></svg>';
const DECK_MOVE_DOWN_ICON_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M24 11.305l-7.997 11.39L8 11.305z"/></svg>';

/** Deck list entry: drag handle + chip/count row + name + selected-row inline actions. */
const ui_deck_option_html = (card) => {
    const CHIP_LABELS = { npc: 'NPC', creature: 'Creature', item: 'Item' };
    const t = ui_card_template(card);
    const esc = (typeof escape_html === 'function') ? escape_html : function (s) { return s; };
    const count = (card.count != null && card.count !== '') ? card.count : 1;
    return '<i class="fa-solid fa-grip-vertical deck-card-grip" aria-hidden="true"></i>' +
        '<span class="deck-card-main">' +
            '<span class="deck-type-chip deck-type-' + t + '">' + (CHIP_LABELS[t] || 'NPC') + '</span>' +
            '<span class="deck-card-name">' + esc(card.title || 'Untitled') + '</span>' +
        '</span>' +
        '<span class="deck-card-count">×' + esc(count) + '</span>';
}

const ui_update_deck_total_count = () => {
    $("#total-card-count").text(`Contains ${card_data.length} unique cards, ${card_data.reduce((result, card) => {
        return result + (card?.count || 1) * 1;
    }, 0)} in total.`);
}

function ui_setup_deck_sidebar_layout() {
    const $actionCard = $('#deck-section .sidebar-action-card');
    if (!$actionCard.length || $actionCard.data('deckSidebarUpgraded')) return;
    $actionCard.data('deckSidebarUpgraded', true);

    const $deckListRow = $('#deck-section .deck-sidebar-main .form-group').first();
    const $deckMoveCol = $deckListRow.find('> .col-sm-2').first();
    const $deckListCol = $deckListRow.find('> .col-sm-10').first();
    const $countRow = $('#total-card-count').closest('.form-group');
    const $countSpacerCol = $countRow.find('> .col-sm-2').first();
    const $countValueCol = $countRow.find('> .col-sm-10').first();
    const $addRow = $('#button-add-card').closest('.form-group');
    const $copyAllBtn = $('#button-copy-all');
    const $pasteBtn = $('#button-paste-card');
    const $clearBtn = $('#button-clear');
    const $copyBtn = $('#button-copy-card');
    const $deleteBtn = $('#button-delete-card');
    const $duplicateBtn = $('#button-duplicate-card');
    const $askBeforeDelete = $('#ask-before-delete').closest('.checkbox');
    const $loadBtn = $('#button-load');
    const $saveBtn = $('#button-save');
    const $fileName = $('#file-name');
    const $fileSaveLink = $('#file-save-link');

    $('#button-move-top, #button-move-bottom, #button-move-up, #button-move-down').attr('hidden', true);
    $deckMoveCol.attr('hidden', true);
    $deckListCol.removeClass('col-sm-10').addClass('col-sm-12');
    $countSpacerCol.attr('hidden', true);
    $countValueCol.removeClass('col-sm-10').addClass('col-sm-12');

    $('#button-add-card').html('<span class="sidebar-add-card-plus" aria-hidden="true">+</span><span>Add New Card</span>');
    $copyAllBtn.text('Copy All');
    $clearBtn.text('Delete All');
    $loadBtn.html('<i class="fa-solid fa-file-arrow-up"></i> Import JSON');
    $saveBtn.html('<i class="fa-solid fa-file-arrow-down"></i> Export JSON');

    if (!app_settings.file_name || app_settings.file_name === 'morvold_creatures' || app_settings.file_name === 'rpg_cards') {
        app_settings.file_name = 'morvold_card_deck';
    }
    $fileName.attr('type', 'hidden').val(app_settings.file_name);

    $duplicateBtn.prop('hidden', true).attr('tabindex', '-1');
    $copyBtn
        .removeClass('btn-primary btn-block')
        .addClass('sidebar-icon-btn')
        .attr({ title: 'Copy', 'aria-label': 'Copy' })
        .html(DECK_COPY_ICON_SVG + '<span class="sr-only">Copy</span>');
    $deleteBtn
        .removeClass('btn-block')
        .addClass('sidebar-icon-btn')
        .attr({ title: 'Delete', 'aria-label': 'Delete' })
        .html(DECK_DELETE_ICON_SVG + '<span class="sr-only">Delete</span>');

    const $accordion = $(
        '<div class="panel panel-default sidebar-manage-accordion">' +
            '<div class="panel-heading" role="tab" id="deckManageExportHeading">' +
                '<button type="button" class="sidebar-accordion-toggle collapsed" data-toggle="collapse" data-target="#deck-manage-export-collapse" aria-expanded="false" aria-controls="deck-manage-export-collapse">' +
                    '<span>Manage &amp; Export</span>' +
                    '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>' +
                '</button>' +
            '</div>' +
            '<div id="deck-manage-export-collapse" class="panel-collapse collapse" role="tabpanel" aria-labelledby="deckManageExportHeading">' +
                '<div class="panel-body sidebar-manage-panel-body"></div>' +
            '</div>' +
        '</div>'
    );

    const $manageGrid = $('<div class="deck-manage-button-grid"></div>');
    $manageGrid
        .append($('<div class="deck-manage-button-cell"></div>').append($copyAllBtn.removeClass('btn-block')))
        .append($('<div class="deck-manage-button-cell"></div>').append($pasteBtn.removeClass('btn-block')))
        .append($('<div class="deck-manage-button-cell"></div>').append($clearBtn.removeClass('btn-block')));

    const $importExportRow = $('<div class="sidebar-import-export-row"></div>');
    $importExportRow
        .append($loadBtn.removeClass('btn-block'))
        .append($('<span class="sidebar-button-divider" aria-hidden="true"></span>'))
        .append($saveBtn.removeClass('btn-block').addClass('sidebar-export-btn'))
        .append($fileName)
        .append($fileSaveLink);

    $askBeforeDelete.addClass('sidebar-delete-toggle');
    $accordion.find('.sidebar-manage-panel-body')
        .append($manageGrid)
        .append($askBeforeDelete)
        .append($importExportRow);

    $addRow.after($accordion);
    $actionCard.children('.sidebar-group-label, .form-group').not($addRow).remove();
}

const ui_deck_option_html_v2 = (card) => {
    const CHIP_LABELS = { npc: 'NPC', creature: 'Creature', item: 'Item' };
    const t = ui_card_template(card);
    const esc = (typeof escape_html === 'function') ? escape_html : function (s) { return s; };
    const count = (card.count != null && card.count !== '') ? card.count : 1;
    return '<span class="deck-card-rail">' +
            '<i class="fa-solid fa-grip-vertical deck-card-grip" aria-hidden="true"></i>' +
            '<span class="deck-card-move-actions">' +
                '<button type="button" class="deck-card-inline-action deck-card-inline-action-move deck-card-inline-action-move-up" data-deck-action="move-up" title="Move up" aria-label="Move up">' + DECK_MOVE_UP_ICON_SVG + '<span class="sr-only">Move up</span></button>' +
                '<button type="button" class="deck-card-inline-action deck-card-inline-action-move deck-card-inline-action-move-down" data-deck-action="move-down" title="Move down" aria-label="Move down">' + DECK_MOVE_DOWN_ICON_SVG + '<span class="sr-only">Move down</span></button>' +
            '</span>' +
        '</span>' +
        '<span class="deck-card-main">' +
            '<span class="deck-card-header">' +
                '<span class="deck-type-chip deck-type-' + t + '">' + (CHIP_LABELS[t] || 'NPC') + '</span>' +
                '<span class="deck-card-count">&times;' + esc(count) + '</span>' +
            '</span>' +
            '<span class="deck-card-footer">' +
                '<span class="deck-card-name">' + esc(card.title || 'Untitled') + '</span>' +
                '<span class="deck-card-inline-actions">' +
                    '<button type="button" class="deck-card-inline-action deck-card-inline-action-copy" data-deck-action="copy" title="Duplicate" aria-label="Duplicate">' + DECK_COPY_ICON_SVG + '<span class="sr-only">Duplicate</span></button>' +
                    '<button type="button" class="deck-card-inline-action deck-card-inline-action-delete" data-deck-action="delete" title="Delete" aria-label="Delete">' + DECK_DELETE_ICON_SVG + '<span class="sr-only">Delete</span></button>' +
                '</span>' +
            '</span>' +
        '</span>';
}

function ui_handle_deck_inline_action(event) {
    const button = event.target.closest('.deck-card-inline-action');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (button.dataset.deckAction === 'copy') return ui_duplicate_card();
    if (button.dataset.deckAction === 'delete') return ui_delete_card();
    if (button.dataset.deckAction === 'move-up') return ui_move_up();
    if (button.dataset.deckAction === 'move-down') return ui_move_down();
}

function ui_update_card_list() {

    const $deck = $('#deck-cards-list');

    $deck.children().each(function() {
        const option = this;
        if (!card_data.find(card => card.uuid === option.getAttribute('data-uuid'))) option.remove();
    });

    let i = card_data.length;

    while (i--) {
        var card = card_data[i];
        $option = $deck.find(`[data-uuid="${card.uuid}"]`);
        if (!$option.length) {
            $deck.prepend(`<div class="radio" data-uuid="${card.uuid}"><label><input type="radio" name="deck-option" value="${i}"> <span class="text">${ui_deck_option_html_v2(card)}</span></label></div>`);
        } else if ($option.index() === i) {
            $option.find('.text').html(ui_deck_option_html_v2(card));
        } else {
            $option.find('.text').html(ui_deck_option_html_v2(card));
            $deck.prepend($option.detach());
        }
    }

    ui_update_deck_total_count();
    ui_update_selected_card();
}

async function ui_save_file() {
    const data = card_data.map(item => {
        const card = { ...item };
        delete card.uuid;
        return card;
    });
    const jsonString = JSON.stringify(data, null, "  ");
    let filename = app_settings.file_name;
    
    if (window.showSaveFilePicker) {
        if (app_settings.open_save_dialog) {
            if (!app_settings.browser_asks_where_save) {
                try {
                    const options = {
                        suggestedName: filename + '.json',
                        types: [{
                        description: 'File JSON',
                        accept: { 'application/json': ['.json'] }
                        }]
                    };

                    const handle = await showSaveFilePicker(options);
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    const newFilename = handle.name.split('.').slice(0, -1).join('.');
                    if (newFilename !== filename) getField('file-name').changeValue(newFilename);
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') {
                        return;
                    }
                    console.error(err);
                }
            }
        }
    }

    const parts = [jsonString];
    const blob = new Blob(parts, { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = $("#file-save-link")[0];
    a.href = url;
    if (filename) {
        a.download = filename 
        ui_save_file_filename = filename;
        a.click();
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

// ── Auto gradient background derived from artwork ───────────────────────────
function ui_rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function ui_hsl2rgb(h, s, l) {
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        var hue2rgb = function (p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function ui_artwork_proxy_url(url) {
    var base = window.ARTWORK_PROXY_BASE;
    if (!base) return '';
    return String(base).replace(/\/+$/, '') + '/image?url=' + encodeURIComponent(url);
}

function ui_debug_art_gradient() {
    if (!window.DEBUG_ART_GRADIENT || !window.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[art-gradient]');
    console.log.apply(console, args);
}

function ui_extract_dark_gradient_from_loaded_image(img, cb) {
    try {
        var S = 48;
        var canvas = document.createElement('canvas');
        canvas.width = S; canvas.height = S;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, S, S);
        var data = ctx.getImageData(0, 0, S, S).data;

        var buckets = {};
        for (var i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 125) continue;
            var r = data[i], g = data[i + 1], b = data[i + 2];
            var key = (r >> 4) + '-' + (g >> 4) + '-' + (b >> 4);
            var bk = buckets[key] || (buckets[key] = { r: 0, g: 0, b: 0, n: 0 });
            bk.r += r; bk.g += g; bk.b += b; bk.n++;
        }
        var arr = [];
        for (var kk in buckets) {
            var bb = buckets[kk];
            arr.push({ r: bb.r / bb.n, g: bb.g / bb.n, b: bb.b / bb.n, n: bb.n });
        }
        if (!arr.length) { cb(null); return; }
        arr.sort(function (a, b2) { return b2.n - a.n; });

        var picks = [];
        for (var j = 0; j < arr.length && picks.length < 3; j++) {
            var hsl = ui_rgb2hsl(arr[j].r, arr[j].g, arr[j].b);
            var distinct = picks.every(function (p) {
                var dh = Math.abs(p.h - hsl[0]); dh = Math.min(dh, 1 - dh);
                return dh > 0.06;
            });
            if (picks.length === 0 || distinct) picks.push({ h: hsl[0], s: hsl[1], l: hsl[2] });
        }
        while (picks.length < 3) {
            var last = picks[picks.length - 1];
            picks.push({ h: (last.h + 0.05) % 1, s: last.s, l: last.l });
        }

        function rgbTriplet(p, l) {
            var s = Math.min(0.5, Math.max(0.15, p.s));
            var rgb = ui_hsl2rgb(p.h, s, l);
            return rgb[0] + ',' + rgb[1] + ',' + rgb[2];
        }
        var top = rgbTriplet(picks[0], 0.28);
        var bottom = rgbTriplet(picks[0], 0.07);
        var accTR = rgbTriplet(picks[1], 0.22);
        var accBL = rgbTriplet(picks[2], 0.18);
        cb(
            'radial-gradient(circle at 88% 0%, rgba(' + accTR + ',0.5) 0%, rgba(' + accTR + ',0) 55%), ' +
            'radial-gradient(circle at 12% 100%, rgba(' + accBL + ',0.5) 0%, rgba(' + accBL + ',0) 55%), ' +
            'linear-gradient(180deg, rgb(' + top + ') 0%, rgb(' + bottom + ') 100%)'
        );
    } catch (e) {
        ui_debug_art_gradient('sampling failed after image load', e && e.message ? e.message : e);
        cb(null);
    }
}

/**
 * Sample an image, pick a few dominant (hue-distinct) colors, force them dark,
 * and build a CSS linear-gradient string. Calls cb(gradientString) or cb(null)
 * on failure (e.g. an untainted-canvas / CORS error for a remote image).
 */
function ui_extract_dark_gradient(imgUrl, cb) {
    if (!imgUrl) { cb(null); return; }
    var triedProxy = false;
    ui_debug_art_gradient('begin extract', {
        artworkUrl: imgUrl,
        proxyBase: window.ARTWORK_PROXY_BASE || '',
        pageOrigin: window.location ? window.location.origin : '',
        pageProtocol: window.location ? window.location.protocol : ''
    });

    if (window.location && window.location.protocol === 'https:' && /^http:\/\//i.test(String(window.ARTWORK_PROXY_BASE || ''))) {
        ui_debug_art_gradient('mixed-content warning: https page cannot use http localhost proxy');
    }

    function sampleUrl(url, useCors) {
        ui_debug_art_gradient('load image', { url: url, useCors: !!useCors, viaProxy: triedProxy });
        var img = new Image();
        if (useCors) img.crossOrigin = 'anonymous';
        img.onload = function () {
            ui_debug_art_gradient('image loaded', { url: url, width: img.naturalWidth, height: img.naturalHeight, viaProxy: triedProxy });
            ui_extract_dark_gradient_from_loaded_image(img, function (grad) {
                if (grad || triedProxy) {
                    ui_debug_art_gradient('sample result', { success: !!grad, viaProxy: triedProxy });
                    cb(grad);
                    return;
                }
                ui_debug_art_gradient('direct sample failed; trying proxy fallback');
                tryProxy();
            });
        };
        img.onerror = function (err) {
            ui_debug_art_gradient('image load failed', { url: url, viaProxy: triedProxy, error: err && err.message ? err.message : err });
            if (triedProxy) {
                cb(null);
                return;
            }
            tryProxy();
        };
        img.src = url;
    }

    function tryProxy() {
        var proxyUrl = ui_artwork_proxy_url(imgUrl);
        if (!proxyUrl || triedProxy) {
            ui_debug_art_gradient('proxy unavailable or already tried', { proxyUrl: proxyUrl, triedProxy: triedProxy });
            cb(null);
            return;
        }
        triedProxy = true;
        ui_debug_art_gradient('trying proxy fallback', proxyUrl);
        sampleUrl(proxyUrl, true);
    }

    sampleUrl(imgUrl, true);
}

/** Recompute and store the card's art-derived gradient, then run cb. */
function ui_recompute_art_gradient(card, cb) {
    if (!card) { if (cb) cb(); return; }
    var url = (card.creature_artwork || '').trim();
    ui_debug_art_gradient('recompute request', {
        title: card.title || '',
        backgroundMode: card.background_mode,
        artworkUrl: url,
        hasExistingGradient: !!(card.art_gradient || '').trim()
    });
    if (!url) {
        card.art_gradient = '';
        if (typeof local_store_save === 'function') local_store_save();
        if (cb) cb();
        return;
    }
    ui_extract_dark_gradient(url, function (grad) {
        card.art_gradient = grad || '';
        ui_debug_art_gradient('recompute complete', { success: !!grad, storedGradientLength: (card.art_gradient || '').length });
        if (typeof local_store_save === 'function') local_store_save();
        if (cb) cb(grad);
    });
}

/** Handle a change to the background mode select (Default gradient ↔ Creature Type). */
function ui_on_background_mode_change() {
    var card = ui_selected_card();
    if (!card) { ui_render_selected_card(); return; }
    if (card.background_mode === 'gradient' && (card.creature_artwork || '').trim()) {
        // Always recompute on switch: cheap (48px canvas), and it upgrades any
        // gradient stored by an older version of the extraction code.
        ui_recompute_art_gradient(card, function () { ui_render_selected_card(); });
    } else {
        ui_render_selected_card();
    }
    if (typeof local_store_save === 'function') local_store_save();
}

// Optional sections per card type: checklist labels + the form panel each
// key controls. `required` sections are locked on; `group` renders a subheader.
var CARD_SECTION_DEFS = {
    npc: [
        { key: 'identity', label: 'Identity', panel: 'sectionIdentity', required: true },
        { key: 'roleplay', label: 'Roleplay', panel: 'sectionActions', required: true },
        { key: 'inventory', label: 'Inventory', panel: 'sectionBonusActions' },
        { key: 'related', label: 'Related Cards', panel: 'sectionReactions' },
        { key: 'actions', label: 'Actions', panel: 'sectionCreatureActions', group: 'Combat Actions' },
        { key: 'bonus_actions', label: 'Bonus Actions', panel: 'sectionCreatureBonusActions', group: 'Combat Actions' },
        { key: 'reactions', label: 'Reactions', panel: 'sectionCreatureReactions', group: 'Combat Actions' },
        { key: 'legendary_actions', label: 'Legendary Actions', panel: 'sectionCreatureLegendary', group: 'Combat Actions' },
        { key: 'ability_scores', label: 'Ability Scores', panel: 'sectionAbilityScores', group: 'Combat Stats' },
        { key: 'defense', label: 'Defense & Health', panel: 'sectionDefense', group: 'Combat Stats' },
        { key: 'speeds', label: 'Speeds', panel: 'sectionSpeeds', group: 'Combat Stats' },
        { key: 'resistances', label: 'Resistances', panel: 'sectionResistances', group: 'Combat Stats' },
        { key: 'damage_immunities', label: 'Damage Immunities', panel: 'sectionDamageImmunities', group: 'Combat Stats' },
        { key: 'vulnerabilities', label: 'Vulnerabilities', panel: 'sectionVulnerabilities', group: 'Combat Stats' },
        { key: 'condition_immunities', label: 'Condition Immunities', panel: 'sectionConditionImmunities', group: 'Combat Stats' },
        { key: 'saving_throws', label: 'Saving Throw Proficiencies', panel: 'sectionSavingThrows', group: 'Combat Stats' },
        { key: 'skills', label: 'Skill Proficiencies', panel: 'sectionSkills', group: 'Combat Stats' },
        { key: 'senses', label: 'Senses', panel: 'sectionSenses', group: 'Combat Stats' },
        { key: 'languages', label: 'Languages', panel: 'sectionLanguages', group: 'Combat Stats' }
    ],
    creature: [
        { key: 'challenge_identity', label: 'Challenge & Identity', panel: 'sectionCreatureIdentity', required: true },
        { key: 'ability_scores', label: 'Ability Scores', panel: 'sectionAbilityScores', required: true },
        { key: 'defense', label: 'Defense & Health', panel: 'sectionDefense', required: true },
        { key: 'speeds', label: 'Speeds', panel: 'sectionSpeeds', required: true },
        { key: 'resistances', label: 'Resistances', panel: 'sectionResistances' },
        { key: 'damage_immunities', label: 'Damage Immunities', panel: 'sectionDamageImmunities' },
        { key: 'vulnerabilities', label: 'Vulnerabilities', panel: 'sectionVulnerabilities' },
        { key: 'condition_immunities', label: 'Condition Immunities', panel: 'sectionConditionImmunities' },
        { key: 'saving_throws', label: 'Saving Throw Proficiencies', panel: 'sectionSavingThrows' },
        { key: 'skills', label: 'Skill Proficiencies', panel: 'sectionSkills' },
        { key: 'senses', label: 'Senses', panel: 'sectionSenses' },
        { key: 'languages', label: 'Languages', panel: 'sectionLanguages' },
        { key: 'traits', label: 'Creature Traits', panel: 'sectionCreatureTraits', required: true },
        { key: 'actions', label: 'Actions', panel: 'sectionCreatureActions', required: true },
        { key: 'bonus_actions', label: 'Bonus Actions', panel: 'sectionCreatureBonusActions' },
        { key: 'reactions', label: 'Reactions', panel: 'sectionCreatureReactions' },
        { key: 'legendary_actions', label: 'Legendary Actions', panel: 'sectionCreatureLegendary' }
    ],
    item: [
        { key: 'details', label: 'Item Details', panel: 'sectionItemDetails', required: true },
        { key: 'features', label: 'Item Description', panel: 'sectionItemFeatures' },
        { key: 'combat', label: 'Combat & Properties', panel: 'sectionItemCombat' },
        { key: 'curse', label: 'Curse', panel: 'sectionItemCurse' },
        { key: 'sentience', label: 'Sentience', panel: 'sectionItemSentience' }
    ]
};

/** Rebuild the "Sections" checklist for the given template + card state. */
function ui_sync_sections_from_card(card) {
    var container = document.getElementById('card-sections-cb');
    if (!container) return;
    container.innerHTML = '';
    if (!card) return;
    var defs = CARD_SECTION_DEFS[ui_card_template(card)] || [];
    var sections = (card.sections && typeof card.sections === 'object') ? card.sections : {};

    function makeLabel(d) {
        var label = document.createElement('label');
        label.className = 'checkbox-inline';
        label.style.display = 'block';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = d.key;
        cb.setAttribute('data-card-section', d.key);
        if (d.required) {
            // Core section for this card type: always on, can't be turned off
            cb.checked = true;
            cb.disabled = true;
            label.classList.add('section-required');
            label.title = 'Always included on this card type';
        } else {
            // Checked = enabled; unknown keys count as enabled (matches card_section_enabled)
            cb.checked = sections[d.key] !== false;
        }
        label.appendChild(cb);
        label.appendChild(document.createTextNode(' ' + d.label));
        if (d.required) {
            var lock = document.createElement('i');
            lock.className = 'fa-solid fa-lock section-required-lock';
            label.appendChild(document.createTextNode(' '));
            label.appendChild(lock);
        }
        return label;
    }

    // Split defs into consecutive runs by group so grouped sections get a
    // subheader ("Combat Stats") and their own two-column block.
    var runs = [];
    defs.forEach(function (d) {
        var g = d.group || null;
        if (!runs.length || runs[runs.length - 1].group !== g) runs.push({ group: g, defs: [] });
        runs[runs.length - 1].defs.push(d);
    });

    runs.forEach(function (run) {
        if (run.group) {
            var sub = document.createElement('div');
            sub.className = 'section-checklist-subheader';
            sub.textContent = run.group;
            container.appendChild(sub);
        }
        var row = document.createElement('div');
        row.className = 'row';
        row.style.marginLeft = '0';
        row.style.marginRight = '0';
        var numCols = 2;
        var perCol = Math.ceil(run.defs.length / numCols);
        for (var c = 0; c < numCols; c++) {
            var col = document.createElement('div');
            col.className = 'col-sm-6';
            for (var i = c * perCol; i < Math.min((c + 1) * perCol, run.defs.length); i++) {
                col.appendChild(makeLabel(run.defs[i]));
            }
            row.appendChild(col);
        }
        container.appendChild(row);
    });
}

/** Keep the Background control's preset label/help aligned with the active card type. */
function ui_sync_background_mode_controls(card) {
    var template = card ? ui_card_template(card) : ($('#card-template').val() || 'npc');
    var $select = $('#monster-background-mode');
    var currentValue = $select.val() || 'gradient';
    var presetLabel = template === 'item' ? 'Rarity' : (template === 'npc' ? 'Class' : 'Creature Type');
    var helpText = template === 'item'
        ? '"Default" builds a dark gradient from the uploaded artwork\'s colors. "' + presetLabel + '" uses the item rarity background.'
        : template === 'npc'
        ? '"Default" builds a dark gradient from the uploaded artwork\'s colors. "' + presetLabel + '" uses the NPC class background.'
        : '"Default" builds a dark gradient from the uploaded artwork\'s colors. "' + presetLabel + '" uses the classic type background image.';

    $select.html(
        '<option value="gradient">Default</option>' +
        '<option value="creature_type">' + presetLabel + '</option>'
    );
    $select.val(currentValue === 'creature_type' ? 'creature_type' : 'gradient');
    $('#background-mode-help').text(helpText);
}

/** Template select changed: refresh section defaults, checklist, form, card. */
function ui_on_template_change() {
    var card = ui_selected_card();
    if (card) {
        card.sections = card_default_sections(card);
        // Keep the legacy flag coherent for anything still reading it
        card.show_stat_block = monster_show_stats(card);
        $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').html(ui_deck_option_html_v2(card));
        local_store_save();
    }
    ui_sync_sections_from_card(card);
    ui_apply_template_visibility();
    ui_render_selected_card();
    if (typeof updateSectionCounters === 'function') updateSectionCounters();
}

/**
 * Show/hide form sections based on the selected card's template and its
 * enabled-sections checklist. Required sections are forced on by
 * card_default_sections, so gating everything on the checklist is safe.
 */
function ui_apply_template_visibility() {
    var card = ui_selected_card();
    var template = card ? ui_card_template(card) : ($('#card-template').val() || 'npc');
    var isItem = template === 'item';
    var isCreature = template === 'creature';
    var isNpc = template === 'npc';
    ui_sync_background_mode_controls(card);
    // Explicit check: a key must be true to show (missing key = section off)
    var on = function (key) { return !!card && !!card.sections && card.sections[key] === true; };

    // NPC-flavored bits
    $('#npc-title-group').toggle(isNpc);
    $('#background-mode-group').toggle(true);

    // NPC narrative sections
    $('#sectionIdentity').toggle(isNpc && on('identity'));
    $('#sectionActions').toggle(isNpc && on('roleplay'));
    $('#sectionBonusActions').toggle(isNpc && on('inventory'));
    $('#sectionReactions').toggle(isNpc && on('related'));

    // Creature identity + trait/action sections
    $('#sectionCreatureIdentity').toggle(isCreature && on('challenge_identity'));
    $('#sectionCreatureTraits').toggle(isCreature && on('traits'));
    $('#sectionCreatureActions').toggle((isCreature || isNpc) && on('actions'));
    $('#sectionCreatureBonusActions').toggle((isCreature || isNpc) && on('bonus_actions'));
    $('#sectionCreatureReactions').toggle((isCreature || isNpc) && on('reactions'));
    $('#sectionCreatureLegendary').toggle((isCreature || isNpc) && on('legendary_actions'));

    // Combat stat modules sit at the top level now (no wrapper); each panel
    // follows its own checklist entry (NPC and Creature alike)
    $('#sectionAbilityScores').toggle(!isItem && on('ability_scores'));
    $('#sectionDefense').toggle(!isItem && on('defense'));
    $('#sectionSpeeds').toggle(!isItem && on('speeds'));
    $('#sectionResistances').toggle(!isItem && on('resistances'));
    $('#sectionDamageImmunities').toggle(!isItem && on('damage_immunities'));
    $('#sectionVulnerabilities').toggle(!isItem && on('vulnerabilities'));
    $('#sectionConditionImmunities').toggle(!isItem && on('condition_immunities'));
    $('#sectionSavingThrows').toggle(!isItem && on('saving_throws'));
    $('#sectionSkills').toggle(!isItem && on('skills'));
    $('#sectionSenses').toggle(!isItem && on('senses'));
    $('#sectionLanguages').toggle(!isItem && on('languages'));

    // Item sections
    $('#sectionItemDetails').toggle(isItem);
    $('#sectionItemFeatures').toggle(isItem && on('features'));
    $('#sectionItemCombat').toggle(isItem && on('combat'));
    $('#sectionItemCurse').toggle(isItem && on('curse'));
    $('#sectionItemSentience').toggle(isItem && on('sentience'));
    if (isItem && card) {
        card.item_cursed = on('curse');
        card.item_sentient = on('sentience');
    }

    // Item conditional groups (also synced here so card switches restore them)
    $('#item-attunement-req-group').toggle(isItem && !!card && card.item_attunement === 'required_by');

    // Name label follows the card type
    $('#card-title-label-text').text(isItem ? 'Item Name' : (isCreature ? 'Creature Name' : 'NPC Name'));

    // SRD Library button per card type (NPC / Creature / Item)
    $('#button-npc-library').toggle(isNpc);
    $('#button-creature-library').toggle(isCreature);
    $('#button-item-library').toggle(isItem);
}

function ui_set_npc_class_value(value) {
    var field = getField('monster-class');
    if (!field) return;
    var nextValue = value == null ? '' : String(value);
    if (typeof field.syncValue === 'function') field.syncValue(nextValue);
    else field.setValue(nextValue);
    field.setData(nextValue);
    field.storeData();
}

function ui_sync_npc_subclass_affix_controls(npcClass) {
    var prefixEl = document.getElementById('monster-subclass-prefix');
    var suffixEl = document.getElementById('monster-subclass-suffix');
    if (!prefixEl || !suffixEl) return;
    var affixes = (typeof npc_subclass_affixes === 'function') ? npc_subclass_affixes(npcClass) : { prefix: '', suffix: '' };
    prefixEl.textContent = affixes.prefix || '';
    suffixEl.textContent = affixes.suffix || '';
    prefixEl.style.display = affixes.prefix ? '' : 'none';
    suffixEl.style.display = affixes.suffix ? '' : 'none';
}

function ui_sync_npc_class_controls(card) {
    var select = document.getElementById('monster-class-select');
    var custom = document.getElementById('monster-class-custom');
    if (!select || !custom) return;
    var value = card && card.npc_class != null ? String(card.npc_class) : '';
    var predefined = Array.from(select.options).some(function (opt) {
        return opt.value && opt.value !== '__custom__' && opt.value === value;
    });
    if (!value) {
        select.value = '';
        custom.value = '';
        custom.style.display = 'none';
        ui_sync_npc_subclass_affix_controls('');
        return;
    }
    if (predefined) {
        select.value = value;
        custom.value = '';
        custom.style.display = 'none';
        ui_sync_npc_subclass_affix_controls(value);
        return;
    }
    select.value = '__custom__';
    custom.value = value;
    custom.style.display = '';
    ui_sync_npc_subclass_affix_controls('');
}

function ui_update_selected_card() {
    var card = ui_selected_card();
    if (card) {
        getFieldGroup('card').forEach(field => {
            var nextValue = field.id === 'card-template' ? ui_card_template(card) : field.getData();
            if (window.PERF_SAFE_UPDATES?.silentCardSwitchFieldSync && typeof field.syncValue === 'function') {
                field.syncValue(nextValue);
            } else {
                field.changeValue(nextValue, { updateData: false });
            }
        });
        if (typeof window.ui_sync_card_template_segmented === 'function') {
            window.ui_sync_card_template_segmented();
        }
        ui_sync_npc_class_controls(card);
        $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').html(ui_deck_option_html_v2(card));
        // Related cards: 5 rows of type + name
        var related = Array.isArray(card.related_cards) ? card.related_cards : [];
        for (var ri = 1; ri <= 5; ri++) {
            var rc = related[ri - 1] || {};
            $('#monster-related-' + ri + '-type').val(rc.type || '');
            $('#monster-related-' + ri + '-name').val(rc.name || '');
        }
        // Creature trait/action groups: 5 rows of title + text each
        MONSTER_ENTRY_GROUPS.forEach(function (g) {
            if (g.mode === 'fixed') {
                var list = Array.isArray(card[g.key]) ? card[g.key] : [];
                for (var ei = 1; ei <= (g.count || 5); ei++) {
                    var entry = list[ei - 1] || {};
                    $('#' + g.prefix + '-' + ei + '-title').val(entry.title || '');
                    $('#' + g.prefix + '-' + ei + '-text').val(entry.text || '');
                }
            } else {
                ui_render_monster_entry_repeater(g, card);
            }
        });
        ui_render_npc_weapons_detailed_repeater(card);
        ui_render_npc_loot_detailed_repeater(card);
        // AC conditional groups
        $('#monster-custom-ac-group').show();
        $('#monster-equipped-armor-group').toggle(card.ac_type === 'equipped');
        $('#monster-natural-armor-group').toggle(card.ac_type === 'natural');
        $('#monster-unarmored-defense-group').toggle(card.ac_type === 'unarmored_defense');
        // Sync checkbox groups from card
        ui_sync_monster_checkboxes_from_card(card);
        // Rebuild the Sections checklist, then show/hide form sections
        ui_sync_sections_from_card(card);
        ui_apply_template_visibility();
        // Gradient mode with a missing or old-format stored gradient: recompute lazily
        if (card.background_mode === 'gradient' && (card.creature_artwork || '').trim()
            && (card.art_gradient || '').indexOf('radial-gradient') !== 0) {
            ui_recompute_art_gradient(card, function () { ui_render_selected_card(); });
        }
    } else {
        getFieldGroup('card').forEach(field => {
            if (window.PERF_SAFE_UPDATES?.silentCardSwitchFieldSync && typeof field.syncValue === 'function') {
                field.syncValue(field.defaultValue);
            } else {
                field.reset();
            }
        });
        if (typeof window.ui_sync_card_template_segmented === 'function') {
            window.ui_sync_card_template_segmented();
        }
        ui_sync_npc_class_controls(null);
        for (var rj = 1; rj <= 5; rj++) {
            $('#monster-related-' + rj + '-type').val('');
            $('#monster-related-' + rj + '-name').val('');
        }
        MONSTER_ENTRY_GROUPS.forEach(function (g) {
            if (g.mode === 'fixed') {
                for (var ej = 1; ej <= (g.count || 5); ej++) {
                    $('#' + g.prefix + '-' + ej + '-title').val('');
                    $('#' + g.prefix + '-' + ej + '-text').val('');
                }
            } else {
                ui_render_monster_entry_repeater(g, null);
            }
        });
        ui_render_npc_weapons_detailed_repeater(null);
        ui_render_npc_loot_detailed_repeater(null);
        $('#monster-equipped-armor-group, #monster-natural-armor-group, #monster-unarmored-defense-group').hide();
        ui_sync_monster_checkboxes_from_card(null);
        ui_sync_sections_from_card(null);
        ui_apply_template_visibility();
    }

    ui_cancel_scheduled_card_render();
    ui_render_selected_card();
    ui_update_monster_calculated_displays();
    if ($('#card-actions').length) ui_update_card_actions();
    // Update section completion counters and Complete buttons after card switch
    if (typeof updateSectionCounters === 'function') updateSectionCounters();
    if (typeof updateSectionCompleteButtons === 'function') updateSectionCompleteButtons();
}

function ui_build_checkbox_group(containerId, list, numCols, cardKey, valueTransform) {
    valueTransform = valueTransform || function (v) { return v; };
    var container = document.getElementById(containerId);
    if (!container || !list || !list.length) return;
    container.innerHTML = '';
    var colSize = Math.ceil(12 / numCols);
    var perCol = Math.ceil(list.length / numCols);
    for (var c = 0; c < numCols; c++) {
        var col = document.createElement('div');
        col.className = 'col-sm-' + colSize;
        for (var i = c * perCol; i < Math.min((c + 1) * perCol, list.length); i++) {
            var name = list[i];
            var val = valueTransform(name);
            var label = document.createElement('label');
            label.className = 'checkbox-inline';
            label.style.display = 'block';
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = val;
            cb.setAttribute('data-monster-array', cardKey);
            label.appendChild(cb);
            label.appendChild(document.createTextNode(' ' + name));
            col.appendChild(label);
        }
        container.appendChild(col);
    }
}

/** Saving-throw-specific checkbox builder: adds a bonus badge after each ability label. */
function ui_build_saving_throw_group(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    var abilities = [
        { name: 'Strength',     key: 'strength',     stat: 'str' },
        { name: 'Dexterity',    key: 'dexterity',    stat: 'dex' },
        { name: 'Constitution', key: 'constitution', stat: 'con' },
        { name: 'Intelligence', key: 'intelligence', stat: 'int' },
        { name: 'Wisdom',       key: 'wisdom',       stat: 'wis' },
        { name: 'Charisma',     key: 'charisma',     stat: 'cha' }
    ];
    var numCols = 3;
    var colSize = Math.ceil(12 / numCols); // 4
    var perCol = Math.ceil(abilities.length / numCols); // 2
    for (var c = 0; c < numCols; c++) {
        var col = document.createElement('div');
        col.className = 'col-sm-' + colSize;
        for (var i = c * perCol; i < Math.min((c + 1) * perCol, abilities.length); i++) {
            var ab = abilities[i];
            var wrapper = document.createElement('div');
            wrapper.className = 'st-row';
            var label = document.createElement('label');
            label.className = 'checkbox-inline';
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = ab.key;
            cb.setAttribute('data-monster-array', 'saving_throw_proficiencies');
            label.appendChild(cb);
            label.appendChild(document.createTextNode(' ' + ab.name));
            var addon = document.createElement('span');
            addon.className = 'input-group-addon st-bonus-addon';
            addon.id = 'st-bonus-' + ab.key;
            addon.textContent = '—';
            wrapper.appendChild(label);
            wrapper.appendChild(addon);
            col.appendChild(wrapper);
        }
        container.appendChild(col);
    }
}

function ui_sync_monster_checkboxes_from_card(card) {
    function syncGroup(containerId, cardKey) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var arr = (card && card[cardKey]) ? card[cardKey] : [];
        if (!Array.isArray(arr)) arr = [];
        var checkboxes = container.querySelectorAll('input[type="checkbox"][data-monster-array="' + cardKey + '"]');
        checkboxes.forEach(function (cb) {
            cb.checked = arr.indexOf(cb.value) !== -1;
        });
    }
    syncGroup('monster-damage-resistances-cb', 'damage_resistances');
    syncGroup('monster-damage-immunities-cb', 'damage_immunities');
    syncGroup('monster-damage-vulnerabilities-cb', 'damage_vulnerabilities');
    syncGroup('monster-condition-immunities-cb', 'condition_immunities');
    syncGroup('monster-saving-throws-cb', 'saving_throw_proficiencies');
    syncGroup('monster-languages-standard-cb', 'languages');
    syncGroup('monster-languages-exotic-cb', 'languages');
    syncGroup('item-sentient-languages-standard-cb', 'item_sentient_languages');
    syncGroup('item-sentient-languages-exotic-cb', 'item_sentient_languages');
    syncGroup('item-properties-cb', 'item_properties');
    syncGroup('item-focus-cb', 'item_focus_classes');
}

// Item multiselect option lists
var ITEM_PROPERTIES = ['Ammunition', 'Burst Fire', 'Finesse', 'Heavy', 'Light', 'Loading', 'Reach', 'Reload', 'Thrown', 'Two-Handed', 'Versatile', 'Vestige of Divergence', 'Special'];
var ITEM_FOCUS_CLASSES = ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];

// Creature trait/action entry groups: form id prefix ↔ card array key
var MONSTER_ENTRY_GROUPS = [
    { prefix: 'monster-trait', key: 'traits', mode: 'repeater', label: 'Trait', containerId: 'monster-traits-repeater', addButtonId: 'monster-traits-add-btn', emptyText: 'No traits added yet.', cardLayout: true, cardTagLabel: 'Trait', supportsNotation: true },
    { prefix: 'monster-action', key: 'actions', mode: 'repeater', label: 'Action', containerId: 'monster-actions-repeater', addButtonId: 'monster-actions-add-btn', emptyText: 'No actions added yet.', hasAttackMeta: true, cardLayout: true, supportsNotation: true, addButtons: [{ id: 'monster-actions-add-attack-btn', kind: 'attack' }, { id: 'monster-actions-add-btn', kind: 'feature' }] },
    { prefix: 'monster-bonusaction', key: 'bonus_actions', mode: 'repeater', label: 'Bonus Action', containerId: 'monster-bonusactions-repeater', addButtonId: 'monster-bonusactions-add-btn', emptyText: 'No bonus actions added yet.', hasAttackMeta: true, cardLayout: true, supportsNotation: true, addButtons: [{ id: 'monster-bonusactions-add-attack-btn', kind: 'attack' }, { id: 'monster-bonusactions-add-btn', kind: 'feature' }] },
    { prefix: 'monster-reaction', key: 'reactions', mode: 'repeater', label: 'Reaction', containerId: 'monster-reactions-repeater', addButtonId: 'monster-reactions-add-btn', emptyText: 'No reactions added yet.', hasTriggerField: true, cardLayout: true, cardTagLabel: 'Reaction', supportsNotation: true },
    { prefix: 'monster-legendary', key: 'legendary_actions', mode: 'repeater', label: 'Legendary Action', containerId: 'monster-legendary-repeater', addButtonId: 'monster-legendary-add-btn', emptyText: 'No legendary actions added yet.', cardLayout: true, cardTagLabel: 'Legendary', hasCostField: true, supportsNotation: true },
    { prefix: 'item-feature', key: 'item_features', mode: 'repeater', label: 'Benefit', containerId: 'item-features-repeater', addButtonId: 'item-features-add-btn', emptyText: 'No benefits added yet.', cardLayout: true, cardTagLabel: 'Benefit', supportsNotation: true }
];

var ui_monster_entry_active_indices = {};

function ui_get_monster_entry_active_index(group, listLength) {
    var index = ui_monster_entry_active_indices[group.key];
    if (!Number.isFinite(index)) index = 0;
    if (listLength <= 0) return 0;
    index = Math.max(0, Math.min(index, listLength - 1));
    ui_monster_entry_active_indices[group.key] = index;
    return index;
}

function ui_set_monster_entry_active_index(group, index) {
    ui_monster_entry_active_indices[group.key] = Math.max(0, Number(index) || 0);
}

function ui_monster_entry_kind(entry, group) {
    if (!group || !group.hasAttackMeta) return 'feature';
    var explicitKind = String(entry && entry.action_kind || '').trim();
    if (explicitKind === 'attack' || explicitKind === 'feature') return explicitKind;
    var attackType = String(entry && entry.attack_type || '').trim();
    var attackClassification = String(entry && entry.attack_classification || '').trim();
    var attackAbility = String(entry && entry.attack_ability || '').trim();
    var reach = String(entry && entry.reach || '').trim();
    var rangeNormal = String(entry && entry.range_normal || '').trim();
    var rangeLong = String(entry && entry.range_long || '').trim();
    return (attackType || attackClassification || reach || rangeNormal || rangeLong || (attackAbility && attackAbility !== 'auto')) ? 'attack' : 'feature';
}

function ui_monster_entry_fallback_title(group, entryKind) {
    if (entryKind === 'attack') return 'Unnamed Attack';
    if (group && group.label) return 'Unnamed ' + group.label;
    return 'Unnamed Action';
}

function ui_monster_entry_card_tag_label(group, entryKind) {
    if (entryKind === 'attack') return 'Attack';
    if (group && group.cardTagLabel) return group.cardTagLabel;
    return 'Feature';
}

function ui_monster_action_notation_toolbar_html(group) {
    if (!group || !group.supportsNotation) return '';
    return '' +
        '    <div class="monster-notation-toolbar" aria-label="Insert notation">' +
        '      <span class="monster-notation-toolbar-label">Insert:</span>' +
        '      <button type="button" class="monster-notation-token monster-notation-token-damage" draggable="true" data-notation="@damage[1d6|bonus=auto|type=slashing]" data-select-text="1d6" title="Click to insert at the cursor, or drag into the text box">' +
        '        <i class="fa-solid fa-dice-d20" aria-hidden="true"></i><span>Damage</span>' +
        '      </button>' +
        '      <button type="button" class="monster-notation-token monster-notation-token-save" draggable="true" data-notation="@save[dex|dc=auto]" data-select-text="dex" title="Click to insert at the cursor, or drag into the text box">' +
        '        <i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span>Saving Throw</span>' +
        '      </button>' +
        '      <span class="monster-notation-toolbar-hint">Click or drag into the text</span>' +
        '    </div>';
}

function ui_insert_textarea_notation(textarea, notation, selectText, start, end) {
    if (!textarea || !notation) return false;
    var value = String(textarea.value || '');
    var selectionStart = Number.isFinite(start) ? start : textarea.selectionStart;
    var selectionEnd = Number.isFinite(end) ? end : textarea.selectionEnd;
    if (!Number.isFinite(selectionStart)) selectionStart = value.length;
    if (!Number.isFinite(selectionEnd)) selectionEnd = selectionStart;
    selectionStart = Math.max(0, Math.min(selectionStart, value.length));
    selectionEnd = Math.max(selectionStart, Math.min(selectionEnd, value.length));

    if (typeof textarea.setRangeText === 'function') {
        textarea.setRangeText(notation, selectionStart, selectionEnd, 'end');
    } else {
        textarea.value = value.slice(0, selectionStart) + notation + value.slice(selectionEnd);
    }

    var insertedStart = selectionStart;
    var editableOffset = selectText ? notation.indexOf(selectText) : -1;
    if (editableOffset >= 0) {
        textarea.setSelectionRange(insertedStart + editableOffset, insertedStart + editableOffset + selectText.length);
    } else {
        var caret = insertedStart + notation.length;
        textarea.setSelectionRange(caret, caret);
    }
    return true;
}

function ui_monster_entry_repeater_row_html(group, entry, index) {
    entry = entry || {};
    var entryKind = ui_monster_entry_kind(entry, group);
    var isAttack = entryKind === 'attack';
    var label = (group.hasAttackMeta ? (isAttack ? 'Attack' : 'Action') : group.label) + ' ' + (index + 1);
    var isRangedAttack = entry.attack_type === 'ranged';
    var attackDistanceFields = '';
    if (group.hasAttackMeta && isAttack && isRangedAttack) {
        attackDistanceFields =
          '      <div>' +
          '\n' +
          '        <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-range-normal">Normal Range (ft.)</label>' +
          '\n' +
          '        <input type="number" min="0" step="5" id="' + group.prefix + '-' + index + '-range-normal" class="form-control monster-entry-repeater-range-normal" placeholder="80" value="' + escape_html(entry.range_normal || '') + '">' +
          '\n' +
          '      </div>' +
          '\n' +
          '      <div>' +
          '\n' +
          '        <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-range-long">Long Range (ft.)</label>' +
          '\n' +
          '        <input type="number" min="0" step="5" id="' + group.prefix + '-' + index + '-range-long" class="form-control monster-entry-repeater-range-long" placeholder="320" value="' + escape_html(entry.range_long || '') + '">' +
          '\n' +
          '      </div>' +
          '\n' +
          '      <input type="hidden" class="monster-entry-repeater-reach" value="' + escape_html(entry.reach || '') + '">' +
          '\n';
    } else if (group.hasAttackMeta && isAttack) {
        attackDistanceFields =
          '      <div>' +
          '\n' +
          '        <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-reach">Reach (ft.)</label>' +
          '\n' +
          '        <input type="number" min="0" step="5" id="' + group.prefix + '-' + index + '-reach" class="form-control monster-entry-repeater-reach" placeholder="5" value="' + escape_html(entry.reach || '') + '">' +
          '\n' +
          '      </div>' +
          '\n' +
          '      <input type="hidden" class="monster-entry-repeater-range-normal" value="' + escape_html(entry.range_normal || '') + '">' +
          '\n' +
          '      <input type="hidden" class="monster-entry-repeater-range-long" value="' + escape_html(entry.range_long || '') + '">' +
          '\n';
    }
    var attackTypeField = group.hasAttackMeta && isAttack
        ? '    <div class="monster-entry-repeater-meta-grid">' +
          '\n' +
          '      <div>' +
          '\n' +
          '        <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-attack-type">Attack Type</label>' +
          '\n' +
          '        <select id="' + group.prefix + '-' + index + '-attack-type" class="form-control monster-entry-repeater-attack-type">' +
          '\n' +
          '          <option value=""' + (!entry.attack_type ? ' selected' : '') + '>Unspecified</option>' +
          '\n' +
          '          <option value="melee"' + (entry.attack_type === 'melee' ? ' selected' : '') + '>Melee</option>' +
          '\n' +
          '          <option value="ranged"' + (entry.attack_type === 'ranged' ? ' selected' : '') + '>Ranged</option>' +
          '\n' +
          '        </select>' +
          '\n' +
          '      </div>' +
          '\n' +
          '      <div>' +
          '\n' +
          '        <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-attack-classification">Attack Classification</label>' +
          '\n' +
          '        <select id="' + group.prefix + '-' + index + '-attack-classification" class="form-control monster-entry-repeater-attack-classification">' +
          '\n' +
          '          <option value=""' + (!entry.attack_classification ? ' selected' : '') + '>Unspecified</option>' +
          '\n' +
          '          <option value="weapon"' + (entry.attack_classification === 'weapon' ? ' selected' : '') + '>Weapon</option>' +
          '\n' +
          '          <option value="spell"' + (entry.attack_classification === 'spell' ? ' selected' : '') + '>Spell</option>' +
          '\n' +
          '          <option value="unarmed"' + (entry.attack_classification === 'unarmed' ? ' selected' : '') + '>Unarmed</option>' +
          '\n' +
          '        </select>' +
          '\n' +
          '      </div>' +
          '\n' +
          '      <div>' +
          '\n' +
          '        <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-attack-ability">Attack Ability</label>' +
          '\n' +
          '        <select id="' + group.prefix + '-' + index + '-attack-ability" class="form-control monster-entry-repeater-attack-ability">' +
          '\n' +
          '          <option value="auto"' + (((entry.attack_ability || 'auto') === 'auto') ? ' selected' : '') + '>Auto</option>' +
          '\n' +
          '          <option value="str"' + (entry.attack_ability === 'str' ? ' selected' : '') + '>STR</option>' +
          '\n' +
          '          <option value="dex"' + (entry.attack_ability === 'dex' ? ' selected' : '') + '>DEX</option>' +
          '\n' +
          '          <option value="con"' + (entry.attack_ability === 'con' ? ' selected' : '') + '>CON</option>' +
          '\n' +
          '          <option value="int"' + (entry.attack_ability === 'int' ? ' selected' : '') + '>INT</option>' +
          '\n' +
          '          <option value="wis"' + (entry.attack_ability === 'wis' ? ' selected' : '') + '>WIS</option>' +
          '\n' +
          '          <option value="cha"' + (entry.attack_ability === 'cha' ? ' selected' : '') + '>CHA</option>' +
          '\n' +
          '        </select>' +
          '\n' +
          '      </div>' +
          '\n' +
          attackDistanceFields +
          '    </div>' +
          '\n'
        : '';
    var triggerField = group.hasTriggerField
        ? '    <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-trigger">Trigger</label>' +
          '\n' +
          '    <input type="text" id="' + group.prefix + '-' + index + '-trigger" class="form-control monster-entry-repeater-trigger" placeholder="Trigger" style="margin-bottom:2px;" value="' + escape_html(entry.trigger || '') + '">' +
          '\n'
        : '';
    var costField = group.hasCostField
        ? '    <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-legendary-cost">Legendary Action Cost</label>' +
          '\n' +
          '    <input type="number" min="1" step="1" id="' + group.prefix + '-' + index + '-legendary-cost" class="form-control monster-entry-repeater-legendary-cost" placeholder="1" style="margin-bottom:2px;" value="' + escape_html(entry.legendary_cost || '1') + '">' +
          '\n'
        : '';
    var responseLabel = group.hasTriggerField ? 'Response' : (group.hasAttackMeta ? (isAttack ? 'Hit' : 'Effect') : 'Description');
    var notationToolbar = ui_monster_action_notation_toolbar_html(group);
    return '' +
        '<div class="form-group monster-entry-row monster-entry-repeater-row" data-index="' + index + '" data-entry-kind="' + entryKind + '">' +
        '  <label class="col-sm-3 control-label" for="' + group.prefix + '-' + index + '-title">' + label + '</label>' +
        '  <div class="col-sm-9">' +
        '    <div class="item-feature-actions">' +
        '      <button type="button" class="entry-repeater-remove-btn" data-remove-index="' + index + '" aria-label="Remove ' + group.label.toLowerCase() + '" title="Remove ' + group.label.toLowerCase() + '">&times;</button>' +
        '    </div>' +
        (group.hasAttackMeta ? '    <input type="hidden" class="monster-entry-repeater-kind" value="' + entryKind + '">' : '') +
        '    <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-title">Name</label>' +
        '    <input type="text" id="' + group.prefix + '-' + index + '-title" class="form-control monster-entry-repeater-title" placeholder="Name" style="margin-bottom:2px;" value="' + escape_html(entry.title || '') + '">' +
        attackTypeField +
        triggerField +
        costField +
        '    <label class="monster-entry-repeater-field-label" for="' + group.prefix + '-' + index + '-text">' + responseLabel + '</label>' +
        notationToolbar +
        '    <textarea id="' + group.prefix + '-' + index + '-text" class="form-control monster-entry-repeater-text" rows="2" placeholder="' + responseLabel + '">' + escape_html(entry.text || '') + '</textarea>' +
        '  </div>' +
        '</div>';
}

function ui_monster_action_hidden_fields_html(group, entry, index, entryKind) {
    return '' +
        '<input type="hidden" class="monster-entry-repeater-kind" value="' + escape_html(entryKind) + '">' +
        '<input type="hidden" class="monster-entry-repeater-title" value="' + escape_html(entry.title || '') + '">' +
        '<input type="hidden" class="monster-entry-repeater-attack-type" value="' + escape_html(entry.attack_type || '') + '">' +
        '<input type="hidden" class="monster-entry-repeater-attack-classification" value="' + escape_html(entry.attack_classification || '') + '">' +
        '<input type="hidden" class="monster-entry-repeater-attack-ability" value="' + escape_html(entry.attack_ability || 'auto') + '">' +
        '<input type="hidden" class="monster-entry-repeater-reach" value="' + escape_html(entry.reach || '') + '">' +
        '<input type="hidden" class="monster-entry-repeater-range-normal" value="' + escape_html(entry.range_normal || '') + '">' +
        '<input type="hidden" class="monster-entry-repeater-range-long" value="' + escape_html(entry.range_long || '') + '">' +
        '<input type="hidden" class="monster-entry-repeater-legendary-cost" value="' + escape_html(entry.legendary_cost || '1') + '">' +
        '<input type="hidden" class="monster-entry-repeater-trigger" value="' + escape_html(entry.trigger || '') + '">' +
        '<input type="hidden" class="monster-entry-repeater-text" value="' + escape_html(entry.text || '') + '">';
}

function ui_monster_action_card_row_html(group, entry, index, activeIndex) {
    entry = entry || {};
    var entryKind = ui_monster_entry_kind(entry, group);
    var isAttack = entryKind === 'attack';
    var isActive = index === activeIndex;
    var title = (entry.title || '').trim() || ui_monster_entry_fallback_title(group, entryKind);
    var tagLabel = ui_monster_entry_card_tag_label(group, entryKind);
    var entryLabel = String(group.label || 'entry').toLowerCase();
    var detailHtml = isActive ? ui_monster_entry_repeater_row_html(group, entry, index) : ui_monster_action_hidden_fields_html(group, entry, index, entryKind);
    return '' +
        '<div class="monster-action-card monster-entry-repeater-row' + (isActive ? ' is-active' : '') + '" data-index="' + index + '" data-entry-kind="' + entryKind + '" draggable="true">' +
        '  <div class="monster-action-card-summary" role="button" tabindex="0" aria-label="Select ' + escape_html(title) + '">' +
        '    <i class="fa-solid fa-grip-vertical monster-action-card-grip" aria-hidden="true"></i>' +
        '    <span class="monster-action-card-main">' +
        '      <span class="monster-action-card-tag monster-action-card-tag-' + entryKind + '">' + tagLabel + '</span>' +
        '      <span class="monster-action-card-title">' + escape_html(title) + '</span>' +
        '    </span>' +
        (isActive
            ? '    <span class="monster-action-card-actions">' +
              '      <button type="button" class="monster-action-card-icon-btn monster-action-duplicate-btn" data-entry-index="' + index + '" title="Duplicate ' + escape_html(entryLabel) + '" aria-label="Duplicate ' + escape_html(entryLabel) + '">' + DECK_COPY_ICON_SVG + '<span class="sr-only">Duplicate ' + escape_html(entryLabel) + '</span></button>' +
              '      <button type="button" class="monster-action-card-icon-btn monster-action-delete-btn" data-entry-index="' + index + '" title="Delete ' + escape_html(entryLabel) + '" aria-label="Delete ' + escape_html(entryLabel) + '">' + DECK_DELETE_ICON_SVG + '<span class="sr-only">Delete ' + escape_html(entryLabel) + '</span></button>' +
              '    </span>'
            : '') +
        '  </div>' +
        '  <div class="monster-action-card-detail">' + detailHtml + '</div>' +
        '</div>';
}

function ui_monster_entry_repeater_list_from_dom(group) {
    var containerId = group.containerId;
    var usesActionKind = !!(group && group.hasAttackMeta);
    var list = [];
    $('#' + containerId).children('.monster-entry-repeater-row').each(function () {
        var actionKind = usesActionKind ? ($(this).find('.monster-entry-repeater-kind').val() || 'feature') : '';
        var title = ($(this).find('.monster-entry-repeater-title').val() || '');
        var attackType = ($(this).find('.monster-entry-repeater-attack-type').val() || '');
        var attackClassification = ($(this).find('.monster-entry-repeater-attack-classification').val() || '');
        var attackAbility = ($(this).find('.monster-entry-repeater-attack-ability').val() || '');
        var reach = ($(this).find('.monster-entry-repeater-reach').val() || '');
        var rangeNormal = ($(this).find('.monster-entry-repeater-range-normal').val() || '');
        var rangeLong = ($(this).find('.monster-entry-repeater-range-long').val() || '');
        var legendaryCost = ($(this).find('.monster-entry-repeater-legendary-cost').val() || '');
        var trigger = ($(this).find('.monster-entry-repeater-trigger').val() || '');
        var text = ($(this).find('.monster-entry-repeater-text').val() || '');
        var hasAttackAbilityOverride = attackAbility.trim() && attackAbility !== 'auto';
        var hasLegendaryCost = group.hasCostField && legendaryCost.trim() && legendaryCost !== '1';
        if (title.trim() || (usesActionKind && actionKind.trim()) || attackType.trim() || attackClassification.trim() || hasAttackAbilityOverride || reach.trim() || rangeNormal.trim() || rangeLong.trim() || hasLegendaryCost || trigger.trim() || text.trim()) {
            list.push({
                title: title,
                action_kind: actionKind,
                attack_type: attackType,
                attack_classification: attackClassification,
                attack_ability: attackAbility || 'auto',
                reach: reach,
                range_normal: rangeNormal,
                range_long: rangeLong,
                legendary_cost: legendaryCost || '1',
                trigger: trigger,
                text: text
            });
        }
    });
    return list;
}

function ui_sync_monster_entry_repeater_from_dom(group, renderDeferred) {
    var card = ui_selected_card();
    if (!card) return;
    card[group.key] = ui_monster_entry_repeater_list_from_dom(group);
    if (renderDeferred && window.PERF_SAFE_UPDATES?.scheduleGroupRowPreviewRenders && typeof ui_render_selected_card_deferred === 'function') {
        ui_render_selected_card_deferred();
    } else {
        ui_cancel_scheduled_card_render();
        ui_render_selected_card();
    }
    local_store_save();
    if (typeof updateSectionCounters === 'function') updateSectionCounters();
}

function ui_after_monster_entry_card_change(group, card) {
    ui_render_monster_entry_repeater(group, card);
    ui_cancel_scheduled_card_render();
    ui_render_selected_card();
    local_store_save();
    if (typeof updateSectionCounters === 'function') updateSectionCounters();
}

function ui_duplicate_monster_entry(group, index) {
    var card = ui_selected_card();
    if (!card) return;
    if (!Array.isArray(card[group.key])) card[group.key] = [];
    if (!Number.isFinite(index) || index < 0 || index >= card[group.key].length) return;
    var source = card[group.key][index] || {};
    var copy = $.extend({}, source);
    copy.title = (copy.title || ui_monster_entry_fallback_title(group, ui_monster_entry_kind(copy, group)).replace(/^Unnamed /, '')) + ' (Copy)';
    card[group.key].splice(index + 1, 0, copy);
    ui_set_monster_entry_active_index(group, index + 1);
    ui_after_monster_entry_card_change(group, card);
}

function ui_delete_monster_entry(group, index) {
    var card = ui_selected_card();
    if (!card) return;
    if (!Array.isArray(card[group.key])) card[group.key] = [];
    if (!Number.isFinite(index) || index < 0 || index >= card[group.key].length) return;
    card[group.key].splice(index, 1);
    ui_set_monster_entry_active_index(group, Math.min(index, card[group.key].length - 1));
    ui_after_monster_entry_card_change(group, card);
}

function ui_move_monster_entry(group, fromIndex, toIndex) {
    var card = ui_selected_card();
    if (!card || !Array.isArray(card[group.key])) return;
    var list = card[group.key];
    if (!Number.isFinite(fromIndex) || !Number.isFinite(toIndex)) return;
    if (fromIndex < 0 || fromIndex >= list.length) return;
    toIndex = Math.max(0, Math.min(toIndex, list.length));
    if (fromIndex === toIndex || fromIndex + 1 === toIndex) return;
    var moved = list.splice(fromIndex, 1)[0];
    if (fromIndex < toIndex) toIndex--;
    list.splice(toIndex, 0, moved);
    ui_set_monster_entry_active_index(group, toIndex);
    ui_after_monster_entry_card_change(group, card);
}

function ui_render_monster_entry_repeater(group, card) {
    var container = document.getElementById(group.containerId);
    if (!container) return;
    var list = (card && Array.isArray(card[group.key])) ? card[group.key] : [];
    if (!list.length) {
        container.innerHTML = '<p class="item-repeater-empty">' + escape_html(group.emptyText || 'No entries added yet.') + '</p>';
        return;
    }
    if (group.cardLayout) {
        var activeIndex = ui_get_monster_entry_active_index(group, list.length);
        container.innerHTML = list.map(function (entry, index) {
            return ui_monster_action_card_row_html(group, entry, index, activeIndex);
        }).join('');
        return;
    }
    container.innerHTML = list.map(function (entry, index) {
        return ui_monster_entry_repeater_row_html(group, entry, index);
    }).join('');
}

function ui_npc_weapon_ability_options(value, includeNone) {
    var selected = String(value || 'auto').toLowerCase();
    var options = [
        ['auto', 'Auto (STR/DEX)'],
        ['str', 'Strength'],
        ['dex', 'Dexterity'],
        ['con', 'Constitution'],
        ['int', 'Intelligence'],
        ['wis', 'Wisdom'],
        ['cha', 'Charisma']
    ];
    if (includeNone) options.splice(1, 0, ['none', 'None']);
    return options.map(function (option) {
        return '<option value="' + option[0] + '"' + (selected === option[0] ? ' selected' : '') + '>' + option[1] + '</option>';
    }).join('');
}

function ui_npc_weapon_item_tag_options(value) {
    var selected = String(value || '').trim();
    return [
        ['', 'None'],
        ['magic-item', 'Magic Item'],
        ['quest-item', 'Quest Item']
    ].map(function (option) {
        return '<option value="' + option[0] + '"' + (selected === option[0] ? ' selected' : '') + '>' + option[1] + '</option>';
    }).join('');
}

var NPC_INVENTORY_DETAIL_GROUPS = [
    { key: 'npc_weapons_detailed', type: 'weapon', label: 'Detailed Weapon', tagLabel: 'Weapon', containerId: 'npc-weapons-detailed-repeater', addButtonId: 'npc-weapons-detailed-add-btn', emptyText: 'No detailed weapons added yet.' },
    { key: 'npc_loot_detailed', type: 'loot', label: 'Detailed Loot', tagLabel: 'Loot', containerId: 'npc-loot-detailed-repeater', addButtonId: 'npc-loot-detailed-add-btn', emptyText: 'No detailed loot added yet.' }
];

var ui_npc_inventory_active_indices = {};

function ui_get_npc_inventory_active_index(group, listLength) {
    var index = ui_npc_inventory_active_indices[group.key];
    if (!Number.isFinite(index)) index = 0;
    if (listLength <= 0) return 0;
    index = Math.max(0, Math.min(index, listLength - 1));
    ui_npc_inventory_active_indices[group.key] = index;
    return index;
}

function ui_set_npc_inventory_active_index(group, index) {
    ui_npc_inventory_active_indices[group.key] = Math.max(0, Number(index) || 0);
}

function ui_npc_inventory_fallback_title(group) {
    return group.type === 'weapon' ? 'Unnamed Weapon' : 'Unnamed Loot';
}

function ui_npc_inventory_default_entry(group) {
    if (group.type === 'weapon') {
        return {
            name: '',
            item_tag: '',
            attack_ability: 'auto',
            attack_bonus_override: '',
            damage_dice: '',
            damage_ability: 'auto',
            damage_type: '',
            notes: ''
        };
    }
    return { name: '', item_tag: '', notes: '' };
}

function ui_npc_inventory_hidden_fields_html(group, entry) {
    entry = entry || {};
    var html = '' +
        '<input type="hidden" class="npc-inventory-field npc-inventory-name" value="' + escape_html(entry.name || '') + '">' +
        '<input type="hidden" class="npc-inventory-field npc-inventory-item-tag" value="' + escape_html(entry.item_tag || '') + '">' +
        '<input type="hidden" class="npc-inventory-field npc-inventory-notes" value="' + escape_html(entry.notes || '') + '">';
    if (group.type === 'weapon') {
        html +=
            '<input type="hidden" class="npc-inventory-field npc-weapon-attack-ability" value="' + escape_html(entry.attack_ability || 'auto') + '">' +
            '<input type="hidden" class="npc-inventory-field npc-weapon-attack-bonus-override" value="' + escape_html(entry.attack_bonus_override || '') + '">' +
            '<input type="hidden" class="npc-inventory-field npc-weapon-damage-dice" value="' + escape_html(entry.damage_dice || '') + '">' +
            '<input type="hidden" class="npc-inventory-field npc-weapon-damage-ability" value="' + escape_html(entry.damage_ability || 'auto') + '">' +
            '<input type="hidden" class="npc-inventory-field npc-weapon-damage-type" value="' + escape_html(entry.damage_type || '') + '">';
    }
    return html;
}

function ui_npc_inventory_detail_fields_html(group, entry, index) {
    entry = entry || {};
    var prefix = group.type === 'weapon' ? 'npc-weapon' : 'npc-loot';
    var weaponFields = group.type === 'weapon'
        ? '      <div>' +
          '        <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-attack-ability">Attack Ability</label>' +
          '        <select id="' + prefix + '-' + index + '-attack-ability" class="form-control npc-inventory-field npc-weapon-attack-ability">' + ui_npc_weapon_ability_options(entry.attack_ability || 'auto', false) + '</select>' +
          '      </div>' +
          '      <div>' +
          '        <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-attack-bonus">Hit Override</label>' +
          '        <input type="text" id="' + prefix + '-' + index + '-attack-bonus" class="form-control npc-inventory-field npc-weapon-attack-bonus-override" placeholder="auto" value="' + escape_html(entry.attack_bonus_override || '') + '">' +
          '      </div>' +
          '      <div>' +
          '        <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-damage-dice">Damage Dice</label>' +
          '        <input type="text" id="' + prefix + '-' + index + '-damage-dice" class="form-control npc-inventory-field npc-weapon-damage-dice" placeholder="1d8" value="' + escape_html(entry.damage_dice || '') + '">' +
          '      </div>' +
          '      <div>' +
          '        <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-damage-ability">Damage Ability</label>' +
          '        <select id="' + prefix + '-' + index + '-damage-ability" class="form-control npc-inventory-field npc-weapon-damage-ability">' + ui_npc_weapon_ability_options(entry.damage_ability || 'auto', true) + '</select>' +
          '      </div>' +
          '      <div>' +
          '        <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-damage-type">Damage Type</label>' +
          '        <input type="text" id="' + prefix + '-' + index + '-damage-type" class="form-control npc-inventory-field npc-weapon-damage-type" placeholder="slashing" value="' + escape_html(entry.damage_type || '') + '">' +
          '      </div>'
        : '';
    return '' +
        '<div class="npc-inventory-detail-fields">' +
        '  <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-name">Name</label>' +
        '  <input type="text" id="' + prefix + '-' + index + '-name" class="form-control npc-inventory-field npc-inventory-name" placeholder="' + (group.type === 'weapon' ? 'Longsword' : 'Silver whistle') + '" style="margin-bottom:6px;" value="' + escape_html(entry.name || '') + '">' +
        '  <div class="monster-entry-repeater-meta-grid npc-inventory-meta-grid">' +
        '    <div>' +
        '      <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-item-tag">Item Tag</label>' +
        '      <select id="' + prefix + '-' + index + '-item-tag" class="form-control npc-inventory-field npc-inventory-item-tag">' + ui_npc_weapon_item_tag_options(entry.item_tag || '') + '</select>' +
        '    </div>' +
        weaponFields +
        '    <div>' +
        '      <label class="monster-entry-repeater-field-label" for="' + prefix + '-' + index + '-notes">Notes</label>' +
        '      <input type="text" id="' + prefix + '-' + index + '-notes" class="form-control npc-inventory-field npc-inventory-notes" placeholder="' + (group.type === 'weapon' ? 'versatile, thrown...' : 'optional note...') + '" value="' + escape_html(entry.notes || '') + '">' +
        '    </div>' +
        '  </div>' +
        '</div>';
}

function ui_npc_inventory_card_row_html(group, entry, index, activeIndex) {
    entry = entry || {};
    var isActive = index === activeIndex;
    var title = String(entry.name || '').trim() || ui_npc_inventory_fallback_title(group);
    var detailHtml = isActive ? ui_npc_inventory_detail_fields_html(group, entry, index) : ui_npc_inventory_hidden_fields_html(group, entry);
    var entryLabel = String(group.label || 'entry').toLowerCase();
    return '' +
        '<div class="monster-action-card npc-inventory-card npc-' + group.type + '-row' + (isActive ? ' is-active' : '') + '" data-index="' + index + '" draggable="true">' +
        '  <div class="monster-action-card-summary npc-inventory-summary" role="button" tabindex="0" aria-label="Select ' + escape_html(title) + '">' +
        '    <i class="fa-solid fa-grip-vertical monster-action-card-grip" aria-hidden="true"></i>' +
        '    <span class="monster-action-card-main">' +
        '      <span class="monster-action-card-tag monster-action-card-tag-' + (group.type === 'weapon' ? 'attack' : 'feature') + '">' + escape_html(group.tagLabel) + '</span>' +
        '      <span class="monster-action-card-title">' + escape_html(title) + '</span>' +
        '    </span>' +
        (isActive
            ? '    <span class="monster-action-card-actions">' +
              '      <button type="button" class="monster-action-card-icon-btn npc-inventory-duplicate-btn" data-entry-index="' + index + '" title="Duplicate ' + escape_html(entryLabel) + '" aria-label="Duplicate ' + escape_html(entryLabel) + '">' + DECK_COPY_ICON_SVG + '<span class="sr-only">Duplicate ' + escape_html(entryLabel) + '</span></button>' +
              '      <button type="button" class="monster-action-card-icon-btn monster-action-card-danger-btn npc-inventory-delete-btn" data-entry-index="' + index + '" title="Delete ' + escape_html(entryLabel) + '" aria-label="Delete ' + escape_html(entryLabel) + '">' + DECK_DELETE_ICON_SVG + '<span class="sr-only">Delete ' + escape_html(entryLabel) + '</span></button>' +
              '    </span>'
            : '') +
        '  </div>' +
        '  <div class="monster-action-card-detail">' + detailHtml + '</div>' +
        '</div>';
}

function ui_npc_inventory_list_from_dom(group) {
    var list = [];
    $('#' + group.containerId).children('.npc-inventory-card').each(function () {
        var entry = {
            name: ($(this).find('.npc-inventory-name').val() || ''),
            item_tag: ($(this).find('.npc-inventory-item-tag').val() || ''),
            notes: ($(this).find('.npc-inventory-notes').val() || '')
        };
        if (group.type === 'weapon') {
            entry = $.extend(entry, {
            attack_ability: ($(this).find('.npc-weapon-attack-ability').val() || 'auto'),
            attack_bonus_override: ($(this).find('.npc-weapon-attack-bonus-override').val() || ''),
            damage_dice: ($(this).find('.npc-weapon-damage-dice').val() || ''),
            damage_ability: ($(this).find('.npc-weapon-damage-ability').val() || 'auto'),
                damage_type: ($(this).find('.npc-weapon-damage-type').val() || '')
            });
        }
        list.push(entry);
    });
    return list;
}

function ui_sync_npc_inventory_from_dom(group, renderDeferred) {
    var card = ui_selected_card();
    if (!card) return;
    card[group.key] = ui_npc_inventory_list_from_dom(group);
    if (renderDeferred && window.PERF_SAFE_UPDATES?.scheduleGroupRowPreviewRenders && typeof ui_render_selected_card_deferred === 'function') {
        ui_render_selected_card_deferred();
    } else {
        ui_cancel_scheduled_card_render();
        ui_render_selected_card();
    }
    local_store_save();
    if (typeof updateSectionCounters === 'function') updateSectionCounters();
}

function ui_after_npc_inventory_card_change(group, card) {
    ui_render_npc_inventory_repeater(group, card);
    ui_cancel_scheduled_card_render();
    ui_render_selected_card();
    local_store_save();
    if (typeof updateSectionCounters === 'function') updateSectionCounters();
}

function ui_duplicate_npc_inventory_entry(group, index) {
    var card = ui_selected_card();
    if (!card) return;
    if (!Array.isArray(card[group.key])) card[group.key] = [];
    if (!Number.isFinite(index) || index < 0 || index >= card[group.key].length) return;
    var copy = $.extend({}, card[group.key][index] || {});
    copy.name = (copy.name || ui_npc_inventory_fallback_title(group).replace(/^Unnamed /, '')) + ' (Copy)';
    card[group.key].splice(index + 1, 0, copy);
    ui_set_npc_inventory_active_index(group, index + 1);
    ui_after_npc_inventory_card_change(group, card);
}

function ui_delete_npc_inventory_entry(group, index) {
    var card = ui_selected_card();
    if (!card) return;
    if (!Array.isArray(card[group.key])) card[group.key] = [];
    if (!Number.isFinite(index) || index < 0 || index >= card[group.key].length) return;
    card[group.key].splice(index, 1);
    ui_set_npc_inventory_active_index(group, Math.min(index, card[group.key].length - 1));
    ui_after_npc_inventory_card_change(group, card);
}

function ui_move_npc_inventory_entry(group, fromIndex, toIndex) {
    var card = ui_selected_card();
    if (!card || !Array.isArray(card[group.key])) return;
    var list = card[group.key];
    if (!Number.isFinite(fromIndex) || !Number.isFinite(toIndex)) return;
    if (fromIndex < 0 || fromIndex >= list.length) return;
    toIndex = Math.max(0, Math.min(toIndex, list.length));
    if (fromIndex === toIndex || fromIndex + 1 === toIndex) return;
    var moved = list.splice(fromIndex, 1)[0];
    if (fromIndex < toIndex) toIndex--;
    list.splice(toIndex, 0, moved);
    ui_set_npc_inventory_active_index(group, toIndex);
    ui_after_npc_inventory_card_change(group, card);
}

function ui_render_npc_inventory_repeater(group, card) {
    var container = document.getElementById(group.containerId);
    if (!container) return;
    var list = (card && Array.isArray(card[group.key])) ? card[group.key] : [];
    if (!list.length) {
        container.innerHTML = '<p class="item-repeater-empty">' + escape_html(group.emptyText) + '</p>';
        return;
    }
    var activeIndex = ui_get_npc_inventory_active_index(group, list.length);
    container.innerHTML = list.map(function (entry, index) {
        return ui_npc_inventory_card_row_html(group, entry, index, activeIndex);
    }).join('');
}

function ui_render_npc_weapons_detailed_repeater(card) {
    ui_render_npc_inventory_repeater(NPC_INVENTORY_DETAIL_GROUPS[0], card);
}

function ui_render_npc_loot_detailed_repeater(card) {
    ui_render_npc_inventory_repeater(NPC_INVENTORY_DETAIL_GROUPS[1], card);
}

function ui_monster_checkbox_change(containerId, cardKey) {
    var card = ui_selected_card();
    if (!card) return;
    var arr = [];
    if (cardKey === 'languages' || cardKey === 'item_sentient_languages') {
        // Languages: merge both Standard and Exotic so the card shows all selected languages.
        var languageContainers = cardKey === 'item_sentient_languages'
            ? ['item-sentient-languages-standard-cb', 'item-sentient-languages-exotic-cb']
            : ['monster-languages-standard-cb', 'monster-languages-exotic-cb'];
        languageContainers.forEach(function (id) {
            var container = document.getElementById(id);
            if (!container) return;
            var checkboxes = container.querySelectorAll('input[type="checkbox"][data-monster-array="' + cardKey + '"]');
            checkboxes.forEach(function (cb) {
                if (cb.checked) arr.push(cb.value);
            });
        });
    } else {
        var container = document.getElementById(containerId);
        if (!container) return;
        var checkboxes = container.querySelectorAll('input[type="checkbox"][data-monster-array="' + cardKey + '"]');
        checkboxes.forEach(function (cb) {
            if (cb.checked) arr.push(cb.value);
        });
    }
    card[cardKey] = arr;
    ui_render_selected_card();
    ui_update_monster_calculated_displays();
    local_store_save();
}

function ui_monster_form_init() {
    // Build checkbox groups (4 columns for damage/conditions, 3 for saves, 2 for language rows)
    if (typeof DAMAGE_TYPES !== 'undefined') {
        ui_build_checkbox_group('monster-damage-resistances-cb', DAMAGE_TYPES, 4, 'damage_resistances');
        ui_build_checkbox_group('monster-damage-immunities-cb', DAMAGE_TYPES, 4, 'damage_immunities');
        ui_build_checkbox_group('monster-damage-vulnerabilities-cb', DAMAGE_TYPES, 4, 'damage_vulnerabilities');
    }
    if (typeof CONDITION_IMMUNITIES_LIST !== 'undefined') {
        ui_build_checkbox_group('monster-condition-immunities-cb', CONDITION_IMMUNITIES_LIST, 4, 'condition_immunities');
    }
    if (typeof SAVING_THROW_ABILITIES !== 'undefined') {
        ui_build_saving_throw_group('monster-saving-throws-cb');
    }
    if (typeof LANGUAGES_LIST !== 'undefined') {
        var standard = LANGUAGES_LIST.slice(0, 8);
        var exotic = LANGUAGES_LIST.slice(8);
        ui_build_checkbox_group('monster-languages-standard-cb', standard, 4, 'languages');
        ui_build_checkbox_group('monster-languages-exotic-cb', exotic, 4, 'languages');
        ui_build_checkbox_group('item-sentient-languages-standard-cb', standard, 4, 'item_sentient_languages');
        ui_build_checkbox_group('item-sentient-languages-exotic-cb', exotic, 4, 'item_sentient_languages');
    }
    ui_build_checkbox_group('item-properties-cb', ITEM_PROPERTIES, 3, 'item_properties');
    ui_build_checkbox_group('item-focus-cb', ITEM_FOCUS_CLASSES, 3, 'item_focus_classes');

    function bindCheckboxGroup(containerId, cardKey) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.addEventListener('change', function () { ui_monster_checkbox_change(containerId, cardKey); });
    }
    bindCheckboxGroup('monster-damage-resistances-cb', 'damage_resistances');
    bindCheckboxGroup('monster-damage-immunities-cb', 'damage_immunities');
    bindCheckboxGroup('monster-damage-vulnerabilities-cb', 'damage_vulnerabilities');
    bindCheckboxGroup('monster-condition-immunities-cb', 'condition_immunities');
    bindCheckboxGroup('monster-saving-throws-cb', 'saving_throw_proficiencies');
    bindCheckboxGroup('monster-languages-standard-cb', 'languages');
    bindCheckboxGroup('monster-languages-exotic-cb', 'languages');
    bindCheckboxGroup('item-sentient-languages-standard-cb', 'item_sentient_languages');
    bindCheckboxGroup('item-sentient-languages-exotic-cb', 'item_sentient_languages');
    bindCheckboxGroup('item-properties-cb', 'item_properties');
    bindCheckboxGroup('item-focus-cb', 'item_focus_classes');

    // Sections checklist: enable/disable optional sections on the selected card
    var sectionsContainer = document.getElementById('card-sections-cb');
    if (sectionsContainer) {
        sectionsContainer.addEventListener('change', function (e) {
            var cb = e.target;
            var key = cb && cb.getAttribute && cb.getAttribute('data-card-section');
            if (!key || cb.disabled) return;
            var card = ui_selected_card();
            if (!card) return;
            if (!card.sections || typeof card.sections !== 'object') card.sections = card_default_sections(card);
            card.sections[key] = cb.checked;
            if (ui_card_template(card) === 'item') {
                if (key === 'curse') card.item_cursed = cb.checked;
                if (key === 'sentience') card.item_sentient = cb.checked;
            }
            // Keep the legacy flag coherent for anything still reading it
            card.show_stat_block = monster_show_stats(card);
            ui_apply_template_visibility();
            ui_render_selected_card();
            local_store_save();
            if (typeof updateSectionCounters === 'function') updateSectionCounters();
        });
    }

    $('#monster-ac-type').on('change', function () {
        var v = $(this).val();
        $('#monster-custom-ac-group').show();
        $('#monster-equipped-armor-group').toggle(v === 'equipped');
        $('#monster-natural-armor-group').toggle(v === 'natural');
        $('#monster-unarmored-defense-group').toggle(v === 'unarmored_defense');
        ui_render_selected_card();
        ui_update_monster_calculated_displays();
    });

    $('#monster-class-select').on('change', function () {
        var isCustom = this.value === '__custom__';
        var customInput = document.getElementById('monster-class-custom');
        if (customInput) customInput.style.display = isCustom ? '' : 'none';
        if (isCustom) {
            ui_set_npc_class_value(customInput ? customInput.value : '');
            ui_sync_npc_subclass_affix_controls('');
            if (customInput) customInput.focus();
        } else {
            ui_set_npc_class_value(this.value);
            ui_sync_npc_subclass_affix_controls(this.value);
        }
        ui_render_selected_card();
    });

    $('#monster-class-custom').on('input change', function () {
        if ($('#monster-class-select').val() !== '__custom__') return;
        ui_set_npc_class_value(this.value);
        ui_sync_npc_subclass_affix_controls('');
        if (window.PERF_SAFE_UPDATES?.scheduleInputPreviewRenders && typeof ui_render_selected_card_deferred === 'function') {
            ui_render_selected_card_deferred();
        } else {
            ui_render_selected_card();
        }
    });

    ui_sync_npc_class_controls(ui_selected_card());

    // Artwork drop zone — browse button and drag-and-drop
    $('#artwork-browse-btn').on('click', function () {
        document.getElementById('monster-creature-artwork-file').click();
    });
    $('#artwork-drop-zone').on('click', function (e) {
        // Clicking anywhere in the zone (except the button itself) also opens picker
        if (!$(e.target).closest('#artwork-browse-btn').length) {
            document.getElementById('monster-creature-artwork-file').click();
        }
    });
    $('#artwork-drop-zone').on('dragover dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('drag-over');
    });
    $('#artwork-drop-zone').on('dragleave dragend', function (e) {
        $(this).removeClass('drag-over');
    });
    $('#artwork-drop-zone').on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');
        var files = e.originalEvent.dataTransfer.files;
        if (files && files.length > 0) {
            var dt = new DataTransfer();
            dt.items.add(files[0]);
            var input = document.getElementById('monster-creature-artwork-file');
            input.files = dt.files;
            $(input).trigger('change');
        }
    });

    function ui_uploaded_artwork_is_png(file) {
        var mimeType = String(file && file.type || '').toLowerCase();
        var fileName = String(file && file.name || '');
        return mimeType === 'image/png' || /\.png$/i.test(fileName);
    }

    $('#monster-creature-artwork-file').on('change', function () {
        var file = this.files && this.files[0];
        if (!file) return;
        var card = ui_selected_card();
        if (!card) return;
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                // Scale down to max 2000px on longest side.
                // At 4× export scale, the artwork area is ~960px wide. A portrait image
                // capped at 2000px tall will always be ≥1333px wide (for 2:3 aspect), well
                // above 960px, so prerasterizeBgElement can cleanly downscale instead of
                // upscaling, which avoids softness/pixelation in the PNG export.
                var MAX = 2000;
                var w = img.width;
                var h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else { w = Math.round(w * MAX / h); h = MAX; }
                }
                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                // JPEG has no alpha channel and turns transparent pixels black.
                // Keep uploaded PNGs as PNGs so transparent artwork remains transparent;
                // retain JPEG compression for all other uploaded formats.
                var dataUrl = ui_uploaded_artwork_is_png(file)
                    ? canvas.toDataURL('image/png')
                    : canvas.toDataURL('image/jpeg', 0.92);
                card.creature_artwork = dataUrl;
                $('#monster-creature-artwork').val(dataUrl);
                ui_recompute_art_gradient(card, function () { ui_render_selected_card(); });
                local_store_save();
            };
            img.src = this.result;
        };
        reader.readAsDataURL(file);
        this.value = '';
    });

    // Recompute the art-derived gradient whenever the artwork URL changes directly.
    $('#monster-creature-artwork').on('change', function () {
        var card = ui_selected_card();
        if (card) ui_recompute_art_gradient(card, function () { ui_render_selected_card(); });
    });

    NPC_INVENTORY_DETAIL_GROUPS.forEach(function (group) {
        $('#' + group.addButtonId).on('click', function () {
            var card = ui_selected_card();
            if (!card) return;
            if (!Array.isArray(card[group.key])) card[group.key] = [];
            card[group.key].push(ui_npc_inventory_default_entry(group));
            ui_set_npc_inventory_active_index(group, card[group.key].length - 1);
            ui_render_npc_inventory_repeater(group, card);
            local_store_save();
            if (typeof updateSectionCounters === 'function') updateSectionCounters();
            var index = card[group.key].length - 1;
            var prefix = group.type === 'weapon' ? 'npc-weapon' : 'npc-loot';
            var nameInput = document.getElementById(prefix + '-' + index + '-name');
            if (nameInput) nameInput.focus();
        });

        $('#' + group.containerId)
            .on('click', '.monster-action-card-summary', function (event) {
                if ($(event.target).closest('button').length) return;
                var card = ui_selected_card();
                if (!card) return;
                var index = Number($(this).closest('.npc-inventory-card').attr('data-index'));
                ui_set_npc_inventory_active_index(group, index);
                ui_render_npc_inventory_repeater(group, card);
            })
            .on('keydown', '.monster-action-card-summary', function (event) {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                $(this).trigger('click');
            })
            .on('click', '.npc-inventory-duplicate-btn', function (event) {
                event.preventDefault();
                event.stopPropagation();
                ui_duplicate_npc_inventory_entry(group, Number($(this).attr('data-entry-index')));
            })
            .on('click', '.npc-inventory-delete-btn', function (event) {
                event.preventDefault();
                event.stopPropagation();
                ui_delete_npc_inventory_entry(group, Number($(this).attr('data-entry-index')));
            })
            .on('dragstart', '.npc-inventory-card', function (event) {
                var originalEvent = event.originalEvent;
                var index = Number($(this).attr('data-index'));
                $(this).addClass('is-dragging');
                if (originalEvent && originalEvent.dataTransfer) {
                    originalEvent.dataTransfer.effectAllowed = 'move';
                    originalEvent.dataTransfer.setData('text/plain', String(index));
                }
            })
            .on('dragover', '.npc-inventory-card', function (event) {
                event.preventDefault();
                var originalEvent = event.originalEvent;
                var rect = this.getBoundingClientRect();
                var after = originalEvent && originalEvent.clientY > rect.top + rect.height / 2;
                $(this).toggleClass('is-drop-after', !!after).toggleClass('is-drop-before', !after);
                if (originalEvent && originalEvent.dataTransfer) originalEvent.dataTransfer.dropEffect = 'move';
            })
            .on('dragleave dragend drop', '.npc-inventory-card', function () {
                $(this).removeClass('is-drop-before is-drop-after is-dragging');
            })
            .on('drop', '.npc-inventory-card', function (event) {
                event.preventDefault();
                var originalEvent = event.originalEvent;
                var fromIndex = originalEvent && originalEvent.dataTransfer
                    ? Number(originalEvent.dataTransfer.getData('text/plain'))
                    : NaN;
                var targetIndex = Number($(this).attr('data-index'));
                var rect = this.getBoundingClientRect();
                var after = originalEvent && originalEvent.clientY > rect.top + rect.height / 2;
                ui_move_npc_inventory_entry(group, fromIndex, targetIndex + (after ? 1 : 0));
            })
            .on('input', '.npc-inventory-field', function () {
                if ($(this).hasClass('npc-inventory-name')) {
                    var title = ($(this).val() || '').trim() || ui_npc_inventory_fallback_title(group);
                    $(this).closest('.npc-inventory-card').find('.monster-action-card-title').text(title);
                }
                ui_sync_npc_inventory_from_dom(group, true);
            })
            .on('change', '.npc-inventory-field', function () {
                ui_sync_npc_inventory_from_dom(group, false);
            });
    });

    function ui_sync_related_cards() {
        var card = ui_selected_card();
        if (!card) return;
        card.related_cards = [];
        for (var i = 1; i <= 5; i++) {
            var type = $('#monster-related-' + i + '-type').val();
            var name = $('#monster-related-' + i + '-name').val();
            if ((type && type.trim()) || (name && name.trim())) {
                card.related_cards.push({ type: type || '', name: name || '' });
            }
        }
        ui_render_selected_card();
        local_store_save();
    }
    for (var k = 1; k <= 5; k++) {
        $('#monster-related-' + k + '-type, #monster-related-' + k + '-name').on('input change', ui_sync_related_cards);
    }

    // Creature trait/action groups: fixed rows (Traits) or repeaters (actions)
    MONSTER_ENTRY_GROUPS.forEach(function (g) {
        if (g.mode === 'fixed') {
            function syncGroupRows(renderDeferred) {
                var card = ui_selected_card();
                if (!card) return;
                var list = [];
                for (var i = 1; i <= (g.count || 5); i++) {
                    var title = $('#' + g.prefix + '-' + i + '-title').val() || '';
                    var text = $('#' + g.prefix + '-' + i + '-text').val() || '';
                    list.push({ title: title, text: text });
                }
                while (list.length && !(list[list.length - 1].title.trim() || list[list.length - 1].text.trim())) list.pop();
                card[g.key] = list;
                if (renderDeferred && window.PERF_SAFE_UPDATES?.scheduleGroupRowPreviewRenders && typeof ui_render_selected_card_deferred === 'function') {
                    ui_render_selected_card_deferred();
                } else {
                    ui_cancel_scheduled_card_render();
                    ui_render_selected_card();
                }
                local_store_save();
            }
            for (var r = 1; r <= (g.count || 5); r++) {
                $('#' + g.prefix + '-' + r + '-title, #' + g.prefix + '-' + r + '-text')
                    .on('input', function () { syncGroupRows(true); })
                    .on('change', function () { syncGroupRows(false); });
            }
            return;
        }
        var addButtons = Array.isArray(g.addButtons) && g.addButtons.length ? g.addButtons : [{ id: g.addButtonId, kind: g.hasAttackMeta ? 'feature' : '' }];
        addButtons.forEach(function (buttonConfig) {
            $('#' + buttonConfig.id).on('click', function () {
                var card = ui_selected_card();
                if (!card) return;
                if (!Array.isArray(card[g.key])) card[g.key] = [];
                var newEntry = { title: '', text: '' };
                if (g.hasTriggerField) newEntry.trigger = '';
                if (g.hasAttackMeta) {
                    newEntry.action_kind = buttonConfig.kind === 'attack' ? 'attack' : 'feature';
                    newEntry.attack_type = '';
                    newEntry.attack_classification = '';
                    newEntry.attack_ability = 'auto';
                    newEntry.reach = '';
                    newEntry.range_normal = '';
                    newEntry.range_long = '';
                }
                if (g.hasCostField) newEntry.legendary_cost = '1';
                card[g.key].push(newEntry);
                ui_set_monster_entry_active_index(g, card[g.key].length - 1);
                ui_render_monster_entry_repeater(g, card);
                local_store_save();
                if (typeof updateSectionCounters === 'function') updateSectionCounters();
                var index = card[g.key].length - 1;
                var titleInput = document.getElementById(g.prefix + '-' + index + '-title');
                if (titleInput) titleInput.focus();
            });
        });
        $('#' + g.containerId)
            .on('click', '.monster-notation-token', function (event) {
                if (!g.supportsNotation) return;
                event.preventDefault();
                event.stopPropagation();
                var textarea = $(this).closest('.monster-entry-row').find('.monster-entry-repeater-text').get(0);
                var notation = String($(this).attr('data-notation') || '');
                var selectText = String($(this).attr('data-select-text') || '');
                if (!ui_insert_textarea_notation(textarea, notation, selectText)) return;
                textarea.focus();
                $(textarea).trigger('input');
            })
            .on('dragstart', '.monster-notation-token', function (event) {
                if (!g.supportsNotation) return;
                event.stopImmediatePropagation();
                var originalEvent = event.originalEvent;
                var notation = String($(this).attr('data-notation') || '');
                if (!originalEvent || !originalEvent.dataTransfer || !notation) return;
                originalEvent.dataTransfer.effectAllowed = 'copy';
                originalEvent.dataTransfer.setData('application/x-morvold-notation', notation);
                originalEvent.dataTransfer.setData('text/plain', notation);
                $(this).addClass('is-dragging');
            })
            .on('dragend', '.monster-notation-token', function (event) {
                event.stopImmediatePropagation();
                $(this).removeClass('is-dragging');
            })
            .on('dragover', '.monster-entry-repeater-text', function (event) {
                if (!g.supportsNotation) return;
                var originalEvent = event.originalEvent;
                var dataTransfer = originalEvent && originalEvent.dataTransfer;
                var types = dataTransfer && dataTransfer.types ? Array.from(dataTransfer.types) : [];
                if (types.indexOf('application/x-morvold-notation') === -1) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                dataTransfer.dropEffect = 'copy';
                $(this).addClass('is-notation-drop-target');
            })
            .on('dragleave', '.monster-entry-repeater-text', function () {
                $(this).removeClass('is-notation-drop-target');
            })
            .on('drop', '.monster-entry-repeater-text', function (event) {
                if (!g.supportsNotation) return;
                var originalEvent = event.originalEvent;
                var dataTransfer = originalEvent && originalEvent.dataTransfer;
                var notation = dataTransfer ? dataTransfer.getData('application/x-morvold-notation') : '';
                if (!notation) return;
                // Do not prevent the default: Chromium inserts text/plain at its visible
                // textarea drop caret. The fallback covers browsers that do not.
                event.stopImmediatePropagation();
                var textarea = this;
                var beforeValue = textarea.value;
                var dropStart = textarea.selectionStart;
                var dropEnd = textarea.selectionEnd;
                $(textarea).removeClass('is-notation-drop-target');
                setTimeout(function () {
                    if (textarea.value === beforeValue) {
                        ui_insert_textarea_notation(textarea, notation, '', dropStart, dropEnd);
                    }
                    textarea.focus();
                    $(textarea).trigger('input');
                }, 0);
            })
            .on('click', '.monster-action-card-summary', function (event) {
                if ($(event.target).closest('button').length) return;
                if (!g.cardLayout) return;
                var card = ui_selected_card();
                if (!card) return;
                var index = Number($(this).closest('.monster-action-card').attr('data-index'));
                ui_set_monster_entry_active_index(g, index);
                ui_render_monster_entry_repeater(g, card);
            })
            .on('keydown', '.monster-action-card-summary', function (event) {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                $(this).trigger('click');
            })
            .on('click', '.monster-action-duplicate-btn', function (event) {
                event.preventDefault();
                event.stopPropagation();
                ui_duplicate_monster_entry(g, Number($(this).attr('data-entry-index')));
            })
            .on('click', '.monster-action-delete-btn', function (event) {
                event.preventDefault();
                event.stopPropagation();
                ui_delete_monster_entry(g, Number($(this).attr('data-entry-index')));
            })
            .on('dragstart', '.monster-action-card', function (event) {
                if (!g.cardLayout) return;
                var originalEvent = event.originalEvent;
                var index = Number($(this).attr('data-index'));
                $(this).addClass('is-dragging');
                if (originalEvent && originalEvent.dataTransfer) {
                    originalEvent.dataTransfer.effectAllowed = 'move';
                    originalEvent.dataTransfer.setData('text/plain', String(index));
                }
            })
            .on('dragover', '.monster-action-card', function (event) {
                if (!g.cardLayout) return;
                event.preventDefault();
                var originalEvent = event.originalEvent;
                var rect = this.getBoundingClientRect();
                var after = originalEvent && originalEvent.clientY > rect.top + rect.height / 2;
                $(this).toggleClass('is-drop-after', !!after).toggleClass('is-drop-before', !after);
                if (originalEvent && originalEvent.dataTransfer) originalEvent.dataTransfer.dropEffect = 'move';
            })
            .on('dragleave dragend drop', '.monster-action-card', function () {
                $(this).removeClass('is-drop-before is-drop-after is-dragging');
            })
            .on('drop', '.monster-action-card', function (event) {
                if (!g.cardLayout) return;
                event.preventDefault();
                var originalEvent = event.originalEvent;
                var fromIndex = originalEvent && originalEvent.dataTransfer
                    ? Number(originalEvent.dataTransfer.getData('text/plain'))
                    : NaN;
                var targetIndex = Number($(this).attr('data-index'));
                var rect = this.getBoundingClientRect();
                var after = originalEvent && originalEvent.clientY > rect.top + rect.height / 2;
                ui_move_monster_entry(g, fromIndex, targetIndex + (after ? 1 : 0));
            })
            .on('input', '.monster-entry-repeater-title, .monster-entry-repeater-attack-type, .monster-entry-repeater-attack-classification, .monster-entry-repeater-attack-ability, .monster-entry-repeater-reach, .monster-entry-repeater-range-normal, .monster-entry-repeater-range-long, .monster-entry-repeater-legendary-cost, .monster-entry-repeater-trigger, .monster-entry-repeater-text', function () {
                if ($(this).hasClass('monster-entry-repeater-title')) {
                    var $card = $(this).closest('.monster-action-card');
                    var entryKind = $card.attr('data-entry-kind') || 'feature';
                    var fallbackTitle = ui_monster_entry_fallback_title(g, entryKind);
                    $card.find('.monster-action-card-title').text(($(this).val() || '').trim() || fallbackTitle);
                }
                ui_sync_monster_entry_repeater_from_dom(g, true);
            })
            .on('change', '.monster-entry-repeater-title, .monster-entry-repeater-attack-type, .monster-entry-repeater-attack-classification, .monster-entry-repeater-attack-ability, .monster-entry-repeater-reach, .monster-entry-repeater-range-normal, .monster-entry-repeater-range-long, .monster-entry-repeater-legendary-cost, .monster-entry-repeater-trigger, .monster-entry-repeater-text', function () {
                ui_sync_monster_entry_repeater_from_dom(g, false);
                if ($(this).hasClass('monster-entry-repeater-attack-type')) {
                    var card = ui_selected_card();
                    if (card) ui_render_monster_entry_repeater(g, card);
                }
            })
            .on('click', '.entry-repeater-remove-btn', function () {
                var card = ui_selected_card();
                if (!card) return;
                var index = Number($(this).attr('data-remove-index'));
                if (!Array.isArray(card[g.key])) card[g.key] = [];
                if (!Number.isFinite(index) || index < 0 || index >= card[g.key].length) return;
                card[g.key].splice(index, 1);
                ui_render_monster_entry_repeater(g, card);
                ui_cancel_scheduled_card_render();
                ui_render_selected_card();
                local_store_save();
                if (typeof updateSectionCounters === 'function') updateSectionCounters();
            });
    });
}

function ui_filter_selected_card_title() {
    const filterInput = document.querySelector('#deck-cards-list-title-filter');
    const filterValue = filterInput.value;
    const re = new RegExp(filterValue, 'i');
    document.querySelectorAll('#deck-cards-list .radio').forEach(option => {
        option.style.display = re.test(option.textContent) ? '' : 'none';
    });
}

function search_clear_button_init(button) {
    button.disabled = true;
    button.style.cursor = 'default';

    const buttonLabel = document.createElement('span');
    buttonLabel.style.visibility = 'hidden';
    buttonLabel.innerHTML = '&times;';
    button.appendChild(buttonLabel);

    const input = button.closest('.input-group').querySelector('input[type="search"]');
    input.addEventListener('input', event => {
        button.disabled = !input.value;
        buttonLabel.style.visibility = input.value ? '' : 'hidden';
    })

    button.addEventListener('click', event => {
        input.focus();
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
    });
}

// function ui_filter_selected_card_title_clear() {
//     $('#deck-cards-list-title-filter').focus().val('');
//     ui_filter_selected_card_title();
// }

function ui_update_card_actions() {
    var action_groups = {};

    // Group actions by category
    for (var function_name in card_action_info) {
        var info = card_action_info[function_name];
        if (!action_groups[info.category]) {
            action_groups[info.category] = [];
        }
        action_groups[info.category].push(function_name);
    }

    var parent = $('#card-actions');
    parent.empty();

    for (var group_name in action_groups) {
        var group_div = $('<div class="action-group"></div>');
        group_div.append($('<h4>' + group_name + '</h4>'));
        var actions = action_groups[group_name];
        for (var i = 0; i < actions.length; ++i) {
            var function_name = actions[i];
            var info = card_action_info[function_name];
            var action_name = info.example.split(" ")[0];

            var button = $('<button type="button" class="btn btn-default btn-sm action-button">' + action_name + '</button>');
            button.attr('title', info.summary);
            button.attr('data-function-name', function_name);
            button.click(function () {
                var contents = $('#card-contents');
                var contentsTextarea = contents[0];
                var function_name = $(this).attr('data-function-name');
                var info = card_action_info[function_name] || {
                    summary: 'Missing summary',
                    example: action_name
                };
                insertTextAtCursor(contentsTextarea, info.example);
                contents.trigger("change");
            });
            group_div.append(button);
        }
        parent.append(group_div);
    }
}

function ui_update_monster_calculated_displays() {
    var card = ui_selected_card();
    // Note: #monster-calc-pb may not exist in the current layout; jQuery calls
    // on missing elements are no-ops, so we no longer bail out early (doing so
    // silently froze every calculated display: skill/save bonuses, mods, HP).
    var $pb = $('#monster-calc-pb');
    if (!card) {
        $pb.text('PB: —');
        ['str','dex','con','int','wis','cha'].forEach(function (a) { $('#monster-calc-' + a).text('—'); });
        $('#monster-calc-ac').text('AC: —');
        $('#monster-calc-hp').text('Calculated HP: —');
        $('#monster-calc-hit-die').text('Hit Die: —');
        $('#monster-calc-xp').text('XP: —');
        updateSavingThrowBonusDisplays(null);
        updateSkillBonusDisplays(null);
        updateActionsContextNotes(null);
        return;
    }
    var SIZE_HIT_DIE = { 'Tiny': 'd4', 'Small': 'd6', 'Medium': 'd8', 'Large': 'd10', 'Huge': 'd12', 'Gargantuan': 'd20' };
    var hitDie = card.size ? (SIZE_HIT_DIE[card.size] || '—') : '—';
    $('#monster-calc-hit-die').text('Hit Die: ' + hitDie);
    var CR_XP = {
        '0': '0 or 10', '0.125': '25', '0.25': '50', '0.5': '100',
        '1': '200', '2': '450', '3': '700', '4': '1,100', '5': '1,800',
        '6': '2,300', '7': '2,900', '8': '3,900', '9': '5,000', '10': '5,900',
        '11': '7,200', '12': '8,400', '13': '10,000', '14': '11,500', '15': '13,000',
        '16': '15,000', '17': '18,000', '18': '20,000', '19': '22,000', '20': '25,000',
        '21': '33,000', '22': '41,000', '23': '50,000', '24': '62,000', '25': '75,000',
        '26': '90,000', '27': '105,000', '28': '120,000', '29': '135,000', '30': '155,000'
    };
    var xp = (card.challenge_rating !== undefined && card.challenge_rating !== '') ? (CR_XP[String(card.challenge_rating)] || '—') : '—';
    $('#monster-calc-xp').text('XP: ' + xp);
    if (typeof window.monster_effective_pb === 'function' || typeof window.monster_pb === 'function') {
        var displayPb = typeof window.monster_effective_pb === 'function'
            ? window.monster_effective_pb(card)
            : window.monster_pb(card.challenge_rating);
        $pb.text('PB: ' + displayPb);
    }
    ['str','dex','con','int','wis','cha'].forEach(function (a) {
        var mod = typeof window.monster_ability_mod === 'function' ? window.monster_ability_mod(card[a]) : '';
        $('#monster-calc-' + a).text(mod !== '' && mod !== undefined ? (mod >= 0 ? '+' + mod : String(mod)) : '—');
    });
    if (typeof window.monster_ac === 'function') {
        var ac = window.monster_ac(card);
        $('#monster-calc-ac').text(ac !== '' && ac !== undefined ? 'AC: ' + ac : 'AC: —');
    }
    if (typeof window.monster_hp === 'function') {
        var hp = window.monster_hp(card).display;
        $('#monster-calc-hp').text('Calculated HP: ' + hp);
    }
    updateSavingThrowBonusDisplays(card);
    updateSkillBonusDisplays(card);
    updateACContextNote(card);
    updateActionsContextNotes(card);
}

function updateSkillBonusDisplays(card) {
    if (typeof window.SKILLS === 'undefined') return;
    if (!card) {
        window.SKILLS.forEach(function (s) { $('#skill-bonus-' + s.id).text('—'); });
        return;
    }
    var pb = typeof window.monster_effective_pb === 'function'
        ? window.monster_effective_pb(card)
        : (typeof window.monster_pb === 'function' ? window.monster_pb(card.challenge_rating) : 0);
    window.SKILLS.forEach(function (s) {
        var level = (card['skill_' + s.id] || 'none').toLowerCase();
        var mod = typeof window.monster_ability_mod === 'function' ? window.monster_ability_mod(card[s.ability]) : 0;
        var bonus;
        if (level === 'proficient')     bonus = mod + pb;
        else if (level === 'half')      bonus = mod + Math.floor(pb / 2);
        else if (level === 'expertise') bonus = mod + pb * 2;
        else                            bonus = mod;
        var sign = bonus >= 0 ? '+' : '';
        $('#skill-bonus-' + s.id).text(sign + bonus);
    });
}

function updateSavingThrowBonusDisplays(card) {
    var abilities = [
        { key: 'strength',     stat: 'str' },
        { key: 'dexterity',    stat: 'dex' },
        { key: 'constitution', stat: 'con' },
        { key: 'intelligence', stat: 'int' },
        { key: 'wisdom',       stat: 'wis' },
        { key: 'charisma',     stat: 'cha' }
    ];
    if (!card) {
        abilities.forEach(function (ab) { $('#st-bonus-' + ab.key).text('—'); });
        return;
    }
    var pb = typeof window.monster_effective_pb === 'function'
        ? window.monster_effective_pb(card)
        : (typeof window.monster_pb === 'function' ? window.monster_pb(card.challenge_rating) : 0);
    var proficiencies = card.saving_throw_proficiencies || [];
    if (!Array.isArray(proficiencies)) {
        proficiencies = proficiencies ? proficiencies.split(',').map(function (s) { return s.trim(); }) : [];
    }
    abilities.forEach(function (ab) {
        var mod = typeof window.monster_ability_mod === 'function' ? window.monster_ability_mod(card[ab.stat]) : 0;
        var isProficient = proficiencies.indexOf(ab.key) !== -1;
        var total = isProficient ? mod + pb : mod;
        var sign = total >= 0 ? '+' : '';
        $('#st-bonus-' + ab.key).text(sign + total);
    });
}

function updateACContextNote(card) {
    var $note1 = $('#monster-ac-context-note-1');
    var $note2 = $('#monster-ac-context-note-2');
    if (!$note1.length) return;

    var cr = card ? card.challenge_rating : '';
    var acType = card ? (card.ac_type || '') : '';

    var CR_DISPLAY = {
        '0': '0', '0.125': '1/8', '0.25': '1/4', '0.5': '1/2'
    };
    var CR_TYPICAL_AC = {
        '0': 13, '0.125': 13, '0.25': 13, '0.5': 13,
        '1': 13, '2': 13, '3': 13, '4': 14, '5': 15,
        '6': 15, '7': 15, '8': 16, '9': 16, '10': 17,
        '11': 17, '12': 17, '13': 18, '14': 18, '15': 18,
        '16': 18, '17': 19, '18': 19, '19': 19, '20': 19,
        '21': 19, '22': 19, '23': 19, '24': 19, '25': 19,
        '26': 19, '27': 19, '28': 19, '29': 19, '30': 19
    };

    // Note 1: CR guideline range — requires CR only
    if (!cr && cr !== 0) {
        $note1.hide();
        $note2.hide();
        return;
    }
    var typicalAC = CR_TYPICAL_AC[String(cr)];
    if (typicalAC === undefined) { $note1.hide(); $note2.hide(); return; }

    var crDisplay = CR_DISPLAY[String(cr)] || String(cr);
    var y = typicalAC - 2;
    var z = typicalAC + 2;
    $note1.html(
        '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Monsters of CR <b>' + crDisplay +
        '</b> typically have an AC between <b>' + y + '</b> and <b>' + z +
        '</b>. This is a guideline, not a rule.'
    ).show();

    // Note 2: AC type + calculated AC — requires AC type to be set
    if (!acType) { $note2.hide(); return; }

    var ARMOR_LABELS = {
        'padded': 'Padded', 'leather': 'Leather', 'studded': 'Studded Leather',
        'hide': 'Hide', 'chain_shirt': 'Chain Shirt', 'scale_mail': 'Scale Mail',
        'spiked_armor': 'Spiked Armor', 'breastplate': 'Breastplate', 'halfplate': 'Half Plate',
        'ring_mail': 'Ring Mail', 'chain_mail': 'Chain Mail', 'splint': 'Splint', 'plate': 'Plate'
    };
    var UD_LABELS = {
        'wis': 'Wisdom (Monk)', 'cha': 'Charisma (Bard)', 'con': 'Constitution (Barbarian)'
    };

    var xLabel;
    if (acType === 'natural') {
        var nat = card.natural_armor_type || 'regular';
        if (nat === 'light') xLabel = 'Light Natural Armor';
        else if (nat === 'heavy') xLabel = 'Heavy Natural Armor';
        else xLabel = 'Natural Armor';
    } else if (acType === 'equipped') {
        xLabel = ARMOR_LABELS[card.equipped_armor_type] || 'Equipped Armor';
    } else if (acType === 'mage_armor') {
        xLabel = 'Mage Armor';
    } else if (acType === 'unarmored_defense') {
        var udLabel = UD_LABELS[card.unarmored_defense_type] || card.unarmored_defense_type || '—';
        xLabel = 'Unarmored Defense (' + udLabel + ')';
    } else if (acType === 'custom') {
        xLabel = 'Custom AC';
    } else {
        $note2.hide(); return;
    }

    var calcAC = $('#monster-calc-ac').text().replace('AC: ', '').trim() || '—';
    $note2.html(
        '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Because your monster uses <b>' + xLabel +
        '</b> to determine its AC, its calculated AC is <b>' + calcAC +
        '</b>. If this AC falls outside of the guidelines, you may consider adjusting your monster\'s Ability Scores or Challenge Rating.'
    ).show();
}

function updateActionsContextNotes(card) {
    var $noteCR  = $('#monster-actions-note-cr');
    var $noteStr = $('#monster-actions-note-str');
    var $noteDex = $('#monster-actions-note-dex');
    var $noteCha = $('#monster-actions-note-cha');
    var $noteWis = $('#monster-actions-note-wis');
    var $noteInt = $('#monster-actions-note-int');
    if (!$noteCR.length) return;

    if (!card) {
        $noteCR.hide(); $noteStr.hide(); $noteDex.hide();
        $noteCha.hide(); $noteWis.hide(); $noteInt.hide();
        return;
    }

    var CR_DISPLAY = { '0': '0', '0.125': '1/8', '0.25': '1/4', '0.5': '1/2' };
    var CR_ATTACK_BONUS = {
        '0': '≤+3', '0.125': '+3', '0.25': '+3', '0.5': '+3',
        '1': '+3',  '2': '+3',  '3': '+4',  '4': '+5',
        '5': '+6',  '6': '+6',  '7': '+6',  '8': '+7',
        '9': '+7',  '10': '+7', '11': '+8', '12': '+8',
        '13': '+8', '14': '+8', '15': '+8', '16': '+9',
        '17': '+10','18': '+10','19': '+10','20': '+10',
        '21': '+11','22': '+11','23': '+11','24': '+12',
        '25': '+12','26': '+12','27': '+13','28': '+13',
        '29': '+13','30': '+14'
    };

    var cr = card.challenge_rating;
    var crKey = String(cr);
    var crDisplay = CR_DISPLAY[crKey] || crKey;
    var attackBonus = CR_ATTACK_BONUS[crKey];

    if (cr !== undefined && cr !== '' && attackBonus !== undefined) {
        $noteCR.html(
            '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Monsters of CR <b>' + crDisplay +
            '</b> have an average Attack Bonus of <b>' + attackBonus +
            '</b>. This is a guideline, not a rule.'
        ).show();
    } else {
        $noteCR.hide();
    }

    var pb  = typeof window.monster_pb === 'function' ? window.monster_pb(card.challenge_rating) : 0;
    var mod = typeof window.monster_ability_mod === 'function' ? window.monster_ability_mod : function () { return 0; };

    function fmt(val) { return val >= 0 ? '+' + val : String(val); }

    var strScore = parseInt(card.str, 10) || 10;
    var dexScore = parseInt(card.dex, 10) || 10;
    var intScore = parseInt(card.int, 10) || 10;
    var wisScore = parseInt(card.wis, 10) || 10;
    var chaScore = parseInt(card.cha, 10) || 10;

    var strBonus = fmt(mod(card.str) + pb);
    var dexBonus = fmt(mod(card.dex) + pb);
    var chaBonus = fmt(mod(card.cha) + pb);
    var wisBonus = fmt(mod(card.wis) + pb);
    var intBonus = fmt(mod(card.int) + pb);

    // Physical attack bonus: STR vs DEX
    if (strScore > dexScore) {
        $noteStr.html(
            '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Because your Monster\'s Strength score is higher than its Dexterity score, it will probably use <b>' + strBonus +
            '</b> as the Attack Bonus for most physical attacks. It may use primarily Melee Weapon Attacks (including Thrown weapons).'
        ).show();
        $noteDex.hide();
    } else if (dexScore > strScore) {
        $noteDex.html(
            '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Because your Monster\'s Dexterity score is higher than its Strength score, it will probably use <b>' + dexBonus +
            '</b> as the Attack Bonus for most physical attacks. It may be more likely to use Ranged Weapon Attacks, or it may use Melee Weapon Attacks if those weapons could conceivably have the Finesse property.'
        ).show();
        $noteStr.hide();
    } else {
        $noteStr.hide();
        $noteDex.hide();
    }

    // Spell attack bonus: highest of CHA, WIS, INT
    if (chaScore > wisScore && chaScore > intScore) {
        $noteCha.html(
            '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Because your Monster\'s Charisma score is higher than its Wisdom or Intelligence scores, it will probably use <b>' + chaBonus +
            '</b> as its Spell Attack Bonus (assuming it can do magical attacks).'
        ).show();
        $noteWis.hide();
        $noteInt.hide();
    } else if (wisScore > chaScore && wisScore > intScore) {
        $noteWis.html(
            '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Because your Monster\'s Wisdom score is higher than its Charisma or Intelligence scores, it will probably use <b>' + wisBonus +
            '</b> as its Spell Attack Bonus (assuming it can do magical attacks).'
        ).show();
        $noteCha.hide();
        $noteInt.hide();
    } else if (intScore > chaScore && intScore > wisScore) {
        $noteInt.html(
            '<i class="fa-solid fa-circle-info"></i> <b>Note:</b> Because your Monster\'s Intelligence score is higher than its Charisma or Wisdom scores, it will probably use <b>' + intBonus +
            '</b> as its Spell Attack Bonus (assuming it can do magical attacks).'
        ).show();
        $noteCha.hide();
        $noteWis.hide();
    } else {
        $noteCha.hide();
        $noteWis.hide();
        $noteInt.hide();
    }
}

function ui_render_selected_card() {
    ui_cancel_scheduled_card_render();
    const card = ui_selected_card();
    $('#preview-container').empty();
    if (card) {
        const front = card_generate_front(card, card_options, { isPreview: true });
        const back = card_generate_back(card, card_options, { isPreview: true });
        const previewContainer = document.getElementById('preview-container');
        previewContainer.innerHTML = DOMPurify.sanitize(front + "\n" + back, {
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });
        process_card_generated_front(previewContainer);

        // Appearance placement: it lives on the card back by default. If the back
        // content (with Appearance included) doesn't fit the card, move Appearance
        // to the front instead — the inverse of the old traits-overflow behavior.
        (function () {
            var cardEls = previewContainer.querySelectorAll('.card');
            var frontCard = cardEls[0];
            var backCard  = cardEls[1];
            if (!frontCard || !backCard) return;
            // Measure with Appearance on the back (the default state)
            frontCard.classList.remove('appearance-front');
            backCard.classList.remove('appearance-front');
            var backInner = backCard.querySelector('.monster-back-inner');
            var content = backCard.querySelector('.monster-back-content');
            if (!backInner) return;
            // Bottom of the real content (last child of the sections wrapper, or the
            // appearance block itself if there are no other sections)
            var lastEl = null;
            if (content && content.lastElementChild) lastEl = content.lastElementChild;
            else lastEl = backCard.querySelector('.back-overflow-traits');
            if (!lastEl) return;
            var cardBottom = backCard.getBoundingClientRect().bottom;
            var contentBottom = lastEl.getBoundingClientRect().bottom;
            // 2.5mm bottom padding allowance (~4.7px at 96dpi preview scale)
            var overflow = contentBottom > cardBottom - 2;
            if (overflow) {
                frontCard.classList.add('appearance-front');
                backCard.classList.add('appearance-front');
            }
        })();
    }
    ui_update_monster_calculated_displays();
    updateAllSkillSelects();
    local_store_save();
    if (typeof cardLightbox !== 'undefined') cardLightbox.onPreviewUpdate();
}

function ui_open_help() {
    $("#help-modal").modal('show');
}

function ui_select_icon() {
    window.open("http://game-icons.net/", "_blank");
}

function ui_page_rotate($event) {
    $event.preventDefault();
    swapInputValues('page-width', 'page-height');
}

function ui_card_rotate($event) {
    $event.preventDefault();
    swapInputValues('card-width', 'card-height');
}

function ui_grid_rotate($event) {
    $event.preventDefault();
    swapInputValues('page-rows', 'page-columns');
}

function ui_zoom_rotate($event) {
    $event.preventDefault();
    swapInputValues('page-zoom-width', 'page-zoom-height');
    swapInputValues('card-zoom-width', 'card-zoom-height');
}

function ui_zoom_100($event) {
    const keepRatio = app_settings.page_zoom_keep_ratio;
    if (keepRatio) app_settings.page_zoom_keep_ratio = false;
    $("#page-zoom-width").val(100).trigger('input');
    $("#page-zoom-height").val(100).trigger('input');
    if (keepRatio) app_settings.page_zoom_keep_ratio = true;
}

function ui_back_bleed_rotate($event) {
    $event.preventDefault();
    swapInputValues('back-bleed-width', 'back-bleed-height');
}

function ui_change_option() {
    var property = $(this).attr("data-option");
    var value;
    if ($(this).attr('type') === 'checkbox') {
        value = $(this).is(':checked');
    } else {
        value = $(this).val();
    }
    switch (property) {
        case 'card_size': {
            const changed = card_options[property] !== value;
            let w, h;
            if (changed) {
                card_options[property] = value;
                [w, h] = value ? value.split(',') : ['', ''];
            } else {
                w = card_options['card_width'];
                h = card_options['card_height'];
            }
            var width = '', height = '';
            var landscape = isLandscape(w, h);
            if (landscape) {
                width = h;  height = w;
            } else {
                width = w;  height = h;
            }
            card_options['card_width'] = width;
            card_options['card_height'] = height;
            $('#card-width').val(width).trigger("input");
            $('#card-height').val(height).trigger("input");
            if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                $('#card-zoom-width').val(width);
                $('#card-zoom-height').val(height);
            } else {
                $('#card-zoom-width').trigger('input');
            }
            break;
        }
        case 'card_width':
        case 'card_height': {
            card_options[property] = value;
            var width = card_options['card_width'];
            var height = card_options['card_height'];
            ui_set_value_to_format(document.getElementById('card-size'), width, height);
            ui_set_card_custom_size(width, height);
            ui_set_orientation_info('card-orientation', width, height);
            if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                $('#card-zoom-width').val(width);
                $('#card-zoom-height').val(height);
            } else {
                $('#card-zoom-width').trigger('input');
            }
            break;
        }
        case 'page_zoom_width':
        case 'page_zoom_height':
        case 'card_zoom_width':
        case 'card_zoom_height': {
            const setVal = (k, v, property) => {
                if (k === property) {
                    card_options[k] = value;
                } else {
                    const val = math_format(v);
                    card_options[k] = val;
                    $(`#${k.replace(/_/g, '-')}`).val(val);
                }
            }
            const cardWidth = card_options['card_width'];
            const cardHeight = card_options['card_height'];
            const r = math_eval(`${cardWidth} / ${cardHeight}`);
            if (r) {
                let percWidth;
                let percHeight;
                let sizeWidth;
                let sizeHeight;
                const keepRatio = app_settings.page_zoom_keep_ratio;
                if (property === 'page_zoom_width') {
                    percWidth = value;
                    percHeight = keepRatio ? percWidth : card_options['page_zoom_height'];
                } else if (property === 'page_zoom_height') {
                    percHeight = value;
                    percWidth = keepRatio ? percHeight : card_options['page_zoom_width'];
                } else if (property === 'card_zoom_width') {
                    sizeWidth = value;
                    sizeHeight = keepRatio ? math_eval(`${sizeWidth} / ${r}`) : card_options['card_zoom_height'];
                } else if (property === 'card_zoom_height') {
                    sizeHeight = value;
                    sizeWidth = keepRatio ? math_eval(`${sizeHeight} * ${r}`) : card_options['card_zoom_width'];
                }
                if (isNil(percWidth)) {
                    percWidth = math_eval(`${sizeWidth} / ${cardWidth} * 100`);
                    percHeight = math_eval(`${sizeHeight} / ${cardHeight} * 100`);
                } else {
                    sizeWidth = math_eval(`${cardWidth} * ${percWidth} / 100`);
                    sizeHeight = math_eval(`${cardHeight} * ${percHeight} / 100`);
                }
                setVal('page_zoom_width', percWidth, property);
                setVal('page_zoom_height', percHeight, property);
                setVal('card_zoom_width', sizeWidth, property);
                setVal('card_zoom_height', sizeHeight, property);
            }
            break;
        }
        default: {
            card_options[property] = value;
            break;
        }
    }
    ui_render_selected_card();
}

function ui_set_value_to_format(selectorId, width, height) {
    var selector = typeof selectorId === 'string' ? document.getElementById(selectorId) : selectorId;
    var len = selector.options.length;
    var portrait = "", landscape = "", format = "", o = null;
    for(var i = 0; i < len; i++) {
        o = selector.options[i];
        portrait = [width, height].join(',');
        if (o.value === portrait) { format = portrait; break; }
        landscape = [height, width].join(',');
        if (o.value === landscape) { format = landscape; break; }
    }
    selector.value = format;
}

function ui_set_orientation_info(elementId, cssWidth, cssHeight) {
    var orientation = getOrientation(cssWidth, cssHeight);
    document.getElementById(elementId).textContent = orientation;
    return orientation;
}

function ui_move_top() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.unshift(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(0);
    local_store_save(true);
}

function ui_move_bottom() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.push(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
    local_store_save(true);
}

function ui_move_up() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx > 0) {
        [card_data[idx], card_data[idx - 1]] = [card_data[idx - 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx - 1);
        local_store_save(true);
    }
}

function ui_move_down() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx < card_data.length - 1) {
        [card_data[idx], card_data[idx + 1]] = [card_data[idx + 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx + 1);
        local_store_save(true);
    }
}

function ui_change_card_property() {
    var property = $(this).attr("data-property");
    var value = $(this).val();
    var card = ui_selected_card();
    if (card) {
        card[property] = value;
        ui_render_selected_card();
    }
}

function ui_set_card_custom_size(width, height) {
    var card = ui_selected_card();
    if (card) {
        card.card_width = width;
        card.card_height = height;
        ui_render_selected_card();
    }
}

function ui_change_default_icon_front() {
    var value = $(this).val();
    card_options.default_icon_front = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back() {
    var value = $(this).val();
    card_options.default_icon_back = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back_rotation() {
    var value = $(this).val();
    card_options.default_icon_back_rotation = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back_container() {
    var value = $(this).val();
    card_options.default_icon_back_container = value;
    ui_render_selected_card();
}

function ui_change_card_contents() {
    var html = $(this).val();
    var card = ui_selected_card();
    if (card) {
        card.contents = html.split("\n");
        ui_render_selected_card();
    }
}

function ui_change_card_contents_keyup () {
    clearTimeout(ui_change_card_contents_keyup.timeout);
    ui_change_card_contents_keyup.timeout = setTimeout(function () {
        $('#card-contents').trigger('change');
    }, 200);
}
ui_change_card_contents_keyup.timeout = null;

function ui_change_card_tags() {
    var value = $(this).val();

    var card = ui_selected_card();
    if (card) {
        if (value.trim().length === 0) {
            card.tags = [];
        } else {
            card.tags = value.split(",").map(function (val) {
                return val.trim().toLowerCase();
            });
        }
        ui_render_selected_card();
    }
}

function ui_change_default_title_size() {
    card_options.default_title_size = $(this).val();
    ui_render_selected_card();
}

function ui_change_default_icon_size() {
    card_options.icon_inline = $(this).is(':checked');
    ui_render_selected_card();
}

function ui_change_default_card_font_size() {
    card_options.default_card_font_size = $(this).val();
    ui_render_selected_card();
}

function ui_change_default_card_background() {
    card_options.default_background_image = $(this).val();
    ui_render_selected_card();
}

function ui_sort() {
    $("#sort-modal").modal('show');
}

function ui_sort_execute() {
    $("#sort-modal").modal('hide');

    var fn_code = $("#sort-function").val();
    var fn = new Function("card_a", "card_b", fn_code);

    card_data = card_data.sort(function (card_a, card_b) {
        var result = fn(card_a, card_b);
        return result;
    });

    ui_update_card_list();
}

function ui_filter() {
    $("#filter-modal").modal('show');
}

function ui_filter_execute() {
    $("#filter-modal").modal('hide');

    var fn_code = $("#filter-function").val();
    var fn = new Function("card", fn_code);

    card_data = card_data.filter(function (card) {
        var result = fn(card);
        if (result === undefined) return true;
        else return result;
    });

    ui_update_card_list();
}

function ui_apply_default_color_front() {
    const k = 'color_front';
    const v = card_options.default_color_front;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_color_back() {
    const k = 'color_back';
    const v = card_options.default_color_back;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_font_title() {
    const k = 'title_size';
    const v = card_options.default_title_size;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_title_color() {
    const k = 'title_color';
    const v = card_options.default_title_color;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_font_card() {
    const k = 'card_font_size';
    const v = card_options.default_card_font_size;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_front() {
    const k = 'icon_front';
    const v = card_options.default_icon_front;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_back() {
    const k = 'icon_back';
    const v = card_options.default_icon_back;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_back_container() {
    const k = 'icon_back_container';
    const v = card_options.default_icon_back_container;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_back_rotation() {
    const k = 'icon_back_rotation';
    const v = card_options.default_icon_back_rotation;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_card_background() {
    const k = 'background_image';
    const v = card_options.default_background_image;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

//Adding support for local store
function local_store_save () {
    function save() {
       if(window.localStorage){
            const card_data_to_save = card_data.map(c => {
                const card = { ...c };
                delete card.uuid;
                return card;
            });
            try {
                localStorage.setItem('card_data', JSON.stringify(card_data_to_save));
                localStorage.setItem('card_options', JSON.stringify(card_options));
                localStorage.setItem('app_settings', JSON.stringify(app_settings));
            } catch (e){
                //if the local store save failed should we notify the user that the data is not being saved?
                console.log(e);
            }
        }
    }
    // Replace this function with its debounced version
    local_store_save = debounce(save, 500);
    // Call it immediately with the first invocation’s arguments
    return local_store_save.apply(this, arguments);
}

var LOCAL_STORE_DB_NAME = 'morvold_card_generator_autosave';
var LOCAL_STORE_DB_VERSION = 1;
var LOCAL_STORE_DB_OBJECT_STORE = 'kv';
var local_store_debounced_save = null;
var local_store_idb_save_queue = Promise.resolve();
var local_store_quota_warning_shown = false;

function local_store_card_payload() {
    return card_data.map(c => {
        const card = { ...c };
        delete card.uuid;
        return card;
    });
}

function local_store_payload() {
    return {
        card_data: JSON.stringify(local_store_card_payload()),
        card_options: JSON.stringify(card_options),
        app_settings: JSON.stringify(app_settings)
    };
}

function local_store_notify(message, type) {
    if (typeof showToast === 'function') showToast(message, type || 'warning', 9000);
    else console.warn(message);
}

function local_store_open_db() {
    return new Promise(function (resolve, reject) {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not available'));
            return;
        }
        var request = indexedDB.open(LOCAL_STORE_DB_NAME, LOCAL_STORE_DB_VERSION);
        request.onupgradeneeded = function () {
            var db = request.result;
            if (!db.objectStoreNames.contains(LOCAL_STORE_DB_OBJECT_STORE)) {
                db.createObjectStore(LOCAL_STORE_DB_OBJECT_STORE);
            }
        };
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error || new Error('Could not open autosave database')); };
    });
}

function local_store_indexeddb_write(payload) {
    return local_store_open_db().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(LOCAL_STORE_DB_OBJECT_STORE, 'readwrite');
            var store = tx.objectStore(LOCAL_STORE_DB_OBJECT_STORE);
            store.put(payload.card_data, 'card_data');
            store.put(payload.card_options, 'card_options');
            store.put(payload.app_settings, 'app_settings');
            tx.oncomplete = function () {
                db.close();
                resolve();
            };
            tx.onerror = function () {
                var err = tx.error || new Error('Could not write autosave database');
                db.close();
                reject(err);
            };
        });
    });
}

function local_store_indexeddb_read() {
    return local_store_open_db().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(LOCAL_STORE_DB_OBJECT_STORE, 'readonly');
            var store = tx.objectStore(LOCAL_STORE_DB_OBJECT_STORE);
            var result = {};
            var cardRequest = store.get('card_data');
            var optionsRequest = store.get('card_options');
            var settingsRequest = store.get('app_settings');
            cardRequest.onsuccess = function () { result.card_data = cardRequest.result; };
            optionsRequest.onsuccess = function () { result.card_options = optionsRequest.result; };
            settingsRequest.onsuccess = function () { result.app_settings = settingsRequest.result; };
            tx.oncomplete = function () {
                db.close();
                resolve(result);
            };
            tx.onerror = function () {
                var err = tx.error || new Error('Could not read autosave database');
                db.close();
                reject(err);
            };
        });
    });
}

function local_store_try_localstorage_write(payload) {
    if (!window.localStorage) return false;
    try {
        localStorage.setItem('card_data', payload.card_data);
        localStorage.setItem('card_options', payload.card_options);
        localStorage.setItem('app_settings', payload.app_settings);
        localStorage.setItem('autosave_backend', 'localStorage');
        return true;
    } catch (e) {
        console.warn('localStorage autosave failed; falling back to IndexedDB.', e);
        try {
            localStorage.setItem('card_options', payload.card_options);
            localStorage.setItem('app_settings', payload.app_settings);
        } catch (innerErr) {
            console.warn('Could not save options/settings to localStorage.', innerErr);
        }
        return false;
    }
}

function local_store_indexeddb_save(payload, localStorageSucceeded) {
    local_store_idb_save_queue = local_store_idb_save_queue.catch(function () {}).then(function () {
        return local_store_indexeddb_write(payload).then(function () {
            if (window.localStorage) {
                try {
                    if (!localStorageSucceeded) localStorage.removeItem('card_data');
                    localStorage.setItem('autosave_backend', 'indexedDB');
                } catch (e) {
                    console.warn('Could not update autosave backend marker.', e);
                }
            }
            if (!localStorageSucceeded && !local_store_quota_warning_shown) {
                local_store_quota_warning_shown = true;
                local_store_notify('Your deck is too large for localStorage, so autosave switched to the browser database. Please export JSON periodically as a backup.', 'warning');
            }
        }).catch(function (e) {
            console.error('IndexedDB autosave failed.', e);
            if (!localStorageSucceeded) {
                local_store_notify('Autosave failed because browser storage is full or unavailable. Please export your deck as JSON now.', 'danger');
            }
        });
    });
    return local_store_idb_save_queue;
}

function local_store_write_now() {
    var payload = local_store_payload();
    var localStorageSucceeded = local_store_try_localstorage_write(payload);
    return local_store_indexeddb_save(payload, localStorageSucceeded);
}

function local_store_save(immediate) {
    if (immediate === true) return local_store_write_now();
    if (!local_store_debounced_save) {
        local_store_debounced_save = debounce(local_store_write_now, 500);
    }
    return local_store_debounced_save();
}

window.addEventListener('beforeunload', function () {
    try {
        local_store_write_now();
    } catch (e) {
        console.warn('Could not flush autosave before unload.', e);
    }
});

function legacy_card_data(oldData = []) {
    const newData = oldData?.map(oldCard => {
        const card = card_init({ ...oldCard });
        if (!isNil(card.icon)) {
            card.icon_front = card.icon;
            delete card.icon;
        }
        if (!isNil(card.color)) {
            card.color_front = card.color;
            card.color_back = '';
            delete card.color;
        }
        if (isNil(card.icon_back_container)) {
            card.icon_back_container = 'rounded-square';
        }
        if (isNil(card.uuid)) {
            card.uuid = crypto.randomUUID();
        }
        return card;
    });
    return newData;
}

function legacy_card_options(data = {}) {
    const newData = {
        ...default_card_options(),
        ...data
    };
    if (!isNil(newData.page_zoom)) {
        newData.page_zoom_width = newData.page_zoom;
        newData.page_zoom_height = newData.page_zoom;
        delete newData.page_zoom;
    }
    return newData;
}

function legacy_app_settings(data = {}) {
    const merged = {
        ...default_app_settings(),
        ...data
    };
    // Migrate old default filename to the new one
    if (merged.file_name === 'rpg_cards' || merged.file_name === 'morvold_creatures') {
        merged.file_name = 'morvold_card_deck';
    }
    return merged;
}

async function local_store_load() {
    var indexedPayload = null;
    try {
        indexedPayload = await local_store_indexeddb_read();
    } catch (e) {
        console.warn('IndexedDB autosave load unavailable; falling back to localStorage.', e);
    }

    try {
        const storedCardsRaw = indexedPayload && indexedPayload.card_data
            ? indexedPayload.card_data
            : (window.localStorage ? localStorage.getItem("card_data") : null);
        const storedOptionsRaw = indexedPayload && indexedPayload.card_options
            ? indexedPayload.card_options
            : (window.localStorage ? localStorage.getItem("card_options") : null);
        const storedSettingsRaw = indexedPayload && indexedPayload.app_settings
            ? indexedPayload.app_settings
            : (window.localStorage ? localStorage.getItem("app_settings") : null);

        const storedCards = storedCardsRaw ? JSON.parse(storedCardsRaw) : null;
        if (storedCards) {
            card_data = legacy_card_data(storedCards);
        }
        const storedOptions = storedOptionsRaw ? JSON.parse(storedOptionsRaw) : null;
        if (storedOptions) {
            card_options = legacy_card_options(storedOptions);
        }
        const storedSettings = storedSettingsRaw ? JSON.parse(storedSettingsRaw) : null;
        if (storedSettings) {
            app_settings = legacy_app_settings(storedSettings);
        }
    } catch (e){
        showToast('Error loading saved browser data', 'danger');
        console.error(e);
    }
}

function showToast(message, type = 'info', duration = 5000) {
  // Create toast element with animation class
  var toastDiv = $('<div class="alert alert-' + type + ' alert-dismissible toast-animate" role="alert" style="min-width: 250px; margin-top: 10px;">' +
                     '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                       '<span aria-hidden="true">&times;</span>' +
                     '</button>' +
                     message +
                   '</div>');

    $('#toast-container').append(toastDiv);

  // Auto-dismiss after duration
  setTimeout(function () {
    toastDiv.alert('close');
  }, duration);
}

function ui_download_settings_toggle(event) {
    $('#download-settings-opened,#download-settings-closed').toggleClass('hidden');
    app_settings.show_download_settings = event.target.id === ('download-settings-show');
    local_store_save();
}

function ui_zoom_keep_ratio(event) {
    app_settings.page_zoom_keep_ratio = event.target.checked;
    local_store_save();
}

$(document)


// ============================================================
// WordPress Media Picker — hierarchical folder browser
// ============================================================
// Calculate and display the maximum number of cards that fit on the current page,
// accounting for card size + bleed. Checks both standard and 90°-rotated orientations
// and shows whichever fits more.
// Guard against re-entrant calls triggered by the auto-rotation swap below.
var _autoRotatingPage = false;

function ui_update_cards_per_page() {
    var pw = card_options.page_width        || '';
    var ph = card_options.page_height       || '';
    var cw = card_options.card_width        || '';
    var ch = card_options.card_height       || '';
    var bw = card_options.back_bleed_width  || '';
    var bh = card_options.back_bleed_height || '';
    var pm = card_options.page_margin       || '0in';

    // Convert a unit string (e.g. "2.5in", "210mm", "4mm") to mm.
    // Returns 0 if the value is empty or unparseable.
    function toMm(val) {
        try {
            var v = (val || '').trim();
            if (!v) return 0;
            return math.unit(v).toNumber('mm');
        } catch (e) { return 0; }
    }

    var margin = Math.max(0, toMm(pm));
    var pgW = Math.max(0, toMm(pw) - margin * 2);
    var pgH = Math.max(0, toMm(ph) - margin * 2);
    // Effective card slot = card dimension + total bleed on that axis
    var cdW = toMm(cw) + toMm(bw);
    var cdH = toMm(ch) + toMm(bh);

    if (pgW <= 0 || pgH <= 0 || cdW <= 0 || cdH <= 0) {
        $('#cards-per-page-display').val('');
        return;
    }

    // -----------------------------------------------------------------------
    // Side-by-side arrangements are hardcoded to 2 useful columns per row
    // (front card + back card).  Any extra columns beyond 2 are filled with
    // blank placeholder cards, so landscape (which gives more columns) just
    // wastes space.  Force portrait + exactly 2 columns for these modes.
    // -----------------------------------------------------------------------
    var arrangement = card_options.card_arrangement || '';
    var isSideBySide = (arrangement === 'side_by_side' || arrangement === 'side_by_side_alt');

    if (isSideBySide) {
        // Ensure the page is in portrait (short side as width).
        if (!_autoRotatingPage && pgW > pgH) {
            _autoRotatingPage = true;
            swapInputValues('page-width', 'page-height');
            _autoRotatingPage = false;
            return; // re-triggered with corrected dimensions
        }
        // 2 columns (one pair per row); as many rows as fit.
        var sbsRows = Math.max(1, Math.floor(pgH / cdH));
        $('#page-columns').val(2).trigger('change');
        $('#page-rows').val(sbsRows).trigger('change');
        var sbsText = sbsRows === 0
            ? 'Card is larger than the page'
            : '2 \u00d7 ' + sbsRows + ' = ' + sbsRows + ' card pairs (portrait)';
        $('#cards-per-page-display').val(sbsText);
        return;
    }

    // -----------------------------------------------------------------------
    // Standard arrangements: pick the orientation that fits the most cards.
    // -----------------------------------------------------------------------

    // Normalise to portrait base so the comparison is orientation-independent.
    // baseW = short side, baseH = long side.
    var baseW = Math.min(pgW, pgH);
    var baseH = Math.max(pgW, pgH);

    // Cards that fit in portrait orientation
    var colsP  = Math.floor(baseW / cdW);
    var rowsP  = Math.floor(baseH / cdH);
    var totalP = colsP * rowsP;

    // Cards that fit in landscape orientation
    var colsL  = Math.floor(baseH / cdW);
    var rowsL  = Math.floor(baseW / cdH);
    var totalL = colsL * rowsL;

    // Landscape wins only when it strictly fits more cards.
    var wantsLandscape = totalL > totalP;
    var isLandscapeNow = pgW > pgH;

    // Auto-rotate the page if the current orientation is not optimal.
    // The flag prevents the swap's own change events from looping back in.
    if (!_autoRotatingPage && wantsLandscape !== isLandscapeNow) {
        _autoRotatingPage = true;
        swapInputValues('page-width', 'page-height');
        _autoRotatingPage = false;
        // The swap fires change events that will re-trigger this function
        // (via setTimeout) with the corrected dimensions. Nothing more to do.
        return;
    }

    // Use the winning orientation's grid values.
    var bestCols  = wantsLandscape ? colsL : colsP;
    var bestRows  = wantsLandscape ? rowsL : rowsP;
    var bestTotal = wantsLandscape ? totalL : totalP;

    // Push optimal grid into the columns/rows fields (triggers card_options update)
    $('#page-columns').val(Math.max(1, bestCols)).trigger('change');
    $('#page-rows').val(Math.max(1, bestRows)).trigger('change');

    // Summary display
    var text;
    if (bestTotal === 0) {
        text = 'Card is larger than the page';
    } else {
        text = bestCols + ' \u00d7 ' + bestRows + ' = ' + bestTotal + ' cards';
        text += wantsLandscape ? ' (landscape)' : ' (portrait)';
    }

    $('#cards-per-page-display').val(text);
}



var wpMediaPicker = {
    allTerms:      [],   // flat list of all card-art terms
    termMap:       {},   // id → term object
    childMap:      {},   // parentId → [child term objects]
    currentTermId: null, // active term (null = real root)
    rootTermId:    null, // effective root (the "creatures" term id)
    breadcrumb:    [],   // [{id, name}, ...]
    page:          1,
    perPage:       20,
    totalPages:    1
};

function wpMediaPickerInit() {
    // Open modal
    $('#browse-wp-media-btn').on('click', function() {
        wpMediaPicker.breadcrumb    = [];
        wpMediaPicker.page          = 1;
        $('#wp-media-picker-overlay').addClass('active');
        if (wpMediaPicker.allTerms.length > 0) {
            // Terms already loaded — reset to effective root and render
            wpMediaPicker.currentTermId = wpMediaPicker.rootTermId;
            wpMediaPickerRenderCurrent();
        } else {
            wpMediaPickerFetchTerms();
        }
    });

    // Close — X button
    $('#wp-media-picker-close').on('click', function() {
        $('#wp-media-picker-overlay').removeClass('active');
    });
    // Close — click backdrop
    $('#wp-media-picker-overlay').on('click', function(e) {
        if (e.target === this) $(this).removeClass('active');
    });
    // Close — Escape key
    $(document).on('keydown.wpMediaPicker', function(e) {
        if (e.key === 'Escape') $('#wp-media-picker-overlay').removeClass('active');
    });

    // Pagination
    $('#wp-media-picker-prev').on('click', function() {
        if (wpMediaPicker.page > 1) {
            wpMediaPicker.page--;
            wpMediaPickerLoadImages();
        }
    });
    $('#wp-media-picker-next').on('click', function() {
        if (wpMediaPicker.page < wpMediaPicker.totalPages) {
            wpMediaPicker.page++;
            wpMediaPickerLoadImages();
        }
    });
}

// Fetch every card-art term once, build parent→children map, then render
function wpMediaPickerFetchTerms() {
    var $grid = $('#wp-media-picker-grid');
    $grid.html('<div id="wp-media-picker-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>');
    $('#wp-media-picker-footer').hide();

    fetch('/wp-json/wp/v2/card-art?per_page=100&orderby=name&order=asc')
        .then(function(r) { return r.json(); })
        .then(function(terms) {
            wpMediaPicker.allTerms = Array.isArray(terms) ? terms : [];
            wpMediaPicker.termMap  = {};
            wpMediaPicker.childMap = {};

            wpMediaPicker.allTerms.forEach(function(t) {
                wpMediaPicker.termMap[t.id] = t;
                var pid = t.parent || 0;
                if (!wpMediaPicker.childMap[pid]) wpMediaPicker.childMap[pid] = [];
                wpMediaPicker.childMap[pid].push(t);
            });

            // Pin the "creatures" term as the effective root
            var rootTerm = wpMediaPicker.allTerms.find(function(t) { return t.slug === 'creatures'; });
            wpMediaPicker.rootTermId    = rootTerm ? rootTerm.id : null;
            wpMediaPicker.currentTermId = wpMediaPicker.rootTermId;

            wpMediaPickerRenderCurrent();
        })
        .catch(function() {
            $grid.html('<div id="wp-media-picker-loading">Failed to load folders. Check that the WordPress REST API is accessible.</div>');
        });
}

// Decide whether to show folders or images for the current level
function wpMediaPickerRenderCurrent() {
    var pid      = wpMediaPicker.currentTermId || 0;
    var children = wpMediaPicker.childMap[pid] || [];

    wpMediaPickerRenderBreadcrumb();

    if (children.length > 0) {
        // Show folder tiles — hide pagination
        wpMediaPickerRenderFolders(children);
        $('#wp-media-picker-footer').hide();
    } else if (wpMediaPicker.currentTermId !== null) {
        // Leaf term — show images with pagination
        wpMediaPicker.page = 1;
        wpMediaPickerLoadImages();
    } else {
        // Root with no terms at all
        $('#wp-media-picker-grid').html('<div id="wp-media-picker-loading">No folders found in the card-art taxonomy.</div>');
        $('#wp-media-picker-footer').hide();
    }
}

// Render folder tiles for the given array of terms
function wpMediaPickerRenderFolders(terms) {
    var $grid = $('#wp-media-picker-grid');
    $grid.empty();

    terms.forEach(function(term) {
        var $tile = $('<div class="wp-media-folder-tile"></div>')
            .attr('data-term-id',   term.id)
            .attr('data-term-name', term.name);

        $tile.append('<i class="fa-solid fa-folder"></i>');
        $tile.append('<span class="wp-media-folder-tile-name">' + $('<span>').text(term.name).html() + '</span>');

        // Show a placeholder while we fetch the real count
        var $count = $('<span class="wp-media-folder-tile-count">…</span>');
        $tile.append($count);
        fetch('/wp-json/wp/v2/media?media_type=image&per_page=1&card-art=' + term.id)
            .then(function(r) {
                var n = parseInt(r.headers.get('X-WP-Total'), 10) || 0;
                $count.text(n + ' image' + (n !== 1 ? 's' : ''));
            })
            .catch(function() { $count.remove(); });

        $tile.on('click', function() {
            wpMediaPickerNavigate(term.id, term.name);
        });

        $grid.append($tile);
    });
}

// Navigate into a folder
function wpMediaPickerNavigate(termId, termName) {
    wpMediaPicker.breadcrumb.push({ id: termId, name: termName });
    wpMediaPicker.currentTermId = termId;
    wpMediaPicker.page          = 1;
    wpMediaPickerRenderCurrent();
}

// Render the breadcrumb trail
function wpMediaPickerRenderBreadcrumb() {
    var $bc = $('#wp-media-picker-breadcrumb');
    $bc.empty();

    if (wpMediaPicker.breadcrumb.length === 0) return;

    // Home crumb — label is the root term name (e.g. "Creatures")
    var rootLabel = (wpMediaPicker.rootTermId && wpMediaPicker.termMap[wpMediaPicker.rootTermId])
        ? wpMediaPicker.termMap[wpMediaPicker.rootTermId].name
        : 'All';
    var $home = $('<button class="wp-media-crumb"></button>').text(rootLabel);
    $home.on('click', function() {
        wpMediaPicker.breadcrumb    = [];
        wpMediaPicker.currentTermId = wpMediaPicker.rootTermId;
        wpMediaPicker.page          = 1;
        wpMediaPickerRenderCurrent();
    });
    $bc.append($home);

    wpMediaPicker.breadcrumb.forEach(function(crumb, i) {
        $bc.append('<span class="wp-media-crumb-sep"> / </span>');
        var isLast = (i === wpMediaPicker.breadcrumb.length - 1);
        if (isLast) {
            $bc.append('<span class="wp-media-crumb-current">' + $('<span>').text(crumb.name).html() + '</span>');
        } else {
            var $crumb = $('<button class="wp-media-crumb"></button>').text(crumb.name);
            (function(idx) {
                $crumb.on('click', function() {
                    wpMediaPicker.breadcrumb    = wpMediaPicker.breadcrumb.slice(0, idx + 1);
                    wpMediaPicker.currentTermId = crumb.id;
                    wpMediaPicker.page          = 1;
                    wpMediaPickerRenderCurrent();
                });
            })(i);
            $bc.append($crumb);
        }
    });
}

// Fetch images for the current leaf term and render the grid
function wpMediaPickerLoadImages() {
    var $grid = $('#wp-media-picker-grid');
    $grid.html('<div id="wp-media-picker-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>');
    $('#wp-media-picker-prev, #wp-media-picker-next').prop('disabled', true);

    var url = '/wp-json/wp/v2/media?media_type=image&per_page=' + wpMediaPicker.perPage +
              '&page=' + wpMediaPicker.page + '&orderby=date&order=desc';
    if (wpMediaPicker.currentTermId !== null) {
        url += '&card-art=' + wpMediaPicker.currentTermId;
    }

    fetch(url)
        .then(function(r) {
            wpMediaPicker.totalPages = parseInt(r.headers.get('X-WP-TotalPages'), 10) || 1;
            return r.json();
        })
        .then(function(items) {
            $grid.empty();
            if (!items || items.length === 0) {
                $grid.html('<div id="wp-media-picker-loading">No images found in this folder.</div>');
                wpMediaPickerUpdatePager();
                $('#wp-media-picker-footer').show();
                return;
            }

            items.forEach(function(item) {
                var sizes    = item.media_details && item.media_details.sizes;
                var thumbUrl = (sizes && sizes.medium)
                    ? sizes.medium.source_url
                    : (sizes && sizes.thumbnail)
                        ? sizes.thumbnail.source_url
                        : item.source_url;
                var fullUrl = item.source_url;
                var title   = (item.title && item.title.rendered) ? item.title.rendered : '';

                var $wrapper = $('<div class="wp-media-thumb-wrapper"></div>');
                var $img = $('<img class="wp-media-thumb" loading="lazy">')
                    .attr('src', thumbUrl)
                    .attr('alt', title)
                    .attr('title', title)
                    .attr('data-full', fullUrl);

                $img.on('click', function() {
                    var card = ui_selected_card();
                    if (!card) return;
                    var selectedUrl = $(this).data('full');
                    card.creature_artwork = selectedUrl;
                    $('#monster-creature-artwork').val(selectedUrl).trigger('change');
                    ui_render_selected_card();
                    local_store_save();
                    $('#wp-media-picker-overlay').removeClass('active');
                });

                $wrapper.append($img);
                $grid.append($wrapper);
            });

            wpMediaPickerUpdatePager();
            $('#wp-media-picker-footer').show();
        })
        .catch(function() {
            $grid.html('<div id="wp-media-picker-loading">Failed to load images. Check that the WordPress REST API is accessible.</div>');
            $('#wp-media-picker-footer').show();
        });
}

// Update pagination button states and page label
function wpMediaPickerUpdatePager() {
    var p  = wpMediaPicker.page;
    var tp = wpMediaPicker.totalPages;
    $('#wp-media-picker-page-info').text('Page ' + p + ' of ' + tp);
    $('#wp-media-picker-prev').prop('disabled', p <= 1);
    $('#wp-media-picker-next').prop('disabled', p >= tp);
}

$(document).ready(function () {
    parse_card_actions().then(function () {
        return local_store_load();
    }).catch(function () {
        return local_store_load();
    }).finally(function () {

    // Drawer toggle
    $('#drawer-toggle').on('click', function() {
        $('html').toggleClass('drawer-open');
        var isOpen = $('html').hasClass('drawer-open');
        localStorage.setItem('drawerOpen', isOpen ? 'true' : 'false');
    });

    // Accordion mutual exclusion — only one section open at a time
    $('#monster-form-accordion .panel-collapse').on('show.bs.collapse', function(event) {
        $('#monster-form-accordion .panel-collapse').not(event.target).collapse('hide');
    });

    // Scroll to panel heading when accordion opens
    $('#monster-form-accordion').on('shown.bs.collapse', function(event) {
        var $heading = $(event.target).closest('.panel').find('.panel-heading');
        if ($heading.length) {
            $('html, body').animate({ scrollTop: $heading.offset().top - 12 }, 250);
        }
    });

    // Section completion counters — specific field definitions per section
    var sectionFieldConfig = {
        sectionCard: {
            total: 3,
            fields: ['card-title', 'card-count', 'monster-creature-artwork'],
            type: 'text'
        },
        sectionIdentity: {
            total: 7,
            fields: ['monster-level', 'monster-class', 'monster-subclass', 'monster-race', 'monster-npc-alignment', 'monster-roleplay-background', 'monster-appearance'],
            type: 'text'
        },
        sectionCreatureIdentity: {
            total: 5,
            fields: ['monster-challenge-rating', 'monster-size', 'monster-alignment', 'monster-creature-type', 'monster-creature-subtype'],
            type: 'text'
        },
        sectionAbilityScores: {
            total: 6,
            fields: ['monster-str', 'monster-dex', 'monster-con', 'monster-int', 'monster-wis', 'monster-cha'],
            type: 'number'
        },
        sectionDefense: {
            total: 1,
            fields: ['monster-ac-type'],
            type: 'select'
        },
        sectionSpeeds: {
            total: 5,
            fields: ['monster-walk-speed', 'monster-burrow-speed', 'monster-climb-speed', 'monster-fly-speed', 'monster-swim-speed'],
            type: 'number_nonzero'
        },
        sectionResistances: {
            total: 13,
            checkboxContainer: 'monster-damage-resistances-cb',
            type: 'checkboxes'
        },
        sectionDamageImmunities: {
            total: 13,
            checkboxContainer: 'monster-damage-immunities-cb',
            type: 'checkboxes'
        },
        sectionVulnerabilities: {
            total: 13,
            checkboxContainer: 'monster-damage-vulnerabilities-cb',
            type: 'checkboxes'
        },
        sectionConditionImmunities: {
            total: 26,
            checkboxContainer: 'monster-condition-immunities-cb',
            type: 'checkboxes'
        },
        sectionSavingThrows: {
            total: 6,
            checkboxContainer: 'monster-saving-throws-cb',
            type: 'checkboxes'
        },
        sectionSkills: {
            total: 18,
            fields: [
                'monster-skill-acrobatics', 'monster-skill-animal_handling', 'monster-skill-arcana',
                'monster-skill-athletics', 'monster-skill-deception', 'monster-skill-history',
                'monster-skill-insight', 'monster-skill-intimidation', 'monster-skill-investigation',
                'monster-skill-medicine', 'monster-skill-nature', 'monster-skill-perception',
                'monster-skill-performance', 'monster-skill-persuasion', 'monster-skill-religion',
                'monster-skill-sleight_of_hand', 'monster-skill-stealth', 'monster-skill-survival'
            ],
            type: 'skill'
        },
        sectionSenses: {
            total: 4,
            fields: ['monster-blindsight', 'monster-darkvision', 'monster-tremorsense', 'monster-truesight'],
            type: 'number_nonzero'
        },
        sectionLanguages: {
            total: 20,
            type: 'language_checkboxes'
        },
        sectionActions: {
            total: 4,
            fields: [
                'monster-roleplay-personality',
                'monster-roleplay-quirk', 'monster-roleplay-flaw', 'monster-roleplay-goal'
            ],
            type: 'text'
        },
        sectionCreatureTraits: { total: 0, type: 'dynamic_title_text_pairs', containerId: 'monster-traits-repeater' },
        sectionCreatureActions: { total: 0, type: 'dynamic_title_text_pairs', containerId: 'monster-actions-repeater' },
        sectionCreatureBonusActions: { total: 0, type: 'dynamic_title_text_pairs', containerId: 'monster-bonusactions-repeater' },
        sectionCreatureReactions: { total: 0, type: 'dynamic_title_text_pairs', containerId: 'monster-reactions-repeater' },
        sectionCreatureLegendary: { total: 0, type: 'dynamic_title_text_pairs', containerId: 'monster-legendary-repeater' },
        sectionBonusActions: {
            total: 0,
            fields: [],
            type: 'inventory'
        },
        sectionReactions: {
            total: 5,
            type: 'related_cards',
            prefix: 'monster-related',
            count: 5
        },
        sectionItemDetails: {
            total: 6,
            fields: ['item-type', 'item-subtype', 'item-rarity', 'item-cost', 'item-weight', 'item-attunement'],
            type: 'text'
        },
        sectionItemFeatures: {
            total: 2,
            fields: ['item-description', 'item-flavour-text'],
            type: 'item_description',
            containerId: 'item-features-repeater'
        },
        sectionItemCombat: {
            total: 5,
            fields: ['item-damage-dice', 'item-damage-type', 'item-range-normal', 'item-range-long', 'item-ac'],
            type: 'text'
        },
        sectionItemCurse: {
            total: 1,
            fields: ['item-curse-text'],
            type: 'text'
        },
        sectionItemSentience: {
            total: 14,
            fields: [
                'item-sentient-alignment', 'item-sentient-int', 'item-sentient-wis', 'item-sentient-cha',
                'item-sentient-blindsight', 'item-sentient-darkvision', 'item-sentient-tremorsense',
                'item-sentient-truesight', 'item-sentient-hearing', 'item-sentient-text',
                'item-sentient-personality', 'item-sentient-quirk', 'item-sentient-flaw', 'item-sentient-goal'
            ],
            type: 'text'
        }
    };

    function countFilledFields(config) {
        var filled = 0;
        var total = config.total;

        switch (config.type) {
            case 'text':
                config.fields.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.value && el.value.trim() !== '') filled++;
                });
                break;

            case 'inventory':
                config.fields.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.value && el.value.trim() !== '') filled++;
                });
                var inventoryRows = document.querySelectorAll('#npc-weapons-detailed-repeater .npc-inventory-card, #npc-loot-detailed-repeater .npc-inventory-card');
                total = config.total + inventoryRows.length;
                inventoryRows.forEach(function(row) {
                    var fields = row.querySelectorAll('.npc-inventory-name, .npc-inventory-item-tag, .npc-weapon-attack-bonus-override, .npc-weapon-damage-dice, .npc-weapon-damage-type, .npc-inventory-notes');
                    var hasInventoryContent = Array.from(fields).some(function(field) {
                        return field && field.value && field.value.trim() !== '';
                    });
                    if (hasInventoryContent) filled++;
                });
                break;

            case 'select':
                config.fields.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.value && el.value !== '' && el.value !== el.options[0].value) filled++;
                });
                break;

            case 'number':
                config.fields.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.value !== '') filled++;
                });
                break;

            case 'number_nonzero':
                config.fields.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.value !== '' && el.value !== '0' && Number(el.value) > 0) filled++;
                });
                break;

            case 'checked':
                config.fields.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.checked) filled++;
                });
                break;

            case 'checkboxes':
                var container = document.getElementById(config.checkboxContainer);
                if (container) {
                    var allCb = container.querySelectorAll('input[type="checkbox"]');
                    total = allCb.length || config.total;
                    allCb.forEach(function(cb) { if (cb.checked) filled++; });
                }
                break;

            case 'skill':
                config.fields.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.value !== 'none') filled++;
                });
                break;

            case 'language_checkboxes':
                var stdContainer = document.getElementById('monster-languages-standard-cb');
                var exoContainer = document.getElementById('monster-languages-exotic-cb');
                var allLangCb = [];
                if (stdContainer) allLangCb = allLangCb.concat(Array.from(stdContainer.querySelectorAll('input[type="checkbox"]')));
                if (exoContainer) allLangCb = allLangCb.concat(Array.from(exoContainer.querySelectorAll('input[type="checkbox"]')));
                total = allLangCb.length || config.total;
                allLangCb.forEach(function(cb) { if (cb.checked) filled++; });
                break;

            case 'title_text_pairs':
                for (var i = 1; i <= config.count; i++) {
                    var titleEl = document.getElementById(config.prefix + '-' + i + '-title');
                    var textEl = document.getElementById(config.prefix + '-' + i + '-text');
                    if (titleEl && textEl &&
                        titleEl.value && titleEl.value.trim() !== '' &&
                        textEl.value && textEl.value.trim() !== '') {
                        filled++;
                    }
                }
                break;

            case 'dynamic_title_text_pairs':
                var container = document.getElementById(config.containerId);
                if (container) {
                    var rows = container.querySelectorAll('.monster-entry-repeater-row');
                    total = rows.length || 0;
                    rows.forEach(function (row) {
                        var titleEl = row.querySelector('.monster-entry-repeater-title');
                        var textEl = row.querySelector('.monster-entry-repeater-text');
                        if (titleEl && textEl &&
                            titleEl.value && titleEl.value.trim() !== '' &&
                            textEl.value && textEl.value.trim() !== '') {
                            filled++;
                        }
                    });
                }
                break;

            case 'item_description':
                config.fields.forEach(function(id) {
                    var field = document.getElementById(id);
                    if (field && field.value && field.value.trim() !== '') filled++;
                });
                var benefitContainer = document.getElementById(config.containerId);
                if (benefitContainer) {
                    var benefitRows = benefitContainer.querySelectorAll('.monster-entry-repeater-row');
                    total = config.total + benefitRows.length;
                    benefitRows.forEach(function (row) {
                        var titleField = row.querySelector('.monster-entry-repeater-title');
                        var textField = row.querySelector('.monster-entry-repeater-text');
                        if (titleField && textField &&
                            titleField.value && titleField.value.trim() !== '' &&
                            textField.value && textField.value.trim() !== '') {
                            filled++;
                        }
                    });
                }
                break;

            case 'related_cards':
                for (var r = 1; r <= config.count; r++) {
                    var nameEl = document.getElementById(config.prefix + '-' + r + '-name');
                    if (nameEl && nameEl.value && nameEl.value.trim() !== '') {
                        filled++;
                    }
                }
                break;
        }

        return { filled: filled, total: total };
    }

    // Ordered list of section IDs — used for "advance to next section" behaviour.
    var SECTION_ORDER = [
        'sectionCard',
        // Item sections (hidden unless Card Type = Item)
        'sectionItemDetails', 'sectionItemFeatures', 'sectionItemCombat', 'sectionItemCurse', 'sectionItemSentience',
        // Creature Challenge & Identity
        'sectionCreatureIdentity',
        // NPC sections
        'sectionIdentity', 'sectionActions', 'sectionBonusActions', 'sectionReactions',
        // Combat Stats group
        'sectionAbilityScores', 'sectionDefense', 'sectionSpeeds', 'sectionResistances',
        'sectionDamageImmunities', 'sectionVulnerabilities', 'sectionConditionImmunities',
        'sectionSavingThrows', 'sectionSkills', 'sectionSenses', 'sectionLanguages',
        // Creature trait/action groups
        'sectionCreatureTraits', 'sectionCreatureActions', 'sectionCreatureBonusActions',
        'sectionCreatureReactions', 'sectionCreatureLegendary'
    ];

    window.updateSectionCounters = function() {
        var card = ui_selected_card();
        var complete = (card && card.sections_complete) ? card.sections_complete : {};

        $('.section-counter').each(function() {
            var sectionId = $(this).data('section');

            // Show checkmark when section is marked complete
            if (complete[sectionId]) {
                $(this).text('✓').addClass('has-content is-complete');
                return;
            }

            $(this).removeClass('is-complete');
            var config = sectionFieldConfig[sectionId];
            if (!config) {
                $(this).text('').removeClass('has-content');
                return;
            }

            var result = countFilledFields(config);

            if (result.total === 0) {
                $(this).text('').removeClass('has-content');
            } else {
                $(this).text(result.filled + '/' + result.total);
                if (result.filled > 0) {
                    $(this).addClass('has-content');
                } else {
                    $(this).removeClass('has-content');
                }
            }
        });
    }

    // Reflect current card's completion state on all buttons
    function updateSectionCompleteButtons() {
        var card = ui_selected_card();
        var complete = (card && card.sections_complete) ? card.sections_complete : {};
        $('.section-complete-btn').each(function() {
            var isComplete = !!complete[$(this).data('section')];
            $(this).toggleClass('active', isComplete);
            $(this).text(isComplete ? '✓  Complete' : 'Mark as Complete');
        });
    }

    // Inject a Complete button row at the bottom of every section panel-body
    SECTION_ORDER.forEach(function(sectionId) {
        var $body = $('#collapse_' + sectionId + ' > .panel-body');
        if ($body.length) {
            $body.append(
                '<div class="section-complete-row">' +
                '<button type="button" class="btn section-complete-btn" data-section="' + sectionId + '">' +
                'Mark as Complete' +
                '</button>' +
                '</div>'
            );
        }
    });

    // Complete button click handler
    $(document).on('click', '.section-complete-btn', function() {
        var card = ui_selected_card();
        if (!card) return;
        var sectionId = $(this).data('section');
        if (!card.sections_complete) card.sections_complete = {};
        var isNowComplete = !card.sections_complete[sectionId];
        card.sections_complete[sectionId] = isNowComplete;
        local_store_save();
        updateSectionCounters();
        updateSectionCompleteButtons();
        if (isNowComplete) {
            var idx = SECTION_ORDER.indexOf(sectionId);
            // Advance to the next *visible* section (skips sections hidden by
            // the current card type or the combat-stats toggle)
            var nextId = null;
            for (var n = idx + 1; idx >= 0 && n < SECTION_ORDER.length; n++) {
                if ($('#' + SECTION_ORDER[n]).is(':visible')) { nextId = SECTION_ORDER[n]; break; }
            }
            if (nextId) {
                var $next = $('#collapse_' + nextId);
                // If the next section is nested (e.g. inside Combat Stats), open its parent group too
                $next.parents('.panel-collapse').not('.in').collapse('show');
                $next.collapse('show');
            } else {
                $('#collapse_' + sectionId).collapse('hide');
            }
        }
    });

    // Update counters on any input change
    $(document).on('input change', '#monster-form-accordion input, #monster-form-accordion select, #monster-form-accordion textarea', function() {
        updateSectionCounters();
    });

    // Initial counter update
    updateSectionCounters();
    updateSectionCompleteButtons();

    if (!window.showSaveFilePicker) {
        $('#download-settings-available,#download-settings-unavailable').toggleClass('hidden');
    }

    if (app_settings.show_download_settings) {
        $('#download-settings-opened').removeClass('hidden');
    } else {
        $('#download-settings-closed').removeClass('hidden');
    }

    $('#download-settings-show,#download-settings-hide').click(ui_download_settings_toggle);

    $('#danger-zone-show,#danger-zone-hide').click(() => {
        $('#danger-zone-opened,#danger-zone-closed').toggleClass('hidden');
    });

    $('#clear-all').on('click', () => {
        if (confirm('Delete all saved data?\n\nThis will reset the entire app to its original state and erase all saved cards and settings.\n\nMake sure you\'ve downloaded your cards before continuing.')) {
            localStorage.clear();
            window.location.reload();
        }
    });

    function ui_set_default_tab_values(options) {
        $("#default-icon-front").val(options.default_icon_front_container);
        $("#default-icon-back").val(options.default_icon_back);
        $("#default-icon-back-container").val(options.default_icon_back_container).trigger("change");
        $("#default-title-size").val(options.default_title_size);
        $("#default-card-font-size").val(options.default_card_font_size);
    	$("#default-card-background").val(options.default_background_image);
    }

    function ui_set_page_tab_values(options) {
       $("#card-size").val(options.card_size).change();
       $("#card-arrangement").val(options.card_arrangement).change();
       $("#page-rows").val(options.page_rows).change();
       $("#page-columns").val(options.page_columns).change();
       $("#page-margin").val(options.page_margin || '0in').change();
       $("#back-bleed-width").val(options.back_bleed_width).change();
       $("#back-bleed-height").val(options.back_bleed_height).change();
       ui_sync_bleed_preset();
       $("#page-zoom-keep-ratio").prop('checked', app_settings.page_zoom_keep_ratio);
       $("#page-zoom-width").val(options.page_zoom_width);
       $("#page-zoom-height").val(options.page_zoom_height);
       $("#card-zoom-width").val(options.card_zoom_width);
       $("#card-zoom-height").val(options.card_zoom_height);
       $("#rounded-corners").prop('checked', options.rounded_corners);
    }

    function ui_reset_group_tab_values(group) {
        if (!confirm('Reset the current tab\'s value?')) return;
        getFieldGroup(group).forEach(field => field.reset());
        if(group === 'page') {
            ui_set_page_tab_values(default_card_options());
        } else if (group === 'default') {
            ui_set_default_tab_values(default_card_options());
        }
    }

    // Repair card/page dimensions wiped by an older bug: the Card Size select had
    // no option matching the default "63mm,88mm", so startup cleared the selection
    // and blanked card_width/card_height in saved options. Restore defaults when
    // the stored values are empty or unparseable.
    (function () {
        var d = default_card_options();
        if (!parseFloat(card_options.card_width) || !parseFloat(card_options.card_height)) {
            card_options.card_size = d.card_size;
            card_options.card_width = d.card_width;
            card_options.card_height = d.card_height;
            card_options.card_zoom_width = d.card_zoom_width;
            card_options.card_zoom_height = d.card_zoom_height;
            card_options.page_zoom_width = d.page_zoom_width;
            card_options.page_zoom_height = d.page_zoom_height;
        }
        if (!parseFloat(card_options.page_width) || !parseFloat(card_options.page_height)) {
            card_options.page_size = d.page_size;
            card_options.page_width = d.page_width;
            card_options.page_height = d.page_height;
        }
    })();

    UI_FIELDS_CONFIGURATION_PREPARE.forEach((prepareGroupConfig, key) => {
        UI_FIELDS_CONFIGURATION.set(key, prepareGroupConfig());
    });
    UI_FIELDS_CONFIGURATION.forEach(groupConfig => groupConfig.forEach(initField));

    ui_set_page_tab_values(card_options);
    ui_set_default_tab_values(card_options);

    $('#default-icon-front').val(card_options.default_icon_front);
    $('#default-icon-back').val(card_options.default_icon_back);
    $('#default-title-size').val(card_options.default_title_size);
    $('#default-card-font-size').val(card_options.default_card_font_size);

    $('.icon-list').typeahead({
        source: icon_names,
        items: 'all',
        render: function (items) {
          var that = this;

          items = $(items).map(function (i, item) {
            i = $(that.options.item).data('value', item);
            i.find('a').html(that.highlighter(item));
            var classname = 'icon-' + item.split(' ').join('-').toLowerCase();
            i.find('a').append('<span class="' + classname + '"></span>');
            return i[0];
          });

          if (this.autoSelect) {
            items.first().addClass('active');
          }
          this.$menu.html(items);
          return this;
        }
    });

    $("#button-generate").click(ui_generate);
    $("#button-load").click(function () {
        $("#file-load").attr({
            'data-opening': '',
            'data-clear-all': '',
        }).click();
    });
    $("#button-open").click(function () {
        if (card_data.length && document.getElementById('ask-before-delete').checked) {
            if (!confirm('This will delete all cards.\nAre you sure?')) return;
        }
        $("#file-load").attr({
            'data-opening': '1',
            'data-clear-all': '1',
        }).click();
    });
    $("#file-load").change(ui_load_files);
    $("#button-clear").click(function () { ui_clear_all(true); });
    $("#button-load-sample").click(ui_load_sample);
    $("#button-save").click(ui_save_file);
    $("#button-sort").click(ui_sort);
    $("#button-filter").click(ui_filter);
    $("#button-add-card").click(ui_add_new_card);
    $("#button-duplicate-card").click(ui_duplicate_card);
    $("#button-delete-card").click(ui_delete_card);
    $("#button-copy-card").click(ui_copy_card);
    $("#button-copy-all").click(ui_copy_all_cards);
    $("#button-paste-card").click(ui_paste_card);
    $("#button-export-png").click(ui_export_card_png);
    $("#button-export-png-fast").click(ui_export_card_png_fast);
    $("#button-help").click(ui_open_help);
    $("#button-apply-default-color-front").click(ui_apply_default_color_front);
    $("#button-apply-default-color-back").click(ui_apply_default_color_back);
    $("#button-apply-default-font-title").click(ui_apply_default_font_title);
    $("#button-apply-default-title-color").click(ui_apply_default_title_color);
    $("#button-apply-default-font-card").click(ui_apply_default_font_card);
    $("#button-apply-default-icon-front").click(ui_apply_default_icon_front);
    $("#button-apply-default-icon-back").click(ui_apply_default_icon_back);
    $("#button-apply-default-icon-back-container").click(ui_apply_default_icon_back_container);
    $("#button-apply-default-icon-back-rotation").click(ui_apply_default_icon_back_rotation);
    $("#button-apply-default-card-background").click(ui_apply_default_card_background);

    $("#deck-cards-list").change(ui_update_selected_card);
    $("#deck-cards-list").on('mousedown', '.deck-card-inline-action', function(event) {
        event.preventDefault();
        event.stopPropagation();
    });
    $("#deck-cards-list").on('click', '.deck-card-inline-action', ui_handle_deck_inline_action);
    $("#deck-cards-list-title-filter").on('input', ui_filter_selected_card_title);
    $('.search-clear-btn').each(function(){search_clear_button_init(this)});
    ui_setup_deck_sidebar_layout();

    ui_monster_form_init();

    $("#page-rotate").click(ui_page_rotate);
    $("#page-rows").change(ui_change_option);
    $("#page-columns").change(ui_change_option);
    $("#page-zoom-width").on("input", ui_change_option);
    $("#page-zoom-height").on("input", ui_change_option);
    $("#page-zoom-rotate").click(ui_zoom_rotate);
    $("#page-zoom-keep-ratio").change(ui_zoom_keep_ratio);
    $('#page-zoom-100').click(ui_zoom_100);
    $("#card-zoom-width").on("input", ui_change_option);
    $("#card-zoom-height").on("input", ui_change_option);
    $("#card-zoom-rotate").click(ui_zoom_rotate);
    $("#grid-rotate").click(ui_grid_rotate);
    $("#card-arrangement").change(ui_change_option).change(function () {
        setTimeout(ui_update_cards_per_page, 0);
    });
    $("#card-width").on("input", ui_change_option);
    $("#card-height").on("input", ui_change_option);
    $("#card-size").change(ui_change_option).trigger("change");
    $("#card-rotate").click(ui_card_rotate);
    $("#background-color").change(ui_change_option);
    $("#rounded-corners").change(ui_change_option);
    $("#back-bleed-width").on("input", ui_change_option);
    $("#back-bleed-height").on("input", ui_change_option);
    $("#back-bleed-rotate").click(ui_back_bleed_rotate);

    // Bleed preset dropdown — drives the hidden back-bleed-width/height inputs.
    // The option values use 'in' (not '"') so math.unit can parse them correctly.
    //
    // IMPORTANT: BLEED_PRESETS is defined *inside* ui_sync_bleed_preset (not as a
    // module-level var) because ui_sync_bleed_preset is called from
    // ui_set_page_tab_values which runs at init *before* any var declarations
    // below line 2708 have been initialised (var hoists the name but not the value).

    // Convert a bleed string like "2mm" or "0.0625in" to millimetres.
    // Returns NaN on parse failure so callers can distinguish zero from error.
    function bleedToMm(v) {
        try {
            var s = (v || '').trim();
            if (!s) return NaN;
            return math.unit(s).toNumber('mm');
        } catch(e) {
            return NaN;
        }
    }

    // Snap the #bleed-preset dropdown to the nearest preset, then push that
    // canonical value into both hidden bleed inputs and card_options.
    // Pass noEvents=true during init so no change/input events fire prematurely.
    function ui_sync_bleed_preset(noEvents) {
        // Defined here (not at outer scope) so the array is always initialised
        // regardless of when this function is called during init.
        var BLEED_PRESETS = ['0in', '0.03125in', '0.0625in', '0.125in'];

        var storedVal = card_options.back_bleed_width || '';
        var storedMm  = bleedToMm(storedVal);

        // If stored value is already one of our presets, use it directly.
        // Otherwise pick the nearest preset by mm distance (falling back to 1/16").
        var best = '0.0625in';
        if (BLEED_PRESETS.indexOf(storedVal) !== -1) {
            best = storedVal;
        } else if (!isNaN(storedMm)) {
            var bestDiff = Infinity;
            BLEED_PRESETS.forEach(function(p) {
                var diff = Math.abs(bleedToMm(p) - storedMm);
                if (diff < bestDiff) { bestDiff = diff; best = p; }
            });
        }

        $('#bleed-preset').val(best);
        $('#back-bleed-width').val(best);
        $('#back-bleed-height').val(best);

        if (noEvents) {
            // During init: write directly into card_options so no render is triggered.
            card_options.back_bleed_width  = best;
            card_options.back_bleed_height = best;
        } else {
            // Post-init: fire events so ui_change_option updates card_options and
            // ui_update_cards_per_page recalculates the grid.
            $('#back-bleed-width').trigger('input').trigger('change');
            $('#back-bleed-height').trigger('input').trigger('change');
        }
    }

    $('#bleed-preset').on('change', function() {
        var val = $(this).val();
        $('#back-bleed-width').val(val).trigger('input').trigger('change');
        $('#back-bleed-height').val(val).trigger('input').trigger('change');
    });

    // Initialise: snap to nearest preset on first load.
    // noEvents=true prevents premature renders during init.
    ui_sync_bleed_preset(true);

    $("#default-icon-front").change(ui_change_default_icon_front);
    $("#default-icon-back").change(ui_change_default_icon_back)
    $("#default-icon-back-rotation").change(ui_change_default_icon_back_rotation);
    $("#default-icon-back-container").change(ui_change_default_icon_back_container);
    $("#default-title-size").change(ui_change_default_title_size);
    $("#default-card-font-size").change(ui_change_default_card_font_size);
    $("#default-card-background").change(ui_change_default_card_background);

    $("#small-icons").change(ui_change_default_icon_size);
    $("#reset-default-tab-values").click(()=>ui_reset_group_tab_values('default'));
    $("#reset-page-tab-values").click(()=>ui_reset_group_tab_values('page'));

    $(".icon-select-button").click(ui_select_icon);

    $("#sort-execute").click(ui_sort_execute);
    $("#filter-execute").click(ui_filter_execute);

    $("#button-move-top").click(ui_move_top);
    $("#button-move-bottom").click(ui_move_bottom);
    $("#button-move-up").click(ui_move_up);
    $("#button-move-down").click(ui_move_down);

    // Cards-per-page: recalculate whenever any page/card dimension or bleed changes.
    // setTimeout defers until after card_options has been updated by the field system.
    $('#page-width, #page-height, #page-margin, #card-width, #card-height, #back-bleed-width, #back-bleed-height')
        .on('change input', function () { setTimeout(ui_update_cards_per_page, 0); });
    ui_update_cards_per_page();

    wpMediaPickerInit();

    ui_update_card_list();

    // Auto-select first card on load, or create one if deck is empty
    if (card_data.length > 0) {
        ui_select_card_by_index(0);
    } else {
        ui_add_new_card();
    }
    });
});
