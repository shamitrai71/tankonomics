# Tankonomics data model v2: companies for the Big Merge, and one feed (25 Oct 2026)

**Status:** proposed, for review.

**Builds on:**
- T3_DECISIONS §5 and §10;
- `TWI_Relationships_and_Brands_Spec.md`;
- `LOCATION_CLAIMING_DRAFT.md`;
- `SCALE_AND_COST_REVIEW.md`;
- `CONNECTIONS_PLAN.md`.

## 1. Why now

- **No users yet.** No user data has to be migrated, and the Big Merge is one seed run. Changing the shape afterwards would mean rewriting 20,000 companies and a similar number of locations, and changing every page that reads them.
- **Read cost depends on shape.** Read cost is set by how documents are shaped and read, not by how many there are. The seed itself is cheap: about 50,000 writes, roughly US$0.10.
- **Settled decisions:**
  - no directory for users, only for admins;
  - TWI is the source of truth for supplier identity and categories;
  - TankBazaar is the source of truth for operators and facilities;
  - the slug is the shared key.

**Volumes today**

| Source | Companies | Locations / facilities |
|---|---|---|
| TWI (25 Oct) | 9,302 | 11,770 |
| TankBazaar register (V435) | 2,549 | 8,058 facilities (6,799 company links) |
| Tankonomics seed | 855 | 1,350 |

After de-duplication by slug and registry ID, the merge lands at about 12,000 companies today. It is planned to grow to about 20,000, with 20,000 to 25,000 locations.

## 2. Companies

### 2.1 `companies/{slug}`: the profile document (one read per company page)

Target size is under 4 KB. TWI records are 0.9 KB at the median and 1.6 KB at the 99th percentile.

| Group | Fields | Source when merging |
|---|---|---|
| Identity | `name`, `legalName`, `registry: { type, id, lei }`, `country` (ISO-2), `hq: { city, state }`, `status` (`active` / `held`) | Registry-validated TWI, else the TankBazaar register |
| Kind | `kind`: `supplier` / `operator` / `both`, plus `segments` (`storage`, `process`, `upstream`) | TWI → supplier; TankBazaar → operator; on both → `both` |
| Presentation | `logo`, `banner`, `about`, `website`, `socialLinks`, `isFeatured` | Uploaded in Tankonomics, else TWI, else TankBazaar |
| Classification | `categoryIds` (TWI tree, levels 1–3, plus operator nodes), `allCategoryIds` (with ancestors) | Supplier: TWI. Operator: derived from TankBazaar facilities. |
| Group | `parentSlug`, `relationship`, `groupSlug`, `groupName` (copied from the top of the chain) | TWI `parent` + `ORGANIZATIONS`; TankBazaar company links |
| Names | `aliases`, `formerNames`, `brands` | TWI; TankBazaar `otherNames` / `tbNames` |
| Contact (public) | `email`, `countryCode`, `phone` | TWI |
| Claim and plan | `isClaimed`, `ownerUid`, `plan`, `planSince` | Tankonomics (empty at seed) |
| Counters | `followerCount`, `staffCount`, `locationCount`, `openJobs` | Kept current by the server |
| Links | `tbCompanyId`, `twiSlug` (= slug), `externalDirectoryUrl` | Merge |
| House-keeping | `createdAt`, `updatedAt`, `seedVersion` | Seeder |

**TWI field renames**
- `desc` → `about`
- `site` → `website`
- `cats` → `categoryIds`
- `linkedin` → `socialLinks.linkedin`
- `registrationId` → `registry.id`, with the LEI split out into `registry.lei`
- TWI's `delivery` and `sectors` are kept under the same names until their use in Tankonomics is decided (§6).

**Not carried over:**
- the R and V signal squares (TWI only);
- `legalNameSource` and research notes (these go to the admin document, §2.3).

### 2.2 `companies/{slug}/locations/{locationId}`

One shape covers supplier sites and operator facilities.

| Field | Notes |
|---|---|
| `type` | `head-office`, `registered-office`, `plant`, `regional-office`, `branch-office`, `service-centre`, `r&d-centre`, `warehouse` (from TWI); `terminal`, `process-facility` (from TankBazaar) |
| `name`, `address`, `city`, `state`, `country`, `lat`, `lng`, `placeId` | `placeId` is filled where known; most TWI locations have one |
| `tbFacilityId`, `facilityClass`, `processType`, `access`, `primaryClass` | Operator facilities only; link to `tankbazaar.com/#terminal-N` |
| `sourceUrl`, `sourceDate` | From TWI research |
| `ownerUid`, `ownerSource` | `null` until delegation or claim (`LOCATION_CLAIMING_DRAFT.md`) |

**Fixed document ids:** `tb-{facilityId}` for facilities, `twi-{n}` for TWI sites. A re-seed then updates in place and never duplicates.

**Legacy TWI types are mapped on import:**
- `headquarters` → `head-office`
- `office` → `branch-office`
- `branch` → `branch-office`
- `facility` → `plant`

**Reads:** the company page reads locations 20 at a time. `locationCount` sits on the company document, so the count needs no list.

### 2.3 Admin-only and supporting collections

| Collection | Purpose |
|---|---|
| `companies/{slug}/private/admin` | `legalNameSource`, the validation tier, research notes, merge log, source record ids. Admins only. |
| `companies/{slug}/products/{id}` | Replaces the `products` array, so a company with many products does not grow the profile document |
| `organizations/{slug}` | Parents that are not listed companies (TWI has 127) |
| `companyRelationships/{from}__{type}__{to}` | All parent and subsidiary links, as in the relationships spec |
| `slugRedirects/{oldSlug}` | `{ to, reason }` for 388 retired TWI slugs, the TankBazaar `slugAliases`, and anything retired at the merge. The router follows them. |
| `bundles/companyIndex-{CC}` (and `-{CC}-{n}` parts if large) | The company picker per country: `slug`, `name`, `cities`, `logo` (small). Rebuilt by the server when companies change. 1 read per country. |
| Typesense `companies_admin` | **The admin directory**: all companies, all fields, filters by country, kind, category, claim status and missing fields. The search key is admin only. |

**No user-facing directory.** Users reach a company only from:
- the picker (bundle);
- a post, job, event or connection;
- a link from TWI or TankBazaar;
- the search box for jobs, forums, groups and offers (Typesense, not companies).

### 2.4 Merge rules (the seed build)

1. **Key:** the slug. A TankBazaar company already carrying a TWI slug merges into it. Otherwise, match on registry ID or LEI. Where neither exists, use names, and only for reviewed pairs.
2. **Supplier fields and categories:** TWI. **Operator fields, facilities and segments:** TankBazaar. **Presentation:** a Tankonomics upload wins, then TWI, then TankBazaar.
3. **Locations:** TWI sites and TankBazaar facilities are kept side by side on the same company. No terminal goes into TWI, and no supplier office comes from TankBazaar (T3 §10).
4. **Retired slugs:** go into `slugRedirects`. They never become companies.
5. **Seeder output:** a validation report covering counts, collisions, missing fields and orphaned parents, produced before anything is written.

## 3. One feed: posts, news, channels and ads

### 3.1 `posts/{id}`: everything that appears in the feed

| Field | Notes |
|---|---|
| `kind` | `member`, `company`, `news`, `announcement`, `sponsored` |
| `channel` | A channel slug (§3.2). Member and company posts go to `community`. |
| `author: { type, id, name, photo, title }` | `member` / `company` / `admin`, copied onto the post so a feed card needs no extra reads |
| `content`, `media[]`, `link: { url, title, image, source }` | `link` replaces today's `news` documents (title, image and source from `/api/metadata`) |
| `categoryIds`, `countries` | What the post is about; used for targeting and channel filters |
| `audience: { minTier, countries, categoryIds }` | Empty = everyone |
| `status`, `publishAt`, `expiresAt`, `pinned` | `draft` / `scheduled` / `published` / `expired` / `removed`, so admins can schedule news and announcements |
| `counts: { likes, comments, reposts }` | Kept current by the server |
| `repostOf`, `campaignId` | Repost source; the ad campaign for `sponsored` |
| `createdAt`, `updatedAt` | |

**Supporting collections**
- **Comments:** `posts/{id}/comments`, 20 per page.
- **Likes:** `likes/{postId}_{uid}`, one document per like (`CONNECTIONS_PLAN.md` / scale review).
- **The `news` collection:** retired; its items become `posts` with `kind: news`. The News page becomes a view of the news channels.

### 3.2 `channels/{slug}`

`{ name, description, kind: official | editorial | sponsored, sponsorCompanySlug, order, isDefault, postingRoles }`

Starting set, to confirm:
- **Tankonomics Updates** (official)
- **Industry News**
- **Storage & Terminals**
- **Process Industries**
- **Energy Transition**
- **Jobs & Careers**
- **Events**
- **Tenders & Projects**
- **Market Data**, drawn from TankBazaar
- **Offers**, for members
- **Community**, for member and company posts

Admins post into every channel except Community. Partner editors can be given `postingRoles` later.

**Channel preferences:** follows and mutes live in `users/{uid}/prefs`. Default channels are on for everyone.

### 3.3 How the home feed is read (fixed cost)

| Part | Source | Reads |
|---|---|---|
| Channel heads | `feeds/{channel}`: the latest 30 published items, written by the server whenever a post in that channel is published, edited or expires. A combined `feeds/home-default` covers the default channels. | 1–3 |
| Network | Paged posts from the people and companies you follow; later a per-user timeline (`timelines/{uid}/items`) | 20 per page |
| Sponsored | `adSlots/feed-{CC}`: the active ads for the reader's country (§3.4); the app picks which to show | 1 |

The app merges the three into one stream: newest first, with pinned items on top and a sponsored item every 8 to 10 entries. A visit costs about 25 reads, whatever the number of posts. "New posts" appears as a prompt, not a live stream.

### 3.4 Ads (a future revenue line)

**`adCampaigns/{id}`**
- advertiser (`companySlug`);
- the creative, shaped like a post;
- `placements`: `feed`, `channel:{slug}`, `company-page`, `job-search`, `events`;
- targeting: `countries`, `categoryIds`, `minTier`, `channels`;
- `startAt`, `endAt`, `status`;
- pricing (flat sponsorship or CPM) and an impression cap.

**Serving:** the server rebuilds `adSlots/{placement}-{country}` when campaigns change. Each visitor reads 1 document, and the rotation happens in the browser.

**Counting:**
- **Impressions:** counted in the browser and sent in batches to a Cloud Run endpoint. They are then added up in BigQuery, with daily totals written back to the campaign. There is never one Firestore write per impression.
- **Clicks:** go through a redirect, `/r/{campaignId}`, which counts them on the server.

**Formats from day one:**
- sponsored post in the feed;
- channel sponsorship ("Storage & Terminals, presented by …");
- featured company in the picker and on job search.

Every sponsored item is labelled **Sponsored**.

**Self-service:** later. Admins create campaigns first, and billing goes through the payment seam already marked in `USER_TIERS.md`.

## 4. Other shape changes to make at the same time

These come from the other review documents and are listed so the seed and the app change only once:
- **Users:** `profiles/{uid}` (public card) separate from `users/{uid}` (private: email, phone, billing). Tier, company and role go into custom claims.
- **Affiliations and connections:** `affiliations/{companyId}_{uid}` and `connections/{uidA}_{uidB}`, with `users/{uid}/network` (`CONNECTIONS_PLAN.md`).
- **Jobs:** `country`, `city`, `categoryIds`, `companySlug` and `status` on every job, for filtered search and Typesense.
- **Events and surveys:** each event or survey document carries its own counts. The listings are published as `public/upcomingEvents` and `public/activeSurveys`.
- **Static lists:** the category tree and taxonomy ship in the app bundle. Firestore keeps a copy only for admin editing.

## 5. Order of work

1. **Agree this schema.** Settle the questions in §6.
2. **Merge build script** (offline):
   - **Inputs:** the TWI roster, the TankBazaar register and facilities, and the Tankonomics presentation fields.
   - **Outputs:** seed files for companies, locations, organizations, relationships, redirects and per-country company indexes, plus the validation report.
3. **Seeder page:** the same pattern as the TankBazaar and TWI seeders. It writes through REST as the admin, can resume after a break, and writes in place using the fixed ids. A run is first tested on a **staging Firebase project**.
4. **App changes:**
   - the company page on the new shape;
   - the admin directory on Typesense;
   - the profile company picker;
   - the feed: channels, news as posts, sponsored slot.
5. **Big Merge seed** on production, then retire the old `companySeed.ts` / `locationSeed.ts` path.

## 6. To confirm

1. Company `kind`: `supplier` / `operator` / `both`. Is a company on both lists shown as both?
2. The channel list in §3.2, and who may post into channels: admins only for now?
3. Ad placements for launch, and whether early sponsorships are sold flat or by impressions.
4. TWI's `delivery` and `sectors` fields: shown in Tankonomics, used for search, or admin-only?
5. Logo and banner order (Tankonomics upload → TWI → TankBazaar). Agreed?
6. A staging Firebase project for the seed rehearsal. Create one now?
