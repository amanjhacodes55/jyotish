import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, CalendarDays, HeartHandshake, ScrollText, ShieldCheck } from "lucide-react";
import { MoonPhase } from "@/components/panchang-view";
import { ZodiacWheel } from "@/components/zodiac-wheel";
import { SIGNS } from "@/lib/astro/constants";
import { computePanchang } from "@/lib/astro/panchang";
import { todayIn } from "@/lib/astro/time";
import { fmtTime, fmtUntil } from "@/lib/format";
import { DELHI } from "@/lib/places";

const FEATURES = [
  {
    href: "/kundli",
    icon: ScrollText,
    title: "Kundli",
    text: "Rashi and Navamsa charts in North or South Indian style, all nine planets with nakshatra and pada, Manglik check and 120 years of Vimshottari dasha.",
  },
  {
    href: "/panchang",
    icon: CalendarDays,
    title: "Panchang",
    text: "Tithi, nakshatra, yoga and karana with their exact end times, sunrise and moonrise, Rahu Kalam and the day's muhurtas, for any city on any date.",
  },
  {
    href: "/matching",
    icon: HeartHandshake,
    title: "Kundli matching",
    text: "Ashtakoota Guna Milan out of 36, koota by koota, with Nadi and Bhakoot doshas and the Manglik status of both.",
  },
];

export default async function Home() {
  await connection();
  const date = todayIn(DELHI.tz);
  const p = computePanchang(date, DELHI.tz, DELHI.lat, DELHI.lon);
  const tz = DELHI.tz;

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-10 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div className="rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-ink-2">
            <ShieldCheck size={15} className="text-good" /> Free · open source · no sign-up
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Vedic astrology, <span className="gold-text">calculated in the open</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">
            Make your kundli, read today&apos;s panchang and match two charts with Guna Milan. Every position is computed by
            Jyotish&apos;s own astronomical engine, the code is public, and nothing about you is stored.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/kundli" className="btn btn-primary">
              Make my kundli <ArrowRight size={18} />
            </Link>
            <Link href="/panchang" className="btn btn-ghost">
              Today&apos;s panchang
            </Link>
          </div>
        </div>
        <div className="rise mx-auto aspect-square w-full max-w-[460px]" style={{ animationDelay: "0.15s" }}>
          <ZodiacWheel />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <Link href="/panchang" className="card group flex flex-wrap items-center gap-6 p-6 transition hover:border-gold/50">
          <MoonPhase elongation={p.elongation} size={88} />
          <div className="min-w-56 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Today in New Delhi · {p.weekday.sanskrit}</p>
            <p className="font-display text-3xl font-semibold">
              {p.tithi.paksha} {p.tithi.name}
              <span className="text-ink-2"> · {p.nakshatra.name}</span>
            </p>
            <p className="mt-1 text-sm text-ink-2">
              Tithi until {fmtUntil(p.tithi.endsAt, p.sunrise ?? new Date(), tz)} · {p.month.purnimanta} month · Moon in {SIGNS[p.moonSign].name}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <dt className="text-muted">Sunrise</dt>
            <dd className="tabular-nums">{fmtTime(p.sunrise, tz)}</dd>
            <dt className="text-muted">Sunset</dt>
            <dd className="tabular-nums">{fmtTime(p.sunset, tz)}</dd>
            <dt className="text-muted">Rahu Kalam</dt>
            <dd className="tabular-nums">{p.rahuKalam ? `${fmtTime(p.rahuKalam.start, tz)}–${fmtTime(p.rahuKalam.end, tz)}` : "—"}</dd>
          </dl>
          <ArrowRight className="text-muted transition group-hover:translate-x-1 group-hover:text-gold" />
        </Link>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link key={f.href} href={f.href} className="card rise group p-7 transition hover:-translate-y-1 hover:border-gold/50" style={{ animationDelay: `${0.1 * i}s` }}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-raise text-gold">
                <f.icon size={24} />
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-ink-2">{f.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold-ink">
                Open <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="card grid gap-8 p-8 md:grid-cols-2 md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">How it works</p>
            <h2 className="mt-2 font-display text-4xl font-semibold">Real astronomy, not a lookup table</h2>
          </div>
          <div className="space-y-4 text-ink-2">
            <p>
              Jyotish computes where the Sun, Moon and planets were with the open-source{" "}
              <a className="text-gold-ink underline-offset-4 hover:underline" href="https://github.com/cosinekitty/astronomy">Astronomy Engine</a>, then
              applies the Lahiri ayanamsa to get sidereal positions, the way Vedic astrology has always worked.
            </p>
            <p>
              The results are checked against a professional astrology API in an automated test suite: the ascendant and Rahu
              agree to the arcsecond and the planets within an arcminute, across births from 1952 to 2031 in India, London, New York and Sydney.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
