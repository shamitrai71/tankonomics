/**
 * PostDetail — single post / forum topic / group post view.
 *
 * Restyled. Routing-based content type detection and Firestore paths preserved
 * verbatim (forum_topics use /posts subcollection; everything else uses
 * /comments). Comment count increment logic preserved.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  orderBy,
  serverTimestamp,
  addDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { useCollection } from "../hooks/useFirestore";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  Clock,
  Flag,
  Send,
  Loader2,
  FileQuestion,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "../components/ShareModal";
import ReportModal from "../components/ReportModal";

export default function PostDetail() {
  const { postId, topicId, groupId } = useParams<{ postId?: string; topicId?: string; groupId?: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const contentType = topicId ? "forum" : groupId ? "group" : "post";
  const isForumTopic = !!topicId;
  const isGroupPost = !!groupId && !!postId;

  const basePath = isForumTopic ? "forum_topics" : isGroupPost ? `groups/${groupId}/posts` : "posts";
  const actualId = topicId || postId;
  const threadSubcollection = isForumTopic ? "posts" : "comments";

  useEffect(() => {
    if (!actualId) return;
    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, basePath, actualId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [actualId, basePath]);

  const { data: comments, loading: loadingComments } = useCollection<any>(
    content ? `${basePath}/${content.id}/${threadSubcollection}` : "",
    content ? [orderBy("createdAt", "asc")] : [],
    !!content,
  );

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || postingComment || !content) return;

    setPostingComment(true);
    try {
      await addDoc(collection(db, `${basePath}/${content.id}/${threadSubcollection}`), {
        ...(isForumTopic ? { topicId: content.id } : {}),
        content: newComment.trim(),
        authorUid: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL,
        authorJobTitle: profile?.jobTitle || "Network Peer",
        createdAt: serverTimestamp(),
      });

      const contentRef = doc(db, basePath, content.id);
      await updateDoc(
        contentRef,
        isForumTopic
          ? { replyCount: increment(1), updatedAt: serverTimestamp() }
          : { commentsCount: increment(1) },
      );

      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="w-10 h-10 border-2 border-text-heading border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-bg-card border border-border-main rounded-2xl flex items-center justify-center mb-6 text-text-heading">
          <FileQuestion className="w-7 h-7" strokeWidth={1.75} />
        </div>
        <p className="eyebrow tabular text-accent mb-2">404 · NOT FOUND</p>
        <h2 className="font-display text-3xl text-text-heading mb-2">Content not found</h2>
        <p className="text-text-body mb-6 text-[14px]">This post may have been archived or removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-text-body/55 hover:text-text-heading transition-colors mb-8 group"
        >
          <span className="w-8 h-8 rounded-lg bg-bg-card border border-border-main flex items-center justify-center group-hover:bg-text-heading group-hover:text-bg-card group-hover:border-text-heading transition-all">
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          </span>
          <span className="eyebrow tabular">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card border border-border-main rounded-2xl overflow-hidden"
        >
          <div className="p-7">
            {/* Author header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={content.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${content.authorName}`}
                  className="w-12 h-12 rounded-xl border border-border-main object-cover shrink-0"
                  alt=""
                />
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-text-heading leading-tight truncate">{content.authorName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {content.authorJobTitle && (
                      <p className="eyebrow tabular text-text-body/55">{content.authorJobTitle}</p>
                    )}
                    <span className="eyebrow tabular text-text-body/40">·</span>
                    <p className="eyebrow tabular text-text-body/45 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={1.75} />
                      {content.createdAt?.seconds ? formatDistanceToNow(content.createdAt.seconds * 1000) + " ago" : "Just now"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2 text-text-body/40 hover:text-rust hover:bg-rust/5 rounded-lg transition-all"
                title="Report"
              >
                <Flag className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Title (if present — forum topics have title) */}
            {content.title && (
              <h1 className="font-display text-3xl text-text-heading mb-5 leading-tight">{content.title}</h1>
            )}

            {/* Body */}
            <div className="mb-8">
              <p className="text-[15px] text-text-body leading-relaxed whitespace-pre-wrap">{content.content}</p>
            </div>

            {content.image && (
              <div className="rounded-xl overflow-hidden border border-border-main bg-bg-main mb-8">
                <img src={content.image} className="w-full object-cover max-h-[600px]" alt="" />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-border-main">
              <div className="flex items-center gap-5">
                <button className="inline-flex items-center gap-2 text-text-body/55 hover:text-text-heading transition-colors">
                  <Heart className="w-4 h-4" strokeWidth={1.75} />
                  <span className="eyebrow tabular">{content.likesCount || 0} HELPFUL</span>
                </button>
                <div className="inline-flex items-center gap-2 text-text-body/55">
                  <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                  <span className="eyebrow tabular">{comments.length} {comments.length === 1 ? "REPLY" : "REPLIES"}</span>
                </div>
              </div>
              <button
                onClick={() => setShareModalOpen(true)}
                className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-4 py-2 rounded-xl text-[13px] font-medium hover:brightness-110 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                Share
              </button>
            </div>
          </div>

          {/* Thread */}
          <div className="bg-bg-main p-7 border-t border-border-main">
            <p className="eyebrow tabular text-text-body/55 mb-5">Technical thread</p>

            <div className="space-y-3 mb-6">
              {loadingComments ? (
                <div className="py-12 text-center eyebrow tabular text-text-body/40 animate-pulse">LOADING THREAD…</div>
              ) : comments.length === 0 ? (
                <div className="py-10 text-center bg-bg-card rounded-2xl border border-dashed border-border-main">
                  <MessageCircle className="w-8 h-8 text-text-body/25 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-text-body/55 text-[14px]">No contributions yet. Be the first.</p>
                </div>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`}
                      className="w-9 h-9 rounded-lg border border-border-main object-cover shrink-0"
                      alt=""
                    />
                    <div className="flex-1 bg-bg-card border border-border-main rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-text-heading leading-tight truncate">{comment.authorName}</p>
                          {comment.authorJobTitle && (
                            <p className="eyebrow tabular text-text-body/55 mt-0.5">{comment.authorJobTitle}</p>
                          )}
                        </div>
                        <span className="eyebrow tabular text-text-body/40 shrink-0">
                          {comment.createdAt?.seconds ? formatDistanceToNow(comment.createdAt.seconds * 1000) + " ago" : "Just now"}
                        </span>
                      </div>
                      <p className="text-[14px] text-text-body leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="flex gap-3 items-start">
              <img
                src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || "U"}`}
                className="w-9 h-9 rounded-lg border border-border-main object-cover shrink-0"
                alt=""
              />
              <div className="flex-1 space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your insight to this discussion…"
                  className="w-full bg-bg-card border border-border-main rounded-xl p-4 text-[14px] text-text-heading placeholder:text-text-body/40 h-28 focus:border-text-heading outline-none transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || postingComment}
                    className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
                    Post contribution
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {shareModalOpen && (
          <ShareModal post={content} onClose={() => setShareModalOpen(false)} type={contentType} groupId={groupId} />
        )}
        {reportModalOpen && (
          <ReportModal
            item={content}
            type={contentType}
            path={`${basePath}/${content.id}`}
            onClose={() => setReportModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
