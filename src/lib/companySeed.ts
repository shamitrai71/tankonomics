// Auto-generated from tankonomics_companies_10_common.xlsx.
// The 10 launch companies (ASTSPARES ∩ TankBazaar). Doc id === slug (shared
// cross-app identity key). Seed via Admin → Companies → "Seed companies".

export interface CompanySeed {
  id: string; slug: string; name: string;
  description: string; aboutUs: string; address: string; website: string;
  logo: string; heroImage: string;
  linkedin: string; twitter: string; facebook: string; instagram: string;
  categoryIds: string[]; isFeatured: boolean;
}

export const COMPANY_SEED: CompanySeed[] = [
  {
    id: "bharat-petroleum-corporation-limited", slug: "bharat-petroleum-corporation-limited", name: "Bharat Petroleum Corporation Limited",
    description: "Maharatna PSU — crude refining and nationwide fuel marketing.", aboutUs: "",
    address: "Mumbai, Maharashtra, India", website: "https://www.bharatpetroleum.in",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785497022/ChatGPT_Image_Jul_31_2026_04_47_40_PM_suhto3.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785511648/BPCL_Cover_hjpwpc.png",
    linkedin: "https://www.linkedin.com/company/bpcl/posts/?feedView=all", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "refineries"], isFeatured: false,
  },
  {
    id: "haldia-petrochemicals-limited", slug: "haldia-petrochemicals-limited", name: "Haldia Petrochemicals Limited",
    description: "Naphtha-based petrochemical producer (polymers, chemicals).", aboutUs: "",
    address: "Kolkata, West Bengal, India", website: "https://www.haldiapetrochemicals.com",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511648/HPL_LOGO_eswvav.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785511858/HPL_COVER_zywued.png",
    linkedin: "https://www.linkedin.com/company/haldia-petrochemicals-ltd/posts/?feedView=all", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "petrochemicals"], isFeatured: false,
  },
  {
    id: "hindustan-petroleum-corporation-limited", slug: "hindustan-petroleum-corporation-limited", name: "Hindustan Petroleum Corporation Limited",
    description: "Maharatna PSU refiner and fuel marketer.", aboutUs: "",
    address: "Mumbai, Maharashtra, India", website: "https://www.hindustanpetroleum.com",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511648/HPCL_Logo_gaoo4o.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785510278/HPCL_COVER_PHOTO_st0wlu.png",
    linkedin: "https://www.linkedin.com/company/hpcl/posts/?feedView=all", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "refineries"], isFeatured: false,
  },
  {
    id: "indian-oil-corporation-limited", slug: "indian-oil-corporation-limited", name: "Indian Oil Corporation Limited",
    description: "India's largest refiner and fuel marketer (Maharatna PSU).", aboutUs: "",
    address: "New Delhi, India", website: "https://www.iocl.com",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511648/IOC_LOGO_pwclxf.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785497094/IOCIANS_qpgudb.png",
    linkedin: "https://www.linkedin.com/company/indian-oil-corp-limited/posts/?feedView=all", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "refineries", "petrochemicals"], isFeatured: false,
  },
  {
    id: "mangalore-refinery-and-petrochemicals-limited", slug: "mangalore-refinery-and-petrochemicals-limited", name: "Mangalore Refinery and Petrochemicals Limited",
    description: "Refinery & petrochemicals; ONGC subsidiary.", aboutUs: "",
    address: "Mangalore, Karnataka, India", website: "https://www.mrpl.co.in",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511649/MRPL_LOGO_qrimij.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785497100/MRPL_Refinery_pplojb.jpg",
    linkedin: "", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "refineries", "petrochemicals"], isFeatured: false,
  },
  {
    id: "nayara-energy-limited", slug: "nayara-energy-limited", name: "Nayara Energy Limited",
    description: "Refining and fuel retail; operates the Vadinar refinery.", aboutUs: "",
    address: "Mumbai, Maharashtra, India", website: "https://www.nayaraenergy.com",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511853/Nayara_htuzhx.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785497092/Nayara_cover_awpxzh.png",
    linkedin: "https://www.linkedin.com/company/nayaraenergy/posts/?feedView=all", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "refineries"], isFeatured: false,
  },
  {
    id: "ongc-petro-additions-limited", slug: "ongc-petro-additions-limited", name: "ONGC Petro Additions Limited",
    description: "Petrochemical complex at Dahej (ONGC-promoted; 'OPaL').", aboutUs: "",
    address: "Dahej, Gujarat, India", website: "https://www.opalindia.in",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511649/OPAL_i53fie.webp",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785510039/OPAL_COVER_uwaod3.png",
    linkedin: "", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "petrochemicals"], isFeatured: false,
  },
  {
    id: "oil-and-natural-gas-corporation-limited", slug: "oil-and-natural-gas-corporation-limited", name: "Oil and Natural Gas Corporation Limited",
    description: "India's largest crude oil & natural gas E&P company (Maharatna PSU).", aboutUs: "",
    address: "New Delhi, India", website: "https://www.ongcindia.com",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511647/ONGC_LOGO_h2o4gc.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785510448/ONGC_COVER_sjytrx.png",
    linkedin: "", twitter: "", facebook: "", instagram: "",
    categoryIds: ["natural-resources-and-upstream", "oil-and-gas-exploration"], isFeatured: false,
  },
  {
    id: "reliance-industries-limited", slug: "reliance-industries-limited", name: "Reliance Industries Limited",
    description: "Refining, petrochemicals and more; operates Jamnagar (world's largest refinery).", aboutUs: "",
    address: "Mumbai, Maharashtra, India", website: "https://www.ril.com",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511649/RIL_axh1dy.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785510039/RIL_Cover_Image_gkko1p.png",
    linkedin: "https://www.linkedin.com/company/reliance/posts/?feedView=all", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "refineries", "petrochemicals"], isFeatured: false,
  },
  {
    id: "tamil-nadu-petroproducts-limited", slug: "tamil-nadu-petroproducts-limited", name: "Tamil Nadu Petroproducts Limited",
    description: "Petrochemicals / specialty chemicals (LAB, epichlorohydrin).", aboutUs: "",
    address: "Chennai, Tamil Nadu, India", website: "https://www.tnpetro.com",
    logo: "https://res.cloudinary.com/petrodek/image/upload/v1785511649/TNPETRO_LOGO_nmce7c.png",
    heroImage: "https://res.cloudinary.com/petrodek/image/upload/v1785512376/TNPetro_pjt0ka.png",
    linkedin: "", twitter: "", facebook: "", instagram: "",
    categoryIds: ["process-industries", "petrochemicals", "chemicals"], isFeatured: false,
  },
];
