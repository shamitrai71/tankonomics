# Talent Bank — Phase 0 Addendum: Review Decisions & Competency Layer (FOR APPROVAL)

> Responds to the external review (Flags.docx). Locks the F1–F6 decisions,
> adopts the competency layer via a split of the `discipline` type, and
> records accept/defer/reject positions on every other suggestion — with
> reasoning, so future-us knows *why*. Implementation only after sign-off.

## 1. F1–F6 — locked as decided

| Flag | Decision | Consequence |
|---|---|---|
| F1 | Approved | Leveled certs stay collapsed; level becomes node metadata later |
| F2 | Approved | `Loading Master` added as a **role** (Marine family) + a competency |
| F3 | **Rejected** | Five separate certs: ISO 9001 / 14001 / 45001 / 50001 / **27001** Lead Auditor |
| F4 | Approved | Competency `Marine Classification Rules` [DNV, Lloyd's Register, ABS] |
| F5 | Verify | OISD nodes ship marked `note: "verify number against OISD catalogue"`; publish to pickers only after Shamit confirms |
| F6 | Strongly approved | Group restructure included in the same regeneration |

## 2. The competency layer — adopted, with one correction

The reviewer's core recommendation (Role → **Competencies** → Certifications;
"recruiters hire for competencies, not certificates") is right and adopted.
One correction to the diagnosis: we are **not** missing a Standards object —
the `discipline` type already is it (API 650 = discipline; API 653 Inspector
= certification; that separation was §1 of the standards review). The *real*
gap the reviewer detected: `discipline` **conflates** standards-knowledge
(API 650, NFPA 30) with things-people-do (Tank Cleaning, HAZOP facilitation).

**Resolution — split `discipline` into two types:**

| New type | Definition (one-line test) | Examples |
|---|---|---|
| `standard` | A document/code/statute a person can *know* | API 650, NFPA 30, IEC 61511, OISD-STD-117, Factories Act 1948 |
| `competency` | An activity/skill a person can *do* | Tank Cleaning, HAZOP Facilitation, UT Thickness, SAP PM, Corrosion Assessment |

`certification` is unchanged (a credential a person *holds*). Together this
is exactly the reviewer's Standards → Competencies → Certifications, built
from existing machinery. Existing 50 disciplines reclassify as **16 standards
+ 34 competencies** (mapping in the generator).

**Migration mechanics — id-stable, zero orphans:** node **ids do not change**
(`disc-api-650` keeps its id; only its `type` field becomes `standard`).
Re-sync overwrites by id, so nothing is orphaned in Firestore. New nodes get
`std-` / `comp-` prefixes; the old `disc-` prefixes on migrated nodes are
cosmetic legacy, documented here so nobody "fixes" them later (id renames
would orphan docs). Rules/type-enum and Admin chips gain the two new types;
`discipline` is removed from the enum after migration.

All ~118 approved additions from the standards review re-bucket accordingly:
engineering/fire/ISO/Indian codes/labour statutes → `standard`; NDT methods,
process-safety practices, terminal operations, digital platforms → `competency`.

## 3. Reviewer's additional competencies — accepted

Tank Settlement Analysis · Corrosion Assessment · SAP PM · IBM Maximo ·
Infor EAM · OSIsoft PI System · AutoCAD · Navisworks · Aveva (E3D/PDMS) ·
Hexagon (SmartPlant). (UT Thickness folds into the existing UT node as an
alias.) These join the Digital & Automation and Inspection competency groups.

## 4. Required / Preferred / Optional — accepted, Phase 2 scope

This is job-side metadata, not taxonomy: when the Jobs modal gains taxonomy
pickers (Phase 2), each selected certification/competency requirement carries
a strength enum `required | preferred | nice-to-have`, and the match scorer
weights accordingly. Recorded now so Phase 2's schema includes it from day one.

## 5. Rich certification metadata — accepted, adopt organically

Issuer, renewal period, prerequisites, level. Two facts make this cheap: the
taxonomy validator has **no `hasOnly`** (extra fields already pass), and the
admin editor can grow fields incrementally. Reserved field names, so data
entered early stays consistent: `issuer` (string), `renewalYears` (number),
`prerequisiteIds` (string[]), `certLevel` (string). No schema work required
now; an editing UI for these fields is Phase 2+ polish.

## 6. Suggestions we are NOT taking now — and why

**Sector + Business Domain layers (rejected for now).** The reviewer's
10-layer model inserts Sector (upstream/midstream/downstream) and Business
Domain. Pushback: layer inflation is the classic taxonomy failure mode, and
both concepts are expressible cheaper — our Industry children already carry
sector-like granularity, and upstream/midstream/downstream fits better as a
future metadata enum on jobs/resumes than as a mandatory hierarchy level.
Ten layers of structure for a platform with two companies front-loads cost
where liquidity, not precision, is the binding constraint (same argument as
Phase 0 §4 of the implementation plan). Revisit when real matching data shows
the need.

**Full knowledge graph (right direction, wrong moment).** Many-to-many is
real: a cert supports several competencies; a competency spans roles. But a
graph database or graph layer now is heavy machinery with zero query demand.
Adopted path: when Phase 2/3 needs it, add **relationship arrays on nodes**
(`supportsCompetencyIds[]` on certs, `relatedRoleIds[]` on competencies) —
adjacency lists in Firestore give the graph's matching value without new
infrastructure. Recorded as the designated mechanism so nobody builds a
parallel one.

**Marine/Ports/Shipping/Offshore split (deferred, narrowed).** The point that
vessel crew, terminal operators, port logistics, and offshore platforms barely
overlap is fair — but the fix touches four existing layers (industry children,
domain subs, Marine family, Logistics family) and deserves its own small
design pass rather than a rider on this change. One immediate piece adopted:
offshore-specific certs (OPITO group) and maritime certs (STCW group) are
already separate groups, which handles the certification side of the concern.

## 7. Energy transition — modest elevation

Group already exists on the competency side. Added: industry children
**Battery Energy Storage** and **Carbon Markets** under Renewables. A full
first-class *domain* is declined for the same reason as §6 — domains are
departments, and "energy transition" is not yet a department at the companies
this platform serves; the industry + competency coverage carries the weight.

## 8. Net effect after this addendum

Types: 8 → **9** (`discipline` → `standard` + `competency`). Nodes ≈590 →
≈605 (F3's extra auditors, reviewer competencies, energy-transition children,
Loading Master role). Files touched at implementation: `generate_taxonomy.py`
(reclassification + additions), `firestore.rules` (type enum), `Admin.tsx`
(type chips + TAX_PREFIX), regenerate, push, one Re-sync in Admin → Taxonomy.

**Approval needed on:** the §2 split (the substantive change), §6 rejections
(confirm you agree with what we're *not* doing), and F5 — the OISD numbers
remain yours to verify before those nodes reach any picker.
