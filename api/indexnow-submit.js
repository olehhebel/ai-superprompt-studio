const INDEXNOW_KEY = 'fd38bd6d227d4ff31bb4659c830ee8b0';
const HOST = 'superprompt.pro';
const URLS = [
  'https://superprompt.pro/',
  'https://superprompt.pro/vibe-coded-product-rescue',
  'https://superprompt.pro/agent-ready-design-system',
  'https://superprompt.pro/ai-agent-ux-design',
  'https://superprompt.pro/insights',
  'https://superprompt.pro/insights/why-vibe-coded-products-feel-unfinished',
  'https://superprompt.pro/insights/stop-ai-coding-agent-ui-drift',
  'https://superprompt.pro/insights/agent-ready-design-system',
  'https://superprompt.pro/insights/ai-agent-ux-approval-autonomy-recovery',
  'https://superprompt.pro/insights/ai-prototype-to-production-ready-product',
];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ ok: false }, 405);
    }

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: HOST,
          key: INDEXNOW_KEY,
          keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
          urlList: URLS,
        }),
      });

      const responseText = await response.text();
      return json({
        ok: response.ok,
        indexNowStatus: response.status,
        submitted: URLS.length,
        response: responseText || null,
      }, response.ok ? 200 : 502);
    } catch {
      return json({ ok: false }, 500);
    }
  },
};
