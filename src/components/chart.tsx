import { SIGNS } from "@/lib/astro/constants";

export interface ChartPlanet {
  label: string; // "Su", "Ju"
  retrograde?: boolean;
  sign: number;
}

interface ChartProps {
  title: string;
  lagnaSign: number;
  planets: ChartPlanet[];
}

const SIZE = 400;

// North Indian: houses are fixed (house 1 is the top diamond) and the sign numbers move.
// Points for each house, 1..12: where its planets go and where its sign number sits.
const NORTH = [
  { at: [200, 92], sign: [200, 178], perRow: 3 },
  { at: [100, 36], sign: [100, 82], perRow: 3 },
  { at: [38, 100], sign: [82, 104], perRow: 2 },
  { at: [96, 200], sign: [178, 204], perRow: 3 },
  { at: [38, 300], sign: [82, 304], perRow: 2 },
  { at: [100, 352], sign: [100, 326], perRow: 3 },
  { at: [200, 292], sign: [200, 230], perRow: 3 },
  { at: [300, 352], sign: [300, 326], perRow: 3 },
  { at: [362, 300], sign: [318, 304], perRow: 2 },
  { at: [304, 200], sign: [222, 204], perRow: 3 },
  { at: [362, 100], sign: [318, 104], perRow: 2 },
  { at: [300, 36], sign: [300, 82], perRow: 3 },
];

type Label = { text: string; retrograde?: boolean; lagna?: boolean };

function Labels({ x, y, labels, perRow }: { x: number; y: number; labels: Label[]; perRow: number }) {
  const rows: Label[][] = [];
  for (let i = 0; i < labels.length; i += perRow) rows.push(labels.slice(i, i + perRow));
  const lineHeight = 17;
  const top = y - ((rows.length - 1) * lineHeight) / 2;
  return (
    <>
      {rows.map((row, i) => (
        <text key={i} x={x} y={top + i * lineHeight} textAnchor="middle" dominantBaseline="middle" className="chart-planet" fontSize="14" fontWeight="600">
          {row.map((l, j) => (
            <tspan key={j} className={l.lagna ? "chart-lagna" : undefined}>
              {(j ? " " : "") + l.text}
              {l.retrograde && (
                <tspan fontSize="9" dy="-6">
                  R
                </tspan>
              )}
              {l.retrograde && <tspan dy="6" />}
            </tspan>
          ))}
        </text>
      ))}
    </>
  );
}

export function NorthChart({ title, lagnaSign, planets }: ChartProps) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${title}, North Indian style`} className="h-auto w-full">
      <rect x="1" y="1" width={SIZE - 2} height={SIZE - 2} rx="6" className="chart-frame" strokeWidth="2" />
      <g className="chart-line" strokeWidth="1.5" fill="none">
        <path d={`M0 0L${SIZE} ${SIZE}M${SIZE} 0L0 ${SIZE}`} />
        <path d={`M200 0L400 200L200 400L0 200Z`} />
      </g>
      {NORTH.map((h, i) => {
        const sign = (lagnaSign + i) % 12;
        const labels: Label[] = [
          ...(i === 0 ? [{ text: "Asc", lagna: true }] : []),
          ...planets.filter((p) => p.sign === sign).map((p) => ({ text: p.label, retrograde: p.retrograde })),
        ];
        return (
          <g key={i}>
            <text x={h.sign[0]} y={h.sign[1]} textAnchor="middle" dominantBaseline="middle" fontSize="12" className="chart-sign">
              {sign + 1}
            </text>
            <Labels x={h.at[0]} y={h.at[1]} labels={labels} perRow={h.perRow} />
          </g>
        );
      })}
    </svg>
  );
}

// South Indian: signs are fixed in a ring (Pisces top-left, Aries next, clockwise), the lagna is marked
const SOUTH_CELLS: [number, number][] = [
  [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0],
];

export function SouthChart({ title, lagnaSign, planets }: ChartProps) {
  const cell = SIZE / 4;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${title}, South Indian style`} className="h-auto w-full">
      <rect x="1" y="1" width={SIZE - 2} height={SIZE - 2} rx="6" className="chart-frame" strokeWidth="2" />
      <g className="chart-line" strokeWidth="1.5" fill="none">
        <path d={`M100 0V400M300 0V400M0 100H400M0 300H400M200 0V100M200 300V400M0 200H100M300 200H400`} />
        <rect x={cell} y={cell} width={cell * 2} height={cell * 2} />
      </g>
      <text x="200" y="200" textAnchor="middle" dominantBaseline="middle" fontSize="20" className="chart-sign font-display" fontWeight="700">
        {title}
      </text>
      {SOUTH_CELLS.map(([c, r], sign) => {
        const x = c * cell;
        const y = r * cell;
        const labels: Label[] = planets.filter((p) => p.sign === sign).map((p) => ({ text: p.label, retrograde: p.retrograde }));
        return (
          <g key={sign}>
            <text x={x + 8} y={y + 16} fontSize="11" className="chart-sign">
              {SIGNS[sign].name.slice(0, 3)}
            </text>
            {sign === lagnaSign && (
              <>
                <path d={`M${x} ${y + 26}L${x + 26} ${y}`} className="chart-line" stroke="var(--saffron)" strokeWidth="2" />
                <text x={x + cell - 8} y={y + 16} fontSize="11" textAnchor="end" className="chart-lagna" fontWeight="700">
                  Asc
                </text>
              </>
            )}
            <Labels x={x + cell / 2} y={y + cell / 2 + 8} labels={labels} perRow={2} />
          </g>
        );
      })}
    </svg>
  );
}
