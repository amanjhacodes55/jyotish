"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, CalendarDays, MapPin, Trash2 } from "lucide-react";
import { keyOf, removeKundli, saveKundli, useSaved, type SavedKundli } from "@/client/saved";
import { birthQuery, type Birth } from "@/lib/birth";
import { fmtClock } from "@/lib/format";

export function SaveButton({ birth }: { birth: Birth }) {
  const saved = useSaved().some((s) => keyOf(s) === keyOf(birth));
  return (
    <button
      type="button"
      className={`btn text-sm ${saved ? "btn-ghost border-gold/60 text-gold-ink" : "btn-ghost"}`}
      onClick={() => (saved ? removeKundli(birth) : saveKundli(birth))}
      aria-pressed={saved}
    >
      {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} {saved ? "Saved" : "Save"}
    </button>
  );
}

const shortDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
};

function Row({ k }: { k: SavedKundli }) {
  return (
    <li className="card group flex items-center gap-3 p-4 transition hover:border-gold/50">
      <Link href={`/kundli?${birthQuery(k)}`} className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-semibold">{k.name || "Unnamed"}</p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
          <span className="flex items-center gap-1"><CalendarDays size={12} /> {shortDate(k.date)}, {fmtClock(k.time)}</span>
          {k.place && <span className="flex min-w-0 items-center gap-1"><MapPin size={12} /> <span className="truncate">{k.place}</span></span>}
        </p>
      </Link>
      <button
        type="button"
        onClick={() => removeKundli(k)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-hover hover:text-bad"
        aria-label={`Remove ${k.name || "this kundli"}`}
        title="Remove"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export function SavedList({ title = "Your saved kundlis", empty }: { title?: string; empty?: React.ReactNode }) {
  const saved = useSaved();
  if (!saved.length) return empty ?? null;
  return (
    <section>
      <h2 className="mb-1 font-display text-3xl font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-muted">Saved in this browser only. Nothing is sent anywhere.</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {saved.map((k) => (
          <Row key={keyOf(k)} k={k} />
        ))}
      </ul>
    </section>
  );
}

// For the matching form: fill one side from a saved kundli
export function PickSaved({ onPick }: { onPick: (b: Birth) => void }) {
  const saved = useSaved();
  if (!saved.length) return null;
  return (
    <select
      className="field mb-4 text-sm"
      value=""
      onChange={(e) => {
        const k = saved.find((s) => keyOf(s) === e.target.value);
        if (k) onPick(k);
      }}
      aria-label="Fill from a saved kundli"
    >
      <option value="">Fill from a saved kundli…</option>
      {saved.map((k) => (
        <option key={keyOf(k)} value={keyOf(k)}>
          {(k.name || "Unnamed") + " · " + shortDate(k.date)}
        </option>
      ))}
    </select>
  );
}
