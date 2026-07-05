#!/usr/bin/env python3
"""
Phase 0 seed generator — converts the Talent Bank taxonomy document into
taxonomy.seed.json, applying the canonical-structure decisions:

  - One node per concept; duplicates resolved to a single canonical parent
    with aliases (Biofuels/SAF -> Renewables; Payroll -> Finance).
  - Domains carry NO roles (dept tags only, with sub-domains).
    Roles live under Job Families exclusively.
  - Roles are seniority-neutral; seniority is a separate enum.
  - Name collisions across layers (Operations/Inspection/etc.) are fine:
    ids are distinct and type-scoped.

ID scheme: <type-prefix>-<slug>   e.g. ind-tank-storage, role-terminal-operator
"""
import json, re, unicodedata

def slug(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s

NODES = []
def add(type_, name, parent=None, level=1, aliases=None, prefix=None, note=None):
    nid = f"{prefix}-{slug(name)}"
    node = {"id": nid, "type": type_, "name": name, "parentId": parent,
            "level": level, "aliases": aliases or [], "order": len([n for n in NODES if n["type"]==type_ and n["parentId"]==parent])}
    if note: node["note"] = note
    NODES.append(node)
    return nid

# ---------------------------------------------------------------- INDUSTRIES
IND = [
 ("Petroleum & Liquid Fuels", ["Crude Oil","Refined Products","Aviation Fuel","Marine Fuels","Lubricants","Bitumen","Ethanol","Methanol"]),
 ("Chemicals", ["Petrochemicals","Specialty Chemicals","Industrial Chemicals","Solvents","Acids","Alkalis","Fertilizers","Polymers","Resins","Bulk Chemical Storage"]),
 ("LNG & Cryogenic", ["LNG Import","LNG Export","LNG Peak Shaving","LPG","Ammonia","Liquid Hydrogen","Liquid Nitrogen","Liquid Oxygen","CO2 Storage"]),
 ("Tank Storage", ["Independent Terminals","Strategic Petroleum Reserves","Inland Tank Farms","Marine Terminals","Distribution Terminals","Pipeline Tank Farms"]),
 ("Ports & Marine", ["Port Authorities","Jetty Operations","Berths","Harbour Infrastructure","Bulk Liquid Ports"]),
 ("Pipelines", ["Cross-country Pipelines","Gathering Pipelines","Distribution Pipelines","Product Pipelines","Gas Pipelines","Hydrogen Pipelines"]),
 ("Renewables", ["Hydrogen","Green Ammonia","Biofuels","Renewable Diesel","Sustainable Aviation Fuel","Carbon Capture","Carbon Storage","Battery Energy Storage","Carbon Markets"]),
 ("Mining & Bulk Liquids", ["Slurry","Mining Chemicals","Acid Storage","Process Liquids"]),
 ("Utilities", ["Water","Wastewater","Fire Water","Cooling Water","Industrial Water"]),
]
ALIAS_IND = {"Sustainable Aviation Fuel": ["SAF"], "CO2 Storage": ["CO₂ Storage"],
             "Biofuels": ["Biodiesel"], "Liquid Hydrogen": ["LH2"]}
NOTE_IND = {"Biofuels": "Canonical under Renewables (also relevant to Petroleum & Liquid Fuels).",
            "Sustainable Aviation Fuel": "Canonical under Renewables (also relevant to Aviation Fuel)."}
for name, children in IND:
    pid = add("industry", name, prefix="ind")
    for c in children:
        add("industry", c, parent=pid, level=2, aliases=ALIAS_IND.get(c), prefix="ind", note=NOTE_IND.get(c))

# ---------------------------------------------------------------- VERTICALS
VERT = [("Terminal Operators",["Independent Storage Operator"]),("EPC Contractors",["Engineering Procurement Construction","EPC"]),
 ("Tank Manufacturers",["Tank Builders","Fabricators","Floating Roof Specialists"]),("Equipment OEMs",["Original Equipment Manufacturer"]),
 ("Inspection Companies",["API Inspection","RBI","NDT","Drone Inspection"]),("Engineering Consultants",["FEED","Detailed Engineering","PMC"]),
 ("Maintenance Contractors",[]),("Logistics Companies",["Bulk Liquid Logistics"]),("Port Operators",[]),("Pipeline Operators",[]),
 ("Refineries",[]),("Petrochemical Plants",[]),("Chemical Manufacturers",[]),("Power Plants",[]),("LNG Operators",[]),
 ("Government Agencies",[]),("Defence Storage",[]),("Fire & Safety Companies",[]),("Environmental Companies",[]),
 ("Software Vendors",["SCADA","Terminal Automation Software","Digital Twin","ERP"]),("Equipment Suppliers",["Spares","ASTSPARES"]),
]
for name, aliases in VERT:
    add("vertical", name, aliases=aliases, prefix="vert")

# ---------------------------------------------------------------- DOMAINS (departments only — no roles)
DOM = [
 ("Operations", []),
 ("Engineering", ["Mechanical","Civil","Electrical","Instrumentation","Automation","Pipeline","Marine","Structural","Process","Projects","Reliability","Asset Integrity","Rotating Equipment","Static Equipment","Corrosion","Inspection"]),
 ("Maintenance", ["Mechanical","Electrical","Instrumentation","Predictive","Preventive","Shutdown","Turnaround","Workshop","Reliability","Condition Monitoring"]),
 ("Projects", ["Planning","Construction","Commissioning","Start-up","Project Controls","Cost Engineering","Contracts","PMC"]),
 ("HSE", ["Safety","Fire","Emergency Response","Environmental","Process Safety","Risk","Permit to Work"]),
 ("Inspection", ["API Inspection","Tank Inspection","Pipeline Inspection","NDT","Corrosion","Fitness for Service","RBI"]),
 ("Integrity", ["Asset Integrity","Mechanical Integrity","Pipeline Integrity","Tank Integrity","Cathodic Protection","Corrosion","Coatings"]),
 ("Automation", ["SCADA","PLC","DCS","Terminal Automation","Cyber Security","Industrial Networks","IIoT","AI","Digital Twin"]),
 ("Commercial", ["Sales","Marketing","Business Development","Pricing","Tendering","Contracts","Estimating","Customer Success","Key Accounts"]),
 ("Supply Chain", ["Procurement","Strategic Sourcing","Warehouse","Inventory","Materials","Stores","Vendor Development","Expediting","Logistics","Fleet","Shipping"]),
 ("Finance", ["Accounts","Audit","Treasury","Tax","Commercial Finance","FP&A","Payroll","Cost Control"]),
 ("Human Resources", ["Recruitment","Talent Acquisition","Learning & Development","Industrial Relations","Compensation","HRBP","Training"]),
 ("Quality", ["QA","QC","ISO","Auditing","Documentation"]),
 ("IT", ["ERP","Infrastructure","Networking","Cybersecurity","Data Analytics","AI","Cloud"]),
 ("Legal", ["Contracts","Compliance","Corporate","Insurance","Claims"]),
 ("Administration", ["Facilities","Office Management","Travel","Security","Reception","Document Control"]),
]
DOM_CHILD_ALIAS = {"ERP": ["SAP","Oracle"], "Learning & Development": ["L&D"], "FP&A": ["Financial Planning & Analysis"]}
DOM_NOTE = {("Finance","Payroll"): "Canonical under Finance (HR-run payroll maps here)."}
for name, children in DOM:
    pid = add("domain", name, prefix="dom")
    for c in children:
        add("domain", c, parent=pid, level=2, aliases=DOM_CHILD_ALIAS.get(c), prefix=f"dom-{slug(name)}", note=DOM_NOTE.get((name,c)))

# ---------------------------------------------------------------- FAMILIES + ROLES (seniority-neutral)
FAM = [
 ("Operations", [("Terminal Operator",[]),("Control Room Operator",[]),("Loading Operator",[]),("Jetty Operator",[]),("Tank Farm Operator",[]),("Shift Supervisor",["Shift In-charge"]),("Operations Engineer",[]),("Operations Manager",[]),("Terminal Manager",[]),("Regional Manager",[])]),
 ("Mechanical", [("Mechanical Technician",["Fitter"]),("Mechanical Engineer",[]),("Maintenance Manager",[]),("Asset Manager",[])]),
 ("Electrical", [("Electrician",[]),("Electrical Technician",[]),("Electrical Engineer",[]),("Electrical Manager",[])]),
 ("Instrumentation", [("Instrument Technician",[]),("Calibration Engineer",[]),("Instrument Engineer",[]),("Instrumentation Manager",[])]),
 ("Civil", [("Site Engineer",[]),("Structural Engineer",[]),("Civil Engineer",[]),("Construction Manager",[])]),
 ("Inspection", [("API Inspector",["API 510 Inspector","API 570 Inspector","API 653 Inspector"]),("Tank Inspector",[]),("Pipeline Inspector",[]),("NDT Technician",["NDT"]),("Corrosion Engineer",[]),("Chief Inspector",[]),("Integrity Manager",[])]),
 ("Fire & Safety", [("Fireman",[]),("Fire Officer",[]),("Fire Chief",[]),("Safety Officer",[]),("HSE Manager",["SHE Manager"]),("Emergency Response Manager",[])]),
 ("Process", [("Process Engineer",[]),("Technical Authority",[])]),
 ("Marine", [("Marine Pilot",[]),("Harbour Master",[]),("Jetty Superintendent",[]),("Marine Coordinator",[]),("Mooring Master",[]),("Loading Master",[])]),
 ("Projects", [("Project Engineer",[]),("Planning Engineer",[]),("Commissioning Engineer",["Start-up Engineer"]),("Project Controls Engineer",[]),("Cost Engineer",[]),("Contracts Engineer",[]),("Project Manager",["PMC"])]),
 ("Commercial", [("Sales Engineer",[]),("Sales Manager",[]),("Business Development Manager",[]),("Commercial Manager",[]),("Key Account Manager",[])]),
 ("Procurement", [("Buyer",[]),("Category Manager",[]),("Procurement Manager",[]),("Strategic Sourcing Specialist",[])]),
 ("Warehouse", [("Storekeeper",[]),("Warehouse Executive",[]),("Inventory Controller",[]),("Warehouse Manager",[])]),
 ("Logistics", [("Fleet Coordinator",[]),("Transport Planner",[]),("Logistics Manager",[]),("Shipping Manager",[])]),
 ("Digital", [("SCADA Engineer",[]),("PLC Engineer",[]),("Automation Engineer",[]),("Cybersecurity Engineer",[]),("Data Scientist",[]),("AI Engineer",[]),("Digital Transformation Manager",[])]),
]
for fam, roles in FAM:
    fid = add("family", fam, prefix="fam")
    for rname, raliases in roles:
        add("role", rname, parent=fid, level=2, aliases=raliases, prefix="role")

# ------------------------------------------------- STANDARDS / COMPETENCIES / CERTIFICATIONS
# Per TALENT_BANK_PHASE0_ADDENDUM.md: the former `discipline` type is split
# into `standard` (documents/codes a person KNOWS) and `competency`
# (activities/skills a person DOES). Migrated nodes keep their legacy disc-
# ids (id-stable migration: type field changes, id never does — renaming ids
# would orphan Firestore docs on re-sync). New nodes use std-/comp- prefixes.
# All three types are grouped (F6) using the same level-1/level-2 pattern as
# equipment. Item tuple: (name, aliases, legacy, note)

def emit_grouped(type_, groups, new_prefix, group_prefix, legacy_prefix="disc"):
    for gname, items in groups:
        gid = add(type_, gname, prefix=group_prefix)
        for (name, aliases, legacy, note) in items:
            add(type_, name, parent=gid, level=2, aliases=aliases,
                prefix=(legacy_prefix if legacy else new_prefix), note=note)

OISD_NOTE = "Verify standard number against the official OISD catalogue before exposing in pickers (F5)."

STD_GROUPS = [
 ("Engineering Standards", [
   ("API 650", [], True, None), ("API 620", [], True, None), ("API 653", [], True, None),
   ("API 2610", [], True, None),
   ("API 2350", ["Overfill Prevention", "API RP 2350"], True, None),
   ("API 510", [], True, None), ("API 570", [], True, None), ("API 580", [], True, None),
   ("API 581", [], True, None),
   ("API 571 Damage Mechanisms", [], False, None),
   ("API 682 Mechanical Seals", [], False, None),
   ("API 610 Centrifugal Pumps", [], False, None),
   ("API 674/675 PD & Metering Pumps", [], False, None),
   ("API 686 Machinery Installation", [], False, None),
   ("API 2000 Tank Venting", [], False, None),
   ("API RP 2003 Static Electricity", [], False, None),
   ("API RP 2218 Safe Tank Entry", [], False, None),
   ("API RP 752/753 Facility Siting", [], False, None),
   ("API RP 754 Process Safety KPIs", [], False, None),
   ("ASME", [], True, None),
   ("ASME BPVC Section VIII", [], False, None),
   ("ASME Section IX", [], False, None),
   ("ASME B31.3 Process Piping", [], False, None),
   ("ASME B31.4", [], False, None),
   ("ASME B31.8", [], False, None),
   ("ASME PCC-1", [], False, None),
   ("ASME PCC-2", [], False, None),
   ("ASTM Material Testing", ["ASTM"], False, None),
   ("ISO 13623 Pipeline", [], False, None),
   ("ISO 19900-series Offshore Structures", ["ISO 19901", "ISO 19902", "ISO 19904"], False, None),
 ]),
 ("Fire & Hazardous Area Standards", [
   ("NFPA", [], True, None), ("IEC", [], True, None), ("ATEX", [], True, None),
   ("NFPA 11 Foam", [], False, None), ("NFPA 13 Sprinklers", [], False, None),
   ("NFPA 15 Water Spray", [], False, None), ("NFPA 20 Fire Pumps", [], False, None),
   ("NFPA 24 Underground Fire Mains", [], False, None), ("NFPA 30 Flammable Liquids", [], False, None),
   ("NFPA 72 Fire Alarm", [], False, None), ("NFPA 70", ["NEC"], False, None),
   ("NFPA 101 Life Safety", [], False, None), ("NFPA 25 Fire System Inspection", [], False, None),
   ("IEC 61508", [], False, None), ("IEC 61511", ["SIS"], False, None),
 ]),
 ("Management System Standards", [
   ("ISO 9001", [], True, None), ("ISO 14001", [], True, None), ("ISO 45001", [], True, None),
   ("ISO 50001", [], False, None), ("ISO 31000", [], False, None), ("ISO 55001", [], False, None),
   ("ISO 27001", [], False, None), ("ISO 17025", [], False, None),
 ]),
 ("Welding Standards", [
   ("AWS D1.1 Structural Welding", [], False, None),
   ("ISO 3834 Welding Quality", [], False, None),
   ("ISO 9606 Welder Qualification", [], False, None),
 ]),
 ("Indian Regulatory & Codes", [
   ("OISD Standards", ["Oil Industry Safety Directorate"], False, None),
   ("OISD-STD-117 Fire Protection", [], False, OISD_NOTE),
   ("OISD-STD-118 Facility Layouts", [], False, OISD_NOTE),
   ("OISD-STD-129 Storage Tank Inspection", [], False, OISD_NOTE),
   ("PESO / Petroleum Rules 2002", ["CCOE"], False, None),
   ("SMPV Rules 2016", ["Static & Mobile Pressure Vessels"], False, None),
   ("Gas Cylinder Rules 2016", [], False, None),
   ("Indian Boiler Regulations", ["IBR"], False, None),
   ("IS 803 MS Storage Tanks", [], False, None),
   ("IS 1893 Seismic Design", [], False, OISD_NOTE),
   ("BIS Standards", ["Bureau of Indian Standards"], False, None),
 ]),
 ("Labour & Statutory Compliance", [
   ("Factories Act 1948", [], False, None),
   ("Contract Labour (R&A) Act 1970", ["CLRA"], False, None),
   ("BOCW Act 1996", [], False, None),
   ("Code on Wages 2019", [], False, None),
   ("Industrial Relations Code 2020", [], False, None),
   ("OSH & Working Conditions Code 2020", [], False, None),
   ("Code on Social Security 2020", [], False, None),
   ("EPF & ESI Compliance", [], False, None),
   ("ILO Conventions", [], False, None),
 ]),
]

COMP_GROUPS = [
 ("Storage & Terminal Operations", [
   ("Floating Roof", ["Floating Roof Inspection"], True, None),
   ("Internal Floating Roof", [], True, None), ("External Floating Roof", [], True, None),
   ("Cone Roof", [], True, None), ("Dome Roof", [], True, None),
   ("Cryogenic Tanks", [], True, None),
   ("Tank Calibration", [], True, None), ("Custody Transfer", [], True, None),
   ("Metering", [], True, None), ("Tank Gauging", [], True, None),
   ("Vapour Recovery", ["VRU", "Vapor Recovery"], True, None),
   ("Floating Suction", [], True, None),
   ("Marine Loading Arms", ["MLA", "Loading Arm Operations"], True, None),
   ("Tank Cleaning", [], True, None), ("Tank Inspection", [], True, None),
   ("Tank Farm Operations", [], False, None),
   ("Terminal Operations", [], False, None),
   ("Marine Terminal Operations", [], False, None),
   ("LNG Terminal Operations", [], False, None),
   ("Tank Settlement Analysis", [], False, None),
   ("Loading Master Operations", ["Ship-Shore Loading"], False, None),
 ]),
 ("Product & Cargo Knowledge", [
   ("LNG", [], True, None), ("LPG", [], True, None), ("Jet Fuel", [], True, None),
   ("Hydrogen", [], True, None), ("Ammonia", ["Ammonia Handling"], True, None),
 ]),
 ("Process Safety & Risk", [
   ("SIL", ["SIL Verification"], True, None), ("HAZOP", [], True, None), ("LOPA", [], True, None),
   ("HAZID", [], False, None), ("BowTie Analysis", [], False, None),
   ("Process Safety Management", ["PSM"], False, None),
   ("Incident Investigation", [], False, None),
   ("Root Cause Analysis", ["RCA"], False, None),
   ("Hazardous Area Classification", [], False, None),
 ]),
 ("Inspection & Integrity", [
   ("RBI", [], True, None),
   ("Fitness for Service", ["FFS", "API 579"], True, None),
   ("Cathodic Protection", [], True, None),
   ("Internal Corrosion", [], False, None), ("Pipeline Corrosion", [], False, None),
   ("Tank Bottom Corrosion", [], False, None), ("Corrosion Assessment", [], False, None),
   ("Radiographic Testing", ["RT"], False, None),
   ("Ultrasonic Testing", ["UT", "UT Thickness"], False, None),
   ("Phased Array UT", ["PAUT"], False, None),
   ("Time of Flight Diffraction", ["TOFD"], False, None),
   ("Magnetic Particle Testing", ["MT"], False, None),
   ("Penetrant Testing", ["PT"], False, None),
   ("Visual Testing", ["VT"], False, None),
   ("Eddy Current Testing", ["ET"], False, None),
   ("Acoustic Emission", ["AE"], False, None),
   ("Marine Classification Rules", ["DNV", "Lloyd's Register", "ABS"], False, None),
 ]),
 ("Pipeline Operations", [
   ("Pigging", [], True, None), ("Pipeline Commissioning", [], True, None),
 ]),
 ("Project Execution", [
   ("Shutdown", [], True, None), ("Turnaround", [], True, None),
   ("Commissioning", [], True, None), ("Decommissioning", [], True, None),
   ("Brownfield", [], True, None), ("Greenfield", [], True, None),
 ]),
 ("Welding & Fabrication", [
   ("WPS/PQR Development", [], False, None),
 ]),
 ("Digital & Automation Platforms", [
   ("Honeywell Experion", [], False, None), ("Yokogawa CENTUM", [], False, None),
   ("Emerson DeltaV", [], False, None), ("Siemens PCS7", [], False, None),
   ("ABB 800xA", [], False, None),
   ("ICS Cybersecurity", ["OT Security"], False, None),
   ("SAP MM", [], False, None), ("SAP EWM/WM", [], False, None), ("SAP PM", [], False, None),
   ("IBM Maximo", ["Maximo"], False, None), ("Infor EAM", [], False, None),
   ("OSIsoft PI System", ["PI System"], False, None),
   ("AutoCAD", [], False, None), ("Navisworks", [], False, None),
   ("Aveva", ["E3D", "PDMS"], False, None), ("Hexagon", ["SmartPlant"], False, None),
 ]),
 ("Logistics & Trade Compliance", [
   ("Dangerous Goods Handling", ["DG"], False, None),
   ("Incoterms", [], False, None), ("Customs Compliance", [], False, None),
 ]),
 ("HSE Practices", [
   ("Lockout Tagout", ["LOTO"], False, None),
 ]),
 ("Energy Transition", [
   ("Hydrogen Safety", [], False, None), ("Cryogenic Safety", [], False, None),
   ("Carbon Capture & Storage", ["CCS", "CCUS"], False, None),
   ("Battery Energy Storage Systems", ["BESS"], False, None),
   ("Biofuel Operations", [], False, None),
 ]),
]

CERT_GROUPS = [
 ("API Personnel Certifications", [
   ("API 510", [], False, None), ("API 570", [], False, None), ("API 653", [], False, None),
   ("API 580", [], False, None), ("API 936", [], False, None),
   ("API 571 Specialist", [], False, None),
   ("API 577 Welding Inspector", [], False, None),
   ("API SIFE Source Inspector", [], False, None),
   ("API 1169 Pipeline Inspector", [], False, None),
 ]),
 ("Welding Certifications", [
   ("AWS CWI", ["Certified Welding Inspector"], False, None),
   ("AWS Senior CWI", [], False, None),
   ("Certified Welding Supervisor", [], False, None),
   ("Certified Welding Educator", [], False, None),
   ("IIW International Welding Engineer", ["IWE"], False, None),
   ("IIW Welding Technologist", ["IWT"], False, None),
   ("IIW Welding Specialist", ["IWS"], False, None),
   ("IIW Welding Practitioner", ["IWP"], False, None),
   ("CSWIP 3.1", [], False, None), ("CSWIP 3.2", [], False, None),
   ("IBR Certified Welder", [], False, None),
 ]),
 ("NDT Certifications", [
   ("ASNT NDT Level I", [], False, None),
   ("ASNT NDT Level II", [], False, None),
   ("ASNT NDT Level III", [], False, None),
   ("ISO 9712 / PCN NDT", ["PCN"], False, None),
 ]),
 ("Corrosion & Coatings", [
   ("AMPP Cathodic Protection", ["NACE CP", "CP Level 1-4"], False, None),
   ("AMPP Coating Inspector", ["CIP Levels 1-3", "Marine Coating Inspector"], False, None),
   ("AMPP Corrosion Technician", [], False, None),
 ]),
 ("HSE & Occupational", [
   ("NEBOSH", [], False, None), ("IOSH", [], False, None),
   ("NEBOSH IGC", [], False, None), ("NEBOSH Oil & Gas", ["IOGC"], False, None),
   ("OSHA 30 Hour", [], False, None), ("OSHA 10 Hour", [], False, None),
   ("Confined Space Entry", [], False, None), ("Working at Height", [], False, None),
   ("Authorised Gas Tester", [], False, None), ("First Aid", [], False, None),
   ("H2S Training", ["H2S Awareness", "H2S Supervisor"], False, None),
 ]),
 ("Process & Functional Safety", [
   ("HAZOP Leader", [], False, None),
   ("TUV Functional Safety Engineer", ["TUV FS Engineer"], False, None),
   ("TUV Functional Safety Professional", [], False, None),
   ("CompEx", [], False, None), ("IECEx CoPC", [], False, None),
 ]),
 ("Offshore (OPITO)", [
   ("BOSIET", ["T-BOSIET"], False, None), ("FOET", [], False, None), ("HUET", [], False, None),
   ("MIST", [], False, None), ("Banksman & Slinger", [], False, None),
   ("Rigger", [], False, None), ("Crane Operator", [], False, None),
   ("Helideck Operations", [], False, None),
 ]),
 ("Maritime (STCW)", [
   ("STCW Basic Safety Training", ["BST"], False, None),
   ("STCW Advanced Fire Fighting", ["AFF"], False, None),
   ("Tanker Familiarization", [], False, None),
   ("Advanced Oil Tanker Operations", [], False, None),
   ("Advanced Chemical Tanker Operations", [], False, None),
   ("Advanced Gas/LNG Tanker Operations", [], False, None),
 ]),
 ("Dangerous Goods", [
   ("IMDG Code", [], False, None), ("IATA DGR", ["IATA Dangerous Goods"], False, None),
   ("ADR/RID", [], False, None),
 ]),
 ("Auditing & Quality", [
   ("ISO 9001 Lead Auditor", [], False, None),
   ("ISO 14001 Lead Auditor", [], False, None),
   ("ISO 45001 Lead Auditor", [], False, None),
   ("ISO 50001 Lead Auditor", [], False, None),
   ("ISO 27001 Lead Auditor", [], False, None),
 ]),
]

emit_grouped("standard", STD_GROUPS, "std", "std-grp")
emit_grouped("competency", COMP_GROUPS, "comp", "comp-grp")
emit_grouped("certification", CERT_GROUPS, "cert", "cert-grp", legacy_prefix="cert")

# ---------------------------------------------------------------- EQUIPMENT
EQUIP = [
 ("Storage Equipment", ["Above-ground Storage Tanks","Underground Storage Tanks","Cryogenic Tanks","Pressure Vessels","Spheres and Bullets","Silos and Hoppers"]),
 ("Tank Components", ["Floating Roof Systems","Rim Seals","Gauge Hatches","Roof Drains","Foam Systems","Manways","Nozzles","Shell Plates","Stairways and Platforms"]),
 ("Valves & Flow Control", ["Pressure/Vacuum Vents","Flame Arresters","Emergency Vents","Control Valves","Isolation Valves","Relief Valves","Check Valves"]),
 ("Measurement & Instrumentation", ["Radar Level Gauges","Servo Gauges","Temperature Systems","Pressure Transmitters","Flow Meters","Tank Gauging Systems","Overfill Prevention Systems","Leak Detection Systems"]),
 ("Loading & Transfer", ["Marine Loading Arms","Loading Skids","Bottom Loading Systems","Top Loading Systems","Hoses and Couplings","Swivel Joints","Dry Disconnect Couplings"]),
 ("Pumps & Rotating Equipment", ["Centrifugal Pumps","Positive Displacement Pumps","Compressors","Blowers","Gearboxes","Mechanical Seals"]),
 ("Piping Systems", ["Pipelines","Manifolds","Pig Launchers and Receivers","Expansion Joints","Strainers","Heat Exchangers"]),
 ("Fire Protection & Safety", ["Foam Chambers","Foam Pourers","Deluge Systems","Fire Monitors","Hydrants","Gas Detectors","Flame Detectors","Emergency Shutdown Systems","Fire Alarm Systems"]),
 ("Electrical & Automation", ["PLCs","DCS","SCADA","Motor Control Centers","Variable Frequency Drives","Industrial Networking Equipment","Hazardous-area Electrical Equipment"]),
]
EQ_ALIAS = {"Above-ground Storage Tanks":["AST"],"Underground Storage Tanks":["UST"],"Emergency Shutdown Systems":["ESD"],
            "Motor Control Centers":["MCC"],"Variable Frequency Drives":["VFD"]}
for grp, items in EQUIP:
    pid = add("equipment", grp, prefix="equip")
    for it in items:
        add("equipment", it, parent=pid, level=2, aliases=EQ_ALIAS.get(it), prefix="equip")

# ---------------------------------------------------------------- ENUMS (not taxonomy nodes; fixed lists)
ENUMS = {
  "seniority": ["Trainee","Junior","Mid-level","Senior","Lead","Manager","Senior Manager","Head / Director"],
  "employmentType": ["Permanent","Contract","Turnaround","Shutdown","Part-time","Internship"],
  "requirementStrength": ["required","preferred","nice-to-have"],
}

# ---------------------------------------------------------------- OUTPUT + integrity checks
ids = [n["id"] for n in NODES]
assert len(ids) == len(set(ids)), f"DUPLICATE IDS: {[i for i in ids if ids.count(i)>1]}"
parents = {n["id"] for n in NODES}
for n in NODES:
    assert n["parentId"] is None or n["parentId"] in parents, f"ORPHAN: {n['id']} -> {n['parentId']}"

import os
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

out = {"version": 1, "generated": "phase-0", "enums": ENUMS, "nodes": NODES}
with open(os.path.join(REPO, "scripts", "taxonomy.seed.json"), "w") as f:
    json.dump(out, f, indent=1, ensure_ascii=False)

# Also emit the bundled TS module consumed by the Admin seeding button,
# so the generator remains the single source of truth for both artifacts.
ts = "// AUTO-GENERATED by scripts/generate_taxonomy.py — do not edit by hand.\n"
ts += "// Regenerate after any vocabulary change so JSON and TS stay in lockstep.\n\n"
ts += "export const TAXONOMY_VERSION = 1;\n\n"
ts += "export const TAXONOMY_ENUMS = " + json.dumps(ENUMS, ensure_ascii=False, indent=2) + " as const;\n\n"
ts += "export interface TaxonomyNode {\n  id: string;\n  type: string;\n  name: string;\n  parentId: string | null;\n  level: number;\n  aliases: string[];\n  order: number;\n  note?: string;\n}\n\n"
ts += "export const TAXONOMY_SEED: TaxonomyNode[] = " + json.dumps(NODES, ensure_ascii=False, indent=1) + ";\n"
with open(os.path.join(REPO, "src", "lib", "taxonomySeed.ts"), "w") as f:
    f.write(ts)

from collections import Counter
c = Counter(n["type"] for n in NODES)
print(f"TOTAL NODES: {len(NODES)}")
for t, n in sorted(c.items()): print(f"  {t}: {n}")
print("Integrity checks passed (unique ids, no orphans).")
