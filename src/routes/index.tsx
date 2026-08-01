import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useLang } from "@/lib/i18n";
import type { Race } from "@/lib/races";
import { SiteShell, useRaces } from "@/components/site/shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "гүйгч.mn — Mongolian Race Calendar 2026" },
      { name: "description", content: "Every sanctioned running race in Mongolia: dates, courses, organizers and registration links. Bilingual MN / EN." },
      { property: "og:title", content: "гүйгч.mn — Mongolian Race Calendar 2026" },
      { property: "og:description", content: "Marathons, ultras and trail runs across Mongolia in one calendar." },
    ],
  }),
  component: Index,
});

function Index() {
  const races = useRaces();
  return (
    <SiteShell>
      <Hero races={races} />
    </SiteShell>
  );
}

/* ---------- Hero ---------- */
function Hero({ races }: { races: Race[] }) {
  const { t } = useLang();
  return (
    <section>
      <div className="max-w-[1280px] mx-auto px-6 py-[96px] grid lg:grid-cols-[1fr_400px] gap-16 items-start">
        <div>
          <div className="text-caption text-smoke mb-8">— 2026 УЛИРАЛ / 2026 SEASON</div>
          <h1 className="text-[50px] leading-[1.2] tracking-[-0.025em] font-[300] text-frost max-w-[640px]">
            {t("heroTitle")}
          </h1>
          <p className="mt-8 text-[15px] leading-[1.6] tracking-[0.025em] text-smoke max-w-[520px] font-[400]">
            {t("heroSub")}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              to="/calendar"
              className="bg-reactor-lime text-void-black px-[30px] py-[14px] text-[14px] tracking-[0.04em] uppercase font-[400] hover:opacity-90"
            >
              {t("browseCalendar")}
            </Link>
            <div className="text-caption text-smoke pl-4 border-l border-frost/15">
              {races.length.toString().padStart(2, "0")} · {t("sectionUpcoming")}
            </div>
          </div>
        </div>
            <ParticleField count={races.length} />
      </div>
    </section>
  );
}

function ParticleField({ count }: { count: number }) {
  const dots = useMemo(() => {
    const seed = 1337;
    const rand = (i: number) => {
      const x = Math.sin(seed + i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 220 }, (_, i) => ({
      left: rand(i) * 100,
      top: rand(i + 400) * 100,
      w: rand(i + 800) > 0.85 ? 8 : 2,
      h: 2,
      op: 0.3 + rand(i + 1200) * 0.7,
      lime: rand(i + 1600) > 0.97,
    }));
  }, []);
  return (
    <div className="relative h-[420px] w-full border border-frost/15">
      <div className="absolute top-3 left-3 text-caption text-smoke">FIG. 01 · РАСЕ FIELD</div>
      <div className="absolute bottom-3 right-3 text-caption text-smoke">n = {count}</div>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.w,
            height: d.h,
            background: d.lime ? "#ebfb10" : "#ffffff",
            opacity: d.op,
          }}
        />
      ))}
    </div>
  );
}

