import type { Metadata } from "next";
import { KundliForm } from "@/components/birth-form";
import { KundliView } from "@/components/kundli-view";
import { computeKundli } from "@/lib/astro/kundli";
import { zonedToUtc } from "@/lib/astro/time";
import { parseBirth } from "@/lib/birth";

export async function generateMetadata({ searchParams }: PageProps<"/kundli">): Promise<Metadata> {
  const birth = parseBirth(await searchParams);
  if (!birth) return { title: "Free kundli with Navamsa and dasha" };
  return { title: birth.name ? `${birth.name}'s kundli` : "Birth chart", robots: { index: false } };
}

export default async function KundliPage({ searchParams }: PageProps<"/kundli">) {
  const birth = parseBirth(await searchParams);

  if (!birth) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1fr_440px] md:items-center">
        <div className="rise">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">Janma Kundli</p>
          <h1 className="mt-2 font-display text-5xl font-bold leading-tight md:text-6xl">
            Your birth chart, <span className="gold-text">calculated precisely</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-2">
            Enter your date, time and place of birth. You get your ascendant, Moon sign and nakshatra, Rashi and Navamsa charts
            in North or South Indian style, every planet&apos;s position, Manglik status and your full Vimshottari dasha.
          </p>
          <ul className="mt-6 space-y-2 text-ink-2">
            <li>✦ Free, with no sign-up</li>
            <li>✦ Nothing about you is saved; the chart lives in its link</li>
            <li>✦ Lahiri ayanamsa, checked against a professional astrology API</li>
          </ul>
        </div>
        <div className="rise" style={{ animationDelay: "0.1s" }}>
          <KundliForm initial={null} />
        </div>
      </div>
    );
  }

  const kundli = computeKundli(zonedToUtc(birth.date, birth.time, birth.tz), birth.lat, birth.lon);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <KundliView birth={birth} kundli={kundli} />
      <section className="mt-14 grid gap-6 md:grid-cols-[1fr_440px] md:items-start">
        <div>
          <h2 className="font-display text-3xl font-semibold">Make another kundli</h2>
          <p className="mt-2 text-ink-2">Change any detail and the chart updates. The link above always matches what you see.</p>
        </div>
        <KundliForm initial={birth} />
      </section>
    </div>
  );
}
