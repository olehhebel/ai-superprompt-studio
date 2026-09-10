const PAGES = {
  cochelux: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034',
  ciucas: 'https://99designs.com/logo-brand-guide/contests/logo-ciuca%C8%99-rescue-race-1193171'
};

const FALLBACK_SOURCES = {
  cochelux: 'https://images-platform.99static.com/CFJKFxSunwcI3H-S0aaSEPEEAsM%3D/0x0%3A1509x1509/500x500/top/smart/99designs-contests-attachments/128/128567/attachment_128567111',
  ciucas: 'https://images-platform.99static.com/eSMZUFJ47mbG4p3xYlB_l6TH6iM%3D/0x1374%3A1440x2814/500x500/top/smart/99designs-contests-attachments/138/138862/attachment_138862605'
};

const decodeHtml = value => value
  .replace(/&amp;/g, '&')
  .replace(/\\u0026/g, '&')
  .replace(/\\u003d/gi, '=')
  .replace(/\\u002f/gi, '/');

async function discoverSource(id) {
  const pageUrl = PAGES[id];
  if (!pageUrl) return null;

  try {
    const page = await fetch(pageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html,*/*' },
      redirect: 'follow'
    });
    if (!page.ok) return null;
    const html = await page.text();
    const urls = [...html.matchAll(/https:\\/\\/images-platform\\.99static\\.com\\/[^\"'<>\\s]+/g)]
      .map(match => decodeHtml(match[0]));

    if (!urls.length) return null;

    const authorIndex = html.toLowerCase().indexOf('olehhebel');
    if (authorIndex >= 0) {
      const windowStart = Math.max(0, authorIndex - 12000);
      const windowEnd = Math.min(html.length, authorIndex + 12000);
      const windowHtml = html.slice(windowStart, windowEnd);
      const nearby = [...windowHtml.matchAll(/https:\\/\\/images-platform\\.99static\\.com\\/[^\"'<>\\s]+/g)]
        .map(match => decodeHtml(match[0]));
      if (nearby.length) return nearby[Math.floor(nearby.length / 2)];
    }

    return urls[0];
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const id = requestUrl.searchParams.get('id');
    if (!PAGES[id]) return new Response('Not found', { status: 404 });

    let sourceUrl = await discoverSource(id);
    if (!sourceUrl) sourceUrl = FALLBACK_SOURCES[id];

    const upstream = await fetch(sourceUrl, {
      headers: {
        Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
        Referer: PAGES[id],
        'User-Agent': 'Mozilla/5.0'
      },
      redirect: 'follow'
    });

    if (!upstream.ok) {
      console.warn('concept-logo upstream', id, upstream.status, sourceUrl);
      return new Response('Image unavailable', { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) return new Response('Invalid image response', { status: 502 });

    return new Response(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.warn('concept-logo error', error?.message || 'unknown');
    return new Response('Image unavailable', { status: 502 });
  }
}
