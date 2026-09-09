from pathlib import Path

items = {
    'insights/why-vibe-coded-products-feel-unfinished.html': ('why-vibe-coded-products-feel-unfinished.webp', 'Conceptual visualization of prototype debt in a vibe-coded product interface'),
    'insights/stop-ai-coding-agent-ui-drift.html': ('stop-ai-coding-agent-ui-drift.webp', 'Conceptual visualization of AI coding agent UI drift and system alignment'),
    'insights/agent-ready-design-system.html': ('agent-ready-design-system.webp', 'Conceptual architecture of an agent-ready design system for AI coding agents'),
    'insights/ai-agent-ux-approval-autonomy-recovery.html': ('ai-agent-ux-approval-autonomy-recovery.webp', 'Conceptual AI agent UX flow showing autonomy approval undo and recovery'),
    'insights/ai-prototype-to-production-ready-product.html': ('ai-prototype-to-production-ready-product.webp', 'Conceptual transformation from an AI prototype to a production-ready product'),
}

for file, (img, alt) in items.items():
    p = Path(file)
    s = p.read_text()
    url = f'https://superprompt.pro/assets/insights/{img}'
    s = s.replace('https://superprompt.pro/og-image.jpg', url)
    s = s.replace('<meta property="article:modified_time" content="2026-09-04" />', '<meta property="article:modified_time" content="2026-09-09" />')
    s = s.replace('"dateModified":"2026-09-04",', '"dateModified":"2026-09-09",')
    if '"image":' not in s:
        s = s.replace('"datePublished":"2026-09-04",', f'"image":{{"@type":"ImageObject","url":"{url}","width":1672,"height":941}},\n    "datePublished":"2026-09-04",', 1)
    media = f'    <figure class="article-hero-media"><img src="/assets/insights/{img}" width="1672" height="941" alt="{alt}" loading="eager" fetchpriority="high" decoding="async"></figure>'
    marker = '</section>\n\n    <article class="article-main"'
    if 'article-hero-media' not in s:
        s = s.replace(marker, f'</section>\n{media}\n\n    <article class="article-main"', 1)
    p.write_text(s)

css = Path('insight-page.css')
s = css.read_text()
if '.article-hero-media{' not in s:
    s += '\n.article-hero-media{width:min(calc(100% - (2 * var(--page))),var(--max));margin:0 auto clamp(64px,8vw,110px);overflow:hidden;border-radius:var(--radius);background:#08111f}\n.article-hero-media img{display:block;width:100%;height:auto;aspect-ratio:1672/941;object-fit:cover}\n@media(max-width:560px){.article-hero-media{width:calc(100% - (2 * var(--page)));margin-bottom:56px;border-radius:12px}}\n'
    css.write_text(s)

Path('.github/workflows/patch-insight-images.yml').unlink(missing_ok=True)
Path('scripts/patch_insight_images.py').unlink(missing_ok=True)
