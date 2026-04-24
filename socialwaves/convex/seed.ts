import { mutation } from "./_generated/server";

const BEACHES: ReadonlyArray<{
  name: string;
  slug: string;
  region?: string;
  latitude: number;
  longitude: number;
}> = [
  { name: "Banzai Pipeline", slug: "pipeline-hi", region: "Oʻahu, HI", latitude: 21.6654, longitude: -158.0506 },
  { name: "Jeffreys Bay", slug: "jeffreys-bay", region: "Eastern Cape, ZA", latitude: -34.0417, longitude: 24.9236 },
  { name: "Teahupoʻo", slug: "teahupo", region: "Tahiti, PF", latitude: -17.8584, longitude: -149.2568 },
  { name: "La Gravière (Hossegor)", slug: "hossegor", region: "Nouvelle-Aquitaine, FR", latitude: 43.6867, longitude: -1.4006 },
  { name: "Supertubos", slug: "supertubos", region: "Peniche, PT", latitude: 39.3476, longitude: -9.3606 },
  { name: "Lower Trestles", slug: "trestles", region: "CA, USA", latitude: 33.3804, longitude: -117.6006 },
  { name: "Bells Beach", slug: "bells-beach", region: "VIC, AU", latitude: -38.3636, longitude: 144.2806 },
  { name: "Uluwatu", slug: "uluwatu", region: "Bali, ID", latitude: -8.8193, longitude: 115.0904 },
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
