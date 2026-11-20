<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Original Author: Copilot (model not exposed)
  Major Contributors: Copilot (model not exposed)
  Model check on 2026-11-20: gpt-6.1-terra (check request only; earlier edits unverified)
  Last Updated: 2026-11-20
-->

# Brainstorm - Google Workspace calendars

Working notes on Google Workspace calendars for all users, including personal, functional
account and shared mailbox calendars. This file brings together settings, current
directions, their rationale, and questions and operational details that still need to be
tested or decided. The technical overview links here for calendar details.

Calendar sharing is feature 7 in the exodus contract. Its direction is mixed and its
status (live / planned / idea) remains to be confirmed.

## Google Calendar Admin console settings

The following are the reported default settings for the organisation, recorded
2026-11-19. These are configuration values, not necessarily Google's product defaults.

- **Service status:** On.
  - Discuss which types of users or functional accounts, if any, should have Calendar
    disabled.

### Sharing settings

- **Working location:** On.
  - Discuss whether working location is meaningful for a shared calendar representing
    a team rather than an individual.
- **External sharing options for primary calendars:** Share all information, but
  outsiders cannot change calendars.
  - This permits sharing event details with external people, for example when a mission
    or a house wants to share events with a wider audience. As a precaution, the
    organisation's baseline does not allow external people to edit primary calendars.
  - This is a maximum permitted level, not an automatic external grant. An individual
    calendar or event cannot exceed the effective limit. An OU or configuration group
    may override the baseline for its users. Specific external sharing still needs to
    be granted; non-private event details may then be exposed.
  - If a specific use requires external editing in future, consider an exception group
    such as `sa-allow-external-write@security.chemin-neuf.net` for the relevant
    calendar owners. This is an idea, not an existing group. Alternatively, use a
    secondary calendar and grant the external person edit access to that calendar.
- **Internal sharing options for primary calendars:** Only free/busy information
  (hide event details).
  - The reported Google default of sharing all details internally is considered too
    broad; free/busy is an acceptable baseline. Individual and shared account calendars
    can be configured to share more or less internally.
  - This is a default, not an enforced ceiling: customised calendar sharing may differ.
    For functional accounts, reconcile that flexibility with the current direction
    that administrator / exodus controls the calendar ACLs.
- **Video conferencing - Make Google Meet the default video conferencing provider
  when available:** On.
  - Users can adjust conferencing preferences.
- **Video conferencing - Automatically add video conferencing to events users
  create:** On.
  - A Meet link is automatically added when the first guest is added, but not when an
    event is copied or duplicated. Consider whether unnecessary links on in-person
    events cause confusion.
- **External invitations - Warn users when inviting guests outside of the domain
  Communauté du Chemin Neuf:** On.
  - This is a warning, not a block.
- **Working hours:** On.
  - Discuss whether a functional account should have team coverage hours, no configured
    hours, or another approach.
  - Consider distributed teams and time zones.

### General settings

> **Important:** There are no organisational unit or group overrides for these settings.

- **External sharing options for secondary calendars:** Share all information, and
  outsiders can change calendars.
  - This is an intentional balance: primary calendars are protected from external
    editing by default, while users can grant outsiders edit access to secondary
    calendars when needed. This is the maximum sharing level allowed organisation-wide;
    it does not mean that all secondary calendars are shared with external users.
    External access must be granted separately.
  - There is no OU or group override for these general settings, so flexibility and
    security must be balanced across the organisation. External editors can see
    private event details, edit events, and restore or permanently delete events from
    trash. Consider approval, periodic access review and an inventory of external
    grants.
- **Internal sharing options for secondary calendars:** Only free/busy information
  (hide event details).
  - This is a default: sharing can be configured higher or lower for an individual
    calendar.
- **Resource booking permissions - Allow users to book resources that are shared
  as "See only free/busy":** On.
  - This allows privacy-preserving resource booking.

### Advanced settings

- **Add invitations to Calendar:** Invitations from known senders.
- **Set the default value:** Invitations from known senders.
  - The rationale is to reduce the small but non-zero risk of malicious or spam
    invitations appearing automatically. Known senders include contacts, people in
    the organisation and people previously interacted with; they need not all be
    added as contacts. Known does not necessarily mean trusted.
  - The expected inconvenience is small: invitations from unknown senders still arrive
    by email and appear on the calendar after acceptance, and most invitations are
    expected to come from known senders. A shared mailbox team must nevertheless
    monitor those emails: a sender known to a delegate may not be known to the
    functional account.
- **Time insights:** On.
- **Calendar web offline:** On.
  - This is expected to be rarely used but valuable when needed. The working
    assessment is that use is mostly on personal devices and the risk of leaking
    relatively low-sensitivity calendar data is small.
  - The setting permits users to enable offline access; it does not automatically
    enable it on every browser.
  - Offline web Calendar does not support creating or editing events.
- **Default event duration:** 60 minutes.
  - Discuss whether an hour encourages unnecessarily long meetings or leaves too
    little transition time. It is a default, not a limit.
- **Appointment schedules with payments:** Off.

## Shared mailbox calendar - current direction

- Use the functional account's primary calendar, rather than a separate shared calendar or
  a calendar resource (decided 2026-10-28).
- Grant one `writer` ACL to the mailbox's `sa-` security group and one `reader` ACL to its
  `saro-` group on the same calendar. The reader role is "See all event details". Never
  grant `owner`.
- Keep calendar ACLs under administrator / exodus control. Routine access changes should
  happen through group membership, not individual ACL edits.
- Nest the mailbox's `su-` group in `sa-`: mailbox access then includes calendar edit
  access. Calendar-only access remains possible through direct membership in `sa-`.
- A person with effective membership in both `sa-` and `saro-` gets the higher role,
  `writer`.

## Shared mailbox calendar - group model and rationale

- `sa-` means **shared agenda** ("agenda" rather than "address book", to distinguish
  calendars from contacts). It grants `writer` access and can contain `su-` plus
  calendar-only editors.
- `saro-` means **shared agenda read-only**. It grants `reader` access to read-only
  calendar users.
- Keep separate groups even when their memberships happen to match: access changes then
  remain group-membership changes, with no per-calendar ACL edits.
- Do not use `owner`: members may edit or read events but cannot manage calendar sharing.
  The ACLs are configured once and stay under administrator / exodus control, avoiding
  calendar ACL drift.
- Group names follow the shared mailbox naming rule in
  [technical.md](technical.md#section-4): use the mailbox local part
  for `@chemin-neuf.org`; for other domains use the full address with `---` replacing `@`.
  For example, `sa-contact@security.chemin-neuf.net` and
  `saro-contact@security.chemin-neuf.net` correspond to `contact@chemin-neuf.org`.

The original alternatives were per-user calendar ACLs and separate shared calendars or
calendar resources. The current proposal uses the functional account's primary calendar
with group grants, rather than either alternative.

## Questions to resolve

### Calendar ownership and lifecycle

- A primary calendar is tied to its account and is retained for the account's lifetime;
  its events can be cleared, but the primary calendar itself cannot be deleted separately.
- What should happen when a mailbox changes purpose, owner, or address?
- Should an account with no need for a team calendar still receive the same mailbox-calendar
  setup?
- When a functional account is deleted or converted, what happens to its events and calendar
  ACLs?
- For user decommissioning, should future events be cancelled before deleting the user,
  or transferred when they need to continue? How should guests, recurring events and
  booked resources be handled, including when a user is suspended rather than deleted?
- What should happen to the user's secondary calendars and their events? Google's
  decommissioning guidance says that secondary calendars are deleted with their owner
  and must be transferred before deletion if they are to be retained. Verify the
  applicable transfer limitations and process before acting.

### Access and privacy

- Is `reader` ("See all event details") the right default for every read-only participant,
  given that internal users already have free/busy access by default? Consider whether
  any use case requires a separate free/busy-only grant, for example when default
  internal sharing has been restricted or access is external.
- The current direction needs no additional group roles beyond `writer` and `reader`.
  One possible exception to discuss is Google's `writerWithoutPrivateAccess` role,
  which permits editing non-private events while showing private events as free/busy.
  Add a separate role or group only if there is a concrete need and its availability
  and group ACL behaviour have been verified.
- Can there be calendar-only editors and readers, and how should they be distinguished from
  mailbox users in the group naming and membership process?
- How should sensitive events be handled when `writer` members can see and edit even
  private events? Examples include an individual's pastoral appointment, a confidential
  personnel discussion or a meeting involving a vulnerable person. Options to discuss
  include keeping sensitive details on a more restricted calendar or considering
  `writerWithoutPrivateAccess`; marking an event private alone does not hide it from
  ordinary writers.
- External participants may be added to access groups for legitimate cases, subject
  to the effective sharing limit. For example, members of a "frat de quartier" may not
  have a full Google Workspace user account. If an individual needs more access, the
  personal group can be converted to a full account. Define the approval process and
  test the effective access of external members, especially because the primary
  calendar baseline does not allow external writing.

### Provisioning and operations

- Which system creates the calendar ACLs, and at what point in mailbox provisioning?
- Is ACL creation idempotent and recoverable after a partial provisioning failure?
- How will exodus verify that the expected `sa-` and `saro-` ACLs exist without treating
  administrator-owned ACLs as an invitation to rewrite every unexpected entry?
- What is the approved process for an administrator to grant temporary calendar access?
- What checks are needed when removing a member from a nested group, including access
  propagation delay and stale membership?
- How should calendar access be audited, and which events should trigger an alert?

### User experience and testing

- How should users find and add the shared calendar in Google Calendar on web and mobile?
- What should the onboarding instructions say about calendar visibility, editing, and event
  invitations?
- Test editor, reader, calendar-only, mailbox-plus-calendar, and removed-member scenarios.
- Confirm what a reader can see for private events, event attachments, and guest lists.
- Test event creation, modification, cancellation, invitations, and notifications when a
  user acts from the shared calendar.
- Verify that removing group membership removes effective access and document any delay.

## Decisions to record

Before calling the calendar setup operationally complete, record:

- The supported calendar type and its lifecycle.
- The supported access roles and any policy for external users or private events.
- The provisioning owner, reconciliation behavior, and recovery procedure.
- The user onboarding steps and a repeatable access test checklist.

## Related notes

- [Technical overview brainstorm](technical.md), especially section 4 on shared
  mailbox access groups and the exodus feature list.
- [Google Groups settings reference](groups-parameters.md) for the adjacent group
  configuration inventory.
- [Google: Calendar sharing options](https://knowledge.workspace.google.com/admin/calendar/set-google-calendar-sharing-options)
  and [resource calendar sharing](https://support.google.com/a/answer/1034381).
- [Google: Calendar API sharing roles](https://developers.google.com/workspace/calendar/api/concepts/sharing)
  and [delete or unsubscribe from a calendar](https://support.google.com/calendar/answer/37188).
- [Google: Calendar video conferencing settings](https://knowledge.workspace.google.com/admin/calendar/control-video-conferencing-for-google-calendar-events-for-admins).
- [Google: Manage invitations](https://support.google.com/calendar/answer/13159188)
  and [known sender invitation behaviour](https://workspaceupdates.googleblog.com/2022/07/invitations-from-known-senders-only-google-calendar.html).
- [Google: Use Calendar offline](https://support.google.com/calendar/answer/1340696)
  and [paid appointment schedules](https://support.google.com/a/answer/13765946).
- [Google: Cancel or transfer events and secondary calendars before deleting a user](https://support.google.com/a/answer/7400733).
