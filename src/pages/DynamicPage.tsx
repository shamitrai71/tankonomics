import { useParams, Navigate, Link } from "react-router-dom";
import { useCollection } from "../hooks/useFirestore";
import { where } from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  Loader2, 
  AlertCircle, 
  ArrowRight,
} from "lucide-react";
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
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!page || (!page.published && !isAdmin)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
           <AlertCircle className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 max-w-sm">The content you are looking for might have been moved or deleted by an administrator.</p>
        <Link to="/" className="mt-6 text-indigo-600 font-bold hover:underline flex items-center gap-2">
           <ArrowRight className="w-4 h-4 rotate-180" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-12 px-6"
    >
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
           {isAdmin && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${page.published ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                 {page.published ? "Live System" : "Internal Draft"}
              </span>
           )}
           <span className="text-[10px] font-mono text-slate-400">/page/{page.slug}</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6">{page.title}</h1>
        <div className="h-1.5 w-32 bg-indigo-600 rounded-full"></div>
      </div>

      <div className="dynamic-content-area">
        <DynamicContent content={page.content} />
      </div>
    </motion.div>
  );
}
