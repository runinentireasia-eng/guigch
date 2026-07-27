import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, useRaces } from "@/components/site/shell";
import { ResultsSection } from "@/components/site/results";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Past Races & Results — гүйгч.mn" },
      { name: "description", content: "Archive of past Mongolian running races with dates and locations." },
      { property: "og:title", content: "Past Races & Results — гүйгч.mn" },
      { property: "og:description", content: "Archive of past Mongolian running races with dates and locations." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const races = useRaces();
  return (
    <SiteShell>
      <ResultsSection races={races} />
    </SiteShell>
  );
}
