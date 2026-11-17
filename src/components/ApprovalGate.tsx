import { useEffect, useMemo, useState } from "react";
import { Clock, ShieldAlert, LogOut, Search, Building2 } from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { loadPickerCountries, loadPickerCountry, type PickerCountry, type PickerItem } from "../lib/companyPicker";

/**
 * Full-page access gate shown in place of the app while a signed-in account
 * is "pending" or "rejected" (see REQUIRE_APPROVAL_TO_VIEW in App.tsx).
 *
 * A pending member must first say which company they work for: pick it from
 * the sign-up company list (country, then search), or type its name when it
 * is not listed. Only then is the request shown as waiting for approval.
 * The admin sees the choice in Admin → Members.
 */
export function ApprovalGate({
  status,
  email,
  onSignOut,
  uid,
  profile,
}: {
  status: "pending" | "rejected";
  email?: string | null;
  onSignOut: () => void;
  uid?: string;
  profile?: any;
}) {
  const isPending = status === "pending";
  const hasCompany = !!(profile?.company || profile?.companyId);
  const [editing, setEditing] = useState(!hasCompany);
  useEffect(() => { if (!hasCompany) setEditing(true); }, [hasCompany]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 py-10">
      <div className="max-w-lg w-full bg-bg-card border border-border-main rounded-xl p-8 shadow-sm">
        <div className="w-11 h-11 rounded-lg bg-bg-main border border-border-main flex items-center justify-center mb-4 text-accent">
          {isPending ? <Clock className="w-5 h-5" strokeWidth={1.75} /> : <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />}
        </div>

        {!isPending ? (
          <>
            <h1 className="text-xl font-semibold text-text-heading mb-2">Access not approved</h1>
            <p className="text-[14px] text-text-body leading-relaxed mb-5">This account's request was not approved. If you think that is a mistake, contact the Tankonomics team.</p>
          </>
        ) : editing ? (
          <>
            <h1 className="text-xl font-semibold text-text-heading mb-1">Which company do you work for?</h1>
            <p className="text-[14px] text-text-body leading-relaxed mb-5">Every account is approved by an administrator. Tell us your company so we can check your request.</p>
            <CompanyChooser uid={uid} profile={profile} onDone={() => setEditing(false)} canCancel={hasCompany} onCancel={() => setEditing(false)} />
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-text-heading mb-2">Waiting for approval</h1>
            <p className="text-[14px] text-text-body leading-relaxed mb-4">An administrator will review your request. Once it is approved, opening Tankonomics takes you straight in.</p>
            <div className="bg-bg-main border border-border-main rounded-lg px-4 py-3 mb-4 text-[14px]">
              <p className="text-text-body text-[12px]">Your company</p>
              <p className="text-text-heading font-medium">{profile?.company || "—"}{!profile?.companyId && profile?.company ? " (not yet listed)" : ""}</p>
              {profile?.jobTitle && <p className="text-text-body text-[13px] mt-0.5">{profile.jobTitle}</p>}
            </div>
            <button onClick={() => setEditing(true)} className="text-[13px] font-medium text-primary hover:underline mb-5">Change company</button>
          </>
        )}

        <div className="flex items-center justify-between gap-3 pt-4 mt-6 border-t border-border-main">
          {email && <span className="text-[12px] text-text-body truncate">{email}</span>}
          <button onClick={onSignOut} className="inline-flex items-center gap-2 text-[13px] font-medium text-text-body hover:text-text-heading">
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyChooser({ uid, profile, onDone, canCancel, onCancel }: { uid?: string; profile?: any; onDone: () => void; canCancel: boolean; onCancel: () => void }) {
  const [countries, setCountries] = useState<PickerCountry[] | null>(null);
  const [country, setCountry] = useState("");
  const [items, setItems] = useState<PickerItem[] | null>(null);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<PickerItem | null>(null);
  const [notListed, setNotListed] = useState(false);
  const [freeName, setFreeName] = useState(profile?.companyId ? "" : (profile?.company || ""));
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPickerCountries().then((c) => {
      setCountries(c);
      if (c.length) setCountry((c.find((x) => x.country === "India") || c[0]).key); else setNotListed(true);
    }).catch(() => { setCountries([]); setNotListed(true); });
  }, []);
  useEffect(() => {
    if (!country) return;
    setItems(null); setPicked(null);
    loadPickerCountry(country).then(setItems).catch(() => setItems([]));
  }, [country]);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!items) return [];
    return (t ? items.filter((i) => i.name.toLowerCase().includes(t)) : items).slice(0, 40);
  }, [items, q]);

  const submit = async () => {
    if (!uid) return;
    const name = notListed ? freeName.trim() : picked?.name || "";
    if (!name) { setError(notListed ? "Type your company's name." : "Pick your company from the list."); return; }
    setSaving(true); setError("");
    try {
      await updateDoc(doc(db, "users", uid), {
        company: name.slice(0, 250),
        companyId: notListed ? "" : picked!.id,
        jobTitle: jobTitle.trim().slice(0, 250),
        updatedAt: serverTimestamp(),
      });
      onDone();
    } catch (e: any) {
      setError("Could not save. Please try again.");
      console.error(e);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {!notListed && (
        <>
          <label className="block">
            <span className="block text-[13px] font-medium text-text-heading mb-1">Country</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={!countries}
              className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading">
              {(countries || []).map((c) => <option key={c.key} value={c.key}>{c.country}</option>)}
            </select>
          </label>
          <div>
            <span className="block text-[13px] font-medium text-text-heading mb-1">Company</span>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to find your company"
                className="w-full pl-9 pr-3 py-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading" />
            </div>
            <div className="max-h-56 overflow-y-auto border border-border-main rounded-lg divide-y divide-border-main" role="listbox" aria-label="Companies">
              {items === null ? <p className="p-3 text-[13px] text-text-body">Loading…</p>
                : matches.length === 0 ? <p className="p-3 text-[13px] text-text-body">No company by that name in this country.</p>
                : matches.map((i) => (
                  <button key={i.id} type="button" role="option" aria-selected={picked?.id === i.id} onClick={() => setPicked(i)}
                    className={`w-full text-left px-3 py-2 text-[14px] flex items-center gap-2 ${picked?.id === i.id ? "bg-primary/10 text-primary" : "text-text-heading hover:bg-bg-main"}`}>
                    <Building2 className="w-4 h-4 shrink-0 opacity-60" />
                    <span className="min-w-0 flex-1 truncate">{i.name}</span>
                    {i.city && <span className="text-[12px] text-text-body shrink-0">{i.city}</span>}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}

      {notListed && (
        <label className="block">
          <span className="block text-[13px] font-medium text-text-heading mb-1">Company name</span>
          <input value={freeName} onChange={(e) => setFreeName(e.target.value)} placeholder="Your company's full name"
            className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading" />
          <span className="block text-[12px] text-text-body mt-1">An administrator will check it and add it to Tankonomics if it belongs here.</span>
        </label>
      )}
      {countries && countries.length > 0 && (
        <button type="button" onClick={() => { setNotListed(!notListed); setError(""); }} className="text-[13px] font-medium text-primary hover:underline">
          {notListed ? "Pick from the list instead" : "My company is not listed"}
        </button>
      )}

      <label className="block">
        <span className="block text-[13px] font-medium text-text-heading mb-1">Job title <span className="font-normal text-text-body">(optional)</span></span>
        <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Terminal Manager"
          className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading" />
      </label>

      {error && <p role="alert" className="text-[13px] text-rust">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={saving}
          className="px-4 py-2.5 rounded-lg bg-primary text-white text-[14px] font-medium disabled:opacity-50">
          {saving ? "Saving…" : "Send for approval"}
        </button>
        {canCancel && <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-border-main text-[14px] font-medium text-text-heading">Cancel</button>}
      </div>
    </div>
  );
}
