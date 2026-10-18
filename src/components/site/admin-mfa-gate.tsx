import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Field, Input, PrimaryButton } from "./form-ui";

type State =
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "enroll"; factorId: string; qr: string; secret: string }
  | { kind: "verify"; factorId: string };

/** Requires an authenticator-app (TOTP) code before showing admin content. */
export function AdminMfaGate({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") return setState({ kind: "ok" });
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === "verified");
      if (verified) return setState({ kind: "verify", factorId: verified.id });
      // clean up unfinished enrollments, then start a new one
      for (const f of factors?.all ?? []) {
        if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `admin-${Date.now()}` });
      if (error || !data) return setError(error?.message ?? "Could not start setup");
      setState({ kind: "enroll", factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind !== "enroll" && state.kind !== "verify") return;
    setBusy(true); setError("");
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: state.factorId, code: code.trim() });
    setBusy(false);
    if (error) return setError("Wrong code. Try again.");
    await qc.invalidateQueries();
    setState({ kind: "ok" });
  }

  if (state.kind === "ok") return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[380px] flex flex-col gap-4">
        <h1 className="text-[22px]">Admin verification</h1>
        {state.kind === "loading" && !error && <p className="text-[14px] text-muted-foreground">Loading…</p>}
        {state.kind === "enroll" && (
          <>
            <p className="text-[14px] text-muted-foreground">Scan with Google Authenticator, Authy or 1Password.</p>
            <img src={state.qr} alt="Authenticator QR code" className="size-48 bg-foreground p-2 rounded" />
            <p className="text-[12px] text-muted-foreground break-all">Key: {state.secret}</p>
          </>
        )}
        {(state.kind === "enroll" || state.kind === "verify") && (
          <>
            <Field label="6-digit code">
              <Input value={code} onChange={setCode} required />
            </Field>
            <PrimaryButton type="submit" disabled={busy || code.trim().length < 6}>{busy ? "…" : "Verify"}</PrimaryButton>
          </>
        )}
        {error && <p className="text-[13px] text-destructive">{error}</p>}
      </form>
    </div>
  );
}
