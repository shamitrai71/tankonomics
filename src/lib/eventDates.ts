/**
 * Shared event date-range formatting, used by both the Events list/calendar
 * page and the dedicated EventDetail page so the two never drift.
 *
 * Single day  → "Nov 2, 2026"
 * Same month  → "Nov 2–5, 2026"
 * Same year   → "Dec 30 – Jan 2, 2027"
 * Cross-year  → "Dec 30, 2026 – Jan 2, 2027"
 */
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";

export interface EventRange {
  shortLabel: string;
  longLabel: string;
  isMultiDay: boolean;
  dayCount: number;
}

export function formatEventRange(event: { date: string; endDate?: string }): EventRange {
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : start;
  const isMultiDay = !isSameDay(start, end);
  const dayCount = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  if (!isMultiDay) {
    return { shortLabel: format(start, "MMM d"), longLabel: format(start, "MMM d, yyyy"), isMultiDay: false, dayCount: 1 };
  }
  if (isSameMonth(start, end) && isSameYear(start, end)) {
    return {
      shortLabel: `${format(start, "MMM d")}–${format(end, "d")}`,
      longLabel: `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`,
      isMultiDay: true,
      dayCount,
    };
  }
  if (isSameYear(start, end)) {
    return {
      shortLabel: `${format(start, "MMM d")} – ${format(end, "MMM d")}`,
      longLabel: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
      isMultiDay: true,
      dayCount,
    };
  }
  return {
    shortLabel: `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`,
    longLabel: `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`,
    isMultiDay: true,
    dayCount,
  };
}

/** Google Calendar deep-link, respecting multi-day endDate. */
export function getGoogleCalendarLink(event: any): string {
  const title = encodeURIComponent(event.title || "");
  const details = encodeURIComponent(event.description || "");
  const location = encodeURIComponent(event.location || "");
  const start = format(new Date(event.date), "yyyyMMdd'T'HHmmss");
  const endBase = event.endDate ? new Date(event.endDate) : new Date(event.date);
  const endDate = event.endDate
    ? new Date(endBase.getTime() + 24 * 60 * 60 * 1000)
    : new Date(endBase.getTime() + 2 * 60 * 60 * 1000);
  const end = format(endDate, "yyyyMMdd'T'HHmmss");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
}
