import { useEffect, useState, createContext, useContext, ReactNode } from "react";
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
  getRedirectResult,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut 
} from "firebase/auth";
import { auth, db } from "./firebase";
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
  serverTimestamp
} from "firebase/firestore";
import { 
  LayoutDashboard, 
  Newspaper, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Bell,
  Search,
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

// --- Context & Types ---

// Super admin emails: these accounts can bootstrap themselves as admin on first login.
// IMPORTANT: this list must be kept in sync with the corresponding allow-list in
// firestore.rules (see the admins/{userId} create rule). Adding an email here
// without also updating the rules will result in a permission-denied error.
const SUPER_ADMIN_EMAILS = [
  "petrodeksystems@gmail.com",
  "esraigroup@gmail.com",
] as const;

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  ownedCompanies: any[];
  isCompanyOwner: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Theme Context ---

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

// --- Components ---

function Navbar({ onMenuToggle, theme }: { onMenuToggle: () => void, theme: any }) {
  const { user, profile } = useAuth();
  const { isDark, setMode } = useTheme();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const { data: notifications } = useCollection<any>(
    "notifications",
    [where("recipientUid", "==", user?.uid || ""), orderBy("createdAt", "desc")],
    !!user
  );

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <nav className="h-20 border-b border-border-main bg-bg-card/85 backdrop-blur-md sticky top-0 z-[60] px-2 sm:px-4 md:px-8 flex items-center justify-between">
      {/* Hairline accent — a thin orange stripe at the very top, like a status bar */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
        <button
          onClick={onMenuToggle}
          className="p-2 text-text-body hover:bg-bg-main rounded-xl transition-colors"
          id="hamburger-menu-button"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          {theme?.displayMode !== 'text_only' && (
            <div className={`flex items-center justify-center transition-all shrink-0 overflow-hidden ${theme?.logoUrl ? "rounded-lg w-8 h-8 md:w-[50px] md:h-[50px]" : "w-9 h-9 md:w-11 md:h-11"}`}>
               {theme?.logoUrl ? (
                 <img
                   src={theme.logoUrl}
                   className="w-full h-full object-contain transition-transform group-hover:scale-105"
                   alt="Logo"
                   onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none';
                   }}
                 />
               ) : (
                 <BrandMark size={44} tone="dark" className="transition-transform group-hover:scale-105" />
               )}
            </div>
          )}
          {theme?.displayMode !== 'image_only' && (
            <div className="flex flex-col">
              <span className="font-display text-[22px] sm:text-2xl md:text-[28px] tracking-tight text-text-heading line-clamp-1 whitespace-nowrap leading-none transition-colors group-hover:text-primary">
                {theme?.siteName || "Tankonomics"}
              </span>
              {theme?.displayMode === 'both' && (
                <span className="eyebrow tabular text-text-body/55 mt-1 md:block hidden">
                  {theme?.siteTagline || "Verified network identity"}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Search — refined with mono placeholder + kbd hint */}
        <div className="hidden md:flex items-center gap-2.5 bg-bg-main rounded-xl pl-4 pr-2 py-2 w-80 border border-border-main focus-within:bg-bg-card focus-within:ring-4 focus-within:ring-text-heading/5 focus-within:border-text-heading transition-all">
          <Search className="w-4 h-4 text-text-body/50 shrink-0" />
          <input
            type="text"
            placeholder="Search partners, news, events…"
            className="bg-transparent border-none focus:ring-0 text-[14px] w-full text-text-heading placeholder:text-text-body/45 outline-none"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-text-body/50 bg-bg-card border border-border-main rounded">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {user ? (
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative">
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

            <button
              id="messages-nav-link"
              onClick={() => setShowNewChat(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-text-body hover:bg-bg-main hover:text-text-heading rounded-xl transition-all"
              aria-label="New message"
              title="New message"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="hidden lg:inline text-[13px] font-medium">New</span>
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
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
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

            {/* Profile chip — refined to a flat editorial style */}
            <Link to="/profile" className="flex items-center gap-3 group pl-2 pr-1 sm:pr-2 py-1 rounded-xl hover:bg-bg-main transition-all ml-1">
              <div className="text-right hidden md:block">
                <p className="text-[13px] font-medium text-text-heading leading-tight">{profile?.displayName || user.displayName}</p>
                <p className="eyebrow tabular text-text-body/60 mt-0.5">{profile?.jobTitle || "Member"}</p>
              </div>
              <div className="relative">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                  alt="Profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-border-main group-hover:border-text-heading transition-all object-cover"
                />
                {/* Verified-status dot — small accent in the corner */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-bg-card" title="Verified member" />
              </div>
            </Link>
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
    </nav>
    <NewChatModal isOpen={showNewChat} onClose={() => setShowNewChat(false)} />
    </>
  );
}

function Sidebar({ isOpen, onClose, theme }: { isOpen: boolean; onClose: () => void, theme: any }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: LayoutDashboard, path: "/" },
    { name: "Global News", icon: Newspaper, path: "/news" },
    { name: "Directory", icon: Building2, path: "/directory" },
    { name: "Jobs", icon: Briefcase, path: "/jobs" },
    { name: "Forums", icon: MessageSquare, path: "/forums" },
    { name: "Events", icon: Calendar, path: "/events" },
    { name: "Surveys", icon: BarChart3, path: "/surveys" },
    { name: "Groups", icon: UserIcon, path: "/groups" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin Panel", icon: Settings, path: "/admin" });
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]"
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
        className="w-72 fixed left-0 top-0 bottom-0 bg-bg-card z-[80] shadow-2xl border-r border-border-main flex flex-col"
      >
        {/* Top accent hairline */}
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent/0 via-accent/60 to-accent/0" />

        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <Link to="/" onClick={onClose} className="flex items-center gap-3">
             {theme?.displayMode !== 'text_only' && (
               <div className={`flex items-center justify-center transition-all ${theme?.logoUrl ? "rounded-2xl" : ""}`}>
                  {theme?.logoUrl ? (
                    <img src={theme.logoUrl} className="h-9 w-auto" alt="Logo" />
                  ) : (
                    <BrandMark size={40} tone="dark" />
                  )}
               </div>
             )}
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
          <p className="px-4 eyebrow tabular text-text-body/45 mb-3">Core navigation</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
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
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />
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
      {/* ============ LEFT — editorial hero panel ============ */}
      <aside className="relative hidden lg:flex flex-col justify-between text-white p-12 xl:p-16 bg-primary overflow-hidden grain">
        {/* Blueprint grid background */}
        <div className="absolute inset-0 bp-grid pointer-events-none" />
        {/* Atmospheric wash */}
        <div
          className="absolute inset-0 pointer-events-none opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 15% 10%, rgba(30,74,114,0.55) 0%, rgba(11,27,43,0) 60%)",
          }}
        />

        {/* Top row: logo + locator */}
        <div className="relative flex items-start justify-between">
          <Link to="/" className="flex items-center gap-3">
            {theme?.logoUrl ? (
              <img src={theme.logoUrl} className="h-12 w-auto" alt={siteName} />
            ) : (
              <BrandMark size={48} tone="light" />
            )}
            <div className="font-display text-3xl leading-none">{siteName}</div>
          </Link>
          <div className="eyebrow tabular text-white/55 text-right">
            <div className="text-white/80">EST. 2026</div>
            <div>N 19.07° · E 72.88°</div>
          </div>
        </div>

        {/* Centre: editorial statement */}
        <div className="relative max-w-xl">
          <div className="flex items-center gap-3 eyebrow tabular text-accent mb-6">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
            VERIFIED INDUSTRY NETWORK
          </div>
          <h2 className="font-display text-[clamp(2.5rem,4.2vw,4.5rem)] leading-[0.98] text-white">
            Where the storage tank industry meets,{" "}
            <em className="italic text-accent">
              quietly.
            </em>
          </h2>
          <p className="mt-8 text-white/65 text-base leading-relaxed max-w-md">
            Connect with vetted operators, EPCs, OEMs and inspectors. Read sector reports,
            post technical questions, and discover work — without the noise of a public feed.
          </p>

          {/* Three small data plinths */}
          <div className="mt-12 grid grid-cols-3 gap-px bg-white/10 border border-white/10 max-w-md">
            {[
              { kpi: "1,200+", label: "Verified members" },
              { kpi: "180", label: "Companies indexed" },
              { kpi: "42", label: "Countries" },
            ].map((s) => (
              <div key={s.label} className="bg-primary/80 p-4">
                <div className="font-display text-3xl text-white tabular">{s.kpi}</div>
                <div className="eyebrow tabular text-white/45 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: rolling industry strip */}
        <div className="relative -mx-12 xl:-mx-16">
          <div className="flex items-center gap-3 eyebrow tabular text-white/40 px-12 xl:px-16 mb-3">
            <span className="h-px flex-1 bg-white/15" />
            INDEXED SECTORS
            <span className="h-px flex-1 bg-white/15" />
          </div>
          <div className="overflow-hidden mask-fade-x">
            <div className="marquee flex gap-12 whitespace-nowrap w-max">
              {[...Array(2)].flatMap((_, k) =>
                [
                  "Crude oil storage",
                  "Refined products",
                  "Chemicals · Petrochem",
                  "LNG · LPG",
                  "Biofuels",
                  "Vegetable oils",
                  "Inspection & integrity",
                  "Cleaning & maintenance",
                  "Terminal automation",
                  "EPC · Engineering",
                ].map((s, i) => (
                  <span
                    key={`${k}-${i}`}
                    className="eyebrow tabular text-white/55 flex items-center gap-3"
                  >
                    <span className="text-accent">◆</span>
                    {s}
                  </span>
                )),
              )}
            </div>
          </div>
        </div>

        {/* Corner registration ticks */}
        <span className="absolute top-8 left-8 w-4 h-4 border-t border-l border-white/30" />
        <span className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/30" />
        <span className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/30" />
        <span className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/30" />
      </aside>

      {/* ============ RIGHT — sign-in form ============ */}
      <section className="relative flex flex-col justify-center p-6 sm:p-10 lg:p-16 bg-bg-main min-w-0 overflow-hidden">
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
          <span className="eyebrow tabular text-text-body/50">EST. 2026</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto"
        >
          {/* Eyebrow + heading */}
          <div className="eyebrow tabular text-accent mb-3">
            {isRegistering ? "01 / CREATE ACCOUNT" : "01 / SIGN IN"}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-text-heading leading-[0.95] mb-3">
            {isRegistering ? "Join the index." : "Welcome back."}
          </h1>
          <p className="text-text-body text-base leading-relaxed mb-10 lg:hidden">{siteTagline}</p>
          <p className="text-text-body text-base leading-relaxed mb-10 hidden lg:block">
            {isRegistering
              ? "Set up credentials. You can complete your industry profile after sign-in."
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

        {/* Mobile sector marquee — gives mobile a hint of the industrial feel */}
        <div className="lg:hidden mt-12 -mx-6 sm:-mx-10 overflow-hidden mask-fade-x">
          <div className="marquee flex gap-8 whitespace-nowrap w-max">
            {[...Array(2)].flatMap((_, k) =>
              ["Crude oil", "Refined products", "Chemicals", "LNG · LPG", "Biofuels", "Inspection", "EPC"].map(
                (s, i) => (
                  <span
                    key={`${k}-${i}`}
                    className="eyebrow tabular text-text-body/40 flex items-center gap-2"
                  >
                    <span className="text-accent">◆</span>
                    {s}
                  </span>
                ),
              ),
            )}
          </div>
        </div>
      </section>

      {/* Mask-fade utility for marquee edges */}
      <style>{`
        .mask-fade-x {
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
      `}</style>
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

function Splash() {
  // Splash renders before auth/theme context is ready, so it fetches the
  // branding logo directly. Prefers the dark-background (light/white) logo,
  // since the splash sits on a dark surface. `logoReady` gates the mark so we
  // don't flash the BrandMark fallback before the fetch resolves.
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoReady, setLogoReady] = useState(false);
  // Drives the one-time "color settles" moment: the overlay lightens slightly
  // a beat after mount, letting the tank-farm photo emerge faintly.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let alive = true;
    getDoc(doc(db, "settings", "theme"))
      .then((snap) => {
        if (!alive) return;
        const d = snap.exists() ? snap.data() : null;
        if (d?.logoUrlDark) setLogoUrl(d.logoUrlDark);
        else if (d?.logoUrl) setLogoUrl(d.logoUrl);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLogoReady(true); });
    const t = setTimeout(() => alive && setSettled(true), 1400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-primary text-white flex flex-col items-center justify-center overflow-hidden grain">
      {/* Tank-farm photo background — drop a compressed image at public/tank-farm.webp.
          If the file is absent the <img> hides itself and the petroleum background
          shows through, so the splash still works without it. */}
      <img
        src="/tank-farm.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{
          transform: settled ? "scale(1.06)" : "scale(1.0)",
          transition: "transform 6s ease-out",
        }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />

      {/* Petroleum overlay + color-tint — keeps the photo atmospheric and the
          brand palette intact. Lightens once when `settled` flips. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(11,27,43,0.55) 0%, rgba(11,27,43,0.86) 68%, rgba(11,27,43,0.95) 100%)",
          opacity: settled ? 0.82 : 1,
          transition: "opacity 1.6s ease",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "#0b1b2b", mixBlendMode: "color", opacity: 0.5 }}
      />

      {/* Blueprint coordinate grid */}
      <div className="absolute inset-0 bp-grid pointer-events-none" />

      {/* Corner registration marks — like an engineering drawing */}
      <CornerTicks />

      {/* Top-left technical metadata */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 text-white/55 eyebrow tabular flex items-center gap-3">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
        <span>INDEX · LIVE</span>
      </div>

      {/* Top-right coordinates */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white/55 eyebrow tabular text-right">
        <div>N 19.0760° · E 72.8777°</div>
        <div className="opacity-60">REV 2026.05</div>
      </div>

      {/* Hero mark with gauge sweep */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Gauge sweep ring — animated stroke */}
        <svg
          className="absolute inset-0 -m-6"
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
          style={{ filter: "drop-shadow(0 0 24px rgba(234,115,23,0.35))" }}
        >
          <circle cx="90" cy="90" r="78" stroke="rgba(245,243,239,0.08)" strokeWidth="1" />
          <circle
            cx="90"
            cy="90"
            r="78"
            stroke="#ea7317"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="490"
            className="gauge-sweep"
            transform="rotate(-90 90 90)"
          />
        </svg>

        {logoReady && (
          logoUrl ? (
            <img
              src={logoUrl}
              alt="Tankonomics"
              className="w-[132px] h-[132px] object-contain"
              style={{ filter: "drop-shadow(0 2px 16px rgba(11,27,43,0.5))" }}
            />
          ) : (
            <BrandMark size={132} tone="light" />
          )
        )}
      </motion.div>

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12 text-center px-6"
      >
        <h1
          className="font-display text-5xl sm:text-6xl text-white leading-[0.95]"
          style={{ textShadow: "0 2px 24px rgba(11,27,43,0.55)" }}
        >
          Tankonomics
        </h1>
        <div className="mt-3 flex items-center justify-center gap-3 text-white/50">
          <span className="h-px w-8 bg-white/30" />
          <span className="eyebrow tabular text-white/65">The Global Tank & Terminal Network</span>
          <span className="h-px w-8 bg-white/30" />
        </div>
      </motion.div>

      {/* Bottom technical strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 sm:bottom-12 left-0 right-0 flex flex-col items-center gap-4 px-6"
      >
        {/* Gauge progress bar */}
        <div className="relative w-56 h-px bg-white/15">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left" }}
            className="absolute inset-y-0 left-0 right-0 bg-accent"
          />
          {/* Tick marks */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <span
              key={p}
              className="absolute -top-1 w-px h-2 bg-white/30"
              style={{ left: `${p * 100}%` }}
            />
          ))}
        </div>
        <div className="eyebrow tabular text-white/40 flex items-center gap-3 sm:gap-6 whitespace-nowrap">
          <span className="hidden sm:inline">INITIALISING</span>
          <span className="sm:hidden">INIT</span>
          <span className="opacity-60">·</span>
          <span className="hidden sm:inline">VERIFYING IDENTITY</span>
          <span className="sm:hidden">VERIFY</span>
          <span className="opacity-60">·</span>
          <span className="hidden sm:inline">LOADING INDEX</span>
          <span className="sm:hidden">INDEX</span>
        </div>
      </motion.div>
    </div>
  );
}

/** Corner registration ticks — small L-shaped marks at each corner of the viewport. */
function CornerTicks() {
  const tick = "absolute w-5 h-5 border-white/35";
  return (
    <>
      <div className={`${tick} top-6 left-6 sm:top-10 sm:left-10 border-t border-l`} />
      <div className={`${tick} top-6 right-6 sm:top-10 sm:right-10 border-t border-r`} />
      <div className={`${tick} bottom-6 left-6 sm:bottom-10 sm:left-10 border-b border-l`} />
      <div className={`${tick} bottom-6 right-6 sm:bottom-10 sm:right-10 border-b border-r`} />
    </>
  );
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSplashing, setIsSplashing] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ownedCompanies, setOwnedCompanies] = useState<any[]>([]);
  const [theme, setTheme] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // User Theme Preference
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (themeMode: ThemeMode) => {
      let resolvedMode = themeMode;
      if (themeMode === 'system') {
        resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      const isActuallyDark = resolvedMode === 'dark';
      setIsDark(isActuallyDark);
      
      if (isActuallyDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      localStorage.setItem('theme-mode', themeMode);
    };

    applyTheme(mode);

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

  useEffect(() => {
    // Fetch theme from settings
    const unsubTheme = onSnapshot(doc(db, "settings", "theme"), (doc) => {
      if (doc.exists()) {
        const themeData = doc.data();
        setTheme(themeData);
        
        // ONLY apply site-wide custom colors if NOT in dark mode
        // This allows the default dark mode variables in CSS to work
        const root = document.documentElement;
        if (!isDark) {
          if (themeData.primaryColor) root.style.setProperty("--primary-brand", themeData.primaryColor);
          if (themeData.secondaryColor) root.style.setProperty("--secondary-brand", themeData.secondaryColor);
          if (themeData.accentColor) root.style.setProperty("--accent-brand", themeData.accentColor);
          if (themeData.backgroundColor) root.style.setProperty("--bg-main", themeData.backgroundColor);
          if (themeData.headingColor) root.style.setProperty("--text-heading", themeData.headingColor);
          if (themeData.bodyTextColor) root.style.setProperty("--text-body", themeData.bodyTextColor);
          if (themeData.cardBackgroundColor) root.style.setProperty("--bg-card", themeData.cardBackgroundColor);
          if (themeData.borderColor) root.style.setProperty("--border-main", themeData.borderColor);
          if (themeData.sidebarFocusColor) root.style.setProperty("--sidebar-focus", themeData.sidebarFocusColor);
          if (themeData.sidebarFocusTextColor) root.style.setProperty("--sidebar-focus-text", themeData.sidebarFocusTextColor);
        } else {
          // In dark mode, we clear the inline styles to let index.css .dark variables win
          // unless the user specifically wants to customize dark mode too (not implemented here)
          root.style.removeProperty("--primary-brand");
          root.style.removeProperty("--secondary-brand");
          root.style.removeProperty("--accent-brand");
          root.style.removeProperty("--bg-main");
          root.style.removeProperty("--text-heading");
          root.style.removeProperty("--text-body");
          root.style.removeProperty("--bg-card");
          root.style.removeProperty("--border-main");
          root.style.removeProperty("--sidebar-focus");
          root.style.removeProperty("--sidebar-focus-text");
        }
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
      setIsAdmin(false);
      setOwnedCompanies([]);
      return;
    }

    // Track unsubscribers so we can clean up when the effect re-runs or the
    // user signs out. Declared at function scope (not inside try) so the
    // cleanup return below can see them.
    let profileUnsub: (() => void) | undefined;
    let companiesUnsub: (() => void) | undefined;

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
      await signInWithRedirect(auth, provider);
      // Execution stops here: the browser navigates to the OAuth provider.
      // When the user returns, the useEffect above picks up the credential.
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Social Sign-in failed. Please ensure the provider is configured in Firebase Console.");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (isSplashing) {
    return <Splash />;
  }

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
      signIn, 
      logout 
    }}>
      <ThemeContext.Provider value={{ mode, setMode, isDark }}>
        <Router>
          <div className="min-h-screen bg-bg-main text-text-body font-sans transition-colors duration-500">
          {!user ? (
            <AuthPanel onSignIn={signIn} theme={theme} />
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
                      <Route path="/directory" element={<Companies />} />
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
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}
