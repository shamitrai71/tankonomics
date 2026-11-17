/**
 * Small helpers shared by the company list and the company page.
 */

/** Two-letter initials for the logo fallback, e.g. "DEHN India Private Limited" -> "DI". */
export function companyInitials(name?: string): string {
  const words = (name || "").replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * A place name from a street address: the last two parts with postal codes
 * and street numbers removed, e.g.
 * "Plot No. 213, Sector 7, IMT Manesar, Gurugram, Haryana 122051, India"
 * -> "Haryana, India". Returns "" when no place can be read from it.
 */
export function companyLocation(address?: string): string {
  if (!address) return "";
  const parts = address
    .split(",")
    .map((p) => p.replace(/\b\d[\d\s-]*\b/g, "").replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 1);
  if (parts.length === 0) return "";
  return parts.slice(-2).join(", ");
}

export type CompanyStatus = "managed" | "under-review" | "unclaimed";

/** The three states a company page can be in. "Under review" is only known to the claimant. */
export function companyStatus(company: any, hasPendingClaim = false): CompanyStatus {
  if (company?.isClaimed) return "managed";
  return hasPendingClaim ? "under-review" : "unclaimed";
}

export const STATUS_LABEL: Record<CompanyStatus, string> = {
  managed: "Managed by the company",
  "under-review": "Claim under review",
  unclaimed: "Unclaimed page",
};
