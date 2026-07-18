/**
 * Home — the Industry Feed.
 *
 * Restyled to the established design language:
 *   - Instrument Serif display headings, mono eyebrows
 *   - Paper-warm canvas, paper-weight borders, no font-black / uppercase tracking-widest
 *   - Safety-orange accent on the verified-business chip, the "TECHNICAL INSIGHT" CTA,
 *     and the "Share insight" submit button (replacing the heavy purple pill)
 *
 * What's preserved verbatim from the previous version:
 *   - Every data hook (useCollection for posts, news)
 *   - The image upload pipeline (uploadImage helper, blob preview, base64 migration)
 *   - handlePost, handleImageUpload, clearPostImage, handleTechnicalTip
 *   - CommentsModal, RepostModal, ReactionPicker subcomponents (restyled)
 *   - The combined posts + news feed, video detection, repost flow,
 *     reaction picker, comment threading, report flow
 */

import { useState, ChangeEvent, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import { TierGate } from "../components/TierGate";
import { useCollection, createDocument, updateDocument, removeDocument } from "../hooks/useFirestore";
import { orderBy, serverTimestamp } from "firebase/firestore";
import { uploadImage, isInlineImage, migrateDataUrlToStorage } from "../lib/uploadImage";
import ReportModal from "../components/ReportModal";
import { GoogleGenAI } from "@google/genai";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Image as ImageIcon,
  Send,
  Repeat2,
  Link as LinkIcon,
  X as CloseIcon,
  Check,
  Flag,
  Play,
  User,
  Building2,
  Trash2,
  Sparkles,
  Loader2,
  Quote,
  Newspaper,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const getVideoInfo = (content: string) => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/\n\s]+\/)?|album\/\d+\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const ytMatch = content.match(youtubeRegex);
  if (ytMatch) return { type: "youtube", id: ytMatch[1] };
  const vimeoMatch = content.match(vimeoRegex);
  if (vimeoMatch) return { type: "vimeo", id: vimeoMatch[1] };
  return null;
};

/* ============================================================
   CommentsModal — restyled discussion drawer
   ============================================================ */
function CommentsModal({ post, onClose, setReportingItem }: { post: any; onClose: () => void; setReportingItem: (item: any) => void }) {
  const { user, profile } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [quotingComment, setQuotingComment] = useState<any>(null);
  const { data: comments, loading } = useCollection<any>(`posts/${post.id}/comments`, [orderBy("createdAt", "asc")]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendNotification = async (type: string) => {
    if (user?.uid === post.authorUid) return;
    let targetEmail = post.authorEmail;
    if (targetEmail) {
      try {
        await axios.post("/api/notify", {
          to: targetEmail,
          type,
          fromUser: user?.displayName,
          postContent: post.content.substring(0, 50) + "...",
        });
      } catch (err) {
        console.error("Notification API failed:", err);
      }
    }
    try {
      await createDocument("notifications", {
        recipientUid: post.authorUid,
        title: type === "comment" ? "New Comment" : "New Reaction",
        message: `${user?.displayName} ${type === "comment" ? "commented on" : "reacted to"} your post: "${post.content.substring(0, 30)}..."`,
        type,
        link: "/",
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Firestore Notification failed:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const commentData: any = {
        content: commentText,
        authorUid: user?.uid,
        authorName: user?.displayName,
        authorPhoto: user?.photoURL,
        authorJobTitle: profile?.jobTitle || "",
      };
      if (quotingComment) {
        commentData.quote = { authorName: quotingComment.authorName, content: quotingComment.content };
      }
      await createDocument(`posts/${post.id}/comments`, commentData);
      await updateDocument("posts", post.id, { commentsCount: (post.commentsCount || 0) + 1 });
      sendNotification("comment");
      setCommentText("");
      setQuotingComment(null);
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-5 py-4 border-b border-border-main flex items-center justify-between sticky top-0 bg-bg-card z-20">
          <div>
            <p className="eyebrow tabular text-text-body/55">Thread</p>
            <h2 className="font-display text-xl text-text-heading">Discussion</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Original post */}
          <div className="flex gap-3 pb-5 border-b border-border-main">
            <img src={post.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`} className="w-9 h-9 rounded-lg border border-border-main shrink-0" alt="" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-text-heading leading-tight">{post.authorName}</p>
              {post.authorJobTitle && <p className="eyebrow tabular text-text-body/55 mt-0.5">{post.authorJobTitle}</p>}
              <p className="text-[14px] text-text-body leading-relaxed mt-2">{post.content}</p>
            </div>
          </div>

          {/* Comments */}
          {loading ? (
            <p className="text-center py-10 eyebrow tabular text-text-body/40 animate-pulse">LOADING CONTRIBUTIONS…</p>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle className="w-8 h-8 text-text-body/25 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-text-body/50 text-[14px]">No comments yet. Start the conversation.</p>
            </div>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`} className="w-8 h-8 rounded-lg border border-border-main shrink-0" alt="" />
                <div className="flex-1 bg-bg-main rounded-xl p-3 border border-border-main">
                  <div className="flex items-start justify-between mb-1.5 gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text-heading leading-tight truncate">{comment.authorName}</p>
                      {comment.authorJobTitle && <p className="eyebrow tabular text-text-body/55 mt-0.5">{comment.authorJobTitle}</p>}
                    </div>
                    <p className="eyebrow tabular text-text-body/40 shrink-0">
                      {comment.createdAt?.seconds ? formatDistanceToNow(comment.createdAt.seconds * 1000) + " ago" : "Just now"}
                    </p>
                  </div>

                  {comment.quote && (
                    <div className="mt-1 mb-2 px-3 py-2 bg-bg-card border-l-2 border-accent rounded-r-lg">
                      <p className="eyebrow tabular text-accent mb-1 flex items-center gap-1">
                        <Quote className="w-3 h-3" strokeWidth={1.75} />
                        {comment.quote.authorName} wrote
                      </p>
                      <p className="text-[12px] italic text-text-body/75 line-clamp-2 leading-relaxed">"{comment.quote.content}"</p>
                    </div>
                  )}
                  <p className="text-[14px] text-text-body leading-relaxed">{comment.content}</p>

                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={() => setQuotingComment(comment)} className="eyebrow tabular text-text-body/40 hover:text-text-heading transition-colors flex items-center gap-1">
                      <Quote className="w-2.5 h-2.5" /> Quote
                    </button>
                    <button onClick={() => setReportingItem({ item: comment, type: "comment", path: `posts/${post.id}/comments/${comment.id}` })} className="eyebrow tabular text-text-body/30 hover:text-rust transition-colors flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5" /> Report
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply composer */}
        <div className="p-4 border-t border-border-main bg-bg-main">
          <AnimatePresence>
            {quotingComment && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mb-3 p-3 bg-bg-card border border-border-main rounded-xl flex items-start gap-3 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-xl" />
                <Quote className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <p className="eyebrow tabular text-accent">REPLYING TO {quotingComment.authorName}</p>
                    <button onClick={() => setQuotingComment(null)} className="p-1 hover:bg-bg-main rounded text-text-body/50">
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[12px] text-text-body/70 italic line-clamp-2">"{quotingComment.content}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-2">
            <img src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || "U"}`} className="w-9 h-9 rounded-lg border border-border-main shrink-0" alt="" />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 bg-bg-card border border-border-main rounded-xl px-4 py-2.5 text-[14px] focus:border-text-heading outline-none transition-colors"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
              />
              <button onClick={handleAddComment} disabled={!commentText.trim() || isSubmitting} className="bg-text-heading text-bg-card p-2.5 rounded-xl disabled:opacity-40 hover:brightness-110 transition-all" aria-label="Send comment">
                <Send className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   RepostModal — restyled share & repost surface
   ============================================================ */
function RepostModal({ post, onClose }: { post: any; onClose: () => void }) {
  const { user, profile } = useAuth();
  const [repostText, setRepostText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isReposting, setIsReposting] = useState(false);

  const handleRepost = async () => {
    if (isReposting) return;
    setIsReposting(true);
    try {
      const repostData: any = {
        content: repostText.trim() ? `${repostText}\n\n--- Reposted ---\n${post.content}` : post.content,
        authorUid: user?.uid,
        authorName: user?.displayName || "Anonymous",
        authorJobTitle: profile?.jobTitle || "",
        likesCount: 0,
        commentsCount: 0,
        isRepost: true,
        originalAuthor: post.authorName,
      };
      if (user?.photoURL) repostData.authorPhoto = user.photoURL;
      await createDocument("posts", repostData);
      onClose();
    } catch (err: any) {
      console.error("Repost error:", err);
      alert("Failed to repost. Please check your permissions and try again.");
    } finally {
      setIsReposting(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/post/${post.id || "id"}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareOnSocial = (platform: string) => {
    const link = `${window.location.origin}/post/${post.id || "id"}`;
    const text = encodeURIComponent(post.content.substring(0, 100) + "...");
    let url = "";
    switch (platform) {
      case "twitter": url = `https://twitter.com/intent/tweet?url=${link}&text=${text}`; break;
      case "linkedin": url = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`; break;
      case "facebook": url = `https://www.facebook.com/sharer/sharer.php?u=${link}`; break;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-main flex items-center justify-between">
          <div>
            <p className="eyebrow tabular text-text-body/55">Distribute</p>
            <h2 className="font-display text-xl text-text-heading">Share this post</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Repost */}
          <div>
            <p className="eyebrow tabular text-text-body/55 mb-2 flex items-center gap-2">
              <Repeat2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Repost to your feed
            </p>
            <textarea
              value={repostText}
              onChange={(e) => setRepostText(e.target.value)}
              placeholder="Add a comment (optional)…"
              className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-[14px] focus:border-text-heading outline-none h-20 resize-none transition-colors text-text-body placeholder:text-text-body/40"
            />
            <div className="mt-2 p-3 bg-bg-main border border-border-main rounded-lg italic text-[12px] text-text-body/65 line-clamp-2">
              "{post.content}"
            </div>
            <button onClick={handleRepost} disabled={isReposting} className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card py-3 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all">
              {isReposting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sharing…</> : <>Repost <Send className="w-4 h-4" strokeWidth={1.75} /></>}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-main" /></div>
            <p className="relative flex justify-center bg-bg-card eyebrow tabular text-text-body/40 px-3">OR</p>
          </div>

          {/* External share */}
          <div>
            <p className="eyebrow tabular text-text-body/55 mb-2 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5" strokeWidth={1.75} /> Share externally
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={copyLink} className="col-span-2 border border-border-main py-3 rounded-xl flex items-center justify-center gap-2 hover:border-text-heading hover:bg-bg-main transition-all text-text-heading">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-accent" />
                    <span className="text-[13px] font-medium">Link copied</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 text-text-body/50" strokeWidth={1.75} />
                    <span className="text-[13px] font-medium">Copy link</span>
                  </>
                )}
              </button>
              <button onClick={() => shareOnSocial("linkedin")} className="bg-bg-main border border-border-main p-3 rounded-xl flex items-center justify-center gap-2 hover:border-text-heading transition-all">
                <div className="w-6 h-6 bg-[#0077b5] rounded-md flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </div>
                <span className="eyebrow tabular text-text-heading">LinkedIn</span>
              </button>
              <button onClick={() => shareOnSocial("twitter")} className="bg-bg-main border border-border-main p-3 rounded-xl flex items-center justify-center gap-2 hover:border-text-heading transition-all">
                <div className="w-6 h-6 bg-ink rounded-md flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </div>
                <span className="eyebrow tabular text-text-heading">Twitter</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   ReactionPicker — restyled reactions cluster
   ============================================================ */
function ReactionPicker({ post }: { post: any }) {
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const reactions = post.reactions || { like: 0, celebrate: 0, insightful: 0 };
  const totalReactions = (post.likesCount || 0) + Object.values(reactions).reduce((a: any, b: any) => a + b, 0);

  const handleReact = async (type: string) => {
    try {
      const newReactions = { ...reactions };
      newReactions[type] = (newReactions[type] || 0) + 1;
      await updateDocument("posts", post.id, {
        reactions: newReactions,
        likesCount: (post.likesCount || 0) + 1,
      });
      setShowPicker(false);
      if (user?.uid !== post.authorUid) {
        try {
          await createDocument("notifications", {
            recipientUid: post.authorUid,
            title: "Post Engagement",
            message: `${user?.displayName} reacted to your post.`,
            type: "reaction",
            link: "/",
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Reaction notification failed:", err);
        }
      }
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  return (
    <div className="relative" onMouseEnter={() => setShowPicker(true)} onMouseLeave={() => setShowPicker(false)}>
      <button className="flex items-center gap-2 text-text-body/65 hover:text-text-heading transition-colors py-1">
        <Heart className="w-4 h-4" strokeWidth={1.75} />
        <span className="eyebrow tabular">{totalReactions}</span>
      </button>
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: -45, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute left-0 bg-bg-card border border-border-main rounded-full py-1.5 px-3 shadow-xl flex items-center gap-2 z-20"
          >
            {[
              { label: "Like", emoji: "👍", type: "like" },
              { label: "Celebrate", emoji: "🎉", type: "celebrate" },
              { label: "Insight", emoji: "💡", type: "insightful" },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => handleReact(r.type)}
                className="hover:scale-125 transition-transform text-lg"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Home — the feed page
   ============================================================ */
export default function Home() {
  const MAX_POST_CHARS = 2500;
  const { user, profile, isAdmin, ownedCompanies, tier } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postAsCompanyId, setPostAsCompanyId] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<any>(null);
  const [viewingCommentsPost, setViewingCommentsPost] = useState<any>(null);
  const [reportingItem, setReportingItem] = useState<{ item: any; type: string; path: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  const postConstraints = useMemo(() => [orderBy("createdAt", "desc")], []);
  const newsConstraints = useMemo(() => [orderBy("createdAt", "desc")], []);

  useEffect(() => {
    if (ownedCompanies.length === 1 && !postAsCompanyId) {
      setPostAsCompanyId(ownedCompanies[0].id);
    }
  }, [ownedCompanies]);

  const { data: posts, loading: loadingPosts } = useCollection<any>("posts", postConstraints);
  const { data: news, loading: loadingNews } = useCollection<any>("news", newsConstraints);

  const loading = loadingPosts || loadingNews;

  const combinedFeed = useMemo(() => {
    const all = [
      ...(posts || []).map((p) => ({ ...p, type: "post" })),
      ...(news || []).map((n) => ({ ...n, type: "news" })),
    ];
    return all.sort((a, b) => {
      const getTimestamp = (item: any) => {
        if (item.createdAt?.seconds) return item.createdAt.seconds;
        if (item.createdAt instanceof Date) return item.createdAt.getTime() / 1000;
        if (typeof item.createdAt === "string") return new Date(item.createdAt).getTime() / 1000;
        return Date.now() / 1000;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [posts, news]);

  const videoPreview = useMemo(() => getVideoInfo(newPost), [newPost]);

  // -------- handlers (preserved from previous version) --------
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handlePost = async () => {
    if ((!newPost.trim() && !postImageFile) || isPosting) return;
    setIsPosting(true);
    const videoInfo = getVideoInfo(newPost);
    const selectedCompany = ownedCompanies.find((c) => c.id === postAsCompanyId);

    try {
      if (!user) throw new Error("Must be logged in to share post");

      let uploadedImageUrl: string | null = null;
      if (postImageFile) {
        try {
          uploadedImageUrl = await uploadImage(postImageFile, { folder: "posts" });
        } catch (uploadErr: any) {
          throw new Error(`Image upload failed: ${uploadErr?.message || uploadErr}`);
        }
      }

      let authorPhotoSafe: string | null = selectedCompany ? selectedCompany.logo : (profile?.photoURL || user.photoURL || null);
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
        content: newPost,
        authorUid: user.uid,
        authorName: selectedCompany ? selectedCompany.name : (profile?.displayName || user.displayName || "Anonymous"),
        authorEmail: user.email || null,
        authorPhoto: authorPhotoSafe,
        authorJobTitle: selectedCompany ? `${selectedCompany.name} Admin` : (profile?.jobTitle || "Professional"),
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

      // Sanitised diagnostic
      const debugPayload = Object.fromEntries(
        Object.entries(postData).map(([k, v]) => [
          k,
          typeof v === "string" && v.length > 120 ? `${v.slice(0, 120)}…(${v.length} chars)` : v,
        ]),
      );
      console.log("[post] creating with payload:", debugPayload);

      const result = await createDocument("posts", postData);
      if (!result) throw new Error("The server rejected the post. Please check your profile is complete and try again.");
      setNewPost("");
      clearPostImage();
    } catch (error: any) {
      console.error("Post creation failed:", error);
      const msg = error?.message || "Unknown error";
      const isPermissionError = msg.includes("PERMISSION_DENIED") || msg.includes("insufficient permissions");
      alert(isPermissionError ? "Permission denied. Please ensure your profile is fully set up." : `Failed to share post: ${msg}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleTechnicalTip = async () => {
    if (!newPost.trim() || isGeneratingTip) return;
    const isCompanyUser = !!profile?.companyId;
    const canUseAI = profile?.isPro || isCompanyUser || isAdmin;
    if (!canUseAI) {
      alert("Technical Insight is a premium feature available for Pro members and Verified Company profiles.");
      return;
    }
    const currentMonth = format(new Date(), "yyyy-MM");
    const usage = profile?.aiUsage?.month === currentMonth ? profile?.aiUsage?.count : 0;
    const MAX_FREE_TIPS = isAdmin ? 9999 : 10;
    if (usage >= MAX_FREE_TIPS) {
      alert(`Monthly limit reached (${MAX_FREE_TIPS} insights). Pro limits reset at the start of next month.`);
      return;
    }
    setIsGeneratingTip(true);
    try {
      const ggenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ggenAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a technical editor for an industrial networking platform focused on tank storage and logistics.
        Take the following draft post and enhance it by adding a concise, professional technical "industry insight" or "tip" that makes the content more valuable to industry peers.
        Ensure the output is one cohesive professional post.

        Draft: "${newPost}"`,
      });
      const generated = response.text;
      if (generated) {
        setNewPost(generated.trim());
        await updateDocument("users", user!.uid, { aiUsage: { month: currentMonth, count: usage + 1 } });
      }
    } catch (err) {
      console.error("Gemini error:", err);
    } finally {
      setIsGeneratingTip(false);
    }
  };

  /* ---------------- Render ---------------- */
  const currentIdentityLogo = postAsCompanyId
    ? ownedCompanies.find((c) => c.id === postAsCompanyId)?.logo
    : user?.photoURL;
  const currentIdentityName = postAsCompanyId
    ? ownedCompanies.find((c) => c.id === postAsCompanyId)?.name
    : profile?.displayName || user?.displayName;

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10 px-4">
      {/* Page heading */}
      {(
        <div className="mb-8 md:mb-10">
          <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
            OPERATIONS FEED · LIVE
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-text-heading leading-[1.0]">The industry feed.</h1>
          <p className="text-text-body text-[14px] mt-3 max-w-md">
            Technical updates, sector news and peer insights — moderated for verified members.
          </p>
        </div>
      )}

      {/* Composer — participation requires B+ (verified member) */}
      {(tier === "A") ? (
        <div className="mb-8"><TierGate requiredTier="B" /></div>
      ) : (
      <div className="bg-bg-card border border-border-main rounded-2xl p-5 md:p-6 mb-8 transition-shadow focus-within:shadow-[0_8px_30px_-8px_rgba(11,27,43,0.12)]">
        {/* Identity toggle (Individual / verified companies) */}
        {(isAdmin || ownedCompanies.length > 0) && (
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
                {co.logo ? (
                  <img src={co.logo} className="w-3 h-3 rounded-sm object-contain" alt="" />
                ) : (
                  <Building2 className="w-3 h-3" strokeWidth={1.75} />
                )}
                {co.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 md:gap-4">
          <img
            src={currentIdentityLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${currentIdentityName}`}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-border-main object-cover shrink-0"
            alt="Identity"
          />
          <div className="flex-1 space-y-2">
            <div className="relative">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value.slice(0, MAX_POST_CHARS))}
                placeholder="Share a technical update…"
                className="w-full bg-bg-main border border-border-main rounded-xl p-4 text-[14px] focus:bg-bg-card focus:border-text-heading outline-none transition-all resize-none h-24 md:h-32 placeholder:text-text-body/40 leading-relaxed"
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
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoPreview.id}?controls=0`} title="Video Preview" frameBorder="0" className="pointer-events-none" />
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
                  onClick={clearPostImage}
                  className="absolute -top-2 -right-2 bg-ink text-white p-1.5 rounded-full shadow-lg hover:bg-rust transition-colors"
                  aria-label="Remove image"
                >
                  <CloseIcon className="w-3 h-3" />
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
              onClick={handleTechnicalTip}
              disabled={!newPost.trim() || isGeneratingTip}
              className="flex items-center gap-2 eyebrow tabular text-text-body/65 hover:text-text-heading px-2.5 py-2 hover:bg-bg-main rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isGeneratingTip ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />}
              <span>Technical Insight</span>
            </button>
          </div>
          <button
            onClick={handlePost}
            disabled={(!newPost.trim() && !postImage) || isPosting}
            className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-30 transition-all"
          >
            {isPosting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sharing…</> : <>Share insight <Send className="w-4 h-4" strokeWidth={1.75} /></>}
          </button>
        </div>
      </div>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-card border border-border-main rounded-2xl animate-pulse p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-lg bg-bg-main" />
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-3 bg-bg-main rounded w-1/4" />
                    <div className="h-2 bg-bg-main rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-bg-main rounded w-full" />
                  <div className="h-3 bg-bg-main rounded w-5/6" />
                </div>
                <div className="h-32 bg-bg-main rounded-xl" />
              </div>
            ))
          : combinedFeed.map((item: any) => {
              if (item.type === "news") {
                return (
                  <motion.a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block group bg-bg-card border border-border-main rounded-2xl overflow-hidden hover:border-text-heading transition-all"
                  >
                    <div className="flex flex-col md:flex-row">
                      {item.image && (
                        <div className="md:w-1/3 aspect-video md:aspect-auto overflow-hidden bg-bg-main border-b md:border-b-0 md:border-r border-border-main">
                          <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        </div>
                      )}
                      <div className={`p-5 flex-1 flex flex-col ${!item.image ? "md:p-6" : ""}`}>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 bg-bg-main border border-border-main text-text-body px-2 py-0.5 rounded eyebrow tabular">
                            <Newspaper className="w-3 h-3" strokeWidth={1.75} />
                            {item.source || "News"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-2 py-0.5 rounded eyebrow tabular border border-accent/20">
                            Official update
                          </span>
                        </div>
                        <h3 className="font-display text-xl text-text-heading mb-2 leading-tight group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[14px] text-text-body/85 line-clamp-3 mb-5 leading-relaxed">{item.description}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="eyebrow tabular text-text-body/50 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" strokeWidth={1.75} />
                            {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) + " ago" : "Just now"}
                          </span>
                          <span className="eyebrow tabular text-text-heading flex items-center gap-1.5 group-hover:text-accent transition-colors">
                            Read more <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                );
              }

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.id}
                  className="group bg-bg-card border border-border-main rounded-2xl overflow-hidden hover:border-text-heading transition-all"
                >
                  {/* Card header */}
                  <div className="px-5 py-4 flex items-center justify-between">
                    <Link to={`/profile/${item.authorUid}`} className="flex items-center gap-3 min-w-0 group/author">
                      <img
                        src={item.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${item.authorName}`}
                        className="w-11 h-11 rounded-xl border border-border-main object-cover shrink-0"
                        alt=""
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-[15px] text-text-heading leading-tight group-hover/author:text-accent transition-colors truncate">
                            {item.authorName}
                          </h3>
                          {item.companyId && (
                            <span className="inline-flex items-center gap-1 eyebrow tabular bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">
                              <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2} />
                              Verified
                            </span>
                          )}
                          {item.isRepost && (
                            <span className="inline-flex items-center gap-1 eyebrow tabular bg-bg-main border border-border-main text-text-body/60 px-1.5 py-0.5 rounded">
                              <Repeat2 className="w-2.5 h-2.5" strokeWidth={1.75} />
                              from {item.originalAuthor}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {item.authorJobTitle && (
                            <p className="eyebrow tabular text-text-body/65">{item.authorJobTitle}</p>
                          )}
                          <span className="eyebrow tabular text-text-body/40">·</span>
                          <p className="eyebrow tabular text-text-body/45">
                            {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) + " ago" : "Just now"}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        className="p-2 text-text-body/45 hover:text-text-heading hover:bg-bg-main rounded-lg transition-all"
                        aria-label="More"
                      >
                        <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                      <AnimatePresence>
                        {activeMenu === item.id && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.96, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96, y: 6 }}
                              className="absolute right-0 mt-2 w-44 bg-bg-card border border-border-main rounded-xl shadow-xl z-30 overflow-hidden"
                            >
                              <button
                                onClick={() => {
                                  setReportingItem({ item, type: "post", path: `posts/${item.id}` });
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-text-body hover:bg-bg-main hover:text-rust transition-all"
                              >
                                <Flag className="w-3.5 h-3.5" strokeWidth={1.75} /> Report post
                              </button>
                              {(user?.uid === item.authorUid || isAdmin) && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm("Remove this post?")) {
                                      try {
                                        await removeDocument("posts", item.id);
                                      } catch (err) {
                                        console.error("Delete error:", err);
                                      }
                                      setActiveMenu(null);
                                    }
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-rust hover:bg-rust/5 transition-all border-t border-border-main"
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Delete post
                                </button>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-5 pb-4">
                    <p className="text-[15px] text-text-body whitespace-pre-wrap leading-relaxed">{item.content}</p>

                    {item.video && (
                      <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-bg-main border border-border-main">
                        {item.video.type === "youtube" ? (
                          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${item.video.id}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                        ) : (
                          <iframe src={`https://player.vimeo.com/video/${item.video.id}`} width="100%" height="100%" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                        )}
                      </div>
                    )}

                    {item.image && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-border-main bg-bg-main">
                        <img src={item.image} className="w-full object-cover max-h-[500px]" alt="Insight attachment" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-border-main bg-bg-main/40 flex flex-col gap-2">
                    {item.reactions && Object.values(item.reactions).some((v) => (v as number) > 0) && (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {item.reactions.like > 0 && <span className="bg-bg-card border border-border-main rounded-full px-1 py-0.5 text-[10px] z-10">👍</span>}
                          {item.reactions.celebrate > 0 && <span className="bg-bg-card border border-border-main rounded-full px-1 py-0.5 text-[10px] z-[5]">🎉</span>}
                          {item.reactions.insightful > 0 && <span className="bg-bg-card border border-border-main rounded-full px-1 py-0.5 text-[10px]">💡</span>}
                        </div>
                        <p className="eyebrow tabular text-text-body/60">
                          {Object.entries(item.reactions)
                            .filter(([, count]) => (count as number) > 0)
                            .map(([type, count]) => `${count} ${type}${(count as number) > 1 ? "s" : ""}`)
                            .join(" · ")}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <ReactionPicker post={item} />
                        <button
                          onClick={() => setViewingCommentsPost(item)}
                          className="flex items-center gap-2 text-text-body/65 hover:text-text-heading transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                          <span className="eyebrow tabular">{item.commentsCount || 0}</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setSharingPost(item)}
                        className="flex items-center gap-2 text-text-body/45 hover:text-text-heading transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      <AnimatePresence>
        {sharingPost && <RepostModal post={sharingPost} onClose={() => setSharingPost(null)} />}
        {viewingCommentsPost && <CommentsModal post={viewingCommentsPost} onClose={() => setViewingCommentsPost(null)} setReportingItem={setReportingItem} />}
        {reportingItem && <ReportModal item={reportingItem.item} type={reportingItem.type} path={reportingItem.path} onClose={() => setReportingItem(null)} />}
      </AnimatePresence>
    </div>
  );
}
