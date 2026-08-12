// Proxy Suno API — Smart Player Luz Pín — Estúdio Plá
// Recebe requisições do browser, repassa para o Suno com o token

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Suno-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const sunoToken = event.headers['x-suno-token'] || '';
    const action = body.action || 'generate';

    if (!sunoToken) {
      return {
        statusCode: 401,
        headers: CORS,
        body: JSON.stringify({ error: 'Token Suno não fornecido.' })
      };
    }

    const sunoHeaders = {
      'Authorization': `Bearer ${sunoToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://suno.com',
      'Referer': 'https://suno.com/',
    };

    let url, method, payload;

    if (action === 'generate') {
      url = 'https://studio-api.suno.ai/api/generate/v2/';
      method = 'POST';
      payload = JSON.stringify({
        prompt: body.prompt || '',
        tags: body.tags || '',
        title: body.title || 'Luz Pín',
        make_instrumental: false,
        wait_audio: false,
        mv: 'chirp-v3-5'
      });
    } else if (action === 'feed') {
      url = `https://studio-api.suno.ai/api/feed/?ids=${body.ids}`;
      method = 'GET';
      payload = undefined;
    } else if (action === 'billing') {
      url = 'https://studio-api.suno.ai/api/billing/info/';
      method = 'GET';
      payload = undefined;
    } else {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'Ação inválida.' })
      };
    }

    const fetchOptions = { method, headers: sunoHeaders };
    if (payload) fetchOptions.body = payload;

    const res = await fetch(url, fetchOptions);
    const text = await res.text();

    return {
      statusCode: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: text
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
