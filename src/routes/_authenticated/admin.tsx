import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin · гүйгч.mn" },
      { name: "description", content: "Manage the Mongolian race calendar." },
      { property: "og:title", content: "Admin · гүйгч.mn" },
      { property: "og:description", content: "Manage races on the Mongolian race calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const CATEGORIES = ["road", "trail", "ultra", "fun"] as const;
const STATUSES = ["open", "closing_soon", "waitlist"] as const;

const raceSchema = z.object({
  name_mn: z.string().trim().min(1, "Required").max(200),
  name_en: z.string().trim().min(1, "Required").max(200),
  race_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  location_mn: z.string().trim().max(200).default(""),
  location_en: z.string().trim().max(200).default(""),
  organizer_mn: z.string().trim().max(200).default(""),
  organizer_en: z.string().trim().max(200).default(""),
  category: z.enum(CATEGORIES),
  distances: z.string().max(200).default(""),
  status: z.enum(STATUSES),
  register_url: z.string().trim().url("Must be a valid URL").max(500).or(z.literal("")),
  description_mn: z.string().trim().max(1000).default(""),
  description_en: z.string().trim().max(1000).default(""),
});

type FormValues = z.infer<typeof raceSchema>;

const emptyForm: FormValues = {
  name_mn: "", name_en: "", race_date: "", location_mn: "", location_en: "",
  organizer_mn: "", organizer_en: "", category: "road", distances: "",
  status: "open", register_url: "", description_mn: "", description_en: "",
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.user.id);
      setIsAdmin(!!data?.some((r) => r.role === "admin"));
    })();
  }, []);

  const races = useQuery({
    queryKey: ["races"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .order("race_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const parsed = raceSchema.parse(values);
      const payload = {
        ...parsed,
        distances: parsed.distances
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editingId) {
        const { error } = await supabase.from("races").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("races").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Race updated" : "Race added");
      setForm(emptyForm);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["races"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("races").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Race deleted");
      qc.invalidateQueries({ queryKey: ["races"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  function edit(row: any) {
    setEditingId(row.id);
    setForm({
      name_mn: row.name_mn, name_en: row.name_en, race_date: row.race_date,
      location_mn: row.location_mn, location_en: row.location_en,
      organizer_mn: row.organizer_mn, organizer_en: row.organizer_en,
      category: row.category, distances: (row.distances ?? []).join(", "),
      status: row.status, register_url: row.register_url,
      description_mn: row.description_mn, description_en: row.description_en,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-void-black text-frost">
      <header className="border-b border-frost/15">
        <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="text-[16px] font-[400] lowercase">← гүйгч.mn / admin</Link>
          <button onClick={signOut} className="text-caption text-smoke hover:text-frost">Sign out</button>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 py-12 grid lg:grid-cols-[480px_1fr] gap-12">
        <section>
          <div className="text-caption text-smoke mb-4">— {editingId ? "EDIT RACE" : "NEW RACE"}</div>
          {isAdmin === false && (
            <div className="mb-6 border border-frost/30 p-4 text-[13px] text-smoke">
              You're signed in but not an admin. Only admins can add/edit/delete races.
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}
            className="flex flex-col gap-3"
          >
            <Row2>
              <Field label="Name (MN)"><Input value={form.name_mn} onChange={(v) => set("name_mn", v)} /></Field>
              <Field label="Name (EN)"><Input value={form.name_en} onChange={(v) => set("name_en", v)} /></Field>
            </Row2>
            <Field label="Date"><Input type="date" value={form.race_date} onChange={(v) => set("race_date", v)} /></Field>
            <Row2>
              <Field label="Category">
                <Select value={form.category} onChange={(v) => set("category", v as any)} options={CATEGORIES} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(v) => set("status", v as any)} options={STATUSES} />
              </Field>
            </Row2>
            <Field label="Distances (comma-separated, e.g. 5K, 10K, 21K)">
              <Input value={form.distances} onChange={(v) => set("distances", v)} />
            </Field>
            <Row2>
              <Field label="Location (MN)"><Input value={form.location_mn} onChange={(v) => set("location_mn", v)} /></Field>
              <Field label="Location (EN)"><Input value={form.location_en} onChange={(v) => set("location_en", v)} /></Field>
            </Row2>
            <Row2>
              <Field label="Organizer (MN)"><Input value={form.organizer_mn} onChange={(v) => set("organizer_mn", v)} /></Field>
              <Field label="Organizer (EN)"><Input value={form.organizer_en} onChange={(v) => set("organizer_en", v)} /></Field>
            </Row2>
            <Field label="Registration URL"><Input value={form.register_url} onChange={(v) => set("register_url", v)} placeholder="https://…" /></Field>
            <Field label="Description (MN)"><Textarea value={form.description_mn} onChange={(v) => set("description_mn", v)} /></Field>
            <Field label="Description (EN)"><Textarea value={form.description_en} onChange={(v) => set("description_en", v)} /></Field>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={save.isPending}
                className="bg-reactor-lime text-void-black px-[30px] py-[14px] text-[13px] tracking-[0.06em] uppercase disabled:opacity-50"
              >
                {save.isPending ? "…" : editingId ? "Update race" : "Add race"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setForm(emptyForm); }}
                  className="border border-frost text-frost px-[30px] py-[14px] text-[13px] tracking-[0.06em] uppercase"
                >Cancel</button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="text-caption text-smoke mb-4">— RACES ({races.data?.length ?? 0})</div>
          <div className="flex flex-col">
            <div className="border-t border-frost/40" />
            {races.isLoading && <div className="py-6 text-smoke text-caption">Loading…</div>}
            {races.data?.map((r) => (
              <div key={r.id} className="border-t border-frost/15 py-4 grid grid-cols-[100px_1fr_auto] gap-4 items-start">
                <div className="text-caption text-smoke">{r.race_date}</div>
                <div>
                  <div className="text-[15px] text-frost">{r.name_en}</div>
                  <div className="text-caption text-smoke mt-1">{r.category} · {(r.distances ?? []).join(", ")}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(r)} className="text-caption text-frost hover:text-reactor-lime">Edit</button>
                  <button
                    onClick={() => { if (confirm(`Delete "${r.name_en}"?`)) del.mutate(r.id); }}
                    className="text-caption text-smoke hover:text-red-400"
                  >Delete</button>
                </div>
              </div>
            ))}
            <div className="border-t border-frost/15" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-caption text-smoke">{label}</span>
      {children}
    </label>
  );
}
function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border border-frost/30 px-3 py-2.5 text-[14px] text-frost focus:outline-none focus:border-reactor-lime"
    />
  );
}
function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="bg-transparent border border-frost/30 px-3 py-2.5 text-[14px] text-frost focus:outline-none focus:border-reactor-lime"
    />
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-void-black border border-frost/30 px-3 py-2.5 text-[14px] text-frost focus:outline-none focus:border-reactor-lime"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}