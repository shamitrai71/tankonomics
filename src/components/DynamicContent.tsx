/**
 * DynamicContent — renders admin-authored markdown with embeddable widgets.
 *
 * Widget tokens like [[WIDGET_NEWS]] are replaced with live React widgets that
 * pull from Firestore. All widgets restyled to match the established design
 * language. Data wiring preserved verbatim.
 */

import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useCollection } from "../hooks/useFirestore";
import { orderBy, limit } from "firebase/firestore";
import {
  Newspaper,
  Calendar,
  BarChart3,
  Building2,
  FileText,
  MessageSquare,
  ArrowRight,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const WidgetRenderer = ({ type }: { type: string }) => {
  const token = type.replace("[[", "").replace("]]", "");

  if (token === "WIDGET_NEWS") return <NewsWidget />;
  if (token === "WIDGET_EVENTS") return <EventsWidget />;
  if (token === "WIDGET_SURVEYS") return <SurveysWidget />;
  if (token === "WIDGET_COMPANIES") return <CompaniesWidget />;
  if (token === "WIDGET_RESUMES") return <ResumesWidget />;
  if (token === "WIDGET_FORUMS") return <ForumsWidget />;

  return (
    <div className="my-6 p-4 bg-bg-main border border-dashed border-border-main rounded-xl eyebrow tabular text-text-body/40 text-center">
      UNKNOWN BLOCK · {token}
    </div>
  );
};

const NewsWidget = () => {
  const { data: news, loading } = useCollection<any>("news", [orderBy("createdAt", "desc"), limit(3)]);
  if (loading) return <div className="my-8 h-32 bg-bg-card border border-border-main rounded-2xl animate-pulse" />;
  return (
    <div className="my-10 not-prose">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="eyebrow tabular text-text-body/55 flex items-center gap-2">
            <Newspaper className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            Latest insights
          </p>
          <h3 className="font-display text-2xl text-text-heading mt-1">Industry headlines</h3>
        </div>
        <Link to="/news" className="eyebrow tabular text-accent inline-flex items-center gap-1 hover:underline">
          All news <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener"
            className="group bg-bg-card border border-border-main p-5 rounded-2xl hover:border-text-heading transition-all"
          >
            <p className="eyebrow tabular text-accent mb-2">{item.source}</p>
            <h4 className="text-[14px] font-medium text-text-heading group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-3">
              {item.title}
            </h4>
            <span className="eyebrow tabular text-text-body/45 inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) + " ago" : "Just now"}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

const EventsWidget = () => {
  const { data: events, loading } = useCollection<any>("events", [orderBy("startDate", "asc"), limit(3)]);
  if (loading) return <div className="my-8 h-32 bg-bg-card border border-border-main rounded-2xl animate-pulse" />;
  return (
    <div className="my-10 bg-primary text-white p-7 rounded-2xl grain relative overflow-hidden not-prose">
      <div className="absolute inset-0 bp-grid opacity-40 pointer-events-none" />
      <div className="relative">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="eyebrow tabular text-accent flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
              Operational calendar
            </p>
            <h3 className="font-display text-2xl mt-1">Upcoming sessions</h3>
          </div>
          <Link to="/events" className="eyebrow tabular text-accent hover:text-white transition-colors inline-flex items-center gap-1">
            All sessions <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
          </Link>
        </div>
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="w-10 h-10 bg-accent/15 border border-accent/30 rounded-lg flex items-center justify-center text-accent shrink-0">
                <Calendar className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[14px] truncate">{event.title}</h4>
                <p className="eyebrow tabular text-white/55 mt-0.5 truncate">
                  {event.location} · {event.startDate}
                </p>
              </div>
              <Link to="/events" className="p-2 hover:bg-white/10 rounded-lg">
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SurveysWidget = () => {
  const { data: surveys, loading } = useCollection<any>("surveys", [orderBy("createdAt", "desc"), limit(1)]);
  if (loading || !surveys[0]) return null;
  const survey = surveys[0];
  return (
    <div className="my-10 p-7 bg-bg-card border border-border-main rounded-2xl relative overflow-hidden not-prose">
      <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none">
        <TrendingUp className="w-40 h-40 text-accent" strokeWidth={1} />
      </div>
      <div className="relative">
        <p className="eyebrow tabular text-accent mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
          Live industry pulse
        </p>
        <h4 className="font-display text-3xl text-text-heading mb-2 leading-tight">
          {survey.title || survey.question}
        </h4>
        {survey.title && survey.question && (
          <p className="text-text-body text-[14px] mb-5 leading-relaxed">{survey.question}</p>
        )}
        <Link
          to="/surveys"
          className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[13px] font-medium hover:brightness-110 transition-all"
        >
          Contribute data <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
};

const CompaniesWidget = () => {
  const { data: companies, loading } = useCollection<any>("companies", [limit(4)]);
  if (loading) return <div className="my-8 h-24 bg-bg-card border border-border-main rounded-2xl animate-pulse" />;
  return (
    <div className="my-10 not-prose">
      <p className="eyebrow tabular text-text-body/55 mb-4">Spotlight partners</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            to="/businesses"
            className="bg-bg-card border border-border-main p-4 rounded-2xl hover:border-text-heading transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 bg-bg-main border border-border-main rounded-xl mb-3 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              {company.logo ? (
                <img src={company.logo} alt="" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-5 h-5 text-text-body/40" strokeWidth={1.5} />
              )}
            </div>
            <p className="text-[13px] font-medium text-text-heading line-clamp-1">{company.name}</p>
            {company.category && (
              <p className="eyebrow tabular text-text-body/55 mt-0.5 truncate w-full">{company.category}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

const ResumesWidget = () => {
  const { data: resumes, loading } = useCollection<any>("resumes", [orderBy("createdAt", "desc"), limit(4)]);
  if (loading) return null;
  return (
    <div className="my-10 not-prose">
      <p className="eyebrow tabular text-text-body/55 mb-4">Recent profiles</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="p-4 bg-bg-card border border-border-main rounded-2xl flex items-center gap-3 hover:border-text-heading transition-all"
          >
            <div className="w-10 h-10 bg-bg-main border border-border-main rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-accent" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-medium text-text-heading truncate">{resume.fullName}</h4>
              <p className="eyebrow tabular text-text-body/55 mt-0.5 truncate">{resume.jobTitle}</p>
            </div>
            <Link to="/directory" className="p-2 hover:bg-bg-main rounded-lg transition-colors">
              <ArrowRight className="w-4 h-4 text-text-body/40" strokeWidth={1.75} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const ForumsWidget = () => {
  const { data: topics, loading } = useCollection<any>("forum_topics", [orderBy("lastPostAt", "desc"), limit(3)]);
  if (loading) return null;
  return (
    <div className="my-10 border-y border-border-main py-8 not-prose">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="eyebrow tabular text-text-body/55 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            Technical pulse
          </p>
          <h3 className="font-display text-2xl text-text-heading mt-1">Recent discussions</h3>
        </div>
        <Link to="/forums" className="eyebrow tabular text-accent hover:underline inline-flex items-center gap-1">
          Discuss <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {topics.map((topic) => (
          <Link key={topic.id} to="/forums" className="group">
            <h4 className="text-[14px] font-medium text-text-heading group-hover:text-accent transition-colors line-clamp-2 mb-2 leading-snug">
              {topic.title}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="eyebrow tabular bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">
                {topic.category}
              </span>
              <span className="eyebrow tabular text-text-body/45">{topic.replyCount || 0} replies</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

interface DynamicContentProps {
  content: string;
}

export const DynamicContent = ({ content }: DynamicContentProps) => {
  const parts = content.split(/(\[\[WIDGET_\w+\]\])/);

  return (
    <div className="dynamic-content-container">
      {parts.map((part, index) => {
        if (part.startsWith("[[WIDGET_")) {
          return <WidgetRenderer key={index} type={part} />;
        }
        return (
          <div key={index} className="prose prose-stone max-w-none mb-4 last:mb-0">
            <div className="markdown-body">
              <ReactMarkdown>{part}</ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
};
