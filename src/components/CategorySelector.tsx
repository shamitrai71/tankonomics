import { X } from "lucide-react";

interface CategorySelectorProps {
  categories: any[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const CategorySelector = ({ 
  categories, 
  selectedIds, 
  onChange 
}: CategorySelectorProps) => {
  const toggleId = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const level1 = categories.filter(c => c.level === 1);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedIds.map(id => {
          const cat = categories.find(c => c.id === id);
          if (!cat) return null;
          return (
            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold border border-primary/20">
              {cat.name}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleId(id);
                }} 
                className="hover:text-primary/70 transition-colors"
                type="button"
              >
                <X size={10} />
              </button>
            </span>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar shadow-inner">
        {level1.map(parent => (
          <div key={parent.id} className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedIds.includes(parent.id)} 
                onChange={() => toggleId(parent.id)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all"
              />
              <span className="text-xs font-black uppercase text-slate-900 group-hover:text-primary transition-colors tracking-tight">{parent.name}</span>
            </label>
            <div className="pl-6 space-y-1">
              {categories.filter(c => c.parentId === parent.id).map(sub => (
                <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(sub.id)} 
                    onChange={() => toggleId(sub.id)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all"
                  />
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{sub.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {level1.length === 0 && (
          <p className="text-[10px] text-slate-400 font-medium italic py-4 text-center col-span-full">No categories available.</p>
        )}
      </div>
    </div>
  );
};
