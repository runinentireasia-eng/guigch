import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { logRaceAction, useIsAdmin, useSessionUser } from "@/lib/access";
import { Field, GhostButton, Input, PrimaryButton, Select, StatusPill, Textarea, VerifiedBadge } from "@/components/site/form-ui";
import { AdminMfaGate } from "@/components/site/admin-mfa-gate";
import { RaceFields, REVIEW_STATUSES, emptyRaceForm, rowToRaceForm, toRacePayload, type RaceFormValues } from "@/components/site/race-form";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin · гүйгч.mn" },
      { name: "description", content: "Review suggestions, verify organizers and publish races on the Mongolian race calendar." },
      { property: "og:title", content: "Admin · гүйгч.mn" },
      { property: "og:description", content: "Review suggestions, verify organizers and publish races." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminRoute,
});

const TABS = ["queue", "suggestions", "organizers", "reports", "duplicates", "races"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  queue: "SUBMISSIONS & EDITS",
  suggestions: "COMMUNITY SUGGESTIONS",
  organizers: "ORGANIZER REQUESTS",
  reports: "REPORTED INFO",
  duplicates: "DUPLICATE WARNINGS",
  races: "ALL RACES",
};

function AdminRoute() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  if (isLoading) return null;
  if (!isAdmin) return <AdminPage />;
  return <AdminMfaGate><AdminPage /></AdminMfaGate>;
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useSessionUser();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const [tab, setTab] = useState<Tab>("queue");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<RaceFormValues>(emptyRaceForm);
  const set = <K extends keyof RaceFormValues>(k: K, v: RaceFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const races = useQuery({
    queryKey: ["admin-races"],
    queryFn: async () => {
      const { data, error } = await supabase.from("races").select("*").order("race_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const suggestions = useQuery({
    queryKey: ["admin-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("race_suggestions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const organizers = useQuery({
    queryKey: ["admin-organizers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizer_profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const reports = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("race_reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidateRaces = () => {
    qc.invalidateQueries({ queryKey: ["admin-races"] });
    qc.invalidateQueries({ queryKey: ["races"] });
  };

  const saveRace = useMutation({
    mutationFn: async () => {
      const payload = toRacePayload(form);
      if (editingId) {
        const { error } = await supabase.from("races").update(payload).eq("id", editingId);
        if (error) throw error;
        await logRaceAction(editingId, "admin_edited");
      } else {
        const { data, error } = await supabase
          .from("races")
          .insert({ ...payload, review_status: "published" as const, published_at: new Date().toISOString(), published_by: user?.id ?? null })
          .select("id")
          .single();
        if (error) throw error;
        await logRaceAction(data.id, "admin_created_published");
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Race updated" : "Race published");
      setForm(emptyRaceForm); setEditingId(null); setCreating(false);
      invalidateRaces();
    },
    onError: (e) => toast.error(e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : "Save failed"),
  });

  const setReview = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      if (status === "approved") status = "published"; // approved races go live on the calendar
      const publishing = status === "published";
      const { error } = await supabase
        .from("races")
        .update({
          review_status: status as never,
          ...(note !== undefined ? { admin_notes: note } : {}),
          ...(publishing ? { published_at: new Date().toISOString(), published_by: user?.id ?? null } : {}),
        })
        .eq("id", id);
      if (error) throw error;
      await logRaceAction(id, `set_${status}`, note ?? "");
    },
    onSuccess: () => { toast.success("Race status updated"); invalidateRaces(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const assignOwner = useMutation({
    mutationFn: async ({ id, ownerId }: { id: string; ownerId: string }) => {
      const { error } = await supabase.from("races").update({ owner_id: ownerId || null }).eq("id", id);
      if (error) throw error;
      await logRaceAction(id, "assigned_owner", ownerId);
    },
    onSuccess: () => { toast.success("Owner assigned"); invalidateRaces(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Assign failed"),
  });

  const delRace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("races").delete().eq("id", id);
      if (error) throw error;
      await logRaceAction(null, "deleted_race", id);
    },
    onSuccess: () => { toast.success("Race deleted"); invalidateRaces(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const reviewSuggestion = useMutation({
    mutationFn: async ({ id, status, note, suggestion }: { id: string; status: "approved" | "rejected"; note?: string; suggestion?: any }) => {
      if (status === "approved" && suggestion) {
        if (!suggestion.race_date) throw new Error("Suggestion has no date — add the race manually");
        const { data, error: insErr } = await supabase
          .from("races")
          .insert({
            name_mn: suggestion.race_name, name_en: suggestion.race_name,
            race_date: suggestion.race_date,
            location_mn: suggestion.location ?? "", location_en: suggestion.location ?? "",
            organizer_mn: suggestion.organizer_name ?? "", organizer_en: suggestion.organizer_name ?? "",
            category: "road", register_url: suggestion.link ?? "",
            description_mn: suggestion.notes ?? "", description_en: suggestion.notes ?? "",
            review_status: "published" as const,
            published_at: new Date().toISOString(), published_by: user?.id ?? null,
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        await logRaceAction(data.id, "published_from_suggestion", id);
      }
      const { error } = await supabase
        .from("race_suggestions")
        .update({ status, admin_notes: note ?? "", reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Suggestion reviewed"); qc.invalidateQueries({ queryKey: ["admin-suggestions"] }); invalidateRaces(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const reviewOrganizer = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: "verified" | "rejected"; note?: string }) => {
      const { error } = await supabase
        .from("organizer_profiles")
        .update({ status, admin_notes: note ?? "", reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Organizer reviewed");
      qc.invalidateQueries({ queryKey: ["admin-organizers"] });
      qc.invalidateQueries({ queryKey: ["verified-organizers"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const resolveReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("race_reports").update({ resolved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Report resolved"); qc.invalidateQueries({ queryKey: ["admin-reports"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const duplicates = useMemo(() => {
    const map = new Map<string, typeof races.data>();
    for (const r of races.data ?? []) {
      const key = `${r.name_en.trim().toLowerCase()}|${r.race_date}`;
      map.set(key, [...(map.get(key) ?? []), r] as typeof races.data);
    }
    return [...map.values()].filter((g) => (g?.length ?? 0) > 1);
  }, [races.data]);

  const queue = (races.data ?? []).filter((r) =>
    ["pending_verification", "needs_changes", "approved", "draft"].includes(r.review_status));

  const verifiedOrgs = (organizers.data ?? []).filter((o) => o.status === "verified");

  function startEdit(row: any) {
    setEditingId(row.id); setCreating(false); setForm(rowToRaceForm(row));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (!roleLoading && isAdmin === false) {
    return (
      <div className="min-h-screen bg-void-black text-frost font-[300]">
        <div className="max-w-[1280px] mx-auto px-6 py-20">
          <div className="text-caption text-smoke mb-4">ADMIN</div>
          <p className="text-[15px] text-ash">You're signed in but not a platform admin.</p>
          <div className="mt-6"><Link to="/organizer" className="text-caption text-zurkhai">Go to organizer dashboard →</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-black text-frost font-[300]">
      <header className="border-b border-frost/15">
        <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="text-[16px] font-[400] lowercase">← гүйгч.mn / admin</Link>
          <button onClick={signOut} className="text-caption text-smoke hover:text-frost">Sign out</button>
        </div>
      </header>

      <div className="border-b border-frost/15">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap gap-6 py-4">
          {TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`text-[12px] ${tab === tb ? "text-zurkhai" : "text-smoke hover:text-frost"}`}
            >
              {TAB_LABEL[tb]}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col gap-12">
        {(creating || editingId) && (
          <section className="max-w-[620px]">
            <div className="text-caption text-smoke mb-4">{editingId ? "EDIT RACE" : "NEW RACE"}</div>
            <form onSubmit={(e) => { e.preventDefault(); saveRace.mutate(); }} className="flex flex-col gap-3">
              <RaceFields form={form} set={set} />
              <div className="flex flex-wrap gap-3 mt-2">
                <PrimaryButton type="submit" disabled={saveRace.isPending}>
                  {saveRace.isPending ? "…" : editingId ? "SAVE CHANGES" : "CREATE & PUBLISH"}
                </PrimaryButton>
                <GhostButton onClick={() => { setEditingId(null); setCreating(false); setForm(emptyRaceForm); }}>CANCEL</GhostButton>
              </div>
            </form>
          </section>
        )}

        {tab === "queue" && (
          <Section title={`SUBMISSIONS & EDITS (${queue.length})`}>
            {queue.map((r) => (
              <RaceReviewRow
                key={r.id}
                race={r}
                verifiedOrgs={verifiedOrgs}
                onEdit={() => startEdit(r)}
                onStatus={(status, note) => setReview.mutate({ id: r.id, status, note })}
                onAssign={(ownerId) => assignOwner.mutate({ id: r.id, ownerId })}
              />
            ))}
            {queue.length === 0 && <Empty />}
          </Section>
        )}

        {tab === "suggestions" && (
          <Section title={`COMMUNITY SUGGESTIONS (${suggestions.data?.length ?? 0})`}>
            {(suggestions.data ?? []).map((s) => (
              <div key={s.id} className="border-t border-zurkhai/20 py-4 flex flex-wrap gap-4 justify-between">
                <div className="max-w-[640px]">
                  <div className="text-[15px]">{s.race_name}</div>
                  <div className="text-caption text-smoke mt-1">{s.race_date ?? "—"} · {s.location || "—"} · {s.organizer_name || "—"}</div>
                  {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="text-caption text-zurkhai block mt-1">{s.link}</a>}
                  {s.notes && <p className="text-[13px] text-ash mt-2">{s.notes}</p>}
                  <div className="text-caption text-smoke mt-2">From {s.submitter_name} · {s.submitter_email}</div>
                  <div className="mt-2"><StatusPill status={s.status} /></div>
                </div>
                <div className="flex gap-3 items-start">
                  <button
                    onClick={() => {
                      setForm({ ...emptyRaceForm, name_en: s.race_name, name_mn: s.race_name, race_date: s.race_date ?? "", location_en: s.location, location_mn: s.location, organizer_en: s.organizer_name, organizer_mn: s.organizer_name, register_url: s.link });
                      setCreating(true); setEditingId(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-caption text-frost hover:text-zurkhai"
                  >Create race</button>
                  <button onClick={() => reviewSuggestion.mutate({ id: s.id, status: "approved", suggestion: s })} className="text-caption text-frost hover:text-zurkhai">Approve</button>
                     <button onClick={() => reviewSuggestion.mutate({ id: s.id, status: "rejected", note: prompt("Reason (optional)") ?? "" })} className="text-caption text-smoke hover:text-frost">Reject</button>
                </div>
              </div>
            ))}
            {(suggestions.data?.length ?? 0) === 0 && <Empty />}
          </Section>
        )}

        {tab === "organizers" && (
          <Section title={`ORGANIZER REQUESTS (${organizers.data?.length ?? 0})`}>
            {(organizers.data ?? []).map((o) => (
              <div key={o.id} className="border-t border-zurkhai/20 py-4 flex flex-wrap gap-4 justify-between">
                <div className="max-w-[640px]">
                  <div className="flex items-center gap-3">
                    <span className="text-[15px]">{o.org_name}</span>
                    {o.status === "verified" ? <VerifiedBadge /> : <StatusPill status={o.status} />}
                  </div>
                  <div className="text-caption text-smoke mt-1">{o.contact_person} · {o.email} · {o.phone}</div>
                  {o.website && <a href={o.website} target="_blank" rel="noreferrer" className="text-caption text-zurkhai block mt-1">{o.website}</a>}
                  <p className="text-[13px] text-ash mt-2">{o.proof}</p>
                  {o.previous_event_url && <div className="text-caption text-smoke mt-1">Previous: {o.previous_event_url}</div>}
                </div>
                <div className="flex gap-3 items-start">
                  <button onClick={() => reviewOrganizer.mutate({ id: o.id, status: "verified" })} className="text-caption text-frost hover:text-zurkhai">Verify</button>
                   <button onClick={() => reviewOrganizer.mutate({ id: o.id, status: "rejected", note: prompt("Reason (optional)") ?? "" })} className="text-caption text-smoke hover:text-frost">Reject</button>
                </div>
              </div>
            ))}
            {(organizers.data?.length ?? 0) === 0 && <Empty />}
          </Section>
        )}

        {tab === "reports" && (
          <Section title={`REPORTED INFORMATION (${reports.data?.length ?? 0})`}>
            {(reports.data ?? []).map((rep) => (
              <div key={rep.id} className="border-t border-zurkhai/20 py-4 flex flex-wrap gap-4 justify-between">
                <div className="max-w-[640px]">
                  <div className="text-[14px] text-ash">{rep.reason}</div>
                  <div className="text-caption text-smoke mt-1">
                    {(races.data ?? []).find((r) => r.id === rep.race_id)?.name_en ?? "—"} · {rep.reporter_email || "anonymous"}
                  </div>
                  <div className="mt-2"><StatusPill status={rep.resolved ? "approved" : "pending_verification"} /></div>
                </div>
                {!rep.resolved && (
                  <button onClick={() => resolveReport.mutate(rep.id)} className="text-caption text-frost hover:text-zurkhai">Resolve</button>
                )}
              </div>
            ))}
            {(reports.data?.length ?? 0) === 0 && <Empty />}
          </Section>
        )}

        {tab === "duplicates" && (
          <Section title={`DUPLICATE WARNINGS (${duplicates.length})`}>
            {duplicates.map((group, i) => (
              <div key={i} className="border-t border-frost/15 py-4">
                <div className="text-caption text-smoke mb-2">Same name and date — merge by keeping one and deleting the others.</div>
                {(group ?? []).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2">
                    <div className="text-[14px]">{r.name_en} · {r.race_date} · <StatusPill status={r.review_status} /></div>
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(r)} className="text-caption text-frost hover:text-zurkhai">Keep & edit</button>
                      <button onClick={() => { if (confirm("Merge by deleting this duplicate?")) delRace.mutate(r.id); }} className="text-caption text-smoke hover:text-red-400">Merge away</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {duplicates.length === 0 && <Empty />}
          </Section>
        )}

        {tab === "races" && (
          <Section title={`ALL RACES (${races.data?.length ?? 0})`}>
            <div className="pb-4"><PrimaryButton onClick={() => { setForm(emptyRaceForm); setCreating(true); setEditingId(null); }}>NEW RACE</PrimaryButton></div>
            {(races.data ?? []).map((r) => (
              <RaceReviewRow
                key={r.id}
                race={r}
                verifiedOrgs={verifiedOrgs}
                onEdit={() => startEdit(r)}
                onStatus={(status, note) => setReview.mutate({ id: r.id, status, note })}
                onAssign={(ownerId) => assignOwner.mutate({ id: r.id, ownerId })}
                onDelete={() => { if (confirm(`Delete "${r.name_en}"?`)) delRace.mutate(r.id); }}
              />
            ))}
            {(races.data?.length ?? 0) === 0 && <Empty />}
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-caption text-smoke mb-4">{title}</div>
      <div className="border-t border-frost/20" />
      {children}
      <div className="border-t border-frost/15" />
    </section>
  );
}

function Empty() {
  return <div className="py-6 text-caption text-smoke">Nothing here right now.</div>;
}

function RaceReviewRow({
  race, verifiedOrgs, onEdit, onStatus, onAssign, onDelete,
}: {
  race: any;
  verifiedOrgs: any[];
  onEdit: () => void;
  onStatus: (status: string, note?: string) => void;
  onAssign: (ownerId: string) => void;
  onDelete?: () => void;
}) {
  const [note, setNote] = useState(race.admin_notes ?? "");
  const [open, setOpen] = useState(false);
  const owner = verifiedOrgs.find((o) => o.user_id === race.owner_id);
  return (
    <div className="border-t border-frost/15 py-4">
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <div className="text-[15px]">{race.name_en}</div>
          <div className="text-caption text-smoke mt-1">{race.race_date} · {race.category} · {(race.distances ?? []).join(", ")}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <StatusPill status={race.review_status} />
            {owner && <VerifiedBadge label={`VERIFIED · ${owner.org_name}`} />}
            <span className="text-caption text-smoke">{race.view_count ?? 0} views</span>
            {race.published_at && <span className="text-caption text-smoke">published {new Date(race.published_at).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <button onClick={() => setOpen((o) => !o)} className="text-caption text-frost hover:text-zurkhai">Review</button>
          <button onClick={onEdit} className="text-caption text-frost hover:text-zurkhai">Edit</button>
          {onDelete && <button onClick={onDelete} className="text-caption text-smoke hover:text-frost">Delete</button>}
        </div>
      </div>
      {open && (
        <div className="mt-4 border border-frost/20 p-4 flex flex-col gap-3">
          <Field label="Internal review notes"><Textarea value={note} onChange={setNote} rows={2} /></Field>
          <Field label="Status">
            <Select value={race.review_status} onChange={(v) => onStatus(v, note)} options={REVIEW_STATUSES} />
          </Field>
          <Field label="Assign to verified organizer">
            <select
              value={race.owner_id ?? ""}
              onChange={(e) => onAssign(e.target.value)}
              className="bg-void-black border border-frost/30 px-3 py-2.5 text-[14px] text-frost focus:outline-none focus:border-zurkhai"
            >
              <option value="">— unassigned —</option>
              {verifiedOrgs.map((o) => <option key={o.id} value={o.user_id}>{o.org_name}</option>)}
            </select>
          </Field>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => onStatus("published", note)}>PUBLISH</PrimaryButton>
            <GhostButton onClick={() => onStatus("needs_changes", note)}>REQUEST CHANGES</GhostButton>
            <GhostButton onClick={() => onStatus("approved", note)}>APPROVE</GhostButton>
            <GhostButton onClick={() => onStatus("draft", note)}>UNPUBLISH</GhostButton>
            <GhostButton onClick={() => onStatus("archived", note)}>ARCHIVE</GhostButton>
          </div>
        </div>
      )}
    </div>
  );
}

