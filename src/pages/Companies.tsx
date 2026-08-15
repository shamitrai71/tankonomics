/**
 * Companies — the industrial directory.
 *
 * Restyled to match the rest of the app:
 *   - Instrument Serif display headings
 *   - Mono `eyebrow tabular` labels
 *   - Paper-warm canvas, paper-weight borders
 *   - Safety-orange accent for active filters & verified badges
 *   - Deep-petrol "Market Leaders" CTA with blueprint grid texture
 *
 * Data wiring (categories, companies, filtering, search) is unchanged from
 * the previous version.
 */

import { useState, useEffect } from "react";
import { useCollection } from "../hooks/useFirestore";
import { usePageCopy } from "../lib/pageCopy";
import { orderBy } from "firebase/firestore";
import {
  Building2,
  Search,
  ChevronRight,
  Globe,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  X as CloseIcon,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Companies() {
  const copy = usePageCopy("companies");
  // Category deep-linking: /directory?category=rim-seals (comma-separate for
  // several). This is what lets the sibling apps — TankWorldIndia, ASTSPARES —
  // link straight to a filtered slice of the hub directory by master category
  // slug, rather than dropping the visitor on an unfiltered list.
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const param = searchParams.get("category");
    return param ? param.split(",").map((s) => s.trim()).filter(Boolean) : [];
  });
  const [sectorSearch, setSectorSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mirror the filter back into the URL so any filtered view is itself
  // shareable/bookmarkable (replace, not push, so filtering doesn't flood
  // browser history).
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selectedCategories.length > 0) next.set("category", selectedCategories.join(","));
    else next.delete("category");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [selectedCategories]);

  const { data: categories, loading: loadingCats } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")]);
  const { data: companies, loading: loadingCompanies } = useCollection<any>("companies", [orderBy("createdAt", "desc")]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Drill-down matching, now depth-aware (L1 → L2 → L3).
    //
    // Two rules, unchanged in spirit from the two-level version:
    //   1. Selecting a child NARROWS its parent rather than OR-unioning with
    //      it — picking "Radar Level Gauges" under "Tank Gauging" shows only
    //      radar companies, not every gauging company.
    //   2. Different branches still UNION — picking something under Tank
    //      Systems and something under Flow & Transfer shows both.
    //
    // New rule for three levels: a selection is INCLUSIVE of its descendants.
    // Selecting "Tank Gauging" matches a company tagged only with its L3
    // child "Radar Level Gauges". Without this, a company tagged at L3 would
    // vanish from its own parent's filter — the same class of confusing empty
    // result as the Independent Terminals bug.
    const cids: string[] = (company.categoryIds && company.categoryIds.length)
      ? company.categoryIds
      : [company.categoryId, company.subCategoryId, company.tier3CategoryId].filter(Boolean);

    let matchesCategory = selectedCategories.length === 0;
    if (!matchesCategory) {
      const catOf = (id: string) => categories.find((c: any) => c.id === id);
      // Does the company carry this category, or anything beneath it?
      const hasWithDescendants = (id: string): boolean => {
        if (cids.includes(id)) return true;
        return categories.some((c: any) => c.parentId === id && hasWithDescendants(c.id));
      };
      // Selected ids that have another selected id as an ancestor are handled
      // by that ancestor's branch — evaluate only the topmost selections, then
      // narrow downward through whatever is selected beneath each.
      const isDescendantOfSelected = (id: string): boolean => {
        let cur = catOf(id);
        while (cur?.parentId) {
          if (selectedCategories.includes(cur.parentId)) return true;
          cur = catOf(cur.parentId);
        }
        return false;
      };
      const topSelections = selectedCategories.filter((id) => !isDescendantOfSelected(id));

      matchesCategory = topSelections.some((topId) => {
        // Narrow to the DEEPEST selected descendants within this branch, not
        // just immediate children — a user can select L1 and L3 while skipping
        // L2, and that must still narrow to the L3. Walking only one level at
        // a time would stop at the gap and wrongly match the whole L1 branch.
        const isUnder = (id: string, ancestorId: string): boolean => {
          let cur = catOf(id);
          while (cur?.parentId) {
            if (cur.parentId === ancestorId) return true;
            cur = catOf(cur.parentId);
          }
          return false;
        };
        const selectedBelow = selectedCategories.filter((sel) => isUnder(sel, topId));
        if (selectedBelow.length === 0) return hasWithDescendants(topId);
        // Keep only the deepest selections — if both an L2 and its L3 child are
        // selected, the L3 is the operative filter.
        const deepest = selectedBelow.filter(
          (sel) => !selectedBelow.some((other) => other !== sel && isUnder(other, sel)),
        );
        return deepest.some((id) => hasWithDescendants(id));
      });
    }
    return matchesSearch && matchesCategory;
  });

  // A sector stays visible if it, a subcategory, or a sub-subcategory matches
  // the search — searching "radar" should surface Tank Systems, not hide it
  // because only an L3 node matched.
  const matchesSectorSearch = (id: string): boolean => {
    const c = categories.find((x: any) => x.id === id);
    if (!c) return false;
    if (c.name.toLowerCase().includes(sectorSearch.toLowerCase())) return true;
    return categories.some((k: any) => k.parentId === id && matchesSectorSearch(k.id));
  };

  const mainCategories = categories.filter(
    (c: any) => c.level === 1 && (!sectorSearch || matchesSectorSearch(c.id)),
  );

  const marketLeaders = companies.filter((c) => c.isFeatured || c.isClaimed).slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-8">
        {/* Page heading */}
        <header className="mb-10 md:mb-14 relative">
          <div className="absolute inset-x-0 top-0 h-32 bp-grid-paper opacity-50 pointer-events-none" />
          <div className="relative">
            <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
              {copy.eyebrow}
            </div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
              {copy.title}
            </h1>
            <p className="text-text-body text-[15px] mt-3 max-w-xl">
              {copy.subtitle}
            </p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-5 py-4 bg-bg-card border border-border-main rounded-2xl text-text-heading transition-all"
            >
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-accent" strokeWidth={1.75} />
                <span className="eyebrow tabular">
                  {selectedCategories.length > 0 ? `${selectedCategories.length} SECTORS SELECTED` : "ALL INDUSTRIES"}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""}`} strokeWidth={1.75} />
            </button>
          </div>

          {/* Sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-72 space-y-6 shrink-0`}>
            {/* Sectors filter card */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="eyebrow tabular text-text-body/55 inline-flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Sectors
                </p>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-[11px] text-accent hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-body/40" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Filter sectors…"
                  value={sectorSearch}
                  onChange={(e) => setSectorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-bg-main border border-border-main rounded-xl text-[13px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                />
              </div>

              <div className="space-y-0.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                <button
                  onClick={() => setSelectedCategories([])}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-between ${
                    selectedCategories.length === 0
                      ? "bg-text-heading text-bg-card"
                      : "text-text-body hover:bg-bg-main"
                  }`}
                >
                  <span>All industries</span>
                  {selectedCategories.length === 0 && (
                    <span className="eyebrow tabular text-bg-card/60">{companies.length}</span>
                  )}
                </button>
                {mainCategories.map((cat: any) => {
                  // Open a sector when it, any child, or any GRANDCHILD is
                  // selected or search-matched — otherwise drilling to an L3
                  // would leave its sector collapsed and the selection hidden.
                  const descendantsOf = (id: string): any[] => {
                    const kids = categories.filter((c: any) => c.parentId === id);
                    return kids.concat(...kids.map((k: any) => descendantsOf(k.id)));
                  };
                  const branch = descendantsOf(cat.id);
                  const isOpen = selectedCategories.includes(cat.id) || branch.some((d: any) =>
                    selectedCategories.includes(d.id) ||
                    (sectorSearch && d.name.toLowerCase().includes(sectorSearch.toLowerCase()))
                  );
                  const isActive = selectedCategories.includes(cat.id);
                  return (
                    <div key={cat.id}>
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-between group ${
                          isActive ? "bg-accent/10 text-accent" : "text-text-body hover:bg-bg-main"
                        }`}
                      >
                        <span className="truncate pr-2">{cat.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-90" : "group-hover:translate-x-0.5"}`} strokeWidth={1.75} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="pl-3 ml-3 mt-0.5 mb-1 space-y-0.5 border-l border-border-main">
                          {categories
                            .filter((sub: any) => sub.parentId === cat.id)
                            .filter((sub: any) => !sectorSearch || sub.name.toLowerCase().includes(sectorSearch.toLowerCase()) || cat.name.toLowerCase().includes(sectorSearch.toLowerCase()))
                            .map((sub: any) => {
                              const subChildren = categories.filter((c: any) => c.parentId === sub.id);
                              // Expand L3 only when the L2 itself is selected, one of
                              // its children is, or a search is actively matching —
                              // otherwise a sector with several L3-bearing children
                              // would dump dozens of rows into the sidebar at once.
                              const subOpen = subChildren.length > 0 && (
                                selectedCategories.includes(sub.id) ||
                                subChildren.some((c: any) => selectedCategories.includes(c.id)) ||
                                (!!sectorSearch && subChildren.some((c: any) => c.name.toLowerCase().includes(sectorSearch.toLowerCase())))
                              );
                              return (
                                <div key={sub.id}>
                                  <button
                                    onClick={() => toggleCategory(sub.id)}
                                    className={`w-full text-left px-3 py-1.5 rounded-md text-[12px] transition-all flex items-center justify-between ${
                                      selectedCategories.includes(sub.id) ? "text-accent" : "text-text-body/70 hover:text-text-heading"
                                    }`}
                                  >
                                    <span>{sub.name}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {selectedCategories.includes(sub.id) && <span className="w-1 h-1 rounded-full bg-accent" />}
                                      {subChildren.length > 0 && (
                                        <ChevronRight className={`w-3 h-3 transition-transform ${subOpen ? "rotate-90" : ""}`} strokeWidth={1.75} />
                                      )}
                                    </div>
                                  </button>
                                  {subOpen && (
                                    <div className="pl-3 ml-3 mt-0.5 mb-1 space-y-0.5 border-l border-border-main/60">
                                      {subChildren
                                        .filter((c: any) => !sectorSearch || c.name.toLowerCase().includes(sectorSearch.toLowerCase()) || sub.name.toLowerCase().includes(sectorSearch.toLowerCase()) || cat.name.toLowerCase().includes(sectorSearch.toLowerCase()))
                                        .map((c: any) => (
                                          <button
                                            key={c.id}
                                            onClick={() => toggleCategory(c.id)}
                                            className={`w-full text-left px-3 py-1 rounded-md text-[11.5px] transition-all flex items-center justify-between ${
                                              selectedCategories.includes(c.id) ? "text-accent" : "text-text-body/55 hover:text-text-heading"
                                            }`}
                                          >
                                            <span>{c.name}</span>
                                            {selectedCategories.includes(c.id) && <span className="w-1 h-1 rounded-full bg-accent" />}
                                          </button>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Market Leaders card */}
            <div className="bg-primary text-white rounded-2xl p-6 grain relative overflow-hidden">
              <div className="absolute inset-0 bp-grid pointer-events-none opacity-40" />
              <div className="absolute -top-4 -right-4 opacity-15">
                <TrendingUp className="w-28 h-28" strokeWidth={1.5} />
              </div>
              <div className="relative">
                <p className="eyebrow tabular text-accent mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Featured
                </p>
                <h3 className="font-display text-xl leading-tight mb-2">Market Leaders</h3>
                <p className="text-white/65 text-[13px] leading-relaxed mb-5">
                  Top-rated operators in this index.
                </p>
                <div className="flex -space-x-2">
                  {marketLeaders.length > 0
                    ? marketLeaders.map((company) => (
                        <Link
                          key={company.id}
                          to={`/business/${company.id}`}
                          className="w-9 h-9 rounded-lg border-2 border-primary bg-bg-card flex items-center justify-center text-[11px] font-medium overflow-hidden hover:z-10 hover:scale-110 transition-all"
                          title={company.name}
                        >
                          {company.logo ? (
                            <img src={company.logo} className="w-full h-full object-cover" alt={company.name} />
                          ) : (
                            <span className="text-text-heading">{company.name.charAt(0)}</span>
                          )}
                        </Link>
                      ))
                    : [1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-9 h-9 rounded-lg border-2 border-primary bg-white/10 flex items-center justify-center text-[11px] text-white/70">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="eyebrow tabular text-text-body/55">
                  {filteredCompanies.length} {filteredCompanies.length === 1 ? "RESULT" : "RESULTS"}
                  {selectedCategories.length > 0 && ` · ${selectedCategories.length} FILTER${selectedCategories.length > 1 ? "S" : ""} ACTIVE`}
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Search companies…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-bg-card border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-bg-main flex items-center justify-center text-text-body/50"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {loadingCompanies || loadingCats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-56 bg-bg-card border border-border-main rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredCompanies.map((company) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      key={company.id}
                      className="bg-bg-card border border-border-main rounded-2xl p-5 hover:border-text-heading transition-all group flex flex-col"
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-14 h-14 bg-bg-main rounded-xl border border-border-main p-2 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={company.logo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"}
                            className="w-full h-full object-contain"
                            alt={company.name}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {company.categoryIds?.slice(0, 2).map((cid: string) => (
                              <span key={cid} className="eyebrow tabular text-text-body/55 bg-bg-main px-1.5 py-0.5 rounded">
                                {categories.find((c: any) => c.id === cid)?.name}
                              </span>
                            ))}
                            {company.categoryIds?.length > 2 && (
                              <span className="eyebrow tabular text-text-body/40 bg-bg-main px-1.5 py-0.5 rounded">
                                +{company.categoryIds.length - 2}
                              </span>
                            )}
                            {!company.categoryIds && company.categoryId && (
                              <span className="eyebrow tabular text-text-body/55 bg-bg-main px-1.5 py-0.5 rounded">
                                {categories.find((c: any) => c.id === company.categoryId)?.name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-xl text-text-heading leading-tight group-hover:text-accent transition-colors flex items-center gap-2">
                            <span className="truncate">{company.name}</span>
                            {company.isClaimed && (
                              <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent/10 border border-accent/30 text-accent rounded-md eyebrow tabular">
                                <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2} />
                                Verified
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>

                      <p className="text-text-body text-[13px] leading-relaxed line-clamp-2 mb-6 flex-1">
                        {company.description || "Operators, EPCs, OEMs and inspectors across the tank & terminal sector."}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border-main">
                        <div className="flex items-center gap-3 text-text-body/50">
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-text-heading transition-colors"
                              title="Website"
                            >
                              <Globe className="w-4 h-4" strokeWidth={1.75} />
                            </a>
                          )}
                          {(() => {
                            const primaryCatId = company.categoryIds?.[0] || company.categoryId;
                            const primaryCat = primaryCatId ? categories.find((c: any) => c.id === primaryCatId)?.name : null;
                            return primaryCat ? (
                              <span className="eyebrow tabular flex items-center gap-1">
                                <Building2 className="w-3 h-3" strokeWidth={1.75} /> {primaryCat}
                              </span>
                            ) : null;
                          })()}
                        </div>

                        <Link
                          to={`/business/${company.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-text-heading text-bg-card rounded-lg text-[12px] font-medium hover:brightness-110 group-hover:translate-x-0.5 transition-all"
                        >
                          View
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredCompanies.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-bg-card border border-dashed border-border-main rounded-2xl">
                    <Building2 className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="eyebrow tabular text-text-body/55 mb-1">NO RESULTS</p>
                    <h3 className="font-display text-2xl text-text-heading mb-2">No companies match.</h3>
                    <p className="text-text-body text-[14px]">Try adjusting your search or sector filters.</p>
                    {(searchTerm || selectedCategories.length > 0) && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategories([]);
                        }}
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-text-heading text-bg-card rounded-xl text-[13px] font-medium"
                      >
                        Reset filters
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
