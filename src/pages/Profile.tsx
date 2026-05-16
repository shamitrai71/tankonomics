/**
 * Profile page — redesigned to match the industrial-editorial design language
 * established in Splash, Login, Navbar and Sidebar.
 *
 * Major changes from the previous version:
 *   1. Visual language replaced throughout: warm-paper background, Instrument
 *      Serif display headings, Geist body, hi-vis safety-orange accent,
 *      paper-weight border treatment instead of heavy rounded pill cards.
 *   2. The hardcoded "Safety Lead / Project Master" badges are removed.
 *      Badges now render from `profile.badges` (the array the edit form has
 *      always written to, but the previous UI never displayed).
 *   3. Edit mode is restructured as a column of collapsible accordion
 *      sections — Identity, About, Skills, Badges, Recognition, Social,
 *      Advanced Labels. The previous one-long-form layout is gone.
 *   4. The profile photo upload Camera button is now wired up — it opens a
 *      file picker, uploads to Storage via the shared `uploadImage` helper,
 *      and updates `formData.photoURL` with the resulting URL. (Previously
 *      the button had no onClick at all.)
 *
 * What is intentionally unchanged:
 *   - The data shape (`formData`), the save flow (`handleSave`), all the
 *     Firestore hooks, the LinkedIn-import flow, the recommendation/
 *     endorsement/connection/like/follow business logic. We're rebuilding
 *     the surface, not the engine.
 */

import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../App";
import { useCollection, useCollectionGroup, updateDocument, createDocument } from "../hooks/useFirestore";
import { where, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { migrateDataUrlToStorage, isInlineImage, uploadImage } from "../lib/uploadImage";
import {
  Building2,
  Briefcase,
  Globe,
  Camera,
  Check,
  ShieldCheck,
  Award,
  Link as LinkIcon,
  Calendar,
  Clock,
  MapPin,
  Bell,
  Printer,
  Share2,
  FileText,
  MessageCircle,
  Download,
  Activity,
  Lock,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Plus,
  ChevronRight,
  ChevronDown,
  UserPlus,
  UserCheck,
  Send,
  Users,
  Heart,
  X,
  Pencil,
  Trash2,
  AtSign,
  Globe2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { collection, query, getDocs, addDoc } from "firebase/firestore";
import { useNotifications } from "../hooks/useNotifications";

/* ============================================================
   Small shared building blocks — reused across both view & edit
   ============================================================ */

function SectionHeading({ icon: Icon, eyebrow, title }: { icon?: any; eyebrow?: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {Icon && <Icon className="w-4 h-4 text-text-body/55" strokeWidth={1.75} />}
      <div>
        {eyebrow && <p className="eyebrow tabular text-text-body/45">{eyebrow}</p>}
        <h3 className="font-display text-2xl text-text-heading leading-tight">{title}</h3>
      </div>
    </div>
  );
}

function EditSection({
  title,
  description,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  icon?: any;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border-main first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 py-5 text-left group"
      >
        {Icon && (
          <span className={`w-9 h-9 rounded-xl border ${open ? "bg-text-heading border-text-heading text-bg-card" : "bg-bg-main border-border-main text-text-body"} flex items-center justify-center transition-colors`}>
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </span>
        )}
        <div className="flex-1">
          <h4 className="font-display text-xl text-text-heading leading-tight">{title}</h4>
          {description && <p className="eyebrow tabular text-text-body/55 mt-1">{description}</p>}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-text-body/40 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: any;
}) {
  return (
    <label className="block">
      <span className="eyebrow tabular text-text-body/60 mb-2 block">{label}</span>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/35" strokeWidth={1.75} />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 bg-bg-card border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 focus:border-text-heading focus:ring-4 focus:ring-text-heading/5 outline-none transition-all`}
        />
      </div>
    </label>
  );
}

function SkillsEditor({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || skills.includes(v)) return;
    onChange([...skills, v]);
    setDraft("");
  };
  return (
    <div>
      <span className="eyebrow tabular text-text-body/60 mb-2 block">Skills</span>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-bg-main border border-border-main rounded-full text-[13px] text-text-heading">
            {s}
            <button
              onClick={() => onChange(skills.filter((x) => x !== s))}
              className="w-5 h-5 rounded-full hover:bg-rust/15 hover:text-rust flex items-center justify-center text-text-body/50 transition-colors"
              aria-label={`Remove ${s}`}
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-[13px] text-text-body/50">No skills yet — add some below.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. API 653 inspection, Tank cleaning, HAZOP"
          className="flex-1 px-4 py-3 bg-bg-card border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 focus:border-text-heading outline-none"
        />
        <button
          onClick={add}
          type="button"
          className="px-4 py-3 bg-text-heading text-bg-card rounded-xl text-[13px] font-medium hover:brightness-110 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}

function BadgesEditor({
  badges,
  onChange,
}: {
  badges: { title: string; subtitle: string }[];
  onChange: (b: { title: string; subtitle: string }[]) => void;
}) {
  const update = (i: number, key: "title" | "subtitle", v: string) => {
    onChange(badges.map((b, idx) => (idx === i ? { ...b, [key]: v } : b)));
  };
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="eyebrow tabular text-text-body/60">Industry certifications & achievements</span>
        <span className="eyebrow tabular text-text-body/40">{badges.length} added</span>
      </div>
      <div className="space-y-2">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-bg-main rounded-xl border border-border-main">
            <Award className="w-4 h-4 text-accent ml-2 shrink-0" strokeWidth={1.75} />
            <input
              type="text"
              value={b.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="Badge title (e.g. API 653)"
              className="flex-1 min-w-0 px-2 py-2 bg-transparent text-[14px] text-text-heading placeholder:text-text-body/40 focus:outline-none"
            />
            <input
              type="text"
              value={b.subtitle}
              onChange={(e) => update(i, "subtitle", e.target.value)}
              placeholder="Subtitle (e.g. Certified 2023)"
              className="flex-1 min-w-0 px-2 py-2 bg-transparent text-[13px] text-text-body placeholder:text-text-body/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(badges.filter((_, idx) => idx !== i))}
              className="w-8 h-8 rounded-lg hover:bg-rust/15 hover:text-rust flex items-center justify-center text-text-body/50 shrink-0"
              aria-label="Remove badge"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...badges, { title: "", subtitle: "" }])}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-main rounded-xl text-[13px] font-medium text-text-heading hover:border-text-heading transition-colors"
      >
        <Plus className="w-4 h-4" /> Add a badge
      </button>
    </div>
  );
}

/* ============================================================
   Auxiliary panels — UpcomingEvents, ConnectionsList, SavedJobs
   ============================================================ */

function UpcomingEvents({ profile }: { profile: any }) {
  const { user } = useAuth();
  const { data: reminders } = useCollection<any>("event_reminders", [where("userUid", "==", user?.uid || "")]);
  if (reminders.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-border-main">
      <SectionHeading
        icon={Calendar}
        eyebrow="Upcoming"
        title={profile?.profileLabels?.technicalScheduleHeading || "My Technical Schedule"}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reminders.map((rem: any) => (
          <div key={rem.id} className="bg-bg-card border border-border-main p-5 rounded-2xl hover:border-text-heading transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-bg-main border border-border-main rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="eyebrow tabular text-text-body/60">{format(new Date(rem.eventDate), "MMM")}</span>
                <span className="font-display text-2xl text-text-heading leading-none tabular">
                  {format(new Date(rem.eventDate), "dd")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-medium text-text-heading line-clamp-2 group-hover:text-accent transition-colors">
                  {rem.eventName}
                </h4>
                <div className="flex items-center gap-3 mt-2 eyebrow tabular text-text-body/55">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.75} /> Session sync
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" strokeWidth={1.75} /> Logistics
                  </span>
                </div>
              </div>
              <Bell className="w-4 h-4 text-accent soft-pulse shrink-0" strokeWidth={1.75} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 px-5 py-4 bg-bg-card border border-border-main rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 bg-bg-main border border-border-main rounded-lg flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-text-heading" strokeWidth={1.75} />
        </div>
        <p className="text-[13px] text-text-body leading-relaxed">
          Email reminders are synchronised — you'll receive a technical brief 24 hours before each session.
        </p>
      </div>
    </section>
  );
}

function ConnectionsList({ targetUid }: { targetUid: string }) {
  const { data: connections } = useCollection<any>("connections", [where("userIds", "array-contains", targetUid || "")]);
  const acceptedConnections = connections.filter((c) => c.status === "accepted");
  const [connectionProfiles, setConnectionProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const profiles: any[] = [];
      for (const conn of acceptedConnections) {
        const otherId = conn.userIds.find((id: string) => id !== targetUid);
        if (otherId) {
          const docSnap = await getDoc(doc(db, "users", otherId));
          if (docSnap.exists()) profiles.push({ ...docSnap.data(), id: docSnap.id });
        }
      }
      setConnectionProfiles(profiles);
      setLoading(false);
    };
    if (acceptedConnections.length > 0) fetchProfiles();
    else setLoading(false);
  }, [acceptedConnections.length, targetUid]);

  if (loading)
    return (
      <div className="h-20 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-text-heading border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (connectionProfiles.length === 0)
    return (
      <div className="p-8 text-center bg-bg-main rounded-2xl border border-dashed border-border-main">
        <Users className="w-7 h-7 text-text-body/30 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-[13px] text-text-body/55">No connections yet.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {connectionProfiles.map((p) => (
        <Link key={p.id} to={`/profile/${p.id}`} className="group">
          <div className="bg-bg-main border border-border-main rounded-xl p-3 flex flex-col items-center text-center hover:border-text-heading transition-all">
            <img
              src={p.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${p.displayName}`}
              className="w-12 h-12 rounded-lg mb-2 object-cover border border-border-main"
              alt=""
            />
            <p className="text-[12px] font-medium text-text-heading line-clamp-1">{p.displayName}</p>
            <p className="text-[10px] text-text-body/55 line-clamp-1 mt-0.5">{p.jobTitle || "Member"}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SavedJobs({ profile, isOwner }: { profile: any; isOwner: boolean }) {
  const savedJobIds = profile?.savedJobs || [];
  const { data: allJobs } = useCollection<any>("jobs");
  const savedJobs = allJobs.filter((j) => savedJobIds.includes(j.id));
  if (!isOwner || savedJobIds.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-border-main">
      <SectionHeading icon={Heart} eyebrow="Saved" title="Opportunities you bookmarked" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {savedJobs.map((job: any) => (
          <Link
            to="/jobs"
            key={job.id}
            className="bg-bg-card border border-border-main p-4 rounded-2xl hover:border-text-heading transition-all flex items-center gap-3 group"
          >
            <div className="w-11 h-11 bg-bg-main rounded-lg flex items-center justify-center border border-border-main overflow-hidden shrink-0">
              <img
                src={job.companyLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"}
                className="w-full h-full object-contain p-1.5"
                alt=""
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-[14px] font-medium text-text-heading line-clamp-1">{job.title}</h4>
              <p className="eyebrow tabular text-text-body/55 mt-0.5">{job.companyName}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-body/35 group-hover:text-text-heading group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Profile page
   ============================================================ */

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const { createNotification } = useNotifications();
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { data: companies } = useCollection<any>("companies", [where("isClaimed", "==", true)]);
  const [editing, setEditing] = useState(false);

  const targetId = id || user?.uid;
  const { data: endorsements } = useCollection<any>("endorsements", [where("targetUid", "==", targetId || "")]);
  const { data: recommendations } = useCollection<any>("recommendations", [where("targetUid", "==", targetId || "")]);
  const { data: myConnections } = useCollection<any>("connections", [where("userIds", "array-contains", user?.uid || "")]);
  const { data: targetConnections } = useCollection<any>("connections", [where("userIds", "array-contains", targetId || "")]);
  const { data: follows } = useCollection<any>("follows", [where("targetId", "==", targetId || ""), where("targetType", "==", "member")]);
  const { data: likes } = useCollection<any>("likes", [where("targetId", "==", targetId || ""), where("targetType", "==", "member")]);
  const { data: ownerResumes } = useCollection<any>("resumes", [where("userUid", "==", user?.uid || "")]);
  const hasResume = ownerResumes.length > 0;
  const ownerResume = ownerResumes[0];

  const isFollowing = follows.some((f: any) => f.followerId === user?.uid);
  const isLiked = likes.some((l: any) => l.likerId === user?.uid);

  const connection = myConnections.find((c) => c.userIds.includes(targetId));
  const isConnected = connection?.status === "accepted";
  const isPending = connection?.status === "pending";
  const isRequester = connection?.requesterId === user?.uid;

  const [mutualConnections, setMutualConnections] = useState<string[]>([]);
  const [degree, setDegree] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [messageloading, setMessageLoading] = useState(false);
  const [engagementLoading, setEngagementLoading] = useState(false);

  const isOwner = user?.uid === targetId;
  const profile = isOwner ? currentUserProfile : viewedProfile;

  const handleFollow = async () => {
    if (!user || !targetId || engagementLoading || isOwner) return;
    setEngagementLoading(true);
    try {
      if (isFollowing) {
        const follow = follows.find((f: any) => f.followerId === user.uid);
        if (follow) {
          const { deleteDoc: firestoreDelete, doc: firestoreDoc } = await import("firebase/firestore");
          await firestoreDelete(firestoreDoc(db, "follows", follow.id));
        }
      } else {
        await createDocument("follows", {
          followerId: user.uid,
          targetId,
          targetType: "member",
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEngagementLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !targetId || engagementLoading || isOwner) return;
    setEngagementLoading(true);
    try {
      if (isLiked) {
        const like = likes.find((l: any) => l.likerId === user.uid);
        if (like) {
          const { deleteDoc: firestoreDelete, doc: firestoreDoc } = await import("firebase/firestore");
          await firestoreDelete(firestoreDoc(db, "likes", like.id));
        }
      } else {
        await createDocument("likes", {
          likerId: user.uid,
          targetId,
          targetType: "member",
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEngagementLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !targetId || user.uid === targetId) {
      setDegree(null);
      return;
    }
    if (isConnected) {
      setDegree(1);
    } else {
      const myAccepted = myConnections.filter((c) => c.status === "accepted").map((c) => c.userIds.find((id: string) => id !== user.uid));
      const targetAccepted = targetConnections.filter((c) => c.status === "accepted").map((c) => c.userIds.find((id: string) => id !== targetId));
      const mutual = myAccepted.filter((id) => targetAccepted.includes(id));
      setMutualConnections(mutual.filter((id): id is string => !!id));
      setDegree(mutual.length > 0 ? 2 : 3);
    }
  }, [user, targetId, myConnections, targetConnections, isConnected]);

  const [formData, setFormData] = useState<any>({
    displayName: "",
    photoURL: "",
    jobTitle: "",
    company: "",
    companyId: "",
    industrySegment: "",
    bio: "",
    isPro: false,
    isPublic: false,
    skills: [] as string[],
    badges: [] as { title: string; subtitle: string }[],
    savedJobs: [] as string[],
    aiUsage: undefined as any,
    profileLabels: {
      summaryHeading: "Professional Summary",
      experienceHeading: "Update Experience",
      skillsHeading: "Industry Skills & Endorsements",
      recommendationsHeading: "Professional Recommendations",
      badgesHeading: "Industry Certification & Badges",
      activityHeading: "Network Activity",
      technicalScheduleHeading: "My Technical Schedule",
    },
    socialLinks: { linkedin: "", twitter: "", facebook: "", instagram: "", website: "" },
  });

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [importingLinkedin, setImportingLinkedin] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith(".run.app") && !event.origin.includes("localhost")) return;
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setImportingLinkedin(false);
        const ld = event.data.payload;
        setFormData((prev: any) => ({
          ...prev,
          displayName: ld.name || prev.displayName,
          jobTitle: ld.jobTitle !== "Imported from LinkedIn" ? ld.jobTitle : prev.jobTitle,
          company: ld.company !== "Imported from LinkedIn" ? ld.company : prev.company,
          socialLinks: { ...prev.socialLinks, linkedin: `https://www.linkedin.com/in/${ld.linkedinId}/` },
        }));
        alert("LinkedIn profile data imported. Review and save to apply.");
      }
      if (event.data?.type === "OAUTH_AUTH_ERROR") {
        setImportingLinkedin(false);
        alert(`LinkedIn Import Error: ${event.data.error}`);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleLinkedInImport = async () => {
    setImportingLinkedin(true);
    try {
      const response = await fetch("/api/auth/linkedin/url");
      const { url } = await response.json();
      const width = 600, height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      window.open(url, "linkedin_oauth", `width=${width},height=${height},top=${top},left=${left}`);
    } catch (err) {
      console.error("Failed to start LinkedIn import:", err);
      setImportingLinkedin(false);
    }
  };

  const behavioralTraits = [
    "Adaptability", "Collaboration", "Communication", "Conflict Resolution",
    "Critical Thinking", "Emotional Intelligence", "Empathy", "Leadership",
    "Patience", "Problem Solving", "Public Speaking", "Teamwork",
    "Work Ethic", "Integrity", "Respectfulness", "Accountability",
    "Active Listening", "Constructive Feedback", "Cooperation",
    "Inclusivity", "Open-mindedness", "Reliability", "Shared Responsibility",
  ].sort();

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      if (!targetId) return;
      try {
        const docRef = doc(db, "users", targetId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setViewedProfile(profileData);
          setPermissionError(false);
          if (targetId === user?.uid) {
            setFormData({
              displayName: profileData.displayName || "",
              photoURL: profileData.photoURL || "",
              jobTitle: profileData.jobTitle || "",
              company: profileData.company || "",
              companyId: profileData.companyId || "",
              industrySegment: profileData.industrySegment || "",
              bio: profileData.bio || "",
              isPro: profileData.isPro || false,
              isPublic: profileData.isPublic || false,
              skills: profileData.skills || [],
              badges: profileData.badges || [],
              savedJobs: profileData.savedJobs || [],
              aiUsage: profileData.aiUsage,
              profileLabels: {
                summaryHeading: profileData.profileLabels?.summaryHeading || "Professional Summary",
                experienceHeading: profileData.profileLabels?.experienceHeading || "Update Experience",
                skillsHeading: profileData.profileLabels?.skillsHeading || "Industry Skills & Endorsements",
                recommendationsHeading: profileData.profileLabels?.recommendationsHeading || "Professional Recommendations",
                badgesHeading: profileData.profileLabels?.badgesHeading || "Industry Certification & Badges",
                activityHeading: profileData.profileLabels?.activityHeading || "Network Activity",
                technicalScheduleHeading: profileData.profileLabels?.technicalScheduleHeading || "My Technical Schedule",
              },
              socialLinks: {
                linkedin: profileData.socialLinks?.linkedin || "",
                twitter: profileData.socialLinks?.twitter || "",
                facebook: profileData.socialLinks?.facebook || "",
                instagram: profileData.socialLinks?.instagram || "",
                website: profileData.socialLinks?.website || "",
              },
            });
          }
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        if (err.code === "permission-denied" || err.message?.includes("permission")) {
          setPermissionError(true);
        }
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [targetId, user?.uid]);

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large (max 10 MB).");
      return;
    }
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, { folder: "profile" });
      setFormData((prev: any) => ({ ...prev, photoURL: url }));
    } catch (err: any) {
      alert(`Photo upload failed: ${err?.message || err}`);
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!user?.uid) {
      alert("You must be signed in to update your profile.");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      let safePhotoURL = formData.photoURL || "";
      if (isInlineImage(safePhotoURL)) {
        try {
          safePhotoURL = await migrateDataUrlToStorage(safePhotoURL, "profile");
        } catch (err: any) {
          throw new Error(`Couldn't move profile photo to storage: ${err?.message || err}.`);
        }
      }
      const allowedProfileUpdate: any = {
        uid: user.uid,
        email: user.email || "",
        displayName: (formData.displayName || "").trim(),
        photoURL: safePhotoURL,
        bio: formData.bio || "",
        industrySegment: formData.industrySegment || "",
        company: formData.company || "",
        companyId: formData.companyId || "",
        jobTitle: formData.jobTitle || "",
        isPro: !!formData.isPro,
        isPublic: !!formData.isPublic,
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        badges: Array.isArray(formData.badges) ? formData.badges.filter((b: any) => b.title?.trim()) : [],
        savedJobs: Array.isArray(formData.savedJobs) ? formData.savedJobs : [],
        profileLabels: formData.profileLabels || {},
        socialLinks: {
          linkedin: formData.socialLinks?.linkedin || "",
          twitter: formData.socialLinks?.twitter || "",
          facebook: formData.socialLinks?.facebook || "",
          instagram: formData.socialLinks?.instagram || "",
          website: formData.socialLinks?.website || "",
        },
        updatedAt: serverTimestamp(),
      };
      if (formData.aiUsage && typeof formData.aiUsage === "object") {
        allowedProfileUpdate.aiUsage = formData.aiUsage;
      }
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, allowedProfileUpdate, { merge: true });
      setEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      alert(`Profile save failed: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const [recoTraits, setRecoTraits] = useState<string[]>([]);
  const [recoComment, setRecoComment] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);

  const handleAddRecommendation = async () => {
    if (!user || !targetId || recoTraits.length === 0) return;
    setIsRecommending(true);
    try {
      await createDocument("recommendations", {
        targetUid: targetId,
        recommenderUid: user.uid,
        recommenderName: user.displayName,
        recommenderPhoto: user.photoURL,
        traits: recoTraits,
        comment: recoComment,
        createdAt: serverTimestamp(),
      });
      setRecoTraits([]);
      setRecoComment("");
    } catch (err) {
      console.error("Error adding recommendation:", err);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleEndorseSkill = async (skill: string) => {
    if (!user || !targetId || isOwner) return;
    const already = endorsements.some((e) => e.skill === skill && e.endorserUid === user.uid);
    if (already) return;
    try {
      await createDocument("endorsements", {
        targetUid: targetId,
        endorserUid: user.uid,
        endorserName: user.displayName,
        skill,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error endorsing skill:", err);
    }
  };

  const handleConnect = async () => {
    if (!user || !targetId || isOwner || connecting) return;
    setConnecting(true);
    try {
      if (!connection) {
        const newConn = await createDocument("connections", {
          userIds: [user.uid, targetId].sort(),
          status: "pending",
          requesterId: user.uid,
          createdAt: serverTimestamp(),
        });
        if (newConn) {
          await createNotification(
            targetId,
            "New connection request",
            `${user.displayName} wants to connect.`,
            "connection",
            `/profile/${user.uid}`,
            { connectionId: newConn.id },
          );
        }
      } else if (isPending && !isRequester) {
        await updateDocument("connections", connection.id, { status: "accepted" });
        await createNotification(
          targetId,
          "Connection accepted",
          `${user.displayName} accepted your request.`,
          "connection",
          `/profile/${user.uid}`,
        );
      }
    } catch (err) {
      console.error("Error connecting:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (!user || !targetId || isOwner || messageloading) return;
    if (!currentUserProfile?.isPro) {
      alert("Messaging is a Pro feature. Upgrade to start direct conversations.");
      return;
    }
    if (!isConnected) {
      alert("You can only message connections.");
      return;
    }
    setMessageLoading(true);
    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participants", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);
      const existingChat = querySnapshot.docs.find((d) => d.data().participants.includes(targetId));
      if (existingChat) {
        navigate(`/messages/${existingChat.id}`);
      } else {
        const newChat = await addDoc(chatsRef, {
          participants: [user.uid, targetId].sort(),
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
        });
        navigate(`/messages/${newChat.id}`);
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    } finally {
      setMessageLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleWhatsApp = () => {
    const text = `Check out this profile on Tankonomics: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };
  const handleExportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(22);
    pdf.text(profile?.displayName || "Profile", 20, 30);
    pdf.setFontSize(12);
    pdf.text(profile?.jobTitle || "", 20, 40);
    pdf.text(profile?.company || "", 20, 48);
    if (profile?.bio) {
      pdf.setFontSize(11);
      const wrap = pdf.splitTextToSize(profile.bio, 170);
      pdf.text(wrap, 20, 64);
    }
    pdf.save(`${(profile?.displayName || "profile").replace(/\s+/g, "_")}.pdf`);
  };
  const handleExportXLSX = () => {
    const rows: any[] = [
      { Field: "Name", Value: profile?.displayName || "" },
      { Field: "Job Title", Value: profile?.jobTitle || "" },
      { Field: "Company", Value: profile?.company || "" },
      { Field: "Industry Segment", Value: profile?.industrySegment || "" },
      { Field: "Bio", Value: profile?.bio || "" },
      { Field: "Email", Value: profile?.email || "" },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profile");
    XLSX.writeFile(wb, `${(profile?.displayName || "profile").replace(/\s+/g, "_")}.xlsx`);
  };

  /* ---------------- Early-exit states ---------------- */
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-text-heading border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="w-16 h-16 bg-bg-card border border-border-main rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-heading">
            <Lock className="w-7 h-7" strokeWidth={1.75} />
          </div>
          <div className="eyebrow tabular text-accent mb-2">403 · PRIVATE PROFILE</div>
          <h2 className="font-display text-4xl text-text-heading mb-3">Not visible</h2>
          <p className="text-text-body mb-8">This profile is set to private and is only visible to its owner or platform administrators.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all">
            Back to the network
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <Activity className="w-12 h-12 text-text-body/30 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-display text-3xl text-text-heading mb-2">Profile not found</h2>
          <p className="text-text-body mb-6">This profile doesn't exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium">
            Back to the network
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pb-24">
      {/* Save toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-text-heading text-bg-card px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-[14px] font-medium">Profile updated</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for the photo picker */}
      {isOwner && (
        <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoPick} className="hidden" />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        {/* ======================= HEADER ======================= */}
        <header className="relative">
          <div className="absolute inset-x-0 top-0 h-44 bp-grid-paper opacity-70 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-end">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={
                  (editing ? formData.photoURL : profile?.photoURL) ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || "T"}`
                }
                alt={profile?.displayName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border border-border-main bg-bg-card object-cover shadow-xl"
              />
              {isOwner && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-11 h-11 bg-text-heading text-bg-card rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                  title="Change photo"
                  aria-label="Change profile photo"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              )}
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-bg-main" title="Verified" />
            </div>

            {/* Name + role chips + counters */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="eyebrow tabular text-accent mb-2 inline-flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                {isOwner ? "YOUR PROFILE" : `MEMBER #${(targetId || "").slice(0, 6).toUpperCase()}`}
              </div>
              <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] text-text-heading leading-[0.98] mb-3">
                {profile?.displayName || "Unnamed Member"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {profile?.jobTitle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border-main rounded-full text-[13px] text-text-heading">
                    <Briefcase className="w-3.5 h-3.5 text-text-body/60" strokeWidth={1.75} />
                    {profile.jobTitle}
                  </span>
                )}
                {profile?.company && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border-main rounded-full text-[13px] text-text-heading">
                    <Building2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                    {profile.company}
                  </span>
                )}
                {profile?.industrySegment && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border-main rounded-full text-[13px] text-text-heading">
                    <Globe2 className="w-3.5 h-3.5 text-blueprint" strokeWidth={1.75} />
                    {profile.industrySegment}
                  </span>
                )}
                {profile?.isPro && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-text-heading text-bg-card rounded-full eyebrow tabular">
                    <Sparkles className="w-3 h-3" strokeWidth={2} />
                    Pro
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-px mt-6 max-w-md mx-auto sm:mx-0 bg-border-main border border-border-main rounded-xl overflow-hidden">
                {[
                  { label: "Connections", value: myConnections.filter((c) => c.status === "accepted" && c.userIds.includes(targetId)).length },
                  { label: "Followers", value: follows.length },
                  { label: "Likes", value: likes.length },
                ].map((s) => (
                  <div key={s.label} className="bg-bg-card px-4 py-3 text-center">
                    <div className="font-display text-2xl text-text-heading tabular">{s.value}</div>
                    <div className="eyebrow tabular text-text-body/55 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[200px]">
              {isOwner ? (
                <>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={1.75} />
                      Edit profile
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                          Save changes
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleLinkedInImport}
                    disabled={importingLinkedin}
                    className="inline-flex items-center justify-center gap-2 bg-bg-card border border-border-main text-text-heading px-5 py-3 rounded-xl text-[13px] font-medium hover:border-text-heading transition-all disabled:opacity-60"
                  >
                    <Linkedin className="w-4 h-4" strokeWidth={1.75} />
                    {importingLinkedin ? "Syncing…" : "Sync from LinkedIn"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-60 ${
                      isConnected ? "bg-bg-card border border-border-main text-text-heading" : "bg-text-heading text-bg-card hover:brightness-110"
                    }`}
                  >
                    {isConnected ? <UserCheck className="w-4 h-4" strokeWidth={1.75} /> : <UserPlus className="w-4 h-4" strokeWidth={1.75} />}
                    {isConnected ? "Connected" : isPending ? (isRequester ? "Request sent" : "Accept request") : "Connect"}
                  </button>
                  <button
                    onClick={handleMessage}
                    disabled={messageloading}
                    className="inline-flex items-center justify-center gap-2 bg-bg-card border border-border-main text-text-heading px-5 py-3 rounded-xl text-[13px] font-medium hover:border-text-heading transition-all"
                  >
                    <Send className="w-4 h-4" strokeWidth={1.75} />
                    Message
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFollow}
                      disabled={engagementLoading}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                        isFollowing ? "bg-bg-main border border-border-main text-text-heading" : "bg-bg-card border border-border-main text-text-body hover:border-text-heading"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <button
                      onClick={handleLike}
                      disabled={engagementLoading}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                        isLiked ? "bg-rust/10 border border-rust/30 text-rust" : "bg-bg-card border border-border-main text-text-body hover:border-text-heading"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} strokeWidth={1.75} />
                      {isLiked ? "Liked" : "Like"}
                    </button>
                  </div>
                </>
              )}
              {!isOwner && degree && (
                <p className="eyebrow tabular text-text-body/55 text-center mt-1">
                  {degree === 1 ? "1ST · DIRECT" : degree === 2 ? `2ND · ${mutualConnections.length} MUTUAL` : "3RD+"}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* ======================= MAIN COLUMNS ======================= */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
          {/* Left column — profile body */}
          <main>
            {editing && isOwner ? (
              <div className="bg-bg-card border border-border-main rounded-2xl px-6">
                <div className="py-6 border-b border-border-main flex items-baseline justify-between">
                  <div>
                    <p className="eyebrow tabular text-accent">EDIT MODE</p>
                    <h2 className="font-display text-3xl text-text-heading mt-1">Refine your profile</h2>
                  </div>
                  <button onClick={() => setEditing(false)} className="text-[13px] text-text-body hover:text-text-heading transition-colors">
                    Cancel
                  </button>
                </div>

                <EditSection title="Identity" description="Name, role, company" icon={Briefcase} defaultOpen>
                  <FieldInput label="Display name" value={formData.displayName} onChange={(v) => setFormData({ ...formData, displayName: v })} placeholder="Your full name" />
                  <FieldInput label="Job title" value={formData.jobTitle} onChange={(v) => setFormData({ ...formData, jobTitle: v })} placeholder="e.g. Terminal Operations Manager" icon={Briefcase} />
                  <FieldInput label="Industry segment" value={formData.industrySegment} onChange={(v) => setFormData({ ...formData, industrySegment: v })} placeholder="e.g. LNG · Crude oil · Chemicals" icon={Globe2} />
                  <FieldInput label="Company name" value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} placeholder="Free-text company name" icon={Building2} />
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Verified business (optional)</span>
                    <select
                      value={formData.companyId || ""}
                      onChange={(e) => {
                        const c = companies.find((co: any) => co.id === e.target.value);
                        setFormData({ ...formData, companyId: e.target.value, company: c?.name || formData.company });
                      }}
                      className="w-full px-4 py-3 bg-bg-card border border-border-main rounded-xl text-[15px] text-text-heading focus:border-text-heading outline-none"
                    >
                      <option value="">— None —</option>
                      {companies.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                </EditSection>

                <EditSection title="About" description="Professional summary" icon={FileText}>
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Bio</span>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={6}
                      maxLength={5000}
                      placeholder="Brief summary of your work, sector focus, and what you're known for."
                      className="w-full px-4 py-3 bg-bg-card border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 focus:border-text-heading outline-none resize-y"
                    />
                    <p className="eyebrow tabular text-text-body/40 text-right mt-2">{formData.bio.length} / 5000</p>
                  </label>
                </EditSection>

                <EditSection title="Skills" description="Industry skills others can endorse" icon={Sparkles}>
                  <SkillsEditor skills={formData.skills} onChange={(s) => setFormData({ ...formData, skills: s })} />
                </EditSection>

                <EditSection title="Badges" description="Certifications & achievements" icon={Award}>
                  <BadgesEditor badges={formData.badges} onChange={(b) => setFormData({ ...formData, badges: b })} />
                </EditSection>

                <EditSection title="Recognition" description="Pro tier & visibility" icon={ShieldCheck}>
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-bg-main rounded-xl border border-border-main">
                    <input
                      type="checkbox"
                      checked={!!formData.isPro}
                      onChange={(e) => setFormData({ ...formData, isPro: e.target.checked })}
                      className="mt-1 w-4 h-4 accent-accent"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-text-heading">Premium identity</p>
                      <p className="text-[12px] text-text-body/70 mt-0.5">Unlocks AI technical insights and direct messaging.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-bg-main rounded-xl border border-border-main">
                    <input
                      type="checkbox"
                      checked={!!formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="mt-1 w-4 h-4 accent-accent"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-text-heading">Public profile</p>
                      <p className="text-[12px] text-text-body/70 mt-0.5">Visible to non-connections in the directory.</p>
                    </div>
                  </label>
                </EditSection>

                <EditSection title="Social profiles" description="External links" icon={LinkIcon}>
                  <FieldInput label="LinkedIn URL" value={formData.socialLinks.linkedin} onChange={(v) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: v } })} placeholder="https://linkedin.com/in/…" icon={Linkedin} />
                  <FieldInput label="Twitter / X URL" value={formData.socialLinks.twitter} onChange={(v) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: v } })} placeholder="https://x.com/…" icon={Twitter} />
                  <FieldInput label="Facebook URL" value={formData.socialLinks.facebook} onChange={(v) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: v } })} placeholder="https://facebook.com/…" icon={Facebook} />
                  <FieldInput label="Instagram URL" value={formData.socialLinks.instagram} onChange={(v) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: v } })} placeholder="https://instagram.com/…" icon={Instagram} />
                  <FieldInput label="Personal website" value={formData.socialLinks.website} onChange={(v) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: v } })} placeholder="https://…" icon={Globe} />
                </EditSection>

                <EditSection title="Advanced" description="Rename your profile sections" icon={AtSign}>
                  <p className="text-[12px] text-text-body/70 mb-3">
                    Optional. Change the headings shown on your public profile.
                  </p>
                  <FieldInput label="Summary heading" value={formData.profileLabels.summaryHeading} onChange={(v) => setFormData({ ...formData, profileLabels: { ...formData.profileLabels, summaryHeading: v } })} />
                  <FieldInput label="Skills heading" value={formData.profileLabels.skillsHeading} onChange={(v) => setFormData({ ...formData, profileLabels: { ...formData.profileLabels, skillsHeading: v } })} />
                  <FieldInput label="Recommendations heading" value={formData.profileLabels.recommendationsHeading} onChange={(v) => setFormData({ ...formData, profileLabels: { ...formData.profileLabels, recommendationsHeading: v } })} />
                  <FieldInput label="Badges heading" value={formData.profileLabels.badgesHeading} onChange={(v) => setFormData({ ...formData, profileLabels: { ...formData.profileLabels, badgesHeading: v } })} />
                  <FieldInput label="Activity heading" value={formData.profileLabels.activityHeading} onChange={(v) => setFormData({ ...formData, profileLabels: { ...formData.profileLabels, activityHeading: v } })} />
                  <FieldInput label="Technical schedule heading" value={formData.profileLabels.technicalScheduleHeading} onChange={(v) => setFormData({ ...formData, profileLabels: { ...formData.profileLabels, technicalScheduleHeading: v } })} />
                </EditSection>

                <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-bg-card border-t border-border-main flex items-center justify-between gap-3">
                  <button onClick={() => setEditing(false)} className="text-[13px] text-text-body hover:text-text-heading">
                    Discard changes
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                        Save profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <section className="bg-bg-card border border-border-main rounded-2xl p-8">
                  <SectionHeading icon={FileText} eyebrow="01 · ABOUT" title={profile?.profileLabels?.summaryHeading || "Professional Summary"} />
                  {profile?.bio ? (
                    <p className="text-[15px] text-text-body leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                  ) : (
                    <p className="text-[14px] text-text-body/50 italic">No summary yet.</p>
                  )}
                </section>

                <section className="mt-8 bg-bg-card border border-border-main rounded-2xl p-8">
                  <SectionHeading icon={Sparkles} eyebrow="02 · SKILLS" title={profile?.profileLabels?.skillsHeading || "Industry Skills & Endorsements"} />
                  {(profile?.skills || []).length === 0 ? (
                    <p className="text-[14px] text-text-body/50 italic">No skills listed yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string) => {
                        const count = endorsements.filter((e) => e.skill === skill).length;
                        const youHave = endorsements.some((e) => e.skill === skill && e.endorserUid === user?.uid);
                        return (
                          <button
                            key={skill}
                            onClick={() => handleEndorseSkill(skill)}
                            disabled={isOwner || youHave}
                            className={`inline-flex items-center gap-2 pl-4 pr-2.5 py-2 rounded-full border text-[13px] transition-all ${
                              youHave
                                ? "bg-accent/10 border-accent/30 text-accent"
                                : "bg-bg-main border-border-main text-text-heading hover:border-text-heading"
                            } ${isOwner ? "cursor-default" : ""}`}
                            title={isOwner ? "Your skill" : youHave ? "Already endorsed" : "Endorse"}
                          >
                            <span>{skill}</span>
                            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-mono tabular rounded-full ${youHave ? "bg-accent text-white" : "bg-bg-card border border-border-main"}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                {(profile?.badges || []).length > 0 && (
                  <section className="mt-8 bg-bg-card border border-border-main rounded-2xl p-8">
                    <SectionHeading icon={Award} eyebrow="03 · CERTIFICATIONS" title={profile?.profileLabels?.badgesHeading || "Industry Certification & Badges"} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.badges.map((b: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-bg-main border border-border-main rounded-xl">
                          <div className="w-11 h-11 rounded-lg bg-text-heading text-bg-card flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium text-text-heading truncate">{b.title}</p>
                            {b.subtitle && <p className="eyebrow tabular text-text-body/60 mt-0.5">{b.subtitle}</p>}
                          </div>
                          <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="mt-8 bg-bg-card border border-border-main rounded-2xl p-8">
                  <SectionHeading icon={MessageCircle} eyebrow="04 · RECOGNITION" title={profile?.profileLabels?.recommendationsHeading || "Professional Recommendations"} />
                  {recommendations.length === 0 ? (
                    <p className="text-[14px] text-text-body/50 italic">No recommendations yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((r: any) => (
                        <div key={r.id} className="p-4 bg-bg-main border border-border-main rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <img src={r.recommenderPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${r.recommenderName}`} className="w-9 h-9 rounded-lg object-cover" alt="" />
                            <div>
                              <p className="text-[13px] font-medium text-text-heading">{r.recommenderName}</p>
                              <p className="eyebrow tabular text-text-body/55">recommended this member</p>
                            </div>
                          </div>
                          {(r.traits || []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {r.traits.map((t: string) => (
                                <span key={t} className="px-2.5 py-1 bg-bg-card border border-border-main rounded-full text-[11px] text-text-heading">{t}</span>
                              ))}
                            </div>
                          )}
                          {r.comment && <p className="text-[13px] text-text-body leading-relaxed">"{r.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isOwner && user && (
                    <div className="mt-5 pt-5 border-t border-border-main">
                      <p className="eyebrow tabular text-text-body/55 mb-3">Leave a recommendation</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {behavioralTraits.map((t) => (
                          <button
                            key={t}
                            onClick={() => setRecoTraits((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
                            className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                              recoTraits.includes(t) ? "bg-text-heading text-bg-card border-text-heading" : "bg-bg-main border-border-main text-text-body hover:border-text-heading"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={recoComment}
                        onChange={(e) => setRecoComment(e.target.value)}
                        placeholder="A short note…"
                        rows={2}
                        className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] focus:border-text-heading outline-none mb-3"
                      />
                      <button
                        onClick={handleAddRecommendation}
                        disabled={isRecommending || recoTraits.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-text-heading text-bg-card rounded-xl text-[13px] font-medium hover:brightness-110 disabled:opacity-50"
                      >
                        Submit recommendation
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </section>

                <UpcomingEvents profile={profile} />
                <SavedJobs profile={profile} isOwner={isOwner} />
              </>
            )}
          </main>

          {/* RIGHT RAIL */}
          <aside className="space-y-6">
            <div className="bg-bg-card border border-border-main rounded-2xl p-6">
              <p className="eyebrow tabular text-text-body/55 mb-4">{profile?.profileLabels?.activityHeading || "Network Activity"}</p>
              <NetworkActivityPanel targetUid={targetId || ""} />
            </div>

            {isOwner && (
              <div className="bg-bg-card border border-border-main rounded-2xl p-6">
                <p className="eyebrow tabular text-text-body/55 mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Technical Usage
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-3xl text-text-heading tabular">{profile?.aiUsage?.monthly || 0}</span>
                  <span className="eyebrow tabular text-text-body/55">/ 10 monthly tokens</span>
                </div>
                <div className="w-full h-1.5 bg-bg-main rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, ((profile?.aiUsage?.monthly || 0) / 10) * 100)}%` }} />
                </div>
                <p className="eyebrow tabular text-text-body/45 mt-3">Limits reset monthly</p>
              </div>
            )}

            {/* Career Blueprint — the entry point into CreateResume */}
            {isOwner && (
              <div className="bg-bg-card border border-border-main rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -top-3 -right-3 w-20 h-20 opacity-[0.07] pointer-events-none">
                  <FileText className="w-full h-full text-accent" strokeWidth={1} />
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <p className="eyebrow tabular text-text-body/55 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                      Career blueprint
                    </p>
                    {hasResume ? (
                      <span className="inline-flex items-center gap-1 eyebrow tabular bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 eyebrow tabular bg-bg-main text-text-body/55 border border-border-main px-1.5 py-0.5 rounded">
                        Not built
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl text-text-heading mb-2 leading-tight">
                    {hasResume ? "Refine your blueprint" : "Get discovered by employers"}
                  </h3>
                  <p className="text-[13px] text-text-body leading-relaxed mb-4">
                    {hasResume
                      ? `Your record is indexed under ${ownerResume?.categoryName || "your sector"}${ownerResume?.subCategoryName ? ` · ${ownerResume.subCategoryName}` : ""}. Keep it current to surface in recruiter searches.`
                      : "A structured technical record makes you searchable to verified employers across the global tank & terminal network."}
                  </p>
                  <Link
                    to="/create-resume"
                    className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-4 py-2.5 rounded-xl text-[13px] font-medium hover:brightness-110 transition-all"
                  >
                    {hasResume ? "Edit blueprint" : "Build blueprint"}
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-bg-card border border-border-main rounded-2xl p-6">
              <p className="eyebrow tabular text-text-body/55 mb-4">Connections</p>
              <ConnectionsList targetUid={targetId || ""} />
            </div>

            {isOwner && (
              <div className="bg-primary text-white rounded-2xl p-6 grain relative overflow-hidden">
                <div className="absolute inset-0 bp-grid pointer-events-none opacity-40" />
                <div className="relative">
                  <p className="eyebrow tabular text-white/55 mb-2">Premium feature</p>
                  <h3 className="font-display text-2xl mb-2">Technical Headhunting</h3>
                  <p className="text-white/70 text-[13px] leading-relaxed mb-5">
                    Connect with top site operators and logistics heads globally.
                  </p>
                  <button className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl text-[13px] font-medium hover:brightness-110">
                    Upgrade access
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="bg-bg-card border border-border-main rounded-2xl p-6">
                <p className="eyebrow tabular text-text-body/55 mb-4 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Export & share
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handlePrint} className="flex flex-col items-center gap-1.5 p-3 bg-bg-main border border-border-main rounded-xl hover:border-text-heading transition-all">
                    <Printer className="w-4 h-4 text-text-body" strokeWidth={1.75} />
                    <span className="eyebrow tabular text-text-body">Print</span>
                  </button>
                  <button onClick={handleWhatsApp} className="flex flex-col items-center gap-1.5 p-3 bg-bg-main border border-border-main rounded-xl hover:border-text-heading transition-all">
                    <MessageCircle className="w-4 h-4 text-text-body" strokeWidth={1.75} />
                    <span className="eyebrow tabular text-text-body">WhatsApp</span>
                  </button>
                  <button onClick={handleExportPDF} className="flex flex-col items-center gap-1.5 p-3 bg-bg-main border border-border-main rounded-xl hover:border-text-heading transition-all">
                    <FileText className="w-4 h-4 text-text-body" strokeWidth={1.75} />
                    <span className="eyebrow tabular text-text-body">PDF</span>
                  </button>
                  <button onClick={handleExportXLSX} className="flex flex-col items-center gap-1.5 p-3 bg-bg-main border border-border-main rounded-xl hover:border-text-heading transition-all">
                    <Download className="w-4 h-4 text-text-body" strokeWidth={1.75} />
                    <span className="eyebrow tabular text-text-body">XLSX</span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function NetworkActivityPanel({ targetUid }: { targetUid: string }) {
  const { data: userPosts } = useCollection<any>("posts", [where("authorUid", "==", targetUid || "")]);
  const { data: userComments } = useCollectionGroup<any>("comments", [where("authorUid", "==", targetUid || "")]);
  const { data: connections } = useCollection<any>("connections", [where("userIds", "array-contains", targetUid || "")]);
  const acceptedConnections = connections.filter((c) => c.status === "accepted");
  const totalLikes = userPosts.reduce((acc, current) => acc + (current.likesCount || 0), 0);
  const totalComments = userPosts.reduce((acc, current) => acc + (current.commentsCount || 0), 0);

  const rows = [
    { label: "Connections", value: acceptedConnections.length },
    { label: "Post impressions", value: totalLikes * 3 + totalComments * 5 + userPosts.length * 10 },
    { label: "Pulse contributions", value: userPosts.length },
    { label: "Total likes received", value: totalLikes },
  ];

  return (
    <div className="divide-y divide-border-main">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <span className="text-[13px] text-text-body">{r.label}</span>
          <span className="font-display text-xl text-text-heading tabular">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
