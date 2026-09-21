import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { logRaceAction, useIsAdmin, useMyOrganizerProfile, useSessionUser } from "@/lib/access";
import { Field, GhostButton, Input, PrimaryButton, Row2, StatusPill, Textarea, VerifiedBadge } from "@/components/site/form-ui";
import { RaceFields, emptyRaceForm, rowToRaceForm, toRacePayload, type RaceFormValues } from "@/components/site/race-form";

export const Route = createFileRoute("/_authenticated/organizer")({
  head: () => ({
    meta: [
      { title: "Organizer dashboard · гүйгч.mn" },
      { name: "description", content: "Create and manage your official race pages on the Mongolian race calendar." },
      { property: "og:title", content: "Organizer dashboard · гүйгч.mn" },
      { property: "og:description", content: "Create and manage your official race pages on the Mongolian race calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrganizerPage,
});

const verificationSchema = z.object({
  org_name: z.string().trim().min(1, "Organizer name is required").max(200),
  contact_person: z.string().trim().min(1, "Contact person is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(50),
  website: z.string().trim().url("Must be a valid URL").max(500).or(z.literal("")),
  proof: z.string().trim().min(1, "Please describe your role").max(1000),
  previous_event_url: z.string().trim().url("Must be a valid URL").max(500).or(z.literal("")),
});

function Header() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsAdmin();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }
  return (
    <header className="border-b border-frost/15">
      <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="text-[16px] font-[400] lowercase">← гүйгч.mn / organizer</Link>
        <div className="flex items-center gap-4">
          {isAdmin && <Link to="/admin" className="text-caption text-smoke hover:text-frost">Admin dashboard</Link>}
          <button onClick={signOut} className="text-caption text-smoke hover:text-frost">Sign out</button>
        </div>
      </div>
    </header>
  );
}

function OrganizerPage() {
  const { data: profile, isLoading } = useMyOrganizerProfile();

  return (
    <div className="min-h-screen bg-void-black text-frost font-[300]">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6 py-12">
        {isLoading ? (
          <div className="text-caption text-smoke">Loading…</div>
        ) : !profile ? (
          <VerificationForm />
        ) : profile.status === "verified" ? (
          <OrganizerWorkspace orgName={profile.org_name} />
        ) : (
          <div className="max-w-[560px]">
            <div className="text-caption text-smoke mb-4">ORGANIZER VERIFICATION</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[20px] font-[400]">{profile.org_name}</span>
              <StatusPill status={profile.status} />
            </div>
            <p className="text-[14px] leading-[1.6] text-ash">
              {profile.status === "pending"
                ? "Your verification request is under review. You'll be able to create official race pages once an admin verifies your organization."
                : "Your verification request was rejected. You can suggest races as a community member, or contact us to appeal."}
            </p>
            {profile.admin_notes && (
              <p className="mt-4 border border-frost/20 p-4 text-[13px] text-smoke">
                Reviewer notes: {profile.admin_notes}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function VerificationForm() {
  const qc = useQueryClient();
  const { data: user } = useSessionUser();
  const [form, setForm] = useState({
    org_name: "", contact_person: "", email: "", phone: "",
    website: "", proof: "", previous_event_url: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const apply = useMutation({
    mutationFn: async () => {
      const parsed = verificationSchema.parse(form);
      const { error } = await supabase.from("organizer_profiles").insert({
        ...parsed,
        user_id: user!.id,
        status: "pending" as const,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Verification request submitted");
      qc.invalidateQueries({ queryKey: ["my-organizer"] });
    },
    onError: (e) => toast.error(e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="max-w-[620px]">
      <div className="text-caption text-smoke mb-4">ORGANIZER VERIFICATION</div>
      <h1 className="text-[28px] leading-[1.2] font-[400] mb-3">Are you the organizer?</h1>
      <p className="text-[14px] leading-[1.6] text-ash mb-8">
        Verify your organization to manage official race pages.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); apply.mutate(); }} className="flex flex-col gap-3">
        <Field label="Organizer or organization name"><Input value={form.org_name} onChange={(v) => set("org_name", v)} /></Field>
        <Row2>
          <Field label="Contact person"><Input value={form.contact_person} onChange={(v) => set("contact_person", v)} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(v) => set("email", v)} /></Field>
        </Row2>
        <Row2>
          <Field label="Phone number"><Input value={form.phone} onChange={(v) => set("phone", v)} /></Field>
          <Field label="Official website or social page"><Input value={form.website} onChange={(v) => set("website", v)} placeholder="https://…" /></Field>
        </Row2>
        <Field label="Proof of organizer role"><Textarea value={form.proof} onChange={(v) => set("proof", v)} placeholder="Describe your role, or link to documentation" /></Field>
        <Field label="Previous event link (if available)"><Input value={form.previous_event_url} onChange={(v) => set("previous_event_url", v)} placeholder="https://…" /></Field>
        <div className="mt-3">
          <PrimaryButton type="submit" disabled={apply.isPending}>
            {apply.isPending ? "…" : "SUBMIT FOR VERIFICATION"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

function OrganizerWorkspace({ orgName }: { orgName: string }) {
  const qc = useQueryClient();
  const { data: user } = useSessionUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<RaceFormValues>(emptyRaceForm);
  const set = <K extends keyof RaceFormValues>(k: K, v: RaceFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const races = useQuery({
    queryKey: ["my-races", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .eq("owner_id", user!.id)
        .order("race_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (submit: boolean) => {
      const payload = toRacePayload(form);
      const review_status = submit ? ("pending_verification" as const) : ("draft" as const);
      if (editingId) {
        const current = races.data?.find((r) => r.id === editingId);
        const keepPublished = current?.review_status === "published" && !submit;
        const { error } = await supabase
          .from("races")
          .update({ ...payload, ...(keepPublished ? {} : { review_status }) })
          .eq("id", editingId);
        if (error) throw error;
        await logRaceAction(editingId, submit ? "submitted_for_publication" : "saved_draft");
      } else {
        const { data, error } = await supabase
          .from("races")
          .insert({ ...payload, owner_id: user!.id, review_status })
          .select("id")
          .single();
        if (error) throw error;
        await logRaceAction(data.id, submit ? "submitted_for_publication" : "created_draft");
      }
    },
    onSuccess: (_d, submit) => {
      toast.success(submit ? "Submitted for admin approval" : "Draft saved");
      setForm(emptyRaceForm); setEditingId(null); setCreating(false);
      qc.invalidateQueries({ queryKey: ["my-races"] });
      qc.invalidateQueries({ queryKey: ["races"] });
    },
    onError: (e) => toast.error(e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : "Save failed"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "postponed" | "cancelled" }) => {
      const { error } = await supabase.from("races").update({ review_status: status }).eq("id", id);
      if (error) throw error;
      await logRaceAction(id, `marked_${status}`);
    },
    onSuccess: () => {
      toast.success("Race updated");
      qc.invalidateQueries({ queryKey: ["my-races"] });
      qc.invalidateQueries({ queryKey: ["races"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const showForm = creating || editingId;

  return (
    <div className="grid lg:grid-cols-[520px_1fr] gap-12">
      <section>
        <div className="flex items-center gap-3 mb-4">
           <div className="text-caption text-smoke">{orgName}</div>
          <VerifiedBadge />
        </div>
        {showForm ? (
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(true); }} className="flex flex-col gap-3">
            <div className="text-caption text-smoke">{editingId ? "EDIT RACE" : "NEW OFFICIAL RACE"}</div>
            <RaceFields form={form} set={set} />
            <div className="flex flex-wrap gap-3 mt-2">
              <PrimaryButton type="submit" disabled={save.isPending}>
                {save.isPending ? "…" : "SUBMIT FOR PUBLICATION"}
              </PrimaryButton>
              <GhostButton onClick={() => save.mutate(false)} disabled={save.isPending}>SAVE DRAFT</GhostButton>
              <GhostButton onClick={() => { setEditingId(null); setCreating(false); setForm(emptyRaceForm); }}>CANCEL</GhostButton>
            </div>
          </form>
        ) : (
          <div>
            <PrimaryButton onClick={() => { setForm(emptyRaceForm); setCreating(true); }}>CREATE OFFICIAL RACE</PrimaryButton>
          </div>
        )}
      </section>

      <section>
        <div className="text-caption text-smoke mb-4">MY RACES ({races.data?.length ?? 0})</div>
        <div className="border-t border-frost/20" />
        {races.isLoading && <div className="py-6 text-caption text-smoke">Loading…</div>}
        {races.data?.length === 0 && <div className="py-6 text-caption text-smoke">No races yet.</div>}
        {races.data?.map((r) => (
          <div key={r.id} className="border-t border-frost/15 py-4 flex flex-wrap gap-4 items-start justify-between">
            <div>
              <div className="text-[15px] text-frost">{r.name_en}</div>
              <div className="text-caption text-smoke mt-1">
                {r.race_date} · {r.category} · {(r.distances ?? []).join(", ")}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StatusPill status={r.review_status} />
                <span className="text-caption text-smoke">{r.view_count ?? 0} views</span>
              </div>
              {r.admin_notes && <div className="mt-2 text-caption text-smoke">Reviewer: {r.admin_notes}</div>}
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => { setEditingId(r.id); setCreating(false); setForm(rowToRaceForm(r)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="text-caption text-frost hover:text-zurkhai"
              >Edit</button>
              <button
                onClick={() => setStatus.mutate({ id: r.id, status: "postponed" })}
                className="text-caption text-smoke hover:text-frost"
              >Postpone</button>
              <button
                onClick={() => { if (confirm(`Cancel "${r.name_en}"?`)) setStatus.mutate({ id: r.id, status: "cancelled" }); }}
                className="text-caption text-smoke hover:text-frost"
              >Cancel</button>
            </div>
          </div>
        ))}
        <div className="border-t border-frost/15" />
      </section>
    </div>
  );
}
