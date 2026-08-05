import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { Field, GhostButton, Input, Modal, PrimaryButton, Row2, Textarea } from "./form-ui";

const suggestionSchema = z.object({
  race_name: z.string().trim().min(1, "Race name is required").max(200),
  race_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"),
  location: z.string().trim().max(200),
  organizer_name: z.string().trim().max(200),
  link: z.string().trim().url("Must be a valid URL").max(500).or(z.literal("")),
  notes: z.string().trim().max(1000),
  submitter_name: z.string().trim().min(1, "Your name is required").max(120),
  submitter_email: z.string().trim().email("Enter a valid email").max(255),
});

type Step = "choose" | "suggest" | "done";

export function AddRaceModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const mn = lang === "mn";
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("choose");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    race_name: "", race_date: "", location: "", organizer_name: "",
    link: "", notes: "", submitter_name: "", submitter_email: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function continueAsOrganizer() {
    const { data } = await supabase.auth.getUser();
    onClose();
    navigate({ to: data.user ? "/organizer" : "/auth" });
  }

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = suggestionSchema.parse(form);
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("race_suggestions").insert({
        ...parsed,
        submitted_by: userData.user?.id ?? null,
        status: "pending" as const,
      });
      if (error) throw error;
      setStep("done");
    } catch (err) {
      toast.error(err instanceof z.ZodError ? err.issues[0].message : err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  const header = (title: string) => (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="text-caption text-smoke">{title}</div>
      <button
        onClick={onClose}
        aria-label={mn ? "Хаах" : "Close"}
        className="size-8 flex items-center justify-center border border-frost/30 text-frost text-[14px] hover:bg-zurkhai hover:text-void-black hover:border-zurkhai"
      >✕</button>
    </div>
  );

  if (step === "done") {
    return (
      <Modal onClose={onClose} label="Suggestion received">
        {header(mn ? "— ХҮЛЭЭН АВЛАА" : "— RECEIVED")}
        <h3 className="text-[24px] leading-[1.25] tracking-[-0.02em] font-[400]">
          {mn
            ? "Баярлалаа. Бид уралдааныг хуанлид нэмэхээсээ өмнө шалгана."
            : "Thanks. We'll verify the event before adding it to the calendar."}
        </h3>
        <div className="mt-6"><PrimaryButton onClick={onClose}>{mn ? "ХААХ" : "CLOSE"}</PrimaryButton></div>
      </Modal>
    );
  }

  if (step === "suggest") {
    return (
      <Modal onClose={onClose} label="Suggest a race" wide>
        {header(mn ? "— УРАЛДААН САНАЛ БОЛГОХ" : "— SUGGEST A RACE")}
        <h3 className="text-[24px] leading-[1.25] tracking-[-0.02em] font-[400] mb-6">
          {mn ? "Дутуу уралдаан олсон уу?" : "Found a race we're missing?"}
        </h3>
        <form onSubmit={submitSuggestion} className="flex flex-col gap-3">
          <Field label={mn ? "Уралдааны нэр" : "Race name"}>
            <Input value={form.race_name} onChange={(v) => set("race_name", v)} required />
          </Field>
          <Row2>
            <Field label={mn ? "Огноо" : "Date"}>
              <Input type="date" value={form.race_date} onChange={(v) => set("race_date", v)} required />
            </Field>
            <Field label={mn ? "Байршил" : "Location"}>
              <Input value={form.location} onChange={(v) => set("location", v)} />
            </Field>
          </Row2>
          <Field label={mn ? "Зохион байгуулагчийн нэр" : "Organizer name"}>
            <Input value={form.organizer_name} onChange={(v) => set("organizer_name", v)} />
          </Field>
          <Field label={mn ? "Албан ёсны вэб эсвэл сошиал хаяг" : "Official website or social media link"}>
            <Input value={form.link} onChange={(v) => set("link", v)} placeholder="https://…" />
          </Field>
          <Field label={mn ? "Нэмэлт тайлбар" : "Additional notes"}>
            <Textarea value={form.notes} onChange={(v) => set("notes", v)} />
          </Field>
          <Row2>
            <Field label={mn ? "Таны нэр" : "Submitter name"}>
              <Input value={form.submitter_name} onChange={(v) => set("submitter_name", v)} required />
            </Field>
            <Field label={mn ? "Таны и-мэйл" : "Submitter email"}>
              <Input type="email" value={form.submitter_email} onChange={(v) => set("submitter_email", v)} required />
            </Field>
          </Row2>
          <div className="flex gap-3 mt-3">
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "…" : mn ? "ИЛГЭЭХ" : "SUBMIT SUGGESTION"}
            </PrimaryButton>
            <GhostButton onClick={() => setStep("choose")}>{mn ? "БУЦАХ" : "BACK"}</GhostButton>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} label="Add a race" wide>
      {header(mn ? "— УРАЛДААН НЭМЭХ" : "— ADD A RACE")}
      <div className="grid sm:grid-cols-2 gap-px bg-frost/15 border border-frost/15">
        <div className="bg-void-black p-6 flex flex-col">
          <div className="text-[17px] font-[400] tracking-[0.01em]">
            {mn ? "Дутуу уралдаан санал болгох" : "Suggest a missing race"}
          </div>
          <p className="mt-3 text-[13px] leading-[1.6] text-smoke flex-1">
            {mn
              ? "Жагсаалтад ороогүй уралдаан олсон гүйгчид болон олон нийтэд зориулав."
              : "For runners and community members who found an event that isn't listed."}
          </p>
          <div className="mt-6"><PrimaryButton onClick={() => setStep("suggest")}>{mn ? "УРАЛДААН САНАЛ БОЛГОХ" : "SUGGEST A RACE"}</PrimaryButton></div>
        </div>
        <div className="bg-void-black p-6 flex flex-col">
          <div className="text-[17px] font-[400] tracking-[0.01em]">
            {mn ? "Албан ёсны уралдаан үүсгэх" : "Create an official race"}
          </div>
          <p className="mt-3 text-[13px] leading-[1.6] text-smoke flex-1">
            {mn
              ? "Өөрийн арга хэмжээний хуудсыг үүсгэж, удирдахыг хүссэн зохион байгуулагчдад."
              : "For organizers who want to create and manage their event page."}
          </p>
          <div className="mt-6"><GhostButton onClick={continueAsOrganizer}>{mn ? "ЗОХИОН БАЙГУУЛАГЧААР ҮРГЭЛЖЛҮҮЛЭХ" : "CONTINUE AS ORGANIZER"}</GhostButton></div>
        </div>
      </div>
    </Modal>
  );
}
