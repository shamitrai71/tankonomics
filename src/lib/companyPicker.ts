/**
 * The sign-up company list.
 *
 * Pending members cannot read the companies collection (the rules allow
 * approved members only), so the list they pick their company from is kept
 * as a small public index: one document per country in companyPicker/,
 * plus companyPicker/_index listing the countries. An admin rebuilds it from
 * Admin → Companies after any seed or company change.
 */
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

export type PickerItem = { id: string; name: string; city: string };
export type PickerCountry = { key: string; country: string; n: number };

/** Country of a company: the country field once the Big Merge adds it, else the last part of the address. */
export function companyCountryName(c: any): string {
  if (c.country) return String(c.country).trim();
  const parts = String(c.address || "").split(",").map((p) => p.replace(/\b\d[\d\s-]*\b/g, "").trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}
function companyCity(c: any): string {
  if (c.hqCity) return String(c.hqCity);
  const parts = String(c.address || "").split(",").map((p) => p.replace(/\b\d[\d\s-]*\b/g, "").trim()).filter(Boolean);
  return parts.length >= 3 ? parts[parts.length - 3] : "";
}
export const countryKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";

export async function loadPickerCountries(): Promise<PickerCountry[]> {
  const d = await getDoc(doc(db, "companyPicker", "_index"));
  return d.exists() ? ((d.data() as any).countries || []) : [];
}
export async function loadPickerCountry(key: string): Promise<PickerItem[]> {
  const d = await getDoc(doc(db, "companyPicker", key));
  return d.exists() ? ((d.data() as any).items || []) : [];
}

/** Admin: rebuild the whole index from the companies collection. Returns the number of companies listed. */
export async function rebuildCompanyPicker(): Promise<{ companies: number; countries: number }> {
  const snap = await getDocs(collection(db, "companies"));
  const by: Record<string, { country: string; items: PickerItem[] }> = {};
  snap.forEach((d) => {
    const c: any = d.data();
    if (!c.name) return;
    const country = companyCountryName(c) || "Other";
    const k = countryKey(country);
    (by[k] = by[k] || { country, items: [] }).items.push({ id: d.id, name: String(c.name).slice(0, 200), city: companyCity(c).slice(0, 80) });
  });
  // Remove country documents that no longer have companies.
  const old = await getDocs(collection(db, "companyPicker"));
  let batch = writeBatch(db), n = 0;
  const flush = async () => { if (n) { await batch.commit(); batch = writeBatch(db); n = 0; } };
  for (const d of old.docs) if (d.id !== "_index" && !by[d.id]) { batch.delete(d.ref); if (++n >= 400) await flush(); }
  const countries: PickerCountry[] = [];
  for (const [k, v] of Object.entries(by)) {
    v.items.sort((a, b) => a.name.localeCompare(b.name));
    batch.set(doc(db, "companyPicker", k), { country: v.country, items: v.items, updatedAt: new Date() });
    countries.push({ key: k, country: v.country, n: v.items.length });
    if (++n >= 20) await flush();   // each country doc can be large; keep batches small
  }
  countries.sort((a, b) => (b.country === "India" ? 1 : 0) - (a.country === "India" ? 1 : 0) || a.country.localeCompare(b.country));
  batch.set(doc(db, "companyPicker", "_index"), { countries, updatedAt: new Date() });
  n++; await flush();
  return { companies: snap.size, countries: countries.length };
}
