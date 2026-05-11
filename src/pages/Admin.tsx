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
import { orderBy, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
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

type Tab = "analytics" | "news" | "forums" | "events" | "surveys" | "members" | "theme" | "pages" | "moderation" | "companies" | "resumes" | "groups";

import { CategorySelector } from "../components/CategorySelector";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const { user } = useAuth();
  const { isDark, setMode } = useTheme();

  // Theme State
  const [themeData, setThemeData] = useState({
    primaryColor: "#0f172a",
    secondaryColor: "#4f46e5",
    accentColor: "#f59e0b",
    backgroundColor: "#f8fafc",
    headingColor: "#0f172a",
    bodyTextColor: "#475569",
    cardBackgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    sidebarFocusColor: "#0f172a",
    sidebarFocusTextColor: "#ffffff",
    logoUrl: "",
    siteName: "Tankonomics",
    siteTagline: "Verified Network Identity",
    displayMode: "both" as "image_only" | "text_only" | "both"
  });
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSavedSuccessfully, setThemeSavedSuccessfully] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isEventUploading, setIsEventUploading] = useState(false);

  // Pages State
  const [newPage, setNewPage] = useState({ title: "", slug: "", content: "", published: true });
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const { data: dynamicPages, loading: loadingPages } = useCollection<any>("dynamic_pages", [orderBy("createdAt", "desc")]);

  const SYSTEM_PAGES = [
    { title: "Home Dashboard", slug: "home", id: "sys-home" },
    { title: "Global Directory", slug: "directory", id: "sys-directory" },
    { title: "Network News", slug: "news", id: "sys-news" },
    { title: "Job Board", slug: "jobs", id: "sys-jobs" },
    { title: "Events Calendar", slug: "events", id: "sys-events" }
  ];

  const WIDGETS = [
    { name: "News Feed", token: "[[WIDGET_NEWS]]", description: "Displays latest industry news" },
    { name: "Upcoming Events", token: "[[WIDGET_EVENTS]]", description: "Displays upcoming calendar events" },
    { name: "Active Surveys", token: "[[WIDGET_SURVEYS]]", description: "Displays current pulse polls" },
    { name: "Featured Companies", token: "[[WIDGET_COMPANIES]]", description: "Highlights spotlight partners" },
    { name: "Talent Feed", token: "[[WIDGET_RESUMES]]", description: "Displays recent professional reports" },
    { name: "Forum Pulse", token: "[[WIDGET_FORUMS]]", description: "Displays active discussion topics" }
  ];

  const insertWidget = (token: string) => {
    setNewPage(prev => ({
      ...prev,
      content: prev.content + "\n" + token + "\n"
    }));
  };

  // News State
  const [url, setUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState("");
  const { data: recentNews, loading: loadingNews } = useCollection<any>("news", [orderBy("createdAt", "desc")]);

  // Forum State
  const [forumTitle, setForumTitle] = useState("");
  const [forumCategoryIds, setForumCategoryIds] = useState<string[]>([]);
  const { data: forumTopics, loading: loadingForums } = useCollection<any>("forum_topics", [orderBy("createdAt", "desc")]);

  // Event State
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<any>(null);
  const [eventData, setEventData] = useState({ 
    title: "", 
    date: "", 
    location: "", 
    description: "",
    imageUrl: "",
    categoryIds: [] as string[],
    ctaText: "",
    ctaUrl: ""
  });
  const { data: events, loading: loadingEvents } = useCollection<any>("events", [orderBy("date", "asc")]);

  // Survey State
  const [surveyQuestion, setSurveyQuestion] = useState("");
  const [surveyOptions, setSurveyOptions] = useState(["", ""]);
  const { data: surveys, loading: loadingSurveys } = useCollection<any>("surveys", [orderBy("createdAt", "desc")]);

  // Members State
  const { data: members, loading: loadingMembers } = useCollection<any>("users", [orderBy("createdAt", "desc")]);
  const [searchMember, setSearchMember] = useState("");

  // Moderation State
  const { data: reports, loading: loadingReports } = useCollection<any>("reports", [orderBy("createdAt", "desc")]);

  // Resumes State
  const { data: resumes, loading: loadingResumes } = useCollection<any>("resumes", [orderBy("createdAt", "desc")]);
  const [resumeFilter, setResumeFilter] = useState({ categoryId: "", subCategoryId: "" });

  // Companies & Categories State
  const { data: categories, loading: loadingCategories } = useCollection<any>("company_categories", [orderBy("level", "asc"), orderBy("order", "asc")]);
  const { data: companies, loading: loadingCompanies } = useCollection<any>("companies", [orderBy("createdAt", "desc")]);
  const { data: claims, loading: loadingClaims } = useCollection<any>("company_claims", [orderBy("createdAt", "desc")]);
  const { data: groups, loading: loadingGroups } = useCollection<any>("groups", [orderBy("createdAt", "desc")]);

  const [newCategory, setNewCategory] = useState({ name: "", parentId: "", level: 1 });
  const [newCompany, setNewCompany] = useState({ 
    name: "", 
    description: "", 
    aboutUs: "",
    address: "",
    logo: "", 
    heroImage: "",
    website: "", 
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: ""
    },
    categoryId: "", 
    subCategoryId: "", 
    tier3CategoryId: "",
    categoryIds: [] as string[],
    isFeatured: false,
    products: [] as any[]
  });
  const [newProduct, setNewProduct] = useState({ name: "", description: "", image: "" });
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

  const handleCreatePage = async () => {
    if (!newPage.title || !newPage.slug) return;
    
    if (editingPageId) {
      await updateDocument("dynamic_pages", editingPageId, {
        ...newPage,
        updatedAt: serverTimestamp()
      });
      setEditingPageId(null);
    } else {
      await createDocument("dynamic_pages", {
        ...newPage,
        authorUid: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    setNewPage({ title: "", slug: "", content: "", published: true });
  };

  const handleEditPage = (page: any) => {
    setNewPage({ 
      title: page.title, 
      slug: page.slug, 
      content: page.content,
      published: page.published ?? true
    });
    setEditingPageId(page.id);
  };

  const handleTogglePublish = async (page: any) => {
    await updateDocument("dynamic_pages", page.id, {
      published: !page.published,
      updatedAt: serverTimestamp()
    });
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
      setError(err.response?.data?.error || "Failed. Please enter manually.");
      setPreview({ url, title: "", description: "", image: "", source: new URL(url).hostname });
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
    await createDocument("forum_topics", {
      title: forumTitle,
      categoryIds: forumCategoryIds,
      authorUid: user?.uid,
      authorName: user?.displayName || "Admin",
      replyCount: 0,
    });
    setForumTitle("");
    setForumCategoryIds([]);
  };

  const handleCreateEvent = async () => {
    if (!eventData.title || !eventData.date) return;
    await createDocument("events", {
      ...eventData,
      organizerUid: user?.uid,
      createdAt: serverTimestamp()
    });
    setEventData({ 
      title: "", 
      date: "", 
      location: "", 
      description: "", 
      imageUrl: "", 
      categoryIds: [], 
      ctaText: "", 
      ctaUrl: "" 
    });
  };

  const handleCreateSurvey = async () => {
    if (!surveyQuestion.trim() || surveyOptions.some(o => !o.trim())) return;
    await createDocument("surveys", {
      question: surveyQuestion,
      options: surveyOptions.map(text => ({ text, votes: 0 })),
      creatorUid: user?.uid,
      totalVotes: 0,
    });
    setSurveyQuestion("");
    setSurveyOptions(["", ""]);
  };

  const filteredMembers = members.filter(m => 
    m.displayName?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.jobTitle?.toLowerCase().includes(searchMember.toLowerCase())
  );

  const handleCreateCategory = async () => {
    if (!newCategory.name) return;
    await createDocument("company_categories", {
      ...newCategory,
      order: categories.filter((c: any) => c.level === newCategory.level && c.parentId === newCategory.parentId).length,
      createdAt: serverTimestamp()
    });
    setNewCategory({ ...newCategory, name: "" });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "heroImage" | "themeLogo" | "eventImage") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 700 * 1024) {
        alert("File is too large. Please select an image under 700KB (Firestore limit).");
        return;
      }
      const reader = new FileReader();
      if (field === "themeLogo") setIsLogoUploading(true);
      if (field === "eventImage") setIsEventUploading(true);
      
      reader.onloadstart = () => {
        console.log("File upload started for:", field);
      };
      reader.onloadend = () => {
        console.log("File upload completed for:", field);
        if (field === "themeLogo") {
          setThemeData(prev => ({ ...prev, logoUrl: reader.result as string }));
          setIsLogoUploading(false);
        } else if (field === "eventImage") {
          setEventData(prev => ({ ...prev, imageUrl: reader.result as string }));
          setIsEventUploading(false);
        } else {
          setNewCompany(prev => ({ ...prev, [field]: reader.result as string }));
        }
      };
      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        alert("Failed to read file.");
      };
      reader.readAsDataURL(file);
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
      description: (newCompany.description || "").trim(),
      aboutUs: (newCompany.aboutUs || "").trim(),
      address: (newCompany.address || "").trim(),
      logo: newCompany.logo || "",
      heroImage: newCompany.heroImage || "",
      website: (newCompany.website || "").trim(),
      socialLinks: {
        linkedin: newCompany.socialLinks?.linkedin || "",
        twitter: newCompany.socialLinks?.twitter || "",
        facebook: newCompany.socialLinks?.facebook || "",
        instagram: newCompany.socialLinks?.instagram || "",
      },
      categoryIds: newCompany.categoryIds,
      categoryId: newCompany.categoryIds[0], // first category for legacy readers
      subCategoryId: newCompany.subCategoryId || "",
      tier3CategoryId: newCompany.tier3CategoryId || "",
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
          ownerUid: "",
          createdAt: serverTimestamp(),
        });
      }

      setNewCompany({
        name: "",
        description: "",
        aboutUs: "",
        address: "",
        logo: "",
        heroImage: "",
        website: "",
        socialLinks: { linkedin: "", twitter: "", facebook: "", instagram: "" },
        categoryId: "",
        subCategoryId: "",
        tier3CategoryId: "",
        categoryIds: [],
        isFeatured: false,
        products: []
      });
    } catch (err: any) {
      console.error("Company save failed:", err);
      alert(`Company save failed: ${err?.message || "Unknown error"}`);
    }
  };

const handleEditCompany = (company: any) => {
  setNewCompany({
    name: company.name,
    description: company.description,
    aboutUs: company.aboutUs || "",
    address: company.address || "",
    logo: company.logo,
    heroImage: company.heroImage || "",
    website: company.website,
    socialLinks: company.socialLinks || {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: ""
    },
    categoryId: company.categoryId,
    subCategoryId: company.subCategoryId || "",
    tier3CategoryId: company.tier3CategoryId || "",
    categoryIds: company.categoryIds || [],
    isFeatured: company.isFeatured || false,
    products: company.products || []
  });
  setEditingCompanyId(company.id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  const handleResolveClaim = async (claim: any, approve: boolean) => {
    if (approve) {
      await updateDocument("companies", claim.companyId, {
        ownerUid: claim.userUid,
        isClaimed: true,
        updatedAt: serverTimestamp()
      });
      await updateDocument("company_claims", claim.id, { status: "approved" });
    } else {
      await updateDocument("company_claims", claim.id, { status: "rejected" });
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
      const val = item[key] || "Unspecified";
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
    { id: "analytics", label: "Analytics", icon: Activity },
    { id: "resumes", label: "Sector Reports", icon: FileCode },
    { id: "news", label: "News Feed", icon: Globe },
    { id: "forums", label: "Forums", icon: MessageSquare },
    { id: "events", label: "Events", icon: Calendar },
    { id: "surveys", label: "Surveys", icon: BarChart3 },
    { id: "members", label: "Members", icon: Users },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "groups", label: "Groups", icon: Users },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "theme", label: "Branding", icon: Palette },
    { id: "pages", label: "Builder", icon: FileCode },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Shield className="w-8 h-8 text-primary" />
               Command Center
            </h1>
            <p className="text-slate-500 font-medium mt-1">Platform management and administrative controls.</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner h-fit">
            <button 
              onClick={() => setMode('light')}
              className={`p-1.5 sm:p-2 rounded-xl transition-all ${!isDark ? 'bg-white shadow-md text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button 
              onClick={() => setMode('dark')}
              className={`p-1.5 sm:p-2 rounded-xl transition-all ${isDark ? 'bg-slate-800 shadow-md text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="analytics" className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: "Total Network", value: members.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
                 { label: "Business Directory", value: companies.length, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
                 { label: "Published News", value: recentNews.length, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
                 { label: "Community Events", value: events.length, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" }
               ].map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-6 h-6" />
                       </div>
                       <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{stat.label}</h4>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                 </motion.div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Growth Chart */}
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                           <TrendingUp className="w-5 h-5 text-primary" /> Member Registration
                        </h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Last 14 days growth pulse</p>
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
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                           <PieChartIcon className="w-5 h-5 text-emerald-600" /> Sector Distribution
                        </h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Business categories breakdown</p>
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
                             formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">{value}</span>}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Engagement Card */}
               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                     <Activity className="w-32 h-32" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-white/50">Engagement Pulse</h3>
                  <div className="space-y-6 relative z-10">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Pending Actions</span>
                           <span className="text-lg font-black">{reports.filter(r => r.status === 'pending').length}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-400 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Forum Activity</span>
                           <span className="text-lg font-black">{forumTopics.length}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Survey Response</span>
                           <span className="text-lg font-black">{surveys.reduce((acc: number, s: any) => acc + (s.totalVotes || 0), 0)}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-400 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Recent Highlights Table */}
               <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" /> Platform Velocity
                     </h3>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                  </div>
                  <div className="space-y-4">
                     {[
                       { type: "User", name: members[0]?.displayName, action: "Joined Network", icon: Users, time: members[0]?.createdAt },
                       { type: "Company", name: companies[0]?.name, action: "Profile Registered", icon: Building2, time: companies[0]?.createdAt },
                       { type: "News", name: recentNews[0]?.title, action: "Article Published", icon: Globe, time: recentNews[0]?.createdAt }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-indigo-50/50 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                <item.icon className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-900 truncate max-w-[200px]">{item.name || "N/A"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.action}</p>
                             </div>
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase italic">
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
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                   <div className="flex-1 space-y-4">
                         <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" /> Talent Directory Mapping
                         </h2>
                      <p className="text-slate-500 font-medium text-sm">Monitor and sort professional resumes by industry vertical and technical segment.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-1">Industry Vertical</label>
                         <select 
                           value={resumeFilter.categoryId}
                           onChange={(e) => setResumeFilter({ ...resumeFilter, categoryId: e.target.value, subCategoryId: "" })}
                           className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                         >
                            <option value="">All Verticals</option>
                            {categories.filter((c: any) => c.level === 1).map((c: any) => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-1">Technical Segment</label>
                         <select 
                           value={resumeFilter.subCategoryId}
                           onChange={(e) => setResumeFilter({ ...resumeFilter, subCategoryId: e.target.value })}
                           disabled={!resumeFilter.categoryId}
                           className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-50"
                         >
                            <option value="">All Segments</option>
                            {categories.filter((c: any) => c.parentId === resumeFilter.categoryId).map((c: any) => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                         </select>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner max-h-[600px] overflow-y-auto">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-200/50 text-[10px] font-black uppercase tracking-widest text-slate-500 sticky top-0 backdrop-blur-md">
                         <tr>
                            <th className="px-6 py-4">Full Name</th>
                            <th className="px-6 py-4">Current Title</th>
                            <th className="px-6 py-4">Mapping</th>
                            <th className="px-6 py-4">Visibility</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                         {resumes
                           .filter(r => 
                              (!resumeFilter.categoryId || r.categoryId === resumeFilter.categoryId) &&
                              (!resumeFilter.subCategoryId || r.subCategoryId === resumeFilter.subCategoryId)
                           )
                           .map((resume: any) => (
                              <tr key={resume.id} className="hover:bg-indigo-50/30 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <img src={resume.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${resume.fullName}`} className="w-9 h-9 rounded-xl bg-slate-100" />
                                       <p className="font-bold text-slate-900">{resume.fullName}</p>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <p className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{resume.jobTitle}</p>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="space-y-1">
                                       <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest block w-fit">
                                          {resume.categoryName}
                                       </span>
                                       {resume.subCategoryName && (
                                          <p className="text-[9px] text-slate-400 ml-1 font-bold">» {resume.subCategoryName}</p>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    {resume.isLocked ? (
                                       <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                          <Lock className="w-3 h-3" /> Private
                                       </span>
                                    ) : (
                                       <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                          <Unlock className="w-3 h-3" /> Public
                                       </span>
                                    )}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={() => removeDocument("resumes", resume.id)}
                                      className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </td>
                              </tr>
                           ))
                         }
                         {resumes.length === 0 && (
                            <tr>
                               <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No resumes discovered in the network explorer.</td>
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
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-indigo-600" /> Global Category Manager
              </h2>
              <p className="text-xs text-slate-500 mb-6 font-medium">Manage categories and sub-categories used across Directory, Jobs, Events, and Forums.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((level) => (
                  <div key={level} className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Level {level} {level === 1 ? 'Categories' : level === 2 ? 'Sub-Categories' : 'Tier 3'}</p>
                    {level > 1 && (
                      <select 
                        value={newCategory.parentId} 
                        onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value, level })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
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
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                      <button 
                        onClick={handleCreateCategory}
                        disabled={newCategory.level !== level || !newCategory.name || (level > 1 && !newCategory.parentId)}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                      {categories.filter((c: any) => c.level === level && (level === 1 || c.parentId === newCategory.parentId)).map((cat: any) => (
                        <div key={cat.id} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 transition-colors group">
                          <span className="truncate pr-2">{cat.name}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteCat(cat);
                            }} 
                            className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0"
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
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> {editingCompanyId ? "Edit Company" : "Register New Company"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Company Name</label>
                    <input 
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Short Description (for cards)</label>
                    <input 
                      value={newCompany.description}
                      onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">About Us (Full Text)</label>
                    <textarea 
                      value={newCompany.aboutUs}
                      onChange={(e) => setNewCompany({...newCompany, aboutUs: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Company Address</label>
                    <input 
                      value={newCompany.address}
                      onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Company Logo</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input 
                            placeholder="Logo URL"
                            value={newCompany.logo}
                            onChange={(e) => setNewCompany({...newCompany, logo: e.target.value})}
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                          <label className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 cursor-pointer transition-colors">
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
                          <div className="relative w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden group">
                             <img src={newCompany.logo} className="w-full h-full object-contain" />
                             <button 
                               onClick={() => setNewCompany({...newCompany, logo: ""})}
                               className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                             >
                               <X className="w-4 h-4" />
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Hero Image URL</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input 
                            placeholder="Hero Image URL"
                            value={newCompany.heroImage}
                            onChange={(e) => setNewCompany({...newCompany, heroImage: e.target.value})}
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                          <label className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 cursor-pointer transition-colors">
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
                          <div className="relative w-full h-20 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden group">
                             <img src={newCompany.heroImage} className="w-full h-full object-cover" />
                             <button 
                               onClick={() => setNewCompany({...newCompany, heroImage: ""})}
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
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Website</label>
                    <input 
                      value={newCompany.website}
                      onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block flex items-center gap-1.5">
                        <Linkedin className="w-3 h-3 text-blue-600" /> LinkedIn
                      </label>
                      <input 
                        value={newCompany.socialLinks?.linkedin || ""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, linkedin: e.target.value }})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block flex items-center gap-1.5">
                        <Twitter className="w-3 h-3 text-sky-400" /> Twitter / X
                      </label>
                      <input 
                        value={newCompany.socialLinks?.twitter || ""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, twitter: e.target.value }})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block flex items-center gap-1.5">
                        <Facebook className="w-3 h-3 text-blue-700" /> Facebook
                      </label>
                      <input 
                        value={newCompany.socialLinks?.facebook || ""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, facebook: e.target.value }})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        placeholder="Facebook URL"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block flex items-center gap-1.5">
                        <Instagram className="w-3 h-3 text-pink-500" /> Instagram
                      </label>
                      <input 
                        value={newCompany.socialLinks?.instagram || ""}
                        onChange={(e) => setNewCompany({...newCompany, socialLinks: { ...newCompany.socialLinks, instagram: e.target.value }})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        placeholder="Instagram URL"
                      />
                    </div>
                  </div>

                  {/* Product Manager */}
                  <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Product Showcase</label>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                         <input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs" />
                         <input placeholder="Image URL" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs" />
                         <textarea placeholder="Product Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs h-20 resize-none" />
                         <button 
                           onClick={() => {
                             if (!newProduct.name) return;
                             setNewCompany({ ...newCompany, products: [...newCompany.products, newProduct] });
                             setNewProduct({ name: "", description: "", image: "" });
                           }}
                           className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase"
                         >
                           + Add Product 
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {newCompany.products.map((p, i) => (
                          <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between group">
                            <span className="text-xs font-bold truncate">{p.name}</span>
                            <button onClick={() => setNewCompany({...newCompany, products: newCompany.products.filter((_, idx) => idx !== i)})} className="text-red-400 opacity-0 group-hover:opacity-100">
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
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Classification (Select Multiple)</label>
                    <CategorySelector 
                      categories={categories} 
                      selectedIds={newCompany.categoryIds} 
                      onChange={(ids) => setNewCompany({...newCompany, categoryIds: ids})} 
                    />
                    
                    <div className="mt-4 flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <input 
                          type="checkbox"
                          id="isFeatured"
                          checked={newCompany.isFeatured}
                          onChange={(e) => setNewCompany({...newCompany, isFeatured: e.target.checked})}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="isFeatured" className="text-xs font-black uppercase text-slate-900 tracking-wider cursor-pointer">
                          Featured Company (Rich Background)
                        </label>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleCreateCompany}
                    disabled={!newCompany.name.trim() || newCompany.categoryIds.length === 0}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs mt-6"
                  >
                    <Building2 className="w-5 h-5" /> {editingCompanyId ? "Update Profile" : "Register Business"}
                  </button>
                  {editingCompanyId && (
                    <button onClick={() => setEditingCompanyId(null)} className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Cancel Editing</button>
                  )}
                </div>
              </div>

            {/* Claims Queue */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Claim Requests
                  </h3>
                </div>
                <div className="bg-amber-100 px-3 py-1 rounded text-[10px] font-black text-amber-700 uppercase tracking-widest">
                  {claims.filter((c: any) => c.status === 'pending').length} Pending
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {claims.map((claim: any) => (
                  <div key={claim.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Company ID: {claim.companyId.substring(0, 8)}...</p>
                        <p className="text-xs text-slate-500 font-medium">Requested by: {claim.userName} ({claim.userEmail})</p>
                        <p className="text-[10px] italic text-slate-400 mt-1 max-w-md">"{claim.justification}"</p>
                      </div>
                    </div>
                    {claim.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleResolveClaim(claim, false)}
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleResolveClaim(claim, true)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                        >
                          Approve Claim
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        claim.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {claim.status}
                      </span>
                    )}
                  </div>
                ))}
                {claims.length === 0 && (
                  <div className="p-20 text-center text-slate-300 italic font-medium">No claim requests in queue.</div>
                )}
              </div>
            </div>

            {/* Companies List */}
            <div className="space-y-6 mt-12">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" /> Active Directory
                </h2>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {companies.length} Registered Companies
                </div>
              </div>
              
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {companies.map((company: any) => (
                  <div 
                    key={company.id} 
                    className={`break-inside-avoid mb-6 rounded-[2.5rem] border transition-all group overflow-hidden relative ${
                      company.isFeatured 
                        ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-transparent shadow-2xl shadow-indigo-200" 
                        : "bg-white border-slate-200 hover:shadow-xl text-slate-900"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center overflow-hidden p-2 ${
                          company.isFeatured ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100"
                        }`}>
                          <img 
                            src={company.logo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"} 
                            className={`w-full h-full object-contain ${company.isFeatured ? "brightness-0 invert" : ""}`}
                            alt={company.name} 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditCompany(company)}
                            className={`p-2 rounded-xl transition-all ${
                              company.isFeatured ? "hover:bg-white/20 text-white/70 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                            }`}
                          >
                            <Palette className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => removeDocument("companies", company.id)}
                            className={`p-2 rounded-xl transition-all ${
                              company.isFeatured ? "hover:bg-red-500/20 text-white/50 hover:text-red-300" : "hover:bg-red-50 text-slate-300 hover:text-red-500"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                            company.isFeatured ? "text-indigo-200" : "text-indigo-600"
                          }`}>
                            {categories.find((c: any) => c.id === company.categoryId)?.name || "N/A"}
                          </p>
                          <h3 className="text-xl font-black tracking-tight leading-tight mb-2">{company.name}</h3>
                          <p className={`text-xs leading-relaxed line-clamp-3 ${
                            company.isFeatured ? "text-white/80" : "text-slate-500"
                          }`}>
                            {company.description || "No description provided."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            company.isClaimed 
                              ? (company.isFeatured ? "bg-emerald-400/20 border-emerald-400/30 text-emerald-200" : "bg-emerald-50 border-emerald-100 text-emerald-600")
                              : (company.isFeatured ? "bg-white/10 border-white/20 text-white/60" : "bg-slate-100 border-slate-200 text-slate-400")
                          }`}>
                            {company.isClaimed ? "Claimed" : "Unclaimed"}
                          </span>
                          {company.isFeatured && (
                            <span className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className={`pt-4 border-t flex items-center justify-between ${
                          company.isFeatured ? "border-white/10" : "border-slate-100"
                        }`}>
                          <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                               company.isFeatured ? "bg-white/10" : "bg-slate-100"
                             }`}>
                                <Globe className={`w-3.5 h-3.5 ${company.isFeatured ? "text-white/70" : "text-slate-400"}`} />
                             </div>
                             <span className={`text-[10px] font-bold ${
                               company.isFeatured ? "text-white/60" : "text-slate-400"
                             }`}>
                               {company.website ? new URL(company.website).hostname : "No Website"}
                             </span>
                          </div>
                          <Link 
                            to={`/business/${company.id}`}
                            className={`p-2 rounded-xl transition-all ${
                              company.isFeatured ? "bg-white text-indigo-600 hover:scale-105 shadow-xl shadow-indigo-900/40" : "bg-slate-900 text-white hover:bg-indigo-600"
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
                <div className="p-20 text-center bg-white border border-slate-200 rounded-[2.5rem]">
                   <Building2 className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold italic">No businesses registered in the system yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "moderation" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="moderation" className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" /> Moderation Queue
                </h2>
                <p className="text-slate-500 text-sm font-medium">Review reported content and maintain community standards.</p>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Pending Issues</span>
                <p className="text-2xl font-black text-red-700">{reports.filter((r: any) => r.status === "pending").length}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Report Details</th>
                    <th className="px-6 py-4">Content Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report: any) => (
                    <tr key={report.id} className={`hover:bg-slate-50/50 transition-colors ${report.status === 'pending' ? 'bg-white' : 'bg-slate-50/30 opacity-70'}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-slate-900 text-xs">ID: {report.targetId.substring(0, 8)}...</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {report.createdAt?.seconds ? format(report.createdAt.seconds * 1000, 'MMM d, h:mm a') : '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          report.targetType === 'post' ? 'bg-indigo-50 text-indigo-600' : 
                          report.targetType === 'comment' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {report.targetType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 max-w-xs truncate italic">"{report.reason}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-700 text-xs">{report.reporterName}</p>
                          <p className="text-[9px] text-slate-400 font-medium">UID: {report.reporterUid?.substring(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                          report.status === 'pending' ? 'bg-red-50 text-red-600 animate-pulse' : 
                          report.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
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
                               onClick={() => updateDocument("reports", report.id, { status: "dismissed", updatedAt: serverTimestamp() })}
                               className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                               title="Dismiss Report"
                             >
                                <X className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={async () => {
                                 if (window.confirm("Are you sure you want to delete this content?")) {
                                   try {
                                     await removeDocument(report.targetPath.split('/')[0], report.targetId);
                                     await updateDocument("reports", report.id, { status: "resolved", updatedAt: serverTimestamp() });
                                   } catch (err) {
                                     console.error("Moderation action failed:", err);
                                     // Fallback for subcollections or complex paths
                                     const pathParts = report.targetPath.split('/');
                                     if (pathParts.length > 2) {
                                        await removeDocument(report.targetPath.replace(`/${report.targetId}`, ''), report.targetId);
                                        await updateDocument("reports", report.id, { status: "resolved", updatedAt: serverTimestamp() });
                                     }
                                   }
                                 }
                               }}
                               className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-lg shadow-red-100"
                             >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Content
                             </button>
                          </div>
                        )}
                        {report.status !== 'pending' && (
                           <button 
                              onClick={() => removeDocument("reports", report.id)}
                              className="p-2 text-slate-200 hover:text-red-500 transition-all"
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
                        <p className="text-slate-400 font-bold italic text-lg tracking-tight">Queue is empty. Community standards are maintained.</p>
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
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Palette className="w-6 h-6 text-indigo-600" /> Visual Identity
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Primary Brand Color</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Secondary UI Color</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Accent Color</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Interface Background</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Heading Text</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Body Text Color</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Surface/Card Color</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Global Border Color</label>
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Sidebar Focus/Promo color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.sidebarFocusColor || "#0f172a"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.sidebarFocusColor || "#0f172a"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusColor: e.target.value})}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Sidebar Focus Text</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={themeData.sidebarFocusTextColor || "#ffffff"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusTextColor: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                      />
                      <input 
                        type="text" 
                        value={themeData.sidebarFocusTextColor || "#ffffff"} 
                        onChange={(e) => setThemeData({...themeData, sidebarFocusTextColor: e.target.value})}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Brand Logo & Identity</label>
                       <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">Required for Headers</span>
                    </div>
                    
                    <div className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl mb-4 group transition-all hover:bg-slate-100/50 relative overflow-hidden">
                       <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-2 shadow-sm overflow-hidden relative z-10 group/logo">
                         {isLogoUploading ? (
                           <Loader2 className="w-6 h-6 animate-spin text-primary" />
                         ) : themeData.logoUrl ? (
                           <img src={themeData.logoUrl} className="w-full h-full object-contain" alt="Logo Preview" />
                         ) : (
                           <Building2 className="w-8 h-8 text-slate-200" />
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
                          <p className="text-[11px] font-black text-slate-900 uppercase">Site Identity Icon</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                            Recommended Size: <span className="text-slate-900">50 x 50 px</span> (Square Icon)<br/>
                            This icon will render to the left of the site identity.<br/>
                            Background: Transparent PNG preferred.
                          </p>
                          <div className="mt-2 text-[10px] font-black text-primary uppercase">
                            Click logo area to upload
                          </div>
                       </div>
                    </div>

                    <div className="relative mb-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Or Use Remote Logo URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="url" 
                          placeholder="https://yourbrand.com/logo.png"
                          value={themeData.logoUrl}
                          onChange={(e) => setThemeData({...themeData, logoUrl: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/5 transition-all font-medium"
                        />
                      </div>
                    </div>
                    
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Application Site Name</label>
                    <input 
                      type="text" 
                      placeholder="My Digital Sector"
                      value={themeData.siteName}
                      onChange={(e) => setThemeData({...themeData, siteName: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/5 transition-all font-bold mb-4"
                    />

                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Site Tagline / Headline</label>
                    <input 
                      type="text" 
                      placeholder="Verified Network Identity"
                      value={themeData.siteTagline}
                      onChange={(e) => setThemeData({...themeData, siteTagline: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/5 transition-all font-bold mb-4"
                    />

                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Header Display Strategy</label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['image_only', 'text_only', 'both'] as const).map(mode => (
                         <button
                           key={mode}
                           onClick={() => setThemeData({...themeData, displayMode: mode})}
                           className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                             themeData.displayMode === mode 
                               ? "text-white border-transparent shadow-lg" 
                               : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                           }`}
                           style={themeData.displayMode === mode ? { backgroundColor: themeData.primaryColor } : {}}
                         >
                           {mode.replace('_', ' ')}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Identity Signature Preview</p>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-center gap-4 shadow-sm mb-6">
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
                            <span className="font-black text-slate-900 tracking-tighter text-xl uppercase leading-none">
                              {themeData.siteName || "DIRECTORY"}
                            </span>
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">
                              {themeData.siteTagline || "Verified Network Identity"}
                            </span>
                         </div>
                       )}
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Swatch Pulse</p>
                      <div className="flex justify-center gap-4">
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl shadow-lg transition-transform hover:scale-110 border border-white" style={{ backgroundColor: themeData.primaryColor }}></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Primary</span>
                         </div>
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl shadow-lg transition-transform hover:scale-110 border border-white" style={{ backgroundColor: themeData.secondaryColor }}></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Secondary</span>
                         </div>
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl shadow-lg transition-transform hover:scale-110 border border-white" style={{ backgroundColor: themeData.accentColor }}></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Accent</span>
                         </div>
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col gap-3">
                       <button className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: themeData.primaryColor }}>Primary Action Button</button>
                       <button className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: themeData.secondaryColor }}>Interface Accent</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleSaveTheme}
                  disabled={savingTheme}
                  className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 text-white ${themeSavedSuccessfully ? "bg-emerald-500" : ""}`}
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

        {activeTab === "pages" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="pages" className="space-y-10">
            {/* System Pages Quick Actions */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                     <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                     <h3 className="text-sm font-black uppercase tracking-[0.2em]">System Page Overrides</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     {SYSTEM_PAGES.map(page => {
                       const existing = dynamicPages.find(p => p.slug === page.slug);
                       return (
                         <button 
                           key={page.id}
                           onClick={() => {
                             if (existing) {
                               handleEditPage(existing);
                             } else {
                               setNewPage({ title: page.title, slug: page.slug, content: `# ${page.title}\n\nStart customizing this system page...`, published: true });
                               setEditingPageId(null);
                             }
                           }}
                           className={`p-4 rounded-2xl border transition-all text-left group ${
                             existing 
                               ? "bg-white/10 border-indigo-500/30 hover:bg-white/20" 
                               : "bg-black/20 border-white/5 hover:border-white/20"
                           }`}
                         >
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 line-clamp-1">{page.title}</p>
                            <div className="flex items-center justify-between">
                               <span className="text-[8px] font-mono text-white/40">/{page.slug}</span>
                               {existing ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 text-white/20 group-hover:text-white" />}
                            </div>
                         </button>
                       );
                     })}
                  </div>
               </div>
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <FileCode className="w-64 h-64" />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl sticky top-24">
                   <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                      <Layout className="w-5 h-5 text-primary" /> {editingPageId ? "Edit Page Structure" : "New Page Concept"}
                   </h2>
                  <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Internal Title</label>
                       <input 
                         placeholder="e.g. Terms of Service" 
                         value={newPage.title} 
                         onChange={(e) => setNewPage({...newPage, title: e.target.value})} 
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold" 
                       />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">URL Slug</label>
                       <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                          <span className="text-slate-400 font-mono text-sm">/page/</span>
                          <input 
                            placeholder="terms" 
                            value={newPage.slug} 
                            onChange={(e) => setNewPage({...newPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                            className="flex-1 bg-transparent border-none outline-none font-mono text-sm font-bold p-0 focus:ring-0" 
                          />
                       </div>
                     </div>

                     <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insert Dynamic Blocks</label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           {WIDGETS.map(widget => (
                             <button 
                               key={widget.token}
                               onClick={() => insertWidget(widget.token)}
                               className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-600 transition-all text-left group"
                               title={widget.description}
                             >
                                <p className="text-[9px] font-black text-slate-900 uppercase tracking-tighter line-clamp-1">{widget.name}</p>
                                <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 mt-1" />
                             </button>
                           ))}
                        </div>
                     </div>

                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Content Environment (Markdown)</label>
                       <textarea 
                         placeholder="# Your Page Header..." 
                         value={newPage.content} 
                         onChange={(e) => setNewPage({...newPage, content: e.target.value})} 
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-64 outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-medium resize-none shadow-inner" 
                       />
                     </div>
                     <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page Status</span>
                        <button 
                          onClick={() => setNewPage({...newPage, published: !newPage.published})}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            newPage.published ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                           {newPage.published ? "Published" : "Draft"}
                        </button>
                     </div>
                     <div className="flex gap-3">
                        {editingPageId && (
                          <button 
                            onClick={() => {
                              setEditingPageId(null);
                              setNewPage({ title: "", slug: "", content: "", published: true });
                            }}
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl hover:text-slate-600 transition-all uppercase tracking-widest text-[10px]"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={handleCreatePage} 
                          className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
                        >
                          <Save className="w-5 h-5" /> {editingPageId ? "Sync Changes" : "Deploy Logic"}
                        </button>
                     </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                 {dynamicPages.map(page => (
                   <div key={page.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <FileCode className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900">{page.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">/page/{page.slug}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${page.published ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                  {page.published ? "Live" : "Draft"}
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleTogglePublish(page)}
                           className={`p-3 transition-colors ${page.published ? "text-emerald-500 hover:text-slate-400" : "text-slate-300 hover:text-emerald-500"}`}
                           title={page.published ? "Unpublish" : "Publish"}
                         >
                            {page.published ? <Check className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                         </button>
                         <Link to={`/page/${page.slug}`} target="_blank" className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                         </Link>
                         <button 
                           onClick={() => handleEditPage(page)}
                           className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
                         >
                            <Layout className="w-5 h-5" />
                         </button>
                         <button onClick={() => removeDocument("dynamic_pages", page.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                 ))}
                 {dynamicPages.length === 0 && (
                   <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                      <Layout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">No dynamic pages found. Start building above.</p>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        )}


        {activeTab === "news" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="news" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Curate News</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="url" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste article URL..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                    />
                  </div>
                  <button onClick={handleExtract} disabled={extracting || !url.trim()} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">
                    {extracting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Extract Metadata"}
                  </button>
                  {preview && (
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                       <input type="text" value={preview.title} onChange={(e) => setPreview({...preview, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                       <textarea value={preview.description} onChange={(e) => setPreview({...preview, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none" />
                       <button onClick={handleCreateNews} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 italic">Publish News</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-widest text-slate-400">Curated Stream</div>
               <div className="divide-y divide-slate-100">
                  {recentNews.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.source}</p>
                        </div>
                      </div>
                      <button onClick={() => removeDocument("news", item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 mb-4">Start Forum Topic</h2>
                <input placeholder="Topic Title" value={forumTitle} onChange={(e) => setForumTitle(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Categories</label>
                <CategorySelector 
                  categories={categories} 
                  selectedIds={forumCategoryIds} 
                  onChange={setForumCategoryIds} 
                />
                <button onClick={handleCreateForum} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-lg">Activate Topic</button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
              {forumTopics.map(topic => (
                <div key={topic.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{topic.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{topic.category}</p>
                  </div>
                  <button onClick={() => removeDocument("forum_topics", topic.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 mb-4">Post Official Event</h2>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Title & Date</label>
                  <div className="space-y-2">
                    <input placeholder="Event Title" value={eventData.title} onChange={(e) => setEventData({...eventData, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                    <input type="date" value={eventData.date} onChange={(e) => setEventData({...eventData, date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Logistics & Visuals</label>
                  <div className="space-y-4">
                    <input placeholder="Location (City, Country or Virtual)" value={eventData.location} onChange={(e) => setEventData({...eventData, location: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    
                    <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl group transition-all hover:bg-slate-100/50 relative overflow-hidden">
                       <div className="w-16 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden relative z-10 group/img">
                         {isEventUploading ? (
                           <Loader2 className="w-5 h-5 animate-spin text-primary" />
                         ) : eventData.imageUrl ? (
                           <img src={eventData.imageUrl} className="w-full h-full object-cover" alt="Event Preview" />
                         ) : (
                           <Calendar className="w-6 h-6 text-slate-200" />
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
                          <p className="text-[10px] font-black text-slate-900 uppercase">Event Image</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed">
                            Click to upload or use URL below
                          </p>
                       </div>
                    </div>

                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input placeholder="Or Paste Image URL" value={eventData.imageUrl} onChange={(e) => setEventData({...eventData, imageUrl: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Classification (Select Multiple)</label>
                  <CategorySelector 
                    categories={categories} 
                    selectedIds={eventData.categoryIds} 
                    onChange={(ids) => setEventData({...eventData, categoryIds: ids})} 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Call to Action (CTA)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Button Text" value={eventData.ctaText} onChange={(e) => setEventData({...eventData, ctaText: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                    <input placeholder="Link URL" value={eventData.ctaUrl} onChange={(e) => setEventData({...eventData, ctaUrl: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                  </div>
                </div>

                <textarea placeholder="Full Description..." value={eventData.description} onChange={(e) => setEventData({...eventData, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none shadow-inner" />
                <button onClick={handleCreateEvent} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" /> Add to Calendar
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {events.map(event => (
                  <div key={event.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} className="w-16 h-12 object-cover rounded-lg bg-slate-100" />
                      ) : (
                        <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                          <Calendar className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{event.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                          {event.date} • {event.location}
                          {event.categoryId && (
                            <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded ml-2">
                              {categories.find((c: any) => c.id === event.categoryId)?.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeDocument("events", event.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="p-12 text-center text-slate-400 italic">No official events scheduled.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "surveys" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="surveys" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 mb-4">Create Pulse Check</h2>
                <input placeholder="Pulse Question" value={surveyQuestion} onChange={(e) => setSurveyQuestion(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Options</p>
                   {surveyOptions.map((opt, i) => (
                     <div key={i} className="flex gap-2">
                       <input value={opt} onChange={(e) => {
                          const newOpts = [...surveyOptions];
                          newOpts[i] = e.target.value;
                          setSurveyOptions(newOpts);
                       }} placeholder={`Option ${i+1}`} className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       {surveyOptions.length > 2 && (
                         <button onClick={() => setSurveyOptions(surveyOptions.filter((_, idx) => idx !== i))} className="p-2 text-red-400"><X className="w-4 h-4" /></button>
                       )}
                     </div>
                   ))}
                   <button onClick={() => setSurveyOptions([...surveyOptions, ""])} className="text-[10px] font-black text-indigo-600 uppercase mt-2 hover:opacity-70 transition-opacity whitespace-nowrap">+ Add Option</button>
                </div>
                <button onClick={handleCreateSurvey} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-lg tracking-tighter">Initiate Survey</button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
               {surveys.map(survey => (
                 <div key={survey.id} className="p-6 transition-all hover:bg-slate-50/50">
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex-1">
                       <p className="font-bold text-slate-900 text-base mb-1">{survey.question}</p>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                         <Clock className="w-3 h-3" /> {survey.createdAt?.seconds ? format(survey.createdAt.seconds * 1000, 'MMM d, yyyy') : '-'} • {survey.totalVotes || 0} TOTAL VOTES
                       </p>
                     </div>
                     <button onClick={() => removeDocument("surveys", survey.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                     {survey.options?.map((option: any, idx: number) => {
                       const percentage = survey.totalVotes > 0 ? Math.round((option.votes / survey.totalVotes) * 100) : 0;
                       return (
                         <div key={idx} className="space-y-1">
                           <div className="flex justify-between items-center text-[11px] font-bold">
                             <span className="text-slate-600 line-clamp-1">{option.text}</span>
                             <span className="text-slate-900">{option.votes} ({percentage}%)</span>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${percentage}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
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
                 <div className="p-12 text-center text-slate-400 italic">No surveys initiated yet.</div>
                )}
             </div>
          </motion.div>
       )}

        {activeTab === "members" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="members" className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   value={searchMember}
                   onChange={(e) => setSearchMember(e.target.value)}
                   placeholder="Search members by name, email, or title..."
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                 />
               </div>
               <div className="text-right shrink-0 px-4">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Total Network</p>
                 <p className="text-xl font-black text-slate-900">{members.length}</p>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Professional</th>
                      <th className="px-6 py-4">Affiliation</th>
                      <th className="px-6 py-4">Industry Segment</th>
                      <th className="px-6 py-4">Bio / Summary</th>
                      <th className="px-6 py-4">Auth Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <img src={member.photoURL} className="w-10 h-10 rounded-full border border-slate-100 bg-slate-100" />
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {member.displayName}
                                  {member.isAdmin && <Shield className="w-3 h-3 text-indigo-500" />}
                                </p>
                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-700 flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-slate-400" /> {member.jobTitle || "-"}</p>
                           <p className="text-xs text-slate-400 flex items-center gap-1.5"><Building2 className="w-3 h-3 text-slate-400" /> {member.company || "-"}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest">
                             {member.industrySegment || "Not Specified"}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs text-slate-500 max-w-xs truncate italic">{member.bio || "No biography provided."}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <p className="text-[9px] font-black uppercase tracking-tighter text-slate-300 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> Registered: {member.createdAt?.seconds ? format(member.createdAt.seconds * 1000, 'MMM d, yyyy') : '-'}
                              </p>
                              <p className="text-[9px] font-black uppercase tracking-tighter text-slate-300 flex items-center gap-1">
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
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Community Moderator</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Review and approve industry groups</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                       {groups.filter((g: any) => g.status === 'pending').length} Pending Requests
                     </span>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <tr>
                       <th className="px-6 py-4">Group Identity</th>
                       <th className="px-6 py-4">Creator</th>
                       <th className="px-6 py-4">Privacy</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {groups.map((group: any) => (
                       <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                               {group.iconUrl ? <img src={group.iconUrl} className="w-full h-full object-contain" /> : <Users className="w-6 h-6 text-slate-300" />}
                             </div>
                             <div>
                               <p className="font-bold text-slate-900">{group.name}</p>
                               <p className="text-xs text-slate-400 truncate max-w-xs">{group.description}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="font-bold text-slate-700">{group.creatorName || group.creatorUid.substring(0, 8)}</span>
                         </td>
                         <td className="px-6 py-4">
                            {group.isPrivate ? (
                              <span className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px] uppercase">
                                <Lock className="w-3 h-3" /> Private
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                                <Globe className="w-3 h-3" /> Public
                              </span>
                            )}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              group.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                              group.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {group.status || 'pending'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               {group.status !== 'approved' && (
                                 <button 
                                   onClick={() => updateDocument("groups", group.id, { status: "approved" })}
                                   className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                                   title="Approve"
                                 >
                                    <Check className="w-4 h-4" />
                                 </button>
                               )}
                               <button 
                                 onClick={() => removeDocument("groups", group.id)}
                                 className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
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
        {confirmDeleteCat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteCat(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
            >
               <div className="p-8 pb-4 text-center">
                  <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Delete Category?</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                     Are you sure you want to delete <span className="text-slate-900 font-bold">"{confirmDeleteCat.name}"</span>? 
                     All nested sub-categories will also be removed. This action cannot be undone.
                  </p>
               </div>
               <div className="p-6 bg-slate-50 flex gap-3">
                  <button 
                    onClick={() => setConfirmDeleteCat(null)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(confirmDeleteCat)}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 font-sans"
                  >
                    Confirm Delete
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
