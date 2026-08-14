import { useState } from "react";
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

export default function BatchLogoUploader({ companies }: { companies: Company[] | null | undefined }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const list = companies || [];

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    rows.forEach((r) => URL.revokeObjectURL(r.objectUrl));
    setRows(
      files.map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
        matchedId: matchCompanyForFile(file.name, list),
        status: "pending" as const,
      })),
    );
    setLog([]);
  }

  function reassign(i: number, id: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, matchedId: id } : r)));
  }

  function remove(i: number) {
    setRows((prev) => {
      URL.revokeObjectURL(prev[i].objectUrl);
      return prev.filter((_, idx) => idx !== i);
    });
  }

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
      const company = list.find((c) => c.id === row.matchedId);
      const label = company?.name || row.matchedId;
      try {
        const url = await uploadImage(row.file, { folder: "companies" });
        await updateDocument("companies", row.matchedId, { logo: url });
        setRows((prev) => prev.map((r) => (r === row ? { ...r, status: "done" } : r)));
        ok++;
        appendLog(`✓ ${row.file.name} → ${label}`);
      } catch (err: any) {
        setRows((prev) => prev.map((r) => (r === row ? { ...r, status: "failed", error: err?.message } : r)));
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
            {rows.map((row, i) => {
              const company = row.matchedId ? list.find((c) => c.id === row.matchedId) : null;
              return (
                <div
                  key={i}
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
                      {row.status === "done" && `Uploaded to ${company?.name || row.matchedId}`}
                      {row.status === "failed" && `Failed — ${row.error}`}
                      {row.status === "pending" && company && `Matched: ${company.name}`}
                      {row.status === "pending" && !company && "No automatic match"}
                    </div>
                  </div>
                  {row.status === "pending" && (
                    <>
                      <select
                        value={row.matchedId}
                        onChange={(e) => reassign(i, e.target.value)}
                        className="text-xs border border-border-main rounded-lg px-2 py-1.5 bg-bg-card max-w-[220px]"
                      >
                        <option value="">— assign a company —</option>
                        {[...list]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => remove(i)}
                        className="text-xs px-2 py-1.5 rounded-lg border border-rust/30 text-rust hover:bg-rust/5"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              );
            })}
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
