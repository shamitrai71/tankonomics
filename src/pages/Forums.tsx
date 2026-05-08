import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useCollection, createDocument } from "../hooks/useFirestore";
import { orderBy, where, serverTimestamp } from "firebase/firestore";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MessageCircle, 
  ChevronRight,
  TrendingUp,
  Tag,
  Flag,
  Share2
} from "lucide-react";
import ReportModal from "../components/ReportModal";
import ShareModal from "../components/ShareModal";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CategorySelector } from "../components/CategorySelector";
import { useNavigate } from "react-router-dom";

export default function Forums() {
  const { user, profile, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newTopic, setNewTopic] = useState({ 
    title: "", 
    content: "", 
    categoryIds: [] as string[],
    companyId: "",
    companyName: "",
    companyLogo: ""
  });
  const [reportingItem, setReportingItem] = useState<{ item: any, type: string, path: string } | null>(null);
  const [sharingTopic, setSharingTopic] = useState<any>(null);

  const { data: categories } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")]);

  useEffect(() => {
    if (isCreating && ownedCompanies.length === 1 && !newTopic.companyId) {
      setNewTopic(prev => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo
      }));
    }
  }, [isCreating, ownedCompanies]);

  const { data: topics, loading } = useCollection<any>("forum_topics", [
    orderBy("createdAt", "desc")
  ]);

  const filteredTopics = topics.filter(topic => {
    if (activeCategory === "all") return true;
    return topic.categoryIds?.includes(activeCategory) || topic.category === activeCategory;
  });

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    await createDocument("forum_topics", {
      ...newTopic,
      authorUid: user?.uid,
      authorName: newTopic.companyName || user?.displayName,
      replyCount: 0,
      createdAt: serverTimestamp()
    });
    setNewTopic({ title: "", content: "", categoryIds: [], companyId: "", companyName: "", companyLogo: "" });
    setIsCreating(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Categories */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          {(isAdmin || isCompanyOwner) && (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full bg-sidebar-focus text-sidebar-focus-text p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md active:scale-[0.98] mb-6"
            >
              <Plus className="w-5 h-5" /> Start New Topic
            </button>
          )}
          
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Categories</h3>
            </div>
            <div className="p-2 space-y-1">
              <button 
                onClick={() => setActiveCategory("all")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === "all" ? "bg-sidebar-focus text-sidebar-focus-text shadow-md active:scale-105" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <span>View All</span>
                <TrendingUp className="w-4 h-4 opacity-50" />
              </button>
              {categories.filter(c => c.level === 1).map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id ? "bg-sidebar-focus text-sidebar-focus-text shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <span className="truncate">{cat.name}</span>
                  {activeCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Forum View */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Industry Discourse</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search topics..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none w-64 shadow-sm"
            />
          </div>
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl overflow-hidden"
            >
              <h3 className="font-bold text-slate-900 mb-4">Post New Discussion</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">Topic Title</label>
                    <input 
                      type="text" 
                      placeholder="What are we discussing?"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" 
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">Sectors (Select Multiple)</label>
                    <CategorySelector 
                      categories={categories}
                      selectedIds={newTopic.categoryIds}
                      onChange={(ids) => setNewTopic({...newTopic, categoryIds: ids})}
                    />
                  </div>
                </div>

                {ownedCompanies.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">Post as Company</label>
                    <div className="flex flex-wrap gap-2">
                       {ownedCompanies.map(company => (
                         <button 
                            key={company.id}
                            onClick={() => setNewTopic({...newTopic, companyId: company.id, companyName: company.name, companyLogo: company.logo})}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${newTopic.companyId === company.id ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-gray-500 border-gray-100"}`}
                         >
                            {company.logo && <img src={company.logo} className="w-4 h-4 rounded object-contain" alt="" />}
                            {company.name}
                         </button>
                       ))}
                       <button 
                          onClick={() => setNewTopic({...newTopic, companyId: "", companyName: "", companyLogo: ""})}
                          className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${!newTopic.companyId ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-gray-500 border-gray-100"}`}
                       >
                          Post as Individual
                       </button>
                    </div>
                  </div>
                )}
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">Opening Message</label>
                   <textarea 
                     placeholder="Provide context, ask a question, or share an observation..."
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 h-32 resize-none"
                     value={newTopic.content}
                     onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                   />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                   <button 
                     onClick={() => setIsCreating(false)}
                     className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-slate-900"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleCreateTopic}
                     className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-all"
                   >
                     Publish Topic
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center animate-pulse">Scanning database...</div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-20 text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No discussions in this category yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTopics.map((topic: any) => (
                <div 
                  key={topic.id} 
                  onClick={() => navigate(`/forums/${topic.id}`)}
                  className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {topic.categoryIds?.map((cid: string) => (
                          <span key={cid} className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                            {categories.find(c => c.id === cid)?.name}
                          </span>
                        ))}
                        {(!topic.categoryIds || topic.categoryIds.length === 0) && (
                          <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {topic.category || "General"}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold">•</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Started by {topic.authorName}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-slate-600 transition-colors text-lg">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-3">
                         <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                           <MessageCircle className="w-4 h-4" /> {topic.replyCount || 0} REPLIES
                         </div>
                         <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                           <Tag className="w-4 h-4" /> INDUSTRY INSIGHT
                         </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <span className="text-[10px] text-gray-300 font-black uppercase tracking-tighter mb-2">
                         {topic.createdAt?.seconds ? formatDistanceToNow(topic.createdAt.seconds * 1000) + " ago" : "Just now"}
                       </span>
                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all transform group-hover:translate-x-1">
                         <ChevronRight className="w-5 h-5" />
                       </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportingItem({ item: topic, type: "topic", path: `forum_topics/${topic.id}` });
                      }}
                      className="absolute bottom-2 right-20 p-2 rounded-full text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Report Topic"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingTopic(topic);
                      }}
                      className="absolute bottom-2 right-12 p-2 rounded-full text-slate-200 hover:text-primary hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Share Topic"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sharingTopic && (
          <ShareModal 
            post={sharingTopic} 
            onClose={() => setSharingTopic(null)} 
            type="forum"
          />
        )}
        {reportingItem && (
          <ReportModal 
            item={reportingItem.item}
            type={reportingItem.type}
            path={reportingItem.path}
            onClose={() => setReportingItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
