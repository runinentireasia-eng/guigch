import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "mn" | "en";

type Dict = Record<string, { mn: string; en: string }>;

export const dict = {
  heroPreLabel: { mn: "2026 УЛИРАЛ", en: "2026 SEASON" },
  heroMainTitle: { mn: "МОНГОЛЫН ГҮЙЛТ", en: "MONGOLIA RUNS" },
  heroMainSubtitle: {
    mn: "Улаанбаатараас Говь, Хөвсгөл хүртэлх бүх уралдааны нэг л газар.",
    en: "Every race from Ulaanbaatar to the Gobi and Khövsgöl, in one place.",
  },
  discoverRaces: { mn: "УРАЛДААНУУДЫГ ХАРАХ", en: "DISCOVER RACES" },
  brand: { mn: "гүйгч", en: "guigch" },
  announcement: {
    mn: "МОНГОЛЫН УРАЛДААНЫ АЛБАН ЁСНЫ ХУАНЛИ · 2026 УЛИРАЛ НЭЭЛТТЭЙ",
    en: "OFFICIAL MONGOLIAN RACE CALENDAR · 2026 SEASON OPEN",
  },
  readMore: { mn: "ДЭЛГЭРЭНГҮЙ →", en: "READ MORE →" },
  navCalendar: { mn: "ХУАНЛИ", en: "CALENDAR" },
  navOrganizers: { mn: "ЗОХИОН БАЙГУУЛАГЧ", en: "ORGANIZERS" },
  navResults: { mn: "ҮР ДҮН", en: "RESULTS" },
  logIn: { mn: "НЭВТРЭХ", en: "LOG IN" },
  addRace: { mn: "УРАЛДААН НЭМЭХ", en: "ADD RACE" },
  heroTitle: {
    mn: "Мөнх хөх тэнгэрийн доорх гүйлтийн улирал.",
    en: "The running season under the eternal blue sky.",
  },
  heroSub: {
    mn: "Улаанбаатараас Говь, Хөвсгөл хүртэлх бүх зохион байгуулагдсан уралдааны нэг л газар. Огноо, зам, зохион байгуулагч, бүртгэлийн холбоос.",
    en: "Every sanctioned race from Ulaanbaatar to the Gobi and Khövsgöl, in one readout. Dates, courses, organizers, registration.",
  },
  browseCalendar: { mn: "ХУАНЛИ ҮЗЭХ", en: "BROWSE CALENDAR" },
  filterAll: { mn: "БҮГД", en: "ALL" },
  filterRoad: { mn: "ЗАМ", en: "ROAD" },
  filterTrail: { mn: "ЗАМБАРААГҮЙ", en: "TRAIL" },
  filterUltra: { mn: "ХЭТ", en: "ULTRA" },
  filterFun: { mn: "БАЯР", en: "FESTIVAL" },
  register: { mn: "БҮРТГҮҮЛЭХ", en: "REGISTER" },
  organizer: { mn: "ЗОХИОН БАЙГУУЛАГЧ", en: "ORGANIZER" },
  location: { mn: "БАЙРШИЛ", en: "LOCATION" },
  distances: { mn: "ЗАЙ", en: "DISTANCES" },
  status: { mn: "ТӨЛӨВ", en: "STATUS" },
  open: { mn: "БҮРТГЭЛ НЭЭЛТТЭЙ", en: "REGISTRATION OPEN" },
  closingSoon: { mn: "УДАХГҮЙ ХААГДАНА", en: "CLOSING SOON" },
  waitlist: { mn: "ХҮЛЭЭГДЭЖ БУЙ", en: "WAITLIST" },
  close: { mn: "ХААХ", en: "CLOSE" },
  eventDetails: { mn: "УРАЛДААНЫ ДЭЛГЭРЭНГҮЙ", en: "RACE DETAILS" },
  sectionUpcoming: { mn: "БҮХ УРАЛДААН", en: "ALL RACES" },
  sectionCalendarLabel: { mn: "ХУАНЛИ", en: "CALENDAR" },
  sectionCalendarTitle: {
    mn: "Сар бүрийн харагдац. Уралдааны өдрийг сонгож дэлгэрэнгүйг үзнэ үү.",
    en: "Month-by-month view. Select a race day to see details.",
  },
  prevMonth: { mn: "ӨМНӨХ", en: "PREV" },
  viewCalendar: { mn: "ХУАНЛИ", en: "CALENDAR" },
  viewList: { mn: "ЖАГСААЛТ", en: "LIST" },
  saveRace: { mn: "ХАДГАЛАХ", en: "SAVE" },
  savedRace: { mn: "ХАДГАЛСАН", en: "SAVED" },
  regDeadline: { mn: "БҮРТГЭЛ ХААГДАХ", en: "REG. DEADLINE" },
  raceType: { mn: "ТӨРӨЛ", en: "TYPE" },
  tba: { mn: "ТОДОРХОЙГҮЙ", en: "TBA" },
  noRacesList: { mn: "Уралдаан олдсонгүй.", en: "No races found." },
  nextMonth: { mn: "ДАРАА", en: "NEXT" },
  today: { mn: "ӨНӨӨДӨР", en: "TODAY" },
  noRacesMonth: { mn: "Энэ сард уралдаан алга.", en: "No races this month." },
  weekdayShort: { mn: "Да_Мя_Лх_Пү_Ба_Бя_Ня", en: "MO_TU_WE_TH_FR_SA_SU" },
  month: { mn: "САР", en: "MONTH" },
  year: { mn: "ЖИЛ", en: "YEAR" },
  monthNames: {
    mn: "1-Р САР_2-Р САР_3-Р САР_4-Р САР_5-Р САР_6-Р САР_7-Р САР_8-Р САР_9-Р САР_10-Р САР_11-Р САР_12-Р САР",
    en: "JANUARY_FEBRUARY_MARCH_APRIL_MAY_JUNE_JULY_AUGUST_SEPTEMBER_OCTOBER_NOVEMBER_DECEMBER",
  },
  sectionSummary: {
    mn: "2026 оны улирлын урьдчилсан хуваарь. Огноо болон бүртгэлийн холбоос зохион байгуулагчаас баталгаажсан.",
    en: "Preliminary schedule for the 2026 season. Dates and links confirmed with each organizer.",
  },
  manifestoLabel: { mn: "ТУНХАГ", en: "MANIFESTO" },
  manifestoTitle: {
    mn: "Гүйлт бол хамгийн эртний тээврийн хэрэгсэл. Монгол нутаг — хамгийн үнэн зам.",
    en: "Running is the oldest form of travel. Mongolia is the truest terrain.",
  },
  m01Label: { mn: "БҮРЭН ХУАНЛИ", en: "COMPLETE CALENDAR" },
  m01Body: {
    mn: "Улаанбаатар марафоноос эхлээд Говийн хэт хүртэл — 5К, 10К, хагас, бүрэн, стадион, зам, уул, элсэн цөл. Нэг л бүтэн жагсаалт.",
    en: "From the Ulaanbaatar Marathon to Gobi ultras — 5K, 10K, half, full, track, road, mountain, desert. One complete listing.",
  },
  m02Label: { mn: "ЗОХИОН БАЙГУУЛАГЧИД", en: "ORGANIZERS" },
  m02Body: {
    mn: "Уралдаан бүрийн ард хэн байгаа, хэрхэн холбогдох, өмнөх жилүүдийн үр дүн — ил тод.",
    en: "Who is behind each race, how to reach them, and how the previous years ran — transparently.",
  },
  m03Label: { mn: "ХОЁР ХЭЛ", en: "BILINGUAL" },
  m03Body: {
    mn: "Монгол Кирилл + English. Хүнд хэлээр бүү бүү бичье, гүйгчид уншиж чадах ёстой.",
    en: "Mongolian Cyrillic + English. No jargon — every runner should be able to read it.",
  },
  m04Label: { mn: "БҮРТГЭЛ", en: "REGISTRATION" },
  m04Body: {
    mn: "Уралдаан бүр албан ёсны бүртгэлийн холбоос руу шууд илгээнэ. Гуравдагч этгээдийн шимтгэлгүй.",
    en: "Each race links to the official registration page. No third-party fees.",
  },
  footerRights: {
    mn: "© 2026 гүйгч.mn — Монголын гүйгчдийн нээлттэй хуанли",
    en: "© 2026 guigch.mn — Open calendar for the Mongolian running community",
  },
} satisfies Dict;

export type DictKey = keyof typeof dict;

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
}>({ lang: "mn", setLang: () => {}, t: (k) => dict[k].mn });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mn");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
    if (stored === "mn" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("lang", l);
  };

  const t = (k: DictKey) => dict[k][lang];

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function bi(mn: string, en: string, lang: Lang) {
  return lang === "mn" ? mn : en;
}