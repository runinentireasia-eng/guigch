import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, List as ListIcon, ArrowRight, Bookmark, MapPin, Download, Scale, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { downloadIcs, googleCalendarUrl } from "@/lib/ics";
import { RaceCompareTable } from "./race-compare";
import { useIsMobile } from "@/hooks/use-mobile";
import { PullToRefresh } from "./pull-to-refresh";
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
  const queryClient = useQueryClient();
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
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const compareRaces = useMemo(
    () => compareIds.map((id) => races.find((r) => r.id === id)).filter(Boolean) as Race[],
    [compareIds, races],
  );
  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id],
    );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [focusDay, setFocusDay] = useState<number>(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const returnDayRef = useRef<number | null>(null);

  const openRace = (race: Race, day?: number) => {
    returnFocusRef.current =
      typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
    returnDayRef.current = day ?? null;
    setSelectedRace(race);
  };

  const closeRace = () => {
    setSelectedRace(null);
    const prev = returnFocusRef.current;
    const day = returnDayRef.current;
    returnFocusRef.current = null;
    returnDayRef.current = null;
    requestAnimationFrame(() => {
      if (prev && document.contains(prev)) {
        prev.focus();
        return;
      }
      const cell =
        day != null
          ? gridRef.current?.querySelector<HTMLElement>(`[data-day="${day}"]`)
          : null;
      cell?.focus();
    });
  };
  useEffect(() => {
    setSelectedDay(null);
    setFocusDay(1);
  }, [cursor]);

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

  const yearOptions = useMemo(() => {
    const raceYears = races.map((r) => new Date(r.dateISO + "T00:00:00").getFullYear());
    const min = Math.min(...raceYears, today.getFullYear() - 1);
    const max = Math.max(...raceYears, today.getFullYear() + 2);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [races, today]);

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

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-day="${focusDay}"]`);
    el?.focus();
  }, [focusDay, year, month]);

  const moveFocus = (delta: number) => {
    const next = focusDay + delta;
    if (next < 1) {
      const prevMonthDays = new Date(year, month, 0).getDate();
      shiftMonth(-1);
      pendingFocus.current = true;
      setFocusDay(prevMonthDays + next);
      return;
    }
    if (next > daysInMonth) {
      shiftMonth(1);
      pendingFocus.current = true;
      setFocusDay(next - daysInMonth);
      return;
    }
    pendingFocus.current = true;
    setFocusDay(next);
  };

  const onCellKeyDown = (e: React.KeyboardEvent, day: number) => {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    if (e.key in keys) {
      e.preventDefault();
      moveFocus(keys[e.key]);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      pendingFocus.current = true;
      setFocusDay(1);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      pendingFocus.current = true;
      setFocusDay(daysInMonth);
      return;
    }
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      shiftMonth(e.key === "PageUp" ? -1 : 1);
      pendingFocus.current = true;
      setFocusDay(1);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedDay(day);
      const dayRaces = racesByDay.get(day);
      if (dayRaces?.length) openRace(dayRaces[0], day);
    }
  };

  return (
    <section id="calendar" className="bg-void-black scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="inline-flex border border-frost/20">
              <button
                onClick={() => setView("calendar")}
                aria-pressed={view === "calendar"}
                className={`inline-flex items-center gap-2 px-3 py-2 text-[12px] ${
                  view === "calendar" ? "bg-zurkhai text-void-black" : "text-ash hover:text-frost"
                }`}
              >
                <CalendarDays size={14} strokeWidth={1.5} /> {t("viewCalendar")}
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                className={`inline-flex items-center gap-2 px-3 py-2 text-[12px] border-l border-frost/20 ${
                  view === "list" ? "bg-zurkhai text-void-black" : "text-ash hover:text-frost"
                }`}
              >
                <ListIcon size={14} strokeWidth={1.5} /> {t("viewList")}
              </button>
          </div>
          <button
            onClick={() => downloadIcs(races, lang)}
            aria-label={t("exportAll")}
            title={t("exportAll")}
            className="inline-flex size-9 items-center justify-center border border-frost/20 text-ash hover:border-zurkhai hover:text-zurkhai"
          >
            <Download size={15} strokeWidth={1.5} />
          </button>
        </div>

        <PullToRefresh
          onRefresh={() => queryClient.refetchQueries({ queryKey: ["races"] })}
        >
        {view === "list" ? (
          <RaceListView
            races={races}
            onSelect={(r) => openRace(r)}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
          />
        ) : (
        <div className="border border-frost/15">
          <div className="flex items-center justify-between px-3 py-3 border-b border-frost/15 gap-3">
            <button
              aria-label={t("prevMonth")}
              onClick={() => shiftMonth(-1)}
              className="shrink-0 size-9 flex items-center justify-center text-ash hover:text-frost"
            >
              ←
            </button>
            <div className="flex flex-col items-center min-w-0">
              <div className="flex items-center gap-2">
                <select
                  aria-label={t("month")}
                  value={month}
                  onChange={(e) => setCursor(new Date(year, Number(e.target.value), 1))}
                  className="bg-transparent border border-frost/20 text-frost text-[12px] px-3 py-2 cursor-pointer focus:outline-none focus:border-zurkhai"
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
                  className="bg-transparent border border-frost/20 text-frost text-[12px] px-3 py-2 cursor-pointer focus:outline-none focus:border-zurkhai"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} className="bg-void-black text-frost">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              aria-label={t("nextMonth")}
              onClick={() => shiftMonth(1)}
              className="shrink-0 size-9 flex items-center justify-center text-ash hover:text-frost"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-frost/15">
            {weekdays.map((w) => (
              <div key={w} className="text-[11px] text-smoke px-2 py-2 border-l border-frost/15 first:border-l-0">
                {w}
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-7"
            role="grid"
            aria-label={`${monthNames[month]} ${year}`}
            ref={gridRef}
          >
            {cells.map((day, i) => {
              const dayRaces = day ? racesByDay.get(day) ?? [] : [];
              const has = dayRaces.length > 0;
              if (!day) {
                return (
                  <div
                    key={i}
                    aria-hidden="true"
                    className="min-h-[76px] md:min-h-[92px] p-2 border-l border-t border-frost/15 first:border-l-0 [&:nth-child(7n+1)]:border-l-0"
                  />
                );
              }
              const isSelected = selectedDay === day;
              return (
                <div
                  key={i}
                  role="gridcell"
                  tabIndex={focusDay === day ? 0 : -1}
                  data-day={day}
                  aria-selected={isSelected}
                  aria-current={isToday(day) ? "date" : undefined}
                  aria-label={`${String(day).padStart(2, "0")} ${monthNames[month]} ${year}${
                    has ? ` — ${dayRaces.length}` : ""
                  }`}
                  onClick={() => setSelectedDay(day)}
                  onKeyDown={(e) => onCellKeyDown(e, day)}
                  className={`group min-h-[76px] md:min-h-[92px] text-left p-2 border-l border-t border-frost/15 first:border-l-0 [&:nth-child(7n+1)]:border-l-0 relative cursor-pointer outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zurkhai focus-visible:ring-inset ${
                    isSelected
                      ? "bg-zurkhai/10"
                      : has
                        ? "hover:bg-graphite/60"
                        : "hover:bg-graphite/30"
                  }`}
                >
                  <>
                      <div
                        className={`text-[15px] font-[300] tracking-[-0.02em] transition-colors duration-300 ${
                          isToday(day) || isSelected ? "text-zurkhai" : has ? "text-frost" : "text-smoke"
                        }`}
                      >
                        {String(day).padStart(2, "0")}
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        {dayRaces.slice(0, 2).map((r) => (
                          <button
                            key={r.id}
                            tabIndex={-1}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDay(day);
                              openRace(r, day);
                            }}
                            className="w-full text-[10px] text-void-black bg-zurkhai px-1.5 py-1 truncate text-left hover:bg-frost"
                          >
                            {lang === "mn" ? r.nameMn : r.nameEn}
                          </button>
                        ))}
                        {dayRaces.length > 2 && (
                          <button
                            tabIndex={-1}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDay(day);
                              openRace(dayRaces[0], day);
                            }}
                            className="text-caption text-smoke text-left hover:text-frost"
                          >
                            +{dayRaces.length - 2}
                          </button>
                        )}
                      </div>
                  </>
                </div>
              );
            })}
          </div>
        </div>
        )}
        </PullToRefresh>

        {compareIds.length > 0 && (
          <RaceCompareTable
            races={compareRaces}
            onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
            onClear={() => setCompareIds([])}
          />
        )}
      </div>

      {selectedRace && (
        <RacePopup
          race={selectedRace}
          onClose={closeRace}
        />
      )}
    </section>
  );
}

function RacePopup({ race, onClose }: { race: Race; onClose: () => void }) {
  return <RacePopupInner race={race} onClose={onClose} />;
}

/* ---------- List view (chronological, grouped by month) ---------- */
function RaceListView({
  races,
  onSelect,
  compareIds,
  onToggleCompare,
}: {
  races: Race[];
  onSelect: (r: Race) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}) {
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

  if (groups.length === 0) {
    return <div className="border border-zurkhai/20 px-6 py-10 text-[14px] text-smoke">{t("noRacesList")}</div>;
  }

  return (
    <div className="border-t border-frost/25">
      {groups.map(([key, items]) => {
        const [y, m] = key.split("-").map(Number);
        return (
          <div key={key}>
            <div className="flex items-baseline border-b border-frost/25 px-1 py-3">
              <div className="text-[13px] tracking-[0.08em] uppercase text-frost">
                {monthNames[m]} · {y}
              </div>
            </div>
            {items.map((r) => {
              const d = new Date(r.dateISO + "T00:00:00");
              const wd = weekdays[(d.getDay() + 6) % 7];
              const isSaved = saved.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="group grid grid-cols-1 md:grid-cols-[130px_1fr_auto] gap-4 md:gap-8 items-start mt-4 border border-zurkhai/25 p-4 md:mt-0 md:border-0 md:border-b md:border-zurkhai/20 md:px-1 md:py-6 transition-colors hover:bg-graphite/50"
                >
                  <div className="flex md:block items-baseline gap-3 min-w-0">
                    <div className="font-mono text-[40px] leading-[1] tracking-[-0.04em] text-frost transition-colors group-hover:text-zurkhai">
                      {String(d.getDate()).padStart(2, "0")}
                    </div>
                    <div className="text-caption text-smoke md:mt-2 uppercase">{wd}</div>
                    <div className="md:hidden ml-auto shrink-0">
                      {r.ownerId && <VerifiedBadge />}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <button
                      onClick={() => onSelect(r)}
                      className="text-left text-[20px] leading-[1.25] tracking-[-0.02em] font-[400] text-frost hover:text-zurkhai"
                    >
                      {lang === "mn" ? r.nameMn : r.nameEn}
                    </button>
                    <div className="flex items-center gap-1.5 text-[13px] tracking-[0.02em] text-ash mt-1">
                      <MapPin size={12} strokeWidth={1.5} className="shrink-0 text-smoke md:hidden" />
                      <span className="truncate">{lang === "mn" ? r.locationMn : r.locationEn}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {r.distances.map((dist) => (
                        <span key={dist} className="font-mono text-[11px] text-ash">
                          {dist}
                        </span>
                      ))}
                      <span className="hidden md:inline">{r.ownerId && <VerifiedBadge />}</span>
                    </div>
                  </div>

                  {/* Mobile: one-tap save / register */}
                  <div className="grid grid-cols-2 gap-2 md:hidden">
                    <button
                      onClick={() => onToggleCompare(r.id)}
                      aria-pressed={compareIds.includes(r.id)}
                       className={`col-span-2 inline-flex items-center justify-center gap-2 px-3 py-3 text-[11px] border ${
                        compareIds.includes(r.id) ? "border-zurkhai text-zurkhai" : "border-frost/30 text-ash"
                      }`}
                    >
                      {compareIds.includes(r.id) ? <Check size={14} strokeWidth={1.5} /> : <Scale size={14} strokeWidth={1.5} />}
                      {compareIds.includes(r.id) ? t("inCompare") : t("addToCompare")}
                    </button>
                    <button
                      onClick={() => toggle(r.id)}
                      aria-pressed={isSaved}
                       className={`inline-flex items-center justify-center gap-2 px-3 py-3 text-[11px] border ${
                        isSaved ? "border-zurkhai text-zurkhai" : "border-frost/30 text-ash"
                      }`}
                    >
                      <Bookmark size={14} strokeWidth={1.5} fill={isSaved ? "currentColor" : "none"} />
                      {isSaved ? t("savedRace") : t("saveRace")}
                    </button>
                    <a
                      href={r.registerUrl}
                      target="_blank"
                      rel="noreferrer"
                       className="inline-flex items-center justify-center gap-2 bg-zurkhai text-void-black px-3 py-3 text-[11px]"
                    >
                      {t("register")} <ArrowRight size={14} strokeWidth={1.5} />
                    </a>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={() => onToggleCompare(r.id)}
                      aria-pressed={compareIds.includes(r.id)}
                       className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] border ${
                        compareIds.includes(r.id)
                          ? "border-zurkhai text-zurkhai"
                          : "border-frost/30 text-ash hover:text-frost hover:border-frost"
                      }`}
                    >
                      {compareIds.includes(r.id) ? (
                        <Check size={13} strokeWidth={1.5} />
                      ) : (
                        <Scale size={13} strokeWidth={1.5} />
                      )}
                      {compareIds.includes(r.id) ? t("inCompare") : t("addToCompare")}
                    </button>
                    <button
                      onClick={() => toggle(r.id)}
                      aria-pressed={isSaved}
                       className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] border ${
                        isSaved
                          ? "border-zurkhai text-zurkhai"
                          : "border-frost/30 text-ash hover:text-frost hover:border-frost"
                      }`}
                    >
                      <Bookmark size={13} strokeWidth={1.5} fill={isSaved ? "currentColor" : "none"} />
                      {isSaved ? t("savedRace") : t("saveRace")}
                    </button>
                    <button
                      onClick={() => onSelect(r)}
                      aria-label={t("eventDetails")}
                      className="size-9 flex items-center justify-center border border-frost/30 text-frost hover:bg-zurkhai hover:text-void-black hover:border-zurkhai transition-transform group-hover:translate-x-0.5"
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
  const { saved, toggle } = useSavedRaces();
  const isSaved = saved.includes(race.id);
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    // move focus into the dialog on open
    (focusables()[0] ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        panel?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!panel?.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-void-black/85 ${
        isMobile ? "items-end justify-stretch" : "items-center justify-center px-6 py-8"
      }`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("eventDetails")}
        tabIndex={-1}
        className={`w-full bg-void-black outline-none shadow-none ${
          isMobile
            ? "max-h-[85vh] overflow-y-auto border-t border-zurkhai/40 px-5 pb-8 pt-3 animate-in slide-in-from-bottom duration-300"
            : "max-w-[520px] border border-frost/20 p-6 sm:p-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="mx-auto mb-4 h-[3px] w-12 rounded-full bg-frost/30" aria-hidden="true" />
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="text-caption text-smoke">
            {lang === "mn" ? race.monthMn : race.monthEn} · {race.day} · {race.year}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggle(race.id)}
              aria-pressed={isSaved}
              className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] tracking-[0.06em] uppercase border ${
                isSaved
                  ? "border-zurkhai text-zurkhai"
                  : "border-frost/30 text-ash hover:text-frost hover:border-frost"
              }`}
            >
              <Bookmark size={13} strokeWidth={1.5} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? t("savedRace") : t("saveRace")}
            </button>
            <button
              onClick={onClose}
              className="size-8 flex items-center justify-center border border-frost/30 text-frost text-[14px] hover:bg-zurkhai hover:text-void-black hover:border-zurkhai"
              aria-label={t("close")}
            >
              ✕
            </button>
          </div>
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
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-frost/15 pt-4">
          <div>
            <dt className="text-caption uppercase text-smoke">{t("elevation")}</dt>
            <dd className="font-mono text-[13px] text-ash">
              {race.elevationGainM != null ? `${race.elevationGainM} m` : t("tba")}
            </dd>
          </div>
          <div>
            <dt className="text-caption uppercase text-smoke">{t("price")}</dt>
            <dd className="font-mono text-[13px] text-ash">{race.priceInfo || t("tba")}</dd>
          </div>
          <div>
            <dt className="text-caption uppercase text-smoke">{t("regDeadline")}</dt>
            <dd className="font-mono text-[13px] text-ash">{race.regDeadline ?? t("tba")}</dd>
          </div>
          <div>
            <dt className="text-caption uppercase text-smoke">{t("courseMap")}</dt>
            <dd className="font-mono text-[13px] text-ash">
              {race.courseMapUrl ? (
                <a
                  href={race.courseMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zurkhai underline underline-offset-2 hover:opacity-80"
                >
                  {t("viewMap")}
                </a>
              ) : (
                t("tba")
              )}
            </dd>
          </div>
        </dl>
        <p className="text-[14px] leading-[1.6] text-ash mt-5 font-[400]">
          {lang === "mn" ? race.descriptionMn : race.descriptionEn}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => downloadIcs([race], lang, `${race.id}.ics`)}
            className="inline-flex items-center justify-center gap-2 border border-frost/30 px-3 py-3 text-[11px] tracking-[0.06em] uppercase text-ash hover:border-zurkhai hover:text-zurkhai transition-colors"
          >
            <Download size={13} strokeWidth={1.5} /> {t("exportIcs")}
          </button>
          <a
            href={googleCalendarUrl(race, lang)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-frost/30 px-3 py-3 text-[11px] tracking-[0.06em] uppercase text-ash hover:border-zurkhai hover:text-zurkhai transition-colors"
          >
            <CalendarDays size={13} strokeWidth={1.5} /> {t("addToGoogle")}
          </a>
        </div>
        <a
          href={race.registerUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block bg-zurkhai text-void-black px-[24px] py-[14px] text-[13px] tracking-[0.04em] uppercase font-[400] text-center hover:opacity-90"
        >
          {t("register")} →
        </a>
      </div>
    </div>
  );
}
