import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.IMAGE_PROXY_PORT || 8787);
const HOST = process.env.IMAGE_PROXY_HOST || '127.0.0.1';

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isAllowedRemoteUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method !== 'GET' || requestUrl.pathname !== '/image') {
    sendJson(res, 404, { error: 'Not found. Use GET /image?url=...' });
    return;
  }

  const remoteUrl = requestUrl.searchParams.get('url') || '';
  if (!isAllowedRemoteUrl(remoteUrl)) {
    sendJson(res, 400, { error: 'Only http/https image URLs are allowed.' });
    return;
  }

  console.log(`[image-proxy] request ${remoteUrl}`);

  try {
    const upstream = await fetch(remoteUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'RPG-Card-Generator-Image-Proxy/1.0'
      }
    });

    if (!upstream.ok) {
      console.log(`[image-proxy] upstream failed ${upstream.status} ${remoteUrl}`);
      sendJson(res, upstream.status, { error: `Upstream request failed with ${upstream.status}.` });
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const cacheControl = upstream.headers.get('cache-control') || 'public, max-age=3600';
    console.log(`[image-proxy] ok ${contentType} ${remoteUrl}`);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*'
    });

    if (!upstream.body) {
      res.end();
      return;
    }

    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.log(`[image-proxy] fetch error ${remoteUrl} -> ${error && error.message ? error.message : String(error)}`);
    sendJson(res, 502, {
      error: 'Failed to fetch remote image.',
      detail: error && error.message ? error.message : String(error)
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Image proxy running at http://${HOST}:${PORT}/image?url=...`);
});
