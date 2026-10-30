import { NAKSHATRAS, SIGNS } from "@/lib/astro/constants";

// U+FE0E asks for the plain text symbol rather than the coloured emoji
const GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((g) => g + "\uFE0E");

// The sidereal zodiac: 12 signs on the outer ring, the 27 nakshatras on the inner one
export function ZodiacWheel() {
  const c = 200;
  const pt = (r: number, deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="wheel-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold-ink)" />
          <stop offset="1" stopColor="var(--saffron)" />
        </linearGradient>
        <radialGradient id="wheel-glow">
          <stop offset="0" stopColor="var(--glow)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r="200" fill="url(#wheel-glow)" />
      <g className="spin-slow" style={{ transformOrigin: "200px 200px" }}>
        <circle cx={c} cy={c} r="190" fill="none" stroke="url(#wheel-gold)" strokeWidth="1.5" />
        <circle cx={c} cy={c} r="150" fill="none" stroke="var(--line)" strokeWidth="1" />
        <circle cx={c} cy={c} r="112" fill="none" stroke="var(--line)" strokeWidth="1" />
        {SIGNS.map((s, i) => {
          const [x1, y1] = pt(150, i * 30);
          const [x2, y2] = pt(190, i * 30);
          const [gx, gy] = pt(170, i * 30 + 15);
          return (
            <g key={s.name}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" />
              <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="20" fill="url(#wheel-gold)">
                {GLYPHS[i]}
              </text>
            </g>
          );
        })}
        {NAKSHATRAS.map((n, i) => {
          const [x1, y1] = pt(112, (i * 360) / 27);
          const [x2, y2] = pt(150, (i * 360) / 27);
          const [dx, dy] = pt(131, (i * 360) / 27 + 360 / 54);
          return (
            <g key={n.name}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" strokeWidth="0.8" />
              <circle cx={dx} cy={dy} r={i % 9 === 0 ? 2.6 : 1.6} fill="var(--gold)" opacity={i % 9 === 0 ? 1 : 0.6} />
            </g>
          );
        })}
      </g>
      <circle cx={c} cy={c} r="74" fill="var(--panel)" stroke="var(--line)" />
      <text x={c} y={c + 4} textAnchor="middle" dominantBaseline="central" fontSize="38" fill="url(#wheel-gold)" className="font-deva" fontWeight="700">
        ज्योतिष
      </text>
    </svg>
  );
}
