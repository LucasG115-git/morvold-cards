# Image Proxy

This app is mostly static, so remote image URLs can fail color sampling when the
image host blocks browser canvas access with CORS. A small proxy avoids that.

## Hosted on Vercel

The deployed app uses the Vercel Function at:

`/api/image?url=...`

When the app is opened from an `http://` or `https://` URL, the front-end defaults
to the same-origin proxy base:

`window.location.origin + '/api'`

That means Vercel deployments can sample remote artwork without relying on the
old local `127.0.0.1` helper.

## Run it

When opening the app directly from the filesystem (`file://`), run the local
proxy from the project folder:

`node scripts/image-proxy.mjs`

By default it runs at:

`http://127.0.0.1:8787`

## What it does

- Accepts `GET /image?url=...`
- Fetches the remote image server-side
- Returns it with `Access-Control-Allow-Origin: *`

The front-end tries direct browser sampling first, then falls back to the
appropriate proxy automatically if direct sampling fails.

## Optional config

The front-end uses `window.ARTWORK_PROXY_BASE`, which defaults to `/api` on
hosted `http(s)` pages and to the local helper on `file://` pages:

`http://127.0.0.1:8787`

You can disable proxy fallback by setting:

`window.ARTWORK_PROXY_BASE = ''`

before `js/ui.js` runs.
