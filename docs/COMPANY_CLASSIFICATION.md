# Cross-App Company Classification — Plan (FOR REVIEW)

> **⚠️ SHELVED — Jul 2026.** Cross-app integration was abandoned; the four
> apps (Tankonomics, ASTSPARES, TANK BAZAAR, TANK PROTOCOL) develop
> independently, with cross-links to be added between them later rather than a
> shared registry. This document is retained as reference only — its grounded
> per-app analysis (the ASTSPARES vendor-type mapping, the TANK BAZAAR
> operator/port-name data-quality finding, the TANK PROTOCOL datalist spec) is
> useful if a shared registry is ever revisited. **Do not implement without
> re-opening the decision.** The "Partner" tag removal it described was done
> separately as a Tankonomics-only change.


> One classification for companies across the four apps — **Tankonomics**
> (network, the Mother Ship), **ASTSPARES** (parts catalog & RFQ),
> **TANK BAZAAR** (terminal storage intelligence), **TANK PROTOCOL**
> (emissions calculator) — shared where possible, distinctions namespaced and
> identifiable where unavoidable. Includes removal of the "Partner" tag.
> Nothing implemented yet; per-app mapping tables finalise once the other
> three repos are reviewed (see §8).

## 1. The Mother-Ship principle

Tankonomics holds the **Canonical Company Registry**: one document per
real-world company, with a stable canonical slug (`co-vopak`,
`co-petrodek-systems`). Every other app **references** companies by that slug
— none invents its own company records or classification. New companies and
new classification nodes are added in Tankonomics first; the other apps
consume. This mirrors the jobs-taxonomy discipline that already works: one
source of truth, satellites reference by id.

Two locked constraints carried forward from `TALENT_BANK_PHASE0.md`:
company classification stays **separate from the jobs taxonomy** (products/
services axis vs career axis), and a facility is **not** a company (§5).

## 2. The shared model — three dimensions per company

**D1 — Role in the value chain** (what the company IS; 1 primary + optional
secondary). Foundation: the 21 `vertical` nodes already seeded, consolidated
into 9 role groups for card display:

| Role group | Covers (existing verticals) |
|---|---|
| Owner / Operator | Terminal Operators, Port Operators, Pipeline Operators, LNG Operators, Refineries, Petrochemical Plants, Chemical Manufacturers, Power Plants, Defence Storage |
| EPC & Construction | EPC Contractors |
| OEM / Manufacturer | Tank Manufacturers, Equipment OEMs |
| Supplier / Distributor | Equipment Suppliers |
| Service Contractor | Maintenance Contractors |
| Inspection & Certification | Inspection Companies |
| Consultant & Engineering | Engineering Consultants, Environmental Companies |
| Logistics & Trading | Logistics Companies |
| Technology & Software | Software Vendors |
| *(orthogonal)* | Government Agencies, Fire & Safety Companies keep their vertical as secondary detail |

**D2 — Offerings** (what it SELLS/DOES; multi-select). The current sector
list restructured into groups so all four apps hang off the same tree:

- **Tank Hardware & Components** — Tank Seals, Tank Gauging, Fire & Safety
  Equipment, Terminal Automation hardware
- **Construction & Heavy Works** — Tank Construction, Heavy Engineering
- **Services** — Tank Maintenance, Tank Cleaning, Inspection Services,
  Project Consultancy, Training & Skilling, Recruitment & Jobs
- **Operations & Infrastructure** — Refineries/Petchem/Chem, Shipping,
  Transportation, Terminal Operations
- **Digital & Technology** — Robotics & AI, Software, Terminal Automation
  systems

**D3 — Products handled** (multi; shared facet). Crude, Gasoline, Diesel,
LPG, LNG, Chemicals, Biofuels, Hydrogen, Ammonia, Aviation Fuel. Already a
TANK BAZAAR filter; maps 1:1 onto Tankonomics `industry` children — reuse
those ids, don't mint new ones.

Company doc gains: `slug`, `verticalId` (+ optional `secondaryVerticalIds`),
`sectorIds[]` (replacing single categoryId/subCategoryId), `productIds[]`.

## 3. Per-app mapping

**Tankonomics (registry of record).** Full model. Directory sidebar filters by
D2 groups; company card shows the **D1 role** where "Partner" sat (see §4),
offerings chips as today, `plan`/Verified badges unchanged.

**ASTSPARES** *(repo reviewed — mapping grounded)*. Two findings:

*It already has a company classification.* Vendors carry
`type: manufacturer | trader | service | other` (`vendor-types.ts`, plus a
legacy `distributor`), and their own id scheme (`AST-V-00001`). Adoption =
add `companySlug` to the Vendor doc + map VendorType → registry role:

| ASTSPARES VendorType | Registry role (D1) |
|---|---|
| manufacturer | OEM / Manufacturer |
| trader, distributor *(legacy)* | Supplier / Distributor |
| service | Service Contractor |
| other | unmapped — role chosen at registry-link time |

*Its category tree uses hierarchical slug ids* (`rim-seals--primary--
mechanical-shoe`) — keep them; they're ASTSPARES-local, and **each top-level
family gains a `sectorId`** into D2:

| Family (as coded) | D2 sector |
|---|---|
| rim-seals (+children), gaskets, hoses | Tank Seals *(Tank Hardware & Components)* |
| flame-arrestors (+children), pv-valves | Fire & Safety Equipment *(Tank Hardware & Components)* |

The live catalog UI shows further families (Gauge Hatches, Roof Drains,
Fasteners, Lightning Protection, Hand Tools, Safety Equipment, Seal Fittings,
Tank Services) beyond the 10 in the seed JSON — presumably admin-added in
Firestore. Proposed: gauge-hatches → Tank Gauging; roof-drains / fasteners /
seal-fittings → Tank Seals; lightning-protection / safety-equipment → Fire &
Safety Equipment; tank-services → Services group. Confirm at S3.

**TANK BAZAAR** *(repo reviewed — mapping grounded)*. Facility schema:
`{id, name, country, city, lat/lng, cap, tanks, berths, occ, products[], op,
size, type}`. The **`op` string is the only company concept** in the app —
the clean join point: it becomes `companySlug` referencing the registry.
Facilities are assets, never companies; `type` (port/inland), capacity, and
berths stay facility metadata. **D3 confirmed at exactly six values** —
Crude, Diesel, Gasoline, LNG, LPG, Chemicals — mapping 1:1 onto Tankonomics
industry children. **Data-quality finding:** the seed's 84 distinct `op`
values mix genuine operators (Vopak, ADNOC, Saudi Aramco, IOCL, Reliance,
Petrobras…) with **port/place names leaked into the operator field**
(Gothenburg, Europoort, Brofjorden, Fos-sur-Mer, Aspropyrgos, "Le" —
truncated). Registry adoption therefore needs a one-time cleanup pass:
each `op` value classified as real-operator → mint `co-` slug, or
place-name → operator researched or marked `co-unknown` pending.

**TANK PROTOCOL** *(repo reviewed — mapping grounded)*. Better than planned:
the Company field is **already an autocomplete** — `<input list="dl_company">`
with a datalist filled from a local companies list, storing a string, with
free-text fallback built in. Adoption is a source swap: fill the datalist
from the registry export instead of the local list, store `companySlug`
alongside the display name, keep the free-text fallback (unknowns flagged for
registry addition). No local classification — pure consumer, as designed.

## 4. Removing the "Partner" tag

The word "partner" implies a commercial relationship with the platform that
doesn't exist and adds no classification value. Changes in `Companies.tsx`:
the card-footer `Partner` tag (line ~338) is **replaced by the D1 role label**
("OEM / Manufacturer", "Owner / Operator") — the tag now says something true
and useful; "Search partners…" → "Search companies…"; "No partners found" →
"No companies found"; the default description drops "Industry partner —".
Verified and ★ PREMIUM badges unchanged.

## 5. Identity & sync mechanics

- **Canonical slug** minted in Tankonomics (`co-` + name slug), immutable.
- Distinctions namespaced and back-linked: `ast-fam-*` (+`sectorId`),
  `tb-facility-*` (+`companySlug`). A namespaced id must always carry its
  back-link — that is what keeps distinctions *identifiable*.
- **Distribution v1:** a generated `company_registry.json` (slug, name, roles,
  sectorIds, productIds) committed/consumed by the satellite apps — same
  generator-emits-seed pattern as the jobs taxonomy. A live read API is a
  later upgrade; don't build it before two apps actually consume.
- Additions flow Mother Ship → satellites, never the reverse; a satellite
  needing a new node requests it in Tankonomics first.

## 6. What this deliberately does NOT do

No merging of company classification with the jobs taxonomy (locked). No
facility records in the registry (assets, not companies). No live sync
infrastructure before there are consumers. No renaming of ASTSPARES part
families to force tree-identity — catalog depth is its job; the `sectorId`
back-link is the contract.

## 7. Stage-wise execution (proposed)

- **S1 — Registry fields + Partner removal (Tankonomics only).** Add
  `slug`/`verticalId`/`sectorIds[]`/`productIds[]` to company docs + admin
  form; restructure sectors into D2 groups; card shows role; strip "partner"
  strings. Migration: existing categoryId/subCategoryId → sectorIds[].
- **S2 — Registry export.** Generator emits `company_registry.json`.
- **S3 — ASTSPARES adoption.** Manufacturers keyed by slug; part families
  gain `sectorId`.
- **S4 — TANK BAZAAR adoption.** Facilities carry `companySlug`; operator
  pages link to registry identity; D3 ids aligned.
- **S5 — TANK PROTOCOL adoption.** Company autocomplete against the registry.

## 8. Repo review status

- **TANK BAZAAR ✅ reviewed** (public repo). Mapping grounded in §3; the
  companySlug join, D3 alignment, and the operator-field cleanup are fully
  specified. S4 is ready to build on approval.
- **ASTSPARES ✅ reviewed.** Vendor schema + VendorType→role mapping and
  family→sectorId table grounded in §3. One open check at S3: reconcile the
  Firestore-side admin-added families against the seed JSON.
- **TANK PROTOCOL ✅ reviewed.** The datalist source-swap spec is in §3.
- **All three satellites reviewed — the plan is fully grounded.**
