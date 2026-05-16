/**
 * GroupPostCard — single post inside a group feed.
 *
 * Restyled to the new design language. All data wiring preserved verbatim:
 *   - handleLike toggles arrayUnion/arrayRemove on /likes
 *   - handleDelete removes the post (author or admin)
 *   - handleSendComment writes a /comments subdoc and increments commentsCount
 *   - Comments subcollection loaded lazily when the thread opens
 *   - ShareModal preserved
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Flag,
  Trash2,
  Send,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../App";
import { useCollection } from "../hooks/useFirestore";
import ShareModal from "./ShareModal";

interface GroupPostCardProps {
  post: any;
  groupId: string;
  isAdmin: boolean;
  onCommentsToggle: () => void;
}

export default function GroupPostCard({ post, groupId, isAdmin, onCommentsToggle }: GroupPostCardProps) {
  const { user, profile } = useAuth();
  const [activeMenu, setActiveMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [sharingPost, setSharingPost] = useState<any>(null);

  const { data: comments, loading: loadingComments } = useCollection<any>(
    showComments ? `groups/${groupId}/posts/${post.id}/comments` : null,
    [orderBy("createdAt", "asc")],
  );

  const isLiked = post.likes?.includes(user?.uid);

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      const postRef = doc(db, `groups/${groupId}/posts`, post.id);
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid), likesCount: increment(-1) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid), likesCount: increment(1) });
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, `groups/${groupId}/posts`, post.id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || postingComment) return;
    setPostingComment(true);
    try {
      await addDoc(collection(db, `groups/${groupId}/posts/${post.id}/comments`), {
        content: newComment,
        authorUid: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL,
        authorJobTitle: profile?.jobTitle || "Member",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, `groups/${groupId}/posts`, post.id), { commentsCount: increment(1) });
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <motion.div
      layout
      className="group bg-bg-card border border-border-main rounded-2xl overflow-hidden hover:border-text-heading transition-all"
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={post.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`}
            className="w-11 h-11 rounded-xl border border-border-main object-cover shrink-0"
            alt=""
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-[15px] text-text-heading leading-tight truncate">{post.authorName}</h3>
              {post.companyId && (
                <span className="inline-flex items-center gap-1 eyebrow tabular bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">
                  <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2} />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {post.authorJobTitle && (
                <p className="eyebrow tabular text-text-body/65">{post.authorJobTitle}</p>
              )}
              <span className="eyebrow tabular text-text-body/40">·</span>
              <p className="eyebrow tabular text-text-body/45">
                {post.createdAt?.seconds ? formatDistanceToNow(post.createdAt.seconds * 1000) + " ago" : "Just now"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setActiveMenu(!activeMenu)}
            className="p-2 text-text-body/45 hover:text-text-heading hover:bg-bg-main rounded-lg transition-all"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <AnimatePresence>
            {activeMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 6 }}
                  className="absolute right-0 mt-2 w-44 bg-bg-card border border-border-main rounded-xl shadow-xl z-30 overflow-hidden"
                >
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-text-body hover:bg-bg-main hover:text-rust transition-all">
                    <Flag className="w-3.5 h-3.5" strokeWidth={1.75} /> Report post
                  </button>
                  {(user?.uid === post.authorUid || isAdmin) && (
                    <button
                      onClick={handleDelete}
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
        <p className="text-[15px] text-text-body whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {post.video && (
          <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-bg-main border border-border-main">
            {post.video.type === "youtube" ? (
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${post.video.id}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : (
              <iframe src={`https://player.vimeo.com/video/${post.video.id}`} width="100%" height="100%" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            )}
          </div>
        )}

        {post.image && (
          <div className="mt-4 rounded-xl overflow-hidden border border-border-main bg-bg-main">
            <img src={post.image} className="w-full object-cover max-h-[500px]" alt="Post attachment" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border-main bg-bg-main/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? "text-rust" : "text-text-body/65 hover:text-text-heading"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} strokeWidth={1.75} />
              <span className="eyebrow tabular">{post.likesCount || 0}</span>
            </button>
            <button
              onClick={() => {
                setShowComments(!showComments);
                onCommentsToggle();
              }}
              className="flex items-center gap-2 text-text-body/65 hover:text-text-heading transition-colors"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
              <span className="eyebrow tabular">{post.commentsCount || 0}</span>
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSharingPost(post);
            }}
            className="text-text-body/45 hover:text-text-heading transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Comments thread */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border-main space-y-3">
                {loadingComments ? (
                  <p className="py-3 text-center eyebrow tabular text-text-body/40 animate-pulse">LOADING THREAD…</p>
                ) : comments?.length === 0 ? (
                  <p className="py-3 text-center text-[13px] text-text-body/50 italic">No contributions yet — start the thread.</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 text-left">
                      <img
                        src={comment.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`}
                        className="w-8 h-8 rounded-lg border border-border-main object-cover shrink-0"
                        alt=""
                      />
                      <div className="flex-1 bg-bg-card border border-border-main rounded-xl p-3">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text-heading leading-tight truncate">{comment.authorName}</p>
                            {comment.authorJobTitle && (
                              <p className="eyebrow tabular text-text-body/55 mt-0.5">{comment.authorJobTitle}</p>
                            )}
                          </div>
                          <span className="eyebrow tabular text-text-body/40 shrink-0">
                            {comment.createdAt?.seconds ? formatDistanceToNow(comment.createdAt.seconds * 1000) + " ago" : "Just now"}
                          </span>
                        </div>
                        <p className="text-[13px] text-text-body leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}

                <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-2">
                  <img
                    src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || "U"}`}
                    className="w-8 h-8 rounded-lg border border-border-main object-cover shrink-0"
                    alt=""
                  />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Contribute to this discussion…"
                      className="w-full bg-bg-card border border-border-main rounded-xl px-4 py-2.5 pr-11 text-[13px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                      disabled={postingComment}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || postingComment}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-text-heading text-bg-card rounded-lg flex items-center justify-center hover:brightness-110 disabled:opacity-30 transition-all"
                    >
                      {postingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" strokeWidth={1.75} />}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {sharingPost && (
          <ShareModal post={sharingPost} onClose={() => setSharingPost(null)} type="group" groupId={groupId} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
