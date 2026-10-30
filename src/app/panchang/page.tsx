import type { Metadata } from "next";
import { PanchangControls } from "@/components/panchang-controls";
import { PanchangView } from "@/components/panchang-view";
import { computePanchang } from "@/lib/astro/panchang";
import { todayIn } from "@/lib/astro/time";
import { fmtLongDate } from "@/lib/format";
import { DELHI, parseDate, parsePlace } from "@/lib/places";

export const metadata: Metadata = {
  title: "Today's panchang: tithi, nakshatra, Rahu Kalam",
  description: "Daily Hindu panchang for any city: tithi, nakshatra, yoga, karana, sunrise, moonrise, Rahu Kalam and auspicious muhurtas.",
};

export default async function PanchangPage({ searchParams }: PageProps<"/panchang">) {
  const params = await searchParams;
  const place = parsePlace(params) ?? DELHI;
  const date = parseDate(params) ?? todayIn(place.tz);
  const p = computePanchang(date, place.tz, place.lat, place.lon);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="rise">
        <p className="text-sm font-semibold uppercase tracking-wider text-gold">Dainik Panchang</p>
        <h1 className="font-display text-4xl font-bold md:text-5xl">{fmtLongDate(date)}</h1>
        <p className="mt-2 text-ink-2">{place.place} · times in {place.tz}</p>
      </div>
      <div className="mt-8 space-y-6">
        <PanchangControls key={`${date}|${place.lat}|${place.lon}`} date={date} place={place} />
        <PanchangView p={p} tz={place.tz} />
        <p className="text-xs text-muted">
          Calculated for sunrise at this place, with the Lahiri ayanamsa. The tithi, nakshatra, yoga and karana shown are the ones
          running at sunrise; each card shows when it ends.
        </p>
      </div>
    </div>
  );
}
