import type { Race } from "./races";

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function fold(line: string) {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 0) {
    parts.push(" " + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  return parts.join("\r\n");
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function dateOnly(iso: string) {
  return iso.replace(/-/g, "");
}

function nextDay(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Build an RFC 5545 calendar for one or many races. All-day events. */
export function buildIcs(races: Race[], lang: "mn" | "en") {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//guigch.mn//Race Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:" + esc(lang === "mn" ? "гүйгч.mn уралдаанууд" : "guigch.mn races"),
  ];

  for (const r of races) {
    const name = lang === "mn" ? r.nameMn : r.nameEn;
    const location = lang === "mn" ? r.locationMn : r.locationEn;
    const organizer = lang === "mn" ? r.organizerMn : r.organizerEn;
    const desc = [
      lang === "mn" ? r.descriptionMn : r.descriptionEn,
      organizer ? `${lang === "mn" ? "Зохион байгуулагч" : "Organizer"}: ${organizer}` : "",
      r.distances.length ? `${lang === "mn" ? "Зай" : "Distances"}: ${r.distances.join(", ")}` : "",
      r.elevationGainM != null ? `${lang === "mn" ? "Өндөрлөг" : "Elevation"}: ${r.elevationGainM} m` : "",
      r.priceInfo ? `${lang === "mn" ? "Хураамж" : "Price"}: ${r.priceInfo}` : "",
      r.regDeadline ? `${lang === "mn" ? "Бүртгэл хаагдах" : "Registration deadline"}: ${r.regDeadline}` : "",
      r.registerUrl,
    ]
      .filter(Boolean)
      .join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@guigch.mn`,
      `DTSTAMP:${stamp()}`,
      `DTSTART;VALUE=DATE:${dateOnly(r.dateISO)}`,
      `DTEND;VALUE=DATE:${nextDay(r.dateISO)}`,
      fold(`SUMMARY:${esc(name)}`),
      fold(`LOCATION:${esc(location)}`),
      fold(`DESCRIPTION:${esc(desc)}`),
    );
    if (r.registerUrl) lines.push(fold(`URL:${esc(r.registerUrl)}`));
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(races: Race[], lang: "mn" | "en", filename = "guigch-races.ics") {
  const blob = new Blob([buildIcs(races, lang)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Google Calendar "add event" URL for a single race. */
export function googleCalendarUrl(r: Race, lang: "mn" | "en") {
  const name = lang === "mn" ? r.nameMn : r.nameEn;
  const location = lang === "mn" ? r.locationMn : r.locationEn;
  const details = [lang === "mn" ? r.descriptionMn : r.descriptionEn, r.registerUrl].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: name,
    dates: `${dateOnly(r.dateISO)}/${nextDay(r.dateISO)}`,
    location,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
