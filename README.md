# Oleh Hebel & Co — Product Quality Infrastructure for the AI Era

**AI made building fast. We make what gets built product-ready.**

This repository powers [olehhebel.top](https://olehhebel.top/), a service-first portfolio and public resource hub for AI-native startups, SaaS teams and founders whose products are moving faster than their UX, systems, trust model or product context can keep up.

## Core services

- [Prototype → Product Rescue](https://olehhebel.top/vibe-coded-product-rescue)
- [Agent-Ready Design System](https://olehhebel.top/agent-ready-design-system)
- [Human–AI UX](https://olehhebel.top/ai-agent-ux-design)
- [Design Debt Cleanup](https://olehhebel.top/design-debt-cleanup)
- [Context Architecture](https://olehhebel.top/context-architecture)

## Free tools

- [AI Product Readiness Scorecard](https://olehhebel.top/ai-product-readiness-scorecard)
- [AI Agent Autonomy Matrix](https://olehhebel.top/tools/ai-agent-autonomy-matrix)
- [Design Debt Calculator](https://olehhebel.top/tools/design-debt-calculator)
- [Design System Drift Checklist](https://olehhebel.top/tools/design-system-drift-checklist)
- [AI UX Trust Checklist](https://olehhebel.top/tools/ai-ux-trust-checklist)

## Field notes

- [Why vibe-coded products feel unfinished even when they work](https://olehhebel.top/insights/why-vibe-coded-products-feel-unfinished)
- [How to stop AI coding agents from creating UI drift](https://olehhebel.top/insights/stop-ai-coding-agent-ui-drift)
- [What an agent-ready design system actually needs](https://olehhebel.top/insights/agent-ready-design-system)
- [AI agent UX: approval, autonomy, undo and recovery](https://olehhebel.top/insights/ai-agent-ux-approval-autonomy-recovery)
- [From AI prototype to production-ready product](https://olehhebel.top/insights/ai-prototype-to-production-ready-product)
- [Design debt in AI-built products](https://olehhebel.top/insights/design-debt-ai-built-products)
- [Context architecture for AI products](https://olehhebel.top/insights/context-architecture-ai-products)
- [Missing states in AI products](https://olehhebel.top/insights/missing-states-ai-products)

## Research

The [AI Product Readiness Benchmark methodology](https://olehhebel.top/research/ai-product-readiness-benchmark) is public. No synthetic benchmark statistics are published; aggregate results will only be released after a sufficient independently reviewed sample exists.

## Author

[Oleh Hebel](https://olehhebel.top/oleh-hebel) · [LinkedIn](https://www.linkedin.com/in/olehhebel/) · [Hashnode](https://olehhebel.hashnode.dev/)

## Bilingual site and service offer

English lives at `/`; Ukrainian lives at `/uk/`. The compact EN / УКР control preserves the page identity. Ukrainian services and editorial pages are adapted Ukrainian editions; the editorial pages link to their full English originals. Galleries and interactive tools retain their functionality.

The homepage offer connects product design, brand identity and web delivery with the original headline **Make the next click a clear yes.** Homepage contact buttons open the original Project Brief dialog (email, project description and reference links). It uses the existing Web3Forms configuration from `partials/brief-inner.html`, which works from a static GitHub Pages site. Confirmation is shown only after the service reports success. Email links remain available elsewhere as a fallback.

Source material: `i18n/uk.txt` for preserved-layout strings and tool results; `i18n/pages-uk.json` for authored Ukrainian service/editorial pages. After editing English HTML or locale content, run:

```sh
python -m pip install beautifulsoup4
python scripts/build-locales.py
python scripts/verify-locales.py
```

The build emits static HTML, reciprocal hreflang links, localized canonical/OG metadata and a sitemap for indexable pages. No runtime translation service is required.

Research informed the offer structure, not copied wording: [Chermayeff & Geismar & Haviv](https://cghnyc.com/about), [COLLINS](https://wearecollins.com/programs/), [Instrument](https://www.instrument.com/services/), [Pentagram](https://www.pentagram.com/about), [Hey](https://heystudio.es/). The positioning emphasizes a clear benefit, specific disciplines, real project evidence and direct designer involvement. No competitor clients, awards or outcomes are presented as Oleh's.
