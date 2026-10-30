"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { birthParams, type Birth } from "@/lib/birth";
import { PlaceSearch, type Place } from "./place-search";

export interface BirthDraft {
  name: string;
  date: string;
  time: string;
  place: Place | null;
}

export const draftFrom = (b: Birth | null): BirthDraft =>
  b
    ? { name: b.name, date: b.date, time: b.time, place: { place: b.place, lat: b.lat, lon: b.lon, tz: b.tz } }
    : { name: "", date: "", time: "", place: null };

export const isComplete = (d: BirthDraft) => Boolean(d.date && d.time && d.place);

export const toBirth = (d: BirthDraft): Birth => ({ name: d.name.trim(), date: d.date, time: d.time, ...d.place! });

export function BirthFields({ value, onChange, idPrefix, heading }: { value: BirthDraft; onChange: (d: BirthDraft) => void; idPrefix: string; heading?: string }) {
  const set = (patch: Partial<BirthDraft>) => onChange({ ...value, ...patch });
  return (
    <fieldset className="space-y-4">
      {heading && <legend className="mb-3 font-display text-2xl font-semibold">{heading}</legend>}
      <div>
        <label className="label" htmlFor={`${idPrefix}name`}>Name</label>
        <input id={`${idPrefix}name`} className="field" placeholder="Optional" value={value.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor={`${idPrefix}date`}>Date of birth</label>
          <input id={`${idPrefix}date`} type="date" className="field" required min="1800-01-01" max="2200-12-31" value={value.date} onChange={(e) => set({ date: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor={`${idPrefix}time`}>Time of birth</label>
          <input id={`${idPrefix}time`} type="time" className="field" required value={value.time} onChange={(e) => set({ time: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}place`}>Place of birth</label>
        <PlaceSearch id={`${idPrefix}place`} value={value.place} onChange={(place) => set({ place })} />
        {value.place && (
          <p className="mt-1.5 text-xs text-muted">
            {value.place.lat.toFixed(2)}°, {value.place.lon.toFixed(2)}° · {value.place.tz}
          </p>
        )}
      </div>
    </fieldset>
  );
}

export function KundliForm({ initial }: { initial: Birth | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState(draftFrom(initial));
  const [tried, setTried] = useState(false);

  return (
    <form
      className="card space-y-5 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!isComplete(draft)) return;
        router.push(`/kundli?${new URLSearchParams(birthParams(toBirth(draft)))}`);
      }}
    >
      <BirthFields value={draft} onChange={setDraft} idPrefix="k-" />
      {tried && !isComplete(draft) && <p className="text-sm text-bad">Please enter the date, time and place of birth.</p>}
      <button type="submit" className="btn btn-primary w-full">
        <Sparkles size={18} /> {initial ? "Update kundli" : "Make my kundli"} <ArrowRight size={18} />
      </button>
      <p className="text-center text-xs text-muted">
        Don&apos;t know the exact time? Use your best guess. The ascendant changes about every two hours.
      </p>
    </form>
  );
}
