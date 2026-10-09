import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import { BeamSurface } from "./beam-surface";

/** Adapted from the supplied Beam Wordmark Footer to the site's tokens and links. */
export default function BeamWordmarkFooter({ languageControl }: { languageControl: ReactNode }) {
  const { t, lang } = useLang();
  const brand = `${t("brand")}.mn`;
  return <footer className="beam-footer">
    <BeamSurface>
      <div className="beam-footer-inner">
        <div>
          <p className="beam-footer-label">© {new Date().getFullYear()} {brand}</p>
          <div className="mt-6">{languageControl}</div>
        </div>
        <nav aria-label={t("navCalendar")}>
          <p className="beam-footer-label">{lang === "mn" ? "Уралдаан" : "Races"}</p>
          <div className="beam-footer-links">
            <Link to="/calendar">{t("navCalendar")}<ArrowUpRight /></Link>
            <Link to="/organizers">{t("navOrganizers")}<ArrowUpRight /></Link>
            <Link to="/results">{t("navResults")}<ArrowUpRight /></Link>
          </div>
        </nav>
        <div>
          <p className="beam-footer-label">{lang === "mn" ? "Холбоо барих" : "Get in touch"}</p>
          <div className="beam-footer-links">
            <a href="mailto:hi@guygch.mn">hi@guygch.mn<ArrowUpRight /></a>
            <Link to="/auth">{t("logIn")}<ArrowUpRight /></Link>
          </div>
        </div>
      </div>
      <div className="beam-wordmark" aria-label={brand}>
        <span aria-hidden="true">{Array.from(brand).map((letter, i) => <span key={i}>{letter}</span>)}</span>
      </div>
    </BeamSurface>
  </footer>;
}