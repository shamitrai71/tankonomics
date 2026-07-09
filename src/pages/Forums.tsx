/**
 * Forums — industry discourse threads.
 *
 * Restyled to new design language. All data wiring preserved verbatim:
 *   - useCollection for forum_topics + company_categories
 *   - handleCreateTopic, navigate, ReportModal, ShareModal
 *   - Owned-company posting context, multi-category selector
 */

import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { TierGate } from "../components/TierGate";
import { useCollection, createDocument } from "../hooks/useFirestore";
import { orderBy, serverTimestamp } from "firebase/firestore";
import {
  MessageSquare,
  Search,
  Plus,
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Tag,
  Flag,
  Share2,
  Building2,
  User,
  X,
} from "lucide-react";
import ReportModal from "../components/ReportModal";
import ShareModal from "../components/ShareModal";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CategorySelector } from "../components/CategorySelector";
import { useNavigate } from "react-router-dom";

export default function Forums() {
  const { user, isAdmin, isCompanyOwner, ownedCompanies, tier } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    categoryIds: [] as string[],
    companyId: "",
    companyName: "",
    companyLogo: "",
  });
  const [reportingItem, setReportingItem] = useState<{ item: any; type: string; path: string } | null>(null);
  const [sharingTopic, setSharingTopic] = useState<any>(null);

  const { data: categories } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")]);

  useEffect(() => {
    if (isCreating && ownedCompanies.length === 1 && !newTopic.companyId) {
      setNewTopic((prev) => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo,
      }));
    }
  }, [isCreating, ownedCompanies]);

  const { data: topics, loading } = useCollection<any>("forum_topics", [orderBy("createdAt", "desc")]);

  const filteredTopics = topics.filter((topic) => {
    const matchesCategory =
      activeCategory === "all" || topic.categoryIds?.includes(activeCategory) || topic.category === activeCategory;
    const matchesSearch =
      !searchTerm ||
      topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    await createDocument("forum_topics", {
      ...newTopic,
      authorUid: user?.uid,
      authorName: newTopic.companyName || user?.displayName,
      replyCount: 0,
      createdAt: serverTimestamp(),
    });
    setNewTopic({ title: "", content: "", categoryIds: [], companyId: "", companyName: "", companyLogo: "" });
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Heading */}
        <header className="mb-10 md:mb-12 relative">
          <div className="absolute inset-x-0 top-0 h-28 bp-grid-paper opacity-50 pointer-events-none" />
          <div className="relative">
            <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
              INDUSTRY DISCOURSE
            </div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
              Where the operators talk.
            </h1>
            <p className="text-text-body text-[15px] mt-3 max-w-xl">
              Threaded discussions on tank construction, terminal automation, inspection findings and recruitment — moderated for verified members.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="space-y-6">
            {(tier === "B" || tier === "C" || tier === "admin") ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full bg-text-heading text-bg-card py-3 rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
                Start new topic
              </button>
            ) : (
              <TierGate requiredTier="B" compact><span /></TierGate>
            )}

            <div className="bg-bg-card border border-border-main rounded-2xl p-5">
              <p className="eyebrow tabular text-text-body/55 mb-4 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                Categories
              </p>
              <div className="space-y-0.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                    activeCategory === "all" ? "bg-text-heading text-bg-card" : "text-text-body hover:bg-bg-main"
                  }`}
                >
                  <span>View all</span>
                  <span className="eyebrow tabular opacity-60">{topics.length}</span>
                </button>
                {categories
                  .filter((c) => c.level === 1)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                        activeCategory === cat.id ? "bg-accent/10 text-accent" : "text-text-body hover:bg-bg-main"
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      {activeCategory === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                    </button>
                  ))}
              </div>
            </div>
          </aside>

          {/* Main view */}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="eyebrow tabular text-text-body/55">
                {filteredTopics.length} {filteredTopics.length === 1 ? "DISCUSSION" : "DISCUSSIONS"}
                {activeCategory !== "all" && ` · 1 SECTOR FILTER`}
              </p>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Search topics…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-bg-card border border-border-main rounded-xl text-[13px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-bg-main flex items-center justify-center text-text-body/50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Create new topic composer */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-bg-card border border-border-main rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                    <div>
                      <p className="eyebrow tabular text-accent">NEW DISCUSSION</p>
                      <h3 className="font-display text-2xl text-text-heading mt-1">Post a topic</h3>
                    </div>
                    <button onClick={() => setIsCreating(false)} className="text-[13px] text-text-body hover:text-text-heading">
                      Cancel
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Topic title</span>
                      <input
                        type="text"
                        placeholder="What are we discussing?"
                        className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                        value={newTopic.title}
                        onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      />
                    </label>

                    <div>
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Sectors (select multiple)</span>
                      <CategorySelector
                        categories={categories}
                        selectedIds={newTopic.categoryIds}
                        onChange={(ids) => setNewTopic({ ...newTopic, categoryIds: ids })}
                      />
                    </div>

                    {ownedCompanies.length > 0 && (
                      <div>
                        <span className="eyebrow tabular text-text-body/60 mb-2 block">Post as</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setNewTopic({ ...newTopic, companyId: "", companyName: "", companyLogo: "" })}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                              !newTopic.companyId
                                ? "bg-text-heading text-bg-card border-text-heading"
                                : "bg-bg-main border-border-main text-text-body hover:border-text-heading"
                            }`}
                          >
                            <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                            Individual
                          </button>
                          {ownedCompanies.map((company) => (
                            <button
                              key={company.id}
                              onClick={() =>
                                setNewTopic({
                                  ...newTopic,
                                  companyId: company.id,
                                  companyName: company.name,
                                  companyLogo: company.logo,
                                })
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                                newTopic.companyId === company.id
                                  ? "bg-text-heading text-bg-card border-text-heading"
                                  : "bg-bg-main border-border-main text-text-body hover:border-text-heading"
                              }`}
                            >
                              {company.logo ? (
                                <img src={company.logo} className="w-3.5 h-3.5 rounded object-contain" alt="" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                              )}
                              {company.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Opening message</span>
                      <textarea
                        placeholder="Provide context, ask a question, or share an observation…"
                        className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading h-32 resize-none transition-all"
                        value={newTopic.content}
                        onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                      />
                    </label>

                    <div className="flex justify-end gap-3 pt-2 border-t border-border-main">
                      <button
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2.5 text-[13px] text-text-body hover:text-text-heading"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleCreateTopic}
                        disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                        className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                      >
                        Publish topic
                        <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Topics list */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-card border border-border-main rounded-2xl p-5 h-32 animate-pulse" />
                ))}
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="py-20 text-center bg-bg-card border border-dashed border-border-main rounded-2xl">
                <MessageSquare className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                <p className="eyebrow tabular text-text-body/55 mb-1">NO THREADS</p>
                <h3 className="font-display text-2xl text-text-heading mb-2">No discussions yet</h3>
                <p className="text-text-body text-[14px]">
                  {searchTerm || activeCategory !== "all"
                    ? "Try adjusting your search or sector filter."
                    : "Be the first to start a conversation."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTopics.map((topic: any) => (
                  <div
                    key={topic.id}
                    onClick={() => navigate(`/forums/${topic.id}`)}
                    className="group bg-bg-card border border-border-main rounded-2xl p-5 hover:border-text-heading transition-all cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {topic.categoryIds?.map((cid: string) => (
                            <span key={cid} className="inline-flex items-center px-1.5 py-0.5 rounded bg-accent/10 text-accent eyebrow tabular border border-accent/20">
                              {categories.find((c) => c.id === cid)?.name || cid}
                            </span>
                          ))}
                          {(!topic.categoryIds || topic.categoryIds.length === 0) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-bg-main border border-border-main text-text-body/60 eyebrow tabular">
                              {topic.category || "General"}
                            </span>
                          )}
                          <span className="eyebrow tabular text-text-body/40">·</span>
                          <span className="eyebrow tabular text-text-body/55 truncate">Started by {topic.authorName}</span>
                        </div>
                        <h3 className="font-display text-xl text-text-heading leading-tight group-hover:text-accent transition-colors">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <span className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                            <MessageCircle className="w-3 h-3" strokeWidth={1.75} />
                            {topic.replyCount || 0} {(topic.replyCount || 0) === 1 ? "REPLY" : "REPLIES"}
                          </span>
                          <span className="eyebrow tabular text-text-body/45 flex items-center gap-1.5">
                            <Tag className="w-3 h-3" strokeWidth={1.75} />
                            INDUSTRY INSIGHT
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2 shrink-0">
                        <span className="eyebrow tabular text-text-body/45">
                          {topic.createdAt?.seconds ? formatDistanceToNow(topic.createdAt.seconds * 1000) + " ago" : "Just now"}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-bg-main border border-border-main flex items-center justify-center text-text-body/50 group-hover:bg-text-heading group-hover:border-text-heading group-hover:text-bg-card group-hover:translate-x-0.5 transition-all">
                          <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                      </div>
                    </div>

                    {/* Hover-only actions */}
                    <div className="absolute bottom-3 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharingTopic(topic);
                        }}
                        className="p-1.5 rounded-md text-text-body/40 hover:text-text-heading hover:bg-bg-main transition-all"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportingItem({ item: topic, type: "topic", path: `forum_topics/${topic.id}` });
                        }}
                        className="p-1.5 rounded-md text-text-body/40 hover:text-rust hover:bg-rust/5 transition-all"
                        title="Report"
                      >
                        <Flag className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sharingTopic && <ShareModal post={sharingTopic} onClose={() => setSharingTopic(null)} type="forum" />}
        {reportingItem && <ReportModal item={reportingItem.item} type={reportingItem.type} path={reportingItem.path} onClose={() => setReportingItem(null)} />}
      </AnimatePresence>
    </div>
  );
}
