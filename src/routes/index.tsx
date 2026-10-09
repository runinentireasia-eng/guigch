import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { SiteShell } from "@/components/site/shell";
import heroImage from "@/assets/hero-mongolia.jpg";
import { BeamSurface } from "@/components/ui/beam-surface";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "гүйгч.mn — Mongolian Race Calendar 2026" },
      { name: "description", content: "Every sanctioned running race in Mongolia: dates, courses, organizers and registration links. Bilingual MN / EN." },
      { property: "og:title", content: "гүйгч.mn — Mongolian Race Calendar 2026" },
      { property: "og:description", content: "Marathons, ultras and trail runs across Mongolia in one calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <Hero />
    </SiteShell>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <BeamSurface className="beam-hero w-full flex items-end text-foreground">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Runner on the Mongolian steppe"
          className="beam-hero-image w-full h-full object-cover"
          width={1920}
          height={1088}
        />
        <div className="beam-hero-overlay absolute inset-0" />
      </div>

      {/* Main content */}
      <div className="beam-hero-content w-full max-w-[1280px] mx-auto px-6 pb-16 md:pb-20">
        <h1 className="max-w-4xl text-[42px] md:text-[76px] lg:text-[92px] leading-[1.05] font-[500] mb-5">
          {t("heroMainTitle")}
        </h1>
        <p className="max-w-xl text-[15px] leading-6 text-ash mb-8">
          {t("heroMainSubtitle")}
        </p>
        <div className="inline-flex">
          <Button variant="beam" size="lg" className="h-12 px-6 text-[13px]" asChild>
            <Link to="/calendar">{t("discoverRaces")}<ArrowUpRight /></Link>
          </Button>
        </div>
      </div>
    </BeamSurface>
  );
}
