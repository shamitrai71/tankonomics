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
  "bharat-petroleum-corporation-limited": [
    { name: "Bina Refinery", type: "refinery", city: "Bina, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-78", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJtyeWTPlveTkRy5yLoxd0O9Q" },
    { name: "Mumbai Refinery", type: "refinery", city: "Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-80", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJhWzAoLTP5zsRasHKyDxduWQ" },
    { name: "Chakan Terminal", type: "inland terminal", city: "Chakan, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-516", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Irumpanam Terminal", type: "inland terminal", city: "Kochi, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-242", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jobner Terminal", type: "inland terminal", city: "Jobner, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-515", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kota Terminal", type: "inland terminal", city: "Kota, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-514", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Manglya Terminal", type: "inland terminal", city: "Indore, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-512", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mumbai Terminal", type: "port terminal", city: "Mumbai", country: "India", externalUrl: "https://tankbazaar.com/#terminal-17", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Piyala Terminal", type: "inland terminal", city: "Faridabad, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-513", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Puthuvypeen SPM Crude Oil Terminal", type: "port terminal", city: "Kochi, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-77", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Ramanmandi Terminal", type: "inland terminal", city: "Bathinda, Punjab", country: "India", externalUrl: "https://tankbazaar.com/#terminal-518", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Shikrapur Terminal", type: "inland terminal", city: "Shikrapur, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-517", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Thiruvananthapuram Depot", type: "inland terminal", city: "Thiruvananthapuram, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-397", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Washala Terminal", type: "inland terminal", city: "Washala, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-519", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "hindustan-petroleum-corporation-limited": [
    { name: "Mumbai Refinery", type: "refinery", city: "Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-79", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJq2716orF5zsRvL9KEmS8WKU" },
    { name: "Visakha Refinery", type: "refinery", city: "Visakhapatnam, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-86", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJ22-SwHhCOToRG4TXTN1Iqxk" },
    { name: "Ajmer Terminal", type: "inland terminal", city: "Ajmer, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-442", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Akola Depot", type: "inland terminal", city: "Akola, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-443", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bahadurgarh Terminal", type: "inland terminal", city: "Bahadurgarh, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-444", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Baitalpur Depot", type: "inland terminal", city: "Deoria, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-445", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Balasore Depot", type: "inland terminal", city: "Balasore, Odisha", country: "India", externalUrl: "https://tankbazaar.com/#terminal-446", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Barauni Depot", type: "inland terminal", city: "Begusarai, Bihar", country: "India", externalUrl: "https://tankbazaar.com/#terminal-447", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bareilly Depot", type: "inland terminal", city: "Bareilly, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-448", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bengaluru Terminal", type: "inland terminal", city: "Bengaluru, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-449", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bharatpur Terminal", type: "inland terminal", city: "Bharatpur, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-450", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bhatinda Terminal", type: "inland terminal", city: "Bhatinda, Punjab", country: "India", externalUrl: "https://tankbazaar.com/#terminal-27", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bokaro Depot", type: "inland terminal", city: "Bokaro, Jharkhand", country: "India", externalUrl: "https://tankbazaar.com/#terminal-451", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Cassimode Black Oil Terminal", type: "port terminal", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-502", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Chennai Terminal", type: "port terminal", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-452", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Cochin Black Terminal", type: "port terminal", city: "Kochi, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-503", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Coimbatore Depot", type: "inland terminal", city: "Coimbatore, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-453", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Delhi Terminal", type: "inland terminal", city: "Delhi", country: "India", externalUrl: "https://tankbazaar.com/#terminal-454", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dharamapuri Terminal", type: "inland terminal", city: "Dharmapuri, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-455", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dimapur Depot", type: "inland terminal", city: "Dimapur, Nagaland", country: "India", externalUrl: "https://tankbazaar.com/#terminal-509", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Durgapur Depot", type: "inland terminal", city: "Durgapur, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-456", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Gulbarga Depot", type: "inland terminal", city: "Gulbarga, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-457", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Guwahati Depot", type: "inland terminal", city: "Guwahati, Assam", country: "India", externalUrl: "https://tankbazaar.com/#terminal-458", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Gwalior Depot", type: "inland terminal", city: "Gwalior, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-459", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "HMEL Bitumen Terminal", type: "inland terminal", city: "Bathinda, Punjab", country: "India", externalUrl: "https://tankbazaar.com/#terminal-504", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "HMEL White Oil Terminal", type: "inland terminal", city: "Bathinda, Punjab", country: "India", externalUrl: "https://tankbazaar.com/#terminal-511", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Haldia Terminal", type: "port terminal", city: "Haldia, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-460", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Hassan Depot", type: "inland terminal", city: "Hassan, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-426", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Hazira Depot", type: "port terminal", city: "Surat, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-461", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Hisar Terminal", type: "inland terminal", city: "Hisar, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-462", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Hubli Depot", type: "inland terminal", city: "Hubli, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-463", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Indore Depot", type: "inland terminal", city: "Indore, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-464", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Irumpanam Terminal", type: "inland terminal", city: "Ernakulam, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-465", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jabalpur Depot", type: "inland terminal", city: "Jabalpur, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-466", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jaipur Terminal", type: "inland terminal", city: "Jaipur, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-467", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jammu Depot", type: "inland terminal", city: "Jammu, Jammu and Kashmir", country: "India", externalUrl: "https://tankbazaar.com/#terminal-468", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jodhpur Terminal", type: "inland terminal", city: "Jodhpur, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-469", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kadapa Terminal", type: "inland terminal", city: "Kadapa, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-470", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kakinada Terminal", type: "port terminal", city: "Kakinada, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-90", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kandla Terminal", type: "port terminal", city: "Kandla, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-471", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kanpur Terminal", type: "inland terminal", city: "Kanpur, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-472", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kolkata-I Terminal", type: "port terminal", city: "Kolkata, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-473", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kozhikode Depot", type: "port terminal", city: "Kozhikode, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-474", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Leh Depot", type: "inland terminal", city: "Leh, Ladakh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-475", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Loni Terminal", type: "inland terminal", city: "Loni Kalbhor, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-476", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Lucknow Depot", type: "inland terminal", city: "Lucknow, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-477", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "MR-II Terminal", type: "port terminal", city: "Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-478", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Madurai Depot", type: "inland terminal", city: "Madurai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-479", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mahul Terminal", type: "port terminal", city: "Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-505", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mangalore Terminal", type: "port terminal", city: "Mangalore, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-480", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mathura Terminal", type: "inland terminal", city: "Mathura, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-481", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Meerut Depot", type: "inland terminal", city: "Meerut, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-482", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Miraj Terminal", type: "inland terminal", city: "Sangli, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-483", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mughalsarai Depot", type: "inland terminal", city: "Chandauli, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-484", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mundra Terminal", type: "port terminal", city: "Mundra, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-506", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Nalgarh Depot", type: "inland terminal", city: "Nalagarh, Himachal Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-485", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Palanpur Terminal", type: "inland terminal", city: "Banaskantha, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-486", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Paradeep Terminal", type: "port terminal", city: "Paradip, Odisha", country: "India", externalUrl: "https://tankbazaar.com/#terminal-487", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Patna Depot", type: "inland terminal", city: "Patna, Bihar", country: "India", externalUrl: "https://tankbazaar.com/#terminal-488", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Raipur Depot", type: "inland terminal", city: "Raipur, Chhattisgarh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-489", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Raipur-II Depot", type: "inland terminal", city: "Raipur, Chhattisgarh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-510", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Rajahmundry Terminal", type: "inland terminal", city: "Rajahmundry, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-490", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Ramagundam Depot", type: "inland terminal", city: "Ramagundam, Telangana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-491", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Roorkee Depot", type: "inland terminal", city: "Roorkee, Uttarakhand", country: "India", externalUrl: "https://tankbazaar.com/#terminal-492", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sagar Depot", type: "inland terminal", city: "Sagar, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-493", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Secunderabad Depot", type: "inland terminal", city: "Secunderabad, Telangana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-425", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sholapur Terminal", type: "inland terminal", city: "Solapur, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-494", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sitarganj Depot", type: "inland terminal", city: "Udham Singh Nagar, Uttarakhand", country: "India", externalUrl: "https://tankbazaar.com/#terminal-495", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Suryapet Terminal", type: "inland terminal", city: "Suryapet, Telangana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-496", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tirunelveli Depot", type: "inland terminal", city: "Tirunelveli, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-497", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vadodara Terminal", type: "inland terminal", city: "Vadodara, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-498", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vasco Terminal", type: "port terminal", city: "Vasco da Gama, Goa", country: "India", externalUrl: "https://tankbazaar.com/#terminal-499", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vashi Black Oil Depot", type: "port terminal", city: "Navi Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-507", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vashi White Oil Terminal", type: "port terminal", city: "Navi Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-500", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vijaywada Terminal", type: "inland terminal", city: "Vijayawada, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-91", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Visakh Black Oil Terminal", type: "port terminal", city: "Visakhapatnam, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-508", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Visakh White Oil Terminal", type: "port terminal", city: "Visakhapatnam, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-501", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "indian-oil-corporation-limited": [
    { name: "Barauni Refinery", type: "refinery", city: "Barauni, Bihar", country: "India", externalUrl: "https://tankbazaar.com/#terminal-433", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJP3d2xtEP8jkRMk-1NQggGoc" },
    { name: "Digboi Refinery", type: "refinery", city: "Digboi, Assam", country: "India", externalUrl: "https://tankbazaar.com/#terminal-83", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJOeEOpUwiPzcRviU7-xzz28M" },
    { name: "Guwahati Refinery", type: "refinery", city: "Guwahati, Assam", country: "India", externalUrl: "https://tankbazaar.com/#terminal-82", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJw-IJFkNYWjcRmqZEPYREQkA" },
    { name: "Haldia Refinery", type: "refinery", city: "Haldia, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-714", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJRdP_PQD3AjoRypsYkIcKaNI" },
    { name: "Koyali Refinery", type: "refinery", city: "Koyali, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-422", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJv8jGSwDJXzkRRABqXBad28Y" },
    { name: "Mathura Refinery", type: "refinery", city: "Mathura, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-84", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJ-7EFnC92czkRc5LSoRH566w" },
    { name: "Panipat Refinery", type: "refinery", city: "Panipat, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-75", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJ4Q3RW5PfDTkR2Wrcq2lcV_E" },
    { name: "Paradip Refinery", type: "refinery", city: "Paradip, Odisha", country: "India", externalUrl: "https://tankbazaar.com/#terminal-8", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJvSvjgy5LGjoRDEHZUdYC140" },
    { name: "Agartala Depot", type: "inland terminal", city: "Agartala, Tripura", country: "India", externalUrl: "https://tankbazaar.com/#terminal-371", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Agra Terminal", type: "inland terminal", city: "Agra, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-240", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Aizawl Depot", type: "inland terminal", city: "Aizawl, Mizoram", country: "India", externalUrl: "https://tankbazaar.com/#terminal-374", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bengaluru Depot", type: "inland terminal", city: "Bengaluru, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-396", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bijwasan Terminal", type: "inland terminal", city: "Delhi", country: "India", externalUrl: "https://tankbazaar.com/#terminal-252", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Byrnihat Depot", type: "inland terminal", city: "Byrnihat, Meghalaya", country: "India", externalUrl: "https://tankbazaar.com/#terminal-372", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Coimbatore Depot", type: "inland terminal", city: "Coimbatore, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-427", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dimapur Depot", type: "inland terminal", city: "Dimapur, Nagaland", country: "India", externalUrl: "https://tankbazaar.com/#terminal-375", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Doimukh Depot", type: "inland terminal", city: "Doimukh, Arunachal Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-712", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Imphal Depot", type: "inland terminal", city: "Imphal, Manipur", country: "India", externalUrl: "https://tankbazaar.com/#terminal-373", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jammu Depot", type: "inland terminal", city: "Jammu, Jammu and Kashmir", country: "India", externalUrl: "https://tankbazaar.com/#terminal-247", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kandla Foreshore Terminal", type: "inland terminal", city: "Kandla, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-250", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Karur Depot", type: "inland terminal", city: "Karur, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-429", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Khunti Terminal", type: "inland terminal", city: "Khunti, Jharkhand", country: "India", externalUrl: "https://tankbazaar.com/#terminal-520", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Loni Depot", type: "inland terminal", city: "Loni, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-421", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Madurai Depot", type: "inland terminal", city: "Madurai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-398", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mundra Terminal", type: "port terminal", city: "Mundra, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-73", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Naharlagun Depot", type: "inland terminal", city: "Naharlagun, Arunachal Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-376", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Panipat Depot", type: "inland terminal", city: "Panipat, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-26", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Parwanoo Depot", type: "inland terminal", city: "Parwanoo, Himachal Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-249", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Patna Terminal", type: "inland terminal", city: "Patna, Bihar", country: "India", externalUrl: "https://tankbazaar.com/#terminal-432", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Raipur Terminal", type: "inland terminal", city: "Raipur, Chhattisgarh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-431", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Ranchi Terminal", type: "inland terminal", city: "Ranchi, Jharkhand", country: "India", externalUrl: "https://tankbazaar.com/#terminal-430", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Rangpo Depot", type: "inland terminal", city: "Rangpo, Sikkim", country: "India", externalUrl: "https://tankbazaar.com/#terminal-377", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Salaya Depot", type: "inland terminal", city: "Salaya, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-419", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Salem Depot", type: "inland terminal", city: "Salem, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-428", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sanganer Terminal", type: "inland terminal", city: "Jaipur, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-254", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sekerkote Terminal", type: "inland terminal", city: "Sekerkote, Tripura", country: "India", externalUrl: "https://tankbazaar.com/#terminal-713", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Shakurbasti Terminal", type: "inland terminal", city: "Delhi", country: "India", externalUrl: "https://tankbazaar.com/#terminal-253", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Silchar Depot", type: "inland terminal", city: "Silchar, Assam", country: "India", externalUrl: "https://tankbazaar.com/#terminal-710", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Siliguri Depot", type: "inland terminal", city: "Siliguri, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-715", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Thoothukudi Terminal", type: "port terminal", city: "Thoothukudi, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-399", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tinsukia Depot", type: "inland terminal", city: "Tinsukia, Assam", country: "India", externalUrl: "https://tankbazaar.com/#terminal-711", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vadinar Terminal", type: "port terminal", city: "Vadinar, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-74", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Viramgam Depot", type: "inland terminal", city: "Viramgam, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-420", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "mangalore-refinery-and-petrochemicals-limited": [
    { name: "Mangalore Refinery", type: "refinery", city: "Mangalore, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-76", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJ0wG1uu5RozsR33BelXCrZJs" },
    { name: "Devangonthi Terminal", type: "inland terminal", city: "Bengaluru, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-522", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Katipalla Terminal", type: "port terminal", city: "Mangalore, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-521", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "nayara-energy-limited": [
    { name: "Vadinar Refinery", type: "refinery", city: "Vadinar, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-23", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJMa1G8BYdVzkRpo9VuvhNCys" },
  ],
  "haldia-petrochemicals-limited": [
    { name: "Haldia Petrochemical Complex", type: "plant", city: "Haldia, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-749", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJHUjDvrB1AjoRj9D3p9EXpuM" },
  ],
  "ongc-petro-additions-limited": [
    { name: "Dahej Petrochemical Complex", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-751", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJHwLbGgd-XzkRUPO05ejqkXc" },
  ],
  "oil-and-natural-gas-corporation-limited": [
    { name: "Hazira Gas Processing Plant", type: "plant", city: "Hazira, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-440", facilityClass: ["process"], processType: ["gas-processing-lng-lpg"], primaryClass: "process", googlePlaceId: "" },
    { name: "Uran Gas Processing Plant", type: "plant", city: "Uran, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-441", facilityClass: ["process"], processType: ["gas-processing-lng-lpg"], primaryClass: "process", googlePlaceId: "" },
  ],
  "tamil-nadu-petroproducts-limited": [
    { name: "Manali Petrochemical Complex", type: "plant", city: "Manali, Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-750", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJqd7A5wNwUjoRulASGJ8k92Q" },
  ],
  "china-petroleum-and-chemical-corporation-sinopec-corp": [
    { name: "Anqing Refinery", type: "refinery", city: "Anqing, Anhui", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1029", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Cangzhou Refinery", type: "refinery", city: "Cangzhou, Hebei", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1030", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Changling Refinery", type: "refinery", city: "Yueyang, Hunan", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1034", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Guangzhou Refinery", type: "refinery", city: "Guangzhou", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1025", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Hainan Refining and Chemical Complex", type: "refinery", city: "Yangpu, Hainan", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1044", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Jinan Refinery", type: "refinery", city: "Jinan, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1036", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Jingmen Refinery", type: "refinery", city: "Jingmen, Hubei", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1032", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Jinling Petrochemical Complex", type: "refinery", city: "Nanjing, Jiangsu", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1022", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Jiujiang Refinery", type: "refinery", city: "Jiujiang, Jiangxi", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1035", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Luoyang Refinery", type: "refinery", city: "Luoyang, Henan", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1031", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Maoming Petrochemical Complex", type: "refinery", city: "Maoming, Guangdong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-807", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Qilu Petrochemical Complex", type: "refinery", city: "Zibo, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-808", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Qingdao Refining and Chemical Complex", type: "refinery", city: "Qingdao, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1023", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Shanghai Gaoqiao Refinery", type: "refinery", city: "Shanghai", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1037", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Tianjin Refinery", type: "refinery", city: "Tianjin", country: "China", externalUrl: "https://tankbazaar.com/#terminal-210", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Wuhan Refinery", type: "refinery", city: "Wuhan, Hubei", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1033", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Yangzi Petrochemical Complex", type: "refinery", city: "Nanjing, Jiangsu", country: "China", externalUrl: "https://tankbazaar.com/#terminal-809", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Yanshan Petrochemical Complex", type: "refinery", city: "Beijing", country: "China", externalUrl: "https://tankbazaar.com/#terminal-871", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Zhanjiang Refinery", type: "refinery", city: "Zhanjiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-212", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Zhenhai Refining and Chemical Complex", type: "refinery", city: "Ningbo, Zhejiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-806", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petrochina-company-limited": [
    { name: "Dalian Oil Terminal", type: "port terminal", city: "Dalian", country: "China", externalUrl: "https://tankbazaar.com/#terminal-97", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dushanzi Refinery", type: "refinery", city: "Dushanzi, Xinjiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-705", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Khorgos Terminal", type: "inland terminal", city: "Khorgos, Xinjiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-704", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Lanzhou Refinery", type: "refinery", city: "Lanzhou", country: "China", externalUrl: "https://tankbazaar.com/#terminal-309", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Chengdu Depot", type: "inland terminal", city: "Chengdu", country: "China", externalUrl: "https://tankbazaar.com/#terminal-311", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dalian Petrochemical Complex", type: "refinery", city: "Dalian, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-811", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Daqing Petrochemical Complex", type: "refinery", city: "Daqing, Heilongjiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-812", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Fushun Petrochemical Complex", type: "refinery", city: "Fushun, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-813", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Jilin Chemical Refinery", type: "refinery", city: "Jilin City, Jilin", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1038", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Jinxi Refinery", type: "refinery", city: "Huludao, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1040", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Jinzhou Petrochemical Refinery", type: "refinery", city: "Jinzhou, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1039", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Karamay Petrochemical Complex", type: "refinery", city: "Karamay, Xinjiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1043", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Liaoyang Petrochemical Complex", type: "refinery", city: "Liaoyang, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1041", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Ningxia Petrochemical Complex", type: "refinery", city: "Yinchuan, Ningxia", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1042", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Sichuan Petrochemical Complex", type: "plant", city: "Pengzhou, Sichuan", country: "China", externalUrl: "https://tankbazaar.com/#terminal-870", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Shanshan Storage Facility", type: "inland terminal", city: "Shanshan, Xinjiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-706", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Urumqi Refinery", type: "refinery", city: "Urumqi", country: "China", externalUrl: "https://tankbazaar.com/#terminal-310", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Wangjiagou Liquids Storage Terminal", type: "inland terminal", city: "Korla, Xinjiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-703", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "exxon-mobil-corporation": [
    { name: "Baton Rouge Refinery", type: "refinery", city: "Baton Rouge LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-386", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJl7YxMrWhJoYRNNiFt1tfUIQ" },
    { name: "Baytown Refinery", type: "refinery", city: "Baytown TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-794", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJ24CyhuFeP4YRx9tb7NMe2Ss" },
    { name: "Antwerp Petrochemical Complex", type: "plant", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-863", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJ6UbXC7z1w0cRrf1ZfC6rjUo" },
    { name: "Baytown Chemical Plant", type: "plant", city: "Baytown TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-856", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJo-LaPgZfP4YRGhSdYJSTkwU" },
    { name: "Fife Petrochemical Complex", type: "plant", city: "Mossmorran, Fife", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-876", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "ChIJS9HdvYrLh0gRwUurtqOVjU4" },
    { name: "Georgetown Liza Base Terminal", type: "port terminal", city: "Georgetown", country: "Guyana", externalUrl: "https://tankbazaar.com/#terminal-273", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jurong Refinery", type: "refinery", city: "Jurong Island", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-24", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJo9Mhko0E2jERP0hUmBUNC_Q" },
    { name: "PNG LNG Caution Bay Terminal", type: "port terminal", city: "Port Moresby", country: "Papua New Guinea", externalUrl: "https://tankbazaar.com/#terminal-731", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pt-pertamina": [
    { name: "Balikpapan Refinery", type: "refinery", city: "Balikpapan", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-351", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJUxEWlwpH8S0Rb8LrJ9gM3yA" },
    { name: "Balongan Refinery", type: "refinery", city: "Indramayu, West Java", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-1021", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJJ_ZFnqS_bi4R3Q7UuXLMjbk" },
    { name: "Cilacap Refinery", type: "refinery", city: "Cilacap", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-22", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJyU1FKG8SZS4RI4bHoz0Yz6o" },
    { name: "Dumai Refinery", type: "refinery", city: "Dumai", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-173", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJFXmXpR2v0zERIdloLdq_KuQ" },
    { name: "Plaju Refinery", type: "refinery", city: "Palembang", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-825", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJU5Y3fbGdOy4RvkDPxWft-3w" },
    { name: "Surabaya Terminal", type: "port terminal", city: "Surabaya", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-352", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tanjung Priok Terminal", type: "port terminal", city: "Jakarta", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-172", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sorong Refinery", type: "refinery", city: "Sorong, Papua", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-1028", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJi-tk9LZmXC0RW8bNqKM6ID4" },
  ],
  "petroleo-brasileiro-sa-petrobras": [
    { name: "Araúcaria Fertilizer Plant", type: "plant", city: "Araucária, Paraná", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-926", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "ChIJhwLCUlwC3ZQR18fyFGCbuyk" },
    { name: "Paranaguá Terminal", type: "port terminal", city: "Paranagua", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-272", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Santos Terminal", type: "port terminal", city: "Santos", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-270", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "São Sebastião Terminal", type: "port terminal", city: "São Sebastião", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-56", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "REPLAN Refinery", type: "refinery", city: "Paulinia, Sao Paulo", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-763", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJZ2E61yyVyJQRR5QFQGDBU3Q" },
    { name: "REVAP Refinery", type: "refinery", city: "Sao Jose dos Campos, Sao Paulo", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-765", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJFRz3K0VKzJQR_kWOKV2QbYA" },
    { name: "RLAM Refinery", type: "refinery", city: "Mataripe, Bahia", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-764", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJwVTAa0dzFgcR-u5K0-pZsWI" },
    { name: "Suape Terminal", type: "port terminal", city: "Ipojuca, Pernambuco", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-999", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "koninklijke-vopak-nv": [
    { name: "Chemtank Jubail Terminal", type: "port terminal", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-557", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "EemsEnergy Terminal", type: "port terminal", city: "Eemshaven", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-576", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Gate Terminal LNG Rotterdam Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-577", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Huizhou Terminal", type: "port terminal", city: "Huizhou", country: "China", externalUrl: "https://tankbazaar.com/#terminal-539", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kertih Terminals Terminal", type: "port terminal", city: "Kertih", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-560", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "LNG Terminal Altamira Terminal", type: "port terminal", city: "Altamira", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-562", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Maasvlakte Olie Terminal Rotterdam Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-578", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pengerang Terminals Two Terminal", type: "port terminal", city: "Johor", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-561", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Ridley Island Energy Export Facility", type: "port terminal", city: "Prince Rupert BC", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-537", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Ridley Island Propane Export Terminal", type: "port terminal", city: "Prince Rupert BC", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-538", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "SPEC LNG Terminal", type: "port terminal", city: "Cartagena", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-544", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "SabTank Al Jubail Terminal", type: "port terminal", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-558", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "SabTank Yanbu Terminal", type: "port terminal", city: "Yanbu", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-559", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Saldanha Bay Terminal", type: "port terminal", city: "Saldanha", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-61", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Thai Tank Terminal", type: "port terminal", city: "Laem Chabang", country: "Thailand", externalUrl: "https://tankbazaar.com/#terminal-575", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Algeciras Terminal", type: "port terminal", city: "Algeciras", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-50", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bahia Las Minas Terminal", type: "port terminal", city: "Colon", country: "Panama", externalUrl: "https://tankbazaar.com/#terminal-530", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Botany Bay Terminal", type: "port terminal", city: "Sydney", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-59", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Brazil Alemoa Terminal", type: "port terminal", city: "Santos", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-535", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Brazil Aratu Terminal", type: "port terminal", city: "Salvador", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-536", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Buenos Aires Terminal", type: "port terminal", city: "Buenos Aires", country: "Argentina", externalUrl: "https://tankbazaar.com/#terminal-58", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Colombia Barranquilla Terminal", type: "port terminal", city: "Barranquilla", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-545", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Colombia Cartagena Terminal", type: "port terminal", city: "Cartagena", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-546", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Darwin Terminal", type: "port terminal", city: "Darwin", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-349", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Deer Park Terminal", type: "port terminal", city: "Deer Park TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-526", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Houston Terminal", type: "port terminal", city: "Houston TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-9", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jakarta Terminal", type: "port terminal", city: "Jakarta", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-527", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mexico Altamira Terminal", type: "port terminal", city: "Altamira", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-563", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mexico Coatzacoalcos Terminal", type: "port terminal", city: "Coatzacoalcos", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-564", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mexico Veracruz Terminal", type: "port terminal", city: "Veracruz", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-565", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Panama Terminal", type: "port terminal", city: "Panama City", country: "Panama", externalUrl: "https://tankbazaar.com/#terminal-567", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pengerang Terminal", type: "port terminal", city: "Johor", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-16", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Rotterdam Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-4", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sebarok Terminal", type: "port terminal", city: "Pulau Sebarok", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-30", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Shanghai Terminal", type: "port terminal", city: "Shanghai", country: "China", externalUrl: "https://tankbazaar.com/#terminal-528", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Singapore Banyan Terminal", type: "port terminal", city: "Pulau Bukom", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-568", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Singapore Jurong Rock Caverns Terminal", type: "port terminal", city: "Jurong Island", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-571", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Singapore Penjuru Terminal", type: "port terminal", city: "Penjuru", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-569", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Singapore Sakra Terminal", type: "port terminal", city: "Pulau Sakra", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-570", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal ACS Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-532", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Corpus Christi Terminal", type: "port terminal", city: "Corpus Christi TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-587", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Durban Terminal", type: "port terminal", city: "Durban", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-572", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Eemshaven Terminal", type: "port terminal", city: "Eemshaven", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-579", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Europoort Rotterdam Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-580", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Eurotank Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-533", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Haiteng Terminal", type: "port terminal", city: "Nanjing", country: "China", externalUrl: "https://tankbazaar.com/#terminal-540", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Laurenshaven Rotterdam Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-581", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Lesedi Terminal", type: "port terminal", city: "Durban", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-573", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Linkeroever Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-534", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Long Beach Terminal", type: "port terminal", city: "Long Beach CA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-588", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Los Angeles Terminal", type: "port terminal", city: "Los Angeles CA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-589", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Merak Terminal", type: "port terminal", city: "Merak", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-556", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Ningbo Terminal", type: "port terminal", city: "Ningbo", country: "China", externalUrl: "https://tankbazaar.com/#terminal-541", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Qinzhou Terminal", type: "port terminal", city: "Qinzhou", country: "China", externalUrl: "https://tankbazaar.com/#terminal-542", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Terquimsa Tarragona Terminal", type: "port terminal", city: "Tarragona", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-574", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Vlaardingen Terminal", type: "port terminal", city: "Vlaardingen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-582", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Zhangjiagang Terminal", type: "port terminal", city: "Zhangjiagang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-543", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tianjin Terminal", type: "port terminal", city: "Tianjin", country: "China", externalUrl: "https://tankbazaar.com/#terminal-529", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vlissingen Terminal", type: "port terminal", city: "Vlissingen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-257", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "kinder-morgan-inc": [
    { name: "Argo Terminal", type: "inland terminal", city: "Argo IL", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-628", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "BOSTCO Terminal", type: "port terminal", city: "Houston TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-620", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Baltimore Terminal", type: "port terminal", city: "Baltimore MD", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-633", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Carteret Terminal", type: "port terminal", city: "Carteret NJ", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-634", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Chesapeake Terminal", type: "port terminal", city: "Chesapeake VA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-625", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Cincinnati North Terminal", type: "inland terminal", city: "Cincinnati OH", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-629", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Deer Park Terminal", type: "inland terminal", city: "Deer Park TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-621", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Fairless Hills Terminal", type: "inland terminal", city: "Fairless Hills PA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-626", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Galena Park Terminal", type: "port terminal", city: "Galena Park TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-618", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Geismar River Terminal", type: "port terminal", city: "Geismar LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-622", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Harvey Terminal", type: "port terminal", city: "Harvey LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-623", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Indianapolis Terminal", type: "inland terminal", city: "Indianapolis IN", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-630", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Linden Terminal", type: "port terminal", city: "Linden NJ", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-635", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Long Beach Terminal", type: "port terminal", city: "Long Beach CA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-15", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "North Charleston Terminal", type: "port terminal", city: "North Charleston SC", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-637", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pasadena Terminal", type: "inland terminal", city: "Pasadena TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-619", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Perth Amboy Terminal", type: "port terminal", city: "Perth Amboy NJ", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-636", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "St Gabriel Terminal", type: "inland terminal", city: "St. Gabriel LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-624", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "St Louis Terminal", type: "inland terminal", city: "St. Louis MO", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-631", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Wilmington River Road Terminal", type: "port terminal", city: "Wilmington DE", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-627", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Wood River Terminal", type: "inland terminal", city: "Wood River IL", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-632", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "oiltanking-gmbh": [
    { name: "Abidjan Terminal", type: "port terminal", city: "Abidjan", country: "Ivory Coast", externalUrl: "https://tankbazaar.com/#terminal-63", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Amsterdam Terminal", type: "port terminal", city: "Amsterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-3", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-11", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Cartagena Terminal", type: "port terminal", city: "Cartagena", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-57", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Hamburg Terminal", type: "port terminal", city: "Hamburg", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-259", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Malta Terminal", type: "port terminal", city: "Birżebbuġa", country: "Malta", externalUrl: "https://tankbazaar.com/#terminal-51", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Bendorf Terminal", type: "inland terminal", city: "Bendorf", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-590", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Berlin Terminal", type: "inland terminal", city: "Berlin", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-591", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Budapest Terminal", type: "inland terminal", city: "Budapest", country: "Hungary", externalUrl: "https://tankbazaar.com/#terminal-602", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Copenhagen Terminal", type: "port terminal", city: "Copenhagen", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-601", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Duisburg Terminal", type: "inland terminal", city: "Duisburg", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-592", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Frankfurt/Main Terminal", type: "inland terminal", city: "Frankfurt", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-593", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Gera Terminal", type: "inland terminal", city: "Gera", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-594", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Hamburg-Blumensand Terminal", type: "port terminal", city: "Hamburg", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-595", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Hamburg-Waltershof Terminal", type: "port terminal", city: "Hamburg", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-596", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Hamm Terminal", type: "inland terminal", city: "Hamm", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-597", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Hanau Terminal", type: "inland terminal", city: "Hanau", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-598", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Karlsruhe Terminal", type: "inland terminal", city: "Karlsruhe", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-599", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "enport Rheinau-Honau Terminal", type: "inland terminal", city: "Rheinau", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-600", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vtti-bv": [
    { name: "Adriatic LNG Terminal", type: "port terminal", city: "Rovigo", country: "Italy", externalUrl: "https://tankbazaar.com/#terminal-668", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dragon LNG Terminal", type: "port terminal", city: "Waterston", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-669", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "ATB Johor Terminal", type: "port terminal", city: "Johor", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-662", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "ATPC Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-670", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "ATT Ploce Terminal", type: "port terminal", city: "Ploce", country: "Croatia", externalUrl: "https://tankbazaar.com/#terminal-671", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "BCT Cape Town Terminal", type: "port terminal", city: "Cape Town", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-675", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "ETA Amsterdam Terminal", type: "port terminal", city: "Amsterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-672", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "ETT Rotterdam Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-673", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Fujairah Terminal", type: "port terminal", city: "Fujairah", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-135", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "KHT Port Qasim Terminal", type: "port terminal", city: "Port Qasim", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-663", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kenya Mombasa Terminal", type: "port terminal", city: "Mombasa", country: "Kenya", externalUrl: "https://tankbazaar.com/#terminal-676", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "PATSA Balboa Terminal", type: "port terminal", city: "Panama City", country: "Panama", externalUrl: "https://tankbazaar.com/#terminal-678", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "SCC Seaport Canaveral Terminal", type: "port terminal", city: "Cape Canaveral FL", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-677", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "VITCO Zarate Terminal", type: "port terminal", city: "Zarate", country: "Argentina", externalUrl: "https://tankbazaar.com/#terminal-679", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "VTD Dalian Terminal", type: "port terminal", city: "Dalian", country: "China", externalUrl: "https://tankbazaar.com/#terminal-664", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "VTTV Vasilikos Terminal", type: "port terminal", city: "Vasilikos", country: "Cyprus", externalUrl: "https://tankbazaar.com/#terminal-674", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Zevenellen Terminal", type: "inland terminal", city: "Zevenellen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-667", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "advario-bv": [
    { name: "Daya Bay Terminal", type: "port terminal", city: "Huizhou, Guangdong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-603", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Finland Hamina Terminal", type: "port terminal", city: "Hamina", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-604", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Finland Kotka Terminal", type: "port terminal", city: "Kotka", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-605", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Galveston County Terminal", type: "port terminal", city: "Texas City TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-606", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Gas Terminal Kallo Terminal", type: "port terminal", city: "Kallo", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-607", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Helios Singapore Terminal", type: "port terminal", city: "Jurong Island", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-608", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Nanjing Terminal", type: "port terminal", city: "Nanjing, Jiangsu", country: "China", externalUrl: "https://tankbazaar.com/#terminal-609", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Singapore Chemical Terminal", type: "port terminal", city: "Jurong Island", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-610", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Singapore Limited Terminal", type: "port terminal", city: "Jurong Island", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-611", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Stolthaven Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-612", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminals Sohar Terminal", type: "port terminal", city: "Sohar", country: "Oman", externalUrl: "https://tankbazaar.com/#terminal-613", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Texas City Terminal", type: "port terminal", city: "Texas City TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-614", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Jurong Port Tank Terminals Terminal", type: "port terminal", city: "Jurong Island", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-615", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Star Energy Advario Terminal", type: "port terminal", city: "Jebel Ali, Dubai", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-616", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Terminal Quimica Puerto Mexico Terminal", type: "port terminal", city: "Coatzacoalcos", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-617", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "tepsa-infra-sas": [
    { name: "Barcelona Terminal", type: "port terminal", city: "Barcelona", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-658", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bilbao Terminal", type: "port terminal", city: "Bilbao", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-659", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Brest Terminal", type: "port terminal", city: "Brest", country: "France", externalUrl: "https://tankbazaar.com/#terminal-649", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Corsica Terminal", type: "port terminal", city: "Ajaccio", country: "France", externalUrl: "https://tankbazaar.com/#terminal-650", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dunkirk Terminal", type: "port terminal", city: "Dunkirk", country: "France", externalUrl: "https://tankbazaar.com/#terminal-651", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Europoort Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-657", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Rotterdam Botlek Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-656", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Rouen Terminal", type: "port terminal", city: "Rouen", country: "France", externalUrl: "https://tankbazaar.com/#terminal-652", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Saint-Priest Terminal", type: "inland terminal", city: "Saint-Priest", country: "France", externalUrl: "https://tankbazaar.com/#terminal-653", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Salaise-sur-Sanne Terminal", type: "inland terminal", city: "Salaise-sur-Sanne", country: "France", externalUrl: "https://tankbazaar.com/#terminal-654", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tarragona Terminal", type: "port terminal", city: "Tarragona", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-660", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Valencia Terminal", type: "port terminal", city: "Valencia", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-661", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Village-Neuf Terminal", type: "inland terminal", city: "Village-Neuf", country: "France", externalUrl: "https://tankbazaar.com/#terminal-655", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "aegis-vopak-terminals-limited": [
    { name: "CRL1 Terminal", type: "port terminal", city: "Kochi, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-547", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "CRL2 Terminal", type: "port terminal", city: "Kochi, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-548", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Haldia Terminal", type: "port terminal", city: "Haldia, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-35", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "JNPA Mumbai Terminal", type: "port terminal", city: "Nhava Sheva, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-549", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kandla Terminal", type: "port terminal", city: "Kandla, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-33", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kandla LPG Terminal", type: "port terminal", city: "Kandla, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-550", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kochi Terminal", type: "port terminal", city: "Kochi, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-34", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mangalore LPG Terminal", type: "port terminal", city: "Mangaluru, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-551", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mangaluru Terminal", type: "port terminal", city: "Mangaluru, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-36", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Nadella Terminal", type: "port terminal", city: "Kakinada, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-552", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pipavav LPG Terminal", type: "port terminal", city: "Pipavav, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-554", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pipavav Terminal", type: "port terminal", city: "Pipavav, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-553", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "exolum-terminals-ltd": [
    { name: "Inter Terminals Asnaes Terminal", type: "port terminal", city: "Asnaes", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-638", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Inter Terminals Ensted Terminal", type: "port terminal", city: "Ensted", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-639", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Inter Terminals Gavle Terminal", type: "port terminal", city: "Gavle", country: "Sweden", externalUrl: "https://tankbazaar.com/#terminal-642", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Inter Terminals Gothenburg Terminal", type: "port terminal", city: "Gothenburg", country: "Sweden", externalUrl: "https://tankbazaar.com/#terminal-643", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Inter Terminals Gulfhavn Terminal", type: "port terminal", city: "Gulfhavn", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-640", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Inter Terminals Malmo Terminal", type: "port terminal", city: "Malmo", country: "Sweden", externalUrl: "https://tankbazaar.com/#terminal-644", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Inter Terminals Sodertalje Terminal", type: "port terminal", city: "Sodertalje", country: "Sweden", externalUrl: "https://tankbazaar.com/#terminal-645", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Inter Terminals Stigsnaes Terminal", type: "port terminal", city: "Stigsnaes", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-641", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "national-petroleum-and-natural-gas-pipeline-group-co-ltd": [
    { name: "Beihai LNG Terminal", type: "port terminal", city: "Beihai, Guangxi", country: "China", externalUrl: "https://tankbazaar.com/#terminal-698", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dalian LNG Terminal", type: "port terminal", city: "Dalian, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-693", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Fangchenggang LNG Terminal", type: "port terminal", city: "Fangchenggang, Guangxi", country: "China", externalUrl: "https://tankbazaar.com/#terminal-699", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Hainan (Yangpu) LNG Terminal", type: "port terminal", city: "Yangpu, Hainan", country: "China", externalUrl: "https://tankbazaar.com/#terminal-700", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Shenzhen (Diefu) LNG Terminal", type: "port terminal", city: "Shenzhen, Guangdong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-697", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tianjin LNG Terminal", type: "port terminal", city: "Tianjin", country: "China", externalUrl: "https://tankbazaar.com/#terminal-694", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Yuedong (Jieyang) LNG Terminal", type: "port terminal", city: "Jieyang, Guangdong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-696", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Zhangzhou LNG Terminal", type: "port terminal", city: "Zhangzhou, Fujian", country: "China", externalUrl: "https://tankbazaar.com/#terminal-695", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "imc-limited": [
    { name: "Dighi Terminal", type: "port terminal", city: "Dighi, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-436", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Karwar Terminal", type: "port terminal", city: "Karwar, Karnataka", country: "India", externalUrl: "https://tankbazaar.com/#terminal-438", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kolkata Terminal", type: "port terminal", city: "Kolkata, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-439", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mormugao Terminal", type: "port terminal", city: "Mormugao, Goa", country: "India", externalUrl: "https://tankbazaar.com/#terminal-437", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Nhava Sheva Terminal", type: "port terminal", city: "Nhava Sheva, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-37", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pipavav Terminal", type: "port terminal", city: "Pipavav, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-435", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "chennai-petroleum-corporation-limited": [
    { name: "Korukkupet Terminal", type: "inland terminal", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-524", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tondiarpet Terminal", type: "inland terminal", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-525", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vallur Petroleum Terminal", type: "inland terminal", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-523", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Cauvery Basin Refinery", type: "refinery", city: "Nagapattinam, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-89", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJJXgHkqcUVToRrAcLEtVsq7w" },
    { name: "Manali Refinery", type: "refinery", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-81", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJK0_nn1BlUjoRwmyag6o1lpA" },
  ],
  "puma-energy-holdings-pte-ltd": [
    { name: "Acajutla Fuel Terminal", type: "port terminal", city: "Acajutla", country: "El Salvador", externalUrl: "https://tankbazaar.com/#terminal-740", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Corinto Fuel Terminal", type: "port terminal", city: "Corinto", country: "Nicaragua", externalUrl: "https://tankbazaar.com/#terminal-739", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Puerto Cortés Fuel Terminal", type: "port terminal", city: "Puerto Cortes", country: "Honduras", externalUrl: "https://tankbazaar.com/#terminal-738", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Puerto Quetzal Fuel Terminal", type: "port terminal", city: "Puerto Quetzal", country: "Guatemala", externalUrl: "https://tankbazaar.com/#terminal-737", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Milford Haven Terminal", type: "port terminal", city: "Milford Haven", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-255", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "eneos-corporation": [
    { name: "Negishi Refinery", type: "refinery", city: "Yokohama", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-822", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJX1EAQcFCGGARlYoy1MUc1HQ" },
    { name: "Saitama Depot", type: "inland terminal", city: "Saitama", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-358", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sendai Refinery", type: "refinery", city: "Sendai", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-357", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJJ_VkzhePiV8RrV5mJXW0vM8" },
    { name: "Kawasaki Refinery", type: "refinery", city: "Kawasaki", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-49", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ecopetrol-sa": [
    { name: "Coveñas Terminal", type: "port terminal", city: "Coveñas", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-997", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Barrancabermeja Refinery", type: "refinery", city: "Barrancabermeja", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-219", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJR5X6DXvrQo4RgRKCF3zr64Y" },
    { name: "Buenaventura Terminal", type: "port terminal", city: "Buenaventura", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-220", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Refineria de Cartagena (Reficar)", type: "refinery", city: "Cartagena", country: "Colombia", externalUrl: "https://tankbazaar.com/#terminal-766", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJPyp7B5gn9o4RPEWRpChEWAs" },
  ],
  "equinor-asa": [
    { name: "Hammerfest Snøhvit Terminal", type: "port terminal", city: "Hammerfest", country: "Norway", externalUrl: "https://tankbazaar.com/#terminal-368", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mongstad Refinery", type: "refinery", city: "Mongstad", country: "Norway", externalUrl: "https://tankbazaar.com/#terminal-782", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJ8S2xrqAVPUYRuzvWbp9L6Gw" },
    { name: "Sture Terminal", type: "port terminal", city: "Sture", country: "Norway", externalUrl: "https://tankbazaar.com/#terminal-229", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mongstad Terminal", type: "port terminal", city: "Mongstad", country: "Norway", externalUrl: "https://tankbazaar.com/#terminal-120", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "exolum-corporation-sa": [
    { name: "CLH Bilbao Terminal", type: "port terminal", city: "Bilbao", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-52", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "CLH Huelva Terminal", type: "port terminal", city: "Huelva", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-260", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "CLH Madrid Depot", type: "inland terminal", city: "Madrid", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-325", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Madrid Barajas Fuel Farm", type: "inland terminal", city: "Madrid Barajas", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-417", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "grupa-azoty-sa": [
    { name: "Kędzierzyn Fertilizer Plant", type: "plant", city: "Kędzierzyn-Koźle", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-972", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "ChIJCTh5jfcTEUcRg47bshlz2Eg" },
    { name: "Police Fertilizer Plant", type: "plant", city: "Police", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-973", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "ChIJQ9UPVBRzqkcR9N-0E5xzRKU" },
    { name: "Puławy Fertilizer Plant", type: "plant", city: "Puławy", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-924", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "ChIJ5SL_cpV5IkcR0U5jsdAMOCg" },
    { name: "Tarnów Fertilizer Plant", type: "plant", city: "Tarnów", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-982", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "ChIJm9B8a3aEPUcRTe_vOobKZMM" },
  ],
  "petroleos-de-venezuela-sa": [
    { name: "Amuay Refinery", type: "refinery", city: "Punto Fijo", country: "Venezuela", externalUrl: "https://tankbazaar.com/#terminal-2", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJLR3htt-ShY4R95Gd4zHgci0" },
    { name: "Jose Terminal", type: "port terminal", city: "Jose", country: "Venezuela", externalUrl: "https://tankbazaar.com/#terminal-223", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Puerto La Cruz Refinery", type: "refinery", city: "Puerto La Cruz", country: "Venezuela", externalUrl: "https://tankbazaar.com/#terminal-159", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJT1wqTJ12LYwRnE3t4i3RILQ" },
    { name: "Refineria El Palito", type: "refinery", city: "Puerto Cabello, Carabobo", country: "Venezuela", externalUrl: "https://tankbazaar.com/#terminal-768", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJnYun0r9VgI4RxqBLQKpItms" },
  ],
  "turkiye-petrol-rafinerileri-as-tupras": [
    { name: "Aliağa Refinery", type: "refinery", city: "Aliaga", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-193", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJdVzOJD0wuhQRObd1DNnQCwc" },
    { name: "İzmit Refinery", type: "refinery", city: "Izmit", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-192", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJwSS_vsA4yxQRVcXGN1v41A4" },
    { name: "Batman Refinery", type: "refinery", city: "Batman", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-829", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJeSanljZHC0ARtkmra43U2V0" },
    { name: "Kırıkkale Refinery", type: "refinery", city: "Kırıkkale", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-828", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "ChIJD61F_YHfgUARl3ExRjvLt7o" },
  ],
  "ampol-limited": [
    { name: "Brisbane Terminal", type: "port terminal", city: "Brisbane", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-348", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Lytton Refinery", type: "refinery", city: "Brisbane", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-827", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "bp-products-north-america-inc": [
    { name: "Chicago Depot", type: "inland terminal", city: "Chicago IL", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-387", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Whiting Refinery", type: "refinery", city: "Whiting IN", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-798", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "borealis-ag": [
    { name: "Agrolinz Melamine Terminal", type: "plant", city: "Linz", country: "Austria", externalUrl: "https://tankbazaar.com/#terminal-922", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Kallo Terminal", type: "plant", city: "Kallo", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-867", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "braskem-sa": [
    { name: "Camaçari Terminal", type: "plant", city: "Camaçari, Bahia", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-850", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Triunfo Terminal", type: "plant", city: "Triunfo, Rio Grande do Sul", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-889", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "cf-industries-holdings-inc": [
    { name: "Donaldsonville Terminal", type: "plant", city: "Donaldsonville LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-904", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Verdigris Terminal", type: "plant", city: "Verdigris OK", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-985", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Yazoo City Terminal", type: "plant", city: "Yazoo City MS", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-984", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "cpc-corp": [
    { name: "Keelung Terminal", type: "port terminal", city: "Keelung", country: "Taiwan", externalUrl: "https://tankbazaar.com/#terminal-361", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Taichung Terminal", type: "port terminal", city: "Taichung", country: "Taiwan", externalUrl: "https://tankbazaar.com/#terminal-360", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "chevron-usa-inc": [
    { name: "El Segundo Refinery", type: "refinery", city: "El Segundo CA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-800", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Pascagoula Refinery", type: "refinery", city: "Pascagoula MS", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-802", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Richmond Refinery", type: "refinery", city: "Richmond CA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-801", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "china-national-offshore-oil-corporation": [
    { name: "CNOOC Guangzhou Refinery", type: "refinery", city: "Guangzhou", country: "China", externalUrl: "https://tankbazaar.com/#terminal-211", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "CNOOC Huizhou Refinery", type: "refinery", city: "Huizhou, Guangdong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1024", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "CNOOC Zhanjiang Dongfang Petrochemical Terminal", type: "refinery", city: "Zhanjiang, Guangdong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1045", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "china-railway-logistics": [
    { name: "Baotou Terminal", type: "inland terminal", city: "Baotou, Inner Mongolia", country: "China", externalUrl: "https://tankbazaar.com/#terminal-709", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Xilinhot Terminal", type: "inland terminal", city: "Xilinhot, Inner Mongolia", country: "China", externalUrl: "https://tankbazaar.com/#terminal-708", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "cobil": [
    { name: "Kinshasa Depot", type: "inland terminal", city: "Kinshasa", country: "DRC", externalUrl: "https://tankbazaar.com/#terminal-346", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Matadi Terminal", type: "port terminal", city: "Matadi", country: "DRC", externalUrl: "https://tankbazaar.com/#terminal-164", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "coromandel-international-limited": [
    { name: "Ennore Terminal", type: "plant", city: "Ennore, Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-979", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Vizag Terminal", type: "plant", city: "Visakhapatnam, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-897", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "cosmo-oil-co-ltd": [
    { name: "Osaka Terminal", type: "refinery", city: "Osaka", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-356", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Yokkaichi Terminal", type: "refinery", city: "Yokkaichi", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-189", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ep-petroecuador": [
    { name: "Petroecuador Balao Terminal", type: "port terminal", city: "Balao", country: "Ecuador", externalUrl: "https://tankbazaar.com/#terminal-279", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Petroecuador Esmeraldas Terminal", type: "refinery", city: "Esmeraldas", country: "Ecuador", externalUrl: "https://tankbazaar.com/#terminal-156", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "empresa-nacional-del-petroleo-enap": [
    { name: "ENAP Quintero Terminal", type: "port terminal", city: "Quintero", country: "Chile", externalUrl: "https://tankbazaar.com/#terminal-277", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "ENAP Valparaiso Terminal", type: "refinery", city: "Valparaiso", country: "Chile", externalUrl: "https://tankbazaar.com/#terminal-154", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "eurochem-group-ag": [
    { name: "Antwerp Terminal", type: "plant", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-967", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Novomoskovsk Terminal", type: "plant", city: "Novomoskovsk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-917", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "formosa-plastics-corporation": [
    { name: "Mailiao Terminal", type: "plant", city: "Mailiao, Yunlin", country: "Taiwan", externalUrl: "https://tankbazaar.com/#terminal-848", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Point Comfort Terminal", type: "plant", city: "Point Comfort TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-865", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "gail-india-limited": [
    { name: "Auraiya Terminal", type: "inland terminal", city: "Auraiya, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-424", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pata Petrochemical Complex", type: "plant", city: "Pata, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-888", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Vijaipur Terminal", type: "inland terminal", city: "Vijaipur, Madhya Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-423", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "galp-energia-sgps-sa": [
    { name: "Setubal Terminal", type: "port terminal", city: "Setubal", country: "Portugal", externalUrl: "https://tankbazaar.com/#terminal-261", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Leixões Terminal", type: "port terminal", city: "Leça da Palmeira", country: "Portugal", externalUrl: "https://tankbazaar.com/#terminal-107", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sines Oil Terminal", type: "port terminal", city: "Sines", country: "Portugal", externalUrl: "https://tankbazaar.com/#terminal-106", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "icl-group-ltd": [
    { name: "Rotem Terminal", type: "plant", city: "Arad", country: "Israel", externalUrl: "https://tankbazaar.com/#terminal-971", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Sodom Terminal", type: "plant", city: "Sodom", country: "Israel", externalUrl: "https://tankbazaar.com/#terminal-910", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "idemitsu-kosan-co-ltd": [
    { name: "Chiba Refinery", type: "refinery", city: "Ichihara, Chiba", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-823", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Kashima Terminal", type: "refinery", city: "Kashima", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-190", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Tokuyama Terminal", type: "plant", city: "Shunan, Yamaguchi", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-891", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "imperial-oil-limited": [
    { name: "Halifax Terminal", type: "port terminal", city: "Halifax, Nova Scotia", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-1003", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sarnia Refinery", type: "refinery", city: "Sarnia", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-389", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "intercontinental-terminals-company-llc": [
    { name: "ITC Deer Park Terminal", type: "port terminal", city: "Deer Park TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-646", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "ITC Pasadena Terminal", type: "inland terminal", city: "Pasadena TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-647", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "irving-oil-limited": [
    { name: "Whitegate Terminal", type: "port terminal", city: "Cork", country: "Ireland", externalUrl: "https://tankbazaar.com/#terminal-263", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Saint John Refinery", type: "refinery", city: "Saint John", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-168", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "jsc-uzbekneftegaz": [
    { name: "Bukhara Refinery", type: "refinery", city: "Bukhara", country: "Uzbekistan", externalUrl: "https://tankbazaar.com/#terminal-379", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Fergana Refinery", type: "refinery", city: "Fergana", country: "Uzbekistan", externalUrl: "https://tankbazaar.com/#terminal-830", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "jordan-petroleum-refinery-company-jopetrol": [
    { name: "JOPetrol Amman Depot", type: "inland terminal", city: "Amman", country: "Jordan", externalUrl: "https://tankbazaar.com/#terminal-137", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "JOPetrol Zarqa Depot", type: "inland terminal", city: "Zarqa", country: "Jordan", externalUrl: "https://tankbazaar.com/#terminal-383", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Zarqa Refinery", type: "refinery", city: "Zarqa", country: "Jordan", externalUrl: "https://tankbazaar.com/#terminal-762", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "k-s-aktiengesellschaft": [
    { name: "Bernburg Terminal", type: "plant", city: "Bernburg", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-969", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Kali Werra Terminal", type: "plant", city: "Werra", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-909", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Sigmundshall Terminal", type: "plant", city: "Bad Nenndorf", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-970", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "kuwait-national-petroleum-company": [
    { name: "KNPC Kuwait City Depot", type: "inland terminal", city: "Kuwait City", country: "Kuwait", externalUrl: "https://tankbazaar.com/#terminal-328", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Shuaiba Refinery", type: "refinery", city: "Shuaiba", country: "Kuwait", externalUrl: "https://tankbazaar.com/#terminal-46", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "kuwait-petroleum-corporation": [
    { name: "KPC Nairobi Depot", type: "inland terminal", city: "Nairobi", country: "Kenya", externalUrl: "https://tankbazaar.com/#terminal-153", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Mina Al-Ahmadi Refinery", type: "refinery", city: "Mina Ahmadi", country: "Kuwait", externalUrl: "https://tankbazaar.com/#terminal-19", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Mombasa Oil Terminal", type: "port terminal", city: "Mombasa", country: "Kenya", externalUrl: "https://tankbazaar.com/#terminal-62", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "lg-chem-ltd": [
    { name: "Daesan Terminal", type: "plant", city: "Daesan", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-869", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Yeosu Terminal", type: "plant", city: "Yeosu", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-849", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "marathon-petroleum-corporation": [
    { name: "Galveston Bay Refinery", type: "refinery", city: "Texas City TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-795", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Garyville Refinery", type: "refinery", city: "Garyville LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-796", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "motor-oil-hellas-corinth-refineries-sa": [
    { name: "Agioi Theodoroi Terminal", type: "port terminal", city: "Agioi Theodoroi", country: "Greece", externalUrl: "https://tankbazaar.com/#terminal-109", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Hellas Thessaloniki Terminal", type: "port terminal", city: "Thessaloniki", country: "Greece", externalUrl: "https://tankbazaar.com/#terminal-194", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "neste-oyj": [
    { name: "Naantali Terminal", type: "port terminal", city: "Naantali", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-125", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Porvoo Refinery", type: "refinery", city: "Porvoo", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-781", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Porvoo Terminal", type: "port terminal", city: "Porvoo", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-124", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "nigerian-national-petroleum-company-limited": [
    { name: "NNPC Kaduna Refinery", type: "refinery", city: "Kaduna", country: "Nigeria", externalUrl: "https://tankbazaar.com/#terminal-147", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "NNPC Port Harcourt Terminal", type: "refinery", city: "Port Harcourt", country: "Nigeria", externalUrl: "https://tankbazaar.com/#terminal-300", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "numaligarh-refinery-limited": [
    { name: "NRL Siliguri Terminal", type: "inland terminal", city: "Siliguri, West Bengal", country: "India", externalUrl: "https://tankbazaar.com/#terminal-434", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Refinery", type: "refinery", city: "Numaligarh, Assam", country: "India", externalUrl: "https://tankbazaar.com/#terminal-85", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "nutrien-ltd": [
    { name: "Borger Terminal", type: "plant", city: "Borger TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-987", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Geismar Terminal", type: "plant", city: "Geismar LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-920", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Redwater Terminal", type: "plant", city: "Redwater, Alberta", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-905", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ocp-group-sa": [
    { name: "Jorf Lasfar Terminal", type: "plant", city: "El Jadida", country: "Morocco", externalUrl: "https://tankbazaar.com/#terminal-906", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Safi Terminal", type: "plant", city: "Safi", country: "Morocco", externalUrl: "https://tankbazaar.com/#terminal-964", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "omv-aktiengesellschaft": [
    { name: "Lobau Terminal", type: "inland terminal", city: "Vienna", country: "Austria", externalUrl: "https://tankbazaar.com/#terminal-723", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Schwechat Refinery", type: "refinery", city: "Schwechat", country: "Austria", externalUrl: "https://tankbazaar.com/#terminal-313", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "omv-petrom-sa": [
    { name: "Petrobrazi Refinery", type: "refinery", city: "Ploiesti", country: "Romania", externalUrl: "https://tankbazaar.com/#terminal-780", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Petrom Ploiesti Depot", type: "inland terminal", city: "Ploiesti", country: "Romania", externalUrl: "https://tankbazaar.com/#terminal-236", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "oq-saoc": [
    { name: "Duqm Terminal", type: "port terminal", city: "Duqm", country: "Oman", externalUrl: "https://tankbazaar.com/#terminal-129", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Oman Oil Nizwa Depot", type: "inland terminal", city: "Nizwa", country: "Oman", externalUrl: "https://tankbazaar.com/#terminal-330", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pjsc-phosagro": [
    { name: "PhosAgro Balakovo Terminal", type: "plant", city: "Balakovo", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-977", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "PhosAgro Cherepovets Terminal", type: "plant", city: "Cherepovets", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-907", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pjsc-rosneft-oil-company": [
    { name: "Angarsk Refinery", type: "refinery", city: "Angarsk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-307", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Ryazan Refinery", type: "refinery", city: "Ryazan", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-308", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Tuapse Refinery", type: "refinery", city: "Tuapse", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-225", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pakistan-state-oil-company-limited-pso": [
    { name: "PSO Karachi Port Terminal", type: "port terminal", city: "Karachi", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-301", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "PSO Mahmood Kot Depot", type: "inland terminal", city: "Mahmood Kot", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-303", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petroliam-nasional-berhad-petronas": [
    { name: "Melaka Refinery", type: "refinery", city: "Melaka", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-353", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Petronas Bintulu Terminal", type: "port terminal", city: "Bintulu", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-183", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petron-corporation": [
    { name: "Batangas Terminal", type: "port terminal", city: "Batangas", country: "Philippines", externalUrl: "https://tankbazaar.com/#terminal-184", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Cebu Terminal", type: "port terminal", city: "Cebu", country: "Philippines", externalUrl: "https://tankbazaar.com/#terminal-359", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Limay Terminal", type: "refinery", city: "Limay", country: "Philippines", externalUrl: "https://tankbazaar.com/#terminal-185", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petroleos-del-peru-petroperu-sa": [
    { name: "Petroperu Callao Terminal", type: "port terminal", city: "Callao", country: "Peru", externalUrl: "https://tankbazaar.com/#terminal-278", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Petroperu Talara Terminal", type: "refinery", city: "Talara", country: "Peru", externalUrl: "https://tankbazaar.com/#terminal-155", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "phillips-66-company": [
    { name: "Sweeny Refinery", type: "refinery", city: "Old Ocean TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-803", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Wood River Refinery", type: "refinery", city: "Roxana IL", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-799", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "preem-ab": [
    { name: "Brofjorden Terminal", type: "refinery", city: "Lysekil", country: "Sweden", externalUrl: "https://tankbazaar.com/#terminal-119", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Nynashamn Terminal", type: "refinery", city: "Nynashamn", country: "Sweden", externalUrl: "https://tankbazaar.com/#terminal-230", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "qatarenergy": [
    { name: "Qatar Mesaieed Terminal", type: "port terminal", city: "Mesaieed", country: "Qatar", externalUrl: "https://tankbazaar.com/#terminal-40", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Ras Laffan Terminal", type: "port terminal", city: "Ras Laffan", country: "Qatar", externalUrl: "https://tankbazaar.com/#terminal-128", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "rashtriya-chemicals-and-fertilizers-limited": [
    { name: "RCF Thal Terminal", type: "plant", city: "Thal, Raigad, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-894", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "RCF Trombay Terminal", type: "plant", city: "Trombay, Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-893", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "repsol-sa": [
    { name: "Cartagena Repsol Terminal", type: "port terminal", city: "Cartagena", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-104", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tarragona Terminal", type: "port terminal", city: "Tarragona", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-105", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "rosneft-oil-company-pjsc": [
    { name: "Murmansk Arctic Terminal", type: "port terminal", city: "Murmansk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-365", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Ust-Luga Terminal", type: "port terminal", city: "Ust-Luga", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-55", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vostok Oil Bukhta Sever Terminal", type: "port terminal", city: "Bukhta Sever", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-367", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "saudi-arabian-oil-company-saudi-aramco": [
    { name: "Aramco Jeddah Terminal", type: "port terminal", city: "Jeddah", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-127", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Aramco Riyadh Depot", type: "inland terminal", city: "Riyadh", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-136", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "saudi-basic-industries-corporation-sabic": [
    { name: "SABIC Geleen Terminal", type: "plant", city: "Geleen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-864", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "SABIC Jubail Terminal", type: "plant", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-846", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "SABIC Wilton Terminal", type: "plant", city: "Wilton, Redcar", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-875", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "shell-plc": [
    { name: "Banyan Terminal", type: "port terminal", city: "Pulau Bukom", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-354", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Energy and Chemicals Park Singapore Terminal", type: "refinery", city: "Pulau Bukom", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-821", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "skytanking": [
    { name: "Frankfurt Fuel Farm", type: "inland terminal", city: "Frankfurt", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-410", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Munich Fuel Farm", type: "inland terminal", city: "Munich", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-416", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-algerienne-de-raffinage-naftec": [
    { name: "Naftec Arzew Refinery", type: "refinery", city: "Arzew", country: "Algeria", externalUrl: "https://tankbazaar.com/#terminal-834", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Skikda Refinery", type: "refinery", city: "Skikda", country: "Algeria", externalUrl: "https://tankbazaar.com/#terminal-835", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sonangol-ap": [
    { name: "Cabinda Refinery", type: "refinery", city: "Cabinda", country: "Angola", externalUrl: "https://tankbazaar.com/#terminal-345", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Luanda Terminal", type: "port terminal", city: "Luanda", country: "Angola", externalUrl: "https://tankbazaar.com/#terminal-143", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "state-oil-company-of-the-azerbaijan-republic": [
    { name: "Baku-Supsa Terminal", type: "port terminal", city: "Supsa", country: "Georgia", externalUrl: "https://tankbazaar.com/#terminal-202", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Dubendi Oil Terminal", type: "port terminal", city: "Dubendi", country: "Azerbaijan", externalUrl: "https://tankbazaar.com/#terminal-203", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Heydar Aliyev Baku Oil Refinery", type: "refinery", city: "Baku", country: "Azerbaijan", externalUrl: "https://tankbazaar.com/#terminal-746", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "state-organization-for-marketing-of-oil": [
    { name: "SOMO Baghdad Depot", type: "inland terminal", city: "Baghdad", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-331", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "SOMO Khor al-Amaya Terminal", type: "port terminal", city: "Al Faw", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-134", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "SOMO Umm Qasr Terminal", type: "port terminal", city: "Umm Qasr", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-205", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "suncor-energy-inc": [
    { name: "Edmonton Refinery", type: "refinery", city: "Edmonton", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-169", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Montreal Terminal", type: "port terminal", city: "Montreal", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-269", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Vancouver Terminal", type: "port terminal", city: "Vancouver", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-167", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "tanzania-international-petroleum-reserves-limited": [
    { name: "TIPER Dar es Salaam Terminal", type: "port terminal", city: "Dar es Salaam", country: "Tanzania", externalUrl: "https://tankbazaar.com/#terminal-148", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "TIPER Zanzibar Terminal", type: "port terminal", city: "Zanzibar", country: "Tanzania", externalUrl: "https://tankbazaar.com/#terminal-347", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "the-dow-chemical-company": [
    { name: "Dow Böhlen Terminal", type: "plant", city: "Böhlen, Saxony", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-877", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Dow Freeport Terminal", type: "plant", city: "Freeport TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-845", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Dow Terneuzen Terminal", type: "plant", city: "Terneuzen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-862", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "the-mosaic-company": [
    { name: "Mosaic Faustina Terminal", type: "plant", city: "Faustina LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-918", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Mosaic Riverview Terminal", type: "plant", city: "Riverview FL", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-986", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "totalenergies-raffinage-france": [
    { name: "Donges Terminal", type: "port terminal", city: "Donges", country: "France", externalUrl: "https://tankbazaar.com/#terminal-103", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Raffinerie de Normandie Terminal", type: "refinery", city: "Gonfreville-l'Orcher", country: "France", externalUrl: "https://tankbazaar.com/#terminal-777", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "transneft-pjsc": [
    { name: "Novorossiysk CPC Terminal", type: "port terminal", city: "Novorossiysk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-54", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Primorsk Oil Terminal", type: "port terminal", city: "Primorsk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-53", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Sheskharis Grushovaya Complex", type: "port terminal", city: "Novorossiysk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-701", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vida-bioenergy-vtti-bv": [
    { name: "Glentham Terminal", type: "inland terminal", city: "Glentham", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-666", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tilburg Terminal", type: "inland terminal", city: "Tilburg", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-665", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vesta-terminals-bv": [
    { name: "Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-690", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Flushing Terminal", type: "port terminal", city: "Vlissingen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-691", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tallinn Terminal", type: "port terminal", city: "Tallinn", country: "Estonia", externalUrl: "https://tankbazaar.com/#terminal-692", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vivo-energy-holding-bv": [
    { name: "Lagos Terminal", type: "port terminal", city: "Lagos", country: "Nigeria", externalUrl: "https://tankbazaar.com/#terminal-12", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Kampala Depot", type: "inland terminal", city: "Kampala", country: "Uganda", externalUrl: "https://tankbazaar.com/#terminal-151", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vopak-international-venezuela-aruba-nv-viia": [
    { name: "VIIA Freeport Terminal", type: "port terminal", city: "Freeport TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-583", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "VIIA Plaquemine Terminal", type: "port terminal", city: "Plaquemine LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-584", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "VIIA St Charles Terminal", type: "port terminal", city: "St. Charles LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-585", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ypf-sa": [
    { name: "Comodoro Rivadavia Terminal", type: "port terminal", city: "Comodoro Rivadavia, Chubut", country: "Argentina", externalUrl: "https://tankbazaar.com/#terminal-998", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Bahia Blanca Terminal", type: "refinery", city: "Bahia Blanca", country: "Argentina", externalUrl: "https://tankbazaar.com/#terminal-160", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "La Plata Terminal", type: "refinery", city: "La Plata", country: "Argentina", externalUrl: "https://tankbazaar.com/#terminal-276", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yacimientos-petroliferos-fiscales-bolivianos": [
    { name: "YPFB Gualberto Villarroel Refinery", type: "refinery", city: "Cochabamba", country: "Bolivia", externalUrl: "https://tankbazaar.com/#terminal-843", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "YPFB La Paz Depot", type: "inland terminal", city: "La Paz", country: "Bolivia", externalUrl: "https://tankbazaar.com/#terminal-158", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "yara-suomi-oy": [
    { name: "Kotka Terminal", type: "plant", city: "Kotka", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-960", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
    { name: "Uusikaupunki Terminal", type: "plant", city: "Uusikaupunki", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-961", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "z-energy-limited": [
    { name: "Auckland Terminal", type: "port terminal", city: "Auckland", country: "New Zealand", externalUrl: "https://tankbazaar.com/#terminal-171", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Lyttelton Terminal", type: "port terminal", city: "Christchurch", country: "New Zealand", externalUrl: "https://tankbazaar.com/#terminal-350", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petrol-ad": [
    { name: "Petrol AD Ruse Depot", type: "inland terminal", city: "Ruse", country: "Bulgaria", externalUrl: "https://tankbazaar.com/#terminal-234", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "apc": [
    { name: "Aqaba Terminal", type: "port terminal", city: "Aqaba", country: "Jordan", externalUrl: "https://tankbazaar.com/#terminal-132", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "aarti-industries-limited": [
    { name: "Jhagadia Terminal", type: "plant", city: "Jhagadia, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1005", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "abu-dhabi-national-oil-company": [
    { name: "Ruwais Refinery", type: "refinery", city: "Ruwais", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-14", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "abu-dhabi-national-oil-company-distribution": [
    { name: "ADNOC Distribution Abu Dhabi Depot", type: "inland terminal", city: "Abu Dhabi", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-327", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "adani-dhamra-port-limited": [
    { name: "Dhamra Port Terminal", type: "port terminal", city: "Dhamra, Odisha", country: "India", externalUrl: "https://tankbazaar.com/#terminal-993", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "adani-kattupalli-port-private-limited": [
    { name: "Kattupalli Port Terminal", type: "port terminal", city: "Kattupalli, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-994", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "adani-krishnapatnam-port-limited": [
    { name: "Krishnapatnam Port Terminal", type: "port terminal", city: "Krishnapatnam, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-992", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "adani-ports-and-sez-limited": [
    { name: "APSEZ Mundra Terminal", type: "port terminal", city: "Mundra, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-31", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "aden-refinery-company-arc": [
    { name: "Oil Terminal", type: "port terminal", city: "Aden", country: "Yemen", externalUrl: "https://tankbazaar.com/#terminal-131", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "administracion-nacional-de-combustibles-alcohol-y-portland-ancap": [
    { name: "ANCAP Montevideo Terminal", type: "port terminal", city: "Montevideo", country: "Uruguay", externalUrl: "https://tankbazaar.com/#terminal-157", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "aircraft-fuel-supply-company-limited": [
    { name: "AFSC Tank Farm Hong Kong Terminal", type: "inland terminal", city: "Chek Lap Kok", country: "Hong Kong", externalUrl: "https://tankbazaar.com/#terminal-403", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "al-jubail-petrochemical-company-kemya": [
    { name: "(Kemya) Terminal", type: "plant", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-883", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "albpetrol-jsc": [
    { name: "Durres Oil Terminal", type: "port terminal", city: "Durres", country: "Albania", externalUrl: "https://tankbazaar.com/#terminal-720", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "alexandria-national-refining-and-petrochemicals-company-anrpc": [
    { name: "and Petrochemicals Company Terminal", type: "refinery", city: "Alexandria", country: "Egypt", externalUrl: "https://tankbazaar.com/#terminal-836", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "alexela-as": [
    { name: "Sillamae Terminal", type: "port terminal", city: "Sillamae", country: "Estonia", externalUrl: "https://tankbazaar.com/#terminal-232", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "alkyl-amines-chemicals-limited": [
    { name: "Dahej Terminal", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1011", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "alyeska-pipeline-service-company": [
    { name: "Valdez Terminal", type: "port terminal", city: "Valdez AK", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-227", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "anwil-sa": [
    { name: "Włocławek Terminal", type: "plant", city: "Włocławek", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-948", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "arak-oil-refining-company": [
    { name: "Refinery", type: "refinery", city: "Arak", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-759", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "aramco": [
    { name: "Yanbu Refinery", type: "refinery", city: "Yanbu", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-126", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "argos-varo-energy-bv": [
    { name: "Oil Utrecht Depot", type: "inland terminal", city: "Utrecht", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-324", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "atyrau-refinery-llp": [
    { name: "Refinery", type: "refinery", city: "Atyrau", country: "Kazakhstan", externalUrl: "https://tankbazaar.com/#terminal-792", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "aviation-fuel-services-limited-afs": [
    { name: "AFS Heathrow Fuel Farm", type: "inland terminal", city: "London Heathrow", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-400", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "axion-energy-argentina-sa": [
    { name: "Campana Refinery", type: "refinery", city: "Campana, Buenos Aires Province", country: "Argentina", externalUrl: "https://tankbazaar.com/#terminal-767", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "azertrans-llc": [
    { name: "Baku Oil Terminal", type: "port terminal", city: "Baku", country: "Azerbaijan", externalUrl: "https://tankbazaar.com/#terminal-745", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "basf-petronas-chemicals-sdn-bhd": [
    { name: "Chemicals Terminal", type: "plant", city: "Gebeng, Kuantan, Pahang", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-1017", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "basf-se": [
    { name: "Ludwigshafen Terminal", type: "plant", city: "Ludwigshafen am Rhein", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-844", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "bosfuel-corporation": [
    { name: "Logan Tank Farm", type: "inland terminal", city: "Boston MA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-415", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "bp-australia-pty-ltd": [
    { name: "Kwinana Terminal", type: "port terminal", city: "Perth", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-60", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "bp-azerbaijan": [
    { name: "Sangachal Terminal", type: "port terminal", city: "Garadakh", country: "Azerbaijan", externalUrl: "https://tankbazaar.com/#terminal-744", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "bp-europa-se": [
    { name: "Rotterdam Refinery", type: "refinery", city: "Europoort, Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-771", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "baku-tbilisi-ceyhan-pipeline-company": [
    { name: "BTC Sangachal Terminal", type: "port terminal", city: "Sangachal", country: "Azerbaijan", externalUrl: "https://tankbazaar.com/#terminal-204", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "balaji-amines-limited": [
    { name: "Solapur Terminal", type: "plant", city: "Solapur, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1012", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "baltic-tank-oy": [
    { name: "Hamina Terminal", type: "port terminal", city: "Hamina", country: "Finland", externalUrl: "https://tankbazaar.com/#terminal-231", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "bangchak-corporation-public-company-limited": [
    { name: "Refinery", type: "refinery", city: "Bangkok", country: "Thailand", externalUrl: "https://tankbazaar.com/#terminal-818", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "bapco-refining-bsc-closed": [
    { name: "Sitra Terminal", type: "refinery", city: "Sitra", country: "Bahrain", externalUrl: "https://tankbazaar.com/#terminal-47", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "basel-fuel-terminal-ag": [
    { name: "Kleinhuningen Terminal", type: "inland terminal", city: "Basel", country: "Switzerland", externalUrl: "https://tankbazaar.com/#terminal-724", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "basra-oil-company": [
    { name: "Terminal", type: "port terminal", city: "Basra", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-44", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "bayernoil-raffineriegesellschaft-mbh": [
    { name: "Refinery", type: "refinery", city: "Vohburg", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-783", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "beifang-asphalt-fuel-co-ltd": [
    { name: "Fuel Terminal", type: "refinery", city: "Panjin, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1051", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "binh-son-refining-and-petrochemical-joint-stock-company": [
    { name: "BSR Dung Quat Terminal", type: "refinery", city: "Dung Quat", country: "Vietnam", externalUrl: "https://tankbazaar.com/#terminal-175", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "birch-terminals-llc": [
    { name: "Shipping Singapore Terminal", type: "port terminal", city: "Singapore", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-6", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "boru-hatlar-ile-petrol-tasma-as": [
    { name: "BOTAS Ceyhan Terminal", type: "port terminal", city: "Ceyhan", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-191", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "botswana-oil-limited": [
    { name: "Gaborone Depot", type: "inland terminal", city: "Gaborone", country: "Botswana", externalUrl: "https://tankbazaar.com/#terminal-294", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "braskem-idesa-sapi-de-cv": [
    { name: "Idesa Terminal", type: "plant", city: "Nanchital, Veracruz", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-878", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "brunei-shell-petroleum-company-sdn-bhd": [
    { name: "Seria Oil Terminal", type: "port terminal", city: "Seria", country: "Brunei", externalUrl: "https://tankbazaar.com/#terminal-114", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "brunsbuttel": [
    { name: "Oil Terminal", type: "port terminal", city: "Brunsbüttel", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-100", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "buckeye-bahamas-hub-limited-formerly-borco-bahamas-oil-refining-company-international-limited": [
    { name: "Borco Freeport Terminal", type: "port terminal", city: "Freeport", country: "Bahamas", externalUrl: "https://tankbazaar.com/#terminal-394", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "buckeye-partners-lp": [
    { name: "Yabucoa Terminal", type: "port terminal", city: "Yabucoa", country: "Puerto Rico", externalUrl: "https://tankbazaar.com/#terminal-680", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "buckeye-st-lucia-terminal-limited": [
    { name: "Terminal", type: "port terminal", city: "Cul de Sac", country: "St. Lucia", externalUrl: "https://tankbazaar.com/#terminal-681", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "buckeye-terminals-llc": [
    { name: "South Portland Terminal", type: "inland terminal", city: "South Portland ME", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-682", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "buckeye-texas-processing-llc": [
    { name: "City Terminal", type: "port terminal", city: "Texas City TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-10", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "cafhi": [
    { name: "Changi Fuel Farm", type: "inland terminal", city: "Changi", country: "Singapore", externalUrl: "https://tankbazaar.com/#terminal-402", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "cdn": [
    { name: "Bamako Depot", type: "inland terminal", city: "Bamako", country: "Mali", externalUrl: "https://tankbazaar.com/#terminal-296", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "citgo-petroleum-corporation": [
    { name: "Lake Charles Refinery", type: "refinery", city: "Lake Charles LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-797", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "csbp-limited": [
    { name: "Kwinana Terminal", type: "plant", city: "Kwinana, Western Australia", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-943", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "cvr-partners-lp": [
    { name: "Coffeyville Terminal", type: "plant", city: "Coffeyville KS", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-949", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "cairo-oil-refining-company-corc": [
    { name: "Company Terminal", type: "refinery", city: "Mostorod", country: "Egypt", externalUrl: "https://tankbazaar.com/#terminal-837", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ceylon-petroleum-corporation": [
    { name: "Ceypetco Colombo Terminal", type: "port terminal", city: "Colombo", country: "Sri Lanka", externalUrl: "https://tankbazaar.com/#terminal-178", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ceylon-petroleum-storage-terminals-limited-cpstl": [
    { name: "Ceypetco Trincomalee Terminal", type: "port terminal", city: "Trincomalee", country: "Sri Lanka", externalUrl: "https://tankbazaar.com/#terminal-179", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "chambal-fertilisers-and-chemicals-limited": [
    { name: "Gadepan Terminal", type: "plant", city: "Gadepan, Kota, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-895", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "chambroad-petrochemical-co-ltd": [
    { name: "Petrochemical Terminal", type: "refinery", city: "Boxing, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1048", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "channel-infrastructure-nz-limited": [
    { name: "Marsden Point Terminal", type: "port terminal", city: "Whangarei", country: "New Zealand", externalUrl: "https://tankbazaar.com/#terminal-170", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "clariant-chemicals-india-limited": [
    { name: "Roha Terminal", type: "plant", city: "Roha, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1014", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "colon-oil": [
    { name: "Terminal", type: "port terminal", city: "Colon", country: "Panama", externalUrl: "https://tankbazaar.com/#terminal-222", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "congo-terminal": [
    { name: "Pointe-Noire Terminal", type: "port terminal", city: "Pointe-Noire", country: "Republic of Congo", externalUrl: "https://tankbazaar.com/#terminal-281", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "conocophillips-alaska-inc": [
    { name: "Prudhoe Bay Terminal", type: "port terminal", city: "Prudhoe Bay AK", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-369", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "copenhagen-malmo-port-ab-cmp": [
    { name: "Port of Copenhagen Terminal", type: "port terminal", city: "Copenhagen", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-228", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "covestro-ag": [
    { name: "Leverkusen Terminal", type: "plant", city: "Leverkusen", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-861", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "crowley-fuels-llc": [
    { name: "Anchorage Fuel Terminal", type: "inland terminal", city: "Anchorage AK", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-1001", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "cubametales": [
    { name: "Havana Terminal", type: "port terminal", city: "Havana", country: "Cuba", externalUrl: "https://tankbazaar.com/#terminal-393", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "dangote-industries-limited": [
    { name: "Refinery", type: "refinery", city: "Lekki, Lagos", country: "Nigeria", externalUrl: "https://tankbazaar.com/#terminal-839", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "deepak-fertilisers-and-petrochemicals-corporation-limited": [
    { name: "Taloja Terminal", type: "plant", city: "Taloja, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-901", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "distributeurs-nationaux-sa-dinasa": [
    { name: "Varreux Fuel Terminal", type: "port terminal", city: "Port-au-Prince", country: "Haiti", externalUrl: "https://tankbazaar.com/#terminal-741", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "duslo-as": [
    { name: "Šaľa Terminal", type: "plant", city: "Šaľa", country: "Slovakia", externalUrl: "https://tankbazaar.com/#terminal-975", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ettpl": [
    { name: "Ennore Terminal", type: "port terminal", city: "Ennore, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-39", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "eastern-refinery-limited": [
    { name: "Limited Terminal", type: "refinery", city: "Chittagong", country: "Bangladesh", externalUrl: "https://tankbazaar.com/#terminal-816", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "emirates-national-oil-company-llc": [
    { name: "ENOC Jebel Ali Oil Refinery", type: "refinery", city: "Jebel Ali, Dubai", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-42", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "empresa-nacional-de-combustiveis-enacol-sa": [
    { name: "Enacol Praia Terminal", type: "port terminal", city: "Praia", country: "Cape Verde", externalUrl: "https://tankbazaar.com/#terminal-341", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "enbridge-pipelines-cushing-llc": [
    { name: "Cushing Hub Terminal", type: "inland terminal", city: "Cushing, Oklahoma", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-25", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "enemed": [
    { name: "Terminal", type: "port terminal", city: "Marsaxlokk", country: "Malta", externalUrl: "https://tankbazaar.com/#terminal-725", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "engen-petroleum-limited": [
    { name: "Durban Refinery", type: "refinery", city: "Durban", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-298", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "engro-elengy-terminal-private-limited": [
    { name: "LNG Terminal", type: "port terminal", city: "Port Qasim", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-566", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "engro-fertilizers-limited": [
    { name: "Daharki Terminal", type: "plant", city: "Daharki, Sindh", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-952", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "engro-vopak-terminal-limited": [
    { name: "Port Qasim Terminal", type: "port terminal", city: "Port Qasim", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-531", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "eni-spa": [
    { name: "Milan Depot", type: "inland terminal", city: "Milan", country: "Italy", externalUrl: "https://tankbazaar.com/#terminal-326", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "epigral-limited": [
    { name: "Dahej Terminal", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1007", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "equate-petrochemical-company-kscc": [
    { name: "Shuaiba Terminal", type: "plant", city: "Shuaiba", country: "Kuwait", externalUrl: "https://tankbazaar.com/#terminal-855", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "equinor-refining-denmark-a-s": [
    { name: "Kalundborg Refinery", type: "refinery", city: "Kalundborg", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-123", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "essar-oil-uk-limited": [
    { name: "Stanlow Refinery", type: "refinery", city: "Ellesmere Port", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-774", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "esso-norge-as": [
    { name: "Slagen Terminal", type: "port terminal", city: "Tønsberg", country: "Norway", externalUrl: "https://tankbazaar.com/#terminal-121", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "eswatini-national-petroleum-company": [
    { name: "Petroleum Mbabane Depot", type: "inland terminal", city: "Mbabane", country: "Eswatini", externalUrl: "https://tankbazaar.com/#terminal-340", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ethiopian-petroleum-supply-enterprise": [
    { name: "EPSE Addis Ababa Depot", type: "inland terminal", city: "Addis Ababa", country: "Ethiopia", externalUrl: "https://tankbazaar.com/#terminal-166", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "europe-asia-pipeline-company-ltd-eapc": [
    { name: "Ashkelon Terminal", type: "port terminal", city: "Ashkelon", country: "Israel", externalUrl: "https://tankbazaar.com/#terminal-111", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "europoort-terminals-bv": [
    { name: "Terminals Terminal", type: "port terminal", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-18", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "exxon-neftegas-limited": [
    { name: "De-Kastri Terminal", type: "port terminal", city: "De-Kastri", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-224", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "exxonmobil": [
    { name: "Fawley Refinery", type: "refinery", city: "Fawley, Southampton", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-773", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "fauji-fertilizer-company-limited": [
    { name: "Goth Machhi Terminal", type: "plant", city: "Sadiqabad, Punjab", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-951", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "federated-co-operatives-limited": [
    { name: "Co-op Regina Depot", type: "inland terminal", city: "Regina", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-388", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "fertial-spa": [
    { name: "Arzew Terminal", type: "plant", city: "Arzew", country: "Algeria", externalUrl: "https://tankbazaar.com/#terminal-959", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "fertiberia-sa": [
    { name: "Huelva Terminal", type: "plant", city: "Huelva", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-934", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "fertiglobe-plc": [
    { name: "Ruwais Terminal", type: "plant", city: "Ruwais", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-956", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "fertilizers-and-chemicals-travancore-limited-fact": [
    { name: "FACT Kochi Terminal", type: "plant", city: "Kochi, Kerala", country: "India", externalUrl: "https://tankbazaar.com/#terminal-941", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "fiji-gas-total-fiji": [
    { name: "Suva Fuel Terminal", type: "port terminal", city: "Suva", country: "Fiji", externalUrl: "https://tankbazaar.com/#terminal-732", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "flash-llc": [
    { name: "Yerevan Fuel Terminal", type: "inland terminal", city: "Yerevan", country: "Armenia", externalUrl: "https://tankbazaar.com/#terminal-727", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "fos-sur-mer": [
    { name: "Terminal", type: "port terminal", city: "Fos-sur-Mer", country: "France", externalUrl: "https://tankbazaar.com/#terminal-101", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "foskor-pty-ltd": [
    { name: "Richards Bay Terminal", type: "plant", city: "Richards Bay", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-931", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "fredericia": [
    { name: "Terminal", type: "port terminal", city: "Fredericia", country: "Denmark", externalUrl: "https://tankbazaar.com/#terminal-122", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "fujairah-oil-terminal-fzc": [
    { name: "FZC Terminal", type: "port terminal", city: "Fujairah", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-689", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "fujairah-refining-company-fzc": [
    { name: "Refinery", type: "refinery", city: "Fujairah", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-756", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "gepetrol-guinea-ecuatorial-de-petroleos-sa": [
    { name: "Malabo Terminal", type: "port terminal", city: "Malabo", country: "Equatorial Guinea", externalUrl: "https://tankbazaar.com/#terminal-282", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "gs-caltex": [
    { name: "Yeosu Refinery", type: "refinery", city: "Yeosu", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-187", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "galana": [
    { name: "Toamasina Terminal", type: "port terminal", city: "Toamasina", country: "Madagascar", externalUrl: "https://tankbazaar.com/#terminal-289", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "gambia-national-petroleum-corporation": [
    { name: "GNPC Banjul Terminal", type: "port terminal", city: "Banjul", country: "Gambia", externalUrl: "https://tankbazaar.com/#terminal-288", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "gangavaram-port-limited": [
    { name: "Port Terminal", type: "port terminal", city: "Gangavaram, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-996", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "gazprom-neft-pjsc": [
    { name: "Omsk Refinery", type: "refinery", city: "Omsk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-306", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "georgian-oil-and-gas-corporation-jsc": [
    { name: "Batumi Terminal", type: "port terminal", city: "Batumi", country: "Georgia", externalUrl: "https://tankbazaar.com/#terminal-201", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ghana-national-petroleum-corporation-gnpc": [
    { name: "GNPC Takoradi Terminal", type: "port terminal", city: "Takoradi", country: "Ghana", externalUrl: "https://tankbazaar.com/#terminal-344", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ghana-ports-and-harbours-authority": [
    { name: "GHAPOHA Tema Terminal", type: "port terminal", city: "Tema", country: "Ghana", externalUrl: "https://tankbazaar.com/#terminal-144", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "giurgiulesti-international-free-port": [
    { name: "Oil Terminal", type: "port terminal", city: "Giurgiulesti", country: "Moldova", externalUrl: "https://tankbazaar.com/#terminal-719", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "grupo-fertinal-sa-de-cv": [
    { name: "Fertinal Terminal", type: "plant", city: "Isla de Lobos, Veracruz", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-981", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "gujarat-chemical-port-limited": [
    { name: "GCPTCL Dahej Terminal", type: "port terminal", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-32", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "gujarat-fluorochemicals-limited": [
    { name: "Dahej Terminal", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1009", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "gujarat-narmada-valley-fertilizers-and-chemicals-limited": [
    { name: "GNFC Bharuch Terminal", type: "plant", city: "Bharuch, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-898", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "gujarat-state-fertilizers-and-chemicals-limited": [
    { name: "GSFC Vadodara Terminal", type: "plant", city: "Vadodara, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-899", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "gulf-petrochemical-industries-company-gpic": [
    { name: "GPIC Sitra Terminal", type: "plant", city: "Sitra", country: "Bahrain", externalUrl: "https://tankbazaar.com/#terminal-957", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "goteborgs-hamn-ab-port-of-gothenburg": [
    { name: "Gothenburg Terminal", type: "port terminal", city: "Gothenburg", country: "Sweden", externalUrl: "https://tankbazaar.com/#terminal-118", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "hd-hyundai-oilbank-co-ltd": [
    { name: "Hyundai Oilbank Incheon Terminal", type: "refinery", city: "Incheon", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-355", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "helleniq-energy-hellenic-petroleum-sa": [
    { name: "Hellenic Petroleum Aspropyrgos Refinery", type: "refinery", city: "Aspropyrgos", country: "Greece", externalUrl: "https://tankbazaar.com/#terminal-779", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "helleniq-energy-holdings-sa": [
    { name: "Aspropyrgos Terminal", type: "port terminal", city: "Aspropyrgos", country: "Greece", externalUrl: "https://tankbazaar.com/#terminal-108", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "hpcl-mittal-energy-limited": [
    { name: "Bathinda Refinery", type: "refinery", city: "Bathinda, Punjab", country: "India", externalUrl: "https://tankbazaar.com/#terminal-87", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "hpcl-rajasthan-refinery-limited": [
    { name: "Barmer Refinery", type: "refinery", city: "Barmer, Rajasthan", country: "India", externalUrl: "https://tankbazaar.com/#terminal-88", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "haifa-chemicals-ltd": [
    { name: "Chemicals Terminal", type: "plant", city: "Haifa", country: "Israel", externalUrl: "https://tankbazaar.com/#terminal-921", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "haike-petrochemical-group-co-ltd": [
    { name: "Petrochemical Terminal", type: "refinery", city: "Dongying, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1050", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "hanwha-totalenergies-petrochemical-co-ltd": [
    { name: "Total Daesan Terminal", type: "refinery", city: "Daesan", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-188", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "hengli-petrochemical-dalian-co-ltd": [
    { name: "(Dalian) Terminal", type: "refinery", city: "Changxing Island, Dalian, Liaoning", country: "China", externalUrl: "https://tankbazaar.com/#terminal-814", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "hengyuan-refining-company-berhad": [
    { name: "Company Terminal", type: "refinery", city: "Port Dickson", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-1026", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "hindustan-aegis": [
    { name: "LPG Terminal", type: "port terminal", city: "Mumbai, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-555", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "horizon-terminals-limited": [
    { name: "Tanger Med Terminal", type: "port terminal", city: "Tanger Med", country: "Morocco", externalUrl: "https://tankbazaar.com/#terminal-141", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ig-petrochemicals-limited": [
    { name: "Taloja Terminal", type: "plant", city: "Taloja, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1008", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ina-industrija-nafte-dd": [
    { name: "INA Sisak Depot", type: "inland terminal", city: "Sisak", country: "Croatia", externalUrl: "https://tankbazaar.com/#terminal-238", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ineos-group-holdings-sa": [
    { name: "Lavéra Terminal", type: "plant", city: "Lavéra", country: "France", externalUrl: "https://tankbazaar.com/#terminal-879", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ineos-koln-gmbh": [
    { name: "Köln Terminal", type: "plant", city: "Cologne", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-851", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ineos-limited": [
    { name: "Ineos Grangemouth Terminal", type: "refinery", city: "Falkirk, Scotland", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-21", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "iplom-spa": [
    { name: "Iplom Genoa Terminal", type: "refinery", city: "Genoa", country: "Italy", externalUrl: "https://tankbazaar.com/#terminal-197", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "irpc-public-company-limited": [
    { name: "Refinery", type: "refinery", city: "Rayong", country: "Thailand", externalUrl: "https://tankbazaar.com/#terminal-819", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "itc-rubis-terminal-antwerp-nv": [
    { name: "Antwerp Terminal", type: "port terminal", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-648", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "indeni-energy-company-limited": [
    { name: "Ndola Terminal", type: "inland terminal", city: "Ndola", country: "Zambia", externalUrl: "https://tankbazaar.com/#terminal-152", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "indian-farmers-fertiliser-cooperative-limited-iffco": [
    { name: "IFFCO Kandla Terminal", type: "plant", city: "Kandla, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-896", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "indogulf-fertilizers-limited": [
    { name: "Fertilizers Terminal", type: "plant", city: "Jagdishpur, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-988", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "indorama-eleme-fertilizer-and-chemicals-limited": [
    { name: "Eleme Terminal", type: "plant", city: "Eleme, Rivers State", country: "Nigeria", externalUrl: "https://tankbazaar.com/#terminal-958", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "inner-mongolia-huineng-coal-chemical-co-ltd": [
    { name: "Huineng LNG Terminal", type: "inland terminal", city: "Ordos, Inner Mongolia", country: "China", externalUrl: "https://tankbazaar.com/#terminal-707", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "interpetrol": [
    { name: "Bujumbura Depot", type: "inland terminal", city: "Bujumbura", country: "Burundi", externalUrl: "https://tankbazaar.com/#terminal-338", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "jr-simplot-company": [
    { name: "Simplot Don Plant", type: "plant", city: "Pocatello ID", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-932", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "jfk-fuel-infrastructure-llc": [
    { name: "Bulk Fuel Farm", type: "inland terminal", city: "New York NY", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-406", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "jsc-belaruskali": [
    { name: "Belaruskali Soligorsk Terminal", type: "plant", city: "Soligorsk", country: "Belarus", externalUrl: "https://tankbazaar.com/#terminal-945", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "jsc-uralchem": [
    { name: "Uralchem Kirovo-Chepetsk Terminal", type: "plant", city: "Kirovo-Chepetsk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-978", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "juhi": [
    { name: "Schiphol Fuel Farm", type: "inland terminal", city: "Amsterdam Schiphol", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-407", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "jadranski-naftovod-dd-janaf": [
    { name: "JANAF Omisalj Terminal", type: "port terminal", city: "Rijeka", country: "Croatia", externalUrl: "https://tankbazaar.com/#terminal-237", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "jam-petrochemical-company": [
    { name: "Company Terminal", type: "plant", city: "Asaluyeh", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-882", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "joint-into-plane-fuel-farm-llc-jiff": [
    { name: "JIFF Dubai Airport Fuel Farm", type: "inland terminal", city: "Dubai", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-401", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "jugopetrol-ad-kotor": [
    { name: "Kotor Terminal", type: "port terminal", city: "Kotor", country: "Montenegro", externalUrl: "https://tankbazaar.com/#terminal-716", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "kam-international-oil": [
    { name: "Hairatan Fuel Depot", type: "inland terminal", city: "Hairatan", country: "Afghanistan", externalUrl: "https://tankbazaar.com/#terminal-726", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "kazmortransflot": [
    { name: "Aktau Terminal", type: "port terminal", city: "Aktau", country: "Kazakhstan", externalUrl: "https://tankbazaar.com/#terminal-200", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "kaztransoil-jsc": [
    { name: "Atyrau Terminal", type: "port terminal", city: "Atyrau", country: "Kazakhstan", externalUrl: "https://tankbazaar.com/#terminal-199", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "kern-oil-and-refining-co": [
    { name: "Refinery", type: "refinery", city: "Bakersfield CA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-215", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "koch-fertilizer-llc": [
    { name: "Iowa Fertilizer Company Terminal", type: "plant", city: "Wever IA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-933", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "korea-oil-industry-group": [
    { name: "Nampo Oil Terminal", type: "port terminal", city: "Nampo", country: "North Korea", externalUrl: "https://tankbazaar.com/#terminal-743", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "krishak-bharati-cooperative-limited-kribhco": [
    { name: "Kribhco Hazira Terminal", type: "plant", city: "Hazira, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-938", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "kuwait-aviation-fuelling-company-kscc": [
    { name: "Kamco Kaohsiung Terminal", type: "port terminal", city: "Kaohsiung", country: "Taiwan", externalUrl: "https://tankbazaar.com/#terminal-5", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "kuwait-integrated-petroleum-industries-company-kipic": [
    { name: "Al-Zour Refinery", type: "refinery", city: "Al-Zour", country: "Kuwait", externalUrl: "https://tankbazaar.com/#terminal-753", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "kuwait-petroleum-international": [
    { name: "Q8 Luxembourg City Depot", type: "inland terminal", city: "Luxembourg City", country: "Luxembourg", externalUrl: "https://tankbazaar.com/#terminal-322", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "kyrgyzneftegaz": [
    { name: "Bishkek Depot", type: "inland terminal", city: "Bishkek", country: "Kyrgyzstan", externalUrl: "https://tankbazaar.com/#terminal-380", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "laxfuel-corporation": [
    { name: "Tank Farm", type: "inland terminal", city: "Los Angeles CA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-405", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "llc-nord-trans-bunker": [
    { name: "Bunker Terminal", type: "port terminal", city: "Vladivostok", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-702", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "lsb-industries-inc": [
    { name: "El Dorado Terminal", type: "plant", city: "El Dorado AR", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-950", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "lukoil-nizhegorodnefteorgsintez-llc": [
    { name: "Kstovo Refinery", type: "refinery", city: "Kstovo, Nizhny Novgorod Oblast", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-790", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "lukoil-perm-llc": [
    { name: "Perm Refinery", type: "refinery", city: "Perm", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-787", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "lukoil-volgogradneftepererabotka-llc": [
    { name: "Volgograd Refinery", type: "refinery", city: "Volgograd", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-786", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "le": [
    { name: "Havre Terminal", type: "port terminal", city: "Le Havre", country: "France", externalUrl: "https://tankbazaar.com/#terminal-102", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "lebanon-petroleum": [
    { name: "Beirut Terminal", type: "port terminal", city: "Beirut", country: "Lebanon", externalUrl: "https://tankbazaar.com/#terminal-384", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "liberia-petroleum-refining-company": [
    { name: "LPRC Monrovia Terminal", type: "port terminal", city: "Monrovia", country: "Liberia", externalUrl: "https://tankbazaar.com/#terminal-285", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "lotte-chemical-corporation": [
    { name: "LOTTE Chemical Yeosu Terminal", type: "plant", city: "Yeosu", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-884", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "lotte-chemical-titan-holding-berhad": [
    { name: "Titan Terminal", type: "plant", city: "Pasir Gudang, Johor", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-1016", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "louisiana-offshore-oil-port-llc": [
    { name: "LOOP Louisiana Offshore Terminal", type: "port terminal", city: "Port Fourchon LA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-267", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "luka-koper-dd": [
    { name: "Fuel Terminal", type: "port terminal", city: "Koper", country: "Slovenia", externalUrl: "https://tankbazaar.com/#terminal-722", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "lukoil-neftochim": [
    { name: "Burgas Refinery", type: "refinery", city: "Burgas", country: "Bulgaria", externalUrl: "https://tankbazaar.com/#terminal-233", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "lyondellbasell-industries-nv": [
    { name: "Rotterdam Terminal", type: "plant", city: "Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-847", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "mol-magyar-olaj-es-gazipari-nyrt": [
    { name: "Szazhalombatta Depot", type: "inland terminal", city: "Szazhalombatta", country: "Hungary", externalUrl: "https://tankbazaar.com/#terminal-314", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "madras-fertilizers-limited-mfl": [
    { name: "Chennai Terminal", type: "plant", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-939", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "magellan-midstream-partners-lp": [
    { name: "Corpus Christi Terminal", type: "port terminal", city: "Corpus Christi TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-213", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "manali-petrochemicals-limited": [
    { name: "Petrochemicals Terminal", type: "plant", city: "Manali, Chennai, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1006", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "meghna-petroleum-limited": [
    { name: "Dhaka Depot", type: "inland terminal", city: "Dhaka", country: "Bangladesh", externalUrl: "https://tankbazaar.com/#terminal-177", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "menzies-aviation-agi-group-holdings": [
    { name: "Toronto Pearson Tank Farm", type: "inland terminal", city: "Toronto YYZ", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-413", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "menzies-aviation-asig-limited": [
    { name: "ASIG O'Hare Jet-A Tank Farm", type: "inland terminal", city: "Chicago IL", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-414", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "miro": [
    { name: "Karlsruhe Refinery", type: "refinery", city: "Karlsruhe", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-28", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "midland-refineries-company": [
    { name: "Daura Refinery", type: "refinery", city: "Baghdad", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-832", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "misr-fertilizers-production-company-mopco": [
    { name: "MOPCO Damietta Terminal", type: "plant", city: "Damietta", country: "Egypt", externalUrl: "https://tankbazaar.com/#terminal-955", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "mitsubishi-chemical-corporation": [
    { name: "Mizushima Terminal", type: "plant", city: "Kurashiki, Okayama", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-859", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "mitsui-and-co-ltd": [
    { name: "Chiba Terminal", type: "port terminal", city: "Chiba", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-7", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "mitsui-chemicals-inc": [
    { name: "Ichihara Terminal", type: "plant", city: "Ichihara, Chiba", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-872", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "mongolia-petroleum": [
    { name: "Ulaanbaatar Fuel Depot", type: "inland terminal", city: "Ulaanbaatar", country: "Mongolia", externalUrl: "https://tankbazaar.com/#terminal-729", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "motiva-enterprises-llc": [
    { name: "Port Arthur Terminal", type: "refinery", city: "Port Arthur TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-214", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "muara": [
    { name: "Terminal", type: "port terminal", city: "Muara", country: "Brunei", externalUrl: "https://tankbazaar.com/#terminal-115", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "muuga": [
    { name: "Oil Terminal", type: "port terminal", city: "Tallinn", country: "Estonia", externalUrl: "https://tankbazaar.com/#terminal-116", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "myanma-petrochemical-enterprise-mpe": [
    { name: "Thanlyin Refinery", type: "refinery", city: "Thanlyin, near Yangon", country: "Myanmar", externalUrl: "https://tankbazaar.com/#terminal-817", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "myanma-petroleum-enterprise": [
    { name: "MPE Mandalay Depot", type: "inland terminal", city: "Mandalay", country: "Myanmar", externalUrl: "https://tankbazaar.com/#terminal-363", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "myanma-petroleum-products-enterprise": [
    { name: "MPPE Thilawa Yangon Terminal", type: "port terminal", city: "Yangon", country: "Myanmar", externalUrl: "https://tankbazaar.com/#terminal-362", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "n1-hf": [
    { name: "Reykjavik Fuel Terminal", type: "port terminal", city: "Reykjavik", country: "Iceland", externalUrl: "https://tankbazaar.com/#terminal-735", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "naaf": [
    { name: "Narita Fuel Farm", type: "inland terminal", city: "Narita", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-411", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "nis-bosanski-brod-rafinerija": [
    { name: "Bosanski Brod Refinery", type: "refinery", city: "Bosanski Brod", country: "Bosnia and Herzegovina", externalUrl: "https://tankbazaar.com/#terminal-733", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "nwt-fuel-services": [
    { name: "Tuktoyaktuk Arctic Depot", type: "port terminal", city: "Tuktoyaktuk NWT", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-370", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "naftna-industrija-srbije-ad-nis": [
    { name: "NIS Pancevo Depot", type: "inland terminal", city: "Pancevo", country: "Serbia", externalUrl: "https://tankbazaar.com/#terminal-317", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "nagarjuna-fertilizers-and-chemicals-limited": [
    { name: "Kakinada Terminal", type: "plant", city: "Kakinada, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-942", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "nan-ya-plastics-corporation": [
    { name: "Kaohsiung Terminal", type: "plant", city: "Kaohsiung", country: "Taiwan", externalUrl: "https://tankbazaar.com/#terminal-890", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "national-fertilizers-limited-nfl": [
    { name: "Panipat Terminal", type: "plant", city: "Panipat, Haryana", country: "India", externalUrl: "https://tankbazaar.com/#terminal-900", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "national-iranian-oil-company": [
    { name: "Abadan Refinery", type: "refinery", city: "Abadan", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-304", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Bandar Abbas Oil Refinery", type: "refinery", city: "Bandar Abbas", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-45", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Isfahan Refinery", type: "refinery", city: "Isfahan", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-334", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "NIOC Kharg Island Terminal", type: "port terminal", city: "Kharg Island", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-133", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "NIOC Tehran Depot", type: "inland terminal", city: "Tehran", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-305", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Tabriz Refinery", type: "refinery", city: "Tabriz", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-833", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "national-petrochemical-company-npc": [
    { name: "Bandar Imam Petrochemical Complex", type: "plant", city: "Bandar-e Mahshahr", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-881", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "national-petroleum": [
    { name: "Freetown Terminal", type: "port terminal", city: "Freetown", country: "Sierra Leone", externalUrl: "https://tankbazaar.com/#terminal-284", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "national-petroleum-corporation-of-namibia-pty-ltd": [
    { name: "NAMCOR Walvis Bay Terminal", type: "port terminal", city: "Walvis Bay", country: "Namibia", externalUrl: "https://tankbazaar.com/#terminal-161", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "national-petroleum-refiners-of-south-africa-natref": [
    { name: "Natref Refinery", type: "refinery", city: "Sasolburg", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-840", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "navin-fluorine-international-limited": [
    { name: "Dahej Terminal", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1010", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "nepal-oil-corporation": [
    { name: "Amlekhgunj Oil Depot", type: "inland terminal", city: "Amlekhgunj", country: "Nepal", externalUrl: "https://tankbazaar.com/#terminal-728", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "nile-petroleum-corporation-nilepet": [
    { name: "Nilepet Juba Depot", type: "inland terminal", city: "Juba", country: "South Sudan", externalUrl: "https://tankbazaar.com/#terminal-337", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "ningbo-zhoushan-port-company-limited": [
    { name: "Ningbo-Zhoushan Terminal", type: "port terminal", city: "Ningbo", country: "China", externalUrl: "https://tankbazaar.com/#terminal-95", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "nitrogenmuvek-zrt": [
    { name: "Pétfürdő Terminal", type: "plant", city: "Pétfürdő", country: "Hungary", externalUrl: "https://tankbazaar.com/#terminal-976", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "nord-west-oelleitung-gmbh-nwo": [
    { name: "Wilhelmshaven Terminal", type: "port terminal", city: "Wilhelmshaven", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-99", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "north-oil-company": [
    { name: "Kirkuk Oil Field Terminal", type: "inland terminal", city: "Kirkuk", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-332", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "north-refineries-company": [
    { name: "Baiji Refinery", type: "refinery", city: "Baiji", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-760", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "north-sea-port": [
    { name: "Ghent Terminal", type: "port terminal", city: "Ghent", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-258", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "notore-chemical-industries-plc": [
    { name: "Onne Terminal", type: "plant", city: "Onne, Rivers State", country: "Nigeria", externalUrl: "https://tankbazaar.com/#terminal-919", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "oci-nv": [
    { name: "Beaumont Terminal", type: "plant", city: "Beaumont TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-937", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "oci-nitrogen-bv": [
    { name: "Geleen Terminal", type: "plant", city: "Geleen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-923", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "okta-crude-oil-refinery-ad-skopje": [
    { name: "Skopje Refinery", type: "refinery", city: "Skopje", country: "North Macedonia", externalUrl: "https://tankbazaar.com/#terminal-734", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "omv-petrom-moldova-srl": [
    { name: "Petrom Moldova Chisinau Depot", type: "inland terminal", city: "Chisinau", country: "Moldova", externalUrl: "https://tankbazaar.com/#terminal-321", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "oq": [
    { name: "Sohar Refinery", type: "refinery", city: "Sohar", country: "Oman", externalUrl: "https://tankbazaar.com/#terminal-757", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "orlen-sa": [
    { name: "PKN Orlen Plock Depot", type: "inland terminal", city: "Plock", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-266", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "oil-refineries-ltd-bazan-group": [
    { name: "Haifa Refinery", type: "refinery", city: "Haifa", country: "Israel", externalUrl: "https://tankbazaar.com/#terminal-110", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "oman-tank-terminal-company-saoc": [
    { name: "Sohar Port Terminal", type: "port terminal", city: "Sohar", country: "Oman", externalUrl: "https://tankbazaar.com/#terminal-43", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "open-joint-stock-company-mozyr-oil-refinery-ojsc-mozyr-oil-refinery": [
    { name: "Mozyr Oil Refinery Terminal", type: "refinery", city: "Mozyr", country: "Belarus", externalUrl: "https://tankbazaar.com/#terminal-717", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "open-joint-stock-company-naftan-ojsc-naftan": [
    { name: "Naftan Novopolotsk Depot", type: "refinery", city: "Novopolotsk", country: "Belarus", externalUrl: "https://tankbazaar.com/#terminal-319", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "orlen-unipetrol": [
    { name: "Litvinov Refinery", type: "refinery", city: "Litvinov", country: "Czech Republic", externalUrl: "https://tankbazaar.com/#terminal-315", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pao-novatek": [
    { name: "Novatek Sabetta Yamal LNG Terminal", type: "port terminal", city: "Sabetta", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-364", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pern-sa": [
    { name: "Naftoport Gdansk Terminal", type: "port terminal", city: "Gdansk", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-265", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pi-industries-limited": [
    { name: "Jambusar Terminal", type: "plant", city: "Jambusar, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1015", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pjsc-acron": [
    { name: "Acron Veliky Novgorod Terminal", type: "plant", city: "Veliky Novgorod", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-925", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pjsc-kirishinefteorgsintez": [
    { name: "Kirishinefteorgsintez (KINEF) Terminal", type: "refinery", city: "Kirishi, Leningrad Oblast", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-785", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pjsc-lukoil": [
    { name: "Lukoil Varandey Terminal", type: "port terminal", city: "Varandey", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-366", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pjsc-lukoil-rpk-vysotsk-lukoil-ii": [
    { name: "Vysotsk LUKOIL Terminal", type: "port terminal", city: "Vysotsk", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-92", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pjsc-nizhnekamskneftekhim": [
    { name: "Nizhnekamskneftekhim Terminal", type: "plant", city: "Nizhnekamsk, Tatarstan", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-857", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pjsc-ukrnafta": [
    { name: "Nadvirna Refinery", type: "refinery", city: "Nadvirna, Ivano-Frankivsk Oblast", country: "Ukraine", externalUrl: "https://tankbazaar.com/#terminal-791", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pjsc-ukrtatnafta": [
    { name: "Ukrtatnafta Kremenchuk Depot", type: "refinery", city: "Kremenchuk", country: "Ukraine", externalUrl: "https://tankbazaar.com/#terminal-320", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pjsc-uralkali": [
    { name: "Uralkali Berezniki Terminal", type: "plant", city: "Berezniki", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-944", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pt-chandra-asri-petrochemical-tbk": [
    { name: "Chandra Asri Cilegon Terminal", type: "plant", city: "Cilegon, Banten", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-852", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pt-pupuk-kalimantan-timur-pupuk-kaltim": [
    { name: "Pupuk Kaltim Terminal", type: "plant", city: "Bontang, East Kalimantan", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-928", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pt-pupuk-sriwijaya-pusri": [
    { name: "(Pusri) Terminal", type: "plant", city: "Palembang", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-929", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "pt-trans-pacific-petrochemical-indotama-tppi": [
    { name: "TPPI Tuban Terminal", type: "plant", city: "Tuban, East Java", country: "Indonesia", externalUrl: "https://tankbazaar.com/#terminal-1019", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ptt-global-chemical-public-company-limited": [
    { name: "PTTGC Map Ta Phut Terminal", type: "plant", city: "Map Ta Phut, Rayong", country: "Thailand", externalUrl: "https://tankbazaar.com/#terminal-853", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ptt-public-company-limited": [
    { name: "Map Ta Phut Refinery", type: "refinery", city: "Rayong", country: "Thailand", externalUrl: "https://tankbazaar.com/#terminal-180", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "padma-oil-company-limited": [
    { name: "Chittagong Terminal", type: "port terminal", city: "Chittagong", country: "Bangladesh", externalUrl: "https://tankbazaar.com/#terminal-176", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pak-arab-refinery-limited-parco": [
    { name: "PARCO Port Qasim Terminal", type: "port terminal", city: "Port Qasim", country: "Pakistan", externalUrl: "https://tankbazaar.com/#terminal-302", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "paldiski": [
    { name: "Terminal", type: "port terminal", city: "Paldiski", country: "Estonia", externalUrl: "https://tankbazaar.com/#terminal-117", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "paradeep-phosphates-limited": [
    { name: "Phosphates Terminal", type: "plant", city: "Paradeep, Odisha", country: "India", externalUrl: "https://tankbazaar.com/#terminal-965", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "paria-fuel-trading-company-limited": [
    { name: "Pointe-a-Pierre Terminal", type: "port terminal", city: "Pointe-a-Pierre", country: "Trinidad and Tobago", externalUrl: "https://tankbazaar.com/#terminal-390", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "pavlodar-oil-chemistry-refinery-llp": [
    { name: "PNHZ Pavlodar Depot", type: "inland terminal", city: "Pavlodar", country: "Kazakhstan", externalUrl: "https://tankbazaar.com/#terminal-385", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petkim-petrokimya-holding-as": [
    { name: "Aliağa Terminal", type: "plant", city: "Aliağa", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-880", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petro-lesotho": [
    { name: "Maseru Depot", type: "inland terminal", city: "Maseru", country: "Lesotho", externalUrl: "https://tankbazaar.com/#terminal-339", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petro-star-inc": [
    { name: "Nikiski Terminal", type: "port terminal", city: "Nikiski AK", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-1000", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petrokazakhstan-oil-products-llp": [
    { name: "Shymkent Refinery", type: "refinery", city: "Shymkent", country: "Kazakhstan", externalUrl: "https://tankbazaar.com/#terminal-793", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petrovietnam-fertilizer-and-chemicals-corporation-pvfcco": [
    { name: "PVFCCo Phu My Terminal", type: "plant", city: "Phu My, Ba Ria-Vung Tau", country: "Vietnam", externalUrl: "https://tankbazaar.com/#terminal-954", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petrovietnam-oil-vung-tau-company-limited-pv-oil-vung-tau": [
    { name: "PV Oil Vung Tau Terminal", type: "port terminal", city: "Vung Tau", country: "Vietnam", externalUrl: "https://tankbazaar.com/#terminal-174", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petrobras": [
    { name: "Duque de Caxias Refinery", type: "refinery", city: "Duque de Caxias", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-271", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petrochemical-industries-company-pic": [
    { name: "PIC Kuwait Shuaiba Terminal", type: "plant", city: "Shuaiba", country: "Kuwait", externalUrl: "https://tankbazaar.com/#terminal-914", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petrogal-sa": [
    { name: "Galp Sines Refinery", type: "refinery", city: "Sines", country: "Portugal", externalUrl: "https://tankbazaar.com/#terminal-778", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petrojam-limited": [
    { name: "Kingston Terminal", type: "refinery", city: "Kingston", country: "Jamaica", externalUrl: "https://tankbazaar.com/#terminal-391", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petrol-dd-ljubljana": [
    { name: "Ljubljana Depot", type: "inland terminal", city: "Ljubljana", country: "Slovenia", externalUrl: "https://tankbazaar.com/#terminal-318", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petroleum-development-oman-llc": [
    { name: "PDO Mina al Fahal Terminal", type: "port terminal", city: "Muscat", country: "Oman", externalUrl: "https://tankbazaar.com/#terminal-130", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petroleum-importers-ltd": [
    { name: "Blantyre Depot", type: "inland terminal", city: "Blantyre", country: "Malawi", externalUrl: "https://tankbazaar.com/#terminal-292", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petrolifera-petroleum-limited": [
    { name: "Vlore Terminal", type: "port terminal", city: "Vlore", country: "Albania", externalUrl: "https://tankbazaar.com/#terminal-239", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petrolina-holdings-public-ltd": [
    { name: "Larnaca Terminal", type: "port terminal", city: "Larnaca", country: "Cyprus", externalUrl: "https://tankbazaar.com/#terminal-262", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petromar": [
    { name: "Bissau Terminal", type: "port terminal", city: "Bissau", country: "Guinea-Bissau", externalUrl: "https://tankbazaar.com/#terminal-343", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petron-malaysia-refining-and-marketing-bhd": [
    { name: "Port Dickson Refinery", type: "refinery", city: "Port Dickson", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-182", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petronas-chemicals-fertiliser-kedah-sdn-bhd": [
    { name: "Kedah Terminal", type: "plant", city: "Gurun, Kedah", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-953", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petronas-penapisan-terengganu-sdn-bhd": [
    { name: "Terengganu Terminal", type: "refinery", city: "Kerteh, Terengganu", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-1027", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petronas-refinery-and-petrochemical-corporation-prpc-sdn-bhd": [
    { name: "PRefChem Refinery", type: "refinery", city: "Pengerang, Johor", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-820", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petroquimica-de-venezuela-sa-pequiven": [
    { name: "Pequiven Morón Terminal", type: "plant", city: "Morón, Carabobo", country: "Venezuela", externalUrl: "https://tankbazaar.com/#terminal-991", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petroterminal-de-panama-sa-ptp": [
    { name: "Petroterminales Balboa Terminal", type: "port terminal", city: "Panama City", country: "Panama", externalUrl: "https://tankbazaar.com/#terminal-221", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petrotrade-private-limited": [
    { name: "Harare Depot", type: "inland terminal", city: "Harare", country: "Zimbabwe", externalUrl: "https://tankbazaar.com/#terminal-165", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petroleos-mexicanos-pemex": [
    { name: "Cadereyta Refinery", type: "refinery", city: "Cadereyta Jimenez, Nuevo Leon", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-805", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Pemex Cangrejera Terminal", type: "plant", city: "Cangrejera, Veracruz", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-887", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
    { name: "Pemex Coatzacoalcos Terminal", type: "port terminal", city: "Coatzacoalcos", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-216", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Pemex Tuxpan Terminal", type: "port terminal", city: "Tuxpan", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-217", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
    { name: "Salamanca Refinery", type: "refinery", city: "Salamanca", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-218", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
    { name: "Tula Refinery", type: "refinery", city: "Tula de Allende, Hidalgo", country: "Mexico", externalUrl: "https://tankbazaar.com/#terminal-804", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "petroleos-paraguayos-petropar": [
    { name: "Petropar Asuncion Depot", type: "inland terminal", city: "Asuncion", country: "Paraguay", externalUrl: "https://tankbazaar.com/#terminal-275", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petroleos-de-mocambique-sa-petromoc": [
    { name: "Petromoc Maputo Terminal", type: "port terminal", city: "Maputo", country: "Mozambique", externalUrl: "https://tankbazaar.com/#terminal-149", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "petroleos-del-norte-sa": [
    { name: "Petronor Bilbao Refinery", type: "refinery", city: "Muskiz, Bilbao", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-775", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "polaroil-kni-a-s": [
    { name: "Polar Oil Nuuk Terminal", type: "port terminal", city: "Nuuk", country: "Greenland", externalUrl: "https://tankbazaar.com/#terminal-226", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "polski-koncern-naftowy-orlen-sa": [
    { name: "PKN Orlen Plock Refinery", type: "refinery", city: "Plock", country: "Poland", externalUrl: "https://tankbazaar.com/#terminal-772", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "portland-airport-fuel-facilities-corporation-paffc": [
    { name: "PDX Airport Tank Farm", type: "inland terminal", city: "Portland OR", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-404", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "profertil-sa": [
    { name: "Bahía Blanca Terminal", type: "plant", city: "Bahía Blanca", country: "Argentina", externalUrl: "https://tankbazaar.com/#terminal-927", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "qatar-chemical-company-ltd-q-chem": [
    { name: "Q-Chem Mesaieed Terminal", type: "plant", city: "Mesaieed", country: "Qatar", externalUrl: "https://tankbazaar.com/#terminal-886", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "qatar-fertiliser-company-qafco": [
    { name: "QAFCO Mesaieed Terminal", type: "plant", city: "Mesaieed", country: "Qatar", externalUrl: "https://tankbazaar.com/#terminal-912", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "qatar-fuel-company-woqod-qpsc": [
    { name: "Woqod Doha Depot", type: "inland terminal", city: "Doha", country: "Qatar", externalUrl: "https://tankbazaar.com/#terminal-329", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "qatar-fuel-company-qpsc": [
    { name: "QJET Hamad Airport Fuel Farm", type: "inland terminal", city: "Doha", country: "Qatar", externalUrl: "https://tankbazaar.com/#terminal-418", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "qatar-petrochemical-company-qapco": [
    { name: "QAPCO Mesaieed Terminal", type: "plant", city: "Mesaieed", country: "Qatar", externalUrl: "https://tankbazaar.com/#terminal-866", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "qingdao-shihua-crude-oil-terminal-company-ltd": [
    { name: "Oil Terminal", type: "port terminal", city: "Qingdao", country: "China", externalUrl: "https://tankbazaar.com/#terminal-96", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "rabigh-refining-and-petrochemical-company-petrorabigh": [
    { name: "PetroRabigh Refinery", type: "refinery", city: "Rabigh", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-755", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "red-sea-corp": [
    { name: "Massawa Terminal", type: "port terminal", city: "Massawa", country: "Eritrea", externalUrl: "https://tankbazaar.com/#terminal-291", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "refinadora-costarricense-de-petroleo-sa-recope": [
    { name: "RECOPE Puerto Moin Terminal", type: "port terminal", city: "Puerto Moin", country: "Costa Rica", externalUrl: "https://tankbazaar.com/#terminal-736", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "refineria-dominicana-de-petroleo-pdv-sa-refidomsa": [
    { name: "Refidomsa Haina Terminal", type: "refinery", city: "Haina", country: "Dominican Republic", externalUrl: "https://tankbazaar.com/#terminal-392", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "refineria-la-pampilla-saa": [
    { name: "Refineria La Pampilla Terminal", type: "refinery", city: "Ventanilla, Callao", country: "Peru", externalUrl: "https://tankbazaar.com/#terminal-769", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "repsol-petroleo-sa": [
    { name: "Cartagena Refinery", type: "refinery", city: "Cartagena", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-776", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "repsol-quimica-sa": [
    { name: "Tarragona Terminal", type: "plant", city: "Tarragona", country: "Spain", externalUrl: "https://tankbazaar.com/#terminal-873", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "rompetrol-rafinare-sa-kmg-international": [
    { name: "Constanta Terminal", type: "port terminal", city: "Constanta", country: "Romania", externalUrl: "https://tankbazaar.com/#terminal-235", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "rubis-energy-rwanda-ltd": [
    { name: "Kigali Depot", type: "inland terminal", city: "Kigali", country: "Rwanda", externalUrl: "https://tankbazaar.com/#terminal-293", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "rubis-terminal-infra-sa": [
    { name: "Strasbourg Depot", type: "inland terminal", city: "Strasbourg", country: "France", externalUrl: "https://tankbazaar.com/#terminal-198", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "rubis-west-indies-limited": [
    { name: "Bridgetown Fuel Terminal", type: "port terminal", city: "Bridgetown", country: "Barbados", externalUrl: "https://tankbazaar.com/#terminal-742", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "s-oil-corporation": [
    { name: "Onsan Refinery", type: "refinery", city: "Ulsan", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-824", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "scg-chemicals-public-company-limited": [
    { name: "Chemicals Terminal", type: "plant", city: "Map Ta Phut, Rayong", country: "Thailand", externalUrl: "https://tankbazaar.com/#terminal-1018", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sdtm": [
    { name: "Djibouti Port Terminal", type: "port terminal", city: "Djibouti City", country: "Djibouti", externalUrl: "https://tankbazaar.com/#terminal-162", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "sgp": [
    { name: "Conakry Terminal", type: "port terminal", city: "Conakry", country: "Guinea", externalUrl: "https://tankbazaar.com/#terminal-286", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "sk-energy": [
    { name: "Ulsan Refinery", type: "refinery", city: "Ulsan", country: "South Korea", externalUrl: "https://tankbazaar.com/#terminal-186", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "skw-stickstoffwerke-piesteritz-gmbh": [
    { name: "Piesteritz Terminal", type: "plant", city: "Lutherstadt Wittenberg", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-962", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "smca": [
    { name: "Roissy Fuel Depot", type: "inland terminal", city: "Paris CDG", country: "France", externalUrl: "https://tankbazaar.com/#terminal-409", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "socar-georgia-petroleum": [
    { name: "Kulevi Oil Terminal", type: "port terminal", city: "Kulevi", country: "Georgia", externalUrl: "https://tankbazaar.com/#terminal-748", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "soma-oil": [
    { name: "Mogadishu Terminal", type: "port terminal", city: "Mogadishu", country: "Somalia", externalUrl: "https://tankbazaar.com/#terminal-290", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "srf-limited": [
    { name: "Dahej Terminal", type: "plant", city: "Dahej, Gujarat", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1013", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "star-rafineri-as-socar-turkey": [
    { name: "Refinery", type: "refinery", city: "Aliaga", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-747", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sadara-chemical-company": [
    { name: "Company Terminal", type: "plant", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-868", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sasol-limited": [
    { name: "Secunda Terminal", type: "plant", city: "Secunda, Mpumalanga", country: "South Africa", externalUrl: "https://tankbazaar.com/#terminal-858", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "saudi-arabian-fertilizer-company-safco": [
    { name: "SAFCO Jubail Terminal", type: "plant", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-913", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "saudi-arabian-mining-company-ma-aden": [
    { name: "Ma'aden Phosphate Ras Al Khair Terminal", type: "plant", city: "Ras Al Khair", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-911", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "saudi-arabian-oil-company": [
    { name: "Ras Tanura Refinery & Terminal", type: "refinery", city: "Ras Tanura", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-41", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "saudi-aramco-jubail-refinery-company": [
    { name: "Jubail Refinery", type: "refinery", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-13", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "saudi-aramco-total-refining-and-petrochemical-company-satorp": [
    { name: "SATORP Refinery", type: "refinery", city: "Jubail", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-754", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "seychelles-petroleum-company-ltd-seypec": [
    { name: "Port Victoria Terminal", type: "port terminal", city: "Port Victoria", country: "Seychelles", externalUrl: "https://tankbazaar.com/#terminal-208", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "shaanxi-yanchang-petroleum-group-co-ltd": [
    { name: "Yanchang Petroleum Yan'an Refinery", type: "refinery", city: "Yan'an, Shaanxi", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1046", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "shandong-dongming-petrochemical-group-co-ltd": [
    { name: "Dongming Petrochemical Terminal", type: "refinery", city: "Dongming, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1047", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "shandong-yulong-petrochemical-co-ltd": [
    { name: "Yulong Petrochemical Terminal", type: "refinery", city: "Longkou, Yantai, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-1049", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "shanghai-international-port-group": [
    { name: "Yangshan Terminal", type: "port terminal", city: "Shanghai", country: "China", externalUrl: "https://tankbazaar.com/#terminal-98", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "shell-deutschland-oil-gmbh": [
    { name: "Rheinland Refinery", type: "refinery", city: "Wesseling/Godorf, Cologne", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-784", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "shell-nederland-raffinaderij-bv": [
    { name: "Pernis Refinery", type: "refinery", city: "Pernis, Rotterdam", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-770", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sinochem-chongqing-fuling-chemical-industry-co-ltd": [
    { name: "Fuling Terminal", type: "plant", city: "Fuling, Chongqing", country: "China", externalUrl: "https://tankbazaar.com/#terminal-980", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sinofert-holdings-limited": [
    { name: "Qingdao Terminal", type: "plant", city: "Qingdao, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-915", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sinopec-kantons-holdings-limited": [
  ],
  "sinopec-shanghai-petrochemical-company-limited": [
    { name: "Company Limited Terminal", type: "refinery", city: "Jinshan, Shanghai", country: "China", externalUrl: "https://tankbazaar.com/#terminal-810", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "skytanking-holding-gmbh": [
    { name: "JUHI Sydney Fuel Facilities Terminal", type: "inland terminal", city: "Sydney", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-412", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "slavneft-yanos-jsc": [
    { name: "Yaroslavl Refinery", type: "refinery", city: "Yaroslavl", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-789", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "slovnaft-as": [
    { name: "Bratislava Depot", type: "refinery", city: "Bratislava", country: "Slovakia", externalUrl: "https://tankbazaar.com/#terminal-316", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sociedad-quimica-y-minera-de-chile-sa-sqm": [
    { name: "SQM Tocopilla Terminal", type: "plant", city: "Tocopilla", country: "Chile", externalUrl: "https://tankbazaar.com/#terminal-936", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "societa-italiana-per-l-oleodotto-transalpino-spa": [
    { name: "SIOT Trieste Terminal", type: "port terminal", city: "Trieste", country: "Italy", externalUrl: "https://tankbazaar.com/#terminal-195", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-africaine-de-raffinage-sar": [
    { name: "SAR Dakar Terminal", type: "refinery", city: "Dakar", country: "Senegal", externalUrl: "https://tankbazaar.com/#terminal-146", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "societe-anonyme-marocaine-de-l-industrie-du-raffinage-samir": [
    { name: "SAMIR Mohammedia Terminal", type: "refinery", city: "Mohammedia", country: "Morocco", externalUrl: "https://tankbazaar.com/#terminal-140", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "societe-camerounaise-des-depots-petroliers": [
    { name: "SCDP Douala Terminal", type: "port terminal", city: "Douala", country: "Cameroon", externalUrl: "https://tankbazaar.com/#terminal-163", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-comorienne-des-hydrocarbures-sch": [
    { name: "SCH Comores Moroni Terminal", type: "port terminal", city: "Moroni", country: "Comoros", externalUrl: "https://tankbazaar.com/#terminal-342", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-ivoirienne-de-raffinage-sir": [
    { name: "SIR Abidjan Refinery", type: "refinery", city: "Abidjan", country: "Ivory Coast", externalUrl: "https://tankbazaar.com/#terminal-841", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "societe-mauritanienne-des-industries-de-raffinage": [
    { name: "SOMIR Nouakchott Terminal", type: "refinery", city: "Nouakchott", country: "Mauritania", externalUrl: "https://tankbazaar.com/#terminal-283", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "societe-nationale-burkinabe-d-hydrocarbures": [
    { name: "SONABHY Ouagadougou Depot", type: "inland terminal", city: "Ouagadougou", country: "Burkina Faso", externalUrl: "https://tankbazaar.com/#terminal-295", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-nationale-de-commercialisation-des-produits-petroliers": [
    { name: "SONACOP Cotonou Terminal", type: "port terminal", city: "Cotonou", country: "Benin", externalUrl: "https://tankbazaar.com/#terminal-287", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-nigerienne-des-produits-petroliers": [
    { name: "SONIDEP Niamey Depot", type: "inland terminal", city: "Niamey", country: "Niger", externalUrl: "https://tankbazaar.com/#terminal-336", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-togolaise-de-stockage-de-lome": [
    { name: "STSL Lome Terminal", type: "port terminal", city: "Lome", country: "Togo", externalUrl: "https://tankbazaar.com/#terminal-145", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-tunisienne-des-industries-de-raffinage-stir": [
    { name: "STIR Bizerte Refinery", type: "refinery", city: "Menzel Bourguiba", country: "Tunisia", externalUrl: "https://tankbazaar.com/#terminal-838", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "societe-des-hydrocarbures-du-tchad-sht": [
    { name: "SHT N'Djamena Depot", type: "inland terminal", city: "N'Djamena", country: "Chad", externalUrl: "https://tankbazaar.com/#terminal-297", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "societe-du-terminal-de-la-skhira-trapsa": [
    { name: "TRAPSA Skhira Terminal", type: "port terminal", city: "Skhira", country: "Tunisia", externalUrl: "https://tankbazaar.com/#terminal-142", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "sokimex-investment-group": [
    { name: "Sihanoukville Port Terminal", type: "port terminal", city: "Sihanoukville", country: "Cambodia", externalUrl: "https://tankbazaar.com/#terminal-730", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "sonatrach-raffineria-italiana-srl": [
    { name: "Augusta Refinery", type: "refinery", city: "Augusta", country: "Italy", externalUrl: "https://tankbazaar.com/#terminal-196", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sonatrach-spa": [
    { name: "Arzew Terminal", type: "port terminal", city: "Arzew", country: "Algeria", externalUrl: "https://tankbazaar.com/#terminal-20", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "sorfert-algerie-spa": [
    { name: "Arzew Terminal", type: "plant", city: "Arzew", country: "Algeria", externalUrl: "https://tankbazaar.com/#terminal-990", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "south-refineries-company": [
    { name: "Basra Refinery", type: "refinery", city: "Basra", country: "Iraq", externalUrl: "https://tankbazaar.com/#terminal-761", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "southern-petrochemical-industries-corporation-limited-spic": [
    { name: "SPIC Tuticorin Terminal", type: "plant", city: "Tuticorin, Tamil Nadu", country: "India", externalUrl: "https://tankbazaar.com/#terminal-940", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "staatsolie-maatschappij-suriname-nv": [
    { name: "Paramaribo Terminal", type: "port terminal", city: "Paramaribo", country: "Suriname", externalUrl: "https://tankbazaar.com/#terminal-274", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "state-concern-turkmennebit": [
    { name: "Seydi Oil Refinery", type: "refinery", city: "Seydi, Lebap Province", country: "Turkmenistan", externalUrl: "https://tankbazaar.com/#terminal-831", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "state-enterprise-commercial-sea-port-pivdennyi": [
    { name: "Pivdenny Oil Terminal", type: "port terminal", city: "Yuzhne", country: "Ukraine", externalUrl: "https://tankbazaar.com/#terminal-718", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "state-trading-corp": [
    { name: "Port Louis Terminal", type: "port terminal", city: "Port Louis", country: "Mauritius", externalUrl: "https://tankbazaar.com/#terminal-206", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "state-trading-organization-plc": [
    { name: "STO Male Terminal", type: "port terminal", city: "Male", country: "Maldives", externalUrl: "https://tankbazaar.com/#terminal-209", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "sudan-petroleum-corporation-sudapet": [
    { name: "Sudapet Port Sudan Terminal", type: "port terminal", city: "Port Sudan", country: "Sudan", externalUrl: "https://tankbazaar.com/#terminal-150", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "suez-oil-processing-company-sopc": [
    { name: "Processing Terminal", type: "refinery", city: "Suez", country: "Egypt", externalUrl: "https://tankbazaar.com/#terminal-299", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sumitomo-chemical-co-ltd": [
    { name: "Ehime Terminal", type: "plant", city: "Niihama, Ehime", country: "Japan", externalUrl: "https://tankbazaar.com/#terminal-885", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "sunoco-lp": [
    { name: "Philadelphia Terminal", type: "port terminal", city: "Philadelphia PA", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-268", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "syrian-company-for-oil-transport-and-storage-scots": [
    { name: "Petroleum Baniyas Terminal", type: "port terminal", city: "Baniyas", country: "Syria", externalUrl: "https://tankbazaar.com/#terminal-381", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "syrian-petroleum-company-spc": [
    { name: "Homs Depot", type: "inland terminal", city: "Homs", country: "Syria", externalUrl: "https://tankbazaar.com/#terminal-382", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "taif-nk-jsc": [
    { name: "Nizhnekamsk Refinery", type: "refinery", city: "Nizhnekamsk, Tatarstan", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-788", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "transpetrol-as": [
    { name: "Transpetrol Sahy Terminal", type: "inland terminal", city: "Sahy", country: "Slovakia", externalUrl: "https://tankbazaar.com/#terminal-721", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "taman": [
    { name: "Oil Terminal", type: "port terminal", city: "Taman", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-93", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "tedcastles-oil-products-ltd-top-oil": [
    { name: "Top Oil Dublin Terminal", type: "port terminal", city: "Dublin", country: "Ireland", externalUrl: "https://tankbazaar.com/#terminal-264", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "tehran-oil-refining-company": [
    { name: "Refinery", type: "refinery", city: "Tehran", country: "Iran", externalUrl: "https://tankbazaar.com/#terminal-758", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "tema-oil-refinery-company-limited-tor": [
    { name: "Refinery", type: "refinery", city: "Tema", country: "Ghana", externalUrl: "https://tankbazaar.com/#terminal-842", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "thai-oil-public-company-limited": [
    { name: "Sriracha Terminal", type: "refinery", city: "Sriracha", country: "Thailand", externalUrl: "https://tankbazaar.com/#terminal-181", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "the-arab-petroleum-pipelines-company-sumed": [
    { name: "Sidi Kerir Terminal", type: "port terminal", city: "Sidi Kerir, Alexandria", country: "Egypt", externalUrl: "https://tankbazaar.com/#terminal-48", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "toros-tarm-sanayi-ve-ticaret-as": [
    { name: "Mersin Terminal", type: "plant", city: "Mersin", country: "Turkey", externalUrl: "https://tankbazaar.com/#terminal-930", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "total-mauritius": [
    { name: "Depot", type: "inland terminal", city: "Port Louis", country: "Mauritius", externalUrl: "https://tankbazaar.com/#terminal-207", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "totalenergies-ep-gabon": [
    { name: "Total Gabon Port-Gentil Terminal", type: "port terminal", city: "Port-Gentil", country: "Gabon", externalUrl: "https://tankbazaar.com/#terminal-280", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "totalenergies-marketing-centrafrique": [
    { name: "Total CAR Bangui Depot", type: "inland terminal", city: "Bangui", country: "Central African Republic", externalUrl: "https://tankbazaar.com/#terminal-335", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "totalenergies-petrochemicals-and-refining-antwerp-nv": [
    { name: "Antwerp Terminal", type: "plant", city: "Antwerp", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-874", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "trans-mountain-corporation": [
    { name: "Westridge Marine Terminal", type: "port terminal", city: "Burnaby, British Columbia", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-1002", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "transneft-port-kozmino-jsc": [
    { name: "Kozmino Terminal", type: "port terminal", city: "Nakhodka", country: "Russia", externalUrl: "https://tankbazaar.com/#terminal-94", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "tripoli-oil-installations": [
    { name: "Terminal", type: "port terminal", city: "Tripoli", country: "Lebanon", externalUrl: "https://tankbazaar.com/#terminal-112", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "turkmenbashi-complex-of-oil-refineries-tcor": [
    { name: "Refinery", type: "refinery", city: "Turkmenbashi", country: "Turkmenistan", externalUrl: "https://tankbazaar.com/#terminal-378", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "varo-refining-cressier-sa": [
    { name: "Varo Energy Cressier Terminal", type: "refinery", city: "Cressier", country: "Switzerland", externalUrl: "https://tankbazaar.com/#terminal-312", facilityClass: ["process", "storage"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "vipl": [
    { name: "Vizag Terminal", type: "port terminal", city: "Visakhapatnam, Andhra Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-38", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vpi-immingham-llp": [
    { name: "Immingham Terminal", type: "port terminal", city: "Immingham", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-256", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vale-fertilizantes-sa": [
    { name: "Fertilizantes Terminal", type: "plant", city: "Uberaba, Minas Gerais", country: "Brazil", externalUrl: "https://tankbazaar.com/#terminal-989", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "valero-marketing-and-supply-company": [
    { name: "Kingsbury Depot", type: "inland terminal", city: "Kingsbury", country: "UK", externalUrl: "https://tankbazaar.com/#terminal-323", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vancouver-airport-fuel-facilities-corp": [
    { name: "VAFFC Vancouver Airport Fuel Farm", type: "inland terminal", city: "Vancouver YVR", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-408", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vinati-organics-limited": [
    { name: "Lote Terminal", type: "plant", city: "Lote Parshuram, Ratnagiri, Maharashtra", country: "India", externalUrl: "https://tankbazaar.com/#terminal-1004", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "viva-energy-australia-pty-ltd": [
    { name: "Geelong Refinery", type: "refinery", city: "Geelong, Victoria", country: "Australia", externalUrl: "https://tankbazaar.com/#terminal-826", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "vopak-exolum-houston-llc": [
    { name: "Houston Terminal", type: "port terminal", city: "Houston TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-586", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "vopak-horizon-fujairah-limited": [
    { name: "Fujairah Terminal", type: "port terminal", city: "Fujairah", country: "UAE", externalUrl: "https://tankbazaar.com/#terminal-1", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "waha": [
    { name: "Es Sider Terminal", type: "port terminal", city: "Es Sider", country: "Libya", externalUrl: "https://tankbazaar.com/#terminal-138", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "wanhua-chemical-group-co-ltd": [
    { name: "Yantai Terminal", type: "plant", city: "Yantai, Shandong", country: "China", externalUrl: "https://tankbazaar.com/#terminal-860", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "westports-malaysia-sdn-bhd": [
    { name: "Port Klang Terminal", type: "port terminal", city: "Port Klang, Selangor", country: "Malaysia", externalUrl: "https://tankbazaar.com/#terminal-1020", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "yanbu-national-petrochemical-company-yansab": [
    { name: "Yansab Yanbu Terminal", type: "plant", city: "Yanbu", country: "Saudi Arabia", externalUrl: "https://tankbazaar.com/#terminal-854", facilityClass: ["process"], processType: ["petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-belle-plaine-inc": [
    { name: "Plaine Terminal", type: "plant", city: "Belle Plaine, Saskatchewan", country: "Canada", externalUrl: "https://tankbazaar.com/#terminal-966", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-brunsbuttel-gmbh": [
    { name: "Brunsbüttel Terminal", type: "plant", city: "Brunsbüttel", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-935", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-fertilisers-india-private-limited": [
    { name: "India Terminal", type: "plant", city: "Babrala, Uttar Pradesh", country: "India", externalUrl: "https://tankbazaar.com/#terminal-892", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-france-sas": [
    { name: "Le Havre Terminal", type: "plant", city: "Le Havre", country: "France", externalUrl: "https://tankbazaar.com/#terminal-963", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-italia-spa": [
    { name: "Ferrara Terminal", type: "plant", city: "Ferrara", country: "Italy", externalUrl: "https://tankbazaar.com/#terminal-947", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-norge-as": [
    { name: "Porsgrunn Terminal", type: "plant", city: "Porsgrunn", country: "Norway", externalUrl: "https://tankbazaar.com/#terminal-908", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-north-america-inc": [
    { name: "Freeport Terminal", type: "plant", city: "Freeport TX", country: "USA", externalUrl: "https://tankbazaar.com/#terminal-983", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-rostock-gmbh": [
    { name: "Rostock Terminal", type: "plant", city: "Rostock", country: "Germany", externalUrl: "https://tankbazaar.com/#terminal-968", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-sluiskil-bv": [
    { name: "Sluiskil Terminal", type: "plant", city: "Sluiskil", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-903", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-tertre-sa": [
    { name: "Tertre Terminal", type: "plant", city: "Tertre", country: "Belgium", externalUrl: "https://tankbazaar.com/#terminal-946", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yara-vlaardingen-bv": [
    { name: "Vlaardingen Terminal", type: "plant", city: "Vlaardingen", country: "Netherlands", externalUrl: "https://tankbazaar.com/#terminal-974", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "yemen-petroleum-company-ypc": [
    { name: "Sanaa Depot", type: "inland terminal", city: "Sanaa", country: "Yemen", externalUrl: "https://tankbazaar.com/#terminal-333", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "yunnan-yuntianhua-co-ltd": [
    { name: "Yuntianhua Kunming Terminal", type: "plant", city: "Kunming, Yunnan", country: "China", externalUrl: "https://tankbazaar.com/#terminal-916", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "zahrani-oil-installations": [
    { name: "Terminal", type: "port terminal", city: "Zahrani", country: "Lebanon", externalUrl: "https://tankbazaar.com/#terminal-113", facilityClass: ["storage"], processType: [], primaryClass: "storage", googlePlaceId: "" },
  ],
  "zawiya-oil-refining-company": [
    { name: "Refinery", type: "refinery", city: "Zawiya", country: "Libya", externalUrl: "https://tankbazaar.com/#terminal-139", facilityClass: ["process"], processType: ["refineries"], primaryClass: "process", googlePlaceId: "" },
  ],
  "zhejiang-petrochemical-co-ltd": [
    { name: "(Rongsheng) Terminal", type: "refinery", city: "Zhoushan, Zhejiang", country: "China", externalUrl: "https://tankbazaar.com/#terminal-815", facilityClass: ["process"], processType: ["refineries", "petrochemicals"], primaryClass: "process", googlePlaceId: "" },
  ],
  "zuari-agro-chemicals-limited": [
    { name: "Goa Terminal", type: "plant", city: "Zuarinagar, Goa", country: "India", externalUrl: "https://tankbazaar.com/#terminal-902", facilityClass: ["process"], processType: ["fertilisers"], primaryClass: "process", googlePlaceId: "" },
  ],
  "ador-welding-limited": [
    { name: "Registered Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "aeroflex-industries-limited": [
    { name: "Registered Office", type: "office", city: "Taloja, Navi Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "afcons-infrastructure-limited": [
    { name: "Registered Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "artson-limited": [
    { name: "Corporate Office", type: "office", city: "Hyderabad, Telangana", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "baliga-lighting-equipments-private-limited": [
    { name: "Registered Office", type: "office", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "balmer-lawrie-and-co-limited": [
    { name: "Registered Office", type: "office", city: "Kolkata, West Bengal", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "bharat-heavy-electricals-limited": [
    { name: "Registered Office", type: "office", city: "New Delhi", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
    { name: "Tiruchirappalli Manufacturing Plant", type: "plant", city: "Tiruchirappalli, Tamil Nadu", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
    { name: "Haridwar Manufacturing Plant", type: "plant", city: "Haridwar, Uttarakhand", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "bridge-and-roof-company-india-limited": [
    { name: "Corporate Office", type: "office", city: "Kolkata, West Bengal", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "bureau-veritas-sa": [
    { name: "India Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "cholamandalam-ms-general-insurance": [
    { name: "Registered Office", type: "office", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "elgi-equipments-limited": [
    { name: "Registered Office", type: "office", city: "Coimbatore, Tamil Nadu", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "erm-india-private-limited": [
    { name: "India Office", type: "office", city: "Gurugram, Haryana", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "emerson-electric-co": [
    { name: "India Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "endress-hauser-group": [
    { name: "India Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "engineers-india-limited": [
    { name: "Registered Office", type: "office", city: "New Delhi", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "fidicon-devices-india-private-limited": [
    { name: "Registered Office", type: "office", city: "Ankleshwar, Gujarat", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "fluidyne-instruments-private-limited": [
    { name: "Registered Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "forbes-marshall-pvt-ltd": [
    { name: "Registered Office", type: "office", city: "Pune, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "godrej-and-boyce-mfg-co-ltd": [
    { name: "Registered Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "hmt-llc": [
    { name: "Corporate Headquarters", type: "office", city: "The Woodlands, TX", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "honeywell-international-inc": [
    { name: "India Office", type: "office", city: "Gurugram, Haryana", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "john-wood-group-plc": [
    { name: "India Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "kec-international-limited": [
    { name: "Registered Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "ksb-limited": [
    { name: "Registered Office", type: "office", city: "Pimpri-Chinchwad, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "kirloskar-brothers-limited": [
    { name: "Registered Office", type: "office", city: "Pune, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
    { name: "Kirloskarvadi Manufacturing Plant", type: "plant", city: "Kirloskarvadi, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "larsen-and-toubro-limited": [
    { name: "Registered Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
    { name: "Hydrocarbon Engineering — Manufacturing Complex", type: "plant", city: "Chennai, Tamil Nadu", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
    { name: "L&T Valves — Manufacturing Plant", type: "plant", city: "Coimbatore, Tamil Nadu", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "lloyd-insulations-india-limited": [
    { name: "Registered Office", type: "office", city: "New Delhi", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "mesa-industries-inc": [
    { name: "Registered Office", type: "office", city: "Cincinnati, OH", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "offshore-infrastructures-limited": [
    { name: "Registered Office", type: "office", city: "Mulund, Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "petrofac-limited": [
    { name: "India Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "prashanth-projects-limited": [
    { name: "Registered Office", type: "office", city: "Navi Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "ramboll-group-a-s": [
    { name: "India Office", type: "office", city: "Gurugram, Haryana", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "sgs-sa": [
    { name: "India Office", type: "office", city: "Gurugram, Haryana", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "sharp-tanks-and-structurals-private-limited": [
    { name: "Registered Office", type: "office", city: "Andheri East, Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "thermosystems-private-limited": [
    { name: "Registered Office", type: "office", city: "Hyderabad, Telangana", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "toyo-engineering-india-limited": [
    { name: "Registered Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "tuv-sud-ag": [
    { name: "India Office", type: "office", city: "Mumbai, Maharashtra", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "vesuvius-india-limited": [
    { name: "Registered Office", type: "office", city: "Kolkata, West Bengal", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
  "vijay-tanks-and-vessels-private-limited": [
    { name: "Registered Office", type: "office", city: "Ranoli, Vadodara, Gujarat", country: "India", externalUrl: "", facilityClass: [], processType: [], primaryClass: "", googlePlaceId: "" },
  ],
};
