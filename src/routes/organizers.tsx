import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, useRaces } from "@/components/site/shell";
import { OrganizersSection } from "@/components/site/organizers";
import { PageBanner } from "@/components/site/page-banner";
import { useLang } from "@/lib/i18n";
import bannerOrganizers from "@/assets/banner-organizers.jpg";

export const Route = createFileRoute("/organizers")({
  head: () => ({
    meta: [
      { title: "Race Organizers — гүйгч.mn" },
      { name: "description", content: "Who organizes running races across Mongolia, and which events each of them runs." },
      { property: "og:title", content: "Race Organizers — гүйгч.mn" },
      { property: "og:description", content: "Who organizes running races across Mongolia, and which events each of them runs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrganizersPage,
});

function OrganizersPage() {
  const races = useRaces();
  const { lang } = useLang();
  return (
    <SiteShell>
      <PageBanner
        image={bannerOrganizers}
        imageAlt="Organizers at a remote race start line at dusk"
        index="002"
        label={lang === "mn" ? "ЗОХИОН БАЙГУУЛАГЧИД" : "ORGANIZERS"}
        title={lang === "mn" ? "ЗОХИОН БАЙГУУЛАГЧИД" : "THE ORGANIZERS"}
        subtitle={
          lang === "mn"
            ? "Монголын уралдаануудыг бүтээж байгаа хүмүүс, клубууд, багууд."
            : "The people, clubs and teams building the Mongolian race season."
        }
      />
      <OrganizersSection races={races} />
    </SiteShell>
  );
}
