import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

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
  return (
    <Button variant="beam" size={size === "sm" ? "sm" : "lg"} asChild>
      {to ? (
        <Link to={to}>
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      )}
    </Button>
  );
}

/* ---------- Cinematic page banner ---------- */
export function PageBanner({
  image,
  imageAlt,
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
      className={`beam-banner relative ${h} w-full flex items-end overflow-hidden text-foreground border-b border-input`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/55 to-transparent" />
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
