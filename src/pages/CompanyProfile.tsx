/**
 * CompanyProfile — the verified-business surface.
 *
 * Restyled to match the rest of the app:
 *   - Industrial-editorial hero with deep-petrol overlay and blueprint grid
 *   - Instrument Serif display name, mono eyebrows everywhere
 *   - Safety-orange accent for the verified chip, active-tab marker, and key CTAs
 *   - Paper-warm canvas, paper-weight borders, no more `rounded-[2.5rem]` blobs
 *
 * What's preserved verbatim:
 *   - Every data hook (companies, categories, employees, posts, products,
 *     follows, likes)
 *   - The claim flow (ClaimModal) including email-domain validation
 *   - Follow / Like / Recommend product / Verify employee handlers
 *   - The tabs (about / products / feed / team) and the owner-only
 *     company-news composer + employee verification controls
 */

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
  Plus,
  Loader2,
  Send,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { serverTimestamp, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { formatDistanceToNow } from "date-fns";

/* ============================================================
   ClaimModal — claim ownership of an unclaimed business
   ============================================================ */
function ClaimModal({ company, onClose }: { company: any; onClose: () => void }) {
  const { user } = useAuth();
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!justification.trim() || isSubmitting) return;

    // Email domain validation (preserved verbatim from the previous version)
    if (company.website) {
      try {
        const url = new URL(company.website.startsWith("http") ? company.website : `https://${company.website}`);
        const companyDomain = url.hostname.replace("www.", "");
        const userDomain = user?.email?.split("@")[1];

        if (
          userDomain &&
          !userDomain.toLowerCase().includes(companyDomain.toLowerCase()) &&
          !companyDomain.toLowerCase().includes(userDomain.toLowerCase())
        ) {
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
        createdAt: serverTimestamp(),
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 12 }} className="bg-bg-card border border-border-main rounded-2xl p-7 w-full max-w-lg relative z-10 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-bg-main border border-border-main rounded-xl flex items-center justify-center text-text-heading">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
              <Check className="w-6 h-6" strokeWidth={2} />
            </div>
            <p className="eyebrow tabular text-accent mb-2">VERIFICATION QUEUED</p>
            <h3 className="font-display text-2xl text-text-heading mb-2">Claim submitted</h3>
            <p className="text-text-body text-[14px]">Our administrators will review your credentials shortly.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="eyebrow tabular text-text-body/55 mb-2">Verification</p>
              <h2 className="font-display text-3xl text-text-heading mb-2 leading-tight">Claim this page</h2>
              <p className="text-text-body text-[14px]">
                Verify ownership of <span className="text-text-heading font-medium">{company.name}</span> to manage this profile.
              </p>
            </div>

            <div className="p-4 bg-bg-main rounded-xl border border-border-main flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-[13px] text-text-body leading-relaxed">
                Provide proof of affiliation — a work email address or linked profile. Claims are reviewed within 24–48 hours.
              </p>
            </div>

            <label className="block">
              <span className="eyebrow tabular text-text-body/60 mb-2 block">Justification &amp; credentials</span>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Briefly explain your role and why you're authorised to manage this page…"
                className="w-full bg-bg-main border border-border-main rounded-xl p-4 text-[14px] focus:bg-bg-card focus:border-text-heading outline-none h-36 resize-none transition-all text-text-heading placeholder:text-text-body/40"
              />
            </label>

            <button
              onClick={handleSubmit}
              disabled={!justification.trim() || isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card py-3.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit verification request <Send className="w-4 h-4" strokeWidth={1.75} /></>}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ============================================================
   CompanyProfile — page
   ============================================================ */
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
          createdAt: serverTimestamp(),
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
          createdAt: serverTimestamp(),
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
    const alreadyRecommended = productRecommendations.some((r: any) => r.productName === productName && r.userUid === user.uid);
    if (alreadyRecommended) return;
    try {
      await createDocument("product_recommendations", {
        companyId: id,
        productName,
        userUid: user.uid,
        userName: user.displayName || "Anonymous Member",
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error recommending product:", err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: company.name,
          text: company.description,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  /* ---------------- Early-exit states ---------------- */
  if (loading)
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-text-heading border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!company)
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 text-center">
        <div>
          <Building2 className="w-12 h-12 text-text-body/30 mx-auto mb-4" strokeWidth={1.5} />
          <p className="eyebrow tabular text-text-body/55 mb-2">404 · NOT FOUND</p>
          <h2 className="font-display text-3xl text-text-heading mb-2">Business not found</h2>
          <p className="text-text-body mb-6 text-[14px]">This profile doesn't exist or has been removed.</p>
          <Link to="/directory" className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to directory
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-main pb-20">
      {/* ============================================================
         HERO — full-bleed image with deep-petrol gradient overlay,
                 blueprint grid texture, identity card overlapping.
         ============================================================ */}
      <div className="relative h-[360px] md:h-[440px] w-full overflow-hidden">
        <img
          src={company.heroImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"}
          className="w-full h-full object-cover"
          alt={`${company.name} hero`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/55 to-transparent" />
        <div className="absolute inset-0 bp-grid opacity-25 pointer-events-none" />

        {/* Back to directory pill */}
        <div className="absolute top-6 left-4 md:left-8 z-10">
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-bg-card/10 backdrop-blur-md border border-white/20 rounded-xl eyebrow tabular text-white hover:bg-bg-card/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            Directory
          </Link>
        </div>

        {/* Industry chip + verification chip in the hero header strip */}
        <div className="absolute top-6 right-4 md:right-8 flex flex-wrap gap-2 justify-end z-10">
          {categories.find((c: any) => c.id === company.categoryId) && (
            <span className="px-3 py-1.5 bg-bg-card/10 backdrop-blur-md border border-white/20 rounded-xl eyebrow tabular text-white">
              {categories.find((c: any) => c.id === company.categoryId)?.name}
            </span>
          )}
          {company.isClaimed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-xl eyebrow tabular shadow-lg">
              <ShieldCheck className="w-3 h-3" strokeWidth={2} />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Identity card — overlaps the hero */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10">
        <div className="bg-bg-card border border-border-main rounded-2xl p-5 md:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-7">
            {/* Logo */}
            <div className="relative shrink-0 -mt-14 md:-mt-12">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-bg-main rounded-2xl border border-border-main p-3 flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src={company.logo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200"}
                  className="max-w-full max-h-full object-contain"
                  alt={company.name}
                />
              </div>
              {company.isClaimed && (
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center border-2 border-bg-card" title="Verified Business">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Name + address */}
            <div className="flex-1 min-w-0">
              <div className="eyebrow tabular text-accent mb-1 inline-flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                INDEXED ENTITY
              </div>
              <h1 className="font-display text-[clamp(1.875rem,4vw,3rem)] text-text-heading leading-[1.0]">{company.name}</h1>
              {company.address && (
                <p className="eyebrow tabular text-text-body/55 mt-2">{company.address}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleFollow}
                disabled={engagementLoading || !user}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isFollowing
                    ? "bg-bg-main border border-border-main text-text-heading"
                    : "bg-text-heading text-bg-card hover:brightness-110"
                }`}
              >
                {isFollowing ? <Check className="w-4 h-4" strokeWidth={1.75} /> : <Plus className="w-4 h-4" strokeWidth={1.75} />}
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                onClick={handleLike}
                disabled={engagementLoading || !user}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isLiked ? "bg-rust/10 border border-rust/30 text-rust" : "bg-bg-card border border-border-main text-text-body hover:border-text-heading"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} strokeWidth={1.75} />
                {likes.length > 0 && <span>{likes.length}</span>}
              </button>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-main text-text-heading rounded-xl text-[13px] font-medium hover:border-text-heading transition-all"
                  title="Website"
                >
                  <Globe className="w-4 h-4" strokeWidth={1.75} />
                  Website
                  <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                </a>
              )}
              {company.socialLinks?.linkedin && (
                <a href={company.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-bg-card border border-border-main rounded-xl hover:border-text-heading transition-all" title="LinkedIn">
                  <Linkedin className="w-4 h-4 text-[#0077b5]" strokeWidth={1.75} />
                </a>
              )}
              {company.socialLinks?.twitter && (
                <a href={company.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-bg-card border border-border-main rounded-xl hover:border-text-heading transition-all" title="Twitter / X">
                  <Twitter className="w-4 h-4 text-text-heading" strokeWidth={1.75} />
                </a>
              )}
              {company.socialLinks?.facebook && (
                <a href={company.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-bg-card border border-border-main rounded-xl hover:border-text-heading transition-all" title="Facebook">
                  <Facebook className="w-4 h-4 text-[#1877f2]" strokeWidth={1.75} />
                </a>
              )}
              {company.socialLinks?.instagram && (
                <a href={company.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-bg-card border border-border-main rounded-xl hover:border-text-heading transition-all" title="Instagram">
                  <Instagram className="w-4 h-4 text-[#e4405f]" strokeWidth={1.75} />
                </a>
              )}
              <button
                onClick={handleShare}
                className="p-2.5 bg-bg-card border border-border-main text-text-body rounded-xl hover:border-text-heading transition-all"
                title="Share"
              >
                <Share2 className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
         CONTENT BODY
         ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
          {/* Main column */}
          <div>
            {/* Tab bar */}
            <div className="flex gap-7 border-b border-border-main mb-8 overflow-x-auto">
              {([
                { key: "about", label: "About" },
                ...(company.products?.length > 0 ? [{ key: "products", label: `Products · ${company.products.length}` }] : []),
                { key: "feed", label: "Feed" },
                { key: "team", label: `Team · ${employees.length}` },
              ] as { key: typeof activeTab; label: string }[]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 eyebrow tabular relative whitespace-nowrap transition-colors ${
                    activeTab === tab.key ? "text-text-heading" : "text-text-body/55 hover:text-text-body"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && <motion.div layoutId="ctab" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* About */}
              {activeTab === "about" && (
                <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">
                  <section>
                    <p className="eyebrow tabular text-text-body/55 mb-3">Organisational summary</p>
                    <h2 className="font-display text-3xl text-text-heading mb-5 leading-tight">About {company.name}</h2>
                    <p className="text-text-body leading-relaxed whitespace-pre-wrap text-[15px]">
                      {company.aboutUs || company.description || "Detailed organisational summary pending verification. This partner represents core technical excellence in our regional network."}
                    </p>
                  </section>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-bg-card border border-border-main rounded-xl">
                      <p className="eyebrow tabular text-text-body/55 mb-1">Classification</p>
                      <p className="text-[14px] font-medium text-text-heading truncate">
                        {categories.find((c: any) => c.id === company.categoryId)?.name || "—"}
                      </p>
                    </div>
                    <div className="p-4 bg-bg-card border border-border-main rounded-xl">
                      <p className="eyebrow tabular text-text-body/55 mb-1">Members</p>
                      <p className="text-[14px] font-medium text-text-heading">
                        <span className="font-display tabular text-2xl text-text-heading">{employees.length}</span> linked
                      </p>
                    </div>
                    <div className="p-4 bg-bg-card border border-border-main rounded-xl">
                      <p className="eyebrow tabular text-text-body/55 mb-1">Status</p>
                      <p className={`text-[14px] font-medium ${company.isClaimed ? "text-accent" : "text-rust"}`}>
                        {company.isClaimed ? "Verified" : "Unclaimed"}
                      </p>
                    </div>
                    <div className="p-4 bg-bg-card border border-border-main rounded-xl">
                      <p className="eyebrow tabular text-text-body/55 mb-1">Location</p>
                      <p className="text-[14px] font-medium text-text-heading truncate">
                        {company.address?.split(",")[0] || "Global"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Products */}
              {activeTab === "products" && (
                <motion.div key="products" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.products.map((product: any, i: number) => {
                    const productRecs = productRecommendations.filter((r: any) => r.productName === product.name);
                    const hasRecommended = productRecs.some((r: any) => r.userUid === user?.uid);

                    return (
                      <div key={i} className="bg-bg-card border border-border-main rounded-2xl overflow-hidden hover:border-text-heading transition-all flex flex-col">
                        <div className="h-44 bg-bg-main overflow-hidden relative">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"}
                            className="w-full h-full object-cover"
                            alt={product.name}
                          />
                          <button
                            onClick={() => handleRecommendProduct(product.name)}
                            disabled={hasRecommended || !user}
                            className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg eyebrow tabular shadow-lg transition-all ${
                              hasRecommended ? "bg-accent text-white" : "bg-bg-card/95 backdrop-blur-md text-text-heading hover:bg-bg-card"
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${hasRecommended ? "fill-current" : ""}`} strokeWidth={1.75} />
                            {hasRecommended ? "Recommended" : "Recommend"}
                          </button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h4 className="font-display text-xl text-text-heading mb-2 leading-tight">{product.name}</h4>
                          <p className="text-[13px] text-text-body leading-relaxed line-clamp-3 mb-5">{product.description}</p>

                          <div className="mt-auto pt-4 border-t border-border-main flex items-center justify-between gap-3">
                            <button
                              onClick={() => setSelectedProductForEndorsers(product.name)}
                              className="flex items-center gap-2 group/link min-w-0"
                            >
                              <div className="flex -space-x-1.5 shrink-0">
                                {productRecs.slice(0, 3).map((rec: any, idx: number) => (
                                  <div key={idx} className="w-6 h-6 rounded-md border border-bg-card bg-bg-main overflow-hidden">
                                    <img src={rec.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${rec.userName}`} alt={rec.userName} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {productRecs.length > 3 && (
                                  <div className="w-6 h-6 rounded-md border border-bg-card bg-text-heading text-bg-card flex items-center justify-center text-[9px] font-mono">
                                    +{productRecs.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="eyebrow tabular text-text-body group-hover/link:text-text-heading transition-colors">
                                {productRecs.length} {productRecs.length === 1 ? "endorsement" : "endorsements"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Feed */}
              {activeTab === "feed" && (
                <motion.div key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                  {isOwner && (
                    <div className="bg-bg-card border border-border-main rounded-2xl p-5">
                      <p className="eyebrow tabular text-text-body/55 mb-2 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                        Company announcement
                      </p>
                      <h3 className="font-display text-xl text-text-heading mb-4">Post to the global feed</h3>
                      <textarea
                        value={newsContent}
                        onChange={(e) => setNewsContent(e.target.value)}
                        placeholder="Share a major announcement, project update, or industry breakthrough…"
                        className="w-full bg-bg-main border border-border-main rounded-xl p-4 text-[14px] focus:bg-bg-card focus:border-text-heading outline-none h-28 resize-none transition-all"
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
                              authorPhoto: company.logo,
                              authorJobTitle: `${company.name} Official`,
                              likesCount: 0,
                              commentsCount: 0,
                              createdAt: serverTimestamp(),
                            });
                            setNewsContent("");
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsPosting(false);
                          }
                        }}
                        disabled={!newsContent.trim() || isPosting}
                        className="mt-4 inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                      >
                        {isPosting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : <>Publish to main feed <Send className="w-4 h-4" strokeWidth={1.75} /></>}
                      </button>
                    </div>
                  )}

                  {companyPosts.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border-main rounded-2xl bg-bg-card">
                      <Building2 className="w-10 h-10 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-text-body/50 text-[14px]">No recent announcements from {company.name}.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {companyPosts.map((post: any) => (
                        <div key={post.id} className="bg-bg-card border border-border-main rounded-2xl p-5 hover:border-text-heading transition-all">
                          <div className="flex gap-3 mb-3">
                            <img src={post.companyLogo} className="w-10 h-10 rounded-lg border border-border-main object-contain bg-bg-main" alt={post.companyName} />
                            <div>
                              <p className="text-[14px] font-medium text-text-heading leading-tight">{post.companyName}</p>
                              <p className="eyebrow tabular text-text-body/55 mt-0.5">
                                {post.createdAt?.seconds ? formatDistanceToNow(post.createdAt.seconds * 1000) + " ago" : "Just now"}
                              </p>
                            </div>
                          </div>
                          <p className="text-text-body leading-relaxed text-[14px]">{post.content}</p>
                          <Link to="/" className="inline-flex items-center gap-1.5 mt-3 eyebrow tabular text-text-heading hover:text-accent transition-colors group">
                            View on global feed
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Team */}
              {activeTab === "team" && (
                <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {employees.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-bg-card border border-dashed border-border-main rounded-2xl">
                      <Users className="w-10 h-10 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-text-body/50 text-[14px]">No members have linked themselves to this company yet.</p>
                    </div>
                  ) : (
                    employees.map((emp: any) => (
                      <div key={emp.id} className="bg-bg-card border border-border-main rounded-2xl p-4 hover:border-text-heading transition-all flex items-center justify-between group">
                        <Link to={`/profile/${emp.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={emp.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.displayName}`}
                            className="w-12 h-12 rounded-xl border border-border-main object-cover shrink-0"
                            alt={emp.displayName}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[14px] font-medium text-text-heading truncate">{emp.displayName}</p>
                              {emp.isVerifiedByCompany && (
                                <span className="shrink-0 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center" title="Verified by company">
                                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                                </span>
                              )}
                            </div>
                            <p className="eyebrow tabular text-text-body/55 truncate">{emp.jobTitle || "Technical specialist"}</p>
                            {emp.isVerifiedByCompany ? (
                              <p className="eyebrow tabular text-accent mt-0.5 inline-flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2} /> Company verified
                              </p>
                            ) : (
                              <p className="eyebrow tabular text-text-body/45 mt-0.5 inline-flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" strokeWidth={1.75} /> Pending
                              </p>
                            )}
                          </div>
                        </Link>

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
                                    verifiedByUid: user?.uid,
                                  });

                                  // Auto-follow / auto-like for newly verified employee
                                  const { getDocs: firestoreGetDocs, collection: firestoreCollection, query: firestoreQuery, where: firestoreWhere } = await import("firebase/firestore");

                                  const fq = firestoreQuery(
                                    firestoreCollection(db, "follows"),
                                    firestoreWhere("followerId", "==", emp.id),
                                    firestoreWhere("targetId", "==", company.id),
                                    firestoreWhere("targetType", "==", "company"),
                                  );
                                  const fSnap = await firestoreGetDocs(fq);
                                  if (fSnap.empty) {
                                    await createDocument("follows", {
                                      followerId: emp.id,
                                      targetId: company.id,
                                      targetType: "company",
                                      createdAt: serverTimestamp(),
                                    });
                                  }

                                  const lq = firestoreQuery(
                                    firestoreCollection(db, "likes"),
                                    firestoreWhere("likerId", "==", emp.id),
                                    firestoreWhere("targetId", "==", company.id),
                                    firestoreWhere("targetType", "==", "company"),
                                  );
                                  const lSnap = await firestoreGetDocs(lq);
                                  if (lSnap.empty) {
                                    await createDocument("likes", {
                                      likerId: emp.id,
                                      targetId: company.id,
                                      targetType: "company",
                                      createdAt: serverTimestamp(),
                                    });
                                  }
                                } catch (err) {
                                  console.error("Verification failed:", err);
                                }
                              }
                            }}
                            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-text-heading text-bg-card rounded-lg eyebrow tabular hover:brightness-110 transition-all shrink-0"
                          >
                            <ShieldCheck className="w-3 h-3" strokeWidth={1.75} />
                            Verify
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
                                    verifiedByUid: null,
                                  });
                                } catch (err) {
                                  console.error("Revocation failed:", err);
                                }
                              }
                            }}
                            className="ml-2 w-8 h-8 rounded-lg hover:bg-rust/10 hover:text-rust flex items-center justify-center text-text-body/40 opacity-0 group-hover:opacity-100 transition-all"
                            title="Revoke verification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Claim or Manage card */}
            {!company.isClaimed ? (
              <div className="bg-primary text-white rounded-2xl p-6 grain relative overflow-hidden">
                <div className="absolute inset-0 bp-grid pointer-events-none opacity-40" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-4">
                    <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <p className="eyebrow tabular text-accent mb-2">UNCLAIMED</p>
                  <h3 className="font-display text-2xl mb-3 leading-tight">Is this your business?</h3>
                  <p className="text-white/65 text-[13px] mb-5 leading-relaxed">
                    Verified owners gain full control over their profile, direct inquiry management, and priority listing status.
                  </p>
                  <button
                    onClick={() => setIsClaiming(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all"
                  >
                    Claim this page
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-bg-card border border-border-main rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent mb-4">
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <p className="eyebrow tabular text-accent mb-2">VERIFIED</p>
                <h3 className="font-display text-2xl text-text-heading mb-2 leading-tight">Trusted profile</h3>
                <p className="text-text-body text-[13px] mb-5 leading-relaxed">
                  This organisation has completed verification and is part of the trusted member network.
                </p>
                {user?.uid === company.ownerUid && (
                  <Link to="/admin" className="inline-flex items-center justify-center gap-2 w-full bg-text-heading text-bg-card py-2.5 rounded-xl text-[13px] font-medium hover:brightness-110 transition-all">
                    Admin dashboard
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </Link>
                )}
              </div>
            )}

            {/* Taxonomy */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-6">
              <p className="eyebrow tabular text-text-body/55 mb-4">Directory taxonomy</p>
              <div className="divide-y divide-border-main">
                <div className="pb-3">
                  <p className="eyebrow tabular text-text-body/45 mb-1">Level 1</p>
                  <p className="text-[14px] font-medium text-text-heading">{categories.find((c: any) => c.id === company.categoryId)?.name || "—"}</p>
                </div>
                {company.subCategoryId && (
                  <div className="py-3">
                    <p className="eyebrow tabular text-text-body/45 mb-1">Level 2</p>
                    <p className="text-[14px] font-medium text-text-body">{categories.find((c: any) => c.id === company.subCategoryId)?.name || "—"}</p>
                  </div>
                )}
                {company.tier3CategoryId && (
                  <div className="pt-3">
                    <p className="eyebrow tabular text-text-body/45 mb-1">Level 3</p>
                    <p className="text-[14px] font-medium text-text-body/80">{categories.find((c: any) => c.id === company.tier3CategoryId)?.name || "—"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <button className="w-full text-left bg-bg-card border border-border-main rounded-2xl p-5 flex items-center gap-3 hover:border-text-heading transition-all group">
              <div className="w-10 h-10 bg-bg-main rounded-xl flex items-center justify-center border border-border-main text-text-heading shrink-0">
                <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="eyebrow tabular text-text-body/55">Direct enquiry</p>
                <p className="text-[14px] font-medium text-text-heading">Contact office</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-body/40 ml-auto group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
            </button>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {isClaiming && <ClaimModal company={company} onClose={() => setIsClaiming(false)} />}

        {selectedProductForEndorsers && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProductForEndorsers(null)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 12 }} className="bg-bg-card border border-border-main rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="eyebrow tabular text-text-body/55">Endorsements</p>
                  <h3 className="font-display text-xl text-text-heading mt-1">Recommended by</h3>
                </div>
                <button onClick={() => setSelectedProductForEndorsers(null)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {productRecommendations
                  .filter((r: any) => r.productName === selectedProductForEndorsers)
                  .map((rec: any, idx: number) => (
                    <Link
                      key={idx}
                      to={`/profile/${rec.userUid}`}
                      className="flex items-center gap-3 p-3 hover:bg-bg-main rounded-xl border border-transparent hover:border-border-main transition-all group"
                    >
                      <img
                        src={rec.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${rec.userName}`}
                        className="w-10 h-10 rounded-lg object-cover border border-border-main"
                        alt={rec.userName}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-text-heading truncate">{rec.userName}</p>
                        <p className="eyebrow tabular text-text-body/55">Technical member</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-text-body/30 group-hover:text-text-heading transition-colors" strokeWidth={1.75} />
                    </Link>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
