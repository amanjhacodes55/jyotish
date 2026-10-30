// Fetches reference answers from FreeAstrologyAPI into tests/fixtures, so the tests can check
// Jyotish's own calculations against an independent source without calling the API every run.
//
//   FREE_ASTROLOGY_API_KEY=... node scripts/fetch-fixtures.mjs
//
// About 40 requests; the free plan allows 500 a day.

import fs from "node:fs";
import path from "node:path";

const key = process.env.FREE_ASTROLOGY_API_KEY ?? readEnvLocal();
if (!key) {
  console.error("Set FREE_ASTROLOGY_API_KEY (or put it in .env.local)");
  process.exit(1);
}

function readEnvLocal() {
  try {
    const line = fs.readFileSync(".env.local", "utf8").split("\n").find((l) => l.startsWith("FREE_ASTROLOGY_API_KEY="));
    return line?.split("=")[1].trim();
  } catch {
    return undefined;
  }
}

const config = { observation_point: "geocentric", ayanamsha: "lahiri" };
const out = path.join("tests", "fixtures");
fs.mkdirSync(out, { recursive: true });

async function call(endpoint, body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://json.freeastrologyapi.com/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify(body),
    });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    const json = await res.json();
    // Some endpoints wrap their output in a JSON string, sometimes twice
    let output = json.output;
    while (typeof output === "string") output = JSON.parse(output);
    // Stay well under the per-second limit
    await new Promise((r) => setTimeout(r, 1200));
    return output;
  }
  throw new Error(`${endpoint}: rate limited`);
}

// Births spread over a century, in and outside India, with their local UTC offset
const births = [
  { id: "hyderabad-2022", year: 2022, month: 8, date: 11, hours: 6, minutes: 0, latitude: 17.38333, longitude: 78.4666, timezone: 5.5 },
  { id: "delhi-1990", year: 1990, month: 1, date: 1, hours: 12, minutes: 0, latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
  { id: "mumbai-2031", year: 2031, month: 6, date: 15, hours: 18, minutes: 30, latitude: 19.076, longitude: 72.8777, timezone: 5.5 },
  { id: "chennai-1965", year: 1965, month: 3, date: 10, hours: 4, minutes: 15, latitude: 13.0827, longitude: 80.2707, timezone: 5.5 },
  { id: "kolkata-1952", year: 1952, month: 11, date: 23, hours: 21, minutes: 40, latitude: 22.5726, longitude: 88.3639, timezone: 5.5 },
  { id: "patna-2001", year: 2001, month: 9, date: 5, hours: 2, minutes: 5, latitude: 25.5941, longitude: 85.1376, timezone: 5.5 },
  { id: "london-1984", year: 1984, month: 7, date: 17, hours: 11, minutes: 45, latitude: 51.5072, longitude: -0.1276, timezone: 1 },
  { id: "newyork-1975", year: 1975, month: 12, date: 2, hours: 8, minutes: 20, latitude: 40.7128, longitude: -74.006, timezone: -5 },
  { id: "sydney-2010", year: 2010, month: 4, date: 28, hours: 15, minutes: 10, latitude: -33.8688, longitude: 151.2093, timezone: 10 },
  { id: "jaipur-1999", year: 1999, month: 2, date: 14, hours: 23, minutes: 55, latitude: 26.9124, longitude: 75.7873, timezone: 5.5 },
];

const asInput = (b) => ({ ...b, seconds: 0, id: undefined, config });

const fixtures = { births, planets: {}, dasha: {}, tithi: {}, nakshatra: {}, matches: [] };

for (const b of births) {
  fixtures.planets[b.id] = await call("planets", asInput(b));
  process.stdout.write(".");
}
for (const b of births.slice(0, 4)) {
  fixtures.dasha[b.id] = await call("vimsottari/maha-dasas", asInput(b));
  fixtures.tithi[b.id] = await call("tithi-durations", asInput(b));
  fixtures.nakshatra[b.id] = await call("nakshatra-durations", asInput(b));
  process.stdout.write(".");
}

const pairs = [
  [0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [1, 4], [3, 6], [5, 8], [7, 0], [9, 2], [2, 5], [4, 9],
];
for (const [m, f] of pairs) {
  const strip = (b) => ({ ...b, seconds: 0, id: undefined });
  const output = await call("match-making/ashtakoot-score", { male: strip(births[m]), female: strip(births[f]), config });
  fixtures.matches.push({ male: births[m].id, female: births[f].id, output });
  process.stdout.write(".");
}

fs.writeFileSync(path.join(out, "freeastrologyapi.json"), JSON.stringify(fixtures, null, 1) + "\n");
console.log(`\nSaved ${path.join(out, "freeastrologyapi.json")}`);
