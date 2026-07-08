# Matching Engine — Design & Decisions Record

> Canonical record for the Phase 2c match scorer and its configurability.
> Source of truth for *why* the scoring is built the way it is, and what is
> deliberately deferred. Pairs with `TALENT_BANK_PHASE0*.md` (the taxonomy).

## 1. What the scorer does (current, live)

`src/lib/matchScore.ts` → `scoreMatch(job, resume, weights)` returns a
**0–100** score with a per-dimension breakdown and human-readable flags.

Signals (each weighted, see §3):
- **Taxonomy overlap** — industry, standards, competencies, certifications,
  equipment: fraction of the job's required ids the resume also has, × weight.
- **Exact matches** — domain, role, seniority: full weight if the single id
  matches, else 0.
- **Soft education penalty** — if the resume's `educationLevel` ranks below the
  job's `minEducation` (ordinal, see `EDUCATION_LEVELS`), subtract a penalty
  and add a flag. Never hides the candidate.
- **Soft experience penalty** — if `yearsExperience < minYearsExperience`,
  subtract a penalty and flag.
- **Must-have gating (soft-but-heavy)** — if the resume lacks any id in the
  job's `taxMustHaveIds`, multiply the total by `mustHaveMissingFactor`
  (default 0.4) and flag. **Never hard-excludes** — a human admin makes the
  final link, so the scorer ranks and warns rather than filters.

Score clamps to 0–100. Flags surface in the admin candidate list.

## 2. Call sites

Both in `src/pages/Admin.tsx`, Jobs tab:
- Candidate ranking list — scores every unmatched resume against the selected
  job, sorts by total, shows score + flags.
- Confirm-match — records the score onto the created `job_match`.

Applications (candidate-initiated, status `applied`) and admin-suggested
matches share the `job_matches` collection, so both flow through the same
admin surface.

## 3. Configurability — DECISION (locked)

**Tier 1 is built: one global weight config, admin-editable, platform-wide.**

- Weights live in Firestore `settings/matching` (keys per `MatchWeights`).
- Admin edits them live in **Admin → Analytics → "Scoring weights"**. Saved
  changes take effect on the next score calculation — no deploy.
- `DEFAULT_WEIGHTS` in `matchScore.ts` is the fallback if the doc is absent.
- The admin panel text says "Applies platform-wide" — accurate to today.

### Why not per-company / per-job now

We discussed three tiers:
- **Tier 1** — global admin weights. ✅ Built.
- **Tier 2** — per-job weight overrides (a posting nudges emphasis).
- **Tier 3** — per-company / premium scoring profiles (a paying company's
  saved methodology applied across its jobs). A monetizable feature.

**Decision: ship Tier 1 only.** Rationale — the platform has two companies and
no premium tier. Building per-company weight UI, the rules for who may edit
which company's profile, and the resolution chain is real engineering for a
customer who does not yet exist. Same discipline applied to the knowledge
graph and the sector layers (see PHASE0_ADDENDUM §6): **build the extension
point, defer the extension.**

## 4. What makes Tiers 2–3 cheap later (the seam that IS built)

The expensive, hard-to-retrofit part is already done: **`scoreMatch` takes
`weights` as an argument.** The scoring math is fully decoupled from where the
weights come from. Adding company/job profiles later never touches the scorer.

What is NOT yet built: the *resolution* step. Today the call site loads the
global doc and passes it to every score. To add Tiers 2–3, introduce one
function:

```
resolveWeights(job, company) =>
    companyProfile(company)        // Tier 3
    ?? jobOverride(job)            // Tier 2
    ?? globalDefault(settings)     // Tier 1  (current behaviour)
```

Plus a `matchingProfile` field on the company (Tier 3) and/or job (Tier 2)
docs, their edit rules, and UI. All additive. The scorer and its call
signature stay unchanged.

## 5. Open follow-ups (non-blocking)

- Scorer flags reference must-haves by **count** ("Missing 2 must-haves"), not
  by name. Resolving the ids to names is a small refinement.
- When Tier 3 is built, update the admin panel copy (currently "platform-wide")
  and add the per-company editing surface.
