/**
 * Events — technical calendar.
 *
 * Restyled. All data wiring preserved verbatim:
 *   - useCollection events, event_reminders, event_attendees, categories
 *   - handleCreateEvent, handleToggleAttendance, toggleReminder
 *   - getGoogleCalendarLink, list/calendar view toggle
 *   - Date filter pipeline (today / this-week / next-month / range / upcoming)
 *   - Event detail modal preserved (restyled)
 */

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
  Clock,
  CalendarDays,
  Mic,
  CalendarPlus,
  X,
  CheckCircle2,
  Building2,
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
  isWithinInterval,
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { CategorySelector } from "../components/CategorySelector";

export default function Events() {
  const { user, profile, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    location: "",
    imageUrl: "",
    categoryIds: [] as string[],
    companyId: "",
    companyName: "",
    companyLogo: "",
  });

  useEffect(() => {
    if (isCreating && ownedCompanies.length === 1 && !newEvent.companyId) {
      setNewEvent((prev) => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo,
      }));
    }
  }, [isCreating, ownedCompanies]);

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    try {
      const payload: any = {
        title: newEvent.title.trim(),
        date: newEvent.date,
        organizerUid: user?.uid,
        createdAt: serverTimestamp(),
      };
      if (newEvent.time?.trim()) payload.time = newEvent.time;
      if (newEvent.location?.trim()) payload.location = newEvent.location.trim();
      if (newEvent.description?.trim()) payload.description = newEvent.description.trim();
      if (newEvent.imageUrl?.trim()) payload.imageUrl = newEvent.imageUrl.trim();
      if (Array.isArray(newEvent.categoryIds) && newEvent.categoryIds.length > 0) {
        payload.categoryIds = newEvent.categoryIds;
      }
      if (newEvent.companyId) {
        payload.companyId = newEvent.companyId;
        payload.companyName = newEvent.companyName;
        payload.companyLogo = newEvent.companyLogo;
      }

      await createDocument("events", payload);
      setNewEvent({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        location: "",
        imageUrl: "",
        categoryIds: [],
        companyId: "",
        companyName: "",
        companyLogo: "",
      });
      setIsCreating(false);
    } catch (err: any) {
      console.error("Event create failed:", err);
      alert(`Failed to save event: ${err?.message || "unknown error"}.`);
    }
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
        userName: profile?.displayName || user.displayName || "Member",
        userPhoto: profile?.photoURL || user.photoURL || "",
        companyName: profile?.companyName || "",
        status: "confirmed",
        timestamp: serverTimestamp(),
      });
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDateCal = startOfWeek(monthStart);
  const endDateCal = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDateCal, end: endDateCal });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date();
    const todayStart = startOfDay(now);

    return events.filter((event: any) => {
      const eventDate = new Date(event.date);

      if (dateFilter === "range" && customRange.start && customRange.end) {
        return isWithinInterval(eventDate, {
          start: startOfDay(new Date(customRange.start)),
          end: endOfDay(new Date(customRange.end)),
        });
      }
      if (dateFilter === "today") {
        return isSameDay(eventDate, now);
      }
      if (dateFilter === "this-week") {
        return isWithinInterval(eventDate, {
          start: startOfWeek(now),
          end: endOfWeek(now),
        });
      }
      if (dateFilter === "next-month") {
        const nextMonth = addMonths(now, 1);
        return isWithinInterval(eventDate, { start: startOfMonth(nextMonth), end: endOfMonth(nextMonth) });
      }
      if (dateFilter === "upcoming") {
        return isAfter(eventDate, todayStart);
      }
      return true;
    });
  }, [events, dateFilter, customRange]);

  const isReminded = (eventId: string) => userReminders.some((r) => r.eventId === eventId);

  const getGoogleCalendarLink = (event: any) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");
    const start = format(new Date(event.date), "yyyyMMdd'T'HHmmss");
    const end = format(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), "yyyyMMdd'T'HHmmss");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  };

  const toggleReminder = async (event: any) => {
    if (!user) return;
    const reminder = userReminders.find((r) => r.eventId === event.id);
    if (reminder) {
      await removeDocument("event_reminders", reminder.id);
    } else {
      await createDocument("event_reminders", {
        eventId: event.id,
        userUid: user.uid,
        eventName: event.title,
        eventDate: event.date,
        reminderSent: false,
      });
    }
  };

  const dayEvents = (day: Date) => events.filter((e) => isSameDay(new Date(e.date), day));

  const dateFilters = [
    { id: "all", label: "All sessions", icon: CalendarDays },
    { id: "upcoming", label: "Upcoming", icon: ChevronRight },
    { id: "today", label: "Today's briefing", icon: Clock },
    { id: "this-week", label: "Current week", icon: CalendarIcon },
    { id: "next-month", label: "Next month", icon: ChevronRight },
    { id: "range", label: "Custom range", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Heading */}
        <header className="mb-10 md:mb-12 relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="relative">
            <div className="absolute -top-4 -left-4 right-0 h-24 bp-grid-paper opacity-50 pointer-events-none" />
            <div className="relative">
              <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                TECHNICAL CALENDAR
              </div>
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
                Sessions &amp; site visits.
              </h1>
              <p className="text-text-body text-[15px] mt-3 max-w-xl">
                Industry technical exchanges, conferences, training programs and verified terminal site visits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex bg-bg-card border border-border-main rounded-xl p-1">
              {(["list", "calendar"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg eyebrow tabular transition-all ${
                    view === v ? "bg-text-heading text-bg-card" : "text-text-body/55 hover:text-text-body"
                  }`}
                >
                  {v === "list" ? "List" : "Calendar"}
                </button>
              ))}
            </div>
            {(isAdmin || isCompanyOwner) && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card px-4 py-2.5 rounded-xl text-[13px] font-medium hover:brightness-110 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">New session</span>
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-10">
          {/* Main column */}
          <div className="space-y-6">
            {/* Create event composer (inline) */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-bg-card border border-border-main rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                    <div>
                      <p className="eyebrow tabular text-accent">NEW SESSION</p>
                      <h3 className="font-display text-2xl text-text-heading mt-1">Schedule a session</h3>
                    </div>
                    <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Title</span>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="e.g. API 653 inspection workshop"
                        className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="eyebrow tabular text-text-body/60 mb-2 block">Date</span>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
                        />
                      </label>
                      <label className="block">
                        <span className="eyebrow tabular text-text-body/60 mb-2 block">Time</span>
                        <input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading outline-none focus:border-text-heading transition-all"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Location</span>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Physical venue or virtual link"
                        className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Cover image URL (optional)</span>
                      <input
                        type="text"
                        value={newEvent.imageUrl}
                        onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                        placeholder="https://…"
                        className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[13px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                      />
                    </label>

                    {ownedCompanies.length > 0 && (
                      <div>
                        <span className="eyebrow tabular text-text-body/60 mb-2 block">Hosting on behalf of</span>
                        <div className="flex flex-wrap gap-2">
                          {ownedCompanies.map((company) => (
                            <button
                              key={company.id}
                              onClick={() =>
                                setNewEvent({
                                  ...newEvent,
                                  companyId: company.id,
                                  companyName: company.name,
                                  companyLogo: company.logo,
                                })
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                                newEvent.companyId === company.id
                                  ? "bg-text-heading text-bg-card border-text-heading"
                                  : "bg-bg-main border-border-main text-text-body hover:border-text-heading"
                              }`}
                            >
                              {company.logo ? (
                                <img src={company.logo} className="w-3.5 h-3.5 rounded object-contain" alt="" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                              )}
                              {company.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Sectors</span>
                      <CategorySelector
                        categories={categories}
                        selectedIds={newEvent.categoryIds}
                        onChange={(ids) => setNewEvent({ ...newEvent, categoryIds: ids })}
                      />
                    </div>

                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Description</span>
                      <textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Agenda, speakers, attendance criteria…"
                        className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading h-28 resize-none transition-all"
                      />
                    </label>

                    <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
                      <button onClick={() => setIsCreating(false)} className="px-4 py-2.5 text-[13px] text-text-body hover:text-text-heading">
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateEvent}
                        disabled={!newEvent.title.trim() || !newEvent.date}
                        className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                      >
                        Schedule session
                        <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List view */}
            {view === "list" ? (
              loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-bg-card border border-border-main rounded-2xl animate-pulse" />)}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="bg-bg-card border border-dashed border-border-main rounded-2xl py-20 text-center">
                  <CalendarIcon className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="eyebrow tabular text-text-body/55 mb-1">NO SESSIONS</p>
                  <h3 className="font-display text-2xl text-text-heading mb-2">No sessions in this range</h3>
                  <p className="text-text-body text-[14px]">Try adjusting your date filters or check back later.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((event: any) => {
                    const eventDate = new Date(event.date);
                    const reminded = isReminded(event.id);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedEvent(event)}
                        className="bg-bg-card border border-border-main rounded-2xl p-5 hover:border-text-heading transition-all cursor-pointer group flex gap-5 items-start"
                      >
                        {/* Date plinth */}
                        <div className="w-16 h-16 bg-bg-main border border-border-main rounded-xl flex flex-col items-center justify-center shrink-0">
                          <span className="eyebrow tabular text-text-body/55">{format(eventDate, "MMM")}</span>
                          <span className="font-display text-3xl text-text-heading leading-none tabular">{format(eventDate, "dd")}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded eyebrow tabular bg-bg-main border border-border-main text-text-body/65">
                              <Mic className="w-2.5 h-2.5" strokeWidth={1.75} />
                              Session
                            </span>
                            {isAttending(event.id) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded eyebrow tabular bg-accent/10 text-accent border border-accent/20">
                                <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2} />
                                Attending
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-xl text-text-heading leading-tight group-hover:text-accent transition-colors line-clamp-1">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="eyebrow tabular text-text-body/55 inline-flex items-center gap-1.5">
                              <Clock className="w-3 h-3" strokeWidth={1.75} />
                              {format(eventDate, "HH:mm")} · {format(eventDate, "EEE")}
                            </span>
                            {event.location && (
                              <span className="eyebrow tabular text-text-body/55 inline-flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" strokeWidth={1.75} />
                                {event.location}
                              </span>
                            )}
                            <span className="eyebrow tabular text-text-body/45 inline-flex items-center gap-1.5">
                              <Users className="w-3 h-3" strokeWidth={1.75} />
                              {attendeeCount(event.id)} attending
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReminder(event);
                          }}
                          className={`p-2 rounded-lg transition-all shrink-0 ${
                            reminded ? "bg-accent/10 text-accent" : "text-text-body/40 hover:text-text-heading hover:bg-bg-main"
                          }`}
                          title={reminded ? "Remove reminder" : "Set reminder"}
                        >
                          {reminded ? <Bell className="w-4 h-4" strokeWidth={1.75} /> : <BellOff className="w-4 h-4" strokeWidth={1.75} />}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Calendar view */
              <div className="bg-bg-card border border-border-main rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-text-heading">{format(currentMonth, "MMMM yyyy")}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="w-9 h-9 bg-bg-main border border-border-main rounded-lg flex items-center justify-center hover:border-text-heading transition-all"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4 text-text-body" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="w-9 h-9 bg-bg-main border border-border-main rounded-lg flex items-center justify-center hover:border-text-heading transition-all"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-4 h-4 text-text-body" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                {/* Day-of-week header */}
                <div className="grid grid-cols-7 gap-px mb-px">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-2 text-center eyebrow tabular text-text-body/55">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-px bg-border-main border border-border-main rounded-xl overflow-hidden">
                  {calendarDays.map((day) => {
                    const dayEvts = dayEvents(day);
                    const inMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toString()}
                        className={`min-h-[88px] p-2 bg-bg-card relative ${
                          inMonth ? "" : "opacity-40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`eyebrow tabular ${
                              isToday
                                ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white"
                                : "text-text-body/65"
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                          {dayEvts.length > 0 && (
                            <span className="eyebrow tabular text-text-body/45">{dayEvts.length}</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayEvts.slice(0, 2).map((event) => (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className="w-full text-left px-2 py-1 bg-bg-main hover:bg-text-heading hover:text-bg-card rounded text-[11px] truncate transition-all"
                            >
                              {event.title}
                            </button>
                          ))}
                          {dayEvts.length > 2 && (
                            <button
                              onClick={() => setSelectedEvent(dayEvts[2])}
                              className="w-full text-left px-2 py-0.5 eyebrow tabular text-accent hover:underline"
                            >
                              +{dayEvts.length - 2} more
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — date filters */}
          <aside className="space-y-6">
            <div className="bg-bg-card border border-border-main rounded-2xl p-5">
              <p className="eyebrow tabular text-text-body/55 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                Filter by date
              </p>
              <div className="space-y-0.5">
                {dateFilters.map((f) => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setDateFilter(f.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all flex items-center gap-2 ${
                        dateFilter === f.id ? "bg-text-heading text-bg-card" : "text-text-body hover:bg-bg-main"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {dateFilter === "range" && (
                <div className="mt-4 pt-4 border-t border-border-main space-y-3">
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-1.5 block">From</span>
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-main border border-border-main rounded-lg text-[13px] outline-none focus:border-text-heading"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-1.5 block">To</span>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-main border border-border-main rounded-lg text-[13px] outline-none focus:border-text-heading"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* My schedule card — deep petrol */}
            <div className="bg-primary text-white rounded-2xl p-6 grain relative overflow-hidden">
              <div className="absolute inset-0 bp-grid pointer-events-none opacity-40" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-4">
                  <Bell className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <p className="eyebrow tabular text-accent mb-2">SYNCHRONISED</p>
                <h3 className="font-display text-xl leading-tight mb-2">My reminders</h3>
                <p className="text-white/65 text-[13px] leading-relaxed mb-5">
                  Tracking {userReminders.length} {userReminders.length === 1 ? "session" : "sessions"} — email briefs sent 24 hours before each.
                </p>
                {userReminders.length === 0 && (
                  <p className="eyebrow tabular text-white/45">SET A REMINDER ON ANY SESSION</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Hero */}
              <div className="relative h-44 overflow-hidden shrink-0">
                {selectedEvent.imageUrl ? (
                  <img src={selectedEvent.imageUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blueprint to-primary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                <div className="absolute inset-0 bp-grid opacity-20 pointer-events-none" />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-bg-card/15 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-bg-card/25 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <p className="eyebrow tabular text-accent mb-1">TECHNICAL SESSION</p>
                  <h2 className="font-display text-3xl text-white leading-tight">{selectedEvent.title}</h2>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-bg-main border border-border-main rounded-xl">
                    <p className="eyebrow tabular text-text-body/55 mb-1">Date</p>
                    <p className="text-[14px] font-medium text-text-heading">{format(new Date(selectedEvent.date), "MMM dd, yyyy")}</p>
                  </div>
                  <div className="p-3 bg-bg-main border border-border-main rounded-xl">
                    <p className="eyebrow tabular text-text-body/55 mb-1">Time</p>
                    <p className="text-[14px] font-medium text-text-heading">{format(new Date(selectedEvent.date), "HH:mm")}</p>
                  </div>
                  <div className="p-3 bg-bg-main border border-border-main rounded-xl">
                    <p className="eyebrow tabular text-text-body/55 mb-1">Attending</p>
                    <p className="text-[14px] font-medium text-text-heading">
                      <span className="font-display tabular text-2xl">{attendeeCount(selectedEvent.id)}</span> registered
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="mb-5 px-4 py-3 bg-bg-main border border-border-main rounded-xl flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <p className="eyebrow tabular text-text-body/55 mb-0.5">Location</p>
                      <p className="text-[14px] text-text-heading">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="mb-6">
                    <p className="eyebrow tabular text-text-body/55 mb-2">About</p>
                    <p className="text-[14px] text-text-body leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}

                {eventAttendees.length > 0 && (
                  <div className="mb-5">
                    <p className="eyebrow tabular text-text-body/55 mb-3">Attending ({eventAttendees.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {eventAttendees.slice(0, 8).map((a: any) => (
                        <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 bg-bg-main border border-border-main rounded-lg">
                          <img
                            src={a.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${a.userName}`}
                            className="w-5 h-5 rounded object-cover"
                            alt=""
                          />
                          <span className="text-[12px] font-medium text-text-heading">{a.userName}</span>
                        </div>
                      ))}
                      {eventAttendees.length > 8 && (
                        <span className="px-2 py-1.5 eyebrow tabular text-text-body/55 bg-bg-main border border-border-main rounded-lg">
                          +{eventAttendees.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border-main flex items-center justify-between gap-3 bg-bg-card shrink-0">
                <button
                  onClick={() => toggleReminder(selectedEvent)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isReminded(selectedEvent.id)
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-bg-main border border-border-main text-text-heading hover:border-text-heading"
                  }`}
                >
                  {isReminded(selectedEvent.id) ? <Bell className="w-4 h-4" strokeWidth={1.75} /> : <BellOff className="w-4 h-4" strokeWidth={1.75} />}
                  {isReminded(selectedEvent.id) ? "Reminded" : "Remind me"}
                </button>
                <div className="flex gap-2">
                  <a
                    href={getGoogleCalendarLink(selectedEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-medium text-text-heading hover:border-text-heading transition-all"
                  >
                    <CalendarPlus className="w-4 h-4" strokeWidth={1.75} />
                    <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                  </a>
                  <button
                    onClick={() => handleToggleAttendance(selectedEvent)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                      isAttending(selectedEvent.id)
                        ? "bg-bg-main border border-border-main text-text-heading"
                        : "bg-text-heading text-bg-card hover:brightness-110"
                    }`}
                  >
                    {isAttending(selectedEvent.id) ? <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={1.75} />}
                    {isAttending(selectedEvent.id) ? "Attending" : "Register"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
