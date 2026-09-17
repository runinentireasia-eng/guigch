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
    <span className="block size-2 bg-zurkhai" />
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  const isEn = lang === "en";
  return (
    <label className="inline-flex items-center border border-frost/20 cursor-pointer select-none">
      <input
        id="langCheckbox"
        type="checkbox"
        checked={isEn}
        onChange={(e) => setLang(e.target.checked ? "en" : "mn")}
        className="hidden"
      />
      <span className={`px-3 py-2 text-[11px] ${!isEn ? "bg-zurkhai text-void-black" : "text-ash"}`}>MN</span>
      <span className={`px-3 py-2 text-[11px] ${isEn ? "bg-zurkhai text-void-black" : "text-ash"}`}>EN</span>
    </label>
  );
}

export function AnnouncementBar() {
  const { t } = useLang();
  return (
    <div className="w-full bg-zurkhai text-void-black">
      <div className="max-w-[1280px] mx-auto px-6 h-[40px] flex items-center justify-center gap-6">
        <span className="text-[12px] tracking-[0.08em] uppercase font-[400] animate-fade-in-up">{t("announcement")}</span>
        <Link to="/calendar" className="text-[12px] tracking-[0.08em] uppercase font-[400] underline-offset-4 hover:underline nav-link-scan text-void-black after:bg-void-black" data-cursor-hover>
          {t("readMore")}
        </Link>
      </div>
    </div>
  );
}

const navLinkClass = "text-[13px] text-ash hover:text-frost transition-colors";

export function Nav() {
  const { t } = useLang();
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="border-b border-frost/15 bg-void-black">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[60px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="shrink-0"><DotCluster /></span>
          <span className="truncate text-[15px] md:text-[16px] font-[400] tracking-[0.02em] lowercase">гүйгч.mn</span>
        </Link>
        <div className="hidden md:flex items-center gap-7">
          <Link to="/calendar" className={navLinkClass} activeProps={{ className: "text-[13px] text-frost" }}>
            {t("navCalendar")}
          </Link>
          <Link to="/organizers" className={navLinkClass} activeProps={{ className: "text-[13px] text-frost" }}>
            {t("navOrganizers")}
          </Link>
          <Link to="/results" className={navLinkClass} activeProps={{ className: "text-[13px] text-frost" }}>
            {t("navResults")}
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/auth"
            className="px-3 py-2 text-[13px] text-ash hover:text-frost"
            data-cursor-hover
          >
            <span>{t("logIn")}</span>
          </Link>
          <button
            onClick={() => setAddOpen(true)}
            className="bg-zurkhai px-4 py-2.5 text-[13px] font-[500] text-void-black hover:bg-frost"
            data-cursor-hover
          >
            <span>{t("addRace")}</span>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="text-frost size-[38px] grid place-items-center"
            data-cursor-hover
          >
            <span className="grid gap-[5px] transition-transform duration-300">
              <span className="block h-px w-[18px] bg-frost" />
              <span className="block h-px w-[18px] bg-frost" />
              <span className="block h-px w-[18px] bg-frost" />
            </span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-frost/15 px-4 py-4 flex flex-col gap-1">
          {[
            { to: "/calendar" as const, label: t("navCalendar") },
            { to: "/organizers" as const, label: t("navOrganizers") },
            { to: "/results" as const, label: t("navResults") },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-[14px] text-ash hover:text-frost"
              activeProps={{ className: "py-3 text-[14px] text-frost" }}
              data-cursor-hover
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setMenuOpen(false)}
            className="border-t border-frost/15 py-3 text-left text-[14px] text-ash mt-2"
            data-cursor-hover
          >
            <span>{t("logIn")}</span>
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              setAddOpen(true);
            }}
            className="bg-zurkhai px-4 py-3 text-left text-[14px] font-[500] text-void-black mt-2"
            data-cursor-hover
          >
            <span>{t("addRace")}</span>
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
      <div className="max-w-[1280px] mx-auto px-6 py-10 grid gap-8 md:grid-cols-[1fr_auto_auto] md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <DotCluster />
            <span className="text-[16px] font-[400] lowercase">гүйгч.mn</span>
          </div>
          <p className="mt-3 text-[12px] text-smoke max-w-[320px]">
            {t("footerRights")}
          </p>
          <div className="mt-5">
            <LangToggle />
          </div>
        </div>
        <div>
          <ul className="space-y-2">
            <li><Link to="/calendar" className="text-[13px] text-ash hover:text-frost">{t("navCalendar")}</Link></li>
            <li><Link to="/organizers" className="text-[13px] text-ash hover:text-frost">{t("navOrganizers")}</Link></li>
            <li><Link to="/results" className="text-[13px] text-ash hover:text-frost">{t("navResults")}</Link></li>
          </ul>
        </div>
        <div>
          <ul className="space-y-2">
            <li><a href="mailto:hi@guygch.mn" className="text-[13px] text-ash hover:text-frost">hi@guygch.mn</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void-black text-frost font-[300] flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
