import { useMemo } from "react";
import { useLang } from "@/lib/i18n";
import type { Race } from "@/lib/races";
import { useVerifiedOrganizerNames } from "@/lib/access";
import { VerifiedBadge } from "./form-ui";

/* ---------- Organizers ---------- */
export function OrganizersSection({ races }: { races: Race[] }) {
  const { lang } = useLang();
  const { data: verified } = useVerifiedOrganizerNames();
  const organizers = useMemo(() => {
    const map = new Map<string, Race[]>();
    for (const r of races) {
      const key = (lang === "mn" ? r.organizerMn : r.organizerEn) || "—";
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [races, lang]);

  return (
    <section id="organizers" className="bg-void-black scroll-mt-24">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        {organizers.length === 0 ? (
          <p className="text-[13px] text-smoke">{lang === "mn" ? "Мэдээлэл алга." : "No data yet."}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zurkhai/20 border border-zurkhai/20">
            {organizers.map(([name, list]) => (
              <div key={name} className="bg-void-black p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-[400] tracking-[0.01em]">{name}</span>
                  {verified?.has(name.trim().toLowerCase()) && <VerifiedBadge />}
                </div>
                <div className="mt-2 text-caption text-smoke">
                  {list.length} {lang === "mn" ? "уралдаан" : list.length === 1 ? "race" : "races"}
                </div>
                <ul className="mt-4 space-y-1">
                  {list.map((r) => (
                    <li key={r.id} className="text-[13px] text-ash">
                      {lang === "mn" ? r.nameMn : r.nameEn}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
