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
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-void-black text-frost">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Runner on the Mongolian steppe"
          className="w-full h-full object-cover opacity-80 grayscale-[20%] scale-105"
          width={1920}
          height={1088}
        />
        {/* Cinematic overlays */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.95) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void-black/40 via-transparent to-void-black" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-5xl text-center">
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up animate-delay-100">
          <div className="h-px w-8 bg-frost/20" />
          <span className="text-caption text-smoke">{t("heroPreLabel")}</span>
          <div className="h-px w-8 bg-frost/20" />
        </div>

        <h1 className="text-[56px] md:text-[90px] lg:text-[120px] leading-[0.95] tracking-[-0.04em] font-[300] mb-8 select-none animate-fade-in-up animate-delay-200 animate-text-shimmer">
          {t("heroMainTitle")}
        </h1>

        <p className="max-w-2xl text-body-aaru text-smoke mb-14 animate-fade-in-up animate-delay-300">
          {t("heroMainSubtitle")}
        </p>

        <div className="group relative inline-flex items-center justify-center animate-fade-in-up animate-delay-400 animate-cta-glow">
          <div className="absolute -inset-px bg-zurkhai/20 blur-sm transition-opacity opacity-0 group-hover:opacity-100" />
          <Link
            to="/calendar"
            className="btn-cta relative px-16 py-6 bg-void-black border border-frost/30 text-frost text-xs uppercase tracking-[0.5em] font-bold transition-all duration-500 hover:border-zurkhai hover:bg-zurkhai hover:text-void-black"
            data-cursor-hover
          >
            <span className="relative z-10">{t("discoverRaces")}</span>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-frost/50 transition-colors duration-300 group-hover:border-void-black/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-frost/50 transition-colors duration-300 group-hover:border-void-black/50" />
          </Link>
        </div>
      </div>

      {/* Peripheral data points */}
      <div className="absolute bottom-12 left-12 hidden lg:block text-[9px] font-mono text-smoke tracking-widest uppercase">
        <div className="mb-1">UB · MGL · 2026</div>
        <div>Live Calendar</div>
      </div>
      <div className="absolute bottom-12 right-12 hidden lg:block text-[9px] font-mono text-smoke tracking-widest uppercase text-right">
        <div className="mb-1">Bilingual</div>
        <div>MN / EN</div>
      </div>
    </section>
  );
}
