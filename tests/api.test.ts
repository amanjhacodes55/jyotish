import { describe, expect, test } from "vitest";
import fixtures from "./fixtures/freeastrologyapi.json";
import { PLANETS } from "@/lib/astro/constants";
import { ayanamsa } from "@/lib/astro/ephemeris";
import { computeKundli } from "@/lib/astro/kundli";
import { matchKundlis } from "@/lib/astro/matching";
import { computePanchang } from "@/lib/astro/panchang";
import { vimshottari } from "@/lib/astro/dasha";

// Jyotish computes everything itself. These tests check the results against FreeAstrologyAPI
// (refresh the saved answers with scripts/fetch-fixtures.mjs).

type Birth = (typeof fixtures.births)[number];

const utc = (b: Birth) => new Date(Date.UTC(b.year, b.month - 1, b.date, b.hours, b.minutes) - b.timezone * 3600_000);
const kundli = (b: Birth) => computeKundli(utc(b), b.latitude, b.longitude);
const byId = (id: string) => fixtures.births.find((b) => b.id === id)!;

// Signed difference in arcseconds, across the 0/360 seam
const arcsec = (a: number, b: number) => ((((a - b) % 360) + 540) % 360 - 180) * 3600;

// API text like "2022-08-11 10:38:48" is local time at the birth place
const apiTime = (s: string, tz: number) => {
  const [d, t] = s.split(" ");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi, se] = t.split(":").map(Number);
  return Date.UTC(y, mo - 1, da, h, mi, Math.floor(se)) - tz * 3600_000;
};

describe.each(fixtures.births)("$id", (b) => {
  const k = kundli(b);
  const api = (fixtures.planets as Record<string, unknown[]>)[b.id][1] as Record<string, { fullDegree: number; isRetro: string | boolean }>;

  test("ayanamsa matches Lahiri", () => {
    const value = ((fixtures.planets as Record<string, unknown[]>)[b.id][0] as Record<string, { value: number }>)["13"].value;
    expect(Math.abs(arcsec(ayanamsa(utc(b)), value))).toBeLessThan(1);
  });

  test("ascendant within 10″", () => {
    expect(Math.abs(arcsec(k.lagna.longitude, api.Ascendant.fullDegree))).toBeLessThan(10);
  });

  test.each(PLANETS)("%s within 2′", (id) => {
    const p = k.planets.find((x) => x.id === id)!;
    expect(Math.abs(arcsec(p.longitude, api[id].fullDegree))).toBeLessThan(120);
  });

  test("retrograde flags agree", () => {
    for (const p of k.planets) expect(p.retrograde, p.id).toBe(String(api[p.id].isRetro) === "true");
  });
});

describe("vimshottari dasha", () => {
  // FreeAstrologyAPI's Moon trails ours by ΔT × the Moon's speed (about 35″ in 2022): it skips the
  // ΔT correction from UT to the time the ephemeris runs on. A few arcseconds of Moon move dasha dates
  // by days, so the dasha arithmetic is checked from the API's own Moon longitude.
  test.each(Object.keys(fixtures.dasha))("%s: same lords, dates within 3 hours", (id) => {
    const b = byId(id);
    const apiMoon = ((fixtures.planets as Record<string, unknown[]>)[id][1] as Record<string, { fullDegree: number }>).Moon.fullDegree;
    const ours = vimshottari(apiMoon, utc(b));
    const theirs = Object.values((fixtures.dasha as Record<string, Record<string, { Lord: string; start_time: string; end_time: string }>>)[id]);
    expect(ours.map((d) => d.lord)).toEqual(theirs.map((d) => d.Lord));
    // Every period is off by the same hour or so: the API's dasha endpoint starts from a Moon about 1″
    // away from its own planets endpoint. The same offset for all nine shows the year length is right.
    ours.forEach((d, i) => {
      expect(Math.abs(d.end.getTime() - apiTime(theirs[i].end_time, b.timezone))).toBeLessThan(3 * 3600_000);
    });
  });

  test("the Moon gap is ΔT, not a mistake: it grows from 1965 to 2031", () => {
    const gap = (id: string) => {
      const apiMoon = ((fixtures.planets as Record<string, unknown[]>)[id][1] as Record<string, { fullDegree: number }>).Moon.fullDegree;
      return arcsec(kundli(byId(id)).planets[1].longitude, apiMoon);
    };
    expect(gap("chennai-1965")).toBeGreaterThan(5);
    expect(gap("chennai-1965")).toBeLessThan(gap("mumbai-2031"));
  });
});

describe("panchang", () => {
  test.each(Object.keys(fixtures.tithi))("%s: tithi and its end time", (id) => {
    const b = byId(id);
    const t = (fixtures.tithi as Record<string, { number: number; completes_at: string }>)[id];
    const at = utc(b);
    // Tithi at the birth moment: same rule the panchang uses, read straight from the engine
    const k = kundli(b);
    const moon = k.planets.find((p) => p.id === "Moon")!.longitude;
    const sun = k.planets.find((p) => p.id === "Sun")!.longitude;
    const index = Math.floor((((moon - sun) % 360) + 360) % 360 / 12);
    expect(index + 1).toBe(t.number);
    expect(apiTime(t.completes_at, b.timezone)).toBeGreaterThan(at.getTime());
  });

  test("Hyderabad, 11 Aug 2022: Shukla Chaturdashi ending 10:38 and Uttara Ashadha ending 06:52", () => {
    const p = computePanchang("2022-08-11", "Asia/Kolkata", 17.38333, 78.4666);
    expect(p.tithi.name).toBe("Chaturdashi");
    expect(p.tithi.paksha).toBe("Shukla");
    expect(Math.abs(p.tithi.endsAt.getTime() - apiTime("2022-08-11 10:38:48", 5.5))).toBeLessThan(3 * 60_000);
    // Sunrise in Hyderabad was ~05:53, so the nakshatra at sunrise is Uttara Ashadha
    expect(p.nakshatra.name).toBe("Uttara Ashadha");
    expect(Math.abs(p.nakshatra.endsAt.getTime() - apiTime("2022-08-11 06:52:28", 5.5))).toBeLessThan(3 * 60_000);
  });
});

describe("ashtakoota matching", () => {
  const names: Record<string, string> = {
    varna_kootam: "Varna", vasya_kootam: "Vashya", tara_kootam: "Tara", yoni_kootam: "Yoni",
    graha_maitri_kootam: "Graha Maitri", gana_kootam: "Gana", rasi_kootam: "Bhakoot", nadi_kootam: "Nadi",
  };

  // Two places where Jyotish follows the common North Indian tables and the API doesn't:
  // - Gana: the API scores mixed ganas from a variant table (Deva boy + Manushya girl = 5, not 6).
  // - Tara: for the same birth star the count is 1 (Janma tara), which is not one of the
  //   bad counts 3, 5 and 7, so it scores 3; the API gives 0.
  const skip = (name: string, girl: string, boy: string) => name === "Gana" || (name === "Tara" && girl === boy);

  test.each(fixtures.matches.map((m) => [`${m.male} + ${m.female}`, m] as const))("%s", (_, m) => {
    const ours = matchKundlis(kundli(byId(m.male)), kundli(byId(m.female)));
    const out = m.output as unknown as Record<string, { score: number }>;
    for (const [key, name] of Object.entries(names)) {
      const k = ours.kootas.find((x) => x.name === name)!;
      if (skip(name, k.girl, k.boy)) continue;
      expect(k.score, name).toBe(out[key].score);
    }
  });
});
