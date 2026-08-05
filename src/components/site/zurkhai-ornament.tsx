/**
 * Zurkhai ornament set — line-art motifs borrowed from the printed Mongolian
 * lunar almanac (khee ugalz cloud-scrolls, ulzii endless knot, dragon-cloud
 * band). Rendered as thin single-weight strokes in zurkhai blue so it stays
 * inside the Aaru dark, flat, anti-decorative-by-default language.
 */

const STROKE = "currentColor";

/** Corner cloud-scroll (khee ugalz). Rotate/flip with CSS per corner. */
export function CornerScroll({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke={STROKE}
      strokeWidth="1"
      strokeLinecap="round"
    >
      {/* outer sweep */}
      <path d="M2 118V44C2 20 20 2 44 2h74" opacity="0.55" />
      <path d="M9 118V47C9 26 26 9 47 9h71" opacity="0.35" />
      {/* scroll head */}
      <path d="M22 74c0-16 8-30 26-34 14-3 24 5 24 16 0 9-7 15-15 15-7 0-12-5-12-11 0-5 4-9 9-9 4 0 7 3 7 6 0 3-2 5-5 5" />
      {/* trailing curl */}
      <path d="M48 100c14 2 28-4 38-15 8-9 12-20 12-32" opacity="0.7" />
      <path d="M60 112c18 0 34-9 44-24" opacity="0.4" />
      {/* small counter-curl */}
      <path d="M96 40c0-8 5-14 13-16" opacity="0.6" />
      <circle cx="55" cy="56" r="2" opacity="0.8" />
    </svg>
  );
}

/** Centered ulzii-style knot medallion used as a section seal. */
export function UlziiSeal({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke={STROKE}
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <path d="M32 8v14M32 42v14M8 32h14M42 32h14" opacity="0.5" />
      <path d="M22 22h20v20H22z" />
      <path d="M22 27h10v10H27v5" />
      <path d="M42 37H32V27h5v-5" />
      <path d="M32 2 40 10 32 18 24 10z" opacity="0.55" />
      <path d="M32 46 40 54 32 62 24 54z" opacity="0.55" />
    </svg>
  );
}

/** Horizontal cloud band — a repeating ugalz rule used instead of a plain hairline. */
const RULE_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="14" viewBox="0 0 60 14" fill="none" stroke="%COLOR%" stroke-width="1" stroke-linecap="round"><path d="M0 7h60" opacity="0.28"/><path d="M24 7c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6" opacity="0.8"/><path d="M12 7c3.3 0 6-2.7 6-6M42 7c0 3.3 2.7 6 6 6" opacity="0.55"/></svg>`,
).replace(/%25COLOR%25/g, "%234aa8e0");

/** Tiling cloud rule — use for full-width dividers so the motif never stretches. */
export function CloudRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-[14px] w-full ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${RULE_SVG}")`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "center",
      }}
    />
  );
}

export function CloudBand({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 16"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
      stroke={STROKE}
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M0 8h240" opacity="0.25" />
      <path d="M12 8c0-4 3-6 6-6s6 2 6 6-3 6-6 6-6-2-6-6" opacity="0.7" />
      <path d="M36 8c4 0 6-3 6-6M48 8c0 4 3 6 6 6" opacity="0.5" />
      <path d="M72 8c0-4 3-6 6-6s6 2 6 6-3 6-6 6-6-2-6-6" opacity="0.7" />
      <path d="M96 8c4 0 6-3 6-6M108 8c0 4 3 6 6 6" opacity="0.5" />
      <path d="M132 8c0-4 3-6 6-6s6 2 6 6-3 6-6 6-6-2-6-6" opacity="0.7" />
      <path d="M156 8c4 0 6-3 6-6M168 8c0 4 3 6 6 6" opacity="0.5" />
      <path d="M192 8c0-4 3-6 6-6s6 2 6 6-3 6-6 6-6-2-6-6" opacity="0.7" />
      <path d="M216 8c4 0 6-3 6-6" opacity="0.5" />
    </svg>
  );
}

/**
 * Almanac frame — double hairline with cloud-scroll corners, wrapped around a
 * block of content. Purely decorative; children own all layout.
 */
export function AlmanacFrame({
  children,
  className = "",
  seal = false,
}: {
  children: React.ReactNode;
  className?: string;
  seal?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-0 border border-zurkhai/25" />
      <div className="pointer-events-none absolute inset-[6px] border border-zurkhai/12" />

      <div className="pointer-events-none absolute inset-0 text-zurkhai/70">
        <CornerScroll className="absolute top-0 left-0 size-14 sm:size-20" />
        <CornerScroll className="absolute top-0 right-0 size-14 sm:size-20 -scale-x-100" />
        <CornerScroll className="absolute bottom-0 left-0 size-14 sm:size-20 -scale-y-100" />
        <CornerScroll className="absolute bottom-0 right-0 size-14 sm:size-20 -scale-100" />
      </div>

      {seal && (
        <UlziiSeal className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 size-10 text-zurkhai bg-void-black" />
      )}

      <div className="relative">{children}</div>
    </div>
  );
}