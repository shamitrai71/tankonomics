import { useState, useMemo, useRef, useEffect } from "react";

export interface TaxOption {
  id: string;
  name: string;
  parentName?: string; // group label, shown as dim suffix
  aliases?: string[];
}

/**
 * Searchable chip multi-select for taxonomy nodes.
 * Type to filter (matches name, group, or alias), click to add a chip,
 * click a chip's × to remove. Selected ids flow out via onChange.
 * Sized for 70–100 options; shows grouped results and caps the dropdown.
 */
export function TaxonomyMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = "Type to search…",
  hint,
}: {
  label: string;
  options: TaxOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const byId = useMemo(() => Object.fromEntries(options.map((o) => [o.id, o])), [options]);
  const selected = selectedIds.map((id) => byId[id]).filter(Boolean) as TaxOption[];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = options.filter((o) => !selectedIds.includes(o.id));
    if (!q) return pool.slice(0, 50);
    return pool
      .filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.parentName || "").toLowerCase().includes(q) ||
          (o.aliases || []).some((a) => a.toLowerCase().includes(q))
      )
      .slice(0, 50);
  }, [query, options, selectedIds]);

  const add = (id: string) => {
    onChange([...selectedIds, id]);
    setQuery("");
  };
  const remove = (id: string) => onChange(selectedIds.filter((x) => x !== id));

  return (
    <div ref={boxRef}>
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow tabular text-text-body/60">{label}</span>
        {selected.length > 0 && (
          <span className="eyebrow tabular text-accent">{selected.length} selected</span>
        )}
      </div>
      {hint && <p className="text-[11px] text-text-body/50 mb-2 leading-relaxed">{hint}</p>}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-accent/10 text-accent rounded-lg text-[12px] font-medium"
            >
              {o.name}
              <button
                onClick={() => remove(o.id)}
                className="w-4 h-4 rounded flex items-center justify-center hover:bg-accent hover:text-white transition-all"
                aria-label={`Remove ${o.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
        />
        {open && matches.length > 0 && (
          <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-bg-card border border-border-main rounded-xl shadow-lg custom-scrollbar">
            {matches.map((o) => (
              <button
                key={o.id}
                onClick={() => add(o.id)}
                className="w-full text-left px-3 py-2 hover:bg-bg-main flex items-center justify-between gap-2 transition-colors"
              >
                <span className="text-[13px] text-text-heading">{o.name}</span>
                {o.parentName && (
                  <span className="eyebrow tabular text-text-body/40 text-[9px] shrink-0">{o.parentName}</span>
                )}
              </button>
            ))}
          </div>
        )}
        {open && query.trim() && matches.length === 0 && (
          <div className="absolute z-20 mt-1 w-full bg-bg-card border border-border-main rounded-xl shadow-lg px-3 py-2.5">
            <span className="text-[12px] text-text-body/55">No match for "{query}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
