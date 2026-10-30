import * as Astronomy from "astronomy-engine";
import { NAKSHATRAS, NAKSHATRA_SPAN, SIGNS, TITHIS, WEEKDAYS, YOGAS } from "./constants";
import { norm360, siderealLongitude } from "./ephemeris";
import { localParts, startOfLocalDay } from "./time";

const HOUR = 3600 * 1000;
const MINUTE = 60 * 1000;

export const MONTHS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
];

const RITUS = ["Vasanta", "Grishma", "Varsha", "Sharad", "Hemanta", "Shishira"];

const KARANAS_MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

// The five limbs, each as an angle that grows through the month
const moonSun = (t: Date) => norm360(siderealLongitude("Moon", t) - siderealLongitude("Sun", t));
const moon = (t: Date) => siderealLongitude("Moon", t);
const sunPlusMoon = (t: Date) => norm360(siderealLongitude("Sun", t) + siderealLongitude("Moon", t));

// When `angle` next reaches the next multiple of `step`. The angles only ever increase
// (the Moon never goes backwards), so step forward an hour at a time, then bisect.
function nextBoundary(angle: (t: Date) => number, step: number, from: Date): Date {
  const target = norm360((Math.floor(angle(from) / step) + 1) * step);
  const past = (t: Date) => norm360(angle(t) - target + 180) - 180 >= 0;
  let lo = from.getTime();
  let hi = lo + HOUR;
  while (!past(new Date(hi))) {
    lo = hi;
    hi += HOUR;
  }
  while (hi - lo > 1000) {
    const mid = (lo + hi) / 2;
    if (past(new Date(mid))) hi = mid;
    else lo = mid;
  }
  return new Date(hi);
}

export function tithiName(index: number) {
  if (index === 14) return "Purnima";
  if (index === 29) return "Amavasya";
  return TITHIS[index % 15];
}

export function karanaName(index: number) {
  if (index === 0) return "Kimstughna";
  if (index >= 57) return ["Shakuni", "Chatushpada", "Naga"][index - 57];
  return KARANAS_MOVABLE[(index - 1) % 7];
}

export interface Limb {
  index: number;
  name: string;
  endsAt: Date;
  next: string;
}

export interface Span {
  start: Date;
  end: Date;
}

export interface Panchang {
  date: string;
  sunrise: Date | null;
  sunset: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  weekday: (typeof WEEKDAYS)[number];
  tithi: Limb & { paksha: "Shukla" | "Krishna"; number: number };
  nakshatra: Limb & { pada: number };
  yoga: Limb;
  karana: Limb;
  sunSign: number;
  moonSign: number;
  // Moon minus Sun at sunrise: 0 new moon, 180 full moon
  elongation: number;
  month: { amanta: string; purnimanta: string; adhika: boolean };
  ritu: string;
  rahuKalam: Span | null;
  yamaganda: Span | null;
  gulikaKalam: Span | null;
  abhijit: Span | null;
  brahmaMuhurta: Span | null;
}

// Which eighth of the day each period takes, Sunday first
const RAHU = [8, 2, 7, 5, 6, 4, 3];
const YAMA = [5, 4, 3, 2, 1, 7, 6];
const GULIKA = [7, 6, 5, 4, 3, 2, 1];

function eighth(sunrise: Date, sunset: Date, part: number): Span {
  const len = (sunset.getTime() - sunrise.getTime()) / 8;
  const start = sunrise.getTime() + (part - 1) * len;
  return { start: new Date(start), end: new Date(start + len) };
}

// The amanta month runs new moon to new moon and is named after the sign the Sun is in at the
// new moon that starts it (Sun in Pisces -> Chaitra). Two new moons in one sign make an adhika month.
function lunarMonth(at: Date, paksha: "Shukla" | "Krishna") {
  let search = new Date(at.getTime() - 32 * 24 * HOUR);
  let previous: Date | null = null;
  for (;;) {
    const nm = Astronomy.SearchMoonPhase(0, search, 40);
    if (!nm || nm.date > at) break;
    previous = nm.date;
    search = new Date(nm.date.getTime() + 24 * HOUR);
  }
  const startNewMoon = previous ?? at;
  const nextNewMoon = Astronomy.SearchMoonPhase(0, new Date(startNewMoon.getTime() + 24 * HOUR), 40)!.date;

  const sign = Math.floor(siderealLongitude("Sun", startNewMoon) / 30);
  const nextSign = Math.floor(siderealLongitude("Sun", nextNewMoon) / 30);
  const index = (sign + 1) % 12;
  return {
    index,
    amanta: MONTHS[index],
    // North India counts the month from full moon to full moon, so the dark half belongs to the next month
    purnimanta: MONTHS[paksha === "Krishna" ? (index + 1) % 12 : index],
    adhika: sign === nextSign,
  };
}

// The panchang for a local calendar day, taken at sunrise as is traditional
export function computePanchang(date: string, timeZone: string, latitude: number, longitude: number): Panchang {
  const dayStart = startOfLocalDay(date, timeZone);
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const rise = (body: Astronomy.Body, dir: 1 | -1) =>
    Astronomy.SearchRiseSet(body, observer, dir, dayStart, 1)?.date ?? null;

  const sunrise = rise(Astronomy.Body.Sun, 1);
  const sunset = rise(Astronomy.Body.Sun, -1);
  // Near the poles the Sun may not rise; fall back to local noon so the limbs are still defined
  const at = sunrise ?? new Date(dayStart.getTime() + 12 * HOUR);

  const tithiIndex = Math.floor(moonSun(at) / 12);
  const nakIndex = Math.floor(moon(at) / NAKSHATRA_SPAN);
  const yogaIndex = Math.floor(sunPlusMoon(at) / NAKSHATRA_SPAN);
  const karanaIndex = Math.floor(moonSun(at) / 6);
  const paksha = tithiIndex < 15 ? "Shukla" : "Krishna";

  const p = localParts(dayStart, timeZone);
  const weekday = WEEKDAYS[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()];
  const month = lunarMonth(at, paksha);

  let rahuKalam = null, yamaganda = null, gulikaKalam = null, abhijit = null, brahmaMuhurta = null;
  if (sunrise && sunset) {
    const w = WEEKDAYS.indexOf(weekday);
    rahuKalam = eighth(sunrise, sunset, RAHU[w]);
    yamaganda = eighth(sunrise, sunset, YAMA[w]);
    gulikaKalam = eighth(sunrise, sunset, GULIKA[w]);
    // The day has 15 muhurtas; Abhijit is the 8th, around local noon
    const muhurta = (sunset.getTime() - sunrise.getTime()) / 15;
    abhijit = { start: new Date(sunrise.getTime() + 7 * muhurta), end: new Date(sunrise.getTime() + 8 * muhurta) };
    brahmaMuhurta = { start: new Date(sunrise.getTime() - 96 * MINUTE), end: new Date(sunrise.getTime() - 48 * MINUTE) };
  }

  return {
    date,
    sunrise,
    sunset,
    moonrise: rise(Astronomy.Body.Moon, 1),
    moonset: rise(Astronomy.Body.Moon, -1),
    weekday,
    tithi: {
      index: tithiIndex,
      number: (tithiIndex % 15) + 1,
      name: tithiName(tithiIndex),
      paksha,
      endsAt: nextBoundary(moonSun, 12, at),
      next: tithiName((tithiIndex + 1) % 30),
    },
    nakshatra: {
      index: nakIndex,
      name: NAKSHATRAS[nakIndex].name,
      pada: Math.floor((moon(at) % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1,
      endsAt: nextBoundary(moon, NAKSHATRA_SPAN, at),
      next: NAKSHATRAS[(nakIndex + 1) % 27].name,
    },
    yoga: {
      index: yogaIndex,
      name: YOGAS[yogaIndex],
      endsAt: nextBoundary(sunPlusMoon, NAKSHATRA_SPAN, at),
      next: YOGAS[(yogaIndex + 1) % 27],
    },
    karana: {
      index: karanaIndex,
      name: karanaName(karanaIndex),
      endsAt: nextBoundary(moonSun, 6, at),
      next: karanaName((karanaIndex + 1) % 60),
    },
    sunSign: Math.floor(siderealLongitude("Sun", at) / 30),
    moonSign: Math.floor(moon(at) / 30),
    elongation: moonSun(at),
    month: { amanta: month.amanta, purnimanta: month.purnimanta, adhika: month.adhika },
    ritu: RITUS[Math.floor(month.index / 2)],
    rahuKalam,
    yamaganda,
    gulikaKalam,
    abhijit,
    brahmaMuhurta,
  };
}

export const signLabel = (sign: number) => `${SIGNS[sign].sanskrit} (${SIGNS[sign].name})`;
