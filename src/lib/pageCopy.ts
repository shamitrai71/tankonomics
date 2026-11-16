// Page titles and descriptions, fixed in code. Keep them factual: no claims
// about features that do not exist ("verified", "partner" and so on).
export interface PageCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export const PAGE_COPY_DEFAULTS: Record<string, PageCopy> = {
  feed: {
    eyebrow: "",
    title: "Feed",
    subtitle: "Updates and discussion from members and companies in the tank and terminal industry.",
  },
  events: {
    eyebrow: "",
    title: "Events",
    subtitle: "Conferences, training programmes and technical meetings for the tank and terminal industry.",
  },
  forums: {
    eyebrow: "",
    title: "Forums",
    subtitle: "Technical discussion on tank construction, terminal automation, inspection and integrity.",
  },
  surveys: {
    eyebrow: "",
    title: "Surveys",
    subtitle: "Short polls answered by members of the tank and terminal community.",
  },
  groups: {
    eyebrow: "",
    title: "Groups",
    subtitle: "Specialist groups for tank and terminal professionals. Join one or propose a new group.",
  },
  jobs: {
    eyebrow: "",
    title: "Industry jobs",
    subtitle: "Openings at operators, EPC contractors, equipment makers and inspection firms.",
  },
  companies: {
    eyebrow: "",
    title: "Companies",
    subtitle: "Storage operators, EPC contractors, equipment makers, inspectors and service providers in the tank and terminal sector.",
  },
  news: {
    eyebrow: "",
    title: "Industry news",
    subtitle: "Headlines on tank storage, terminals, refineries and energy logistics, linked to their publishers.",
  },
};

/**
 * Page titles and descriptions. These are fixed in code: the Admin "Page Copy"
 * editor was removed in the November 2026 redesign, and any older edits saved
 * in the Firestore "pageCopy" collection are no longer read.
 */
export function usePageCopy(pageKey: string): PageCopy {
  return PAGE_COPY_DEFAULTS[pageKey] || { eyebrow: "", title: "", subtitle: "" };
}
