import { useEffect, useMemo, useState } from "react";
import { CalendarDays, List as ListIcon, ArrowRight, Bookmark } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { VerifiedBadge } from "./form-ui";
import type { Race } from "@/lib/races";

const SAVED_KEY = "guigch.saved-races";

function useSavedRaces() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  const toggle = (id: string) =>
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  return { saved, toggle };
}

/* ---------- Calendar Grid (month view) ---------- */
export function CalendarGridSection({ races }: { races: Race[] }) {
  const { t, lang } = useLang();
  const [view, setView] = useState<"calendar" | "list">("calendar");
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
    <section id="calendar" className="bg-void-black border-t border-frost/15 scroll-mt-24">
      <div className="max-w-[1280px] mx-auto px-6 py-[96px]">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="text-caption text-smoke mb-4">— {t("sectionCalendarLabel")}</div>
            <h2 className="text-[40px] leading-[1.2] tracking-[-0.03em] font-[300] max-w-[560px]">
              {t("sectionCalendarTitle")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex border border-frost/30 mr-2">
              <button
                onClick={() => setView("calendar")}
                aria-pressed={view === "calendar"}
                className={`inline-flex items-center gap-2 px-4 py-2 text-[12px] tracking-[0.06em] uppercase ${
                  view === "calendar" ? "bg-reactor-lime text-void-black" : "text-ash hover:text-frost"
                }`}
              >
                <CalendarDays size={14} strokeWidth={1.5} /> {t("viewCalendar")}
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                className={`inline-flex items-center gap-2 px-4 py-2 text-[12px] tracking-[0.06em] uppercase border-l border-frost/30 ${
                  view === "list" ? "bg-reactor-lime text-void-black" : "text-ash hover:text-frost"
                }`}
              >
                <ListIcon size={14} strokeWidth={1.5} /> {t("viewList")}
              </button>
            </div>
          </div>
        </div>

        {view === "list" ? (
          <RaceListView races={races} onSelect={setSelectedRace} />
        ) : (
        <div className="border border-frost/15">
          <div className="flex items-center justify-between px-4 py-4 border-b border-frost/15 gap-3">
            <button
              aria-label={t("prevMonth")}
              onClick={() => shiftMonth(-1)}
              className="shrink-0 size-9 flex items-center justify-center border border-frost/30 text-frost text-[16px] hover:bg-reactor-lime hover:text-void-black hover:border-reactor-lime"
            >
              ←
            </button>
            <div className="flex flex-col items-center min-w-0">
              <div className="flex items-center gap-2">
                <select
                  aria-label={t("month")}
                  value={month}
                  onChange={(e) => setCursor(new Date(year, Number(e.target.value), 1))}
                  className="bg-transparent border border-frost/30 text-frost text-[12px] tracking-[0.06em] uppercase px-3 py-2 cursor-pointer hover:border-frost focus:outline-none focus:border-reactor-lime"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx} className="bg-void-black text-frost">
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t("year")}
                  value={year}
                  onChange={(e) => setCursor(new Date(Number(e.target.value), month, 1))}
                  className="bg-transparent border border-frost/30 text-frost text-[12px] tracking-[0.06em] uppercase px-3 py-2 cursor-pointer hover:border-frost focus:outline-none focus:border-reactor-lime"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} className="bg-void-black text-frost">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-caption text-smoke mt-1">
                n = {monthRaces.length.toString().padStart(2, "0")}
              </div>
            </div>
            <button
              aria-label={t("nextMonth")}
              onClick={() => shiftMonth(1)}
              className="shrink-0 size-9 flex items-center justify-center border border-frost/30 text-frost text-[16px] hover:bg-reactor-lime hover:text-void-black hover:border-reactor-lime"
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
        )}
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
  return <RacePopupInner race={race} onClose={onClose} />;
}

/* ---------- List view (chronological, grouped by month) ---------- */
function RaceListView({ races, onSelect }: { races: Race[]; onSelect: (r: Race) => void }) {
  const { t, lang } = useLang();
  const { saved, toggle } = useSavedRaces();
  const monthNames = t("monthNames").split("_");
  const weekdays = t("weekdayShort").split("_");

  const groups = useMemo(() => {
    const sorted = [...races].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const map = new Map<string, Race[]>();
    for (const r of sorted) {
      const d = new Date(r.dateISO + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [races]);

  const statusLabel = (s: Race["status"]) =>
    s === "open" ? t("open") : s === "closing_soon" ? t("closingSoon") : t("waitlist");
  const typeLabel = (c: Race["category"]) =>
    c === "road" ? t("filterRoad") : c === "trail" ? t("filterTrail") : c === "ultra" ? t("filterUltra") : t("filterFun");

  if (groups.length === 0) {
    return <div className="border border-frost/15 px-6 py-10 text-[14px] text-smoke">{t("noRacesList")}</div>;
  }

  return (
    <div className="border-t border-frost/25">
      {groups.map(([key, items]) => {
        const [y, m] = key.split("-").map(Number);
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between border-b border-frost/25 px-1 py-3">
              <div className="text-[13px] tracking-[0.08em] uppercase text-frost">
                {monthNames[m]} · {y}
              </div>
              <div className="text-caption text-smoke font-mono">n = {String(items.length).padStart(2, "0")}</div>
            </div>
            {items.map((r) => {
              const d = new Date(r.dateISO + "T00:00:00");
              const wd = weekdays[(d.getDay() + 6) % 7];
              const isSaved = saved.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="group grid grid-cols-1 md:grid-cols-[130px_1fr_auto] gap-4 md:gap-8 items-start px-1 py-6 border-b border-frost/15 transition-colors hover:bg-graphite/50"
                >
                  <div className="flex md:block items-baseline gap-3">
                    <div className="font-mono text-[40px] leading-[1] tracking-[-0.04em] text-frost transition-colors group-hover:text-reactor-lime">
                      {String(d.getDate()).padStart(2, "0")}
                    </div>
                    <div className="text-caption text-smoke mt-2 uppercase">{wd}</div>
                  </div>

                  <div className="min-w-0">
                    <button
                      onClick={() => onSelect(r)}
                      className="text-left text-[20px] leading-[1.25] tracking-[-0.02em] font-[400] text-frost hover:text-reactor-lime"
                    >
                      {lang === "mn" ? r.nameMn : r.nameEn}
                    </button>
                    <div className="text-[13px] tracking-[0.02em] text-ash mt-1">
                      {lang === "mn" ? r.locationMn : r.locationEn}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {r.distances.map((dist) => (
                        <span key={dist} className="font-mono text-caption border border-frost/30 px-2 py-1 text-frost">
                          {dist}
                        </span>
                      ))}
                      <span className="text-caption border border-frost/20 px-2 py-1 text-smoke uppercase">
                        {t("raceType")} / {typeLabel(r.category)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <span
                        className={`text-caption uppercase ${
                          r.status === "open" ? "text-reactor-lime" : r.status === "closing_soon" ? "text-plasma-blue" : "text-smoke"
                        }`}
                      >
                        ● {statusLabel(r.status)}
                      </span>
                      <span className="text-caption text-smoke uppercase">
                        {t("regDeadline")} <span className="font-mono text-ash">{t("tba")}</span>
                      </span>
                      {r.ownerId && <VerifiedBadge />}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(r.id)}
                      aria-pressed={isSaved}
                      className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] tracking-[0.06em] uppercase border ${
                        isSaved
                          ? "border-reactor-lime text-reactor-lime"
                          : "border-frost/30 text-ash hover:text-frost hover:border-frost"
                      }`}
                    >
                      <Bookmark size={13} strokeWidth={1.5} fill={isSaved ? "currentColor" : "none"} />
                      {isSaved ? t("savedRace") : t("saveRace")}
                    </button>
                    <button
                      onClick={() => onSelect(r)}
                      aria-label={t("eventDetails")}
                      className="size-9 flex items-center justify-center border border-frost/30 text-frost hover:bg-reactor-lime hover:text-void-black hover:border-reactor-lime transition-transform group-hover:translate-x-0.5"
                    >
                      <ArrowRight size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function RacePopupInner({ race, onClose }: { race: Race; onClose: () => void }) {
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
