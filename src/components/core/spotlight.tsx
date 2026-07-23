import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  gradientClassName?: string;
  color?: "plasma" | "lime" | "frost";
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "subtle" | "normal" | "strong";
}

const colorStops: Record<SpotlightProps["color"], string> = {
  plasma: "rgba(16, 25, 236, 0.22)",
  lime: "rgba(235, 251, 16, 0.14)",
  frost: "rgba(255, 255, 255, 0.10)",
};

const sizeScales: Record<SpotlightProps["size"], string> = {
  sm: "50%",
  md: "75%",
  lg: "100%",
  xl: "125%",
};

const intensityStops: Record<SpotlightProps["intensity"], string> = {
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
