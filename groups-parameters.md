<!--
  SPDX-FileCopyrightText: 2026 Chemin-Neuf
  SPDX-License-Identifier: GPL-3.0-only

  Major Contributors: GPT-6 Luna (OpenAI / GitHub Copilot)
  Last Updated: 2026-11-10
-->
# Google Workspace Groups — API and GAM configuration reference

**Research checked:** 10 November 2026
**Scope:** Google Workspace Groups Settings API v1, Admin SDK Directory API `groups` resource, Cloud Identity Groups API v1 group metadata, and GAMADV-XTD3 command mapping.

> **Important scope note:** “All group settings” is not one API. The Groups Settings API covers email/discussion permissions and behaviour. The Directory API covers the directory group object and membership. Cloud Identity Groups API covers group classification, dynamic groups, and security-group metadata. Some Google Groups UI controls are not exposed by any of these group-level APIs. Member-specific subscription/delivery settings are also separate from group-level settings.

## 1. API overview

| API / resource | What it manages | Main methods / endpoint | GAM relevance |
|---|---|---|---| | Groups Settings API v1 — `groups` | Email posting, visibility, membership access, moderation, archive, replies, footer, Collaborative Inbox and legacy forum settings | `GET https://www.googleapis.com/groups/v1/groups/{groupEmail}`; `PUT` or `PATCH` same endpoint | `gam info group`; `gam print groups settings`; `gam update group ... <attribute> <value>` |
| Admin SDK Directory API v1 — `groups` | Group email/name/description, aliases, identifiers and direct member count | `GET/POST/PATCH/PUT/DELETE https://admin.googleapis.com/admin/directory/v1/groups/...` | `gam info group`; `gam create group`; `gam update group`; `gam delete group` |
| Admin SDK Directory API — `groups.aliases` | Add/list/remove aliases | `/admin/directory/v1/groups/{groupKey}/aliases` | GAM alias subcommands |
| Admin SDK Directory API — `groups.members` | Membership, role and member delivery preference | `/admin/directory/v1/groups/{groupKey}/members` | `gam update group ... add member`; `gam update group ... update member ...` |
| Cloud Identity Groups API v1 — `groups` | Group classification labels, security/dynamic group metadata, external identifiers and resource hierarchy | `https://cloudidentity.googleapis.com/v1/groups/...` | GAM supports some security-group operations; dynamic group management is a separate workflow |

### API vs GAM naming

- The **API property** column below uses the exact JSON property spelling (camelCase). - GAMADV-XTD3 accepts group attributes in its `gam update group` command. Its documentation commonly shows lowercase snake_case forms such as `who_can_post_message` and `enablecollaborativeinbox`; GAM's parser also accepts many API-style names. The exact accepted aliases can vary by GAM release. Check the installed build with `gam help update group` and `gam help print groups`. - Do not assume a property is writable just because it appears in a GET response. Some properties are deprecated, read-only, ignored on update, or have conditions. - The Groups Settings API represents several boolean values as strings in its resource schema; use `true` / `false` as shown by Google and GAM. - A GAM attribute being absent from an example is not proof that the API property is unsupported by GAM.

## 2. Groups Settings API — complete documented property inventory

The table includes the current settings, legacy/deprecated properties still present in Google's resource schema, and the resource metadata fields returned by the Groups Settings API. “All Google Groups” means a standard Google Group and its Collaborative Inbox variant; it does **not** imply every setting is meaningful in every UI mode. Forum/topic-specific legacy controls are marked accordingly.

| API property | GAM attribute / practical spelling | Human-readable setting | Allowed values / format | Applicability | Description / notes |
|---|---|---|---|---|---| | `kind` | Output only | Resource kind | `groupsSettings#groups` | All | Identifies a Groups Settings API resource. Read-only. |
| `email` | `email` | Group email address | Email address | All | Primary group address. Change through Directory API / GAM group update, not the Groups Settings API. |
| `name` | `name` | Group name | Text; max 75 characters | All | Display name of the group. |
| `description` | `description` | Group description | Text; max 4,096 characters | All | Description of the group's purpose. |
| `whoCanJoin` | `who_can_join` | Who can join the group | `ANYONE_CAN_JOIN`; `ALL_IN_DOMAIN_CAN_JOIN`; `INVITED_CAN_JOIN`; `CAN_REQUEST_TO_JOIN` | All | Controls whether anyone, anyone in the Workspace domain, invitees only, or requesters can join. External membership is additionally constrained by `allowExternalMembers` and domain policy. |
| `whoCanViewMembership` | `who_can_view_membership` | Who can view group members | `ALL_IN_DOMAIN_CAN_VIEW`; `ALL_MEMBERS_CAN_VIEW`; `ALL_MANAGERS_CAN_VIEW` | All | Controls visibility of the membership list. This is separate from permission to read conversations. |
| `whoCanViewGroup` | `who_can_view_group` | Who can view conversations | `ANYONE_CAN_VIEW`; `ALL_IN_DOMAIN_CAN_VIEW`; `ALL_MEMBERS_CAN_VIEW`; `ALL_MANAGERS_CAN_VIEW`; `ALL_OWNERS_CAN_VIEW` (documented in the resource schema) | All | Controls who can read group messages/conversations. Do not confuse with discoverability or member-list visibility. |
| `whoCanInvite` | `who_can_invite` | Who can invite members (legacy) | `ALL_MEMBERS_CAN_INVITE`; `ALL_MANAGERS_CAN_INVITE`; `ALL_OWNERS_CAN_INVITE`; `NONE_CAN_INVITE` | Legacy; member-management/forum permissions | Deprecated; merged into `whoCanModerateMembers`. Kept here because it remains in the API schema. |
| `whoCanAdd` | `who_can_add` | Who can directly add members (legacy) | `ALL_MEMBERS_CAN_ADD`; `ALL_MANAGERS_CAN_ADD`; `ALL_OWNERS_CAN_ADD`; `NONE_CAN_ADD` | Legacy; member-management/forum permissions | Deprecated; merged into `whoCanModerateMembers`. |
| `allowExternalMembers` | `allowexternalmembers` | Allow external members | `true`; `false` | All | Allows or blocks members outside the Workspace organisation. Google notes these are Workspace users external to the organisation; broader external posting is separately controlled. |
| `whoCanAddExternalMembers` | `who_can_add_external_members` | Who can add external members | `ONLY_ADMINS_CAN_ADD_EXTERNAL_MEMBERS`; `END_USERS_CAN_ADD_EXTERNAL_MEMBERS` | All, when external membership is enabled | Controls whether only administrators or end users can add external members. Updates are ignored when `allowExternalMembers=false`. |
| `whoCanPostMessage` | `who_can_post_message` | Who can post messages | `NONE_CAN_POST`; `ALL_MANAGERS_CAN_POST`; `ALL_MEMBERS_CAN_POST`; `ALL_OWNERS_CAN_POST`; `ALL_IN_DOMAIN_CAN_POST`; `ANYONE_CAN_POST` | All | Controls who may send messages to the group. `NONE_CAN_POST` requires archive-only/inactive state. Google recommends `MODERATE_NON_MEMBERS` when `ANYONE_CAN_POST` is used. |
| `allowWebPosting` | `allow_web_posting` | Allow posting on the web | `true`; `false` | Groups with Google Groups web interface | Enables members to post through the Google Groups web interface. If false, members use email/Gmail to communicate with the group. |
| `primaryLanguage` | `primary_language` | Primary group language | Supported language tag, e.g. `en`, `fr`, `nl`, `en-GB` | All | Language used for group-generated text. Case-sensitive; use one of Google's documented supported codes. |
| `maxMessageBytes` | `max_message_bytes` | Maximum message size (legacy) | Integer; API marks deprecated; documented maximum is 25 MB | Legacy | Deprecated. Google states the maximum message size is 25 MB; do not rely on this field to change the limit. |
| `isArchived` | `is_archived` | Conversation history / archive messages | `true`; `false` | All | When true, archive messages sent to the group. When false, new messages are not archived; previously archived messages remain. This is not the same as archiving/deactivating the group. |
| `archiveOnly` | `archive_only` | Archive-only / deactivate group | `true`; `false` | All | When true, group becomes inactive and new messages are rejected; old conversations remain browsable/searchable. Google sets `whoCanPostMessage=NONE_CAN_POST`. Turning it off resets posting permission to `ALL_MANAGERS_CAN_POST`. |
| `messageModerationLevel` | `message_moderation_level` | Message moderation | `MODERATE_ALL_MESSAGES`; `MODERATE_NON_MEMBERS`; `MODERATE_NEW_MEMBERS`; `MODERATE_NONE` | All | Determines which incoming messages require moderator approval. Moderation of posts made as the group is treated differently: individual/new-member moderation does not apply to those posts. |
| `spamModerationLevel` | `spam_moderation_level` | Spam moderation | `ALLOW`; `MODERATE`; `SILENTLY_MODERATE`; `REJECT` | All | Determines what happens to messages Google classifies as spam: allow, queue for moderation (with or without notification), or reject. |
| `replyTo` | `reply_to` | Default reply destination | `REPLY_TO_CUSTOM`; `REPLY_TO_SENDER`; `REPLY_TO_LIST`; `REPLY_TO_OWNER`; `REPLY_TO_IGNORE`; `REPLY_TO_MANAGERS` | All | Controls the default recipient when a user replies to a group message. `REPLY_TO_OWNER` means owners, not managers; `REPLY_TO_MANAGERS` includes managers and owners. |
| `customReplyTo` | `custom_reply_to` | Custom reply-to address | Email address | All, conditional | Required when `replyTo=REPLY_TO_CUSTOM`; otherwise not used. Google describes this as an address defined by an account administrator. |
| `includeCustomFooter` | `include_custom_footer` | Include custom footer | `true`; `false` | All | Enables/disables the custom footer on group messages. |
| `customFooterText` | `custom_footer_text` | Custom footer text | Text; max 1,000 characters | All | Text appended as the custom footer when enabled. |
| `sendMessageDenyNotification` | `send_message_deny_notification` | Notify sender when a message is rejected | `true`; `false` | All | Sends or suppresses a rejection notification to the author when a message is denied by group owners/moderators. |
| `defaultMessageDenyNotificationText` | `default_message_deny_notification_text` | Rejection notification text | Text; max 10,000 characters | All, conditional | Custom text for rejection notifications. Requires `sendMessageDenyNotification=true`. |
| `showInGroupDirectory` | `show_in_group_directory` | Show in Groups directory (legacy) | `true`; `false` | Legacy | Deprecated; Google says this is merged into `whoCanDiscoverGroup`. |
| `allowGoogleCommunication` | `allow_google_communication` | Allow Google communication (legacy) | `true`; `false` | Legacy | Deprecated legacy preference controlling Google communications to group managers. Retained in the resource schema. |
| `membersCanPostAsTheGroup` | `members_can_post_as_the_group` | Allow members to post as the group | `true`; `false` | All; relevant when members can post | Allows members to send messages using the group's address rather than their own. When true, per-user/new-member message moderation does not apply to messages posted as the group. |
| `messageDisplayFont` | `message_display_font` | Message display font (legacy) | `DEFAULT_FONT`; `FIXED_WIDTH_FONT` in legacy schema | Legacy | Deprecated; Google says the default display font always has the value `DEFAULT_FONT`. |
| `includeInGlobalAddressList` | `include_in_global_address_list` / `gal` | Include in Global Address List (GAL) | `true`; `false` | All | Controls whether the group is included in the Workspace Global Address List. |
| `whoCanLeaveGroup` | `who_can_leave_group` | Who can leave the group | `ALL_MEMBERS_CAN_LEAVE`; `ALL_MANAGERS_CAN_LEAVE`; `NONE_CAN_LEAVE` | All | Controls whether members/managers can leave voluntarily. Owners/managers semantics should be tested against the current group role model. |
| `whoCanContactOwner` | `who_can_contact_owner` | Who can contact group owners | `ALL_IN_DOMAIN_CAN_CONTACT`; `ALL_MANAGERS_CAN_CONTACT`; `ALL_MEMBERS_CAN_CONTACT`; `ANYONE_CAN_CONTACT` | All | Controls who can use the contact-owner function. |
| `whoCanAddReferences` | `who_can_add_references` | Who can add references (legacy) | `NONE` (Google says value is always `NONE`) | Legacy forum | Deprecated; functionality no longer supported in the Google Groups UI. |
| `whoCanAssignTopics` | `who_can_assign_topics` | Who can assign topics (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanUnassignTopic` | `who_can_unassign_topic` | Who can unassign topics (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanTakeTopics` | `who_can_take_topics` | Who can take/claim topics (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanMarkDuplicate` | `who_can_mark_duplicate` | Who can mark topics as duplicate (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanMarkNoResponseNeeded` | `who_can_mark_no_response_needed` | Who can mark no response needed (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanMarkFavoriteReplyOnAnyTopic` | `who_can_mark_favorite_reply_on_any_topic` | Who can mark a favourite reply on any topic (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanMarkFavoriteReplyOnOwnTopic` | `who_can_mark_favorite_reply_on_own_topic` | Who can mark a favourite reply on own topic (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanUnmarkFavoriteReplyOnAnyTopic` | `who_can_unmark_favorite_reply_on_any_topic` | Who can remove favourite-reply status (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanEnterFreeFormTags` | `who_can_enter_free_form_tags` | Who can enter free-form tags (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `whoCanModifyTagsAndCategories` | `who_can_modify_tags_and_categories` | Who can modify tags and categories (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Legacy forum / Collaborative Inbox topic workflow | Deprecated; merged into `whoCanAssistContent`. |
| `favoriteRepliesOnTop` | `favorite_replies_on_top` | Show favourite replies at top | `true`; `false` | Forum / Collaborative Inbox topic workflow | Controls whether favourite replies are displayed above other replies. Not explicitly marked deprecated in the current resource description. |
| `whoCanApproveMembers` | `who_can_approve_members` | Who can approve membership requests (legacy) | `ALL_MEMBERS_CAN_APPROVE`; `ALL_MANAGERS_CAN_APPROVE`; `ALL_OWNERS_CAN_APPROVE`; `NONE_CAN_APPROVE` | Legacy member moderation | Deprecated; merged into `whoCanModerateMembers`. |
| `whoCanBanUsers` | `who_can_ban_users` | Who can ban/deny users (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy member moderation | Deprecated; merged into `whoCanModerateMembers`. |
| `whoCanModifyMembers` | `who_can_modify_members` | Who can modify member roles (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy member moderation | Deprecated; merged into `whoCanModerateMembers`. |
| `whoCanApproveMessages` | `who_can_approve_messages` | Who can approve pending messages (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy content moderation | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanDeleteAnyPost` | `who_can_delete_any_post` | Who can delete any post (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. Authors can always delete their own posts. |
| `whoCanDeleteTopics` | `who_can_delete_topics` | Who can delete topics (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanLockTopics` | `who_can_lock_topics` | Who can lock topics (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanMoveTopicsIn` | `who_can_move_topics_in` | Who can move topics into the group (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanMoveTopicsOut` | `who_can_move_topics_out` | Who can move topics out of the group (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanPostAnnouncements` | `who_can_post_announcements` | Who can post announcements (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanHideAbuse` | `who_can_hide_abuse` | Who can hide/report abusive posts (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanMakeTopicsSticky` | `who_can_make_topics_sticky` | Who can make topics sticky (legacy) | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Legacy forum | Deprecated; merged into `whoCanModerateContent`. |
| `whoCanModerateMembers` | `who_can_moderate_members` | Who can moderate/manage members | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Current; all applicable Groups | Current consolidated permission for member management. Supersedes legacy invite/add/approve/ban/modify controls. |
| `whoCanModerateContent` | `who_can_moderate_content` | Who can moderate content | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `OWNERS_ONLY`; `NONE` | Current; discussion/content workflows | Current consolidated permission for content moderation. Supersedes legacy message approval, delete, lock, move, announcement, abuse and sticky-topic controls. |
| `whoCanAssistContent` | `who_can_assist_content` | Who can assist/manage discussion metadata | `ALL_MEMBERS`; `OWNERS_AND_MANAGERS`; `MANAGERS_ONLY`; `OWNERS_ONLY`; `NONE` | Current; Collaborative Inbox / forum workflows | Current consolidated permission for topic assignments, tags, duplicate status, response status and favourite replies. |
| `customRolesEnabledForSettingsToBeMerged` | Read-only; no update | Custom roles included in merged settings | `true`; `false` | Groups with custom roles / merged moderation settings | Read-only. Google ignores UPDATE/PATCH attempts. |
| `enableCollaborativeInbox` | `enablecollaborativeinbox` / `collaborative` | Collaborative Inbox | `true`; `false` | Standard Google Group; enables Collaborative Inbox mode | Turns Collaborative Inbox functionality on/off for the group. It is a setting on a Google Group, not a separate Directory group resource type. |
| `whoCanDiscoverGroup` | `who_can_discover_group` | Who can discover the group | `ANYONE_CAN_DISCOVER`; `ALL_IN_DOMAIN_CAN_DISCOVER`; `ALL_MEMBERS_CAN_DISCOVER` | All | Controls discoverability in Google Groups. It is distinct from viewing messages and viewing membership. |
| `defaultSender` | `default_sender` | Default sender identity | `DEFAULT_SELF`; `GROUP` | Groups where members can post as the group | Determines whether the default sender is the individual user or the group when posting as the group. |

### Important interaction rules

| Setting / combination | Behaviour |
|---|---| | `archiveOnly=true` | Deactivates the group, rejects new messages and forces `whoCanPostMessage=NONE_CAN_POST`. Re-enabling it resets posting permission to `ALL_MANAGERS_CAN_POST`. |
| `whoCanPostMessage=NONE_CAN_POST` while `archiveOnly=false` | Google rejects the update. |
| `whoCanAddExternalMembers` while `allowExternalMembers=false` | Google ignores updates to `whoCanAddExternalMembers`. |
| `replyTo=REPLY_TO_CUSTOM` | `customReplyTo` must contain a valid email address. |
| `sendMessageDenyNotification=true` | Enables the rejection notification; `defaultMessageDenyNotificationText` customises its text. |
| `whoCanPostMessage=ANYONE_CAN_POST` | Google recommends `messageModerationLevel=MODERATE_NON_MEMBERS` to reduce spam. |
| `membersCanPostAsTheGroup=true` | Individual/new-member moderation settings do not apply to messages sent as the group. |
| `whoCanDiscoverGroup` vs `whoCanViewGroup` | Discovery controls whether users can find the group; view controls access to conversations. They are not equivalent. |
| `whoCanViewMembership` vs `whoCanViewGroup` | Member-list visibility and conversation visibility are separate permissions. |
| Deprecated moderation properties | Prefer the consolidated `whoCanModerateMembers`, `whoCanModerateContent` and `whoCanAssistContent` properties for current configurations. |

## 3. Admin SDK Directory API — Group resource

These are properties of the Directory group object, not Groups Settings API moderation settings.

| API property | GAM command / attribute | Human-readable name | Type / values | Applies to | Description / notes |
|---|---|---|---|---|---| | `id` | `id` (read-only) | Group ID | String | Directory-managed Google Groups | Immutable unique identifier; can be used as `groupKey` in API requests. |
| `email` | `email` | Primary email address | Email address | Directory-managed Google Groups | Unique primary address; required at group creation. |
| `name` | `name` | Group display name | String | Directory-managed Google Groups | Display name. |
| `description` | `description` | Group description | String; max 4,096 characters | Directory-managed Google Groups | Purpose/description. |
| `adminCreated` | `admincreated` | Created by administrator | Boolean; read-only | Directory-managed Google Groups | True if created by an administrator rather than an end user. |
| `directMembersCount` | `directmemberscount` | Direct member count | Int64 returned as string | Directory-managed Google Groups | Counts direct users only; members inherited through nested groups are not included. |
| `kind` | `kind` (read-only) | Resource kind | `admin#directory#group` | Directory-managed Google Groups | Identifies the Directory API resource type. |
| `etag` | `etag` (read-only) | Entity tag | String | Directory-managed Google Groups | Resource version identifier. |
| `aliases[]` | `aliases` / alias subcommands | Group aliases | Array of email addresses; read-only in Group object | Directory-managed Google Groups | Manage through the `groups.aliases` API resource, not by editing this returned field. |
| `nonEditableAliases[]` | `noneditablealiases` (read-only) | Non-editable aliases | Array of email addresses | Directory-managed Google Groups | Functioning aliases outside the primary domain/subdomains; read-only. |

### Directory API group methods

| Method | Endpoint | Purpose |
|---|---|---| | `groups.get` | `GET /admin/directory/v1/groups/{groupKey}` | Retrieve group properties. |
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
|---|---|---|---|---|---| | `name` | Cloud Identity API resource name | Resource name | `groups/{groupId}` | Cloud Identity groups | Output-only resource identifier. |
| `groupKey` | `groupKey` | Primary group key | EntityKey, usually group email | Cloud Identity groups | Required identity key for the group. |
| `additionalGroupKeys[]` | `additionalGroupKeys` | Additional group keys | Array of EntityKey | Cloud Identity groups | Output-only additional identifiers. |
| `parent` | `parent` | Parent resource | `customers/{customerId}` or `identitysources/{identitySource}` | Cloud Identity groups | Required, immutable resource hierarchy parent. Google Groups use the customer resource; identity-mapped groups use an identity source. |
| `displayName` | `displayName` | Display name | String | Cloud Identity groups | Display name of the group. |
| `description` | `description` | Description | String; max 4,096 characters | Cloud Identity groups | Extended description. |
| `createTime` | `createTime` | Creation time | RFC 3339 timestamp; output-only | Cloud Identity groups | Creation timestamp. |
| `updateTime` | `updateTime` | Last update time | RFC 3339 timestamp; output-only | Cloud Identity groups | Last update timestamp. |
| `labels` | `labels` | Group classification / state labels | Map of label key to empty value | Cloud Identity groups | Required classification labels. See the specific labels below. |
| `labels["cloudidentity.googleapis.com/groups.discussion_forum"]` | Label key | Google Group / discussion forum | Empty value | Standard Google Groups | Default label for Google Groups. |
| `labels["cloudidentity.googleapis.com/groups.security"]` | `makesecuritygroup` in GAMADV-XTD3 where supported | Security group | Empty value | Google Groups classified as security groups | Adds security-group classification to an existing Google Group. Google documents this as irreversible: it cannot be removed. Check GAM version and API permissions before applying. |
| `labels["cloudidentity.googleapis.com/groups.dynamic"]` | Cloud Identity dynamic-group workflow | Dynamic group | Empty value | Dynamic groups | Marks a dynamic group. Membership is calculated from a query rather than maintained only by manual member additions. |
| `labels["cloudidentity.googleapis.com/groups.locked"]` | Cloud Identity API | Locked group | Empty value | Supported Google Groups | Adding this label locks the group; removing it unlocks the group. |
| `labels["system/groups/external"]` | Cloud Identity API | Identity-mapped external group | Empty value | Cloud Search identity-mapped groups | Used for external identity-mapped groups. |
| `dynamicGroupMetadata` | Cloud Identity API | Dynamic group metadata | Object | Dynamic groups | Contains query definitions and output-only status. |
| `dynamicGroupMetadata.queries[]` | Cloud Identity API | Dynamic membership queries | `resourceType` plus query string | Dynamic groups | Membership is the union of query results. Current documentation says only one USER resource query entry is supported and customers can create up to 500 dynamic groups. |
| `dynamicGroupMetadata.status` | Cloud Identity API | Dynamic group status | Object; output-only | Dynamic groups | Reports the dynamic group's processing status. |
| `externalIds[]` | Cloud Identity API | External identifiers | Array of `ExternalId`; supported namespace `system/external` | Groups integrated with external identity sources | Lets external identity providers/directory sync tools associate their native identifier with the group. |

**Type distinctions**

| Group type / mode | Groups Settings API | Directory API | Cloud Identity Groups API | Notes |
|---|---|---|---|---| | Standard Google Group / mailing list | Yes | Yes | Group metadata/classification may be exposed | Typical email-enabled group. |
| Collaborative Inbox | Yes | Yes | Google Group classification | It is a Google Group with `enableCollaborativeInbox=true`, not a separate Directory resource type. |
| Google Groups discussion forum | Yes | Yes | `groups.discussion_forum` label | Discussion/forum features and topic permissions may be relevant. |
| Security group | Not the defining mechanism | Google Group object may remain | `groups.security` label | Security classification is separate from email posting permissions. |
| Dynamic group | Not the defining mechanism | Not the primary dynamic-membership interface | `groups.dynamic` plus `dynamicGroupMetadata` | Membership is query-driven. |
| Identity-mapped external group | No ordinary Google Groups settings assumption | Not an ordinary Workspace group | `system/groups/external` label | Cloud Identity / Cloud Search identity-mapping scenario. |

## 5. Settings shown in Google Groups UI but not exposed as a Groups Settings API property

The following UI controls are identified in GAMADV-XTD3's Admin Console-to-API mapping as not available through the Groups Settings API. Availability and labels can change in the Google Groups UI.

| Admin Console / Google Groups UI control | Groups Settings API property | Notes |
|---|---|---| | Welcome message | None documented | UI feature; no corresponding property in the Groups Settings API resource. |
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

These are not properties of the Groups Settings API `groups` resource. The Directory API membership resource has its own properties, and GAM can update member role and delivery preferences.

| Membership property / GAM concept | Human-readable name | Typical values | Applies to | Description |
|---|---|---|---|---| | `email` | Member email | Email address | Group membership | Identity of the member. |
| `role` | Membership role | `OWNER`; `MANAGER`; `MEMBER` | Group membership | Role held by the user/group in the group. |
| `type` | Member type | `USER`; `GROUP`; `CUSTOMER` (as supported by API) | Group membership | Type of entity that is a member. |
| `status` | Membership status | `ACTIVE`; `PENDING` (API-dependent) | Group membership | Membership state. |
| `delivery_settings` / GAM delivery option | Email delivery | `ALL_MAIL`; `DAILY`; `DIGEST`; `NONE` (GAM commonly uses `allmail`, `daily`, `digest`, `nomail`/`none`) | Individual member | Controls how much group email an individual member receives. This is not a group-wide setting. |
| Member role update | Change role | `OWNER`; `MANAGER`; `MEMBER` | Individual member | Use Directory API membership methods or GAM membership commands. |

GAM examples:

```bash # Add a member gam update group group@example.org add member user@example.net

# Add a manager gam update group group@example.org add manager manager@example.net
# Change an existing member's delivery setting gam update group group@example.org update member nomail user@example.net
# Change role (check exact syntax against installed GAM release) gam update group group@example.org update manager user@example.net ```
## 7. GAM commands for inventory, export, backup and changes
### List all groups and settings

```bash gam print groups settings ```

### Export all groups with all available Directory and Groups Settings fields

```bash gam print groups allfields ```

### Export all group settings to CSV

```bash gam redirect csv groups-settings.csv print groups settings ```

### Inspect one group

```bash gam info group group@example.org ```

### Display all fields for one group

```bash gam group group@example.org print allfields ```

### JSON backup of settings

GAMADV-XTD3 documentation shows exporting settings with `formatjson` and restoring from the JSON column. Example:

```bash gam redirect csv groups.csv print groups query "name:test*" settings formatjson quotechar "'" ```

Restore/update from a CSV row:

```bash gam csv groups.csv quotechar "'" gam update group "~email" json "~JSON-settings" ```

Treat a restore as a change operation: test on a disposable group first, review the JSON and confirm that the group still has the same intended configuration.

### Update examples

```bash gam update group group@example.org who_can_post_message all_members_can_post gam update group group@example.org who_can_view_group all_members_can_view gam update group group@example.org who_can_view_membership all_managers_can_view gam update group group@example.org allowexternalmembers false gam update group group@example.org enablecollaborativeinbox true gam update group group@example.org is_archived true ```

GAM syntax evolves. Confirm accepted attribute/value spellings in the installed GAMADV-XTD3 help before applying changes to production groups.
## 8. Practical interpretation / cautions
1. **Nonprofit edition:** The Google Workspace for Nonprofits edition does not create a separate Groups Settings API schema. API availability and behaviour are governed by the relevant Google Workspace / Cloud Identity product, edition, administrator privileges and service settings. 2. **Security classification is not a posting setting:** `whoCanPostMessage`, `whoCanViewGroup`, etc. do not make a group a security group. The Cloud Identity `groups.security` label is the relevant classification. 3. **Collaborative Inbox is a mode:** `enableCollaborativeInbox=true` enables the feature on a Google Group; it is not a separate Directory API group type. 4. **Dynamic groups are different:** Use Cloud Identity Groups API for dynamic membership metadata and query definitions; do not expect the ordinary Groups Settings API to manage the query. 5. **External members vs external senders:** `allowExternalMembers` controls membership. It does not alone determine whether non-members outside the organisation can post; `whoCanPostMessage`, moderation and Workspace-wide sharing policies also matter. 6. **Visibility is multi-dimensional:** Discovery, conversation visibility, membership-list visibility, and member email-address visibility are separate concepts. 7. **Legacy properties:** Google's schema still documents many deprecated forum permissions. They are included here for completeness and audit compatibility, but new configurations should use the consolidated moderation fields. 8. **Global policy can override or constrain group settings:** Admin Console sharing settings, trust rules, domain policies and other Workspace controls may restrict what a group-level setting can do. 9. **Read-only / ignored fields:** Do not assume every returned property is writable. `kind`, `customRolesEnabledForSettingsToBeMerged`, Directory identifiers/counts, and Cloud Identity timestamps/resource names are read-only; some deprecated fields may be ignored or have fixed values.
## 9. Official and community references
| Reference | Why it matters |
|---|---| | [Google Groups Settings API — Groups resource](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups) | Primary source for the complete Groups Settings API schema, properties, enumerated values, deprecation notes and supported languages. |
| [Google Groups Settings API — methods](https://developers.google.com/workspace/admin/groups-settings/v1/reference/groups) | `get`, `update` and `patch` methods for group settings. |
| [Google Admin SDK Directory API — Group resource](https://developers.google.com/workspace/admin/directory/reference/rest/v1/groups) | Primary source for Directory group fields and group CRUD methods. |
| [Google Admin SDK Directory API — groups and members](https://developers.google.com/workspace/admin/directory/reference/rest) | Group aliases and membership methods. |
| [Google Cloud Identity Groups API — Group resource](https://cloud.google.com/identity/docs/reference/rest/v1/groups) | Primary source for Cloud Identity group metadata, labels, dynamic group metadata and external IDs. |
| [GAMADV-XTD3 — Groups wiki](https://github.com/taers232c/GAMADV-XTD3/wiki/Groups) | GAM syntax, API/UI mapping, `print groups settings`, JSON export/restore and security-group commands. |
| [GAMADV-XTD3 — Groups membership wiki](https://github.com/taers232c/GAMADV-XTD3/wiki/Groups-Membership) | GAM member roles and per-member delivery preferences. |
---
**Verification date:** 10 November 2026. Google's API references are living documentation; re-check the official schema and the installed GAMADV-XTD3 help before using this as an operational change specification.
