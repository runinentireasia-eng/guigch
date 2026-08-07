import { useRef, useState, type ReactNode } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

const THRESHOLD = 72;
const MAX = 110;

/** Touch-only pull-to-refresh. Inert on pointer devices. */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown> | unknown;
  children: ReactNode;
}) {
  const { t } = useLang();
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (busy) return;
    startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null || busy) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) {
      setPull(0);
      return;
    }
    setPull(Math.min(MAX, delta * 0.5));
  };

  const onTouchEnd = async () => {
    const shouldRefresh = pull >= THRESHOLD;
    startY.current = null;
    if (!shouldRefresh) {
      setPull(0);
      return;
    }
    setBusy(true);
    setPull(THRESHOLD);
    try {
      await onRefresh();
    } finally {
      setBusy(false);
      setPull(0);
    }
  };

  const active = pull > 0 || busy;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className="md:touch-auto"
      style={{ overscrollBehaviorY: active ? "contain" : undefined }}
    >
      <div
        aria-live="polite"
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: active ? Math.max(pull, busy ? THRESHOLD : 0) : 0 }}
      >
        <div className="flex items-center gap-2 text-caption uppercase text-zurkhai">
          {busy ? (
            <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <ArrowDown
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-200"
              style={{ transform: pull >= THRESHOLD ? "rotate(180deg)" : "none" }}
            />
          )}
          {busy ? t("refreshing") : pull >= THRESHOLD ? t("releaseToRefresh") : t("pullToRefresh")}
        </div>
      </div>
      <div
        className="transition-transform duration-200 ease-out"
        style={{ transform: active ? `translateY(${Math.min(pull, THRESHOLD) * 0.15}px)` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
