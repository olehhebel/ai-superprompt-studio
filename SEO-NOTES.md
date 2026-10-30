# Bilingual SEO update — 30 October 2026

The live homepage repeated Interface Report promotion through two JavaScript injections in addition to its static editorial section. The update keeps the static section and avoids the duplicate injections. It also makes the homepage and service headings explicit about the work offered.

## Search intent and page ownership

| Page | English intent | Ukrainian intent |
| --- | --- | --- |
| `/` · `/uk/` | Product designer, UX/UI, web design | Продуктовий дизайнер, UX/UI, вебдизайн |
| `/services` · `/uk/services.html` | Product design services, website design, technical SEO | Послуги продуктового дизайну, розробка структури сайту, технічні основи SEO |
| `/work` · `/uk/work.html` | Product design portfolio, UX/UI case studies | Портфоліо продуктового дизайну, UX/UI кейси |
| `/agent-ready-design-system` and Ukrainian equivalent | Design systems for teams and AI coding agents | Дизайн-системи для команд та AI-агентів |
| `/ai-agent-ux-design` and Ukrainian equivalent | AI agent UX, human control and recovery | UX AI-агентів, контроль та відновлення |

These are intent groups based on the offered services, not measured keyword volumes or ranking claims. Ship Index Grow remains a distinct educational offer and links to its own domain.

## Technical changes

- Deduplicated singleton metadata and repeated Open Graph locale alternatives.
- Aligned page-level structured data, titles, descriptions, language and canonical URLs.
- Standardized branded social previews and retained reciprocal EN/UK alternatives.
- Expanded both service pages with deliverables, workflow, website semantics and technical SEO scope.
- Fixed repeated locale-tag generation and added the SEO pass to locale rebuilding.
- Included all HTML routes in the IndexNow workflow trigger, including Ukrainian pages.

## Validation

Install BeautifulSoup4, then run:

```sh
python scripts/enhance-seo.py
python scripts/verify-seo.py
python scripts/verify-locales.py
node --check script.js
node --check polish.js
```

The existing sitemap contains 92 indexable URLs. Four additional HTML pages are excluded from it. The checks validate 96 pages and five interactive localized tools. No inquiry was submitted to the contact form during verification.

Search Console ownership, search performance, real-user Core Web Vitals and Google index coverage were not available in this task. No Google indexing or ranking result is implied by deploying these changes.
