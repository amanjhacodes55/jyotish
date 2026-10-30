// Birth details travel in the URL (?name=…&date=1995-08-15&time=10:30&place=…&lat=…&lon=…&tz=Asia/Kolkata),
// so every kundli has a link you can bookmark or send, and nothing has to be stored.

export interface Birth {
  name: string;
  date: string; // YYYY-MM-DD, local to the birth place
  time: string; // HH:MM, local to the birth place
  place: string;
  lat: number;
  lon: number;
  tz: string; // IANA zone, e.g. Asia/Kolkata
}

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function validZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function parseBirth(params: Params, prefix = ""): Birth | null {
  const get = (k: string) => one(params[prefix + k]).trim();
  const date = get("date");
  const time = get("time");
  const lat = Number(get("lat"));
  const lon = Number(get("lon"));
  const tz = get("tz");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const year = Number(date.slice(0, 4));
  if (year < 1800 || year > 2200) return null;
  if (!get("lat") || !get("lon") || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  if (!validZone(tz)) return null;
  return { name: get("name").slice(0, 60), date, time, place: get("place").slice(0, 120), lat, lon, tz };
}

export function birthParams(b: Birth, prefix = ""): Record<string, string> {
  return {
    [prefix + "name"]: b.name,
    [prefix + "date"]: b.date,
    [prefix + "time"]: b.time,
    [prefix + "place"]: b.place,
    [prefix + "lat"]: b.lat.toFixed(4),
    [prefix + "lon"]: b.lon.toFixed(4),
    [prefix + "tz"]: b.tz,
  };
}

export const birthQuery = (b: Birth, prefix = "") => new URLSearchParams(birthParams(b, prefix)).toString();
