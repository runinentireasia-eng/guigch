import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang, type Lang, type DictKey } from "@/lib/i18n";
import { rowToRace, type Race, type RaceCategory, type RaceRow } from "@/lib/races";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: races = [] } = useQuery({
    queryKey: ["races"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .order("race_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r, i) => rowToRace(r as RaceRow, i));
    },
  });
  return (
    <div className="min-h-screen bg-void-black text-frost font-[300]">
      <AnnouncementBar />
      <Nav />
      <Hero races={races} />
      <ManifestoSection />
      <CalendarGridSection races={races} />
      <Footer />
    </div>
  );
}

/* ---------- Announcement ---------- */
function AnnouncementBar() {
  const { t } = useLang();
  return (
    <div className="w-full bg-reactor-lime text-void-black">
      <div className="max-w-[1280px] mx-auto px-6 h-[40px] flex items-center justify-center gap-6">
        <span className="text-[12px] tracking-[0.08em] uppercase font-[400]">
          {t("announcement")}
        </span>
        <a href="#calendar" className="text-[12px] tracking-[0.08em] uppercase font-[400] underline-offset-4 hover:underline">
          {t("readMore")}
        </a>
      </div>
    </div>
  );
}

/* ---------- Nav ---------- */
function LangToggle() {
  const { lang, setLang } = useLang();
  const opt = (l: Lang, label: string) => (
    <button
      key={l}
      onClick={() => setLang(l)}
      className={`px-2 py-1 text-[11px] tracking-[0.08em] uppercase ${
        lang === l ? "text-void-black bg-frost" : "text-frost hover:text-ash"
      }`}
    >
      {label}
    </button>
  );
  return <div className="inline-flex border border-frost">{opt("mn", "MN")}{opt("en", "EN")}</div>;
}

function Nav() {
  const { t } = useLang();
  return (
    <nav className="border-b border-frost/15 bg-void-black">
      <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DotCluster />
          <span className="text-[16px] font-[400] tracking-[0.02em] lowercase">гүйгч.mn</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#calendar" className="text-[12px] tracking-[0.06em] uppercase text-frost">{t("navCalendar")}</a>
          <a href="#organizers" className="text-[12px] tracking-[0.06em] uppercase text-ash hover:text-frost">{t("navOrganizers")}</a>
          <a href="#results" className="text-[12px] tracking-[0.06em] uppercase text-ash hover:text-frost">{t("navResults")}</a>
        </div>
        <div className="flex items-center gap-3">
          <LangToggle />
          <Link
            to="/auth"
            className="border border-frost text-frost px-6 py-3 text-[12px] tracking-[0.06em] uppercase hover:bg-frost/5"
          >
            {t("logIn")}
          </Link>
          <Link
            to="/admin"
            className="bg-frost text-void-black px-6 py-3 text-[12px] tracking-[0.06em] uppercase hover:opacity-90"
          >
            {t("addRace")}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function DotCluster() {
  return (
    <div className="grid grid-cols-2 gap-[3px]">
      <span className="size-[6px] bg-frost" />
      <span className="size-[6px] bg-frost" />
      <span className="size-[6px] bg-frost" />
      <span className="size-[6px] bg-reactor-lime" />
    </div>
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
            <a
              href="#calendar"
              className="bg-reactor-lime text-void-black px-[30px] py-[14px] text-[14px] tracking-[0.04em] uppercase font-[400] hover:opacity-90"
            >
              {t("browseCalendar")}
            </a>
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

/* ---------- Calendar / Race list ---------- */
const catKeys: Record<RaceCategory | "all", DictKey> = {
  all: "filterAll",
  road: "filterRoad",
  trail: "filterTrail",
  ultra: "filterUltra",
  fun: "filterFun",
};

/* ---------- Calendar Grid (month view) ---------- */
function CalendarGridSection({ races }: { races: Race[] }) {
  const { t, lang } = useLang();
  const today = useMemo(() => new Date(), []);
  const firstRaceMonth = useMemo(() => {
    const upcoming = races
      .map((r) => new Date(r.dateISO + "T00:00:00"))
      .filter((d) => d.getTime() >= new Date(today.toDateString()).getTime())
      .sort((a, b) => a.getTime() - b.getTime())[0];
    const base = upcoming ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [races, today]);

  const [cursor, setCursor] = useState<Date>(firstRaceMonth);
  useEffect(() => setCursor(firstRaceMonth), [firstRaceMonth]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthNames = t("monthNames").split("_");
  const weekdays = t("weekdayShort").split("_");

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const racesByDay = useMemo(() => {
    const map = new Map<number, Race[]>();
    for (const r of races) {
      const d = new Date(r.dateISO + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const arr = map.get(day) ?? [];
        arr.push(r);
        map.set(day, arr);
      }
    }
    return map;
  }, [races, year, month]);

  const monthRaces = useMemo(
    () =>
      races
        .filter((r) => {
          const d = new Date(r.dateISO + "T00:00:00");
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [races, year, month],
  );

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta: number) =>
    setCursor(new Date(year, month + delta, 1));

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <section id="calendar" className="bg-void-black border-t border-frost/15">
      <div className="max-w-[1280px] mx-auto px-6 py-[96px]">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="text-caption text-smoke mb-4">— {t("sectionCalendarLabel")}</div>
            <h2 className="text-[40px] leading-[1.2] tracking-[-0.03em] font-[300] max-w-[560px]">
              {t("sectionCalendarTitle")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              className="px-4 py-2 text-[12px] tracking-[0.06em] uppercase border border-frost/30 text-ash hover:text-frost hover:border-frost"
            >
              ← {t("prevMonth")}
            </button>
            <button
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-4 py-2 text-[12px] tracking-[0.06em] uppercase border border-frost/30 text-ash hover:text-frost hover:border-frost"
            >
              {t("today")}
            </button>
            <button
              onClick={() => shiftMonth(1)}
              className="px-4 py-2 text-[12px] tracking-[0.06em] uppercase border border-frost/30 text-ash hover:text-frost hover:border-frost"
            >
              {t("nextMonth")} →
            </button>
          </div>
        </div>

        <div className="border border-frost/15">
          <div className="flex items-center justify-between px-4 py-4 border-b border-frost/15">
            <button
              aria-label={t("prevMonth")}
              onClick={() => shiftMonth(-1)}
              className="size-9 flex items-center justify-center border border-frost/30 text-frost text-[16px] hover:bg-reactor-lime hover:text-void-black hover:border-reactor-lime"
            >
              ←
            </button>
            <div className="flex flex-col items-center">
              <div className="text-[20px] tracking-[-0.02em] font-[300]">
                {monthNames[month]} · {year}
              </div>
              <div className="text-caption text-smoke mt-1">
                n = {monthRaces.length.toString().padStart(2, "0")}
              </div>
            </div>
            <button
              aria-label={t("nextMonth")}
              onClick={() => shiftMonth(1)}
              className="size-9 flex items-center justify-center border border-frost/30 text-frost text-[16px] hover:bg-reactor-lime hover:text-void-black hover:border-reactor-lime"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-frost/15">
            {weekdays.map((w) => (
              <div key={w} className="text-caption text-smoke px-3 py-2 border-l border-frost/15 first:border-l-0">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayRaces = day ? racesByDay.get(day) ?? [] : [];
              const has = dayRaces.length > 0;
              return (
                <div
                  key={i}
                  className={`min-h-[92px] text-left p-3 border-l border-t border-frost/15 first:border-l-0 [&:nth-child(7n+1)]:border-l-0 relative ${
                    has ? "hover:bg-graphite/60" : ""
                  }`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-[15px] font-[300] tracking-[-0.02em] ${
                          isToday(day) ? "text-reactor-lime" : has ? "text-frost" : "text-smoke"
                        }`}
                      >
                        {String(day).padStart(2, "0")}
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        {dayRaces.slice(0, 2).map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedRace(r)}
                            className="text-[10px] tracking-[0.06em] uppercase text-void-black bg-reactor-lime px-1.5 py-[2px] truncate text-left hover:bg-frost transition-colors"
                          >
                            {lang === "mn" ? r.nameMn : r.nameEn}
                          </button>
                        ))}
                        {dayRaces.length > 2 && (
                          <button
                            onClick={() => setSelectedRace(dayRaces[0])}
                            className="text-caption text-smoke text-left hover:text-frost"
                          >
                            +{dayRaces.length - 2}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedRace && (
        <RacePopup
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}
    </section>
  );
}

function RacePopup({ race, onClose }: { race: Race; onClose: () => void }) {
  const { t, lang } = useLang();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 py-8 bg-void-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("eventDetails")}
    >
      <div
        className="w-full max-w-[520px] border border-frost/15 bg-void-black p-6 sm:p-8 shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="text-caption text-smoke">
            {lang === "mn" ? race.monthMn : race.monthEn} · {race.day} · {race.year}
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center border border-frost/30 text-frost text-[14px] hover:bg-reactor-lime hover:text-void-black hover:border-reactor-lime"
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>
        <h3 className="text-[24px] leading-[1.25] tracking-[-0.02em] font-[400] text-frost mt-4">
          {lang === "mn" ? race.nameMn : race.nameEn}
        </h3>
        <div className="text-[13px] tracking-[0.02em] text-ash mt-3">
          {lang === "mn" ? race.locationMn : race.locationEn}
        </div>
        <div className="text-[13px] tracking-[0.02em] text-slate mt-1">
          {lang === "mn" ? race.organizerMn : race.organizerEn}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {race.distances.map((d) => (
            <span key={d} className="text-caption border border-frost/30 px-2 py-1 text-frost">
              {d}
            </span>
          ))}
        </div>
        <p className="text-[14px] leading-[1.6] text-ash mt-5 font-[400]">
          {lang === "mn" ? race.descriptionMn : race.descriptionEn}
        </p>
        <a
          href={race.registerUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block bg-reactor-lime text-void-black px-[24px] py-[12px] text-[13px] tracking-[0.04em] uppercase font-[400] text-center hover:opacity-90"
        >
          {t("register")} →
        </a>
      </div>
    </div>
  );
}

function CalendarSection({ races }: { races: Race[] }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<RaceCategory | "all">("all");

  const filtered = useMemo(
    () =>
      races
        .filter((r) => (filter === "all" ? true : r.category === filter))
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [filter, races],
  );

  return (
    <section id="calendar" className="bg-void-black border-t border-frost/15">
      <div className="max-w-[1280px] mx-auto px-6 py-[96px]">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="text-caption text-smoke mb-4">— {t("sectionUpcoming")}</div>
            <h2 className="text-[40px] leading-[1.2] tracking-[-0.03em] font-[300] max-w-[560px]">
              {t("sectionSummary")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(catKeys) as (RaceCategory | "all")[]).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 text-[12px] tracking-[0.06em] uppercase border ${
                  filter === c
                    ? "border-reactor-lime bg-reactor-lime text-void-black"
                    : "border-frost/30 text-ash hover:text-frost hover:border-frost"
                }`}
              >
                {t(catKeys[c])}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <RaceHeaderRow />
          {filtered.map((race) => (
            <RaceRow key={race.id} race={race} lang={lang} />
          ))}
          <div className="border-t border-frost/15" />
        </div>
      </div>
    </section>
  );
}

function RaceHeaderRow() {
  const { t } = useLang();
  return (
    <>
      <div className="border-t border-frost/40" />
      <div className="hidden md:grid grid-cols-[100px_1fr_180px_180px_140px] gap-6 py-4 text-caption text-smoke">
        <div>DATE</div>
        <div>RACE / {t("organizer")}</div>
        <div>{t("location")}</div>
        <div>{t("distances")}</div>
        <div className="text-right">{t("status")}</div>
      </div>
    </>
  );
}

function RaceRow({ race, lang }: { race: Race; lang: Lang }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const statusMap = {
    open: { label: t("open"), color: "text-reactor-lime" },
    closing_soon: { label: t("closingSoon"), color: "text-frost" },
    waitlist: { label: t("waitlist"), color: "text-ash" },
  } as const;
  const status = statusMap[race.status];

  return (
    <div className="border-t border-frost/15 group">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left py-6 grid grid-cols-[1fr] md:grid-cols-[100px_1fr_180px_180px_140px] gap-6 items-start hover:bg-graphite/60 transition-colors px-2 -mx-2"
      >
        <div className="flex flex-col">
          <span className="text-caption text-smoke">
            {lang === "mn" ? race.monthMn : race.monthEn} · {race.year}
          </span>
          <span className="text-[34px] font-[300] tracking-[-0.025em] leading-none mt-1">
            {race.day}
          </span>
        </div>

        <div>
          <div className="text-caption text-smoke mb-1">
            {race.index} · {t(catKeys[race.category])}
          </div>
          <h3 className="text-[20px] leading-[1.25] tracking-[-0.02em] font-[400] text-frost">
            {lang === "mn" ? race.nameMn : race.nameEn}
          </h3>
          <div className="text-[13px] tracking-[0.02em] text-slate mt-2">
            {lang === "mn" ? race.organizerMn : race.organizerEn}
          </div>
        </div>

        <div className="text-[13px] tracking-[0.02em] text-ash leading-[1.5]">
          {lang === "mn" ? race.locationMn : race.locationEn}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {race.distances.map((d) => (
            <span key={d} className="text-caption border border-frost/30 px-2 py-1 text-frost">
              {d}
            </span>
          ))}
        </div>

        <div className={`text-caption text-right ${status.color}`}>● {status.label}</div>
      </button>

      {open && (
        <div className="pb-8 grid grid-cols-1 md:grid-cols-[100px_1fr_320px] gap-6 items-start px-2 -mx-2">
          <div />
          <p className="text-[15px] leading-[1.6] tracking-[0.02em] text-ash max-w-[560px] font-[400]">
            {lang === "mn" ? race.descriptionMn : race.descriptionEn}
          </p>
          <a
            href={race.registerUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-reactor-lime text-void-black px-[30px] py-[14px] text-[14px] tracking-[0.04em] uppercase font-[400] text-center hover:opacity-90"
          >
            {t("register")} →
          </a>
        </div>
      )}
    </div>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-frost/15 bg-void-black">
      <div className="max-w-[1280px] mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <DotCluster />
            <span className="text-[16px] font-[400] lowercase">гүйгч.mn</span>
          </div>
          <p className="mt-6 text-[13px] tracking-[0.02em] text-smoke max-w-[320px] font-[400]">
            {t("footerRights")}
          </p>
        </div>
        <div>
          <div className="text-caption text-smoke mb-4">CALENDAR</div>
          <ul className="space-y-2">
            <li><a href="#calendar" className="text-[13px] text-ash hover:text-frost">{t("navCalendar")}</a></li>
            <li><a href="#organizers" className="text-[13px] text-ash hover:text-frost">{t("navOrganizers")}</a></li>
            <li><a href="#results" className="text-[13px] text-ash hover:text-frost">{t("navResults")}</a></li>
          </ul>
        </div>
        <div>
          <div className="text-caption text-smoke mb-4">CONTACT</div>
          <ul className="space-y-2">
            <li><a href="mailto:hi@guygch.mn" className="text-[13px] text-ash hover:text-frost">hi@guygch.mn</a></li>
            <li><a href="#" className="text-[13px] text-ash hover:text-frost">Instagram</a></li>
            <li><a href="#" className="text-[13px] text-ash hover:text-frost">Strava Club</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
