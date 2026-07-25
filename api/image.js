function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isAllowedRemoteUrl(value) {
  try {
    var parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed. Use GET /api/image?url=...' });
    return;
  }

  var requestUrl = new URL(req.url || '', 'https://' + (req.headers.host || 'localhost'));
  var remoteUrl = (req.query && req.query.url) || requestUrl.searchParams.get('url') || '';
  if (Array.isArray(remoteUrl)) remoteUrl = remoteUrl[0] || '';

  if (!isAllowedRemoteUrl(remoteUrl)) {
    sendJson(res, 400, { error: 'Only http/https image URLs are allowed.' });
    return;
  }

  try {
    var upstream = await fetch(remoteUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'RPG-Card-Generator-Image-Proxy/1.0'
      }
    });

    if (!upstream.ok) {
      sendJson(res, upstream.status, { error: 'Upstream request failed with ' + upstream.status + '.' });
      return;
    }

    var contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    if (contentType.toLowerCase().indexOf('image/') !== 0) {
      sendJson(res, 415, { error: 'Remote URL did not return an image.' });
      return;
    }

    var cacheControl = upstream.headers.get('cache-control') || 'public, max-age=3600, s-maxage=86400';
    var buffer = Buffer.from(await upstream.arrayBuffer());

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(buffer);
  } catch (error) {
    sendJson(res, 502, {
      error: 'Failed to fetch remote image.',
      detail: error && error.message ? error.message : String(error)
    });
  }
};
