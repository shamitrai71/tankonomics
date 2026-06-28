/**
 * CategorySelector — nested checkbox tree for picking sectors.
 *
 * Restyled. Same props, same toggle logic.
 */

import { X } from "lucide-react";

interface CategorySelectorProps {
  categories: any[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const CategorySelector = ({ categories, selectedIds, onChange }: CategorySelectorProps) => {
  const toggleId = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const level1 = categories.filter((c) => c.level === 1);

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const cat = categories.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full eyebrow tabular"
              >
                {cat.name}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleId(id);
                  }}
                  className="w-4 h-4 rounded-full hover:bg-accent/20 flex items-center justify-center transition-colors"
                  type="button"
                  aria-label={`Remove ${cat.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Picker tree */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 max-h-60 overflow-y-auto p-4 bg-bg-main rounded-xl border border-border-main custom-scrollbar">
        {level1.map((parent) => (
          <div key={parent.id} className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedIds.includes(parent.id)}
                onChange={() => toggleId(parent.id)}
                className="w-4 h-4 accent-accent border-border-main"
              />
              <span className="text-[13px] font-medium text-text-heading group-hover:text-accent transition-colors">
                {parent.name}
              </span>
            </label>
            <div className="pl-6 space-y-0.5">
              {categories.filter((c) => c.parentId === parent.id).map((sub) => (
                <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(sub.id)}
                    onChange={() => toggleId(sub.id)}
                    className="w-3.5 h-3.5 accent-accent"
                  />
                  <span className="text-[12px] text-text-body/70 group-hover:text-text-heading transition-colors">
                    {sub.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {level1.length === 0 && (
          <p className="eyebrow tabular text-text-body/40 italic py-4 text-center col-span-full">
            NO CATEGORIES AVAILABLE
          </p>
        )}
      </div>
    </div>
  );
};
