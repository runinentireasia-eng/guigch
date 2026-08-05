import { useMemo } from "react";
import { useLang } from "@/lib/i18n";
import type { Race } from "@/lib/races";
import { CloudRule } from "./zurkhai-ornament";

/* ---------- Results ---------- */
export function ResultsSection({ races }: { races: Race[] }) {
  const { lang } = useLang();
  const past = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return races
      .filter((r) => new Date(r.dateISO + "T00:00:00") < today)
      .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  }, [races]);

  return (
    <section id="results" className="bg-void-black scroll-mt-24">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <CloudRule className="mb-10 text-zurkhai" />
        {past.length === 0 ? (
          <p className="text-[13px] text-smoke">
            {lang === "mn" ? "Одоогоор өнгөрсөн уралдаан бүртгэгдээгүй." : "No past races recorded yet."}
          </p>
        ) : (
          <ul className="border-t border-zurkhai/20">
            {past.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-zurkhai/20 py-4">
                <span className="text-caption text-zurkhai w-[110px]">{r.dateISO}</span>
                <span className="text-[15px] font-[400] flex-1 min-w-[200px]">{lang === "mn" ? r.nameMn : r.nameEn}</span>
                <span className="text-[13px] text-smoke">{lang === "mn" ? r.locationMn : r.locationEn}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
