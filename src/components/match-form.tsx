"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { birthParams, type Birth } from "@/lib/birth";
import { BirthFields, draftFrom, isComplete, toBirth } from "./birth-form";
import { PickSaved } from "./saved-kundlis";

export function MatchForm({ boy, girl }: { boy: Birth | null; girl: Birth | null }) {
  const router = useRouter();
  const [b, setB] = useState(draftFrom(boy));
  const [g, setG] = useState(draftFrom(girl));
  const [tried, setTried] = useState(false);
  // Bumped when a side is filled from a saved kundli, so its place search shows the new place
  const [filled, setFilled] = useState({ b: 0, g: 0 });

  return (
    <form
      className="card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!isComplete(b) || !isComplete(g)) return;
        const q = new URLSearchParams({ ...birthParams(toBirth(b), "b"), ...birthParams(toBirth(g), "g") });
        router.push(`/matching?${q}`);
      }}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <PickSaved onPick={(k) => { setB(draftFrom(k)); setFilled((f) => ({ ...f, b: f.b + 1 })); }} />
          <BirthFields key={filled.b} value={b} onChange={setB} idPrefix="b-" heading="Boy's details" />
        </div>
        <div>
          <PickSaved onPick={(k) => { setG(draftFrom(k)); setFilled((f) => ({ ...f, g: f.g + 1 })); }} />
          <BirthFields key={filled.g} value={g} onChange={setG} idPrefix="g-" heading="Girl's details" />
        </div>
      </div>
      {tried && (!isComplete(b) || !isComplete(g)) && (
        <p className="mt-4 text-sm text-bad">Please enter the date, time and place of birth for both.</p>
      )}
      <button type="submit" className="btn btn-primary mt-6 w-full">
        <HeartHandshake size={18} /> Match kundlis
      </button>
    </form>
  );
}
