// Records the Jyotish walkthrough in the running site: the home page, making a kundli from scratch,
// the charts, planets, readings and dasha, today's panchang for two cities, a kundli match and the
// light theme. Narrated by Kokoro, with small one-line captions.
//
//   1. npm run build && npx next start -p 3022
//   2. node docs/video/demo.mjs   (TTS_PYTHON / VOICE optional, see tts.py; LIVE_URL for the outro)
//
// Output: docs/media/jyotish-demo.mp4 (captions burned in); the .srt goes to build/.
import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, launch, newContext, pointer, sleep, startRecording } from "./rec.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(HERE, "build");
const MEDIA = path.join(HERE, "../media");
const LEAD = 0.35; // beat starts, then the voice comes in
const TAIL = 0.6; // breathing room after a line before the next beat
const PYTHON = process.env.TTS_PYTHON || path.join(process.env.HOME, ".local/share/kokoro-tts/venv/bin/python");
const VOICE = process.env.VOICE || "af_heart";
const LIVE = process.env.LIVE_URL || "Free to use, no sign-up";
fs.mkdirSync(path.join(BUILD, "voice"), { recursive: true });

function voice(text, caption = text) {
  const key = crypto.createHash("sha1").update(`${VOICE}\n${text}`).digest("hex").slice(0, 12);
  const file = path.join(BUILD, "voice", key + ".wav");
  if (!fs.existsSync(file)) execFileSync(PYTHON, [path.join(HERE, "tts.py"), file], { input: text, env: { ...process.env, VOICE }, stdio: ["pipe", "ignore", "inherit"] });
  return { file, seconds: probe(file), cues: cues(caption, file) };
}
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

// ---------------------------------------------------------------------------------------------
// Captions: one short line at a time, each break snapped to the pause the voice takes there.

const MAX_CHARS = 44;

function phrases(text) {
  const parts = text.match(/[^,.:;!?]+[,.:;!?]*\s*/g).map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    const last = out.at(-1);
    if (last && !/[.:;!?]$/.test(last) && last.length + 1 + p.length <= MAX_CHARS) out[out.length - 1] = `${last} ${p}`;
    else if (p.length <= MAX_CHARS) out.push(p);
    else out.push(...split(p));
  }
  return out;
}

const JOIN = new Set(["and", "or", "but", "so", "with", "to", "that", "for", "in", "on", "all", "then"]);
const STICKY = new Set(["a", "an", "the", "to", "of", "your", "its", "their"]);
function split(p) {
  if (p.length <= MAX_CHARS) return [p];
  const w = p.split(" ");
  let best = 1, score = Infinity;
  for (let i = 1; i < w.length; i++) {
    const left = w.slice(0, i).join(" "), right = w.slice(i).join(" ");
    let sc = Math.abs(left.length - right.length) + 20 * (Math.max(left.length, right.length) > MAX_CHARS);
    if (JOIN.has(w[i].toLowerCase())) sc -= 12;
    if (STICKY.has(w[i - 1].toLowerCase())) sc += 40;
    if (sc < score) { score = sc; best = i; }
  }
  return [...split(w.slice(0, best).join(" ")), ...split(w.slice(best).join(" "))];
}

function pauses(file) {
  const log = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "silencedetect=n=-38dB:d=0.12", "-f", "null", "-"]).stderr.toString();
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  return starts.map((s, i) => ({ s, e: ends[i] ?? s })).filter((p) => p.e > p.s);
}

function cues(text, file) {
  const lines = phrases(text);
  const total = probe(file);
  const gaps = pauses(file);
  const chars = lines.reduce((n, l) => n + l.length, 0);
  let acc = 0, start = 0;
  return lines.map((line, i) => {
    acc += line.length;
    let end = i === lines.length - 1 ? total : (acc / chars) * total;
    if (i < lines.length - 1) {
      const near = gaps.filter((g) => Math.abs((g.s + g.e) / 2 - end) < 0.7).sort((a, b) => Math.abs((a.s + a.e) / 2 - end) - Math.abs((b.s + b.e) / 2 - end))[0];
      if (near) end = near.s + 0.05;
    }
    const cue = { line, start, end };
    start = end;
    return cue;
  });
}

// ---------------------------------------------------------------------------------------------
// One visitor, filmed in the dark theme, plus the end card.

const browser = await launch();
const ctx = await newContext(browser, { colorScheme: "dark" });
await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
const page = await ctx.newPage();
const P = pointer(page);

const card = await (await newContext(browser)).newPage();
const icon = `data:image/svg+xml;base64,${fs.readFileSync(path.join(HERE, "../../src/app/icon.svg")).toString("base64")}`;
await card.setContent(fs.readFileSync(path.join(HERE, "outro.html"), "utf8").replace("{{LIVE}}", LIVE).replace("{{ICON}}", icon), { waitUntil: "networkidle" });

const MATCH =
  "/matching?bname=Rahul&bdate=1993-04-12&btime=07:45&bplace=Patna%2C+Bihar%2C+India&blat=25.5941&blon=85.1376&btz=Asia%2FKolkata" +
  "&gname=Ananya&gdate=1995-02-21&gtime=18:20&gplace=Jaipur%2C+Rajasthan%2C+India&glat=26.9124&glon=75.7873&gtz=Asia%2FKolkata";

const scrollTo = async (locator, offset = 90, ms = 1200) => {
  const y = await page.locator(locator).first().evaluate((el) => el.getBoundingClientRect().top);
  await P.scroll(y - offset, ms);
};

async function pickPlace(id, query, choose) {
  await P.click(page.locator(id));
  await sleep(150);
  await P.type(query, { cps: 9 });
  const option = page.getByRole("option").filter({ hasText: choose }).first();
  await option.waitFor({ timeout: 10000 }).catch(async (e) => {
    await page.screenshot({ path: path.join(BUILD, "pick-failed.png") });
    console.error("place field:", JSON.stringify(await page.inputValue(id)), "options:", await page.getByRole("option").allTextContents());
    throw e;
  });
  await sleep(450);
  await P.click(option);
}

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await sleep(800);

// Kokoro reads "Jyotish" more naturally spelled the way it sounds; captions keep the real spelling.
const beats = [
  { page, text: "This is Jyotish: free, open-source Vedic astrology. Your kundli, today's panchang, and kundli matching, with no sign-up.",
    say: "This is Jyo-tish: free, open-source Vedic astrology. Your kundli, today's panchaang, and kundli matching, with no sign-up.", run: async () => {
    await P.hover(page.locator("h1"), { dx: 0.4, dy: 0.5, ms: 1400 });
    await sleep(900);
    await P.hover(page.locator("svg.h-full").first(), { dx: 0.5, dy: 0.5, ms: 1300 });
    await sleep(1200);
    await P.scroll(260, 1600);
  } },
  { page, text: "Every position is calculated by its own astronomical engine, so there are no limits and nothing about you is stored.", run: async () => {
    await P.hover(page.getByText("Today in New Delhi"), { ms: 1100 });
    await sleep(1500);
    await scrollTo("text=Real astronomy, not a lookup table", 260, 1600);
    await P.hover(page.getByText("Real astronomy, not a lookup table"), { ms: 1000 });
  } },
  { page, text: "Making a kundli takes a name, the date and time of birth, and the place. The time zone comes with the place, even for old dates.",
    say: "Making a kundli takes a name, the date and time of birth, and the place. The time zone comes with the place, even for old dates.", run: async () => {
    await P.scroll(-3000, 900);
    await P.click(page.getByRole("link", { name: "Make my kundli" }));
    await page.waitForURL("**/kundli");
    await sleep(500);
    await P.click(page.locator("#k-name"));
    await P.type("Meera");
    // The month part sits at the left of a date field; clicking the middle would land on the year
    await P.click(page.locator("#k-date"), { dx: 0.1 });
    await page.keyboard.type("09241998", { delay: 110 });
    await P.click(page.locator("#k-time"), { dx: 0.15 });
    await page.keyboard.type("0615AM", { delay: 120 });
    await pickPlace("#k-place", "Varanasi", "Uttar Pradesh");
    await sleep(500);
  } },
  { page, text: "In a moment you have the essentials: the ascendant, Moon sign, birth star, and the dasha running now.", run: async () => {
    await P.click(page.getByRole("button", { name: /Make my kundli/ }));
    await page.waitForURL("**/kundli?**");
    await page.getByText("Janma Kundli").waitFor();
    await sleep(900);
    for (const label of ["Ascendant (Lagna)", "Moon sign (Rashi)", "Birth star (Nakshatra)", "Running dasha"]) {
      await P.hover(page.getByText(label), { ms: 700 });
      await sleep(550);
    }
  } },
  { page, text: "The Rashi and Navamsa charts come in North Indian or South Indian style, whichever you grew up with.",
    say: "The Raashi and Navaamsha charts come in North Indian or South Indian style, whichever you grew up with.", run: async () => {
    await scrollTo("text=Birth charts", 80, 1300);
    await sleep(1200);
    await P.click(page.getByRole("button", { name: "South Indian" }));
    await sleep(2000);
    await P.click(page.getByRole("button", { name: "North Indian" }));
    await sleep(600);
  } },
  { page, text: "Every planet's sign, degree, nakshatra and pada, its house and Navamsa, and whether it's retrograde, exalted or in its own sign.",
    say: "Every planet's sign, degree, nakshatra and paada, its house and Navaamsha, and whether it's retrograde, exalted or in its own sign.", run: async () => {
    await scrollTo("text=Planetary positions", 80, 1300);
    await P.hover(page.locator("tbody tr").nth(1), { dx: 0.2, ms: 900 });
    for (let i = 2; i <= 6; i++) {
      await P.hover(page.locator("tbody tr").nth(i), { dx: 0.2 + i * 0.08, ms: 450 });
      await sleep(250);
    }
  } },
  { page, text: "Then a short reading of your ascendant, Moon sign and nakshatra, and a Manglik check from both the ascendant and the Moon.", run: async () => {
    await scrollTo("text=What your chart says", 80, 1300);
    await sleep(600);
    for (const n of [0, 1, 2]) {
      await P.hover(page.locator("section:has-text('What your chart says') .card").nth(n), { ms: 800 });
      await sleep(900);
    }
    await P.hover(page.getByText("Manglik dosha"), { ms: 800 });
  } },
  { page, text: "And a hundred and twenty years of Vimshottari dasha, with every antardasha and today's period highlighted.",
    say: "And a hundred and twenty years of Vimshottari dasha, with every antar-dasha and today's period highlighted.", run: async () => {
    await scrollTo("text=Vimshottari dasha", 80, 1300);
    await sleep(800);
    const next = page.locator("details:not([open]) summary").nth(2);
    await P.click(next);
    await sleep(1600);
    await P.scroll(300, 1000);
  } },
  { page, text: "The whole chart lives in its link, so you can copy it to share or bookmark, and it opens exactly the same.", run: async () => {
    await P.scroll(-6000, 1100);
    await sleep(300);
    await P.click(page.getByRole("button", { name: "Share" }));
    await sleep(2200);
  } },
  { page, text: "The panchang shows the day's tithi, nakshatra, yoga and karana, each with the exact time it ends.",
    say: "The panchaang shows the day's tithi, nakshatra, yoga and karana, each with the exact time it ends.", run: async () => {
    await P.click(page.getByRole("link", { name: "Panchang" }).first());
    await page.waitForURL("**/panchang");
    await page.getByText("Dainik Panchang").waitFor();
    await sleep(700);
    await P.hover(page.locator("svg[aria-label^='Moon']").first(), { ms: 900 });
    await sleep(600);
    await scrollTo("text=Tithi", 300, 1000);
    for (const t of ["Tithi", "Nakshatra", "Yoga", "Karana"]) {
      await P.hover(page.getByText(t, { exact: true }).first(), { ms: 600 });
      await sleep(500);
    }
  } },
  { page, text: "Pick any city or date. Sunrise, moonrise, Rahu Kalam and the good times of the day update for that place.", run: async () => {
    await P.scroll(-2000, 800);
    await pickPlace("#p-place", "Chennai", "Tamil Nadu");
    await page.waitForURL("**/panchang?**");
    await page.getByText("Chennai").first().waitFor();
    await sleep(900);
    await P.click(page.getByRole("button", { name: "Next day" }));
    await sleep(1500);
    await P.hover(page.getByText("Rahu Kalam"), { ms: 900 });
    await sleep(600);
  } },
  { page, text: "Kundli matching runs the eight-fold Guna Milan: a score out of thirty-six, every koota explained, and any Nadi or Bhakoot dosha.",
    say: "Kundli matching runs the eight-fold Guna Milan: a score out of thirty-six, every koota explained, and any Naadi or Bhakoot dosha.", run: async () => {
    await page.goto(BASE + MATCH, { waitUntil: "networkidle" });
    await sleep(900);
    await P.hover(page.locator("svg[aria-label$='gunas']"), { ms: 900 });
    await sleep(900);
    await scrollTo("text=Koota", 120, 1300);
    for (let i = 0; i < 8; i += 2) {
      await P.hover(page.locator("tbody tr").nth(i), { dx: 0.85, ms: 450 });
      await sleep(300);
    }
  } },
  { page, text: "There's a light theme too, for reading in daylight.", run: async () => {
    await P.scroll(-6000, 900);
    await P.click(page.getByRole("button", { name: /Switch to light theme/ }));
    await sleep(1400);
    await P.scroll(500, 1400);
  } },
  { page: card, text: "Jyotish is free and open source, and checked against a professional astrology API in its tests. If it helps you, a coffee keeps it going.",
    say: "Jyo-tish is free and open source, and checked against a professional astrology API in its tests. If it helps you, a coffee keeps it going.", run: async () => {
    await card.evaluate(() => document.body.classList.add("in"));
  } },
];

// ---------------------------------------------------------------------------------------------
// Record every beat, then lay the voice and captions over the joined clips.

const only = process.env.ONLY ? Number(process.env.ONLY) : null;
const clips = [];
for (const [i, b] of beats.entries()) {
  if (only !== null && i > only) break;
  const vo = voice(b.say ?? b.text, b.text);
  const want = LEAD + vo.seconds + TAIL;
  await b.page.bringToFront();
  const rec = await startRecording(b.page);
  const started = Date.now();
  await b.run();
  const left = want - (Date.now() - started) / 1000;
  if (left > 0) await sleep(left * 1000);
  const out = path.join(BUILD, `beat${String(i).padStart(2, "0")}.mp4`);
  await rec.stop(out);
  clips.push({ out, vo, text: b.text, seconds: probe(out) });
  console.log(`beat ${i}: ${clips.at(-1).seconds.toFixed(1)}s (voice ${vo.seconds.toFixed(1)}s)`);
}
await browser.close();

const list = path.join(BUILD, "clips.txt");
fs.writeFileSync(list, clips.map((c) => `file '${c.out}'`).join("\n"));
const total = clips.reduce((s, c) => s + c.seconds, 0);
const args = ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list];
const graph = [];
let t = 0, srt = "", n = 0;
const ass = [
  "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1920", "PlayResY: 1080", "WrapStyle: 2", "",
  "[V4+ Styles]",
  "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
  "Style: Cap,Noto Sans,34,&H00FFFFFF,&H00FFFFFF,&H5A16131F,&H00000000,0,0,0,0,100,100,0.3,0,3,9,0,2,40,40,46,1",
  "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
];
const stamp = (s) => new Date(s * 1000).toISOString().slice(11, 23).replace(".", ",");
const assStamp = (s) => { const d = new Date(s * 1000).toISOString(); return `${Number(d.slice(11, 13))}${d.slice(13, 22)}`; };
clips.forEach((c, i) => {
  args.push("-i", c.vo.file);
  graph.push(`[${i + 1}:a]aresample=48000,adelay=${Math.round((t + LEAD) * 1000)}:all=1[a${i}]`);
  for (const q of c.vo.cues) {
    const a = t + LEAD + q.start, b = t + LEAD + q.end + (q === c.vo.cues.at(-1) ? 0.25 : -0.02);
    srt += `${++n}\n${stamp(a)} --> ${stamp(b)}\n${q.line}\n\n`;
    ass.push(`Dialogue: 0,${assStamp(a)},${assStamp(b)},Cap,,0,0,0,,{\\fad(120,120)}${q.line}`);
  }
  t += c.seconds;
});
const assFile = path.join(BUILD, "captions.ass");
fs.writeFileSync(assFile, ass.join("\n") + "\n");

graph.push(`${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0,`
  + `highpass=f=70,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=6500:t=q:w=1.5:g=-2,`
  + `acompressor=threshold=-20dB:ratio=2.5:attack=8:release=180,aformat=channel_layouts=stereo,`
  + `loudnorm=I=-16:TP=-1.5,aresample=48000,apad,atrim=0:${total.toFixed(3)}[a]`);
graph.push(`[0:v]ass='${assFile.replace(/'/g, "\\'")}',fade=t=in:d=0.5,fade=t=out:st=${(total - 0.9).toFixed(3)}:d=0.9[v]`);
const out = path.join(only !== null ? BUILD : MEDIA, "jyotish-demo.mp4");
execFileSync("ffmpeg", [...args, "-filter_complex", graph.join(";"), "-map", "[v]", "-map", "[a]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
fs.writeFileSync(path.join(BUILD, "jyotish-demo.srt"), srt);
console.log(`done: ${out} (${total.toFixed(1)}s)`);
