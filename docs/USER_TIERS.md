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

## 6. Stage-wise execution (mapped to what already exists)

**Stage 1 — Tier gating.** Enforce A/B/C in rules + UI: A job-view (open the
jobs read rule to signed-in), apply-requires-Blueprint (✅ built),
forums/events/surveys participation B+, creation C, messaging connections-only
(✅ largely built) + match-unlocked channel (new), limited profile card for A
(new). Confirm the B verification definition.

**Stage 2 — Company Premium.** Company-level premium flag (admin-granted
first, payments later), owner-only C privileges wired to it, premium badge,
job-results dashboard on the company view. Decide downgrade behaviour.

**Stage 3 — Premium Individual.** Profile-view tracking (privacy note: track
views only when the viewer consents to being visible — LinkedIn model),
"who viewed your profile", profile boost, early match alerts.

**Stage 4 — Community depth.** Group admin tooling (approve/decline members,
open/closed toggle), founder programme launch.

## 7. Open items to confirm before Stage 1 build

1. Exact wording of the B verification rule.
2. Contact-reveal trigger: candidate-accept vs admin-confirm.
3. Whether A's limited profile card shows company affiliation or only
   name/title.
