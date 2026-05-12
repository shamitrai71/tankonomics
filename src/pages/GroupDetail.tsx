import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Settings, 
  Image as ImageIcon, 
  Send, 
  Plus, 
  X,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Lock,
  Globe,
  Loader2,
  Building2,
  Camera,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Flag,
  AlertTriangle,
  Share2,
  Link2,
  Check,
  Sparkles,
  User,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { useCollection } from "../hooks/useFirestore";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  orderBy,
  where,
  increment
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { GoogleGenAI } from "@google/genai";
import GroupPostCard from "../components/GroupPostCard";
import { uploadImage } from "../lib/uploadImage";

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "settings">("feed");
  const [isMember, setIsMember] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [postSortOrder, setPostSortOrder] = useState<"createdAt" | "likesCount">("createdAt");

  // Group Content State
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  // Underlying File for the picked image — uploaded to Storage on submit
  // so we don't embed base64 in Firestore (1 MiB document limit).
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postAsCompanyId, setPostAsCompanyId] = useState<string | null>(null);
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  const [posting, setPosting] = useState(false);
  
  const MAX_POST_CHARS = 1000;
  
  const { data: posts, loading: loadingPosts } = useCollection<any>(`groups/${groupId}/posts`, [orderBy(postSortOrder, "desc")]);
  const { data: members, loading: loadingMembers } = useCollection<any>(`group_members`, [where("groupId", "==", groupId || "")]);

  const ownedCompanies = useMemo(() => {
    if (!profile?.companyId) return [];
    return [{
      id: profile.companyId,
      name: profile.company || "My Company",
      logo: profile.companyLogo || ""
    }];
  }, [profile]);

  useEffect(() => {
    if (ownedCompanies.length === 1 && !postAsCompanyId) {
      setPostAsCompanyId(ownedCompanies[0].id);
    }
  }, [ownedCompanies, postAsCompanyId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please pick an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`);
      return;
    }
    if (postImage && postImage.startsWith("blob:")) URL.revokeObjectURL(postImage);
    setPostImageFile(file);
    setPostImage(URL.createObjectURL(file));
  };

  const clearPostImage = () => {
    if (postImage && postImage.startsWith("blob:")) URL.revokeObjectURL(postImage);
    setPostImage(null);
    setPostImageFile(null);
  };

  const getVideoInfo = (content: string) => {
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i;
    const ytMatch = content.match(ytRegex);
    const vimeoMatch = content.match(vimeoRegex);
    if (ytMatch) return { type: 'youtube', id: ytMatch[1] };
    if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
    return null;
  };

  const videoPreview = useMemo(() => getVideoInfo(newPost), [newPost]);

  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    iconUrl: "",
    coverUrl: "",
    isPrivate: false
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Reporting State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Sharing State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState<any>(null);
  const [sharingToGroup, setSharingToGroup] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: myGroups } = useCollection<any>("groups", [where("creatorUid", "==", user?.uid || "")]);

  useEffect(() => {
    if (!groupId) return;

    const unsubGroup = onSnapshot(doc(db, "groups", groupId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGroup({ id: docSnap.id, ...data });
        setSettingsForm({
          name: data.name || "",
          description: data.description || "",
          iconUrl: data.iconUrl || "",
          coverUrl: data.coverUrl || "",
          isPrivate: data.isPrivate ?? false
        });
        setLoading(false);
      } else {
        navigate("/groups");
      }
    });

    return () => unsubGroup();
  }, [groupId, navigate]);

  useEffect(() => {
    if (!user || !members) return;
    const membership = members.find(m => m.userUid === user.uid);
    setIsMember(membership?.status === "approved" || membership?.role === "creator");
    setIsPending(membership?.status === "pending");
    setIsAdmin(membership?.role === "admin" || membership?.role === "creator");
  }, [user, members]);

  const handleJoin = async () => {
    if (!user || !groupId || !profile?.companyId) return;
    setJoining(true);
    try {
      const isPrivate = group.isPrivate;
      await setDoc(doc(db, "group_members", `${groupId}_${user.uid}`), {
        groupId,
        userUid: user.uid,
        userName: profile?.displayName || user.displayName,
        userPhoto: profile?.photoURL || user.photoURL,
        userJobTitle: profile?.jobTitle || "",
        userCompany: profile?.company || "",
        role: isPrivate ? "pending" : "member",
        status: isPrivate ? "pending" : "approved",
        joinedAt: serverTimestamp()
      });
      if (!isPrivate) {
        await updateDoc(doc(db, "groups", groupId), {
          memberCount: increment(1)
        });
      } else {
        alert("Your request to join this private group has been sent to the administrators.");
      }
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !groupId) return;
    setLeaving(true);
    try {
      await deleteDoc(doc(db, "group_members", `${groupId}_${user.uid}`));
      await updateDoc(doc(db, "groups", groupId), {
        memberCount: increment(-1)
      });
      setIsMember(false);
    } catch (error) {
      console.error("Error leaving group:", error);
    } finally {
      setLeaving(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupId || !newPost.trim()) return;

    setPosting(true);
    try {
      if (!user) throw new Error("Must be logged in to post");
      const selectedCompany = postAsCompanyId ? ownedCompanies.find(c => c.id === postAsCompanyId) : null;
      const videoInfo = getVideoInfo(newPost);

      // Upload the image (if any) to Storage so we only put the URL in the doc.
      let uploadedImageUrl: string | null = null;
      if (postImageFile) {
        try {
          uploadedImageUrl = await uploadImage(postImageFile, { folder: "groups" });
        } catch (uploadErr: any) {
          throw new Error(`Image upload failed: ${uploadErr?.message || uploadErr}`);
        }
      }

      const postData: any = {
        groupId,
        content: newPost,
        authorUid: user.uid,
        authorName: selectedCompany ? selectedCompany.name : (profile?.displayName || user.displayName || "Anonymous"),
        authorPhoto: selectedCompany ? selectedCompany.logo : (profile?.avatarUrl || profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || user.displayName}`),
        authorJobTitle: selectedCompany ? "Verified Company" : (profile?.jobTitle || "Network Peer"),
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        reactions: {}
      };

      if (selectedCompany) {
        postData.companyId = selectedCompany.id;
        postData.companyName = selectedCompany.name;
        postData.companyLogo = selectedCompany.logo;
      }

      if (uploadedImageUrl) postData.image = uploadedImageUrl;
      if (videoInfo) postData.video = videoInfo;

      const docRef = await addDoc(collection(db, `groups/${groupId}/posts`), postData);
      if (!docRef) throw new Error("Broadcast target rejected. Check membership status.");
      setNewPost("");
      clearPostImage();
    } catch (error: any) {
      console.error("Group post creation failed:", error);
      const isPermissionError = error.message?.includes("PERMISSION_DENIED") || error.message?.includes("insufficient permissions");
      alert(isPermissionError ? "Permission denied. You must be a member of this group to broadcast updates." : `Failed to broadcast: ${error.message || "Unknown error"}`);
    } finally {
      setPosting(false);
    }
  };

  const handleTechnicalTip = async () => {
    if (!newPost.trim() || isGeneratingTip) return;
    setIsGeneratingTip(true);
    try {
      const ggenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ggenAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a technical editor for an industrial networking platform. Enhance this draft for a group discussion with a professional technical insight.
        
        Draft: "${newPost}"`,
      });
      const generated = response.text;
      if (generated) setNewPost(generated.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingTip(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !groupId) return;

    setSavingSettings(true);
    try {
      await updateDoc(doc(db, "groups", groupId), {
        ...settingsForm,
        updatedAt: serverTimestamp()
      });
      setActiveTab("feed");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportPostId || !reportReason.trim()) return;

    setSubmittingReport(true);
    try {
      await addDoc(collection(db, "reports"), {
        targetId: reportPostId,
        targetType: "post",
        reason: reportReason,
        reporterUid: user.uid,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setReportModalOpen(false);
      setReportPostId(null);
      setReportReason("");
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCopyLink = (postId: string) => {
    const url = `${window.location.origin}/groups/${groupId}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    if (!sharePost) return;
    const link = `${window.location.origin}/groups/${groupId}/posts/${sharePost.id}`;
    const text = encodeURIComponent(sharePost.content.substring(0, 100) + "...");
    let url = "";

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${link}&text=${text}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
        break;
    }
    window.open(url, "_blank");
  };

  const handleInternalShare = async () => {
    if (!user || !sharePost || !sharingToGroup) return;
    setIsSharing(true);
    try {
      await addDoc(collection(db, `groups/${sharingToGroup}/posts`), {
        groupId: sharingToGroup,
        content: `Ref: ${sharePost.authorName}'s broadcast in ${group.name}:\n\n${sharePost.content}`,
        authorUid: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL,
        likesCount: 0,
        createdAt: serverTimestamp()
      });
      setShareModalOpen(false);
      setSharePost(null);
      setSharingToGroup(null);
    } catch (error) {
      console.error("Error sharing post:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Group Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="h-64 md:h-80 w-full relative overflow-hidden group/cover">
           {group.coverUrl ? (
             <img src={group.coverUrl} className="w-full h-full object-cover" alt="" />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80" />
           )}
           {isAdmin && (
             <button 
               onClick={() => setActiveTab("settings")}
               className="absolute top-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover/cover:opacity-100 transition-all hover:bg-white/20"
             >
               <Camera className="w-6 h-6" />
             </button>
           )}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
           <div className="absolute -top-16 md:-top-24 left-4 md:left-8">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-[2rem] border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center p-2 group/icon relative">
                 {group.iconUrl ? (
                   <img src={group.iconUrl} className="w-full h-full object-contain" alt="" />
                 ) : (
                   <Users className="w-16 h-16 md:w-24 md:h-24 text-slate-200" />
                 )}
                 {isAdmin && (
                   <button 
                     onClick={() => setActiveTab("settings")}
                     className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/icon:opacity-100 transition-all flex items-center justify-center"
                   >
                     <Camera className="w-8 h-8" />
                   </button>
                 )}
              </div>
           </div>

           <div className="pt-24 md:pt-8 md:pl-64 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-5xl font-black text-text-heading tracking-tighter uppercase">{group.name}</h1>
                    {group.isPrivate ? (
                      <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-amber-100">
                         <Lock className="w-3 h-3" />
                         Private
                      </div>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100">
                         <Globe className="w-3 h-3" />
                         Public
                      </div>
                    )}
                 </div>
                 <p className="text-slate-500 font-medium text-lg mb-4 max-w-2xl">{group.description}</p>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <Users className="w-4 h-4 text-primary" />
                       <span className="text-sm font-black text-text-heading tracking-tight">{group.memberCount || 1} <span className="text-slate-400 font-bold uppercase text-[10px]">Members Joined</span></span>
                    </div>
                    {/* Add more stats if needed */}
                 </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-3">
                 {isMember ? (
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={handleLeave}
                        disabled={leaving}
                        className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 border border-slate-200 flex items-center gap-2 disabled:opacity-50"
                      >
                         {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 rotate-45" />}
                         Leave Group
                      </button>
                      <button 
                        onClick={() => setActiveTab("feed")}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
                      >
                         Connected
                         <ShieldCheck className="w-4 h-4" />
                      </button>
                   </div>
                 ) : isPending ? (
                    <button 
                      disabled
                      className="px-12 py-4 bg-amber-100 text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-amber-200 flex items-center gap-3"
                    >
                      <Clock className="w-4 h-4" />
                      Approval Pending
                    </button>
                 ) : (
                   <div className="flex flex-col items-center gap-2">
                     <button 
                       onClick={handleJoin}
                       disabled={joining || !profile?.companyId}
                       className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                     >
                       {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                       Join Enterprise Group
                     </button>
                     {!profile?.companyId && (
                       <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                          <Building2 className="w-3 h-3" />
                          Verify Company to Join
                       </p>
                     )}
                   </div>
                 )}
                 {isAdmin && (
                    <button 
                      onClick={() => setActiveTab("settings")}
                      className={`p-4 rounded-2xl transition-all shadow-sm ${activeTab === "settings" ? "bg-sidebar-focus text-sidebar-focus-text shadow-xl" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                    >
                       <Settings className="w-6 h-6" />
                    </button>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12">
         {/* Internal Navigation */}
         <div className="flex items-center gap-2 mb-12 bg-white p-2 rounded-3xl border border-slate-200 w-fit">
            {(["feed", "members"] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? "bg-sidebar-focus text-sidebar-focus-text shadow-xl" : "text-slate-400 hover:text-text-heading hover:bg-slate-50"}`}
              >
                {tab === "feed" ? "Network Feed" : "Member Directory"}
              </button>
            ))}
            {isAdmin && (
              <button 
                onClick={() => setActiveTab("requests" as any)}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === ("requests" as any) ? "bg-amber-500 text-white shadow-xl" : "text-slate-400 hover:text-text-heading hover:bg-slate-50"}`}
              >
                Join Requests
                {members?.filter(m => m.status === "pending").length > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] tracking-normal font-black">
                    {members.filter(m => m.status === "pending").length}
                  </span>
                )}
              </button>
            )}
         </div>

         {activeTab === "feed" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                 {isMember && (
                   <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
                      <div className="flex gap-4 items-start">
                         <img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`} className="w-14 h-14 rounded-2xl border-2 border-slate-50" alt="" />
                         <div className="flex-1">
                            <textarea 
                              value={newPost}
                              onChange={(e) => setNewPost(e.target.value)}
                              placeholder={`Share something with ${group.name}...`}
                              className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all h-32 resize-none placeholder:text-slate-300"
                            />
                            <div className="mt-4 flex items-center justify-between">
                               <button className="flex items-center gap-3 text-slate-400 hover:text-primary transition-colors p-2 rounded-xl">
                                  <ImageIcon className="w-5 h-5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Attach Media</span>
                               </button>
                               <button 
                                 onClick={handlePost}
                                 disabled={posting || !newPost.trim()}
                                 className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/20"
                               >
                                 {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-white/50" />}
                                 Broadcast update
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Stream</p>
                    <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                       <button 
                        onClick={() => setPostSortOrder("createdAt")}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${postSortOrder === "createdAt" ? "bg-sidebar-focus text-sidebar-focus-text shadow-lg" : "text-slate-400 hover:text-text-heading"}`}
                       >
                          Newest
                       </button>
                       <button 
                        onClick={() => setPostSortOrder("likesCount")}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${postSortOrder === "likesCount" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-emerald-600"}`}
                       >
                          Helpful
                       </button>
                    </div>
                 </div>

                  <div className="space-y-8">
                    {loadingPosts ? (
                      [1, 2].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]" />)
                    ) : posts.length === 0 ? (
                      <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <Users className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-xl font-black text-slate-300 uppercase tracking-tighter">No broadcasts found</p>
                      </div>
                    ) : (
                      posts.slice(0, 20).map(post => (
                        <GroupPostCard 
                          key={post.id} 
                          post={post} 
                          groupId={groupId!} 
                          isAdmin={isAdmin} 
                          onCommentsToggle={() => {}} 
                        />
                      ))
                    )}
                  </div>
               </div>

              {/* Sidebar */}
              <div className="space-y-8">
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8">
                       <ShieldCheck className="w-12 h-12 text-slate-50" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 relative z-10">Network Identity</p>
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                          <Building2 className="w-8 h-8 text-primary" />
                       </div>
                       <div>
                          <p className="text-xl font-black text-text-heading tracking-tight leading-none mb-1">Company Linked</p>
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Verified Workspace</p>
                       </div>
                    </div>
                    <p className="text-xs text-text-body/60 leading-relaxed font-medium">This group is restricted to verified industry members connected to a recognized business profile. High-trust collaboration environment.</p>
                 </div>

                 <div className="bg-sidebar-focus rounded-[2.5rem] shadow-2xl p-8 text-sidebar-focus-text relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-all duration-700" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Active Contributors</p>
                    <div className="space-y-4">
                       {members?.slice(0, 5).map(m => (
                         <MemberRow key={m.id} uid={m.userUid} role={m.role} />
                       ))}
                       {members?.length > 5 && (
                         <button 
                           onClick={() => setActiveTab("members")}
                           className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group/see-all"
                         >
                            <span className="text-[10px] font-black uppercase tracking-widest">See all {members.length} members</span>
                            <ChevronRight className="w-4 h-4 group-hover/see-all:translate-x-1 transition-transform" />
                         </button>
                       )}
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === "members" && (
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h2 className="text-3xl font-black text-text-heading uppercase tracking-tighter">Member Directory</h2>
                    <p className="text-sm font-medium text-text-body/60">Industry colleagues and network peers in this group</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {members?.filter(m => m.status === "approved" || m.role === "creator").map(m => (
                   <MemberCard 
                    key={m.id} 
                    uid={m.userUid} 
                    role={m.role} 
                    groupId={groupId!} 
                    canManage={isAdmin} 
                    isCurrentUserAdmin={isAdmin}
                   />
                 ))}
              </div>
           </div>
         )}

         {activeTab === ("requests" as any) && isAdmin && (
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h2 className="text-3xl font-black text-text-heading uppercase tracking-tighter">Membership Requests</h2>
                    <p className="text-sm font-medium text-text-body/60">Review professionals requesting to join your private network</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {members?.filter(m => m.status === "pending").map(m => (
                   <RequestCard 
                     key={m.id} 
                     request={m} 
                     groupId={groupId!} 
                     onAction={() => {}} 
                   />
                 ))}
                 {members?.filter(m => m.status === "pending").length === 0 && (
                   <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                     <Users className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                     <p className="text-xl font-black text-slate-300 uppercase tracking-tighter">No pending requests</p>
                   </div>
                 )}
              </div>
           </div>
         )}

         {activeTab === "settings" && isAdmin && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
               <div className="p-12 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-3xl font-black text-text-heading uppercase tracking-tighter">Group Configuration</h2>
                  <p className="text-sm font-medium text-slate-500">Customize your group identity and visibility</p>
               </div>

               <form onSubmit={handleSaveSettings} className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Enterprise Name</label>
                          <input 
                            required
                            type="text" 
                            value={settingsForm.name}
                            onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Group Mission Control</label>
                          <textarea 
                            value={settingsForm.description}
                            onChange={(e) => setSettingsForm({...settingsForm, description: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium h-32 resize-none"
                          />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Icon Asset URL</label>
                          <input 
                            type="text" 
                            value={settingsForm.iconUrl}
                            onChange={(e) => setSettingsForm({...settingsForm, iconUrl: e.target.value})}
                            placeholder="https://..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Cover Asset URL</label>
                          <input 
                            type="text" 
                            value={settingsForm.coverUrl}
                            onChange={(e) => setSettingsForm({...settingsForm, coverUrl: e.target.value})}
                            placeholder="https://..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                          />
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                           <div>
                              <p className="text-[11px] font-black uppercase text-text-heading">Private Network Mode</p>
                              <p className="text-[10px] text-slate-400 font-bold">Only invited members can join</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={settingsForm.isPrivate}
                              onChange={(e) => setSettingsForm({...settingsForm, isPrivate: e.target.checked})}
                              className="sr-only peer" 
                            />
                            <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                     <button 
                       type="button"
                       onClick={() => setActiveTab("feed")}
                       className="px-10 py-4 bg-white text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:text-slate-600 transition-all"
                     >
                        Cancel
                     </button>
                     <button 
                       type="submit"
                       disabled={savingSettings}
                       className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-3"
                     >
                       {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                       Synchronize Settings
                     </button>
                  </div>
               </form>
            </div>
         )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setReportModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
                <div className="p-8 pt-10 text-center border-b border-slate-100 bg-slate-50">
                   <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle className="w-8 h-8 text-rose-500" />
                   </div>
                   <h2 className="text-2xl font-black text-text-heading uppercase tracking-tighter mb-2">Report Content</h2>
                   <p className="text-sm font-medium text-text-body/60">Help us maintain a high-trust professional network</p>
                </div>

                <form onSubmit={handleReport} className="p-8 space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Reason for Report</label>
                      <textarea 
                        required
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Please describe why this content is inappropriate (e.g. spam, harassment, non-industry related)..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-50 transition-all font-medium h-40 resize-none placeholder:text-slate-300"
                      />
                   </div>

                   <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setReportModalOpen(false)}
                        className="flex-1 py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:text-slate-600 transition-all"
                      >
                         Discard
                      </button>
                      <button 
                        type="submit"
                        disabled={submittingReport || !reportReason.trim()}
                        className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                         {submittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                         Submit Report
                      </button>
                   </div>
                </form>

                <button 
                  onClick={() => setReportModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                   <X className="w-6 h-6" />
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShareModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
                <div className="p-8 pt-10 text-center border-b border-slate-100 bg-slate-50">
                   <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Share2 className="w-8 h-8 text-amber-500" />
                   </div>
                   <h2 className="text-2xl font-black text-text-heading uppercase tracking-tighter mb-2">Share Broadcast</h2>
                   <p className="text-sm font-medium text-text-body/60">Distribute industry insights across the network</p>
                </div>

                <div className="p-8 space-y-8">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">External Link</p>
                      <button 
                        onClick={() => handleCopyLink(sharePost.id)}
                        className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-600 transition-all group"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                               <Link2 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="text-left">
                               <p className="text-xs font-black uppercase tracking-tight text-text-heading">Copy Deep Link</p>
                               <p className="text-[10px] text-slate-400 font-bold">Paste into email or industry groups</p>
                            </div>
                         </div>
                         {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />}
                      </button>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Social Transmission</p>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => shareOnSocial('linkedin')}
                           className="bg-[#0077b5] text-white p-4 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg shadow-blue-900/20"
                         >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            <span className="text-xs font-black uppercase tracking-widest">LinkedIn</span>
                         </button>
                         <button 
                           onClick={() => shareOnSocial('twitter')}
                           className="bg-black text-white p-4 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg shadow-slate-900/20"
                         >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            <span className="text-xs font-black uppercase tracking-widest">Twitter</span>
                         </button>
                      </div>
                   </div>

                   {myGroups && myGroups.length > 0 && (
                     <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Collaborate within Network</p>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-500 block">Select a Group you manage:</label>
                           <select 
                             className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-bold appearance-none cursor-pointer"
                             value={sharingToGroup || ""}
                             onChange={(e) => setSharingToGroup(e.target.value)}
                           >
                              <option value="">Select Target Destination...</option>
                              {myGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                           </select>
                           <button 
                             onClick={handleInternalShare}
                             disabled={isSharing || !sharingToGroup}
                             className="w-full py-5 bg-sidebar-focus text-sidebar-focus-text rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:brightness-110 transition-all disabled:opacity-50"
                           >
                              {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                              Share internally
                           </button>
                        </div>
                     </div>
                   )}
                </div>

                <button 
                  onClick={() => setShareModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                   <X className="w-6 h-6" />
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestCard({ request, groupId, onAction }: { request: any, groupId: string, onAction: () => void }) {
  const [updating, setUpdating] = useState(false);

  const handleApprove = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "group_members", `${groupId}_${request.userUid}`), {
        status: "approved",
        role: "member",
        joinedAt: serverTimestamp()
      });
      await updateDoc(doc(db, "groups", groupId), {
        memberCount: increment(1)
      });
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    setUpdating(true);
    try {
      await deleteDoc(doc(db, "group_members", `${groupId}_${request.userUid}`));
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all group">
       <div className="relative mb-6">
          <img 
            src={request.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${request.userName}`} 
            className="w-24 h-24 rounded-3xl border-4 border-slate-50 shadow-lg" 
            alt="" 
          />
       </div>

       <h3 className="text-xl font-black text-text-heading uppercase tracking-tight mb-1">{request.userName}</h3>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{request.userJobTitle}</p>
       <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-8">{request.userCompany}</p>
       
       <div className="w-full flex items-center gap-3">
          <button 
           onClick={handleReject}
           disabled={updating}
           className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            Decline
          </button>
          <button 
           onClick={handleApprove}
           disabled={updating}
           className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
             {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
             Approve
          </button>
       </div>
    </div>
  );
}

function MemberRow({ uid, role }: { uid: string, role: string }) {
  const [memberProfile, setMemberProfile] = useState<any>(null);

  useEffect(() => {
    getDoc(doc(db, "users", uid)).then(snap => {
      if (snap.exists()) setMemberProfile(snap.data());
    });
  }, [uid]);

  if (!memberProfile) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
       <div className="flex items-center gap-3">
          <img 
            src={memberProfile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${memberProfile.displayName}`} 
            className="w-10 h-10 rounded-xl" 
            alt="" 
          />
          <div>
             <p className="text-[11px] font-black uppercase tracking-tight">{memberProfile.displayName}</p>
             <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{memberProfile.jobTitle || "Member"}</p>
          </div>
       </div>
       <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
         role === 'creator' ? 'bg-primary text-white' : 
         role === 'admin' ? 'bg-amber-500 text-white' : 
         'bg-white/10 text-white/60'
       }`}>
          {role}
       </div>
    </div>
  );
}

function MemberCard({ uid, role, groupId, isCurrentUserAdmin }: { uid: string, role: string, groupId: string, canManage: boolean, isCurrentUserAdmin: boolean }) {
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "users", uid)).then(snap => {
      if (snap.exists()) setMemberProfile(snap.data());
    });
  }, [uid]);

  const handleMakeAdmin = async () => {
    if (!isCurrentUserAdmin) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "group_members", `${groupId}_${uid}`), {
        role: "admin"
      });
      // Also update admins array in group document
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const admins = groupSnap.data().admins || [];
        if (!admins.includes(uid)) {
          await updateDoc(groupRef, {
            admins: [...admins, uid]
          });
        }
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!isCurrentUserAdmin) return;
    setUpdating(true);
    try {
      await deleteDoc(doc(db, "group_members", `${groupId}_${uid}`));
      await updateDoc(doc(db, "groups", groupId), {
        memberCount: increment(-1)
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!memberProfile) return null;

  return (
    <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center text-center group transition-all hover:bg-white hover:shadow-xl">
       <Link to={`/profile/${uid}`} className="relative mb-6">
          <img 
            src={memberProfile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${memberProfile.displayName}`} 
            className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg transition-transform group-hover:scale-105" 
            alt="" 
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-100">
             {role === 'creator' ? <ShieldCheck className="w-4 h-4 text-primary" /> : 
              role === 'admin' ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : 
              <Users className="w-4 h-4 text-slate-300" />}
          </div>
       </Link>

       <h3 className="text-xl font-black text-text-heading uppercase tracking-tight mb-1">{memberProfile.displayName}</h3>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{memberProfile.company || "Independent"}</p>
       
       <div className="w-full flex items-center gap-2 mt-auto">
          {isCurrentUserAdmin && role !== 'creator' && (
            <>
               {role === 'member' && (
                 <button 
                  onClick={handleMakeAdmin}
                  disabled={updating}
                  className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 transition-all"
                 >
                   Make Admin
                 </button>
               )}
               <button 
                onClick={handleRemoveMember}
                disabled={updating}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-rose-500 transition-all"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </>
          )}
          <Link 
            to={`/profile/${uid}`}
            className="flex-1 py-3 bg-sidebar-focus text-sidebar-focus-text rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
          >
            View Profile
          </Link>
       </div>
    </div>
  );
}
