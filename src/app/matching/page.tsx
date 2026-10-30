import type { Metadata } from "next";
import { MatchForm } from "@/components/match-form";
import { MatchView } from "@/components/match-view";
import { computeKundli } from "@/lib/astro/kundli";
import { matchKundlis } from "@/lib/astro/matching";
import { zonedToUtc } from "@/lib/astro/time";
import { parseBirth, type Birth } from "@/lib/birth";

export const metadata: Metadata = {
  title: "Kundli matching: Guna Milan out of 36",
  description: "Free kundli matching with Ashtakoota Guna Milan: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi, plus Manglik check.",
};

const kundliOf = (b: Birth) => computeKundli(zonedToUtc(b.date, b.time, b.tz), b.lat, b.lon);

export default async function MatchingPage({ searchParams }: PageProps<"/matching">) {
  const params = await searchParams;
  const boy = parseBirth(params, "b");
  const girl = parseBirth(params, "g");

  const result = boy && girl ? (() => {
    const boyKundli = kundliOf(boy);
    const girlKundli = kundliOf(girl);
    return { boyKundli, girlKundli, match: matchKundlis(boyKundli, girlKundli) };
  })() : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="rise mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-gold">Kundli Milan</p>
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          {result ? `${boy!.name || "Boy"} & ${girl!.name || "Girl"}` : <>Match two kundlis with <span className="gold-text">Guna Milan</span></>}
        </h1>
        {!result && (
          <p className="mt-3 max-w-2xl text-lg text-ink-2">
            The eight-fold Ashtakoota test compares the two Moons, for a score out of 36. You also see the Manglik status of both and any Nadi or Bhakoot dosha.
          </p>
        )}
      </div>
      {result && <MatchView boy={boy!} girl={girl!} {...result} />}
      <div className={result ? "mt-14" : ""}>
        {result && <h2 className="mb-5 font-display text-3xl font-semibold">Try another match</h2>}
        <MatchForm boy={boy} girl={girl} />
      </div>
    </div>
  );
}
