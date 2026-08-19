# Tankonomics Ecosystem — Handoff Summary

For continuing this project in a fresh conversation. Verified against the actual
files as of writing, not reconstructed from memory.

---

## 1. The five-app ecosystem

| App | What it is | Stack | This session's involvement |
|---|---|---|---|
| **Tankonomics** | Central hub — company directory, jobs, forums, talent bank, admin panel | React 19 + Vite 6 + TypeScript + Tailwind 4 + Firebase | **Heavy** — taxonomy master, Admin.tsx, App.tsx, Profile.tsx all touched |
| **TankWorldIndia (TWI)** | Standalone India-focused tank/terminal supplier directory | Single-file HTML (`twi.html`), same category taxonomy mirrored from Tankonomics | **Heavy** — taxonomy kept in lockstep with Tankonomics, ~186 live companies, ~117 more researched and pending |
| **ASTSPARES** | Next.js parts catalog | Next.js | **Not touched this session.** Known from earlier work: has a GK (gaskets) product line with a `masterCategorySlug` pointing at Tankonomics — that link now has a real target since `gaskets` exists under Industrial Supplies (MRO) in the master tree. |
| **TankBazaar** | Single-file HTML terminal intelligence map (tankbazaar.com) | Single-file HTML | **Not touched this session.** Prior work referenced in output files (`tankbazaar_index.html`, `TANKBAZAAR_BRIEFING.md`, several review sheets) — treat as a separate, earlier thread of work I have only fragmentary visibility into from this conversation. |
| **TankProtocol** | Emissions calculator | Unknown/not covered this session | **Not touched.** No visibility into current state from this conversation. |

**Bottom line on cross-app linkage:** the *only* linkage actively maintained this
session is **Tankonomics ↔ TankWorldIndia**, via the mechanism below. ASTSPARES'
link is one-directional and passive (it points at Tankonomics slugs; nothing
here pushes data *to* ASTSPARES). TankBazaar and TankProtocol's current sync
status is unknown — don't assume they're in sync with anything without checking.

---

## 2. The cross-app identity mechanism

- **Slug = shared identity key.** Every category and company has a slug that is
  immutable once seeded and used as the Firestore document ID. This is what
  lets TWI and Tankonomics reference "the same" category or company without a
  shared database.
- **Tankonomics' `categorySeed.ts` is the master taxonomy.** TWI's
  `CATEGORY_TREE` (inside `twi.html`) is a hand-maintained mirror — every
  addition made to one was replicated in the other, in the same turn, all
  session.
- **Verification pattern used throughout:** after every category or company
  change, a script checks (a) no duplicate slugs, (b) every TWI slug resolves
  to a Tankonomics master slug, (c) every company's `cats`/`categoryIds` tags
  resolve to real slugs, (d) JS syntax is clean via `node --check` on every
  extracted `<script>` block. **Re-run this pattern before trusting any future
  edit** — it caught real bugs repeatedly (see §4).
- **Current sync state (verified, not assumed):** Tankonomics master has
  **313 category nodes** (21 L1 · 258 L2 · 34 L3). TWI has **215 category
  slugs**, all of which resolve into the master. Fully in sync as of the last
  edit.

---

## 3. What's been achieved this session

### 3.1 Category structure — Level 3 support (major)

- Discovered L3 (`tier3CategoryId`) was **designed into Tankonomics from the
  start** but never finished — the admin UI already had a 3-level category
  management screen, but the consumer-facing picker, filter, and sidebar all
  stopped at 2 levels.
- Built out the missing pieces: `CategorySelector.tsx` (admin picker),
  `Companies.tsx` (directory filter + sidebar), all now support and correctly
  test at 3 levels, with **inclusive** filtering (selecting an L2 also matches
  companies tagged only at its L3 child) and correct **narrowing** (selecting
  an L3 excludes siblings and the bare L2).
- TWI's `CATEGORY_TREE` already had L3 support baked into its rendering
  functions (`allCategoryNodes`, `categoryWithDescendants`, `categoryLabel`) —
  turned out to be built in an earlier turn and just needed real L3 data.
- **Code convention set by the user: `TS-01.1` style** (dot-suffixed parent
  code) for L3 nodes in TWI; Tankonomics uses the generic `level: 3` field.

### 3.2 Fire, Safety & Environment (FS) rebuild

- Discovered Tankonomics already had **18 FS nodes** but TWI had only
  imported **2** — this was a sync gap, not a genuine rebuild.
- Imported all 16 missing nodes into TWI, added **12 new L3 nodes** across
  both apps (rim seal variants, lightning protection sub-types incl. your
  terms "Bypass Conductors" and "Submerged Shunts", hazardous area lighting,
  spill containment split).
- **Moved** Inspection & Certification from FS to Professional Services in
  both apps (slug unchanged, so no company re-tagging needed for its 3
  occupants — Bureau Veritas, TÜV SÜD, SGS).
- **Re-tagged** Baliga Lighting from Hazardous Area Equipment to the new
  Hazardous Area Lighting node.

### 3.3 Four new L1 sheets

Added to **both** apps: **Materials & Metallurgy** (already existed in
Tankonomics, was entirely missing from TWI — imported all 17 nodes), **Utilities
& Energy** (same gap, imported all 10, added generator L3 nodes under Power
Generation), **Renewables & Energy Storage** (genuinely new, 8 nodes — solar,
BESS, hydrogen, ammonia, biofuel/ethanol, CBG/biogas, carbon capture, energy
efficiency), **Inspection Equipment** (genuinely new, 7 nodes incl. NDT
equipment L3 split, tank floor scanners/MFL, radiographic, weld inspection,
acoustic emission, borescopes, inspection drones/crawlers).

### 3.4 Other taxonomy additions

Tank cleaning sub-types (Robotic & No-Man-Entry / Manual & Confined-Space /
Degassing, plus Hydrocarbon Recovery and a new Sludge Recovery Units L2 placed
deliberately beside Vapour Recovery Units to make that distinction visible) ·
roof drain types (Swivel Joint / Articulated / Hose-Type under TS-08) · Site
Communication Systems (IA-08) · Catalyst Handling (AX-19) · Gaskets (discovered
this **already existed** in Tankonomics under MRO — a real mistake was caught
here, see §4).

### 3.5 Company research pipeline

**`twi_new_companies.xlsx`** is the working spreadsheet — 19 sheets (renamed
from generic names to descriptive ones per your last request, e.g. "New
Companies" → "Gratings"), roughly **117 companies researched and pending
review**, none yet seeded. Every entry was checked against the live roster for
duplicates before being added; every category tag was validated against the
real slug list; **86 Google Place IDs** were added via `places_search` with 9
deliberately left blank where no confident match existed.

**Description/website/address columns** were subsequently back-filled (252
cells) from research already gathered but not yet written into those columns,
plus a few fresh targeted searches. ~57 cells remain genuinely blank — mostly
small local suppliers with no findable web presence (a real finding, not a
skipped task) plus a handful of larger companies where the *registered* office
specifically couldn't be confirmed (search kept returning branch offices).

### 3.6 Live roster corrections (not pending — already applied to `twi.html`)

- **Endress+Hauser** and **Bureau Veritas**: both had a location labeled
  "India Office" with correct Mumbai city/coordinates/Place ID, but the
  street-address text was the company's *foreign* HQ address, pasted in by
  mistake. Both fixed with independently verified real Mumbai addresses.
- **Consite Engineering**: discovered live (not pending, as I'd
  mis-remembered) and missing the `mixers-and-agitators` tag despite having
  that exact product line — added directly.
- A systematic scan for this class of bug (address text naming a country that
  doesn't match the stated city/country) was run across the **entire** live
  roster — only those two mismatches found; one separate case (FMA Systems
  Ltd, UK company with an Italian address) was flagged as unresolved rather
  than guessed at.

### 3.7 Tankonomics app fixes (unrelated to taxonomy)

- **Dark mode revert bug, root-caused and fixed.** Admin.tsx's live
  theme-color preview was writing CSS variables as *inline* styles
  unconditionally — inline styles beat the `.dark` class, so landing on
  `/admin` silently forced light-mode colors regardless of the actual
  toggle state. App.tsx had already fixed this exact pattern once in its own
  code; Admin.tsx had an independent, unguarded copy that never got the same
  fix. Now guarded on `isDark`.
- **Dark-mode toggle moved** from Admin (admin-only) to Profile → Appearance
  (all users). Picked up a free improvement along the way: the state already
  supported a `'system'` (auto) option that was fully wired but never exposed
  in the UI — now a third button alongside Light/Dark.
- **White logo in dark mode.** The admin theme editor already had a working
  upload field for `logoUrlDark`, and the login screen already read it
  correctly — but the two most-visible places, Navbar and Sidebar, never
  checked it and always rendered the light-mode logo. Fixed both, with a
  fallback chain: dark logo → regular logo → built-in tank icon (which had
  the *same* class of bug — hardcoded to the wrong tone — also fixed).

---

## 4. Mistakes made and corrected (worth reading before continuing)

Being direct about these because the next instance should trust the
*verification habits* below more than any specific claim I made along the way.

1. **Claimed "no gasket category exists anywhere"** and started adding one
   under Tank Systems — my own uniqueness checker caught the resulting
   duplicate slug immediately (309 total vs 308 unique). The real problem:
   I'd only checked TWI's tree, not the full Tankonomics master, where
   `gaskets` already existed under Industrial Supplies (MRO). Fixed by
   pointing TWI at the correct existing slug instead.
2. **A category-filter logic bug in `Companies.tsx`**, caught by a written
   test suite (22 cases) before shipping: selecting an L1 and an L3 while
   *skipping* the L2 in between failed to narrow correctly. Rewrote to find
   the deepest selected descendant directly rather than walk one level at a
   time.
3. **Copy-paste bug in the Loading Arms sheet**: DKC International's
   `parent_name` field accidentally got filled with a category-slug string
   instead of "Kanon Loading Equipment B.V." — caught by my own validation
   script (which itself had a wrong index on the first pass — fixed that
   too, then re-ran correctly).
4. **Recommended staying with a flat (no-L3) taxonomy**, partly on the
   grounds that adding a third level would be "a significant change." That
   was said without checking the code first. It turned out L3 was already
   substantially built and just needed finishing — see §3.1.
5. **Liebherr India**: a Place ID search for "Liebherr India" returned their
   *appliances* (refrigerator) division, not construction equipment — caught
   by reading the actual reviews before attaching the ID, left blank instead.
6. **JRE Private Limited**: two separate Place ID searches both returned an
   unrelated, oddly-reviewed "JRE Tank Terminals" listing — not used, flagged
   explicitly rather than silently attached.
7. **Bureau Veritas naming**: earlier in the project I proposed renaming it
   outright to an Indian entity name; you correctly deferred that ("leave it
   as is, fix the address later") rather than let me force a slug change on
   an already-seeded record. That address fix is what later got done in §3.6.
8. **My own "one card per global group" parent/subsidiary rule was wrong** —
   you overruled it early on with the PROTEGO/Protego India example and the
   Nayara/Rosneft ownership example. The corrected rule (one card per
   separately incorporated legal entity, ownership ≠ identity) has held for
   the rest of the project and is worth preserving as-is.
9. **Ateco Global Industries**: a Place ID review surfaced a serious fraud
   allegation ("stole $100k, disappeared"). Initial framing over-weighted
   this as disqualifying; you correctly pushed back that dominance and bad
   reviews aren't mutually exclusive. Re-researched and added balancing
   evidence (Tank Storage Association membership, named projects in Oman and
   UAE) so the note now reflects both sides rather than just the warning.

**Pattern worth carrying forward:** almost every mistake above was caught by
*running an actual check* (uniqueness scripts, test suites, re-reading source
pages, cross-referencing the live roster) rather than by careful reasoning
alone. Keep doing that rather than trusting recall on a project this size.

---

## 5. Open items

### Taxonomy
- Nothing structurally pending — every item from the original review document
  (§3.1–3.5 of `TAXONOMY_DECISIONS_REVIEW.md`) has been built.
- **Newly surfaced, not yet decided:** TWI's Industrial Supplies (MRO) sheet
  has the same sync gap FS used to have — Tankonomics has 15 MRO nodes, TWI
  has imported only 2 (Industrial Safety Equipment, Gaskets). Flagged, not
  fixed.

### Company roster
- **~117 companies in `twi_new_companies.xlsx` are researched but not
  seeded.** This is the single biggest open item. Needs: your review pass on
  the flagged/medium-confidence entries, resolution of the handful of
  ambiguous-entity cases (StorageTech vs ERGIL, Mourik's exact legal entity,
  Western Rubbers India's two candidate matches, Bombay Instruments' two
  possible businesses), then an actual seed run.
- Remaining Place ID gaps for ~9 companies where no confident match was found.
- ~57 desc/site/address cells still blank (see §3.5 for why).

### Not touched this session
- Tankonomics ↔ TankBazaar / TankProtocol linkage status — unknown, would
  need investigation from scratch.
- ASTSPARES — no work done; its `masterCategorySlug` link to `gaskets` now
  has a real target but hasn't been verified end-to-end.
- The originally-planned **refresh-merge of TWI → Tankonomics** (re-generating
  `companySeed.ts` from TWI's roster) — mentioned early in the project as the
  next phase after company-adding wrapped up, not yet started.
- Tankonomics master logo folder / bulk Storage upload for the 572 legacy
  companies — mentioned early on, not touched this session.

---

## 6. Where things live

- **`twi.html`** — the full live TankWorldIndia app (single file). Current
  version already reflects everything in §3.1–3.6.
- **`categorySeed.ts`** — Tankonomics' master category tree. Needs the
  standard deploy: push → rebuild → **re-run "Seed master tree" in
  Admin → Taxonomy** (categories live in Firestore, not just the file).
- **`twi_new_companies.xlsx`** — the pending company roster, 19 sheets.
- **`App.tsx` / `Admin.tsx` / `Profile.tsx`** — Tankonomics dark-mode fixes.
  Standard push → rebuild deploy, no seed step needed.
- Other files in the outputs folder (`TAXONOMY_DECISIONS_REVIEW.md`,
  `FS_rebuild_review.xlsx`, `ENGINEERING_NOTES.md`, and several
  TankBazaar/talent-bank/ownership-model docs) are reference material from
  this and earlier sessions — worth skimming if a new thread needs deeper
  context than this summary provides, especially `ENGINEERING_NOTES.md` for
  the accumulated technical gotchas (regex-boundary edit danger, Windows/
  PowerShell quirks, Firestore rules patterns) that predate this session.

---

## 7. Conventions to keep following

- **Slug is the identity key** — never changes once seeded; corrections go
  into other fields, not the slug.
- **One card per separately incorporated legal entity** — ownership is not
  identity (Nayara ≠ Rosneft card); a non-incorporated business unit is not a
  company and gets no card (Emerson Automation Solutions is a division, not
  an entity).
- **Verify before asserting a gap exists** — check the full Tankonomics
  master, not just TWI, before saying "no category for X."
- **After any category-tree edit**: re-run the sync/uniqueness/slug-validity
  checks in §2 and a full `node --check` syntax pass before calling it done.
- **After any company addition**: check the live roster *and* every pending
  sheet in the workbook for duplicates first.
- **Flag, don't guess**, on ambiguous entity identity, uncertain Place ID
  matches, or conflicting source data — this has repeatedly been the right
  call over forcing a plausible-looking answer.
