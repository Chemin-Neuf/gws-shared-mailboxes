<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Original Author: ChatGPT (OpenAI, personal free edition)
  Major Contributors: GPT-6 Luna, GPT-6.1 Terra (OpenAI / GitHub Copilot)
  Last Updated: 2026-11-11
-->

# Google Workspace Groups — API and GAM configuration reference

This document is a neutral, exhaustive inventory of the settings and properties that Google Workspace exposes for Google Groups through its APIs, with the matching GAM7 commands (GAM7 is the GAM version used throughout). It is a reference, not a set of recommendations: it is meant to be used later as the basis for choosing recommended configurations for shared-mailbox groups.

**Scope:** Google Workspace Groups Settings API v1, Admin SDK Directory API `groups` resource, Cloud Identity Groups API v1 group metadata, and GAM7 command mapping.

## Contents

- [1. API overview](#1-api-overview)
  - [Group types and modes](#group-types-and-modes)
- [2. Groups Settings API — complete documented property inventory](#2-groups-settings-api--complete-documented-property-inventory)
  - [API vs GAM naming](#api-vs-gam-naming)
  - [Current and non-deprecated properties](#current-and-non-deprecated-properties)
  - [Legacy and deprecated properties](#legacy-and-deprecated-properties)
  - [Groups Settings API methods](#groups-settings-api-methods)
- [3. Admin SDK Directory API — Group resource](#3-admin-sdk-directory-api--group-resource)
  - [Directory API group methods](#directory-api-group-methods)
- [4. Cloud Identity Groups API — group classification and metadata](#4-cloud-identity-groups-api--group-classification-and-metadata)
  - [EntityKey](#entitykey)
  - [Security settings](#security-settings)
  - [Cloud Identity Groups API methods](#cloud-identity-groups-api-methods)
- [5. Google Groups UI settings vs Groups Settings API properties](#5-google-groups-ui-settings-vs-groups-settings-api-properties)
  - [UI settings that map to an API property](#ui-settings-that-map-to-an-api-property)
  - [UI settings with no Groups Settings API property](#ui-settings-with-no-groups-settings-api-property)
  - [API properties with no entry in the UI mapping](#api-properties-with-no-entry-in-the-ui-mapping)
  - [Organisation-wide Groups for Business sharing settings](#organisation-wide-groups-for-business-sharing-settings)
- [6. Member-level settings — separate from group-level settings](#6-member-level-settings--separate-from-group-level-settings)
  - [Directory API — Member resource](#directory-api--member-resource)
  - [Cloud Identity Groups API — Membership resource](#cloud-identity-groups-api--membership-resource)
  - [Cloud Identity Groups API — membership methods](#cloud-identity-groups-api--membership-methods)
- [7. GAM commands for inventory, export, backup and changes](#7-gam-commands-for-inventory-export-backup-and-changes)
  - [Inventory and export](#inventory-and-export)
  - [Inspect one group](#inspect-one-group)
  - [Inventory of members and classification](#inventory-of-members-and-classification)
  - [JSON backup of settings](#json-backup-of-settings)
  - [Update examples](#update-examples)
  - [Member management examples](#member-management-examples)
- [8. Practical interpretation / cautions](#8-practical-interpretation--cautions)
  - [Interaction rules between settings](#interaction-rules-between-settings)
  - [General cautions](#general-cautions)
- [9. Official and community references](#9-official-and-community-references)

> **Important scope note:** “All group settings” is not one API. The Groups Settings API covers email/discussion permissions and behaviour. The Directory API covers the directory group object and membership. Cloud Identity Groups API covers group classification, dynamic groups, and security-group metadata. Some Google Groups UI controls are not exposed by any of these group-level APIs. Member-specific subscription/delivery settings are also separate from group-level settings.

## 1. API overview

A Google Group is described by three complementary APIs: the Groups Settings API covers its behaviour (posting, visibility, moderation), the Directory API covers its identity and membership, and the Cloud Identity Groups API covers its classification (security, dynamic, locked) and external identifiers. GAM7 wraps all three.

| API / resource | What it manages | Main methods / endpoint | GAM commands / coverage |
|---|---|---|---|
| Groups Settings API v1 — `groups` | Email posting, visibility, membership access, moderation, archive, replies, footer, Collaborative Inbox and legacy forum settings | `GET/PUT/PATCH https://www.googleapis.com/groups/v1/groups/{groupUniqueId}` (the group email address) | **Commands:**<br>`gam info group <groupEmail>`<br>`gam print groups settings`<br>`gam update group <groupEmail> <attribute> <value>`<br>**Coverage:** inspect and update group settings |
| Admin SDK Directory API v1 — `groups` | Group email/name/description, aliases, identifiers and direct member count | `GET/POST/PATCH/PUT/DELETE https://admin.googleapis.com/admin/directory/v1/groups[/{groupKey}]` | **Commands:**<br>`gam print groups`<br>`gam info group <groupEmail>`<br>`gam create group <groupEmail> name <groupName>`<br>`gam update group <groupEmail> <attribute> <value>`<br>`gam delete group <groupEmail>`<br>**Coverage:** group inventory and lifecycle |
| Admin SDK Directory API — `groups.aliases` | Add/list/remove aliases | `GET/POST https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/aliases`; <BR> `DELETE https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/aliases/{alias}` | **Commands:**<br>`gam create alias <aliasEmail> group <groupEmail>`<br>`gam remove alias <groupEmail> group <aliasEmail>`<br>`gam delete alias group <aliasEmail>`<br>`gam info group <groupEmail>`<br>**Coverage:** create, remove and inspect group aliases |
| Admin SDK Directory API — `groups.members` | Membership, role and member delivery preference | `GET/POST https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/members`; <BR> `GET/PATCH/PUT/DELETE https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/members/{memberKey}`; <BR> `GET https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/hasMember/{memberKey}` | **Commands:**<br>`gam update group <groupEmail> add member <memberEmail>`<br>`gam update group <groupEmail> add manager <memberEmail>`<br>`gam update group <groupEmail> update member <delivery-option> <memberEmail>`<br>**Coverage:** membership roles and individual delivery settings |
| Cloud Identity Groups API v1 — `groups` | Group classification labels (security, dynamic, locked), dynamic group queries, external identifiers and resource hierarchy | `POST https://cloudidentity.googleapis.com/v1/groups`; <BR> `GET/PATCH/DELETE https://cloudidentity.googleapis.com/v1/groups/{groupId}`; <BR> `GET https://cloudidentity.googleapis.com/v1/groups` (list); <BR> `GET https://cloudidentity.googleapis.com/v1/groups:lookup`; <BR> `GET https://cloudidentity.googleapis.com/v1/groups:search` | **Commands:**<br>`gam create cigroup <groupEmail> [security] [locked] [dynamic <query>]`<br>`gam update cigroup <groupEmail> [security] [locked\|unlocked] [dynamic <query>]`<br>`gam update group <groupEmail> makesecuritygroup`<br>`gam info cigroup <groupEmail>`<br>`gam print cigroups`<br>`gam delete cigroup <groupEmail>`<br>**Coverage:** security-group labeling is irreversible; dynamic and locked groups are managed with the `cigroup` commands |
| Cloud Identity Groups API v1 — `groups.memberships` | Membership of Cloud Identity groups: roles, expiry details and delivery setting | `https://cloudidentity.googleapis.com/v1/groups/{groupId}/memberships[/{membershipId}]` | **Commands:**<br>`gam update cigroup <groupEmail> add\|delete\|update\|sync …`<br>`gam info cimember <user> <groupEmail>`<br>`gam print cigroup-members`<br>**Coverage:** membership of Cloud Identity groups, separate from the Directory API `groups.members` resource |

### Group types and modes

> **Collaborative Inbox is a mode, not a group type.** It is a standard Google Group with `enableCollaborativeInbox=true`; it is not a separate Directory API resource type.

| Group type / mode | Groups Settings API | Directory API | Cloud Identity Groups API | Notes |
|---|---|---|---|---|
| Standard Google Group (mailing list / discussion forum) | Yes | Yes | `groups.discussion_forum` label (the default label of every Google Group) | Typical email-enabled group. Discussion/forum features and topic permissions may be relevant. |
| Collaborative Inbox | Yes | Yes | Same `groups.discussion_forum` label | Mode of a Google Group, enabled with `enableCollaborativeInbox=true`. |
| Security group | Not the defining mechanism | Remains a Google Group (the security label is added to an existing Google Group) | Additional `groups.security` label | Security classification is separate from email posting permissions. |
| Dynamic group | Not the defining mechanism | | `groups.dynamic` plus `dynamicGroupMetadata` | Membership is query-driven. |
| Identity-mapped external group | No ordinary Google Groups settings assumption | Not an ordinary Workspace group | `system/groups/external` label | Cloud Identity / Cloud Search identity-mapping scenario. |

**Locked** is a state, not a type: a Google Group becomes locked when the `groups.locked` label is added, and unlocked when it is removed (see [section 4](#4-cloud-identity-groups-api--group-classification-and-metadata)).

## 2. Groups Settings API — complete documented property inventory

### API vs GAM naming

- The **API property** column below uses the exact JSON property spelling (camelCase).
- GAM7 keywords are **case-insensitive and ignore underscores** (checked on GAM 7.48.22): `whoCanPostMessage`, `who_can_post_message` and `whocanpostmessage` are equivalent, and so are values such as `ALL_MEMBERS_CAN_POST` and `allmemberscanpost`. The GAM7 wiki writes keywords in lowercase without underscores; this document uses snake_case in the GAM column for readability. A few attributes have extra aliases (for example `collaborative`, `gal`). Check the installed build with `gam help update group` and `gam help print groups`.
- **GAM note:** GAM7 accepts a few values that Google's reference does not list: `ALL_OWNERS_CAN_VIEW` (`whoCanViewGroup`, `whoCanViewMembership`), `ALL_OWNERS_CAN_CONTACT` (`whoCanContactOwner`), `ALL_OWNERS_CAN_LEAVE` (`whoCanLeaveGroup`), `FIXED_WIDTH_FONT` (`messageDisplayFont`) and the shorthand `self` for `defaultSender=DEFAULT_SELF`. The tables below list only the values from Google's reference.
- GAM also has keywords that are not API properties: `accesstype public|team|announcementonly|restricted` (a preset of several settings), `copyfrom <group>` and `json …`.
- Do not assume a property is writable just because it appears in a GET response. Some properties are deprecated, read-only, ignored on update, or have conditions.
- The Groups Settings API represents several boolean values as strings in its resource schema; use `true` / `false` as shown by Google and GAM.
- A GAM attribute being absent from an example is not proof that the API property is unsupported by GAM.

The table includes the current settings, legacy/deprecated properties still present in Google's resource schema, and the resource metadata fields returned by the Groups Settings API. “All Google Groups” means a standard Google Group and its Collaborative Inbox variant; it does **not** imply every setting is meaningful in every UI mode. Forum/topic-specific legacy controls are marked accordingly. The **Applicability** column is this document's own interpretation of Google's descriptions; it is not a field of the API.

### Current and non-deprecated properties

| API property | GAM attribute / practical spelling | Human-readable setting | Allowed values / format | Applicability | Description / notes |
|---|---|---|---|---|---|
| `allowExternalMembers` | `allowexternalmembers` | Allow external members | `true`; `false` | All | Allows or blocks members outside the Workspace organisation. Google notes these are Workspace users external to the organisation; broader external posting is separately controlled. |
| `allowWebPosting` | `allow_web_posting` | Allow posting on the web | `true`; `false` | Groups with Google Groups web interface | Enables members to post through the Google Groups web interface. If false, members use email/Gmail to communicate with the group. |
| `archiveOnly` | `archive_only` | Archive-only / deactivate group | `true`; `false` | All | When true, group becomes inactive and new messages are rejected; old conversations remain browsable/searchable. Google sets `whoCanPostMessage=NONE_CAN_POST`. Turning it off resets posting permission to `ALL_MANAGERS_CAN_POST`. |
| `customFooterText` | `custom_footer_text` | Custom footer text | Text; max 1,000 characters | All | Text appended as the custom footer when enabled. |
| `customReplyTo` | `custom_reply_to` | Custom reply-to address | Email address | All, conditional | Required when `replyTo=REPLY_TO_CUSTOM`; otherwise not used. Google describes this as an address defined by an account administrator. |
| `customRolesEnabledForSettingsToBeMerged` | Read-only; no update | Custom roles included in merged settings | `true`; `false` | Groups with custom roles / merged moderation settings | Read-only. Google ignores UPDATE/PATCH attempts. |
| `defaultMessageDenyNotificationText` | `default_message_deny_notification_text` | Rejection notification text | Text; max 10,000 characters | All, conditional | Custom text for rejection notifications. Requires `sendMessageDenyNotification=true`. Empty by default. |
| `defaultSender` | `default_sender` | Default sender identity | `DEFAULT_SELF`; `GROUP` | Groups where members can post as the group | Determines whether the default sender is the individual user or the group when posting as the group. |
| `description` | `description` | Group description | Text; max 4,096 characters | All | Description of the group's purpose. Can be an empty string. |
| `email` | `email` | Group email address | Email address | All | Primary group address. Change through Directory API / GAM group update, not the Groups Settings API. Only a group owner, not a manager, can change the address. |
| `enableCollaborativeInbox` | `enablecollaborativeinbox` / `collaborative` | Collaborative Inbox | `true`; `false` | Standard Google Group; enables Collaborative Inbox mode | Turns Collaborative Inbox functionality on/off for the group. See [Group types and modes](#group-types-and-modes). |
| `favoriteRepliesOnTop` | `favorite_replies_on_top` | Show favourite replies at top | `true`; `false` | Forum / Collaborative Inbox topic workflow | Controls whether favourite replies are displayed above other replies. Not explicitly marked deprecated in the current resource description. |
| `includeCustomFooter` | `include_custom_footer` | Include custom footer | `true`; `false` | All | Enables/disables the custom footer on group messages. |
| `includeInGlobalAddressList` | `include_in_global_address_list` / `gal` | Include in Global Address List (GAL) | `true`; `false` | All | Controls whether the group is included in the Workspace Global Address List. |
| `isArchived` | `is_archived` | Conversation history / archive messages | `true`; `false` | All | When true, archive messages sent to the group. When false, new messages are not archived; previously archived messages remain. This is not the same as archiving/deactivating the group. |
| `kind` | Output only | Resource kind | `groupsSettings#groups` | All | Identifies a Groups Settings API resource. Read-only. |
| `membersCanPostAsTheGroup` | `members_can_post_as_the_group` | Allow members to post as the group | `true`; `false` | All; relevant when members can post | Allows members to send messages using the group's address rather than their own. When true, per-user/new-member message moderation does not apply to messages posted as the group. |
| `messageModerationLevel` | `message_moderation_level` | Message moderation | `MODERATE_ALL_MESSAGES`; `MODERATE_NON_MEMBERS`; `MODERATE_NEW_MEMBERS`; `MODERATE_NONE` | All | Determines which incoming messages require moderator approval. Moderation of posts made as the group is treated differently: individual/new-member moderation does not apply to those posts. |
| `name` | `name` | Group name | Text; max 75 characters | All | Display name of the group. |
| `primaryLanguage` | `primary_language` | Primary group language | Supported language tag, e.g. `en`, `fr`, `nl`, `en-GB` | All | Language used for group-generated text. Case-sensitive; use one of Google's documented supported codes. |
| `replyTo` | `reply_to` | Default reply destination | `REPLY_TO_CUSTOM`; `REPLY_TO_SENDER`; `REPLY_TO_LIST`; `REPLY_TO_OWNER`; `REPLY_TO_IGNORE`; `REPLY_TO_MANAGERS` | All | Controls the default recipient when a user replies to a group message. `REPLY_TO_OWNER` means owners, not managers; `REPLY_TO_MANAGERS` includes managers and owners. |
| `sendMessageDenyNotification` | `send_message_deny_notification` | Notify sender when a message is rejected | `true`; `false` | All | Sends or suppresses a rejection notification to the author when a message is denied by group owners/moderators. |
| `spamModerationLevel` | `spam_moderation_level` | Spam moderation | `ALLOW`; `MODERATE`; `SILENTLY_MODERATE`; `REJECT` | All | Determines what happens to messages Google classifies as spam: allow, queue for moderation (with or without notification), or reject. Google documents `MODERATE` as the default. |
| `whoCanAddExternalMembers` | `who_can_add_external_members` | Who can add external members | `ONLY_ADMINS_CAN_ADD_EXTERNAL_MEMBERS`; `END_USERS_CAN_ADD_EXTERNAL_MEMBERS` | All, when external membership is enabled | Controls whether only administrators or end users can add external members. Updates are ignored when `allowExternalMembers=false`. |
| `whoCanAssistContent` | `who_can_assist_content` | Who can moderate metadata | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Current; Collaborative Inbox / forum workflows | Current consolidated permission for topic assignments, tags, duplicate status, response status and favourite replies. |
| `whoCanContactOwner` | `who_can_contact_owner` | Who can contact group owners | `ALL_IN_DOMAIN_CAN_CONTACT`; `ALL_MANAGERS_CAN_CONTACT`; `ALL_MEMBERS_CAN_CONTACT`; `ANYONE_CAN_CONTACT` | All | Controls who can use the contact-owner function. |
| `whoCanDiscoverGroup` | `who_can_discover_group` | Who can discover the group | `ANYONE_CAN_DISCOVER`; `ALL_IN_DOMAIN_CAN_DISCOVER`; `ALL_MEMBERS_CAN_DISCOVER` | All | Controls discoverability in Google Groups. It is distinct from viewing messages and viewing membership. |
| `whoCanJoin` | `who_can_join` | Who can join the group | `ANYONE_CAN_JOIN`; `ALL_IN_DOMAIN_CAN_JOIN`; `INVITED_CAN_JOIN`; `CAN_REQUEST_TO_JOIN` | All | Controls whether anyone, anyone in the Workspace domain, invitees only, or requesters can join. External membership is additionally constrained by `allowExternalMembers` and domain policy. Google warns that `ANYONE_CAN_JOIN` lets any internet user, inside or outside the domain, join. |
| `whoCanLeaveGroup` | `who_can_leave_group` | Who can leave the group | `ALL_MEMBERS_CAN_LEAVE`; `ALL_MANAGERS_CAN_LEAVE`; `NONE_CAN_LEAVE` | All | Controls whether members/managers can leave voluntarily. Owners/managers semantics should be tested against the current group role model. |
| `whoCanModerateContent` | `who_can_moderate_content` | Who can moderate content | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Current; discussion/content workflows | Current consolidated permission for content moderation. Supersedes legacy message approval, delete, lock, move, announcement, abuse and sticky-topic controls. |
| `whoCanModerateMembers` | `who_can_moderate_members` | Who can moderate/manage members | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Current; all applicable Groups | Current consolidated permission for member management. Supersedes legacy invite/add/approve/ban/modify controls. |
| `whoCanPostMessage` | `who_can_post_message` | Who can post messages | `NONE_CAN_POST`; `ALL_MANAGERS_CAN_POST`; `ALL_MEMBERS_CAN_POST`; `ALL_OWNERS_CAN_POST`; `ALL_IN_DOMAIN_CAN_POST`; `ANYONE_CAN_POST` | All | Controls who may send messages to the group. `NONE_CAN_POST` requires archive-only/inactive state. Google recommends `MODERATE_NON_MEMBERS` when `ANYONE_CAN_POST` is used. |
| `whoCanViewGroup` | `who_can_view_group` | Who can view conversations | `ANYONE_CAN_VIEW`; `ALL_IN_DOMAIN_CAN_VIEW`; `ALL_MEMBERS_CAN_VIEW`; `ALL_MANAGERS_CAN_VIEW` | All | Controls who can read group messages/conversations. Do not confuse with discoverability or member-list visibility. |
| `whoCanViewMembership` | `who_can_view_membership` | Who can view group members | `ALL_IN_DOMAIN_CAN_VIEW`; `ALL_MEMBERS_CAN_VIEW`; `ALL_MANAGERS_CAN_VIEW` | All | Controls visibility of the membership list. This is separate from permission to read conversations. |

### Legacy and deprecated properties

These properties are still present in Google's resource schema and are kept here for completeness and audit compatibility. For every property below, the GAM attribute is the same name written in snake_case (for example `whoCanAddReferences` becomes `who_can_add_references`; GAM ignores case and underscores). New configurations should use the replacement property.

**Merged into a current property**

| Replaced by | Deprecated API properties | Allowed values | Notes |
|---|---|---|---|
| `whoCanDiscoverGroup` | `showInGroupDirectory` | `true`; `false` | Legacy "Show in Groups directory". |
| `whoCanModerateMembers` | `whoCanAdd` | `ALL_MEMBERS_CAN_ADD`; `ALL_MANAGERS_CAN_ADD`; `ALL_OWNERS_CAN_ADD`; `NONE_CAN_ADD` | Who can directly add members. |
| `whoCanModerateMembers` | `whoCanInvite` | `ALL_MEMBERS_CAN_INVITE`; `ALL_MANAGERS_CAN_INVITE`; `ALL_OWNERS_CAN_INVITE`; `NONE_CAN_INVITE` | Who can invite members. |
| `whoCanModerateMembers` | `whoCanApproveMembers` | `ALL_MEMBERS_CAN_APPROVE`; `ALL_MANAGERS_CAN_APPROVE`; `ALL_OWNERS_CAN_APPROVE`; `NONE_CAN_APPROVE` | Who can approve membership requests. |
| `whoCanModerateMembers` | `whoCanBanUsers`<br>`whoCanModifyMembers` | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Who can ban/deny users; who can modify member roles. |
| `whoCanModerateContent` | `whoCanApproveMessages`<br>`whoCanDeleteAnyPost`<br>`whoCanDeleteTopics`<br>`whoCanHideAbuse`<br>`whoCanLockTopics`<br>`whoCanMakeTopicsSticky`<br>`whoCanMoveTopicsIn`<br>`whoCanMoveTopicsOut`<br>`whoCanPostAnnouncements` | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy content moderation / forum permissions. Authors can always delete their own posts. |
| `whoCanAssistContent` | `whoCanAssignTopics`<br>`whoCanEnterFreeFormTags`<br>`whoCanMarkDuplicate`<br>`whoCanMarkFavoriteReplyOnAnyTopic`<br>`whoCanMarkFavoriteReplyOnOwnTopic`<br>`whoCanMarkNoResponseNeeded`<br>`whoCanModifyTagsAndCategories`<br>`whoCanTakeTopics`<br>`whoCanUnassignTopic`<br>`whoCanUnmarkFavoriteReplyOnAnyTopic` | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow. |

**Deprecated without a replacement**

| API property | Allowed values / format | Notes |
|---|---|---|
| `allowGoogleCommunication` | `true`; `false` | Legacy preference controlling Google communications to group managers. |
| `maxMessageBytes` | Integer; documented maximum is 25 MB | Google states the maximum message size is 25 MB; do not rely on this field to change the limit. |
| `messageDisplayFont` | `DEFAULT_FONT` | Google says the value is always `DEFAULT_FONT`. |
| `whoCanAddReferences` | `NONE` (Google says the value is always `NONE`) | Legacy forum; functionality no longer supported in the Google Groups UI. |

### Groups Settings API methods

| Method | Endpoint | Purpose |
|---|---|---|
| `groups.get` | `GET /groups/v1/groups/{groupUniqueId}` | Retrieve a group's settings. |
| `groups.patch` | `PATCH /groups/v1/groups/{groupUniqueId}` | Partially update a group's settings. |
| `groups.update` | `PUT /groups/v1/groups/{groupUniqueId}` | Update a group's settings. |

## 3. Admin SDK Directory API — Group resource

These are properties of the Directory group object, not Groups Settings API moderation settings. `email`, `name` and `description` also appear in the Groups Settings resource (where `name` has a documented maximum of 75 characters; the Directory API documents no maximum for `name`), and Cloud Identity has `displayName` and `description`. Google documents the group email address as changeable through the Directory API.

| API property | GAM command / attribute | Human-readable name | Type / values | Description / notes |
|---|---|---|---|---|
| `adminCreated` | `admincreated` (selectable field) | Created by administrator | Boolean; read-only | True if created by an administrator rather than an end user. The GAM7 wiki also lists `admincreated <Boolean>` as an option of `gam update group`; its effect is not verified, and Google documents the field as read-only. |
| `aliases[]` | `aliases` / alias subcommands | Group aliases | Array of email addresses; read-only in Group object | Manage through the `groups.aliases` API resource, not by editing this returned field. |
| `description` | `description` | Group description | String; max 4,096 characters | Purpose/description. |
| `directMembersCount` | `directmemberscount` | Direct member count | Int64 returned as string | Number of users that are direct members of the group; members of child groups are not counted. |
| `email` | `email` | Primary email address | Email address | Unique primary address; required at group creation. |
| `etag` | Not selectable as a GAM field | Entity tag | String | Resource version identifier. |
| `id` | `id` (selectable field, read-only) | Group ID | String | Read-only unique identifier; can be used as `groupKey` in API requests. |
| `kind` | Not selectable as a GAM field | Resource kind | `admin#directory#group` | Identifies the Directory API resource type. |
| `name` | `name` | Group display name | String | Display name. |
| `nonEditableAliases[]` | Shown in `gam info group` / `basic` output; not selectable with `fields` | Non-editable aliases | Array of email addresses | Functioning aliases outside the primary domain/subdomains; read-only. |

### Directory API group methods

| Method | Endpoint | Purpose |
|---|---|---|
| `groups.get` | `GET /admin/directory/v1/groups/{groupKey}` | Retrieve group properties. |
| `groups.insert` | `POST /admin/directory/v1/groups` | Create a group. |
| `groups.list` | `GET /admin/directory/v1/groups` | List groups, paginated. |
| `groups.patch` | `PATCH /admin/directory/v1/groups/{groupKey}` | Partially update group properties. |
| `groups.update` | `PUT /admin/directory/v1/groups/{groupKey}` | Update group properties. |
| `groups.delete` | `DELETE /admin/directory/v1/groups/{groupKey}` | Delete a group. |
| `groups.aliases.insert` | `POST /admin/directory/v1/groups/{groupKey}/aliases` | Add an alias. |
| `groups.aliases.list` | `GET /admin/directory/v1/groups/{groupKey}/aliases` | List aliases. |
| `groups.aliases.delete` | `DELETE /admin/directory/v1/groups/{groupKey}/aliases/{alias}` | Remove an alias. |
| `groups.members.insert` | `POST /admin/directory/v1/groups/{groupKey}/members` | Add a member. |
| `groups.members.list` | `GET /admin/directory/v1/groups/{groupKey}/members` | List members. |
| `groups.members.get` | `GET /admin/directory/v1/groups/{groupKey}/members/{memberKey}` | Retrieve a member record. |
| `groups.members.patch` | `PATCH /admin/directory/v1/groups/{groupKey}/members/{memberKey}` | Partially update membership role/delivery properties. |
| `groups.members.update` | `PUT /admin/directory/v1/groups/{groupKey}/members/{memberKey}` | Update membership. |
| `groups.members.delete` | `DELETE /admin/directory/v1/groups/{groupKey}/members/{memberKey}` | Remove a member. |
| `groups.members.hasMember` | `GET /admin/directory/v1/groups/{groupKey}/hasMember/{memberKey}` | Check membership. |

- `groupKey` is the group's email address, a group alias, or the unique group ID.
- `groups.list` requires either `customer` (for example `my_customer`) or `domain`. Other parameters: `userKey` (only groups that user is a member of; cannot be combined with `customer`), `query`, `maxResults` (maximum 200), `orderBy` (`EMAIL`), `sortOrder` and `pageToken`.

## 4. Cloud Identity Groups API — group classification and metadata

A “security group” is not defined by a Groups Settings API permission. Google uses Cloud Identity group labels to classify group types. A Google Group may also be assigned the security label. The security label is an immutable classification once added; it cannot be removed. Dynamic groups use a separate label and query metadata.

| API property / label | GAM support / spelling | Human-readable name | Values / format | Applies to | Description / notes |
|---|---|---|---|---|---|
| `name` | `name` | Resource name | `groups/{groupId}` | Cloud Identity groups | Output-only resource identifier. |
| `groupKey` | `groupkey` | Primary group key | EntityKey (see [EntityKey](#entitykey)) | Cloud Identity groups | Required identity key for the group; for Google Groups, the group email address. |
| `additionalGroupKeys[]` | `additionalgroupkeys` | Additional group keys | Array of EntityKey | Cloud Identity groups | Output-only additional identifiers. |
| `parent` | `parent` | Parent resource | `customers/{customerId}` or `identitysources/{identitySource}` | Cloud Identity groups | Required, immutable resource hierarchy parent. Google Groups use the customer resource; identity-mapped groups use an identity source. |
| `displayName` | `displayname` | Display name | String | Cloud Identity groups | Display name of the group. |
| `description` | `description` | Description | String; max 4,096 characters | Cloud Identity groups | Extended description. |
| `createTime` | `createtime` | Creation time | RFC 3339 timestamp; output-only | Cloud Identity groups | Creation timestamp. |
| `updateTime` | `updatetime` | Last update time | RFC 3339 timestamp; output-only | Cloud Identity groups | Last update timestamp. |
| `labels` | `labels` | Group classification / state labels | Map of label key to empty value | Cloud Identity groups | Required classification labels. See the specific labels below. GAM7 sets them with the keywords shown below rather than by editing the map. |
| `labels["cloudidentity.googleapis.com/groups.discussion_forum"]` | Label key | Google Group (default label) | Empty value | All Google Groups | Default label of every Google Group, including standard mailing lists and Collaborative Inbox groups. |
| `labels["cloudidentity.googleapis.com/groups.security"]` | `security` / `makesecuritygroup` (`gam update cigroup`, `gam create cigroup`); `makesecuritygroup` also on `gam update group` | Security group | Empty value | Google Groups classified as security groups | Adds security-group classification to an existing Google Group. Google documents this as irreversible: it cannot be removed. |
| `labels["cloudidentity.googleapis.com/groups.dynamic"]` | `dynamic <query>` (`gam create cigroup`, `gam update cigroup`); `makedynamicsecuritygroup` for a dynamic security group | Dynamic group | Empty value | Dynamic groups | Marks a dynamic group. Membership is calculated from a query rather than maintained only by manual member additions. Creating one on the Workspace for Nonprofits tenant used for this study returned Error 3006 "requires a premium SKU". |
| `labels["cloudidentity.googleapis.com/groups.locked"]` | `locked` / `unlocked`; `makelockedsecuritygroup` for a locked security group | Locked group | Empty value | Supported Google Groups | Adding this label locks the group; removing it unlocks the group. Locked groups were announced as an open beta in December 2024; check current availability. |
| `labels["system/groups/external"]` | Label key | Identity-mapped external group | Empty value | Cloud Search identity-mapped groups | Used for external identity-mapped groups. |
| `dynamicGroupMetadata` | `dynamicgroupmetadata` | Dynamic group metadata | Object | Dynamic groups | Contains query definitions and output-only status. |
| `dynamicGroupMetadata.queries[]` | `dynamic <query>` | Dynamic membership queries | Object with `resourceType` (`USER`) and `query` (a CEL expression) | Dynamic groups | Membership is the union of query results. Current documentation says only one USER resource query entry is supported and customers can create up to 500 dynamic groups. |
| `dynamicGroupMetadata.status` | Part of `dynamicgroupmetadata` | Dynamic group status | Object; output-only: `status` (`UP_TO_DATE`; `UPDATING_MEMBERSHIPS`; `INVALID_QUERY`; `STATUS_UNSPECIFIED`) and `statusTime` (RFC 3339) | Dynamic groups | Reports the dynamic group's processing status. `INVALID_QUERY` means the group is in an unrecoverable state and its memberships cannot be updated. |
| `externalIds[]` | `externalids` | External identifiers | Array of `ExternalId` (`id`, `namespace`); the only supported namespace is `system/external` | Groups integrated with external identity sources | Lets external identity providers/directory sync tools associate their native identifier with the group. Clients must keep IDs unique within their namespace. |

### EntityKey

An `EntityKey` identifies a group or user in the Cloud Identity Groups API.

| Field | Description |
|---|---|
| `id` | Entity ID. For Google-managed entities (Google Groups, users) it is the email address of an existing group or user. For external-identity-mapped entities it must satisfy the identity source's requirements. Unique within a namespace. |
| `namespace` | Omitted for Google-managed entities. For external-identity-mapped groups it is `identitysources/{identity_source}` and must match an identity source created in the Admin Console. |

### Security settings

A group classified as a security group has a `securitySettings` subresource (`groups/{groupId}/securitySettings`), read with `groups.getSecuritySettings` and changed with `groups.updateSecuritySettings`.

| API property | Type / values | Description / notes |
|---|---|---|
| `name` | String; output-only | Resource name, `groups/{groupId}/securitySettings`. |
| `memberRestriction` | Object | The member restriction applied to the group. |
| `memberRestriction.query` | CEL expression | Restriction expression. Supported terms: `member.customer_id` (only `groupCustomerId()` is supported) and `member.type` (`1` = USER, `2` = SERVICE_ACCOUNT, `3` = GROUP). Operators: `&&`, `\|\|`, `==`. Example: `member.type == 1 \|\| member.type == 3` (only users or groups). |
| `memberRestriction.evaluation.state` | `EVALUATING`; `COMPLIANT`; `FORWARD_COMPLIANT`; `NON_COMPLIANT` (`STATE_UNSPECIFIED` is not to be used); output-only | Evaluated state of the restriction. `COMPLIANT`: all transitive memberships adhere. `FORWARD_COMPLIANT`: some transitive memberships violate it, no new violating memberships can be added. `NON_COMPLIANT`: some transitive memberships violate it; new violating direct memberships are denied but indirect ones may be added. |

### Cloud Identity Groups API methods

These methods manage the group resource and its security-settings subresource. Membership operations use the separate `groups.memberships` resource.

| Method | Endpoint | Purpose |
|---|---|---|
| `groups.create` | `POST /v1/groups` | Create a group. |
| `groups.delete` | `DELETE /v1/{name=groups/*}` | Delete a group. |
| `groups.get` | `GET /v1/{name=groups/*}` | Retrieve a group. |
| `groups.getSecuritySettings` | `GET /v1/{name=groups/*/securitySettings}` | Retrieve a group's security settings. |
| `groups.list` | `GET /v1/groups` | List groups under a customer or identity-source namespace. |
| `groups.lookup` | `GET /v1/groups:lookup` | Look up a group's resource name by its entity key. |
| `groups.patch` | `PATCH /v1/{resource.name=groups/*}` | Update selected group fields, such as its display name, description, or labels. |
| `groups.search` | `GET /v1/groups:search` | Search for groups matching a query. |
| `groups.updateSecuritySettings` | `PATCH /v1/{securitySettings.name=groups/*/securitySettings}` | Update a group's security settings. |

## 5. Google Groups UI settings vs Groups Settings API properties

The mapping below comes from GAM7's “GUI API Group settings mapping” (entries are in the order of the Google Groups settings page). It is community-maintained and appears dated, and UI labels can change, so check the labels once in the Admin Console before relying on them.

### UI settings that map to an API property

| Admin Console / Google Groups UI setting | Groups Settings API property |
|---|---|
| Group name | `name` |
| Group email | `email` |
| Group description | `description` |
| Collaborative Inbox | `enableCollaborativeInbox` |
| Who can see group | `whoCanDiscoverGroup` |
| Who can join group | `whoCanJoin` |
| Allow external members | `allowExternalMembers` |
| Who can view conversations | `whoCanViewGroup` |
| Who can post | `whoCanPostMessage` |
| Who can view members | `whoCanViewMembership` |
| Who can contact group owners | `whoCanContactOwner` |
| Allow web posting | `allowWebPosting` |
| Conversation history | `isArchived` |
| Who can moderate content | `whoCanModerateContent` |
| Who can moderate metadata | `whoCanAssistContent` |
| Who can post as group | `membersCanPostAsTheGroup` |
| Default sender | `defaultSender` |
| Message moderation | `messageModerationLevel` |
| Spam message handling | `spamModerationLevel` |
| Rejected message notification | `sendMessageDenyNotification` |
| Include default rejected message response | `defaultMessageDenyNotificationText` |
| Include a custom footer | `includeCustomFooter` |
| Custom footer text | `customFooterText` |
| Group email language | `primaryLanguage` |
| Post replies to | `replyTo` |
| Custom address for replies | `customReplyTo` |
| Who can manage members | `whoCanModerateMembers` |

### UI settings with no Groups Settings API property

None of these has a corresponding property in the Groups Settings API resource.

| Admin Console / Google Groups UI setting | Notes |
|---|---|
| Welcome message | |
| Enable shared labels for this group | |
| Identification required for new members | |
| New member restrictions | |
| Who can view member email addresses | Distinct from `whoCanViewMembership` (the member list itself). |
| Allow Email Posting | Do not confuse with `whoCanPostMessage` or `allowWebPosting`. |
| Who can reply privately to authors | |
| Who can attach files | |
| Subject prefix | |
| Include the standard Groups footer | Distinct from API `includeCustomFooter` / `customFooterText`. |
| Auto replies | |
| Conversation mode | |
| Who can manage custom roles | `customRolesEnabledForSettingsToBeMerged` is read-only and is not a permission setter. |

### API properties with no entry in the UI mapping

| Groups Settings API property | Notes |
|---|---|
| `whoCanLeaveGroup` | Listed in the mapping with no UI setting ("Not available" on the UI side). |
| `whoCanAddExternalMembers` | Not in the mapping. |
| `includeInGlobalAddressList` | Not in the mapping. |
| `archiveOnly` | Not in the mapping. |
| `favoriteRepliesOnTop` | Not in the mapping. |
| `customRolesEnabledForSettingsToBeMerged` | Not in the mapping (read-only). |

The deprecated properties are not in the mapping either. Absence from the mapping does not prove that the UI has no matching control. This section is a mapping of documented UI controls, not a claim that no Google API anywhere can affect any related behaviour. Some controls may be global Admin Console settings, user-level preferences, product features, or unavailable to public APIs.

### Organisation-wide Groups for Business sharing settings

Besides the per-group settings above, the Admin Console has organisation-wide sharing settings (Apps, Google Workspace, Groups for Business, Sharing settings). They set limits and defaults for all groups, and a group's own settings work inside them; see also [General cautions](#general-cautions). They are not part of the Groups Settings, Directory or Cloud Identity Groups APIs. Google lists them in the Cloud Identity **Policy API** under the setting type `groups_for_business.groups_sharing`, and its table marks them as not mutable through the API (read-only). Whether GAM7 can read them has not been verified.

| Admin Console option | Policy API field | Values | Default (Google help page) |
|---|---|---|---|
| Accessing groups from outside the organization (Policy API caption: "Set policies for changing group sharing settings") | `collaborationCapability` | `ANYONE_CAN_ACCESS`; `DOMAIN_USERS_ONLY` | Private (internal users only) |
| Creating groups | `createGroupsAccessLevel` | `ADMIN_ONLY`; `USERS_IN_DOMAIN`; `ANYONE_CAN_CREATE` | Anyone in the organisation can create groups |
| Group owners can allow external members | `ownersCanAllowExternalMembers` | `true`; `false` | Not allowed |
| Group owners can allow incoming email from outside the organization | `ownersCanAllowIncomingMailFromPublic` | `true`; `false` | Not allowed |
| Default for permission to view conversations | `viewTopicsDefaultAccessLevel` | `OWNERS`; `MANAGERS`; `GROUP_MEMBERS`; `DOMAIN_USERS`; `ANYONE_CAN_VIEW_TOPICS` | All organisation users |
| Group owners can hide groups from the directory | `ownersCanHideGroups` | `true`; `false` | Owners can't hide groups |
| Hide newly created groups from the directory | `newGroupsAreHidden` | `true`; `false` | Not allowed (the help page gives "both options unchecked" for the two hiding options) |

The Policy API also lists related groups entries that are outside the sharing options: inbound-email spoofing protection for groups (`detect_groups_spoofing`, `groups_spoofing_visibility_type`, `groups_spoofing_consequence`, `groups_spoofing_quarantine_id`), a multi-party approval state for groups actions (`multi_party_approval.groups_actions`) and the on/off switch of the Groups for Business service (`groups_for_business`). Source: [Settings available in the Policy API](https://docs.cloud.google.com/identity/docs/concepts/supported-policy-api-settings) and the [Groups for Business sharing settings help page](https://support.google.com/a/answer/167097).

## 6. Member-level settings — separate from group-level settings

These are not properties of the Groups Settings API `groups` resource. Google Groups membership is exposed by two resources: the Directory API `members` resource and the Cloud Identity Groups API `memberships` resource. The Directory API methods are listed under [Directory API group methods](#directory-api-group-methods). GAM examples for member management are in [Section 7](#member-management-examples).

### Directory API — Member resource

| Property | GAM7 field / keyword | Human-readable name | Values / format | Description |
|---|---|---|---|---|
| `id` | `id` | Member ID | String | Unique ID of the group member; can be used as `memberKey`. |
| `kind` | Not a GAM7 member field | Resource kind | `admin#directory#member` | Identifies the Directory API resource type. |
| `etag` | Not a GAM7 member field | Entity tag | String | ETag of the resource. |
| `email` | `email` / `useremail` | Member email | Email address | The member's email address (a user or another group). Required when adding a member; must be unique and cannot be an alias of another group. |
| `role` | `role`; keywords `owner`, `manager`, `member` | Membership role | `OWNER`; `MANAGER`; `MEMBER` | `OWNER` can send messages, add or remove members, change member roles and group settings, and delete the group. `MANAGER` can do everything an owner can except make a member an owner or delete the group; this role is only available if Groups for Business is turned on in the Admin Console. `MEMBER` can subscribe, view discussion archives and view the membership list. |
| `type` | `type`; keywords `customer`, `group`, `user` | Member type | `CUSTOMER`; `EXTERNAL` (not currently used); `GROUP`; `USER` | `CUSTOMER` represents all users in a domain (no email address is returned, the ID is the customer ID). `GROUP` is another group; `USER` is a user. |
| `status` | `status` | Membership status | Not enumerated by Google | Documented only as "Status of member (Immutable)". |
| `delivery_settings` | `delivery` / `deliverysettings`; keywords `allmail`, `abridged` / `daily`, `digest`, `none` / `nomail`, `disabled` | Email delivery | `ALL_MAIL` (each message as it arrives); `DAILY` (at most one message a day); `DIGEST` (up to 25 messages bundled in one message); `NONE` (no messages); `DISABLED` (remove subscription) | Controls how much group email an individual member receives. This is not a group-wide setting. Google documents the field as supported only by the `insert`, `update` and `get` methods. |

### Cloud Identity Groups API — Membership resource

| Property | GAM7 support | Values / format | Description |
|---|---|---|---|
| `name` | Cloud Identity membership commands | `groups/{group}/memberships/{membership}`; output-only | Resource name. |
| `preferredMemberKey` | Cloud Identity membership commands | EntityKey; required, immutable | The member (see [EntityKey](#entitykey)). |
| `createTime` / `updateTime` | Cloud Identity membership commands | RFC 3339 timestamps; output-only | Creation and last update time. |
| `roles[]` | `add\|update [<role>]` | List of membership roles; defaults to a single `MEMBER` role | The privileges of the membership; no two entries with the same `name`. |
| `roles[].name` | `owner`, `manager`, `member` | `OWNER`; `MANAGER`; `MEMBER` | Role name. |
| `roles[].expiryDetail.expireTime` | Cloud Identity membership commands | RFC 3339 timestamp | When the role expires. Only supported for the `MEMBER` role. |
| `roles[].restrictionEvaluations.memberRestrictionEvaluation.state` | Cloud Identity membership commands | `EVALUATING`; `COMPLIANT`; `FORWARD_COMPLIANT`; `NON_COMPLIANT` (`STATE_UNSPECIFIED` is not to be used); output-only | Evaluation of the parent group's member restriction for this membership. Empty if the caller cannot view the evaluation. |
| `type` | Cloud Identity membership commands | `USER`; `SERVICE_ACCOUNT`; `GROUP`; `SHARED_DRIVE`; `CBCM_BROWSER`; `CHROME_OS_DEVICE`; `PERSONAL_AGENT`; `COWORKER_AGENT`; `OTHER`; output-only | Type of the member. |
| `deliverySetting` | Cloud Identity membership commands | `ALL_MAIL`; `DIGEST`; `DAILY`; `NONE`; `DISABLED`; output-only | Delivery setting of the membership. |

The GAM7 commands for these memberships are `gam update cigroup <group> add|delete|update|sync|clear …`, `gam info cimember <user> <group>`, `gam print cigroup-members` and `gam show cigroup-members`.

### Cloud Identity Groups API — membership methods

| Method | Endpoint | Purpose |
|---|---|---|
| `memberships.create` | `POST /v1/{parent=groups/*}/memberships` | Create a membership. |
| `memberships.delete` | `DELETE /v1/{name=groups/*/memberships/*}` | Delete a membership. |
| `memberships.get` | `GET /v1/{name=groups/*/memberships/*}` | Retrieve a membership. |
| `memberships.list` | `GET /v1/{parent=groups/*}/memberships` | List the memberships of a group. |
| `memberships.lookup` | `GET /v1/{parent=groups/*}/memberships:lookup` | Look up the resource name of a membership by its EntityKey. |
| `memberships.modifyMembershipRoles` | `POST /v1/{name=groups/*/memberships/*}:modifyMembershipRoles` | Modify the roles of a membership. |
| `memberships.checkTransitiveMembership` | `GET /v1/{parent=groups/*}/memberships:checkTransitiveMembership` | Check a potential member for membership in a group. |
| `memberships.getMembershipGraph` | `GET /v1/{parent=groups/*}/memberships:getMembershipGraph` | Get the membership graph of a member, or of a member and a group. |
| `memberships.searchDirectGroups` | `GET /v1/{parent=groups/*}/memberships:searchDirectGroups` | Search the direct groups of a member. |
| `memberships.searchTransitiveGroups` | `GET /v1/{parent=groups/*}/memberships:searchTransitiveGroups` | Search the transitive groups of a member. |
| `memberships.searchTransitiveMemberships` | `GET /v1/{parent=groups/*}/memberships:searchTransitiveMemberships` | Search the transitive memberships of a group. |

## 7. GAM commands for inventory, export, backup and changes

The examples below use placeholder addresses. The syntax follows the GAM7 wiki and was parse-checked on GAM 7.48.22. Run any change on a disposable group first.

### Inventory and export

```bash
# All groups with all their Groups Settings values
gam print groups settings

# Same, written to a CSV file
gam redirect csv groups-settings.csv print groups settings

# Selected Directory fields only
gam print groups fields name,description,directmemberscount

# All groups with all group fields
gam print groups allfields
```

In the GAM7 syntax `allfields` and `settings` are alternatives. GAM7 documents `allfields` as "all group fields" and `settings` as "all group settings fields"; whether `allfields` also fetches the Groups Settings values has not been verified, so compare the output columns with `gam print groups settings`.

### Inspect one group

```bash
# Full information (members, managers and owners are listed by default)
gam info group group@example.org

# Skip the member lists (large groups)
gam info group group@example.org quick

# JSON output
gam info group group@example.org formatjson

# CSV output of all fields of one group
gam print groups select group@example.org allfields
```

`gam info group` also accepts `basic`, `nodeprecated` and `ciallfields` (all Cloud Identity group fields). `gam group group@example.org print allfields` also parses, but it is not documented in the wiki; use the documented forms above.

### Inventory of members and classification

```bash
# Members of one group, only managers and owners, email column only
gam print group-members group group@example.org roles manager,owner fields email

# Security groups and dynamic groups (Cloud Identity labels)
gam print cigroups query "'cloudidentity.googleapis.com/groups.security' in labels"
gam print cigroups query "'cloudidentity.googleapis.com/groups.dynamic' in labels"
```

### JSON backup of settings

GAM7 documentation shows exporting settings with `formatjson` and restoring from the JSON column. The JSON contains double quotes, so `quotechar "'"` makes single quotes the CSV quote character. Example:

```bash
gam redirect csv groups.csv print groups query "name:test*" settings formatjson quotechar "'"
```

Restore/update from a CSV row:

```bash
gam csv groups.csv quotechar "'" gam update group "~email" json "~JSON-settings"
```

Treat a restore as a change operation: test on a disposable group first, review the JSON and confirm that the group still has the same intended configuration.

### Update examples

```bash
gam update group group@example.org who_can_post_message all_members_can_post
gam update group group@example.org who_can_view_group all_members_can_view
gam update group group@example.org who_can_view_membership all_managers_can_view
gam update group group@example.org allowexternalmembers false
gam update group group@example.org enablecollaborativeinbox true
gam update group group@example.org is_archived true

# Apply a preset of four settings (see the table below)
gam update group group@example.org accesstype restricted

# Create a group with the settings of an existing group
gam create group new-group@example.org copyfrom group@example.org
```

`accesstype` is a GAM preset, not an API property. According to the GAM7 wiki it sets these four settings:

| `accesstype` | `whoCanJoin` | `whoCanPostMessage` | `whoCanViewGroup` | `whoCanViewMembership` |
|---|---|---|---|---|
| `public` | `ALL_IN_DOMAIN_CAN_JOIN` | `ALL_IN_DOMAIN_CAN_POST` | `ALL_IN_DOMAIN_CAN_VIEW` | `ALL_IN_DOMAIN_CAN_VIEW` |
| `team` | `CAN_REQUEST_TO_JOIN` | `ALL_IN_DOMAIN_CAN_POST` | `ALL_IN_DOMAIN_CAN_VIEW` | `ALL_IN_DOMAIN_CAN_VIEW` |
| `announcementonly` | `ALL_IN_DOMAIN_CAN_JOIN` | `ALL_MANAGERS_CAN_POST` | `ALL_IN_DOMAIN_CAN_VIEW` | `ALL_MANAGERS_CAN_VIEW` |
| `restricted` | `CAN_REQUEST_TO_JOIN` | `ALL_MEMBERS_CAN_POST` | `ALL_MEMBERS_CAN_VIEW` | `ALL_MEMBERS_CAN_VIEW` |

GAM syntax evolves. Confirm accepted attribute/value spellings in the installed GAM7 help before applying changes to production groups. Some combinations of `who_can_view_membership`, `who_can_discover_group` and the member-management setting are refused by Google; see [Interaction rules between settings](#interaction-rules-between-settings).

### Member management examples

```bash
# Add a member
gam update group group@example.org add member user@example.net

# Add a manager
gam update group group@example.org add manager manager@example.net

# Change only the delivery setting (the role is left unchanged)
gam update group group@example.org update delivery nomail user@example.net

# Change only the role (the delivery setting is left unchanged)
gam update group group@example.org update manager user@example.net

# Remove a member
gam update group group@example.org remove user@example.net

# Make the membership match the content of a file (members not in the file are removed)
gam update group group@example.org sync members file Users.csv
```

When `update` is given a role together with a delivery setting (for example `update member nomail user@example.net`), both are updated: the role is set to that role, so a manager or owner would be demoted to member. Give only the item you want to change.

## 8. Practical interpretation / cautions

### Interaction rules between settings

| Setting / combination | Behaviour |
|---|---|
| `archiveOnly=true` | Deactivates the group, rejects new messages and forces `whoCanPostMessage=NONE_CAN_POST`. Re-enabling it resets posting permission to `ALL_MANAGERS_CAN_POST`. |
| `whoCanPostMessage=NONE_CAN_POST` while `archiveOnly=false` | Google rejects the update. |
| `allowExternalMembers=false` | Google ignores updates to `whoCanAddExternalMembers`. |
| `allowExternalMembers` vs `whoCanPostMessage` | Interpretation of this document: `allowExternalMembers` controls membership only. Whether non-members outside the organisation can post depends on `whoCanPostMessage`, moderation and Workspace-wide sharing policies. |
| `replyTo=REPLY_TO_CUSTOM` | `customReplyTo` must contain a valid email address. |
| `sendMessageDenyNotification=true` | Enables the rejection notification; `defaultMessageDenyNotificationText` customises its text. |
| `whoCanPostMessage=ANYONE_CAN_POST` | Google recommends `messageModerationLevel=MODERATE_NON_MEMBERS` to reduce spam. |
| `membersCanPostAsTheGroup=true` | Individual/new-member moderation settings do not apply to messages sent as the group. |
| `whoCanDiscoverGroup` vs `whoCanViewGroup` vs `whoCanViewMembership` | Interpretation of this document: visibility is multi-dimensional. Discovery (can users find the group), conversation visibility (can they read messages), membership-list visibility, and member email-address visibility are separate concepts and are not equivalent. |
| `whoCanViewMembership` vs `whoCanDiscoverGroup` | Membership visibility cannot be broader than group discoverability. Google rejects such a combination (for example `whoCanViewMembership=ALL_IN_DOMAIN_CAN_VIEW` with `whoCanDiscoverGroup=ALL_MEMBERS_CAN_DISCOVER`) with `WHO_CAN_VIEW_MEMBERSHIP_CANNOT_BE_BROADER_THAN_WHO_CAN_SEE_GROUP`. Source: GAM7 wiki. |
| `whoCanModerateMembers` vs `whoCanViewMembership` | Who can manage members cannot be broader than who can view membership. Google rejects, for example, `whoCanViewMembership=ALL_OWNERS_CAN_VIEW` with the error `DONT_USE_OR_ELSE_WHO_CAN_MANAGE_MEMBERS_CANNOT_BE_BROADER_THAN_WHO_CAN_VIEW_MEMBERSHIP`. Source: GAM7 wiki, which does not show the manage-members value used in those tests. |
| A valid combination of the two rules above is rejected | The GAM7 wiki suggests first setting `whoCanViewMembership=ALL_IN_DOMAIN_CAN_VIEW` together with `whoCanDiscoverGroup=ALL_IN_DOMAIN_CAN_DISCOVER`, then repeating the intended update. |

### General cautions

1. **Nonprofit edition:** Google Workspace for Nonprofits uses the same Groups Settings API schema as other Google Workspace editions; it does not define a separate schema. API availability and behaviour can still vary by edition, administrator privileges and service settings. For example, creating a dynamic group on the Workspace for Nonprofits tenant used for this study failed with a "requires a premium SKU" error (see [section 4](#4-cloud-identity-groups-api--group-classification-and-metadata)).
2. **Security classification is not a posting setting:** `whoCanPostMessage`, `whoCanViewGroup`, etc. do not make a group a security group. The Cloud Identity `groups.security` label is the relevant classification, and adding it is irreversible.
3. **Dynamic groups are different:** Use Cloud Identity Groups API for dynamic membership metadata and query definitions; do not expect the ordinary Groups Settings API to manage the query.
4. **Legacy properties:** Google's schema still documents many deprecated forum permissions. They are included here for completeness and audit compatibility, but new configurations should use the consolidated moderation fields (`whoCanModerateMembers`, `whoCanModerateContent`, `whoCanAssistContent`).
5. **Global policy can override or constrain group settings:** Admin Console sharing settings, trust rules, domain policies and other Workspace controls may restrict what a group-level setting can do. The organisation-wide Groups for Business sharing settings are listed under [Organisation-wide Groups for Business sharing settings](#organisation-wide-groups-for-business-sharing-settings).
6. **Read-only / ignored fields:** Do not assume every returned property is writable. These are read-only or output-only:
   - Groups Settings API: `kind`, `customRolesEnabledForSettingsToBeMerged`.
   - Directory API: `id`, `etag`, `kind`, `adminCreated`, `aliases`, `nonEditableAliases`, `directMembersCount`.
   - Cloud Identity Groups API: `name`, `additionalGroupKeys`, `createTime`, `updateTime`, the dynamic group `status`, and the membership `name`, `type`, `deliverySetting` and restriction evaluations.

   Some deprecated fields may be ignored or have fixed values.
7. **Timing:** According to the GAM7 wiki, deleting a group and recreating it with the same address within about 30 to 45 seconds can fail with `Resource not found` or `Duplicate`. Updating an alias by deleting and re-adding it back-to-back can also fail with `Duplicate`, so GAM waits 2 seconds between the two steps.

## 9. Official and community references

| Reference | Why it matters |
|---|---|
| [Google Groups Settings API — Groups resource and methods](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups) | Primary source for the complete Groups Settings API schema, properties, enumerated values, deprecation notes and supported languages, and for the `get`, `update` and `patch` methods. |
| [Google Admin SDK Directory API — Group resource](https://developers.google.com/workspace/admin/directory/reference/rest/v1/groups) | Primary source for Directory group fields and group CRUD methods. |
| [Google Admin SDK Directory API — Member resource](https://developers.google.com/workspace/admin/directory/reference/rest/v1/members) | Membership fields, roles, member types, delivery settings and membership methods. |
| [Google Admin SDK Directory API — Group aliases](https://developers.google.com/workspace/admin/directory/reference/rest/v1/groups.aliases) | Alias methods for groups. |
| [Google Cloud Identity Groups API — Group resource](https://docs.cloud.google.com/identity/docs/reference/rest/v1/groups) | Primary source for Cloud Identity group metadata, labels, dynamic group metadata, external IDs and security settings. |
| [Google Cloud Identity Groups API — Membership resource](https://docs.cloud.google.com/identity/docs/reference/rest/v1/groups.memberships) | Cloud Identity membership fields, roles, expiry, restriction evaluations and membership methods. |
| [Google Cloud Identity Policy API — supported settings](https://docs.cloud.google.com/identity/docs/concepts/supported-policy-api-settings) | Lists the organisation-wide Groups for Business sharing settings and related groups policy entries. |
| [Google Groups for Business sharing settings (help page)](https://support.google.com/a/answer/167097) | Describes the organisation-wide sharing options and their defaults. |
| [GAM7 — Groups wiki](https://github.com/GAM-team/GAM/wiki/Groups) | GAM syntax, API/UI mapping, `print groups settings`, JSON export/restore and security-group commands. |
| [GAM7 — Groups membership wiki](https://github.com/GAM-team/GAM/wiki/Groups-Membership) | GAM member roles and per-member delivery preferences. |
| [GAM7 — Cloud Identity groups wiki](https://github.com/GAM-team/GAM/wiki/Cloud-Identity-Groups) | `cigroup` commands: security, locked and dynamic groups, Cloud Identity fields. |
| [GAM7 — Cloud Identity groups membership wiki](https://github.com/GAM-team/GAM/wiki/Cloud-Identity-Groups-Membership) | `cigroup` membership commands. |
| [GAM7 — Aliases wiki](https://github.com/GAM-team/GAM/wiki/Aliases) | Create, update, delete and remove group aliases. |

---

Google's API references are living documentation; re-check the official schema and the installed GAM7 help before using this as an operational change specification.
