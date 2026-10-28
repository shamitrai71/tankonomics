// Stable Firestore ids for TankBazaar-sourced locations.
//
// A location whose externalUrl is https://tankbazaar.com/#terminal-<N> gets the
// document id `tb-<N>`, so the id no longer depends on the location's position
// or type inside the seed array (the old rule was slugify(type), with an index
// suffix on repeats, which shifted whenever an entry was added or removed).
//
// TankBazaar facility ids are never reused. When two TankBazaar records are
// merged, the removed id is listed in TB_ID_REDIRECTS so old links and old
// Tankonomics documents can be pointed at the surviving record.
// Source: the DELETE_IDS merge notes of the TankBazaar seeder (V404, V403, V402,
// V399 and the Vadinar/Viramgam clean-up). Ids not listed here were deleted
// without a surviving record.

export const TB_ID_REDIRECTS: Record<number, number> = {
  38: 3387, 6425: 3387,       // VIPL Vizag and EIPL LPG Import Terminal merged into EIPL Visakhapatnam
  349: 2223, 3330: 2223,      // Vopak Darwin duplicates
  3233: 59, 3237: 59,         // Vopak Botany
  1728: 535, 2617: 536,       // Vopak Alemoa, Aratu
  16: 4428,                   // Vopak Pengerang -> Pengerang Independent Terminal
  575: 1703,                  // Thai Tank Terminal
  2754: 587,
  9: 526,                     // Vopak Houston -> Vopak Deer Park
  43: 613,                    // Sohar Port Terminal -> Advario Sohar
  550: 6427, 554: 6429,       // Aegis LPG placeholder rows
  74: 3406, 419: 3406,        // IndianOil Vadinar / Salaya -> Vadinar Offshore Crude Oil Terminal
  420: 3414,                  // IndianOil Viramgam Depot -> Viramgam Crude Oil Tank Farm
  3628: 1330, 3878: 1330,     // TANECO
  3614: 785,                  // KINEF
  6413: 5854,                 // Yenisey depot -> Abalakovo
  96: 685,                    // Qingdao Shihua
  3868: 53,                   // Primorsk
  3802: 54,                   // CPC
  6611: 656,                  // Rubis Terminal Rotterdam -> Tepsa Rotterdam Botlek (V432)
  6863: 681,                  // Cul de Sac (ex-Hess St Lucia) -> Buckeye St Lucia (V434)
  6466: 6867,                 // SARA Refinery -> SARA Le Lamentin (V434)
  4485: 819,               // V440 duplicate merge
  5922: 5865,              // V440 duplicate merge
  5783: 2290,              // V440 duplicate merge
  4229: 825,               // V440 duplicate merge
  4225: 1553,              // V440 duplicate merge
  4510: 818,               // V440 duplicate merge
  185: 5575,               // V440 duplicate merge
  5460: 1289,              // V440 duplicate merge
  5461: 1290,              // V440 duplicate merge
  5462: 1294,              // V440 duplicate merge
  5459: 1295,              // V440 duplicate merge
  7744: 7743,              // V440 duplicate merge
  7909: 7908,              // V440 duplicate merge
  7889: 2739,              // V440 duplicate merge
  7760: 7761,              // V440 duplicate merge
};

export function tbIdFromUrl(url?: string | null): number | null {
  const m = /#terminal-(\d+)/.exec(url || "");
  return m ? parseInt(m[1], 10) : null;
}

export function resolveTbId(id: number): number {
  let n = id;
  for (let i = 0; i < 5 && TB_ID_REDIRECTS[n] !== undefined; i++) n = TB_ID_REDIRECTS[n];
  return n;
}

export const tbUrl = (id: number) => `https://tankbazaar.com/#terminal-${id}`;

/** Document id for a location, or null when the location has no TankBazaar id
 *  (callers then fall back to the legacy type-based id). */
export function stableLocationDocId(externalUrl?: string | null): string | null {
  const n = tbIdFromUrl(externalUrl);
  return n === null ? null : `tb-${resolveTbId(n)}`;
}
