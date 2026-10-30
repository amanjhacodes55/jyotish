"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LocateFixed } from "lucide-react";
import { PlaceSearch, type Place } from "./place-search";

const shift = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

export function PanchangControls({ date, place }: { date: string; place: Place }) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);

  const go = (d: string, p: Place) => {
    const q = new URLSearchParams({ date: d, place: p.place, lat: p.lat.toFixed(4), lon: p.lon.toFixed(4), tz: p.tz });
    router.push(`/panchang?${q}`, { scroll: false });
  };

  return (
    <div className="card grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-end">
      <div>
        <label className="label" htmlFor="p-date">Date</label>
        <div className="flex items-center gap-1">
          <button type="button" className="grid h-11 w-10 place-items-center rounded-lg hover:bg-hover" aria-label="Previous day" onClick={() => go(shift(date, -1), place)}>
            <ChevronLeft size={18} />
          </button>
          <input id="p-date" type="date" className="field w-44" value={date} onChange={(e) => e.target.value && go(e.target.value, place)} />
          <button type="button" className="grid h-11 w-10 place-items-center rounded-lg hover:bg-hover" aria-label="Next day" onClick={() => go(shift(date, 1), place)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="p-place">Place</label>
        <PlaceSearch id="p-place" value={place} onChange={(p) => go(date, p)} />
      </div>
      <div>
        <button
          type="button"
          className="btn btn-ghost w-full text-sm"
          disabled={locating}
          onClick={() => {
            setLocating(true);
            setLocError(false);
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setLocating(false);
                go(date, {
                  place: "Your location",
                  lat: pos.coords.latitude,
                  lon: pos.coords.longitude,
                  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                });
              },
              () => {
                setLocating(false);
                setLocError(true);
              },
              { timeout: 10000 },
            );
          }}
        >
          <LocateFixed size={16} /> {locating ? "Locating…" : "Use my location"}
        </button>
        {locError && <p className="mt-1 text-xs text-bad">Location isn&apos;t available. Search for your city instead.</p>}
      </div>
    </div>
  );
}
