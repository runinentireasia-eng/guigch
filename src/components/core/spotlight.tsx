import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type SpotlightColor = "plasma" | "lime" | "frost";
type SpotlightSize = "sm" | "md" | "lg" | "xl";
type SpotlightIntensity = "subtle" | "normal" | "strong";

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  gradientClassName?: string;
  color?: SpotlightColor;
  size?: SpotlightSize;
  intensity?: SpotlightIntensity;
}

const colorStops: Record<SpotlightColor, string> = {
  plasma: "rgba(16, 25, 236, 0.22)",
  lime: "rgba(235, 251, 16, 0.14)",
  frost: "rgba(255, 255, 255, 0.10)",
};

const sizeScales: Record<SpotlightSize, string> = {
  sm: "50%",
  md: "75%",
  lg: "100%",
  xl: "125%",
};

const intensityStops: Record<SpotlightIntensity, string> = {
  subtle: "transparent 55%",
  normal: "transparent 45%",
  strong: "transparent 35%",
};

export function Spotlight({
  children,
  className,
  gradientClassName,
  color = "plasma",
  size = "lg",
  intensity = "normal",
}: SpotlightProps) {
  const colorStop = colorStops[color];
  const sizeScale = sizeScales[size];
  const intensityStop = intensityStops[intensity];

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          gradientClassName
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colorStop} 0%, ${intensityStop} ${sizeScale})`,
        }}
      />
      {children}
    </div>
  );
}
