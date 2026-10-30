import { NAKSHATRAS, SIGNS, type Gana, type PlanetId } from "./constants";
import { houseFrom, type Kundli } from "./kundli";

// Ashtakoota (Guna Milan): eight tests on the two Moons, 36 points in all.
// "Boy" and "girl" follow the tradition the tables are written in.

const VARNAS = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"];
// Varna by sign, 0 = Brahmin (highest)
const SIGN_VARNA = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];

const VASHYAS = ["Chatushpada", "Manava", "Jalachara", "Vanachara", "Keeta"] as const;
type Vashya = (typeof VASHYAS)[number];

function vashya(sign: number, degree: number): Vashya {
  switch (sign) {
    case 0: case 1: return "Chatushpada";
    case 2: case 5: case 6: case 10: return "Manava";
    case 3: case 11: return "Jalachara";
    case 4: return "Vanachara";
    case 7: return "Keeta";
    case 8: return degree < 15 ? "Manava" : "Chatushpada";
    default: return degree < 15 ? "Chatushpada" : "Jalachara"; // Capricorn
  }
}

// Rows: boy, columns: girl, in VASHYAS order
const VASHYA_POINTS = [
  [2, 1, 1, 0.5, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0, 0, 0, 2, 0],
  [1, 1, 1, 0, 2],
];

const YONIS = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"];
// 4 same animal, 3 friendly, 2 neutral, 1 unfriendly, 0 sworn enemies
const YONI_POINTS = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

// Natural friendship between the seven sign lords
const FRIENDS: Partial<Record<PlanetId, { friends: PlanetId[]; enemies: PlanetId[] }>> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
  Moon: { friends: ["Sun", "Mercury"], enemies: [] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] },
};

type Relation = "friend" | "neutral" | "enemy";
function relation(a: PlanetId, b: PlanetId): Relation {
  const f = FRIENDS[a]!;
  if (f.friends.includes(b)) return "friend";
  if (f.enemies.includes(b)) return "enemy";
  return "neutral";
}

function maitriPoints(a: PlanetId, b: PlanetId): number {
  if (a === b) return 5;
  const pair = [relation(a, b), relation(b, a)].sort().join("+");
  return { "friend+friend": 5, "friend+neutral": 4, "neutral+neutral": 3, "enemy+friend": 1, "enemy+neutral": 0.5, "enemy+enemy": 0 }[pair]!;
}

const GANAS: Gana[] = ["Deva", "Manushya", "Rakshasa"];
// Rows: boy, columns: girl
const GANA_POINTS = [
  [6, 6, 1],
  [5, 6, 0],
  [1, 0, 6],
];

const NADIS = ["Adi", "Madhya", "Antya"];
// Nadi runs 0,1,2,2,1,0,0,1,2,... through the nakshatras
const nadi = (nakshatra: number) => [0, 1, 2, 2, 1, 0][nakshatra % 6];

export interface Koota {
  name: string;
  about: string;
  max: number;
  score: number;
  boy: string;
  girl: string;
}

export interface Match {
  kootas: Koota[];
  total: number;
  verdict: string;
  boyManglik: boolean;
  girlManglik: boolean;
}

const moonOf = (k: Kundli) => k.planets.find((p) => p.id === "Moon")!;
const isManglik = (k: Kundli) => k.manglik.fromLagna || k.manglik.fromMoon;

export function matchKundlis(boy: Kundli, girl: Kundli): Match {
  const b = moonOf(boy);
  const g = moonOf(girl);

  const bVarna = SIGN_VARNA[b.sign], gVarna = SIGN_VARNA[g.sign];
  const bVashya = vashya(b.sign, b.degree), gVashya = vashya(g.sign, g.degree);

  const taraGood = (from: number, to: number) => ![3, 5, 7].includes((((to - from + 27) % 27) + 1) % 9);
  const tara = (taraGood(g.nakshatra, b.nakshatra) ? 1.5 : 0) + (taraGood(b.nakshatra, g.nakshatra) ? 1.5 : 0);

  const bYoni = YONIS.indexOf(NAKSHATRAS[b.nakshatra].yoni), gYoni = YONIS.indexOf(NAKSHATRAS[g.nakshatra].yoni);
  const bLord = SIGNS[b.sign].lord as PlanetId, gLord = SIGNS[g.sign].lord as PlanetId;
  const bGana = GANAS.indexOf(NAKSHATRAS[b.nakshatra].gana), gGana = GANAS.indexOf(NAKSHATRAS[g.nakshatra].gana);

  const distance = houseFrom(g.sign, b.sign);
  const bhakootBad = [2, 12, 5, 9, 6, 8].includes(distance);

  const kootas: Koota[] = [
    {
      name: "Varna", max: 1, about: "Spiritual temperament and ego",
      score: bVarna <= gVarna ? 1 : 0, boy: VARNAS[bVarna], girl: VARNAS[gVarna],
    },
    {
      name: "Vashya", max: 2, about: "Mutual attraction and influence",
      score: VASHYA_POINTS[VASHYAS.indexOf(bVashya)][VASHYAS.indexOf(gVashya)], boy: bVashya, girl: gVashya,
    },
    {
      name: "Tara", max: 3, about: "Health and well-being through the birth stars",
      score: tara, boy: NAKSHATRAS[b.nakshatra].name, girl: NAKSHATRAS[g.nakshatra].name,
    },
    {
      name: "Yoni", max: 4, about: "Physical and intimate compatibility",
      score: YONI_POINTS[bYoni][gYoni], boy: YONIS[bYoni], girl: YONIS[gYoni],
    },
    {
      name: "Graha Maitri", max: 5, about: "Friendship between the Moon sign lords",
      score: maitriPoints(bLord, gLord), boy: bLord, girl: gLord,
    },
    {
      name: "Gana", max: 6, about: "Nature: divine, human or demonic",
      score: GANA_POINTS[bGana][gGana], boy: GANAS[bGana], girl: GANAS[gGana],
    },
    {
      name: "Bhakoot", max: 7, about: "Family welfare and prosperity",
      score: bhakootBad ? 0 : 7, boy: SIGNS[b.sign].name, girl: SIGNS[g.sign].name,
    },
    {
      name: "Nadi", max: 8, about: "Health of the couple and children",
      score: nadi(b.nakshatra) === nadi(g.nakshatra) ? 0 : 8, boy: NADIS[nadi(b.nakshatra)], girl: NADIS[nadi(g.nakshatra)],
    },
  ];

  const total = kootas.reduce((s, k) => s + k.score, 0);
  const verdict =
    total >= 28 ? "Excellent match" :
    total >= 24 ? "Very good match" :
    total >= 18 ? "Acceptable match" :
    "Not recommended";

  return { kootas, total, verdict, boyManglik: isManglik(boy), girlManglik: isManglik(girl) };
}
