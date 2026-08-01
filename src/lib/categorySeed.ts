// Auto-generated. Per-company location sets, keyed by company slug (doc id).
// Seed via Admin -> Companies -> "Seed locations". Writes each company's
// locations[] array (authoritative for the companies listed here).

export interface SeedLocation { name: string; type: string; city: string; country: string; externalUrl: string; }

export const LOCATION_SEED: Record<string, SeedLocation[]> = {
  "reliance-industries-limited": [
    { name: "Jamnagar Refinery & Petrochemical Complex", type: "refinery", city: "Jamnagar, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-29" },
    { name: "Dahej Petrochemical Complex", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-72" },
    { name: "Hazira Petrochemical Complex", type: "plant", city: "Hazira, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-70" },
    { name: "Patalganga Petrochemical Complex", type: "plant", city: "Patalganga, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-752" },
    { name: "Vadodara Petrochemical Complex", type: "plant", city: "Vadodara, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-71" },
    { name: "Bhopal Terminal", type: "inland terminal", city: "Bhopal, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-66" },
    { name: "Chennai Terminal", type: "port terminal", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-67" },
    { name: "Haldia Terminal", type: "port terminal", city: "Haldia, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-64" },
    { name: "Jhansi Terminal", type: "inland terminal", city: "Jhansi, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-69" },
    { name: "Kanpur Terminal", type: "inland terminal", city: "Kanpur, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-65" },
    { name: "Rewari Terminal", type: "inland terminal", city: "Rewari, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-68" },
  ],
};
