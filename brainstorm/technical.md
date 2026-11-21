<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Original Author: Kimi K3 (Moonshot AI / GitHub Copilot)
  Major Contributors: Claude (Anthropic / GitHub Copilot), Copilot (model not exposed)
  Last Updated: 2026-11-12
-->

# Brainstorm — Technical Overview page

**Contents**

- [1. Purpose & audience](#section-1)
- [2. exodus — required feature list](#section-2)
- [3. Community member accounts & email access](#section-3)
  - [3.1 Full GWS account](#section-3-1)
  - [3.2 Google Group email delivery](#section-3-2)
- [4. Shared mailboxes — access groups](#section-4)
- [5. Candidate page sections](#section-5)
- [6. Choices to document](#section-6)
- [7. Open questions](#section-7)
- [8. Caveats & blind spots register](#section-8)
- [9. Transfer checklist (MD → HTML)](#section-9)

Working draft for [technical-overview.html](technical-overview.html), aimed at **Google Workspace
tenant admins and script developers**. Once the content below is mature, it will be ported to
the HTML page (section by section) and this file will be **deleted** — afterwards all updates
happen directly in the HTML, to avoid two diverging sources of truth.

<a id="section-1"></a>

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
  contacts, shared drive. Calendar decisions and follow-up are in the
  [calendar brainstorm](calendars.md); contacts and shared drives are covered
  here, and exodus handles them anyway.
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

<a id="section-2"></a>

## 2. exodus — required feature list

> The contract between the HRIS and GWS. Per-feature status to be confirmed.

| # | Feature | GWS object(s) | Direction | Status (live / planned / idea) | Notes |
|---|---|---|---|---|---|
| 1 | Personal user provisioning & update | User (+ custom UUID attribute) | onesime → GWS (+ email write-back GWS → onesime) | ? | See section 3. License consumption is implicit: creating/deleting a (shared) user uses/frees a license — no separate license-assignment feature |
| 2 | Alias management | User alias, group alias | HRIS → GWS | ? | |
| 3 | Groups & membership sync | Group, Member | HRIS → GWS | ? | |
| 4 | Shared mailbox provisioning | User (functional account) or Group | mixed | ? | Some HRIS-backed (function / mission / responsibility), some GWS-native — see ownership model below |
| 5 | Inbox delegation grants | Gmail delegates, `su-` security group | mixed | ? | One group delegate per mailbox; access = group membership (see section 4) |
| 6 | Contacts — delegation / sharing | Contacts and proposed `sc-` security group | mixed | ? | `sc-` expresses intended membership; the grant mechanism remains TBD (see section 4) |
| 7 | Calendar sharing | Calendar ACLs, `sa-` security group | mixed | ? | Part of the mailbox bundle; current model and follow-up are in the [calendar brainstorm](calendars.md) |
| 8 | Shared drives — provisioning & membership | Shared drive, members | mixed | ? | |
| 9 | Consistency checks & reconciliation | All managed objects | both | ? | REQUIRED. Personal users: see section 3.1.5 (automatic or selective manual correction). Other objects: policy parked |
| 10 | Failure handling & recovery | — | — | REQUIRED | Partial-run recovery, alerting (see section 8) |
| 11 | Language & country sync | User settings (language, country) | onesime → GWS | ? | Language from nationality, country from country of residence (see 3.1.3) |

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

<a id="section-3"></a>

## 3. Community member accounts & email access

Community members have one of two ways to receive mail at a
`firstname.surname@chemin-neuf.org` address:

- **Full GWS account** — provision one when the person is a member of a *frat de vie*,
  or is a *responsable* in a *frat de quartier*. Once created, the account remains
  while the person is a community member, even if they later no longer meet the
  creation criteria. See [3.1](#section-3-1).
- **Google Group delivery** — for a community member who does not meet either
  full-account creation criterion and does not already have a full GWS account, route
  mail for their community address to their personal address. This provides mail
  reception only; it does not let them send from the community address. See
  [3.2](#section-3-2).

The Google Group approach has been investigated and validated. The specific group
settings and end-to-end delivery behavior still need the pilot checks listed in 3.2
before rollout.

> Full-account model described 2026-09-30. Status: draft — follow-up questions in
> 3.1.7; Google Group delivery approach validated, implementation details remain to
> be confirmed.

<a id="section-3-1"></a>

### 3.1 Full GWS account (onesime → GWS)

#### 3.1.1 Identity link

- Every person in onesime has a **UUID**. Every exodus-managed GWS personal user carries
  that UUID in a **custom user attribute** (custom schema field). The UUID is the only
  join key between onesime and GWS.
- Personal users can technically be created in three ways: Admin console, GAM, Directory
  API. exodus uses the API.

#### 3.1.2 Eligibility criteria

| Rule | Condition |
|---|---|
| **Gets** a GWS account (provisioning) | Member of a *frat de vie*, OR *responsable* in a *frat de quartier* |
| **Keeps** the GWS account | Still a community member — moving frat de vie → frat de quartier, or losing a frat de quartier responsibility, does NOT remove the account |
| **Loses** the GWS account (deprovisioning) | No longer a community member — details parked (offboarding) |

Creation criteria are intentionally stricter than retention criteria.

#### 3.1.3 Mode 1 — Create

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

#### 3.1.4 Mode 2 — Update

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

#### 3.1.5 Triggers & correction modes

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

#### 3.1.6 Admin rules (draft — to confirm)

- Personal users are created and updated **through exodus only** (automatic or manual
  trigger) — never by hand in the Admin console or via GAM. Such accounts would lack the
  UUID and be flagged by consistency check (b).
- Synced fields (photo, postal address): permanent changes are made **in onesime**.
  Users may temporarily change their photo in GWS, but it will be overwritten at the
  next onesime change (see 3.1.7 item 11).

#### 3.1.7 Questions & remarks (to answer)

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
    see 3.1.3 step 4). Still open: sender address and deliverability
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

<a id="section-3-2"></a>

### 3.2 Google Group email delivery for people without a full GWS account

> Investigated and validated. Status: approach accepted; verify implementation details
> and end-to-end delivery in the test tenant before rollout.

- **Requirement**: every brother and sister in the community has a
  `firstname.surname@chemin-neuf.org` address. The goal is to limit the differences
  between *frat de vie* and *frat de quartier* members: all receive a community address.
  Because the free GWS tenant for NGOs is capped at 2.000 GWS accounts, not every member
  can have a full account — hence the redirection to the personal address. A person
  without a full GWS account can receive mail at that address through redirection to
  their personal address, but cannot send from the community address.
  Mass mailings use the Onesime function and a community address; sending personal email from that
  address requires migration to a full GWS account.
- **Validated approach — one Google Group per person without an account**: create a
  group at the community address and add that person's personal address as its sole
  external member, with delivery set to `ALL_MAIL`. Exodus could create the group and
  manage its membership through the Admin SDK Directory API; the Groups Settings API
  exposes group access and posting controls. This is automated and avoids creating a
  licensed GWS user. A group is a distribution endpoint, **not** a mailbox or a true
  redirect: test message headers, sender authentication, spam handling, and bounces with
  Onesime and representative external providers.
  - **Proposed group settings** (validate in the test tenant):

    | Setting | Proposed value | Reason |
    |---|---|---|
    | Allow external members | On | Required for the recipient's personal address to be a group member. |
    | Who can add external members | Admins only | Prevents users from adding arbitrary external addresses. |
    | External recipient's role | `MEMBER`, delivery `ALL_MAIL` | Receives every message; no owner or manager permissions. |
    | Who can join | Invitation only | The recipient should be added and removed only by exodus/admins. |
    | Who can post | Anyone on the internet (`ANYONE_CAN_POST`) | Required to receive ordinary mail from arbitrary external senders, not just Onesime. |
    | Message moderation | None (`MODERATE_NONE`) | Ensures messages are delivered directly; moderating non-members would also hold ordinary mail from correspondents. |
    | Members can post as the group | Off | The external member must not send using the community address. |
    | Who can view members / conversations | Managers only | The recipient needs delivery only, not access to the group roster or archived conversations. |
    | Conversation history / archive | Off, if configurable | This is a delivery list, not a mailbox; avoid retaining another copy of messages. |
    | Directory / global address list visibility | Hidden | These are personal delivery endpoints, not groups people should browse or join. |
    | Footer, reply-to override, digest | Off / default / immediate mail | Avoid modifying messages; deliver each message promptly. |

    Set the external-membership setting before adding the member. Google's 2026
    membership-classification change makes this a prerequisite for groups intended to
    contain external members. Do not set `archiveOnly=true`: it causes the group to
    reject new messages; it is different from disabling conversation history.
  - **Important send/receive distinction**: `ANYONE_CAN_POST` lets anyone submit a
    message *to* the group so that it can be delivered to the member. It does not by
    itself let the member send *as* the group; keep `membersCanPostAsTheGroup=false`.
    However, `ANYONE_CAN_POST` is intentionally broad: Google Groups does not provide a
    per-sender allowlist in this setting. Google's recommended anti-spam setting,
    `MODERATE_NON_MEMBERS`, would queue all non-member messages—including normal mail
    from correspondents and likely Onesime—so it conflicts with unattended delivery.
    Accept this exposure only if the address is meant to receive mail from anyone; test
    Google spam handling and abuse reporting. Onesime's properly configured
    SPF/DKIM/DMARC helps authenticate its messages, but the complete forwarded path still
    needs a delivery test at external providers.
  - **Owner and least privilege**: Google Workspace documentation says administrators
    are automatically assigned the owner role on all groups in the organization. The
    Directory API can create a group with no explicit members, so do not make the
    recipient an owner or manager. Prefer admin/exodus-managed lifecycle and the
    implicit administrator ownership. If the implementation requires an explicit owner,
    use a dedicated Workspace exodus service **user** (not a Google Cloud service
    account) as `OWNER`; give it no message delivery (`delivery_settings=NONE`) and no
    interactive use if feasible. An owner has powerful group-management permissions,
    including changing settings and deleting the group, so this is not a minimal
    privilege role and must be narrowly controlled. Confirm in the test tenant whether
    an explicit owner is needed for the chosen creation API and for exodus operations.
  - When someone migrates to a full GWS account, the group and user cannot own the same
    address simultaneously. Exodus needs an ordered hand-off (remove/rename/delete the
    group, then create the user) and a test for address-release/propagation behavior.
- **Alternative — recipient address maps**: Google's Admin help documents bulk
  entry (up to 5,000 recipient addresses across maps), so 1,500 addresses fit the
  published limit. The documented workflow is in the Admin console and supports bulk
  entry; no public API for managing these maps was found. This could work for a
  manually refreshed roster, but is a poor fit for automated Onesime lifecycle updates.
- **Not an equivalent**: Gmail API forwarding configures forwarding for a Gmail user
  account and requires a verified/eligible destination. It does not create a recipient
  address for someone without a GWS account.
- **Pilot questions**: Confirm Onesime's mass-mailing service can deliver to the groups
  with the expected `From` identity, and verify end-to-end delivery/authentication after
  Google forwards to representative external providers. Also test ordinary external
  correspondence, spam/abuse handling, bounces, external-member delivery, owner
  management, address hand-off, and relevant group/domain recipient quotas before
  rolling out this model.

**References (checked 2026-11-09)**:
[Google: redirect or forward messages, including address maps](https://knowledge.workspace.google.com/admin/gmail/advanced/redirect-or-forward-gmail-messages-to-another-user);
[Directory API: create groups](https://developers.google.com/workspace/admin/directory/reference/rest/v1/groups/insert);
[Directory API: add group members](https://developers.google.com/workspace/admin/directory/reference/rest/v1/members/insert);
[Directory API: member delivery settings and external members](https://developers.google.com/workspace/admin/directory/reference/rest/v1/members);
[Groups Settings API](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups);
[Google: roles and administrator ownership of groups](https://knowledge.workspace.google.com/admin/groups/assign-roles-to-a-groups-members);
[Cloud Identity Groups API: initial owner options](https://cloud.google.com/identity/docs/how-to/create-google-groups);
[Google: internal/external group classifications](https://knowledge.workspace.google.com/admin/groups/changes-to-internal-and-external-classifications-in-google-groups);
[Gmail API: forwarding requirements](https://developers.google.com/workspace/gmail/api/guides/forwarding_settings).

<a id="section-4"></a>

## 4. Shared mailboxes — access groups (`su-` / `sa-` / `sc-`)

> Proposed 2026-10-26, updated 2026-11-12. Status: draft — open points in 4.6.

### 4.1 Model

The proposed access model uses **security groups**, following the existing
`sd-<shared-drive-name>@security.chemin-neuf.net` pattern for shared drives. Gmail can use
a group as the grant target; the calendar grant model is in the
[calendar brainstorm](calendars.md). Contacts may require individual grants
derived from group membership.

| Group | Meaning | Grants | Members |
|---|---|---|---|
| `su-<mailbox>@security.chemin-neuf.net` | **s**hared **u**ser | Gmail delegation on the shared mailbox (the group is the single delegate) | People who read / send for the mailbox |
| `sa-<mailbox>@security.chemin-neuf.net` | **s**hared **a**genda | Calendar access; see the [calendar brainstorm](calendars.md) | `su-<mailbox>@…` (nested) + calendar-only people, if any |
| `sc-<mailbox>@security.chemin-neuf.net` | **s**hared **c**ontacts | Proposed source of intended contact delegates, **not itself a contact-delegation grant** | People intended to manage contacts; nesting with `su-` remains open |
| `saro-<mailbox>@security.chemin-neuf.net` | **s**hared **a**genda **r**ead-**o**nly | Calendar access; see the [calendar brainstorm](calendars.md) | Read-only calendar people |
| `sd-<shared-drive>@security.chemin-neuf.net` (existing convention) | **s**hared **d**rive | Shared drive linked to the shared mailbox | `su-<mailbox>@…` (nested) + others as needed |

- **Nesting**: `su-` is a member of `sa-` and the `sd-` group of the shared drive linked
  to the mailbox (decided 2026-10-28; **how a shared drive is linked to a shared user is
  still to be discussed**). See the [calendar brainstorm](calendars.md) for
  the calendar access implications.
- **Nested groups work for Gmail delegation** — confirmed by test (2026-10-26). Google's
  admin doc does not state it (some third-party sources even claim the opposite), so
  record the test details (nesting depth tested, add **and** removal propagation) and
  re-test after notable Google changes.
- Calendar roles, ACL ownership, and the rationale for separate calendar groups are
  documented in the [calendar brainstorm](calendars.md).
- **Contacts**: `sc-` is a proposed membership source, not a native group delegation
  mechanism. Whether exodus can reconcile its expanded membership to individual grants
  is unverified; see 4.4. Creating the group alone gives no contact access.

### 4.2 Naming rule (decided 2026-10-26)

- Shared mailbox on **`@chemin-neuf.org`** → use only the local part (before `@`).
- Shared mailbox on **any other domain** → use the full address with `---` replacing `@`.

| Shared mailbox | `su-` group | `sa-` group | `sc-` group |
|---|---|---|---|
| `contact@chemin-neuf.org` | `su-contact@security.chemin-neuf.net` | `sa-contact@security.chemin-neuf.net` | `sc-contact@security.chemin-neuf.net` |
| `contact@chemin-neuf.fr` | `su-contact---chemin-neuf.fr@security.chemin-neuf.net` | `sa-contact---chemin-neuf.fr@security.chemin-neuf.net` | `sc-contact---chemin-neuf.fr@security.chemin-neuf.net` |

`saro-` and `sd-` follow the same pattern. Calendar group naming details are in the
[calendar brainstorm](calendars.md).

Constraints the rule implies:

- **64-character limit** on a group's local part (Google: "no more than 64 characters
  before the at sign"). Compute the length with the **longest prefix (`saro-`, 5
  characters)**, so that `su-`, `sa-`, `sc-` and `saro-` of one mailbox always share the same
  body.
- **`---` is reserved**: no mailbox local part may contain `---`, otherwise names could
  collide.
- **Renames**: when a shared mailbox address changes, exodus renames all its groups (GWS keeps
  the old group address as an alias — to verify).

#### Length fallback (proposed 2026-10-28 — step 2 to fix)

Apply in order until the name fits:

1. Replace `chemin-neuf` with `-ccn-` → `x---chemin-neuf.fr` becomes `x----ccn-.fr`.
2. Replace `-ccn-` with `..` → `x---...fr`. **Invalid as written**: Google rejects
   consecutive periods (and a leading / trailing period) in addresses. Replacement
   string TBD.
3. Shorten the mailbox local part (before `---`), marking the cut with a single `.`.

Remarks:

- Steps 1 and 3 are fine for Google, but limit `chemin-neuf` replacement to the **domain
  part**, so a mailbox local part containing `chemin-neuf` is not altered.
- Step 1 produces `----` (the `---` separator followed by `-ccn-`) — valid, but the name is
  no longer easy to read back. Consider `ccn` (no hyphens) instead of `-ccn-`.
- Step 3 can create **collisions** (two long mailboxes with the same beginning) → exodus
  must check uniqueness and add a discriminator (e.g. a digit) when needed.
- Once shortened, the group name can no longer be derived from the mailbox address →
  store the **full mailbox address in the group description**, and have exodus find
  groups by that link, not by recomputing the name.

### 4.3 Group settings (proposal, 2026-11-12)

Use the same baseline for `su-`, `sa-` and `sc-`; their **memberships and grants** are
separate. The optional `saro-` and existing `sd-` groups are not replaced by this proposal.
The [group-parameter inventory](groups-parameters.md) lists all properties; this table
selects the ones relevant to access groups.

**Defaults or explicit settings?** Set security- and access-relevant properties explicitly,
even when today's tenant default happens to match: defaults and organisation policies may
change. Leave discussion presentation settings at their defaults when they have no effect
on this use case; review them if posting is ever enabled. Verify the resulting settings,
because organisation policy, API constraints and permissions may override or reject them.

**Important: no mail is not automatic.** A security label does not disable email.
Google's [Groups Settings API reference](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups)
describes `archiveOnly=true` as “the group is inactive”: new messages are rejected,
old conversations remain accessible, and `whoCanPostMessage` becomes `NONE_CAN_POST`.
This wording describes Groups Settings; it does **not** establish that the security-group
identity, membership or access grants are disabled. Gemini reports that membership and
Drive, Shared Drive, Calendar and IAM access remain functional, but we have not found a
Google source explicitly confirming these claims or its assertion that archive-only is a
recommended best practice. Gmail delegation was not addressed. This is a plausible
approach, not yet verified: test the relevant grants and membership changes before
production. See the [inventory's evidence note](groups-parameters.md#archive-only-groups-used-for-access-control).
Do not treat moderation or no-delivery subscriptions as equivalent to no posting.

| Parameter | Proposed value / rationale | GAM7 or handling |
|---|---|---|
| Identity | Separate, purpose-specific name and description linking each group to the shared user | Set after creation |
| Security classification | Security group; conversion is irreversible | `makesecuritygroup` after creation |
| Posting and archive-only state | Proposed no-mail pilot: archive-only rejects new messages and sets posting to nobody. Test access grants and membership before production | `archive_only true` (sets `none_can_post`) |
| Web posting | Disabled | `allow_web_posting false` |
| Group conversation history | Disabled for new messages; does not erase old conversations | `is_archived false` |
| Join policy | Invitation only; admins can still directly manage membership | `who_can_join invited_can_join` |
| Voluntary leave | All members may leave voluntarily; consider how authoritative membership sync handles departures | `who_can_leave_group all_members_can_leave` |
| External members | Disabled, subject to organisation policy and nested-member checks | `allow_external_members false`; `who_can_add_external_members` is ignored while this is false |
| Discoverability | Group members only; hiding is not an access boundary | `who_can_discover_group all_members_can_discover` |
| Global address list | Exclude the group; distinct from discoverability | `include_in_global_address_list false` |
| View membership | All members for transparency; revisit large or sensitive groups | `who_can_view_membership all_members_can_view` |
| Manage membership | Owners and managers; grant these roles sparingly, because they can change access | `who_can_moderate_members owners_and_managers` |
| View conversations | Owners and managers, the most restrictive value in Google's current API reference | `who_can_view_group all_managers_can_view` |
| Contact owners | Owners and managers, the most restrictive value in Google's current API reference | `who_can_contact_owner all_managers_can_contact` |
| Post as group | Disabled | `members_can_post_as_the_group false` |
| Message and spam moderation | Moderate all messages; reject spam. Moderation creates an approval path and is not a no-mail control | `message_moderation_level moderate_all_messages`; `spam_moderation_level reject` |
| Collaborative Inbox | Disabled | `enable_collaborative_inbox false` |
| Group language | English (UK) for group-generated messages | `primary_language en-GB` |
| Member delivery | Optional no-delivery preference per member; it does not prevent posting or all system messages | Set per member, not a group default; GAM uses `nomail` |
| Owner | Keep owner roles minimal. Whether zero explicit owner members is supported remains unverified; if required, consider the shared user as owner | Membership role, not a group setting; verify before relying on it |
| Other discussion settings | Leave reply-to, footer, subject prefix, attachment and forum controls at defaults while unused; inspect UI-only controls if needed | Not set by the baseline |
| Membership restrictions | Consider internal users and security groups only, if supported by the tenant edition | Separate Cloud Identity security settings; test before depending on them |

#### GAM7 commands

Example for the shared user `jongeren@chemin-neuf.nl`: first retrieve the account's
name and primary email, then create `su-jongeren---chemin-neuf.nl@security.chemin-neuf.net`.
The commands below configure **only the `su-` group**; `sa-` and `sc-` will need their own
commands. The group name is an example label, not a value automatically derived from the
account's returned name; adjust it after inspecting the first command if needed.

Run each GAM7 command separately, in order, as an authorised administrator with Groups
Settings and Cloud Identity access. Check the output and **stop on any failure**; earlier
changes are not rolled back. Inspect existing groups first, and do not populate or grant
access until the settings and security label have been verified. The archive-only
configuration is a proposal: test it on a disposable group before using it for a real
mailbox, and do not assume the group grants access until delegation has been configured.

```powershell
gam info user jongeren@chemin-neuf.nl

gam create group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net name "E-mail delegation for Jongeren CCN NL" description "All members of this group have the right to read and write e-mail for jongeren@chemin-neuf.nl"
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net makesecuritygroup
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net archive_only true
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net allow_web_posting false
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net is_archived false
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_join invited_can_join
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_leave_group all_members_can_leave
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_add_external_members only_admins_can_add_external_members
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net allow_external_members false
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_discover_group all_members_can_discover
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_view_membership all_members_can_view
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net include_in_global_address_list false
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_moderate_members owners_and_managers
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_view_group all_managers_can_view
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net who_can_contact_owner all_managers_can_contact
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net members_can_post_as_the_group false
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net message_moderation_level moderate_all_messages
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net spam_moderation_level reject
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net enable_collaborative_inbox false
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net primary_language en-GB

gam info group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net
gam info cigroup su-jongeren---chemin-neuf.nl@security.chemin-neuf.net
```

```powershell
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net name "E-mail delegation for Jongeren CCN NL" description "All members of this group have the right to read and write e-mail for jongeren@chemin-neuf.nl" archive_only true allow_web_posting false is_archived false who_can_join invited_can_join who_can_leave_group all_members_can_leave who_can_add_external_members only_admins_can_add_external_members allow_external_members false who_can_discover_group all_members_can_discover who_can_view_membership all_members_can_view include_in_global_address_list false who_can_moderate_members owners_and_managers who_can_view_group all_managers_can_view who_can_contact_owner all_managers_can_contact members_can_post_as_the_group false message_moderation_level moderate_all_messages spam_moderation_level reject enable_collaborative_inbox false primary_language en-GB makesecuritygroup
```

Inspect the output: verify the security label, each explicit setting, owners and membership.
These commands do **not** add members, nest groups, create Gmail or Calendar grants, or
grant contacts access. Confirm the installed GAM7 syntax and test Google-accepted settings
on a disposable group; the API can reject combinations of visibility and member-management
permissions. Do not use `accesstype restricted` as a substitute: its preset permits members
to post and request to join.

After verifying the group, add Bart as a manager, set his group subscription to no email,
and list direct members with their roles, membership status and delivery settings:

```powershell
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net add manager bart.vermeulen@chemin-neuf.org
gam update group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net update delivery nomail bart.vermeulen@chemin-neuf.org
gam print group-members group su-jongeren---chemin-neuf.nl@security.chemin-neuf.net showdeliverysettings
```

Run each command separately and stop on failure. If Bart is already a member, update his
role with `update manager` rather than adding him again. `nomail` changes his group-message
delivery preference, not his role, and does not guarantee that all system notifications
are suppressed. A manager can manage group membership and thereby affect access; this
group membership alone does not create the Gmail delegation grant. The list is for direct
members; expanded nested membership needs a separate check. `showdeliverysettings`
requires an additional API call per member.

#### Calendar access through the `sa-` group

The calendar model and role rationale are in the
[calendar brainstorm](calendars.md#shared-mailbox-calendar---current-direction). After
creating and verifying the mailbox's `sa-` security group, add `su-` as a member of `sa-`
and grant `sa-` writer access to the shared user's primary calendar. This makes the
mailbox delegates in `su-` calendar editors as well; do not grant `owner`.

```powershell
gam update group sa-jongeren---chemin-neuf.nl@security.chemin-neuf.net add member su-jongeren---chemin-neuf.nl@security.chemin-neuf.net
gam user jongeren@chemin-neuf.nl add calendaracls primary writer group:sa-jongeren---chemin-neuf.nl@security.chemin-neuf.net sendnotifications false
gam user jongeren@chemin-neuf.nl show calendaracls primary
```

Run the membership and ACL commands only after confirming the `sa-` group exists and is
the intended security group. Check each command's result; then verify the nested membership
and calendar ACL. `writer` permits reading and editing event details, including private
events. Use the separate `saro-` group with `reader` for read-only access.

#### Gmail delegation to the group

Google supports adding a Google Group as a Gmail delegate when group delegation is
enabled for both the mailbox's OU and each delegate's OU; see 4.4. The following GAM7
command is the documented syntax for creating a delegate, but Google's Gmail API
documentation describes a **user** delegate and does not explicitly establish whether
creating a group delegate through the API is supported. GAM's example for creating a
delegate likewise shows a user. Treat the group-address command as an **unverified
candidate**, not a confirmed implementation; test it against a disposable mailbox and
group before using the real addresses:

```powershell
gam user jongeren@chemin-neuf.nl add delegate su-jongeren---chemin-neuf.nl@security.chemin-neuf.net
gam user jongeren@chemin-neuf.nl show delegates
```

The first line would create one group delegation if accepted; the second inspects the
result. Do not assume a successful command or a listed delegate proves that a group
member can access the mailbox: verify access and removal after propagation, including
the proposed archive-only setting. If the API rejects the group, the documented
alternative is to add the group in the mailbox's Gmail delegation settings; the Admin
console enables the policy but is not itself the documented per-mailbox grant flow.
Do not silently substitute individual delegates: that would change the membership
management model.

Sources: [Google admin delegation settings](https://knowledge.workspace.google.com/admin/gmail/let-users-delegate-access-to-a-gmail-account),
[Gmail API delegate creation](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.settings.delegates/create),
and [GAM7 Gmail delegates](https://github.com/GAM-team/GAM/wiki/Users-Gmail-Delegates).

**No-mail pilot, not production:** on a disposable security group after setting up test
grants, the following sets archive-only; Google describes the group as inactive in the
Groups Settings API and sets posting to `NONE_CAN_POST` automatically. This wording
does not establish whether the group remains usable for access control:

```powershell
gam update group su-pilot@security.chemin-neuf.net archive_only true
gam info group su-pilot@security.chemin-neuf.net
```

Confirm that email is rejected and test existing and new Gmail delegation, Calendar
permissions, nested membership, member add/remove and revocation after propagation. Also
investigate the Google Groups UI's separate **Allow email posting** control: its API
mapping and effect on access are unverified. If neither route provides no-mail groups
without breaking access, choose another explicitly approved control. Re-enabling an
archived group resets posting to managers, so reapply and verify the desired posting policy.

Sources checked 2026-11-12: [Google Groups Settings API](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups),
[GAM7 Groups](https://github.com/GAM-team/GAM/wiki/Groups),
[GAM7 Cloud Identity Groups](https://github.com/GAM-team/GAM/wiki/Cloud-Identity-Groups),
[Google group roles](https://support.google.com/a/users/answer/10385278?hl=en),
and [Google Contacts delegation](https://support.google.com/contacts/answer/2590392?hl=en).

### 4.4 Google constraints to respect

- **Only security groups can join a security group** → `su-` into `sa-` is fine, but an
  existing collaborative / exodus-managed group can only be nested into `su-` / `sa-` if it
  is itself a security group.
- **Membership restrictions** are distinct from invitation-only joining. If available in
  this Workspace edition, configure the restrictions to allow only the intended internal
  user accounts and security groups (and service accounts only where needed), while
  preserving required nesting: `su-` into `sa-` and `sd-`. Check edition availability
  before making this a dependency; the current Google Admin Help edition list does not
  include Workspace for Nonprofits. Restrictions reject future noncompliant additions;
  they do not automatically remove existing members.
- **Group UUID / custom attribute**: the Admin SDK Directory API Group resource does not
  support user-style custom schemas (`customSchemas`). The Cloud Identity Groups API has
  an `externalIds` field for an ID assigned by an external directory/identity provider;
  its only supported namespace is `system/external`, and the caller must keep IDs unique
  within that namespace. This could be evaluated for an exodus UUID, but it is not an
  arbitrary custom attribute, and write support/operational handling must be tested.
  The Directory API's immutable group `id` is another stable identifier; otherwise keep
  an exodus mapping. GAM documents `externalids` among Cloud Identity group fields to
  display, but its Groups guide does not establish a write command for it.
- **Admin setting required — on both sides**: Gmail → User settings → Mail delegation →
  "Allow users to grant their mailbox access to a Google group" must be enabled for the
  OU of the **delegating account** (the shared mailbox) **and** for the OU of **every
  group member** (each person receiving access) — otherwise that member silently gets no
  access (Google admin help, "Let users delegate access to a Gmail account"). With the OU
  model (one personal-user OU + shared-user OU tree), simplest is to enable it on both
  branches, or at the top-level OU.
  - **Checking the setting** (verified 2026-10-28): readable — **not writable** — through
    the **Cloud Identity Policy API**: setting type `gmail.mail_delegation`, field
    `enable_mailbox_group_delegation` (boolean). Changes stay in the Admin console.
    Not exposed by the Gmail API (`users.settings.delegates`) nor the Directory API.
  - **No per-user call**: policies target OUs or groups. To get the effective value for
    one user, list the policies (`policies.list`, scope
    `cloud-identity.policies.readonly`), keep those for the user's OU (and parents) and
    the user's groups, then apply the **Merge** reducer: per field, the value from the
    policy with the highest `sortOrder` that sets it wins. Google default (system)
    policies are part of the list. Group-targeted policies must be considered too.
  - **GAM7** wraps the same API (enable scope `22r`, "Cloud Identity - Policy" read-only,
    via `gam oauth create`), but does not reduce to a per-user value:

    ```powershell
    # All policies for this setting (per OU / group, plus Google defaults)
    gam info policies settings/gmail.mail_delegation formatjson
    # Policies limited to OUs whose path matches a pattern
    gam print policies ou "^/Shared" formatjson
    # OU of a given user, to match against the list above
    gam info user contact@chemin-neuf.org
    ```

    GAM's wiki also asks to grant the GAM project the GCP role *Organization Policy
    Administrator* — broad; possibly only needed for the DLP commands. Test read-only
    first in the test tenant.
  - **Proposed exodus consistency check**: for each shared mailbox and each (expanded)
    `su-` member, verify the effective value is `true` — catches the "member silently
    gets no access" case.
- **Propagation up to 24 h** for delegation and membership changes, including
  **removals** → removing someone from `su-` is not an immediate revocation; urgent cases
  need another lever (e.g. suspend the account).
- **Limits**: 1,000 delegates per mailbox (a group counts as one); ~40 concurrent delegate
  sessions with typical use — a large `su-` group can hit the concurrency limit.
- **Contact delegation is separate from Gmail delegation**: Google's
  [help page](https://support.google.com/contacts/answer/2590392?hl=en) describes
  invitations to individual people in the same domain or organisation, up to 25 names
  per invitation, and does not document a group as a delegate. Do not assume `sc-`
  membership grants access. If per-user delegation is chosen, exodus would need to
  expand `sc-` membership and reconcile both grants and removals; API support and
  operational feasibility remain to be verified.

### 4.5 Benefits

- One delegate entry per mailbox → exodus avoids the slow per-user Gmail API delegation
  calls (see caveats, section 8).
- Audit = group membership; Gmail's delegate list shows only the group.
- Consistent with the existing `sd-` convention.

### 4.6 Open points

1. **Membership management** — HRIS-backed mailboxes: exodus from onesime; GWS-native
   mailboxes: group managers or admins? (mixed ownership, section 2)
2. **Length fallback step 2** — replacement for `-ccn-` (`..` is invalid), and the
   collision discriminator for step 3.
3. **Shared drive ↔ shared user link** — how a shared drive is associated with a shared
   mailbox (the `su-` → `sd-` membership is decided).
4. **Contacts** — confirm `sc-` membership policy, including whether `su-` should be
   nested, and choose per-user delegation synced from `sc-` (API to verify) or Domain
   Shared Contacts instead.
5. **Group-delegation policy check** — adopt the proposed exodus consistency check
   (4.4)? Confirm the minimum permissions needed to read policies (scope only, or also
   the GCP role).
6. **Explicit group owner** — test whether an organization group can be managed with no
   explicit owner member, given that Google states administrators are automatically
   assigned the owner role. If not, confirm the shared-user owner fallback and which
   owner capabilities admins can restrict.
7. **Large-group member visibility** — determine whether groups above 100 members need a
   different roster-visibility policy and confirm whether it can be configured per group.
8. **Group UUID** — test whether exodus can write and reliably read a UUID through the
   Cloud Identity Groups API `externalIds` field; decide between that and an exodus-side
   mapping. This is not a user-style custom schema.
9. **No-mail access groups** — test archive-only against Gmail, Calendar, nesting,
   membership management and revocation before production. Verify other services if
   needed; investigate the separate UI email-posting control as an alternative.
10. **Voluntary leave** — determine how a member leaving voluntarily interacts with
    the authoritative membership and reconciliation policy.

<a id="section-5"></a>

## 5. Candidate page sections

> To be reordered / trimmed / expanded as we brainstorm.

1. **Scope & audience** — who this is for; pointer to exodus repo/doc; glossary
   (onesime, exodus, frat de vie, frat de quartier).
2. **Web console possibilities** — what can be done from the Admin console UI alone,
   with its limits (and what must NOT be done by hand because exodus owns it).
3. **API landscape** — Admin SDK (Directory, Groups Settings, Reports), Gmail API, People API,
   Drive API; what each covers here.
4. **Choices made & rationale** — service account + domain-wide delegation, GAM, no paid
   third-party tools (nonprofit external-tools policy). (see section 6)
5. **exodus: features & implementation** — the feature list (section 2), architecture,
   scheduling, error handling, credentials.
6. **Admin how-to & pitfalls** — what to do / how / what to avoid per object type
   (users, groups, shared mailboxes, shared drives, …).
7. **Limits & quotas** — API rate limits, GWN edition constraints relevant to scripting.
8. **Links** — official Google docs, GAM wiki, related topic pages (9, 10).

<a id="section-6"></a>

## 6. Choices to document (initial list)

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
| Shared mailbox access via security groups | Per-user grants | See the [calendar brainstorm](calendars.md) for the calendar access model; contacts still need a verified grant mechanism |
| Group name = local part on `@chemin-neuf.org`, full address with `---` for `@` otherwise | Always local part; always full address | Short names for the main domain, no collisions across domains |
| `su-` is a member of the linked shared drive's `sd-` group | Separate drive grants | Mailbox team gets the drive automatically; one membership to manage |
| … | … | … |

<a id="section-7"></a>

## 7. Open questions

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
  - [x] Personal users — full-account model described in section 3.1, updated 2026-09-30
    (language sync, homonym & accountType proposals, drift trade-off); remaining
    follow-ups in 3.1.7. Google Group delivery proposed in section 3.2.
  - [ ] Shared users — access groups `su-` / `sa-` / `sc-` proposed (section 4);
    account creation, OU sub-tree and ownership still open  - [ ] Collaborative groups
  - [ ] Aliases
- [ ] Per-feature status (live / planned / idea) in the section 2 table.

**2. NEXT — The mailbox bundle**

- [ ] Contacts mechanism: per-mailbox contact delegation synced from `sc-` vs Domain
  Shared Contacts (Directory API)? Google documents invitations to people, not a group
  delegation mechanism; API support for synchronisation remains open (section 4.4).
- [x] Calendar model and access roles — current direction and follow-up are in the
  [calendar brainstorm](calendars.md).
- [ ] Shared drives: who becomes Manager; in scope now or later? (`su-` is a member of
  the linked drive's `sd-` group — section 4; the mailbox ↔ drive link is TBD.)

**3. PARKED — later topics (do not discuss yet)**

- [ ] Offboarding lifecycle — big topic, parked until creation/onboarding is settled.
- [ ] Reconciliation policy per object: auto-revert vs alert-and-wait; manual-override
  mechanism. Parked (reconciliation is a *required feature*, its policy comes later).
- [ ] Change management: who may modify exodus; how changes are announced.

<a id="section-8"></a>

## 8. Caveats & blind spots register

> Raised during the 2026-09-22 session; to be discussed, then moved into the relevant
> page sections.

### Caveats (to document on the page)

- **Delegation grants are per-user Gmail API operations** — at scale (delegates ×
  mailboxes) this is the slowest part of any sync and the first to hit quota.
  Largely mitigated by delegating to the `su-` group (one grant per mailbox, section 4).
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

<a id="section-9"></a>

## 9. Transfer checklist (MD → HTML)

- [ ] One `<section class="section">` per retained section, with a stable `id`
- [ ] Sidebar nav is auto-generated by `js/site-nav.js` — no manual links needed
- [ ] Tables inside `.table-wrap`; code snippets as `<code class="block">` (see topic 10)
- [ ] Update hero pill `Status: Draft` → `Written`, refresh the `Last updated` date
- [ ] Update `README.md` structure table (drop the "draft" mention, drop the MD row)
- [ ] **Delete this Markdown file** — afterwards, updates happen in the HTML only
