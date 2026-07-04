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
 ("Renewables", ["Hydrogen","Green Ammonia","Biofuels","Renewable Diesel","Sustainable Aviation Fuel","Carbon Capture","Carbon Storage"]),
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
 ("Marine", [("Marine Pilot",[]),("Harbour Master",[]),("Jetty Superintendent",[]),("Marine Coordinator",[]),("Mooring Master",[])]),
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

# ---------------------------------------------------------------- DISCIPLINES
DISC = ["API 650","API 653","API 620","API 2610","API 2350","API 510","API 570","API 580","API 581","ASME","NFPA","IEC","ATEX","SIL","HAZOP","LOPA","RBI","Fitness for Service","ISO 9001","ISO 14001","ISO 45001","Floating Roof","Internal Floating Roof","External Floating Roof","Cone Roof","Dome Roof","Cryogenic Tanks","LNG","LPG","Jet Fuel","Hydrogen","Ammonia","Cathodic Protection","Tank Calibration","Custody Transfer","Metering","Tank Gauging","Vapour Recovery","Floating Suction","Marine Loading Arms","Pigging","Pipeline Commissioning","Tank Cleaning","Tank Inspection","Shutdown","Turnaround","Commissioning","Decommissioning","Brownfield","Greenfield"]
DISC_ALIAS = {"Fitness for Service":["FFS"],"Vapour Recovery":["VRU","Vapor Recovery"],"Marine Loading Arms":["MLA"]}
for d in DISC:
    add("discipline", d, aliases=DISC_ALIAS.get(d), prefix="disc")

# ---------------------------------------------------------------- CERTIFICATIONS (credentials a person holds)
CERT = [("API 510",[]),("API 570",[]),("API 653",[]),("API 580",[]),("API 936",[]),("NEBOSH",[]),("IOSH",[]),
        ("HAZOP Leader",[]),("AMPP Cathodic Protection",["NACE CP"]),("ASNT NDT Level II",[]),("ASNT NDT Level III",[])]
for c, al in CERT:
    add("certification", c, aliases=al, prefix="cert")

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
