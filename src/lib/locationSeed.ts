// Auto-generated. Per-company location sets, keyed by company slug (doc id).
// Richer model: facilityClass[] + processType[] (master slugs) + primaryClass
// (badge colour) + optional googlePlaceId (Google Maps deep link; empty when
// Google has no reliable place — the profile falls back to a maps search).
// Seed via Admin -> Companies -> "Seed locations".

export interface SeedLocation {
  name: string; type: string; city: string; country: string;
  externalUrl: string;        // TankBazaar deep link (tankbazaar.com/#terminal-N)
  facilityClass: string[];    // ["storage"] | ["process"] | ["storage","process"]
  processType: string[];      // master slugs e.g. ["refineries","petrochemicals"]; [] for storage
  primaryClass: string;       // "storage" | "process" — drives the badge/colour
  googlePlaceId: string;      // Google Place ID; "" when none is reliable
}

export const LOCATION_SEED: Record<string, SeedLocation[]> = {
  "reliance-industries-limited": [
    { name: "Jamnagar Refinery & Petrochemical Complex", type: "refinery", city: "Jamnagar, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-29", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJF0w5tfcZVzkROvlcZ8nFyRc" },
    { name: "Dahej Petrochemical Complex", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-72", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJfe3LpZx9XzkRgFIjE8XXJPQ" },
    { name: "Hazira Petrochemical Complex", type: "plant", city: "Hazira, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-70", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJ85fJJFuz4TsRmB2h325Qv6E" },
    { name: "Patalganga Petrochemical Complex", type: "plant", city: "Patalganga, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-752", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJO2HJOAPj5zsRxz9-Ufzr09g" },
    { name: "Vadodara Petrochemical Complex", type: "plant", city: "Vadodara, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-71", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJYxXB4ovJXzkR4U_GACxPFSc" },
    { name: "Bhopal Terminal", type: "inland terminal", city: "Bhopal, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-66", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Chennai Terminal", type: "port terminal", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-67", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Haldia Terminal", type: "port terminal", city: "Haldia, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-64", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jhansi Terminal", type: "inland terminal", city: "Jhansi, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-69", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kanpur Terminal", type: "inland terminal", city: "Kanpur, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-65", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Rewari Terminal", type: "inland terminal", city: "Rewari, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-68", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
};
