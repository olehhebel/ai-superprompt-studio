# Ecosystem Coordinator

## Entry points
- Registry: [.github/ecosystem/projects.json](projects.json)
- Audit: [.github/ecosystem/audit.py](audit.py)
- Workflow: [Ecosystem Coordinator](../../actions/workflows/ecosystem-coordinator.yml)
- Shared coding instructions: [AGENTS.md](../../AGENTS.md)

## Installed 2026-10-30
All three repositories have AGENTS.md pointing to the shared registry.
The coordinator loads the three public repositories using read-only permissions.
Daily schedule: 06:20 UTC (08:20 Kyiv in winter; 09:20 Kyiv in summer).
It also runs when coordinator files change and supports manual Run workflow.
GitHub scheduling can be delayed. Public repository schedules may be disabled by GitHub after inactivity.
No external model or paid service has been connected.

## Reports
Open the portfolio repository Actions tab and select Ecosystem Coordinator.
Each completed run has a summary plus an ecosystem-report artifact (JSON and Markdown).
Findings are review candidates, not proof of broken behavior.
An HTTP 200 is not a successful form-delivery test.
Live checks cover the homepage, robots and sitemap; source checks cover all checked-out HTML.
The audit does not crawl every live page, verify indexing, test JavaScript, send forms, edit code or deploy repairs.
The audit's parser, sitemap processing, report generation and timeout handling were checked locally.
The first hosted execution must be inspected in Actions before calling the deployment verified.

## Knowledge intake
GitHub has no automatic access to ChatGPT chat history, Personal Context, Drive or Library.
The initial registry contains a sanitized set of project decisions retrieved in this setup session.
Do not assume it contains every historical conversation.
To add a decision, record:
- Date and source (conversation title/date or project document).
- Project scope.
- Exact requirement.
- Whether this is a confirmed user instruction or an unverified report.
- What it supersedes.
Review imports before publishing; do not include raw private conversation exports.
Current user decisions override older historical assistant statements.
Preserve a dated decision history instead of silently replacing conflicting requirements.

## Next capability: autonomous coding
A generative coding runtime is not configured. AGENTS.md alone is not an executing AI agent.
Do not claim autonomous site improvements until a runtime is selected, authenticated and successfully tested.
The built-in GITHUB_TOKEN cannot write to sibling repositories.
Cross-repository repairs need a narrowly scoped GitHub App or equivalent explicit credentials.
Never put a token in project files or chat exports.
Do not connect a billed model API under the existing no-paid-services instruction.
Keep audit permissions read-only; a future repair workflow should use a separate identity and validated changes.
