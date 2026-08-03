import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isHoverable =
        target.closest("a, button, [role='button'], input, textarea, select, label, [data-cursor-hover]") !== null;
      setHovering(isHoverable);
    };

    const loop = () => {
      const lerp = 0.18;
      posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;

      const x = posRef.current.x;
      const y = posRef.current.y;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Trail */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full opacity-40 blur-md transition-[width,height,opacity] duration-300 ease-out"
        style={{
          width: hovering ? 56 : 40,
          height: hovering ? 56 : 40,
          background: "radial-gradient(circle, rgba(16,25,236,0.55) 0%, rgba(16,25,236,0) 70%)",
          mixBlendMode: "screen",
        }}
        aria-hidden="true"
      />
      {/* Core dot */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out"
        style={{
          width: hovering ? 10 : 6,
          height: hovering ? 10 : 6,
          backgroundColor: hovering ? "var(--color-reactor-lime)" : "var(--color-frost)",
          boxShadow: hovering
            ? "0 0 18px rgba(235,251,16,0.55), 0 0 6px rgba(235,251,16,0.35)"
            : "0 0 12px rgba(255,255,255,0.35), 0 0 4px rgba(255,255,255,0.2)",
        }}
        aria-hidden="true"
      />
      <style>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
