import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AddRaceModal } from "./add-race-modal";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/lib/i18n";
import { rowToRace, type Race, type RaceRow } from "@/lib/races";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import BeamWordmarkFooter from "@/components/ui/beam-wordmark-footer";

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
    <label className="inline-flex items-center rounded-md overflow-hidden border border-input cursor-pointer select-none bg-[image:var(--glass-gradient)]">
      <input
        id="langCheckbox"
        type="checkbox"
        checked={isEn}
        onChange={(e) => setLang(e.target.checked ? "en" : "mn")}
        className="sr-only peer"
        aria-label="English language"
      />
      <span className={`px-3 py-2 text-[11px] peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${!isEn ? "bg-primary text-primary-foreground" : "text-ash"}`}>MN</span>
      <span className={`px-3 py-2 text-[11px] ${isEn ? "bg-primary text-primary-foreground" : "text-ash"}`}>EN</span>
    </label>
  );
}

const navLinkClass = "text-[13px] text-ash hover:text-frost transition-colors";

export function Nav() {
  const { t } = useLang();
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="site-nav border-b border-input">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[76px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="shrink-0"><DotCluster /></span>
          <span className="truncate text-[20px] font-[500] lowercase">{t("brand")}.mn</span>
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
          <Button variant="beam"
            onClick={() => setAddOpen(true)}
            className="h-10 px-4 text-[13px]"
            data-cursor-hover
          >
            <span>{t("addRace")}</span>
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <Button variant="glass" size="icon"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="size-[38px]"
            data-cursor-hover
          >
            <span className="grid gap-[5px] transition-transform duration-300">
              <span className="block h-px w-[18px] bg-frost" />
              <span className="block h-px w-[18px] bg-frost" />
              <span className="block h-px w-[18px] bg-frost" />
            </span>
          </Button>
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
          <Button variant="beam"
            onClick={() => {
              setMenuOpen(false);
              setAddOpen(true);
            }}
            className="h-12 justify-start px-4 text-[14px] mt-2"
            data-cursor-hover
          >
            <span>{t("addRace")}</span>
          </Button>
        </div>
      )}
      {addOpen && <AddRaceModal onClose={() => setAddOpen(false)} />}
    </nav>
  );
}

export function Footer() {
  return <BeamWordmarkFooter languageControl={<LangToggle />} />;
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
