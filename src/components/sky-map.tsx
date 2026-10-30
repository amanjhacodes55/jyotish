import { PLANET_INFO } from "@/lib/astro/constants";
import { COMPASS, HORIZON, SIZE, ZODIAC, direction, type Sky } from "@/lib/sky/sky";

const PLANET_COLOR: Record<string, string> = {
  Sun: "#ffd166",
  Moon: "#f4efe3",
  Mars: "#ff7a59",
  Mercury: "#9fd3c7",
  Jupiter: "#f2c48d",
  Venus: "#fff6c9",
  Saturn: "#d8c38a",
};

function skyState(sunAlt: number) {
  if (sunAlt > 0) return { label: "daytime", top: "#3b6fb6", bottom: "#8fb8e8", starOpacity: 0.28 };
  if (sunAlt > -12) return { label: "twilight", top: "#1d2456", bottom: "#5b4a7a", starOpacity: 0.65 };
  return { label: "night", top: "#070816", bottom: "#141638", starOpacity: 1 };
}

export function SkyMap({ sky, place }: { sky: Sky; place: string }) {
  const state = skyState(sky.sunAltitude);
  const below = sky.planets.filter((p) => !p.above);
  const lit = Math.round(((1 - Math.cos((sky.moonPhase * Math.PI) / 180)) / 2) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,600px)_1fr] lg:items-start">
      <div className="card p-3">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full" role="img" aria-label={`The sky above ${place} at the moment of birth`}>
          <defs>
            <radialGradient id="sky-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor={state.top} />
              <stop offset="1" stopColor={state.bottom} />
            </radialGradient>
            <clipPath id="sky-clip">
              <circle cx={HORIZON.cx} cy={HORIZON.cy} r={HORIZON.r} />
            </clipPath>
          </defs>

          <circle cx={HORIZON.cx} cy={HORIZON.cy} r={HORIZON.r} fill="url(#sky-bg)" />
          <g clipPath="url(#sky-clip)">
            {/* Altitude rings at 30° and 60° */}
            {[30, 60].map((alt) => (
              <circle
                key={alt}
                cx={HORIZON.cx}
                cy={HORIZON.cy}
                r={HORIZON.r * Math.tan(((90 - alt) / 2) * (Math.PI / 180))}
                fill="none"
                stroke="white"
                strokeOpacity="0.07"
              />
            ))}
            <path d={sky.ecliptic} fill="none" stroke="#f2853a" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="5 5" />
            {sky.figures.map((f) => (
              <path
                key={f.id}
                d={f.d}
                fill="none"
                stroke={f.zodiac ? "#e9b949" : "#a9b4ff"}
                strokeOpacity={f.zodiac ? 0.75 : 0.28}
                strokeWidth={f.zodiac ? 1.3 : 0.8}
              />
            ))}
            <g opacity={state.starOpacity}>
              {sky.stars.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={Math.max(0.55, 3.1 - 0.55 * s.mag)} fill="white" opacity={Math.min(1, 1.25 - s.mag * 0.16)}>
                  {s.name && <title>{s.name}</title>}
                </circle>
              ))}
              {sky.stars
                .filter((s) => s.name)
                .map((s) => (
                  <text key={s.name} x={s.x + 5} y={s.y - 4} fontSize="9" fill="white" opacity="0.6">
                    {s.name}
                  </text>
                ))}
            </g>
            {sky.labels.map((l) => (
              <text
                key={l.id}
                x={l.x}
                y={l.y}
                textAnchor="middle"
                fontSize={l.zodiac ? 12 : 9}
                fontWeight={l.zodiac ? 700 : 400}
                fill={l.zodiac ? "#f5d27e" : "#c8cdf5"}
                opacity={l.zodiac ? 0.95 : 0.45}
                letterSpacing={l.zodiac ? 0.5 : 0}
              >
                {l.zodiac ? `${ZODIAC[l.id][0]} · ${ZODIAC[l.id][1]}` : l.name}
              </text>
            ))}
          </g>
          <circle cx={HORIZON.cx} cy={HORIZON.cy} r={HORIZON.r} fill="none" stroke="var(--chart-line)" strokeWidth="2" />
          {/* Planets go on top and outside the clip, so a name near the horizon isn't cut off */}
            {sky.planets
              .filter((p) => p.above)
              .map((p) => (
                <g key={p.id}>
                  <circle cx={p.x} cy={p.y} r={p.id === "Sun" ? 13 : p.id === "Moon" ? 11 : 9} fill={PLANET_COLOR[p.id]} opacity="0.18" />
                  <circle cx={p.x} cy={p.y} r={p.id === "Sun" ? 7 : p.id === "Moon" ? 6 : 4} fill={PLANET_COLOR[p.id]} stroke="#0b0a1a" strokeWidth="1">
                    <title>{`${p.id}: ${p.alt.toFixed(0)}° up, towards the ${direction(p.az)}`}</title>
                  </circle>
                  <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="12" fontWeight="700" fill={PLANET_COLOR[p.id]}>
                    {PLANET_INFO[p.id].glyph} {p.id}
                  </text>
                </g>
              ))}

          {COMPASS.map((c) => (
            <text key={c.label} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill="var(--muted)">
              {c.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">How to read it</p>
          <p className="mt-2 text-ink-2">
            This is the whole sky above {place || "the birth place"} at the moment of birth, as if you were lying on your back with your
            head to the north: the centre is straight overhead and the edge is the horizon, so east is on the left.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
            <li><span className="text-gold">Gold figures</span> are the twelve zodiac constellations, with their rashi names.</li>
            <li><span className="text-saffron">The dashed line</span> is the ecliptic, the Sun&apos;s path, where the planets and nakshatras lie.</li>
            <li>Hover or tap a planet to see how high it was and in which direction.</li>
          </ul>
        </div>
        <div className="card p-6 text-sm text-ink-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">At that moment</p>
          <p className="mt-2">
            It was <span className="font-semibold text-ink">{state.label}</span>
            {state.label === "daytime" && ", so the stars were hidden by sunlight; this map shows where they were"}. The Moon was{" "}
            {lit}% lit and {sky.moonPhase < 180 ? "growing" : "shrinking"}.
          </p>
          <p className="mt-2">
            <span className="font-semibold text-ink">Above the horizon:</span>{" "}
            {sky.planets.filter((p) => p.above).map((p) => p.id).join(", ") || "none of the planets"}.
          </p>
          {below.length > 0 && (
            <p className="mt-1">
              <span className="font-semibold text-ink">Below the horizon:</span> {below.map((p) => p.id).join(", ")}.
            </p>
          )}
          <p className="mt-3 text-xs text-muted">
            Rahu and Ketu are not drawn: they are the points where the Moon&apos;s path crosses the Sun&apos;s, not objects in the sky. The
            constellations here are the real star patterns; the rashis in the kundli are equal 30° signs measured along the ecliptic.
          </p>
        </div>
      </div>
    </div>
  );
}
