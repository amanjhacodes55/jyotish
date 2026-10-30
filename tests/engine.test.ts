import { describe, expect, test } from "vitest";
import { placement, houseFrom, formatDegree, computeKundli } from "@/lib/astro/kundli";
import { karanaName, tithiName, computePanchang } from "@/lib/astro/panchang";
import { offsetMinutes, zonedToUtc } from "@/lib/astro/time";
import { currentPeriod } from "@/lib/astro/dasha";

describe("time zones", () => {
  test("India is UTC+5:30 today", () => {
    expect(zonedToUtc("1995-08-15", "10:30", "Asia/Kolkata").toISOString()).toBe("1995-08-15T05:00:00.000Z");
  });

  test("India's war time in 1943 was UTC+6:30", () => {
    expect(offsetMinutes(zonedToUtc("1943-06-01", "12:00", "Asia/Kolkata"), "Asia/Kolkata")).toBe(390);
  });

  test("New York switches between -5 and -4", () => {
    expect(zonedToUtc("2020-01-15", "09:00", "America/New_York").toISOString()).toBe("2020-01-15T14:00:00.000Z");
    expect(zonedToUtc("2020-07-15", "09:00", "America/New_York").toISOString()).toBe("2020-07-15T13:00:00.000Z");
  });
});

describe("placements", () => {
  test("nakshatra, pada and lord", () => {
    const p = placement(0);
    expect([p.sign, p.nakshatra, p.pada, p.nakshatraLord]).toEqual([0, 0, 1, "Ketu"]);
    // 279.437° is Uttara Ashadha pada 4 (266°40' to 280°), ruled by the Sun
    const q = placement(279.437);
    expect([q.sign, q.nakshatra, q.pada, q.nakshatraLord]).toEqual([9, 20, 4, "Sun"]);
  });

  test("navamsa follows the movable, fixed and dual rule", () => {
    expect(placement(1).navamsa).toBe(0); // Aries (movable) starts from Aries
    expect(placement(31).navamsa).toBe(9); // Taurus (fixed) starts from the 9th, Capricorn
    expect(placement(61).navamsa).toBe(6); // Gemini (dual) starts from the 5th, Libra
    expect(placement(29.9).navamsa).toBe(8); // last part of Aries is Sagittarius
  });

  test("whole-sign houses", () => {
    expect(houseFrom(0, 0)).toBe(1);
    expect(houseFrom(10, 1)).toBe(4);
  });

  test("degrees print as d°m′s″", () => {
    expect(formatDegree(23.8569)).toBe("23°51′24″");
  });
});

describe("panchang names", () => {
  test("tithis", () => {
    expect(tithiName(0)).toBe("Pratipada");
    expect(tithiName(14)).toBe("Purnima");
    expect(tithiName(15)).toBe("Pratipada");
    expect(tithiName(29)).toBe("Amavasya");
  });

  test("karanas: four fixed, seven repeating", () => {
    expect(karanaName(0)).toBe("Kimstughna");
    expect(karanaName(1)).toBe("Bava");
    expect(karanaName(7)).toBe("Vishti");
    expect(karanaName(8)).toBe("Bava");
    expect(karanaName(56)).toBe("Vishti");
    expect(karanaName(57)).toBe("Shakuni");
    expect(karanaName(59)).toBe("Naga");
  });

  test("a full day for Delhi has sunrise, Rahu Kalam inside the day, and ordered times", () => {
    const p = computePanchang("2026-10-30", "Asia/Kolkata", 28.6139, 77.209);
    expect(p.weekday.name).toBe("Friday");
    expect(p.sunrise!.getTime()).toBeLessThan(p.sunset!.getTime());
    expect(p.rahuKalam!.start.getTime()).toBeGreaterThanOrEqual(p.sunrise!.getTime());
    expect(p.rahuKalam!.end.getTime()).toBeLessThanOrEqual(p.sunset!.getTime() + 1000);
    expect(p.tithi.endsAt.getTime()).toBeGreaterThan(p.sunrise!.getTime());
  });
});

describe("kundli", () => {
  const k = computeKundli(zonedToUtc("1995-08-15", "10:30", "Asia/Kolkata"), 28.6139, 77.209);

  test("dashas cover 120 years without gaps", () => {
    for (let i = 1; i < k.dasha.length; i++) expect(k.dasha[i].start.getTime()).toBe(k.dasha[i - 1].end.getTime());
    const years = (k.dasha.at(-1)!.end.getTime() - k.dasha[0].start.getTime()) / (365.256363 * 86400_000);
    expect(years).toBeCloseTo(120, 6);
    for (const d of k.dasha) expect(d.antardashas.at(-1)!.end.getTime()).toBeCloseTo(d.end.getTime(), -1);
  });

  test("the running dasha at birth is the first one", () => {
    expect(currentPeriod(k.dasha, k.birth)).toBe(k.dasha[0]);
  });

  test("Manglik follows Mars' house", () => {
    const mars = k.planets.find((p) => p.id === "Mars")!;
    expect(k.manglik.fromLagna).toBe([1, 2, 4, 7, 8, 12].includes(mars.house));
  });
});
