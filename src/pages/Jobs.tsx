import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCollection, createDocument } from "../hooks/useFirestore";
import { orderBy, where, serverTimestamp } from "firebase/firestore";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Send,
  X,
  ChevronRight,
  Building2,
  CheckCircle2,
  Info,
  Heart,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { format } from "date-fns";
import { updateDocument } from "../hooks/useFirestore";
import { CategorySelector } from "../components/CategorySelector";

export default function Jobs() {
  const { user, profile, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  
  useEffect(() => {
    if (showPostModal && ownedCompanies.length === 1 && !newJob.companyId) {
      setNewJob(prev => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo
      }));
    }
  }, [showPostModal, ownedCompanies]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  
  const [applyForm, setApplyForm] = useState({
    name: profile?.displayName || user?.displayName || "",
    email: user?.email || "",
    message: ""
  });
  
  const { data: jobs, loading: loadingJobs } = useCollection<any>("jobs", [orderBy("createdAt", "desc")]);
  const { data: companies } = useCollection<any>("companies");
  const { data: categories } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")]);

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
    status: "open"
  });

  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) return;
    const currentSaved = profile?.savedJobs || [];
    const isSaved = currentSaved.includes(jobId);
    const newSaved = isSaved 
      ? currentSaved.filter((id: string) => id !== jobId)
      : [...currentSaved, jobId];
    
    try {
      await updateDocument("users", user.uid, {
        savedJobs: newSaved,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling save job:", error);
    }
  };

  const handlePostJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.companyName) return;

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
        status: "open"
      });
    } catch (error) {
      console.error("Error posting job:", error);
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
          creatorEmail: selectedJob.creatorEmail
        })
      });

      if (response.ok) {
        setAppliedJobs(prev => [...prev, selectedJob.id]);
        
        // Add real-time notification
        await createDocument("notifications", {
          recipientUid: selectedJob.creatorUid,
          title: "New Job Applicant",
          message: `${applyForm.name} applied for "${selectedJob.title}"`,
          type: "job_application",
          link: `/jobs`,
          read: false,
          createdAt: serverTimestamp()
        });
        setShowApplyModal(false);
        setApplyForm({
          name: profile?.displayName || user?.displayName || "",
          email: user?.email || "",
          message: ""
        });
      }
    } catch (error) {
      console.error("Error applying for job:", error);
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesCategory = selectedCategories.length === 0 || 
                           (job.categoryIds && job.categoryIds.some((id: string) => selectedCategories.includes(id)));
    return matchesSearch && matchesType && matchesCategory;
  });

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Industry Careers</h1>
          <p className="text-slate-500 font-medium max-w-2xl">Discover your next professional milestone in the terminal storage ecosystem. Verified opportunities from top industry partners.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {(isAdmin || isCompanyOwner) && (
            <button 
              onClick={() => setShowPostModal(true)}
              className="px-6 py-4 bg-sidebar-focus text-sidebar-focus-text rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:brightness-110 transition-all shadow-xl active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Post Opportunity
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-4 h-4 text-indigo-600" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Filters</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Employment Type</label>
                <div className="space-y-1">
                  <button 
                    onClick={() => setTypeFilter("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${typeFilter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    All Types
                  </button>
                  {jobTypes.map(type => (
                    <button 
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${typeFilter === type ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center justify-between">
                  Sectors
                  {selectedCategories.length > 0 && (
                    <button onClick={() => setSelectedCategories([])} className="text-[8px] text-indigo-600 hover:underline">Clear</button>
                  )}
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.filter(c => c.level === 1).map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${selectedCategories.includes(cat.id) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {cat.name}
                      {selectedCategories.includes(cat.id) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {(isAdmin || isCompanyOwner) && (
            <div className="bg-sidebar-focus rounded-[2rem] p-6 text-sidebar-focus-text text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-sidebar-focus-text" />
              </div>
              <h3 className="font-black uppercase tracking-tight mb-2">Hiring?</h3>
              <p className="text-[10px] font-medium opacity-80 mb-4">Reach over 10,000+ verified industry professionals directly.</p>
              <button 
                onClick={() => setShowPostModal(true)}
                className="w-full py-3 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Start Posting
              </button>
            </div>
          )}
        </aside>

        {/* Jobs Grid (Pinterest Masonry Style) */}
        <div className="flex-1">
          {loadingJobs ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="break-inside-avoid mb-6 h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {filteredJobs.map((job) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={job.id}
                  className="break-inside-avoid mb-6 bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-6">
                     {job.companyId ? (
                       <Link to={`/business/${job.companyId}`} className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl border border-slate-100 p-2 flex items-center justify-center overflow-hidden hover:border-indigo-200 transition-all group/logo">
                          <img 
                            src={job.companyLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"} 
                            className="w-full h-full object-contain mix-blend-multiply group-hover/logo:scale-110 transition-transform" 
                            alt={job.companyName} 
                          />
                       </Link>
                     ) : (
                       <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                          <img 
                            src={job.companyLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"} 
                            className="w-full h-full object-contain mix-blend-multiply" 
                            alt="" 
                          />
                       </div>
                     )}
                     <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest truncate">{job.companyName}</p>
                          {job.companyId && (
                            <Link 
                              to={`/business/${job.companyId}`}
                              className="text-[8px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                              Company Profile
                              <ChevronRight className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">{job.title}</h3>
                     </div>
                  </div>

                  <div className="space-y-3 mb-6">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location || "Remote / Global"}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {job.type}
                     </div>
                     {job.salary && (
                       <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          {job.salary}
                       </div>
                     )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-4">
                    {job.description}
                  </p>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                       {job.createdAt ? format(new Date(job.createdAt), 'MMM dd') : 'Just now'}
                     </p>
                     
                     <div className="flex-1 flex gap-2">
                        <button 
                          onClick={() => handleToggleSaveJob(job.id)}
                          className={`p-3 rounded-xl transition-all border ${
                            profile?.savedJobs?.includes(job.id)
                              ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100 shadow-sm"
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          }`}
                        >
                           <Heart className={`w-4 h-4 ${profile?.savedJobs?.includes(job.id) ? "fill-current" : ""}`} />
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (!appliedJobs.includes(job.id)) {
                              setSelectedJob(job);
                              setApplyForm({
                                name: profile?.displayName || user?.displayName || "",
                                email: user?.email || "",
                                message: ""
                              });
                              setShowApplyModal(true);
                            }
                          }}
                          disabled={applyingJobId === job.id || appliedJobs.includes(job.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            appliedJobs.includes(job.id) 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-sidebar-focus text-sidebar-focus-text hover:brightness-110 shadow-lg"
                          } ${applyingJobId === job.id ? "opacity-30 cursor-not-allowed" : ""}`}
                        >
                          {applyingJobId === job.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : appliedJobs.includes(job.id) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Applied
                            </>
                          ) : (
                            <>
                              Apply Now
                              <ChevronRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                     </div>
                  </div>
                </motion.div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                   <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                   <h3 className="text-2xl font-black text-slate-900 mb-2">No opportunities found</h3>
                   <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Apply Job Modal */}
      <AnimatePresence>
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Apply for Position</h2>
                      <p className="text-xs text-slate-500 font-medium">{selectedJob.title} at {selectedJob.companyName}</p>
                   </div>
                   <button 
                     onClick={() => setShowApplyModal(false)}
                     className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Full Name</label>
                         <input 
                           type="text"
                           required
                           value={applyForm.name}
                           onChange={(e) => setApplyForm({...applyForm, name: e.target.value})}
                           placeholder="Your full name"
                           className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Email Address</label>
                         <input 
                           type="email"
                           required
                           value={applyForm.email}
                           onChange={(e) => setApplyForm({...applyForm, email: e.target.value})}
                           placeholder="your@email.com"
                           className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Message to Hiring Manager (Optional)</label>
                         <textarea 
                           value={applyForm.message}
                           onChange={(e) => setApplyForm({...applyForm, message: e.target.value})}
                           placeholder="Briefly explain why you're a good fit..."
                           className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-100 transition-all h-32 resize-none shadow-inner"
                         />
                      </div>
                   </div>

                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0">
                         <Info className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Direct Submission</p>
                         <p className="text-[10px] text-slate-500 leading-relaxed">Your application will be sent directly to the job poster's verified email address. They will contact you if your profile matches their requirements.</p>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 flex items-center gap-4 bg-slate-50/50">
                   <button 
                     onClick={() => setShowApplyModal(false)}
                     className="flex-1 py-4 bg-white text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-slate-200 hover:text-slate-600 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleApply}
                     disabled={applyingJobId === selectedJob.id || !applyForm.name || !applyForm.email}
                     className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {applyingJobId === selectedJob.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Application
                        </>
                     )}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Post Opportunity</h2>
                      <p className="text-xs text-slate-500 font-medium">Create a professional listing for your organization.</p>
                   </div>
                   <button 
                     onClick={() => setShowPostModal(false)}
                     className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Job Title</label>
                            <input 
                              type="text"
                              value={newJob.title}
                              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                              placeholder="e.g. Terminal Operations Manager"
                              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                         </div>
                         <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Employment Type</label>
                            <select 
                              value={newJob.type}
                              onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none"
                            >
                               {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Location</label>
                            <div className="relative">
                               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                               <input 
                                 type="text"
                                 value={newJob.location}
                                 onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                                 placeholder="Location or 'Remote'"
                                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                               />
                            </div>
                         </div>
                         <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Salary Range (Optional)</label>
                            <div className="relative">
                               <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                               <input 
                                 type="text"
                                 value={newJob.salary}
                                 onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                                 placeholder="e.g. $80k - $120k / Year"
                                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Classification (Select Multiple)</label>
                      <CategorySelector 
                        categories={categories}
                        selectedIds={newJob.categoryIds}
                        onChange={(ids) => setNewJob({...newJob, categoryIds: ids})}
                      />
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center justify-between">
                         Organization & Branding
                         <span className="text-[9px] lowercase opacity-50 font-medium">Selection will auto-fill details</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(isAdmin || isCompanyOwner) && ownedCompanies.map((company: any) => (
                          <button 
                            key={company.id}
                            onClick={() => setNewJob({
                              ...newJob, 
                              companyId: company.id, 
                              companyName: company.name, 
                              companyLogo: company.logo 
                            })}
                            className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                              newJob.companyId === company.id 
                                ? "bg-slate-900 text-white border-slate-900" 
                                : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                            }`}
                          >
                             {company.logo ? (
                               <img src={company.logo} className="w-4 h-4 object-contain rounded" alt="" />
                             ) : (
                               <Building2 className="w-3.5 h-3.5" />
                             )}
                             {company.name}
                          </button>
                        ))}
                      </div>
                      
                      {isAdmin && !newJob.companyId && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input 
                              type="text"
                              value={newJob.companyName}
                              onChange={(e) => setNewJob({...newJob, companyName: e.target.value})}
                              placeholder="Company Name"
                              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                           />
                           <input 
                              type="text"
                              value={newJob.companyLogo}
                              onChange={(e) => setNewJob({...newJob, companyLogo: e.target.value})}
                              placeholder="Logo URL"
                              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                           />
                        </div>
                      )}
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Job Description & Requirements</label>
                      <textarea 
                        value={newJob.description}
                        onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                        placeholder="Detail position responsibilities, required skills, and expectations..."
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-100 transition-all h-48 resize-none shadow-inner"
                      />
                   </div>

                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0">
                         <Info className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Response Channel</p>
                         <p className="text-[10px] text-slate-500 leading-relaxed">Applicants will be directed to your primary profile email: <span className="font-bold text-slate-900">{user?.email}</span>. You will receive an immediate notification for every submission.</p>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 flex items-center gap-4 bg-slate-50/50">
                   <button 
                     onClick={() => setShowPostModal(false)}
                     className="flex-1 py-4 bg-white text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-slate-200 hover:text-slate-600 transition-all"
                   >
                     Discard
                   </button>
                   <button 
                     onClick={handlePostJob}
                     className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                   >
                     <Send className="w-4 h-4" />
                     Publish Listing
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
