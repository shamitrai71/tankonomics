# Tankonomics

A B2B professional networking platform for the storage tanks and terminals industry — operators, EPCs, OEMs, inspectors. Members verify their industry identity, connect with vetted partners, contribute to technical discussions, and discover companies, jobs, events, and sector reports.

> This is the single source-of-truth doc for the project. It replaces the older `README.md`, `PROJECT_STATUS.md`, and `security_spec.md` (now retired — their content lives here). Keep this in the repo root and update it as work progresses, so context travels with the code across chats, sessions, and machines.

**Live:** https://tankonomics.web.app
**Stack:** React 19 + Vite 6 + TypeScript + Tailwind 4 + Firebase (Auth, Firestore, Storage) + Express server on Cloud Run

---

## 1. Project status

Deployed and operational. Sign-in, profile editing, company directory, forum threads, admin command center, dynamic page builder, events (incl. multi-day), and the Career Blueprint resume builder all work end-to-end.

A full visual redesign (industrial-editorial direction — see §4) has been applied across every consumer page and the 12-tab admin dashboard. Remaining work is QA hardening, a handful of missing admin edit UIs, and the pre-launch security items in §9.

---

## 2. Quick reference

| Resource | Value |
|---|---|
| GCP Project | `tankonomics` |
| Firebase Project | `tankonomics` |
| Region | `asia-south1` (Mumbai) |
| Live URL | https://tankonomics.web.app |
| Cloud Run URL | https://tankonomics-919953719236.asia-south1.run.app |
| Cloud Run service | `tankonomics`, port `8080`, `asia-south1` |
| Firestore Database | `(default)` |
| GitHub | https://github.com/shamitrai71/tankonomics |
| Auth | Google OAuth (primary, working) · Facebook (wired via Firebase `FacebookAuthProvider`, needs a Facebook App configured in the Firebase console) · LinkedIn (custom OAuth via `server.ts`, blocked on placeholder secrets — see §9) |
| Local project folder | `C:\dev\Tankonomics` (Windows) |
| Admin allowlist | `petrodeksystems@gmail.com`, `esraigroup@gmail.com` |

**Admin status** is granted two ways, and both must agree:
1. A document at `admins/{uid}` exists, **or**
2. The auth token email matches the allowlist.

`isAdmin()` in `firestore.rules` checks both. The client mirrors this in `App.tsx` (`SUPER_ADMIN_EMAILS`, ~line 94). **To add a new super-admin, update both places** — `src/App.tsx` and the `admins/{userId}` create rule in `firestore.rules` (~line 507).

---

## 3. Architecture

```
User Browser
    ↓
https://tankonomics.web.app          (Firebase Hosting)
    ├── /__/auth/handler             (Firebase Auth — same-origin)
    └── /*                           (rewritten to Cloud Run)
                                          ↓
                                     Cloud Run service "tankonomics"
                                     (asia-south1, port 8080)
                                          ↓
                                     Firestore (default), asia-south1
                                     + Secret Manager (4 secrets)
                                     + Artifact Registry
                                     + Firebase Storage (images)
```

CI/CD: push to `main` → Cloud Build trigger → builds Docker image → pushes to Artifact Registry → deploys new Cloud Run revision. Typical end-to-end: ~5 minutes.

---

## 4. Design language

Industrial-editorial direction, defined in `src/index.css`:

- **Deep petroleum** `#0b1b2b` — primary/dark surfaces
- **Safety orange** `#ea7317` — accent
- **Warm paper** `#f5f3ef` — background
- Fonts: **Instrument Serif** (display), **Geist** (body), **Geist Mono** (technical accents)
- Utility classes: `bp-grid` / `bp-grid-paper` (blueprint texture), `grain`, `eyebrow tabular`, `gauge-sweep`, `soft-pulse`, `custom-scrollbar`
- Design tokens used throughout: `bg-bg-main`, `bg-bg-card`, `border-border-main`, `text-text-heading`, `text-text-body`, `text-accent`, `bg-primary`, `text-rust`, `text-blueprint`

Every consumer-facing page and the admin dashboard have been moved to this language: Splash, Login, Navbar, Sidebar, Profile, Companies, Home, CompanyProfile, News, DynamicPage, Forums, Surveys, Groups, Messages, PostDetail, Jobs, Events, GroupDetail, CreateResume. Shared components: `GroupPostCard`, `ShareModal`, `ReportModal`, `CategorySelector`, `DynamicContent`.

---

## 5. Local development

**Prerequisites:** Node.js 20+, npm or yarn, a Firebase project for development (optional — can use production).

```bash
git clone https://github.com/shamitrai71/tankonomics
cd tankonomics
npm install
```

**Run locally** — two terminals:

```bash
npm run dev          # Vite dev server, http://localhost:5173
npx tsx server.ts    # Express API backend, port 8080
```

The Vite dev server proxies API requests to the Express backend.

**Build:**

```bash
npm run build        # → dist/
```

---

## 6. Deploy workflow — read before deploying

Current working method (Windows dev environment, no local git CLI in regular use):

1. Extract the latest build zip into the repo folder, overwriting changed files.
2. Upload changed files via the **GitHub web interface** (Chrome). This is the `push to main` that fires Cloud Build.
3. Cloud Build builds the Docker image and deploys to Cloud Run.
4. Wait for the build to go **green**, then **hard refresh** (Ctrl/Cmd+Shift+R) or use an Incognito window to bypass cache.

> **Note:** if `src/` didn't actually change between builds, Vite produces an identical content-hashed bundle and Cloud Run treats the deploy as a no-op. That's expected, not a bug. Force a rebuild by touching any `src/*` file.

### ⚠️ Firestore rules are a SEPARATE deploy

**Cloud Build deploys the app but NOT the Firestore rules.** Rules must be deployed separately. The single biggest time sink in this project so far was rules that were correct in the repo but stale/duplicated in the deployed console.

**Always deploy rules from the repo via CLI:**

```bash
firebase deploy --only firestore:rules
# or, for rules + indexes together:
firebase deploy --only firestore
```

Do **not** hand-paste rules into the Firebase console — that is how the deployed rules silently drifted from the repo (at one point there were two conflicting `isValidEvent` definitions live, and the wrong one won).

**Golden debugging rule:** when a write fails, first confirm *what is actually deployed and running*, not what the code says. Check, in order:
1. Did Cloud Build go green?
2. Do the rules in the console match the repo? (search the rules editor for duplicate function definitions)
3. Hard-refresh to rule out a cached bundle.

---

## 7. Firestore schema

| Collection | Purpose |
|---|---|
| `users/{uid}` | User profiles |
| `admins/{uid}` | Admin role assignments |
| `companies/{id}` | Business directory entries |
| `company_categories/{id}` | Hierarchical industry categories (level 1/2/3) |
| `company_claims/{id}` | Company ownership claim requests |
| `forum_topics/{id}`, `forum_topics/{id}/posts/{postId}` | Discussion topics + replies |
| `posts/{id}`, `posts/{id}/comments/{id}` | News feed posts + comments |
| `groups/{id}` | Member groups |
| `events/{id}` | Industry events (now supports `endDate`/`endTime` for multi-day) |
| `jobs/{id}` | Job listings |
| `news/{id}` | Curated industry news |
| `surveys/{id}` | Industry surveys |
| `recommendations/{id}`, `endorsements/{id}` | Professional endorsements / skill endorsements |
| `notifications/{id}` | User notifications |
| `follows/{id}`, `likes/{id}` | Follow relationships / likes-reactions |
| `dynamic_pages/{id}` | Custom pages built via the admin Page Builder |
| `settings/{key}` | Platform configuration (theme, branding) |
| `sector_reports/{id}` | Industry reports |
| `resumes/{id}` | Member resumes (Career Blueprint) |
| `reports/{id}` | Content reports (moderation) |

**Field-naming conventions**
- IDs use camelCase (`companyId`, `ownerUid`, `authorUid`)
- `photoURL` uses capital `URL` (not `photoUrl`) — Firestore rules expect this exact casing. A typo here would silently break the field; worth tightening with stricter `User` typing.
- Companies emit both `categoryIds` (array, current model) and `categoryId` (singular, legacy) — `Companies.tsx` checks both.
- Timestamps use `serverTimestamp()`, named `createdAt` and `updatedAt`.

**Images** live in Firebase Storage, not Firestore (`src/lib/uploadImage.ts`): uploads go to `users/{uid}/{folder}/...`, are downscaled client-side, and only the download URL is written to the document. `migrateDataUrlToStorage()` self-heals any legacy base64 image the next time that field is edited. Storage rules (`storage.rules`) restrict writes to the owning user, ≤10MB, image content-types only; reads are public.

---

## 8. Security rules

Live in `firestore.rules`. Key patterns:

- Helper functions: `isSignedIn()`, `isOwner(userId)`, `isAdmin()`, `isValidId(id)`, `incoming()`, `existing()`
- Validators: `isValidUser()`, `isValidCompany()`, `isValidForumPost()`, etc. — invoked on writes
- User profile updates use `affectedKeys().hasOnly([...])` to whitelist editable fields
- Admin doc creation is gated by the hardcoded email whitelist (super-admin bootstrap)
- Companies, news, settings, branding are admin-write only
- Forum topics: signed-in users create their own; replies live in the `/posts` subcollection
- Chat creation is gated on `users/{uid}.isPro == true` — by design, but looks like a bug to non-Pro users testing it (see §11)

**Known relaxations**
- `/users/{userId}` create rule no longer calls `isValidUser(incoming())` — the strict create validator was rejecting the bootstrap payload from `App.tsx` for an unidentified field. The **update** rule (which is what actually protects ongoing writes) still uses the strict whitelist. Future hardening: identify the offending field and re-enable strict create validation.
- `isValidPost` was loosened; client-side sanitization compensates. Tighten once the base64 migration is fully confirmed complete.

**Recurring bug pattern (history, so it isn't repeated)** — the same family of rules bugs has bitten posts → profiles → groups → events:
- `data.createdAt == request.time` literal equality silently fails for `serverTimestamp()` writes in this config. Fix: `data.createdAt is timestamp`.
- Optional fields that can arrive as `null` fail a plain `is string` check. Fix: `data.x == null || data.x is string`.
- Validators missing fields the client actually sends → rejected writes.
- Admin gates that checked only `companyId` and not `isAdmin()`.

When adding any new collection write, mirror the hardened patterns already in the rules: null-tolerant optionals, `is timestamp` for server timestamps, `isAdmin()` bypass where appropriate, and `organizerUid`/`creatorUid == request.auth.uid`.

**What the rules must reject** — the attack/edge-case surface every new rule should be checked against:
1. Identity spoofing — creating content with someone else's `authorUid`
2. Privilege escalation — a user setting `isAdmin: true` on their own profile
3. Schema creep — updates that smuggle in a field with no validator (e.g. an unverified `isVerified: true`)
4. Role bypass — a non-admin writing to an admin-only collection (`news`, `settings`, etc.)
5. ID poisoning — oversized or malformed document IDs
6. Relational orphans — a forum reply / comment pointing at a topic ID that doesn't exist
7. Size attacks — content fields with no upper bound
8. Immutable-field tampering — changing `createdAt` on an existing doc
9. Counter shortcuts — setting `likesCount` directly instead of via increment logic
10. Unscoped list queries — dumping an entire collection (e.g. `users`) without a filter
11. PII leaks — a non-admin reading another user's private fields directly
12. Timestamp spoofing — sending a client-supplied `createdAt` instead of `serverTimestamp()`

---

## 9. Open items

### Red flags — address before public launch

| Item | Detail |
|---|---|
| **Server endpoints have no auth check** | `/api/notify`, `/api/metadata`, and `/api/job-apply` in `server.ts` accept any request — confirmed still true. Add Firebase ID-token verification before opening to real users. |
| **Placeholder secrets** | `resend-key`, `linkedin-client-id`, `linkedin-client-secret` were placeholder values as of the last infra check — verify current state in Secret Manager. Email notifications and LinkedIn import fail silently (logged, not sent) until real values are set. |
| **No Firestore backups configured** | A single bad admin action could wipe data with no recovery. Configure scheduled exports to a GCS bucket via Cloud Scheduler (~5 min setup) — verify current state in GCP console. |
| **`isValidUser` create-rule relaxation** | See §8. The update rule still constrains writes; the create rule doesn't yet. |
| **Rules deploy drift** | Cloud Build doesn't deploy rules; console pastes drift from repo. Deploy rules via CLI only, and verify console == repo before trusting either. |
| **Custom domain target is undecided** | Earlier notes disagree: one says wire up `app.tankonomics.com` (subdomain), another says `tankonomics.com` (apex) — neither is fully wired. **Decide apex vs. subdomain vs. `www` canonical before touching DNS or Firebase Auth's authorized-domains list.** |

### Confirmed still-open (code-checked this session)

- **No pagination** on admin lists (companies/members/news fetch everything). Will get slow past ~500 docs each.
- **Error-handling coverage is partial** — `Admin.tsx` has `alert()`-based error handling in places but only ~8 `catch` blocks across a 148KB file; most forms still silently swallow Firestore errors. Apply a consistent `try/catch + alert/toast` pattern everywhere.
- **`industrySegment` is still free text** on Profile (`placeholder="e.g. LNG · Crude oil · Chemicals"`), not sourced from `company_categories`. `CategorySelector` exists and is already used in Admin, Events, Forums, and Jobs — Profile just hasn't adopted it yet.
- **Several admin sections are create+delete only.** "Can't edit X" is often missing UI, not a permissions bug — check the rules/UI actually support edit before assuming it's broken.
- **Display gaps** — saved fields that don't render in detail views. The events modal→page rebuild (see §10) fixed one instance (categories + CTA weren't rendering). Audit other detail views for the same pattern: company products/social links, job salary/type.
- **TypeScript isn't in strict mode** (`tsconfig.json` has no `"strict": true`); `any` is used in places. Tightening would catch the kind of field-name mismatches (e.g. `photoURL` vs `photoUrl`) that have already caused bugs.

### Resolved since last full review

- **Image uploads → Storage** — done. `src/lib/uploadImage.ts` uploads to Storage with client-side downscaling; `migrateDataUrlToStorage()` self-heals legacy base64 fields on next edit. Treat any remaining base64 in `users.photoURL` / `companies.logo` as transitional, not a bug.

### Roadmap

**Near-term**
- Run the testing checklist (§11) end to end; fix what surfaces.
- Add edit UIs where missing.
- Finish the display-gap audit.

**Medium-term**
- Make CLI rules deployment the standard; treat `firestore.rules` as the single source of truth, full stop.
- Extract a reusable single-doc `useDoc` hook — the codebase keeps reimplementing `getDoc` + `useParams`.
- Consider giving more modal-only detail views their own routed pages (as already done for events) — surveys, jobs are candidates.
- Curated `industrySegment` dropdown sourced from `company_categories`.
- Loading states and translated error messages across all forms ("Missing or insufficient permissions" → "You need admin access to create companies.").

**Larger**
- Revisit the relaxed `isValidPost` and `isValidUser` create rules.
- Wire up the custom domain end to end (decision needed first, see Red Flags).
- TypeScript strict mode.

**Wishlist**
- Email digest of weekly forum activity
- Direct messaging between members
- Company analytics dashboard
- Verified-by-employer profile badges (rule infrastructure exists, UX flow missing)
- AI-powered company recommendations (Gemini integration — `@google/genai` already a dependency)
- Mobile-responsive optimization (currently desktop-first)
- i18n for multi-language support

---

## 10. What's been built recently

- **Full visual redesign** across every consumer page + the 12-tab admin dashboard (see §4).
- **Career Blueprint (resume builder)** — was orphaned with no link anywhere; added a discoverable entry-point card on Profile with built / not-built states.
- **Multi-day events** — `endDate`/`endTime` fields, backward-compatible with single-day events.
- **Event editing in Admin** — previously create-and-delete only.
- **`EventDetail` page** at `/events/:eventId` — replaced the cramped modal; now renders classification categories + the CTA button (both were missing from the modal). Shared date helpers extracted to `src/lib/eventDates.ts`.
- **Admin group privileges** — admins can create/approve groups without a company link; auto-approval for admin-created groups; `pending` member role allowed.

---

## 11. Testing checklist

For **each module**, run the full loop **as admin AND as a normal member** — the member path is under-tested and behaves differently under the rules:

```
create → refresh → view → edit → delete
```

Modules to cover: Surveys (incl. voting), Forums (topic + reply), Jobs (post + apply/save), Groups (create + join private + post inside), News (admin publish), Companies (edit profile + claim flow), Posts (create + like + comment), Chats/Messages (note the `isPro` gate).

When something fails, capture: **the exact browser console error (F12 → Console)** and **which account you were on**. That combination is what cracked the original events-page bug.

---

## 12. Troubleshooting

**"No document to update: users/..." error** — the user's profile document doesn't exist. Should auto-create on sign-in via the `App.tsx` bootstrap. If it doesn't: check the console for "User bootstrap failed:", verify rules are deployed (`firebase deploy --only firestore:rules`), confirm the Cloud Run revision is current. `Profile.tsx` uses `setDoc + merge` as a fallback, which creates the doc if missing.

**"Missing or insufficient permissions" on writes** — usually one of: user not actually signed in (`getAuth().currentUser` in console), user not in `admins/{uid}` but attempting an admin action, field shape not matching `isValidX(incoming())`, or a missing composite index (the Firestore error usually links directly to creating it).

**Admin panel link missing from nav** — `isAdmin` is false in `App.tsx` state. Check: sign-in email is in `SUPER_ADMIN_EMAILS`, `admins/{uid}` doc exists, and no "User bootstrap failed:" error pre-empted the admin check.

**Forum topic detail page is blank** — verify `firestore.rules` defines both `forum_topics/{id}/posts/{postId}` (canonical) and the legacy `/comments` subcollection, and that `PostDetail.tsx` passes the `enabled` flag to `useCollection`.

**Categories not appearing** — needs the composite index on `company_categories(level ASC, order ASC)`. Verify in Firestore Console → Indexes.

**Cloud Build succeeds but no new Cloud Run revision** — expected if `src/` didn't change (see §6's note on content-hashing), not a bug.

---

## 13. Composite indexes

Defined in `firestore.indexes.json`, deployed via `firebase deploy --only firestore:indexes`.

| Collection | Fields | Purpose |
|---|---|---|
| `notifications` | `recipientUid` ASC, `createdAt` DESC | Notifications feed per user |
| `posts` | `companyId` ASC, `createdAt` DESC | Company news timeline |
| `follows` | `targetId` ASC, `targetType` ASC | "Is user following X" lookups |
| `likes` | `targetId` ASC, `targetType` ASC | Like-counters per target |
| `dynamic_pages` | `slug` ASC, `published` ASC | Page resolution by URL |
| `company_categories` | `level` ASC, `order` ASC | Category tree rendering |

Plus a single-field exemption for collection-group queries: `comments.authorUid` (`COLLECTION_GROUP_ASC`) — for "find all comments by user X."

---

## 14. Repo conventions

- Windows dev environment; deploys via the GitHub web UI (no routine local git CLI use).
- Keep `firestore.rules` in version control and deploy via CLI only — never hand-paste into the console.
- Baseline build for a fresh project folder: the latest full zip — extract its top-level project tree as your starting point.
- `node_modules`, `.git`, and `dist` are excluded from build zips and regenerate locally / on build.

---

## License

Proprietary. Contact `petrodeksystems@gmail.com` for licensing terms.
