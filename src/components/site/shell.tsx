import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AddRaceModal } from "./add-race-modal";
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
  const isEn = lang === "en";
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <span className={`text-[11px] tracking-[0.08em] uppercase ${isEn ? "text-ash" : "text-frost"}`}>
        MN
      </span>
      <input
        id="langCheckbox"
        type="checkbox"
        checked={isEn}
        onChange={(e) => setLang(e.target.checked ? "en" : "mn")}
        className="hidden"
      />
      <span
        className="relative flex items-center justify-center w-[90px] h-[30px] rounded-[40px] transition-colors duration-300"
        style={{ backgroundColor: isEn ? "#3B82F6" : "#1a1a1a" }}
      >
        <span
          className="absolute top-0 h-[30px] w-1/2 rounded-[40px] transition-transform duration-300"
          style={{
            left: 0,
            transform: isEn ? "translateX(100%)" : "translateX(0)",
            background: "conic-gradient(rgba(248,250,252,0.35),#F8FAFC,rgba(248,250,252,0.35),#F8FAFC,rgba(248,250,252,0.35))",
            boxShadow: "2px 2px 10px rgba(0,0,0,0.28)",
          }}
        />
      </span>
      <span className={`text-[11px] tracking-[0.08em] uppercase ${isEn ? "text-frost" : "text-ash"}`}>
        EN
      </span>
    </label>
  );
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
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="border-b border-frost/15 bg-void-black">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[60px] md:h-[72px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="shrink-0"><DotCluster /></span>
          <span className="truncate text-[15px] md:text-[16px] font-[400] tracking-[0.02em] lowercase">гүйгч.mn</span>
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
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/auth"
            className="nav-action nav-action-secondary"
          >
            <span>{t("logIn")}</span>
          </Link>
          <button
            onClick={() => setAddOpen(true)}
            className="nav-action nav-action-primary"
          >
            <span>{t("addRace")}</span>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="border border-frost/40 text-frost size-[38px] grid place-items-center"
          >
            <span className="grid gap-[5px]">
              <span className="block h-px w-[18px] bg-frost" />
              <span className="block h-px w-[18px] bg-frost" />
              <span className="block h-px w-[18px] bg-frost" />
            </span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-frost/15 px-4 py-5 flex flex-col gap-1">
          {[
            { to: "/calendar" as const, label: t("navCalendar") },
            { to: "/organizers" as const, label: t("navOrganizers") },
            { to: "/results" as const, label: t("navResults") },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-[13px] tracking-[0.06em] uppercase text-ash hover:text-frost"
              activeProps={{ className: "py-3 text-[13px] tracking-[0.06em] uppercase text-frost" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setMenuOpen(false)}
            className="mt-3 border border-frost text-frost py-3 text-center text-[12px] tracking-[0.06em] uppercase"
          >
            {t("logIn")}
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              setAddOpen(true);
            }}
            className="mt-2 bg-frost text-void-black py-3 text-[12px] tracking-[0.06em] uppercase"
          >
            {t("addRace")}
          </button>
        </div>
      )}
      {addOpen && <AddRaceModal onClose={() => setAddOpen(false)} />}
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
          <div className="mt-6">
            <LangToggle />
          </div>
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
