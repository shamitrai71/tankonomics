import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { 
  createDocument, 
  useCollection, 
  updateDocument 
} from "../hooks/useFirestore";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  User, 
  MapPin, 
  Calendar as CalendarIcon, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Globe, 
  Heart, 
  Lock, 
  Unlock,
  Sparkles,
  Camera,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInYears } from "date-fns";
import { serverTimestamp, where } from "firebase/firestore";

export default function CreateResume() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: existingResumes, loading: loadingCheck } = useCollection<any>("resumes", [where("userUid", "==", user?.uid || "")]);
  const { data: categories } = useCollection<any>("company_categories");

  const [formData, setFormData] = useState<any>({
    fullName: profile?.displayName || user?.displayName || "",
    photoUrl: user?.photoURL || "",
    address: "",
    dateOfBirth: "",
    age: 0,
    mobile: "",
    maritalStatus: "Single",
    dependents: "None",
    aboutMe: "",
    currentJob: { title: "", company: "", duration: "" },
    pastJobs: [],
    qualifications: [],
    certifications: [],
    additionalCourses: [],
    additionalSkills: [],
    aiSkillLevel: 1,
    countriesTravelled: [],
    hobbies: [],
    isLocked: false,
    categoryId: "",
    categoryName: "",
    subCategoryId: "",
    subCategoryName: "",
    customCategory: "",
    customSubCategory: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loadingCheck && existingResumes.length > 0) {
      const resume = existingResumes[0];
      setFormData({
        ...resume,
        pastJobs: resume.pastJobs || [],
        qualifications: resume.qualifications || [],
        certifications: resume.certifications || [],
        additionalCourses: resume.additionalCourses || [],
        additionalSkills: resume.additionalSkills || [],
        countriesTravelled: resume.countriesTravelled || [],
        hobbies: resume.hobbies || []
      });
    }
  }, [existingResumes, loadingCheck]);

  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      if (!isNaN(birthDate.getTime())) {
        const calculatedAge = differenceInYears(new Date(), birthDate);
        setFormData(prev => ({ ...prev, age: calculatedAge }));
      }
    }
  }, [formData.dateOfBirth]);

  const handleAddField = (field: string, value: string = "") => {
    setFormData({ ...formData, [field]: [...formData[field], value] });
  };

  const handleRemoveField = (field: string, index: number) => {
    const list = [...formData[field]];
    list.splice(index, 1);
    setFormData({ ...formData, [field]: list });
  };

  const handleUpdateListItem = (field: string, index: number, value: string) => {
    const list = [...formData[field]];
    list[index] = value;
    setFormData({ ...formData, [field]: list });
  };

  const handleAddJob = () => {
    setFormData({ ...formData, pastJobs: [...formData.pastJobs, { title: "", company: "", duration: "" }] });
  };

  const handleRemoveJob = (index: number) => {
    const list = [...formData.pastJobs];
    list.splice(index, 1);
    setFormData({ ...formData, pastJobs: list });
  };

  const handleSave = async () => {
    if (!formData.categoryId || !formData.categoryName) {
      alert("Please select or type an industry category for mandatory reporting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Cleanup data for storage
      const { customCategory, customSubCategory, ...dataForStorage } = formData;
      const payload = {
        ...dataForStorage,
        userUid: user?.uid, // Ensure required fields for rules validation
        fullName: formData.fullName,
        updatedAt: serverTimestamp()
      };
      
      if (existingResumes.length > 0) {
        await updateDocument("resumes", existingResumes[0].id, payload);
      } else {
        await createDocument("resumes", {
          ...payload,
          createdAt: serverTimestamp()
        });
      }
      alert("Resume saved successfully!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to save resume.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Profile
           </button>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setFormData({...formData, isLocked: !formData.isLocked})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isLocked ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"}`}
              >
                {formData.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {formData.isLocked ? "Private Mode" : "Public View"}
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : <><Save className="w-4 h-4" /> Save Resume</>}
              </button>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden mb-12">
           {/* Cover Photo Area */}
           <div className="h-40 bg-slate-900 relative">
              <div className="absolute -bottom-16 left-12 p-1 bg-white rounded-3xl shadow-2xl">
                 <div className="relative group cursor-pointer">
                    <img 
                      src={formData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.fullName}`} 
                      className="w-32 h-32 rounded-[1.25rem] object-cover bg-slate-100 transition-opacity group-hover:opacity-60" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Camera className="w-8 h-8 text-black" />
                    </div>
                 </div>
              </div>
              <div className="absolute bottom-6 right-12 text-white/40 font-black text-4xl uppercase tracking-tighter select-none">
                 Career Blueprint
              </div>
           </div>

           <div className="pt-24 px-12 pb-16">
              {/* Mandatory Categorization */}
              <div className="mb-12 p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                 <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                    <Sparkles className="w-3 h-3" /> Industry Categorization & Reporting
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 block">Primary Sector</label>
                       <select 
                         value={formData.categoryId}
                         onChange={(e) => {
                            const cat = (categories || []).find((c: any) => c.id === e.target.value);
                            setFormData({
                               ...formData, 
                               categoryId: e.target.value, 
                               categoryName: cat?.name || (e.target.value === "other" ? (formData.customCategory || "Other") : ""),
                               subCategoryId: "",
                               subCategoryName: ""
                            });
                         }}
                         className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                       >
                          <option value="">Select Industry Vertical...</option>
                          {(categories || []).filter((c: any) => c.level === 1).map((cat: any) => (
                             <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                          <option value="other">Other (Manual Entry)</option>
                       </select>
                       
                       {formData.categoryId === "other" && (
                          <input 
                             placeholder="Type your industry sector..."
                             value={formData.customCategory}
                             onChange={(e) => setFormData({...formData, customCategory: e.target.value, categoryName: e.target.value})}
                             className="w-full p-4 bg-white border border-indigo-200 rounded-2xl text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-2"
                          />
                       )}
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 block">Sub-Segment</label>
                       <select 
                         value={formData.subCategoryId}
                         disabled={!formData.categoryId}
                         onChange={(e) => {
                            const sub = (categories || []).find((c: any) => c.id === e.target.value);
                            setFormData({
                               ...formData, 
                               subCategoryId: e.target.value, 
                               subCategoryName: sub?.name || (e.target.value === "other" ? (formData.customSubCategory || "Other") : "")
                            });
                         }}
                         className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none disabled:opacity-50"
                       >
                          <option value="">Select Technical Segment...</option>
                          {(categories || [])
                            .filter((c: any) => c.level === 2 && c.parentId === formData.categoryId)
                            .map((sub: any) => (
                               <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))
                          }
                          {formData.categoryId && <option value="other">Other (Manual Entry)</option>}
                       </select>

                       {formData.subCategoryId === "other" && (
                          <input 
                             placeholder="Type your specific sub-segment..."
                             value={formData.customSubCategory}
                             onChange={(e) => setFormData({...formData, customSubCategory: e.target.value, subCategoryName: e.target.value})}
                             className="w-full p-4 bg-white border border-indigo-200 rounded-2xl text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-2"
                          />
                       )}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 {/* Personal Info */}
                 <section className="space-y-6">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                       <User className="w-3 h-3" /> Personal Foundation
                    </h3>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Full Name</label>
                          <input 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                            placeholder="Engineering Professional"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Residential Address</label>
                          <div className="relative">
                             <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                             <input 
                               value={formData.address}
                               onChange={(e) => setFormData({...formData, address: e.target.value})}
                               className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                               placeholder="City, Country"
                             />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Date of Birth</label>
                             <input 
                               type="date"
                               value={formData.dateOfBirth}
                               onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                               className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                             />
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Calculated Age</label>
                             <div className="p-4 bg-slate-100 rounded-2xl text-sm font-black text-slate-400 italic">
                                {formData.age || "--"} Years Old
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Mobile Number</label>
                             <div className="relative">
                                <Phone className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                                <input 
                                  value={formData.mobile}
                                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                                  placeholder="+XX XXX XXX XXXX"
                                />
                             </div>
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Marital Status</label>
                             <select 
                               value={formData.maritalStatus}
                               onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                               className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                             >
                                <option>Single</option>
                                <option>Married</option>
                                <option>Other</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Dependents Info</label>
                          <input 
                            value={formData.dependents}
                            onChange={(e) => setFormData({...formData, dependents: e.target.value})}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                            placeholder="e.g. 2 Children"
                          />
                       </div>
                    </div>
                 </section>

                 {/* Professional Bio & Skills */}
                 <section className="space-y-6">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                       <Briefcase className="w-3 h-3" /> Professional Trajectory
                    </h3>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">About Me / Summary</label>
                          <textarea 
                            value={formData.aboutMe}
                            onChange={(e) => setFormData({...formData, aboutMe: e.target.value})}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium min-h-[120px] focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none"
                            placeholder="Executive summary of your industry impact..."
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 flex justify-between items-center">
                            AI & Emerging Tech Score
                            <span className="text-indigo-600 font-black">{formData.aiSkillLevel}/10</span>
                          </label>
                          <input 
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={formData.aiSkillLevel}
                            onChange={(e) => setFormData({...formData, aiSkillLevel: parseInt(e.target.value)})}
                            className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                       </div>
                       <div className="pt-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center justify-between">
                             Key Technical Skills
                             <button onClick={() => handleAddField('additionalSkills')} className="p-1 hover:bg-slate-100 rounded-md text-indigo-600"><Plus className="w-4 h-4" /></button>
                          </label>
                          <div className="flex flex-wrap gap-2">
                             {formData.additionalSkills.map((skill: string, idx: number) => (
                               <div key={idx} className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest group">
                                  <input 
                                    value={skill}
                                    onChange={(e) => handleUpdateListItem('additionalSkills', idx, e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 p-0 text-[10px] w-auto inline-block min-w-[50px]"
                                  />
                                  <button onClick={() => handleRemoveField('additionalSkills', idx)}><Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" /></button>
                               </div>
                             ))}
                             {formData.additionalSkills.length === 0 && (
                               <button onClick={() => handleAddField('additionalSkills')} className="text-[10px] text-slate-400 italic">Add your first skill...</button>
                             )}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* Experience */}
                 <section className="col-span-1 md:col-span-2 mt-8 space-y-6">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                       <Award className="w-3 h-3" /> Career Milestones
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                          <p className="text-[10px] font-black uppercase text-indigo-600/40 mb-4 tracking-widest">Active Engagement</p>
                          <div className="space-y-4">
                             <input 
                               placeholder="Job Title"
                               value={formData.currentJob.title}
                               onChange={(e) => setFormData({...formData, currentJob: {...formData.currentJob, title: e.target.value}})}
                               className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none"
                             />
                             <input 
                               placeholder="Company Name"
                               value={formData.currentJob.company}
                               onChange={(e) => setFormData({...formData, currentJob: {...formData.currentJob, company: e.target.value}})}
                               className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none"
                             />
                             <input 
                               placeholder="Duration (e.g. 2021 - Present)"
                               value={formData.currentJob.duration}
                               onChange={(e) => setFormData({...formData, currentJob: {...formData.currentJob, duration: e.target.value}})}
                               className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none"
                             />
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Historical Records</p>
                            <button onClick={handleAddJob} className="flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:underline">
                               <Plus className="w-3.5 h-3.5" /> Add Job
                            </button>
                          </div>
                          <div className="space-y-3">
                             {formData.pastJobs.map((job: any, idx: number) => (
                               <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm group">
                                  <div className="flex-1 grid grid-cols-3 gap-2 mr-4">
                                     <input 
                                       placeholder="Title" 
                                       value={job.title} 
                                       onChange={(e) => {
                                         const list = [...formData.pastJobs];
                                         list[idx].title = e.target.value;
                                         setFormData({...formData, pastJobs: list});
                                       }}
                                       className="text-xs font-bold w-full bg-slate-50 border-none rounded-lg p-2"
                                     />
                                     <input 
                                       placeholder="Company" 
                                       value={job.company} 
                                       onChange={(e) => {
                                         const list = [...formData.pastJobs];
                                         list[idx].company = e.target.value;
                                         setFormData({...formData, pastJobs: list});
                                       }}
                                       className="text-xs font-bold w-full bg-slate-50 border-none rounded-lg p-2"
                                     />
                                     <input 
                                       placeholder="Date" 
                                       value={job.duration} 
                                       onChange={(e) => {
                                         const list = [...formData.pastJobs];
                                         list[idx].duration = e.target.value;
                                         setFormData({...formData, pastJobs: list});
                                       }}
                                       className="text-xs font-bold w-full bg-slate-50 border-none rounded-lg p-2"
                                     />
                                  </div>
                                  <button onClick={() => handleRemoveJob(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* Credentials */}
                 <section className="space-y-8">
                    <div className="space-y-4">
                       <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                          <GraduationCap className="w-4 h-4" /> Academic Credentials
                          <button onClick={() => handleAddField('qualifications')} className="ml-auto p-1.5 bg-indigo-50 rounded-lg"><Plus className="w-3.5 h-3.5" /></button>
                       </h3>
                       <div className="space-y-2">
                          {formData.qualifications.map((item: string, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 group">
                                <input 
                                  value={item}
                                  onChange={(e) => handleUpdateListItem('qualifications', idx, e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                                  placeholder="Degree / University"
                                />
                                <button onClick={() => handleRemoveField('qualifications', idx)} className="opacity-0 group-hover:opacity-100 text-red-500 rounded-lg transition-opacity"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                          <Award className="w-4 h-4" /> Industry Certifications
                          <button onClick={() => handleAddField('certifications')} className="ml-auto p-1.5 bg-indigo-50 rounded-lg"><Plus className="w-3.5 h-3.5" /></button>
                       </h3>
                       <div className="space-y-2">
                          {formData.certifications.map((item: string, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 group">
                                <input 
                                  value={item}
                                  onChange={(e) => handleUpdateListItem('certifications', idx, e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                                  placeholder="ISO, API, NEBOSH etc."
                                />
                                <button onClick={() => handleRemoveField('certifications', idx)} className="opacity-0 group-hover:opacity-100 text-red-500 rounded-lg transition-opacity"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                          <Sparkles className="w-4 h-4" /> Additional Courses
                          <button onClick={() => handleAddField('additionalCourses')} className="ml-auto p-1.5 bg-indigo-50 rounded-lg"><Plus className="w-3.5 h-3.5" /></button>
                       </h3>
                       <div className="space-y-2">
                          {formData.additionalCourses.map((item: string, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 group">
                                <input 
                                  value={item}
                                  onChange={(e) => handleUpdateListItem('additionalCourses', idx, e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                                />
                                <button onClick={() => handleRemoveField('additionalCourses', idx)} className="opacity-0 group-hover:opacity-100 text-red-500 rounded-lg transition-opacity"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </section>

                 {/* Leisure & Travel */}
                 <section className="space-y-8">
                    <div className="space-y-4">
                       <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                          <Globe className="w-4 h-4" /> Global Footprint
                          <button onClick={() => handleAddField('countriesTravelled')} className="ml-auto p-1.5 bg-indigo-50 rounded-lg"><Plus className="w-3.5 h-3.5" /></button>
                       </h3>
                       <div className="flex flex-wrap gap-2">
                          {formData.countriesTravelled.map((item: string, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase group">
                                <input 
                                  value={item}
                                  onChange={(e) => handleUpdateListItem('countriesTravelled', idx, e.target.value)}
                                  className="bg-transparent border-none p-0 text-[10px] w-20"
                                />
                                <button onClick={() => handleRemoveField('countriesTravelled', idx)}><X className="w-3 h-3" /></button>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-indigo-50 pb-2">
                          <Heart className="w-4 h-4" /> Lifestyle & Hobbies
                          <button onClick={() => handleAddField('hobbies')} className="ml-auto p-1.5 bg-indigo-50 rounded-lg"><Plus className="w-3.5 h-3.5" /></button>
                       </h3>
                       <div className="space-y-2">
                          {formData.hobbies.map((item: string, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 group">
                                <input 
                                  value={item}
                                  onChange={(e) => handleUpdateListItem('hobbies', idx, e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                                />
                                <button onClick={() => handleRemoveField('hobbies', idx)} className="opacity-0 group-hover:opacity-100 text-red-500 rounded-lg transition-opacity"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </section>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
