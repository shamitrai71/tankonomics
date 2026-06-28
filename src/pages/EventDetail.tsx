/**
 * EventDetail — full-page view for a single event at /events/:eventId.
 *
 * Replaces the old in-list modal. Renders everything the event carries,
 * including the two things the modal omitted: classification categories and
 * the call-to-action button. Reuses the same Firestore collections and
 * attendance/reminder logic as the Events page.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, orderBy, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";
import { useCollection, createDocument, removeDocument } from "../hooks/useFirestore";
import {
  MapPin,
  ExternalLink,
  Plus,
  Bell,
  BellOff,
  ChevronLeft,
  CalendarPlus,
  CheckCircle2,
  Mic,
  Tag,
  ArrowUpRight,
  Loader2,
  CalendarX,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { formatEventRange, getGoogleCalendarLink } from "../lib/eventDates";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { data: userReminders } = useCollection<any>(
    "event_reminders",
    [where("userUid", "==", user?.uid || "")]
  );
  const { data: categories } = useCollection<any>("company_categories");
  const { data: allAttendees } = useCollection<any>("event_attendees");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "events", eventId));
        if (!active) return;
        if (snap.exists()) {
          setEvent({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load event:", err);
        setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [eventId]);

  const eventAttendees = (allAttendees || []).filter((a: any) => a.eventId === eventId);
  const isAttending = !!user && eventAttendees.some((a: any) => a.userUid === user.uid);
  const isReminded = (userReminders || []).some((r: any) => r.eventId === eventId);

  const handleToggleAttendance = async () => {
    if (!user || !event) return;
    const attendance = (allAttendees || []).find(
      (a: any) => a.eventId === event.id && a.userUid === user.uid
    );
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

  const toggleReminder = async () => {
    if (!user || !event) return;
    const reminder = (userReminders || []).find((r: any) => r.eventId === event.id);
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

  // Resolve category ids -> names. Events may carry categoryIds (array) and/or
  // a single categoryId/categoryName (legacy). Normalise to a name list.
  const categoryNames: string[] = (() => {
    if (!event) return [];
    const ids: string[] = Array.isArray(event.categoryIds) ? event.categoryIds : [];
    const names = ids
      .map((id) => (categories || []).find((c: any) => c.id === id)?.name)
      .filter((n): n is string => !!n);
    if (names.length === 0 && event.categoryName) names.push(event.categoryName);
    return names;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-text-body/40 animate-spin" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-bg-card border border-border-main rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarX className="w-6 h-6 text-text-body/40" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl text-text-heading mb-2">Event not found</h1>
          <p className="text-[14px] text-text-body mb-6">This event may have been removed or the link is incorrect.</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const range = formatEventRange(event);

  return (
    <div className="min-h-screen bg-bg-main pb-20">
      {/* Hero */}
      <div className="relative h-[320px] md:h-[380px] w-full overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blueprint to-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/45 to-primary/10" />
        <div className="absolute inset-0 bp-grid opacity-20 pointer-events-none" />

        <div className="absolute top-6 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6">
            <button
              onClick={() => navigate("/events")}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-bg-card/10 backdrop-blur-md border border-white/20 rounded-xl eyebrow tabular text-white hover:bg-bg-card/20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              All events
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6">
            <p className="eyebrow tabular text-accent mb-2 flex items-center gap-2">
              <Mic className="w-3 h-3" strokeWidth={1.75} />
              TECHNICAL SESSION
            </p>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-white leading-[1.0] max-w-3xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
        {/* Stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-bg-card border border-border-main rounded-2xl shadow-sm">
            <p className="eyebrow tabular text-text-body/55 mb-1">{range.isMultiDay ? "Dates" : "Date"}</p>
            <p className="text-[15px] font-medium text-text-heading">{range.longLabel}</p>
            {range.isMultiDay && <p className="eyebrow tabular text-accent mt-1">{range.dayCount} days</p>}
          </div>
          <div className="p-4 bg-bg-card border border-border-main rounded-2xl shadow-sm">
            <p className="eyebrow tabular text-text-body/55 mb-1">Time</p>
            <p className="text-[15px] font-medium text-text-heading">
              {event.time || format(new Date(event.date), "HH:mm")}
              {event.endTime && <span className="text-text-body/55"> – {event.endTime}</span>}
            </p>
          </div>
          <div className="p-4 bg-bg-card border border-border-main rounded-2xl shadow-sm">
            <p className="eyebrow tabular text-text-body/55 mb-1">Attending</p>
            <p className="text-[15px] font-medium text-text-heading">
              <span className="font-display tabular text-2xl">{eventAttendees.length}</span> registered
            </p>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="mb-5 px-4 py-3 bg-bg-card border border-border-main rounded-2xl flex items-start gap-3">
            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <p className="eyebrow tabular text-text-body/55 mb-0.5">Location</p>
              <p className="text-[14px] text-text-heading">{event.location}</p>
            </div>
          </div>
        )}

        {/* Classification / categories — previously missing */}
        {categoryNames.length > 0 && (
          <div className="mb-6">
            <p className="eyebrow tabular text-text-body/55 mb-2 flex items-center gap-2">
              <Tag className="w-3 h-3 text-accent" strokeWidth={1.75} />
              Classification
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categoryNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full eyebrow tabular"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About */}
        {event.description && (
          <div className="mb-8">
            <p className="eyebrow tabular text-text-body/55 mb-2">About</p>
            <p className="text-[15px] text-text-body leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* CTA button — previously missing */}
        {event.ctaUrl && (
          <div className="mb-8">
            <a
              href={event.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all"
            >
              {event.ctaText?.trim() || "Learn more"}
              <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
            </a>
          </div>
        )}

        {/* Attendees */}
        {eventAttendees.length > 0 && (
          <div className="mb-8">
            <p className="eyebrow tabular text-text-body/55 mb-3">Attending ({eventAttendees.length})</p>
            <div className="flex flex-wrap gap-2">
              {eventAttendees.slice(0, 16).map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-bg-card border border-border-main rounded-lg">
                  <img
                    src={a.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${a.userName}`}
                    className="w-5 h-5 rounded object-cover"
                    alt=""
                  />
                  <span className="text-[12px] font-medium text-text-heading">{a.userName}</span>
                </div>
              ))}
              {eventAttendees.length > 16 && (
                <span className="px-2.5 py-1.5 eyebrow tabular text-text-body/55 bg-bg-card border border-border-main rounded-lg">
                  +{eventAttendees.length - 16} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 inset-x-0 z-30 bg-bg-card/95 backdrop-blur-md border-t border-border-main mt-4">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={toggleReminder}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
              isReminded
                ? "bg-accent/10 text-accent border border-accent/20"
                : "bg-bg-main border border-border-main text-text-heading hover:border-text-heading"
            }`}
          >
            {isReminded ? <Bell className="w-4 h-4" strokeWidth={1.75} /> : <BellOff className="w-4 h-4" strokeWidth={1.75} />}
            {isReminded ? "Reminded" : "Remind me"}
          </button>

          <div className="flex gap-2">
            <a
              href={getGoogleCalendarLink(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-medium text-text-heading hover:border-text-heading transition-all"
              title="Add to Google Calendar"
            >
              <CalendarPlus className="w-4 h-4" strokeWidth={1.75} />
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
            </a>
            <button
              onClick={handleToggleAttendance}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                isAttending
                  ? "bg-bg-main border border-border-main text-text-heading"
                  : "bg-text-heading text-bg-card hover:brightness-110"
              }`}
            >
              {isAttending ? <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={1.75} />}
              {isAttending ? "Attending" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
