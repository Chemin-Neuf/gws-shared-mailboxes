<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Major Contributors: GPT-6 Luna, GPT-6.1 Terra (OpenAI / GitHub Copilot)
  Last Updated: 2026-11-10
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
  - [Cloud Identity Groups API methods](#cloud-identity-groups-api-methods)
- [5. Settings shown in Google Groups UI but not exposed as a Groups Settings API property](#5-settings-shown-in-google-groups-ui-but-not-exposed-as-a-groups-settings-api-property)
- [6. Member-level settings — separate from group-level settings](#6-member-level-settings--separate-from-group-level-settings)
- [7. GAM commands for inventory, export, backup and changes](#7-gam-commands-for-inventory-export-backup-and-changes)
  - [List all groups and settings](#list-all-groups-and-settings)
  - [Export all groups with all available Directory and Groups Settings fields](#export-all-groups-with-all-available-directory-and-groups-settings-fields)
  - [Export all group settings to CSV](#export-all-group-settings-to-csv)
  - [Inspect one group](#inspect-one-group)
  - [Display all fields for one group](#display-all-fields-for-one-group)
  - [JSON backup of settings](#json-backup-of-settings)
  - [Update examples](#update-examples)
  - [Member management examples](#member-management-examples)
- [8. Practical interpretation / cautions](#8-practical-interpretation--cautions)
  - [Interaction rules between settings](#interaction-rules-between-settings)
  - [General cautions](#general-cautions)
- [9. Official and community references](#9-official-and-community-references)

> **Important scope note:** “All group settings” is not one API. The Groups Settings API covers email/discussion permissions and behaviour. The Directory API covers the directory group object and membership. Cloud Identity Groups API covers group classification, dynamic groups, and security-group metadata. Some Google Groups UI controls are not exposed by any of these group-level APIs. Member-specific subscription/delivery settings are also separate from group-level settings.

## 1. API overview

| API / resource | What it manages | Main methods / endpoint | GAM commands / coverage |
|---|---|---|---|
| Groups Settings API v1 — `groups` | Email posting, visibility, membership access, moderation, archive, replies, footer, Collaborative Inbox and legacy forum settings | `GET/PUT/PATCH https://www.googleapis.com/groups/v1/groups/{groupEmail}` | **Commands:**<br>`gam info group <groupEmail>`<br>`gam print groups settings`<br>`gam update group <groupEmail> <attribute> <value>`<br>**Coverage:** inspect and update group settings |
| Admin SDK Directory API v1 — `groups` | Group email/name/description, aliases, identifiers and direct member count | `GET/POST/PATCH/PUT/DELETE https://admin.googleapis.com/admin/directory/v1/groups[/{groupKey}]` | **Commands:**<br>`gam print groups`<br>`gam info group <groupEmail>`<br>`gam create group <groupEmail> name <groupName>`<br>`gam update group <groupEmail> <attribute> <value>`<br>`gam delete group <groupEmail>`<br>**Coverage:** group inventory and lifecycle |
| Admin SDK Directory API — `groups.aliases` | Add/list/remove aliases | `GET/POST https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/aliases`; <BR> `DELETE https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/aliases/{alias}` | **Commands:**<br>`gam create alias <aliasEmail> group <groupEmail>`<br>`gam remove alias <aliasEmail> group <groupEmail>`<br>`gam info group <groupEmail>`<br>**Coverage:** create, remove and inspect group aliases |
| Admin SDK Directory API — `groups.members` | Membership, role and member delivery preference | `GET/POST https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/members`; <BR> `GET/PATCH/PUT/DELETE https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/members/{memberKey}`; <BR> `GET https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/hasMember/{memberKey}` | **Commands:**<br>`gam update group <groupEmail> add member <memberEmail>`<br>`gam update group <groupEmail> add manager <memberEmail>`<br>`gam update group <groupEmail> update member <delivery-option> <memberEmail>`<br>**Coverage:** membership roles and individual delivery settings |
| Cloud Identity Groups API v1 — `groups` | Group classification labels, security/dynamic group metadata, external identifiers and resource hierarchy | `GET/PATCH/DELETE https://cloudidentity.googleapis.com/v1/groups/{groupId}`; <BR> `POST https://cloudidentity.googleapis.com/v1/groups` | **Commands:** `gam update group <groupEmail> makesecuritygroup` (where supported)<br>**Coverage:** security-group labeling is irreversible; dynamic groups use the Cloud Identity workflow |

### Group types and modes

> **Collaborative Inbox is a mode, not a group type.** It is a standard Google Group with `enableCollaborativeInbox=true`; it is not a separate Directory API resource type.

| Group type / mode | Groups Settings API | Directory API | Cloud Identity Groups API | Notes |
|---|---|---|---|---|
| Standard Google Group / mailing list | Yes | Yes | Group metadata/classification may be exposed | Typical email-enabled group. |
| Collaborative Inbox | Yes | Yes | Google Group classification | Mode of a Google Group, enabled with `enableCollaborativeInbox=true`. |
| Google Groups discussion forum | Yes | Yes | `groups.discussion_forum` label | Discussion/forum features and topic permissions may be relevant. |
| Security group | Not the defining mechanism | Google Group object may remain | `groups.security` label | Security classification is separate from email posting permissions. |
| Dynamic group | Not the defining mechanism | Not the primary dynamic-membership interface | `groups.dynamic` plus `dynamicGroupMetadata` | Membership is query-driven. |
| Identity-mapped external group | No ordinary Google Groups settings assumption | Not an ordinary Workspace group | `system/groups/external` label | Cloud Identity / Cloud Search identity-mapping scenario. |

## 2. Groups Settings API — complete documented property inventory

### API vs GAM naming

- The **API property** column below uses the exact JSON property spelling (camelCase).
- GAM7 accepts group attributes in its `gam update group` command. Its documentation commonly shows lowercase snake_case forms such as `who_can_post_message` and `enablecollaborativeinbox`; GAM's parser also accepts many API-style names. The exact accepted aliases can vary by GAM release. Check the installed build with `gam help update group` and `gam help print groups`.
- Do not assume a property is writable just because it appears in a GET response. Some properties are deprecated, read-only, ignored on update, or have conditions.
- The Groups Settings API represents several boolean values as strings in its resource schema; use `true` / `false` as shown by Google and GAM.
- A GAM attribute being absent from an example is not proof that the API property is unsupported by GAM.

The table includes the current settings, legacy/deprecated properties still present in Google's resource schema, and the resource metadata fields returned by the Groups Settings API. “All Google Groups” means a standard Google Group and its Collaborative Inbox variant; it does **not** imply every setting is meaningful in every UI mode. Forum/topic-specific legacy controls are marked accordingly.

### Current and non-deprecated properties

| API property | GAM attribute / practical spelling | Human-readable setting | Allowed values / format | Applicability | Description / notes |
|---|---|---|---|---|---|
| `allowExternalMembers` | `allowexternalmembers` | Allow external members | `true`; `false` | All | Allows or blocks members outside the Workspace organisation. Google notes these are Workspace users external to the organisation; broader external posting is separately controlled. |
| `allowWebPosting` | `allow_web_posting` | Allow posting on the web | `true`; `false` | Groups with Google Groups web interface | Enables members to post through the Google Groups web interface. If false, members use email/Gmail to communicate with the group. |
| `archiveOnly` | `archive_only` | Archive-only / deactivate group | `true`; `false` | All | When true, group becomes inactive and new messages are rejected; old conversations remain browsable/searchable. Google sets `whoCanPostMessage=NONE_CAN_POST`. Turning it off resets posting permission to `ALL_MANAGERS_CAN_POST`. |
| `customFooterText` | `custom_footer_text` | Custom footer text | Text; max 1,000 characters | All | Text appended as the custom footer when enabled. |
| `customReplyTo` | `custom_reply_to` | Custom reply-to address | Email address | All, conditional | Required when `replyTo=REPLY_TO_CUSTOM`; otherwise not used. Google describes this as an address defined by an account administrator. |
| `customRolesEnabledForSettingsToBeMerged` | Read-only; no update | Custom roles included in merged settings | `true`; `false` | Groups with custom roles / merged moderation settings | Read-only. Google ignores UPDATE/PATCH attempts. |
| `defaultMessageDenyNotificationText` | `default_message_deny_notification_text` | Rejection notification text | Text; max 10,000 characters | All, conditional | Custom text for rejection notifications. Requires `sendMessageDenyNotification=true`. |
| `defaultSender` | `default_sender` | Default sender identity | `DEFAULT_SELF`; `GROUP` | Groups where members can post as the group | Determines whether the default sender is the individual user or the group when posting as the group. |
| `description` | `description` | Group description | Text; max 4,096 characters | All | Description of the group's purpose. |
| `email` | `email` | Group email address | Email address | All | Primary group address. Change through Directory API / GAM group update, not the Groups Settings API. |
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
| `spamModerationLevel` | `spam_moderation_level` | Spam moderation | `ALLOW`; `MODERATE`; `SILENTLY_MODERATE`; `REJECT` | All | Determines what happens to messages Google classifies as spam: allow, queue for moderation (with or without notification), or reject. |
| `whoCanAddExternalMembers` | `who_can_add_external_members` | Who can add external members | `ONLY_ADMINS_CAN_ADD_EXTERNAL_MEMBERS`; `END_USERS_CAN_ADD_EXTERNAL_MEMBERS` | All, when external membership is enabled | Controls whether only administrators or end users can add external members. Updates are ignored when `allowExternalMembers=false`. |
| `whoCanAssistContent` | `who_can_assist_content` | Who can assist/manage discussion metadata | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Current; Collaborative Inbox / forum workflows | Current consolidated permission for topic assignments, tags, duplicate status, response status and favourite replies. |
| `whoCanContactOwner` | `who_can_contact_owner` | Who can contact group owners | `ALL_IN_DOMAIN_CAN_CONTACT`; `ALL_MANAGERS_CAN_CONTACT`; `ALL_MEMBERS_CAN_CONTACT`; `ANYONE_CAN_CONTACT` | All | Controls who can use the contact-owner function. |
| `whoCanDiscoverGroup` | `who_can_discover_group` | Who can discover the group | `ANYONE_CAN_DISCOVER`; `ALL_IN_DOMAIN_CAN_DISCOVER`; `ALL_MEMBERS_CAN_DISCOVER` | All | Controls discoverability in Google Groups. It is distinct from viewing messages and viewing membership. |
| `whoCanJoin` | `who_can_join` | Who can join the group | `ANYONE_CAN_JOIN`; `ALL_IN_DOMAIN_CAN_JOIN`; `INVITED_CAN_JOIN`; `CAN_REQUEST_TO_JOIN` | All | Controls whether anyone, anyone in the Workspace domain, invitees only, or requesters can join. External membership is additionally constrained by `allowExternalMembers` and domain policy. |
| `whoCanLeaveGroup` | `who_can_leave_group` | Who can leave the group | `ALL_MEMBERS_CAN_LEAVE`; `ALL_MANAGERS_CAN_LEAVE`; `NONE_CAN_LEAVE` | All | Controls whether members/managers can leave voluntarily. Owners/managers semantics should be tested against the current group role model. |
| `whoCanModerateContent` | `who_can_moderate_content` | Who can moderate content | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Current; discussion/content workflows | Current consolidated permission for content moderation. Supersedes legacy message approval, delete, lock, move, announcement, abuse and sticky-topic controls. |
| `whoCanModerateMembers` | `who_can_moderate_members` | Who can moderate/manage members | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Current; all applicable Groups | Current consolidated permission for member management. Supersedes legacy invite/add/approve/ban/modify controls. |
| `whoCanPostMessage` | `who_can_post_message` | Who can post messages | `NONE_CAN_POST`; `ALL_MANAGERS_CAN_POST`; `ALL_MEMBERS_CAN_POST`; `ALL_OWNERS_CAN_POST`; `ALL_IN_DOMAIN_CAN_POST`; `ANYONE_CAN_POST` | All | Controls who may send messages to the group. `NONE_CAN_POST` requires archive-only/inactive state. Google recommends `MODERATE_NON_MEMBERS` when `ANYONE_CAN_POST` is used. |
| `whoCanViewGroup` | `who_can_view_group` | Who can view conversations | `ANYONE_CAN_VIEW`; `ALL_IN_DOMAIN_CAN_VIEW`; `ALL_MEMBERS_CAN_VIEW`; `ALL_MANAGERS_CAN_VIEW`; `ALL_OWNERS_CAN_VIEW` (documented in the resource schema) | All | Controls who can read group messages/conversations. Do not confuse with discoverability or member-list visibility. |
| `whoCanViewMembership` | `who_can_view_membership` | Who can view group members | `ALL_IN_DOMAIN_CAN_VIEW`; `ALL_MEMBERS_CAN_VIEW`; `ALL_MANAGERS_CAN_VIEW` | All | Controls visibility of the membership list. This is separate from permission to read conversations. |

### Legacy and deprecated properties

These properties are still present in Google's resource schema and are kept here for completeness and audit compatibility. For every property below, the GAM attribute is the snake_case form of the API property name (for example `whoCanAddReferences` becomes `who_can_add_references`). New configurations should use the replacement property.

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
| `messageDisplayFont` | `DEFAULT_FONT`; `FIXED_WIDTH_FONT` in legacy schema | Google says the default display font always has the value `DEFAULT_FONT`. |
| `whoCanAddReferences` | `NONE` (Google says the value is always `NONE`) | Legacy forum; functionality no longer supported in the Google Groups UI. |

### Groups Settings API methods

| Method | Endpoint | Purpose |
|---|---|---|
| `groups.get` | `GET /groups/v1/groups/{groupUniqueId}` | Retrieve a group's settings. |
| `groups.patch` | `PATCH /groups/v1/groups/{groupUniqueId}` | Partially update a group's settings. |
| `groups.update` | `PUT /groups/v1/groups/{groupUniqueId}` | Update a group's settings. |

## 3. Admin SDK Directory API — Group resource

These are properties of the Directory group object, not Groups Settings API moderation settings.

| API property | GAM command / attribute | Human-readable name | Type / values | Description / notes |
|---|---|---|---|---|
| `adminCreated` | `admincreated` | Created by administrator | Boolean; read-only | True if created by an administrator rather than an end user. |
| `aliases[]` | `aliases` / alias subcommands | Group aliases | Array of email addresses; read-only in Group object | Manage through the `groups.aliases` API resource, not by editing this returned field. |
| `description` | `description` | Group description | String; max 4,096 characters | Purpose/description. |
| `directMembersCount` | `directmemberscount` | Direct member count | Int64 returned as string | Counts direct users only; members inherited through nested groups are not included. |
| `email` | `email` | Primary email address | Email address | Unique primary address; required at group creation. |
| `etag` | `etag` (read-only) | Entity tag | String | Resource version identifier. |
| `id` | `id` (read-only) | Group ID | String | Immutable unique identifier; can be used as `groupKey` in API requests. |
| `kind` | `kind` (read-only) | Resource kind | `admin#directory#group` | Identifies the Directory API resource type. |
| `name` | `name` | Group display name | String | Display name. |
| `nonEditableAliases[]` | `noneditablealiases` (read-only) | Non-editable aliases | Array of email addresses | Functioning aliases outside the primary domain/subdomains; read-only. |

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

## 4. Cloud Identity Groups API — group classification and metadata

A “security group” is not defined by a Groups Settings API permission. Google uses Cloud Identity group labels to classify group types. A Google Group may also be assigned the security label. The security label is an immutable classification once added; it cannot be removed. Dynamic groups use a separate label and query metadata.

| API property / label | GAM support / spelling | Human-readable name | Values / format | Applies to | Description / notes |
|---|---|---|---|---|---|
| `name` | Cloud Identity API resource name | Resource name | `groups/{groupId}` | Cloud Identity groups | Output-only resource identifier. |
| `groupKey` | `groupKey` | Primary group key | EntityKey, usually group email | Cloud Identity groups | Required identity key for the group. |
| `additionalGroupKeys[]` | `additionalGroupKeys` | Additional group keys | Array of EntityKey | Cloud Identity groups | Output-only additional identifiers. |
| `parent` | `parent` | Parent resource | `customers/{customerId}` or `identitysources/{identitySource}` | Cloud Identity groups | Required, immutable resource hierarchy parent. Google Groups use the customer resource; identity-mapped groups use an identity source. |
| `displayName` | `displayName` | Display name | String | Cloud Identity groups | Display name of the group. |
| `description` | `description` | Description | String; max 4,096 characters | Cloud Identity groups | Extended description. |
| `createTime` | `createTime` | Creation time | RFC 3339 timestamp; output-only | Cloud Identity groups | Creation timestamp. |
| `updateTime` | `updateTime` | Last update time | RFC 3339 timestamp; output-only | Cloud Identity groups | Last update timestamp. |
| `labels` | `labels` | Group classification / state labels | Map of label key to empty value | Cloud Identity groups | Required classification labels. See the specific labels below. |
| `labels["cloudidentity.googleapis.com/groups.discussion_forum"]` | Label key | Google Group / discussion forum | Empty value | Standard Google Groups | Default label for Google Groups. |
| `labels["cloudidentity.googleapis.com/groups.security"]` | `makesecuritygroup` in GAM7 where supported | Security group | Empty value | Google Groups classified as security groups | Adds security-group classification to an existing Google Group. Google documents this as irreversible: it cannot be removed. Check GAM version and API permissions before applying. |
| `labels["cloudidentity.googleapis.com/groups.dynamic"]` | Cloud Identity dynamic-group workflow | Dynamic group | Empty value | Dynamic groups | Marks a dynamic group. Membership is calculated from a query rather than maintained only by manual member additions. |
| `labels["cloudidentity.googleapis.com/groups.locked"]` | Cloud Identity API | Locked group | Empty value | Supported Google Groups | Adding this label locks the group; removing it unlocks the group. |
| `labels["system/groups/external"]` | Cloud Identity API | Identity-mapped external group | Empty value | Cloud Search identity-mapped groups | Used for external identity-mapped groups. |
| `dynamicGroupMetadata` | Cloud Identity API | Dynamic group metadata | Object | Dynamic groups | Contains query definitions and output-only status. |
| `dynamicGroupMetadata.queries[]` | Cloud Identity API | Dynamic membership queries | `resourceType` plus query string | Dynamic groups | Membership is the union of query results. Current documentation says only one USER resource query entry is supported and customers can create up to 500 dynamic groups. |
| `dynamicGroupMetadata.status` | Cloud Identity API | Dynamic group status | Object; output-only | Dynamic groups | Reports the dynamic group's processing status. |
| `externalIds[]` | Cloud Identity API | External identifiers | Array of `ExternalId`; supported namespace `system/external` | Groups integrated with external identity sources | Lets external identity providers/directory sync tools associate their native identifier with the group. |

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

## 5. Settings shown in Google Groups UI but not exposed as a Groups Settings API property

The following UI controls are identified in GAM7's “GUI API Group settings mapping” as not available through the Groups Settings API. Availability and labels can change in the Google Groups UI.

| Admin Console / Google Groups UI control | Groups Settings API property | Notes |
|---|---|---|
| Welcome message | None documented | UI feature; no corresponding property in the Groups Settings API resource. |
| Enable shared labels for this group | None documented | Not exposed as a Groups Settings API property. |
| Identification required for new members | None documented | Not exposed as a Groups Settings API property. |
| Who can view member email addresses | None documented | Distinct from `whoCanViewMembership`; member-list visibility does not necessarily expose email addresses. |
| Allow Email Posting | None documented as a separate property | Do not confuse with `whoCanPostMessage` or `allowWebPosting`. |
| Who can reply privately to authors | None documented | No corresponding Groups Settings API property in the mapping. |
| Who can attach files | None documented | No corresponding Groups Settings API property in the mapping. |
| Subject prefix | None documented | No corresponding property in the mapping. |
| Standard Groups footer | None documented | Distinct from API `includeCustomFooter` / `customFooterText`. |
| Auto replies | None documented | No corresponding property in the mapping. |
| Conversation mode | None documented | No corresponding property in the mapping. |
| Who can manage custom roles | None documented as a direct property | `customRolesEnabledForSettingsToBeMerged` is read-only and is not a permission setter. |

This table is a mapping of documented UI controls, not a claim that no Google API anywhere can affect any related behaviour. Some controls may be global Admin Console settings, user-level preferences, product features, or unavailable to public APIs.

## 6. Member-level settings — separate from group-level settings

These are not properties of the Groups Settings API `groups` resource. The Directory API membership resource has its own properties; its methods are listed under [Directory API group methods](#directory-api-group-methods). GAM examples for member management are in [Section 7](#member-management-examples).

| Membership property / GAM concept | Human-readable name | Typical values | Applies to | Description |
|---|---|---|---|---|
| `email` | Member email | Email address | Group membership | Identity of the member. |
| `role` | Membership role | `OWNER`; `MANAGER`; `MEMBER` | Group membership | Role held by the user/group in the group. |
| `type` | Member type | `USER`; `GROUP`; `CUSTOMER` (as supported by API) | Group membership | Type of entity that is a member. |
| `status` | Membership status | `ACTIVE`; `PENDING` (API-dependent) | Group membership | Membership state. |
| `delivery_settings` / GAM delivery option | Email delivery | `ALL_MAIL`; `DAILY`; `DIGEST`; `NONE` (GAM commonly uses `allmail`, `daily`, `digest`, `nomail`/`none`) | Individual member | Controls how much group email an individual member receives. This is not a group-wide setting. |
| Member role update | Change role | `OWNER`; `MANAGER`; `MEMBER` | Individual member | Use Directory API membership methods or GAM membership commands. |

## 7. GAM commands for inventory, export, backup and changes

### List all groups and settings

```bash
gam print groups settings
```

### Export all groups with all available Directory and Groups Settings fields

```bash
gam print groups allfields
```

### Export all group settings to CSV

```bash
gam redirect csv groups-settings.csv print groups settings
```

### Inspect one group

```bash
gam info group group@example.org
```

### Display all fields for one group

```bash
gam group group@example.org print allfields
```

### JSON backup of settings

GAM7 documentation shows exporting settings with `formatjson` and restoring from the JSON column. Example:

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
```

GAM syntax evolves. Confirm accepted attribute/value spellings in the installed GAM7 help before applying changes to production groups.

### Member management examples

```bash
# Add a member
gam update group group@example.org add member user@example.net

# Add a manager
gam update group group@example.org add manager manager@example.net

# Change an existing member's delivery setting
gam update group group@example.org update member nomail user@example.net

# Change role (check exact syntax against installed GAM release)
gam update group group@example.org update manager user@example.net
```

## 8. Practical interpretation / cautions

### Interaction rules between settings

| Setting / combination | Behaviour |
|---|---|
| `archiveOnly=true` | Deactivates the group, rejects new messages and forces `whoCanPostMessage=NONE_CAN_POST`. Re-enabling it resets posting permission to `ALL_MANAGERS_CAN_POST`. |
| `whoCanPostMessage=NONE_CAN_POST` while `archiveOnly=false` | Google rejects the update. |
| `allowExternalMembers=false` | Google ignores updates to `whoCanAddExternalMembers`. |
| `allowExternalMembers` vs `whoCanPostMessage` | `allowExternalMembers` controls membership only. Whether non-members outside the organisation can post depends on `whoCanPostMessage`, moderation and Workspace-wide sharing policies. |
| `replyTo=REPLY_TO_CUSTOM` | `customReplyTo` must contain a valid email address. |
| `sendMessageDenyNotification=true` | Enables the rejection notification; `defaultMessageDenyNotificationText` customises its text. |
| `whoCanPostMessage=ANYONE_CAN_POST` | Google recommends `messageModerationLevel=MODERATE_NON_MEMBERS` to reduce spam. |
| `membersCanPostAsTheGroup=true` | Individual/new-member moderation settings do not apply to messages sent as the group. |
| `whoCanDiscoverGroup` vs `whoCanViewGroup` vs `whoCanViewMembership` | Visibility is multi-dimensional. Discovery (can users find the group), conversation visibility (can they read messages), membership-list visibility, and member email-address visibility are separate concepts and are not equivalent. |

### General cautions

1. **Nonprofit edition:** Google Workspace for Nonprofits uses the same Groups Settings API schema as other Google Workspace editions; it does not define a separate schema. API availability and behaviour can still vary by edition, administrator privileges and service settings.
2. **Security classification is not a posting setting:** `whoCanPostMessage`, `whoCanViewGroup`, etc. do not make a group a security group. The Cloud Identity `groups.security` label is the relevant classification.
3. **Dynamic groups are different:** Use Cloud Identity Groups API for dynamic membership metadata and query definitions; do not expect the ordinary Groups Settings API to manage the query.
4. **Legacy properties:** Google's schema still documents many deprecated forum permissions. They are included here for completeness and audit compatibility, but new configurations should use the consolidated moderation fields (`whoCanModerateMembers`, `whoCanModerateContent`, `whoCanAssistContent`).
5. **Global policy can override or constrain group settings:** Admin Console sharing settings, trust rules, domain policies and other Workspace controls may restrict what a group-level setting can do.
6. **Read-only / ignored fields:** Do not assume every returned property is writable. `kind`, `customRolesEnabledForSettingsToBeMerged`, Directory identifiers/counts, and Cloud Identity timestamps/resource names are read-only; some deprecated fields may be ignored or have fixed values.

## 9. Official and community references

| Reference | Why it matters |
|---|---|
| [Google Groups Settings API — Groups resource](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups) | Primary source for the complete Groups Settings API schema, properties, enumerated values, deprecation notes and supported languages. |
| [Google Groups Settings API — methods](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups) | `get`, `update` and `patch` methods for group settings. |
| [Google Admin SDK Directory API — Group resource](https://developers.google.com/workspace/admin/directory/reference/rest/v1/groups) | Primary source for Directory group fields and group CRUD methods. |
| [Google Admin SDK Directory API — groups and members](https://developers.google.com/workspace/admin/directory/reference/rest) | Group aliases and membership methods. |
| [Google Cloud Identity Groups API — Group resource](https://cloud.google.com/identity/docs/reference/rest/v1/groups) | Primary source for Cloud Identity group metadata, labels, dynamic group metadata and external IDs. |
| [GAM7 — Groups wiki](https://github.com/GAM-team/GAM/wiki/Groups) | GAM syntax, API/UI mapping, `print groups settings`, JSON export/restore and security-group commands. |
| [GAM7 — Groups membership wiki](https://github.com/GAM-team/GAM/wiki/Groups-Membership) | GAM member roles and per-member delivery preferences. |

---

Google's API references are living documentation; re-check the official schema and the installed GAM7 help before using this as an operational change specification.
