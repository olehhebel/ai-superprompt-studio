const SOURCES = {
  tivona: { direct: 'https://cdn.dribbble.com/userupload/36706773/file/original-7798c7e0007efd547ede4241eeadac10.jpg?format=webp&resize=800x600&vertical=center' },
  terra: { direct: 'https://cdn.freelance.ru/download/3857263/pic2816090.jpg' },
  atomline: { direct: 'https://freelance.boutique/contest/file/406625/1' },
  arion: { direct: 'https://freelance.boutique/contest/file/85820/1' },
  ciucas: { direct: 'https://images-platform.99static.com/eSMZUFJ47mbG4p3xYlB_l6TH6iM%3D/0x1374%3A1440x2814/500x500/top/smart/99designs-contests-attachments/138/138862/attachment_138862605' },
  cochelux: { direct: 'https://images-platform.99static.com/CFJKFxSunwcI3H-S0aaSEPEEAsM%3D/0x0%3A1509x1509/500x500/top/smart/99designs-contests-attachments/128/128567/attachment_128567111' },
  lushnikova: { page: 'https://dribbble.com/shots/17859837-Lushnikova-logo', type: 'og' },
  familymedicine: { page: 'https://99designs.com/brand-identity-pack/contests/logo-f%C3%BCr-unsere-haus-und-kinderarztpraxen-das-nachhaltige-1100719', type: 'near-author' },
  braunbar: { page: 'https://99designs.com/logo-design/contests/logo-gestaltung-f%C3%BCr-outdoor-campingmarke-braunb%C3%A4r-1200708', type: 'near-author' }
};

const decode = value => value
  .replaceAll('&amp;', '&')
  .replaceAll('\\u0026', '&')
  .replaceAll('\\u003d', '=')
  .replaceAll('\\u002f', '/');

async function resolveSource(item) {
  if (item.direct) return item.direct;
  const response = await fetch(item.page, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html,*/*' }, redirect: 'follow' });
  if (!response.ok) throw new Error(`page_${response.status}`);
  const html = await response.text();
  if (item.type === 'og') {
    const metaA = new RegExp('<meta[^>]+property=["\\\']og:image["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']', 'i');
    const metaB = new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+property=["\\\']og:image["\\\']', 'i');
    const match = html.match(metaA) || html.match(metaB);
    if (!match) throw new Error('og_not_found');
    return decode(match[1]);
  }
  const lower = html.toLowerCase();
  const idx = lower.indexOf('olehhebel');
  if (idx < 0) throw new Error('author_not_found');
  const sample = html.slice(Math.max(0, idx - 18000), Math.min(html.length, idx + 18000));
  const pattern = new RegExp('https:\\\\/\\\\/images-platform\\\\.99static\\\\.com\\\\/[^"\\\'<>\\\\s]+', 'g');
  const urls = [...sample.matchAll(pattern)].map(m => decode(m[0]));
  if (!urls.length) throw new Error('image_not_found');
  return urls[Math.floor(urls.length / 2)];
}

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      const item = SOURCES[id];
      if (!item) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404, headers: { 'content-type': 'application/json' } });
      const source = await resolveSource(item);
      const response = await fetch(source, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/avif,image/webp,image/*,*/*;q=0.8', Referer: item.page || 'https://superprompt.pro/' }, redirect: 'follow' });
      if (!response.ok) throw new Error(`image_${response.status}`);
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const bytes = Buffer.from(await response.arrayBuffer());
      if (url.searchParams.get('raw') === '1') {
        return new Response(bytes, { status: 200, headers: { 'content-type': contentType, 'cache-control': 'no-store', 'x-original-source': source } });
      }
      const b64 = bytes.toString('base64');
      const offset = Math.max(0, Number(url.searchParams.get('offset') || 0));
      const size = Math.min(24000, Math.max(1000, Number(url.searchParams.get('size') || 20000)));
      return new Response(JSON.stringify({ ok: true, id, source, contentType, bytes: bytes.length, base64Length: b64.length, offset, chunk: b64.slice(offset, offset + size), done: offset + size >= b64.length }), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: String(error?.message || error) }), { status: 500, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
    }
  }
};
