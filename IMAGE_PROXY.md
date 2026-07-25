# Image Proxy

This app is mostly static, so remote image URLs can fail color sampling when the
image host blocks browser canvas access with CORS. A small local proxy avoids that.

## Run it

From the project folder:

`node scripts/image-proxy.mjs`

By default it runs at:

`http://127.0.0.1:8787`

## What it does

- Accepts `GET /image?url=...`
- Fetches the remote image server-side
- Returns it with `Access-Control-Allow-Origin: *`

The front-end now tries direct browser sampling first, then falls back to this
proxy automatically if direct sampling fails.

## Optional config

The front-end uses `window.ARTWORK_PROXY_BASE`, which defaults to:

`http://127.0.0.1:8787`

You can disable proxy fallback by setting:

`window.ARTWORK_PROXY_BASE = ''`

before `js/ui.js` runs.
