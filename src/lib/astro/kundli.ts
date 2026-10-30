import { DASHA_ORDER, DIGNITY, NAKSHATRAS, NAKSHATRA_SPAN, PADA_SPAN, PLANETS, SIGNS, type PlanetId } from "./constants";
import { ayanamsa, ascendant, siderealLongitude, speed } from "./ephemeris";
import { vimshottari, type Mahadasha } from "./dasha";

export interface Placement {
  longitude: number; // sidereal, 0..360
  sign: number; // 0 = Aries
  degree: number; // within the sign, 0..30
  nakshatra: number; // 0 = Ashwini
  pada: number; // 1..4
  nakshatraLord: PlanetId;
  navamsa: number; // sign in the D9 chart
}

export interface PlanetPlacement extends Placement {
  id: PlanetId;
  house: number; // 1..12, whole-sign houses counted from the lagna
  retrograde: boolean;
  dignity: "Exalted" | "Debilitated" | "Own sign" | null;
}

export interface Kundli {
  birth: Date;
  latitude: number;
  longitude: number;
  ayanamsa: number;
  lagna: Placement;
  planets: PlanetPlacement[];
  dasha: Mahadasha[];
  manglik: { fromLagna: boolean; fromMoon: boolean; house: number; houseFromMoon: number };
}

export function placement(longitude: number): Placement {
  const nakshatra = Math.floor(longitude / NAKSHATRA_SPAN);
  return {
    longitude,
    sign: Math.floor(longitude / 30),
    degree: longitude % 30,
    nakshatra,
    pada: Math.floor((longitude % NAKSHATRA_SPAN) / PADA_SPAN) + 1,
    nakshatraLord: DASHA_ORDER[nakshatra % 9],
    // Each sign is cut into nine parts of 3°20', and the parts run through the zodiac in
    // order from Aries, so a continuous count gives the movable/fixed/dual starting rule for free
    navamsa: Math.floor(longitude / PADA_SPAN) % 12,
  };
}

function dignity(id: PlanetId, sign: number): PlanetPlacement["dignity"] {
  const d = DIGNITY[id];
  if (!d) return null;
  if (d.exalted === sign) return "Exalted";
  if (d.debilitated === sign) return "Debilitated";
  if (d.own.includes(sign)) return "Own sign";
  return null;
}

// Signs counted from `from` to `to`, inclusive: the same sign is house 1
export const houseFrom = (from: number, to: number) => ((to - from + 12) % 12) + 1;

const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

export function computeKundli(birth: Date, latitude: number, longitude: number): Kundli {
  const lagna = placement(ascendant(birth, latitude, longitude));

  const planets: PlanetPlacement[] = PLANETS.map((id) => {
    const p = placement(siderealLongitude(id, birth));
    return {
      id,
      ...p,
      house: houseFrom(lagna.sign, p.sign),
      // Rahu and Ketu (mean nodes) always move backwards
      retrograde: id === "Rahu" || id === "Ketu" || (id !== "Sun" && id !== "Moon" && speed(id, birth) < 0),
      dignity: dignity(id, p.sign),
    };
  });

  const moon = planets.find((p) => p.id === "Moon")!;
  const mars = planets.find((p) => p.id === "Mars")!;
  const houseFromMoon = houseFrom(moon.sign, mars.sign);

  return {
    birth,
    latitude,
    longitude,
    ayanamsa: ayanamsa(birth),
    lagna,
    planets,
    dasha: vimshottari(moon.longitude, birth),
    manglik: {
      fromLagna: MANGLIK_HOUSES.includes(mars.house),
      fromMoon: MANGLIK_HOUSES.includes(houseFromMoon),
      house: mars.house,
      houseFromMoon,
    },
  };
}

export const signName = (sign: number) => SIGNS[sign].name;
export const nakshatraName = (n: number) => NAKSHATRAS[n].name;

export function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.floor((mFloat - m) * 60);
  return `${d}°${String(m).padStart(2, "0")}′${String(s).padStart(2, "0")}″`;
}
