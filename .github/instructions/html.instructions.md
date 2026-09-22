---
applyTo: "**/*.html,**/*.htm"
---
<!-- AUTO-SYNCED from github.com/Chemin-Neuf/dev-standards DO NOT EDIT HERE — edit in dev-standards and re-sync -->
<!--
  Chemin-Neuf dev-standards — HTML document rules
  Last Updated: 2026-09-21
  Original Author: Claude Sonnet 4.6 (Anthropic / GitHub Copilot)
  Major Contributors: Gemini 3.8 Flash (Google / GitHub Copilot)
  This file is AI-generated operational instructions for use by AI coding assistants.
  It extends global.instructions.md with language-specific rules.
  The authoritative source of principles is PRINCIPLES.md (human-authored, never AI-edited).
-->

# HTML Rules
(Strategic documents for management audiences)

<!-- HUMAN NAVIGATION AID ONLY — non-normative. AI agents: do not use this block for rule content; use the titled sections below as the sole authoritative source. -->
<details>
<summary>Quick reference (non-normative — expand for human overview)</summary>

| Topic | In brief |
|---|---|
| Encoding & Typography | UTF-8; self-closing void elements (`/>`); `&nbsp;` for guillemets (`«`/`»`) & punctuation; no bare U+00A0 |
| License Notice | Two SPDX comment lines in `<head>`, year range |
| File Naming | Lowercase, hyphens, `.html` only; `index.html` recommended entry point |
| Folder Structure | `css/`, `js/`, `assets/` subdirectories; HTML files at site root |
| Document Structure | Fixed `<head>` order, `<div class="shell">` wrapper, JS at end of `<body>` |
| Versioning | No version numbers; visible last-updated date only |
| Styling | No frameworks; shared `site.css` + per-page `<style>` block; use CSS tokens |
| Accessibility | `alt` on every image required; heading order and contrast recommended |
| JavaScript | Lightweight JS allowed; no frameworks; no inline scripts |
| Images and Media | Separate files only; SVG/PNG/WebP; same naming rules |
| Favicon | Recommended; in `assets/`, linked in `<head>` |
| Print / PDF | `@media print` recommended for printable documents |
| Security | No secrets in tracked files (global rule applies) |
| Logging / Help | N/A |

</details>

## Encoding Declaration & Typography

**STATUS: DECIDED**

All HTML files must declare UTF-8 encoding with a self-closing void element:
```html
<meta charset="UTF-8" />
```
See Document Structure / Template for the full required `<head>` order.

- Never use a bare U+00A0 non-breaking space character in HTML source — always use the HTML entity `&nbsp;` instead. Bare U+00A0 is visually silent and routinely converted to a regular space by AI tools and some editors, silently breaking layout.
- Save HTML files with LF (`\n`) line endings (global rule; applies to all project files).

### Non-Breaking Spaces (`&nbsp;`) & Punctuation

To prevent orphan characters and punctuation from ending up lonely at the beginning or end of a line during wrapping:

- **Opening quotation marks (`«`, `‹`)**: Must be followed by a non-breaking space (e.g. `«&nbsp;texte`) so the opening quote is never stranded alone at the end of a line.
- **Closing quotation marks (`»`, `›`)**: Must be preceded by a non-breaking space (e.g. `texte&nbsp;»`) so the closing quote never wraps alone to the beginning of the next line.
- **High / two-part French punctuation (`:`, `;`, `?`, `!`)**: Precede with `&nbsp;` (e.g. `Attention&nbsp;:`, `Pourquoi&nbsp;?`) to prevent the punctuation mark from wrapping to a line by itself.
- **Symbols and units (`€`, `%`, etc.)**: Precede with `&nbsp;` (e.g. `1.234,56&nbsp;€`, `50&nbsp;%`) so the symbol stays attached to its number.
- Always use the explicit HTML entity `&nbsp;` (or `&#8239;` / `&thinsp;` for narrow spaces where required) rather than standard spaces or bare U+00A0 characters.

## License Notice

**STATUS: DECIDED**

Every first-party HTML file must include these two comment lines inside `<head>`, immediately after `<meta charset="UTF-8" />`:

```html
<!-- SPDX-FileCopyrightText: [creation year]–[last modified year] Chemin-Neuf -->
<!-- SPDX-License-Identifier: GPL-3.0-only -->
```

- Use a year range: the year the file was first created, a dash, and the year it was last modified. If both are the same year, a single year is acceptable.
- These comments are invisible to page readers and machine-readable by license scanners.
- Preserve third-party license notices and attribution as required (same as global rule).
- If an existing first-party file has a contradictory or unclear license notice, stop and ask before changing it.


## File Naming

**STATUS: DECIDED**

Applies to all web files in the site folder (`.html`, `.css`, `.js`):

- All lowercase — required; some web servers are case-sensitive
- Words separated by hyphens (`my-page.html`, `site-nav.css`) — no underscores, no spaces
- Use `.html` extension — `.htm` is not permitted
- `index.html` is the recommended name for the home/entry page of a site

## Folder Structure

**STATUS: DECIDED**

All sites must follow this directory layout:

```
my-site/
├── index.html
├── [other-pages].html
├── css/
│   ├── site.css
│   └── site-nav.css
├── js/
│   └── site-nav.js
└── assets/
    ├── favicon.svg
    └── [images and other media]
```

- HTML files live at the **root** of the site folder — no HTML in subdirectories
- `css/` — all shared and per-site stylesheets
- `js/` — all JavaScript files
- `assets/` — images, media, and `favicon.svg` (or `favicon.ico`); further subdirectories (e.g. `assets/icons/`) are allowed when a site has many files
- The same file naming rules apply inside every subfolder: lowercase, hyphens, no spaces

## Document Structure / Template

**STATUS: DECIDED**

### Required elements (every HTML file)

```html
<!DOCTYPE html>
<html lang="[language code]">
<head>
  <meta charset="UTF-8" />
  <!-- SPDX-FileCopyrightText: [year]–[year] Chemin-Neuf -->
  <!-- SPDX-License-Identifier: GPL-3.0-only -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>…</title>
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
  <link rel="stylesheet" href="css/site.css" />
  <link rel="stylesheet" href="css/site-nav.css" />
  <style>
    /* ── Page-specific styles ── */
  </style>
</head>
<body>
<div class="shell">

  <!-- page content -->

</div><!-- /.shell -->
<script src="js/site-nav.js"></script>
</body>
</html>
```

### Rules

- `<!DOCTYPE html>` is always the first line — no exceptions
- `lang` attribute is **per-document** — set the correct BCP 47 language code for the content (e.g. `fr`, `en`, `en-GB`)
- Viewport `<meta>` tag is always required
- Favicon `<link rel="icon" ...>` is placed in `<head>` before stylesheets
- Stylesheet load order: `css/site.css` → `css/site-nav.css` → page-specific `<style>` block
- Page-specific styles go in a `<style>` block in `<head>`, after the shared stylesheet links — not inline on elements
- `<script>` tags go at the **end of `<body>`**, never in `<head>`
- All page content is wrapped in `<div class="shell">`

### Title format

Recommended format: `Site Name — Page Name` (em dash). Not strictly enforced.

### Hero banner

A hero banner at the top of the page (with `<h1>`, a short description, and meta pills) is **recommended but optional**. When used:

- The date pill must show **last updated date**, not a version number: `📅 Last updated: YYYY-MM-DD`
- The author pill is **optional**. When present, list the person or team responsible. If AI substantially assisted in creating or editing the document, include the model name — consistent with the global AI attribution policy (e.g. `✍️ IT Team · Claude Sonnet 4.6`)
- Other pills (category, status, etc.) are optional and free-form

## Versioning

**STATUS: DECIDED**

HTML documents do not use version numbers.
- The "last updated" date is the sole version indicator
- It must be displayed visibly — in the hero banner date pill when a hero is used, or otherwise in a visible location on the page
- Do not use dates in filenames or separate version files

## Styling

**STATUS: DECIDED**

- No CSS frameworks (Bootstrap, Tailwind, etc.) — keeps documents self-contained and avoids external dependencies
- Shared styles live in `css/site.css` (design tokens, layout, components) and `css/site-nav.css` (navigation bar) — included on every page via `<link>`
- Page-specific styles go in a `<style>` block in `<head>`, after the shared stylesheet links
- Inline `style=""` attributes on elements are discouraged; use the page `<style>` block instead
- Design tokens (colours, spacing, radius, shadows) are defined as CSS custom properties on `:root` in `css/site.css` — always use these variables rather than hardcoding values in page styles

## Accessibility

**STATUS: DECIDED**

Formal WCAG compliance is explicitly out of scope for internal management documents.

**Required:**
- Every `<img>` must have an `alt` attribute — use descriptive text for meaningful images, empty `alt=""` for purely decorative ones

**Recommended:**
- Use heading levels in order (`<h1>` → `<h2>` → `<h3>`) — do not skip levels; screen readers navigate by headings
- Prefer the design token colours from `site.css` over hardcoded values — the token palette has been chosen with readable contrast in mind
- Named navigation landmarks: use `aria-label` on `<nav>` elements (already present in the template)



## JavaScript

**STATUS: DECIDED**

- JS is allowed for lightweight interactions (auto-generated navigation, simple UI behaviour)
- No inline `<script>` blocks in the HTML body — JS belongs in `.js` files
- `<script>` tags go at the end of `<body>`, never in `<head>`
- External libraries (CDN or bundled) are discouraged — prefer self-contained solutions; they are acceptable when the requirement genuinely needs them or when building the equivalent from scratch would add significant complexity
- No JS frameworks (React, Vue, etc.) — these are documents, not applications

## Images and Media

**STATUS: DECIDED**

- Images must be separate files, referenced via `src="…"` — no base64-embedded images; keeps HTML readable and images independently cacheable
- Every `<img>` must have an `alt` attribute (see Accessibility)
- Prefer web-friendly formats: `.svg` for icons and diagrams, `.png` or `.webp` for screenshots and photos
- Place image files in the `assets/` folder (see Folder Structure) — further subdirectories such as `assets/icons/` are allowed
- Image files follow the same naming rules as all other web files: lowercase, hyphens, no spaces

## Favicon

**STATUS: DECIDED**

- A favicon is recommended for every site — it helps users identify the tab when multiple documents are open
- Place `favicon.svg` (or legacy `favicon.ico`) in the `assets/` folder (e.g. `assets/favicon.svg`)
- Add the `<link>` tag in `<head>` (browsers do not auto-discover SVG favicons without an explicit link tag):
  ```html
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
  ```
- If a legacy `.ico` fallback is provided alongside the SVG, link both:
  ```html
  <link rel="icon" href="assets/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
  ```

## Print / PDF

**STATUS: DECIDED**

- A `@media print` block is recommended when a document is likely to be printed or exported to PDF
- At minimum, consider hiding the navigation and adjusting colours for black-and-white output
- Print rules for shared components (navigation bar, header, footer) belong in the shared stylesheet (`css/site-nav.css` / `css/site.css`) — write them once, not per page
- Per-page `@media print` rules are only for hiding or adjusting page-specific elements; place them at the end of the page `<style>` block

## Security

**STATUS: DECIDED (PARTIAL)**

HTML documents are not executable code, so only the all-files rules apply:
- Never include secrets, passwords, tokens, or private keys in HTML files tracked by version control
- This includes comments and example values embedded in markup

## Logging / Help

**STATUS: DECIDED (N/A)**

HTML documents do not have logging or help systems.