import { z } from "zod";
import { Field, Input, Row2, Select, Textarea } from "./form-ui";

export const CATEGORIES = ["road", "trail", "ultra", "fun"] as const;
export const REG_STATUSES = ["open", "closing_soon", "waitlist"] as const;
export const REVIEW_STATUSES = [
  "draft", "pending_verification", "needs_changes", "approved",
  "published", "postponed", "cancelled", "archived",
] as const;

export const raceSchema = z.object({
  name_mn: z.string().trim().min(1, "Required").max(200),
  name_en: z.string().trim().min(1, "Required").max(200),
  race_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  location_mn: z.string().trim().max(200),
  location_en: z.string().trim().max(200),
  organizer_mn: z.string().trim().max(200),
  organizer_en: z.string().trim().max(200),
  category: z.enum(CATEGORIES),
  distances: z.string().max(200),
  elevation_gain_m: z.string().regex(/^\d*$/, "Numbers only").max(6),
  price_info: z.string().trim().max(200),
  reg_deadline: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use YYYY-MM-DD"),
  status: z.enum(REG_STATUSES),
  register_url: z.string().trim().url("Must be a valid URL").max(500).or(z.literal("")),
  description_mn: z.string().trim().max(2000),
  description_en: z.string().trim().max(2000),
  schedule_info: z.string().trim().max(2000),
  course_info: z.string().trim().max(2000),
  results_info: z.string().trim().max(2000),
});

export type RaceFormValues = z.infer<typeof raceSchema>;

export const emptyRaceForm: RaceFormValues = {
  name_mn: "", name_en: "", race_date: "", location_mn: "", location_en: "",
  organizer_mn: "", organizer_en: "", category: "road", distances: "",
  elevation_gain_m: "", price_info: "", reg_deadline: "",
  status: "open", register_url: "", description_mn: "", description_en: "",
  schedule_info: "", course_info: "", results_info: "",
};

export function toRacePayload(values: RaceFormValues) {
  const parsed = raceSchema.parse(values);
  return {
    ...parsed,
    distances: parsed.distances.split(",").map((s) => s.trim()).filter(Boolean),
    elevation_gain_m: parsed.elevation_gain_m === "" ? null : Number(parsed.elevation_gain_m),
    reg_deadline: parsed.reg_deadline === "" ? null : parsed.reg_deadline,
  };
}

export function rowToRaceForm(row: any): RaceFormValues {
  return {
    name_mn: row.name_mn ?? "", name_en: row.name_en ?? "", race_date: row.race_date ?? "",
    location_mn: row.location_mn ?? "", location_en: row.location_en ?? "",
    organizer_mn: row.organizer_mn ?? "", organizer_en: row.organizer_en ?? "",
    category: row.category ?? "road", distances: (row.distances ?? []).join(", "),
    elevation_gain_m: row.elevation_gain_m != null ? String(row.elevation_gain_m) : "",
    price_info: row.price_info ?? "", reg_deadline: row.reg_deadline ?? "",
    status: row.status ?? "open", register_url: row.register_url ?? "",
    description_mn: row.description_mn ?? "", description_en: row.description_en ?? "",
    schedule_info: row.schedule_info ?? "", course_info: row.course_info ?? "",
    results_info: row.results_info ?? "",
  };
}

export function RaceFields({
  form, set,
}: { form: RaceFormValues; set: <K extends keyof RaceFormValues>(k: K, v: RaceFormValues[K]) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Row2>
        <Field label="Name (MN)"><Input value={form.name_mn} onChange={(v) => set("name_mn", v)} /></Field>
        <Field label="Name (EN)"><Input value={form.name_en} onChange={(v) => set("name_en", v)} /></Field>
      </Row2>
      <Field label="Date"><Input type="date" value={form.race_date} onChange={(v) => set("race_date", v)} /></Field>
      <Row2>
        <Field label="Category">
          <Select value={form.category} onChange={(v) => set("category", v as RaceFormValues["category"])} options={CATEGORIES} />
        </Field>
        <Field label="Registration status">
          <Select value={form.status} onChange={(v) => set("status", v as RaceFormValues["status"])} options={REG_STATUSES} />
        </Field>
      </Row2>
      <Field label="Distances (comma-separated, e.g. 5K, 10K, 21K)">
        <Input value={form.distances} onChange={(v) => set("distances", v)} />
      </Field>
      <Row2>
        <Field label="Elevation gain (m)">
          <Input value={form.elevation_gain_m} onChange={(v) => set("elevation_gain_m", v)} placeholder="e.g. 1200" />
        </Field>
        <Field label="Entry price">
          <Input value={form.price_info} onChange={(v) => set("price_info", v)} placeholder="e.g. 45,000₮ / 10K" />
        </Field>
      </Row2>
      <Field label="Registration deadline">
        <Input type="date" value={form.reg_deadline} onChange={(v) => set("reg_deadline", v)} />
      </Field>
      <Row2>
        <Field label="Location (MN)"><Input value={form.location_mn} onChange={(v) => set("location_mn", v)} /></Field>
        <Field label="Location (EN)"><Input value={form.location_en} onChange={(v) => set("location_en", v)} /></Field>
      </Row2>
      <Row2>
        <Field label="Organizer (MN)"><Input value={form.organizer_mn} onChange={(v) => set("organizer_mn", v)} /></Field>
        <Field label="Organizer (EN)"><Input value={form.organizer_en} onChange={(v) => set("organizer_en", v)} /></Field>
      </Row2>
      <Field label="Registration URL">
        <Input value={form.register_url} onChange={(v) => set("register_url", v)} placeholder="https://…" />
      </Field>
      <Field label="Description (MN)"><Textarea value={form.description_mn} onChange={(v) => set("description_mn", v)} /></Field>
      <Field label="Description (EN)"><Textarea value={form.description_en} onChange={(v) => set("description_en", v)} /></Field>
      <Field label="Schedule"><Textarea value={form.schedule_info} onChange={(v) => set("schedule_info", v)} placeholder="Start times, expo, bib pickup…" /></Field>
      <Field label="Course information"><Textarea value={form.course_info} onChange={(v) => set("course_info", v)} placeholder="Route, elevation, aid stations…" /></Field>
      <Field label="Results"><Textarea value={form.results_info} onChange={(v) => set("results_info", v)} placeholder="Results link or summary" /></Field>
    </div>
  );
}
