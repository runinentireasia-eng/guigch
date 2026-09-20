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
  const pad = size === "sm" ? "px-5 py-3" : "px-7 py-3.5";
  const cls =
    `inline-flex items-center justify-center ${pad} bg-zurkhai text-void-black text-[12px] font-[500] ` +
    "transition-colors hover:bg-frost focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zurkhai";
  return (
    <div className="inline-flex">
      {to ? (
        <Link to={to} className={cls}>
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
          {children}
        </a>
      )}
    </div>
  );
}

/* ---------- Cinematic page banner ---------- */
export function PageBanner({
  image,
  imageAlt,
  label,
  title,
  subtitle,
  cta,
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
  const h = height === "sm" ? "min-h-[240px]" : "min-h-[300px]";
  return (
    <section
      className={`relative ${h} w-full flex items-end overflow-hidden bg-void-black text-frost border-b border-frost/15`}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          width={1920}
          height={912}
          className="w-full h-full object-cover opacity-55 grayscale-[20%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.94), rgba(0,0,0,0.18))",
          }}
        />
      </div>
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-10 md:py-14">
        <h1 className="text-[36px] md:text-[52px] leading-[1.05] font-[400] max-w-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-4 max-w-xl text-[14px] leading-6 text-ash">{subtitle}</p>}
        {cta && <div className="mt-6">{cta}</div>}
      </div>
    </section>
  );
}
