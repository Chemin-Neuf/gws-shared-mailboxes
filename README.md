# GWS Shared Mailboxes

<!--
  Original Author: Gemini 3.8 Flash (Google / GitHub Copilot)
  Major Contributors: Kimi K3 (Moonshot AI / GitHub Copilot)
  Contributors: Chemin Neuf Community with help of AI
  Last Updated: 2026-09-21
-->

A comprehensive study of pros, cons, and caveats across the 7 native Google Workspace mechanisms for sharing an email address (functional mailboxes and team inboxes), written for a Google Workspace for Nonprofits tenant. The study is organized as 10 evaluation topics, compared from both the user's and the administrator's perspective (web console and API automation). Primary audience: technical administrators (in English), with an executive decision framework and governance recommendations for IT leadership and management (in French).

## Structure

| File/Folder | Purpose |
|---|---|
| `index.html` | Portal home page: context, key figures, document index |
| `options-comparison.html` | Profiles of the 7 sharing options: user view, admin view (web + API), license cost |
| `topics.html` | Hub of the 10 evaluation topics with status badges + blocking-criteria quick reference + external-tools policy |
| `topic-*.html` | One page per evaluation dimension (read access, reply, organization, collaboration, history, identity, contacts, security, admin controls, API) |
| `decision-guide.html` | Blocking criteria, workarounds, and typical recipes per use case |
| `matrix.html` | Consolidated OK/NOK master matrix (7 options × 10 topics) |
| `synthese-manageriale.html` | Executive decision framework, governance guidelines, and security directives for department heads (in French) |
| `css/` | Shared stylesheets (`site.css`, `site-nav.css`) |
| `js/` | Client-side navigation script (`site-nav.js`) |
| `assets/` | Static media and site favicon (`favicon.svg`) |
| `.github/instructions/` | Workspace coding guidelines and standard rules |
| `LICENSE` | GNU General Public License v3 (`GPL-3.0-only`) |

## Method

The study was built incrementally: each evaluation topic was written and validated on its own
`topic-*.html` page. All 10 topics are now complete; the consolidated verdicts live in
`matrix.html`, the decision logic in `decision-guide.html`, and the French management synthesis
in `synthese-manageriale.html`.

## Prerequisites

- Any modern web browser (Chrome, Edge, Firefox, Safari) with JavaScript enabled.
- No build toolchain or web server is required; files open directly via local filesystem or static hosting.

## Quick Start

Open `index.html` in your default browser:

```powershell
Start-Process index.html
```

## License

GPL-3.0-only — see [LICENSE](LICENSE).