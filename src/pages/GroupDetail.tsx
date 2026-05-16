/**
 * GroupDetail — single group surface (feed / members / settings).
 *
 * Restyled to the new design language. All data wiring preserved verbatim:
 *   - onSnapshot listener for the group document
 *   - useCollection for posts and members
 *   - handleJoin / handleLeave / handlePost / handleTechnicalTip / handleSaveSettings
 *   - handleReport, handleCopyLink, shareOnSocial, handleInternalShare
 *   - Image upload pipeline via uploadImage helper + base64 migration
 *   - RequestCard, MemberCard subcomponents (restyled, same handlers)
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
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
  Clock,
  ChevronRight,
  Share2,
  Link2,
  Check,
  Sparkles,
  User,
  Play,
  Flag,
  LogOut,
  Settings as SettingsIcon,
  ArrowLeft,
  Twitter,
  Linkedin,
  Facebook,
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
  increment,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { GoogleGenAI } from "@google/genai";
import GroupPostCard from "../components/GroupPostCard";
import { uploadImage, isInlineImage, migrateDataUrlToStorage } from "../lib/uploadImage";

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

  // Group content state
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postAsCompanyId, setPostAsCompanyId] = useState<string | null>(null);
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  const [posting, setPosting] = useState(false);

  const MAX_POST_CHARS = 1000;

  const { data: posts, loading: loadingPosts } = useCollection<any>(`groups/${groupId}/posts`, [orderBy(postSortOrder, "desc")]);
  const { data: members, loading: loadingMembers } = useCollection<any>(`group_members`, [where("groupId", "==", groupId || "")]);

  const ownedCompanies = useMemo(() => {
    if (!profile?.companyId) return [];
    return [
      {
        id: profile.companyId,
        name: profile.company || "My Company",
        logo: profile.companyLogo || "",
      },
    ];
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
    if (ytMatch) return { type: "youtube", id: ytMatch[1] };
    if (vimeoMatch) return { type: "vimeo", id: vimeoMatch[1] };
    return null;
  };

  const videoPreview = useMemo(() => getVideoInfo(newPost), [newPost]);

  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    iconUrl: "",
    coverUrl: "",
    isPrivate: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Reporting state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Sharing state
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
          isPrivate: data.isPrivate ?? false,
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
    const membership = members.find((m) => m.userUid === user.uid);
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
        joinedAt: serverTimestamp(),
      });
      if (!isPrivate) {
        await updateDoc(doc(db, "groups", groupId), { memberCount: increment(1) });
      } else {
        alert("Your request to join this private group has been sent to the administrators.");
      }
    } catch (err) {
      console.error("Error joining group:", err);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !groupId) return;
    setLeaving(true);
    try {
      await deleteDoc(doc(db, "group_members", `${groupId}_${user.uid}`));
      await updateDoc(doc(db, "groups", groupId), { memberCount: increment(-1) });
      setIsMember(false);
    } catch (err) {
      console.error("Error leaving group:", err);
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
      const selectedCompany = postAsCompanyId ? ownedCompanies.find((c) => c.id === postAsCompanyId) : null;
      const videoInfo = getVideoInfo(newPost);

      let uploadedImageUrl: string | null = null;
      if (postImageFile) {
        try {
          uploadedImageUrl = await uploadImage(postImageFile, { folder: "groups" });
        } catch (uploadErr: any) {
          throw new Error(`Image upload failed: ${uploadErr?.message || uploadErr}`);
        }
      }

      let authorPhotoSafe: string | null = selectedCompany
        ? selectedCompany.logo
        : profile?.avatarUrl ||
          profile?.photoURL ||
          user.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || user.displayName}`;
      if (isInlineImage(authorPhotoSafe)) {
        try {
          authorPhotoSafe = await migrateDataUrlToStorage(authorPhotoSafe, "profile");
        } catch {
          authorPhotoSafe = null;
        }
      }

      let companyLogoSafe: string | null = selectedCompany?.logo ?? null;
      if (isInlineImage(companyLogoSafe)) {
        try {
          companyLogoSafe = await migrateDataUrlToStorage(companyLogoSafe, "companies");
        } catch {
          companyLogoSafe = null;
        }
      }

      const postData: any = {
        groupId,
        content: newPost,
        authorUid: user.uid,
        authorName: selectedCompany ? selectedCompany.name : profile?.displayName || user.displayName || "Anonymous",
        authorPhoto: authorPhotoSafe,
        authorJobTitle: selectedCompany ? "Verified Company" : profile?.jobTitle || "Network Peer",
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        reactions: {},
      };

      if (selectedCompany) {
        postData.companyId = selectedCompany.id;
        postData.companyName = selectedCompany.name;
        postData.companyLogo = companyLogoSafe;
      }

      if (uploadedImageUrl) postData.image = uploadedImageUrl;
      if (videoInfo) postData.video = videoInfo;

      const docRef = await addDoc(collection(db, `groups/${groupId}/posts`), postData);
      if (!docRef) throw new Error("Post target rejected. Check membership status.");
      setNewPost("");
      clearPostImage();
    } catch (error: any) {
      console.error("Group post creation failed:", error);
      const isPermissionError = error.message?.includes("PERMISSION_DENIED") || error.message?.includes("insufficient permissions");
      alert(isPermissionError ? "Permission denied. You must be a member of this group to post updates." : `Failed to post: ${error.message || "Unknown error"}`);
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
        updatedAt: serverTimestamp(),
      });
      setActiveTab("feed");
    } catch (err) {
      console.error("Error saving settings:", err);
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
        createdAt: serverTimestamp(),
      });
      setReportModalOpen(false);
      setReportPostId(null);
      setReportReason("");
    } catch (err) {
      console.error("Error submitting report:", err);
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
        createdAt: serverTimestamp(),
      });
      setShareModalOpen(false);
      setSharePost(null);
      setSharingToGroup(null);
    } catch (err) {
      console.error("Error sharing post:", err);
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-text-heading border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const approvedMembers = members.filter((m) => m.status === "approved" || m.role === "creator");
  const pendingRequests = members.filter((m) => m.status === "pending");
  const currentIdentityLogo = postAsCompanyId
    ? ownedCompanies.find((c) => c.id === postAsCompanyId)?.logo
    : profile?.photoURL;
  const currentIdentityName = postAsCompanyId
    ? ownedCompanies.find((c) => c.id === postAsCompanyId)?.name
    : profile?.displayName;

  return (
    <div className="min-h-screen bg-bg-main pb-20">
      {/* HERO */}
      <div className="relative h-[260px] md:h-[320px] w-full overflow-hidden">
        {group.coverUrl ? (
          <img src={group.coverUrl} className="w-full h-full object-cover" alt={`${group.name} cover`} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blueprint via-primary to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/55 to-transparent" />
        <div className="absolute inset-0 bp-grid opacity-25 pointer-events-none" />

        {/* Back to groups */}
        <div className="absolute top-6 left-4 md:left-8 z-10">
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-bg-card/10 backdrop-blur-md border border-white/20 rounded-xl eyebrow tabular text-white hover:bg-bg-card/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            All groups
          </Link>
        </div>

        {/* Visibility chip in hero */}
        <div className="absolute top-6 right-4 md:right-8 z-10">
          {group.isPrivate ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-card/10 backdrop-blur-md border border-white/20 rounded-xl eyebrow tabular text-white">
              <Lock className="w-3 h-3" strokeWidth={2} />
              Private
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-xl eyebrow tabular shadow-lg">
              <Globe className="w-3 h-3" strokeWidth={2} />
              Public
            </span>
          )}
        </div>

        {/* Cover edit shortcut */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab("settings")}
            className="absolute bottom-6 right-6 w-10 h-10 bg-bg-card/10 backdrop-blur-md border border-white/20 rounded-xl text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-all flex items-center justify-center"
            title="Edit cover"
          >
            <Camera className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* IDENTITY CARD — overlaps hero */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 md:-mt-20 relative z-10">
        <div className="bg-bg-card border border-border-main rounded-2xl p-5 md:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-7">
            {/* Icon */}
            <div className="relative shrink-0 -mt-14 md:-mt-12">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-bg-main rounded-2xl border border-border-main p-3 flex items-center justify-center overflow-hidden shadow-lg">
                {group.iconUrl ? (
                  <img src={group.iconUrl} className="max-w-full max-h-full object-contain" alt={group.name} />
                ) : (
                  <Users className="w-12 h-12 text-text-body/30" strokeWidth={1.5} />
                )}
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="absolute -bottom-2 -right-2 w-9 h-9 bg-text-heading text-bg-card rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  title="Edit icon"
                >
                  <Camera className="w-4 h-4" strokeWidth={1.75} />
                </button>
              )}
            </div>

            {/* Name + description */}
            <div className="flex-1 min-w-0">
              <div className="eyebrow tabular text-accent mb-1 inline-flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                COMMUNITY GROUP
              </div>
              <h1 className="font-display text-[clamp(1.875rem,4vw,3rem)] text-text-heading leading-[1.0]">{group.name}</h1>
              {group.description && (
                <p className="text-text-body text-[14px] mt-2 max-w-2xl leading-relaxed">{group.description}</p>
              )}
              <p className="eyebrow tabular text-text-body/55 mt-3 inline-flex items-center gap-1.5">
                <Users className="w-3 h-3" strokeWidth={1.75} />
                {approvedMembers.length} {approvedMembers.length === 1 ? "MEMBER" : "MEMBERS"}
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 shrink-0">
              {isMember ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent/10 text-accent border border-accent/20 rounded-xl text-[13px] font-medium">
                    <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                    Member
                  </span>
                  <button
                    onClick={handleLeave}
                    disabled={leaving}
                    className="inline-flex items-center gap-2 bg-bg-card border border-border-main text-text-body hover:text-rust hover:border-rust/30 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                  >
                    {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" strokeWidth={1.75} />}
                    Leave
                  </button>
                </>
              ) : isPending ? (
                <span className="inline-flex items-center gap-2 bg-rust/5 text-rust border border-rust/20 px-4 py-2.5 rounded-xl text-[13px] font-medium">
                  <Clock className="w-4 h-4" strokeWidth={1.75} />
                  Approval pending
                </span>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining || !profile?.companyId}
                  className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                  title={!profile?.companyId ? "Connect your profile to a verified company first" : ""}
                >
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={1.75} />}
                  {group.isPrivate ? "Request to join" : "Join group"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex gap-7 border-b border-border-main mb-8 overflow-x-auto">
          {([
            { key: "feed", label: "Feed", count: posts.length },
            { key: "members", label: "Members", count: approvedMembers.length },
            ...(isAdmin ? [{ key: "settings" as const, label: "Settings", count: pendingRequests.length || null }] : []),
          ] as { key: typeof activeTab; label: string; count: number | null }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 eyebrow tabular relative whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                activeTab === tab.key ? "text-text-heading" : "text-text-body/55 hover:text-text-body"
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded eyebrow tabular ${activeTab === tab.key ? "bg-text-heading text-bg-card" : "bg-bg-main border border-border-main text-text-body/60"}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && <motion.div layoutId="gtab" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
              {/* Main feed column */}
              <div className="space-y-6">
                {/* Composer */}
                {isMember && (
                  <div className="bg-bg-card border border-border-main rounded-2xl p-5 md:p-6">
                    {/* Identity toggle */}
                    {ownedCompanies.length > 0 && (
                      <div className="flex items-center gap-1 p-1 bg-bg-main rounded-xl border border-border-main w-fit mb-4">
                        <button
                          onClick={() => setPostAsCompanyId(null)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg eyebrow tabular transition-all ${
                            !postAsCompanyId ? "bg-text-heading text-bg-card" : "text-text-body/55 hover:text-text-body"
                          }`}
                        >
                          <User className="w-3 h-3" strokeWidth={1.75} />
                          Individual
                        </button>
                        {ownedCompanies.map((co) => (
                          <button
                            key={co.id}
                            onClick={() => setPostAsCompanyId(co.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg eyebrow tabular transition-all ${
                              postAsCompanyId === co.id ? "bg-text-heading text-bg-card" : "text-text-body/55 hover:text-text-body"
                            }`}
                          >
                            {co.logo ? <img src={co.logo} className="w-3 h-3 rounded-sm object-contain" alt="" /> : <Building2 className="w-3 h-3" strokeWidth={1.75} />}
                            {co.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handlePost}>
                      <div className="flex gap-3">
                        <img
                          src={currentIdentityLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${currentIdentityName}`}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-border-main object-cover shrink-0"
                          alt=""
                        />
                        <div className="flex-1 space-y-2">
                          <div className="relative">
                            <textarea
                              value={newPost}
                              onChange={(e) => setNewPost(e.target.value.slice(0, MAX_POST_CHARS))}
                              placeholder="Share a technical update with the group…"
                              className="w-full bg-bg-main border border-border-main rounded-xl p-4 text-[14px] focus:bg-bg-card focus:border-text-heading outline-none transition-all resize-none h-24 placeholder:text-text-body/40 leading-relaxed"
                            />
                            <div
                              className={`absolute bottom-3 right-3 eyebrow tabular px-2 py-0.5 rounded ${
                                newPost.length > MAX_POST_CHARS * 0.9 ? "bg-rust/10 text-rust" : "bg-bg-card text-text-body/45"
                              }`}
                            >
                              {MAX_POST_CHARS - newPost.length}
                            </div>
                          </div>

                          {/* Video preview */}
                          {videoPreview && (
                            <div className="relative mt-2 rounded-xl overflow-hidden aspect-video bg-bg-main border border-border-main">
                              <div className="absolute inset-0 flex items-center justify-center bg-ink/30 opacity-0 hover:opacity-100 transition-opacity z-10">
                                <div className="bg-bg-card/30 backdrop-blur-md p-3 rounded-full">
                                  <Play className="w-7 h-7 text-white fill-current" />
                                </div>
                              </div>
                              {videoPreview.type === "youtube" ? (
                                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoPreview.id}?controls=0`} title="Video preview" frameBorder="0" className="pointer-events-none" />
                              ) : (
                                <iframe src={`https://player.vimeo.com/video/${videoPreview.id}?background=1`} width="100%" height="100%" frameBorder="0" className="pointer-events-none" />
                              )}
                              <div className="absolute top-2 left-2 px-2 py-1 bg-ink/85 rounded eyebrow tabular text-white z-20">
                                {videoPreview.type} DETECTED
                              </div>
                            </div>
                          )}

                          {/* Image preview */}
                          {postImage && (
                            <div className="relative inline-block mt-2">
                              <img src={postImage} className="max-h-48 rounded-xl border border-border-main" alt="Preview" />
                              <button
                                type="button"
                                onClick={clearPostImage}
                                className="absolute -top-2 -right-2 bg-ink text-white p-1.5 rounded-full shadow-lg hover:bg-rust transition-colors"
                                aria-label="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Composer footer */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-main">
                        <div className="flex items-center gap-1">
                          <label className="flex items-center gap-2 eyebrow tabular text-text-body/65 hover:text-text-heading px-2.5 py-2 hover:bg-bg-main rounded-lg cursor-pointer transition-all">
                            <ImageIcon className="w-4 h-4 text-accent" strokeWidth={1.75} />
                            <span>Media</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>
                          <button
                            type="button"
                            onClick={handleTechnicalTip}
                            disabled={!newPost.trim() || isGeneratingTip}
                            className="flex items-center gap-2 eyebrow tabular text-text-body/65 hover:text-text-heading px-2.5 py-2 hover:bg-bg-main rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {isGeneratingTip ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />}
                            <span>Insight</span>
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={(!newPost.trim() && !postImage) || posting}
                          className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-30 transition-all"
                        >
                          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Posts */}
                {loadingPosts ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => <div key={i} className="h-32 bg-bg-card border border-border-main rounded-2xl animate-pulse" />)}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-16 bg-bg-card border border-dashed border-border-main rounded-2xl">
                    <Building2 className="w-10 h-10 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="eyebrow tabular text-text-body/55 mb-1">QUIET CHANNEL</p>
                    <p className="text-text-body text-[14px]">No posts in this group yet.</p>
                  </div>
                ) : (
                  posts.map((post: any) => (
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

              {/* Sidebar — sort + group info */}
              <aside className="space-y-6">
                <div className="bg-bg-card border border-border-main rounded-2xl p-5">
                  <p className="eyebrow tabular text-text-body/55 mb-3">Sort posts by</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPostSortOrder("createdAt")}
                      className={`flex-1 px-3 py-2 rounded-lg eyebrow tabular text-center transition-all ${
                        postSortOrder === "createdAt" ? "bg-text-heading text-bg-card" : "bg-bg-main border border-border-main text-text-body hover:border-text-heading"
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => setPostSortOrder("likesCount")}
                      className={`flex-1 px-3 py-2 rounded-lg eyebrow tabular text-center transition-all ${
                        postSortOrder === "likesCount" ? "bg-text-heading text-bg-card" : "bg-bg-main border border-border-main text-text-body hover:border-text-heading"
                      }`}
                    >
                      Top liked
                    </button>
                  </div>
                </div>

                <div className="bg-bg-card border border-border-main rounded-2xl p-5">
                  <p className="eyebrow tabular text-text-body/55 mb-3">Recent members</p>
                  {approvedMembers.length === 0 ? (
                    <p className="text-[13px] text-text-body/55 italic">No members yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {approvedMembers.slice(0, 6).map((m) => (
                        <Link key={m.id} to={`/profile/${m.userUid}`} className="flex items-center gap-3 group/m">
                          <img
                            src={m.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${m.userName}`}
                            className="w-8 h-8 rounded-lg border border-border-main object-cover shrink-0"
                            alt=""
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text-heading truncate group-hover/m:text-accent transition-colors">{m.userName}</p>
                            <p className="eyebrow tabular text-text-body/55 truncate">{m.userJobTitle || "Member"}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {approvedMembers.length > 6 && (
                    <button onClick={() => setActiveTab("members")} className="mt-4 eyebrow tabular text-accent hover:underline inline-flex items-center gap-1">
                      View all members
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </aside>
            </motion.div>
          )}

          {activeTab === "members" && (
            <motion.div key="members" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-8">
              {/* Pending requests (admin only) */}
              {isAdmin && pendingRequests.length > 0 && (
                <section>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <p className="eyebrow tabular text-accent">REVIEW PENDING</p>
                      <h2 className="font-display text-2xl text-text-heading mt-1">{pendingRequests.length} {pendingRequests.length === 1 ? "request" : "requests"} awaiting approval</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingRequests.map((req) => (
                      <RequestCard key={req.id} request={req} groupId={groupId!} onAction={() => {}} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <p className="eyebrow tabular text-text-body/55">{approvedMembers.length} {approvedMembers.length === 1 ? "MEMBER" : "MEMBERS"}</p>
                    <h2 className="font-display text-2xl text-text-heading mt-1">Group roster</h2>
                  </div>
                </div>
                {loadingMembers ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-bg-card border border-border-main rounded-2xl animate-pulse" />)}
                  </div>
                ) : approvedMembers.length === 0 ? (
                  <div className="text-center py-16 bg-bg-card border border-dashed border-border-main rounded-2xl">
                    <Users className="w-10 h-10 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-text-body/55 text-[14px]">No members yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {approvedMembers.map((m) => (
                      <MemberCard key={m.id} uid={m.userUid} role={m.role} groupId={groupId!} canManage={isAdmin} isCurrentUserAdmin={isAdmin} />
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {activeTab === "settings" && isAdmin && (
            <motion.div key="settings" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="max-w-2xl">
              <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-border-main">
                  <p className="eyebrow tabular text-accent">GROUP SETTINGS</p>
                  <h2 className="font-display text-2xl text-text-heading mt-1">Configure this group</h2>
                </div>
                <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Group name</span>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading outline-none focus:border-text-heading transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Description / mission</span>
                    <textarea
                      value={settingsForm.description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading h-28 resize-none transition-all"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Icon URL</span>
                      <div className="flex gap-2">
                        {settingsForm.iconUrl && (
                          <div className="w-12 h-12 rounded-lg border border-border-main bg-bg-main shrink-0 overflow-hidden p-1">
                            <img src={settingsForm.iconUrl} className="w-full h-full object-contain" alt="" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={settingsForm.iconUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, iconUrl: e.target.value })}
                          placeholder="https://…"
                          className="flex-1 px-3 py-3 bg-bg-main border border-border-main rounded-xl text-[12px] text-text-heading outline-none focus:border-text-heading transition-all"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Cover URL</span>
                      <div className="flex gap-2">
                        {settingsForm.coverUrl && (
                          <div className="w-12 h-12 rounded-lg border border-border-main bg-bg-main shrink-0 overflow-hidden">
                            <img src={settingsForm.coverUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={settingsForm.coverUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, coverUrl: e.target.value })}
                          placeholder="https://…"
                          className="flex-1 px-3 py-3 bg-bg-main border border-border-main rounded-xl text-[12px] text-text-heading outline-none focus:border-text-heading transition-all"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-main">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-bg-card ${settingsForm.isPrivate ? "bg-rust" : "bg-accent"}`}>
                        {settingsForm.isPrivate ? <Lock className="w-4 h-4" strokeWidth={1.75} /> : <Globe className="w-4 h-4" strokeWidth={1.75} />}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-text-heading">{settingsForm.isPrivate ? "Private network" : "Public network"}</p>
                        <p className="eyebrow tabular text-text-body/55 mt-0.5">{settingsForm.isPrivate ? "Invite or approval required" : "Open to all members"}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.isPrivate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, isPrivate: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border-main rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-bg-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-text-heading" />
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
                    <button type="button" onClick={() => setActiveTab("feed")} className="px-4 py-2.5 text-[13px] text-text-body hover:text-text-heading">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                      Save settings
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReportModalOpen(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <form onSubmit={handleReport}>
                <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                  <div>
                    <p className="eyebrow tabular text-rust">FLAG CONTENT</p>
                    <h2 className="font-display text-2xl text-text-heading mt-1">Report this post</h2>
                  </div>
                  <button type="button" onClick={() => setReportModalOpen(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6">
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Reason</span>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Why are you reporting this post?"
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading h-28 resize-none transition-all"
                    />
                  </label>
                </div>
                <div className="px-6 py-4 border-t border-border-main flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setReportModalOpen(false)} className="px-4 py-2.5 text-[13px] text-text-body hover:text-text-heading">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason.trim() || submittingReport}
                    className="inline-flex items-center gap-2 bg-rust text-white px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {submittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" strokeWidth={1.75} />}
                    Submit report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {shareModalOpen && sharePost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShareModalOpen(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                <div>
                  <p className="eyebrow tabular text-text-body/55">Distribute</p>
                  <h2 className="font-display text-2xl text-text-heading mt-1">Share this post</h2>
                </div>
                <button onClick={() => setShareModalOpen(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Internal share */}
                {myGroups.length > 0 && (
                  <div>
                    <p className="eyebrow tabular text-text-body/55 mb-2 flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Share to one of your groups
                    </p>
                    <select
                      value={sharingToGroup || ""}
                      onChange={(e) => setSharingToGroup(e.target.value || null)}
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all mb-3"
                    >
                      <option value="">— Choose a group —</option>
                      {myGroups.filter((g: any) => g.id !== groupId).map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleInternalShare}
                      disabled={!sharingToGroup || isSharing}
                      className="w-full inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card py-3 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
                      Cross-post
                    </button>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-main" /></div>
                  <p className="relative flex justify-center bg-bg-card eyebrow tabular text-text-body/40 px-3">OR</p>
                </div>

                <div>
                  <p className="eyebrow tabular text-text-body/55 mb-2 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Share externally
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleCopyLink(sharePost.id)} className="col-span-2 border border-border-main py-3 rounded-xl flex items-center justify-center gap-2 hover:border-text-heading hover:bg-bg-main transition-all text-text-heading">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-accent" strokeWidth={2.5} />
                          <span className="text-[13px] font-medium">Link copied</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 text-text-body/50" strokeWidth={1.75} />
                          <span className="text-[13px] font-medium">Copy link</span>
                        </>
                      )}
                    </button>
                    <button onClick={() => shareOnSocial("linkedin")} className="bg-bg-main border border-border-main p-3 rounded-xl flex items-center justify-center gap-2 hover:border-text-heading transition-all">
                      <Linkedin className="w-4 h-4 text-[#0077b5]" strokeWidth={1.75} />
                      <span className="eyebrow tabular text-text-heading">LinkedIn</span>
                    </button>
                    <button onClick={() => shareOnSocial("twitter")} className="bg-bg-main border border-border-main p-3 rounded-xl flex items-center justify-center gap-2 hover:border-text-heading transition-all">
                      <Twitter className="w-4 h-4 text-text-heading" strokeWidth={1.75} />
                      <span className="eyebrow tabular text-text-heading">Twitter</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   RequestCard — pending request review (admin only)
   ============================================================ */
function RequestCard({ request, groupId, onAction }: { request: any; groupId: string; onAction: () => void }) {
  const [updating, setUpdating] = useState(false);

  const handleApprove = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "group_members", `${groupId}_${request.userUid}`), {
        status: "approved",
        role: "member",
        joinedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "groups", groupId), { memberCount: increment(1) });
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
    <div className="bg-bg-card border border-border-main rounded-2xl p-5 flex flex-col items-center text-center hover:border-text-heading transition-all">
      <div className="relative mb-4">
        <img
          src={request.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${request.userName}`}
          className="w-16 h-16 rounded-xl border border-border-main object-cover shadow-md"
          alt=""
        />
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rust text-white border-2 border-bg-card flex items-center justify-center" title="Pending">
          <Clock className="w-3 h-3" strokeWidth={2} />
        </span>
      </div>
      <h3 className="font-display text-lg text-text-heading leading-tight mb-1 truncate w-full">{request.userName}</h3>
      <p className="eyebrow tabular text-text-body/55 mb-1 truncate w-full">{request.userJobTitle || "Member"}</p>
      <p className="eyebrow tabular text-accent mb-5 truncate w-full">{request.userCompany || "—"}</p>

      <div className="w-full flex items-center gap-2 mt-auto">
        <button
          onClick={handleReject}
          disabled={updating}
          className="flex-1 py-2.5 bg-bg-main border border-border-main rounded-xl eyebrow tabular text-text-body hover:text-rust hover:border-rust/30 transition-all"
        >
          Decline
        </button>
        <button
          onClick={handleApprove}
          disabled={updating}
          className="flex-1 py-2.5 bg-text-heading text-bg-card rounded-xl eyebrow tabular hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
        >
          {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
          Approve
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MemberCard — single member tile (with admin controls)
   ============================================================ */
function MemberCard({ uid, role, groupId, isCurrentUserAdmin }: { uid: string; role: string; groupId: string; canManage: boolean; isCurrentUserAdmin: boolean }) {
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) setMemberProfile(snap.data());
    });
  }, [uid]);

  const handleMakeAdmin = async () => {
    if (!isCurrentUserAdmin) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "group_members", `${groupId}_${uid}`), { role: "admin" });
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const admins = groupSnap.data().admins || [];
        if (!admins.includes(uid)) {
          await updateDoc(groupRef, { admins: [...admins, uid] });
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
      await updateDoc(doc(db, "groups", groupId), { memberCount: increment(-1) });
    } finally {
      setUpdating(false);
    }
  };

  if (!memberProfile) return null;

  return (
    <div className="bg-bg-card border border-border-main rounded-2xl p-5 flex flex-col items-center text-center hover:border-text-heading transition-all group">
      <Link to={`/profile/${uid}`} className="relative mb-4">
        <img
          src={memberProfile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${memberProfile.displayName}`}
          className="w-20 h-20 rounded-xl border border-border-main object-cover shadow-md transition-transform group-hover:scale-105"
          alt=""
        />
        <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-bg-card border-2 border-bg-card flex items-center justify-center shadow-md">
          {role === "creator" ? (
            <ShieldCheck className="w-4 h-4 text-accent" strokeWidth={2} />
          ) : role === "admin" ? (
            <ShieldAlert className="w-4 h-4 text-rust" strokeWidth={2} />
          ) : (
            <Users className="w-4 h-4 text-text-body/40" strokeWidth={2} />
          )}
        </span>
      </Link>

      <h3 className="font-display text-lg text-text-heading leading-tight mb-1 truncate w-full">{memberProfile.displayName}</h3>
      {memberProfile.jobTitle && <p className="text-[12px] text-text-body/65 mb-1 truncate w-full">{memberProfile.jobTitle}</p>}
      <p className="eyebrow tabular text-text-body/55 mb-5 truncate w-full">{memberProfile.company || "Independent"}</p>

      <div className="w-full flex items-center gap-2 mt-auto">
        {isCurrentUserAdmin && role !== "creator" && (
          <>
            {role === "member" && (
              <button
                onClick={handleMakeAdmin}
                disabled={updating}
                className="flex-1 py-2.5 bg-bg-main border border-border-main rounded-xl eyebrow tabular text-text-body hover:text-text-heading hover:border-text-heading transition-all"
              >
                Promote
              </button>
            )}
            <button
              onClick={handleRemoveMember}
              disabled={updating}
              className="w-9 h-9 bg-bg-main border border-border-main rounded-xl text-text-body/40 hover:text-rust hover:border-rust/30 flex items-center justify-center transition-all"
              title="Remove from group"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </>
        )}
        <Link
          to={`/profile/${uid}`}
          className="flex-1 py-2.5 bg-text-heading text-bg-card rounded-xl eyebrow tabular hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
        >
          View profile
          <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
