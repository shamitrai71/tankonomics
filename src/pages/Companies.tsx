import { useState } from "react";
import { useCollection } from "../hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { 
  Building2, 
  Search, 
  ChevronRight, 
  Globe, 
  Filter, 
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sectorSearch, setSectorSearch] = useState("");
  
  const { data: categories, loading: loadingCats } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")]);
  const { data: companies, loading: loadingCompanies } = useCollection<any>("companies", [orderBy("createdAt", "desc")]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         company.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategories.length === 0 || 
                           (company.categoryIds && company.categoryIds.some((id: string) => selectedCategories.includes(id))) ||
                           selectedCategories.includes(company.categoryId) || 
                           selectedCategories.includes(company.subCategoryId) || 
                           selectedCategories.includes(company.tier3CategoryId);
    return matchesSearch && matchesCategory;
  });

  const mainCategories = categories.filter((c: any) => 
    c.level === 1 && (
      !sectorSearch || 
      c.name.toLowerCase().includes(sectorSearch.toLowerCase()) ||
      categories.some((sub: any) => sub.parentId === c.id && sub.name.toLowerCase().includes(sectorSearch.toLowerCase()))
    )
  );

  const marketLeaders = companies
    .filter(c => c.isFeatured || c.isClaimed)
    .slice(0, 5);

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className="w-full flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 group active:scale-[0.98] transition-all"
           >
              <div className="flex items-center gap-3">
                 <Filter className="w-4 h-4 text-indigo-600" />
                 {selectedCategories.length > 0 
                   ? `${selectedCategories.length} Sectors Selected` 
                   : 'All Industries'}
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
           </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 space-y-8`}>
          <div className="bg-white lg:bg-transparent p-6 lg:p-0 rounded-[2rem] border lg:border-none border-slate-200 lg:shadow-none shadow-xl shadow-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-900">
                 <Filter className="w-5 h-5 text-indigo-600" />
                 <h2 className="text-sm font-black uppercase tracking-widest">Sectors</h2>
              </div>
              {selectedCategories.length > 0 && (
                <button 
                  onClick={() => setSelectedCategories([])}
                  className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Filter sectors..."
                value={sectorSearch}
                onChange={(e) => setSectorSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            
            <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <button 
                onClick={() => setSelectedCategories([])}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedCategories.length === 0 ? 'bg-sidebar-focus text-sidebar-focus-text shadow-lg' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All Industries
              </button>
              {mainCategories.map((cat: any) => (
                <div key={cat.id} className="space-y-1">
                  <button 
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group ${
                      selectedCategories.includes(cat.id) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <div className="flex items-center gap-2">
                       {selectedCategories.includes(cat.id) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                       <ChevronRight className={`w-3 h-3 transition-transform ${selectedCategories.includes(cat.id) || categories.some((sub: any) => sub.parentId === cat.id && (selectedCategories.includes(sub.id) || (sectorSearch && sub.name.toLowerCase().includes(sectorSearch.toLowerCase())))) ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </button>
                  
                  {/* Nested Subcategories */}
                  {(selectedCategories.includes(cat.id) || 
                    categories.some((sub: any) => sub.parentId === cat.id && (selectedCategories.includes(sub.id) || (sectorSearch && sub.name.toLowerCase().includes(sectorSearch.toLowerCase()))))
                   ) && (
                    <div className="pl-4 space-y-1 mt-1 border-l-2 border-slate-100 ml-4">
                      {categories
                        .filter((sub: any) => sub.parentId === cat.id)
                        .filter((sub: any) => !sectorSearch || sub.name.toLowerCase().includes(sectorSearch.toLowerCase()) || cat.name.toLowerCase().includes(sectorSearch.toLowerCase()))
                        .map((sub: any) => (
                        <button 
                          key={sub.id}
                          onClick={() => toggleCategory(sub.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                            selectedCategories.includes(sub.id) ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {sub.name}
                          {selectedCategories.includes(sub.id) && <div className="w-1 h-1 rounded-full bg-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sidebar-focus rounded-3xl p-6 text-sidebar-focus-text overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:scale-125 transition-transform duration-500">
              <TrendingUp className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-black leading-tight mb-2 relative z-10 transition-colors text-sidebar-focus-text">Market Leaders</h3>
            <p className="text-xs opacity-70 font-medium mb-4 relative z-10">Discover vetted industrial champions within our ecosystem.</p>
            <div className="flex -space-x-2 relative z-10">
              {marketLeaders.length > 0 ? (
                marketLeaders.map(company => (
                  <Link 
                    key={company.id}
                    to={`/business/${company.id}`}
                    className="w-8 h-8 rounded-full border-2 border-sidebar-focus bg-white flex items-center justify-center text-[10px] font-bold overflow-hidden hover:scale-110 transition-transform shadow-sm"
                  >
                    {company.logo ? (
                      <img src={company.logo} className="w-full h-full object-cover" alt={company.name} />
                    ) : (
                      <span className="text-indigo-600 flex items-center justify-center font-black">
                        {company.name.charAt(0)}
                      </span>
                    )}
                  </Link>
                ))
              ) : (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-sidebar-focus bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Industrial Directory</h1>
              <p className="text-slate-500 font-medium">Verify and connect with verified manufacturing and technical partners.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          {(loadingCompanies || loadingCats) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCompanies.map((company, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={company.id}
                    className="bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 p-2 flex items-center justify-center group-hover:bg-white transition-colors">
                          <img src={company.logo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-contain mix-blend-multiply" alt={company.name} />
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {company.categoryIds?.slice(0, 2).map((cid: string) => (
                              <span key={cid} className="text-[8px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {categories.find((c: any) => c.id === cid)?.name}
                              </span>
                            ))}
                            {company.categoryIds?.length > 2 && (
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                +{company.categoryIds.length - 2}
                              </span>
                            )}
                            {!company.categoryIds && company.categoryId && (
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">
                                {categories.find((c: any) => c.id === company.categoryId)?.name}
                              </p>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                            {company.name}
                            {company.isClaimed && (
                              <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 border border-emerald-100 shadow-sm">
                                <Award className="w-2.5 h-2.5" /> Verified
                              </div>
                            )}
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                      {company.description || "Leading industrial partner specializing in innovative solutions and technical excellence."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-slate-400">
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Partner
                        </span>
                      </div>
                      
                      <Link 
                        to={`/business/${company.id}`} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-sidebar-focus text-sidebar-focus-text rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all transform group-hover:translate-x-1"
                      >
                        Profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredCompanies.length === 0 && (
                <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                   <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                   <h3 className="text-2xl font-black text-slate-900 mb-2">No partners found</h3>
                   <p className="text-slate-500 font-medium">Try adjusting your search or category filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
