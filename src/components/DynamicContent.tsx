import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useCollection } from "../hooks/useFirestore";
import { where, orderBy, limit } from "firebase/firestore";
import { 
  Newspaper, 
  Calendar, 
  BarChart3, 
  Building2, 
  FileText, 
  MessageSquare,
  ArrowRight,
  Clock,
  TrendingUp
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

  return <div className="p-4 bg-slate-100 rounded-xl text-[10px] font-mono text-slate-400 uppercase">Unknown Block: {token}</div>;
};

const NewsWidget = () => {
    const { data: news, loading } = useCollection<any>("news", [orderBy("createdAt", "desc"), limit(3)]);
    if (loading) return <div className="h-32 bg-slate-50 rounded-2xl animate-pulse" />;
    return (
      <div className="my-8 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-indigo-500" /> Latest Industry Insights
          </h3>
          <Link to="/news" className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
            Broadcast Center <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.map(item => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener" className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter mb-2">{item.source}</p>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-3">{item.title}</h4>
              <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase">
                 <Clock className="w-3 h-3" /> {item.createdAt?.seconds ? formatDistanceToNow(item.createdAt.seconds * 1000) + " ago" : "Just now"}
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };
  
  const EventsWidget = () => {
    const { data: events, loading } = useCollection<any>("events", [orderBy("startDate", "asc"), limit(3)]);
    if (loading) return <div className="h-32 bg-slate-50 rounded-2xl animate-pulse" />;
    return (
      <div className="my-8 bg-slate-900 p-8 rounded-[2.5rem] text-white">
         <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400" /> Operational Calendar
          </h3>
          <Link to="/events" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">View All</Link>
        </div>
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
              <div className="bg-indigo-600/20 p-3 rounded-xl">
                 <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-sm">{event.title}</h4>
                 <p className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-widest">{event.location} • {event.startDate}</p>
              </div>
              <Link to="/events" className="p-2 hover:bg-white/10 rounded-lg">
                 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const SurveysWidget = () => {
     const { data: surveys, loading } = useCollection<any>("surveys", [orderBy("createdAt", "desc"), limit(1)]);
     if (loading || !surveys[0]) return null;
     const survey = surveys[0];
     return (
        <div className="my-8 p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] relative overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <BarChart3 className="w-5 h-5 text-indigo-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Industry Pulse</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{survey.title}</h4>
              <p className="text-slate-500 mb-6 text-sm font-medium">{survey.question}</p>
              <Link to="/surveys" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                 Contribute Data <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
           <TrendingUp className="absolute -bottom-10 -right-10 w-48 h-48 text-indigo-600/5 rotate-12" />
        </div>
     );
  };
  
  const CompaniesWidget = () => {
     const { data: companies, loading } = useCollection<any>("companies", [limit(4)]);
     if (loading) return <div className="h-24 bg-slate-50 rounded-2xl animate-pulse" />;
     return (
        <div className="my-8">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Spotlight Partners</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {companies.map(company => (
                 <Link key={company.id} to={`/businesses`} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl mb-3 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                       {company.logo ? (
                          <img src={company.logo} alt="" className="w-full h-full object-contain" />
                       ) : (
                          <Building2 className="w-6 h-6 text-slate-300" />
                       )}
                    </div>
                    <p className="text-xs font-black text-slate-900 line-clamp-1">{company.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{company.category}</p>
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
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
           {resumes.map(resume => (
              <div key={resume.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-500" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-slate-900">{resume.fullName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{resume.jobTitle}</p>
                 </div>
                 <Link to="/directory" className="ml-auto p-2 hover:bg-white rounded-lg transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                 </Link>
              </div>
           ))}
        </div>
     );
  };
  
  const ForumsWidget = () => {
     const { data: topics, loading } = useCollection<any>("forum_topics", [orderBy("lastPostAt", "desc"), limit(3)]);
     if (loading) return null;
     return (
        <div className="my-8 border-y border-slate-100 py-8">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-indigo-500" /> Technical Pulse
              </h3>
              <Link to="/forums" className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 hover:underline">Discuss Now</Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topics.map(topic => (
                 <Link key={topic.id} to="/forums" className="group">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">{topic.title}</h4>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                       <span className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600">{topic.category}</span>
                       <span>{topic.replyCount || 0} Replies</span>
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
          <div key={index} className="prose prose-slate prose-lg max-w-none mb-4 last:mb-0">
            <div className="markdown-body">
              <ReactMarkdown>{part}</ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
};
