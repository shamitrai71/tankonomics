/**
 * Companies — the directory.
 *
 * Search comes first. Sectors are a collapsible, searchable list in the left
 * panel. Each card shows the logo (initials when there is none), name, main
 * sector, location when known, a two-line description and "View company".
 * Status wording is limited to what the system supports: "Unclaimed page" and
 * "Managed by the company".
 *
 * Data wiring (categories, companies, filtering, search) is unchanged.
 */

import { PageHeader } from "../components/PageHeader";
import { useState, useEffect, useCallback } from "react";
import { useCollection } from "../hooks/useFirestore";
import { usePageCopy } from "../lib/pageCopy";
import { orderBy, query, collection, limit, startAfter, getDocs, where, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Building2,
  Search,
  ChevronRight,
  ChevronDown,
  Globe,
  Filter,
  MapPin,
  X as CloseIcon,
} from "lucide-react";
import { SafeImage } from "../components/SafeImage";
import { companyInitials, companyLocation, STATUS_LABEL } from "../lib/companyDisplay";
import { Link, useSearchParams } from "react-router-dom";

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
  const [sectorsOpen, setSectorsOpen] = useState(true);

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
  // Featured companies: only those an admin has featured (decided 16 Nov 2026).
  const { data: featured } = useCollection<any>("companies", [where("isFeatured", "==", true), limit(8)]);

  // Paginated companies fetch, replacing the old useCollection("companies", ...)
  // call that had no limit() at all -- every page view read the entire
  // collection. See ENGINEERING_NOTES / the TWI+TankBazaar merge planning:
  // at merge-time scale (thousands of companies) that was ~1 read per
  // company per page view, exhausting the free daily quota after only a
  // handful of visits. Firestore array-contains-any is capped at 10 values,
  // so PAGE_SIZE and the 10-category cap below are both real constraints,
  // not arbitrary numbers.
  const PAGE_SIZE = 48;
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  const fetchCompaniesPage = useCallback(async (categoryFilter: string[], cursor: QueryDocumentSnapshot | null) => {
    const constraints: any[] = [orderBy("createdAt", "desc")];
    // Server-side coarse narrowing: bounds WHICH page-worth of documents gets
    // read, using the allCategoryIds field computed at write time (see
    // getAncestorAndSelfIds in Admin.tsx). This does NOT replace the
    // depth-aware "narrow to deepest selection" logic below -- it's a
    // superset prefilter so that logic runs against a bounded result set
    // instead of the whole collection. array-contains-any allows at most 10
    // values; with more than 10 selected, fall back to no server-side filter
    // (rare in practice -- the UI is a hierarchical drill-down, not a
    // 10+-item multi-select) and rely on the client-side pass alone for that
    // page, same as pre-fix behavior just for this edge case.
    if (categoryFilter.length > 0 && categoryFilter.length <= 10) {
      constraints.push(where("allCategoryIds", "array-contains-any", categoryFilter));
    }
    constraints.push(limit(PAGE_SIZE));
    if (cursor) constraints.push(startAfter(cursor));
    const snap = await getDocs(query(collection(db, "companies"), ...constraints));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { docs, lastVisible: snap.docs[snap.docs.length - 1] || null, gotFullPage: snap.docs.length === PAGE_SIZE };
  }, []);

  // Re-fetch from scratch whenever the category filter changes -- the server-side
  // constraint itself changed, so old pages/cursor are no longer valid.
  useEffect(() => {
    let cancelled = false;
    setLoadingCompanies(true);
    setCompanies([]);
    setLastDoc(null);
    setHasMore(true);
    fetchCompaniesPage(selectedCategories, null).then(({ docs, lastVisible, gotFullPage }) => {
      if (cancelled) return;
      setCompanies(docs);
      setLastDoc(lastVisible);
      setHasMore(gotFullPage);
      setLoadingCompanies(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error("Companies fetch failed:", err);
      setLoadingCompanies(false);
    });
    return () => { cancelled = true; };
  }, [selectedCategories.join(","), fetchCompaniesPage]);

  const loadMoreCompanies = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { docs, lastVisible, gotFullPage } = await fetchCompaniesPage(selectedCategories, lastDoc);
      setCompanies((prev) => [...prev, ...docs]);
      setLastDoc(lastVisible);
      setHasMore(gotFullPage);
    } catch (err) {
      console.error("Companies load-more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  };

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


  const catName = (id: string) => categories.find((c: any) => c.id === id)?.name as string | undefined;
  const hasFilters = !!searchTerm || selectedCategories.length > 0;
  const resetAll = () => { setSearchTerm(""); setSelectedCategories([]); };

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="page-frame py-6 md:py-8">
        <PageHeader title={copy.title} description={copy.subtitle} />

        {/* Search first */}
        <div className="relative mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" strokeWidth={1.75} />
          <input
            type="search"
            aria-label="Search companies"
            placeholder="Search companies by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-11 py-3.5 bg-bg-card border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/50 outline-none focus:border-text-heading transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md hover:bg-bg-main flex items-center justify-center text-text-body/60"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Honest, not silent: search only runs against companies already loaded.
            Firestore has no substring search; a real search index is separate work. */}
        {searchTerm && hasMore && (
          <p className="text-[12px] text-text-body/60 mb-2">
            Searching the {companies.length} companies loaded so far. Pick a sector on the left, or load more below, to search further.
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mt-6">
          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-3 bg-bg-card border border-border-main rounded-xl text-text-heading"
            >
              <span className="inline-flex items-center gap-2 text-[14px] font-medium">
                <Filter className="w-4 h-4 text-accent" strokeWidth={1.75} />
                Sectors{selectedCategories.length > 0 ? ` (${selectedCategories.length} selected)` : ""}
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""}`} strokeWidth={1.75} />
            </button>
          </div>

          {/* Left panel */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-72 shrink-0`}>
            <div className="bg-bg-card border border-border-main rounded-2xl p-5">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => setSectorsOpen(!sectorsOpen)}
                  aria-expanded={sectorsOpen}
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-text-heading"
                >
                  <ChevronDown className={`w-4 h-4 text-text-body/60 transition-transform ${sectorsOpen ? "" : "-rotate-90"}`} strokeWidth={1.75} />
                  Sectors
                </button>
                {selectedCategories.length > 0 && (
                  <button onClick={() => setSelectedCategories([])} className="text-[12px] text-accent hover:underline font-medium">
                    Clear
                  </button>
                )}
              </div>

              {sectorsOpen && (
                <div className="mt-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-body/40" strokeWidth={1.75} />
                    <input
                      type="text"
                      aria-label="Filter sectors"
                      placeholder="Find a sector"
                      value={sectorSearch}
                      onChange={(e) => setSectorSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-bg-main border border-border-main rounded-xl text-[13px] text-text-heading placeholder:text-text-body/50 outline-none focus:border-text-heading transition-all"
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
              )}
            </div>

            {featured.length > 0 && (
              <div className="bg-bg-card border border-border-main rounded-2xl p-5 mt-4">
                <p className="text-[14px] font-semibold text-text-heading mb-3">Featured companies</p>
                <ul className="space-y-2">
                  {featured.map((c: any) => (
                    <li key={c.id}>
                      <Link to={`/business/${c.id}`} className="flex items-center gap-2.5 text-[13px] text-text-heading hover:text-primary">
                        <SafeImage src={c.logo} alt="" className="w-8 h-8 rounded-md border border-border-main object-contain p-0.5 bg-bg-card shrink-0"
                          fallback={<span className="text-[11px] font-semibold text-text-body">{companyInitials(c.name)}</span>} />
                        <span className="min-w-0 truncate">{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <p className="text-[13px] text-text-body mr-1">
                {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"}
              </p>
              {selectedCategories.map((id) => (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-accent/10 text-accent rounded-full text-[12px] font-medium hover:bg-accent/15"
                  aria-label={`Remove filter ${catName(id) || id}`}
                >
                  {catName(id) || id}
                  <CloseIcon className="w-3 h-3" />
                </button>
              ))}
              {hasFilters && (
                <button onClick={resetAll} className="text-[12px] text-text-body hover:text-text-heading underline">
                  Clear all
                </button>
              )}
            </div>

            {loadingCompanies || loadingCats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-bg-card border border-border-main rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCompanies.map((company) => {
                  const ids: string[] = company.categoryIds?.length
                    ? company.categoryIds
                    : [company.categoryId].filter(Boolean);
                  const names = ids.map(catName).filter(Boolean) as string[];
                  const place = companyLocation(company.address);
                  return (
                    <article
                      key={company.id}
                      className="bg-bg-card border border-border-main rounded-2xl p-5 hover:border-text-heading transition-colors flex flex-col"
                    >
                      <div className="flex items-start gap-4">
                        <SafeImage
                          src={company.logo}
                          alt=""
                          className="w-14 h-14 rounded-xl border border-border-main object-contain p-1.5 bg-bg-card shrink-0"
                          fallback={<span className="text-[15px] font-semibold text-text-body">{companyInitials(company.name)}</span>}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[17px] font-semibold text-text-heading leading-snug">
                            <Link to={`/business/${company.id}`} className="hover:text-accent transition-colors">
                              {company.name}
                            </Link>
                          </h3>
                          <p className="text-[12px] mt-0.5 text-text-body/70">
                            {company.isClaimed ? STATUS_LABEL.managed : STATUS_LABEL.unclaimed}
                          </p>
                          {place && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-text-body">
                              <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                              <span className="truncate">{place}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {names.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {names.slice(0, 2).map((n) => (
                            <span key={n} className="px-2 py-0.5 bg-bg-main text-text-body rounded-md text-[12px]">{n}</span>
                          ))}
                          {names.length > 2 && (
                            <span className="px-2 py-0.5 text-text-body/70 text-[12px]">+{names.length - 2} more</span>
                          )}
                        </div>
                      )}

                      <p className="text-text-body text-[13px] leading-relaxed line-clamp-2 mt-3 flex-1">
                        {company.description || "No description has been added yet."}
                      </p>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-main">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] text-text-body hover:text-text-heading"
                            aria-label={`${company.name} website`}
                          >
                            <Globe className="w-3.5 h-3.5" strokeWidth={1.75} /> Website
                          </a>
                        ) : <span />}
                        <Link
                          to={`/business/${company.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:brightness-110 transition-all"
                        >
                          View company
                          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </Link>
                      </div>
                    </article>
                  );
                })}

                {filteredCompanies.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-bg-card border border-dashed border-border-main rounded-2xl">
                    <Building2 className="w-8 h-8 text-text-body/30 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[15px] font-medium text-text-heading">No companies match.</p>
                    <p className="text-text-body text-[13px] mt-1">Try a different search or sector.</p>
                    {hasFilters && (
                      <button onClick={resetAll} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium">
                        Clear all
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!loadingCompanies && hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreCompanies}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-card border border-border-main rounded-xl text-[13px] font-medium hover:border-text-heading transition-all disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more companies"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
