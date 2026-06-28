/**
 * DynamicPage — admin-authored static pages rendered from Firestore.
 *
 * Restyled to the new design language. All data wiring preserved.
 */

import { useParams, Link } from "react-router-dom";
import { useCollection } from "../hooks/useFirestore";
import { where } from "firebase/firestore";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../App";
import { DynamicContent } from "../components/DynamicContent";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin } = useAuth();
  const { data: pages, loading } = useCollection<any>("dynamic_pages", [where("slug", "==", slug || "")]);
  const page = pages[0];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-text-heading border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page || (!page.published && !isAdmin)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-bg-card border border-border-main rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-7 h-7 text-text-heading" strokeWidth={1.75} />
        </div>
        <p className="eyebrow tabular text-accent mb-2">404 · NOT FOUND</p>
        <h1 className="font-display text-4xl text-text-heading mb-3">Page not found</h1>
        <p className="text-text-body max-w-sm text-[14px] mb-6">
          The content you are looking for might have been moved or deleted by an administrator.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to the network
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto py-12 px-4 md:px-6">
      <header className="mb-10 md:mb-12 pb-8 border-b border-border-main">
        <div className="flex items-center gap-3 mb-4">
          {isAdmin && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded eyebrow tabular ${
                page.published ? "bg-accent/10 text-accent border border-accent/20" : "bg-bg-main text-text-body/60 border border-border-main"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${page.published ? "bg-accent soft-pulse" : "bg-text-body/40"}`} />
              {page.published ? "Live" : "Draft"}
            </span>
          )}
          <span className="eyebrow tabular text-text-body/40">/page/{page.slug}</span>
        </div>
        <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">{page.title}</h1>
      </header>

      <div className="dynamic-content-area prose prose-stone max-w-none">
        <DynamicContent content={page.content} />
      </div>
    </motion.div>
  );
}
