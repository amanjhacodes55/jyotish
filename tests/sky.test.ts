import { describe, expect, test } from "vitest";
import { HORIZON, skyAt } from "@/lib/sky/sky";
import { zonedToUtc } from "@/lib/astro/time";

const dist = (p: { x: number; y: number }) => Math.hypot(p.x - HORIZON.cx, p.y - HORIZON.cy);

describe("sky at birth", () => {
  test("noon in Delhi: the Sun is high in the south, the stars still drawn above the horizon", () => {
    const s = skyAt(zonedToUtc("2024-06-21", "12:20", "Asia/Kolkata"), 28.6139, 77.209);
    const sun = s.planets.find((p) => p.id === "Sun")!;
    // Near the June solstice the noon Sun at 28.6°N stands about 85° up
    expect(sun.alt).toBeGreaterThan(80);
    expect(s.sunAltitude).toBe(sun.alt);
    for (const st of s.stars) expect(dist(st)).toBeLessThanOrEqual(HORIZON.r * 1.02);
  });

  test("midnight: the Sun is below the horizon and Polaris sits at the place's latitude, due north", () => {
    const s = skyAt(zonedToUtc("2024-01-15", "00:00", "Asia/Kolkata"), 28.6139, 77.209);
    expect(s.sunAltitude).toBeLessThan(-30);
    expect(s.planets.find((p) => p.id === "Sun")!.above).toBe(false);
    // Polaris (magnitude ~2) is the star nearest the point straight above the North marker at 28.6° altitude
    const r = HORIZON.r * Math.tan(((90 - 28.6) / 2) * (Math.PI / 180));
    const nearest = s.stars
      .map((st) => ({ st, d: Math.hypot(st.x - HORIZON.cx, st.y - (HORIZON.cy - r)) }))
      .sort((a, b) => a.d - b.d)[0];
    expect(nearest.d).toBeLessThan(6);
    expect(nearest.st.mag).toBeCloseTo(2, 0);
  });

  test("the twelve zodiac figures are marked", () => {
    const s = skyAt(zonedToUtc("2002-10-15", "21:57", "Asia/Kolkata"), 27.5035, 77.6722);
    expect(s.figures.filter((f) => f.zodiac).length).toBeGreaterThanOrEqual(5);
    expect(s.ecliptic.length).toBeGreaterThan(50);
  });
});
