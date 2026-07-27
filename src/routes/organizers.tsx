import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, useRaces } from "@/components/site/shell";
import { OrganizersSection } from "@/components/site/organizers";

export const Route = createFileRoute("/organizers")({
  head: () => ({
    meta: [
      { title: "Race Organizers — гүйгч.mn" },
      { name: "description", content: "Who organizes running races across Mongolia, and which events each of them runs." },
      { property: "og:title", content: "Race Organizers — гүйгч.mn" },
      { property: "og:description", content: "Who organizes running races across Mongolia, and which events each of them runs." },
    ],
  }),
  component: OrganizersPage,
});

function OrganizersPage() {
  const races = useRaces();
  return (
    <SiteShell>
      <OrganizersSection races={races} />
    </SiteShell>
  );
}
