import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

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
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
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
    <div className="min-h-screen bg-void-black text-frost flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] border border-frost/20 p-8">
        <Link to="/" className="text-caption text-smoke hover:text-frost">← гүйгч.mn</Link>
        <h1 className="mt-6 text-[28px] tracking-[-0.02em] font-[330]">
          {mode === "in" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-2 text-caption text-smoke">Admin access for race management.</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
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
          <button
            type="submit"
            disabled={busy}
            className="bg-zurkhai text-void-black px-[30px] py-[14px] text-[13px] tracking-[0.06em] uppercase font-[400] hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "…" : mode === "in" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4 text-caption text-smoke">
          <div className="flex-1 border-t border-zurkhai/20" />
          OR
          <div className="flex-1 border-t border-zurkhai/20" />
        </div>

        <button
          onClick={google}
          type="button"
          disabled={busy}
          className="w-full border border-frost text-frost px-[30px] py-[14px] text-[13px] tracking-[0.06em] uppercase font-[400] hover:bg-frost/5 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <button
          onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
          className="mt-6 text-caption text-smoke hover:text-frost w-full text-left"
        >
          {mode === "in" ? "No account? Create one →" : "Have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}