<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Original Author: Kimi K3 (Moonshot AI / GitHub Copilot)
  Last Updated: 2026-09-30
-->

# Brainstorm — Technical Overview page

Working draft for [technical-overview.html](technical-overview.html), aimed at **Google Workspace
tenant admins and script developers**. Once the content below is mature, it will be ported to
the HTML page (section by section) and this file will be **deleted** — afterwards all updates
happen directly in the HTML, to avoid two diverging sources of truth.

## 1. Purpose & audience

### Decided (2026-09-22)

- **Audience**: GWS tenant admins, and the script developer(s) maintaining **exodus** — the
  house-made sync script between the internal HRIS (**onesime**) and Google Workspace.
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
| 1 | Personal user provisioning & update | User (+ custom UUID attribute) | onesime → GWS (+ email write-back GWS → onesime) | ? | See section 3. License consumption is implicit: creating/deleting a (shared) user uses/frees a license — no separate license-assignment feature |
| 2 | Alias management | User alias, group alias | HRIS → GWS | ? | |
| 3 | Groups & membership sync | Group, Member | HRIS → GWS | ? | |
| 4 | Shared mailbox provisioning | User (functional account) or Group | mixed | ? | Some HRIS-backed (function / mission / responsibility), some GWS-native — see ownership model below |
| 5 | Inbox delegation grants | Gmail delegates | mixed | ? | |
| 6 | Contacts — delegation / sharing | Contacts (People API / Domain Shared Contacts) | mixed | ? | Exact mechanism TBD (see open questions) |
| 7 | Calendar sharing | Calendar ACLs | mixed | ? | Part of the mailbox bundle (see section 1) |
| 8 | Shared drives — provisioning & membership | Shared drive, members | mixed | ? | |
| 9 | Consistency checks & reconciliation | All managed objects | both | ? | REQUIRED. Personal users: see section 3.5 (automatic or selective manual correction). Other objects: policy parked |
| 10 | Failure handling & recovery | — | — | REQUIRED | Partial-run recovery, alerting (see section 7) |
| 11 | Language & country sync | User settings (language, country) | onesime → GWS | ? | Language from nationality, country from country of residence (see 3.3) |

**Explicitly out of scope (for now)**: OU management (exodus *uses* OUs but does not
manage them), signature provisioning, license assignment as a distinct feature.

### Ownership & reconciliation model (decided 2026-09-22)

- Primary direction: **HRIS (onesime) → GWS**.
- **Personal users**: onesime is the single point of truth (SPOT), including photo and
  postal address. Link key: the onesime UUID, stored in a custom GWS user attribute.
- **Shared mailboxes**: **mixed ownership** — some are HRIS-backed (function / mission /
  responsibility), others live only in GWS but may still be managed by exodus.
- Admins may act directly in the tenant; exodus must **detect** such changes and
  **reconcile** — automatically or with manual intervention (per-object policy TBD).

## 3. Personal users — creation & management (onesime → GWS)

> Described 2026-09-30. Status: draft — follow-up questions in 3.7.

### 3.1 Identity link

- Every person in onesime has a **UUID**. Every exodus-managed GWS personal user carries
  that UUID in a **custom user attribute** (custom schema field). The UUID is the only
  join key between onesime and GWS.
- Personal users can technically be created in three ways: Admin console, GAM, Directory
  API. exodus uses the API.

### 3.2 Eligibility criteria

| Rule | Condition |
|---|---|
| **Gets** a GWS account (provisioning) | Member of a *frat de vie*, OR *responsable* in a *frat de quartier* |
| **Keeps** the GWS account | Still a community member — moving frat de vie → frat de quartier, or losing a frat de quartier responsibility, does NOT remove the account |
| **Loses** the GWS account (deprovisioning) | No longer a community member — details parked (offboarding) |

Creation criteria are intentionally stricter than retention criteria.

### 3.3 Mode 1 — Create

1. Create the GWS user.
2. Write the onesime UUID into the custom UUID attribute.
3. Copy personal data from onesime: postal address, photo.
4. Set the account's user language from the person's **nationality**, and the
   country/locale from the **country of residence** (both stored in onesime).
5. Move the person's pre-existing personal email address (e.g. `user123xyz@gmail.com`)
   within onesime to an `old-personal-e-mail` field — it stays in onesime, nothing is
   stored in GWS.
6. Write the new GWS address (`prenom.nom@…`) into onesime's email field. Because
   onesime keeps `old-personal-e-mail`, deprovisioning can later restore it.
7. Set the password.
8. Send a welcome email to the personal address; the password is delivered via a
   password-pusher link, never in plain text.

### 3.4 Mode 2 — Update

- UUID missing in GWS → exodus writes it from onesime.
- Photo or postal address changed in onesime → exodus overwrites GWS. onesime is SPOT:
  changes made by the user in GWS are overwritten; a permanent change must be made in
  onesime (or requested from whoever manages it).
- Name changed in onesime → exodus updates the display/family name **and renames the
  primary email address**; GWS automatically keeps the old address as an alias, so no
  mail is lost (decided 2026-10-01).
- Phone number changed in onesime → exodus updates it in GWS (decided 2026-10-01).
- **Never synced** (too organization-specific to keep authoritative in onesime —
  decided 2026-10-01): job title / role, department, manager.

### 3.5 Triggers & correction modes

| Trigger | Provisioning | Update |
|---|---|---|
| **Event** in onesime (automatic) | Person meets the criteria | Photo or postal address changed |
| **Manual** (exodus user) | Triggers a creation | Triggers an update |
| **Consistency check** | See checks below | See checks below |

Deprovisioning event (person no longer meets retention criteria) → parked (offboarding).

Consistency checks:

- **(a)** every onesime person meeting the criteria has a linked GWS account;
- **(b)** every GWS *personal* account (not shared users) has a linked onesime person;
- **(c)** GWS accounts that should have been deprovisioned.

Correction modes after a check: **automatic** (fix everything per the rules) or
**manual** (an exodus user selects which actions to apply).

### 3.6 Admin rules (draft — to confirm)

- Personal users are created and updated **through exodus only** (automatic or manual
  trigger) — never by hand in the Admin console or via GAM. Such accounts would lack the
  UUID and be flagged by consistency check (b).
- Synced fields (photo, postal address): permanent changes are made **in onesime**.
  Users may temporarily change their photo in GWS, but it will be overwritten at the
  next onesime change (see 3.7 item 11).

### 3.7 Questions & remarks (to answer)

1. ~~[Push back] Personal email overwritten in onesime~~ → RESOLVED (2026-09-30):
   the personal address is **moved within onesime** to an `old-personal-e-mail` field;
   the GWS address then goes into onesime's email field. Nothing is stored in GWS,
   onesime keeps everything, and deprovisioning can later restore the personal address.
2. ~~Where to store the personal email in GWS~~ → moot: it lives in onesime
   (`old-personal-e-mail`), not in GWS. (Setting the GWS `recoveryEmail` for
   self-service recovery — security vs support-load trade-off — remains a separate,
   open decision. Note: if `recoveryEmail` is set at all, populating it with the
   personal address doubles as a **matching key** for adopting pre-exodus accounts
   — see item 6.)
3. **Primary address generation** — pattern: `prenom.nom@` with **country-specific
   particularities (TODO: elaborate)**. Homonym policy — PROPOSED, to be confirmed:
   both people get a disambiguated address with middle name or initial
   (`prenom.middle.nom@`); the bare `prenom.nom@` address gets an auto-reply listing
   both addresses; display names carry extra information (which info — TBD).
   Diacritics / apostrophes / hyphens / particles (*de*, *van*…), maximum length, and
   no reuse of old addresses still to be defined.
   *Caveat*: if a second homonym arrives years after the first person already uses
   `prenom.nom@`, applying the rule symmetrically forces renaming that first account
   (disruptive). Decide now: first-keeps-base-address (asymmetric), or both get
   disambiguated addresses (rename + alias).
4. ~~OU placement at creation~~ → DECIDED (2026-10-01): **one OU for all personal
   users** (no frat de vie / frat de quartier split at the OU level — the frat
   distinction stays in onesime and groups). **Shared users get a separate OU with
   several sub-OUs** (structure TBD when we cover shared users). Consequence: a move
   frat de vie → frat de quartier does NOT change the OU → no OU-move update case in
   mode 2. The OU structure itself is managed by hand (exodus uses OUs but does not
   manage them — see section 2).
5. ~~Update scope~~ → DECIDED (2026-10-01): synced in mode 2 = UUID, photo, postal
   address, **name** (with primary-address rename; old address kept automatically as an
   alias), **phone**. Excluded: title/role, department, manager — too complicated to
   maintain authoritatively in onesime for this organisation. (Language/country sync on
   update: still open — item 14.)
6. ~~Matching when the UUID is missing (mode 2)~~ → DECIDED (2026-10-01):
   - **Auto-link** when the match is unambiguous on email: onesime email = GWS primary
     address, **or** onesime `old-personal-e-mail` = GWS `recoveryEmail` / secondary
     email.
   - **Everything else**: exodus lists the unmatched pairs and proposes candidate
     matches; the **admin chooses** (fits the manual correction mode). Never auto-link
     on name alone — homonym risk.
   - Scale of the initial adoption of pre-exodus accounts: a **few dozen** — a one-time,
     semi-manual batch, not a steady-state rule.
7. ~~Consistency check (b) needs an account-type marker~~ → PROPOSED (2026-09-30):
   **OU** for applying policies, custom **`accountType`** attribute for scripts
   (values e.g. `personal`, `shared`, `service`, `external`, `admin`), **subdomain
   naming** for human readability. Service accounts live on a **separate domain**.
   Remaining: the marker/OU values for shared, external, test and break-glass accounts
   still need to be defined.
8. **Manual trigger vs criteria** — can an exodus user create an account for someone who
   doesn't meet the criteria? If yes, consistency check (c) will flag it next run → a
   persistent exception flag is needed (in onesime?). Also confirm: "community member" =
   any frat de vie or frat de quartier membership, whatever the role?
9. **Password & first login** — force change at next login? 2-Step Verification
   enforcement and new-user enrollment period? Password-pusher link expiry, and what
   happens if it expires unused (re-send = new password = manual trigger?). Password
   pusher self-hosted or public service (external-tools policy)?
10. **Welcome email** — language can follow the synced user language (from nationality,
    see 3.3 step 4). Still open: sender address and deliverability
    (SPF / DKIM / DMARC), since it goes to external personal mailboxes.
11. ~~Attribute drift~~ → RESOLVED (2026-09-30): conscious trade-off. Changes made in
    GWS are **not** synced back to onesime. Users **may** change their photo in GWS
    (not blocked — avoids the frustration of locked fields), knowing onesime is SPOT:
    any change in onesime overwrites the GWS value at the next sync. For a permanent
    change, the user edits (or requests the edit) in onesime. **No consistency check
    for attribute drift.** Attention point for the page: a GWS-side change can be
    silently overwritten later — users must be told this rule up front.
12. **Privacy / GDPR** — confirmed: the postal address is a **home address** → GDPR
    attention point on the page. Attenuation: members can already see all members'
    addresses via the corporate phone book, so GWS visibility matches an existing
    practice. Still to verify: Directory / contact-card visibility scope and legal
    basis; same question for the photo (consent).
13. **Glossary** — keep the French terms (*frat de vie*, *frat de quartier*, *responsable*)
    on the English page with a short glossary entry?
14. **Language sync on update?** — Mode 1 sets user language (from nationality) and
    country (from residence) at creation. Should mode 2 also sync them when they change
    in onesime (person moves to another country)? Note: setting the GWS user language
    overrides the Gmail UI language the user may have chosen themselves.

**Implementation suggestion (for exodus devs)**: set the UUID and password in the same
Directory API `users.insert` call that creates the user (it accepts custom schema values,
and a password is mandatory anyway) — no window where an exodus-created user exists
without its UUID. The photo requires a separate call. Make the UUID field **indexed**
(searchable) with **admin-only** read access.

**Parked note**: *automatic* correction combined with *deprovisioning* is the
highest-risk combination — a onesime bug or bulk data change could suspend many accounts
at once. A mass-change safety threshold should be discussed with offboarding.

## 4. Candidate page sections

> To be reordered / trimmed / expanded as we brainstorm.

1. **Scope & audience** — who this is for; pointer to exodus repo/doc; glossary
   (onesime, exodus, frat de vie, frat de quartier).
2. **Web console possibilities** — what can be done from the Admin console UI alone,
   with its limits (and what must NOT be done by hand because exodus owns it).
3. **API landscape** — Admin SDK (Directory, Groups Settings, Reports), Gmail API, People API,
   Drive API; what each covers here.
4. **Choices made & rationale** — service account + domain-wide delegation, GAM, no paid
   third-party tools (nonprofit external-tools policy). (see section 5)
5. **exodus: features & implementation** — the feature list (section 2), architecture,
   scheduling, error handling, credentials.
6. **Admin how-to & pitfalls** — what to do / how / what to avoid per object type
   (users, groups, shared mailboxes, shared drives, …).
7. **Limits & quotas** — API rate limits, GWN edition constraints relevant to scripting.
8. **Links** — official Google docs, GAM wiki, related topic pages (9, 10).

## 5. Choices to document (initial list)

| Choice | Alternatives considered | Rationale |
|---|---|---|
| Service account + domain-wide delegation | Per-user OAuth consent | Standard, free, Google-supported; central control |
| GAM (open-source CLI) | Raw REST calls, Apps Script, paid tools | Free, mature, community-documented, policy-compliant |
| HRIS = single source of truth for users | GWS as master, bi-directional sync | Simplicity, no drift; identity lifecycle belongs to HR |
| Mixed ownership for shared mailboxes (HRIS-backed or GWS-native) | All mailboxes in HRIS / none | Not every shared address maps to an HRIS function |
| Reconciliation of manual admin changes (detect + auto/manual reconcile) | "Hands-off" rule only | Admins need emergency access; drift must still be caught |
| Full test tenant for validating exodus changes | Test OU in production tenant | Complete isolation; a full test tenant already exists |
| onesime UUID in a custom GWS user attribute as join key | Match on email or name | Stable, unique, survives renames and address changes |
| onesime is SPOT for photo & postal address (GWS overwritten) | Last-writer-wins, bi-directional | One place to change personal data; predictable |
| Initial password delivered via password-pusher link | Plain text in email, admin hand-over | Password never stored in a mailbox in clear text |
| Personal users created via exodus only (draft) | Console / GAM creation allowed | Every account carries its UUID; no orphans |
| Personal email kept in onesime `old-personal-e-mail` | Store it in a GWS field | onesime keeps everything; deprovisioning can restore the personal address |
| User language from nationality; country from residence | Manual per-user setting | Consistent default experience for an international community |
| Homonym policy (proposed, TBC) | First-come-keeps-base-address, numbered suffixes | Both get `prenom.middle.nom@`; bare `prenom.nom@` auto-replies with both addresses |
| Account-type model (proposed) | OU-only or naming-only identification | OU for policies, `accountType` custom attribute for scripts, subdomain for humans; service accounts on a separate domain |
| One OU for all personal users; shared users in a separate OU tree | OU per frat type / per community | No policy difference between frat types; frat distinction lives in onesime and groups; no OU moves when someone changes frat |
| Users may edit their photo in GWS (overwrite accepted) | Lock the fields, or sync back to onesime | SPOT stays onesime without locking users out; no drift check needed |
| Mode-2 sync scope: UUID, photo, postal address, name (+ primary-address rename), phone | Sync all onesime fields (title, department, manager…) | Only fields with a clear consumer in GWS; title/department/manager too org-specific to keep authoritative in onesime |
| Primary address follows name changes | Name syncs but address stays | Identity stays consistent; GWS keeps the old address as an alias, so no mail is lost |
| UUID-missing matching: auto on email match, admin chooses otherwise | Auto-link on name; fully manual table | Email keys are unambiguous; name-only matching risks linking the wrong homonym |
| … | … | … |

## 6. Open questions

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
  - [x] Personal users — model described (section 3), updated 2026-09-30 (language
    sync, homonym & accountType proposals, drift trade-off); remaining follow-ups in 3.7
  - [ ] Shared users
  - [ ] Collaborative groups
  - [ ] Aliases
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

## 7. Caveats & blind spots register

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
- **New accounts are not instantly fully usable**: after user creation, the mailbox and
  some services can take from minutes to hours to be provisioned. Gmail API calls made
  right after creation (delegation, settings) may fail — exodus should retry rather
  than treat it as a hard error.

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

## 8. Transfer checklist (MD → HTML)

- [ ] One `<section class="section">` per retained section, with a stable `id`
- [ ] Sidebar nav is auto-generated by `js/site-nav.js` — no manual links needed
- [ ] Tables inside `.table-wrap`; code snippets as `<code class="block">` (see topic 10)
- [ ] Update hero pill `Status: Draft` → `Written`, refresh the `Last updated` date
- [ ] Update `README.md` structure table (drop the "draft" mention, drop the MD row)
- [ ] **Delete this Markdown file** — afterwards, updates happen in the HTML only
