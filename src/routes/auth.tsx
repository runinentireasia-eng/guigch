import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { BeamSurface } from "@/components/ui/beam-surface";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · гүйгч.mn" },
      { name: "description", content: "Sign in to manage races on the Mongolian race calendar." },
      { property: "og:title", content: "Sign in · гүйгч.mn" },
      { property: "og:description", content: "Admin sign-in for the Mongolian race calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { mode?: "in" | "up" } =>
    s.mode === "up" ? { mode: "up" } : s.mode === "in" ? { mode: "in" } : {},
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">(search.mode ?? "in");
  useEffect(() => {
    if (search.mode) setMode(search.mode);
  }, [search.mode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/organizer" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      }
      toast.success("Signed in");
      navigate({ to: "/organizer" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (res.error) {
        console.error("Google sign-in error", res.error);
        toast.error(res.error.message ?? "Google sign-in failed");
        return;
      }
      if (res.redirected) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("No session returned from Google");
        return;
      }
      toast.success("Signed in");
      navigate({ to: "/organizer" });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BeamSurface className="site-shell min-h-screen text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="text-caption text-smoke hover:text-frost">← гүйгч.mn</Link>
        <h1 className="mt-6 text-[28px] font-[400]">
          {mode === "in" ? "Sign in" : "Create account"}
        </h1>
        <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="bg-transparent border border-frost/30 px-4 py-3 text-[14px] text-frost focus:outline-none focus:border-zurkhai"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="bg-transparent border border-frost/30 px-4 py-3 text-[14px] text-frost focus:outline-none focus:border-zurkhai"
          />
          <Button variant="beam"
            type="submit"
            disabled={busy}
            className="h-12 px-7 text-[13px]"
          >
            {busy ? "…" : mode === "in" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-4 text-[11px] text-smoke">
          <div className="flex-1 border-t border-frost/15" />
          or
          <div className="flex-1 border-t border-frost/15" />
        </div>

        <Button variant="glass"
          onClick={google}
          type="button"
          disabled={busy}
          className="w-full h-12 text-[13px]"
        >
          Continue with Google
        </Button>

        <Button variant="link"
          onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
          className="mt-6 text-smoke w-full justify-start px-0 text-[12px]"
        >
          {mode === "in" ? "No account? Create one →" : "Have an account? Sign in →"}
        </Button>
      </div>
    </BeamSurface>
  );
}