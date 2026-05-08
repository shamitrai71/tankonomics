import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, query, orderBy, serverTimestamp, addDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { useCollection } from "../hooks/useFirestore";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ChevronLeft, 
  Building2, 
  Clock, 
  Flag,
  Send,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "../components/ShareModal";
import ReportModal from "../components/ReportModal";

export default function PostDetail() {
  const { postId, topicId, groupId } = useParams<{ postId?: string, topicId?: string, groupId?: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const contentType = topicId ? "forum" : groupId ? "group" : "post";
  const effectiveId = postId || topicId || postId; // postId is used twice here, bit of a mess but we'll fix it

  const id = postId || topicId;
  
  const basePath = topicId ? "forum_topics" : (groupId && postId ? `groups/${groupId}/posts` : "posts");
  const actualId = topicId || postId;

  useEffect(() => {
    if (!actualId) return;

    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, basePath, actualId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Content not found");
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
    content ? `${basePath}/${content.id}/comments` : null,
    [orderBy("createdAt", "asc")]
  );

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || postingComment || !content) return;

    setPostingComment(true);
    try {
      await addDoc(collection(db, `${basePath}/${content.id}/comments`), {
        content: newComment,
        authorUid: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL,
        authorJobTitle: profile?.jobTitle || "Network Peer",
        createdAt: serverTimestamp()
      });
      
      const contentRef = doc(db, basePath, content.id);
      await updateDoc(contentRef, {
        commentsCount: increment(1)
      });
      
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Content Not Found</h2>
        <p className="text-slate-500 mb-8 font-medium">The broadcast you're looking for may have been archived or removed.</p>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 group"
      >
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Back to Network</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden"
      >
        <div className="p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <img 
                   src={content.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${content.authorName}`} 
                   className="w-14 h-14 rounded-2xl border-2 border-slate-50 object-cover" 
                   alt="" 
                 />
                 <div>
                    <h1 className="text-xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{content.title || content.authorName}</h1>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {content.authorJobTitle || "Expert Contributor"}
                       </p>
                       <span className="w-1 h-1 rounded-full bg-slate-200" />
                       <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" />
                          {content.createdAt?.seconds ? formatDistanceToNow(content.createdAt.seconds * 1000) + " ago" : "Just now"}
                       </div>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setReportModalOpen(true)}
                className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                 <Flag className="w-5 h-5" />
              </button>
           </div>

           {content.title && <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">{content.title}</h2>}

           <div className="prose prose-slate max-w-none mb-10">
              <p className="text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{content.content}</p>
           </div>

           {content.image && (
             <div className="rounded-[2rem] overflow-hidden border border-slate-100 mb-10">
                <img src={content.image} className="w-full object-cover max-h-[600px]" alt="" />
             </div>
           )}

           <div className="flex items-center justify-between pt-8 border-t border-slate-100">
              <div className="flex items-center gap-8">
                 <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all">
                    <Heart className="w-6 h-6" />
                    <span className="text-sm font-black">{content.likesCount || 0} Helpful</span>
                 </button>
                 <div className="flex items-center gap-2 text-slate-400">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm font-black">{comments.length} Contributions</span>
                 </div>
              </div>
              <button 
                onClick={() => setShareModalOpen(true)}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:brightness-110 shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                 <Share2 className="w-4 h-4" />
                 Share Insight
              </button>
           </div>
        </div>

        <div className="bg-slate-50 p-8 border-t border-slate-100">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Technical Thread</h3>
           
           <div className="space-y-6 mb-10">
              {loadingComments ? (
                 <div className="py-12 text-center animate-pulse text-slate-300 font-bold uppercase text-[10px] tracking-widest">Initialising feed...</div>
              ) : comments.length === 0 ? (
                 <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-medium italic">No technical contributions yet. Be the first to join the thread.</p>
                 </div>
              ) : (
                 comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-4">
                       <img src={comment.authorPhoto} className="w-10 h-10 rounded-xl border border-slate-100 object-cover" alt="" />
                       <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                             <div>
                                <span className="text-sm font-black text-slate-900 leading-tight block">{comment.authorName}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{comment.authorJobTitle}</span>
                             </div>
                             <span className="text-[10px] text-slate-300 font-bold uppercase">
                                {comment.createdAt?.seconds ? formatDistanceToNow(comment.createdAt.seconds * 1000) + " ago" : "Just now"}
                             </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed font-normal">{comment.content}</p>
                       </div>
                    </div>
                 ))
              )}
           </div>

           <form onSubmit={handleAddComment} className="flex gap-4 items-start">
              <img src={profile?.photoURL} className="w-10 h-10 rounded-xl" alt="" />
              <div className="flex-1 space-y-4">
                 <textarea 
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   placeholder="Add your industrial insight to this discussion..."
                   className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium h-32 focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none shadow-sm"
                 />
                 <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={!newComment.trim() || postingComment}
                      className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:brightness-110 disabled:opacity-30 transition-all shadow-xl active:scale-95"
                    >
                       {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                       Post Contribution
                    </button>
                 </div>
              </div>
           </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {shareModalOpen && (
          <ShareModal 
            post={content} 
            onClose={() => setShareModalOpen(false)} 
            type={contentType}
            groupId={groupId}
          />
        )}
        {reportModalOpen && (
          <ReportModal 
             item={content}
             type={contentType}
             path={`${basePath}/${content.id}`}
             onClose={() => setReportModalOpen(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
