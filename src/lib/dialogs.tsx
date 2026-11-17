/**
 * In-page replacements for the browser's alert(), confirm() and prompt().
 *
 *   toast("Saved.")                         a short message, bottom of the screen
 *   if (!(await confirmDialog("Delete?"))) return;
 *   const v = await promptDialog("Name this", "default");
 *
 * They work from anywhere (no hook needed); <DialogHost /> is mounted once in App.
 */
import { useEffect, useRef, useState } from "react";

type ToastKind = "info" | "success" | "error";
type Toast = { id: number; text: string; kind: ToastKind };
type Ask = {
  id: number; kind: "confirm" | "prompt"; text: string; value: string;
  ok: string; danger: boolean; resolve: (v: any) => void;
};

let toasts: Toast[] = [];
let asks: Ask[] = [];
const subs = new Set<() => void>();
let seq = 1;
const emit = () => subs.forEach((f) => f());

function guessKind(text: string): ToastKind {
  if (/fail|error|could not|couldn't|unable|denied|invalid|please (use|ensure|enter|select)/i.test(text)) return "error";
  if (/saved|created|published|sent|copied|done|updated|approved|added|uploaded/i.test(text)) return "success";
  return "info";
}

export function toast(message: unknown, kind?: ToastKind) {
  const text = String(message ?? "");
  const t: Toast = { id: seq++, text, kind: kind || guessKind(text) };
  toasts = [...toasts, t].slice(-4);
  emit();
  setTimeout(() => { toasts = toasts.filter((x) => x.id !== t.id); emit(); }, t.kind === "error" ? 8000 : 5000);
}

function okLabel(text: string): { ok: string; danger: boolean } {
  if (/\bdelete\b/i.test(text)) return { ok: "Delete", danger: true };
  if (/\bremove\b/i.test(text)) return { ok: "Remove", danger: true };
  if (/\breject\b/i.test(text)) return { ok: "Reject", danger: true };
  if (/\brevoke\b/i.test(text)) return { ok: "Revoke", danger: true };
  return { ok: "Confirm", danger: false };
}

export function confirmDialog(message: unknown, opts: { ok?: string; danger?: boolean } = {}): Promise<boolean> {
  const text = String(message ?? "");
  const g = okLabel(text);
  return new Promise((resolve) => {
    asks = [...asks, { id: seq++, kind: "confirm", text, value: "", ok: opts.ok || g.ok, danger: opts.danger ?? g.danger, resolve }];
    emit();
  });
}

export function promptDialog(message: unknown, defaultValue = ""): Promise<string | null> {
  return new Promise((resolve) => {
    asks = [...asks, { id: seq++, kind: "prompt", text: String(message ?? ""), value: defaultValue ?? "", ok: "OK", danger: false, resolve }];
    emit();
  });
}

function close(a: Ask, result: any) {
  asks = asks.filter((x) => x.id !== a.id);
  emit();
  a.resolve(result);
}

export function DialogHost() {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force((n) => n + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  const a = asks[0];
  const [val, setVal] = useState("");
  const okRef = useRef<HTMLButtonElement>(null);
  const inRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!a) return;
    setVal(a.value);
    setTimeout(() => (a.kind === "prompt" ? inRef.current?.focus() : okRef.current?.focus()), 0);
  }, [a?.id]);
  useEffect(() => {
    if (!a) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(a, a.kind === "prompt" ? null : false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [a?.id]);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2 w-[min(92vw,460px)] pointer-events-none" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto w-full rounded-lg border px-4 py-3 text-[14px] shadow-lg bg-bg-card flex items-start gap-3 ${
              t.kind === "error" ? "border-rust/40 text-text-heading" : t.kind === "success" ? "border-accent/40 text-text-heading" : "border-border-main text-text-heading"}`}>
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${t.kind === "error" ? "bg-rust" : t.kind === "success" ? "bg-accent" : "bg-primary"}`} aria-hidden="true" />
            <span className="flex-1 whitespace-pre-line">{t.text}</span>
            <button type="button" aria-label="Dismiss" className="text-text-body hover:text-text-heading" onClick={() => { toasts = toasts.filter((x) => x.id !== t.id); emit(); }}>×</button>
          </div>
        ))}
      </div>
      {a && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => close(a, a.kind === "prompt" ? null : false)} />
          <form role="dialog" aria-modal="true" aria-labelledby="dlg-text"
            onSubmit={(e) => { e.preventDefault(); close(a, a.kind === "prompt" ? val : true); }}
            className="relative bg-bg-card border border-border-main rounded-xl shadow-2xl w-full max-w-md p-5">
            <p id="dlg-text" className="text-[15px] text-text-heading whitespace-pre-line leading-relaxed">{a.text}</p>
            {a.kind === "prompt" && (
              <input ref={inRef} value={val} onChange={(e) => setVal(e.target.value)}
                className="mt-4 w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading outline-none focus:border-primary" />
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => close(a, a.kind === "prompt" ? null : false)}
                className="px-4 py-2 rounded-lg text-[14px] font-medium border border-border-main text-text-heading hover:bg-bg-main">Cancel</button>
              <button ref={okRef} type="submit"
                className={`px-4 py-2 rounded-lg text-[14px] font-medium text-white hover:brightness-110 ${a.danger ? "bg-rust" : "bg-primary"}`}>{a.ok}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
