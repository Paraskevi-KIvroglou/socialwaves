import fs from "node:fs";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

const EMOJIS = ["🌊", "🏝️", "🌅", "🐚", "🏖️", "🌞", "🌴", "⛰️", "🦀", "🌺"];
const GRADIENTS = [
  "from-sky-200 via-sky-100 to-sand-100",
  "from-sand-100 via-sky-100 to-sky-200",
  "from-sky-300 via-sky-200 to-sand-100",
  "from-sky-100 via-sand-100 to-sand-200",
  "from-sky-200 via-sand-100 to-sand-300",
];

function kebab(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickSkill(name: string): ("beginner" | "intermediate" | "advanced")[] {
  const hard = /nazar|supertub|capo mannu|mundaka|hossegor|coxos|praia do norte|guincho/i;
  const easy = /hilton|vouliagm|baleal|foz|loutsa|agios fokas|banzai|levanto/i;
  if (hard.test(name)) return ["advanced"];
  if (easy.test(name)) return ["beginner", "intermediate"];
  return ["intermediate", "advanced"];
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

async function main() {
  const csvPath = path.join(process.cwd(), "..", "data", "surf_spots_offshore_coordinates.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const dataLines = lines.slice(1);

  const rows = dataLines.map((line) => {
    const [id, region, spot_name, area, latitude, longitude] = parseCSVLine(line);
    const areaFirst = area!.split(",")[0]!.trim();
    const idN = Number(id);
    return {
      slug: `spot-${idN}-${kebab(spot_name!)}`,
      name: spot_name!.split(" / ")[0]!,
      area: areaFirst,
      country: (area!.split(",")[1] ?? "").trim() || region!,
      region: region!,
      latitude: Number(latitude),
      longitude: Number(longitude),
      skillLevels: pickSkill(spot_name!),
      trustScore: 60 + (idN * 13) % 33,
      blurb: `${spot_name} — ${area}`,
      heroEmoji: EMOJIS[idN % EMOJIS.length]!,
      heroGradient: GRADIENTS[idN % GRADIENTS.length]!,
    };
  });

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    console.error("NEXT_PUBLIC_CONVEX_URL missing. Run `npx convex dev` first.");
    process.exit(1);
  }

  const client = new ConvexHttpClient(url);
  const beachRes = await client.mutation(api.beaches.upsertMany, { rows });
  console.log("beaches:", beachRes);

  const seedSlugs = [1, 3, 4, 10, 12, 13, 19].map((i) => {
    const r = rows.find((row) => row.slug.startsWith(`spot-${i}-`));
    return r?.slug;
  }).filter((s): s is string => Boolean(s));

  const hoursAgo = (h: number) => Date.now() - h * 3600 * 1000;
  const reportRows = [
    { beachSlug: seedSlugs[0]!, kind: "perfect_session" as const, note: "Glassy waist-to-chest, 8s period. Pure stoke.", userHandle: "meltemi_kid", createdAt: hoursAgo(2) },
    { beachSlug: seedSlugs[0]!, kind: "waves_there" as const, userHandle: "saltwater_sam", createdAt: hoursAgo(5) },
    { beachSlug: seedSlugs[1]!, kind: "waves_there" as const, note: "Clean little rollers — perfect for learning.", userHandle: "beginner_bea", createdAt: hoursAgo(8) },
    { beachSlug: seedSlugs[2]!, kind: "too_windy" as const, note: "Onshore blew it out by 10am.", userHandle: "ika_local", createdAt: hoursAgo(3) },
    { beachSlug: seedSlugs[3]!, kind: "no_waves" as const, userHandle: "athens_paddler", createdAt: hoursAgo(1) },
    { beachSlug: seedSlugs[4]!, kind: "perfect_session" as const, note: "Head-high lines, barely anyone out.", userHandle: "crete_crew", createdAt: hoursAgo(6) },
    { beachSlug: seedSlugs[5]!, kind: "too_crowded" as const, note: "Every softtop in TLV here today.", userHandle: "hilton_regular", createdAt: hoursAgo(7) },
    { beachSlug: seedSlugs[6]!, kind: "waves_there" as const, userHandle: "sardo_surf", createdAt: hoursAgo(9) },
  ].filter((r) => r.beachSlug);

  const reportsRes = await client.mutation(api.reports.seedIfEmpty, { rows: reportRows });
  console.log("reports:", reportsRes);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
