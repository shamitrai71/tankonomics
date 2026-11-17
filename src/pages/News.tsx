/**
 * News — industry headlines, linked to their publishers.
 *
 * An editorial list: thumbnail, publisher, date added, headline, summary and
 * an explicit link out. Stories are third-party reporting, so none is labelled
 * as an official update.
 */

import { PageHeader } from "../components/PageHeader";
import { SafeImage } from "../components/SafeImage";
import { useCollection } from "../hooks/useFirestore";
import { usePageCopy } from "../lib/pageCopy";
import { orderBy } from "firebase/firestore";
import { ExternalLink, Newspaper } from "lucide-react";
import { format } from "date-fns";

/** "www.example.com" -> "example.com"; anything else is shown as stored. */
export function publisherName(source?: string) {
  return (source || "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

export default function News() {
  const copy = usePageCopy("news");
  const { data: newsItems, loading } = useCollection<any>("news", [orderBy("createdAt", "desc")]);

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="page-frame py-6 md:py-8">
        <PageHeader title={copy.title} description={copy.subtitle} />

        <div className="max-w-[880px] space-y-4">
          {loading &&
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-card border border-border-main rounded-lg p-4 flex gap-4 animate-pulse">
                <div className="hidden sm:block w-56 aspect-video bg-bg-main rounded-md shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-3 bg-bg-main rounded w-1/3" />
                  <div className="h-4 bg-bg-main rounded w-5/6" />
                  <div className="h-3 bg-bg-main rounded w-full" />
                </div>
              </div>
            ))}

          {!loading &&
            newsItems.map((item: any) => {
              const publisher = publisherName(item.source);
              const added = item.createdAt?.seconds ? format(item.createdAt.seconds * 1000, "d MMM yyyy") : "";
              return (
                <article key={item.id} className="bg-bg-card border border-border-main rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                  <SafeImage
                    src={item.image}
                    className="w-full sm:w-56 aspect-video rounded-md border border-border-main object-cover shrink-0 self-start"
                    fallback={<Newspaper className="w-7 h-7" strokeWidth={1.5} />}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-text-body">
                      {publisher && <span className="font-medium text-text-heading">{publisher}</span>}
                      {publisher && added && <span aria-hidden="true"> · </span>}
                      {added && <span>Added {added}</span>}
                      {item.isOfficial && <span className="ml-2 inline-flex px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[12px] font-medium">Official update</span>}
                    </p>
                    <h2 className="text-[18px] font-semibold leading-snug mt-1">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-text-heading hover:underline">
                        {item.title}
                      </a>
                    </h2>
                    {item.description && (
                      <p className="text-[15px] text-text-body line-clamp-2 mt-1.5">{item.description}</p>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-[14px] font-medium text-primary hover:underline"
                    >
                      Read article{publisher ? ` at ${publisher}` : ""}
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span className="sr-only">(opens the publisher's site in a new tab)</span>
                    </a>
                  </div>
                </article>
              );
            })}

          {!loading && newsItems.length === 0 && (
            <div className="bg-bg-card border border-border-main rounded-lg px-5 py-6 flex items-start gap-3">
              <Newspaper className="w-5 h-5 text-text-body mt-0.5 shrink-0" strokeWidth={1.75} />
              <div>
                <p className="text-[15px] font-medium text-text-heading">No news has been added yet</p>
                <p className="text-[14px] text-text-body mt-0.5">Stories appear here when an administrator adds them.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
