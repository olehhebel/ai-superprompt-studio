const SOURCES = {
  cochelux: {
    url: 'https://images-platform.99static.com/CFJKFxSunwcI3H-S0aaSEPEEAsM%3D/0x0%3A1509x1509/500x500/top/smart/99designs-contests-attachments/128/128567/attachment_128567111',
    referer: 'https://99designs.com/'
  },
  ciucas: {
    url: 'https://images-platform.99static.com/eSMZUFJ47mbG4p3xYlB_l6TH6iM%3D/0x1374%3A1440x2814/500x500/top/smart/99designs-contests-attachments/138/138862/attachment_138862605',
    referer: 'https://99designs.com/'
  }
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const source = SOURCES[id];

    if (!source) {
      return new Response('Not found', { status: 404 });
    }

    const upstream = await fetch(source.url, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: source.referer
      },
      redirect: 'follow'
    });

    if (!upstream.ok) {
      return new Response('Image unavailable', { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return new Response('Invalid image response', { status: 502 });
    }

    return new Response(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch {
    return new Response('Image unavailable', { status: 502 });
  }
}
