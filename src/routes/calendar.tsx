import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, useRaces } from "@/components/site/shell";
import { CalendarGridSection } from "@/components/site/calendar-grid";
import { PageBanner } from "@/components/site/page-banner";
import { useLang } from "@/lib/i18n";
import bannerCalendar from "@/assets/banner-calendar.jpg";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Race Calendar — гүйгч.mn" },
      { name: "description", content: "Month-by-month calendar of every running race in Mongolia. Tap a race day for details and registration." },
      { property: "og:title", content: "Race Calendar — гүйгч.mn" },
      { property: "og:description", content: "Month-by-month calendar of every running race in Mongolia. Tap a race day for details and registration." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const races = useRaces();
  const { lang } = useLang();
  return (
    <SiteShell>
      <PageBanner
        image={bannerCalendar}
        imageAlt="Dirt road across the Mongolian steppe at dawn"
        index="001"
        label={lang === "mn" ? "ХУАНЛИ" : "CALENDAR"}
        title={lang === "mn" ? "УРАЛДААНЫ ХУАНЛИ" : "RACE CALENDAR"}
        subtitle={
          lang === "mn"
            ? "Монголын бүх уралдаан сар сараар. Өдөр дээр дарж дэлгэрэнгүйг хараарай."
            : "Every race in Mongolia, month by month. Tap a day for details and registration."
        }
      />
      <CalendarGridSection races={races} />
    </SiteShell>
  );
}
