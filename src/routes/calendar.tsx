import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, useRaces } from "@/components/site/shell";
import { CalendarGridSection } from "@/components/site/calendar-grid";

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
  return (
    <SiteShell>
      <CalendarGridSection races={races} />
    </SiteShell>
  );
}
