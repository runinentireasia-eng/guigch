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
    <section className="border-b border-frost/15">
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

/* ---------- Manifesto (Plasma Blue section w/ numbered rows) ---------- */
function ManifestoSection() {
  const { t } = useLang();
  const rows: { n: string; labelKey: DictKey; bodyKey: DictKey }[] = [
    { n: "01", labelKey: "m01Label", bodyKey: "m01Body" },
    { n: "02", labelKey: "m02Label", bodyKey: "m02Body" },
    { n: "03", labelKey: "m03Label", bodyKey: "m03Body" },
    { n: "04", labelKey: "m04Label", bodyKey: "m04Body" },
  ];
  return (
    <section className="bg-plasma-blue text-frost">
      <div className="max-w-[1280px] mx-auto px-6 py-[96px] grid lg:grid-cols-[400px_1fr] gap-16">
        <div>
          <div className="text-caption mb-6 opacity-80">— {t("manifestoLabel")}</div>
          <h2 className="text-[40px] leading-[1.2] tracking-[-0.03em] font-[300]">
            {t("manifestoTitle")}
          </h2>
        </div>
        <div className="flex flex-col">
          {rows.map((r) => (
            <div key={r.n}>
              <div className="border-t border-frost/40" />
              <div className="py-8 grid grid-cols-[60px_1fr] gap-6">
                <div className="text-[13px] font-[400] pt-[2px]">{r.n}</div>
                <div>
                  <div className="text-caption mb-4">{t(r.labelKey)}</div>
                  <p className="text-[15px] leading-[1.6] tracking-[0.02em] font-[400] max-w-[560px]">
                    {t(r.bodyKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="border-t border-frost/40" />
        </div>
      </div>
    </section>
  );
}
