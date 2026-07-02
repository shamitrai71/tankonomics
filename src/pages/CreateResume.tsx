/**
 * CreateResume — the career blueprint editor.
 *
 * Restyled. All data wiring preserved verbatim:
 *   - useCollection resumes (lookup by userUid) + categories
 *   - handleSave creates or updates Firestore doc with mandatory categoryId/Name
 *   - All array helpers (handleAddField / handleRemoveField / handleUpdateListItem)
 *   - Age auto-calc from dateOfBirth
 *   - Custom "other" sector entry path
 *   - Public/Private isLocked toggle
 *
 * Visual changes only — structure is a single editorial spread:
 *   - Hero strip with eyebrow, display headline, save bar
 *   - Categorisation card (mandatory — clearly marked) with safety-orange accent
 *   - Two-col grid: Personal Foundation + Professional Trajectory
 *   - Career Milestones (Active + Historical)
 *   - Credentials (Academic / Certifications / Courses)
 *   - Lifestyle (Travel + Hobbies)
 *   - Sticky bottom save bar
 */

import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import {
  createDocument,
  useCollection,
  updateDocument,
} from "../hooks/useFirestore";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Heart,
  Lock,
  Unlock,
  Sparkles,
  X,
  Loader2,
  Check,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { differenceInYears } from "date-fns";
import { serverTimestamp, where } from "firebase/firestore";
import { LOCATION_SUGGESTIONS } from "../lib/matchScore";

export default function CreateResume() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: existingResumes, loading: loadingCheck } = useCollection<any>("resumes", [where("userUid", "==", user?.uid || "")]);
  const { data: categories } = useCollection<any>("company_categories");

  const [formData, setFormData] = useState<any>({
    fullName: profile?.displayName || user?.displayName || "",
    photoUrl: user?.photoURL || "",
    address: "",
    currentCity: "",
    preferredLocations: [] as string[],
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
    customSubCategory: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

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
        currentCity: resume.currentCity || "",
        preferredLocations: resume.preferredLocations || [],
        hobbies: resume.hobbies || [],
      });
    }
  }, [existingResumes, loadingCheck]);

  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      if (!isNaN(birthDate.getTime())) {
        const calculatedAge = differenceInYears(new Date(), birthDate);
        setFormData((prev: any) => ({ ...prev, age: calculatedAge }));
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
      alert("Please select or type an industry category — this is required so employers can find you.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { customCategory, customSubCategory, ...dataForStorage } = formData;
      const payload = {
        ...dataForStorage,
        userUid: user?.uid,
        fullName: formData.fullName,
        updatedAt: serverTimestamp(),
      };

      if (existingResumes.length > 0) {
        await updateDocument("resumes", existingResumes[0].id, payload);
      } else {
        await createDocument("resumes", {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save resume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Small helpers ---------- */
  const TextField = ({
    label, value, onChange, placeholder = "", icon: Icon, type = "text",
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    icon?: any;
    type?: string;
  }) => (
    <label className="block">
      <span className="eyebrow tabular text-text-body/60 mb-2 block">{label}</span>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" strokeWidth={1.75} />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading focus:bg-bg-card transition-all`}
        />
      </div>
    </label>
  );

  const SectionHeading = ({ icon: Icon, eyebrow, title, action }: { icon: any; eyebrow: string; title: string; action?: React.ReactNode }) => (
    <div className="flex items-end justify-between mb-5 pb-3 border-b border-border-main">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-bg-main border border-border-main rounded-xl flex items-center justify-center text-accent shrink-0">
          <Icon className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div>
          <p className="eyebrow tabular text-text-body/55">{eyebrow}</p>
          <h3 className="font-display text-xl text-text-heading leading-tight">{title}</h3>
        </div>
      </div>
      {action}
    </div>
  );

  if (loadingCheck) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-text-heading border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Back chip */}
        <button
          onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-2 text-text-body/55 hover:text-text-heading transition-colors mb-8 group"
        >
          <span className="w-8 h-8 rounded-lg bg-bg-card border border-border-main flex items-center justify-center group-hover:bg-text-heading group-hover:text-bg-card group-hover:border-text-heading transition-all">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          </span>
          <span className="eyebrow tabular">Back to profile</span>
        </button>

        {/* Hero strip */}
        <header className="relative mb-10">
          <div className="absolute inset-x-0 top-0 h-32 bp-grid-paper opacity-50 pointer-events-none" />
          <div className="relative">
            <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
              {existingResumes.length > 0 ? "UPDATE YOUR RECORD" : "CAREER BLUEPRINT"}
            </div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
              {existingResumes.length > 0 ? "Refine your blueprint." : "Build your career blueprint."}
            </h1>
            <p className="text-text-body text-[15px] mt-3 max-w-2xl">
              A structured technical record that makes you searchable by verified employers across the global tank &amp; terminal network. All fields support recruitment matching — the more complete, the better the match.
            </p>
          </div>
        </header>

        {/* Categorisation — mandatory */}
        <section className="bg-bg-card border-2 border-accent/30 rounded-2xl p-6 md:p-7 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none">
            <Tag className="w-full h-full text-accent" strokeWidth={1} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded eyebrow tabular bg-accent text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Required
              </span>
              <p className="eyebrow tabular text-accent">DOMAIN EXPERIENCE</p>
            </div>
            <h3 className="font-display text-2xl text-text-heading mb-2 leading-tight">Domain experience</h3>
            <p className="text-[13px] text-text-body mb-6 max-w-xl leading-relaxed">
              This drives every recruitment search and job match on the platform. Be specific — employers filter by domain and specialisation first.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow tabular text-text-body/60 mb-2 block">Primary domain</span>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    const cat = (categories || []).find((c: any) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      categoryId: e.target.value,
                      categoryName: cat?.name || (e.target.value === "other" ? (formData.customCategory || "Other") : ""),
                      subCategoryId: "",
                      subCategoryName: "",
                    });
                  }}
                  className="w-full p-3.5 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
                >
                  <option value="">Select industry vertical…</option>
                  {(categories || []).filter((c: any) => c.level === 1).map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="other">Other (manual entry)</option>
                </select>

                {formData.categoryId === "other" && (
                  <motion.input
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    placeholder="Type your domain…"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value, categoryName: e.target.value })}
                    className="w-full mt-2 p-3.5 bg-bg-main border border-accent/40 rounded-xl text-[14px] text-text-heading outline-none focus:border-accent transition-all"
                  />
                )}
              </label>

              <label className="block">
                <span className="eyebrow tabular text-text-body/60 mb-2 block">Specialisation</span>
                <select
                  value={formData.subCategoryId}
                  disabled={!formData.categoryId}
                  onChange={(e) => {
                    const sub = (categories || []).find((c: any) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      subCategoryId: e.target.value,
                      subCategoryName: sub?.name || (e.target.value === "other" ? (formData.customSubCategory || "Other") : ""),
                    });
                  }}
                  className="w-full p-3.5 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading disabled:opacity-50 transition-all"
                >
                  <option value="">Select technical segment…</option>
                  {(categories || [])
                    .filter((c: any) => c.level === 2 && c.parentId === formData.categoryId)
                    .map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  {formData.categoryId && <option value="other">Other (manual entry)</option>}
                </select>

                {formData.subCategoryId === "other" && (
                  <motion.input
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    placeholder="Type your specific sub-segment…"
                    value={formData.customSubCategory}
                    onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value, subCategoryName: e.target.value })}
                    className="w-full mt-2 p-3.5 bg-bg-main border border-accent/40 rounded-xl text-[14px] text-text-heading outline-none focus:border-accent transition-all"
                  />
                )}
              </label>
            </div>
          </div>
        </section>

        {/* Two-column: Personal + Professional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Personal Foundation */}
          <section className="bg-bg-card border border-border-main rounded-2xl p-6 md:p-7">
            <SectionHeading icon={User} eyebrow="01 · IDENTITY" title="Personal foundation" />

            <div className="space-y-4">
              <TextField label="Full name" value={formData.fullName} onChange={(v) => setFormData({ ...formData, fullName: v })} placeholder="As shown on credentials" />
              <TextField label="Residential address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} placeholder="City, Country" icon={MapPin} />

              <TextField label="Current city" value={formData.currentCity} onChange={(v) => setFormData({ ...formData, currentCity: v })} placeholder="e.g. Navi Mumbai" icon={MapPin} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow tabular text-text-body/60">Preferred work locations</span>
                  <button onClick={() => handleAddField("preferredLocations")} className="text-accent text-[11px] font-medium hover:underline inline-flex items-center gap-1">
                    + Add location
                  </button>
                </div>
                <p className="text-[11px] text-text-body/50 mb-2 leading-relaxed">
                  Used for job matching — listings in these cities score higher for you.
                </p>
                <datalist id="location-suggestions">
                  {LOCATION_SUGGESTIONS.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                {formData.preferredLocations.length === 0 && (
                  <button onClick={() => handleAddField("preferredLocations")} className="text-[13px] text-text-body/50 italic">
                    e.g. Rotterdam, Singapore, Fujairah…
                  </button>
                )}
                <div className="space-y-2">
                  {formData.preferredLocations.map((loc: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        list="location-suggestions"
                        value={loc}
                        onChange={(e) => handleUpdateListItem("preferredLocations", idx, e.target.value)}
                        placeholder="Start typing a city…"
                        className="flex-1 p-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
                      />
                      <button
                        onClick={() => handleRemoveField("preferredLocations", idx)}
                        className="w-8 h-8 rounded-lg text-text-body/30 hover:text-rust hover:bg-rust/5 flex items-center justify-center transition-all shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Date of birth</span>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
                  />
                </label>
                <div>
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Calculated age</span>
                  <div className="p-3 bg-bg-main border border-border-main rounded-xl flex items-center gap-2">
                    <span className="font-display tabular text-2xl text-text-heading leading-none">{formData.age || "—"}</span>
                    <span className="eyebrow tabular text-text-body/55">years</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextField label="Mobile number" value={formData.mobile} onChange={(v) => setFormData({ ...formData, mobile: v })} placeholder="+XX XXX XXX XXXX" icon={Phone} />
                <label className="block">
                  <span className="eyebrow tabular text-text-body/60 mb-2 block">Marital status</span>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
                  >
                    <option>Single</option>
                    <option>Married</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>

              <TextField label="Dependents" value={formData.dependents} onChange={(v) => setFormData({ ...formData, dependents: v })} placeholder="e.g. 2 children" />
            </div>
          </section>

          {/* Professional Trajectory */}
          <section className="bg-bg-card border border-border-main rounded-2xl p-6 md:p-7">
            <SectionHeading icon={Briefcase} eyebrow="02 · PROFILE" title="Professional trajectory" />

            <div className="space-y-4">
              <label className="block">
                <span className="eyebrow tabular text-text-body/60 mb-2 block">About me / summary</span>
                <textarea
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="Executive summary of your industry impact, focus areas, and what you bring to a terminal operation…"
                  className="w-full p-4 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-body min-h-[120px] focus:border-text-heading outline-none resize-none transition-all leading-relaxed"
                />
              </label>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow tabular text-text-body/60">AI &amp; emerging-tech proficiency</span>
                  <span className="eyebrow tabular text-accent">
                    {formData.aiSkillLevel}<span className="text-text-body/40">/10</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.aiSkillLevel}
                  onChange={(e) => setFormData({ ...formData, aiSkillLevel: parseInt(e.target.value) })}
                  className="w-full h-2 bg-bg-main rounded-full appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between mt-1.5">
                  <span className="eyebrow tabular text-text-body/40">Novice</span>
                  <span className="eyebrow tabular text-text-body/40">Expert</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="eyebrow tabular text-text-body/60">Key technical skills</span>
                  <button
                    onClick={() => handleAddField("additionalSkills")}
                    className="inline-flex items-center gap-1 eyebrow tabular text-accent hover:underline"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.75} /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.additionalSkills.map((skill: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 rounded-full eyebrow tabular pl-2.5 pr-1 py-1 group">
                      <input
                        value={skill}
                        onChange={(e) => handleUpdateListItem("additionalSkills", idx, e.target.value)}
                        className="bg-transparent border-none focus:outline-none p-0 text-inherit min-w-[60px]"
                        placeholder="Skill"
                      />
                      <button
                        onClick={() => handleRemoveField("additionalSkills", idx)}
                        className="w-4 h-4 rounded-full hover:bg-accent/20 flex items-center justify-center transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {formData.additionalSkills.length === 0 && (
                    <button onClick={() => handleAddField("additionalSkills")} className="text-[13px] text-text-body/50 italic">
                      Add your first skill…
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Career Milestones */}
        <section className="bg-bg-card border border-border-main rounded-2xl p-6 md:p-7 mb-8">
          <SectionHeading
            icon={Award}
            eyebrow="03 · EXPERIENCE"
            title="Career milestones"
            action={
              <button
                onClick={handleAddJob}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-main border border-border-main rounded-lg eyebrow tabular text-text-body hover:border-text-heading hover:text-text-heading transition-all"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                Past role
              </button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active */}
            <div className="bg-primary text-white rounded-2xl p-5 grain relative overflow-hidden">
              <div className="absolute inset-0 bp-grid pointer-events-none opacity-30" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                  <p className="eyebrow tabular text-accent">CURRENT ENGAGEMENT</p>
                </div>
                <input
                  placeholder="Job title"
                  value={formData.currentJob.title}
                  onChange={(e) => setFormData({ ...formData, currentJob: { ...formData.currentJob, title: e.target.value } })}
                  className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-[15px] text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-all"
                />
                <input
                  placeholder="Company name"
                  value={formData.currentJob.company}
                  onChange={(e) => setFormData({ ...formData, currentJob: { ...formData.currentJob, company: e.target.value } })}
                  className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-[14px] text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-all"
                />
                <input
                  placeholder="Duration (e.g. 2021 – Present)"
                  value={formData.currentJob.duration}
                  onChange={(e) => setFormData({ ...formData, currentJob: { ...formData.currentJob, duration: e.target.value } })}
                  className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-[14px] text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-all"
                />
              </div>
            </div>

            {/* Past roles */}
            <div>
              <p className="eyebrow tabular text-text-body/55 mb-3">Past engagements</p>
              <div className="space-y-2">
                {formData.pastJobs.length === 0 ? (
                  <button
                    onClick={handleAddJob}
                    className="w-full py-8 bg-bg-main border border-dashed border-border-main rounded-xl text-[13px] text-text-body/55 hover:border-text-heading hover:text-text-heading transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.75} />
                    Add a previous role
                  </button>
                ) : (
                  formData.pastJobs.map((job: any, idx: number) => (
                    <div key={idx} className="bg-bg-main border border-border-main rounded-xl p-3 flex items-center gap-2 group">
                      <div className="flex-1 grid grid-cols-3 gap-1.5">
                        <input
                          placeholder="Title"
                          value={job.title}
                          onChange={(e) => {
                            const list = [...formData.pastJobs];
                            list[idx].title = e.target.value;
                            setFormData({ ...formData, pastJobs: list });
                          }}
                          className="text-[12px] w-full bg-bg-card border border-border-main rounded-lg px-2 py-1.5 outline-none focus:border-text-heading"
                        />
                        <input
                          placeholder="Company"
                          value={job.company}
                          onChange={(e) => {
                            const list = [...formData.pastJobs];
                            list[idx].company = e.target.value;
                            setFormData({ ...formData, pastJobs: list });
                          }}
                          className="text-[12px] w-full bg-bg-card border border-border-main rounded-lg px-2 py-1.5 outline-none focus:border-text-heading"
                        />
                        <input
                          placeholder="Date"
                          value={job.duration}
                          onChange={(e) => {
                            const list = [...formData.pastJobs];
                            list[idx].duration = e.target.value;
                            setFormData({ ...formData, pastJobs: list });
                          }}
                          className="text-[12px] w-full bg-bg-card border border-border-main rounded-lg px-2 py-1.5 outline-none focus:border-text-heading"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveJob(idx)}
                        className="w-8 h-8 rounded-lg text-text-body/40 hover:text-rust hover:bg-rust/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Remove role"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Credentials */}
        <section className="bg-bg-card border border-border-main rounded-2xl p-6 md:p-7 mb-8">
          <SectionHeading icon={GraduationCap} eyebrow="04 · CREDENTIALS" title="Education &amp; certifications" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Academic
                </p>
                <button onClick={() => handleAddField("qualifications")} className="text-accent text-[11px] font-medium hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" strokeWidth={1.75} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.qualifications.length === 0 ? (
                  <p className="text-[13px] text-text-body/45 italic px-3 py-2">No qualifications added.</p>
                ) : (
                  formData.qualifications.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 group">
                      <input
                        value={item}
                        onChange={(e) => handleUpdateListItem("qualifications", idx, e.target.value)}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[13px] text-text-heading outline-none focus:border-text-heading transition-all"
                        placeholder="Degree / University"
                      />
                      <button
                        onClick={() => handleRemoveField("qualifications", idx)}
                        className="w-8 h-8 rounded-lg text-text-body/30 hover:text-rust hover:bg-rust/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Certifications
                </p>
                <button onClick={() => handleAddField("certifications")} className="text-accent text-[11px] font-medium hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" strokeWidth={1.75} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.certifications.length === 0 ? (
                  <p className="text-[13px] text-text-body/45 italic px-3 py-2">e.g. API 653, NEBOSH, ISO 9001 lead auditor</p>
                ) : (
                  formData.certifications.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 group">
                      <input
                        value={item}
                        onChange={(e) => handleUpdateListItem("certifications", idx, e.target.value)}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[13px] text-text-heading outline-none focus:border-text-heading transition-all"
                        placeholder="ISO, API, NEBOSH…"
                      />
                      <button
                        onClick={() => handleRemoveField("certifications", idx)}
                        className="w-8 h-8 rounded-lg text-text-body/30 hover:text-rust hover:bg-rust/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Additional courses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Additional courses
                </p>
                <button onClick={() => handleAddField("additionalCourses")} className="text-accent text-[11px] font-medium hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" strokeWidth={1.75} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.additionalCourses.length === 0 ? (
                  <p className="text-[13px] text-text-body/45 italic px-3 py-2">Workshops, trade shows, short courses</p>
                ) : (
                  formData.additionalCourses.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 group">
                      <input
                        value={item}
                        onChange={(e) => handleUpdateListItem("additionalCourses", idx, e.target.value)}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[13px] text-text-heading outline-none focus:border-text-heading transition-all"
                        placeholder="Course name"
                      />
                      <button
                        onClick={() => handleRemoveField("additionalCourses", idx)}
                        className="w-8 h-8 rounded-lg text-text-body/30 hover:text-rust hover:bg-rust/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Lifestyle — travel + hobbies */}
        <section className="bg-bg-card border border-border-main rounded-2xl p-6 md:p-7 mb-8">
          <SectionHeading icon={Globe} eyebrow="05 · CONTEXT" title="Global footprint &amp; interests" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Travel */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Countries travelled
                </p>
                <button onClick={() => handleAddField("countriesTravelled")} className="text-accent text-[11px] font-medium hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" strokeWidth={1.75} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.countriesTravelled.length === 0 && (
                  <p className="text-[13px] text-text-body/45 italic">No travel logged yet.</p>
                )}
                {formData.countriesTravelled.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 bg-bg-main border border-border-main rounded-full eyebrow tabular pl-2.5 pr-1 py-1 group">
                    <input
                      value={item}
                      onChange={(e) => handleUpdateListItem("countriesTravelled", idx, e.target.value)}
                      className="bg-transparent border-none focus:outline-none p-0 text-text-heading min-w-[60px]"
                      placeholder="Country"
                    />
                    <button
                      onClick={() => handleRemoveField("countriesTravelled", idx)}
                      className="w-4 h-4 rounded-full hover:bg-border-main flex items-center justify-center text-text-body/50 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Lifestyle &amp; hobbies
                </p>
                <button onClick={() => handleAddField("hobbies")} className="text-accent text-[11px] font-medium hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" strokeWidth={1.75} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.hobbies.length === 0 ? (
                  <p className="text-[13px] text-text-body/45 italic">Adds personal context for cultural fit.</p>
                ) : (
                  formData.hobbies.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 group">
                      <input
                        value={item}
                        onChange={(e) => handleUpdateListItem("hobbies", idx, e.target.value)}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[13px] text-text-heading outline-none focus:border-text-heading transition-all"
                        placeholder="e.g. Long-distance cycling"
                      />
                      <button
                        onClick={() => handleRemoveField("hobbies", idx)}
                        className="w-8 h-8 rounded-lg text-text-body/30 hover:text-rust hover:bg-rust/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-bg-card/95 backdrop-blur-md border-t border-border-main">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setFormData({ ...formData, isLocked: !formData.isLocked })}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all border ${
                formData.isLocked
                  ? "bg-rust/5 text-rust border-rust/20"
                  : "bg-accent/10 text-accent border-accent/20"
              }`}
            >
              {formData.isLocked ? <Lock className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Unlock className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {formData.isLocked ? "Private — hidden from search" : "Public — visible to verified employers"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {savedToast && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-1.5 eyebrow tabular text-accent"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                Saved
              </motion.span>
            )}
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-2.5 text-[13px] text-text-body hover:text-text-heading transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" strokeWidth={1.75} />
              )}
              {existingResumes.length > 0 ? "Update blueprint" : "Save blueprint"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
