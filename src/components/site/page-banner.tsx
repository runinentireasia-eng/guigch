import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/* ---------- Cinematic CTA button (same language as the homepage hero) ---------- */
export function CtaButton({
  to,
  href,
  children,
  size = "md",
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  size?: "md" | "sm";
}) {
  const pad = size === "sm" ? "px-8 py-4" : "px-12 py-5";
  const cls =
    `relative ${pad} bg-void-black border border-frost/30 text-frost text-xs uppercase tracking-[0.4em] font-bold ` +
    "transition-all duration-500 hover:border-reactor-lime hover:bg-reactor-lime hover:text-void-black overflow-hidden";
  const corners = (
    <>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-frost/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-frost/50" />
    </>
  );
  return (
    <div className="group relative inline-flex items-center justify-center">
      <div className="absolute -inset-px bg-reactor-lime/20 blur-sm transition-opacity opacity-0 group-hover:opacity-100" />
      {to ? (
        <Link to={to} className={cls}>
          <span className="relative z-10">{children}</span>
          {corners}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
          <span className="relative z-10">{children}</span>
          {corners}
        </a>
      )}
    </div>
  );
}

/* ---------- Cinematic page banner ---------- */
export function PageBanner({
  image,
  imageAlt,
  index,
  label,
  title,
  subtitle,
  cta,
  meta,
  height = "md",
}: {
  image: string;
  imageAlt: string;
  index?: string;
  label: string;
  title: string;
  subtitle?: string;
  cta?: ReactNode;
  meta?: [string, string];
  height?: "md" | "sm";
}) {
  const h = height === "sm" ? "min-h-[46vh]" : "min-h-[62vh]";
  return (
    <section
      className={`relative ${h} w-full flex items-center justify-center overflow-hidden bg-void-black text-frost border-b border-frost/15`}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          width={1920}
          height={912}
          className="w-full h-full object-cover opacity-70 grayscale-[25%] scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.95) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void-black/50 via-transparent to-void-black" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl py-24">
        <div className="flex items-center gap-4 mb-7">
          <div className="h-px w-8 bg-frost/20" />
          <span className="text-caption text-smoke">
            {index ? `${index} / ` : ""}
            {label}
          </span>
          <div className="h-px w-8 bg-frost/20" />
        </div>

        <h1 className="text-[38px] md:text-[60px] lg:text-[76px] leading-[0.98] tracking-[-0.035em] font-[300] select-none">
          {title}
        </h1>

        {subtitle && <p className="mt-7 max-w-xl text-body-aaru text-smoke">{subtitle}</p>}
        {cta && <div className="mt-11">{cta}</div>}
      </div>

      {meta && (
        <>
          <div className="absolute bottom-8 left-8 hidden lg:block text-[9px] font-mono text-smoke tracking-widest uppercase">
            {meta[0]}
          </div>
          <div className="absolute bottom-8 right-8 hidden lg:block text-[9px] font-mono text-smoke tracking-widest uppercase text-right">
            {meta[1]}
          </div>
        </>
      )}
    </section>
  );
}
