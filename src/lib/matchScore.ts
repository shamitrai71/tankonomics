/**
 * Job ↔ Resume match scoring — 10-point rubric.
 *
 * | Signal            | Max | How it's earned                                            |
 * |-------------------|-----|------------------------------------------------------------|
 * | Domain experience |  4  | Resume sub-segment in job's domains = 4; primary domain = 3 |
 * | Role relevance    |  2  | Job title keywords in current role = 2; in past roles = 1   |
 * | Skills            |  2  | ≥2 listed skills appear in job text = 2; exactly 1 = 1      |
 * | Location          |  1  | Job location matches current city or a preferred location   |
 * | Credentials       |  1  | Any certification/qualification keyword appears in job text |
 *
 * Deliberately conservative: no penalty scoring, no fuzzy inference beyond
 * keyword overlap. A 0 on a signal means "no evidence", not "bad fit".
 */

export interface MatchBreakdown {
  domain: number;      // 0–4
  role: number;        // 0–2
  skills: number;      // 0–2
  location: number;    // 0–1
  credentials: number; // 0–1
  total: number;       // 0–10
}

const norm = (s: unknown): string =>
  typeof s === "string" ? s.trim().toLowerCase() : "";

/** Meaningful keywords from a title/phrase (drops short filler words). */
const keywords = (s: unknown): string[] =>
  norm(s)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);

/** Case-insensitive containment either way ("Mumbai" ~ "Navi Mumbai, India"). */
const looseMatch = (a: string, b: string): boolean =>
  a.length > 1 && b.length > 1 && (a.includes(b) || b.includes(a));

export function scoreMatch(job: any, resume: any): MatchBreakdown {
  const out: MatchBreakdown = { domain: 0, role: 0, skills: 0, location: 0, credentials: 0, total: 0 };
  if (!job || !resume) return out;

  // ---- Domain experience (0–4) --------------------------------------------
  const jobDomains: string[] = Array.isArray(job.categoryIds)
    ? job.categoryIds
    : job.categoryId ? [job.categoryId] : [];
  if (jobDomains.length > 0) {
    if (resume.subCategoryId && jobDomains.includes(resume.subCategoryId)) out.domain = 4;
    else if (resume.categoryId && jobDomains.includes(resume.categoryId)) out.domain = 3;
  }

  // ---- Role relevance (0–2) -----------------------------------------------
  const jobTitleWords = keywords(job.title);
  if (jobTitleWords.length > 0) {
    const currentWords = new Set(keywords(resume.currentJob?.title));
    if (jobTitleWords.some((w) => currentWords.has(w))) {
      out.role = 2;
    } else {
      const pastTitles: string[] = (resume.pastJobs || []).map((p: any) => p?.title);
      const pastWords = new Set(pastTitles.flatMap(keywords));
      if (jobTitleWords.some((w) => pastWords.has(w))) out.role = 1;
    }
  }

  // ---- Skills (0–2) ---------------------------------------------------------
  const jobText = `${norm(job.title)} ${norm(job.description)}`;
  const skills: string[] = (resume.additionalSkills || []).map(norm).filter((s: string) => s.length >= 3);
  const hits = skills.filter((s) => jobText.includes(s)).length;
  out.skills = hits >= 2 ? 2 : hits === 1 ? 1 : 0;

  // ---- Location (0–1) -------------------------------------------------------
  const jobLoc = norm(job.location);
  if (jobLoc) {
    const candidateLocs: string[] = [
      norm(resume.currentCity),
      ...((resume.preferredLocations || []) as string[]).map(norm),
    ].filter(Boolean);
    if (candidateLocs.some((loc) => looseMatch(jobLoc, loc))) out.location = 1;
  }

  // ---- Credentials (0–1) ----------------------------------------------------
  const creds: string[] = [
    ...((resume.certifications || []) as any[]),
    ...((resume.qualifications || []) as any[]),
  ]
    .map((c: any) => norm(typeof c === "string" ? c : c?.name || c?.title))
    .filter((c: string) => c.length >= 3);
  if (creds.some((c) => jobText.includes(c))) out.credentials = 1;

  out.total = out.domain + out.role + out.skills + out.location + out.credentials;
  return out;
}

/** Suggested cities for the Blueprint's preferred-locations auto-suggest.
 *  Major tank & terminal industry hubs; free text is always allowed. */
/** Education levels, ordinal (index = rank). Resume picks highest attained;
 *  job picks minimum required; match compares by index. */
export const EDUCATION_LEVELS = [
  "10th / SSC",
  "12th / HSC",
  "ITI",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
];

export const educationRank = (label: string): number =>
  EDUCATION_LEVELS.indexOf(label); // -1 if unset/unknown

export const LOCATION_SUGGESTIONS = [
  "Rotterdam", "Antwerp", "Amsterdam", "Hamburg", "Marseille",
  "Houston", "New Orleans", "Corpus Christi", "Long Beach", "New York",
  "Singapore", "Fujairah", "Dubai", "Abu Dhabi", "Dammam", "Jubail",
  "Mumbai", "Navi Mumbai", "Chennai", "Kandla", "Kochi", "Visakhapatnam",
  "Shanghai", "Ningbo", "Ulsan", "Yokohama", "Kaohsiung",
  "Santos", "Panama City", "Durban", "Lagos", "Port Harcourt",
];
