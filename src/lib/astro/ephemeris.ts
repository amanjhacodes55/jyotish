import * as Astronomy from "astronomy-engine";
import type { PlanetId } from "./constants";

// All longitudes here are sidereal (Lahiri), in degrees 0..360.

export const norm360 = (x: number) => ((x % 360) + 360) % 360;

const DEG = Math.PI / 180;

// Julian centuries since J2000
const centuries = (date: Date) => Astronomy.MakeTime(date).tt / 36525;

// Lahiri (Chitrapaksha) ayanamsa: its value at J2000 carried forward by general precession
// (IAU 2006). The J2000 value matches the Lahiri ayanamsa FreeAstrologyAPI returns to within
// a fraction of an arcsecond (see tests/fixtures).
const LAHIRI_J2000 = 23.85296;

export function ayanamsa(date: Date): number {
  const t = centuries(date);
  return LAHIRI_J2000 + (5028.796195 * t + 1.1054348 * t * t) / 3600;
}

// Tropical longitude on the true ecliptic of date
function tropical(body: PlanetId, date: Date): number {
  switch (body) {
    case "Sun":
      return Astronomy.SunPosition(date).elon;
    case "Moon":
      return Astronomy.EclipticGeoMoon(date).lon;
    case "Rahu":
      return meanNode(date);
    case "Ketu":
      return norm360(meanNode(date) + 180);
    default:
      return Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], date, true)).elon;
  }
}

// Mean lunar node (Meeus 47.7). Vedic charts traditionally use the mean node for Rahu.
function meanNode(date: Date): number {
  const t = centuries(date);
  return norm360(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + (t * t * t) / 467441);
}

export function siderealLongitude(body: PlanetId, date: Date): number {
  return norm360(tropical(body, date) - ayanamsa(date));
}

// Degrees per day, negative when retrograde
export function speed(body: PlanetId, date: Date): number {
  const half = 6 * 3600 * 1000;
  const a = tropical(body, new Date(date.getTime() - half));
  const b = tropical(body, new Date(date.getTime() + half));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d * 2;
}

// Sidereal ascendant (lagna) for a place: the ecliptic degree rising on the eastern horizon
export function ascendant(date: Date, latitude: number, longitude: number): number {
  const time = Astronomy.MakeTime(date);
  const ramc = norm360(Astronomy.SiderealTime(date) * 15 + longitude) * DEG;
  const eps = Astronomy.e_tilt(time).tobl * DEG;
  const phi = latitude * DEG;
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return norm360(asc / DEG - ayanamsa(date));
}
