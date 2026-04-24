import { mutation } from "./_generated/server";

const BEACHES: ReadonlyArray<{
  slug: string;
  name: string;
  area: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  skillLevels: ("beginner" | "intermediate" | "advanced")[];
  trustScore: number;
  blurb: string;
  heroEmoji: string;
  heroGradient: string;
}> = [
  {
    name: "Banzai Pipeline",
    slug: "pipeline-hi",
    area: "North Shore",
    country: "USA",
    region: "Oʻahu, HI",
    latitude: 21.6654,
    longitude: -158.0506,
    skillLevels: ["advanced"],
    trustScore: 0.9,
    blurb: "Heavy hollow left over shallow reef — experts only.",
    heroEmoji: "🌊",
    heroGradient: "from-sky-300 via-sky-200 to-sand-100",
  },
  {
    name: "Jeffreys Bay",
    slug: "jeffreys-bay",
    area: "Eastern Cape",
    country: "South Africa",
    region: "Eastern Cape, ZA",
    latitude: -34.0417,
    longitude: 24.9236,
    skillLevels: ["intermediate", "advanced"],
    trustScore: 0.88,
    blurb: "Long right walls when the swell lines up.",
    heroEmoji: "🏝️",
    heroGradient: "from-sand-100 via-sky-100 to-sky-200",
  },
  {
    name: "Teahupoʻo",
    slug: "teahupo",
    area: "Tahiti",
    country: "French Polynesia",
    region: "Tahiti, PF",
    latitude: -17.8584,
    longitude: -149.2568,
    skillLevels: ["advanced"],
    trustScore: 0.85,
    blurb: "Thick, shallow slab — one of the heaviest waves on Earth.",
    heroEmoji: "⛰️",
    heroGradient: "from-sky-200 via-sand-100 to-sky-300",
  },
  {
    name: "La Gravière (Hossegor)",
    slug: "hossegor",
    area: "Landes",
    country: "France",
    region: "Nouvelle-Aquitaine, FR",
    latitude: 43.6867,
    longitude: -1.4006,
    skillLevels: ["intermediate", "advanced"],
    trustScore: 0.86,
    blurb: "Shifty beach barrels in autumn swells.",
    heroEmoji: "🌅",
    heroGradient: "from-sky-100 via-sand-100 to-sand-200",
  },
  {
    name: "Supertubos",
    slug: "supertubos",
    area: "Peniche",
    country: "Portugal",
    region: "Peniche, PT",
    latitude: 39.3476,
    longitude: -9.3606,
    skillLevels: ["intermediate", "advanced"],
    trustScore: 0.87,
    blurb: "Barrels close to the jetty on good days.",
    heroEmoji: "🦀",
    heroGradient: "from-sand-100 via-sky-100 to-sky-200",
  },
  {
    name: "Lower Trestles",
    slug: "trestles",
    area: "San Diego County",
    country: "USA",
    region: "CA, USA",
    latitude: 33.3804,
    longitude: -117.6006,
    skillLevels: ["beginner", "intermediate", "advanced"],
    trustScore: 0.9,
    blurb: "Cobblestone point breaks with a mellow California vibe.",
    heroEmoji: "🌴",
    heroGradient: "from-sky-200 via-sky-100 to-sand-100",
  },
  {
    name: "Bells Beach",
    slug: "bells-beach",
    area: "Great Ocean Road",
    country: "Australia",
    region: "VIC, AU",
    latitude: -38.3636,
    longitude: 144.2806,
    skillLevels: ["intermediate", "advanced"],
    trustScore: 0.88,
    blurb: "Ripping rights along the point — iconic contest spot.",
    heroEmoji: "🐚",
    heroGradient: "from-sky-100 via-sand-100 to-sand-200",
  },
  {
    name: "Uluwatu",
    slug: "uluwatu",
    area: "Bukit",
    country: "Indonesia",
    region: "Bali, ID",
    latitude: -8.8193,
    longitude: 115.0904,
    skillLevels: ["intermediate", "advanced"],
    trustScore: 0.89,
    blurb: "Cave takeoff; multiple sections down the reef.",
    heroEmoji: "🌺",
    heroGradient: "from-sand-100 via-sky-200 to-sand-200",
  },
];

/** One-time / dev: inserts curated beaches (skips slugs that already exist). */
export const seedBeaches = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;
    for (const b of BEACHES) {
      const existing = await ctx.db
        .query("beaches")
        .withIndex("by_slug", (q) => q.eq("slug", b.slug))
        .first();
      if (existing) {
        skipped += 1;
        continue;
      }
      await ctx.db.insert("beaches", b);
      inserted += 1;
    }
    return { inserted, skipped };
  },
});
