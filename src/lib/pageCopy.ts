import { useDocument } from "../hooks/useFirestore";

// Each entry's `eyebrow`/`title`/`subtitle` are the FALLBACK values shown until
// an admin edits that page's copy in Firestore (collection "pageCopy", doc id
// = the key below). Editing in the admin panel never requires a code deploy.
//
// Defaults are kept deliberately factual — no invented claims about features
// that don't exist ("verified", "partner", etc.). Anyone editing a page's
// live copy should hold the same bar.
export interface PageCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export const PAGE_COPY_DEFAULTS: Record<string, PageCopy> = {
  events: {
    eyebrow: "TECHNICAL CALENDAR",
    title: "Industry events.",
    subtitle: "Conferences, training programs and technical exchanges for the tank & terminal industry.",
  },
  forums: {
    eyebrow: "TECHNICAL EXCHANGE",
    title: "Technical discussion.",
    subtitle: "Tank construction, terminal automation, inspection findings and integrity — discussed by working professionals.",
  },
  surveys: {
    eyebrow: "INDUSTRY PULSE",
    title: "Pulse checks on the market.",
    subtitle: "Real-time surveys and sentiment data from the global tank & terminal community.",
  },
  groups: {
    eyebrow: "COMMUNITY GROUPS",
    title: "Specialist networks.",
    subtitle: "Focused networks for tank-storage specialists — join an existing one or propose a new group.",
  },
  jobs: {
    eyebrow: "TECHNICAL ROLES",
    title: "Roles in tank & terminal.",
    subtitle: "Openings across operators, EPCs, OEMs and inspection consultancies in the tank & terminal sector.",
  },
  companies: {
    eyebrow: "INDEXED DIRECTORY",
    title: "The company registry.",
    subtitle: "Storage operators, EPC contractors, OEMs, inspectors and service providers — indexed for the tank & terminal sector.",
  },
  news: {
    eyebrow: "GLOBAL HEADLINES",
    title: "Industry news, indexed.",
    subtitle: "Curated headlines covering tank storage, terminals, refineries and energy logistics — refreshed as the wire moves.",
  },
};

export const PAGE_COPY_KEYS = Object.keys(PAGE_COPY_DEFAULTS);

/**
 * Live page copy with automatic fallback. Falls back FIELD BY FIELD, not just
 * whole-document — an admin who has only edited the title still sees the
 * correct default eyebrow and subtitle, rather than blanks.
 */
export function usePageCopy(pageKey: string): PageCopy {
  const { data } = useDocument<Partial<PageCopy>>("pageCopy", pageKey);
  const fallback = PAGE_COPY_DEFAULTS[pageKey] || { eyebrow: "", title: "", subtitle: "" };
  return {
    eyebrow: data?.eyebrow || fallback.eyebrow,
    title: data?.title || fallback.title,
    subtitle: data?.subtitle || fallback.subtitle,
  };
}
