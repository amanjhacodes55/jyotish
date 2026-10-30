"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle, MapPin } from "lucide-react";

export interface Place {
  place: string;
  lat: number;
  lon: number;
  tz: string;
}

interface Result {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

// Open-Meteo's geocoder is free, needs no key, and returns each place's time zone,
// which is what turns a local birth time into the right instant.
async function search(q: string, signal: AbortSignal): Promise<Result[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("search failed");
  const json = (await res.json()) as { results?: Result[] };
  return (json.results ?? []).filter((r) => r.timezone);
}

const describe = (r: Result) => [r.name, r.admin1, r.country].filter(Boolean).join(", ");

export function PlaceSearch({ value, onChange, id }: { value: Place | null; onChange: (p: Place) => void; id?: string }) {
  const [query, setQuery] = useState(value?.place ?? "");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const justFocused = useRef(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || q === value?.place) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      search(q, controller.signal)
        .then((r) => {
          setResults(r);
          setActive(0);
          setOpen(true);
          setError(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(true);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, value?.place]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const pick = (r: Result) => {
    const place = describe(r);
    setQuery(place);
    setOpen(false);
    onChange({ place, lat: r.latitude, lon: r.longitude, tz: r.timezone! });
  };

  return (
    <div ref={box} className="relative">
      <div className="relative">
        <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id={id}
          className="field pl-9"
          placeholder="Search a city or town"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => {
            // Select the current place so typing a new one replaces it
            e.currentTarget.select();
            justFocused.current = true;
            if (results.length) setOpen(true);
          }}
          onMouseUp={(e) => {
            // The release of the click that focused the field would put the caret down and drop the selection
            if (justFocused.current) e.preventDefault();
            justFocused.current = false;
          }}
          onKeyDown={(e) => {
            if (!open || !results.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              pick(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {loading && <LoaderCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />}
      </div>
      {error && <p className="mt-1 text-xs text-bad">Couldn&apos;t search places. Check your connection and try again.</p>}
      {open && (
        <ul id={listId} role="listbox" className="card absolute z-20 mt-2 max-h-72 w-full overflow-auto p-1">
          {results.length === 0 && <li className="px-3 py-2 text-sm text-muted">No places found</li>}
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === active}
              onPointerDown={(e) => {
                e.preventDefault();
                pick(r);
              }}
              onPointerEnter={() => setActive(i)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${i === active ? "bg-hover" : ""}`}
            >
              <span className="font-medium">{r.name}</span>
              <span className="text-muted">{[r.admin1, r.country].filter(Boolean).length ? `, ${[r.admin1, r.country].filter(Boolean).join(", ")}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
