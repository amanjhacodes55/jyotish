import { Moon, MoonStar, Sunrise, Sunset } from "lucide-react";
import { SIGNS } from "@/lib/astro/constants";
import type { Panchang, Span } from "@/lib/astro/panchang";
import { fmtTime, fmtUntil } from "@/lib/format";

// The lit part of the Moon: a half disc on the lit side plus an ellipse for the terminator
export function MoonPhase({ elongation, size = 120 }: { elongation: number; size?: number }) {
  const r = 48;
  const c = 50;
  const e = (elongation * Math.PI) / 180;
  const rx = Math.abs(Math.cos(e)) * r;
  const waxing = elongation < 180;
  const gibbous = Math.cos(e) < 0;
  const d = waxing
    ? `M${c} ${c - r}A${r} ${r} 0 0 1 ${c} ${c + r}A${rx} ${r} 0 0 ${gibbous ? 1 : 0} ${c} ${c - r}Z`
    : `M${c} ${c - r}A${r} ${r} 0 0 0 ${c} ${c + r}A${rx} ${r} 0 0 ${gibbous ? 0 : 1} ${c} ${c - r}Z`;
  const lit = Math.round(((1 - Math.cos(e)) / 2) * 100);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`Moon ${lit}% lit, ${waxing ? "waxing" : "waning"}`}>
      <defs>
        <radialGradient id="moonlit" cx="40%" cy="35%">
          <stop offset="0" stopColor="#fff7dc" />
          <stop offset="1" stopColor="#e9cf8a" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={r} fill="var(--raise)" stroke="var(--line)" />
      <path d={d} fill="url(#moonlit)" />
    </svg>
  );
}

function Limb({ title, name, sub, until }: { title: string; name: string; sub?: string; until: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold">{name}</p>
      {sub && <p className="text-sm text-gold">{sub}</p>}
      <p className="mt-2 text-sm text-ink-2">{until}</p>
    </div>
  );
}

function Window({ name, span, tz, good }: { name: string; span: Span | null; tz: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${good ? "bg-good" : "bg-bad"}`} />
        {name}
      </span>
      <span className="tabular-nums text-ink-2">{span ? `${fmtTime(span.start, tz)} – ${fmtTime(span.end, tz)}` : "—"}</span>
    </div>
  );
}

export function PanchangView({ p, tz }: { p: Panchang; tz: string }) {
  const ref = p.sunrise ?? new Date();
  const until = (d: Date, next: string) => `until ${fmtUntil(d, ref, tz)}, then ${next}`;

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center gap-6 p-6">
        <MoonPhase elongation={p.elongation} />
        <div className="min-w-56 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            {p.tithi.paksha} paksha · {p.month.adhika ? "Adhika " : ""}
            {p.month.purnimanta === p.month.amanta ? p.month.amanta : `${p.month.purnimanta} (${p.month.amanta} amanta)`}
          </p>
          <p className="font-display text-4xl font-bold">
            {p.tithi.paksha} {p.tithi.name}
          </p>
          <p className="mt-1 text-ink-2">
            {p.weekday.sanskrit} ({p.weekday.name}) · Moon in {SIGNS[p.moonSign].name} · {p.ritu} ritu
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <span className="flex items-center gap-2 text-ink-2"><Sunrise size={18} className="text-saffron" /> {fmtTime(p.sunrise, tz)}</span>
          <span className="flex items-center gap-2 text-ink-2"><Sunset size={18} className="text-saffron" /> {fmtTime(p.sunset, tz)}</span>
          <span className="flex items-center gap-2 text-ink-2"><MoonStar size={18} className="text-gold" /> {fmtTime(p.moonrise, tz)}</span>
          <span className="flex items-center gap-2 text-ink-2"><Moon size={18} className="text-gold" /> {fmtTime(p.moonset, tz)}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Limb title="Tithi" name={p.tithi.name} sub={`${p.tithi.paksha} ${p.tithi.number}`} until={until(p.tithi.endsAt, p.tithi.next)} />
        <Limb title="Nakshatra" name={p.nakshatra.name} sub={`Pada ${p.nakshatra.pada}`} until={until(p.nakshatra.endsAt, p.nakshatra.next)} />
        <Limb title="Yoga" name={p.yoga.name} until={until(p.yoga.endsAt, p.yoga.next)} />
        <Limb title="Karana" name={p.karana.name} until={until(p.karana.endsAt, p.karana.next)} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card px-6 py-3 text-sm">
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">Auspicious times</p>
          <div className="divide-y divide-line">
            <Window name="Brahma muhurta" span={p.brahmaMuhurta} tz={tz} good />
            <Window name="Abhijit muhurta" span={p.abhijit} tz={tz} good />
          </div>
        </div>
        <div className="card px-6 py-3 text-sm">
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">Avoid for new work</p>
          <div className="divide-y divide-line">
            <Window name="Rahu Kalam" span={p.rahuKalam} tz={tz} good={false} />
            <Window name="Yamaganda" span={p.yamaganda} tz={tz} good={false} />
            <Window name="Gulika Kalam" span={p.gulikaKalam} tz={tz} good={false} />
          </div>
        </div>
        <div className="card px-6 py-3 text-sm">
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">Calendar</p>
          <dl className="divide-y divide-line">
            {[
              ["Month (amanta)", p.month.amanta + (p.month.adhika ? " Adhika" : "")],
              ["Month (purnimanta)", p.month.purnimanta],
              ["Sun sign", SIGNS[p.sunSign].name],
              ["Moon sign", SIGNS[p.moonSign].name],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-3">
                <dt>{k}</dt>
                <dd className="text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
