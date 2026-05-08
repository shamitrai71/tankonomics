import { useCollection } from "../hooks/useFirestore";
import { orderBy } from "firebase/firestore";
import { ExternalLink, Clock, Newspaper } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function News() {
  const { data: newsItems, loading } = useCollection<any>("news", [orderBy("createdAt", "desc")]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Newspaper className="text-slate-900" />
            Industry News Feed
          </h1>
          <p className="text-gray-500">Curated global headlines for tank storage, terminals, and energy logistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse h-80"></div>
          ))
        ) : (
          newsItems.map((item: any) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all group flex flex-col"
            >
              <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center border-b border-gray-100">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Newspaper className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-bold tracking-wider">
                    {item.source}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) : "Recently"}
                  </div>
                </div>
                <h2 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                  {item.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors flex items-center gap-1">
                    Read Article <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.a>
          ))
        )}
      </div>
      
      {!loading && newsItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No news curated yet</h3>
          <p className="text-gray-500">Industry updates will appear here once added by administrators.</p>
        </div>
      )}
    </div>
  );
}
