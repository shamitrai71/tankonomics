import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../App";
import { useCollection, useCollectionGroup, updateDocument, createDocument } from "../hooks/useFirestore";
import { where, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { 
  User as UserIcon, 
  Building2, 
  Briefcase, 
  Globe, 
  Camera,
  Check,
  Save,
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
  TrendingUp,
  Filter,
  Lock,
  Unlock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Plus,
  ThumbsUp,
  MessageSquare,
  Heart,
  ChevronRight,
  UserPlus,
  UserCheck,
  UserX,
  Send,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { collection, query, getDocs, addDoc } from "firebase/firestore";
import { useNotifications } from "../hooks/useNotifications";

function UpcomingEvents({ profile }: { profile: any }) {
  const { user } = useAuth();
  const { data: reminders } = useCollection<any>("event_reminders", [where("userUid", "==", user?.uid || "")]);

  if (reminders.length === 0) return null;

  return (
    <div className="pt-12 mt-12 border-t border-border-main">
      <h3 className="text-xs font-black text-text-body uppercase tracking-widest mb-6 flex items-center gap-2">
         <Calendar className="w-4 h-4 text-primary" /> {profile?.profileLabels?.technicalScheduleHeading || "My Technical Schedule"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reminders.map((rem: any) => (
          <div key={rem.id} className="bg-bg-main border border-border-main p-5 rounded-3xl group hover:border-primary transition-all">
             <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 bg-bg-card rounded-2xl flex flex-col items-center justify-center border border-border-main shadow-sm text-text-heading">
                   <span className="text-[9px] font-black uppercase leading-none opacity-40">{format(new Date(rem.eventDate), 'MMM')}</span>
                   <span className="text-xl font-black leading-none">{format(new Date(rem.eventDate), 'dd')}</span>
                </div>
                <div className="flex-1">
                   <h4 className="text-sm font-black text-text-heading group-hover:text-primary transition-colors line-clamp-1">{rem.eventName}</h4>
                </div>
                <Bell className="w-4 h-4 text-primary animate-pulse" />
             </div>
             <div className="flex items-center gap-4 pt-4 border-t border-border-main/50">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-text-body tracking-widest">
                   <Clock className="w-3.5 h-3.5 text-blue-500" /> Session Sync
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-text-body tracking-widest">
                   <MapPin className="w-3.5 h-3.5 text-orange-500" /> Ground Support
                </div>
             </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
         <div className="w-8 h-8 bg-bg-card rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
            <Bell className="w-4 h-4 text-primary" />
         </div>
         <p className="text-[10px] font-bold text-primary leading-tight">
            Email reminders are synchronized. You will receive a technical brief 24 hours prior to each session.
         </p>
      </div>
    </div>
  );
}

function NetworkActivity({ targetUid }: { targetUid: string }) {
  const { data: userPosts } = useCollection<any>("posts", [where("authorUid", "==", targetUid || "")]);
  const { data: userComments } = useCollectionGroup<any>("comments", [where("authorUid", "==", targetUid || "")]);
  const { data: connections } = useCollection<any>("connections", [where("userIds", "array-contains", targetUid || "")]);
  const acceptedConnections = connections.filter(c => c.status === "accepted");

  const totalLikes = userPosts.reduce((acc, current) => acc + (current.likesCount || 0), 0);
  const totalComments = userPosts.reduce((acc, current) => acc + (current.commentsCount || 0), 0);

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center text-xs">
         <span className="font-bold text-text-body/60">Professional Network</span>
         <span className="font-black text-text-heading">{acceptedConnections.length} Connections</span>
       </div>
       <div className="flex justify-between items-center text-xs">
         <span className="font-bold text-text-body/60">Post Impressions</span>
         <span className="font-black text-text-heading">{totalLikes * 3 + totalComments * 5 + userPosts.length * 10}</span>
       </div>
       <div className="flex justify-between items-center text-xs">
         <span className="font-bold text-text-body/60">Pulse Contributions</span>
         <span className="font-black text-text-heading">{userPosts.length}</span>
       </div>
       <div className="flex justify-between items-center text-xs">
         <span className="font-black text-text-heading">{totalLikes}</span>
         <span className="font-bold text-text-body/60">Total Likes Received</span>
       </div>
    </div>
  );
}

function ConnectionsList({ targetUid }: { targetUid: string }) {
  const { data: connections } = useCollection<any>("connections", [where("userIds", "array-contains", targetUid || "")]);
  const acceptedConnections = connections.filter(c => c.status === "accepted");
  const [connectionProfiles, setConnectionProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const profiles = [];
      for (const conn of acceptedConnections) {
        const otherId = conn.userIds.find((id: string) => id !== targetUid);
        if (otherId) {
          const docSnap = await getDoc(doc(db, "users", otherId));
          if (docSnap.exists()) {
            profiles.push({ ...docSnap.data(), id: docSnap.id });
          }
        }
      }
      setConnectionProfiles(profiles);
      setLoading(false);
    };
    if (acceptedConnections.length > 0) {
      fetchProfiles();
    } else {
      setLoading(false);
    }
  }, [acceptedConnections.length, targetUid]);

  if (loading) return <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (connectionProfiles.length === 0) return (
    <div className="p-8 text-center bg-bg-main rounded-3xl border border-dashed border-border-main">
      <Users className="w-8 h-8 text-text-body/20 mx-auto mb-3" />
      <p className="text-xs font-bold text-text-body/40 italic">Building professional bridges...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {connectionProfiles.map(p => (
        <Link key={p.id} to={`/profile/${p.id}`} className="group relative">
          <div className="bg-bg-main border border-border-main rounded-2xl p-3 flex flex-col items-center text-center hover:border-primary transition-all">
            <img src={p.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${p.displayName}`} className="w-12 h-12 rounded-xl mb-2 object-cover border border-border-main" alt="" />
            <p className="text-[10px] font-black text-text-heading line-clamp-1">{p.displayName}</p>
            <p className="text-[8px] font-bold text-text-body/40 uppercase tracking-tight truncate w-full">{p.jobTitle || "Professional"}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SavedJobs({ profile, isOwner }: { profile: any, isOwner: boolean }) {
  const savedJobIds = profile?.savedJobs || [];
  const { data: allJobs } = useCollection<any>("jobs");
  const savedJobs = allJobs.filter(j => savedJobIds.includes(j.id));

  if (!isOwner || savedJobIds.length === 0) return null;

  return (
    <div className="pt-12 mt-12 border-t border-border-main">
      <h3 className="text-xs font-black text-text-body/50 uppercase tracking-widest mb-6 flex items-center gap-2">
         <Heart className="w-4 h-4 text-rose-500" /> Saved Opportunities
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savedJobs.map((job: any) => (
          <Link to="/jobs" key={job.id} className="bg-bg-main border border-border-main p-5 rounded-3xl group hover:border-primary transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-bg-card rounded-2xl flex items-center justify-center border border-border-main shadow-sm overflow-hidden shrink-0">
               <img src={job.companyLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-contain p-2" alt="" />
            </div>
            <div className="flex-1 overflow-hidden">
               <h4 className="text-sm font-black text-text-heading group-hover:text-primary transition-colors line-clamp-1">{job.title}</h4>
               <p className="text-[10px] font-bold text-text-body/40 uppercase tracking-widest">{job.companyName}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-body/30" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile, isAdmin } = useAuth();
  const { createNotification } = useNotifications();
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const { data: companies } = useCollection<any>("companies", [where("isClaimed", "==", true)]);
  const [editing, setEditing] = useState(false);
  
  // Data for viewed profile
  const targetId = id || user?.uid;
  const { data: endorsements } = useCollection<any>("endorsements", [where("targetUid", "==", targetId || "")]);
  const { data: recommendations } = useCollection<any>("recommendations", [where("targetUid", "==", targetId || "")]);
  const { data: myConnections } = useCollection<any>("connections", [where("userIds", "array-contains", user?.uid || "")]);
  const { data: targetConnections } = useCollection<any>("connections", [where("userIds", "array-contains", targetId || "")]);
  const { data: follows } = useCollection<any>("follows", [where("targetId", "==", targetId || ""), where("targetType", "==", "member")]);
  const { data: likes } = useCollection<any>("likes", [where("targetId", "==", targetId || ""), where("targetType", "==", "member")]);

  const isFollowing = follows.some((f: any) => f.followerId === user?.uid);
  const isLiked = likes.some((l: any) => l.likerId === user?.uid);

  const connection = myConnections.find(c => c.userIds.includes(targetId));
  const isConnected = connection?.status === "accepted";
  const isPending = connection?.status === "pending";
  const isRequester = connection?.requesterId === user?.uid;

  const [mutualConnections, setMutualConnections] = useState<string[]>([]);
  const [degree, setDegree] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [messageloading, setMessageLoading] = useState(false);
  const [engagementLoading, setEngagementLoading] = useState(false);

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
          targetId: targetId,
          targetType: "member",
          createdAt: serverTimestamp()
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
          targetId: targetId,
          targetType: "member",
          createdAt: serverTimestamp()
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
      // Calculate 2nd degree
      const myAccepted = myConnections
        .filter(c => c.status === "accepted")
        .map(c => c.userIds.find((id: string) => id !== user.uid));
      
      const targetAccepted = targetConnections
        .filter(c => c.status === "accepted")
        .map(c => c.userIds.find((id: string) => id !== targetId));

      const mutual = myAccepted.filter(id => targetAccepted.includes(id));
      setMutualConnections(mutual.filter((id): id is string => !!id));

      if (mutual.length > 0) {
        setDegree(2);
      } else {
        setDegree(3); // or just null but 3+ is common
      }
    }
  }, [user, targetId, myConnections, targetConnections, isConnected]);

  const [formData, setFormData] = useState({
    displayName: "",
    jobTitle: "",
    company: "",
    companyId: "",
    industrySegment: "",
    bio: "",
    isPro: false,
    isPublic: false,
    skills: [] as string[],
    badges: [] as { title: string, subtitle: string }[],
    profileLabels: {
      summaryHeading: "Professional Summary",
      experienceHeading: "Update Experience",
      skillsHeading: "Industry Skills & Endorsements",
      recommendationsHeading: "Professional Recommendations",
      badgesHeading: "Industry Certification & Badges",
      activityHeading: "Network Activity",
      technicalScheduleHeading: "My Technical Schedule"
    },
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      website: ""
    }
  });

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [importingLinkedin, setImportingLinkedin] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (!event.origin.endsWith(".run.app") && !event.origin.includes("localhost")) return;

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setImportingLinkedin(false);
        const ld = event.data.payload;
        
        // Update form data with imported data
        setFormData(prev => ({
          ...prev,
          displayName: ld.name || prev.displayName,
          jobTitle: ld.jobTitle !== "Imported from LinkedIn" ? ld.jobTitle : prev.jobTitle,
          company: ld.company !== "Imported from LinkedIn" ? ld.company : prev.company,
          socialLinks: {
            ...prev.socialLinks,
            linkedin: `https://www.linkedin.com/in/${ld.linkedinId}/`
          }
        }));
        
        // If they don't have a Bio, we could suggest one or just notify
        alert("LinkedIn profile data imported! You can now review and save your changes.");
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
      
      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      window.open(
        url,
        "linkedin_oauth",
        `width=${width},height=${height},top=${top},left=${left}`
      );
    } catch (err) {
      console.error("Failed to start LinkedIn import:", err);
      setImportingLinkedin(false);
    }
  };

  // Behavioral traits for dropdown
  const behavioralTraits = [
    "Adaptability", "Collaboration", "Communication", "Conflict Resolution", 
    "Critical Thinking", "Emotional Intelligence", "Empathy", "Leadership", 
    "Patience", "Problem Solving", "Public Speaking", "Teamwork", 
    "Work Ethic", "Integrity", "Respectfulness", "Accountability", 
    "Active Listening", "Constructive Feedback", "Cooperation", 
    "Inclusivity", "Open-mindedness", "Reliability", "Shared Responsibility"
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
              jobTitle: profileData.jobTitle || "",
              company: profileData.company || "",
              companyId: profileData.companyId || "",
              industrySegment: profileData.industrySegment || "",
              bio: profileData.bio || "",
              isPro: profileData.isPro || false,
              isPublic: profileData.isPublic || false,
              skills: profileData.skills || [],
              badges: profileData.badges || [],
              profileLabels: {
                summaryHeading: profileData.profileLabels?.summaryHeading || "Professional Summary",
                experienceHeading: profileData.profileLabels?.experienceHeading || "Update Experience",
                skillsHeading: profileData.profileLabels?.skillsHeading || "Industry Skills & Endorsements",
                recommendationsHeading: profileData.profileLabels?.recommendationsHeading || "Professional Recommendations",
                badgesHeading: profileData.profileLabels?.badgesHeading || "Industry Certification & Badges",
                activityHeading: profileData.profileLabels?.activityHeading || "Network Activity",
                technicalScheduleHeading: profileData.profileLabels?.technicalScheduleHeading || "My Technical Schedule"
              },
              socialLinks: {
                linkedin: profileData.socialLinks?.linkedin || "",
                twitter: profileData.socialLinks?.twitter || "",
                facebook: profileData.socialLinks?.facebook || "",
                instagram: profileData.socialLinks?.instagram || "",
                website: profileData.socialLinks?.website || ""
              }
            });
          }
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          setPermissionError(true);
        }
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [targetId, user?.uid]);

  const isOwner = user?.uid === targetId;
  const profile = isOwner ? currentUserProfile : viewedProfile;
  const showActions = profile?.isPublic || isOwner;

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await updateDocument("users", user.uid, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // Recommendation state
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
        createdAt: serverTimestamp()
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
    
    // Check if already endorsed
    const alreadyEndorsed = endorsements.some(e => e.skill === skill && e.endorserUid === user.uid);
    if (alreadyEndorsed) return;

    try {
      await createDocument("endorsements", {
        targetUid: targetId,
        endorserUid: user.uid,
        endorserName: user.displayName,
        skill: skill,
        createdAt: serverTimestamp()
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
        // Send request
        const newConn = await createDocument("connections", {
          userIds: [user.uid, targetId].sort(),
          status: "pending",
          requesterId: user.uid,
          createdAt: serverTimestamp()
        });
        
        if (newConn) {
          await createNotification(
            targetId,
            "New Connection Request",
            `${user.displayName} wants to connect with you.`,
            "connection",
            `/profile/${user.uid}`,
            { connectionId: newConn.id }
          );
        }
      } else if (isPending && !isRequester) {
        // Accept request
        await updateDocument("connections", connection.id, {
          status: "accepted"
        });
        await createNotification(
          targetId,
          "Connection Accepted",
          `${user.displayName} accepted your connection request.`,
          "connection",
          `/profile/${user.uid}`
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
      alert("Messaging is a PRO feature. Please upgrade your profile to start conversations.");
      return;
    }
    if (!isConnected) {
      alert("You can only message your professional connections.");
      return;
    }

    setMessageLoading(true);
    try {
      // Find existing chat
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participants", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);
      let existingChat = querySnapshot.docs.find(doc => doc.data().participants.includes(targetId));

      if (existingChat) {
        navigate(`/messages/${existingChat.id}`);
      } else {
        // Create new chat
        const newChat = await addDoc(chatsRef, {
          participants: [user.uid, targetId].sort(),
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp()
        });
        navigate(`/messages/${newChat.id}`);
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    } finally {
      setMessageLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-100 shadow-sm">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Private Profile</h2>
          <p className="text-slate-500 font-medium mb-8">This professional profile is set to private mode and is only visible to the owner or technical administrators.</p>
          <div className="flex flex-col gap-3">
            <Link to="/" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
              Return to Network
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-500 font-medium mb-6">The requested professional profile does not exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs">Back to Network</Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = `Check out this professional profile on the Technical Network: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(profile?.displayName || user?.displayName || "Profile", 20, 20);
    doc.setFontSize(14);
    doc.text(`Title: ${profile?.jobTitle || "Professional"}`, 20, 35);
    doc.text(`Company: ${profile?.company || "Member"}`, 20, 45);
    doc.text(`Industry: ${profile?.industrySegment || "Network"}`, 20, 55);
    doc.text("Summary:", 20, 70);
    doc.setFontSize(10);
    const splitBio = doc.splitTextToSize(profile?.bio || "No summary provided.", 170);
    doc.text(splitBio, 20, 80);
    doc.save(`${(profile?.displayName || "profile").replace(/\s+/g, "_")}.pdf`);
  };

  const handleExportXLSX = () => {
    const data = [{
      "Full Name": profile?.displayName || user?.displayName,
      "Job Title": profile?.jobTitle,
      "Company": profile?.company,
      "Industry": profile?.industrySegment,
      "Bio": profile?.bio,
      "Created At": profile?.createdAt
    }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profile");
    XLSX.writeFile(wb, `${(profile?.displayName || "profile").replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4">
      <div className="bg-bg-card border border-border-main rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5 relative">
        {/* Banner Removed per user request */}
        
        {/* Content */}
        <div className="px-6 sm:px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
             {/* Avatar */}
             <div className="relative mt-8 md:mt-10 group shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName}`} 
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] border-4 border-bg-card shadow-2xl bg-bg-card object-cover relative z-10 transition-transform group-hover:scale-105"
                    alt="Profile"
                  />
                </div>
                {isOwner && (
                  <button className="absolute bottom-2 right-2 p-3 bg-text-heading text-bg-card rounded-2xl shadow-xl hover:scale-110 transition-all z-20 hover:bg-primary hover:text-white">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
             </div>

             <div className="flex-1 mt-6 md:mt-0 pt-0 md:pt-12 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:items-center justify-center md:justify-start">
                      <h1 className="text-3xl sm:text-4xl font-black text-text-heading leading-tight tracking-tight flex items-center gap-3">
                        {profile?.displayName}
                      </h1>
                      <div className="flex gap-2">
                        {degree && (
                          <span className="text-[10px] bg-bg-main text-text-body/60 px-3 py-1 rounded-full border border-border-main font-black uppercase tracking-widest">
                            {degree === 1 ? "1st" : degree === 2 ? "2nd" : "3rd+"}
                          </span>
                        )}
                        {isAdmin && (
                          <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-accent/20">
                            <ShieldCheck className="w-3.5 h-3.5" /> Admin
                          </div>
                        )}
                      </div>
                    </div>
                    {degree === 2 && mutualConnections.length > 0 && (
                      <div className="flex items-center justify-center md:justify-start gap-2.5 text-[11px] text-text-body/50 font-black uppercase tracking-wider">
                         <Users className="w-4 h-4 text-primary" />
                         {mutualConnections.length} mutual connection{mutualConnections.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                    {isOwner && editing && (
                      <button 
                        onClick={handleLinkedInImport}
                        disabled={importingLinkedin}
                        className="px-5 py-3 bg-secondary/5 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 hover:bg-secondary/10 transition-all border border-secondary/20 shadow-sm"
                      >
                         {importingLinkedin ? (
                           <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                         ) : (
                           <Linkedin className="w-4 h-4" />
                         )}
                         {importingLinkedin ? "Syncing..." : "LinkedIn Sync"}
                      </button>
                    )}
                    {isOwner && (
                      <button 
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        disabled={saving}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-xl border ${
                          editing 
                            ? "bg-text-heading text-bg-card hover:brightness-125 border-text-heading" 
                            : "bg-primary text-white border-primary shadow-primary/20 hover:brightness-110"
                        } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : editing ? (
                          <Save className="w-4 h-4" />
                        ) : (
                          <UserIcon className="w-4 h-4" />
                        )}
                        {saving ? "Synthesizing..." : editing ? "Save Details" : (profile?.profileLabels?.experienceHeading || "Refine Profile")}
                      </button>
                    )}
                    {!isOwner && (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleFollow}
                          disabled={engagementLoading || !user}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg border ${
                            isFollowing ? "bg-bg-main text-primary border-primary" : "bg-primary text-white border-primary"
                          } ${engagementLoading ? "opacity-50" : ""}`}
                        >
                          {isFollowing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                        <button 
                          onClick={handleLike}
                          disabled={engagementLoading || !user}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg border ${
                            isLiked ? "bg-rose-500 text-white border-rose-500" : "bg-bg-main text-rose-500 border-rose-200"
                          } ${engagementLoading ? "opacity-50" : ""}`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                          {likes.length > 0 && likes.length}
                        </button>
                        <button 
                          onClick={handleConnect}
                          disabled={connecting || isConnected || (isPending && isRequester)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg border ${
                            isConnected 
                              ? "bg-slate-100 text-slate-500 border-slate-200 cursor-default" 
                              : isPending 
                                ? isRequester 
                                  ? "bg-slate-100 text-slate-400 border-slate-200" 
                                  : "bg-primary text-white border-primary"
                                : "bg-primary text-white border-primary hover:brightness-110"
                          } ${connecting ? "opacity-50" : ""}`}
                        >
                          {connecting ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : isConnected ? (
                            <UserCheck className="w-3.5 h-3.5" />
                          ) : isPending ? (
                            isRequester ? <Clock className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          {isConnected ? "Connected" : isPending ? (isRequester ? "Pending" : "Accept Request") : "Connect"}
                        </button>
                        <button 
                          onClick={handleMessage}
                          disabled={messageloading}
                          className="px-6 py-2 bg-text-heading text-bg-card rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-lg border border-text-heading"
                        >
                          {messageloading ? (
                            <div className="w-3 h-3 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Message
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8 px-4 sm:px-0">
                    <div className="flex items-center gap-2 bg-bg-main px-4 py-2 rounded-2xl border border-border-main shadow-sm hover:border-primary transition-colors cursor-default group">
                      <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col">
                        <span className="text-text-heading text-xs font-black leading-none mb-0.5">
                          {targetConnections.filter((c: any) => c.status === "accepted").length}
                        </span>
                        <span className="text-[9px] font-black uppercase text-text-body/40 tracking-wider">Connections</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-bg-main px-4 py-2 rounded-2xl border border-border-main shadow-sm hover:border-primary transition-colors cursor-default group">
                      <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col">
                        <span className="text-text-heading text-xs font-black leading-none mb-0.5">
                          {follows.length}
                        </span>
                        <span className="text-[9px] font-black uppercase text-text-body/40 tracking-wider">Followers</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-bg-main px-4 py-2 rounded-2xl border border-border-main shadow-sm hover:border-primary transition-colors cursor-default group">
                      <ThumbsUp className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col">
                        <span className="text-text-heading text-xs font-black leading-none mb-0.5">
                          {likes.length}
                        </span>
                        <span className="text-[9px] font-black uppercase text-text-body/40 tracking-wider">Likes</span>
                      </div>
                    </div>

                    <div className="flex-1 md:flex-none border-l border-border-main pl-4 md:ml-4 py-1 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                      <div className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black text-text-body/60 uppercase tracking-tight">{profile?.jobTitle || "Professional"}</span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black text-text-body/60 uppercase tracking-tight flex items-center gap-1.5">
                          {profile?.company || "Industry Member"}
                          {profile?.isVerifiedByCompany && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 border border-green-100 group-hover:bg-green-500 group-hover:text-white transition-all shadow-sm">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black text-text-body/60 uppercase tracking-tight">{profile?.industrySegment || "Global Network"}</span>
                      </div>
                      {profile?.isPro && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full ring-1 ring-indigo-200 shadow-sm animate-pulse">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">PRO IDENTITY</span>
                        </div>
                      )}
                    </div>
                  </div>

                <div className="flex gap-3 mt-4">
                  {profile?.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-400 hover:text-blue-400 hover:bg-blue-50 rounded-xl transition-all">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.socialLinks?.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.socialLinks?.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.socialLinks?.website && (
                    <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
             </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2 space-y-8">
                <div>
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     {profile?.profileLabels?.summaryHeading || "Professional Summary"}
                   </h3>
                   {editing ? (
                     <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-bg-main border border-border-main rounded-2xl p-4 text-sm focus:bg-bg-card focus:ring-2 focus:ring-primary outline-none h-40 resize-none transition-all"
                        placeholder="Write a brief professional overview of your background in tank storage..."
                     />
                   ) : (
                     <p className="text-slate-700 leading-relaxed font-medium">
                       {profile?.bio || "No summary provided yet. Share your expertise with the community."}
                     </p>
                   )}
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                   {editing ? (
                     <>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-text-body/40 uppercase tracking-[0.2em] px-1">Job Title</label>
                           <input 
                             type="text" 
                             value={formData.jobTitle}
                             onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                             className="w-full bg-bg-main border border-border-main rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-body/20"
                             placeholder="e.g. Senior Site Engineer"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-text-body/40 uppercase tracking-[0.2em] px-1">Verified Entity</label>
                           <select 
                             value={formData.companyId}
                             onChange={(e) => {
                               const selectedId = e.target.value;
                               const selectedCompany = companies.find(c => c.id === selectedId);
                               setFormData({
                                 ...formData, 
                                 companyId: selectedId,
                                 company: selectedCompany ? selectedCompany.name : ""
                               });
                             }}
                             className="w-full bg-bg-main border border-border-main rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                           >
                             <option value="">Select a Verified Business</option>
                             {companies.map(c => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                             ))}
                             <option value="other">Other / Not Listed</option>
                           </select>
                        </div>
                        {(!formData.companyId || formData.companyId === "other") && (
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-text-body/40 uppercase tracking-[0.2em] px-1">Company Name (Direct)</label>
                             <input 
                               type="text" 
                               value={formData.company}
                               onChange={(e) => setFormData({...formData, company: e.target.value})}
                               className="w-full bg-bg-main border border-border-main rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                             />
                          </div>
                        )}

                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                           <label className="flex items-center gap-4 p-5 bg-primary/5 border border-primary/10 rounded-3xl cursor-pointer hover:bg-primary/10 transition-all group shadow-sm">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isPro ? 'bg-primary border-primary' : 'bg-white border-border-main'}`}>
                                {formData.isPro && <Check className="w-4 h-4 text-white" />}
                                <input 
                                  type="checkbox"
                                  className="hidden"
                                  checked={formData.isPro}
                                  onChange={(e) => setFormData({...formData, isPro: e.target.checked})}
                                />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-primary uppercase tracking-wider">Premium Identity</p>
                                 <p className="text-[9px] text-text-body/40 font-bold uppercase tracking-tight">Unlocks AI Technical Insights</p>
                              </div>
                           </label>

                           <div 
                              onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                              className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer group shadow-sm ${
                                formData.isPublic 
                                  ? 'bg-emerald-500/5 border-emerald-500/10 ring-1 ring-emerald-500/20' 
                                  : 'bg-bg-main border-border-main'
                              }`}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                                   formData.isPublic 
                                     ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                                     : 'bg-bg-card text-text-body/30 border-border-main'
                                 }`}>
                                    {formData.isPublic ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                 </div>
                                 <div>
                                    <p className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                                      formData.isPublic ? 'text-emerald-600' : 'text-text-heading'
                                    }`}>
                                      Network Visibility
                                    </p>
                                    <p className="text-[9px] text-text-body/40 font-bold uppercase tracking-tight">
                                      {formData.isPublic ? "Visible to Members" : "Private Identity"}
                                    </p>
                                 </div>
                              </div>
                              <div className={`w-12 h-6 rounded-full p-1 transition-all relative shrink-0 ${
                                formData.isPublic ? 'bg-emerald-500' : 'bg-border-main'
                              }`}>
                                 <motion.div 
                                   initial={false}
                                   animate={{ x: formData.isPublic ? 24 : 0 }}
                                   className="w-4 h-4 bg-white rounded-full shadow-lg" 
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-6 pt-8 border-t border-border-main/50 mt-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black text-text-body/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                Interface Definitions
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                               <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-text-body/30 uppercase tracking-widest px-1">Summary Header</label>
                                  <input 
                                    value={formData.profileLabels.summaryHeading}
                                    onChange={(e) => setFormData({...formData, profileLabels: {...formData.profileLabels, summaryHeading: e.target.value}})}
                                    className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-body/20"
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-text-body/30 uppercase tracking-widest px-1">Activity Header</label>
                                  <input 
                                    value={formData.profileLabels.activityHeading}
                                    onChange={(e) => setFormData({...formData, profileLabels: {...formData.profileLabels, activityHeading: e.target.value}})}
                                    className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-body/20"
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-text-body/30 uppercase tracking-widest px-1">Skills Header</label>
                                  <input 
                                    value={formData.profileLabels.skillsHeading}
                                    onChange={(e) => setFormData({...formData, profileLabels: {...formData.profileLabels, skillsHeading: e.target.value}})}
                                    className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-body/20"
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-text-body/30 uppercase tracking-widest px-1">Endorsements Header</label>
                                  <input 
                                    value={formData.profileLabels.recommendationsHeading}
                                    onChange={(e) => setFormData({...formData, profileLabels: {...formData.profileLabels, recommendationsHeading: e.target.value}})}
                                    className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-body/20"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-text-body/30 uppercase tracking-widest px-1">Badges Header</label>
                                  <input 
                                    value={formData.profileLabels.badgesHeading}
                                    onChange={(e) => setFormData({...formData, profileLabels: {...formData.profileLabels, badgesHeading: e.target.value}})}
                                    className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-body/20"
                                  />
                                </div>
                                 <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-text-body/30 uppercase tracking-widest px-1">Technical Schedule</label>
                                  <input 
                                    value={formData.profileLabels.technicalScheduleHeading}
                                    onChange={(e) => setFormData({...formData, profileLabels: {...formData.profileLabels, technicalScheduleHeading: e.target.value}})}
                                    className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-body/20"
                                  />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-border-main/20">
                             <h4 className="text-[10px] font-black text-text-body/30 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                                Dynamic Badges & Certifications
                                <Award className="w-3.5 h-3.5 text-primary" />
                             </h4>
                               <div className="space-y-3">
                                  {formData.badges.map((badge, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                       <div className="flex-1 grid grid-cols-2 gap-2">
                                          <input 
                                            placeholder="Badge Title"
                                            value={badge.title}
                                            onChange={(e) => {
                                              const newBadges = [...formData.badges];
                                              newBadges[i].title = e.target.value;
                                              setFormData({...formData, badges: newBadges});
                                            }}
                                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px] font-bold"
                                          />
                                          <input 
                                            placeholder="Subtitle"
                                            value={badge.subtitle}
                                            onChange={(e) => {
                                              const newBadges = [...formData.badges];
                                              newBadges[i].subtitle = e.target.value;
                                              setFormData({...formData, badges: newBadges});
                                            }}
                                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px] font-medium"
                                          />
                                       </div>
                                       <button 
                                         onClick={() => setFormData({...formData, badges: formData.badges.filter((_, idx) => idx !== i)})}
                                         className="text-red-400 hover:text-red-600 p-1"
                                       >
                                         ×
                                       </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => setFormData({...formData, badges: [...formData.badges, { title: "", subtitle: "" }]})}
                                    className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                  >
                                     <Plus className="w-3 h-3" /> Add Professional Badge
                                  </button>
                               </div>
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect Social Profiles</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="flex gap-2">
                                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                     <Linkedin className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <input 
                                    type="url" 
                                    placeholder="LinkedIn URL"
                                    value={formData.socialLinks.linkedin}
                                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                  />
                               </div>
                               <div className="flex gap-2">
                                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                     <Twitter className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <input 
                                    type="url" 
                                    placeholder="Twitter URL"
                                    value={formData.socialLinks.twitter}
                                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                  />
                               </div>
                               <div className="flex gap-2">
                                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                     <Facebook className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <input 
                                    type="url" 
                                    placeholder="Facebook URL"
                                    value={formData.socialLinks.facebook}
                                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                  />
                               </div>
                               <div className="flex gap-2">
                                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                     <Instagram className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <input 
                                    type="url" 
                                    placeholder="Instagram URL"
                                    value={formData.socialLinks.instagram}
                                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                  />
                               </div>
                               <div className="flex gap-2">
                                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                     <Globe className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <input 
                                    type="url" 
                                    placeholder="Website URL"
                                    value={formData.socialLinks.website}
                                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, website: e.target.value}})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                  />
                               </div>
                            </div>

                         <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                               Expertise & Skills
                               <span className="text-[8px] font-bold text-slate-300">Enter to add</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                               {formData.skills.map((skill, i) => (
                                 <div key={i} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-black group">
                                    {skill}
                                    <button 
                                      type="button"
                                      onClick={() => setFormData({...formData, skills: formData.skills.filter((_, idx) => idx !== i)})}
                                      className="text-slate-300 hover:text-red-500"
                                    >
                                      ×
                                    </button>
                                 </div>
                               ))}
                               <input 
                                 type="text" 
                                 placeholder="Add a technical skill..."
                                 onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const val = e.currentTarget.value.trim();
                                      if (val && !formData.skills.includes(val)) {
                                        setFormData({...formData, skills: [...formData.skills, val]});
                                        e.currentTarget.value = "";
                                      }
                                    }
                                 }}
                                 className="bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-slate-300"
                               />
                            </div>
                         </div>
                     </>
                   ) : null}
                </div>
                
                 {!editing && (
                   <>
                    <div className="pt-8 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          {profile?.profileLabels?.skillsHeading || "Industry Skills & Endorsements"}
                        </h3>
                        {profile?.skills?.length > 0 && !isOwner && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 uppercase">
                            <ThumbsUp className="w-3 h-3" /> Endorse to verify expertise
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {profile?.skills?.map((skill: string) => {
                          const skillEndorsements = endorsements.filter(e => e.skill === skill);
                          const hasEndorsed = skillEndorsements.some(e => e.endorserUid === user?.uid);
                          
                          return (
                            <div key={skill} className="bg-slate-50 border border-slate-100 p-4 rounded-3xl min-w-[160px] flex flex-col gap-3 group transition-all hover:border-indigo-200">
                               <div className="flex items-start justify-between">
                                  <span className="text-sm font-black text-slate-900">{skill}</span>
                                  {!isOwner && (
                                    <button 
                                      onClick={() => handleEndorseSkill(skill)}
                                      disabled={hasEndorsed}
                                      className={`p-1.5 rounded-lg transition-all ${
                                        hasEndorsed 
                                          ? "bg-emerald-50 text-emerald-600" 
                                          : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-600 hover:text-indigo-600"
                                      }`}
                                    >
                                      {hasEndorsed ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                               </div>
                               <div className="flex -space-x-2">
                                  {skillEndorsements.slice(0, 5).map((e, idx) => (
                                    <div key={idx} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden" title={e.endorserName}>
                                       <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${e.endorserName}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                  {skillEndorsements.length > 5 && (
                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                                       +{skillEndorsements.length - 5}
                                    </div>
                                  )}
                                  {skillEndorsements.length === 0 && (
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">No endorsements</span>
                                  )}
                               </div>
                            </div>
                          );
                        })}
                        {!profile?.skills?.length && (
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No technical skills listed yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        {profile?.profileLabels?.recommendationsHeading || "Professional Recommendations"}
                      </h3>
                      
                      <div className="space-y-6">
                        {recommendations.map((reco) => (
                          <div key={reco.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                             <div className="flex items-center gap-4 md:w-48 shrink-0">
                                <img src={reco.recommenderPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${reco.recommenderName}`} className="w-12 h-12 rounded-2xl shadow-sm" alt="" />
                                <div>
                                   <p className="text-sm font-black text-slate-900">{reco.recommenderName}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Technical Peer</p>
                                </div>
                             </div>
                             <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                   {reco.traits.map((trait: string) => (
                                     <span key={trait} className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ring-1 ring-indigo-100 flex items-center gap-1.5">
                                        <Award className="w-3 h-3" /> {trait}
                                     </span>
                                   ))}
                                </div>
                                {reco.comment && (
                                  <p className="text-sm text-slate-600 italic font-medium">"{reco.comment}"</p>
                                )}
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Recommended on {format(new Date(reco.createdAt?.toDate?.() || new Date()), 'MMM dd, yyyy')}</p>
                             </div>
                          </div>
                        ))}

                        {recommendations.length === 0 && (
                          <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                             <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No formal recommendations listed yet.</p>
                          </div>
                        )}

                        {!isOwner && (
                          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                             <div className="relative z-10">
                                <h4 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                   <Sparkles className="w-4 h-4 text-indigo-400" /> Recommend this Member
                                </h4>
                                
                                <div className="space-y-6">
                                   <div>
                                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Recommended For (Behavioral & Co-working Traits)</label>
                                      <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar p-2 bg-white/5 rounded-2xl border border-white/10">
                                         {behavioralTraits.map(trait => (
                                           <button 
                                             key={trait}
                                             onClick={() => {
                                               if (recoTraits.includes(trait)) {
                                                 setRecoTraits(recoTraits.filter(t => t !== trait));
                                               } else {
                                                 setRecoTraits([...recoTraits, trait]);
                                               }
                                             }}
                                             className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                               recoTraits.includes(trait)
                                                 ? "bg-white text-slate-900 scale-105"
                                                 : "bg-white/5 text-white/40 hover:bg-white/10"
                                             }`}
                                           >
                                             {trait}
                                           </button>
                                         ))}
                                      </div>
                                   </div>

                                   <div>
                                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Professional Brief (Optional)</label>
                                      <textarea 
                                        value={recoComment}
                                        onChange={(e) => setRecoComment(e.target.value)}
                                        placeholder="Share a brief insight into their professional conduct or technical mastery..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all placeholder:text-white/20"
                                      />
                                   </div>

                                   <button 
                                     onClick={handleAddRecommendation}
                                     disabled={recoTraits.length === 0 || isRecommending}
                                     className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-50 transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-slate-950"
                                   >
                                      {isRecommending ? "Synthesizing..." : "Submit Formal Recommendation"}
                                   </button>
                                </div>
                             </div>
                             <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         {profile?.profileLabels?.badgesHeading || "Industry Certification & Badges"}
                      </h3>
                      <div id="DYNAMIC_BADGES_CONTAINER" className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                         <div className="shrink-0 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 w-48 shadow-sm">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                               <Award className="text-white w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-900">Safety Lead</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Verified member</p>
                            </div>
                         </div>
                         <div className="shrink-0 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 w-48 shadow-sm opacity-50 grayscale">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                               <Check className="text-slate-400 w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-400">Project Master</p>
                              <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tight">Requirement pending</p>
                            </div>
                         </div>
                      </div>
                    </div>
                   </>
                )}

                <UpcomingEvents profile={profile} />
                <SavedJobs profile={profile} isOwner={isOwner} />
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-xs font-black text-text-body/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Professional Network
                   </h3>
                   <ConnectionsList targetUid={targetId} />
                </div>
                {showActions && (
                   <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-indigo-600" /> Export & Sharing
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={handlePrint}
                           className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 transition-all group"
                         >
                            <Printer className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                            <span className="text-[9px] font-black uppercase text-slate-500">Print Profile</span>
                         </button>
                         <button 
                           onClick={handleWhatsApp}
                           className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 transition-all group"
                         >
                            <MessageCircle className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
                            <span className="text-[9px] font-black uppercase text-slate-500">WhatsApp</span>
                         </button>
                         <button 
                           onClick={handleExportPDF}
                           className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-500 transition-all group"
                         >
                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-red-600" />
                            <span className="text-[9px] font-black uppercase text-slate-500">Download PDF</span>
                         </button>
                         <button 
                           onClick={handleExportXLSX}
                           className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all group"
                         >
                            <Download className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                            <span className="text-[9px] font-black uppercase text-slate-500">Export XLSX</span>
                         </button>
                      </div>
                      {!profile?.isPublic && isOwner && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                           <Lock className="w-3.5 h-3.5 text-amber-500" />
                           <p className="text-[9px] font-bold text-amber-700 uppercase">Visible only to you until Public Mode is on</p>
                        </div>
                      )}
                   </div>
                )}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm transition-all hover:shadow-md">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{profile?.profileLabels?.activityHeading || "Network Activity"}</h4>
                   <NetworkActivity targetUid={targetId} />
                </div>

                {(profile?.isPro || profile?.companyId || isAdmin) && (
                   <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Technical Usage
                      </h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-xs">
                           <span className="font-bold text-indigo-600/60 uppercase tracking-tight">Monthly Token Burns</span>
                           <span className="font-black text-indigo-900">{profile?.aiUsage?.count || 0} / 10</span>
                         </div>
                         <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 transition-all duration-500" 
                              style={{ width: `${Math.min(((profile?.aiUsage?.count || 0) / 10) * 100, 100)}%` }}
                             />
                         </div>
                         <p className="text-[9px] text-indigo-400 font-bold uppercase text-center tracking-widest">
                           Limits reset: {format(new Date(), 'MMMM')} 31
                         </p>
                      </div>
                   </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:border-indigo-600 transition-all cursor-pointer relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                         <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Briefcase className="w-4 h-4" />
                         </div>
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Career Tools</h4>
                      </div>
                      <h3 className="text-slate-900 font-black text-lg leading-tight mb-2">Professional Resume</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide leading-relaxed mb-4">Build an industry-standard resume with AI tech verification.</p>
                      <Link 
                        to="/create-resume"
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                      >
                        Resume Builder
                        <Sparkles className="w-3.5 h-3.5" />
                      </Link>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden group cursor-pointer">
                   <div className="relative z-10">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Premium Feature</h4>
                      <h3 className="text-white font-black text-lg leading-tight mb-2">Technical Headhunting</h3>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide">Connect with top site operators and logistics heads globally.</p>
                      <button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
                        Upgrade Access
                      </button>
                   </div>
                   <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-text-heading text-bg-card rounded-[2rem] shadow-2xl border border-border-main flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1 text-white">Transmission Success</p>
              <p className="text-[10px] text-white/50 font-bold">Your professional identity has been updated on the network.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
