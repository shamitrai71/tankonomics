import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCollection, createDocument, updateDocument } from "../hooks/useFirestore";
import { useAuth } from "../App";
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  Share2, 
  ExternalLink,
  MessageSquare,
  Check,
  X,
  Clock,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ThumbsUp,
  Users,
  Heart,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { serverTimestamp, where, orderBy, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatDistanceToNow } from "date-fns";

function ClaimModal({ company, onClose }: { company: any; onClose: () => void }) {
  const { user } = useAuth();
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!justification.trim() || isSubmitting) return;

    // Email domain validation
    if (company.website) {
      try {
        const url = new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`);
        const companyDomain = url.hostname.replace('www.', '');
        const userDomain = user?.email?.split('@')[1];
        
        if (userDomain && !userDomain.toLowerCase().includes(companyDomain.toLowerCase()) && !companyDomain.toLowerCase().includes(userDomain.toLowerCase())) {
          alert(`Verification Error: Please use your official ${company.name} email address (ending in @${companyDomain}) to claim this profile.`);
          return;
        }
      } catch (err) {
        console.warn("Could not parse company website for domain validation", err);
      }
    }

    setIsSubmitting(true);
    try {
      await createDocument("company_claims", {
        companyId: company.id,
        userUid: user?.uid,
        userName: user?.displayName,
        userEmail: user?.email,
        justification,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg relative z-10 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-8">
           <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
           </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">Claim Submitted</h3>
             <p className="text-slate-500 font-medium italic">Our administrators will verify your credentials and respond shortly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Claim business page</h2>
              <p className="text-slate-500 font-medium">Verify your ownership of <span className="text-indigo-600 font-bold">{company.name}</span> to manage this profile.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
               <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
               <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Please provide proof of affiliation such as your work email address or linked profile. Claims are manually vetted within 24-48 hours.
               </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 block">Justification & Credentials</label>
              <textarea 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Briefly explain your role and why you are authorized to manage this page..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none h-40 resize-none transition-all shadow-inner"
              />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!justification.trim() || isSubmitting}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {isSubmitting ? "Processing..." : "Submit Verification Request"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function CompanyProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "products" | "feed" | "team">("about");
  const [newsContent, setNewsContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  const { data: companies, loading } = useCollection<any>("companies", [where("__name__", "==", id)]);
  const { data: categories } = useCollection<any>("company_categories");
  const { data: employees } = useCollection<any>("users", [where("companyId", "==", id)]);
  const { data: companyPosts } = useCollection<any>("posts", [where("companyId", "==", id), orderBy("createdAt", "desc")]);
  const { data: productRecommendations } = useCollection<any>("product_recommendations", [where("companyId", "==", id)]);
  const { data: follows } = useCollection<any>("follows", [where("targetId", "==", id), where("targetType", "==", "company")]);
  const { data: likes } = useCollection<any>("likes", [where("targetId", "==", id), where("targetType", "==", "company")]);
  
  const isFollowing = follows.some((f: any) => f.followerId === user?.uid);
  const isLiked = likes.some((l: any) => l.likerId === user?.uid);

  const [selectedProductForEndorsers, setSelectedProductForEndorsers] = useState<string | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);

  const company = companies[0];
  const isOwner = user?.uid === company?.ownerUid;

  const handleFollow = async () => {
    if (!user || !id || engagementLoading) return;
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
          targetId: id,
          targetType: "company",
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
    if (!user || !id || engagementLoading) return;
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
          targetId: id,
          targetType: "company",
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEngagementLoading(false);
    }
  };

  const handleRecommendProduct = async (productName: string) => {
    if (!user || !id) return;
    
    const alreadyRecommended = productRecommendations.some(
      (r: any) => r.productName === productName && r.userUid === user.uid
    );
    
    if (alreadyRecommended) return;

    try {
      await createDocument("product_recommendations", {
        companyId: id,
        productName: productName,
        userUid: user.uid,
        userName: user.displayName || "Anonymous Member",
        userPhoto: user.photoURL,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error recommending product:", err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: company.name,
        text: company.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
       <div className="animate-spin text-indigo-600">
         <Building2 className="w-12 h-12" />
       </div>
    </div>
  );

  if (!company) return (
    <div className="max-w-7xl mx-auto py-20 text-center">
       <p className="text-slate-500 font-bold italic">Business profile not found or unavailable.</p>
       <Link to="/directory" className="text-indigo-600 font-black uppercase text-xs mt-4 block">Return to Directory</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <img 
          src={company.heroImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"} 
          className="w-full h-full object-cover"
          alt="Company Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        
        {/* Navigation Overlays */}
        <div className="absolute top-8 left-4 md:left-8 z-10">
          <Link to="/directory" className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" /> Directory
          </Link>
        </div>

        {/* Header Content */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8">
            {/* Inset Logo */}
            <div className="relative -mb-16 md:-mb-24 shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-3xl p-4 md:p-6 shadow-2xl border-4 border-white overflow-hidden flex items-center justify-center">
                 <img 
                   src={company.logo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"} 
                   className="max-w-full max-h-full object-contain"
                   alt={company.name}
                 />
              </div>
              {company.isClaimed && (
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg border-4 border-white" title="Verified Business">
                  <Check className="w-4 h-4 md:w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                  {categories.find((c: any) => c.id === company.categoryId)?.name}
                </span>
                {company.isClaimed && (
                   <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                     <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                   </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg flex items-center flex-wrap gap-4">
                {company.name}
                {company.isClaimed && (
                  <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border border-white/20">
                    <ShieldCheck className="w-4 h-4" /> Verified
                  </div>
                )}
              </h1>
              {company.address && (
                <div className="flex items-center gap-2 text-white/70 font-medium text-sm mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {company.address}
                </div>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="flex gap-3 pb-4">
              <button 
                onClick={handleFollow}
                disabled={engagementLoading || !user}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 ${
                  isFollowing ? "bg-white/20 text-white backdrop-blur-md" : "bg-indigo-600 text-white"
                }`}
              >
                {isFollowing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button 
                onClick={handleLike}
                disabled={engagementLoading || !user}
                className={`px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 ${
                  isLiked ? "bg-rose-500 text-white" : "bg-white text-rose-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {likes.length > 0 && <span>{likes.length}</span>}
              </button>
              {company.website && (
                 <a 
                   href={company.website} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                 >
                   Visit Website <ExternalLink className="w-4 h-4" />
                 </a>
              )}
              {/* Social Links */}
              {company.socialLinks?.linkedin && (
                <a href={company.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-[#0077b5] rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95" title="LinkedIn">
                  <Linkedin className="w-5 h-5 fill-current" />
                </a>
              )}
              {company.socialLinks?.twitter && (
                <a href={company.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-[#1da1f2] rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95" title="Twitter / X">
                  <Twitter className="w-5 h-5 fill-current" />
                </a>
              )}
              {company.socialLinks?.facebook && (
                <a href={company.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-[#1877f2] rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95" title="Facebook">
                  <Facebook className="w-5 h-5 fill-current" />
                </a>
              )}
              {company.socialLinks?.instagram && (
                <a href={company.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-[#e4405f] rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              <button 
                onClick={handleShare}
                className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all shadow-xl active:scale-95"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24 md:mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-slate-200">
               <button 
                 onClick={() => setActiveTab("about")}
                 className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                   activeTab === "about" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                 }`}
               >
                 About the Company
                 {activeTab === "about" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
               </button>
               {company.products?.length > 0 && (
                 <button 
                   onClick={() => setActiveTab("products")}
                   className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                     activeTab === "products" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                   }`}
                 >
                   Product Showcase ({company.products.length})
                   {activeTab === "products" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
                 </button>
               )}
               <button 
                 onClick={() => setActiveTab("feed")}
                 className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                   activeTab === "feed" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                 }`}
               >
                 Company Feed
                 {activeTab === "feed" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
               </button>
               <button 
                 onClick={() => setActiveTab("team")}
                 className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                   activeTab === "team" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                 }`}
               >
                 The Team ({employees.length})
                 {activeTab === "team" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
               </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div 
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="prose prose-slate max-w-none">
                     <h2 className="text-3xl font-black text-slate-900 mb-6">About Us</h2>
                     <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                        {company.aboutUs || company.description || "Detailed organizational summary pending verification. This partner represents core technical excellence in our regional network."}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     <div className="p-6 bg-white border border-slate-200 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Classification</p>
                        <p className="text-slate-900 font-black truncate">{categories.find((c: any) => c.id === company.categoryId)?.name}</p>
                     </div>
                     <div className="p-6 bg-white border border-slate-200 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Affiliated Members</p>
                        <p className="text-slate-900 font-black truncate">{employees.length} Industry Pros</p>
                     </div>
                     <div className="p-6 bg-white border border-slate-200 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className={`font-black ${company.isClaimed ? "text-emerald-500" : "text-amber-500"}`}>{company.isClaimed ? "Verified Partner" : "Unclaimed Profile"}</p>
                     </div>
                     <div className="p-6 bg-white border border-slate-200 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                        <p className="text-slate-900 font-black truncate">{company.address?.split(',')[0] || "Global Network"}</p>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "products" && (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {company.products.map((product: any, i: number) => {
                        const productRecs = productRecommendations.filter((r: any) => r.productName === product.name);
                        const hasRecommended = productRecs.some((r: any) => r.userUid === user?.uid);
                        
                        return (
                          <div key={i} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all flex flex-col">
                             <div className="h-48 bg-slate-100 overflow-hidden relative">
                                <img src={product.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                                <div className="absolute top-4 right-4 flex gap-2">
                                   <button 
                                     onClick={() => handleRecommendProduct(product.name)}
                                     disabled={hasRecommended || !user}
                                     className={`p-3 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                                       hasRecommended 
                                         ? "bg-emerald-500 text-white" 
                                         : "bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white"
                                     }`}
                                   >
                                      <ThumbsUp className={`w-4 h-4 ${hasRecommended ? "fill-current" : ""}`} />
                                      {hasRecommended ? "Recommended" : "Recommend"}
                                   </button>
                                </div>
                             </div>
                             <div className="p-6 flex-1 flex flex-col">
                                <h4 className="text-xl font-black text-slate-900 mb-2">{product.name}</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-6">{product.description}</p>
                                
                                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                                   <button 
                                     onClick={() => setSelectedProductForEndorsers(product.name)}
                                     className="flex items-center gap-2 group/link"
                                   >
                                      <div className="flex -space-x-2">
                                         {productRecs.slice(0, 3).map((rec: any, idx: number) => (
                                           <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                              <img src={rec.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${rec.userName}`} alt={rec.userName} className="w-full h-full object-cover" />
                                           </div>
                                         ))}
                                         {productRecs.length > 3 && (
                                           <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                                              +{productRecs.length - 3}
                                           </div>
                                         )}
                                      </div>
                                      <span className="text-[10px] font-black text-slate-400 group-hover/link:text-indigo-600 transition-colors uppercase tracking-widest">
                                         {productRecs.length} {productRecs.length === 1 ? "Recommendation" : "Recommendations"}
                                      </span>
                                   </button>

                                   <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 uppercase">
                                      <Users className="w-3 h-3" /> Industry Peer Endorsed
                                   </div>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </motion.div>
              )}

              {activeTab === "feed" && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {isOwner && (
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Post Global Company News</h3>
                       <textarea 
                         value={newsContent}
                         onChange={(e) => setNewsContent(e.target.value)}
                         placeholder="Share a major announcement, project update, or industry breakthrough from your company..."
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none h-32 resize-none transition-all mb-4"
                       />
                       <button 
                         onClick={async () => {
                           if (!newsContent.trim() || isPosting) return;
                           setIsPosting(true);
                           try {
                             await createDocument("posts", {
                               content: newsContent,
                               companyId: company.id,
                               companyName: company.name,
                               companyLogo: company.logo,
                               authorUid: user?.uid,
                               authorName: user?.displayName,
                               authorPhoto: company.logo, // Use logo for company posts
                               authorJobTitle: `${company.name} Official`,
                               likesCount: 0,
                               commentsCount: 0,
                               createdAt: serverTimestamp()
                             });
                             setNewsContent("");
                           } catch (err) {
                             console.error(err);
                           } finally {
                             setIsPosting(false);
                           }
                         }}
                         disabled={!newsContent.trim() || isPosting}
                         className="bg-indigo-600 text-white font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                       >
                         {isPosting ? "Posting..." : "Publish to Main Feed"}
                       </button>
                    </div>
                  )}

                  <div className="space-y-6">
                    {companyPosts.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-[2rem]">
                         <p className="text-slate-400 font-medium italic">No recent announcements from {company.name}.</p>
                      </div>
                    ) : (
                      companyPosts.map((post: any) => (
                        <div key={post.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                           <div className="flex gap-4 mb-4">
                              <img src={post.companyLogo} className="w-10 h-10 rounded-lg border border-slate-100" />
                              <div>
                                 <h4 className="text-sm font-black text-slate-900">{post.companyName}</h4>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                   {post.createdAt?.seconds ? formatDistanceToNow(post.createdAt.seconds * 1000) + " ago" : "Just now"}
                                 </p>
                              </div>
                           </div>
                           <p className="text-slate-700 leading-relaxed font-medium">{post.content}</p>
                           <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-4 group">
                             View on Global Feed <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-1 transition-transform" />
                           </Link>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "team" && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employees.length === 0 ? (
                      <div className="col-span-full text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium italic">No members have associated themselves with this company yet.</p>
                      </div>
                    ) : (
                      employees.map((emp: any) => (
                        <div key={emp.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                          <div className="flex items-center gap-4">
                            <Link to={`/profile/${emp.id}`} className="shrink-0">
                              <img 
                                src={emp.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.displayName}`} 
                                className="w-14 h-14 rounded-2xl border-2 border-slate-50 shadow-sm object-cover" 
                                alt={emp.displayName} 
                              />
                            </Link>
                            <div>
                               <div className="flex items-center gap-2">
                                 <h4 className="text-sm font-black text-slate-900 line-clamp-1">{emp.displayName}</h4>
                                 {emp.isVerifiedByCompany && (
                                   <div className="bg-emerald-50 text-emerald-600 p-0.5 rounded-full">
                                     <Check className="w-3 h-3" />
                                   </div>
                                 )}
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                                 {emp.jobTitle || "Technical Specialist"}
                               </p>
                               {emp.isVerifiedByCompany ? (
                                 <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-emerald-500 mt-1">
                                   <ShieldCheck className="w-2.5 h-2.5" /> Company Verified
                                 </span>
                               ) : (
                                 <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-amber-500 mt-1 opacity-60">
                                   <Clock className="w-2.5 h-2.5" /> Verification Pending
                                 </span>
                               )}
                            </div>
                          </div>

                          {isOwner && !emp.isVerifiedByCompany && (
                            <button 
                              onClick={async () => {
                                if (window.confirm(`Verify that ${emp.displayName} currently works at ${company.name}?`)) {
                                  try {
                                    await updateDocument("users", emp.id, {
                                      isVerifiedByCompany: true,
                                      verifiedByCompanyId: company.id,
                                      verifiedByCompanyName: company.name,
                                      verifiedAt: serverTimestamp(),
                                      verifiedByUid: user?.uid
                                    });

                                    // Automatic follow/like for verified employee
                                    const { getDocs: firestoreGetDocs, collection: firestoreCollection, query: firestoreQuery, where: firestoreWhere } = await import("firebase/firestore");
                                    
                                    // Check if already following
                                    const fq = firestoreQuery(firestoreCollection(db, "follows"), 
                                      firestoreWhere("followerId", "==", emp.id),
                                      firestoreWhere("targetId", "==", company.id),
                                      firestoreWhere("targetType", "==", "company")
                                    );
                                    const fSnap = await firestoreGetDocs(fq);
                                    if (fSnap.empty) {
                                      await createDocument("follows", {
                                        followerId: emp.id,
                                        targetId: company.id,
                                        targetType: "company",
                                        createdAt: serverTimestamp()
                                      });
                                    }

                                    // Check if already liked
                                    const lq = firestoreQuery(firestoreCollection(db, "likes"), 
                                      firestoreWhere("likerId", "==", emp.id),
                                      firestoreWhere("targetId", "==", company.id),
                                      firestoreWhere("targetType", "==", "company")
                                    );
                                    const lSnap = await firestoreGetDocs(lq);
                                    if (lSnap.empty) {
                                      await createDocument("likes", {
                                        likerId: emp.id,
                                        targetId: company.id,
                                        targetType: "company",
                                        createdAt: serverTimestamp()
                                      });
                                    }
                                  } catch (err) {
                                    console.error("Verification failed:", err);
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                              <ShieldCheck className="w-3 h-3" /> Verify
                            </button>
                          )}
                          
                          {isOwner && emp.isVerifiedByCompany && emp.id !== user?.uid && (
                            <button 
                              onClick={async () => {
                                if (window.confirm(`Remove verification for ${emp.displayName}?`)) {
                                  try {
                                    await updateDocument("users", emp.id, {
                                      isVerifiedByCompany: false,
                                      verifiedAt: null,
                                      verifiedByUid: null
                                    });
                                  } catch (err) {
                                    console.error("Revocation failed:", err);
                                  }
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-8">
            {/* Claim/Manage Card */}
            {!company.isClaimed ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                 <ShieldCheck className="w-12 h-12 text-indigo-400 mb-6 relative z-10" />
                 <h3 className="text-2xl font-black mb-3 relative z-10">Is this your business?</h3>
                 <p className="text-slate-400 font-medium text-sm mb-8 relative z-10 leading-relaxed italic">
                    Verified business owners gain full control over their profile data, direct inquiry management, and priority listing status.
                 </p>
                 <button 
                   onClick={() => setIsClaiming(true)}
                   className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 relative z-10 active:scale-95 uppercase tracking-widest text-xs"
                 >
                    Claim this page
                 </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                 <ShieldCheck className="w-10 h-10 text-emerald-500 mb-6" />
                 <h3 className="text-xl font-black mb-3 text-slate-900">Verified Profile</h3>
                 <p className="text-slate-500 font-medium text-xs mb-6 leading-relaxed">
                    This organization has completed the full verification process and is recognized as a member of our verified network.
                 </p>
                 {user?.uid === company.ownerUid && (
                   <Link to="/admin" className="w-full bg-slate-900 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                     Admin Dashboard
                   </Link>
                 )}
              </div>
            )}

            {/* Detailed Taxonomy */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Directory Taxonomy</h3>
               <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Industry Level 1</label>
                    <p className="text-indigo-600 font-black text-sm">{categories.find((c: any) => c.id === company.categoryId)?.name}</p>
                  </div>
                  {company.subCategoryId && (
                    <div className="pt-4 border-t border-slate-50">
                      <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Sector Level 2</label>
                      <p className="text-slate-700 font-bold text-sm italic">{categories.find((c: any) => c.id === company.subCategoryId)?.name}</p>
                    </div>
                  )}
                  {company.tier3CategoryId && (
                    <div className="pt-4 border-t border-slate-50">
                      <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Niche Level 3</label>
                      <p className="text-slate-500 font-semibold text-sm">{categories.find((c: any) => c.id === company.tier3CategoryId)?.name}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 flex items-center gap-4 group cursor-pointer hover:bg-indigo-100 transition-all">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
               </div>
               <div>
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Contact Office</p>
                  <p className="text-[10px] font-bold text-indigo-400">Direct Message Inquiry</p>
               </div>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {isClaiming && <ClaimModal company={company} onClose={() => setIsClaiming(false)} />}
        
        {selectedProductForEndorsers && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedProductForEndorsers(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative z-10 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
             >
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black text-slate-900">Recommended By</h3>
                   <button onClick={() => setSelectedProductForEndorsers(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                   </button>
                </div>
                
                <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                   {productRecommendations
                     .filter((r: any) => r.productName === selectedProductForEndorsers)
                     .map((rec: any, idx: number) => (
                       <Link 
                         key={idx} 
                         to={`/profile/${rec.userUid}`} 
                         className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group"
                       >
                          <img 
                            src={rec.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${rec.userName}`} 
                            className="w-12 h-12 rounded-xl group-hover:scale-105 transition-transform" 
                            alt={rec.userName} 
                          />
                          <div>
                             <p className="text-sm font-black text-slate-900">{rec.userName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical Member</p>
                          </div>
                          <ExternalLink className="w-4 h-4 ml-auto text-slate-200 group-hover:text-indigo-500 transition-colors" />
                       </Link>
                     ))
                   }
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
