<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Original Author: Kimi K3 (Moonshot AI / GitHub Copilot)
  Last Updated: 2026-09-22
-->

# Brainstorm — Technical Overview page

Working draft for [technical-overview.html](technical-overview.html), aimed at **Google Workspace
tenant admins and script developers**. Once the content below is mature, it will be ported to
the HTML page (section by section) and this file will be **deleted** — afterwards all updates
happen directly in the HTML, to avoid two diverging sources of truth.

## 1. Purpose & audience

### Decided (2026-09-22)

- **Audience**: GWS tenant admins, and the script developer(s) maintaining **exodus** — the
  house-made sync script between the internal HRIS and Google Workspace.
- **Language**: English only.
- **Aim of the page** — a reader should learn:
  1. What to do (and what has been decided) for actions on GWS: adding users, groups,
     shared mailboxes, shared drives, etc. (non-exhaustive).
  2. What the constraints are (edition, quotas, external-tools policy, security baseline).
  3. What is automated (exodus), and how it is implemented.
  4. As an admin: what to do, how to do it, and **what to avoid**.
- **Scope**: mainly admin; end-user automation (filters, templates, signatures) may be
  included where relevant to the admin story (e.g. centrally provisioned via API).
- **Scope vs the rest of the site (2026-09-22)**: this page is intentionally broader than
  the original study question (choosing among the 7 sharing options). It is the
  **implementation companion to the Decision Guide**: once an option is chosen, making it
  work in practice immediately implies the surrounding bundle — shared calendar, shared
  contacts, shared drive. These were not studied as separate topics because they are
  straightforward; they are covered here, and exodus handles them anyway.
- **exodus coverage**: contract-level only (what it does, what it owns, ops pointers) —
  the page is not about exodus internals. Hosting, scheduling, and secrets belong to the
  exodus project itself. The name "exodus" may be published.
- **Required section**: the full feature list that exodus must cover (see section 2).

### Positioning vs topics 9 & 10 — DECIDED (2026-09-22)

- Topics 9 (Admin Controls) and 10 (API & Automation) are **decision criteria** — they compare
  the 7 options to help choose one.
- This page is **technical**: it documents the actual choices made and their implementation.
- **Some repetition with topics 9/10 is accepted and expected** — the angle is different
  (reference/implementation vs comparison/decision). Cross-link rather than deduplicate.
- **GAM snippets live on this page too.** In an ideal world they'd be centralized elsewhere,
  but keeping them here is good enough — no separate snippets repo/page.

## 2. exodus — required feature list

> The contract between the HRIS and GWS. Per-feature status to be confirmed.

| # | Feature | GWS object(s) | Direction | Status (live / planned / idea) | Notes |
|---|---|---|---|---|---|
| 1 | User provisioning (create / suspend / delete) | User | HRIS → GWS | ? | License consumption is implicit: creating/deleting a (shared) user uses/frees a license — no separate license-assignment feature |
| 2 | Alias management | User alias, group alias | HRIS → GWS | ? | |
| 3 | Groups & membership sync | Group, Member | HRIS → GWS | ? | |
| 4 | Shared mailbox provisioning | User (functional account) or Group | mixed | ? | Some HRIS-backed (function / mission / responsibility), some GWS-native — see ownership model below |
| 5 | Inbox delegation grants | Gmail delegates | mixed | ? | |
| 6 | Contacts — delegation / sharing | Contacts (People API / Domain Shared Contacts) | mixed | ? | Exact mechanism TBD (see open questions) |
| 7 | Calendar sharing | Calendar ACLs | mixed | ? | Part of the mailbox bundle (see section 1) |
| 8 | Shared drives — provisioning & membership | Shared drive, members | mixed | ? | |
| 9 | Detection & reconciliation of manual admin changes | All managed objects | GWS → exodus | ? | REQUIRED — see ownership model below |
| 10 | Failure handling & recovery | — | — | REQUIRED | Partial-run recovery, alerting (see section 6) |

**Explicitly out of scope (for now)**: OU management (exodus *uses* OUs but does not
manage them), signature provisioning, license assignment as a distinct feature.

### Ownership & reconciliation model (decided 2026-09-22)

- Primary direction: **HRIS → GWS**.
- **Users**: HRIS is the single point of truth (SPOT).
- **Shared mailboxes**: **mixed ownership** — some are HRIS-backed (function / mission /
  responsibility), others live only in GWS but may still be managed by exodus.
- Admins may act directly in the tenant; exodus must **detect** such changes and
  **reconcile** — automatically or with manual intervention (per-object policy TBD).

## 3. Candidate page sections

> To be reordered / trimmed / expanded as we brainstorm.

1. **Scope & audience** — who this is for; pointer to exodus repo/doc.
2. **Web console possibilities** — what can be done from the Admin console UI alone,
   with its limits (and what must NOT be done by hand because exodus owns it).
3. **API landscape** — Admin SDK (Directory, Groups Settings, Reports), Gmail API, People API,
   Drive API; what each covers here.
4. **Choices made & rationale** — service account + domain-wide delegation, GAM, no paid
   third-party tools (nonprofit external-tools policy). (see section 4)
5. **exodus: features & implementation** — the feature list (section 2), architecture,
   scheduling, error handling, credentials.
6. **Admin how-to & pitfalls** — what to do / how / what to avoid per object type
   (users, groups, shared mailboxes, shared drives, …).
7. **Limits & quotas** — API rate limits, GWN edition constraints relevant to scripting.
8. **Links** — official Google docs, GAM wiki, related topic pages (9, 10).

## 4. Choices to document (initial list)

| Choice | Alternatives considered | Rationale |
|---|---|---|
| Service account + domain-wide delegation | Per-user OAuth consent | Standard, free, Google-supported; central control |
| GAM (open-source CLI) | Raw REST calls, Apps Script, paid tools | Free, mature, community-documented, policy-compliant |
| HRIS = single source of truth for users | GWS as master, bi-directional sync | Simplicity, no drift; identity lifecycle belongs to HR |
| Mixed ownership for shared mailboxes (HRIS-backed or GWS-native) | All mailboxes in HRIS / none | Not every shared address maps to an HRIS function |
| Reconciliation of manual admin changes (detect + auto/manual reconcile) | "Hands-off" rule only | Admins need emergency access; drift must still be caught |
| Full test tenant for validating exodus changes | Test OU in production tenant | Complete isolation; a full test tenant already exists |
| … | … | … |

## 5. Open questions

> Ordered by priority (agreed 2026-09-22). We work top-down; parked topics stay parked
> until the earlier ones are settled.

**Resolved**

- [x] ~~How does this page relate to topics 9/10?~~ → Decided: technical/implementation page,
  repetition accepted, cross-links to topics. (see section 1)
- [x] ~~Where do GAM snippets live?~~ → Decided: on this page. (see section 1)
- [x] ~~Page language?~~ → English only. (see section 1)
- [x] ~~Admin-only or also end-user automation?~~ → Mainly admin; end-user automation
  included where relevant. (see section 1)
- [x] ~~Fate of this MD file after transfer?~~ → Deleted; updates continue in the HTML.
  Decision history lives in the HTML's Choices section; worst case, git has it.
- [x] ~~Where does exodus live / how is it hosted?~~ → Out of scope for this page; treat
  exodus as a service syncing via APIs and hooks/events on both sides.
- [x] ~~exodus internals or contract?~~ → Contract. (see section 1)
- [x] ~~Publish the name "exodus"?~~ → Yes.
- [x] ~~Secrets handling on this page?~~ → Out of scope; owned by the exodus project.

**1. NOW — Creation & management of objects**

- [ ] How are users / shared users / collaborative groups / aliases created & managed?
  (web console vs API vs exodus — per object type)
- [ ] Per-feature status (live / planned / idea) in the section 2 table.

**2. NEXT — The mailbox bundle**

- [ ] Contacts mechanism: per-mailbox contact delegation vs Domain Shared Contacts
  (Directory API)?
- [ ] Calendars: ACL grants on the functional account's calendar vs separate shared
  calendars / resources?
- [ ] Shared drives: who becomes Manager; in scope now or later?

**3. PARKED — later topics (do not discuss yet)**

- [ ] Offboarding lifecycle — big topic, parked until creation/onboarding is settled.
- [ ] Reconciliation policy per object: auto-revert vs alert-and-wait; manual-override
  mechanism. Parked (reconciliation is a *required feature*, its policy comes later).
- [ ] Change management: who may modify exodus; how changes are announced.

## 6. Caveats & blind spots register

> Raised during the 2026-09-22 session; to be discussed, then moved into the relevant
> page sections.

### Caveats (to document on the page)

- **Delegation grants are per-user Gmail API operations** — at scale (delegates ×
  mailboxes) this is the slowest part of any sync and the first to hit quota.
- **Shared drives**: creation requires a Shared-Drives-enabled edition (OK on GWN), but
  membership and roles (Manager, Content manager, …) via the Drive API differ from
  groups — verify exodus's actual usage.
- **Re-sync overwrite risk**: without reconciliation rules, manual Admin-console edits
  would be silently reverted. Mitigated by design (reconciliation is a required
  feature), but the per-object *policy* (auto-revert vs alert) is still TBD.
- **GWS-side "hooks" are limited**: in practice, change detection = Reports API polling
  or Pub/Sub watches (Gmail / Drive / Admin). Detection latency affects how fast manual
  changes are caught — relevant for what the page can promise. (exodus internal detail.)

### Blind spots — status

1. **Failure & alerting** → REQUIRED exodus feature (decided 2026-09-22). The page should
   state the recovery procedure after a partial run.
2. **Offboarding & tombstoning** → BIG discussion point (see open questions).
   *Tombstoning* = keeping a marker/record of a departed or deleted entity for a while
   instead of hard-deleting immediately, so that: (a) the sync does not recreate it,
   (b) data (mail, files, delegations, calendar ownership) can be transferred or revoked
   gracefully, (c) the name/address is not immediately reused, and (d) "absent from the
   HRIS" stays distinguishable from "never existed".
3. **Secrets handling** → out of scope for this page; owned by the exodus project
   (global rule stands: never in tracked files).
4. **Test path** → a complete test tenant exists; the page should state the
   test-before-production practice.
5. **Change management** → to be discussed later.

## 7. Transfer checklist (MD → HTML)

- [ ] One `<section class="section">` per retained section, with a stable `id`
- [ ] Sidebar nav is auto-generated by `js/site-nav.js` — no manual links needed
- [ ] Tables inside `.table-wrap`; code snippets as `<code class="block">` (see topic 10)
- [ ] Update hero pill `Status: Draft` → `Written`, refresh the `Last updated` date
- [ ] Update `README.md` structure table (drop the "draft" mention, drop the MD row)
- [ ] **Delete this Markdown file** — afterwards, updates happen in the HTML only
