# Location-Level Claiming, Delegation & Revocation — Design Draft

> **Status: DRAFT — not yet reviewed or implemented.** Reconstructed from a
> design discussion that was never recorded in this repo (no matching code,
> comments, or docs were found — see search notes at the bottom). Grounded in
> the actual current schema and security-rule conventions this repo already
> uses; nothing below assumes a pattern the app doesn't already have somewhere
> else. Pairs with `COMPANY_CLASSIFICATION.md` (shelved — this document does
> not depend on it and can proceed independently) and `USER_TIERS.md` (roles
> vs. tiers distinction, reused below).

## 1. The rule (as described, restated precisely)

1. A company claim, once approved, makes that user the **effective owner of
   every location under that company** — automatically, with no separate
   action required.
2. The company owner can **delegate** any individual location to a different
   user, giving that location its own distinct owner.
3. A user who is *not* the company owner can submit a **"claim your
   location"** request for one specific site (e.g. a plant manager verifying
   themselves independently of whoever owns the parent company record). The
   company owner — or an admin — approves or rejects it.
4. **Admin can revoke** ownership at either level: the whole company, or one
   specific location.

## 2. Why locations need to leave the embedded array

Today, `companies/{slug}.locations` is a **plain array field** on the company
document (`SeedLocation[]`, defined in `src/lib/locationSeed.ts`) — it has no
`ownerUid`, no claim state, nothing. This shape cannot support what's being
asked, for three concrete reasons:

- **No transactional per-item writes.** Approving one location's claim while
  another is being delegated means read-modify-writing the *entire array*
  twice, racing itself. Firestore has no atomic "update array element at
  index N" primitive for arbitrary object arrays.
- **No queryability.** "Show me every location I own" or "show me every
  pending location claim" (for the admin queue) can't be expressed as a
  Firestore query against a field buried inside an array on documents you
  don't otherwise know the IDs of.
- **No subcollection attachment.** A `location_claims` collection needs to
  reference *a specific location document* — an array element has no
  document identity of its own to reference.

**Recommendation: promote locations to a subcollection.**
`companies/{slug}/locations/{locationId}` — one document per site, each with
its own ID, its own claim/ownership state, and its own place in the
`location_claims` collection below. This is a real schema migration, not a
small tweak; §7 covers the migration path from the current array.

## 3. Data model

### 3.1 `companies/{slug}/locations/{locationId}`

```ts
interface Location {
  // Carried over unchanged from today's SeedLocation shape
  name: string;
  type: string;                 // "registered office" | "plant" | "refinery" | ...
  city: string;
  country: string;
  externalUrl: string;          // TankBazaar deep link, unaffected by any of this
  facilityClass: string[];
  processType: string[];
  primaryClass: string;
  googlePlaceId: string;

  // NEW — ownership
  ownerUid: string | null;      // explicit location owner. null = no override —
                                 // effective owner falls back to the company's
                                 // ownerUid (see §4.1). This is deliberate: a
                                 // freshly-claimed company doesn't need every
                                 // location document rewritten to "grant"
                                 // ownership — the fallback makes rule 1 true
                                 // for free, with zero extra writes.
  ownerSource: "delegated" | "location-claim" | null;
  assignedBy: string | null;    // uid of whoever set ownerUid (company owner's
                                 // uid, or "admin")
  assignedAt: Timestamp | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Why the fallback instead of eagerly copying `ownerUid` onto every location
at claim time:**
- Avoids a fan-out write across every location the instant a company is
  claimed (some companies have 5+ sites).
- Avoids staleness: if a company's ownership later changes (re-claimed after
  a revoke, transferred), every location that never had an explicit override
  follows the new owner automatically — no bulk update needed.
- Delegation and location-claims become simple, single-document writes that
  "poke a hole" in the fallback for one specific site, without disturbing
  anything else.

### 3.2 `location_claims/{claimId}`

Deliberately mirrors the existing `company_claims` shape (`src/pages/
CompanyProfile.tsx` `ClaimModal`, `src/pages/Admin.tsx`
`handleResolveClaim`) so the admin queue UI can reuse the same card
component with a second data source.

```ts
interface LocationClaim {
  companySlug: string;          // parent company — lets the company owner's
                                 // queue filter to just their own locations
  locationId: string;           // doc id under companies/{slug}/locations/
  locationName: string;         // denormalized for display without a join
  userUid: string;
  userName: string;
  userEmail: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  resolvedBy: string | null;
  resolvedByRole: "company-owner" | "admin" | null;
}
```

**Delegation does *not* create a claim doc.** The company owner already has
the authority — there's nothing to request approval for. It's a direct
assignment (§4.2), though see §5 for who actually performs the write.

## 4. Workflow

### 4.1 Company claim → automatic location ownership

1. User submits a company claim (existing flow, unchanged).
2. Admin approves → `companies/{slug}.ownerUid` set, `isClaimed: true`
   (existing flow, unchanged).
3. **Nothing else happens.** Every location under that company with
   `ownerUid == null` is *already* effectively owned by this user, purely via
   the read-time fallback: `effectiveOwner = location.ownerUid ??
   company.ownerUid`. Rule 1 is satisfied with zero additional writes.

### 4.2 Company owner delegates a location

1. On the company profile's Locations tab, the company owner sees an
   "Assign owner" action per location (gated by `isOwner`, same check
   `CompanyProfile.tsx` already uses at line 202).
2. They identify the delegate by email. **This needs a lookup path that
   doesn't exist yet** — client-side Firestore can't resolve email → uid
   directly. Either a `users`/`profiles` collection query (if one is
   queryable by email today — needs checking; `resumes/{uid}` exists per
   `isVerifiedMember()` in the rules, but that's keyed by uid, not email) or
   a small callable Cloud Function that wraps an Admin SDK
   `getUserByEmail` lookup.
3. On confirm: `location.ownerUid = delegateUid`, `ownerSource: "delegated"`,
   `assignedBy: companyOwnerUid`, `assignedAt: now`.

### 4.3 Someone claims a specific location directly

1. **Needs each location to be individually addressable**, which today it
   isn't — locations only exist as rows inside a tab on the company profile,
   with no per-location URL or standalone card. At minimum this needs a
   "Claim this location" button inline in the Locations tab list (reusing
   the existing `ClaimModal` pattern: justification textarea, submit,
   "under review" state).
2. Submit → `location_claims` doc, `status: "pending"`.
3. Shows up in **two possible queues**:
   - The company owner's own view (if the company has one) — filtered
     `location_claims where companySlug == myCompanySlug`.
   - The admin's Claims Queue in `/admin` — a second tab or section next to
     the existing "Claim Requests" queue (`Admin.tsx` ~line 1994), reusing
     the same card layout.
4. Whoever approves first wins: `location.ownerUid = claim.userUid`,
   `ownerSource: "location-claim"`, `assignedBy: approverUid`,
   `assignedAt: now`; claim flips to `"approved"`. Rejection just flips the
   claim to `"rejected"` — no change to the location.

### 4.4 Admin revoke

- **Revoke a location specifically:** clear `ownerUid` / `ownerSource` /
  `assignedBy` / `assignedAt` back to `null`. The location reverts to the
  fallback — it's owned by the company owner again, if the company itself is
  still claimed, or fully unclaimed if not.
- **Revoke the whole company:** existing `company_claims`/`companies` flow,
  unchanged. **One rule needs to be decided explicitly:** does revoking a
  company also strip locations that were *explicitly* delegated or
  independently claimed? Recommendation — **no.** An explicit `ownerUid` on
  a location was granted on its own merits (delegation was a deliberate
  choice by a company owner who had authority at the time; a location-claim
  was independently reviewed and approved). It should survive a company-level
  revoke and require its own, separate admin action to undo. Only locations
  that were *purely riding the fallback* (no explicit `ownerUid`) lose their
  effective owner automatically when the company claim is revoked — which
  needs no write at all, since the fallback source just disappeared.

## 5. Who actually performs the writes (the part that changes the naive design)

The existing rule for the `companies` collection is blunt and worth taking
seriously:

```
match /companies/{companyId} {
  allow write: if isAdmin() && (request.method == 'delete' || isValidCompany(incoming()));
}
```

**No owner exception at all.** Even a fully claimed, approved company owner
cannot write to their own `companies/{slug}` document today. Every
owner-initiated action visible elsewhere in the app (posting to the company
feed, verifying an employee) is modeled as a write to a **separate**
collection that merely *references* the company — never a direct write to
the company doc itself.

That's a deliberate security posture, and the location design should match
it rather than introduce a new kind of trust the app has never used. Two
ways to stay consistent:

**Option A — Cloud Function intermediary (recommended).** A callable
function (`delegateLocation`, `resolveLocationClaim`, `revokeLocation`)
checks server-side whether the caller is the company's `ownerUid` or an
admin, then performs the write with Admin SDK privileges. The client never
writes `locations/{id}` directly. This is the cleanest match for the
existing posture and centralizes the authority check in one place instead of
replicating it in security rules.

**Option B — Narrow rule extension.** Add `isOwner(get(/databases/$(db)/
documents/companies/$(companySlug)).data.ownerUid)` as an allowed writer,
but *only* for the specific fields `ownerUid` / `ownerSource` / `assignedBy`
/ `assignedAt` on the `locations` subcollection — never for the descriptive
fields (`name`, `city`, `googlePlaceId`, etc.), which stay admin-only like
today. This is more work to get airtight in rules syntax and is easier to
get subtly wrong than a Cloud Function's plain server-side `if`.

**Recommendation: Option A.** It's the smaller, more auditable change, and
it's the pattern this app would need to build anyway the first time it wants
*any* owner-initiated privileged write — which this is.

## 6. Sketch: `location_claims` security rule

Mirroring the existing `company_claims` rule shape exactly:

```
match /location_claims/{claimId} {
  allow read: if isAdmin() || (isSignedIn() && resource.data.userUid == request.auth.uid);
  allow create: if isSignedIn() && isValidLocationClaim(incoming());
  allow update: if isAdmin();  // resolution goes through the Cloud Function (§5),
                                // not a direct client update — this rule just
                                // blocks anyone else from touching it.
  allow delete: if isAdmin();
}
```

`isValidLocationClaim` needs the same shape-validation treatment the repo
already gives `isValidCompanyClaim` (checking required fields exist and are
the right type) — not sketched here in full since it's mechanical once the
schema above is final.

## 7. Migration from the current embedded array

For every existing `companies/{slug}` document with a non-empty
`locations[]` array:

1. For each array element, create `companies/{slug}/locations/{new-id}` with
   all the existing `SeedLocation` fields copied over unchanged, plus
   `ownerUid: null`, `ownerSource: null`, `assignedBy: null`,
   `assignedAt: null`, `createdAt`/`updatedAt` set to now.
2. Leave the original `locations[]` array field in place, untouched, during
   a transition window — `CompanyProfile.tsx`'s Locations tab currently
   reads directly from it (`company.locations.map(...)`, line 704). Cut the
   UI over to reading the new subcollection in the same change that starts
   writing to it, then remove the array field in a follow-up cleanup once
   nothing reads it anymore.
3. The bulk "Seed locations" admin action (`Admin.tsx` `handleSeedLocations`,
   the one this session's TWI transform work targets) needs updating in the
   same pass — it currently does `setDoc(ref, { locations: LOCATION_SEED
   [slug] }, { merge: true })`, a single array-field write. Once locations
   are a subcollection, seeding becomes a batch of individual document
   writes instead, one per location, each getting the new ownership fields
   defaulted to `null`.

## 8. Open questions this draft doesn't resolve

- **Email → uid lookup for delegation** (§4.2) — needs a concrete mechanism
  before delegation can ship at all.
- **What can a location-specific owner actually do**, once they have one? The
  original ask covers *who owns* a location, not what owning it unlocks
  (edit the location's own fields? Post location-specific updates? Nothing
  beyond a "verified" badge?). Needs deciding before UI can be built.
- **Company revoke while locations are mid-claim** — if a location claim is
  `"pending"` when the parent company gets revoked, does it stay pending
  (resolvable only by admin now, since there's no company owner to approve
  it), or auto-reject? Recommendation: stays pending, admin-only resolvable
  — consistent with §4.4's "explicit state survives revoke" principle.

## 9. Search notes (why this is marked reconstructed, not confirmed)

Searched the full Tankonomics repo for `delegat`, `revoke`, `claim your
location`, `location owner`, `sub-owner`, `location.*ownerUid`, and
`facilityAdmin` across every `.ts`/`.tsx`/`.md`/`.json` file. Every match was
unrelated (`URL.revokeObjectURL()` calls, subscription-tier "revoke Pro/
Founder" toggles, employee-verification "revoke verification"). No trace of
this design exists in code, comments, or the seven docs in `docs/` +
`HANDOFF_SUMMARY.md`. The data model and workflow above are a fresh
reconstruction from the description given, not a recovered original design —
worth reconciling against whatever turns up if the original discussion is
found in an earlier chat.
