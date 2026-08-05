import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-caption text-smoke">{label}</span>
      {children}
    </label>
  );
}

export function Row2({ children }: { children: ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

export function Input({
  value, onChange, type = "text", placeholder, required,
}: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border border-frost/30 px-3 py-2.5 text-[14px] text-frost placeholder:text-smoke focus:outline-none focus:border-zurkhai"
    />
  );
}

export function Textarea({
  value, onChange, rows = 3, placeholder,
}: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border border-frost/30 px-3 py-2.5 text-[14px] text-frost placeholder:text-smoke focus:outline-none focus:border-zurkhai"
    />
  );
}

export function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-void-black border border-frost/30 px-3 py-2.5 text-[14px] text-frost focus:outline-none focus:border-zurkhai"
    >
      {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
    </select>
  );
}

export function PrimaryButton({
  children, onClick, type = "button", disabled,
}: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-zurkhai text-void-black px-[26px] py-[12px] text-[12px] tracking-[0.06em] uppercase font-[400] hover:opacity-90 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children, onClick, type = "button", disabled,
}: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="border border-frost/40 text-frost px-[26px] py-[12px] text-[12px] tracking-[0.06em] uppercase font-[400] hover:bg-frost/5 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "published" ? "border-zurkhai text-zurkhai"
    : status === "cancelled" || status === "rejected" ? "border-red-400/60 text-red-400"
    : status === "approved" || status === "verified" ? "border-plasma-blue text-plasma-blue"
    : "border-frost/30 text-smoke";
  return (
    <span className={`text-caption border px-2 py-1 uppercase ${tone}`}>{status.replace(/_/g, " ")}</span>
  );
}

export function VerifiedBadge({ label = "VERIFIED ORGANIZER" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption border border-zurkhai text-zurkhai px-2 py-1 uppercase">
      <span className="size-[6px] bg-zurkhai" />
      {label}
    </span>
  );
}

export function Modal({
  children, onClose, label, wide,
}: { children: ReactNode; onClose: () => void; label: string; wide?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-6 py-10 bg-void-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className={`w-full ${wide ? "max-w-[720px]" : "max-w-[560px]"} border border-zurkhai/20 bg-void-black p-6 sm:p-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
