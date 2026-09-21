import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { SiteShell } from "@/components/site/shell";
import heroImage from "@/assets/hero-mongolia.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "гүйгч.mn — Mongolian Race Calendar 2026" },
      { name: "description", content: "Every sanctioned running race in Mongolia: dates, courses, organizers and registration links. Bilingual MN / EN." },
      { property: "og:title", content: "гүйгч.mn — Mongolian Race Calendar 2026" },
      { property: "og:description", content: "Marathons, ultras and trail runs across Mongolia in one calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://guigch.lovable.app/assets/hero-mongolia.jpg" },
      { name: "twitter:image", content: "https://guigch.lovable.app/assets/hero-mongolia.jpg" },
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
    <section className="relative min-h-[calc(100svh-60px)] w-full flex items-end overflow-hidden bg-void-black text-frost">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Runner on the Mongolian steppe"
          className="w-full h-full object-cover opacity-70 grayscale-[15%]"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/45 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 pb-16 md:pb-20">
        <h1 className="max-w-4xl text-[46px] md:text-[76px] lg:text-[92px] leading-[0.98] font-[400] mb-5">
          {t("heroMainTitle")}
        </h1>
        <p className="max-w-xl text-[15px] leading-6 text-ash mb-8">
          {t("heroMainSubtitle")}
        </p>
        <div className="inline-flex">
          <Link
            to="/calendar"
            className="inline-flex bg-zurkhai px-7 py-3.5 text-[13px] font-[500] text-void-black transition-colors hover:bg-frost"
          >
            {t("discoverRaces")}
          </Link>
        </div>
      </div>
    </section>
  );
}
