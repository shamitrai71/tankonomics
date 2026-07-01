/**
 * Jobs — industry careers board.
 *
 * Restyled to new design language. All data wiring preserved verbatim:
 *   - useCollection jobs, companies, company_categories
 *   - handleToggleSaveJob writes profile.savedJobs array
 *   - handlePostJob creates a job document (owners only)
 *   - handleApply POSTs to /api/job-apply + creates notification
 */

import { useState, useEffect } from "react";
import { useCollection, createDocument, updateDocument } from "../hooks/useFirestore";
import { orderBy, serverTimestamp, where } from "firebase/firestore";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Plus,
  Search,
  Send,
  X,
  ChevronRight,
  Building2,
  CheckCircle2,
  Heart,
  Filter,
  Loader2,
  Info,
  Sparkles,
  UserCheck,
  Check,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { formatDistanceToNow } from "date-fns";
import { CategorySelector } from "../components/CategorySelector";

export default function Jobs() {
  const { user, profile, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const [applyForm, setApplyForm] = useState({
    name: profile?.displayName || user?.displayName || "",
    email: user?.email || "",
    message: "",
  });

  const { data: jobs, loading: loadingJobs } = useCollection<any>("jobs", [orderBy("createdAt", "desc")]);
  const { data: categories } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")]);
  // Matches where the current user is the suggested candidate.
  const { data: myMatches } = useCollection<any>(
    "job_matches",
    [where("userUid", "==", user?.uid || "__none__"), orderBy("createdAt", "desc")],
    !!user
  );
  // Matches against this company owner's listings (shown on their job cards).
  const { data: companyMatches } = useCollection<any>(
    "job_matches",
    [where("companyOwnerUid", "==", user?.uid || "__none__"), orderBy("createdAt", "desc")],
    !!user && isCompanyOwner
  );

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    categoryIds: [] as string[],
    companyId: "",
    companyName: "",
    companyLogo: "",
    location: "",
    type: "Full-time",
    salary: "",
    status: "open",
  });

  useEffect(() => {
    if (showPostModal && ownedCompanies.length === 1 && !newJob.companyId) {
      setNewJob((prev) => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo,
      }));
    }
  }, [showPostModal, ownedCompanies]);

  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) return;
    const currentSaved = profile?.savedJobs || [];
    const isSaved = currentSaved.includes(jobId);
    const newSaved = isSaved ? currentSaved.filter((id: string) => id !== jobId) : [...currentSaved, jobId];
    try {
      await updateDocument("users", user.uid, { savedJobs: newSaved, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error("Error toggling save job:", err);
    }
  };

  const handlePostJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.companyName || isPosting) return;
    setIsPosting(true);
    try {
      await createDocument("jobs", {
        ...newJob,
        creatorUid: user?.uid,
        creatorEmail: user?.email,
        createdAt: serverTimestamp(),
      });
      setShowPostModal(false);
      setNewJob({
        title: "",
        description: "",
        categoryIds: [],
        companyId: "",
        companyName: "",
        companyLogo: "",
        location: "",
        type: "Full-time",
        salary: "",
        status: "open",
      });
    } catch (err) {
      console.error("Error posting job:", err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob || !applyForm.name || !applyForm.email) return;
    setApplyingJobId(selectedJob.id);
    try {
      const response = await fetch("/api/job-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: selectedJob.title,
          companyName: selectedJob.companyName,
          applicantName: applyForm.name,
          applicantEmail: applyForm.email,
          message: applyForm.message,
          creatorEmail: selectedJob.creatorEmail,
        }),
      });

      if (response.ok) {
        setAppliedJobs((prev) => [...prev, selectedJob.id]);
        await createDocument("notifications", {
          recipientUid: selectedJob.creatorUid,
          title: "New job applicant",
          message: `${applyForm.name} applied for "${selectedJob.title}"`,
          type: "job_application",
          link: "/jobs",
          read: false,
          createdAt: serverTimestamp(),
        });
        setShowApplyModal(false);
        setApplyForm({
          name: profile?.displayName || user?.displayName || "",
          email: user?.email || "",
          message: "",
        });
      }
    } catch (err) {
      console.error("Error applying for job:", err);
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleRespondToMatch = async (matchId: string, status: "accepted" | "rejected") => {
    try {
      await updateDocument("job_matches", matchId, { status, updatedAt: serverTimestamp() });
    } catch (err: any) {
      console.error("Match response failed:", err);
      alert(`Failed to update match: ${err?.message || "Unknown error"}`);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesCategory =
      selectedCategories.length === 0 ||
      (job.categoryIds && job.categoryIds.some((id: string) => selectedCategories.includes(id)));
    return matchesSearch && matchesType && matchesCategory;
  });

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
  const mainCategories = categories.filter((c: any) => c.level === 1);

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Heading */}
        <header className="mb-10 md:mb-12 relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="relative">
            <div className="absolute -top-4 -left-4 right-0 h-24 bp-grid-paper opacity-50 pointer-events-none" />
            <div className="relative">
              <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                INDUSTRY CAREERS
              </div>
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
                Build your next role.
              </h1>
              <p className="text-text-body text-[15px] mt-3 max-w-xl">
                Verified opportunities across operators, EPCs, OEMs and inspection consultancies in the global tank &amp; terminal industry.
              </p>
            </div>
          </div>
          {(isAdmin || ownedCompanies.some((c: any) => c.status === "approved")) && (
            <button
              onClick={() => setShowPostModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={1.75} />
              Post opportunity
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
          {/* Sidebar — filters */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block space-y-6`}>
            {/* Employment type */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-5">
              <p className="eyebrow tabular text-text-body/55 mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                Employment type
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-between ${
                    typeFilter === "all" ? "bg-text-heading text-bg-card" : "text-text-body hover:bg-bg-main"
                  }`}
                >
                  <span>All types</span>
                  <span className="eyebrow tabular opacity-60">{jobs.length}</span>
                </button>
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-between ${
                      typeFilter === type ? "bg-accent/10 text-accent" : "text-text-body hover:bg-bg-main"
                    }`}
                  >
                    <span>{type}</span>
                    {typeFilter === type && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="eyebrow tabular text-text-body/55">Sectors</p>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-[11px] text-accent hover:underline font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-0.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {mainCategories.map((cat: any) => {
                  const isActive = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all flex items-center justify-between ${
                        isActive ? "bg-accent/10 text-accent" : "text-text-body hover:bg-bg-main"
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hiring CTA — deep petrol */}
            <div className="bg-primary text-white rounded-2xl p-6 grain relative overflow-hidden">
              <div className="absolute inset-0 bp-grid pointer-events-none opacity-40" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-4">
                  <Briefcase className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <p className="eyebrow tabular text-accent mb-2">FOR EMPLOYERS</p>
                <h3 className="font-display text-xl leading-tight mb-2">Hiring?</h3>
                <p className="text-white/65 text-[13px] leading-relaxed mb-5">
                  Reach 10,000+ verified industry professionals directly.
                </p>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-xl text-[13px] font-medium hover:brightness-110 transition-all"
                >
                  Start posting
                  <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </aside>

          {/* Main — search + grid */}
          <div className="space-y-6">
            {/* Suggested for You banner — shown when the current user has pending/accepted matches */}
            {myMatches && myMatches.filter((m: any) => m.status === "suggested" || m.status === "accepted").length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
                  <p className="eyebrow tabular text-accent">SUGGESTED FOR YOU</p>
                </div>
                <div className="space-y-3">
                  {myMatches.filter((m: any) => m.status === "suggested" || m.status === "accepted").map((match: any) => (
                    <div key={match.id} className="flex items-center gap-4 p-3 bg-bg-card border border-border-main rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-heading text-sm leading-tight">{match.jobTitle}</p>
                        <p className="text-xs text-text-body/55 mt-0.5">{match.companyName}</p>
                        {match.adminNote && (
                          <p className="text-xs text-text-body/70 mt-1 italic leading-relaxed">"{match.adminNote}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {match.status === "suggested" ? (
                          <>
                            <button
                              onClick={() => handleRespondToMatch(match.id, "rejected")}
                              className="p-2 border border-border-main rounded-xl text-text-body/55 hover:text-rust hover:border-rust transition-all"
                              title="Decline"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRespondToMatch(match.id, "accepted")}
                              className="px-3 py-2 bg-accent text-white rounded-xl text-[12px] eyebrow tabular hover:brightness-110 transition-all inline-flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-xl eyebrow tabular text-[11px] inline-flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" />
                            Accepted
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search bar + mobile filter toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-3 bg-bg-card border border-border-main rounded-xl text-[13px] text-text-heading"
              >
                <Filter className="w-4 h-4 text-accent" strokeWidth={1.75} />
                Filters
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Search jobs, companies, keywords…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-bg-card border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
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

            <p className="eyebrow tabular text-text-body/55">
              {filteredJobs.length} {filteredJobs.length === 1 ? "OPENING" : "OPENINGS"}
              {(typeFilter !== "all" || selectedCategories.length > 0) && " · FILTERS ACTIVE"}
            </p>

            {/* Jobs grid */}
            {loadingJobs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-56 bg-bg-card border border-border-main rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-bg-card border border-dashed border-border-main rounded-2xl">
                <Briefcase className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                <p className="eyebrow tabular text-text-body/55 mb-1">NO MATCH</p>
                <h3 className="font-display text-2xl text-text-heading mb-2">No opportunities found</h3>
                <p className="text-text-body text-[14px]">Try adjusting your filters or search keywords.</p>
                {(searchTerm || typeFilter !== "all" || selectedCategories.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setTypeFilter("all");
                      setSelectedCategories([]);
                    }}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-text-heading text-bg-card rounded-xl text-[13px] font-medium"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.map((job) => {
                    const isApplied = appliedJobs.includes(job.id);
                    const isSaved = (profile?.savedJobs || []).includes(job.id);
                    const isMyCompanyJob = ownedCompanies.some((c: any) => c.id === job.companyId);
                    const myJobMatchCount = isMyCompanyJob
                      ? companyMatches.filter((m: any) => m.jobId === job.id).length
                      : 0;
                    return (
                      <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-bg-card border border-border-main rounded-2xl p-5 hover:border-text-heading transition-all flex flex-col group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-bg-main rounded-xl border border-border-main p-2 flex items-center justify-center shrink-0 overflow-hidden">
                            {job.companyLogo ? (
                              <img src={job.companyLogo} className="w-full h-full object-contain" alt={job.companyName} />
                            ) : (
                              <Building2 className="w-5 h-5 text-text-body/40" strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="eyebrow tabular text-text-body/55 bg-bg-main px-1.5 py-0.5 rounded">
                                {job.type || "Full-time"}
                              </span>
                              {job.categoryIds?.[0] && (
                                <span className="eyebrow tabular text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                                  {categories.find((c: any) => c.id === job.categoryIds[0])?.name}
                                </span>
                              )}
                              {myJobMatchCount > 0 && (
                                <span className="eyebrow tabular text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {myJobMatchCount} matched
                                </span>
                              )}
                            </div>
                            <h3 className="font-display text-lg text-text-heading leading-tight group-hover:text-accent transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                            <p className="text-[13px] text-text-body mt-0.5 truncate">{job.companyName}</p>
                          </div>
                          <button
                            onClick={() => handleToggleSaveJob(job.id)}
                            className={`p-2 rounded-lg shrink-0 transition-all ${
                              isSaved ? "text-rust" : "text-text-body/40 hover:text-rust hover:bg-rust/5"
                            }`}
                            title={isSaved ? "Unsave" : "Save"}
                            aria-label="Save job"
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} strokeWidth={1.75} />
                          </button>
                        </div>

                        <p className="text-[13px] text-text-body line-clamp-2 mb-5 flex-1 leading-relaxed">
                          {job.description}
                        </p>

                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          {job.location && (
                            <span className="inline-flex items-center gap-1 eyebrow tabular text-text-body/55">
                              <MapPin className="w-3 h-3" strokeWidth={1.75} />
                              {job.location}
                            </span>
                          )}
                          {job.salary && (
                            <span className="inline-flex items-center gap-1 eyebrow tabular text-text-body/55">
                              <DollarSign className="w-3 h-3" strokeWidth={1.75} />
                              {job.salary}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 eyebrow tabular text-text-body/45">
                            <Clock className="w-3 h-3" strokeWidth={1.75} />
                            {job.createdAt?.seconds ? formatDistanceToNow(job.createdAt.seconds * 1000) + " ago" : "Just now"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border-main">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowApplyModal(true);
                            }}
                            disabled={isApplied}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                              isApplied
                                ? "bg-accent/10 text-accent border border-accent/20"
                                : "bg-text-heading text-bg-card hover:brightness-110"
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                                Applied
                              </>
                            ) : (
                              <>
                                Apply
                                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPostModal(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between shrink-0">
                <div>
                  <p className="eyebrow tabular text-accent">NEW LISTING</p>
                  <h2 className="font-display text-2xl text-text-heading mt-1">Post an opportunity</h2>
                </div>
                <button onClick={() => setShowPostModal(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <label className="block">
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Job title</span>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g. Terminal Operations Manager"
                    className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                  />
                </label>

                {ownedCompanies.length > 0 && (
                  <div>
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Posting as</span>
                    <div className="flex flex-wrap gap-2">
                      {ownedCompanies.filter((c: any) => c.status === "approved").map((company) => (
                        <button
                          key={company.id}
                          onClick={() =>
                            setNewJob({
                              ...newJob,
                              companyId: company.id,
                              companyName: company.name,
                              companyLogo: company.logo,
                            })
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                            newJob.companyId === company.id
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

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Location</span>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="e.g. Rotterdam"
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Salary range</span>
                    <input
                      type="text"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      placeholder="e.g. $80k–$120k"
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                    />
                  </label>
                </div>

                <div>
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Employment type</span>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewJob({ ...newJob, type })}
                        className={`px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                          newJob.type === type
                            ? "bg-text-heading text-bg-card border-text-heading"
                            : "bg-bg-main border-border-main text-text-body hover:border-text-heading"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Sectors</span>
                  <CategorySelector
                    categories={categories}
                    selectedIds={newJob.categoryIds}
                    onChange={(ids) => setNewJob({ ...newJob, categoryIds: ids })}
                  />
                </div>

                <label className="block">
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Job description</span>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe responsibilities, requirements, and what success looks like…"
                    className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading h-32 resize-none transition-all"
                  />
                </label>
              </div>

              <div className="px-6 py-4 border-t border-border-main flex items-center justify-end gap-3 bg-bg-card shrink-0">
                <button onClick={() => setShowPostModal(false)} className="px-4 py-2.5 text-[13px] text-text-body hover:text-text-heading">
                  Cancel
                </button>
                <button
                  onClick={handlePostJob}
                  disabled={!newJob.title || !newJob.description || !newJob.companyName || isPosting}
                  className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={1.75} />}
                  Publish listing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApplyModal(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                <div>
                  <p className="eyebrow tabular text-accent">APPLICATION</p>
                  <h2 className="font-display text-2xl text-text-heading mt-1 leading-tight">{selectedJob.title}</h2>
                  <p className="eyebrow tabular text-text-body/55 mt-1">{selectedJob.companyName}</p>
                </div>
                <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <label className="block">
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Full name</span>
                  <input
                    type="text"
                    value={applyForm.name}
                    onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading outline-none focus:border-text-heading transition-all"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Email</span>
                  <input
                    type="email"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading outline-none focus:border-text-heading transition-all"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Cover note</span>
                  <textarea
                    value={applyForm.message}
                    onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
                    placeholder="A short note about why you're a fit (optional)…"
                    className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading h-24 resize-none transition-all"
                  />
                </label>
                <div className="px-4 py-3 bg-bg-main border border-border-main rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
                  <p className="text-[12px] text-text-body leading-relaxed">
                    Your application will be sent directly to <span className="text-text-heading font-medium">{selectedJob.companyName}</span> with your contact details.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border-main flex items-center justify-end gap-3 bg-bg-card">
                <button onClick={() => setShowApplyModal(false)} className="px-4 py-2.5 text-[13px] text-text-body hover:text-text-heading">
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!applyForm.name || !applyForm.email || applyingJobId === selectedJob.id}
                  className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {applyingJobId === selectedJob.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
                  Submit application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
