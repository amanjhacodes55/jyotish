// All times are shown in the time zone of the place they belong to, not the viewer's

export function fmtTime(d: Date | null | undefined, timeZone: string) {
  if (!d) return "—";
  return d.toLocaleTimeString("en-IN", { timeZone, hour: "numeric", minute: "2-digit" });
}

export function fmtDate(d: Date, timeZone: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return d.toLocaleDateString("en-IN", { timeZone, ...opts });
}

// "10:38 am" when it's the same day, "10:38 am, 12 Aug" when it's later
export function fmtUntil(d: Date, ref: Date, timeZone: string) {
  const sameDay = fmtDate(d, timeZone) === fmtDate(ref, timeZone);
  return sameDay ? fmtTime(d, timeZone) : `${fmtTime(d, timeZone)}, ${fmtDate(d, timeZone, { day: "numeric", month: "short" })}`;
}

export function fmtLongDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fmtClock(time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h, m));
  return d.toLocaleTimeString("en-IN", { timeZone: "UTC", hour: "numeric", minute: "2-digit" });
}
