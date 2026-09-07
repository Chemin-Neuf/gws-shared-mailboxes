---
applyTo: "**/*.html,**/*.htm"
---
<!-- AUTO-SYNCED from github.com/Chemin-Neuf/dev-standards DO NOT EDIT HERE — edit in dev-standards and re-sync -->
<!--
  Chemin-Neuf dev-standards — HTML document rules
  Last Updated: 2026-05-03
  Original Author: Claude Sonnet 4.6 (Anthropic / GitHub Copilot)
  This file is AI-generated operational instructions for use by AI coding assistants.
  It extends global.instructions.md with language-specific rules.
  The authoritative source of principles is PRINCIPLES.md (human-authored, never AI-edited).
-->

# HTML Rules
(Strategic documents for management audiences)

## Encoding Declaration

**STATUS: DECIDED**

All HTML files must declare UTF-8 encoding:
```html
<meta charset="UTF-8">
```

## License Notice

**STATUS: TBD**

Global policy already applies:
- New first-party HTML files must carry a GPL-3.0-only license notice
- Preserve third-party license notices and attribution
- If an existing first-party file has a contradictory or unclear license notice, ask before changing it

Exact wording and placement for HTML files are not decided yet.


## File Naming

**STATUS: TBD**

## Document Structure / Template

**STATUS: TBD**

## Document Versioning

**STATUS: TBD**

Candidates: date in filename, meta tag, separate version file.

## Styling

**STATUS: TBD**

Inline CSS, external stylesheet, or framework — not yet decided.

## Accessibility

**STATUS: TBD**

Minimum requirements not yet decided.

## Versioning

**STATUS: DECIDED**

HTML documents do not use version numbers.
Instead, they must display a visible "last updated" date.

## Security

**STATUS: DECIDED (PARTIAL)**

HTML documents are not executable code, so only the all-files rules apply:
- Never include secrets, passwords, tokens, or private keys in HTML files tracked by version control
- This includes comments and example values embedded in markup

## Logging / Help

**STATUS: DECIDED (N/A)**

HTML documents do not have logging or help systems.