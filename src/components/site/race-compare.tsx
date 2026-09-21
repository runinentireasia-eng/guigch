import { X, Download } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { downloadIcs } from "@/lib/ics";
import type { Race } from "@/lib/races";

/** Side-by-side comparison of selected races. */
export function RaceCompareTable({
  races,
  onRemove,
  onClear,
}: {
  races: Race[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const { t, lang } = useLang();
  const monthNames = t("monthNames").split("_");

  const dateLabel = (r: Race) => {
    const d = new Date(r.dateISO + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };
  const statusLabel = (s: Race["status"]) =>
    s === "open" ? t("open") : s === "closing_soon" ? t("closingSoon") : t("waitlist");
  const typeLabel = (c: Race["category"]) =>
    c === "road" ? t("filterRoad") : c === "trail" ? t("filterTrail") : c === "ultra" ? t("filterUltra") : t("filterFun");

  const rows: { label: string; render: (r: Race) => string; href?: (r: Race) => string }[] = [
    { label: t("date"), render: dateLabel },
    { label: t("distances"), render: (r) => (r.distances.length ? r.distances.join(" · ") : t("tba")) },
    { label: t("elevation"), render: (r) => (r.elevationGainM != null ? `${r.elevationGainM} m` : t("tba")) },
    { label: t("price"), render: (r) => r.priceInfo || t("tba") },
    { label: t("regDeadline"), render: (r) => r.regDeadline || t("tba") },
    { label: t("courseMap"), render: () => t("tba"), href: (r) => r.courseMapUrl || "" },
    { label: t("raceType"), render: (r) => typeLabel(r.category) },
    { label: t("location"), render: (r) => (lang === "mn" ? r.locationMn : r.locationEn) || t("tba") },
    { label: t("organizer"), render: (r) => (lang === "mn" ? r.organizerMn : r.organizerEn) || t("tba") },
    { label: t("status"), render: (r) => statusLabel(r.status) },
  ];

  return (
    <div className="mt-8 border border-frost/15">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-frost/15 px-4 py-3">
        <div className="text-[13px] text-frost">{t("compareTitle")}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadIcs(races, lang, "guigch-compare.ics")}
            className="inline-flex items-center gap-2 px-2 py-2 text-[11px] text-ash hover:text-zurkhai"
          >
            <Download size={13} strokeWidth={1.5} /> {t("exportIcs")}
          </button>
          <button
            onClick={onClear}
            className="px-2 py-2 text-[11px] text-ash hover:text-zurkhai"
          >
            {t("clearCompare")}
          </button>
        </div>
      </div>

      {races.length < 2 ? (
        <div className="px-4 py-8 text-[13px] text-smoke">{t("compareHint")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-[140px] border-b border-frost/15 px-4 py-3 text-caption text-smoke font-[400]">
                  {t("raceName")}
                </th>
                {races.map((r) => (
                  <th
                    key={r.id}
                    className="border-b border-l border-frost/15 px-4 py-3 align-top text-[15px] font-[400] text-frost"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span>{lang === "mn" ? r.nameMn : r.nameEn}</span>
                      <button
                        onClick={() => onRemove(r.id)}
                        aria-label={`${t("clearCompare")} — ${lang === "mn" ? r.nameMn : r.nameEn}`}
                        className="shrink-0 text-smoke hover:text-zurkhai"
                      >
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th className="border-b border-frost/15 px-4 py-3 text-caption text-smoke font-[400] align-top">
                    {row.label}
                  </th>
                  {races.map((r) => (
                    <td
                      key={r.id}
                      className="border-b border-l border-frost/15 px-4 py-3 text-[13px] text-ash align-top"
                    >
                      {row.href?.(r) ? (
                        <a
                          href={row.href(r)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zurkhai underline underline-offset-2 hover:opacity-80"
                        >
                          {t("viewMap")}
                        </a>
                      ) : (
                        row.render(r)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="px-4 py-3" />
                {races.map((r) => (
                  <td key={r.id} className="border-l border-frost/15 px-4 py-3">
                    <a
                      href={r.registerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-zurkhai px-4 py-2 text-[11px] font-[500] text-void-black hover:bg-frost"
                    >
                      {t("register")} →
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
