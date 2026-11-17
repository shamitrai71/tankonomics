/**
 * Admin → Companies: company data tools for the Big Merge.
 *
 * 1. Download a backup of every company and its locations (JSON).
 * 2. Empty the company data (decided 26 Oct 2026: Tankonomics company data is
 *    emptied and re-seeded with validated companies only). Deletes every
 *    companies/{id} document, its locations subcollection, all company
 *    claims and product recommendations, and the sign-up company list.
 *    Categories are kept. Needs a backup taken in this session and the
 *    typed phrase.
 * 3. Rebuild the sign-up company list after a seed or company change.
 */
import { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase";
import { rebuildCompanyPicker } from "../lib/companyPicker";
import { confirmDialog, toast } from "../lib/dialogs";

const PHRASE = "EMPTY ALL COMPANIES";

export function CompanyDataTools() {
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [backupTaken, setBackupTaken] = useState(false);
  const [phrase, setPhrase] = useState("");
  const say = (t: string) => setLog((l) => [...l, t]);

  const backup = async () => {
    setBusy("backup"); setLog([]);
    try {
      const snap = await getDocs(collection(db, "companies"));
      const out: any[] = [];
      let i = 0;
      for (const d of snap.docs) {
        const locs = await getDocs(collection(db, "companies", d.id, "locations"));
        out.push({ id: d.id, ...d.data(), locations: locs.docs.map((l) => ({ id: l.id, ...l.data() })) });
        if (++i % 100 === 0) say(`Read ${i} of ${snap.size}…`);
      }
      const claims = await getDocs(collection(db, "company_claims"));
      const blob = new Blob([JSON.stringify({
        exportedAt: new Date().toISOString(), companies: out,
        company_claims: claims.docs.map((c) => ({ id: c.id, ...c.data() })),
      }, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tankonomics_companies_backup_${new Date().toISOString().slice(0, 10)}_${out.length}.json`;
      a.click();
      setBackupTaken(true);
      say(`Backup downloaded: ${out.length} companies, ${claims.size} claims.`);
    } catch (e: any) {
      say("Backup failed: " + e.message); toast("Backup failed: " + e.message, "error");
    } finally { setBusy(null); }
  };

  const emptyAll = async () => {
    if (!backupTaken || phrase !== PHRASE) return;
    if (!(await confirmDialog(`Delete every company, its locations, all company claims and product recommendations?\n\nThis cannot be undone. Categories are kept.`, { ok: "Delete everything", danger: true }))) return;
    setBusy("empty"); setLog([]);
    try {
      let batch = writeBatch(db), n = 0, total = 0;
      const flush = async () => { if (n) { await batch.commit(); total += n; batch = writeBatch(db); n = 0; } };
      const del = async (ref: any) => { batch.delete(ref); if (++n >= 400) await flush(); };
      const companies = await getDocs(collection(db, "companies"));
      say(`Deleting ${companies.size} companies and their locations…`);
      let i = 0;
      for (const d of companies.docs) {
        const locs = await getDocs(collection(db, "companies", d.id, "locations"));
        for (const l of locs.docs) await del(l.ref);
        await del(d.ref);
        if (++i % 200 === 0) say(`${i} of ${companies.size} companies…`);
      }
      for (const col of ["company_claims", "product_recommendations", "companyPicker"]) {
        const s = await getDocs(collection(db, col));
        for (const d of s.docs) await del(d.ref);
        say(`${col}: ${s.size} deleted.`);
      }
      await flush();
      say(`Done. ${total} documents deleted.`);
      toast("Company data emptied.", "success");
      setPhrase("");
    } catch (e: any) {
      say("Stopped with an error: " + e.message + " — run it again to finish; it carries on from what is left.");
      toast("Emptying stopped with an error.", "error");
    } finally { setBusy(null); }
  };

  const rebuild = async () => {
    setBusy("picker"); setLog([]);
    try {
      const r = await rebuildCompanyPicker();
      say(`Sign-up company list rebuilt: ${r.companies} companies in ${r.countries} countries.`);
      toast("Sign-up company list rebuilt.", "success");
    } catch (e: any) { say("Rebuild failed: " + e.message); toast("Rebuild failed.", "error"); }
    finally { setBusy(null); }
  };

  return (
    <div className="bg-bg-card p-6 rounded-xl border border-border-main space-y-5">
      <div>
        <h2 className="text-[18px] font-semibold text-text-heading">Company data (Big Merge)</h2>
        <p className="text-[13px] text-text-body mt-1">Back up, empty and re-list company data. The directory is visible to admins only; members reach company pages through search.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border border-border-main rounded-lg p-4">
          <p className="text-[14px] font-semibold text-text-heading">1. Back up</p>
          <p className="text-[12px] text-text-body mt-1 mb-3">Downloads every company with its locations and all claims as one JSON file. Reads every document once.</p>
          <button onClick={backup} disabled={!!busy} className="px-3 py-2 rounded-lg bg-primary text-white text-[13px] font-medium disabled:opacity-50">
            {busy === "backup" ? "Reading…" : "Download backup"}
          </button>
          {backupTaken && <p className="text-[12px] text-accent mt-2">Backup taken in this session.</p>}
        </div>

        <div className="border border-rust/40 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-text-heading">2. Empty company data</p>
          <p className="text-[12px] text-text-body mt-1 mb-3">Deletes all companies, their locations, company claims, product recommendations and the sign-up list. Categories stay. Take the backup first.</p>
          <label className="block text-[12px] text-text-body mb-1">Type <b>{PHRASE}</b> to enable</label>
          <input value={phrase} onChange={(e) => setPhrase(e.target.value)} disabled={!backupTaken || !!busy}
            className="w-full px-3 py-2 bg-bg-main border border-border-main rounded-lg text-[13px] mb-3 disabled:opacity-50" />
          <button onClick={emptyAll} disabled={!backupTaken || phrase !== PHRASE || !!busy}
            className="px-3 py-2 rounded-lg bg-rust text-white text-[13px] font-medium disabled:opacity-40">
            {busy === "empty" ? "Deleting…" : "Empty company data"}
          </button>
        </div>

        <div className="border border-border-main rounded-lg p-4">
          <p className="text-[14px] font-semibold text-text-heading">3. Sign-up company list</p>
          <p className="text-[12px] text-text-body mt-1 mb-3">New members pick their company from this list before their sign-up goes to you for approval. Rebuild it after every seed or company change.</p>
          <button onClick={rebuild} disabled={!!busy} className="px-3 py-2 rounded-lg border border-border-main text-text-heading text-[13px] font-medium disabled:opacity-50">
            {busy === "picker" ? "Rebuilding…" : "Rebuild list"}
          </button>
        </div>
      </div>

      {log.length > 0 && (
        <pre className="text-[12px] bg-bg-main border border-border-main rounded-lg p-3 whitespace-pre-wrap max-h-48 overflow-auto">{log.join("\n")}</pre>
      )}
    </div>
  );
}
