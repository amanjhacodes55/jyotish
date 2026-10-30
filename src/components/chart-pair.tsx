"use client";

import { useState, useSyncExternalStore } from "react";
import { NorthChart, SouthChart, type ChartPlanet } from "./chart";

type Style = "north" | "south";
const KEY = "jyotish:chart-style";

// The chart style is a per-viewer preference, so it lives in this browser only
function savedStyle(): Style {
  try {
    return localStorage.getItem(KEY) === "south" ? "south" : "north";
  } catch {
    return "north";
  }
}

export function ChartPair({ charts }: { charts: { title: string; caption: string; lagnaSign: number; planets: ChartPlanet[] }[] }) {
  const initial = useSyncExternalStore(() => () => {}, savedStyle, () => "north" as Style);
  const [picked, setPicked] = useState<Style | null>(null);
  const style = picked ?? initial;

  const choose = (s: Style) => {
    setPicked(s);
    try {
      localStorage.setItem(KEY, s);
    } catch {}
  };

  const Chart = style === "north" ? NorthChart : SouthChart;
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-full border border-line p-1 text-sm" role="group" aria-label="Chart style">
          {(["north", "south"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => choose(s)}
              aria-pressed={style === s}
              className={`rounded-full px-3.5 py-1.5 font-medium transition ${style === s ? "bg-raise text-gold-ink" : "text-muted hover:text-ink"}`}
            >
              {s === "north" ? "North Indian" : "South Indian"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {charts.map((c) => (
          <figure key={c.title} className="card p-4">
            <Chart title={c.title} lagnaSign={c.lagnaSign} planets={c.planets} />
            <figcaption className="mt-3 text-center">
              <span className="font-display text-xl font-semibold">{c.title}</span>
              <span className="block text-xs text-muted">{c.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
