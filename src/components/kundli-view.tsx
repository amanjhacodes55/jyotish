import { CalendarDays, Clock, MapPin } from "lucide-react";
import { NAKSHATRAS, PLANET_INFO, SIGNS } from "@/lib/astro/constants";
import { currentPeriod } from "@/lib/astro/dasha";
import { formatDegree, type Kundli } from "@/lib/astro/kundli";
import { DASHA_THEMES, NAKSHATRA_TRAITS, SIGN_TRAITS } from "@/lib/astro/meanings";
import type { Birth } from "@/lib/birth";
import { fmtClock, fmtDate, fmtLongDate } from "@/lib/format";
import { formatOffset, offsetMinutes } from "@/lib/astro/time";
import { ChartPair } from "./chart-pair";
import { ShareButton } from "./share-button";
import { SaveButton } from "./saved-kundlis";
import { SkyMap } from "./sky-map";
import type { Sky } from "@/lib/sky/sky";

const signText = (s: number) => `${SIGNS[s].name} · ${SIGNS[s].sanskrit}`;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold leading-tight">{value}</p>
      {sub && <p className="mt-1 text-sm text-ink-2">{sub}</p>}
    </div>
  );
}

function Section({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      {kicker && <p className="text-sm font-semibold uppercase tracking-wider text-gold">{kicker}</p>}
      <h2 className="mb-5 font-display text-3xl font-semibold md:text-4xl">{title}</h2>
      {children}
    </section>
  );
}

export function KundliView({ birth, kundli, sky }: { birth: Birth; kundli: Kundli; sky: Sky }) {
  const moon = kundli.planets.find((p) => p.id === "Moon")!;
  const sun = kundli.planets.find((p) => p.id === "Sun")!;
  const now = new Date();
  const md = currentPeriod(kundli.dasha, now);
  const ad = md && currentPeriod(md.antardashas, now);
  const tz = birth.tz;

  // Rahu and Ketu always move backwards, so only the true planets get the R mark
  const chartPlanet = (p: (typeof kundli.planets)[number], sign: number) => ({
    label: PLANET_INFO[p.id].short,
    retrograde: p.retrograde && p.id !== "Rahu" && p.id !== "Ketu",
    sign,
  });

  return (
    <div className="rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">Janma Kundli</p>
          <h1 className="font-display text-4xl font-bold md:text-5xl">{birth.name || "Your birth chart"}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
            <span className="flex items-center gap-1.5"><CalendarDays size={15} /> {fmtLongDate(birth.date)}</span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} /> {fmtClock(birth.time)} ({formatOffset(offsetMinutes(kundli.birth, tz))})
            </span>
            {birth.place && <span className="flex items-center gap-1.5"><MapPin size={15} /> {birth.place}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <SaveButton birth={birth} />
          <ShareButton />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Ascendant (Lagna)" value={SIGNS[kundli.lagna.sign].name} sub={`${SIGNS[kundli.lagna.sign].sanskrit} · ${formatDegree(kundli.lagna.degree)}`} />
        <Stat label="Moon sign (Rashi)" value={SIGNS[moon.sign].name} sub={`${SIGNS[moon.sign].sanskrit} · ${formatDegree(moon.degree)}`} />
        <Stat label="Birth star (Nakshatra)" value={NAKSHATRAS[moon.nakshatra].name} sub={`Pada ${moon.pada} · ruled by ${moon.nakshatraLord}`} />
        <Stat
          label="Running dasha"
          value={md ? `${md.lord}${ad ? ` – ${ad.lord}` : ""}` : "—"}
          sub={md ? `${md.lord} until ${fmtDate(md.end, tz)}` : undefined}
        />
      </div>

      <Section title="Birth charts" kicker="Rashi and Navamsa">
        <ChartPair
          charts={[
            {
              title: "Rashi (D1)",
              caption: "Where the planets were at birth",
              lagnaSign: kundli.lagna.sign,
              planets: kundli.planets.map((p) => chartPlanet(p, p.sign)),
            },
            {
              title: "Navamsa (D9)",
              caption: "The ninth division: marriage, dharma and inner strength",
              lagnaSign: kundli.lagna.navamsa,
              planets: kundli.planets.map((p) => chartPlanet(p, p.navamsa)),
            },
          ]}
        />
      </Section>

      <Section title="The sky when you were born" kicker="Planets and constellations">
        <SkyMap sky={sky} place={birth.place} />
      </Section>

      <Section title="Planetary positions" kicker="Graha">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3">Planet</th>
                <th className="px-4 py-3">Sign</th>
                <th className="px-4 py-3">Degree</th>
                <th className="px-4 py-3">Nakshatra</th>
                <th className="px-4 py-3">House</th>
                <th className="px-4 py-3">Navamsa</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line/60">
                <td className="px-4 py-3 font-semibold text-saffron">Ascendant</td>
                <td className="px-4 py-3">{signText(kundli.lagna.sign)}</td>
                <td className="px-4 py-3 tabular-nums">{formatDegree(kundli.lagna.degree)}</td>
                <td className="px-4 py-3">{NAKSHATRAS[kundli.lagna.nakshatra].name} {kundli.lagna.pada}</td>
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">{SIGNS[kundli.lagna.navamsa].name}</td>
                <td className="px-4 py-3" />
              </tr>
              {kundli.planets.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <span className="mr-2 text-gold">{PLANET_INFO[p.id].glyph}</span>
                    <span className="font-semibold">{p.id}</span>
                    <span className="ml-1.5 text-muted">{PLANET_INFO[p.id].sanskrit}</span>
                  </td>
                  <td className="px-4 py-3">{signText(p.sign)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatDegree(p.degree)}</td>
                  <td className="px-4 py-3">
                    {NAKSHATRAS[p.nakshatra].name} {p.pada}
                    <span className="text-muted"> · {p.nakshatraLord}</span>
                  </td>
                  <td className="px-4 py-3">{p.house}</td>
                  <td className="px-4 py-3">{SIGNS[p.navamsa].name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.retrograde && p.id !== "Rahu" && p.id !== "Ketu" && <span className="rounded-full bg-raise px-2 py-0.5 text-xs">Retrograde</span>}
                      {p.dignity && (
                        <span className={`rounded-full px-2 py-0.5 text-xs ${p.dignity === "Debilitated" ? "bg-bad/15 text-bad" : "bg-good/15 text-good"}`}>{p.dignity}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Sidereal positions, Lahiri ayanamsa {formatDegree(kundli.ayanamsa)}. Whole-sign houses from the ascendant. Sun sign (sidereal):{" "}
          {SIGNS[sun.sign].name}.
        </p>
      </Section>

      <Section title="What your chart says" kicker="Readings">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{SIGNS[kundli.lagna.sign].name} ascendant</p>
            <p className="mt-1 text-sm text-gold">{SIGN_TRAITS[kundli.lagna.sign].element} · {SIGN_TRAITS[kundli.lagna.sign].quality}</p>
            <p className="mt-3 text-ink-2">{SIGN_TRAITS[kundli.lagna.sign].text}</p>
          </div>
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Moon in {SIGNS[moon.sign].name}</p>
            <p className="mt-1 text-sm text-gold">Your mind and emotions</p>
            <p className="mt-3 text-ink-2">{SIGN_TRAITS[moon.sign].text}</p>
          </div>
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{NAKSHATRAS[moon.nakshatra].name} nakshatra</p>
            <p className="mt-1 text-sm text-gold">
              {NAKSHATRA_TRAITS[moon.nakshatra].symbol} · deity {NAKSHATRAS[moon.nakshatra].deity}
            </p>
            <p className="mt-3 text-ink-2">
              {NAKSHATRA_TRAITS[moon.nakshatra].text} Gana: {NAKSHATRAS[moon.nakshatra].gana}, yoni: {NAKSHATRAS[moon.nakshatra].yoni}.
            </p>
          </div>
        </div>
        <div className={`card mt-4 flex flex-wrap items-center gap-4 p-6 ${kundli.manglik.fromLagna || kundli.manglik.fromMoon ? "border-saffron/50" : ""}`}>
          <div className="min-w-48 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Manglik dosha</p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {kundli.manglik.fromLagna && kundli.manglik.fromMoon ? "Manglik" : kundli.manglik.fromLagna || kundli.manglik.fromMoon ? "Mildly Manglik" : "Not Manglik"}
            </p>
          </div>
          <p className="flex-[2] text-sm text-ink-2">
            Mars is in house {kundli.manglik.house} from the ascendant and house {kundli.manglik.houseFromMoon} from the Moon. Mars in the 1st,
            2nd, 4th, 7th, 8th or 12th makes a chart Manglik; many traditions cancel the dosha when both partners have it.
          </p>
        </div>
      </Section>

      <Section title="Vimshottari dasha" kicker="Planetary periods">
        <div className="space-y-2">
          {kundli.dasha.map((d) => {
            const running = d === md;
            return (
              <details key={d.lord + d.start.getTime()} open={running} className={`card group overflow-hidden ${running ? "border-gold/60" : ""}`}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-5 py-4">
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-raise text-lg text-gold">{PLANET_INFO[d.lord].glyph}</span>
                    <span>
                      <span className="font-semibold">{d.lord} mahadasha</span>
                      {running && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-ink">Now</span>}
                      <span className="block text-xs text-muted">{DASHA_THEMES[d.lord]}</span>
                    </span>
                  </span>
                  <span className="text-sm tabular-nums text-ink-2">
                    {fmtDate(d.start, tz)} – {fmtDate(d.end, tz)}
                  </span>
                </summary>
                <div className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
                  {d.antardashas.map((a) => {
                    const now = a === ad;
                    return (
                      <div key={a.lord} className={`bg-panel px-5 py-3 text-sm ${now ? "text-gold-ink" : ""}`}>
                        <span className="font-medium">{d.lord} – {a.lord}</span>
                        {now && <span className="ml-2 text-xs font-semibold">Now</span>}
                        <span className="block text-xs text-muted tabular-nums">until {fmtDate(a.end, tz)}</span>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
