import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang, type Lang } from "@/lib/i18n";
import { rowToRace, type Race, type RaceRow } from "@/lib/races";
import { supabase } from "@/integrations/supabase/client";

export function useRaces() {
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
  return races as Race[];
}

export function DotCluster() {
  return (
    <div className="grid grid-cols-2 gap-[3px]">
      <span className="size-[6px] bg-frost" />
      <span className="size-[6px] bg-frost" />
      <span className="size-[6px] bg-frost" />
      <span className="size-[6px] bg-reactor-lime" />
    </div>
  );
}

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

export function AnnouncementBar() {
  const { t } = useLang();
  return (
    <div className="w-full bg-reactor-lime text-void-black">
      <div className="max-w-[1280px] mx-auto px-6 h-[40px] flex items-center justify-center gap-6">
        <span className="text-[12px] tracking-[0.08em] uppercase font-[400]">{t("announcement")}</span>
        <Link to="/calendar" className="text-[12px] tracking-[0.08em] uppercase font-[400] underline-offset-4 hover:underline">
          {t("readMore")}
        </Link>
      </div>
    </div>
  );
}

const navLinkClass = "text-[12px] tracking-[0.06em] uppercase text-ash hover:text-frost";

export function Nav() {
  const { t } = useLang();
  return (
    <nav className="border-b border-frost/15 bg-void-black">
      <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <DotCluster />
          <span className="text-[16px] font-[400] tracking-[0.02em] lowercase">гүйгч.mn</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/calendar" className={navLinkClass} activeProps={{ className: "text-[12px] tracking-[0.06em] uppercase text-frost" }}>
            {t("navCalendar")}
          </Link>
          <Link to="/organizers" className={navLinkClass} activeProps={{ className: "text-[12px] tracking-[0.06em] uppercase text-frost" }}>
            {t("navOrganizers")}
          </Link>
          <Link to="/results" className={navLinkClass} activeProps={{ className: "text-[12px] tracking-[0.06em] uppercase text-frost" }}>
            {t("navResults")}
          </Link>
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

export function Footer() {
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
            <li><Link to="/calendar" className="text-[13px] text-ash hover:text-frost">{t("navCalendar")}</Link></li>
            <li><Link to="/organizers" className="text-[13px] text-ash hover:text-frost">{t("navOrganizers")}</Link></li>
            <li><Link to="/results" className="text-[13px] text-ash hover:text-frost">{t("navResults")}</Link></li>
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

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void-black text-frost font-[300] flex flex-col">
      <AnnouncementBar />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
