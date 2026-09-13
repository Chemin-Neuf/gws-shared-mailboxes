# **Shared Email & Collaboration Options in Google Workspace: Evaluation Matrix**

> **Status (2026-09-14):** this document is the working source of the study. Its content is
> being progressively migrated into the HTML pages of this repository — see
> `topics.html` for the migration status of each topic. **Topic 1 is final** (written and
> validated in `topic-read-access.html`, including footnotes not present here: GWSMO
> definition and the summer-2026 progressive rollout of delegation in the Gmail mobile app).
> Topics 2–3 are migrated; criteria and pending sections remain authoritative here until migrated.

This document establishes a comprehensive framework to evaluate the 7 primary mechanisms for handling shared email addresses, team inboxes, and email collaboration within Google Workspace for Nonprofits.

## **1\. Overview of Evaluated Email Sharing Approaches**

| Option Name | Mechanism Description   |
| :---- | :---- |
| **1\. Shared Password Account** | Full user account with credential sharing across multiple team members. |
| **2\. Gmail Delegation Account** | Dedicated user account accessed via Gmail Delegation (no password sharing). |
| **3\. Collaborative Inbox** | Advanced Google Group with assignment, resolution tracking, and topics interface. |
| **4\. Distribution List** | Standard Google Group routing incoming messages to individual member inboxes. |
| **5\. Email Alias / Redirection** | Secondary email identity attached to a user account or routing rule forwarding to single/multiple accounts. |
| **6\. "Send Mail As" Configuration** | Individual Gmail accounts configured with outbound custom From address permissions (paired with Groups/Aliases). |
| **7\. Email-to-Google Chat Space** | Inbound email address assigned directly to a Google Chat Space for internal discussion and triaging. |

## **2\. Evaluation Criteria & Refinement Notes**

The evaluation criteria have been refined, completed, and categorized into 10 distinct dimensions.

> * **Read Access & Platform Compatibility:** Assessing accessibility via web browsers, native desktop clients (Outlook/Thunderbird), mobile OS apps (Android/iOS), mobile web browser shortcuts, and inbox separation vs blending with personal emails.  
> * **Reply & Writing Dynamics:** Distinguishing between inbound receipt and outbound sending capabilities, client support, and sent message storage location (Shared Sent vs Personal Sent box).  
> * **Folder & Label Organization:** Distinction between standard hierarchical folders (IMAP/Outlook), Gmail labels/nested labels, and Google Groups tags/topics.  
> * **Team Collaboration & Status Visibility:** Real-time status tracking (read status, reply status, sent notification, email assignment to specific individuals, and resolved marking).  
> * **History, Search & Archiving:** Centralized searchability across past conversations, retention policy enforcement, and auditability.  
> * **Sender Identity & Signatures:** Support for "Sent on behalf of" headers, customized shared signatures vs personal signature overrides, and draft co-editing.  
> * **Contacts & Directory Access:** Auto-complete contact visibility, domain shared contacts access, and personal vs shared contact lists across interface types.  
> * **Security, Offboarding & Compliance:** Multi-Factor Authentication (MFA) compatibility, credential exposure risk, offboarding speed (revoking access without changing passwords), and Data Loss Prevention (DLP).  
> * **Admin Controls & Governance:** Audit logs (who sent, deleted, or read emails), delegation tracking, custom permissions, and licensing requirements.  
> * **API Capabilities & Automation:** Capabilities available via Google Workspace Admin SDK and Gmail API vs Google Groups API, including automated message processing and permission sync.

## **3\. Topic-by-Topic Detailed Analysis**

### **Topic 1: Read Capabilities**

| Option | Desktop Web Browser | Desktop Email Client | Mobile App (Android/iOS) | Key Read Caveats & Inbox Distinction   |
| :---- | :---- | :---- | :---- | :---- |
| **1\. Shared Password Account** | Yes (mail.google.com) | Yes (IMAP/GWSMO) | Yes (Gmail / Native) | Dedicated inbox. **Caveat:** Simultaneous multi-location logins trigger severe 2FA/security lockouts. Pinned mobile shortcuts are fragile. |
| **2\. Gmail Delegation Account** | Yes (Gmail Switcher) | No (IMAP not supported for delegates) | Yes (Native Gmail App) | Dedicated inbox in separate tab/view. **Caveat:** Dynamic session indices (/u/0/, /u/1/) make pinned mobile web shortcuts unusable. |
| **3\. Collaborative Inbox** | Yes (groups.google.com) | No | No standalone app | Isolated in Groups web UI. Mobile web access possible via pinned URL but UI is desktop-oriented and clunky. |
| **4\. Distribution List** | Yes (Personal Gmail) | Yes (Personal Client) | Yes (Personal App) | **Major Caveat:** No default visual differentiation between personal and group emails inside the inbox (requires manual filters/labels). |
| **5\. Email Alias / Redirection** | Yes (Personal Gmail) | Yes (Personal Client) | Yes (Personal App) | **Major Caveat:** Incoming alias messages blend directly into primary inbox with no default visual separation (requires user rules). |
| **6\. "Send Mail As" Config** | N/A (Outbound focus) | N/A | N/A | Outbound capability paired with Option 4 or 5\. Inbound reading behavior and lack of default separation inherit from underlying Group/Alias. |
| **7\. Email-to-Google Chat Space** | Yes (chat.google.com / Gmail Chat) | No | Yes (Google Chat / Gmail App) | Isolated inside dedicated Chat space thread with push notifications. Not formatted as a standard email inbox. |

### **Topic 2: Reply & Writing Capabilities**

| Option | Outbound & New Email Capabilities | Sent Item Storage & Team Visibility | Draft Sharing | Key Reply / Writing Caveats   |
| :---- | :---- | :---- | :---- | :---- |
| **1\. Shared Password Account** | Full outbound capability (create new emails & reply) across web Gmail, IMAP/GWSMO clients, and mobile apps. | Stored centrally in shared account's Sent folder. Fully visible to all team members logging into the account. | Yes (Native sync in Gmail Web). | No writing limitations, but concurrent session risks exist. |
| **2\. Gmail Delegation Account** | Full outbound capability (create new emails & reply) via delegated Gmail Web UI and native Gmail Mobile App. | Configurable by Admin: saved in shared account's Sent folder, or in both shared Sent and delegate's personal Sent box. | Yes (Fully shared among delegates). | Outbound sending unavailable via desktop IMAP/Outlook clients. |
| **3\. Collaborative Inbox** | **Cannot compose new outbound emails to arbitrary external recipients** from groups.google.com UI ("New conversation" posts a topic to the group). Can only reply to existing group threads. New external emails require using "Send Mail As" in personal Gmail. | Public group replies are archived in Groups web UI. **Major Caveat:** If replying "privately" (Reply to Author), the sent email goes directly to the author with **no trace or record left inside the Group interface for other members.** | No | Cannot initiate new external emails in Groups UI; private replies leave no trace in group archive. |
| **4\. Distribution List** | Requires members to individually set up "Send Mail As" in personal Gmail settings. | Stored **only in the individual sender's personal Sent box**. Invisible to other members unless group address is manually CC'd/BCC'd. | No | Zero shared visibility of outbound replies or sent history across group members. |
| **5\. Email Alias / Redirection** | Requires configuring "Send Mail As" in primary user's Gmail settings. | Saved in primary user's personal Sent folder. | No (Private to user account). | Outbound replies stay strictly in single user's personal mailbox. |
| **6\. "Send Mail As" Config** | Allows selecting shared/alias address from "From:" dropdown when composing/replying in Gmail web or mobile app. | Saved in individual sender's personal Sent box by default. | No (Private to individual account). | Drafts are strictly private to the user account composing the email. |
| **7\. Email-to-Google Chat Space** | **Very Limited / Internal only.** Replies typed in Chat Space remain internal comments. Cannot compose or send external outbound emails to original senders directly from Chat (requires Gmail). | Recorded as internal chat messages inside the Chat Space. | No | Asymmetric workflow: inbound email is readable in Chat, but outbound external replies require opening Gmail. |

### **Topic 3: Folder & Label Organization**

| Option | Organizational Mechanism | Shared Sync Across Team | Flags, Stars & Markers | Key Organization Caveats   |
| :---- | :---- | :---- | :---- | :---- |
| **1\. Shared Password Account** | Gmail Labels & Nested Labels. Maps to standard IMAP folders in desktop clients (Outlook/Thunderbird). | **Yes.** Real-time label application, creation, and message filing sync across all logged-in users. | Account-wide Gmail Stars/Flags (shared across all users). | Full shared folder/label structure; syncs seamlessly across clients and web. |
| **2\. Gmail Delegation Account** | Gmail Labels & Nested Labels inside delegated mailbox. | **Yes.** Real-time label sync between all delegates accessing the delegated account via Web UI or Gmail App. | Account-wide Gmail Stars/Flags shared across delegates. | Delegates cannot create/manage labels via desktop email clients (IMAP unavailable). Must use Gmail UI. |
| **3\. Collaborative Inbox** | **Shared Category Tags & Topics** defined in Google Groups settings (does NOT use Gmail Labels or IMAP folders). | **Yes.** Tags, status categories (Resolved, Duplicate, No Action Needed), and topic filters sync inside groups.google.com UI. | No color flags or Gmail stars. Uses status tags and user assignments instead. | Non-standard organization model. Does not integrate with standard email client folder trees. |
| **4\. Distribution List** | Personal Gmail Labels / Client Folders inside each individual member's account. | **No.** Organization is strictly local to each member's personal inbox. If Member A moves an email to a label/folder, Member B sees no change. | Personal to each individual user account. | Zero shared categorization. Each member must organize incoming list emails individually. |
| **5\. Email Alias / Redirection** | Personal Gmail Labels / Client Folders on primary recipient account. | **No.** Folder/label organization is personal to the recipient account. | Personal to primary account owner. | Requires setting up personal filter rules in Gmail to auto-label incoming alias emails. |
| **6\. "Send Mail As" Config** | Personal Gmail Labels in individual sender's account. | **No.** Outbound messages tagged with personal labels stay inside individual sender's mailbox. | Personal to individual sender. | Inherits personal organization model from underlying account setup. |
| **7\. Email-to-Google Chat Space** | **Chat Threads & Pinned Messages** within the Google Chat Space. No folders or Gmail labels. | **Yes.** Thread topics and pinned messages are visible to all Chat Space members in real-time. | Emoji reactions / Pinned messages (shared across space). | No traditional email folder or label structure available. Search relies on Chat thread history. |

## **4\. Option-by-Option Consolidated Profiles (Pending Topic Completion)**

*This section will compile the comprehensive profile, strengths, and drawbacks for each individual option once topic-by-topic discussions are complete.*

## **5\. High-Level Rating Summary Matrix (OK / NOK / \+/-)**

*This final quick-reference table will summarize all evaluation criteria across the 7 options using OK, NOK, and \+/- indicators.*