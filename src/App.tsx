import { useEffect, useState, useRef, createContext, useContext, ReactNode } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";
import { 
  onAuthStateChanged, 
  User, 
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut 
} from "firebase/auth";
import { auth, db, FIREBASE_TARGET } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  onSnapshot,
  orderBy,
  where,
  deleteDoc,
  collection,
  query,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { 
  LayoutDashboard, 
  Newspaper, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  User as UserIcon,
  ChevronDown,
  Settings, 
  LogOut,
  Bell,
  Search,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Facebook,
  Linkedin,
  Mail,
  Lock as LockIcon,
  ChevronRight,
  Zap,
  Plus,
  Building2,
  Briefcase,
  Loader2,
  UserPlus,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection, updateDocument, removeDocument } from "./hooks/useFirestore";
import { formatDistanceToNow } from "date-fns";
import { BrandMark } from "./components/BrandMark";

import Home from "./pages/Home";
import News from "./pages/News";
import Forums from "./pages/Forums";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Surveys from "./pages/Surveys";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Companies from "./pages/Companies";
import CompanyProfile from "./pages/CompanyProfile";
import CreateResume from "./pages/CreateResume";
import Jobs from "./pages/Jobs";
import Messages from "./pages/Messages";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import PostDetail from "./pages/PostDetail";
import { ApprovalGate } from "./components/ApprovalGate";
import { toast, DialogHost } from "./lib/dialogs";

// --- Context & Types ---

// Super admin emails: these accounts can bootstrap themselves as admin on first login.
// IMPORTANT: this list must be kept in sync with the corresponding allow-list in
// firestore.rules (see the admins/{userId} create rule). Adding an email here
// without also updating the rules will result in a permission-denied error.
const SUPER_ADMIN_EMAILS = [
  "petrodeksystems@gmail.com",
  "esraigroup@gmail.com",
] as const;

// ══════════════════════════════════════════════════════════════════════
// ACCESS GATE — pre-launch only. Set to false to open the site back up
// once ready for market; that's the only code change needed on this
// side. This flag controls the UI only — it does NOT by itself protect
// data. The matching Firestore rule (isApprovedUser(), firestore.rules)
// must independently require approval for reads, or anyone can still
// fetch data directly from the Firestore SDK/REST API without ever
// loading the app shell that this flag gates.
//
// Existing accounts (created before this flag was introduced) have no
// `status` field at all. They're treated as approved automatically —
// see the `hasNoStatusField` grandfather clause below — so this migration
// doesn't lock out anyone already using the app. Only sign-ups *from now
// on* land in the pending queue. If you'd rather retroactively require
// every existing account to be re-approved too, change the grandfather
// line noted below.
// ══════════════════════════════════════════════════════════════════════
export const REQUIRE_APPROVAL_TO_VIEW = true;

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  ownedCompanies: any[];
  isCompanyOwner: boolean;
  hasBlueprint: boolean;
  tier: "A" | "B" | "C" | "admin";
  isFounder: boolean;
  // Access-gate status ("pending" | "approved" | "rejected"). Existing
  // accounts with no status field at all read as null here — treated as
  // approved by the grandfather clause in App()'s render, not by this
  // type. Always "approved" for admins regardless of the stored value.
  status: "pending" | "approved" | "rejected" | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Navigation ---
// One list drives the desktop section row and the phone drawer. Paths are
// unchanged from before the redesign; only the labels are new.
const MAIN_SECTIONS = [
  { name: "Feed", icon: LayoutDashboard, path: "/" },
  { name: "News", icon: Newspaper, path: "/news" },
  { name: "Jobs", icon: Briefcase, path: "/jobs" },
  { name: "Surveys", icon: BarChart3, path: "/surveys" },
  { name: "Groups", icon: UserIcon, path: "/groups" },
  { name: "Companies", icon: Building2, path: "/directory", adminOnly: true },
];
const MORE_SECTIONS = [
  { name: "Forums", icon: MessageSquare, path: "/forums" },
  { name: "Events", icon: Calendar, path: "/events" },
];
function isSectionActive(path: string, pathname: string) {
  if (path === "/") return pathname === "/" || pathname.startsWith("/post/");
  if (path === "/directory") return pathname.startsWith("/directory") || pathname.startsWith("/business/");
  return pathname === path || pathname.startsWith(path + "/");
}

// --- Components ---

function Navbar({ onMenuToggle, theme }: { onMenuToggle: () => void, theme: any }) {
  const { user, profile, isAdmin, logout } = useAuth();
  const isDark = false; // light theme only
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const moreActive = MORE_SECTIONS.some((m) => isSectionActive(m.path, location.pathname));
  useEffect(() => { setShowAccount(false); setShowMore(false); }, [location.pathname]);
  const [showNewChat, setShowNewChat] = useState(false);
  const { data: notifications } = useCollection<any>(
    "notifications",
    [where("recipientUid", "==", user?.uid || ""), orderBy("createdAt", "desc")],
    !!user
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  // --- Global search ---------------------------------------------------
  // Debounced so typing doesn't thrash Firestore; the 7 subscriptions below
  // only turn on once there's a real query (2+ chars), and turn back off
  // when cleared, so browsing the rest of the app never pays their cost.
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const searchEnabled = debouncedSearch.length >= 2;
  // orderBy makes the 300-doc cap deterministic — "most recent 300" instead of
  // an arbitrary 300, so once a collection grows past that, older docs are the
  // ones that age out of search rather than a silent, unpredictable subset.
  // companies uses updatedAt (touched on every write, incl. re-seeding);
  // everything else uses createdAt (set once, reliably, at creation).
  const { data: searchCompanies } = useCollection<any>("companies", [orderBy("updatedAt", "desc"), limit(300)], searchEnabled);
  const { data: searchJobs } = useCollection<any>("jobs", [orderBy("createdAt", "desc"), limit(300)], searchEnabled);
  const { data: searchGroups } = useCollection<any>("groups", [orderBy("createdAt", "desc"), limit(300)], searchEnabled);
  const { data: searchTopics } = useCollection<any>("forum_topics", [orderBy("createdAt", "desc"), limit(300)], searchEnabled);
  const { data: searchEvents } = useCollection<any>("events", [orderBy("createdAt", "desc"), limit(300)], searchEnabled);
  const { data: searchSurveys } = useCollection<any>("surveys", [orderBy("createdAt", "desc"), limit(300)], searchEnabled);
  const { data: searchPosts } = useCollection<any>("posts", [orderBy("createdAt", "desc"), limit(300)], searchEnabled);
  const { data: searchNews } = useCollection<any>("news", [orderBy("createdAt", "desc"), limit(300)], searchEnabled);

  // Tokenized AND matching: split the query into words and require every word
  // to appear SOMEWHERE across the given fields (not necessarily the same one,
  // not necessarily in order). "Jamnagar Reliance" now matches a company named
  // "Reliance Industries" whose city field says "Jamnagar" — a plain substring
  // check on the raw phrase never would. A narrow separator joins the fields so
  // a word split across two fields' boundary can't falsely bridge into a match.
  const searchWords = debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);
  const norm = (v: any) => (typeof v === "string" ? v.toLowerCase() : "");
  const matchesAll = (...fields: any[]) => {
    const hay = fields.map(norm).join(" \u241F ");
    return searchWords.length > 0 && searchWords.every((w) => hay.includes(w));
  };
  // Relevance score (lower = better): a primary field that starts with the
  // raw query outranks one that merely contains it, which outranks a match
  // that only worked because of tokenization (e.g. matched via a subtitle
  // field, or word order differed from the query).
  const scoreOf = (primary: any) => {
    const p = norm(primary), raw = debouncedSearch.toLowerCase();
    if (p.startsWith(raw)) return 0;
    if (p.includes(raw)) return 1;
    return 2;
  };
  const byRelevance = (primaryOf: (x: any) => any) => (a: any, b: any) => scoreOf(primaryOf(a)) - scoreOf(primaryOf(b));

  type SearchResult = { type: string; id: string; title: string; subtitle?: string; go: () => void };
  const searchResults: SearchResult[] = !searchEnabled ? [] : [
    ...searchCompanies
      .filter((c: any) => matchesAll(c.name, c.description, c.address))
      .sort(byRelevance((c: any) => c.name))
      .slice(0, 5)
      .map((c: any) => ({ type: "Company", id: c.id, title: c.name, subtitle: c.address, go: () => navigate(`/business/${c.id}`) })),
    ...searchJobs
      .filter((j: any) => matchesAll(j.title, j.companyName, j.description))
      .sort(byRelevance((j: any) => j.title))
      .slice(0, 5)
      .map((j: any) => ({ type: "Job", id: j.id, title: j.title, subtitle: j.companyName, go: () => navigate("/jobs", { state: { openJobId: j.id } }) })),
    ...searchGroups
      .filter((g: any) => matchesAll(g.name, g.description))
      .sort(byRelevance((g: any) => g.name))
      .slice(0, 5)
      .map((g: any) => ({ type: "Group", id: g.id, title: g.name, subtitle: g.description, go: () => navigate(`/groups/${g.id}`) })),
    ...searchTopics
      .filter((t: any) => matchesAll(t.title, t.content, t.authorName))
      .sort(byRelevance((t: any) => t.title))
      .slice(0, 5)
      .map((t: any) => ({ type: "Forum", id: t.id, title: t.title, subtitle: t.authorName ? `by ${t.authorName}` : undefined, go: () => navigate(`/forums/${t.id}`) })),
    ...searchEvents
      .filter((e: any) => matchesAll(e.title, e.description, e.location, e.companyName))
      .sort(byRelevance((e: any) => e.title))
      .slice(0, 5)
      .map((e: any) => ({ type: "Event", id: e.id, title: e.title, subtitle: e.location, go: () => navigate(`/events/${e.id}`) })),
    ...searchSurveys
      .filter((s: any) => matchesAll(s.question, s.companyName))
      .sort(byRelevance((s: any) => s.question))
      .slice(0, 5)
      .map((s: any) => ({ type: "Survey", id: s.id, title: s.question, subtitle: s.companyName, go: () => navigate("/surveys", { state: { highlightId: s.id } }) })),
    ...searchPosts
      .filter((p: any) => matchesAll(p.content, p.authorName))
      .sort(byRelevance((p: any) => p.content))
      .slice(0, 5)
      .map((p: any) => ({ type: "Post", id: p.id, title: p.content, subtitle: p.authorName, go: () => navigate(`/post/${p.id}`) })),
    ...searchNews
      .filter((n: any) => matchesAll(n.title, n.description, n.source))
      .sort(byRelevance((n: any) => n.title))
      .slice(0, 5)
      .map((n: any) => ({ type: "News", id: n.id, title: n.title, subtitle: n.source, go: () => window.open(n.url, "_blank", "noopener,noreferrer") })),
  ];

  const searchLoading = searchEnabled && searchResults.length === 0 &&
    [searchCompanies, searchJobs, searchGroups, searchTopics, searchEvents, searchSurveys, searchPosts, searchNews].every(a => a.length === 0);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setMobileSearchOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (window.innerWidth < 768) setMobileSearchOpen(true);
        else { searchInputRef.current?.focus(); setSearchOpen(true); }
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const goToResult = (r: SearchResult) => {
    r.go();
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchTerm("");
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    const promises = unread.map(n => 
      setDoc(doc(db, "notifications", n.id), { ...n, read: true })
    );
    await Promise.all(promises);
  };

  const deleteNotification = async (id: string) => {
    const { deleteDoc: firestoreDelete } = await import("firebase/firestore");
    await firestoreDelete(doc(db, "notifications", id));
  };

  return (
    <>
    <header className="sticky top-0 z-[60] bg-bg-card border-b border-border-main">
    <div className="page-frame h-16 flex items-center justify-between gap-3">

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 text-text-body hover:bg-bg-main rounded-lg transition-colors"
          id="hamburger-menu-button"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          {theme?.displayMode !== 'text_only' && (() => {
            // In dark mode, prefer the dedicated dark-background logo the
            // admin can upload (theme.logoUrlDark) — most brand marks are
            // drawn for a light background and go invisible or muddy on a
            // dark one otherwise. Falls back to the regular logo, then to
            // the built-in BrandMark, whose tone is likewise flipped so it
            // draws light strokes on the dark surface instead of dark
            // strokes that would disappear.
            const activeLogo = isDark ? (theme?.logoUrlDark || theme?.logoUrl) : theme?.logoUrl;
            return (
              <div className={`flex items-center justify-center transition-all shrink-0 overflow-hidden ${activeLogo ? "rounded-lg w-8 h-8 md:w-10 md:h-10" : "w-9 h-9 md:w-10 md:h-10"}`}>
                 {activeLogo ? (
                   <img
                     src={activeLogo}
                     className="w-full h-full object-contain"
                     alt="Logo"
                     onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none';
                     }}
                   />
                 ) : (
                   <BrandMark size={40} tone="dark" />
                 )}
              </div>
            );
          })()}
          {theme?.displayMode !== 'image_only' && (
            <div className="flex flex-col">
              <span className="font-display text-xl md:text-[22px] text-text-heading line-clamp-1 whitespace-nowrap leading-none transition-colors group-hover:text-primary">
                {theme?.siteName || "Tankonomics"}
              </span>
              {theme?.displayMode === 'both' && (
                <span className="eyebrow tabular text-text-body/55 mt-1 md:block hidden">
                  {theme?.siteTagline || "Tanks & Terminals Network"}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Search — refined with mono placeholder + kbd hint */}
        <div ref={searchRef} className="hidden md:block relative w-full max-w-md">
          <div className="flex items-center gap-2.5 bg-bg-main rounded-xl pl-4 pr-2 py-2 w-full border border-border-main focus-within:bg-bg-card focus-within:ring-4 focus-within:ring-text-heading/5 focus-within:border-text-heading transition-all">
            <Search className="w-4 h-4 text-text-body/50 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search companies, jobs, news, groups…"
              aria-label="Search Tankonomics"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent border-none focus:ring-0 text-[14px] w-full text-text-heading placeholder:text-text-body/45 outline-none"
            />
            {searchTerm ? (
              <button
                onClick={() => { setSearchTerm(""); searchInputRef.current?.focus(); }}
                className="w-6 h-6 rounded-md hover:bg-bg-card flex items-center justify-center text-text-body/50 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-text-body/50 bg-bg-card border border-border-main rounded shrink-0">⌘K</kbd>
            )}
          </div>

          {searchOpen && debouncedSearch.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border-main rounded-xl shadow-xl max-h-[70vh] overflow-y-auto z-[70]">
              {searchLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-9 bg-bg-main rounded-lg animate-pulse" />)}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="eyebrow tabular text-text-body/50 mb-1">NO RESULTS</p>
                  <p className="text-[13px] text-text-body">Nothing matches "{debouncedSearch}"</p>
                </div>
              ) : (
                <div className="py-2">
                  {Object.entries(
                    searchResults.reduce((acc: Record<string, SearchResult[]>, r) => {
                      (acc[r.type] ||= []).push(r);
                      return acc;
                    }, {})
                  ).map(([type, items]) => (
                    <div key={type} className="mb-1 last:mb-0">
                      <p className="eyebrow tabular text-text-body/40 px-4 pt-2 pb-1">{type}{items.length > 1 ? "S" : ""}</p>
                      {items.map((r) => (
                        <button
                          key={`${r.type}-${r.id}`}
                          onClick={() => goToResult(r)}
                          className="w-full text-left px-4 py-2 hover:bg-bg-main transition-colors flex items-start justify-between gap-2"
                        >
                          <span className="flex flex-col min-w-0">
                            <span className="text-[13px] text-text-heading truncate">{r.title}</span>
                            {r.subtitle && <span className="text-[11px] text-text-body/50 truncate">{r.subtitle}</span>}
                          </span>
                          {r.type === "News" && <ExternalLink className="w-3 h-3 text-text-body/40 shrink-0 mt-0.5" strokeWidth={1.75} />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {user ? (
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl text-text-body hover:bg-bg-main hover:text-text-heading transition-all md:hidden"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </button>

            <button
              id="notifications-toggle"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) markAllAsRead();
              }}
              className={`p-2 sm:p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-text-heading text-bg-card' : 'text-text-body hover:bg-bg-main hover:text-text-heading'}`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-[16px] h-4 px-1 bg-accent text-[9px] font-mono font-bold text-white flex items-center justify-center rounded-full border-2 border-bg-card tabular">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <Link
              to="/messages"
              className={`p-2 sm:p-2.5 rounded-xl transition-all ${location.pathname.startsWith("/messages") ? "bg-bg-main text-text-heading" : "text-text-body hover:bg-bg-main hover:text-text-heading"}`}
              aria-label="Messages"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </Link>

            <button
              id="messages-nav-link"
              onClick={() => setShowNewChat(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-text-body hover:bg-bg-main hover:text-text-heading rounded-xl transition-all"
              aria-label="New message"
              title="New message"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="hidden xl:inline text-[13px] font-medium">New message</span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full right-0 mt-3 w-[360px] bg-bg-card rounded-2xl shadow-2xl border border-border-main z-[70] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border-main flex items-center justify-between bg-bg-main/40">
                      <div className="flex items-center gap-2">
                        <h3 className="eyebrow tabular text-text-heading">Notifications</h3>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-medium text-text-body hover:text-text-heading transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[440px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <Bell className="w-7 h-7 text-text-body/25 mx-auto mb-3" strokeWidth={1.5} />
                          <p className="eyebrow tabular text-text-body/50">No alerts yet</p>
                          <p className="text-xs text-text-body/40 mt-2">You're all caught up.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border-main">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-4 flex items-start gap-3 group transition-colors hover:bg-bg-main/50 ${n.read ? 'opacity-60' : ''}`}
                            >
                              <div className="w-9 h-9 shrink-0 bg-bg-main border border-border-main rounded-xl flex items-center justify-center">
                                {n.type === 'connection' ? <UserPlus className="w-4 h-4 text-text-heading" strokeWidth={1.75} /> : <Briefcase className="w-4 h-4 text-text-heading" strokeWidth={1.75} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-text-heading leading-tight mb-0.5 truncate">{n.title}</p>
                                <p className="text-[12px] text-text-body line-clamp-2 leading-relaxed">{n.message}</p>

                                {n.type === 'connection' && n.metadata?.connectionId && !n.read && (
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await updateDocument("connections", n.metadata.connectionId, { status: "accepted" });
                                        await updateDocument("notifications", n.id, { read: true });
                                      }}
                                      className="px-3 py-1.5 bg-text-heading text-bg-card text-[11px] font-medium rounded-lg hover:brightness-110 flex items-center gap-1.5"
                                    >
                                      <Check className="w-3 h-3" strokeWidth={2.5} />
                                      Accept
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await updateDocument("connections", n.metadata.connectionId, { status: "rejected" });
                                        await updateDocument("notifications", n.id, { read: true });
                                      }}
                                      className="px-3 py-1.5 bg-bg-main text-text-body text-[11px] font-medium rounded-lg hover:bg-border-main"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}
                                <p className="eyebrow tabular text-text-body/40 mt-2">
                                  {n.createdAt && formatDistanceToNow(n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000) : new Date(n.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-bg-card hover:text-rust rounded-lg transition-all text-text-body/40"
                                aria-label="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Account menu */}
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => setShowAccount(!showAccount)}
                aria-haspopup="menu"
                aria-expanded={showAccount}
                aria-label="Account menu"
                className="flex items-center gap-2.5 pl-2 pr-1 sm:pr-2 py-1 rounded-xl hover:bg-bg-main transition-all"
              >
                <div className="text-right hidden xl:block">
                  <p className="text-[13px] font-medium text-text-heading leading-tight">{profile?.displayName || user.displayName}</p>
                  <p className="text-[12px] text-text-body mt-0.5">{profile?.jobTitle || "Member"}</p>
                </div>
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                  alt=""
                  className="w-9 h-9 rounded-full border border-border-main object-cover"
                />
                <ChevronDown className="w-4 h-4 text-text-body hidden sm:block" strokeWidth={1.75} />
              </button>
              {showAccount && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowAccount(false)} />
                  <div role="menu" className="absolute right-0 top-full mt-2 w-60 bg-bg-card border border-border-main rounded-lg shadow-lg z-[70] py-1.5">
                    <div className="px-4 py-2.5 border-b border-border-main mb-1">
                      <p className="text-[14px] font-medium text-text-heading truncate">{profile?.displayName || user.displayName}</p>
                      <p className="text-[12px] text-text-body truncate">{user.email}</p>
                    </div>
                    <Link role="menuitem" to="/profile" onClick={() => setShowAccount(false)} className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-text-heading hover:bg-bg-main">
                      <UserIcon className="w-4 h-4 text-text-body" strokeWidth={1.75} /> Your profile
                    </Link>
                    {isAdmin && (
                      <Link role="menuitem" to="/admin" onClick={() => setShowAccount(false)} className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-text-heading hover:bg-bg-main">
                        <Settings className="w-4 h-4 text-text-body" strokeWidth={1.75} /> Admin panel
                      </Link>
                    )}
                    <button
                      role="menuitem"
                      type="button"
                      onClick={async () => { setShowAccount(false); try { await logout(); } catch (err) { console.error("Sign out failed:", err); } }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] text-text-heading hover:bg-bg-main text-left"
                    >
                      <LogOut className="w-4 h-4 text-text-body" strokeWidth={1.75} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => useAuth().signIn()}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:brightness-110 transition-all active:scale-[0.98]"
          >
            Sign in
          </button>
        )}
      </div>
    </div>

    {/* Section links — desktop only; phones use the drawer */}
    {user && (
      <nav aria-label="Sections" className="hidden lg:block border-t border-border-main">
        <div className="page-frame flex items-center gap-1 h-11">
          {MAIN_SECTIONS.filter((item: any) => !item.adminOnly || isAdmin).map((item) => {
            const active = isSectionActive(item.path, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={`relative h-11 px-3.5 flex items-center text-[14px] transition-colors ${active ? "text-primary font-semibold" : "text-text-body font-medium hover:text-text-heading"}`}
              >
                {item.name}
                {active && <span className="absolute left-2 right-2 bottom-0 h-0.5 bg-primary rounded-full" />}
              </Link>
            );
          })}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              aria-haspopup="menu"
              aria-expanded={showMore}
              className={`relative h-11 px-3.5 flex items-center gap-1 text-[14px] transition-colors ${moreActive ? "text-primary font-semibold" : "text-text-body font-medium hover:text-text-heading"}`}
            >
              More <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
              {moreActive && <span className="absolute left-2 right-2 bottom-0 h-0.5 bg-primary rounded-full" />}
            </button>
            {showMore && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowMore(false)} />
                <div role="menu" className="absolute left-0 top-full mt-1 w-44 bg-bg-card border border-border-main rounded-lg shadow-lg z-[70] py-1.5">
                  {MORE_SECTIONS.map((item) => (
                    <Link
                      key={item.path}
                      role="menuitem"
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-2.5 px-4 py-2 text-[14px] hover:bg-bg-main ${isSectionActive(item.path, location.pathname) ? "text-primary font-semibold" : "text-text-heading"}`}
                    >
                      <item.icon className="w-4 h-4 text-text-body" strokeWidth={1.75} /> {item.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    )}
    </header>

    {/* Mobile search overlay — md:hidden trigger above opens this; reuses the
        same searchTerm/searchResults/goToResult as the desktop dropdown. */}
    <AnimatePresence>
      {mobileSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-bg-main md:hidden flex flex-col"
        >
          <div className="h-20 border-b border-border-main px-4 flex items-center gap-3 shrink-0">
            <Search className="w-4 h-4 text-text-body/50 shrink-0" />
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Search companies, jobs, news, groups…"
              aria-label="Search Tankonomics"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none flex-1 text-[15px] text-text-heading placeholder:text-text-body/45 outline-none"
            />
            <button
              onClick={() => { setMobileSearchOpen(false); setSearchTerm(""); }}
              className="p-2 -mr-2 text-text-body/60 hover:text-text-heading"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {debouncedSearch.length < 2 ? (
              <p className="p-6 text-center text-[13px] text-text-body/50">Keep typing to search…</p>
            ) : searchLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-11 bg-bg-card rounded-lg animate-pulse" />)}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center">
                <p className="eyebrow tabular text-text-body/50 mb-1">NO RESULTS</p>
                <p className="text-[13px] text-text-body">Nothing matches "{debouncedSearch}"</p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(
                  searchResults.reduce((acc: Record<string, SearchResult[]>, r) => {
                    (acc[r.type] ||= []).push(r);
                    return acc;
                  }, {})
                ).map(([type, items]) => (
                  <div key={type} className="mb-1 last:mb-0">
                    <p className="eyebrow tabular text-text-body/40 px-4 pt-3 pb-1">{type}{items.length > 1 ? "S" : ""}</p>
                    {items.map((r) => (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => goToResult(r)}
                        className="w-full text-left px-4 py-3 hover:bg-bg-card active:bg-bg-card transition-colors flex items-start justify-between gap-2 border-b border-border-main/50"
                      >
                        <span className="flex flex-col min-w-0">
                          <span className="text-[14px] text-text-heading truncate">{r.title}</span>
                          {r.subtitle && <span className="text-[12px] text-text-body/50 truncate">{r.subtitle}</span>}
                        </span>
                        {r.type === "News" && <ExternalLink className="w-3.5 h-3.5 text-text-body/40 shrink-0 mt-0.5" strokeWidth={1.75} />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <NewChatModal isOpen={showNewChat} onClose={() => setShowNewChat(false)} />
    </>
  );
}

function Sidebar({ isOpen, onClose, theme }: { isOpen: boolean; onClose: () => void, theme: any }) {
  const { user, isAdmin, logout } = useAuth();
  const isDark = false; // light theme only
  const location = useLocation();

  const navItems = [
    ...MAIN_SECTIONS.filter((item: any) => !item.adminOnly || isAdmin),
    ...MORE_SECTIONS,
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Your profile", icon: UserIcon, path: "/profile" },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin panel", icon: Settings, path: "/admin" });
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 z-[70] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-72 fixed left-0 top-0 bottom-0 bg-bg-card z-[80] shadow-xl border-r border-border-main flex flex-col lg:hidden"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <Link to="/" onClick={onClose} className="flex items-center gap-3">
             {theme?.displayMode !== 'text_only' && (() => {
               // Same dark-background logo swap as the Navbar — see the
               // comment there for why this matters.
               const activeLogo = isDark ? (theme?.logoUrlDark || theme?.logoUrl) : theme?.logoUrl;
               return (
               <div className={`flex items-center justify-center transition-all ${activeLogo ? "rounded-2xl" : ""}`}>
                  {activeLogo ? (
                    <img src={activeLogo} className="h-9 w-auto" alt="Logo" />
                  ) : (
                    <BrandMark size={40} tone={isDark ? "light" : "dark"} />
                  )}
               </div>
               );
             })()}
             {theme?.displayMode !== 'image_only' && (
               <span className="font-display text-2xl tracking-tight text-text-heading leading-none">
                 {theme?.siteName || "Tankonomics"}
               </span>
             )}
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-main rounded-xl text-text-body/50 hover:text-text-heading transition-colors"
            aria-label="Close menu"
          >
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          <p className="px-4 eyebrow text-text-body mb-2">Sections</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isSectionActive(item.path, location.pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all group ${
                    active
                      ? "bg-bg-main text-text-heading"
                      : "text-text-body hover:bg-bg-main hover:text-text-heading"
                  }`}
                >
                  {/* Vertical accent bar when active — like a control-panel indicator */}
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />
                  )}
                  <item.icon
                    className={`w-[18px] h-[18px] shrink-0 ${active ? "text-text-heading" : "text-text-body/65 group-hover:text-text-heading"}`}
                    strokeWidth={active ? 2 : 1.75}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

        </div>

        <div className="mt-auto px-6 pb-6 pt-4 border-t border-border-main">
          <div className="bg-bg-main rounded-xl p-4 mb-3 border border-border-main">
             <div className="flex items-center gap-3 mb-3">
                <img
                  src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`}
                  className="w-9 h-9 rounded-lg border border-border-main object-cover"
                  alt=""
                />
                <div className="overflow-hidden flex-1">
                   <p className="text-[13px] font-medium truncate text-text-heading leading-tight">{user?.displayName}</p>
                   <p className="text-[11px] text-text-body/60 truncate mt-0.5">{user?.email}</p>
                </div>
             </div>
             <button
               onClick={async () => {
                 try {
                   await logout();
                   onClose();
                 } catch (err) {
                   console.error("Sign out failed:", err);
                 }
               }}
               className="w-full flex items-center justify-center gap-2 py-2 bg-bg-card text-text-body rounded-lg text-[12px] font-medium border border-border-main hover:border-rust hover:text-rust transition-all"
             >
               <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
               Sign out
             </button>
          </div>
          <p className="eyebrow tabular text-center text-text-body/35">© 2026 Tankonomics</p>
        </div>
      </motion.aside>
    </>
  );
}

// --- Modals ---

function NewChatModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const { data: users, loading } = useCollection<any>("users", [where("uid", "!=", user?.uid || "")]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.jobTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const startChat = async (recipient: any) => {
    const { addDoc, collection, query, getDocs } = await import("firebase/firestore");
    
    // Check if chat already exists
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", user?.uid));
    const snapshot = await getDocs(q);
    
    let existingChat = null;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(recipient.uid)) {
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) {
      navigate(`/messages/${(existingChat as any).id}`);
    } else {
      const newChat = await addDoc(chatsRef, {
        participants: [user?.uid, recipient.uid],
        participantData: {
          [user?.uid || ""]: {
            displayName: user?.displayName,
            photoURL: user?.photoURL
          },
          [recipient.uid]: {
            displayName: recipient.displayName,
            photoURL: recipient.photoURL
          }
        },
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate(`/messages/${newChat.id}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-bg-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-4 sm:my-12 border border-border-main max-h-[90vh]"
          >
            <div className="p-8 border-b border-border-main">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-text-heading uppercase tracking-tighter">New Transmission</h2>
                  <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
                     <X className="w-5 h-5 text-text-body/40" />
                  </button>
               </div>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" />
                  <input 
                    type="text"
                    placeholder="Search by name or title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-bg-main border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-body"
                  />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
               {loading ? (
                 <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
               ) : filteredUsers.length === 0 ? (
                 <div className="p-8 text-center text-text-body/30 text-xs font-black uppercase tracking-widest">No matching agents found</div>
               ) : (
                 filteredUsers.map(u => (
                   <button 
                     key={u.id}
                     onClick={() => startChat(u)}
                     className="w-full p-4 flex items-center gap-4 rounded-2xl hover:bg-bg-main transition-all border border-transparent hover:border-border-main group text-text-body"
                   >
                     <img 
                       src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName}`}
                       className="w-12 h-12 rounded-xl border-2 border-border-main group-hover:border-primary transition-all"
                       alt=""
                     />
                     <div className="text-left">
                        <p className="text-sm font-black text-text-heading group-hover:text-primary transition-colors">{u.displayName}</p>
                        <p className="text-[10px] font-black text-text-body/40 uppercase tracking-widest">{u.jobTitle || "Protocol Member"}</p>
                     </div>
                     <Plus className="w-5 h-5 text-text-body/20 ml-auto group-hover:text-primary transition-all group-hover:scale-110" />
                   </button>
                 ))
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Pages ---

function AuthPanel({ onSignIn, theme }: { onSignIn: (provider: string) => Promise<void>, theme: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const siteName = theme?.siteName || "Tankonomics";
  const siteTagline = theme?.siteTagline || "The global network for tank & terminal professionals";

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr] bg-bg-main">
      {/* ============ LEFT — what the site is ============ */}
      <aside className="hidden lg:flex flex-col justify-between text-white p-12 xl:p-16 bg-primary">
        <Link to="/" className="flex items-center gap-3">
          {theme?.logoUrlDark || theme?.logoUrl ? (
            <img src={theme.logoUrlDark || theme.logoUrl} className="h-11 w-auto" alt="" />
          ) : (
            <BrandMark size={44} tone="light" />
          )}
          <span className="text-2xl font-semibold leading-none">{siteName}</span>
        </Link>

        <div className="max-w-lg">
          <h2 className="text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold leading-tight text-white">
            The professional network for the tank and terminal industry
          </h2>
          <p className="mt-5 text-white/75 text-base leading-relaxed">
            For terminal operators, storage companies, engineers, equipment suppliers,
            contractors and industry executives.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-white/90">
            {[
              "A feed of updates from members and companies",
              "Industry news, linked to its publishers",
              "Jobs across the sector",
              "A directory of companies, with pages their representatives can claim",
              "Groups and surveys for specialist topics",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[13px] text-white/55">© 2026 {siteName}</p>
      </aside>

      {/* ============ RIGHT — sign-in form ============ */}
      <section className="relative flex flex-col justify-center p-6 sm:p-10 lg:p-16 bg-bg-main min-w-0">
        {/* Mobile-only header (since the left panel is hidden on mobile) */}
        <div className="lg:hidden flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {theme?.logoUrl ? (
              <img src={theme.logoUrl} className="h-10 w-auto" alt={siteName} />
            ) : (
              <BrandMark size={40} tone="dark" />
            )}
            <span className="font-display text-2xl text-text-heading leading-none">{siteName}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <h1 className="text-[28px] font-semibold text-text-heading leading-tight mb-2">
            {isRegistering ? "Create your account" : "Sign in"}
          </h1>
          <p className="text-text-body text-base leading-relaxed mb-10 lg:hidden">{siteTagline}</p>
          <p className="text-text-body text-base leading-relaxed mb-10 hidden lg:block">
            {isRegistering
              ? "Set an email and password. You can complete your profile after signing in."
              : "Sign in to your account to continue."}
          </p>

          {/* Primary CTA — Google */}
          <button
            onClick={() => onSignIn("google")}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-bg-card border border-border-main rounded-xl text-text-heading font-medium hover:border-text-heading hover:shadow-sm transition-all group"
          >
            <GoogleGlyph />
            <span>Continue with Google</span>
            <ChevronRight className="w-4 h-4 text-text-body/40 group-hover:translate-x-0.5 group-hover:text-text-heading transition-all ml-auto" />
          </button>

          {/* Secondary providers */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => onSignIn("facebook")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-card border border-border-main rounded-xl text-text-body text-sm font-medium hover:border-text-heading hover:text-text-heading transition-all"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
            <button
              onClick={() => onSignIn("linkedin")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-card border border-border-main rounded-xl text-text-body text-sm font-medium hover:border-text-heading hover:text-text-heading transition-all"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-1 h-px bg-border-main" />
            <span className="px-4 eyebrow tabular text-text-body/50">or with email</span>
            <div className="flex-1 h-px bg-border-main" />
          </div>

          {/* Error toast */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 bg-rust/8 border border-rust/25 rounded-xl text-rust text-sm flex items-start gap-2"
              style={{ backgroundColor: "rgba(177,74,20,0.08)" }}
            >
              <span className="font-mono text-xs mt-0.5">!</span>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <label className="block">
              <span className="eyebrow tabular text-text-body/60 mb-2 block">Work email</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/35" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-bg-card border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 focus:border-text-heading focus:ring-4 focus:ring-text-heading/5 outline-none transition-all"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="eyebrow tabular text-text-body/60 mb-2 block">Password</span>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/35" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-bg-card border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 focus:border-text-heading focus:ring-4 focus:ring-text-heading/5 outline-none transition-all"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-medium text-[15px] hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isRegistering ? "Create account" : "Sign in"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle register / sign-in */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-text-body hover:text-text-heading transition-colors"
            >
              {isRegistering ? (
                <>Already have an account? <span className="text-text-heading font-medium underline underline-offset-4 decoration-accent decoration-2">Sign in</span></>
              ) : (
                <>New to {siteName}? <span className="text-text-heading font-medium underline underline-offset-4 decoration-accent decoration-2">Create an account</span></>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-12 text-xs text-text-body/55 leading-relaxed text-center">
            By continuing you agree to our{" "}
            <a href="#" className="text-text-heading underline underline-offset-2">Terms</a> and{" "}
            <a href="#" className="text-text-heading underline underline-offset-2">Privacy Policy</a>. Identity
            verification is required for full member access.
          </p>
        </motion.div>
      </section>
    </div>
  );
}

/** Google "G" glyph — uses official brand colours instead of a favicon image. */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ownedCompanies, setOwnedCompanies] = useState<any[]>([]);
  const [hasBlueprint, setHasBlueprint] = useState(false);
  const [theme, setTheme] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Light theme only. Clear any dark-mode state a browser saved earlier.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try { localStorage.removeItem('theme-mode'); } catch {}
  }, []);

  useEffect(() => {
    // Fetch theme from settings
    const unsubTheme = onSnapshot(doc(db, "settings", "theme"), (doc) => {
      if (doc.exists()) {
        const themeData = doc.data();
        setTheme(themeData);
        
        // DOM application of these custom colors is handled by a dedicated effect
        // keyed on [isDark, theme] (below), so it re-runs on every dark-mode toggle.
        // Keeping this snapshot callback pure is what fixes the toggle: previously
        // the inline light-mode vars set here were never cleared when switching to
        // dark (this callback captured a stale isDark and didn't re-fire on toggle),
        // and inline styles outrank the .dark class rules.
      }
    }, (error) => {
      console.error("Theme sync error:", error);
    });

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubTheme();
    };
  }, []);


  useEffect(() => {
    if (!user) {
      setProfile(null);
      setHasBlueprint(false);
      setIsAdmin(false);
      setOwnedCompanies([]);
      return;
    }

    // Track unsubscribers so we can clean up when the effect re-runs or the
    // user signs out. Declared at function scope (not inside try) so the
    // cleanup return below can see them.
    let profileUnsub: (() => void) | undefined;
    let companiesUnsub: (() => void) | undefined;
    let blueprintUnsub: (() => void) | undefined;

    // initUserContext is the single source of truth for setting up a
    // signed-in session's Firestore state. It performs three things in
    // strict order so we never race ahead of incomplete bootstrap:
    //   1. ensure users/{uid} exists (create if missing, then setProfile locally)
    //   2. attach a live profile snapshot listener
    //   3. ensure admins/{uid} state, plus owned-companies snapshot
    //
    // The previous implementation called setDoc() fire-and-forget inside
    // the snapshot callback, which caused Profile.tsx save to race ahead
    // and hit "No document to update" when the bootstrap write hadn't yet
    // completed. Awaiting setDoc here and seeding setProfile() with the
    // freshly-created object eliminates that race.
    const initUserContext = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const newProfile = {
            uid: user.uid,
            displayName: user.displayName || "New Member",
            email: user.email || "",
            photoURL: user.photoURL || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Pre-launch access gate (see REQUIRE_APPROVAL_TO_VIEW above) —
            // every new sign-up starts pending until an admin approves it
            // in Admin -> Members. Nothing here can set this to "approved";
            // only approveMember()/rejectMember() (Admin.tsx) do that, and
            // the Firestore rule enforces that server-side too.
            status: "pending",
            isPro: false,
            isPublic: true,
            jobTitle: "",
            company: "",
            companyId: "",
            industrySegment: "",
            bio: "",
            skills: [],
            badges: [],
            savedJobs: [],
            aiUsage: {},
            socialLinks: {
              linkedin: "",
              twitter: "",
              facebook: "",
              instagram: "",
              website: ""
            },
            profileLabels: {
              summaryHeading: "Professional Summary",
              experienceHeading: "Update Experience",
              skillsHeading: "Industry Skills & Endorsements",
              recommendationsHeading: "Professional Recommendations",
              badgesHeading: "Industry Certification & Badges",
              activityHeading: "Network Activity",
              technicalScheduleHeading: "My Technical Schedule"
            }
          };

          // Await so subsequent profile editing always finds a real document.
          await setDoc(userRef, newProfile);

          // Seed local state immediately - don't wait for the snapshot
          // round-trip. We swap serverTimestamp() sentinels for Date objects
          // so any UI that reads .createdAt / .updatedAt doesn't choke on
          // the sentinel placeholder.
          setProfile({
            ...newProfile,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        // Attach the real-time listener AFTER ensuring the doc exists.
        profileUnsub = onSnapshot(
          userRef,
          (userDoc) => {
            if (userDoc.exists()) {
              setProfile(userDoc.data());
            }
            // If the doc somehow goes missing later, we intentionally don't
            // re-create it from here. Recreation belongs in this initial
            // bootstrap step, not in the live listener, to avoid loops.
          },
          (error) => {
            console.error("Profile sync error:", error);
          }
        );

        // Admin bootstrap. Awaited so isAdmin is set deterministically.
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);
        const isSuperAdminEmail =
          user.email != null &&
          SUPER_ADMIN_EMAILS.includes(user.email as any);

        // Super-admin emails are admins regardless of whether the backing doc
        // exists yet — the Firestore rules grant them access by email claim too,
        // so the two sides agree. Best-effort create the doc for consistency,
        // but don't gate admin status on the write succeeding.
        if (!adminSnap.exists() && isSuperAdminEmail) {
          try {
            await setDoc(adminRef, {
              email: user.email,
              grantedAt: serverTimestamp(),
              role: "super_admin"
            });
          } catch (e) {
            console.warn("admins/{uid} auto-create skipped:", e);
          }
        }
        setIsAdmin(adminSnap.exists() || isSuperAdminEmail);

        // Owned-companies live listener. Safe to start at any time.
        companiesUnsub = onSnapshot(
          query(collection(db, "companies"), where("ownerUid", "==", user.uid)),
          (snapshot) => {
            const cos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setOwnedCompanies(cos);
          }
        );

        // Blueprint presence drives B-tier (email-verified + has a Blueprint).
        blueprintUnsub = onSnapshot(
          query(collection(db, "resumes"), where("userUid", "==", user.uid)),
          (snapshot) => {
            setHasBlueprint(!snapshot.empty);
          }
        );
      } catch (error) {
        // Bootstrap failures are now surfaced instead of swallowed.
        // Common causes: rule rejection on user create, transient network.
        console.error("User bootstrap failed:", error);
      }
    };

    initUserContext();

    return () => {
      profileUnsub?.();
      companiesUnsub?.();
      blueprintUnsub?.();
    };
  }, [user]);

  // Handle the result of signInWithRedirect when the user returns from the OAuth provider.
  // Runs once on mount; getRedirectResult is a no-op if there's no pending redirect.
  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      if (error?.code !== 'auth/no-auth-event') {
        console.error("Redirect sign-in error:", error);
      }
    });
  }, []);

  const signIn = async (providerName: string = 'google') => {
    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else if (providerName === 'facebook') {
        provider = new FacebookAuthProvider();
      } else if (providerName === 'linkedin') {
        provider = new OAuthProvider('linkedin.com');
      } else {
        return;
      }
      // On localhost and on the staging project the sign-in page lives on another
      // domain (<project>.firebaseapp.com), and browsers block the redirect result
      // coming back across domains, which drops the user on the login page again.
      // A popup does not have that problem. The deployed production app keeps the
      // redirect flow (same domain as its sign-in page).
      const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (isLocal || FIREBASE_TARGET === "staging") {
        await signInWithPopup(auth, provider);
        return;
      }
      await signInWithRedirect(auth, provider);
      // Execution stops here: the browser navigates to the OAuth provider.
      // When the user returns, the useEffect above picks up the credential.
    } catch (error) {
      console.error("Sign in error:", error);
      toast("Social Sign-in failed. Please ensure the provider is configured in Firebase Console.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    // Reset the URL to root. logout() lives outside the Router, so useNavigate
    // isn't available here; a root replace also guarantees a clean slate
    // (clears any route-scoped state) for the next sign-in.
    if (window.location.pathname !== "/") {
      window.location.assign("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      ownedCompanies, 
      isCompanyOwner: ownedCompanies.length > 0 || isAdmin,
      hasBlueprint,
      // Tier: A (registered) < B (member: email-verified + Blueprint) < C
      // (company premium: owns an approved company with plan=='premium').
      // Admin orthogonal. isPro remains a separate USER flag reserved for the
      // future Premium Individual product — it does NOT grant C.
      isFounder: profile?.isFounder === true,
      // Tier: A < B < C. Founder is a ROLE (invite-only, admin-appointed) that
      // grants C-equivalent privileges without owning a premium company —
      // orthogonal to tier per USER_TIERS.md §1.
      tier: (
        isAdmin ? "admin"
        : (profile?.isFounder === true) ? "C"
        : (ownedCompanies.some((c: any) => c.status === "approved" && c.plan === "premium")) ? "C"
        : (user?.emailVerified && hasBlueprint) ? "B"
        : "A"
      ),
      // Access-gate status — admins always read as approved regardless of
      // their own profile doc, matching how isAdmin already bypasses every
      // other tier check in this app.
      status: isAdmin ? "approved" : (profile?.status ?? null),
      signIn, 
      logout 
    }}>
        <Router>
          <div className="min-h-screen bg-bg-main text-text-body font-sans">
          {!user ? (
            <AuthPanel onSignIn={signIn} theme={theme} />
          ) : REQUIRE_APPROVAL_TO_VIEW && !isAdmin && profile?.status === "rejected" ? (
            <ApprovalGate status="rejected" email={user.email} onSignOut={logout} />
          ) : REQUIRE_APPROVAL_TO_VIEW && !isAdmin &&
            // Grandfather clause: an existing account from before this gate
            // existed has profile.status === undefined, not "pending" — that
            // reads as approved here so nobody already using the app gets
            // locked out by this migration. Only accounts explicitly created
            // with status:"pending" (i.e. everyone signing up from now on)
            // are held for review. To require re-approval of existing
            // accounts too, change this to check `!== "approved"` instead.
            profile?.status === "pending" ? (
            <ApprovalGate status="pending" email={user.email} onSignOut={logout} uid={user.uid} profile={profile} />
          ) : (
            <>
              <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} theme={theme} />
              <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} theme={theme} />
              <div className="min-h-[calc(100vh-80px)]">
                <main>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/news" element={<News />} />
                      <Route path="/forums" element={<Forums />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:eventId" element={<EventDetail />} />
                      <Route path="/surveys" element={<Surveys />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route path="/create-resume" element={<CreateResume />} />
                      <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
                      <Route path="/directory" element={isAdmin ? <Companies /> : <Navigate to="/" replace />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/messages/:chatId" element={<Messages />} />
                      <Route path="/groups" element={<Groups />} />
                      <Route path="/groups/:groupId" element={<GroupDetail />} />
                      <Route path="/post/:postId" element={<PostDetail />} />
                      <Route path="/forums/:topicId" element={<PostDetail />} />
                      <Route path="/groups/:groupId/posts/:postId" element={<PostDetail />} />
                      <Route path="/business/:id" element={<CompanyProfile />} />
                    </Routes>
                  </AnimatePresence>
                </main>
              </div>
            </>
          )}
        </div>
      </Router>
      <DialogHost />
    </AuthContext.Provider>
  );
}
