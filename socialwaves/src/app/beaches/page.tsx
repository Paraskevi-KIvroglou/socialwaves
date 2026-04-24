import { AppShell } from "@/components/AppShell";
import { BeachCard } from "@/components/BeachCard";
import { SectionHeader } from "@/components/SectionHeader";
import { BEACHES } from "@/data/beaches";
import { fetchForecast } from "@/lib/openmeteo";

const USER_OPTS = { skillLevel: "intermediate" as const, preferredHeight: 1.2 };
export const revalidate = 900;

export default async function BeachesPage() {
  const entries = await Promise.all(
    BEACHES.map(async (b) => ({ beach: b, forecast: await fetchForecast(b, USER_OPTS) }))
  );
  const ranked = entries.sort((a, b) => b.forecast.surfScore - a.forecast.surfScore);

  return (
    <AppShell greeting="Every Med + Greek spot we track, ranked by today's score.">
      <SectionHeader title="All beaches" emoji="🏖️" />
      <div className="space-y-3">
        {ranked.map(({ beach, forecast }) => (
          <BeachCard key={beach.id} beach={beach} forecast={forecast} />
        ))}
      </div>
    </AppShell>
  );
}
