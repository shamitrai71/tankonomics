# Connections, requests and messaging: review and plan (25 Oct 2026)

This plan settles who can connect with whom and how, and through that, who can message whom. It is built to fit four existing pieces:
- the tier ladder (choose a company → company verifies → paid);
- company claiming and staff verification;
- the "no directory" decision;
- the cost rules in `SCALE_AND_COST_REVIEW.md`.

It is checked against the code at `630bf6c`.

## 1. What exists today

| Piece | Where | How it works |
|---|---|---|
| Connection request | `Profile.tsx:855` `handleConnect` | Creates `connections/{random id}` with `userIds` (sorted), `requesterId` and `status: "pending"`, then a notification for the other person. |
| Accept / reject | `Profile.tsx:877`, notification buttons in `App.tsx:547–558` | Sets `status` to `accepted` or `rejected`. |
| Pending requests panel | `Messages.tsx:139` | Listens to all of my connection documents and filters the pending ones in the browser. |
| My connections list | `Profile.tsx:355` `ConnectionsList` | Listens to all of the person's connection documents, then reads each connected profile one by one. |
| 1st / 2nd degree badge, mutual count | `Profile.tsx:472–568` | Listens to **both** people's full connection lists and intersects them in the browser. |
| Follow (one-way) | `follows`, for members and companies | Separate from connections. Verifying a staff member auto-follows the company (`CompanyProfile.tsx:994`). |
| Messaging | `Profile.tsx:895`, `chats` rule | The app shows "Message" only to connections or to a company–candidate job match. The rule only requires tier B and that you are a participant. |
| Company affiliation | `users.companyId` (self-chosen from claimed companies, `Profile.tsx:1324`). The owner sets `isVerifiedByCompany` (`CompanyProfile.tsx:986`). | This is already the "choose → company verifies" ladder, in a basic form. |

**Gaps found**
1. **A request can accept itself.** The create rule allows `status: "accepted"`. The update rule lets either person, including the requester, set `accepted`. So anyone can connect to anyone without consent, and that unlocks messaging.
2. **Duplicates.** Request ids are random, and the duplicate check runs only in the browser. Two people tapping "Connect" at the same time create two documents.
3. **Anyone can read every connection.** The read rule is `isSignedIn()`, so the whole social graph is readable by any signed-in user.
4. **No limits.** Any signed-in user, including tier A, can send unlimited requests. Notifications are also created by the browser.
5. **No blocking.** A person can only reject, and the requester can ask again straight away.
6. **Verification survives a company change.** A user can change `companyId` and keep `isVerifiedByCompany: true` from the previous company.
7. **Choosing a company already grants group creation.** The group rule uses `isConnectedToCompany`, which is any non-empty `companyId`. `USER_TIERS.md` keeps creation for tier C.
8. **Cost.** Profile, Messages and ConnectionsList each listen to entire connection lists. The degree badge reads two whole graphs per profile view.

There are no users yet, so every change below can be made without migrating data.

## 2. Principles

1. **Messaging follows consent.** You can message a person only after they have accepted you. The tier only controls how many requests you can send. The one other way in is a job match (§3), which carries consent too: the company invited, or the candidate applied.
2. **No people directory.** People find each other through context:
   - a company page's verified staff;
   - group members;
   - event attendees;
   - post and forum authors;
   - mutual connections;
   - "people you may know".
   There is no open people search. At most, a name search can run inside one company, group or event.
3. **Connections are person to person.** Companies are followed, not connected. Contact with a company goes to its inquiries inbox (§5), not to a personal chat.
4. **Writes that need trust go through the server:** request, accept, decline, withdraw, remove, block, verify. The server checks tier, limits, cooldowns and blocks, and writes the notifications. The browser never writes another person's data.
5. **Fixed reads per screen.** Every list is paged at 20, and a status check is one read of a document with a known id.

## 3. Who can do what

| Tier | Send connection requests | Accept requests | Message | Other |
|---|---|---|---|---|
| **A — Registered** (signed in) | No | No | No | Can view limited profiles and follow companies. |
| **A+ — Affiliated** (has chosen a company) | Yes, **10 a week** | Yes | Accepted connections | |
| **B — Verified** (by the company owner, or the job-seeker route of email + Blueprint) | Yes, **50 a week** | Yes | Accepted connections + job matches | |
| **Paid individual** (`isPro`) | Yes, **200 a week** | Yes | As B, plus **5 message requests a month** to people who are not connections | A message request reaches the recipient's Requests tab with your note. Replying accepts it and opens the chat. |
| **Company owner / verified staff** | As their own tier | | Company inquiries inbox (§5) | Can verify staff (owner) and delegate locations (owner). |

The numbers are starting values, kept in one settings document so they can change without a deploy.

**Request rules**
- **Note:** a request can carry a note of up to 300 characters, saying why they want to connect.
- **Declines:** a declined request cannot be repeated for **30 days**. After three declines from the same person, the requester is blocked from asking again.
- **Pending requests:** expire after **90 days**.
- **Withdrawing:** the requester can withdraw a pending request.
- **Removing:** either person can remove a connection, and nobody is told.

**Blocking:** stops requests, messages and profile views both ways.

**Recipient setting** (who may send me requests):
- "Verified members only" (default);
- "Anyone affiliated";
- "Only people at my company".

## 4. Data model

| Document | Fields | Written by |
|---|---|---|
| `connections/{uidA}_{uidB}` (the two ids in sorted order, so there is one document per pair) | `userIds`, `requesterId`, `recipientId`, `status` (`pending` / `accepted` / `declined`), `note`, `createdAt`, `respondedAt`, `declineCount` | Server |
| `users/{uid}/network/{otherUid}` | A snapshot of the other person (name, title, photo, company, `since`) | Server, on accept: 2 writes |
| `users/{uid}/network` list | Paged at 20; this *is* "my connections" | |
| `profiles/{uid}.connectionCount` | Kept current by the server | Server |
| `blocks/{uid}_{blockedUid}` | `createdAt` | Server |
| `users/{uid}/private/limits` | Requests sent this week, message requests this month | Server |
| `affiliations/{companyId}_{uid}` | `status` (`chosen` / `verified` / `rejected` / `left`), `role` (`staff` / `location-owner`), `locationIds`, `verifiedBy`, `at` | Server |
| `company_inquiries/{id}` | Company, sender, subject, message, `status` | Server; the company owner and verified staff can read |

**Reads per screen**
- **Profile:** 1 read of `connections/{pair}` to show Connect / Pending / Connected / Message. This replaces the three live list listeners.
- **My connections:** 20 per page from `users/{uid}/network`. No per-profile reads are needed, because the snapshot is stored with the list.
- **Requests tab:** `where(recipientId == me, status == "pending")`, newest first, 20 per page.
- **Mutual connections:** on a profile, a "mutual connections" count shows only when you open it. It comes from a server endpoint that intersects the two network lists, capped at 1,000 each and cached for a day. The live 1st / 2nd / 3rd degree badge goes; "Connected" covers the 1st-degree case.

**Who reads what**
- **Connections:** the rules let only the two people read their own connection document.
- **Network lists:** readable by the owner. Other people can see the list only if the owner has "show my connections" switched on. Default: count only.

**Custom claims** (set by the server when an affiliation, verification or plan changes): `tier`, `companyId`, `companyRole`, `isPro`. The rules read these from the sign-in token, so they make no extra document reads.

## 5. Company affiliation and inquiries (the same request pattern)

- **Choose a company (→ A+):** the country → city → company picker writes `affiliations/{companyId}_{uid}` as `chosen`. This works for any company, claimed or not.
- **Verification (→ B):** the company owner sees chosen-but-unverified people on the company page, 20 per page, and approves or rejects them. Approval sets `verified` and updates the claims.
- **Changing company:** the old affiliation becomes `left` and the verification is removed. This closes gap 6.
- **Unclaimed company:** nobody can verify its people yet, so they stay A+ until the company is claimed. Through the job-seeker route they can still reach B.
- **First claimant:** the claim needs a company-domain email plus admin approval, as today. On approval the claimant becomes `owner`.
- **Location owners:** the owner delegates a location to verified staff, which sets `role: location-owner` and `locationIds`. This follows `LOCATION_CLAIMING_DRAFT.md`.
- **Company inquiries:** a "Contact company" button on the company page, for B and above, with a limit per week. The message lands in the company's inquiries inbox, which the owner and the verified staff they choose can read. A reply opens a chat between the sender and the staff member who replied. This gives B2B contact without exposing personal accounts.
- **Group creation:** gated on a company-premium owner or an admin, through custom claims. This closes gap 7.

## 6. Messaging, which this settles

A chat can be created only when one of these holds, and the server checks it:
1. the two people have an accepted connection;
2. a job match or application links the company owner and the candidate (already built);
3. a paid member's message request has been answered;
4. a company inquiry has been replied to.

**Group chats:** group discussion stays in group posts. Private chats have at most 2 people for now. A small group chat (up to 10) can follow later if asked for.

**Cost rules for chats**
- Chat list: 20 per page, live listener.
- Open chat: the latest 50 messages, live, with older ones on request.
- Messages are text only to start. Attachments go through Cloudinary later.
- Message history is kept indefinitely. Revisit storage at 100,000 users.

## 7. Server endpoints (Cloud Run, alongside the bridge)

`POST /api/network/request`, `/accept`, `/decline`, `/withdraw`, `/remove`, `/block`, `/unblock`, `/message-request`; `POST /api/company/affiliate`, `/verify-staff`, `/leave`, `/inquiry`, `/delegate-location`.

Every endpoint:
- checks the Firebase ID token;
- reads the custom claims;
- enforces tier, limits, cooldowns and blocks;
- writes in one transaction;
- creates the notification.

A Firestore trigger keeps the counters and the network snapshots current when a profile name or photo changes.

## 8. Cost

At 100,000 users, assume each user sends about 5 requests a month and 60% are accepted. That is about 500,000 requests and 300,000 accepts a month.
- **Writes:** about 1 write per request, and 5 per accept (the connection, 2 network rows, 2 counters), plus notifications. That is roughly 3.5 million writes a month, about US$6.
- **Reads:** fixed per screen (§4). A profile view costs 1 read for the connection check, compared with 3 full-list listeners today.

## 9. Build order

1. **Close the gaps now, before any users:**
   - deterministic connection ids;
   - a create rule that allows `pending` only;
   - accept allowed for the recipient only;
   - connections readable only by the two people;
   - group creation gated as per `USER_TIERS.md`;
   - verification reset on a company change.

   This step is a rules change plus a small app change.
2. **Requests and connections:**
   - the server endpoints for request, accept, decline, withdraw, remove and block;
   - the Requests tab, paged;
   - the network list with snapshots;
   - one-read status on profiles;
   - removing the degree badge and adding mutual connections on request.
3. **Affiliations:**
   - the `affiliations` collection, wired to the country → city → company picker;
   - owner verification on the company page;
   - custom claims for tier and company role.
4. **Messaging:** chat creation through the server with the four conditions in §6; the new-chat picker built from network and matches.
5. **Later:**
   - paid message requests;
   - company inquiries inbox;
   - "people you may know" (a daily server job: same company, same city and category, mutual connections; up to 20 per user).

## 10. To confirm

1. **Limits:** the request limits per tier (10 / 50 / 200 a week) and 5 paid message requests a month.
2. **A+ messaging:** can A+ users message their accepted connections, as proposed, or does messaging start at B?
3. **Colleagues:** should verified colleagues at the same company be able to message each other without connecting?
4. **Connection lists:** the default visibility of a person's connection list. Proposed: count only.
5. **Company inquiries:** a feature for all companies, or only premium companies?
6. **Name search:** is name search inside a company, group or event acceptable, given that there is no open people search?
