import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, useRaces } from "@/components/site/shell";
import { ResultsSection } from "@/components/site/results";
import { PageBanner, CtaButton } from "@/components/site/page-banner";
import { useLang } from "@/lib/i18n";
import bannerResults from "@/assets/banner-results.jpg";

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
  const { lang } = useLang();
  return (
    <SiteShell>
      <PageBanner
        image={bannerResults}
        imageAlt="Runner crossing a finish line at night"
        index="003"
        label={lang === "mn" ? "ҮР ДҮН" : "RESULTS"}
        title={lang === "mn" ? "ӨНГӨРСӨН УРАЛДААН" : "PAST RACES"}
        subtitle={
          lang === "mn"
            ? "Аль хэдийн болж өнгөрсөн уралдаануудын архив."
            : "An archive of races already run across the steppe, desert and mountains."
        }
        cta={
          <CtaButton to="/calendar" size="sm">
            {lang === "mn" ? "ДАРААХ УРАЛДААН" : "UPCOMING RACES"}
          </CtaButton>
        }
        meta={["Archive", "MN / EN"]}
      />
      <ResultsSection races={races} />
    </SiteShell>
  );
}
