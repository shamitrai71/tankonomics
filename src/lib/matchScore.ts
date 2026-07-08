/**
 * Job ↔ Resume match scoring — taxonomy-based, weighted, admin-configurable.
 *
 * Scores exact taxonomy-ID overlap across six dimensions, applies must-have
 * hard-gating and soft education/experience penalties, and produces a 0–100
 * score plus a breakdown and human-readable flags.
 *
 * Weights come from a resolvable config (MatchWeights). Today that config is
 * the global settings/matching doc (Tier 1). The scorer takes weights as an
 * argument, so per-job or per-company weight profiles (Tiers 2–3) slot in
 * later by changing ONLY where the weights are resolved — never this math.
 */

export interface MatchWeights {
  industry: number;
  domain: number;
  role: number;
  standards: number;
  competencies: number;
  certifications: number;
  equipment: number;
  seniority: number;
  // Penalties (subtracted): how far below-minimum education/experience hurts.
  educationPenalty: number;
  experiencePenalty: number;
  // Must-have handling: multiplier applied to total when a hard requirement
  // is missing (0.4 = keep 40% of score; never hidden, just sunk).
  mustHaveMissingFactor: number;
}

/** Sensible defaults. The admin panel writes overrides to settings/matching. */
export const DEFAULT_WEIGHTS: MatchWeights = {
  industry: 10,
  domain: 15,
  role: 20,
  standards: 12,
  competencies: 15,
  certifications: 18,
  equipment: 10,
  seniority: 0, // off by default; admin can raise
  educationPenalty: 15,
  experiencePenalty: 15,
  mustHaveMissingFactor: 0.4,
};

export interface MatchBreakdown {
  industry: number;
  domain: number;
  role: number;
  standards: number;
  competencies: number;
  certifications: number;
  equipment: number;
  seniority: number;
  educationPenalty: number;
  experiencePenalty: number;
  mustHaveMissing: boolean;
  total: number;   // 0–100, after penalties + must-have factor
  flags: string[]; // human-readable notes for the admin card
}

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

/** Fraction of the job's required ids that the resume also has (0..1). */
function overlapFraction(jobIds: string[], resumeIds: string[]): number {
  if (jobIds.length === 0) return 0;
  const set = new Set(resumeIds);
  const hit = jobIds.filter((id) => set.has(id)).length;
  return hit / jobIds.length;
}

const EDU_LEVELS_INTERNAL = [
  "10th / SSC","12th / HSC","ITI","Diploma","Bachelor's Degree","Master's Degree","Doctorate",
];
const eduRank = (label: unknown): number =>
  typeof label === "string" ? EDU_LEVELS_INTERNAL.indexOf(label) : -1;

/**
 * Score a job↔resume pair. `weights` defaults to DEFAULT_WEIGHTS; callers pass
 * the resolved global config. Returns a 0–100 total, breakdown, and flags.
 */
export function scoreMatch(job: any, resume: any, weights: MatchWeights = DEFAULT_WEIGHTS): MatchBreakdown {
  const b: MatchBreakdown = {
    industry: 0, domain: 0, role: 0, standards: 0, competencies: 0,
    certifications: 0, equipment: 0, seniority: 0,
    educationPenalty: 0, experiencePenalty: 0, mustHaveMissing: false,
    total: 0, flags: [],
  };
  if (!job || !resume) return b;

  // ---- Weighted taxonomy overlap ------------------------------------------
  b.industry      = weights.industry      * overlapFraction(arr(job.taxIndustryIds), arr(resume.taxIndustryIds));
  b.standards     = weights.standards     * overlapFraction(arr(job.taxStandardIds), arr(resume.taxStandardIds));
  b.competencies  = weights.competencies  * overlapFraction(arr(job.taxCompetencyIds), arr(resume.taxCompetencyIds));
  b.certifications= weights.certifications* overlapFraction(arr(job.taxCertificationIds), arr(resume.taxCertificationIds));
  b.equipment     = weights.equipment     * overlapFraction(arr(job.taxEquipmentIds), arr(resume.taxEquipmentIds));

  // Domain + role are single-value exact matches.
  if (job.taxDomainId && resume.taxDomainId === job.taxDomainId) b.domain = weights.domain;
  if (job.taxRole && resume.taxRole === job.taxRole) b.role = weights.role;

  // Seniority exact match (optional signal).
  if (job.taxSeniority && resume.taxSeniority === job.taxSeniority) b.seniority = weights.seniority;

  let subtotal = b.industry + b.domain + b.role + b.standards + b.competencies + b.certifications + b.equipment + b.seniority;

  // ---- Soft education penalty ---------------------------------------------
  if (job.minEducation) {
    const need = eduRank(job.minEducation);
    const have = eduRank(resume.educationLevel);
    if (need >= 0 && have >= 0 && have < need) {
      b.educationPenalty = weights.educationPenalty;
      subtotal -= weights.educationPenalty;
      b.flags.push(`Below stated minimum education (${job.minEducation})`);
    } else if (need >= 0 && have < 0) {
      b.flags.push("Education not specified on Blueprint");
    }
  }

  // ---- Soft experience penalty --------------------------------------------
  if (job.minYearsExperience != null && typeof job.minYearsExperience === "number") {
    const have = typeof resume.yearsExperience === "number" ? resume.yearsExperience : null;
    if (have != null && have < job.minYearsExperience) {
      b.experiencePenalty = weights.experiencePenalty;
      subtotal -= weights.experiencePenalty;
      b.flags.push(`Below stated minimum experience (${job.minYearsExperience}+ yrs)`);
    } else if (have == null) {
      b.flags.push("Experience not specified on Blueprint");
    }
  }

  // ---- Must-have gating (soft-but-heavy) ----------------------------------
  const mustHaves = arr(job.taxMustHaveIds);
  if (mustHaves.length > 0) {
    const resumeHas = new Set([
      ...arr(resume.taxStandardIds),
      ...arr(resume.taxCertificationIds),
      ...arr(resume.taxCompetencyIds),
      ...arr(resume.taxEquipmentIds),
    ]);
    const missing = mustHaves.filter((id) => !resumeHas.has(id));
    if (missing.length > 0) {
      b.mustHaveMissing = true;
      subtotal *= weights.mustHaveMissingFactor;
      b.flags.push(`Missing ${missing.length} must-have requirement${missing.length > 1 ? "s" : ""}`);
    }
  }

  // Clamp to 0..100.
  b.total = Math.max(0, Math.min(100, Math.round(subtotal)));
  return b;
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
