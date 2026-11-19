<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Original Author: Copilot (model not exposed)
  Last Updated: 2026-11-19
-->

# Brainstorm - Shared mailbox calendars

Working notes on the calendar that accompanies a shared mailbox. The technical overview
links here for calendar details. This file brings together the current decisions, their
rationale, and the questions and operational details that still need to be tested or
decided.

Calendar sharing is feature 7 in the exodus contract. Its direction is mixed and its
status (live / planned / idea) remains to be confirmed.

## Current direction

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

## Group model and rationale

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

- Is the primary calendar always retained for the lifetime of the functional account?
- What should happen when a mailbox changes purpose, owner, or address?
- Should an account with no need for a team calendar still receive the same mailbox-calendar
  setup?
- When a functional account is deleted or converted, what happens to its events and calendar
  ACLs?

### Access and privacy

- Is `reader` ("See all event details") the right default for every read-only participant,
  or is there a use case for free/busy-only access?
- Which roles should be available beyond the current `writer` and `reader` groups, if any?
- Can there be calendar-only editors and readers, and how should they be distinguished from
  mailbox users in the group naming and membership process?
- How should sensitive event details be handled when all `writer` members can edit events?
- Should external participants ever be added to these access groups, or should calendar
  sharing remain internal-only?

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
