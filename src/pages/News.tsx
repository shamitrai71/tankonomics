/**
 * News — curated industry headlines.
 *
 * Restyled to match the rest of the app:
 *   - Instrument Serif display heading, mono eyebrow
 *   - Paper-warm canvas, paper-weight border cards
 *   - Safety-orange "Official update" tag on each story
 */

import { useCollection } from "../hooks/useFirestore";
import { orderBy } from "firebase/firestore";
import { ExternalLink, Clock, Newspaper } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function News() {
  const { data: newsItems, loading } = useCollection<any>("news", [orderBy("createdAt", "desc")]);

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Heading */}
        <header className="mb-10 md:mb-14 relative">
          <div className="absolute inset-x-0 top-0 h-32 bp-grid-paper opacity-50 pointer-events-none" />
          <div className="relative">
            <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
              GLOBAL HEADLINES
            </div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
              Industry news, indexed.
            </h1>
            <p className="text-text-body text-[15px] mt-3 max-w-xl">
              Curated headlines covering tank storage, terminals, refineries and energy logistics — refreshed as the wire moves.
            </p>
          </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-bg-card border border-border-main rounded-2xl overflow-hidden h-80 animate-pulse">
                  <div className="h-44 bg-bg-main" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-bg-main rounded w-1/3" />
                    <div className="h-4 bg-bg-main rounded w-5/6" />
                    <div className="h-3 bg-bg-main rounded w-full" />
                  </div>
                </div>
              ))
            : newsItems.map((item: any) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-bg-card border border-border-main rounded-2xl overflow-hidden hover:border-text-heading transition-all flex flex-col"
                >
                  <div className="h-48 overflow-hidden bg-bg-main border-b border-border-main flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <Newspaper className="w-10 h-10 text-text-body/25" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 bg-bg-main border border-border-main text-text-body px-2 py-0.5 rounded eyebrow tabular">
                        <Newspaper className="w-3 h-3" strokeWidth={1.75} />
                        {item.source || "News"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-2 py-0.5 rounded eyebrow tabular border border-accent/20">
                        Official update
                      </span>
                    </div>
                    <h2 className="font-display text-xl text-text-heading leading-tight mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-[14px] text-text-body/85 line-clamp-3 mb-5 leading-relaxed flex-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border-main">
                      <span className="eyebrow tabular text-text-body/50 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" strokeWidth={1.75} />
                        {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) + " ago" : "Just now"}
                      </span>
                      <span className="eyebrow tabular text-text-heading flex items-center gap-1.5 group-hover:text-accent transition-colors">
                        Read article <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
        </div>

        {!loading && newsItems.length === 0 && (
          <div className="text-center py-20 bg-bg-card border border-dashed border-border-main rounded-2xl">
            <Newspaper className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
            <p className="eyebrow tabular text-text-body/55 mb-1">NO HEADLINES</p>
            <h3 className="font-display text-2xl text-text-heading mb-2">Nothing curated yet</h3>
            <p className="text-text-body text-[14px]">Industry updates will appear here once added by administrators.</p>
          </div>
        )}
      </div>
    </div>
  );
}
