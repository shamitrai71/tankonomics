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
  FileCode,
  Building2,
  Briefcase,
  Loader2,
  UserPlus,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection, updateDocument, removeDocument } from "./hooks/useFirestore";
import { formatDistanceToNow } from "date-fns";

import Home from "./pages/Home";
import News from "./pages/News";
import Forums from "./pages/Forums";
import Events from "./pages/Events";
import Surveys from "./pages/Surveys";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import DynamicPage from "./pages/DynamicPage";
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
    <nav className="h-20 border-b border-border-main bg-bg-card/80 backdrop-blur-md sticky top-0 z-[60] px-2 sm:px-4 md:px-8 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
        <button 
          onClick={onMenuToggle}
          className="p-2 text-text-body hover:bg-bg-main rounded-xl transition-colors"
          id="hamburger-menu-button"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          {theme?.displayMode !== 'text_only' && (
            <div className={`rounded-lg flex items-center justify-center transition-all shrink-0 overflow-hidden ${theme?.logoUrl ? "w-8 h-8 md:w-[50px] md:h-[50px]" : "w-8 h-8 md:w-10 md:h-10 bg-primary shadow-xl shadow-primary/20"}`}>
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
                 <LayoutDashboard className="text-white w-5 h-5 md:w-7 md:h-7" />
               )}
            </div>
          )}
          {theme?.displayMode !== 'image_only' && (
            <div className="flex flex-col">
              <span className="font-black text-[15px] sm:text-lg md:text-3xl tracking-tighter text-text-heading line-clamp-1 uppercase whitespace-nowrap leading-none transition-colors group-hover:text-primary">
                {theme?.siteName || "Tankonomics"}
              </span>
              {theme?.displayMode === 'both' && (
                <span className="text-[7px] md:text-[8px] font-black uppercase text-text-body/40 tracking-widest mt-0.5 md:mt-1 md:block hidden">
                  {theme?.siteTagline || "Verified Network Identity"}
                </span>
              )}
            </div>
          )}
        </Link>
        
        <div className="hidden md:flex items-center gap-2 bg-bg-main rounded-2xl px-4 py-2.5 w-80 border border-border-main focus-within:bg-bg-card focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all">
          <Search className="w-4 h-4 text-text-body/60" />
          <input 
            type="text" 
            placeholder="Search partners, news, events..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium text-text-body placeholder:text-text-body/30 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
        {user ? (
          <div className="flex items-center gap-1 sm:gap-3 md:gap-6 relative">
            <button 
              id="notifications-toggle"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) markAllAsRead();
              }}
              className={`p-2 sm:p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-primary text-white shadow-lg' : 'text-text-body/60 hover:bg-bg-main'}`}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 sm:top-3 sm:right-3 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-accent text-[7px] sm:text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-bg-card">
                  {unreadCount}
                </span>
              )}
            </button>

            <button 
              id="messages-nav-link"
              onClick={() => setShowNewChat(true)}
              className="p-2 sm:p-3 text-text-body/60 hover:bg-bg-main rounded-2xl transition-all relative"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-[60]" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-bg-card rounded-[2rem] shadow-2xl border border-border-main p-2 z-[70] overflow-hidden"
                  >
                    <div className="p-4 border-b border-border-main flex items-center justify-between">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-text-heading">Notifications</h3>
                       {notifications.length > 0 && (
                         <button 
                           onClick={markAllAsRead}
                           className="text-[9px] font-black text-primary uppercase hover:underline"
                         >
                           Mark all read
                         </button>
                       )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                       {notifications.length === 0 ? (
                         <div className="p-12 text-center">
                            <Bell className="w-8 h-8 text-text-body/20 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-text-body/30 uppercase tracking-widest">No alerts yet</p>
                         </div>
                       ) : (
                         <div className="space-y-1 p-1">
                           {notifications.map((n) => (
                             <div 
                                key={n.id}
                                className={`p-4 rounded-2xl transition-all flex items-start gap-4 group ${n.read ? 'opacity-60' : 'bg-bg-main'}`}
                             >
                                <div className="w-10 h-10 shrink-0 bg-bg-card border border-border-main rounded-xl flex items-center justify-center shadow-sm">
                                   {n.type === 'connection' ? <UserPlus className="w-5 h-5 text-primary" /> : <Briefcase className="w-5 h-5 text-primary" />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                   <p className="text-[11px] font-black text-text-heading leading-tight mb-1">{n.title}</p>
                                   <p className="text-[11px] text-text-body/70 line-clamp-2 leading-relaxed">{n.message}</p>
                                   
                                   {n.type === 'connection' && n.metadata?.connectionId && !n.read && (
                                     <div className="flex gap-2 mt-3">
                                       <button 
                                         onClick={async (e) => {
                                           e.stopPropagation();
                                           await updateDocument("connections", n.metadata.connectionId, { status: "accepted" });
                                           await updateDocument("notifications", n.id, { read: true });
                                         }}
                                         className="px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 flex items-center gap-1.5"
                                       >
                                         <Check className="w-3 h-3" />
                                         Accept
                                       </button>
                                       <button 
                                         onClick={async (e) => {
                                           e.stopPropagation();
                                           await updateDocument("connections", n.metadata.connectionId, { status: "rejected" });
                                           await updateDocument("notifications", n.id, { read: true });
                                         }}
                                         className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-lg hover:bg-slate-200"
                                       >
                                         Decline
                                       </button>
                                     </div>
                                   )}
                                   <p className="text-[8px] font-black text-text-body/30 uppercase mt-2 tracking-widest">
                                      {n.createdAt && formatDistanceToNow(n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000) : new Date(n.createdAt), { addSuffix: true })}
                                   </p>
                                </div>
                                <button 
                                  onClick={() => deleteNotification(n.id)}
                                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-bg-card hover:text-red-500 rounded-lg transition-all text-text-body/30"
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
              <Link to="/profile" className="flex items-center gap-3 group px-1 rounded-2xl">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-text-heading leading-none mb-1">{profile?.displayName || user.displayName}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{profile?.jobTitle || "Member"}</p>
              </div>
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                alt="Profile" 
                className="w-11 h-11 rounded-2xl border-2 border-border-main group-hover:border-primary transition-all shadow-xl shadow-primary/10"
              />
            </Link>
          </div>
        ) : (
          <button 
            onClick={() => useAuth().signIn()}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl active:scale-95"
          >
            Start Exploring
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
  const { data: dynamicPages } = useCollection<any>("dynamic_pages", [orderBy("createdAt", "asc")]);

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
        className="w-72 fixed left-0 top-0 bottom-0 bg-bg-card z-[80] shadow-2xl border-r border-border-main flex flex-col p-6"
      >
        <div className="flex items-center justify-between mb-10">
          <Link to="/" onClick={onClose} className="flex items-center gap-3">
             {theme?.displayMode !== 'text_only' && (
               <div className={`rounded-2xl flex items-center justify-center transition-all ${theme?.logoUrl ? "" : "w-10 h-10 bg-primary shadow-xl shadow-primary/20"}`}>
                  {theme?.logoUrl ? (
                    <img src={theme.logoUrl} className="h-8 w-auto" alt="Logo" />
                  ) : (
                    <LayoutDashboard className="text-white w-6 h-6" />
                  )}
               </div>
             )}
             {theme?.displayMode !== 'image_only' && (
               <span className="font-black text-xl tracking-tighter text-text-heading uppercase">
                 {theme?.siteName || "Tankonomics"}
               </span>
             )}
          </Link>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-xl text-text-body/40">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-body/30 mb-4">Core Navigation</p>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${
                  active 
                    ? "text-white shadow-xl translate-x-1" 
                    : "text-text-body/50 hover:bg-bg-main hover:text-text-heading"
                }`}
                style={active ? { backgroundColor: "var(--primary-brand)" } : {}}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-secondary" : "text-text-body/60 dark:text-text-body/80 group-hover:text-text-heading"}`} />
                {item.name}
              </Link>
            );
          })}

          {dynamicPages.length > 0 && (
            <div className="mt-10">
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 dark:text-text-body/60 mb-4">Custom Pages</p>
              <div className="space-y-1.5">
                {dynamicPages.filter(p => p.published).map((page) => {
                  const path = `/page/${page.slug}`;
                  const active = location.pathname === path;
                  return (
                    <Link 
                      key={page.id} 
                      to={path}
                      onClick={onClose}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        active 
                          ? "bg-bg-main text-text-heading border border-border-main shadow-sm" 
                          : "text-text-body/50 dark:text-text-body/70 hover:bg-bg-main hover:text-text-heading"
                      }`}
                    >
                      <FileCode className="w-4 h-4" />
                      {page.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-border-main">
          <div className="bg-bg-main rounded-[2rem] p-5 mb-4 border border-border-main/50">
             <div className="flex items-center gap-3 mb-3">
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`} 
                  className="w-8 h-8 rounded-full border border-border-main" 
                  alt="" 
                />
                <div className="overflow-hidden">
                   <p className="text-xs font-black truncate text-text-heading">{user?.displayName}</p>
                   <p className="text-[10px] text-text-body/60 truncate">{user?.email}</p>
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
               className="w-full flex items-center justify-center gap-2 py-2.5 bg-bg-card text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-sm hover:bg-red-500/10 transition-all font-black"
             >
               <LogOut className="w-3.5 h-3.5" />
               Sign Out
             </button>
          </div>
          <p className="text-[9px] text-center text-text-body/40 font-bold uppercase tracking-widest">© 2026 Tankonomics Industrial</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-bg-card p-8 sm:p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full text-center relative z-10 border border-white/10"
      >
        <div className={`mx-auto flex items-center justify-center mb-8 transition-all ${theme?.logoUrl ? "" : "w-20 h-20 bg-primary shadow-2xl shadow-primary/40 rounded-[2rem]"}`}>
           {theme?.logoUrl ? (
             <img src={theme.logoUrl} className="h-20 w-auto" alt="Logo" />
           ) : (
             <LayoutDashboard className="text-white w-10 h-10" />
           )}
        </div>
        
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-text-heading">
          {theme?.siteName || "Tankonomics"}
        </h1>
        <p className="text-text-body/60 font-medium mb-10 text-sm tracking-tight capitalize">
          {theme?.siteTagline || "The Sovereign Network for Tank Professionals"}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-10">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/30" />
            <input 
              type="email" 
              placeholder="Operational Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-bg-main border border-border-main rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none text-text-heading transition-all"
              required
            />
          </div>
          <div className="relative">
            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/30" />
            <input 
              type="password" 
              placeholder="Secure Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-bg-main border border-border-main rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none text-text-heading transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={authLoading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black tracking-widest text-[11px] uppercase hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? "Deploy Account" : "Secure Authentication")}
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 hover:text-primary transition-all"
          >
            {isRegistering ? "Existing Member? Sign In" : "New Agent? Create Account"}
          </button>
        </form>

        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-main" /></div>
          <div className="relative flex justify-center"><span className="bg-bg-card px-4 text-[9px] font-black uppercase tracking-[0.3em] text-text-body/30">Or Connect Via</span></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => onSignIn('google')}
            className="flex flex-col items-center justify-center p-4 bg-bg-main border border-border-main rounded-2xl hover:border-primary/50 transition-all group"
            title="Sign in with Google"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all mb-2" alt="Google" />
            <span className="text-[8px] font-black uppercase tracking-widest text-text-body/40 group-hover:text-text-heading">Google</span>
          </button>
          
          <button 
            onClick={() => onSignIn('facebook')}
            className="flex flex-col items-center justify-center p-4 bg-bg-main border border-border-main rounded-2xl hover:border-blue-600/50 transition-all group"
            title="Sign in with Facebook"
          >
            <Facebook className="w-6 h-6 text-text-body/20 group-hover:text-blue-600 transition-all mb-2" />
            <span className="text-[8px] font-black uppercase tracking-widest text-text-body/40 group-hover:text-text-heading">Facebook</span>
          </button>

          <button 
            onClick={() => onSignIn('linkedin')}
            className="flex flex-col items-center justify-center p-4 bg-bg-main border border-border-main rounded-2xl hover:border-indigo-600/50 transition-all group"
            title="Sign in with LinkedIn"
          >
            <Linkedin className="w-6 h-6 text-text-body/20 group-hover:text-indigo-600 transition-all mb-2" />
            <span className="text-[8px] font-black uppercase tracking-widest text-text-body/40 group-hover:text-text-heading">LinkedIn</span>
          </button>
        </div>

        <p className="mt-10 text-[9px] text-text-body/30 font-black uppercase tracking-[0.2em] leading-relaxed">
          Integrated Security Protocols Active. By continuing, you agree to our <a href="#" className="text-primary hover:underline">Code of Professional Conduct</a>.
        </p>
      </motion.div>
    </div>
  );
}

function Splash() {
  return (
    <div className="fixed inset-0 z-[1000] bg-primary flex flex-col items-center justify-center">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative"
      >
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center blur-2xl absolute inset-0" />
        <LayoutDashboard className="w-16 h-16 text-white relative z-10" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="text-3xl font-black text-white uppercase tracking-[0.5em] mb-2 leading-none">Tankonomics</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Connecting Terminals Globally</p>
      </motion.div>
      
      <div className="absolute bottom-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-white/40"
        />
      </div>
    </div>
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
      return;
    }

    // Real-time profile listener
    const profileUnsub = onSnapshot(doc(db, "users", user.uid), (userDoc) => {
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      } else {
        // Create profile if doesn't exist
        const newProfile = {
          uid: user.uid,
          displayName: user.displayName || "New Member",
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          isPro: false,
          isPublic: true,
          jobTitle: "",
          company: "",
          companyId: "",
          industrySegment: "",
          bio: "",
          skills: [],
          badges: [],
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
        setDoc(doc(db, "users", user.uid), newProfile);
      }
    }, (error) => {
      console.error("Profile sync error:", error);
    });

    // Check admin
    const checkAdmin = async () => {
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      const isSuperAdminEmail = user.email != null && SUPER_ADMIN_EMAILS.includes(user.email as any);
      
      if (!adminDoc.exists() && isSuperAdminEmail) {
        await setDoc(doc(db, "admins", user.uid), { 
          email: user.email, 
          grantedAt: serverTimestamp(),
          role: "super_admin"
        });
        setIsAdmin(true);
      } else {
        setIsAdmin(adminDoc.exists());
      }
    };
    checkAdmin();

    const companiesUnsub = onSnapshot(
      query(collection(db, "companies"), where("ownerUid", "==", user.uid)),
      (snapshot) => {
        const cos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOwnedCompanies(cos);
      }
    );

    return () => {
      profileUnsub();
      companiesUnsub();
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
                      <Route path="/surveys" element={<Surveys />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route path="/create-resume" element={<CreateResume />} />
                      <Route path="/page/:slug" element={<DynamicPage />} />
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
