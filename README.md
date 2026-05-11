Tankonomics
A B2B professional networking platform for the storage tanks and terminals industry. Members verify their industry identity, connect with vetted partners, contribute to technical discussions, and discover companies, jobs, events, and sector reports.
Live: https://tankonomics.web.app
Stack: React 19 + Vite 6 + TypeScript + Tailwind 4 + Firebase (Auth, Firestore, Hosting) + Express server on Cloud Run
---
Project Status
Deployed and operational. Sign-in, profile editing, company directory, forum threads, admin command center, and dynamic page builder all work end-to-end. Bugs from the AI Studio → GCP migration have been resolved; remaining items are enhancements, polish, and pre-launch hardening (see "Open Items" below).
---
Architecture
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
```
CI/CD: Push to `main` → Cloud Build trigger `tankonomics-deploy` → builds Docker image → pushes to Artifact Registry → deploys new Cloud Run revision. Typical end-to-end: ~5 minutes.
---
Quick Reference
Resource	Value
GCP Project	`tankonomics`
Firebase Project	`tankonomics`
Region	`asia-south1` (Mumbai)
Live URL	https://tankonomics.web.app
Cloud Run URL	https://tankonomics-919953719236.asia-south1.run.app
Firestore Database	`(default)`
GitHub	https://github.com/shamitrai71/tankonomics
Auth	Google OAuth (primary), Email/Password, LinkedIn/Facebook (placeholders)
Trial	Blaze plan, free trial (~₹28K credit)
---
Local Development
Prerequisites
Node.js 20+
npm or yarn
A Firebase project for development (optional — can use production)
Setup
```bash
git clone https://github.com/shamitrai71/tankonomics
cd tankonomics
npm install
```
Run locally
```bash
npm run dev          # Vite dev server (typically http://localhost:5173)
```
The dev server proxies API requests to the Express backend defined in `server.ts`. To run the full stack locally, you'll need a separate terminal for the API server:
```bash
npx tsx server.ts    # Runs on port 8080
```
Build & deploy
```bash
npm run build        # Vite production build → dist/
firebase deploy --only hosting     # Deploy Hosting config only
firebase deploy --only firestore   # Deploy rules + indexes
```
Code changes auto-deploy via Cloud Build on push to `main`. Firestore rules/indexes require `firebase deploy --only firestore` from Cloud Shell.
---
Key Files
Configuration
`firebase-applet-config.json` — Firebase web config (projectId, authDomain, apiKey)
`firebase.json` — Hosting + Firestore deploy config (rewrites all traffic to Cloud Run)
`firestore.rules` — Security rules
`firestore.indexes.json` — Composite indexes + collection-group exemptions
`cloudbuild.yaml` — Cloud Build pipeline (build → push → deploy)
`Dockerfile` — Node 20 two-stage container build, exposes 8080
Application
`src/main.tsx` — React entry point
`src/App.tsx` — Root component, auth context, user bootstrap, routing
`src/firebase.ts` — Firebase SDK initialization (`getFirestore(app)` — default DB)
`src/hooks/useFirestore.ts` — `useCollection`, `useCollectionGroup`, `createDocument`, `updateDocument` helpers
`src/pages/Profile.tsx` — Profile editor with upsert-style save
`src/pages/Admin.tsx` — Admin command center (members, companies, news, forums, etc.)
`src/pages/PostDetail.tsx` — Forum topic / group post detail view
`server.ts` — Express API server (notify, metadata fetch, job apply)
---
Authentication & Authorization
Sign-in flow
User clicks Google → `signInWithRedirect` (not popup, to avoid storage-partitioning issues)
Redirects through `tankonomics.web.app/__/auth/handler` (same-origin via Firebase Hosting)
Returns to app, `onAuthStateChanged` fires
`useEffect([user])` in App.tsx runs `initUserContext()` (deterministic bootstrap)
User document bootstrap
On first sign-in, `App.tsx` performs an awaited bootstrap:
`getDoc(users/{uid})` — check if profile exists
If missing → `await setDoc(users/{uid}, newProfile)` with default fields
Seeds local React state immediately (no waiting for snapshot round-trip)
Attaches snapshot listener for live updates
This bootstrap is idempotent — running multiple times is safe.
Admin role
Admin status is tracked via the existence of an `admins/{uid}` document. Two super-admin emails are whitelisted to auto-bootstrap admin status on first sign-in:
`petrodeksystems@gmail.com`
`esraigroup@gmail.com`
Important: This whitelist exists in TWO places that must stay synchronized:
`src/App.tsx` — `SUPER_ADMIN_EMAILS` constant (~line 88-95)
`firestore.rules` — line ~488, in `admins/{userId}` create rule
To add a new super-admin, update both.
Profile saves
Profile.tsx uses `setDoc(ref, payload, { merge: true })` — handles both create and update cases. This means profile editing works even if the auto-bootstrap was somehow interrupted.
---
Firestore Schema
Top-level collections
Collection	Purpose
`users/{uid}`	User profiles
`admins/{uid}`	Admin role assignments
`companies/{id}`	Business directory entries
`company_categories/{id}`	Hierarchical industry categories (level 1/2/3)
`company_claims/{id}`	Company ownership claim requests
`forum_topics/{id}`	Discussion topics
`forum_topics/{id}/posts/{postId}`	Replies to a forum topic
`posts/{id}`	News feed posts
`posts/{id}/comments/{id}`	Comments on news posts
`groups/{id}`	Member groups
`events/{id}`	Industry events
`jobs/{id}`	Job listings
`news/{id}`	Curated industry news
`surveys/{id}`	Industry surveys
`recommendations/{id}`	Professional endorsements
`endorsements/{id}`	Skill endorsements
`notifications/{id}`	User notifications

`follows/{id}`	Follow relationships
`likes/{id}`	Likes/reactions

`dynamic_pages/{id}`	Custom pages built via admin Page Builder
`settings/{key}`	Platform configuration (theme, branding)
`sector_reports/{id}`	Industry reports
`resumes/{id}`	Member resumes
`reports/{id}`	Content reports (moderation)
Field-naming conventions
IDs use camelCase (`companyId`, `ownerUid`, `authorUid`)
`photoURL` uses capital URL (not `photoUrl`) — Firestore rules expect this exact casing
Companies emit both `categoryIds` (array, new model) and `categoryId` (singular, legacy)
Timestamps use `serverTimestamp()`, named `createdAt` and `updatedAt`
---
Security Rules
Live in `firestore.rules`. Key patterns:
Helper functions: `isSignedIn()`, `isOwner(userId)`, `isAdmin()`, `isValidId(id)`, `incoming()`, `existing()`
Validators: `isValidUser()`, `isValidCompany()`, `isValidForumPost()`, etc. — invoked on writes
User profile updates use `affectedKeys().hasOnly([...])` to whitelist editable fields. Users can only modify a curated subset of their own profile.
Admin doc creation is gated by hardcoded email whitelist (super-admin bootstrap)
Companies, news, settings, branding are admin-write only
Forum topics allow signed-in users to create their own; replies live in `/posts` subcollection
Known relaxations
`/users/{userId}` create rule no longer calls `isValidUser(incoming())` — the strict create validator was rejecting the bootstrap payload from App.tsx for an unidentified field. Update rule (which is what protects security) still uses the strict whitelist. Future hardening: identify the offending field and re-enable strict create validation.
---
Composite Indexes
Defined in `firestore.indexes.json`, deployed via `firebase deploy --only firestore:indexes`.
Collection	Fields	Purpose
`notifications`	recipientUid ASC, createdAt DESC	Notifications feed per user
`posts`	companyId ASC, createdAt DESC	Company news timeline
`follows`	targetId ASC, targetType ASC	"Is user following X" lookups
`likes`	targetId ASC, targetType ASC	Like-counters per target
`dynamic_pages`	slug ASC, published ASC	Page resolution by URL
`company_categories`	level ASC, order ASC	Category tree rendering
Plus single-field exemption for collection-group queries:
Collection	Field	Scope
`comments`	authorUid	COLLECTION_GROUP_ASC (for "find all comments by user X")
---
Open Items
Red Flags (Should Address Before Public Launch)
Server endpoints lack auth verification. `/api/notify`, `/api/metadata`, and `/api/job-apply` in `server.ts` accept any request. Add Firebase ID token verification before opening to real users.
Placeholder secrets in Secret Manager. `resend-key`, `linkedin-client-id`, `linkedin-client-secret` are placeholder values. Email notifications and LinkedIn import will fail silently until real values are added.
No Firestore backups configured. A single bad admin action could wipe data with no recovery. Configure scheduled exports to a GCS bucket via Cloud Scheduler. ~5 minutes of setup.
`isValidUser` create-rule relaxation. As noted above, the strict create validator was disabled to unblock bootstrap. The update rule still constrains writes, but ideally the create rule should also validate field shapes. Identify which field caused the rejection and re-add strict create validation.
Silent failure UX on most admin forms. Profile save now has success toasts and error alerts; most other forms (categories, news, surveys, etc.) still silently swallow errors. Apply the same `try/catch + alert + setShowToast` pattern across all admin forms.
Field name `photoURL` (with capital URL) is fragile. A typo to `photoUrl` anywhere in code would silently break the field. Consider TypeScript strict typing for the User interface to enforce this.
Enhancements (Quality-of-Life)
Curated industry segments dropdown. Profile's `industrySegment` is currently free-text. Replace with a managed enum sourced from `company_categories` so categorization is consistent.
Connect custom domain `app.tankonomics.com`. Vanity URL, doesn't affect functionality. Steps documented in earlier deployment notes. Wait until the domain is needed publicly.
Loading states everywhere. Forms should show spinners during async writes. Reduces user confusion about whether actions worked.
Better error surface. "Missing or insufficient permissions" is what Firestore returns — but users need actionable messages like "You need admin access to create companies." Catch errors and translate.
Pagination on admin lists. Companies, members, news lists currently fetch all docs. Will get slow past ~500 entries each. Use Firestore cursor-based pagination.
Image uploads → Firebase Storage. Currently `companyLogo` and `heroImage` are stored as base64 strings directly in Firestore docs. For larger images this bloats document size and is fragile. Move to Firebase Storage with URLs in the doc.
TypeScript strict mode. Currently types are looser than they could be (`any` used in places). Tightening would catch the kind of field-name mismatches that caused several bugs during migration.
Test sign-out and sign-back-in cycles to verify state cleanup works correctly across user changes.
Wishlist (Future Features)
Email digest of weekly forum activity
Direct messaging between members
Company analytics dashboard
Verified-by-employer profile badges (rule infrastructure exists, UX flow missing)
AI-powered company recommendations using Gemini integration
Mobile-responsive optimization (currently desktop-first)
i18n for multi-language support (industry has global reach)
---
Troubleshooting
"No document to update: users/..." error
The user's profile document doesn't exist. Should auto-create on sign-in via App.tsx bootstrap. If it doesn't:
Check Console for "User bootstrap failed:" — error message tells you which step failed
Verify Firestore rules deployed: `firebase deploy --only firestore:rules`
Confirm Cloud Run revision is current
As a workaround, Profile.tsx uses `setDoc + merge` which creates the doc if missing
"Missing or insufficient permissions" on writes
Usually one of:
User not actually signed in (check `getAuth().currentUser` in Console)
User is not in `admins/{uid}` collection but trying admin action
Field shape doesn't match `isValidX(incoming())` validator — check rule for that collection
Composite index missing for the query — Firestore error usually includes a direct link to create it
Admin Panel link missing from nav
`isAdmin` in App.tsx state is false. Check:
Sign-in email is in `SUPER_ADMIN_EMAILS` allowlist
`admins/{uid}` document exists in Firestore (auto-created on first sign-in for whitelisted emails)
No "User bootstrap failed:" error preventing admin check from running
Forum topic detail page is blank
Should be fixed. If it regresses:
Check `firestore.rules` defines both `forum_topics/{id}/posts/{postId}` (current canonical) and the `/comments` subcollection (compatibility)
Verify `PostDetail.tsx` passes `enabled` flag to `useCollection`
Categories not appearing
Need composite index on `company_categories(level ASC, order ASC)`. Verify in Firestore Console → Indexes tab.
Cloud Build succeeds but no new Cloud Run revision
Vite content-hashes the JS bundle. If `src/` didn't actually change between builds, the bundle hash is identical and Cloud Run treats the deploy as a no-op. This is correct behavior, not a bug.
---
Deployment Sequence
Push code changes (auto)
Commit and push to `main`
Cloud Build trigger fires automatically
Build runs (~5 min): builds image, pushes to Artifact Registry, deploys to Cloud Run
Hard refresh browser to pick up new bundle
Push rules/indexes changes (manual)
```bash
cd ~/tankonomics
git pull
firebase deploy --only firestore   # Deploys both rules and indexes
```
Wait for `✔ Deploy complete!`. Rules take effect immediately; indexes may take 1-2 minutes to build.
Force a rebuild (if needed)
Make any trivial change to a `src/*` file (e.g. add a blank line) and commit. Cloud Build will produce a new bundle hash and trigger a new revision.
---
Document History
Date	Event
May 7, 2026	Initial AI Studio export, ZIP uploaded for migration
May 8–9, 2026	GCP migration: project setup, Firestore, Auth, OAuth, Cloud Build, Hosting
May 11, 2026	Bug fixes: company creation, forum detail, profile save, deterministic user bootstrap
---
License
Proprietary. Contact `petrodeksystems@gmail.com` for licensing terms.
