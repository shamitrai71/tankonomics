# User Tiers, Privileges & Visibility — Decisions Record

> Canonical record for user categories, premium products, profile/Blueprint
> visibility, and stage-wise rollout. Derived from the "Category of Users"
> plan (reviewed Jul 2026) plus the decisions taken in review. Pairs with
> `TALENT_BANK_PHASE0*.md` (taxonomy) and `MATCHING_ENGINE.md` (scoring).

## 1. The two axes (locked)

**Tier** (what you are / pay for) and **Role** (what you're appointed to) are
orthogonal. Moderation is performed **by admins** — it is an appointed role,
never a tier perk. Roles: platform admin, moderator (admin-appointed), group
admin (per group), founder badge. Any role can attach to any tier.

## 2. Tiers (locked)

| Tier | Who | Key privileges |
|---|---|---|
| **A — Registered** | Signed-in individual, unverified | View site, **view jobs** (cannot apply without a Blueprint), view feeds/groups, no messaging |
| **B — Member** | Verified individual | Participate in forums/events/surveys, **apply to jobs** (Blueprint attached — enforced), post to feeds, join/create groups, message connections |
| **C — Company Premium** | **Company owner** (claimed + approved company) **+ premium** — owner-only seat, one per company via `ownerUid` | Everything in B, plus: post jobs (already rule-enforced via approved-owner gate), act/post as the company, create forums/events/surveys, premium badge, job-results dashboard (future) |
| **Premium Individual** *(second product, defined now, built later)* | Any B who subscribes | Career-side perks: "who viewed your profile", profile boost, early match alerts. Different buyer and pitch from C — never conflate the two products |

**Decisions embedded above:**
- **A can view jobs.** Jobs are the acquisition hook and candidates are the
  scarce side of the marketplace; the Blueprint requirement on *apply* (already
  built) is the gate, not viewing. The original plan's "Jobs: Blocked" for A is
  reversed.
- **"Connected" is verification, not company affiliation.** An unaffiliated
  job-seeker (exactly who Jobs serves) must be able to reach B. Working
  definition: email verified + (completed Blueprint OR approved company
  affiliation). *Wording to confirm at Stage 1 build.*
- **Seat model: owner-only.** Premium attaches to the company via its claimed
  owner. No multi-seat until real companies ask for it.
- **Founder members**: invite-only badge granting C-equivalent privileges,
  renewable yearly. Renewal is **manual admin judgment for year one** — no
  activity-metric automation yet.

## 3. Visibility model (locked — "the model proposed in review")

**Profile** (`users` doc — networking identity: name, title, company, posts):
- B and above: full profile view.
- A: limited card (name, title; no contact). Nothing is fully public —
  consistent with the platform's members-only positioning.

**Blueprint** (`resumes` doc — recruitment asset: career detail, credentials,
contact):
- **Never browsable at any tier.**
- Visible to exactly: the owner, platform admins, and the company on the other
  side of a **match or application** — i.e., the three-way access the
  `job_matches` rules already enforce. This codifies built behaviour rather
  than adding a system.

**Messaging:** connections-only baseline (B+), **plus a match-unlocked
channel** — once a match/application exists between a company and a candidate,
they can message each other. Without this the hiring loop dead-ends.

**Contact-detail reveal:** the candidate's phone/email on the Blueprint is
revealed to the company **only when the candidate accepts the match (or admin
confirms)** — not on application. This keeps the platform in the transaction
and prevents instant off-platform disintermediation. *Exact trigger
(candidate-accept vs admin-confirm) to finalise at Stage 1.*

## 4. Deferred / rejected (with reasons)

- **Premium-feel styling** (bespoke post/group styling per tier) — rejected in
  favour of a single consistent **badge system**. Same status signal, a tenth
  of the maintenance.
- **Founder activity-metric automation** — deferred; manual renewal year one.
- **Multi-seat company premium** — deferred until demanded; owner-only now.
- **Downgrade behaviour** (premium lapses: do created groups/forums persist?)
  — decide at Stage 2 build. Default suggestion: content persists read-only.

## 5. Confirmed architecture notes

- **Company categories ≠ jobs taxonomy** — locked in Phase 0: company
  categories are the products/services axis; the taxonomy is the career axis.
  A company carries both. This plan does not change that.
- **Profile ≠ Blueprint** — already physically separate (`users` vs `resumes`
  collections). This plan formalises visibility on top of existing structure.
- **Premium flag today**: `isPro` is an admin-granted flag on *users*. C-tier
  premium is conceptually a *company-level* attribute reached through its
  owner; Stage 2 decides whether it lives on the company doc (recommended) or
  stays on the owner's user doc.

## 6. Stage-wise execution — STATUS: ALL FOUR STAGES COMPLETE (Jul 2026)

**Stage 1 — Tier gating. ✅ DONE.**
- `tier` ("A"|"B"|"C"|"admin") computed in the App auth context, plus
  `hasBlueprint`. Every surface keys off it.
- **B verification defined and locked:** email-verified **AND** has a
  Blueprint. Enforced server-side by `isVerifiedMember()`.
- **Resume-id = user-uid migration** (the enabling change): the Blueprint saves
  at doc id == uid via a `setDocument` merge helper, so rules can check
  `exists(/resumes/$(uid))`. Blueprint-presence is otherwise unqueryable in
  rules (rules can `get()` a known path but cannot query by field).
  *Legacy note: any pre-migration resume with an auto-id must be re-saved once
  to land at the uid, or its owner won't register as B.*
- Participation gated to B+ in rules: feed posts, comments, forum topics,
  forum replies. Creation (events/surveys/groups) remains company-gated (C).
- `TierGate` component guides users through what's missing (verify email /
  create Blueprint / claim company) instead of silent permission errors.
- A-tier limited profile card (name/title/company only when viewing others).
- **Match-unlocked messaging:** the chat-create rule previously required
  `isPro`, which wrongly limited messaging to premium users. Now B+ can chat,
  and the app opens the Message action for **connections OR a matched
  company↔candidate pair** — without this the hiring loop dead-ends.

**Stage 2 — Company Premium. ✅ DONE.**
- **Premium lives on the COMPANY doc** (`plan: "free"|"premium"` +
  `planSince`), not the user — matching the owner-only seat model and the
  eventual billing target. `isValidCompany` gained the fields and was wired
  into the companies write rule (which had no validator).
- **`isPro` deliberately preserved untouched on the user doc** as the
  foundation of the separate Premium Individual product (Stage 3).
- C-tier = owns an **approved** company with `plan == "premium"`.
- Admin grant/revoke toggle in Admin → Companies, carrying an explicit
  **payment-integration seam** (comment marking where a billing check replaces
  the admin grant).
- ★ PREMIUM badge on the company profile; **talent dashboard** for premium
  owners (their jobs → applications/matches ranked by match score, applications
  badged); free companies see an upsell card.
- *Implementation note:* the dashboard queries `job_matches` by
  `companyOwnerUid` (not `companyId`) because that is what the read rule
  permits — Firestore rejects queries it cannot prove are scoped to readable
  docs.

**Stage 3 — Premium Individual. ✅ DONE.** (All three features key off `isPro`.)
- **Who viewed your profile**, on the **LinkedIn reciprocal model**: a view is
  recorded with the viewer's identity **only if the viewer is public**
  (`isPublic`); private browsers leave no trace and correspondingly cannot see
  their own viewers. Public + premium → viewer names/titles/photos. Public +
  free → **count only**, with the upgrade prompt. New `profile_views`
  collection (doc id `{viewedUid}_{viewerUid}`, so re-views upsert rather than
  duplicate). The existing "Public profile" toggle now explains the tradeoff.
  *Note: `isPublic` defaults false, so nobody is tracked until they opt in.*
- **Profile boost** — an honest **banded tiebreaker**, not score-faking: in the
  admin candidate ranking, a premium candidate sorts above a non-premium one
  **only when scores are within 5 points**. A clearly better non-premium
  candidate still wins. Boosted rows show a visible "★ boosted" marker, so the
  admin can see why a candidate ranked where they did.
- **Early match alerts** — premium candidates get an immediate notification
  when an admin suggests a match; non-premium discover matches passively.

**Stage 4 — Community depth. ✅ DONE.**
- **Group admin tooling: ALREADY EXISTED — nothing was built.** `GroupDetail`
  already has a Settings tab with a pending-request count, an approval panel,
  working approve/reject handlers, and member management; the rules already
  support `isPrivate`, `role: 'pending'`, `status: pending/approved/rejected`,
  and an `isGroupAdmin()` helper. This plan simply hadn't accounted for it.
  *Recorded so nobody rebuilds it.*
- **Founder programme — built.** `isFounder` + `founderSince` on the user doc;
  admin grant/revoke toggle beside the Pro toggle in Admin → Members. Founder
  is a **role**, orthogonal to tier (per §1): it grants **C-equivalent
  privileges without owning a premium company**. "★ Founder" badge on the
  profile. **Renewal is manual admin judgment** — `founderSince` is surfaced in
  the toggle tooltip; activity-metric automation stays deferred per §4.

## 7. Open items (still to confirm/build)

1. **Contact-reveal trigger** — candidate-accept vs admin-confirm (§3). Not yet
   implemented; Blueprint contact details are currently governed only by the
   `job_matches` visibility rules.
2. **Downgrade behaviour** — what happens to a lapsed premium company's
   groups/forums. Default suggestion stands: content persists read-only.
3. **Payments** — every premium grant is currently a manual admin toggle. The
   seam is marked in the company premium toggle.
4. **Messaging enforcement note (accepted trade-off):** the rules enforce B+
   and participant-membership on chat creation, but the
   *connection-or-match* requirement is enforced in the app layer, because
   Firestore rules cannot query `job_matches` by participant pair. Low stakes;
   revisit only if abuse appears.
