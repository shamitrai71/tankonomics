import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Flag, 
  Trash2, 
  ShieldCheck,
  Building2,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { db } from '../firebase';
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
  orderBy
} from 'firebase/firestore';
import { useAuth } from '../App';
import { useCollection } from '../hooks/useFirestore';

import ShareModal from './ShareModal';

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
    [orderBy("createdAt", "asc")]
  );

  const isLiked = post.likes?.includes(user?.uid);

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      const postRef = doc(db, `groups/${groupId}/posts`, post.id);
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likesCount: increment(-1)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likesCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this broadcast?")) return;
    try {
      await deleteDoc(doc(db, `groups/${groupId}/posts`, post.id));
    } catch (error) {
      console.error("Delete error:", error);
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
        authorJobTitle: profile?.jobTitle || "Network Peer",
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, `groups/${groupId}/posts`, post.id), {
        commentsCount: increment(1)
      });
      setNewComment("");
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <motion.div 
      layout
      className="group bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <img 
            src={post.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`} 
            className="w-11 h-11 rounded-full border border-border-main shadow-sm object-cover" 
            alt="" 
          />
          <div>
            <div className="flex items-center gap-2">
               <h3 className="font-bold text-[15px] text-text-heading leading-tight tracking-tight">
                 {post.authorName}
                 {post.companyId && <span className="ml-2 text-primary font-black text-[10px] uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Building2 className="w-2.5 h-2.5" /> Verified Business</span>}
               </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] text-text-body font-bold uppercase tracking-wider">
                {post.authorJobTitle || "Network Peer"}
               </p>
               <span className="w-1 h-1 rounded-full bg-border-main" />
               <p className="text-[10px] text-text-body/50 uppercase tracking-widest font-medium">
                  {post.createdAt?.seconds ? formatDistanceToNow(post.createdAt.seconds * 1000) + " ago" : "Just now"}
               </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(!activeMenu)}
            className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {activeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                >
                  <button className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5" /> Report Broadcast
                  </button>
                  {(user?.uid === post.authorUid || isAdmin) && (
                    <button 
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Broadcast
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
          {post.content}
        </p>

        {post.video && (
          <div className="mt-4 rounded-2xl overflow-hidden aspect-video bg-slate-50 border border-slate-100">
            {post.video.type === 'youtube' ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${post.video.id}`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            ) : (
              <iframe
                src={`https://player.vimeo.com/video/${post.video.id}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
        )}

        {post.image && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
            <img src={post.image} className="w-full object-cover max-h-[500px]" alt="Broadcast Media" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      <div className="flex flex-col pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 transition-all ${isLiked ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs font-black tracking-tight">{post.likesCount || 0}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-black tracking-tight">{post.commentsCount || 0}</span>
              </button>
           </div>
           <button 
             onClick={(e) => {
               e.stopPropagation();
               setSharingPost(post);
             }}
             className="text-slate-300 hover:text-slate-600 transition-colors"
           >
              <Share2 className="w-5 h-5" />
           </button>
        </div>

        <AnimatePresence>
          {sharingPost && (
            <ShareModal 
              post={sharingPost} 
              onClose={() => setSharingPost(null)} 
              type="group"
              groupId={groupId}
            />
          )}
        </AnimatePresence>

        {showComments && (
          <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
             <div className="space-y-6">
                {loadingComments ? (
                  <div className="py-4 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest animate-pulse">Syncing thread...</div>
                ) : comments?.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center py-4">No technical contributions yet. Be the first to join the thread.</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 text-left">
                      <img src={comment.authorPhoto} className="w-8 h-8 rounded-xl border border-slate-100 object-cover" alt="" />
                      <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black text-slate-900 leading-tight block">{comment.authorName}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            {comment.createdAt?.seconds ? formatDistanceToNow(comment.createdAt.seconds * 1000) + " ago" : "Just now"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
             </div>

             <form onSubmit={handleSendComment} className="flex items-center gap-3 mt-6">
                <img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`} className="w-8 h-8 rounded-xl" alt="" />
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Contribute to this discussion..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                    disabled={postingComment}
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim() || postingComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-white rounded-lg transition-all disabled:opacity-0"
                  >
                    {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
             </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
