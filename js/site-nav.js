/*
 * SPDX-FileCopyrightText: 2026 Chemin-Neuf
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * Original Author: Gemini 3.8 Flash (Google / GitHub Copilot)
 */

/* ============================================================
   site-nav.js — shared top navigation bar

   HOW TO CONFIGURE
   ─────────────────
   1. Set SITE_BRAND to your project/site name.
   2. Add one entry per page to the PAGES array.
   3. Make sure every HTML file includes:
        In <head>: <link rel="stylesheet" href="css/site-nav.css" />
        At end of <body>: <script src="js/site-nav.js"></script>
   That is all — the nav bar updates on every page automatically.
   ============================================================ */

(function () {

  /* ── Site brand ────────────────────────────────────────────
     Displayed as the leftmost item in the nav bar.
     Link always points to index.html.
  ────────────────────────────────────────────────────────── */
  var SITE_BRAND = 'GWS Shared Mailboxes';

  /* ── Page registry ─────────────────────────────────────────
     title : short label shown in the nav bar
     file  : filename (relative, same folder)
  ────────────────────────────────────────────────────────── */
  const PAGES = [
    { file: 'index.html',                 title: 'Home' },
    { file: 'options-comparison.html',    title: 'Options Comparison' },
    { file: 'synthese-manageriale.html',  title: 'Synthèse managériale' },
  ];

  /* ── Detect current page ───────────────────────────────── */
  const currentFile = (function () {
    const parts = window.location.pathname.replace(/\\/g, '/').split('/');
    const name = parts[parts.length - 1];
    return name || 'index.html';
  })();

  /* ── Build nav HTML ────────────────────────────────────── */
  function buildNav() {
    const nav = document.createElement('nav');
    nav.className = 'site-topnav';
    nav.setAttribute('aria-label', 'Site navigation');

    // Brand / home link
    const brand = document.createElement('a');
    brand.className = 'site-brand';
    brand.href = 'index.html';
    brand.textContent = SITE_BRAND;
    nav.appendChild(brand);

    // Page links
    const linksWrapper = document.createElement('div');
    linksWrapper.className = 'nav-links';

    PAGES.forEach(function (page) {
      const a = document.createElement('a');
      a.href = page.file;
      a.textContent = page.title;
      a.className = 'nav-link' + (page.file === currentFile ? ' active' : '');
      if (page.file === currentFile) {
        a.setAttribute('aria-current', 'page');
      }
      linksWrapper.appendChild(a);
    });

    nav.appendChild(linksWrapper);

    // Right-side print action (available on every page)
    const actions = document.createElement('div');
    actions.className = 'nav-actions';
    const printBtn = document.createElement('button');
    printBtn.className = 'nav-print';
    printBtn.type = 'button';
    printBtn.textContent = 'Print / PDF';
    printBtn.addEventListener('click', function () { window.print(); });
    actions.appendChild(printBtn);
    nav.appendChild(actions);

    return nav;
  }

  /* ── Clean up redundant cross-page link buttons from hero ──
     Removes <a> links inside .hero .actions so they are not
     duplicated with the top nav. <button> elements are kept.
  ────────────────────────────────────────────────────────── */
  function cleanHeroActions() {
    var heroActions = document.querySelector('.hero .actions');
    if (!heroActions) return;

    var links = heroActions.querySelectorAll('a');
    links.forEach(function (a) { a.remove(); });

    if (heroActions.children.length === 0) {
      heroActions.remove();
    }
  }

  /* ── Auto in-page section nav ──────────────────────────────
     Any element with data-page-nav="auto" gets links to all
     sections (or elements matching data-page-nav-selectors)
     auto-generated inside it.

     Attributes:
       data-page-nav="auto"              — enables auto-nav
       data-page-nav-root="<selector>"   — scoped search root (optional)
       data-page-nav-selectors="<sel>"   — heading selector (default: section[id] > h2)
       data-page-nav-target              — where to insert links (default: self)
  ────────────────────────────────────────────────────────── */
  function buildAutoPageNavs() {
    var navs = document.querySelectorAll('[data-page-nav="auto"]');
    if (!navs.length) return;

    navs.forEach(function (nav) {
      var rootSelector = nav.getAttribute('data-page-nav-root');
      var root = rootSelector ? document.querySelector(rootSelector) : document;
      if (!root) return;

      var selectors = nav.getAttribute('data-page-nav-selectors') || 'section[id] > h2';
      var target = nav.querySelector('[data-page-nav-target]') || nav;
      var seenIds = new Set();
      var items = [];

      root.querySelectorAll(selectors).forEach(function (labelNode) {
        var anchor = labelNode.closest('[id]');
        if (!anchor || !anchor.id || seenIds.has(anchor.id)) return;
        var label = labelNode.getAttribute('data-nav-label') || anchor.getAttribute('data-nav-label') || labelNode.textContent;
        label = label.replace(/\s+/g, ' ').trim();
        label = label.replace(/^\d+\.\s*/, '');
        if (!label) return;
        seenIds.add(anchor.id);
        items.push({ id: anchor.id, label: label });
      });

      if (!items.length) return;

      target.querySelectorAll('[data-page-nav-generated="true"]').forEach(function (a) { a.remove(); });

      items.forEach(function (item) {
        var a = document.createElement('a');
        a.href = '#' + item.id;
        a.textContent = item.label;
        a.setAttribute('data-page-nav-generated', 'true');
        target.appendChild(a);
      });
    });
  }

  /* ── Insert nav and clean up ───────────────────────────── */
  function init() {
    var shell = document.querySelector('.shell');
    if (!shell) return;
    shell.insertBefore(buildNav(), shell.firstChild);
    cleanHeroActions();
    buildAutoPageNavs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
