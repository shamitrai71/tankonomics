import { useState, ChangeEvent, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import { DynamicContent } from "../components/DynamicContent";
import { useCollection, createDocument, updateDocument, removeDocument } from "../hooks/useFirestore";
import { orderBy, where, serverTimestamp } from "firebase/firestore";
import { uploadImage } from "../lib/uploadImage";
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
  AlertTriangle,
  Play,
  User,
  Building2,
  Trash2,
  Sparkles,
  Loader2,
  Quote,
  Newspaper,
  Clock,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "../components/ShareModal";

import axios from "axios";

const getVideoInfo = (content: string) => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/\n\s]+\/)?|album\/\d+\/video\/|video\/|)(\d+)(?:$|\/|\?)/;

  const ytMatch = content.match(youtubeRegex);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] };

  const vimeoMatch = content.match(vimeoRegex);
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };

  return null;
};
 
 function CommentsModal({ post, onClose, setReportingItem }: { post: any; onClose: () => void; setReportingItem: (item: any) => void }) {
   const { user, profile } = useAuth();
   const [commentText, setCommentText] = useState("");
   const [quotingComment, setQuotingComment] = useState<any>(null);
   const { data: comments, loading } = useCollection<any>(`posts/${post.id}/comments`, [orderBy("createdAt", "asc")]);
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const sendNotification = async (type: string) => {
    if (user?.uid === post.authorUid) return;

    // Email notification
    let targetEmail = post.authorEmail;
    if (targetEmail) {
      try {
        await axios.post("/api/notify", {
          to: targetEmail,
          type: type,
          fromUser: user?.displayName,
          postContent: post.content.substring(0, 50) + "..."
        });
      } catch (err) {
        console.error("Notification API failed:", err);
      }
    }

    // Real-time notification
    try {
      await createDocument("notifications", {
        recipientUid: post.authorUid,
        title: type === "comment" ? "New Comment" : "New Reaction",
        message: `${user?.displayName} ${type === "comment" ? "commented on" : "reacted to"} your post: "${post.content.substring(0, 30)}..."`,
        type: type,
        link: "/",
        read: false,
        createdAt: serverTimestamp()
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
         commentData.quote = {
           authorName: quotingComment.authorName,
           content: quotingComment.content
         };
       }

       await createDocument(`posts/${post.id}/comments`, commentData);
       
       // Increment comment count
       await updateDocument("posts", post.id, {
         commentsCount: (post.commentsCount || 0) + 1
       });
       
      // Notify author
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-border-main flex items-center justify-between bg-bg-card sticky top-0 z-20">
          <h2 className="font-bold text-text-heading">Discussion</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-full transition-colors">
            <CloseIcon className="w-5 h-5 text-text-body/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Post Content Summary */}
          <div className="flex gap-3 pb-6 border-b border-border-main/50 text-left">
             <img src={post.authorPhoto} className="w-8 h-8 rounded-full border border-border-main" alt="" />
             <div>
                <p className="text-[10px] font-black text-text-heading uppercase tracking-widest leading-tight">{post.authorName}</p>
                {post.authorJobTitle && (
                  <p className="text-[9px] text-text-body/60 font-medium mb-1">{post.authorJobTitle}</p>
                )}
                <p className="text-sm text-text-body leading-relaxed">{post.content}</p>
             </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-text-body/30 font-bold uppercase text-[10px]">Loading contributions...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-text-body/40 text-sm font-medium italic">No comments yet. Be the first to join the technical discussion.</p>
              </div>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3 text-left">
                  <img src={comment.authorPhoto} className="w-8 h-8 rounded-full border border-border-main" alt="" />
                  <div className="flex-1 bg-bg-main rounded-2xl p-3 border border-border-main/50">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs font-black text-text-heading leading-tight block">{comment.authorName}</span>
                        {comment.authorJobTitle && (
                          <span className="text-[9px] text-text-body/60 font-medium block">{comment.authorJobTitle}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-text-body/30 font-bold uppercase">
                        {comment.createdAt?.seconds ? formatDistanceToNow(comment.createdAt.seconds * 1000) + " ago" : "Just now"}
                      </span>
                    </div>
                    {comment.quote && (
                      <div className="mt-2 mb-3 p-3 bg-bg-card/80 border-l-2 border-primary rounded-r-xl italic text-[11px] text-text-body/70 shadow-sm relative overflow-hidden ring-1 ring-border-main">
                        <div className="absolute top-1 right-2 opacity-10">
                          <Quote className="w-8 h-8 text-primary" />
                        </div>
                        <div className="font-black mb-1 text-primary uppercase tracking-widest text-[9px]">
                          {comment.quote.authorName} wrote:
                        </div>
                        <p className="line-clamp-2 leading-relaxed">"{comment.quote.content}"</p>
                      </div>
                    )}
                    <p className="text-sm text-text-body/90 leading-relaxed font-medium">{comment.content}</p>
                    <div className="mt-2 flex justify-end gap-3">
                      <button 
                        onClick={() => setQuotingComment(comment)}
                        className="text-[9px] font-black uppercase tracking-[0.1em] text-text-body/40 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Quote className="w-2.5 h-2.5" /> Quote
                      </button>
                      <button 
                        onClick={() => setReportingItem({ item: comment, type: "comment", path: `posts/${post.id}/comments/${comment.id}` })}
                        className="text-[9px] font-black uppercase tracking-[0.1em] text-text-body/30 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <Flag className="w-2.5 h-2.5" /> Report
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Comment Input */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <AnimatePresence>
            {quotingComment && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="mb-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400" />
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Quote className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                   <div className="flex items-center justify-between mb-1">
                     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Replying to {quotingComment.authorName}</p>
                     <button 
                       onClick={() => setQuotingComment(null)}
                       className="p-1 hover:bg-white rounded-lg transition-all text-indigo-400 hover:text-indigo-600"
                     >
                       <CloseIcon className="w-4 h-4" />
                     </button>
                   </div>
                   <p className="text-[13px] text-slate-600 italic line-clamp-2 leading-relaxed">"{quotingComment.content}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-3">
            <img src={user?.photoURL || ""} className="w-10 h-10 rounded-full border border-white shadow-sm" alt="" />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a professional comment..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
              />
              <button 
                onClick={handleAddComment}
                disabled={!commentText.trim() || isSubmitting}
                className="bg-slate-900 text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-colors"
                aria-label="Send comment"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

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
        originalAuthor: post.authorName
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
    const link = `${window.location.origin}/post/${post.id || 'id'}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareOnSocial = (platform: string) => {
    const link = `${window.location.origin}/post/${post.id || 'id'}`;
    const text = encodeURIComponent(post.content.substring(0, 100) + "...");
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
      >
        <div className="p-4 border-b border-border-main flex items-center justify-between">
          <h2 className="font-bold text-text-heading">Share Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-full transition-colors">
            <CloseIcon className="w-5 h-5 text-text-body/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Repost Option */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-text-body/40 uppercase tracking-widest">
              <Repeat2 className="w-4 h-4" /> Repost to your feed
            </div>
            <textarea
              value={repostText}
              onChange={(e) => setRepostText(e.target.value)}
              placeholder="What's your take on this? (Optional)"
              className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm focus:bg-bg-card focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none transition-all text-text-body placeholder:text-text-body/30"
            />
            <div className="p-3 bg-bg-main/50 rounded-lg border border-border-main italic text-xs text-text-body/60 line-clamp-2">
              "{post.content}"
            </div>
            <button 
              onClick={handleRepost}
              disabled={isReposting}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              {isReposting ? "Sharing..." : "Repost Now"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-main"></span></div>
            <div className="relative flex justify-center text-xs uppercase font-black text-text-body/20 px-2 bg-bg-card">Or</div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-black text-text-body/40 uppercase tracking-widest">
              <LinkIcon className="w-4 h-4" /> Share externally
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={copyLink}
                className="col-span-2 border-2 border-border-main py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-primary hover:bg-bg-main transition-all group text-text-heading"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-slate-900" />
                    <span>Copy Direct Link</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={() => shareOnSocial('linkedin')}
                className="bg-bg-main border border-border-main p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all group"
              >
                <div className="w-6 h-6 bg-[#0077b5] rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase text-text-heading">LinkedIn</span>
              </button>

              <button 
                onClick={() => shareOnSocial('twitter')}
                className="bg-bg-main border border-border-main p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all group"
              >
                <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase text-text-heading">Twitter</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ReactionPicker({ post }: { post: any }) {
  const { user } = useAuth();
  const { data: users } = useCollection<any>("users");
  const [showPicker, setShowPicker] = useState(false);
  const reactions = post.reactions || { like: 0, celebrate: 0, insightful: 0 };
  const totalReactions = (post.likesCount || 0) + Object.values(reactions).reduce((a: any, b: any) => a + b, 0);

  const handleReact = async (type: string) => {
    try {
      const newReactions = { ...reactions };
      newReactions[type] = (newReactions[type] || 0) + 1;
      
      await updateDocument("posts", post.id, {
        reactions: newReactions,
        likesCount: (post.likesCount || 0) + 1
      });
      setShowPicker(false);

      // Real-time notification for author
      if (user?.uid !== post.authorUid) {
        try {
          await createDocument("notifications", {
            recipientUid: post.authorUid,
            title: "Post Engagement",
            message: `${user?.displayName} reacted to your post.`,
            type: "reaction",
            link: "/",
            read: false,
            createdAt: serverTimestamp()
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
    <div className="relative group/react" onMouseEnter={() => setShowPicker(true)} onMouseLeave={() => setShowPicker(false)}>
      <button className="flex items-center gap-2 text-text-body/60 hover:text-text-heading transition-colors py-1">
        <Heart className="w-5 h-5 group-active/react:scale-125 transition-transform" />
        <span className="text-xs font-black tracking-tight">{totalReactions}</span>
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -45, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 bg-bg-card border border-border-main rounded-full py-1.5 px-3 shadow-xl flex items-center gap-3 z-20"
          >
            {[
              { label: "Like", emoji: "👍", type: "like" },
              { label: "Celebrate", emoji: "🎉", type: "celebrate" },
              { label: "Insight", emoji: "💡", type: "insightful" }
            ].map((r) => (
              <button 
                key={r.label}
                onClick={() => handleReact(r.type)}
                className="hover:scale-150 transition-transform duration-200 text-lg relative group/emoji"
                title={r.label}
              >
                {r.emoji}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-heading text-bg-card text-[10px] py-0.5 px-2 rounded opacity-0 group-hover/emoji:opacity-100 transition-opacity font-bold uppercase whitespace-nowrap">
                  {r.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const MAX_POST_CHARS = 2500;
  const { user, profile, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  // The actual File the user picked, so we can upload it to Storage on submit
  // (rather than embedding base64 in the Firestore document).
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postAsCompanyId, setPostAsCompanyId] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<any>(null);
  const [viewingCommentsPost, setViewingCommentsPost] = useState<any>(null);
  const [reportingItem, setReportingItem] = useState<{ item: any, type: string, path: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  const postConstraints = useMemo(() => [orderBy("createdAt", "desc")], []);
  const newsConstraints = useMemo(() => [orderBy("createdAt", "desc")], []);

  // Auto-select company if only one is owned
  useEffect(() => {
    if (ownedCompanies.length === 1 && !postAsCompanyId) {
      setPostAsCompanyId(ownedCompanies[0].id);
    }
  }, [ownedCompanies]);

  const { data: posts, loading: loadingPosts } = useCollection<any>("posts", postConstraints);
  const { data: news, loading: loadingNews } = useCollection<any>("news", newsConstraints);
  // Fetch home page override
  const { data: homeOverrides } = useCollection<any>("dynamic_pages", [where("slug", "==", "home"), where("published", "==", true)]);
  const homeOverride = homeOverrides[0];
  
  const loading = loadingPosts || loadingNews;

  const combinedFeed = useMemo(() => {
    const all = [
      ...(posts || []).map(p => ({ ...p, type: 'post' })),
      ...(news || []).map(n => ({ ...n, type: 'news' }))
    ];
    return all.sort((a, b) => {
      const getTimestamp = (item: any) => {
        if (item.createdAt?.seconds) return item.createdAt.seconds;
        if (item.createdAt instanceof Date) return item.createdAt.getTime() / 1000;
        if (typeof item.createdAt === 'string') return new Date(item.createdAt).getTime() / 1000;
        return Date.now() / 1000;
      };
      const dateA = getTimestamp(a);
      const dateB = getTimestamp(b);
      return dateB - dateA;
    });
  }, [posts, news]);

  const videoPreview = useMemo(() => getVideoInfo(newPost), [newPost]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Quick client-side validation so the user finds out before they hit "Share"
    if (!file.type.startsWith("image/")) {
      alert("Please pick an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`);
      return;
    }
    // Revoke the previous preview to avoid leaking object URLs
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
    const selectedCompany = ownedCompanies.find(c => c.id === postAsCompanyId);

    try {
      if (!user) throw new Error("Must be logged in to share post");

      // Upload the picked image (if any) to Firebase Storage *first*, then
      // store only the download URL in Firestore. Documents are capped at
      // ~1 MiB so we can't embed base64 image bytes here.
      let uploadedImageUrl: string | null = null;
      if (postImageFile) {
        try {
          uploadedImageUrl = await uploadImage(postImageFile, { folder: "posts" });
        } catch (uploadErr: any) {
          throw new Error(`Image upload failed: ${uploadErr?.message || uploadErr}`);
        }
      }

      const postData: any = {
        content: newPost,
        authorUid: user.uid,
        authorName: selectedCompany ? selectedCompany.name : (profile?.displayName || user.displayName || "Anonymous"),
        authorEmail: user.email || null,
        authorPhoto: selectedCompany ? selectedCompany.logo : (profile?.photoURL || user.photoURL || null),
        authorJobTitle: selectedCompany ? `${selectedCompany.name} Admin` : (profile?.jobTitle || "Professional"),
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

      const result = await createDocument("posts", postData);
      if (!result) throw new Error("The server rejected the post. Please check your profile is complete and try again.");

      setNewPost("");
      clearPostImage();
    } catch (error: any) {
      console.error("Post creation failed:", error);
      const msg = error?.message || "Unknown error";
      const isPermissionError = msg.includes("PERMISSION_DENIED") || msg.includes("insufficient permissions");
      alert(isPermissionError
        ? "Permission denied. Please ensure your profile is fully set up."
        : `Failed to share post: ${msg}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleTechnicalTip = async () => {
    if (!newPost.trim() || isGeneratingTip) return;

    // Check permissions: Must be Pro or associated with a Company
    const isCompanyUser = !!profile?.companyId;
    const canUseAI = profile?.isPro || isCompanyUser || isAdmin;

    if (!canUseAI) {
      alert("Technical Insight is a premium feature available for Pro members and Verified Company profiles.");
      return;
    }

    // Check usage limits (if not admin)
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
        // Update usage count
        await updateDocument("users", user!.uid, {
          aiUsage: {
            month: currentMonth,
            count: usage + 1
          }
        });
      }
    } catch (err) {
      console.error("Gemini error:", err);
    } finally {
      setIsGeneratingTip(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10 px-4">
      {homeOverride ? (
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12"
        >
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{homeOverride.title}</h1>
           <DynamicContent content={homeOverride.content} />
           <div className="h-0.5 w-full bg-slate-100 my-10" />
        </motion.div>
      ) : (
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-text-heading tracking-tightest font-display">Industry Feed</h1>
          <p className="text-text-body font-medium text-xs md:text-sm mt-2">Professional networking for tank storage & logistics.</p>
        </div>
      )}
      
      {/* Post Box */}
      <div className="bg-bg-card border border-border-main rounded-[2rem] p-4 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] mb-8 transition-all focus-within:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)]">
        {(isAdmin || ownedCompanies.length > 0) && (
          <div className="flex items-center gap-2 mb-4 p-1.5 bg-bg-main rounded-xl border border-border-main/50 w-fit">
            <button 
              onClick={() => setPostAsCompanyId(null)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!postAsCompanyId ? 'bg-primary text-white shadow-md' : 'text-text-body/50 hover:text-text-body hover:bg-bg-card'}`}
            >
              <User className="w-3 h-3" />
              Individual
            </button>
            {ownedCompanies.map(co => (
              <button 
                key={co.id}
                onClick={() => setPostAsCompanyId(co.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${postAsCompanyId === co.id ? 'bg-primary text-white shadow-md' : 'text-text-body/50 hover:text-text-body hover:bg-bg-card'}`}
              >
                <img src={co.logo} className="w-3 h-3 rounded-sm object-contain" alt="" />
                {co.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-3 md:gap-4">
          <img 
            src={postAsCompanyId ? ownedCompanies.find(c => c.id === postAsCompanyId)?.logo : (user?.photoURL || "")} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-border-main shadow-sm object-cover shrink-0"
            alt="Identity"
          />
          <div className="flex-1 space-y-2">
            <div className="relative">
              <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value.slice(0, MAX_POST_CHARS))}
                placeholder="Share a technical update..."
                className="w-full bg-bg-main hover:brightness-95 border border-border-main rounded-2xl p-4 text-sm focus:bg-bg-card focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none h-24 md:h-32 placeholder:text-text-body/50 font-medium"
              />
              <div className={`absolute bottom-3 right-3 text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-white/80 backdrop-blur-sm border transition-colors ${
                newPost.length > MAX_POST_CHARS * 0.9 ? "text-red-500 border-red-100" : "text-slate-400 border-slate-100"
              }`}>
                {MAX_POST_CHARS - newPost.length} chars left
              </div>
            </div>

            {videoPreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 group">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                      <Play className="w-8 h-8 text-white fill-current" />
                   </div>
                </div>
                {videoPreview.type === 'youtube' ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoPreview.id}?controls=0`}
                    title="Video Preview"
                    frameBorder="0"
                    className="pointer-events-none"
                  ></iframe>
                ) : (
                  <iframe
                    src={`https://player.vimeo.com/video/${videoPreview.id}?background=1`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="pointer-events-none"
                  ></iframe>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded text-[8px] font-black uppercase text-white tracking-widest z-20">
                  {videoPreview.type} detected
                </div>
              </div>
            )}

            {postImage && (
              <div className="relative inline-block mt-2">
                <img src={postImage} className="max-h-48 rounded-xl border border-slate-200 shadow-sm" alt="Preview" />
                <button
                  onClick={clearPostImage}
                  className="absolute -top-2 -right-2 bg-slate-900 text-white p-1.5 rounded-full shadow-lg hover:bg-red-500 transition-colors"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
           <div className="flex items-center gap-2">
             <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-all px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
               <ImageIcon className="w-4 h-4 text-emerald-500" /> 
               <span>Add Media</span>
               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             </label>
             <button 
                onClick={handleTechnicalTip}
                disabled={!newPost.trim() || isGeneratingTip}
                className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-secondary transition-all px-3 py-2 hover:bg-secondary/5 rounded-lg disabled:opacity-30"
              >
                {isGeneratingTip ? (
                  <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-secondary" /> 
                )}
               <span>Technical Insight</span>
             </button>
           </div>
           <button 
             onClick={handlePost}
             disabled={(!newPost.trim() && !postImage) || isPosting}
             className="bg-primary text-white px-8 py-2.5 rounded-full text-sm font-black shadow-lg hover:brightness-110 hover:translate-y-[-1px] disabled:opacity-20 disabled:translate-y-0 disabled:shadow-none transition-all active:scale-95"
           >
             {isPosting ? "Sharing..." : "Share Insights"}
           </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-8">
        {loading ? (
             [1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-pulse h-72 flex flex-col p-6 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50"></div>
                  <div className="space-y-3 flex-1 pt-1">
                    <div className="h-4 bg-slate-50 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-50 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-slate-100/50 rounded w-full"></div>
                  <div className="h-4 bg-slate-100/50 rounded w-5/6"></div>
                  <div className="h-32 bg-slate-50/50 rounded-xl w-full border border-slate-100/50"></div>
                </div>
              </div>
            ))
        ) : (
          combinedFeed.map((item: any) => {
            if (item.type === 'news') {
              return (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="block group bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    {item.image && (
                      <div className="md:w-1/3 aspect-video md:aspect-auto overflow-hidden bg-bg-main border-b md:border-b-0 md:border-r border-border-main">
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                      </div>
                    )}
                    <div className={`p-6 flex-1 flex flex-col ${!item.image ? "md:p-8" : ""}`}>
                      <div className="flex items-center gap-3 mb-3">
                         <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
                            <Newspaper className="w-3 h-3" />
                         </div>
                         <span className="text-[10px] font-black text-text-body/60 uppercase tracking-[0.2em]">{item.source}</span>
                         <span className="w-1 h-1 rounded-full bg-border-main" />
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Official Update</span>
                      </div>
                      <h3 className="text-lg font-black text-text-heading mb-3 leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-text-body/80 line-clamp-3 mb-6 font-medium leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-text-body/40" />
                            <span className="text-[10px] font-black text-text-body/60 uppercase tracking-widest">
                               {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) + " ago" : "Just now"}
                            </span>
                         </div>
                         <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                           Read Full Insight <ExternalLink className="w-3.5 h-3.5" />
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            }

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                key={item.id} 
                className="group bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300"
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${item.authorName}`} 
                      className="w-11 h-11 rounded-full border border-border-main shadow-sm object-cover" 
                      alt="" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-[15px] text-text-heading leading-tight tracking-tight">
                           {item.authorName}
                           {item.companyId && <span className="ml-2 text-primary font-black text-[10px] uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Building2 className="w-2.5 h-2.5" /> Verified Business</span>}
                         </h3>
                         {item.isRepost && (
                           <span className="flex items-center gap-1 text-[9px] font-black text-text-body/60 uppercase tracking-widest bg-bg-main px-1.5 py-0.5 rounded border border-border-main">
                             <Repeat2 className="w-2.5 h-2.5" /> from {item.originalAuthor}
                           </span>
                         )}
                      </div>
                      {item.authorJobTitle && (
                        <p className="text-[10px] text-text-body font-bold mt-1 uppercase tracking-wider">{item.authorJobTitle}</p>
                      )}
                      <p className="text-[10px] text-text-body/50 mt-1 uppercase tracking-widest font-medium">
                        {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) + " ago" : "Just now"}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                      className="p-2 text-text-body/40 hover:text-text-heading hover:bg-bg-main rounded-full transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {activeMenu === item.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-20" 
                            onClick={() => setActiveMenu(null)}
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-bg-card border border-border-main rounded-2xl shadow-xl z-30 py-2 overflow-hidden"
                          >
                            <button 
                              onClick={() => {
                                setReportingItem({ item: item, type: "post", path: `posts/${item.id}` });
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-text-body hover:bg-bg-main hover:text-red-600 transition-all"
                            >
                              <Flag className="w-4 h-4" /> Report Post
                            </button>
                            {(user?.uid === item.authorUid || isAdmin) && (
                              <button 
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to remove this insight?")) {
                                    try {
                                      await removeDocument("posts", item.id);
                                    } catch (err) {
                                      console.error("Delete error:", err);
                                    }
                                    setActiveMenu(null);
                                  }
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border-t border-border-main"
                              >
                                <Trash2 className="w-4 h-4" /> Delete Post
                              </button>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <p className="text-[15px] text-text-body whitespace-pre-wrap leading-relaxed font-normal tracking-normal">{item.content}</p>
                  
                  {item.video && (
                    <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-bg-main border border-border-main">
                      {item.video.type === 'youtube' ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${item.video.id}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <iframe
                          src={`https://player.vimeo.com/video/${item.video.id}`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  )}

                  {item.image && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-border-main bg-bg-main">
                      <img 
                        src={item.image} 
                        className="w-full object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-700" 
                        alt="Industry Insight" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col px-5 py-4 border-t border-border-main bg-bg-main/30">
                  {/* Reaction Summaries */}
                  {item.reactions && Object.values(item.reactions).some(v => (v as number) > 0) && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-1.5">
                        {item.reactions.like > 0 && <span className="bg-bg-card rounded-full p-1 shadow-sm text-[10px] z-10">👍</span>}
                        {item.reactions.celebrate > 0 && <span className="bg-bg-card rounded-full p-1 shadow-sm text-[10px] z-[5]">🎉</span>}
                        {item.reactions.insightful > 0 && <span className="bg-bg-card rounded-full p-1 shadow-sm text-[10px] z-0">💡</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {Object.entries(item.reactions).map(([type, count]) => (count as number) > 0 && (
                          <span key={type} className="text-[10px] font-black text-text-body/60">
                            {count as number} {type}{ (count as number) > 1 ? 's' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <ReactionPicker post={item} />
                      <button 
                        onClick={() => setViewingCommentsPost(item)}
                        className="flex items-center gap-2 text-text-body/40 hover:text-text-heading transition-colors group/btn"
                      >
                        <MessageCircle className="w-5 h-5 group-hover/btn:fill-bg-main" />
                        <span className="text-xs font-black tracking-tight">{item.commentsCount || 0}</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => setSharingPost(item)}
                      className="text-text-body/30 hover:text-text-heading transition-colors hover:scale-110 active:scale-95 duration-200"
                      title="Share Insight"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {sharingPost && (
          <RepostModal 
            post={sharingPost} 
            onClose={() => setSharingPost(null)} 
          />
        )}
        {viewingCommentsPost && (
          <CommentsModal 
            post={viewingCommentsPost} 
            onClose={() => setViewingCommentsPost(null)} 
            setReportingItem={setReportingItem}
          />
        )}
        {reportingItem && (
          <ReportModal 
            item={reportingItem.item}
            type={reportingItem.type}
            path={reportingItem.path}
            onClose={() => setReportingItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
