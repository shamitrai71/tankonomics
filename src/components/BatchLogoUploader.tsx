import { useState, useMemo, useCallback, memo } from "react";
import { uploadImage } from "../lib/uploadImage";
import { updateDocument } from "../hooks/useFirestore";

/**
 * Batch logo uploader for the Tankonomics admin panel.
 *
 * Mirrors the batch uploader already built for TankWorldIndia: pick several
 * files, match each to a company by filename, review every match (with a
 * manual dropdown for anything that didn't auto-match) before a single byte
 * uploads, then write each one individually.
 *
 * Deliberately narrow in scope compared to the bulk "Seed N companies"
 * action elsewhere in this file: this only ever touches the `logo` field on
 * companies it actually matched and uploaded a file for. It never re-writes
 * name, categories, or any other field, and never touches a company that
 * wasn't part of this specific batch — so it can't clobber unrelated data
 * the way an unconditional bulk reseed can.
 *
 * PERFORMANCE NOTE (read before touching the row rendering below):
 * The per-row "assign a company" dropdown lists every company — with
 * 1,500+ companies in this project, that dropdown is expensive to build
 * (sort + map to JSX). The original version built it inline inside
 * `rows.map()`, which meant EVERY pending row rebuilt that full dropdown on
 * EVERY re-render of this component — and `runUpload()` triggers two state
 * updates (setRows + setLog) per file, so a 246-file batch caused on the
 * order of ~500 re-renders, each redoing the expensive dropdown for every
 * still-pending row. That's what froze the tab; it mirrors a bug fixed the
 * same week in TWI's own (non-React) batch uploader, same root cause.
 *
 * Fixed two ways, both needed together:
 *   1. `sortedCompanies` is computed once via useMemo, not per row/render.
 *   2. Each row is its own `memo()`'d component (`LogoRow`), so updating
 *      one row's status (via setRows) does NOT re-render the other 245 —
 *      React bails out on any row whose props are unchanged. This requires
 *      `reassign`/`remove` to be stable function identities (useCallback),
 *      since a fresh inline arrow function every render would defeat memo()
 *      just as surely as the original inline dropdown did.
 */

// Mirrors the Python/JS slug() rule used everywhere else in this project:
// lowercase, & -> and, strip accents/punctuation, collapse to hyphens.
function filenameSlug(filename: string): string {
  let s = filename.replace(/\.[a-zA-Z0-9]+$/, "");
  s = s.replace(/&/g, "and").replace(/\+/g, "-");
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  s = s.toLowerCase();
  s = s.replace(/[().,/']/g, "");
  s = s.replace(/[^a-z0-9]+/g, "-");
  s = s.replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  return s;
}

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface Row {
  rowId: string; // stable key, independent of array position (see handleFiles)
  file: File;
  objectUrl: string;
  matchedId: string; // company.id (== slug), or "" if unmatched
  status: "pending" | "done" | "failed" | "skipped";
  error?: string;
}

function matchCompanyForFile(filename: string, companies: Company[]): string {
  const fSlug = filenameSlug(filename);
  let hit = companies.find((c) => c.id === fSlug);
  if (hit) return hit.id;
  hit = companies.find((c) => filenameSlug(c.name) === fSlug);
  return hit ? hit.id : "";
}

// ── Row, extracted and memoized ─────────────────────────────────────────
// Only re-renders when ITS OWN props change. sortedCompanies is a stable
// reference from useMemo in the parent, so passing it down doesn't itself
// trigger a re-render — only an actual change to `row` or `matchedId` does.
const LogoRow = memo(function LogoRow({
  row,
  matchedCompanyName,
  sortedCompanies,
  onReassign,
  onRemove,
}: {
  row: Row;
  matchedCompanyName: string | null;
  sortedCompanies: Company[];
  onReassign: (rowId: string, id: string) => void;
  onRemove: (rowId: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        row.status === "done"
          ? "border-green-300 bg-green-50"
          : row.status === "failed"
          ? "border-red-300 bg-red-50"
          : "border-border-main bg-bg-main"
      }`}
    >
      <img
        src={row.objectUrl}
        className="w-10 h-10 object-contain border border-border-main rounded bg-white flex-shrink-0"
        alt=""
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-heading truncate">{row.file.name}</div>
        <div className="text-xs text-text-body/55">
          {row.status === "done" && `Uploaded to ${matchedCompanyName || row.matchedId}`}
          {row.status === "failed" && `Failed — ${row.error}`}
          {row.status === "pending" && matchedCompanyName && `Matched: ${matchedCompanyName}`}
          {row.status === "pending" && !matchedCompanyName && "No automatic match"}
        </div>
      </div>
      {row.status === "pending" && (
        <>
          <select
            value={row.matchedId}
            onChange={(e) => onReassign(row.rowId, e.target.value)}
            className="text-xs border border-border-main rounded-lg px-2 py-1.5 bg-bg-card max-w-[220px]"
          >
            <option value="">— assign a company —</option>
            {sortedCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => onRemove(row.rowId)}
            className="text-xs px-2 py-1.5 rounded-lg border border-rust/30 text-rust hover:bg-rust/5"
          >
            Remove
          </button>
        </>
      )}
    </div>
  );
});

export default function BatchLogoUploader({ companies }: { companies: Company[] | null | undefined }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const list = companies || [];

  // Computed once per company-list change, not once per row per render —
  // this was the single most expensive line in the original component when
  // multiplied across ~500 re-renders during a large batch.
  const sortedCompanies = useMemo(
    () => [...list].sort((a, b) => a.name.localeCompare(b.name)),
    [list],
  );
  // Lookup by id, also memoized — avoids a linear .find() scan through
  // 1,500+ companies inside every row's render.
  const companyById = useMemo(() => {
    const m = new Map<string, Company>();
    list.forEach((c) => m.set(c.id, c));
    return m;
  }, [list]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    rows.forEach((r) => URL.revokeObjectURL(r.objectUrl));
    setRows(
      files.map((file, idx) => ({
        // Stable id independent of array position, so React's reconciliation
        // (and the memoized row lookup by rowId below) stays correct even
        // after rows are removed and the array shifts.
        rowId: `${file.name}-${file.size}-${idx}-${Date.now()}`,
        file,
        objectUrl: URL.createObjectURL(file),
        matchedId: matchCompanyForFile(file.name, list),
        status: "pending" as const,
      })),
    );
    setLog([]);
  }

  // useCallback so these keep a stable identity across renders — required
  // for LogoRow's memo() to actually skip re-rendering unaffected rows.
  // A fresh inline arrow function passed as a prop on every render would
  // silently defeat the memoization exactly as the original inline dropdown
  // defeated any chance of React skipping the expensive work.
  const reassign = useCallback((rowId: string, id: string) => {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, matchedId: id } : r)));
  }, []);

  const remove = useCallback((rowId: string) => {
    setRows((prev) => {
      const target = prev.find((r) => r.rowId === rowId);
      if (target) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((r) => r.rowId !== rowId);
    });
  }, []);

  function appendLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function runUpload() {
    const assignable = rows.filter((r) => r.status === "pending" && r.matchedId);
    if (assignable.length === 0) {
      alert("Nothing assigned to upload yet.");
      return;
    }
    if (
      !confirm(
        `Upload ${assignable.length} logo${assignable.length === 1 ? "" : "s"}? Each replaces that company's current logo, if any.`,
      )
    )
      return;

    setUploading(true);
    let ok = 0;
    let failed = 0;
    for (const row of assignable) {
      const company = companyById.get(row.matchedId);
      const label = company?.name || row.matchedId;
      try {
        const url = await uploadImage(row.file, { folder: "companies" });
        await updateDocument("companies", row.matchedId, { logo: url });
        setRows((prev) => prev.map((r) => (r.rowId === row.rowId ? { ...r, status: "done" } : r)));
        ok++;
        appendLog(`✓ ${row.file.name} → ${label}`);
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r) => (r.rowId === row.rowId ? { ...r, status: "failed", error: err?.message } : r)),
        );
        failed++;
        appendLog(`✗ ${row.file.name} → ${label} — ${err?.message || "unknown error"}`);
      }
    }
    appendLog(`\nDone — ${ok} uploaded, ${failed} failed.`);
    setUploading(false);
  }

  const matchedCount = rows.filter((r) => r.status === "pending" && r.matchedId).length;
  const unmatchedCount = rows.filter((r) => r.status === "pending" && !r.matchedId).length;

  return (
    <div className="space-y-4">
      <div className="bg-bg-card border border-border-main rounded-2xl p-5">
        <label className="block text-sm font-medium text-text-heading mb-2">
          Choose logo files
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="text-sm text-text-body/70"
        />
        <p className="text-xs text-text-body/50 mt-2">
          Name files after a company's slug or full name for the best match rate — e.g.{" "}
          <code>larsen-and-toubro-limited.png</code> or <code>Larsen and Toubro Limited.png</code>.
          Anything that doesn't auto-match gets a dropdown below to assign by hand.
        </p>
      </div>

      {rows.length > 0 && (
        <>
          <div className="text-xs font-mono text-text-body/60">
            {matchedCount} matched · {unmatchedCount} need assignment · {rows.length} total
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {rows.map((row) => (
              <LogoRow
                key={row.rowId}
                row={row}
                matchedCompanyName={row.matchedId ? companyById.get(row.matchedId)?.name || null : null}
                sortedCompanies={sortedCompanies}
                onReassign={reassign}
                onRemove={remove}
              />
            ))}
          </div>

          <button
            onClick={runUpload}
            disabled={uploading || matchedCount === 0}
            className="px-4 py-2.5 rounded-xl bg-text-heading text-bg-card text-sm font-medium disabled:opacity-40"
          >
            {uploading ? "Uploading…" : `Upload ${matchedCount} assigned logo${matchedCount === 1 ? "" : "s"}`}
          </button>

          {log.length > 0 && (
            <pre className="text-xs font-mono bg-bg-main border border-border-main rounded-xl p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {log.join("\n")}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
