import { useCollection, createDocument, removeDocument } from "../hooks/useFirestore";
import { useAuth } from "../App";
import { orderBy, where, serverTimestamp } from "firebase/firestore";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  ExternalLink,
  ChevronRight,
  Plus,
  Bell,
  BellOff,
  ChevronLeft,
  Search,
  Clock,
  Info,
  Filter,
  CalendarDays,
  Mic,
  Presentation,
  CalendarPlus,
  X,
  CheckCircle2
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isTomorrow,
  isWithinInterval,
  addWeeks,
  addDays,
  isAfter,
  startOfDay,
  endOfDay
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { CategorySelector } from "../components/CategorySelector";

export default function Events() {
  const { user, profile, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    location: "",
    imageUrl: "",
    categoryIds: [] as string[],
    companyId: "",
    companyName: "",
    companyLogo: ""
  });

  useEffect(() => {
    if (isCreating && ownedCompanies.length === 1 && !newEvent.companyId) {
      setNewEvent(prev => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo
      }));
    }
  }, [isCreating, ownedCompanies]);

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    await createDocument("events", {
      ...newEvent,
      organizerUid: user?.uid,
      createdAt: serverTimestamp()
    });
    setNewEvent({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      time: "10:00",
      location: "",
      imageUrl: "",
      categoryIds: [],
      companyId: "",
      companyName: "",
      companyLogo: ""
    });
    setIsCreating(false);
  };
  
  const { data: events, loading } = useCollection<any>("events", [orderBy("date", "asc")]);
  const { data: userReminders } = useCollection<any>("event_reminders", [where("userUid", "==", user?.uid || "")]);
  const { data: categories } = useCollection<any>("company_categories");
  const { data: allAttendees } = useCollection<any>("event_attendees");

  const eventAttendees = useMemo(() => {
    if (!selectedEvent || !allAttendees) return [];
    return allAttendees.filter((a: any) => a.eventId === selectedEvent.id);
  }, [allAttendees, selectedEvent]);

  const isAttending = (eventId: string) => {
    if (!user || !allAttendees) return false;
    return allAttendees.some((a: any) => a.eventId === eventId && a.userUid === user.uid);
  };

  const attendeeCount = (eventId: string) => {
    if (!allAttendees) return 0;
    return allAttendees.filter((a: any) => a.eventId === eventId).length;
  };

  const handleToggleAttendance = async (event: any) => {
    if (!user || !event) return;
    const attendance = allAttendees.find((a: any) => a.eventId === event.id && a.userUid === user.uid);
    if (attendance) {
      await removeDocument("event_attendees", attendance.id);
    } else {
      await createDocument("event_attendees", {
        eventId: event.id,
        userUid: user.uid,
        userName: profile?.displayName || user.displayName || "Technician",
        userPhoto: profile?.photoURL || user.photoURL || "",
        companyName: profile?.companyName || "",
        status: "confirmed",
        timestamp: serverTimestamp()
      });
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date();
    const todayStart = startOfDay(now);
    
    return events.filter((event: any) => {
      const eventDate = new Date(event.date);
      
      if (dateFilter === "range" && customRange.start && customRange.end) {
        return isWithinInterval(eventDate, {
          start: startOfDay(new Date(customRange.start)),
          end: endOfDay(new Date(customRange.end))
        });
      }

      if (dateFilter === "today") {
        return isSameDay(eventDate, now);
      }
      
      if (dateFilter === "this-week") {
        return isWithinInterval(eventDate, {
          start: startOfWeek(now),
          end: endOfWeek(now)
        });
      }
      
      if (dateFilter === "next-month") {
        const nextMonth = addMonths(now, 1);
        const startOfNext = startOfMonth(nextMonth);
        const endOfNext = endOfMonth(nextMonth);
        return isWithinInterval(eventDate, { start: startOfNext, end: endOfNext });
      }
      
      if (dateFilter === "upcoming") {
        return isAfter(eventDate, todayStart);
      }

      return true; // "all"
    });
  }, [events, dateFilter, customRange]);

  const isReminded = (eventId: string) => userReminders.some(r => r.eventId === eventId);

  const getGoogleCalendarLink = (event: any) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");
    const start = format(new Date(event.date), "yyyyMMdd'T'HHmmss");
    // Default to a 2 hour technical session
    const end = format(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), "yyyyMMdd'T'HHmmss");
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  };

  const toggleReminder = async (event: any) => {
    if (!user) return;
    const reminder = userReminders.find(r => r.eventId === event.id);
    if (reminder) {
      await removeDocument("event_reminders", reminder.id);
    } else {
      await createDocument("event_reminders", {
        eventId: event.id,
        userUid: user.uid,
        eventName: event.title,
        eventDate: event.date,
        reminderSent: false
      });
    }
  };

  const dayEvents = (day: Date) => events.filter(e => isSameDay(new Date(e.date), day));

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 bg-bg-main/50 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary rounded-2xl shadow-xl shadow-border-main">
                <CalendarIcon className="text-white w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-text-heading tracking-tight">Technical Calendar</h1>
           </div>
           <p className="text-text-body font-medium text-lg">Orchestrating industry technical exchanges and site visits.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-bg-card p-1.5 rounded-2xl border border-border-main shadow-sm">
           <button 
             onClick={() => setView("list")}
             className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "list" ? "bg-primary text-white shadow-lg shadow-border-main" : "text-text-body/40 hover:text-text-body/60"}`}
           >
             List View
           </button>
           <button 
             onClick={() => setView("calendar")}
             className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "calendar" ? "bg-primary text-white shadow-lg shadow-border-main" : "text-text-body/40 hover:text-text-body/60"}`}
           >
             Calendar Grid
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence>
            {isCreating && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-bg-card border border-border-main rounded-[2.5rem] p-10 overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-text-heading uppercase tracking-tighter">Initiate Global Session</h2>
                  <button onClick={() => setIsCreating(false)} className="p-3 bg-bg-main hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all"><X className="w-5 h-5 text-text-body/40" /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   <div className="space-y-6">
                     <div>
                       <label className="text-[10px] font-black text-text-body/40 uppercase mb-2 block tracking-widest">Event Designation</label>
                       <input 
                         type="text" 
                         placeholder="Technical Webinar, Site Tour, etc."
                         className="w-full px-6 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-text-heading"
                         value={newEvent.title}
                         onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-text-body/40 uppercase mb-2 block tracking-widest">Temporal Schedule</label>
                       <div className="grid grid-cols-2 gap-4">
                         <input 
                           type="date" 
                           className="w-full px-6 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-text-heading"
                           value={newEvent.date}
                           onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                         />
                         <input 
                           type="time" 
                           className="w-full px-6 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-text-heading"
                           value={newEvent.time}
                           onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                         />
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-text-body/40 uppercase mb-2 block tracking-widest">Operational Location</label>
                       <div className="relative">
                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" />
                         <input 
                           type="text" 
                           placeholder="Terminal HQ or Digital Bridge"
                           className="w-full pl-12 pr-6 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-text-heading"
                           value={newEvent.location}
                           onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                         />
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-text-body/40 uppercase mb-2 block tracking-widest">Sectors (Select Multiple)</label>
                       <CategorySelector 
                         categories={categories}
                         selectedIds={newEvent.categoryIds}
                         onChange={(ids) => setNewEvent({...newEvent, categoryIds: ids})}
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-6">
                     <div>
                       <label className="text-[10px] font-black text-text-body/40 uppercase mb-2 block tracking-widest">Session Intelligence</label>
                       <textarea 
                         placeholder="Brief technical description..."
                         className="w-full px-6 py-4 bg-bg-main border border-border-main rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-text-heading h-[130px] resize-none"
                         value={newEvent.description}
                         onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                       />
                     </div>
                     {ownedCompanies.length > 0 && (
                       <div>
                         <label className="text-[10px] font-black text-text-body/40 uppercase mb-2 block tracking-widest">Organizer Identity</label>
                         <div className="flex flex-wrap gap-2">
                            {ownedCompanies.map(company => (
                              <button 
                                key={company.id}
                                onClick={() => setNewEvent({...newEvent, companyId: company.id, companyName: company.name, companyLogo: company.logo})}
                                className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${newEvent.companyId === company.id ? "bg-primary text-white border-primary" : "bg-bg-main text-text-body/40 border-border-main"}`}
                              >
                                {company.name}
                              </button>
                            ))}
                            <button 
                               onClick={() => setNewEvent({...newEvent, companyId: "", companyName: "", companyLogo: ""})}
                               className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${!newEvent.companyId ? "bg-primary text-white border-primary" : "bg-bg-main text-text-body/40 border-border-main"}`}
                            >
                               Personal
                            </button>
                         </div>
                       </div>
                     )}
                   </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button onClick={() => setIsCreating(false)} className="px-8 py-4 text-text-body/40 font-black uppercase text-[11px] tracking-widest hover:text-text-heading">Abort</button>
                  <button 
                    onClick={handleCreateEvent}
                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                  >
                    Deploy Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {view === "list" ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-44 bg-bg-card border border-border-main rounded-3xl animate-pulse" />)
                ) : filteredEvents.length === 0 ? (
                  <div className="bg-bg-card border-2 border-dashed border-border-main rounded-[3rem] p-24 text-center">
                     <CalendarIcon className="w-20 h-20 text-text-body/10 mx-auto mb-6" />
                     <h3 className="text-xl font-black text-text-heading mb-2">No Sessions Found</h3>
                     <p className="text-text-body/40 font-medium">Try adjusting your date filters or check back later for new technical schedule releases.</p>
                  </div>
                ) : (
                  filteredEvents.map((event: any, i: number) => {
                    const category = categories.find(c => c.id === event.categoryId);
                    const subCategory = categories.find(c => c.id === event.subCategoryId);
                    
                    return (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-bg-card border border-border-main rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 min-h-[220px]"
                      >
                        {/* Image / Date Column */}
                        <div 
                          className="relative w-full md:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-primary cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          {event.imageUrl ? (
                            <img 
                              src={event.imageUrl} 
                              className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" 
                              alt={event.title}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              <CalendarIcon className="w-20 h-20 text-white" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 flex flex-col items-center bg-bg-card/90 backdrop-blur-md rounded-2xl p-3 min-w-[60px] shadow-xl group-hover:bg-secondary transition-colors duration-500">
                             <span className="text-[10px] font-black uppercase tracking-widest text-text-body/40 group-hover:text-white/70">
                               {format(new Date(event.date), 'MMM')}
                             </span>
                             <span className="text-2xl font-black text-text-heading group-hover:text-white">
                               {format(new Date(event.date), 'dd')}
                             </span>
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="p-8 flex-1 flex flex-col justify-between">
                           <div>
                              <div className="flex items-start justify-between gap-4 mb-4">
                                 <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      {event.categoryIds?.map((cid: string) => (
                                        <span key={cid} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[9px] font-black uppercase tracking-widest">
                                          {categories.find(c => c.id === cid)?.name}
                                        </span>
                                      ))}
                                      {(!event.categoryIds || event.categoryIds.length === 0) && (
                                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[9px] font-black uppercase tracking-widest">
                                          Technical Session
                                        </span>
                                      )}
                                    </div>
                                    <h3 
                                      className="text-2xl font-black text-text-heading group-hover:text-secondary transition-colors leading-tight mb-2 uppercase tracking-tight cursor-pointer"
                                      onClick={() => setSelectedEvent(event)}
                                    >
                                      {event.title}
                                    </h3>
                                 </div>
                                 <button 
                                   onClick={() => toggleReminder(event)}
                                   className={`p-3 rounded-2xl transition-all ${isReminded(event.id) ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-bg-main text-text-body/40 hover:bg-bg-main/80"}`}
                                   title={isReminded(event.id) ? "Remove Reminder" : "Set Reminder"}
                                 >
                                   {isReminded(event.id) ? <Bell className="w-5 h-5 fill-current" /> : <BellOff className="w-5 h-5" />}
                                 </button>
                              </div>
                              <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed text-sm mb-6">
                                {event.description}
                              </p>

                              {/* Enhanced Metadata Section */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                 <div>
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Mic className="w-3 h-3 text-secondary" /> Keynote Speakers
                                   </h4>
                                   <div className="flex -space-x-2">
                                      {[1, 2].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden" title="Speaker Name">
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=speaker${i}${event.id}`} alt="Speaker" />
                                        </div>
                                      ))}
                                      <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[9px] font-black text-indigo-600">
                                        +1
                                      </div>
                                   </div>
                                 </div>
                                 <div>
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Presentation className="w-3 h-3 text-secondary" /> Related Sessions
                                   </h4>
                                   <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-slate-600 truncate underline decoration-indigo-200 cursor-pointer hover:text-indigo-600">Site Safety Protocols 2026</p>
                                      <p className="text-[10px] font-bold text-slate-400 truncate">Vapor Recovery Systems Deep-Dive</p>
                                   </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100">
                              <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                   <MapPin className="w-3.5 h-3.5 text-secondary" /> {event.location}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                   <Clock className="w-3.5 h-3.5 text-secondary" /> {format(new Date(event.date), 'hh:mm a')}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                   <Users className="w-3.5 h-3.5 text-secondary" /> {attendeeCount(event.id)} Attending
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleToggleAttendance(event)}
                                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border shadow-sm ${isAttending(event.id) ? "bg-secondary text-white border-secondary" : "bg-bg-main text-text-body/40 border-border-main hover:bg-bg-main/80"}`}
                                >
                                  {isAttending(event.id) ? <CheckCircle2 className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
                                  {isAttending(event.id) ? "Attending" : "Join Event"}
                                </button>

                                <a 
                                  href={getGoogleCalendarLink(event)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-3 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border border-secondary/20 shadow-sm"
                                  title="Add to Google Calendar"
                                >
                                  <CalendarPlus className="w-4 h-4" />
                                  Add to Calendar
                                </a>

                                {event.ctaUrl ? (
                                  <a 
                                    href={event.ctaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/btn flex items-center gap-3 bg-primary text-white hover:bg-secondary transition-all duration-300 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-border-main"
                                  >
                                    {event.ctaText || "Register Now"}
                                    <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group/btn cursor-pointer">
                                     Session Registration <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                  </div>
                                )}
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-bg-card border border-border-main rounded-[3rem] p-8 shadow-sm"
              >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-2xl font-black text-text-heading">{format(currentMonth, 'MMMM yyyy')}</h2>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-border-main border border-border-main rounded-3xl overflow-hidden shadow-inner">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                     <div key={day} className="bg-slate-50 py-4 text-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day}</span>
                     </div>
                   ))}
                   {calendarDays.map(day => {
                     const dayEvs = dayEvents(day);
                     const isCurrentMonth = isSameMonth(day, monthStart);
                     const isToday = isSameDay(day, new Date());
                     
                     return (
                       <div 
                         key={day.toString()} 
                         onClick={() => dayEvs.length > 0 && setSelectedDay(day)}
                         className={`min-h-[120px] p-2 bg-white transition-all cursor-pointer hover:bg-slate-50 group border-t border-l border-slate-100 ${!isCurrentMonth ? "opacity-20" : ""}`}
                       >
                         <div className="flex items-center justify-between mb-1">
                            <span className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded-lg transition-all ${isToday ? "bg-secondary text-white shadow-lg shadow-secondary/10" : "text-text-body/40 group-hover:text-text-heading"}`}>
                              {format(day, 'd')}
                            </span>
                         </div>
                         <div className="space-y-1">
                           {dayEvs.map((e: any) => (
                             <div key={e.id} className="p-2 bg-secondary/10 border border-secondary/20 rounded-xl">
                                <p className="text-[9px] font-black text-secondary leading-tight line-clamp-1">{e.title}</p>
                                <div className="flex items-center gap-1 mt-1 opacity-40">
                                   <Clock className="w-2.5 h-2.5" />
                                   <span className="text-[8px] font-black">{format(new Date(e.date), 'h:mm a')}</span>
                                </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-8">
           {/* Date Filter */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Filter className="w-4 h-4 text-secondary" /> Filter by Date
              </h3>
              <div className="space-y-2">
                 {[
                   { id: "all", label: "Full Calendar", icon: CalendarDays },
                   { id: "today", label: "Today's Briefing", icon: Clock },
                   { id: "this-week", label: "Current Week", icon: CalendarIcon },
                   { id: "next-month", label: "Next Month's Outlook", icon: ChevronRight },
                   { id: "upcoming", label: "Coming Soon", icon: Plus }
                 ].map((filter) => (
                   <button
                     key={filter.id}
                     onClick={() => {
                        setDateFilter(filter.id);
                        setView("list");
                     }}
                     className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                       dateFilter === filter.id
                         ? "bg-sidebar-focus text-sidebar-focus-text shadow-xl shadow-border-main"
                         : "text-text-body/60 hover:bg-bg-main hover:text-text-heading"
                     }`}
                   >
                     <filter.icon className={`w-4 h-4 ${dateFilter === filter.id ? "text-secondary" : "text-text-body/20"}`} />
                     {filter.label}
                   </button>
                 ))}
              </div>

              {/* Custom Range Picker */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                 <button 
                   onClick={() => {
                     setDateFilter("range");
                     setView("list");
                   }}
                   className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all mb-4 ${
                     dateFilter === "range"
                       ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                       : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                   }`}
                 >
                   <CalendarDays className={`w-4 h-4 ${dateFilter === "range" ? "text-indigo-400" : "text-slate-300"}`} />
                   Custom Range
                 </button>

                 <AnimatePresence>
                   {dateFilter === "range" && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       exit={{ opacity: 0, height: 0 }}
                       className="space-y-4 overflow-hidden"
                     >
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Start Date</label>
                           <input 
                             type="date" 
                             value={customRange.start}
                             onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-1">End Date</label>
                           <input 
                             type="date" 
                             value={customRange.end}
                             onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                           />
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>

           {/* Summary Stats */}
           <div className="bg-sidebar-focus rounded-[2.5rem] p-8 text-sidebar-focus-text relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
              <Bell className="w-10 h-10 opacity-50 mb-6" />
              <h3 className="text-xl font-black mb-2 text-sidebar-focus-text">My Session Reminders</h3>
              <p className="opacity-70 font-medium text-sm mb-6 italic">Tracking {userReminders.length} sessions for synchronized industry planning.</p>
              
              <div className="space-y-3 mb-8">
                 {userReminders.slice(0, 3).map((rem: any) => (
                   <div key={rem.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-sidebar-focus-text opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-widest truncate text-sidebar-focus-text">{rem.eventName}</p>
                   </div>
                 ))}
              </div>

              <button 
                onClick={async () => {
                  if (confirm("Clear all your reminders?")) {
                    for (const rem of userReminders) {
                      await removeDocument("event_reminders", rem.id);
                    }
                  }
                }}
                className="w-full py-3 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                 Clear My Schedule
              </button>
           </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
             >
                <div className="h-80 relative group/hero overflow-hidden">
                   {selectedEvent.imageUrl ? (
                     <img src={selectedEvent.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover/hero:scale-110" alt="" />
                   ) : (
                     <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <CalendarIcon className="w-20 h-20 text-white/10" />
                     </div>
                   )}
                   <button 
                     onClick={() => setSelectedEvent(null)}
                     className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white transition-all transition-all"
                   >
                     <ChevronLeft className="w-6 h-6 rotate-90" />
                   </button>
                   <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex gap-2 mb-3">
                        <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                          {selectedEvent.category || "Technical Session"}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tight">{selectedEvent.title}</h2>
                   </div>
                </div>

                <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-2 gap-8 mb-10">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                            <CalendarIcon className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Date</p>
                            <p className="text-sm font-bold text-slate-900">{format(new Date(selectedEvent.date), 'MMMM dd, yyyy')}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                            <Clock className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Time</p>
                            <p className="text-sm font-bold text-slate-900">{format(new Date(selectedEvent.date), 'hh:mm a')}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                            <MapPin className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{selectedEvent.location}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                            <Users className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confirmed Visitors</p>
                            <p className="text-sm font-bold text-slate-900">{eventAttendees.length} attending</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8 mb-10">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Intelligence Summary</h4>
                        <p className="text-slate-500 font-medium leading-relaxed">
                           {selectedEvent.description}
                        </p>
                      </div>

                      {selectedEvent.location && (
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Site Location</h4>
                          <div className="w-full h-48 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              frameBorder="0" 
                              style={{ border: 0 }}
                              src={`https://www.google.com/maps?q=${encodeURIComponent(selectedEvent.location)}&output=embed`}
                              allowFullScreen
                            ></iframe>
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                          >
                            <ExternalLink size={10} /> Open in Google Maps
                          </a>
                        </div>
                      )}

                      {eventAttendees.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Confirmed Visitors</h4>
                          <div className="flex flex-wrap gap-2">
                            {eventAttendees.map((att: any) => (
                              <div key={att.id} className="flex items-center gap-2 p-1.5 pr-3 bg-bg-main border border-border-main rounded-full group">
                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                  <img src={att.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${att.userUid}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-text-heading leading-tight">{att.userName}</span>
                                  {att.companyName && <span className="text-[7px] font-bold text-text-body/40 leading-none">{att.companyName}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                   </div>

                   <div className="flex flex-wrap items-center gap-4 sticky bottom-0 bg-white pt-4 pb-0 border-t border-slate-100">
                      <button 
                        onClick={() => handleToggleAttendance(selectedEvent)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all ${isAttending(selectedEvent.id) ? "bg-bg-main text-text-body/40 border border-border-main" : "bg-primary text-white hover:bg-secondary shadow-primary/20"}`}
                      >
                         {isAttending(selectedEvent.id) ? <CheckCircle2 className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
                         {isAttending(selectedEvent.id) ? "Confirmed" : "Confirm Attendance"}
                      </button>
                      
                      <div className="flex gap-2">
                        <a 
                          href={getGoogleCalendarLink(selectedEvent)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-300 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                          title="Add to Google Calendar"
                        >
                           <CalendarPlus className="w-4 h-4" />
                        </a>
                        {selectedEvent.ctaUrl && (
                          <a 
                            href={selectedEvent.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 bg-slate-900 text-white hover:bg-black transition-all duration-300 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200"
                          >
                             Register
                             <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}

        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl p-10"
             >
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900">{format(selectedDay, 'MMMM dd')}</h2>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Technical Agenda</p>
                   </div>
                   <button onClick={() => setSelectedDay(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                      <ChevronLeft className="w-5 h-5 rotate-90" />
                   </button>
                </div>

                <div className="space-y-4">
                   {dayEvents(selectedDay).map((e: any) => (
                     <div 
                       key={e.id} 
                       onClick={() => {
                         setSelectedEvent(e);
                         setSelectedDay(null);
                       }}
                       className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-indigo-200 transition-all cursor-pointer"
                     >
                        <div className="flex items-center justify-between gap-4 mb-2">
                           <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{e.title}</h3>
                           <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-500" /> {format(new Date(e.date), 'h:mm a')}</span>
                           <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-500" /> {e.location}</span>
                           <span className="flex items-center gap-1"><Users className="w-3 h-3 text-indigo-500" /> {attendeeCount(e.id)}</span>
                           {isAttending(e.id) && <span className="flex items-center gap-1 text-green-600 ml-auto"><CheckCircle2 className="w-3 h-3" /> Going</span>}
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

