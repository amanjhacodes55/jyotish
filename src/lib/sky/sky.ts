import * as Astronomy from "astronomy-engine";
import type { PlanetId } from "../astro/constants";
import { LABELS, LINES, STARS } from "./data";

// The sky as it looked from the birth place at the birth moment: a round map with the zenith in the
// middle and the horizon at the edge, North at the top and East on the left, as if lying on your back.

export const SIZE = 600;
const C = SIZE / 2;
const R = SIZE / 2 - 30; // horizon radius, leaving room for N/E/S/W

const DEG = Math.PI / 180;

// The twelve zodiac constellations, named as the signs are named everywhere else on the site
export const ZODIAC: Record<string, [string, string]> = {
  Ari: ["Aries", "Mesha"], Tau: ["Taurus", "Vrishabha"], Gem: ["Gemini", "Mithuna"], Cnc: ["Cancer", "Karka"],
  Leo: ["Leo", "Simha"], Vir: ["Virgo", "Kanya"], Lib: ["Libra", "Tula"], Sco: ["Scorpius", "Vrishchika"],
  Sgr: ["Sagittarius", "Dhanu"], Cap: ["Capricornus", "Makara"], Aqr: ["Aquarius", "Kumbha"], Psc: ["Pisces", "Meena"],
};

export interface SkyPoint {
  x: number;
  y: number;
  alt: number;
}

// Stereographic projection: keeps constellation shapes true, like a planisphere
function project(alt: number, az: number): SkyPoint {
  const r = R * Math.tan(((90 - alt) / 2) * DEG);
  return { x: C - r * Math.sin(az * DEG), y: C - r * Math.cos(az * DEG), alt };
}

export interface SkyPlanet extends SkyPoint {
  id: PlanetId;
  above: boolean;
  az: number;
}

export interface Sky {
  stars: { x: number; y: number; mag: number; name?: string }[];
  figures: { id: string; zodiac: boolean; d: string }[];
  labels: { id: string; name: string; hindi: string; zodiac: boolean; x: number; y: number }[];
  planets: SkyPlanet[];
  ecliptic: string;
  sunAltitude: number;
  moonPhase: number; // 0 new, 180 full
}

// Rahu and Ketu are points in the Moon's orbit, not objects in the sky, so they aren't drawn
const BODIES = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;

export function skyAt(date: Date, latitude: number, longitude: number): Sky {
  const time = Astronomy.MakeTime(date);
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  // Catalogue positions are for the year 2000; precess them to the birth date
  const toDate = Astronomy.Rotation_EQJ_EQD(time);

  const fromJ2000 = (raDeg: number, dec: number) => {
    const v = Astronomy.VectorFromSphere(new Astronomy.Spherical(dec, raDeg, 1), time);
    const eq = Astronomy.EquatorFromVector(Astronomy.RotateVector(toDate, v));
    const h = Astronomy.Horizon(time, observer, eq.ra, eq.dec, "normal");
    return project(h.altitude, h.azimuth);
  };

  const stars = [];
  for (const [ra, dec, mag, name] of STARS) {
    const p = fromJ2000(ra, dec);
    if (p.alt > -1) stars.push({ x: p.x, y: p.y, mag, name });
  }

  // Lines are drawn a little past the horizon and clipped there, so figures run cleanly off the edge.
  // Points far below it are dropped: the projection flies off towards infinity near the nadir.
  const figures = LINES.map(([id, polylines]) => {
    let d = "";
    for (const line of polylines) {
      let pen = false;
      for (const [ra, dec] of line) {
        const p = fromJ2000(ra, dec);
        if (p.alt < -25) {
          pen = false;
          continue;
        }
        d += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        pen = true;
      }
    }
    return { id, zodiac: id in ZODIAC, d };
  }).filter((f) => f.d.includes("L"));

  const labels = [];
  for (const [id, name, hindi, ra, dec] of LABELS) {
    const p = fromJ2000(ra, dec);
    if (p.alt > 8) labels.push({ id, name, hindi, zodiac: id in ZODIAC, x: p.x, y: p.y });
  }

  const planets: SkyPlanet[] = BODIES.map((id) => {
    const eq = Astronomy.Equator(Astronomy.Body[id], time, observer, true, true);
    const h = Astronomy.Horizon(time, observer, eq.ra, eq.dec, "normal");
    return { id, ...project(Math.max(h.altitude, -10), h.azimuth), alt: h.altitude, az: h.azimuth, above: h.altitude > 0 };
  });

  // The ecliptic, the Sun's path and the band the zodiac and the nakshatras sit on
  const eps = Astronomy.e_tilt(time).tobl * DEG;
  let ecliptic = "";
  let pen = false;
  for (let lon = 0; lon <= 360; lon += 3) {
    const l = lon * DEG;
    const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l)) / DEG;
    const dec = Math.asin(Math.sin(l) * Math.sin(eps)) / DEG;
    const h = Astronomy.Horizon(time, observer, (((ra % 360) + 360) % 360) / 15, dec, "normal");
    if (h.altitude < -25) {
      pen = false;
      continue;
    }
    const p = project(h.altitude, h.azimuth);
    ecliptic += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    pen = true;
  }

  const sun = planets.find((p) => p.id === "Sun")!;
  return { stars, figures, labels, planets, ecliptic, sunAltitude: sun.alt, moonPhase: Astronomy.MoonPhase(time) };
}

export const HORIZON = { cx: C, cy: C, r: R };

// Compass points sit just outside the horizon
const OUT = R + 15;
export const COMPASS = [
  { label: "N", x: C, y: C - OUT },
  { label: "E", x: C - OUT, y: C },
  { label: "S", x: C, y: C + OUT },
  { label: "W", x: C + OUT, y: C },
];

export function direction(az: number) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(az / 45) % 8];
}
