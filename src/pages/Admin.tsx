import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Link as LinkIcon, 
  Loader2, 
  Globe, 
  Check, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  Search,
  Mail,
  Shield,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  X,
  Palette,
  FileCode,
  Layout,
  Save,
  ChevronRight,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Activity,
  TrendingUp,
  PieChart as PieChartIcon,
  Filter,
  Lock,
  Unlock,
  LayoutDashboard,
  Sun,
  Moon
} from "lucide-react";
import axios from "axios";
import { createDocument, useCollection, removeDocument, updateDocument } from "../hooks/useFirestore";
import { useAuth, useTheme } from "../App";
import { orderBy, serverTimestamp, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

type Tab ="analytics" |"news" |"forums" |"events" |"surveys" |"members" |"theme" |"moderation" |"companies" |"resumes" |"groups" |"jobs" |"taxonomy";

import { CategorySelector } from "../components/CategorySelector";
import { uploadImage } from "../lib/uploadImage";
import { scoreMatch, DEFAULT_WEIGHTS, MatchWeights } from "../lib/matchScore";
import { TAXONOMY_SEED } from "../lib/taxonomySeed";
import { Layers } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const { user } = useAuth();
  const { isDark, setMode } = useTheme();

  // Theme State
  const [matchWeights, setMatchWeights] = useState<MatchWeights>(DEFAULT_WEIGHTS);
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsSaved, setWeightsSaved] = useState(false);
  useEffect(() => {
    getDoc(doc(db, "settings", "matching"))
      .then((snap) => { if (snap.exists()) setMatchWeights({ ...DEFAULT_WEIGHTS, ...snap.data() }); })
      .catch(() => {});
  }, []);
  const handleSaveWeights = async () => {
    setSavingWeights(true);
    try {
      await setDoc(doc(db, "settings", "matching"), { ...matchWeights, updatedAt: serverTimestamp() });
      setWeightsSaved(true);
      setTimeout(() => setWeightsSaved(false), 2500);
    } catch (err: any) {
      alert(`Failed to save weights: ${err?.code ? err.code + ": " : ""}${err?.message || err}`);
    } finally {
      setSavingWeights(false);
    }
  };

  const [themeData, setThemeData] = useState({
    primaryColor:"#0f172a",
    secondaryColor:"#4f46e5",
    accentColor:"#f59e0b",
    backgroundColor:"#f8fafc",
    headingColor:"#0f172a",
    bodyTextColor:"#475569",
    cardBackgroundColor:"#ffffff",
    borderColor:"#e2e8f0",
    sidebarFocusColor:"#0f172a",
    sidebarFocusTextColor:"#ffffff",
    logoUrl:"",
    logoUrlDark:"",
    siteName:"Tankonomics",
    siteTagline:"Verified Network Identity",
    displayMode:"both" as"image_only" |"text_only" |"both"
  });
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSavedSuccessfully, setThemeSavedSuccessfully] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isEventUploading, setIsEventUploading] = useState(false);

  // Pages State
  // Each collection below only subscribes while a tab that actually needs it
  // is open. Previously these were always-on, meaning every admin session
  // ran 11 simultaneous live listeners across the whole dataset regardless
  // of which tab was visible.


  // News State
  const [url, setUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState("");
  const { data: recentNews, loading: loadingNews } = useCollection<any>("news", [orderBy("createdAt", "desc")], activeTab === "analytics" || activeTab === "news");

  // Forum State
  const [forumTitle, setForumTitle] = useState("");
  const [forumCategoryIds, setForumCategoryIds] = useState<string[]>([]);
  const { data: forumTopics, loading: loadingForums } = useCollection<any>("forum_topics", [orderBy("createdAt", "desc")], activeTab === "analytics" || activeTab === "forums");

  // Event State
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<any>(null);
  // Jobs tab state
  const [matchingJob, setMatchingJob] = useState<any>(null);
  const [confirmMatchResume, setConfirmMatchResume] = useState<any>(null);
  const [matchNote, setMatchNote] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  // Taxonomy tab state
  const [taxType, setTaxType] = useState("industry");
  const [newTaxNode, setNewTaxNode] = useState({ name: "", parentId: "", aliases: "" });
  const [editingTaxNode, setEditingTaxNode] = useState<any>(null);
  const [isSeedingTax, setIsSeedingTax] = useState(false);
  const [eventData, setEventData] = useState({ 
    title:"", 
    date:"", 
    endDate:"",
    time:"",
    endTime:"",
    location:"", 
    description:"",
    imageUrl:"",
    categoryIds: [] as string[],
    ctaText:"",
    ctaUrl:""
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const { data: events, loading: loadingEvents } = useCollection<any>("events", [orderBy("date", "asc")], activeTab === "analytics" || activeTab === "events");

  // Survey State
  const [surveyQuestion, setSurveyQuestion] = useState("");
  const [surveyOptions, setSurveyOptions] = useState(["", ""]);
  const { data: surveys, loading: loadingSurveys } = useCollection<any>("surveys", [orderBy("createdAt", "desc")], activeTab === "analytics" || activeTab === "surveys");

  // Members State
  const { data: members, loading: loadingMembers } = useCollection<any>("users", [orderBy("createdAt", "desc")], activeTab === "analytics" || activeTab === "members");
  const [searchMember, setSearchMember] = useState("");

  // Moderation State
  const { data: reports, loading: loadingReports } = useCollection<any>("reports", [orderBy("createdAt", "desc")], activeTab === "analytics" || activeTab === "moderation");

  // Resumes State
  const { data: resumes, loading: loadingResumes } = useCollection<any>("resumes", [orderBy("createdAt", "desc")], activeTab === "resumes" || activeTab === "jobs");
  const [resumeFilter, setResumeFilter] = useState({ taxDomainId:"", taxRole:"" });

  // Companies & Categories State
  // categories feeds: the analytics distribution chart, the companies tab's
  // own category manager, resume filtering, and the CategorySelector used on
  // both the forums and events forms. claims is companies-tab-only (the claim
  // queue lives inside that tab). groups has no analytics-tab usage at all.
  const categoryTabs: Tab[] = ["analytics", "companies", "resumes", "forums", "events"];
  const { data: categories, loading: loadingCategories } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")], categoryTabs.includes(activeTab));
  const { data: companies, loading: loadingCompanies } = useCollection<any>("companies", [orderBy("createdAt", "desc")], activeTab === "analytics" || activeTab === "companies");
  const { data: claims, loading: loadingClaims } = useCollection<any>("company_claims", [orderBy("createdAt", "desc")], activeTab === "companies");
  const { data: groups, loading: loadingGroups } = useCollection<any>("groups", [orderBy("createdAt", "desc")], activeTab === "groups");
  // Jobs tab: load all jobs + all matches. Resumes also needed for the matching panel.
  const { data: adminJobs, loading: loadingAdminJobs } = useCollection<any>("jobs", [orderBy("createdAt", "desc")], activeTab === "jobs");
  const { data: jobMatches, loading: loadingJobMatches } = useCollection<any>("job_matches", [orderBy("createdAt", "desc")], activeTab === "jobs");
  // Taxonomy tab: all nodes in one subscription (~455 docs), sorted client-side.
  const { data: taxonomyNodes, loading: loadingTaxonomy } = useCollection<any>("taxonomy", [], activeTab === "taxonomy" || activeTab === "resumes");

  const [newCategory, setNewCategory] = useState({ name:"", parentId:"", level: 1 });
  const [newCompany, setNewCompany] = useState({ 
    name:"", 
    description:"", 
    aboutUs:"",
    address:"",
    logo:"", 
    heroImage:"",
    website:"", 
    socialLinks: {
      linkedin:"",
      twitter:"",
      facebook:"",
      instagram:""
    },
    categoryId:"", 
    subCategoryId:"", 
    tier3CategoryId:"",
    categoryIds: [] as string[],
    isFeatured: false,
    products: [] as any[]
  });
  const [newProduct, setNewProduct] = useState({ name:"", description:"", image:"" });
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      const docRef = doc(db, "settings", "theme");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setThemeData(data);
        // Initial sync of variables if needed, though App.tsx does this
      }
    };
    fetchTheme();
  }, []);

  // Live preview of CSS variables in Admin panel
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary-brand", themeData.primaryColor);
    root.style.setProperty("--secondary-brand", themeData.secondaryColor);
    root.style.setProperty("--accent-brand", themeData.accentColor);
    root.style.setProperty("--bg-main", themeData.backgroundColor);
    root.style.setProperty("--text-heading", themeData.headingColor);
    root.style.setProperty("--text-body", themeData.bodyTextColor);
    root.style.setProperty("--bg-card", themeData.cardBackgroundColor);
    root.style.setProperty("--border-main", themeData.borderColor);
    root.style.setProperty("--sidebar-focus", themeData.sidebarFocusColor);
    root.style.setProperty("--sidebar-focus-text", themeData.sidebarFocusTextColor);
  }, [themeData]);

  const handleSaveTheme = async () => {
    setSavingTheme(true);
    setThemeSavedSuccessfully(false);
    try {
      await setDoc(doc(db, "settings", "theme"), {
        ...themeData,
        updatedAt: serverTimestamp()
      });
      setThemeSavedSuccessfully(true);
      setTimeout(() => {
        setThemeSavedSuccessfully(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTheme(false);
    }
  };

  const handleExtract = async () => {
    if (!url.trim()) return;
    setExtracting(true);
    setError("");
    setPreview(null);
    try {
      const response = await axios.post("/api/metadata", { url });
      setPreview(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error ||"Failed. Please enter manually.");
      setPreview({ url, title:"", description:"", image:"", source: new URL(url).hostname });
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateNews = async () => {
    if (!preview) return;
    try {
      await createDocument("news", { ...preview, authorUid: user?.uid });
      setPreview(null);
      setUrl("");
    } catch (error: any) {
      console.error("News creation failed:", error);
      alert("Failed to publish news. Please ensure you are logged in correctly and have admin permissions.");
    }
  };

  const handleCreateForum = async () => {
    if (!forumTitle.trim()) return;
    try {
      await createDocument("forum_topics", {
        title: forumTitle,
        categoryIds: forumCategoryIds,
        authorUid: user?.uid,
        authorName: user?.displayName ||"Admin",
        replyCount: 0,
      });
      setForumTitle("");
      setForumCategoryIds([]);
    } catch (err: any) {
      console.error("Forum topic creation failed:", err);
      alert(`Failed to create topic: ${err?.message || "Unknown error"}`);
    }
  };

  const startEditEvent = (event: any) => {
    setEditingEventId(event.id);
    setEventData({
      title: event.title || "",
      date: event.date || "",
      endDate: event.endDate || "",
      time: event.time || "",
      endTime: event.endTime || "",
      location: event.location || "",
      description: event.description || "",
      imageUrl: event.imageUrl || event.image || "",
      categoryIds: Array.isArray(event.categoryIds) ? event.categoryIds : [],
      ctaText: event.ctaText || "",
      ctaUrl: event.ctaUrl || "",
    });
    // Scroll the form into view for convenience
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEventData({
      title:"", date:"", endDate:"", time:"", endTime:"",
      location:"", description:"", imageUrl:"", categoryIds: [], ctaText:"", ctaUrl:""
    });
  };

  const handleCreateEvent = async () => {
    if (!eventData.title || !eventData.date) return;

    // organizerUid MUST equal request.auth.uid in the rules. Use the live
    // auth user as the source of truth (not the React context, which can be
    // stale). Abort clearly if there's no signed-in user.
    const uid = auth.currentUser?.uid;
    if (!uid) {
      alert("Your session has expired. Please reload the page and sign in again.");
      return;
    }

    // Reject inverted ranges before sending.
    if (eventData.endDate && eventData.endDate < eventData.date) {
      alert("End date cannot be earlier than the start date.");
      return;
    }

    try {
      // Build the field set common to create and update. We do NOT include
      // organizerUid/createdAt here — on create we add them; on update we
      // must not touch them (the original creator + timestamp stay intact).
      const fields: any = {
        title: String(eventData.title).trim(),
        date: String(eventData.date),
      };
      // endDate: set when multi-day, otherwise explicitly clear it on update.
      if (eventData.endDate && eventData.endDate !== eventData.date) {
        fields.endDate = String(eventData.endDate);
      } else if (editingEventId) {
        fields.endDate = null; // clear any previous multi-day span
      }
      fields.time = eventData.time?.trim() || null;
      fields.endTime = eventData.endTime?.trim() || null;
      fields.location = eventData.location?.trim() || null;
      fields.description = eventData.description?.trim() || null;
      fields.imageUrl = eventData.imageUrl?.trim() || null;
      fields.ctaText = eventData.ctaText?.trim() || null;
      fields.ctaUrl = eventData.ctaUrl?.trim() || null;
      // Coerce categoryIds to a clean array of non-empty strings.
      const cleanCats = Array.isArray(eventData.categoryIds)
        ? eventData.categoryIds.filter((c: any) => typeof c === "string" && c.trim().length > 0).map((c: string) => c.trim())
        : [];
      fields.categoryIds = cleanCats;

      if (editingEventId) {
        // UPDATE existing event. updateDocument injects updatedAt.
        await updateDocument("events", editingEventId, fields);
        alert("Event updated successfully.");
      } else {
        // CREATE new event.
        const payload: any = {
          ...fields,
          organizerUid: uid,
          createdAt: serverTimestamp(),
        };
        // On create, drop null fields so the document stays tidy.
        Object.keys(payload).forEach((k) => {
          if (payload[k] === null) delete payload[k];
          if (k === "categoryIds" && payload[k]?.length === 0) delete payload[k];
        });
        await createDocument("events", payload);
        alert("Event saved successfully.");
      }

      cancelEditEvent();
    } catch (err: any) {
      console.error("Event save failed:", err);
      alert(
        `Failed to save event: ${err?.message || "unknown error"}.\n\n` +
        `If this is a permissions error, confirm the Firestore rules are deployed ` +
        `(Firebase Console → Firestore → Rules → Publish).`
      );
    }
  };

  const handleCreateSurvey = async () => {
    if (!surveyQuestion.trim() || surveyOptions.some(o => !o.trim())) return;
    try {
      await createDocument("surveys", {
        question: surveyQuestion,
        options: surveyOptions.map(text => ({ text, votes: 0 })),
        creatorUid: user?.uid,
        totalVotes: 0,
      });
      setSurveyQuestion("");
      setSurveyOptions(["", ""]);
    } catch (err: any) {
      console.error("Survey creation failed:", err);
      alert(`Failed to create survey: ${err?.message || "Unknown error"}`);
    }
  };

  const filteredMembers = members.filter(m => 
    m.displayName?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.jobTitle?.toLowerCase().includes(searchMember.toLowerCase())
  );

  const handleCreateCategory = async () => {
    if (!newCategory.name) return;
    try {
      await createDocument("company_categories", {
        ...newCategory,
        order: categories.filter((c: any) => c.level === newCategory.level && c.parentId === newCategory.parentId).length,
        createdAt: serverTimestamp()
      });
      setNewCategory({ ...newCategory, name:"" });
    } catch (err: any) {
      console.error("Category creation failed:", err);
      alert(`Failed to create category: ${err?.message || "Unknown error"}`);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    try {
      const descendantsToDelete: string[] = [];
      
      if (cat.level === 1) {
        // Find L2 children
        const l2Children = categories.filter((c: any) => c.parentId === cat.id);
        l2Children.forEach((l2: any) => {
          descendantsToDelete.push(l2.id);
          // Find L3 children of this L2
          const l3Children = categories.filter((c: any) => c.parentId === l2.id);
          l3Children.forEach((l3: any) => descendantsToDelete.push(l3.id));
        });
      } else if (cat.level === 2) {
        // Find L3 children
        const l3Children = categories.filter((c: any) => c.parentId === cat.id);
        l3Children.forEach((l3: any) => descendantsToDelete.push(l3.id));
      }

      // Delete descendants first
      for (const id of descendantsToDelete) {
        await removeDocument("company_categories", id);
      }
      // Finally delete the category itself
      await removeDocument("company_categories", cat.id);
      setConfirmDeleteCat(null);
    } catch (err: any) {
      console.error("Delete category error:", err);
      setConfirmDeleteCat(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field:"logo" |"heroImage" |"themeLogo" |"themeLogoDark" |"eventImage") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`);
      return;
    }
    // Upload to Firebase Storage and store only the download URL in Firestore.
    // (Previously this base64-encoded the file straight into the document,
    //  which broke on anything bigger than a tiny thumbnail.)
    try {
      if (field === "themeLogo" || field === "themeLogoDark") setIsLogoUploading(true);
      if (field === "eventImage") setIsEventUploading(true);

      const folder = (field === "themeLogo" || field === "themeLogoDark") ? "logos"
                   : field === "eventImage" ? "events"
                   : "companies";
      const url = await uploadImage(file, { folder });

      if (field === "themeLogo") {
        setThemeData(prev => ({ ...prev, logoUrl: url }));
      } else if (field === "themeLogoDark") {
        setThemeData(prev => ({ ...prev, logoUrlDark: url }));
      } else if (field === "eventImage") {
        setEventData(prev => ({ ...prev, imageUrl: url }));
      } else {
        setNewCompany(prev => ({ ...prev, [field]: url }));
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      alert(`Failed to upload image: ${err?.message || err}`);
    } finally {
      if (field === "themeLogo" || field === "themeLogoDark") setIsLogoUploading(false);
      if (field === "eventImage") setIsEventUploading(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompany.name.trim() || newCompany.categoryIds.length === 0) {
      alert("Company name and at least one category are required.");
      return;
    }

    // Build a normalized payload. Emit both categoryIds (array, new model)
    // and categoryId (singular, used by older list/profile views) so the
    // company object reads consistently across the app.
    const payload: any = {
      name: newCompany.name.trim(),
      description: (newCompany.description ||"").trim(),
      aboutUs: (newCompany.aboutUs ||"").trim(),
      address: (newCompany.address ||"").trim(),
      logo: newCompany.logo ||"",
      heroImage: newCompany.heroImage ||"",
      website: (newCompany.website ||"").trim(),
      socialLinks: {
        linkedin: newCompany.socialLinks?.linkedin ||"",
        twitter: newCompany.socialLinks?.twitter ||"",
        facebook: newCompany.socialLinks?.facebook ||"",
        instagram: newCompany.socialLinks?.instagram ||"",
      },
      categoryIds: newCompany.categoryIds,
      categoryId: newCompany.categoryIds[0], // first category for legacy readers
      subCategoryId: newCompany.subCategoryId ||"",
      tier3CategoryId: newCompany.tier3CategoryId ||"",
      isFeatured: !!newCompany.isFeatured,
      products: Array.isArray(newCompany.products) ? newCompany.products : [],
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingCompanyId) {
        await updateDocument("companies", editingCompanyId, payload);
        setEditingCompanyId(null);
      } else {
        await createDocument("companies", {
          ...payload,
          isClaimed: false,
          ownerUid:"",
          createdAt: serverTimestamp(),
        });
      }

      setNewCompany({
        name:"",
        description:"",
        aboutUs:"",
        address:"",
        logo:"",
        heroImage:"",
        website:"",
        socialLinks: { linkedin:"", twitter:"", facebook:"", instagram:"" },
        categoryId:"",
        subCategoryId:"",
        tier3CategoryId:"",
        categoryIds: [],
        isFeatured: false,
        products: []
      });
    } catch (err: any) {
      console.error("Company save failed:", err);
      alert(`Company save failed: ${err?.message ||"Unknown error"}`);
    }
  };

const handleEditCompany = (company: any) => {
  setNewCompany({
    name: company.name,
    description: company.description,
    aboutUs: company.aboutUs ||"",
    address: company.address ||"",
    logo: company.logo,
    heroImage: company.heroImage ||"",
    website: company.website,
    socialLinks: company.socialLinks || {
      linkedin:"",
      twitter:"",
      facebook:"",
      instagram:""
    },
    categoryId: company.categoryId,
    subCategoryId: company.subCategoryId ||"",
    tier3CategoryId: company.tier3CategoryId ||"",
    categoryIds: company.categoryIds || [],
    isFeatured: company.isFeatured || false,
    products: company.products || []
  });
  setEditingCompanyId(company.id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  const handleResolveClaim = async (claim: any, approve: boolean) => {
    try {
      if (approve) {
        await updateDocument("companies", claim.companyId, {
          ownerUid: claim.userUid,
          isClaimed: true,
          status: "approved",
          updatedAt: serverTimestamp()
        });
        await updateDocument("company_claims", claim.id, { status:"approved" });
      } else {
        await updateDocument("company_claims", claim.id, { status:"rejected" });
      }
    } catch (err: any) {
      console.error("Claim resolution failed:", err);
      alert(`Failed to ${approve ? "approve" : "reject"} claim: ${err?.message || "Unknown error"}`);
    }
  };

  // Jobs tab handlers
  const handleToggleJobStatus = async (job: any) => {
    const newStatus = job.status === "open" ? "closed" : "open";
    try {
      await updateDocument("jobs", job.id, { status: newStatus, updatedAt: serverTimestamp() });
    } catch (err: any) {
      console.error("Job status update failed:", err);
      alert(`Failed to update job status: ${err?.message || "Unknown error"}`);
    }
  };

  const handleDeleteJob = async (job: any) => {
    if (!window.confirm(`Delete "${job.title}" from ${job.companyName}? This cannot be undone.`)) return;
    try {
      await removeDocument("jobs", job.id);
      if (matchingJob?.id === job.id) setMatchingJob(null);
    } catch (err: any) {
      console.error("Job delete failed:", err);
      alert(`Failed to delete job: ${err?.message || "Unknown error"}`);
    }
  };

  const handleCreateMatch = async () => {
    if (!matchingJob || !confirmMatchResume || isCreatingMatch) return;
    setIsCreatingMatch(true);
    try {
      await createDocument("job_matches", {
        jobId: matchingJob.id,
        jobTitle: matchingJob.title,
        companyId: matchingJob.companyId || "",
        companyName: matchingJob.companyName,
        companyOwnerUid: matchingJob.creatorUid,
        resumeId: confirmMatchResume.id,
        userUid: confirmMatchResume.userUid,
        userName: confirmMatchResume.fullName,
        status: "suggested",
        adminUid: user?.uid,
        adminNote: matchNote.trim() || null,
        score: scoreMatch(matchingJob, confirmMatchResume, matchWeights).total,
        createdAt: serverTimestamp(),
      });
      setConfirmMatchResume(null);
      setMatchNote("");
    } catch (err: any) {
      console.error("Match creation failed:", err);
      alert(`Failed to create match: ${err?.message || "Unknown error"}`);
    } finally {
      setIsCreatingMatch(false);
    }
  };

  const handleRemoveMatch = async (matchId: string) => {
    if (!window.confirm("Remove this match suggestion?")) return;
    try {
      await removeDocument("job_matches", matchId);
    } catch (err: any) {
      console.error("Match removal failed:", err);
      alert(`Failed to remove match: ${err?.message || "Unknown error"}`);
    }
  };

  // Taxonomy tab handlers
  const TAX_PREFIX: Record<string, string> = { industry: "ind", vertical: "vert", domain: "dom", family: "fam", role: "role", standard: "std", competency: "comp", certification: "cert", equipment: "equip" };

  const handleSeedTaxonomy = async () => {
    if (!window.confirm(`Upload ${TAXONOMY_SEED.length} taxonomy nodes from the bundled seed?\n\nNodes with matching IDs are overwritten to the seed version; nodes you added yourself are untouched.`)) return;
    setIsSeedingTax(true);
    try {
      // Individual setDoc calls (not writeBatch): batched writes share a hard
      // ~20-document-access budget for rules evaluation, and isAdmin()'s
      // exists() lookup per operation can blow that limit on large batches.
      // Per-doc writes each get their own budget. Stable slug IDs keep this
      // idempotent — safe to re-run.
      let done = 0;
      const failures: { id: string; reason: string }[] = [];
      // Fully serial writes: one setDoc at a time. Removes any concurrency /
      // rules-evaluation-budget interaction as a variable, and lets us report
      // exactly which node fails and why without parallel noise.
      for (const node of TAXONOMY_SEED) {
        try {
          await setDoc(doc(db, "taxonomy", (node as any).id), { ...node, updatedAt: serverTimestamp() });
          done++;
        } catch (err: any) {
          failures.push({ id: (node as any).id, reason: err?.code ? `${err.code}: ${err.message}` : (err?.message || String(err)) });
          if (failures.length >= 3) break; // stop after a few so the alert is readable
        }
      }
      if (failures.length > 0) {
        console.error("Taxonomy seed failures:", failures);
        throw new Error(`${failures.length}+ rejected. First: ${failures[0].id} — ${failures[0].reason}`);
      }
      alert(`Seeded ${done} taxonomy nodes.`);
    } catch (err: any) {
      console.error("Taxonomy seed failed:", err);
      alert(`Seeding failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSeedingTax(false);
    }
  };

  const handleAddTaxNode = async () => {
    if (!newTaxNode.name.trim()) return;
    const slugify = (s: string) => s.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
    let id = `${TAX_PREFIX[taxType]}-${slugify(newTaxNode.name)}`;
    if (taxonomyNodes.some((n: any) => n.id === id)) id = `${id}-${Date.now().toString(36)}`;
    const level = newTaxNode.parentId ? 2 : 1;
    const siblings = taxonomyNodes.filter((n: any) => n.type === taxType && (n.parentId || "") === (newTaxNode.parentId || ""));
    try {
      await setDoc(doc(db, "taxonomy", id), {
        id,
        type: taxType,
        name: newTaxNode.name.trim(),
        parentId: newTaxNode.parentId || null,
        level,
        aliases: newTaxNode.aliases.split(",").map(a => a.trim()).filter(Boolean),
        order: siblings.length,
        updatedAt: serverTimestamp(),
      });
      setNewTaxNode({ name: "", parentId: "", aliases: "" });
    } catch (err: any) {
      console.error("Taxonomy node create failed:", err);
      alert(`Failed to add node: ${err?.message || "Unknown error"}`);
    }
  };

  const handleSaveTaxNode = async () => {
    if (!editingTaxNode?.name?.trim()) return;
    try {
      await updateDocument("taxonomy", editingTaxNode.id, {
        name: editingTaxNode.name.trim(),
        aliases: (typeof editingTaxNode.aliases === "string"
          ? editingTaxNode.aliases.split(",").map((a: string) => a.trim()).filter(Boolean)
          : editingTaxNode.aliases) || [],
        updatedAt: serverTimestamp(),
      });
      setEditingTaxNode(null);
    } catch (err: any) {
      console.error("Taxonomy node update failed:", err);
      alert(`Failed to save node: ${err?.message || "Unknown error"}`);
    }
  };

  const handleDeleteTaxNode = async (node: any) => {
    const children = taxonomyNodes.filter((n: any) => n.parentId === node.id);
    if (children.length > 0) {
      alert(`"${node.name}" has ${children.length} child node${children.length > 1 ? "s" : ""}. Delete or re-parent them first.`);
      return;
    }
    if (!window.confirm(`Delete "${node.name}" (${node.id})?\n\nAny resumes or jobs referencing this ID will lose the label. Renaming is usually safer than deleting.`)) return;
    try {
      await deleteDoc(doc(db, "taxonomy", node.id));
    } catch (err: any) {
      console.error("Taxonomy node delete failed:", err);
      alert(`Failed to delete node: ${err?.message || "Unknown error"}`);
    }
  };

  // Analytics Helpers
  const getGrowthData = (data: any[], days: number = 7) => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const count = data.filter(item => {
        if (!item.createdAt?.seconds) return false;
        const itemDate = new Date(item.createdAt.seconds * 1000);
        return isWithinInterval(itemDate, { start: dayStart, end: dayEnd });
      }).length;

      result.push({
        name: format(date, "MMM dd"),
        count
      });
    }
    return result;
  };

  const getDistribution = (data: any[], key: string) => {
    const counts: { [key: string]: number } = {};
    data.forEach(item => {
      const val = item[key] ||"Unspecified";
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const userGrowth = getGrowthData(members, 14);
  const companyDistribution = getDistribution(companies, "categoryId").map(item => ({
    ...item,
    name: categories.find(c => c.id === item.name)?.name || item.name
  }));

  const resumeDistribution = getDistribution(resumes, "categoryName");

  const chartColors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const tabs: {id: Tab; label: string; icon: any}[] = [
    { id:"analytics", label:"Analytics", icon: Activity },
    { id:"resumes", label:"Sector Reports", icon: FileCode },
    { id:"news", label:"News Feed", icon: Globe },
    { id:"forums", label:"Forums", icon: MessageSquare },
    { id:"events", label:"Events", icon: Calendar },
    { id:"surveys", label:"Surveys", icon: BarChart3 },
    { id:"members", label:"Members", icon: Users },
    { id:"companies", label:"Companies", icon: Building2 },
    { id:"groups", label:"Groups", icon: Users },
    { id:"jobs", label:"Jobs", icon: Briefcase },
    { id:"taxonomy", label:"Taxonomy", icon: Layers },
    { id:"moderation", label:"Moderation", icon: Shield },
    { id:"theme", label:"Branding", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Page heading */}
        <header className="mb-10 md:mb-12 relative">
          <div className="absolute inset-x-0 top-0 h-28 bp-grid-paper opacity-50 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
                <Shield className="w-3 h-3" strokeWidth={1.75} />
                COMMAND CENTER
              </div>
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
                Platform controls.
              </h1>
              <p className="text-text-body text-[15px] mt-3 max-w-xl">
                Manage members, moderate content, configure the directory taxonomy, theme the site, and inspect platform-wide analytics.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-bg-card p-1 rounded-xl border border-border-main h-fit shrink-0">
              <button
                onClick={() => setMode('light')}
                className={`p-2 rounded-lg transition-all ${!isDark ? 'bg-text-heading text-bg-card' : 'text-text-body/55 hover:text-text-body'}`}
                title="Light mode"
              >
                <Sun className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setMode('dark')}
                className={`p-2 rounded-lg transition-all ${isDark ? 'bg-text-heading text-bg-card' : 'text-text-body/55 hover:text-text-body'}`}
                title="Dark mode"
              >
                <Moon className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 bg-bg-card border border-border-main rounded-2xl p-1.5 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg eyebrow tabular transition-all ${
                activeTab === tab.id ? "bg-text-heading text-bg-card" : "text-text-body/55 hover:text-text-body hover:bg-bg-main"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

      <AnimatePresence mode="wait">
        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="analytics" className="space-y-8">
            {/* Match Scoring Weights */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-6 md:p-7">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="eyebrow tabular text-accent mb-1">MATCHING ENGINE</p>
                  <h3 className="font-display text-2xl text-text-heading leading-tight">Scoring weights</h3>
                  <p className="text-[13px] text-text-body max-w-lg leading-relaxed mt-1">
                    How much each dimension contributes to a candidate's 0–100 match score. Applies platform-wide. Changes take effect immediately on the next score calculation.
                  </p>
                </div>
                <button
                  onClick={handleSaveWeights}
                  disabled={savingWeights}
                  className="shrink-0 px-4 py-2.5 bg-text-heading text-bg-card rounded-xl text-[13px] font-medium hover:brightness-110 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                >
                  {savingWeights ? <Loader2 className="w-4 h-4 animate-spin" /> : weightsSaved ? "Saved ✓" : "Save weights"}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {([
                  ["role","Role match"],["domain","Domain match"],["certifications","Certifications"],
                  ["competencies","Competencies"],["standards","Standards"],["industry","Industry"],
                  ["equipment","Equipment"],["seniority","Seniority"],
                ] as [keyof MatchWeights, string][]).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="eyebrow tabular text-text-body/55 mb-1.5 block">{label}</span>
                    <input
                      type="number" min="0" max="50"
                      value={matchWeights[key]}
                      onChange={(e) => setMatchWeights({ ...matchWeights, [key]: Number(e.target.value) })}
                      className="w-full p-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
                    />
                  </label>
                ))}
              </div>

              <div className="h-px bg-border-main my-5" />
              <p className="eyebrow tabular text-text-body/55 mb-3">PENALTIES & GATING</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="eyebrow tabular text-text-body/55 mb-1.5 block">Below-min education penalty</span>
                  <input type="number" min="0" max="50" value={matchWeights.educationPenalty}
                    onChange={(e) => setMatchWeights({ ...matchWeights, educationPenalty: Number(e.target.value) })}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading outline-none focus:border-text-heading transition-all" />
                </label>
                <label className="block">
                  <span className="eyebrow tabular text-text-body/55 mb-1.5 block">Below-min experience penalty</span>
                  <input type="number" min="0" max="50" value={matchWeights.experiencePenalty}
                    onChange={(e) => setMatchWeights({ ...matchWeights, experiencePenalty: Number(e.target.value) })}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading outline-none focus:border-text-heading transition-all" />
                </label>
                <label className="block">
                  <span className="eyebrow tabular text-text-body/55 mb-1.5 block">Missing must-have factor (0–1)</span>
                  <input type="number" min="0" max="1" step="0.05" value={matchWeights.mustHaveMissingFactor}
                    onChange={(e) => setMatchWeights({ ...matchWeights, mustHaveMissingFactor: Number(e.target.value) })}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-lg text-[14px] text-text-heading outline-none focus:border-text-heading transition-all" />
                </label>
              </div>
              <p className="text-[11px] text-text-body/45 mt-3 leading-relaxed">
                Must-have factor: when a candidate lacks a job's starred requirement, their score is multiplied by this (0.4 = keep 40%). They're never hidden — just ranked lower with a flag. Penalties are subtracted from the raw score.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label:"Total Network", value: members.length, icon: Users, color:"text-primary", bg:"bg-primary/10" },
                 { label:"Business Directory", value: companies.length, icon: Building2, color:"text-accent", bg:"bg-accent/10" },
                 { label:"Published News", value: recentNews.length, icon: Globe, color:"text-blueprint", bg:"bg-blueprint/10" },
                 { label:"Community Events", value: events.length, icon: Calendar, color:"text-rust", bg:"bg-rust/10" }
               ].map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm hover:shadow-md transition-all group"
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-6 h-6" />
                       </div>
                       <TrendingUp className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="eyebrow tabular text-text-body/55 mb-1">{stat.label}</h4>
                    <p className="font-display text-4xl text-text-heading">{stat.value}</p>
                 </motion.div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Growth Chart */}
               <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="font-display text-xl text-text-heading flex items-center gap-2">
                           <TrendingUp className="w-5 h-5 text-primary" /> Member Registration
                        </h3>
                        <p className="eyebrow tabular text-text-body/55 mt-1">Last 14 days growth pulse</p>
                     </div>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowth}>
                           <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                 <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis 
                             dataKey="name" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                           />
                           <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                           />
                           <Tooltip 
                             contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                           />
                           <Area 
                             type="monotone" 
                             dataKey="count" 
                             stroke="#4f46e5" 
                             strokeWidth={4}
                             fillOpacity={1} 
                             fill="url(#colorCount)" 
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Distribution Chart */}
               <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="font-display text-xl text-text-heading flex items-center gap-2">
                           <PieChartIcon className="w-5 h-5 text-accent" /> Sector Distribution
                        </h3>
                        <p className="eyebrow tabular text-text-body/55 mt-1">Business categories breakdown</p>
                     </div>
                  </div>
                  <div className="h-[300px] w-full flex items-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                             data={companyDistribution}
                             cx="50%"
                             cy="40%"
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={8}
                             dataKey="value"
                           >
                             {companyDistribution.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                             ))}
                           </Pie>
                           <Tooltip 
                             contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                           />
                           <Legend 
                             verticalAlign="bottom" 
                             height={36} 
                             iconType="circle"
                             formatter={(value) => <span className="eyebrow tabular text-text-body ml-1">{value}</span>}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Engagement Card */}
               <div className="bg-primary p-8 rounded-2xl text-white shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                     <Activity className="w-32 h-32" />
                  </div>
                  <h3 className="eyebrow tabular mb-8 text-white/55">Engagement Pulse</h3>
                  <div className="space-y-6 relative z-10">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="eyebrow tabular text-accent/70">Pending Actions</span>
                           <span className="font-display text-xl">{reports.filter(r => r.status === 'pending').length}</span>
                        </div>
                        <div className="h-1.5 bg-bg-card/10 rounded-full overflow-hidden">
                           <div className="h-full bg-accent rounded-full" style={{ width: '40%' }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="eyebrow tabular text-emerald-300">Forum Activity</span>
                           <span className="font-display text-xl">{forumTopics.length}</span>
                        </div>
                        <div className="h-1.5 bg-bg-card/10 rounded-full overflow-hidden">
                           <div className="h-full bg-accent rounded-full" style={{ width: '65%' }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="eyebrow tabular text-rust/70">Survey Response</span>
                           <span className="font-display text-xl">{surveys.reduce((acc: number, s: any) => acc + (s.totalVotes || 0), 0)}</span>
                        </div>
                        <div className="h-1.5 bg-bg-card/10 rounded-full overflow-hidden">
                           <div className="h-full bg-rust rounded-full" style={{ width: '85%' }}></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Recent Highlights Table */}
               <div className="md:col-span-2 bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-display text-xl text-text-heading flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" /> Platform Velocity
                     </h3>
                     <span className="eyebrow tabular text-text-body/55">Active Status</span>
                  </div>
                  <div className="space-y-4">
                     {[
                       { type:"User", name: members[0]?.displayName, action:"Joined Network", icon: Users, time: members[0]?.createdAt },
                       { type:"Company", name: companies[0]?.name, action:"Profile Registered", icon: Building2, time: companies[0]?.createdAt },
                       { type:"News", name: recentNews[0]?.title, action:"Article Published", icon: Globe, time: recentNews[0]?.createdAt }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-bg-main rounded-2xl group hover:bg-accent/10/50 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-bg-card rounded-xl shadow-sm flex items-center justify-center text-text-body/55 group-hover:text-primary transition-colors">
                                <item.icon className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-[13px] font-medium text-text-heading truncate max-w-[200px]">{item.name ||"N/A"}</p>
                                <p className="eyebrow tabular text-text-body/55">{item.action}</p>
                             </div>
                          </div>
                          <span className="eyebrow tabular text-text-body/40 italic">
                             {item.time?.seconds ? format(item.time.seconds * 1000, 'MMM d') : '-'}
                          </span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === "resumes" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="resumes" className="space-y-8">
             <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm">
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                   <div className="flex-1 space-y-4">
                         <h2 className="font-display text-2xl text-text-heading flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" /> Talent Directory Mapping
                         </h2>
                      <p className="text-text-body font-medium text-sm">Monitor and sort professional resumes by functional domain and role.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                      <div className="space-y-1.5">
                         <label className="eyebrow tabular text-text-body/55 px-1">Functional Domain</label>
                         <select 
                           value={resumeFilter.taxDomainId}
                           onChange={(e) => setResumeFilter({ ...resumeFilter, taxDomainId: e.target.value })}
                           className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[13px] font-medium focus:border-text-heading outline-none"
                         >
                            <option value="">All Domains</option>
                            {taxonomyNodes.filter((c: any) => c.type === "domain" && !c.parentId).sort((a: any, b: any) => a.name.localeCompare(b.name)).map((c: any) => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="eyebrow tabular text-text-body/55 px-1">Role</label>
                         <select 
                           value={resumeFilter.taxRole}
                           onChange={(e) => setResumeFilter({ ...resumeFilter, taxRole: e.target.value })}
                           className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[13px] font-medium focus:border-text-heading outline-none"
                         >
                            <option value="">All Roles</option>
                            {taxonomyNodes.filter((c: any) => c.type === "role").sort((a: any, b: any) => a.name.localeCompare(b.name)).map((c: any) => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                         </select>
                      </div>
                   </div>
                </div>

                <div className="bg-bg-main border border-border-main rounded-2xl overflow-hidden shadow-inner max-h-[600px] overflow-y-auto">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-200/50 eyebrow tabular text-text-body sticky top-0 backdrop-blur-md">
                         <tr>
                            <th className="px-6 py-4">Full Name</th>
                            <th className="px-6 py-4">Current Title</th>
                            <th className="px-6 py-4">Mapping</th>
                            <th className="px-6 py-4">Visibility</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main bg-bg-card">
                         {resumes
                           .filter(r => 
                              (!resumeFilter.taxDomainId || r.taxDomainId === resumeFilter.taxDomainId) &&
                              (!resumeFilter.taxRole || r.taxRole === resumeFilter.taxRole)
                           )
                           .map((resume: any) => (
                              <tr key={resume.id} className="hover:bg-accent/10/30 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <img src={resume.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${resume.fullName}`} className="w-9 h-9 rounded-xl bg-bg-main" />
                                       <p className="font-bold text-text-heading">{resume.fullName}</p>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <p className="text-[13px] text-text-body truncate max-w-[150px]">{resume.jobTitle}</p>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="space-y-1">
                                       {(resume.taxRole || resume.taxDomainId || resume.categoryName) ? (
                                          <>
                                             <span className="px-2 py-0.5 bg-accent/10 text-accent rounded eyebrow tabular block w-fit">
                                                {taxonomyNodes.find((n: any) => n.id === resume.taxRole)?.name
                                                  || taxonomyNodes.find((n: any) => n.id === resume.taxDomainId)?.name
                                                  || resume.categoryName}
                                             </span>
                                             {taxonomyNodes.find((n: any) => n.id === resume.taxDomainId)?.name && resume.taxRole && (
                                                <p className="text-[9px] text-text-body/55 ml-1">» {taxonomyNodes.find((n: any) => n.id === resume.taxDomainId)?.name}</p>
                                             )}
                                          </>
                                       ) : (
                                          <span className="text-[9px] text-text-body/40 italic">Unmapped</span>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    {resume.isLocked ? (
                                       <span className="flex items-center gap-1.5 eyebrow tabular text-text-body/55">
                                          <Lock className="w-3 h-3" /> Private
                                       </span>
                                    ) : (
                                       <span className="flex items-center gap-1.5 eyebrow tabular text-accent">
                                          <Unlock className="w-3 h-3" /> Public
                                       </span>
                                    )}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={async () => {
                                        if (!window.confirm("Delete this resume?")) return;
                                        try {
                                          await removeDocument("resumes", resume.id);
                                        } catch (err: any) {
                                          alert(`Failed to delete resume: ${err?.message || "Unknown error"}`);
                                        }
                                      }}
                                      className="p-2 text-text-body/30 hover:text-rust transition-colors"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </td>
                              </tr>
                           ))
                         }
                         {resumes.length === 0 && (
                            <tr>
                               <td colSpan={5} className="px-6 py-12 text-center text-text-body/55 italic">No resumes discovered in the network explorer.</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === "companies" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="companies" className="space-y-10">
            {/* Category Manager */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm">
              <h2 className="font-display text-2xl text-text-heading mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-accent" /> Global Category Manager
              </h2>
              <p className="text-xs text-text-body mb-6 font-medium">Manage categories and sub-categories used across Directory, Jobs, Events, and Forums.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((level) => (
                  <div key={level} className="space-y-4">
                    <p className="eyebrow tabular text-text-body/55 tracking-widest">Level {level} {level === 1 ? 'Categories' : level === 2 ? 'Sub-Categories' : 'Tier 3'}</p>
                    {level > 1 && (
                      <select 
                        value={newCategory.parentId} 
                        onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value, level })}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-[13px] font-medium"
                      >
                        <option value="">Select Parent...</option>
                        {categories.filter((c: any) => c.level === level - 1).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                    <div className="flex gap-2">
                      <input 
                        placeholder={`Add Level ${level}...`}
                        value={newCategory.level === level ? newCategory.name : ""}
                        onChange={(e) => setNewCategory({ name: e.target.value, level, parentId: level === 1 ? "" : newCategory.parentId })}
                        className="flex-1 p-3 bg-bg-main border border-border-main rounded-xl text-[13px] font-medium"
                      />
                      <button 
                        onClick={handleCreateCategory}
                        disabled={newCategory.level !== level || !newCategory.name || (level > 1 && !newCategory.parentId)}
                        className="p-3 bg-primary text-white rounded-xl hover:brightness-110 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                      {categories.filter((c: any) => c.level === level && (level === 1 || c.parentId === newCategory.parentId)).map((cat: any) => (
                        <div key={cat.id} className="flex items-center justify-between p-2.5 bg-bg-main hover:bg-bg-main rounded-xl text-[11px] text-text-body transition-colors group">
                          <span className="truncate pr-2">{cat.name}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteCat(cat);
                            }} 
                            className="text-rust hover:text-red-600 transition-colors p-1 flex-shrink-0"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Creator */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm">
              <h2 className="font-display text-2xl text-text-heading mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" /> {editingCompanyId ? "Edit Company" : "Register New Company"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-1 block">Company Name</label>
                    <input 
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                      className="w-full p-4 bg-bg-main border border-border-main rounded-2xl"
                    />
                  </div>
                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-1 block">Short Description (for cards)</label>
                    <input 
                      value={newCompany.description}
                      onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                      className="w-full p-4 bg-bg-main border border-border-main rounded-2xl"
                    />
                  </div>
                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-1 block">About Us (Full Text)</label>
                    <textarea 
                      value={newCompany.aboutUs}
                      onChange={(e) => setNewCompany({...newCompany, aboutUs: e.target.value})}
                      className="w-full p-4 bg-bg-main border border-border-main rounded-2xl h-32 resize-none"
                    />
                  </div>
                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-1 block">Company Address</label>
                    <input 
                      value={newCompany.address}
                      onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                      className="w-full p-4 bg-bg-main border border-border-main rounded-2xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="eyebrow tabular text-text-body/55 mb-1 block">Company Logo</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input 
                            placeholder="Logo URL"
                            value={newCompany.logo}
                            onChange={(e) => setNewCompany({...newCompany, logo: e.target.value})}
                            className="flex-1 p-3 bg-bg-main border border-border-main rounded-xl text-xs"
                          />
                          <label className="p-3 bg-accent/10 text-accent rounded-xl hover:bg-accent/10 cursor-pointer transition-colors">
                            <Plus className="w-4 h-4" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, "logo")}
                            />
                          </label>
                        </div>
                        {newCompany.logo && (
                          <div className="relative w-16 h-16 rounded-xl border border-border-main bg-bg-main overflow-hidden group">
                             <img src={newCompany.logo} className="w-full h-full object-contain" />
                             <button 
                               onClick={() => setNewCompany({...newCompany, logo:""})}
                               className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                             >
                               <X className="w-4 h-4" />
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="eyebrow tabular text-text-body/55 mb-1 block">Hero Image URL</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input 
                            placeholder="Hero Image URL"
                            value={newCompany.heroImage}
                            onChange={(e) => setNewCompany({...newCompany, heroImage: e.target.value})}
                            className="flex-1 p-3 bg-bg-main border border-border-main rounded-xl text-xs"
                          />
                          <label className="p-3 bg-accent/10 text-accent rounded-xl hover:bg-accent/10 cursor-pointer transition-colors">
                             <Plus className="w-4 h-4" />
                             <input 
                               type="file" 
                               accept="image/*" 
                               className="hidden" 
                               onChange={(e) => handleFileUpload(e, "heroImage")}
                             />
                          </label>
                        </div>
                        {newCompany.heroImage && (
                          <div className="relative w-full h-20 rounded-xl border border-border-main bg-bg-main overflow-hidden group">
                             <img src={newCompany.heroImage} className="w-full h-full object-cover" />
                             <button 
                               onClick={() => setNewCompany({...newCompany, heroImage:""})}
                               className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                             >
                               <X className="w-4 h-4" />
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-1 block">Website</label>
                    <input 
                      value={newCompany.website}
                      onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                      className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="eyebrow tabular text-text-body/55 mb-1 block flex items-center gap-1.5">
                        <Linkedin className="w-3 h-3 text-blueprint" /> LinkedIn
                      </label>
                      <input 
                        value={newCompany.socialLinks?.linkedin ||""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, linkedin: e.target.value }})}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs"
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                    <div>
                      <label className="eyebrow tabular text-text-body/55 mb-1 block flex items-center gap-1.5">
                        <Twitter className="w-3 h-3 text-sky-400" /> Twitter / X
                      </label>
                      <input 
                        value={newCompany.socialLinks?.twitter ||""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, twitter: e.target.value }})}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs"
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div>
                      <label className="eyebrow tabular text-text-body/55 mb-1 block flex items-center gap-1.5">
                        <Facebook className="w-3 h-3 text-blue-700" /> Facebook
                      </label>
                      <input 
                        value={newCompany.socialLinks?.facebook ||""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, facebook: e.target.value }})}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs"
                        placeholder="Facebook URL"
                      />
                    </div>
                    <div>
                      <label className="eyebrow tabular text-text-body/55 mb-1 block flex items-center gap-1.5">
                        <Instagram className="w-3 h-3 text-pink-500" /> Instagram
                      </label>
                      <input 
                        value={newCompany.socialLinks?.instagram ||""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, instagram: e.target.value }})}
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs"
                        placeholder="Instagram URL"
                      />
                    </div>
                  </div>

                  {/* Product Manager */}
                  <div className="pt-6 border-t border-border-main">
                    <label className="eyebrow tabular text-text-body/55 mb-4 block">Product Showcase</label>
                    <div className="space-y-4">
                      <div className="p-4 bg-bg-main rounded-2xl border border-border-main space-y-3">
                         <input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-bg-card border border-border-main rounded-xl text-xs" />
                         <input placeholder="Image URL" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 bg-bg-card border border-border-main rounded-xl text-xs" />
                         <textarea placeholder="Product Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 bg-bg-card border border-border-main rounded-xl text-xs h-20 resize-none" />
                         <button 
                           onClick={() => {
                             if (!newProduct.name) return;
                             setNewCompany({ ...newCompany, products: [...newCompany.products, newProduct] });
                             setNewProduct({ name:"", description:"", image:"" });
                           }}
                           className="w-full py-2 bg-indigo-600 text-white rounded-xl eyebrow tabular"
                         >
                           + Add Product 
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {newCompany.products.map((p, i) => (
                          <div key={i} className="p-3 bg-bg-card border border-border-main rounded-xl flex items-center justify-between group">
                            <span className="text-[13px] font-medium truncate">{p.name}</span>
                            <button onClick={() => setNewCompany({...newCompany, products: newCompany.products.filter((_, idx) => idx !== i)})} className="text-rust opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-1 block">Classification (Select Multiple)</label>
                    <CategorySelector 
                      categories={categories} 
                      selectedIds={newCompany.categoryIds} 
                      onChange={(ids) => setNewCompany({...newCompany, categoryIds: ids})} 
                    />
                    
                    <div className="mt-4 flex items-center gap-3 p-4 bg-bg-main border border-border-main rounded-2xl">
                        <input 
                          type="checkbox"
                          id="isFeatured"
                          checked={newCompany.isFeatured}
                          onChange={(e) => setNewCompany({...newCompany, isFeatured: e.target.checked})}
                          className="w-5 h-5 rounded border-border-main text-accent focus:border-text-heading"
                        />
                        <label htmlFor="isFeatured" className="text-[13px] font-medium text-text-heading cursor-pointer">
                          Featured Company (Rich Background)
                        </label>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleCreateCompany}
                    disabled={!newCompany.name.trim() || newCompany.categoryIds.length === 0}
                    className="w-full bg-primary text-white font-medium py-4 rounded-2xl shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95 text-xs mt-6"
                  >
                    <Building2 className="w-5 h-5" /> {editingCompanyId ? "Update Profile" : "Register Business"}
                  </button>
                  {editingCompanyId && (
                    <button onClick={() => setEditingCompanyId(null)} className="w-full eyebrow tabular text-text-body/55 hover:text-text-body">Cancel Editing</button>
                  )}
                </div>
              </div>

            {/* Claims Queue */}
            <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 bg-bg-main border-b border-border-main flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-heading flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Claim Requests
                  </h3>
                </div>
                <div className="bg-amber-100 px-3 py-1 rounded eyebrow tabular text-amber-700">
                  {claims.filter((c: any) => c.status === 'pending').length} Pending
                </div>
              </div>
              <div className="divide-y divide-border-main">
                {claims.map((claim: any) => (
                  <div key={claim.id} className="p-6 flex items-center justify-between hover:bg-bg-main/50 transition-all">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-text-body/55" />
                      </div>
                      <div>
                        <p className="font-bold text-text-heading">Company ID: {claim.companyId.substring(0, 8)}...</p>
                        <p className="text-xs text-text-body font-medium">Requested by: {claim.userName} ({claim.userEmail})</p>
                        <p className="text-[10px] italic text-text-body/55 mt-1 max-w-md">"{claim.justification}"</p>
                      </div>
                    </div>
                    {claim.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleResolveClaim(claim, false)}
                          className="px-4 py-2 bg-bg-main text-text-body rounded-xl text-xs hover:bg-slate-200"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleResolveClaim(claim, true)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                        >
                          Approve Claim
                        </button>
                      </div>
                    ) : (
                      <span className={`eyebrow tabular px-3 py-1 rounded-full ${
                        claim.status === 'approved' ? 'bg-accent/10 text-accent' : 'bg-red-50 text-red-600'
                      }`}>
                        {claim.status}
                      </span>
                    )}
                  </div>
                ))}
                {claims.length === 0 && (
                  <div className="p-20 text-center text-text-body/40 italic font-medium">No claim requests in queue.</div>
                )}
              </div>
            </div>

            {/* Companies List */}
            <div className="space-y-6 mt-12">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-text-heading flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" /> Active Directory
                </h2>
                <div className="eyebrow tabular text-text-body/55 tracking-widest">
                  {companies.length} Registered Companies
                </div>
              </div>
              
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {companies.map((company: any) => (
                  <div 
                    key={company.id} 
                    className={`break-inside-avoid mb-6 rounded-2xl border transition-all group overflow-hidden relative ${
                      company.isFeatured 
                        ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-transparent shadow-md shadow-indigo-200" 
                        : "bg-bg-card border-border-main hover:shadow-sm text-text-heading"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center overflow-hidden p-2 ${
                          company.isFeatured ? "bg-bg-card/10 border-white/20" : "bg-bg-main border-border-main"
                        }`}>
                          <img 
                            src={company.logo ||"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"} 
                            className={`w-full h-full object-contain ${company.isFeatured ? "brightness-0 invert" : ""}`}
                            alt={company.name} 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditCompany(company)}
                            className={`p-2 rounded-xl transition-all ${
                              company.isFeatured ? "hover:bg-bg-card/20 text-white/70 hover:text-white" : "hover:bg-bg-main text-text-body/55 hover:text-accent"
                            }`}
                          >
                            <Palette className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (!window.confirm(`Delete "${company.name}"? This cannot be undone.`)) return;
                              try {
                                await removeDocument("companies", company.id);
                              } catch (err: any) {
                                alert(`Failed to delete company: ${err?.message || "Unknown error"}`);
                              }
                            }}
                            className={`p-2 rounded-xl transition-all ${
                              company.isFeatured ? "hover:bg-red-500/20 text-white/50 hover:text-red-300" : "hover:bg-red-50 text-text-body/40 hover:text-rust"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className={`eyebrow tabular mb-1 ${
                            company.isFeatured ? "text-indigo-200" : "text-accent"
                          }`}>
                            {categories.find((c: any) => c.id === company.categoryId)?.name ||"N/A"}
                          </p>
                          <h3 className="text-xl font-medium tracking-tight leading-tight mb-2">{company.name}</h3>
                          <p className={`text-xs leading-relaxed line-clamp-3 ${
                            company.isFeatured ? "text-white/80" : "text-text-body"
                          }`}>
                            {company.description ||"No description provided."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full eyebrow tabular border ${
                            company.isClaimed 
                              ? (company.isFeatured ? "bg-accent/20 border-emerald-400/30 text-emerald-200" : "bg-accent/10 border-emerald-100 text-accent")
                              : (company.isFeatured ? "bg-bg-card/10 border-white/20 text-white/60" : "bg-bg-main border-border-main text-text-body/55")
                          }`}>
                            {company.isClaimed ? "Claimed" : "Unclaimed"}
                          </span>
                          {company.isFeatured && (
                            <span className="px-3 py-1 bg-bg-card/20 border border-white/30 rounded-full eyebrow tabular text-white">
                              Featured
                            </span>
                          )}
                          <button
                            onClick={async () => {
                              const makePremium = company.plan !== "premium";
                              // PAYMENT INTEGRATION SEAM: today this is an admin
                              // grant. When billing is added, gate this on a
                              // successful charge / active subscription instead.
                              try {
                                await updateDocument("companies", company.id, {
                                  plan: makePremium ? "premium" : "free",
                                  planSince: makePremium ? serverTimestamp() : null,
                                });
                              } catch (err: any) {
                                alert(`Failed to update plan: ${err?.code ? err.code + ": " : ""}${err?.message || err}`);
                              }
                            }}
                            title={company.plan === "premium" ? "Click to revoke premium" : "Click to grant premium"}
                            className={`px-3 py-1 rounded-full eyebrow tabular border transition-all ${
                              company.plan === "premium"
                                ? "bg-blueprint/15 border-blueprint/40 text-blueprint"
                                : (company.isFeatured ? "bg-bg-card/10 border-white/20 text-white/50 hover:text-white" : "bg-bg-main border-border-main text-text-body/45 hover:text-text-heading")
                            }`}
                          >
                            {company.plan === "premium" ? "★ PREMIUM" : "Free — grant premium"}
                          </button>
                        </div>

                        <div className={`pt-4 border-t flex items-center justify-between ${
                          company.isFeatured ? "border-white/10" : "border-border-main"
                        }`}>
                          <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                               company.isFeatured ? "bg-bg-card/10" : "bg-bg-main"
                             }`}>
                                <Globe className={`w-3.5 h-3.5 ${company.isFeatured ? "text-white/70" : "text-text-body/55"}`} />
                             </div>
                             <span className={`text-[10px] font-bold ${
                               company.isFeatured ? "text-white/60" : "text-text-body/55"
                             }`}>
                               {company.website ? new URL(company.website).hostname : "No Website"}
                             </span>
                          </div>
                          <Link 
                            to={`/business/${company.id}`}
                            className={`p-2 rounded-xl transition-all ${
                              company.isFeatured ? "bg-bg-card text-accent hover:scale-105 shadow-sm shadow-indigo-900/40" : "bg-primary text-white hover:bg-indigo-600"
                            }`}
                          >
                             <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {companies.length === 0 && (
                <div className="p-20 text-center bg-bg-card border border-border-main rounded-2xl">
                   <Building2 className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                   <p className="text-text-body/55 italic">No businesses registered in the system yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "moderation" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="moderation" className="space-y-6">
            <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-text-heading flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rust" /> Moderation Queue
                </h2>
                <p className="text-text-body text-sm font-medium">Review reported content and maintain community standards.</p>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <span className="eyebrow tabular text-red-600">Pending Issues</span>
                <p className="text-2xl font-medium text-red-700">{reports.filter((r: any) => r.status === "pending").length}</p>
              </div>
            </div>

            <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-bg-main eyebrow tabular text-text-body/55">
                  <tr>
                    <th className="px-6 py-4">Report Details</th>
                    <th className="px-6 py-4">Content Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {reports.map((report: any) => (
                    <tr key={report.id} className={`hover:bg-bg-main/50 transition-colors ${report.status === 'pending' ? 'bg-bg-card' : 'bg-bg-main/30 opacity-70'}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-text-heading text-xs">ID: {report.targetId.substring(0, 8)}...</p>
                          <p className="text-[10px] font-medium text-text-body/55 uppercase tracking-wider">
                            {report.createdAt?.seconds ? format(report.createdAt.seconds * 1000, 'MMM d, h:mm a') : '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded eyebrow tabular ${
                          report.targetType === 'post' ? 'bg-accent/10 text-accent' : 
                          report.targetType === 'comment' ? 'bg-accent/10 text-accent' : 'bg-rust/10 text-rust'
                        }`}>
                          {report.targetType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-text-body max-w-xs truncate italic">"{report.reason}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-700 text-xs">{report.reporterName}</p>
                          <p className="text-[9px] text-text-body/55 font-medium">UID: {report.reporterUid?.substring(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full eyebrow tabular flex items-center gap-1.5 w-fit ${
                          report.status === 'pending' ? 'bg-red-50 text-red-600 animate-pulse' : 
                          report.status === 'resolved' ? 'bg-accent/10 text-accent' : 'bg-bg-main text-text-body/55'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${
                            report.status === 'pending' ? 'bg-red-500' : 
                            report.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {report.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={async () => {
                                 try {
                                   await updateDocument("reports", report.id, { status:"dismissed", updatedAt: serverTimestamp() });
                                 } catch (err: any) {
                                   alert(`Failed to dismiss report: ${err?.message || "Unknown error"}`);
                                 }
                               }}
                               className="p-2 text-text-body/55 hover:text-text-body hover:bg-bg-main rounded-lg transition-all"
                               title="Dismiss Report"
                             >
                                <X className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={async () => {
                                 if (window.confirm("Are you sure you want to delete this content? ")) {
                                   try {
                                     await removeDocument(report.targetPath.split('/')[0], report.targetId);
                                     await updateDocument("reports", report.id, { status:"resolved", updatedAt: serverTimestamp() });
                                   } catch (err) {
                                     console.error("Moderation action failed:", err);
                                     // Fallback for subcollections or complex paths
                                     const pathParts = report.targetPath.split('/');
                                     if (pathParts.length > 2) {
                                        await removeDocument(report.targetPath.replace(`/${report.targetId}`, ''), report.targetId);
                                        await updateDocument("reports", report.id, { status:"resolved", updatedAt: serverTimestamp() });
                                     }
                                   }
                                 }
                               }}
                               className="px-3 py-1.5 bg-red-600 text-white eyebrow tabular rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-lg shadow-red-100"
                             >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Content
                             </button>
                          </div>
                        )}
                        {report.status !== 'pending' && (
                           <button 
                              onClick={async () => {
                                if (!window.confirm("Delete this report?")) return;
                                try {
                                  await removeDocument("reports", report.id);
                                } catch (err: any) {
                                  alert(`Failed to delete report: ${err?.message || "Unknown error"}`);
                                }
                              }}
                              className="p-2 text-text-body/30 hover:text-rust transition-all"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <Check className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
                        <p className="text-text-body/55 italic text-lg tracking-tight">Queue is empty. Community standards are maintained.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "theme" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="theme" className="max-w-4xl mx-auto">
            <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <h2 className="text-2xl font-medium text-text-heading mb-8 flex items-center gap-3">
                <Palette className="w-6 h-6 text-accent" /> Visual Identity
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Primary Brand Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.primaryColor} 
                        onChange={(e) => setThemeData({...themeData, primaryColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.primaryColor} 
                        onChange={(e) => setThemeData({...themeData, primaryColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm focus:border-text-heading outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Secondary UI Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.secondaryColor} 
                        onChange={(e) => setThemeData({...themeData, secondaryColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.secondaryColor} 
                        onChange={(e) => setThemeData({...themeData, secondaryColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm focus:border-text-heading outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Accent Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.accentColor} 
                        onChange={(e) => setThemeData({...themeData, accentColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.accentColor} 
                        onChange={(e) => setThemeData({...themeData, accentColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Interface Background</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.backgroundColor} 
                        onChange={(e) => setThemeData({...themeData, backgroundColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.backgroundColor} 
                        onChange={(e) => setThemeData({...themeData, backgroundColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Heading Text</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.headingColor} 
                        onChange={(e) => setThemeData({...themeData, headingColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.headingColor} 
                        onChange={(e) => setThemeData({...themeData, headingColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Body Text Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.bodyTextColor} 
                        onChange={(e) => setThemeData({...themeData, bodyTextColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.bodyTextColor} 
                        onChange={(e) => setThemeData({...themeData, bodyTextColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Surface/Card Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.cardBackgroundColor} 
                        onChange={(e) => setThemeData({...themeData, cardBackgroundColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.cardBackgroundColor} 
                        onChange={(e) => setThemeData({...themeData, cardBackgroundColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Global Border Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.borderColor} 
                        onChange={(e) => setThemeData({...themeData, borderColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.borderColor} 
                        onChange={(e) => setThemeData({...themeData, borderColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Sidebar Focus/Promo color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.sidebarFocusColor ||"#0f172a"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.sidebarFocusColor ||"#0f172a"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Sidebar Focus Text</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.sidebarFocusTextColor ||"#ffffff"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusTextColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.sidebarFocusTextColor ||"#ffffff"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusTextColor: e.target.value})}
                        className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-3 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="eyebrow tabular text-text-body/55 block">Brand Logo & Identity</label>
                       <span className="eyebrow tabular text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">Required for Headers</span>
                    </div>
                    
                    <div className="flex items-center gap-6 p-6 bg-bg-main border border-border-main rounded-2xl mb-4 group transition-all hover:bg-bg-main/50 relative overflow-hidden">
                       <div className="w-16 h-16 bg-bg-card border border-border-main rounded-2xl flex items-center justify-center p-2 shadow-sm overflow-hidden relative z-10 group/logo">
                         {isLogoUploading ? (
                           <Loader2 className="w-6 h-6 animate-spin text-primary" />
                         ) : themeData.logoUrl ? (
                           <img src={themeData.logoUrl} className="w-full h-full object-contain" alt="Logo Preview" />
                         ) : (
                           <Building2 className="w-8 h-8 text-text-body/30" />
                         )}
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={(e) => handleFileUpload(e, "themeLogo")}
                           className="absolute inset-0 opacity-0 cursor-pointer z-20"
                         />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity z-10">
                            <Plus className="w-6 h-6 text-white" />
                         </div>
                       </div>
                       <div className="flex-1 space-y-1 relative z-10">
                          <p className="eyebrow tabular text-text-heading uppercase">Site Identity Icon</p>
                          <p className="text-[9px] text-text-body/55 uppercase leading-relaxed">
                            Recommended Size: <span className="text-text-heading">50 x 50 px</span> (Square Icon)<br/>
                            This icon will render to the left of the site identity.<br/>
                            Background: Transparent PNG preferred.
                          </p>
                          <div className="mt-2 eyebrow tabular text-primary uppercase">
                            Click logo area to upload
                          </div>
                       </div>
                    </div>

                    <div className="relative mb-6">
                      <label className="eyebrow tabular text-text-body/55 mb-2 block">Or Use Remote Logo URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/55" />
                        <input 
                          type="url" 
                          placeholder="https://yourbrand.com/logo.png"
                          value={themeData.logoUrl}
                          onChange={(e) => setThemeData({...themeData, logoUrl: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:border-text-heading transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Dark-background logo — a light/white version shown on dark
                        surfaces (splash, login panel). The primary logo above is
                        for light surfaces (nav on paper); a single logo can't
                        serve both, so this is the second variant. */}
                    <div className="flex items-center gap-6 p-6 bg-primary border border-border-main rounded-2xl mb-4 group transition-all relative overflow-hidden">
                       <div className="w-16 h-16 bg-primary border border-white/20 rounded-2xl flex items-center justify-center p-2 shadow-sm overflow-hidden relative z-10 group/logod">
                         {isLogoUploading ? (
                           <Loader2 className="w-6 h-6 animate-spin text-white" />
                         ) : themeData.logoUrlDark ? (
                           <img src={themeData.logoUrlDark} className="w-full h-full object-contain" alt="Dark-bg Logo Preview" />
                         ) : (
                           <Building2 className="w-8 h-8 text-white/30" />
                         )}
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={(e) => handleFileUpload(e, "themeLogoDark")}
                           className="absolute inset-0 opacity-0 cursor-pointer z-20"
                         />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logod:opacity-100 flex items-center justify-center transition-opacity z-10">
                            <Plus className="w-6 h-6 text-white" />
                         </div>
                       </div>
                       <div className="flex-1 space-y-1 relative z-10">
                          <p className="eyebrow tabular text-white uppercase">Dark-Background Logo</p>
                          <p className="text-[9px] text-white/60 uppercase leading-relaxed">
                            The <span className="text-white">light / white</span> version of your logo.<br/>
                            Shown on the splash screen and login panel.<br/>
                            Upload your white PNG here.
                          </p>
                          <div className="mt-2 eyebrow tabular text-accent uppercase">
                            Click logo area to upload
                          </div>
                       </div>
                    </div>

                    <div className="relative mb-6">
                      <label className="eyebrow tabular text-text-body/55 mb-2 block">Or Use Remote Dark-Logo URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/55" />
                        <input 
                          type="url" 
                          placeholder="https://yourbrand.com/logo-white.png"
                          value={themeData.logoUrlDark || ""}
                          onChange={(e) => setThemeData({...themeData, logoUrlDark: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:border-text-heading transition-all font-medium"
                        />
                      </div>
                    </div>
                    
                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Application Site Name</label>
                    <input 
                      type="text" 
                      placeholder="My Digital Sector"
                      value={themeData.siteName}
                      onChange={(e) => setThemeData({...themeData, siteName: e.target.value})}
                      className="w-full px-4 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:border-text-heading transition-all mb-4"
                    />

                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Site Tagline / Headline</label>
                    <input 
                      type="text" 
                      placeholder="Verified Network Identity"
                      value={themeData.siteTagline}
                      onChange={(e) => setThemeData({...themeData, siteTagline: e.target.value})}
                      className="w-full px-4 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:border-text-heading transition-all mb-4"
                    />

                    <label className="eyebrow tabular text-text-body/55 mb-2 block">Header Display Strategy</label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['image_only', 'text_only', 'both'] as const).map(mode => (
                         <button
                           key={mode}
                           onClick={() => setThemeData({...themeData, displayMode: mode})}
                           className={`p-3 rounded-xl border eyebrow tabular transition-all ${
                             themeData.displayMode === mode 
                               ? "text-white border-transparent shadow-lg" 
                               : "bg-bg-card text-text-body/55 border-border-main hover:border-border-main"
                           }`}
                           style={themeData.displayMode === mode ? { backgroundColor: themeData.primaryColor } : {}}
                         >
                           {mode.replace('_', ' ')}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="p-6 bg-bg-main rounded-2xl border border-border-main">
                    <p className="eyebrow tabular text-text-body/55 mb-4 text-center">Identity Signature Preview</p>
                    <div className="bg-bg-card border border-border-main rounded-2xl p-6 flex items-center justify-center gap-4 shadow-sm mb-6">
                       {themeData.displayMode !== 'text_only' && (
                         <div className={`rounded-2xl flex items-center justify-center transition-all shrink-0 overflow-hidden ${themeData.logoUrl ? "h-12 min-w-[48px] px-1 shadow-sm border border-slate-50" : "w-10 h-10 bg-primary shadow-lg"}`}>
                            {themeData.logoUrl ? (
                              <img src={themeData.logoUrl} className="h-10 w-auto object-contain" alt="Logo" />
                            ) : (
                              <LayoutDashboard className="text-white w-6 h-6" />
                            )}
                         </div>
                       )}
                       {themeData.displayMode !== 'image_only' && (
                         <div className="flex flex-col">
                            <span className="font-medium text-text-heading text-xl uppercase leading-none">
                              {themeData.siteName ||"DIRECTORY"}
                            </span>
                            <span className="text-[8px] font-medium text-primary mt-0.5">
                              {themeData.siteTagline ||"Verified Network Identity"}
                            </span>
                         </div>
                       )}
                    </div>
                    <div className="space-y-4">
                      <p className="eyebrow tabular text-text-body/55 text-center">Swatch Pulse</p>
                      <div className="flex justify-center gap-4">
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl shadow-lg transition-transform hover:scale-110 border border-white" style={{ backgroundColor: themeData.primaryColor }}></div>
                            <span className="text-[8px] font-medium text-text-body/55 uppercase">Primary</span>
                         </div>
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl shadow-lg transition-transform hover:scale-110 border border-white" style={{ backgroundColor: themeData.secondaryColor }}></div>
                            <span className="text-[8px] font-medium text-text-body/55 uppercase">Secondary</span>
                         </div>
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl shadow-lg transition-transform hover:scale-110 border border-white" style={{ backgroundColor: themeData.accentColor }}></div>
                            <span className="text-[8px] font-medium text-text-body/55 uppercase">Accent</span>
                         </div>
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col gap-3">
                       <button className="w-full py-3 rounded-xl font-medium text-[10px] text-white shadow-lg transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: themeData.primaryColor }}>Primary Action Button</button>
                       <button className="w-full py-3 rounded-xl font-medium text-[10px] text-white shadow-lg transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: themeData.secondaryColor }}>Interface Accent</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleSaveTheme}
                  disabled={savingTheme}
                  className={`px-10 py-5 rounded-2xl font-medium flex items-center gap-3 transition-all shadow-sm active:scale-95 disabled:opacity-50 text-white ${themeSavedSuccessfully ? "bg-emerald-500" : ""}`}
                  style={!themeSavedSuccessfully ? { backgroundColor: themeData.primaryColor } : {}}
                  id="save-branding-button"
                >
                  {savingTheme ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : themeSavedSuccessfully ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Save className="w-6 h-6" />
                  )}
                  {themeSavedSuccessfully ? "Saved Successfully!" : "Save All Branding Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        )}



        {activeTab === "news" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="news" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm">
                <h2 className="font-bold text-text-heading mb-4 flex items-center gap-2">Curate News</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/55" />
                    <input 
                      type="url" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste article URL..."
                      className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border-main rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                    />
                  </div>
                  <button onClick={handleExtract} disabled={extracting || !url.trim()} className="w-full bg-primary text-white py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50">
                    {extracting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Extract Metadata"}
                  </button>
                  {preview && (
                    <div className="pt-4 border-t border-border-main space-y-4">
                       <input type="text" value={preview.title} onChange={(e) => setPreview({...preview, title: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                       <textarea value={preview.description} onChange={(e) => setPreview({...preview, description: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm h-24 resize-none" />
                       <button onClick={handleCreateNews} className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 italic">Publish News</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm">
               <div className="p-4 bg-bg-main border-b border-border-main text-xs text-text-body/55">Curated Stream</div>
               <div className="divide-y divide-border-main">
                  {recentNews.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-bg-main transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-bg-main rounded-lg flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-text-body/55" />
                        </div>
                        <div>
                          <p className="font-bold text-text-heading text-sm line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-text-body/55 uppercase">{item.source}</p>
                        </div>
                      </div>
                      <button onClick={async () => {
                        if (!window.confirm(`Delete "${item.title}"?`)) return;
                        try {
                          await removeDocument("news", item.id);
                        } catch (err: any) {
                          alert(`Failed to delete news item: ${err?.message || "Unknown error"}`);
                        }
                      }} className="p-2 text-text-body/40 hover:text-rust transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === "forums" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="forums" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm space-y-4">
                <h2 className="font-bold text-text-heading mb-4">Start Forum Topic</h2>
                <input placeholder="Topic Title" value={forumTitle} onChange={(e) => setForumTitle(e.target.value)} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                <label className="eyebrow tabular text-text-body/55 block mb-1">Categories</label>
                <CategorySelector 
                  categories={categories} 
                  selectedIds={forumCategoryIds} 
                  onChange={setForumCategoryIds} 
                />
                <button onClick={handleCreateForum} className="w-full bg-primary text-white py-3 rounded-xl hover:brightness-110 shadow-lg">Activate Topic</button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm divide-y divide-border-main">
              {forumTopics.map(topic => (
                <div key={topic.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-text-heading">{topic.title}</p>
                    <p className="text-[10px] text-text-body/55">{topic.category}</p>
                  </div>
                  <button onClick={async () => {
                        if (!window.confirm(`Delete "${topic.title}"? Note: existing replies are not deleted and will become orphaned.`)) return;
                        try {
                          await removeDocument("forum_topics", topic.id);
                        } catch (err: any) {
                          alert(`Failed to delete topic: ${err?.message || "Unknown error"}`);
                        }
                      }} className="p-2 text-text-body/40 hover:text-rust transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "events" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="events" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-text-heading">{editingEventId ? "Edit Event" : "Post Official Event"}</h2>
                  {editingEventId && (
                    <button onClick={cancelEditEvent} className="eyebrow tabular text-text-body/55 hover:text-rust transition-colors">
                      Cancel edit
                    </button>
                  )}
                </div>
                <div>
                  <label className="eyebrow tabular text-text-body/55 mb-1 block">Title</label>
                  <input placeholder="Event Title" value={eventData.title} onChange={(e) => setEventData({...eventData, title: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                </div>

                <div>
                  <label className="eyebrow tabular text-text-body/55 mb-1 block">Dates</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-text-body/55 mb-1 block">Start date</span>
                      <input type="date" value={eventData.date} onChange={(e) => setEventData({...eventData, date: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                    </div>
                    <div>
                      <span className="text-[11px] text-text-body/55 mb-1 block">End date <span className="text-text-body/40">(opt.)</span></span>
                      <input type="date" value={eventData.endDate} min={eventData.date || undefined} onChange={(e) => setEventData({...eventData, endDate: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                    </div>
                  </div>
                  {eventData.endDate && eventData.endDate !== eventData.date && (
                    <p className="eyebrow tabular text-accent mt-2">
                      Multi-day event · {Math.round((new Date(eventData.endDate).getTime() - new Date(eventData.date).getTime()) / 86400000) + 1} days
                    </p>
                  )}
                </div>

                <div>
                  <label className="eyebrow tabular text-text-body/55 mb-1 block">Times <span className="text-text-body/40">(optional)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-text-body/55 mb-1 block">Start</span>
                      <input type="time" value={eventData.time} onChange={(e) => setEventData({...eventData, time: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                    </div>
                    <div>
                      <span className="text-[11px] text-text-body/55 mb-1 block">End</span>
                      <input type="time" value={eventData.endTime} onChange={(e) => setEventData({...eventData, endTime: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="eyebrow tabular text-text-body/55 mb-1 block">Logistics & Visuals</label>
                  <div className="space-y-4">
                    <input placeholder="Location (City, Country or Virtual)" value={eventData.location} onChange={(e) => setEventData({...eventData, location: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                    
                    <div className="flex items-center gap-4 p-4 bg-bg-main border border-border-main rounded-xl group transition-all hover:bg-bg-main/50 relative overflow-hidden">
                       <div className="w-16 h-12 bg-bg-card border border-border-main rounded-lg flex items-center justify-center shadow-sm overflow-hidden relative z-10 group/img">
                         {isEventUploading ? (
                           <Loader2 className="w-5 h-5 animate-spin text-primary" />
                         ) : eventData.imageUrl ? (
                           <img src={eventData.imageUrl} className="w-full h-full object-cover" alt="Event Preview" />
                         ) : (
                           <Calendar className="w-6 h-6 text-text-body/30" />
                         )}
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={(e) => handleFileUpload(e, "eventImage")}
                           className="absolute inset-0 opacity-0 cursor-pointer z-20"
                         />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-10">
                            <Plus className="w-4 h-4 text-white" />
                         </div>
                       </div>
                       <div className="flex-1">
                          <p className="eyebrow tabular text-text-heading uppercase">Event Image</p>
                          <p className="text-[8px] text-text-body/55 uppercase leading-relaxed">
                            Click to upload or use URL below
                          </p>
                       </div>
                    </div>

                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/55" />
                      <input placeholder="Or Paste Image URL" value={eventData.imageUrl} onChange={(e) => setEventData({...eventData, imageUrl: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border-main rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="eyebrow tabular text-text-body/55 mb-1 block">Classification (Select Multiple)</label>
                  <CategorySelector 
                    categories={categories} 
                    selectedIds={eventData.categoryIds} 
                    onChange={(ids) => setEventData({...eventData, categoryIds: ids})} 
                  />
                </div>

                <div>
                  <label className="eyebrow tabular text-text-body/55 mb-1 block">Call to Action (CTA)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Button Text" value={eventData.ctaText} onChange={(e) => setEventData({...eventData, ctaText: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs" />
                    <input placeholder="Link URL" value={eventData.ctaUrl} onChange={(e) => setEventData({...eventData, ctaUrl: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs" />
                  </div>
                </div>

                <textarea placeholder="Full Description..." value={eventData.description} onChange={(e) => setEventData({...eventData, description: e.target.value})} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm h-24 resize-none shadow-inner" />
                <button onClick={handleCreateEvent} className="w-full bg-primary text-white font-medium py-4 rounded-xl hover:brightness-110 shadow-lg text-xs flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" /> {editingEventId ? "Update Event" : "Add to Calendar"}
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm divide-y divide-border-main">
                {events.map(event => (
                  <div key={event.id} className="p-4 flex items-center justify-between hover:bg-bg-main transition-colors">
                    <div className="flex items-center gap-4">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} className="w-16 h-12 object-cover rounded-lg bg-bg-main" />
                      ) : (
                        <div className="w-16 h-12 bg-bg-main rounded-lg flex items-center justify-center text-text-body/40">
                          <Calendar className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-text-heading">{event.title}</p>
                        <p className="text-[10px] text-text-body/55 flex items-center gap-2">
                          {event.endDate && event.endDate !== event.date
                            ? `${event.date} → ${event.endDate}`
                            : event.date} • {event.location}
                          {event.categoryId && (
                            <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded ml-2">
                              {categories.find((c: any) => c.id === event.categoryId)?.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditEvent(event)} className={`p-2 transition-colors ${editingEventId === event.id ? "text-accent" : "text-text-body/40 hover:text-accent"}`} title="Edit event">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={async () => {
                      if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
                      try {
                        await removeDocument("events", event.id);
                      } catch (err: any) {
                        alert(`Failed to delete event: ${err?.message || "Unknown error"}`);
                      }
                    }} className="p-2 text-text-body/40 hover:text-rust transition-colors" title="Delete event">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="p-12 text-center text-text-body/55 italic">No official events scheduled.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "surveys" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="surveys" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm space-y-4">
                <h2 className="font-bold text-text-heading mb-4">Create Pulse Check</h2>
                <input placeholder="Pulse Question" value={surveyQuestion} onChange={(e) => setSurveyQuestion(e.target.value)} className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm" />
                <div className="space-y-2">
                   <p className="eyebrow tabular text-text-body/55 tracking-widest mb-2">Options</p>
                   {surveyOptions.map((opt, i) => (
                     <div key={i} className="flex gap-2">
                       <input value={opt} onChange={(e) => {
                          const newOpts = [...surveyOptions];
                          newOpts[i] = e.target.value;
                          setSurveyOptions(newOpts);
                       }} placeholder={`Option ${i+1}`} className="flex-1 p-2 bg-bg-main border border-border-main rounded-lg text-sm" />
                       {surveyOptions.length > 2 && (
                         <button onClick={() => setSurveyOptions(surveyOptions.filter((_, idx) => idx !== i))} className="p-2 text-rust"><X className="w-4 h-4" /></button>
                       )}
                     </div>
                   ))}
                   <button onClick={() => setSurveyOptions([...surveyOptions, ""])} className="eyebrow tabular text-accent uppercase mt-2 hover:opacity-70 transition-opacity whitespace-nowrap">+ Add Option</button>
                </div>
                <button onClick={handleCreateSurvey} className="w-full bg-primary text-white py-3 rounded-xl hover:brightness-110 shadow-lg">Initiate Survey</button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm divide-y divide-border-main">
               {surveys.map(survey => (
                 <div key={survey.id} className="p-6 transition-all hover:bg-bg-main/50">
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex-1">
                       <p className="font-bold text-text-heading text-base mb-1">{survey.question}</p>
                       <p className="text-[10px] text-text-body/55 font-medium flex items-center gap-2">
                         <Clock className="w-3 h-3" /> {survey.createdAt?.seconds ? format(survey.createdAt.seconds * 1000, 'MMM d, yyyy') : '-'} • {survey.totalVotes || 0} TOTAL VOTES
                       </p>
                     </div>
                     <button onClick={async () => {
                     if (!window.confirm(`Delete "${survey.question}"? Note: existing votes are not deleted and will become orphaned.`)) return;
                     try {
                       await removeDocument("surveys", survey.id);
                     } catch (err: any) {
                       alert(`Failed to delete survey: ${err?.message || "Unknown error"}`);
                     }
                   }} className="p-2 text-text-body/40 hover:text-rust transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                     {survey.options?.map((option: any, idx: number) => {
                       const percentage = survey.totalVotes > 0 ? Math.round((option.votes / survey.totalVotes) * 100) : 0;
                       return (
                         <div key={idx} className="space-y-1">
                           <div className="flex justify-between items-center text-[11px]">
                             <span className="text-text-body line-clamp-1">{option.text}</span>
                             <span className="text-text-heading">{option.votes} ({percentage}%)</span>
                           </div>
                           <div className="h-2 w-full bg-bg-main rounded-full overflow-hidden border border-border-main/50">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${percentage}%` }}
                               transition={{ duration: 1, ease:"easeOut" }}
                               className={`h-full rounded-full ${
                                 idx % 3 === 0 ? "bg-indigo-500" : idx % 3 === 1 ? "bg-emerald-500" : "bg-orange-500"
                               }`}
                             />
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               ))}
               {surveys.length === 0 && (
                 <div className="p-12 text-center text-text-body/55 italic">No surveys initiated yet.</div>
                )}
             </div>
          </motion.div>
       )}

        {activeTab === "members" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="members" className="space-y-6">
            <div className="bg-bg-card p-4 rounded-2xl border border-border-main shadow-sm flex items-center gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/55" />
                 <input 
                   type="text" 
                   value={searchMember}
                   onChange={(e) => setSearchMember(e.target.value)}
                   placeholder="Search members by name, email, or title..."
                   className="w-full pl-12 pr-4 py-3 bg-bg-main border border-border-main rounded-xl text-sm outline-none focus:bg-bg-card focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                 />
               </div>
               <div className="text-right shrink-0 px-4">
                 <p className="eyebrow tabular text-text-body/55">Total Network</p>
                 <p className="font-display text-2xl text-text-heading">{members.length}</p>
               </div>
            </div>

            <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm divide-y divide-border-main overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-bg-main eyebrow tabular text-text-body/55">
                    <tr>
                      <th className="px-6 py-4">Professional</th>
                      <th className="px-6 py-4">Affiliation</th>
                      <th className="px-6 py-4">Industry Segment</th>
                      <th className="px-6 py-4">Bio / Summary</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Auth Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-bg-main transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <img src={member.photoURL} className="w-10 h-10 rounded-full border border-border-main bg-bg-main" />
                              <div>
                                <p className="font-bold text-text-heading flex items-center gap-1.5">
                                  {member.displayName}
                                  {member.isAdmin && <Shield className="w-3 h-3 text-indigo-500" />}
                                </p>
                                <p className="text-xs text-text-body/55 font-medium flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-700 flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-text-body/55" /> {member.jobTitle ||"-"}</p>
                           <p className="text-xs text-text-body/55 flex items-center gap-1.5"><Building2 className="w-3 h-3 text-text-body/55" /> {member.company ||"-"}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-1 bg-bg-main text-text-body rounded-md eyebrow tabular">
                             {member.industrySegment ||"Not Specified"}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs text-text-body max-w-xs truncate italic">{member.bio ||"No biography provided."}</p>
                        </td>
                        <td className="px-6 py-4">
                           <button
                             onClick={async () => {
                               const grant = !member.isPro;
                               if (!window.confirm(`${grant ? "Grant" : "Revoke"} Pro for ${member.displayName || member.email}?`)) return;
                               try {
                                 await updateDocument("users", member.id, { isPro: grant, updatedAt: serverTimestamp() });
                               } catch (err: any) {
                                 alert(`Failed to update Pro status: ${err?.message || "Unknown error"}`);
                               }
                             }}
                             className={`eyebrow tabular px-2.5 py-1 rounded-full border transition-all ${
                               member.isPro
                                 ? "bg-accent/10 text-accent border-accent/30 hover:bg-rust/10 hover:text-rust hover:border-rust/30"
                                 : "bg-bg-main text-text-body/45 border-border-main hover:text-accent hover:border-accent/30"
                             }`}
                             title={member.isPro ? "Click to revoke Pro" : "Click to grant Pro"}
                           >
                             {member.isPro ? "PRO" : "Free"}
                           </button>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <p className="eyebrow tabular uppercase text-text-body/40 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> Registered: {member.createdAt?.seconds ? format(member.createdAt.seconds * 1000, 'MMM d, yyyy') : '-'}
                              </p>
                              <p className="eyebrow tabular uppercase text-text-body/40 flex items-center gap-1">
                                <Shield className="w-2.5 h-2.5" /> UID: {member.uid?.substring(0, 12)}...
                              </p>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}
        {activeTab === "groups" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="groups" className="space-y-8">
            <div className="bg-bg-card rounded-2xl border border-border-main shadow-sm overflow-hidden">
               <div className="p-8 border-b border-border-main flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-medium text-text-heading uppercase">Community Moderator</h2>
                    <p className="eyebrow tabular text-text-body/55 mt-1">Review and approve industry groups</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="bg-bg-main px-4 py-2 rounded-xl eyebrow tabular text-text-body">
                       {groups.filter((g: any) => g.status === 'pending').length} Pending Requests
                     </span>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-bg-main eyebrow tabular text-text-body/55">
                     <tr>
                       <th className="px-6 py-4">Group Identity</th>
                       <th className="px-6 py-4">Creator</th>
                       <th className="px-6 py-4">Privacy</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border-main">
                     {groups.map((group: any) => (
                       <tr key={group.id} className="hover:bg-bg-main transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center overflow-hidden">
                               {group.iconUrl ? <img src={group.iconUrl} className="w-full h-full object-contain" /> : <Users className="w-6 h-6 text-text-body/40" />}
                             </div>
                             <div>
                               <p className="font-bold text-text-heading">{group.name}</p>
                               <p className="text-xs text-text-body/55 truncate max-w-xs">{group.description}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="font-bold text-slate-700">{group.creatorName || group.creatorUid.substring(0, 8)}</span>
                         </td>
                         <td className="px-6 py-4">
                            {group.isPrivate ? (
                              <span className="flex items-center gap-1.5 text-rust text-[10px] uppercase">
                                <Lock className="w-3 h-3" /> Private
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-accent text-[10px] uppercase">
                                <Globe className="w-3 h-3" /> Public
                              </span>
                            )}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full eyebrow tabular ${
                              group.status === 'approved' ? 'bg-accent/10 text-accent' : 
                              group.status === 'pending' ? 'bg-rust/10 text-rust' : 'bg-rust/5 text-rust'
                            }`}>
                              {group.status || 'pending'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               {group.status !== 'approved' && (
                                 <button 
                                   onClick={async () => {
                                     try {
                                       await updateDocument("groups", group.id, { status:"approved" });
                                     } catch (err: any) {
                                       alert(`Failed to approve group: ${err?.message || "Unknown error"}`);
                                     }
                                   }}
                                   className="p-2 bg-accent/10 text-accent hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                                   title="Approve"
                                 >
                                    <Check className="w-4 h-4" />
                                 </button>
                               )}
                               <button 
                                 onClick={async () => {
                                   if (!window.confirm(`Delete "${group.name}"? Note: existing posts and comments are not deleted and will become orphaned.`)) return;
                                   try {
                                     await removeDocument("groups", group.id);
                                   } catch (err: any) {
                                     alert(`Failed to delete group: ${err?.message || "Unknown error"}`);
                                   }
                                 }}
                                 className="p-2 bg-rust/5 text-rust hover:bg-rust hover:text-white rounded-xl transition-all"
                                 title="Delete"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {activeTab === "jobs" && (
          <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-text-heading">Job Board</h2>
                <p className="text-xs text-text-body/55 mt-1 font-medium">{adminJobs.length} listing{adminJobs.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex gap-2">
                {(["all", "open", "closed"] as const).map(f => (
                  <button key={f} onClick={() => setJobStatusFilter(f)}
                    className={`px-3 py-1.5 eyebrow tabular rounded-xl transition-all ${
                      jobStatusFilter === f ? "bg-text-heading text-bg-card" : "bg-bg-card border border-border-main text-text-body hover:text-text-heading"
                    }`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Job list — left 3 cols */}
              <div className="lg:col-span-3 space-y-3">
                {loadingAdminJobs ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-bg-card border border-border-main rounded-2xl animate-pulse" />)}</div>
                ) : adminJobs.filter(j => jobStatusFilter === "all" || j.status === jobStatusFilter).length === 0 ? (
                  <div className="bg-bg-card border border-dashed border-border-main rounded-2xl p-12 text-center">
                    <Briefcase className="w-10 h-10 text-text-body/25 mx-auto mb-3" />
                    <p className="eyebrow tabular text-text-body/55">No listings yet</p>
                  </div>
                ) : (
                  adminJobs.filter(j => jobStatusFilter === "all" || j.status === jobStatusFilter).map((job: any) => {
                    const matchCount = jobMatches.filter((m: any) => m.jobId === job.id).length;
                    const isMatching = matchingJob?.id === job.id;
                    return (
                      <div key={job.id} className={`bg-bg-card border rounded-2xl p-5 transition-all ${isMatching ? "border-accent shadow-md shadow-accent/10" : "border-border-main"}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-bg-main rounded-xl border border-border-main flex items-center justify-center shrink-0 overflow-hidden">
                            {job.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-contain" alt="" /> : <Building2 className="w-4 h-4 text-text-body/40" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-text-heading leading-tight">{job.title}</p>
                                <p className="text-xs text-text-body/55 mt-0.5">{job.companyName}</p>
                              </div>
                              <span className={`eyebrow tabular px-2 py-0.5 rounded-full shrink-0 ${
                                job.status === "open" ? "bg-accent/10 text-accent" : "bg-bg-main text-text-body/55"
                              }`}>
                                {job.status || "open"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              {job.type && <span className="eyebrow tabular text-text-body/55">{job.type}</span>}
                              {job.location && <span className="eyebrow tabular text-text-body/55 flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                              {job.salary && <span className="eyebrow tabular text-text-body/55">{job.salary}</span>}
                              {matchCount > 0 && (
                                <span className="eyebrow tabular text-accent flex items-center gap-1">
                                  <Users className="w-3 h-3" />{matchCount} matched
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-main">
                          <button
                            onClick={() => setMatchingJob(isMatching ? null : job)}
                            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium transition-all ${
                              isMatching ? "bg-accent text-white" : "bg-accent/10 text-accent hover:bg-accent hover:text-white"
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            {isMatching ? "Close panel" : "Match candidates"}
                          </button>
                          <button
                            onClick={() => handleToggleJobStatus(job)}
                            className="px-3 py-2 rounded-xl bg-bg-main border border-border-main text-text-body/55 hover:text-text-heading text-[12px] eyebrow tabular transition-all"
                            title={job.status === "open" ? "Close listing" : "Reopen listing"}
                          >
                            {job.status === "open" ? "Close" : "Reopen"}
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            className="p-2 text-text-body/30 hover:text-rust hover:bg-rust/5 rounded-xl transition-all"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Matching panel — right 2 cols */}
              <div className="lg:col-span-2">
                {matchingJob ? (
                  <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden sticky top-6">
                    <div className="p-4 bg-bg-main border-b border-border-main">
                      <p className="eyebrow tabular text-accent mb-0.5">MATCHING FOR</p>
                      <p className="font-bold text-text-heading leading-tight line-clamp-1">{matchingJob.title}</p>
                      <p className="text-xs text-text-body/55">{matchingJob.companyName}</p>
                    </div>

                    {/* Candidate resumes filtered by job category */}
                    <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
                      <p className="eyebrow tabular text-text-body/55 mb-2">CANDIDATES · RANKED BY MATCH SCORE</p>
                      {(() => {
                        const alreadyMatchedUids = jobMatches.filter((m: any) => m.jobId === matchingJob.id).map((m: any) => m.userUid);
                        // Score every unmatched resume against this job (10-point rubric:
                        // domain 4, role 2, skills 2, location 1, credentials 1), best first.
                        const candidateResumes = resumes
                          .filter((r: any) => !alreadyMatchedUids.includes(r.userUid))
                          .map((r: any) => ({ ...r, _match: scoreMatch(matchingJob, r, matchWeights) }))
                          .sort((a: any, b: any) => b._match.total - a._match.total);
                        if (resumes.length === 0) return (
                          <p className="text-xs text-text-body/55 text-center py-4">Loading resumes…</p>
                        );
                        if (candidateResumes.length === 0) return (
                          <div className="text-center py-6">
                            <p className="eyebrow tabular text-text-body/45 mb-1">NO CANDIDATES</p>
                            <p className="text-xs text-text-body/55">Every resume is already matched to this job, or none exist yet.</p>
                          </div>
                        );
                        return candidateResumes.map((resume: any) => (
                          <div key={resume.id} className="p-3 bg-bg-main rounded-xl border border-border-main">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border-main flex items-center justify-center shrink-0 overflow-hidden">
                                {resume.photoUrl ? <img src={resume.photoUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-[11px] font-bold text-text-heading">{resume.fullName?.charAt(0)}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text-heading leading-tight">{resume.fullName}</p>
                                {resume.currentJob?.title && (
                                  <p className="text-xs text-text-body/55 truncate">{resume.currentJob.title}{resume.currentJob.company ? ` · ${resume.currentJob.company}` : ""}</p>
                                )}
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="eyebrow tabular text-accent text-[9px]">
                                    {taxonomyNodes.find((n: any) => n.id === resume.taxRole)?.name || resume.categoryName}
                                  </span>
                                  <span
                                    className={`eyebrow tabular text-[9px] px-1.5 py-0.5 rounded-full ${
                                      resume._match.total >= 70 ? "bg-emerald-100 text-emerald-700" :
                                      resume._match.total >= 40 ? "bg-accent/10 text-accent" :
                                      "bg-bg-main text-text-body/55"
                                    }`}
                                    title={`Role ${Math.round(resume._match.role)} · Domain ${Math.round(resume._match.domain)} · Certs ${Math.round(resume._match.certifications)} · Competencies ${Math.round(resume._match.competencies)} · Standards ${Math.round(resume._match.standards)} · Industry ${Math.round(resume._match.industry)} · Equipment ${Math.round(resume._match.equipment)}`}
                                  >
                                    {resume._match.total}/100 match
                                  </span>
                                  {resume._match.mustHaveMissing && (
                                    <span className="eyebrow tabular text-[9px] px-1.5 py-0.5 rounded-full bg-rust/10 text-rust">missing must-have</span>
                                  )}
                                </div>
                                {resume._match.flags?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {resume._match.flags.map((f: string, fi: number) => (
                                      <span key={fi} className="text-[9px] px-1.5 py-0.5 rounded bg-bg-main text-text-body/60 border border-border-main">{f}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setConfirmMatchResume(resume)}
                                className="shrink-0 px-2.5 py-1.5 bg-accent text-white rounded-lg text-[11px] eyebrow tabular hover:brightness-110 transition-all"
                              >
                                Suggest
                              </button>
                            </div>
                            {resume.aboutMe && (
                              <p className="text-[11px] text-text-body/55 mt-2 leading-relaxed line-clamp-2">{resume.aboutMe}</p>
                            )}
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Existing matches for this job */}
                    {jobMatches.filter((m: any) => m.jobId === matchingJob.id).length > 0 && (
                      <div className="border-t border-border-main p-4">
                        <p className="eyebrow tabular text-text-body/55 mb-3">APPLICATIONS & MATCHES</p>
                        <div className="space-y-2">
                          {jobMatches
                            .filter((m: any) => m.jobId === matchingJob.id)
                            .sort((a: any, b: any) => (a.status === "applied" ? -1 : 0) - (b.status === "applied" ? -1 : 0))
                            .map((match: any) => (
                            <div key={match.id} className={`p-2.5 rounded-lg ${match.status === "applied" ? "bg-blueprint/5 border border-blueprint/20" : "bg-bg-main"}`}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="text-xs font-bold text-text-heading truncate">{match.userName}</p>
                                  {match.status === "applied" && (
                                    <span className="eyebrow tabular text-[9px] px-1.5 py-0.5 rounded-full bg-blueprint/10 text-blueprint shrink-0">★ APPLIED</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`eyebrow tabular text-[9px] px-1.5 py-0.5 rounded-full ${
                                    match.status === "applied" ? "bg-blueprint/10 text-blueprint" :
                                    match.status === "suggested" ? "bg-rust/10 text-rust" :
                                    match.status === "accepted" ? "bg-accent/10 text-accent" :
                                    match.status === "hired" ? "bg-emerald-100 text-emerald-700" :
                                    "bg-bg-card text-text-body/55"
                                  }`}>{match.status}</span>
                                  <button onClick={() => handleRemoveMatch(match.id)} className="p-1 text-text-body/30 hover:text-rust transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {match.coverNote && (
                                <p className="text-[11px] text-text-body/70 mt-1.5 leading-relaxed italic border-l-2 border-blueprint/30 pl-2">"{match.coverNote}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-bg-card border border-dashed border-border-main rounded-2xl p-8 text-center sticky top-6">
                    <div className="w-10 h-10 rounded-xl bg-bg-main border border-border-main flex items-center justify-center mx-auto mb-3">
                      <Users className="w-5 h-5 text-text-body/30" />
                    </div>
                    <p className="eyebrow tabular text-text-body/45 mb-1">SELECT A JOB</p>
                    <p className="text-xs text-text-body/55">Click "Match candidates" on any listing to browse and suggest profiles from the resume database.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm match modal */}
            <AnimatePresence>
              {confirmMatchResume && matchingJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmMatchResume(null)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                  >
                    <div className="p-6 border-b border-border-main">
                      <p className="eyebrow tabular text-accent mb-1">CONFIRM MATCH</p>
                      <h3 className="font-display text-xl text-text-heading">Suggest {confirmMatchResume.fullName}?</h3>
                      <p className="text-sm text-text-body/55 mt-1">For <span className="text-text-heading font-medium">{matchingJob.title}</span> at {matchingJob.companyName}</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="eyebrow tabular text-text-body/55 block mb-2">Note to both parties (optional)</label>
                        <textarea
                          value={matchNote}
                          onChange={(e) => setMatchNote(e.target.value)}
                          placeholder="e.g. Strong LNG background, 12 years terminal ops experience…"
                          className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-sm h-20 resize-none outline-none focus:border-text-heading transition-all"
                        />
                      </div>
                      <p className="text-xs text-text-body/55 leading-relaxed">
                        Both <span className="text-text-heading">{confirmMatchResume.fullName}</span> and <span className="text-text-heading">{matchingJob.companyName}</span> will see this suggestion. The candidate can accept or decline.
                      </p>
                    </div>
                    <div className="p-4 bg-bg-main border-t border-border-main flex gap-3">
                      <button onClick={() => setConfirmMatchResume(null)} className="flex-1 py-2.5 border border-border-main rounded-xl text-sm text-text-body hover:text-text-heading transition-all">
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateMatch}
                        disabled={isCreatingMatch}
                        className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
                      >
                        {isCreatingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Confirm suggestion
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {activeTab === "taxonomy" && (
          <motion.div key="taxonomy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display text-2xl text-text-heading">Talent Bank Taxonomy</h2>
                <p className="text-xs text-text-body/55 mt-1 font-medium">
                  {taxonomyNodes.length} nodes · powers job–resume matching · see docs/TALENT_BANK_PHASE0.md
                </p>
              </div>
              <button
                onClick={handleSeedTaxonomy}
                disabled={isSeedingTax}
                className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-4 py-2.5 rounded-xl text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSeedingTax ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                {taxonomyNodes.length === 0 ? `Seed ${TAXONOMY_SEED.length} nodes` : "Re-sync from seed"}
              </button>
            </div>

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(TAX_PREFIX).map((t) => {
                const count = taxonomyNodes.filter((n: any) => n.type === t).length;
                return (
                  <button key={t} onClick={() => { setTaxType(t); setEditingTaxNode(null); }}
                    className={`px-3 py-1.5 eyebrow tabular rounded-xl transition-all ${
                      taxType === t ? "bg-text-heading text-bg-card" : "bg-bg-card border border-border-main text-text-body hover:text-text-heading"
                    }`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}{count > 0 ? ` · ${count}` : ""}
                  </button>
                );
              })}
            </div>

            {/* Add node */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-5">
              <p className="eyebrow tabular text-text-body/55 mb-3">ADD {taxType.toUpperCase()} NODE</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input value={newTaxNode.name} onChange={(e) => setNewTaxNode({ ...newTaxNode, name: e.target.value })}
                  placeholder="Name" className="p-3 bg-bg-main border border-border-main rounded-xl text-sm outline-none focus:border-text-heading" />
                <select value={newTaxNode.parentId} onChange={(e) => setNewTaxNode({ ...newTaxNode, parentId: e.target.value })}
                  className="p-3 bg-bg-main border border-border-main rounded-xl text-sm outline-none">
                  <option value="">No parent (top level)</option>
                  {taxonomyNodes.filter((n: any) => n.type === taxType && n.level === 1).sort((a: any, b: any) => a.order - b.order).map((n: any) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                <input value={newTaxNode.aliases} onChange={(e) => setNewTaxNode({ ...newTaxNode, aliases: e.target.value })}
                  placeholder="Aliases (comma-separated)" className="p-3 bg-bg-main border border-border-main rounded-xl text-sm outline-none focus:border-text-heading" />
                <button onClick={handleAddTaxNode} disabled={!newTaxNode.name.trim()}
                  className="bg-accent text-white rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-40 transition-all">
                  Add node
                </button>
              </div>
            </div>

            {/* Node list, grouped by parent */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-5">
              {loadingTaxonomy ? (
                <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-bg-main rounded-xl animate-pulse" />)}</div>
              ) : taxonomyNodes.filter((n: any) => n.type === taxType).length === 0 ? (
                <div className="text-center py-10">
                  <Layers className="w-10 h-10 text-text-body/25 mx-auto mb-3" />
                  <p className="eyebrow tabular text-text-body/55">No {taxType} nodes yet — use "Seed" above to load the v1 vocabulary.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {(() => {
                    const ofType = taxonomyNodes.filter((n: any) => n.type === taxType);
                    // A node is a "root" for display if its parent is not itself
                    // of this type (covers: true top-level nodes, AND child-only
                    // types like Role whose parents are Families of another type).
                    const idsOfType = new Set(ofType.map((n: any) => n.id));
                    const roots = ofType
                      .filter((n: any) => !n.parentId || !idsOfType.has(n.parentId))
                      .sort((a: any, b: any) => a.order - b.order);

                    const renderRow = (node: any, indent: boolean) => (
                        <div key={node.id} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-bg-main group ${indent ? "ml-6" : ""}`}>
                          {editingTaxNode?.id === node.id ? (
                            <>
                              <input value={editingTaxNode.name} onChange={(e) => setEditingTaxNode({ ...editingTaxNode, name: e.target.value })}
                                className="flex-1 p-1.5 bg-bg-main border border-accent rounded-lg text-sm outline-none" autoFocus />
                              <input value={typeof editingTaxNode.aliases === "string" ? editingTaxNode.aliases : (editingTaxNode.aliases || []).join(", ")}
                                onChange={(e) => setEditingTaxNode({ ...editingTaxNode, aliases: e.target.value })}
                                placeholder="Aliases" className="flex-1 p-1.5 bg-bg-main border border-border-main rounded-lg text-sm outline-none" />
                              <button onClick={handleSaveTaxNode} className="px-2.5 py-1.5 bg-accent text-white rounded-lg text-[11px] eyebrow tabular">Save</button>
                              <button onClick={() => setEditingTaxNode(null)} className="px-2 py-1.5 text-text-body/55 text-[11px]">Cancel</button>
                            </>
                          ) : (
                            <>
                              <span className={`flex-1 text-sm ${indent ? "text-text-body" : "font-bold text-text-heading"}`}>{node.name}</span>
                              {(node.aliases || []).length > 0 && (
                                <span className="eyebrow tabular text-text-body/40 text-[9px] truncate max-w-[200px]">{node.aliases.join(" · ")}</span>
                              )}
                              <span className="eyebrow tabular text-text-body/30 text-[9px] hidden md:inline">{node.id}</span>
                              <button onClick={() => setEditingTaxNode({ ...node })} className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[11px] text-accent transition-opacity">Edit</button>
                              <button onClick={() => handleDeleteTaxNode(node)} className="opacity-0 group-hover:opacity-100 p-1 text-text-body/30 hover:text-rust transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      );

                    // For child-only types (Role), group under the parent's name
                    // as a non-editable header so the hierarchy stays legible.
                    const parentHeader = (node: any) => {
                      const p = taxonomyNodes.find((n: any) => n.id === node.parentId);
                      return p ? p.name : null;
                    };
                    const rootsHaveForeignParents = roots.some((r: any) => r.parentId);

                    if (rootsHaveForeignParents) {
                      // Group roots by their (foreign-type) parent, e.g. roles by family.
                      const groups: Record<string, any[]> = {};
                      roots.forEach((r: any) => {
                        const key = parentHeader(r) || "Ungrouped";
                        (groups[key] = groups[key] || []).push(r);
                      });
                      return Object.keys(groups).sort().map((groupName) => (
                        <div key={groupName} className="mb-3">
                          <p className="eyebrow tabular text-text-body/45 px-2 mb-1">{groupName}</p>
                          {groups[groupName].map((n: any) => renderRow(n, true))}
                        </div>
                      ));
                    }

                    // Standard case: roots of this type with their same-type children.
                    return roots.map((parent: any) => {
                      const children = taxonomyNodes.filter((n: any) => n.parentId === parent.id).sort((a: any, b: any) => a.order - b.order);
                      return (
                        <div key={parent.id} className="mb-2">
                          {renderRow(parent, false)}
                          {children.map((c: any) => renderRow(c, true))}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteCat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteCat(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-bg-card rounded-2xl shadow-md overflow-hidden border border-border-main"
            >
               <div className="p-8 pb-4 text-center">
                  <div className="w-16 h-16 bg-rust/5 text-rust rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl text-text-heading mb-2">Delete Category?</h3>
                  <p className="text-text-body text-sm font-medium leading-relaxed">
                     Are you sure you want to delete <span className="text-text-heading">"{confirmDeleteCat.name}"</span>? 
                     All nested sub-categories will also be removed. This action cannot be undone.
                  </p>
               </div>
               <div className="p-6 bg-bg-main flex gap-3">
                  <button 
                    onClick={() => setConfirmDeleteCat(null)}
                    className="flex-1 py-4 bg-bg-card border border-border-main text-text-body rounded-2xl eyebrow tabular hover:bg-bg-main transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(confirmDeleteCat)}
                    className="flex-1 py-4 bg-rust text-white rounded-2xl eyebrow tabular hover:bg-rust transition-all shadow-lg shadow-md font-sans"
                  >
                    Confirm Delete
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
