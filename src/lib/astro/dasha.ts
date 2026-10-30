import { DASHA_ORDER, DASHA_YEARS, NAKSHATRA_SPAN, type PlanetId } from "./constants";

// Vimshottari dasha years are sidereal years, as in Swiss Ephemeris based software
const YEAR_MS = 365.256363 * 24 * 3600 * 1000;

export interface Period {
  lord: PlanetId;
  start: Date;
  end: Date;
}

export interface Mahadasha extends Period {
  antardashas: Period[];
}

// The 120-year cycle starts from the lord of the Moon's nakshatra. The part of that
// nakshatra the Moon has already crossed at birth is the part of the first dasha already over.
export function vimshottari(moonLongitude: number, birth: Date): Mahadasha[] {
  const nakshatra = Math.floor(moonLongitude / NAKSHATRA_SPAN);
  const elapsed = (moonLongitude % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const first = nakshatra % 9;

  let start = birth.getTime() - elapsed * DASHA_YEARS[DASHA_ORDER[first]] * YEAR_MS;
  const result: Mahadasha[] = [];

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(first + i) % 9];
    const length = DASHA_YEARS[lord] * YEAR_MS;
    const end = start + length;

    // Antardashas run in the same order, starting from the mahadasha lord, each in proportion to its years
    const antardashas: Period[] = [];
    let s = start;
    for (let j = 0; j < 9; j++) {
      const sub = DASHA_ORDER[(first + i + j) % 9];
      const e = s + (length * DASHA_YEARS[sub]) / 120;
      antardashas.push({ lord: sub, start: new Date(s), end: new Date(e) });
      s = e;
    }

    result.push({ lord, start: new Date(start), end: new Date(end), antardashas });
    start = end;
  }
  return result;
}

export function currentPeriod<T extends Period>(periods: T[], at: Date): T | undefined {
  const t = at.getTime();
  return periods.find((p) => p.start.getTime() <= t && t < p.end.getTime());
}
