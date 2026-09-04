const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = 'superprompt.pro';
const KEY = 'fd38bd6d227d4ff31bb4659c830ee8b0';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/vibe-coded-product-rescue`,
  `https://${HOST}/agent-ready-design-system`,
  `https://${HOST}/ai-agent-ux-design`,
  `https://${HOST}/insights`,
  `https://${HOST}/insights/why-vibe-coded-products-feel-unfinished`,
  `https://${HOST}/insights/stop-ai-coding-agent-ui-drift`,
  `https://${HOST}/insights/agent-ready-design-system`,
  `https://${HOST}/insights/ai-agent-ux-approval-autonomy-recovery`,
  `https://${HOST}/insights/ai-prototype-to-production-ready-product`,
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
    if (request.method !== 'GET') {
      return json({ ok: false, error: 'method_not_allowed' }, 405);
    }

    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          host: HOST,
          key: KEY,
          keyLocation: KEY_LOCATION,
          urlList: URLS,
        }),
      });

      const responseText = await response.text();
      return json(
        {
          ok: response.status === 200 || response.status === 202,
          upstream_status: response.status,
          submitted: URLS.length,
          response: responseText || null,
        },
        response.status === 200 || response.status === 202 ? 200 : 502,
      );
    } catch {
      return json({ ok: false, error: 'indexnow_submission_failed' }, 502);
    }
  },
};
