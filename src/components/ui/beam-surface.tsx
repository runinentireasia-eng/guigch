import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A shared light shaft; animation pauses offscreen and for reduced motion. */
export function BeamSurface({ children, className }: { children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      node.dataset.visible = String(entry?.isIntersecting ?? false);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={cn("beam-surface", className)}>
    <div className="beam-shaft" aria-hidden="true" />
    {children}
  </div>;
}