import type { Place } from "@/components/place-search";
import { validZone } from "./birth";

export const DELHI: Place = { place: "New Delhi, Delhi, India", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parsePlace(params: Params): Place | null {
  const lat = Number(one(params.lat));
  const lon = Number(one(params.lon));
  const tz = one(params.tz);
  if (!one(params.lat) || !one(params.lon) || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  if (!validZone(tz)) return null;
  return { place: one(params.place).slice(0, 120) || "Selected place", lat, lon, tz };
}

export function parseDate(params: Params): string | null {
  const d = one(params.date);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && Number(d.slice(0, 4)) >= 1800 && Number(d.slice(0, 4)) <= 2200 ? d : null;
}
