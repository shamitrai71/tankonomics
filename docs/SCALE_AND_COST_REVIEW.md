# Tankonomics: scale and cost review (25 Oct 2026)

Review of Shamit's notes on keeping Tankonomics cheap and free of billing spikes from 1,000 to 100,000 users. Checked against the code at `630bf6c` (22 Oct), `docs/USER_TIERS.md`, `docs/LOCATION_CLAIMING_DRAFT.md` and T3_DECISIONS §6–§8.

## 1. Verdict on each point

| Point | Verdict | Why |
|---|---|---|
| No directory page (LinkedIn type) | **Agree** | The directory lives in TWI, for a paid tier. In Tankonomics the company list becomes admin-only. |
| Profile: country → city → company; company search only per country | **Agree** | It turns an open search into a small, cacheable list per country (§4.1). Add a "my company is not listed" path that goes to admin review. |
| Jobs: no listing, search by country, city, category | **Agree** | Filtered, paged queries of 20. Free-text job search goes through Typesense. |
| Directory search only in TWI for a member tier; admins need the list | **Agree, small change** | Admins are few, so their reads cost little. Keep the admin list as a lazy-loaded, admin-only route in the same app. A separate admin app is only worth it for security or deploy reasons, not for cost. |
| Events: grand listings | **Agree** | Events are few. Publish upcoming events as one cached document: 1 read per visit. |
| Forums searchable | **Agree** | Through Typesense. Firestore cannot do text search. |
| Groups searchable | **Agree** | Through Typesense. |
| Surveys: grand display | **Agree** | Same as events: one cached document. |
| Chat and messages | **Discuss** (§4.6) | Stay on Firestore, with the fixes listed. |
| Tenders through partners or an own app | **Agree** | Keep tenders out of the Tankonomics database; link out. |
| Offers to members searchable | **Agree** | Through Typesense, with a filter on the member's tier. |
| Research the biggest read and write cases | **Done** | §2 and §3. |
| Separate databases per module; MongoDB for feeds and news | **Disagree for now** | Feeds and news can be cheap on Firestore (§5). MongoDB adds a fixed monthly cost. It also needs a server between the browser and the data, which means more cost, more latency and more code. T3 §6 already decided to stay on Firestore. Revisit only at about 100,000 daily users, if feed writes become the main cost. |
| Typesense | **Agree: the biggest single saving** | It replaces the global search (up to 2,400 reads per search) and powers the jobs, forums, groups, offers and company pickers. |
| Redis | **Not yet** | Redis caches reads that go through a server. Tankonomics reads Firestore directly from the browser, so Redis would sit idle. Cached documents and CDN files do the same job at no fixed cost. Add Redis later for rate limits and sessions on Cloud Run, when that layer exists. |
| Individual upgrades: choose a company → company verifies → paid | **Agree, with one conflict** (§6) | `USER_TIERS.md` lets a job-seeker with no company reach tier B through a Blueprint. The new ladder would lock them out. |
| Companies: claim first; owner verifies staff and delegates locations | **Agree, one gap** (§6) | Someone has to verify the first claimant, since there is no owner yet. Keep that with the admin, as now: email domain plus admin approval. |

## 2. Where the reads go today

Every list in the app is a live listener (`useCollection` → `onSnapshot`), and most have no `limit()`. A live listener bills a read for every document in the result. It then bills again every time any of those documents changes, for every user who has the page open.

| Page (file) | What it reads per visit | Reads at 100,000 users (est.) |
|---|---|---|
| Home feed (`Home.tsx:475–476`) | Every post and every news item, live; plus a comments listener per post card (`Home.tsx:73`) | ~156,000 |
| Global search (`App.tsx:204–211`) | 8 collections × 300 newest, live, while the box is open | 2,400 |
| Categories (Forums, Jobs, Companies, Events, EventDetail, CompanyProfile) | The whole `company_categories` collection, live | 473 per page |
| Jobs (`Jobs.tsx:67, 82`) | Every job, plus the whole taxonomy | ~9,100 |
| Events (`Events.tsx:155–158`, `EventDetail.tsx:48–49`) | Every event and **every attendee record of every event** | ~51,000 |
| Forums (`Forums.tsx:68`) | Every forum topic | ~25,500 |
| Groups (`Groups.tsx:34`), Surveys, News page | Whole collections | ~3,000 / 300 / 6,000 |
| Profile (`Profile.tsx:415, 461`) | Every job and every claimed company, plus about 12 other listeners | ~11,000 |
| New chat (`App.tsx:843`) | **Every user** except you | 100,000 |
| Company page (`CompanyProfile.tsx:191–198`) | Categories plus all employees, follows and likes (to count them) | 500+ |
| Security rules (`isApprovedUser`) | An `exists` and a `get` of your user document on each request | +1 per request |

**The biggest write cases**
- **Likes:** stored as an array of liker ids on the post, plus a counter (`GroupPostCard.tsx:72`). Each like rewrites the post. Because the home feed listens to every post, each like also bills a read to every user who has the feed open.
- **Notifications:** created by the browser for each action. "Mark all read" writes one document per notification.
- **Profile views:** one write per view (`Profile.tsx:718`).
- **Counters:** member, comment and reply counts, written by the browser.

The `companies` page (`Companies.tsx`) is already paged. Admin tabs load only when opened. These are fine for a handful of admins.

## 3. What it costs: current pattern vs the proposed design

**Assumptions**
- 30% of users are active on a given day.
- Each active user does 3 feed visits and opens jobs, events, forums, groups, surveys, a profile and a company page once each, plus one search.
- Data volumes grow with the user count. At 100,000 users that means about 150,000 posts, 50,000 event attendances and 25,000 forum topics.
- Firestore reads are priced at about US$0.06 per 100,000, with 50,000 free per day. Check current pricing for the database's region.

The numbers below are an order of magnitude only. They leave out the re-reads from live listeners, which make the current pattern worse still.

| Users | Reads per active user per day, current | Proposed | Reads per day, current | Proposed | Firestore reads per month, current | Proposed |
|---|---|---|---|---|---|---|
| 1,000 | ~17,000 | ~170 | 5 million | 50,000 | ~US$95 | ~US$0 (free tier) |
| 10,000 | ~74,000 | ~170 | 220 million | 0.5 million | ~US$4,000 | ~US$8 |
| 100,000 | ~570,000 | ~170 | 17 billion | 5 million | ~US$300,000 | ~US$90 |

The current pattern grows with users **times** data, which is why the bill rises so steeply. In the proposed design each visit reads a fixed, small number of documents, so the bill grows only with users. Fixed services come on top: Typesense from tens of dollars a month, plus hosting, image delivery and Cloud Run.

## 4. Module by module

### 4.1 Profile and the company picker
- **Country:** a fixed list in the app (0 reads).
- **City and company:** one cached company index per country, for example `bundles/companies-IN`. It holds slug, name, cities and logo, gzipped. India is about 5,000 companies across TWI and TankBazaar, a few hundred KB. It is the same pattern as TWI roster v2 and the TankBazaar bundles. The browser reads 1 document and caches it until the version changes.
  - Alternatively, a Typesense query filtered by country. Use it once Typesense is in place, if the bundle grows too big.
- **"My company is not listed":** creates a `company_requests` document for admin review, so no unchecked company documents get created.

### 4.2 Jobs
- **Search only:** `where(country) + where(city) + where('categoryIds','array-contains', x) + orderBy(createdAt) + limit(20)`, with "load more" through a cursor. Each filter combination needs a composite index.
- **Text and taxonomy:** move to Typesense once there is free text or more than one category filter.
- **Taxonomy (675 nodes):** ship it in the app bundle, as `taxonomySeed.ts` already exists (0 reads).

### 4.3 Events and surveys (grand display)
- **One document per listing:** a server function rewrites `public/upcomingEvents` and `public/activeSurveys` whenever an event or survey changes. Visitors read 1 document.
- **Attendee counts:** stored on the event document. "Am I attending?" is a single read of `event_attendees/{eventId}_{uid}`, so no visitor reads the whole attendee collection.

### 4.4 Forums, groups, offers (searchable)
- **Listing and search:** both through Typesense. Firestore is read only when a topic, group or offer is opened, with comments and posts paged in groups of 20.
- **Offers:** the search key carries the member's tier, so each member sees only the offers meant for them (T3 §8).

### 4.5 Feed and news
- **News:** the same for everyone. Publish the latest 50 items as one cached document (or a CDN file), refreshed when news is added: 1 read.
- **Posts:** page them in 20s as a one-off fetch, not a live listener. Show "new posts" as a prompt, not a live stream.
- **Later, at around 10,000+ daily users:** give each user a timeline. A server function copies each post into its followers' timelines, and posts from very large accounts are merged in at read time (T3 §7 item 2).
  - **Write cost at 100,000 users:** about 2,000 posts a day × 100 followers is about 200,000 writes, roughly US$0.40 a day.
  - **Fit with Firestore:** this suits Firestore well, so MongoDB is not needed for it.
- **Likes:** one document per like (`likes/{postId}_{uid}`), with the counter kept by a server function. Rendered post cards never open their own comment listeners.

### 4.6 Chat and messages (to discuss)
- **Stay on Firestore.** Chat is the one place where live listeners are worth what they cost: one write per message, plus one read per open participant. Hosted chat services charge per monthly active user and quickly cost more.
- **Fix: the new-chat picker** shows connections and matches only. It must not read every user (`App.tsx:843`).
- **Fix: page lists.** Page the chat list (20) and the message history (the latest 50, then "load older"), and cap the notification listener at the latest 20.
- **To decide:**
  - who may message whom per tier (today: connections and job matches, B and above);
  - whether company staff can message as the company;
  - whether attachments are needed (Cloudinary vs Storage);
  - how long messages are kept.

### 4.7 Admin
- **Admin list:** keep it in the app as a lazy-loaded route that only admins can open. It uses paged lists, `count()` queries for the numbers, and Typesense with an admin key for search. Reads stay small because there are only a few admins.

## 5. Databases and services

| Service | Role | Fixed cost | When |
|---|---|---|---|
| **Firestore** | System of record for everything: users, companies, posts, jobs, chat | None (pay per use) | Now |
| **Cached documents and CDN files** | Categories, taxonomy, per-country company indexes, events, surveys, news | None | Now |
| **Typesense** | All searching: companies by country, jobs, forums, groups, offers, admin search | Yes, small | Before launch |
| **Cloud Run** (exists) | Bridge, payments, admin actions, sync to Typesense | Low | Now |
| **Cloud Functions / triggers** | Counters, likes, notifications, timelines, bundle rebuilds | Pay per use | Before launch |
| **BigQuery** | Reporting, fed by scheduled exports | Pay per use | Later |
| **Redis** | Rate limits and sessions on Cloud Run | Yes | Later, if needed |
| **MongoDB** | Not proposed (§1) | Yes, plus a server layer | Revisit at about 100,000 daily users |

Two more cost points outside the database:
- **Images:** logos and banners are on Cloudinary. Always request sized, auto-format versions (`f_auto,q_auto,w_…`), or image bandwidth becomes the next bill.
- **Custom claims:** put tier, approval and company role in the user's sign-in token. Security rules then stop reading the user document on every request (T3 §7 item 4).

## 6. Tiers and company verification

**Individuals, as proposed:** (1) chooses a company → (2) the company verifies them → (3) pays.

1. **Conflict with `USER_TIERS.md`:** today tier B means email verified **plus** a Blueprint. This was chosen so that a job-seeker who has no company, or is between jobs, can still reach B and apply. Under the new ladder they would be stuck at step 1. A possible ladder:
   - **A — Registered:** signed in.
   - **A+ — Affiliated:** has chosen a company, self-declared and not yet verified.
   - **B — Verified:** verified by the company owner, **or** email-verified with a Blueprint (the job-seeker path).
   - **Paid:** individual premium (`isPro`), separate from company premium.
2. **Company not yet claimed:** if the chosen company has no owner yet, nobody can verify its staff. They stay at A+ until the company is claimed, or the admin verifies them.

**Companies, as proposed:** claim → the owner verifies staff → the owner delegates and verifies location owners.

- **The first claimant:** I read "claimed only by a user verified by the user who has chosen the company" as: the claimant must have chosen that company and been verified. Before anyone owns the company, only the admin can verify that person. Keep the current check: a company-domain email plus admin approval of the claim, which `ClaimModal` and `company_claims` already do.
- **After the claim:** this matches `LOCATION_CLAIMING_DRAFT.md`.
  - The owner verifies staff, who then reach B.
  - The owner delegates locations.
  - Location owners can manage their own sites.
  - The admin can revoke ownership at either level.
- **Where to store it:** `companyId` and the role (owner, staff or location owner) go into custom claims, written only by the server when a verification is approved.

## 7. Order of work

1. **Before any users arrive (cheap, high impact):**
   - limits and paging on every list;
   - one-off fetches instead of live listeners, except chat and notifications;
   - categories and taxonomy served from the app bundle;
   - event attendee counts stored on the event;
   - the new-chat picker limited to connections.
2. **Before launch:**
   - Typesense with sync from Firestore, which retires the global-search listeners;
   - the per-country company index and the profile picker;
   - jobs search;
   - forums, groups and offers search;
   - cached documents for events, surveys and news.
3. **Before launch:**
   - server-side counters, likes and notifications;
   - custom claims for tier and company role;
   - the public and private split of the user record (T3 §7 items 3 to 5);
   - App Check and budget alerts.
4. **At about 10,000 daily users:**
   - per-user feed timelines;
   - BigQuery for admin numbers.
5. **Only if needed:**
   - Redis for rate limits;
   - revisit a second database for feeds.

## 8. Questions to settle

1. The job-seeker path to tier B (§6.1): keep the Blueprint route?
2. Chat rules (§4.6): who may message whom, staff messaging as the company, attachments, retention.
3. Offers: who creates them (admin or premium companies), and which tiers see which offers.
4. Tenders: which partner, or a separate app, and does it share the Tankonomics sign-in?
5. Typesense: Typesense Cloud, or self-hosted on Cloud Run?
