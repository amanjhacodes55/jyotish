import { NAKSHATRAS, SIGNS } from "@/lib/astro/constants";
import type { Kundli } from "@/lib/astro/kundli";
import type { Match } from "@/lib/astro/matching";
import type { Birth } from "@/lib/birth";
import { ShareButton } from "./share-button";

function Gauge({ score }: { score: number }) {
  const r = 80;
  const len = Math.PI * r;
  const frac = score / 36;
  return (
    <svg viewBox="0 0 200 116" className="w-64" role="img" aria-label={`${score} of 36 gunas`}>
      <defs>
        <linearGradient id="gauge" x1="0" x2="1">
          <stop offset="0" stopColor="var(--bad)" />
          <stop offset="0.5" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--good)" />
        </linearGradient>
      </defs>
      <path d={`M20 100A${r} ${r} 0 0 1 180 100`} fill="none" stroke="var(--raise)" strokeWidth="14" strokeLinecap="round" />
      <path
        d={`M20 100A${r} ${r} 0 0 1 180 100`}
        fill="none"
        stroke="url(#gauge)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${len * frac} ${len}`}
      />
      <text x="100" y="88" textAnchor="middle" fontSize="38" fontWeight="700" fill="var(--ink)" className="font-display">
        {score}
      </text>
      <text x="100" y="108" textAnchor="middle" fontSize="12" fill="var(--muted)">
        out of 36 gunas
      </text>
    </svg>
  );
}

function Person({ title, birth, kundli }: { title: string; birth: Birth; kundli: Kundli }) {
  const moon = kundli.planets.find((p) => p.id === "Moon")!;
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{birth.name || title}</p>
      <p className="mt-1 text-sm text-ink-2">
        Moon in {SIGNS[moon.sign].name} · {NAKSHATRAS[moon.nakshatra].name} pada {moon.pada}
      </p>
      <p className="text-sm text-ink-2">
        {kundli.manglik.fromLagna || kundli.manglik.fromMoon ? "Manglik" : "Not Manglik"} · {NAKSHATRAS[moon.nakshatra].gana} gana
      </p>
    </div>
  );
}

export function MatchView({ boy, girl, boyKundli, girlKundli, match }: { boy: Birth; girl: Birth; boyKundli: Kundli; girlKundli: Kundli; match: Match }) {
  const color = match.total >= 24 ? "text-good" : match.total >= 18 ? "text-gold" : "text-bad";
  const bothManglik = match.boyManglik && match.girlManglik;
  const oneManglik = match.boyManglik !== match.girlManglik;

  return (
    <div className="rise space-y-6">
      <div className="card flex flex-wrap items-center justify-center gap-8 p-6 md:justify-between">
        <Gauge score={match.total} />
        <div className="min-w-60 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">Ashtakoota Guna Milan</p>
          <p className={`font-display text-4xl font-bold ${color}`}>{match.verdict}</p>
          <p className="mt-2 max-w-xl text-ink-2">
            18 of 36 is the traditional minimum for marriage; above 24 is considered very good. Gunas are one part of
            compatibility. Astrologers also look at the full charts, the Manglik status and, above all, the two people.
          </p>
          <div className="mt-4">
            <ShareButton label="Share result" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Person title="Boy" birth={boy} kundli={boyKundli} />
        <Person title="Girl" birth={girl} kundli={girlKundli} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-line">
              <th className="px-5 py-3">Koota</th>
              <th className="px-5 py-3">Boy</th>
              <th className="px-5 py-3">Girl</th>
              <th className="px-5 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {match.kootas.map((k) => (
              <tr key={k.name} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-3">
                  <span className="font-semibold">{k.name}</span>
                  <span className="block text-xs text-muted">{k.about}</span>
                </td>
                <td className="px-5 py-3 text-ink-2">{k.boy}</td>
                <td className="px-5 py-3 text-ink-2">{k.girl}</td>
                <td className="px-5 py-3 text-right">
                  <span className="tabular-nums font-semibold">{k.score}</span>
                  <span className="text-muted"> / {k.max}</span>
                  <div className="ml-auto mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-raise">
                    <div
                      className={`h-full rounded-full ${k.score === k.max ? "bg-good" : k.score === 0 ? "bg-bad" : "bg-gold"}`}
                      style={{ width: `${Math.max((k.score / k.max) * 100, 4)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 text-sm text-ink-2">
          <p className="mb-1 font-semibold text-ink">Manglik</p>
          {bothManglik && "Both are Manglik, so the dosha is traditionally considered cancelled."}
          {oneManglik && `Only the ${match.boyManglik ? "boy" : "girl"} is Manglik. Many families consult an astrologer about remedies in this case.`}
          {!match.boyManglik && !match.girlManglik && "Neither is Manglik."}
        </div>
        <div className="card p-5 text-sm text-ink-2">
          <p className="mb-1 font-semibold text-ink">Doshas in the score</p>
          {match.kootas.find((k) => k.name === "Nadi")!.score === 0 && <p>Nadi dosha: both have the same nadi ({match.kootas.find((k) => k.name === "Nadi")!.boy}).</p>}
          {match.kootas.find((k) => k.name === "Bhakoot")!.score === 0 && <p>Bhakoot dosha: the Moon signs fall 2/12, 5/9 or 6/8 from each other.</p>}
          {match.kootas.find((k) => k.name === "Nadi")!.score > 0 && match.kootas.find((k) => k.name === "Bhakoot")!.score > 0 && <p>No Nadi or Bhakoot dosha.</p>}
        </div>
      </div>
    </div>
  );
}
