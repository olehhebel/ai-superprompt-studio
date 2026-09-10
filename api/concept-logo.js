const SOURCES = {
  cochelux: 'https://images-platform.99static.com/CFJKFxSunwcI3H-S0aaSEPEEAsM%3D/0x0%3A1509x1509/500x500/top/smart/99designs-contests-attachments/128/128567/attachment_128567111',
  ciucas: 'https://images-platform.99static.com/eSMZUFJ47mbG4p3xYlB_l6TH6iM%3D/0x1374%3A1440x2814/500x500/top/smart/99designs-contests-attachments/138/138862/attachment_138862605'
};

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const id = requestUrl.searchParams.get('id');
    const sourceUrl = SOURCES[id];

    if (!sourceUrl) return new Response('Not found', { status: 404 });

    const cachedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(sourceUrl)}&w=500&h=500&fit=contain&output=webp`;
    const upstream = await fetch(cachedUrl, {
      headers: { Accept: 'image/webp,image/*,*/*;q=0.8' },
      redirect: 'follow'
    });

    if (!upstream.ok) {
      console.warn('concept-logo upstream', id, upstream.status);
      return new Response('Image unavailable', { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/webp';
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
