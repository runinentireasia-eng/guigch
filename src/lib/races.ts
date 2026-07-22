export type RaceCategory = "road" | "trail" | "ultra" | "fun";
export type RaceStatus = "open" | "closing_soon" | "waitlist";

export interface Race {
  id: string;
  index: string;
  nameMn: string;
  nameEn: string;
  dateISO: string;
  monthMn: string;
  monthEn: string;
  day: string;
  year: string;
  locationMn: string;
  locationEn: string;
  organizerMn: string;
  organizerEn: string;
  category: RaceCategory;
  distances: string[];
  status: RaceStatus;
  registerUrl: string;
  descriptionMn: string;
  descriptionEn: string;
}

const MONTHS_EN = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTHS_MN = ["1-Р САР","2-Р САР","3-Р САР","4-Р САР","5-Р САР","6-Р САР","7-Р САР","8-Р САР","9-Р САР","10-Р САР","11-Р САР","12-Р САР"];

export type RaceRow = {
  id: string;
  name_mn: string;
  name_en: string;
  race_date: string;
  location_mn: string;
  location_en: string;
  organizer_mn: string;
  organizer_en: string;
  category: string;
  distances: string[];
  status: string;
  register_url: string;
  description_mn: string;
  description_en: string;
};

export function rowToRace(row: RaceRow, index: number): Race {
  const d = new Date(row.race_date + "T00:00:00");
  const m = d.getUTCMonth();
  return {
    id: row.id,
    index: String(index + 1).padStart(2, "0"),
    nameMn: row.name_mn,
    nameEn: row.name_en,
    dateISO: row.race_date,
    monthMn: MONTHS_MN[m],
    monthEn: MONTHS_EN[m],
    day: String(d.getUTCDate()).padStart(2, "0"),
    year: String(d.getUTCFullYear()),
    locationMn: row.location_mn,
    locationEn: row.location_en,
    organizerMn: row.organizer_mn,
    organizerEn: row.organizer_en,
    category: (row.category as RaceCategory) ?? "road",
    distances: row.distances ?? [],
    status: (row.status as RaceStatus) ?? "open",
    registerUrl: row.register_url,
    descriptionMn: row.description_mn,
    descriptionEn: row.description_en,
  };
}

// Fallback seed used only before backend loads (kept minimal for SSR).
export const races: Race[] = [
  {
    id: "ub-marathon-2026",
    index: "01",
    nameMn: "Улаанбаатар Олон Улсын Марафон",
    nameEn: "Ulaanbaatar International Marathon",
    dateISO: "2026-05-30",
    monthMn: "5-Р САР",
    monthEn: "MAY",
    day: "30",
    year: "2026",
    locationMn: "Сүхбаатарын талбай, Улаанбаатар",
    locationEn: "Sühbaatar Square, Ulaanbaatar",
    organizerMn: "УБ Хотын Захиргаа",
    organizerEn: "UB City Council",
    category: "road",
    distances: ["5K", "10K", "21K", "42K"],
    status: "open",
    registerUrl: "https://ubmarathon.mn",
    descriptionMn: "Монголын хамгийн том хотын марафон. Дэлхийн Атлетикийн зэрэглэлтэй.",
    descriptionEn: "Mongolia's largest urban marathon. World Athletics certified.",
  },
  {
    id: "sunrise-to-sunset-2026",
    index: "02",
    nameMn: "Нар мандахаас жаргах хүртэлх",
    nameEn: "Mongolia Sunrise to Sunset",
    dateISO: "2026-08-01",
    monthMn: "8-Р САР",
    monthEn: "AUG",
    day: "01",
    year: "2026",
    locationMn: "Хатгал, Хөвсгөл нуур",
    locationEn: "Hatgal, Lake Khövsgöl",
    organizerMn: "Ecoleap Mongolia",
    organizerEn: "Ecoleap Mongolia",
    category: "ultra",
    distances: ["42K", "100K"],
    status: "open",
    registerUrl: "https://ms2s.org",
    descriptionMn: "Хөвсгөл нуурын эрэг дагуух хэт холын гүйлт. 20 жилийн уламжлалтай.",
    descriptionEn: "Ultra-distance run along the shores of Lake Khövsgöl. Running for 20+ years.",
  },
  {
    id: "khovsgol-ice-2026",
    index: "03",
    nameMn: "Хөвсгөл Мөсөн Марафон",
    nameEn: "Khövsgöl Ice Marathon",
    dateISO: "2026-03-03",
    monthMn: "3-Р САР",
    monthEn: "MAR",
    day: "03",
    year: "2026",
    locationMn: "Хөвсгөл нуурын мөс",
    locationEn: "Frozen Lake Khövsgöl",
    organizerMn: "Ice Marathon MGL",
    organizerEn: "Ice Marathon MGL",
    category: "road",
    distances: ["21K", "42K"],
    status: "closing_soon",
    registerUrl: "https://icemarathon.mn",
    descriptionMn: "-30°C-т мөсөн дээгүүр гүйдэг цорын ганц марафон. Хязгаарлагдмал суудал.",
    descriptionEn: "The only marathon run across a frozen lake at -30°C. Limited entries.",
  },
  {
    id: "gobi-march-2026",
    index: "04",
    nameMn: "Говийн Марш",
    nameEn: "The Gobi March",
    dateISO: "2026-07-19",
    monthMn: "7-Р САР",
    monthEn: "JUL",
    day: "19",
    year: "2026",
    locationMn: "Орхон хөндий, Хархорин",
    locationEn: "Orkhon Valley, Karakorum",
    organizerMn: "RacingThePlanet",
    organizerEn: "RacingThePlanet",
    category: "ultra",
    distances: ["250K / 7 өдөр", "250K / 7 days"],
    status: "waitlist",
    registerUrl: "https://racingtheplanet.com/gobi",
    descriptionMn: "7 хоногийн өөрийгөө тэжээх олон үе шаттай хэт марафон.",
    descriptionEn: "Seven-day self-supported multi-stage ultra across the Gobi.",
  },
  {
    id: "naadam-run-2026",
    index: "05",
    nameMn: "Наадмын Гүйлт",
    nameEn: "Naadam Festival Run",
    dateISO: "2026-07-11",
    monthMn: "7-Р САР",
    monthEn: "JUL",
    day: "11",
    year: "2026",
    locationMn: "Үндэсний Их Наадмын цогцолбор",
    locationEn: "National Sports Stadium",
    organizerMn: "Монголын Атлетикийн Холбоо",
    organizerEn: "Mongolian Athletic Federation",
    category: "fun",
    distances: ["3K", "5K"],
    status: "open",
    registerUrl: "https://maf.mn/naadam-run",
    descriptionMn: "Үндэсний баярын өдрийн олон нийтийн гүйлт. Гэр бүлээрээ.",
    descriptionEn: "Family-friendly community run on the national holiday.",
  },
  {
    id: "terelj-trail-2026",
    index: "06",
    nameMn: "Тэрэлж Уулын Гүйлт",
    nameEn: "Terelj Skyline Trail",
    dateISO: "2026-06-14",
    monthMn: "6-Р САР",
    monthEn: "JUN",
    day: "14",
    year: "2026",
    locationMn: "Горхи-Тэрэлж Байгалийн Цогцолбор",
    locationEn: "Gorkhi-Terelj National Park",
    organizerMn: "Mongolia Trail Runners",
    organizerEn: "Mongolia Trail Runners",
    category: "trail",
    distances: ["12K", "25K", "50K"],
    status: "open",
    registerUrl: "https://trailrun.mn/terelj",
    descriptionMn: "Гурван зайтай уулын зам. 2,000м хүртэлх өндөрлөг.",
    descriptionEn: "Three-distance mountain trail. Elevation up to 2,000m.",
  },
  {
    id: "genghis-half-2026",
    index: "07",
    nameMn: "Чингис Хааны Хагас Марафон",
    nameEn: "Genghis Khan Half Marathon",
    dateISO: "2026-09-12",
    monthMn: "9-Р САР",
    monthEn: "SEP",
    day: "12",
    year: "2026",
    locationMn: "Цонжин Болдог хөшөө",
    locationEn: "Tsonjin Boldog Monument",
    organizerMn: "Monnis Sports Club",
    organizerEn: "Monnis Sports Club",
    category: "road",
    distances: ["10K", "21K"],
    status: "open",
    registerUrl: "https://ghmarathon.mn",
    descriptionMn: "Аварга том мориттой хөшөөнөөс эхлэх хагас марафон.",
    descriptionEn: "Half marathon starting from the giant equestrian statue.",
  },
  {
    id: "altai-ultra-2026",
    index: "08",
    nameMn: "Алтайн Хэт Марафон",
    nameEn: "Altai Ultra",
    dateISO: "2026-08-22",
    monthMn: "8-Р САР",
    monthEn: "AUG",
    day: "22",
    year: "2026",
    locationMn: "Өлгий, Баян-Өлгий",
    locationEn: "Ölgii, Bayan-Ölgii",
    organizerMn: "Altai Adventures",
    organizerEn: "Altai Adventures",
    category: "trail",
    distances: ["30K", "60K"],
    status: "open",
    registerUrl: "https://altaiultra.mn",
    descriptionMn: "Казах бүргэдчидийн нутагт өндөр уулын гүйлт.",
    descriptionEn: "High-altitude trail run in the land of the Kazakh eagle hunters.",
  },
];