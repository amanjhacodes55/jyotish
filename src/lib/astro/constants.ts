// Names and fixed tables used across the engine. Indexes are 0-based everywhere:
// sign 0 is Mesha (Aries), nakshatra 0 is Ashwini.

export type PlanetId = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

export const PLANETS: PlanetId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

export const PLANET_INFO: Record<PlanetId, { sanskrit: string; short: string; glyph: string }> = {
  Sun: { sanskrit: "Surya", short: "Su", glyph: "☉" },
  Moon: { sanskrit: "Chandra", short: "Mo", glyph: "☽" },
  Mars: { sanskrit: "Mangal", short: "Ma", glyph: "♂" },
  Mercury: { sanskrit: "Budh", short: "Me", glyph: "☿" },
  Jupiter: { sanskrit: "Guru", short: "Ju", glyph: "♃" },
  Venus: { sanskrit: "Shukra", short: "Ve", glyph: "♀" },
  Saturn: { sanskrit: "Shani", short: "Sa", glyph: "♄" },
  Rahu: { sanskrit: "Rahu", short: "Ra", glyph: "☊" },
  Ketu: { sanskrit: "Ketu", short: "Ke", glyph: "☋" },
};

export const SIGNS = [
  { name: "Aries", sanskrit: "Mesha", lord: "Mars" },
  { name: "Taurus", sanskrit: "Vrishabha", lord: "Venus" },
  { name: "Gemini", sanskrit: "Mithuna", lord: "Mercury" },
  { name: "Cancer", sanskrit: "Karka", lord: "Moon" },
  { name: "Leo", sanskrit: "Simha", lord: "Sun" },
  { name: "Virgo", sanskrit: "Kanya", lord: "Mercury" },
  { name: "Libra", sanskrit: "Tula", lord: "Venus" },
  { name: "Scorpio", sanskrit: "Vrishchika", lord: "Mars" },
  { name: "Sagittarius", sanskrit: "Dhanu", lord: "Jupiter" },
  { name: "Capricorn", sanskrit: "Makara", lord: "Saturn" },
  { name: "Aquarius", sanskrit: "Kumbha", lord: "Saturn" },
  { name: "Pisces", sanskrit: "Meena", lord: "Jupiter" },
] as const satisfies readonly { name: string; sanskrit: string; lord: PlanetId }[];

// Vimshottari order. Nakshatra n is ruled by DASHA_ORDER[n % 9].
export const DASHA_ORDER: PlanetId[] = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
export const DASHA_YEARS: Record<PlanetId, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

export type Gana = "Deva" | "Manushya" | "Rakshasa";

export const NAKSHATRAS: { name: string; deity: string; gana: Gana; yoni: string }[] = [
  { name: "Ashwini", deity: "Ashwini Kumaras", gana: "Deva", yoni: "Horse" },
  { name: "Bharani", deity: "Yama", gana: "Manushya", yoni: "Elephant" },
  { name: "Krittika", deity: "Agni", gana: "Rakshasa", yoni: "Sheep" },
  { name: "Rohini", deity: "Brahma", gana: "Manushya", yoni: "Serpent" },
  { name: "Mrigashira", deity: "Soma", gana: "Deva", yoni: "Serpent" },
  { name: "Ardra", deity: "Rudra", gana: "Manushya", yoni: "Dog" },
  { name: "Punarvasu", deity: "Aditi", gana: "Deva", yoni: "Cat" },
  { name: "Pushya", deity: "Brihaspati", gana: "Deva", yoni: "Sheep" },
  { name: "Ashlesha", deity: "Nagas", gana: "Rakshasa", yoni: "Cat" },
  { name: "Magha", deity: "Pitrs", gana: "Rakshasa", yoni: "Rat" },
  { name: "Purva Phalguni", deity: "Bhaga", gana: "Manushya", yoni: "Rat" },
  { name: "Uttara Phalguni", deity: "Aryaman", gana: "Manushya", yoni: "Cow" },
  { name: "Hasta", deity: "Savitr", gana: "Deva", yoni: "Buffalo" },
  { name: "Chitra", deity: "Vishvakarma", gana: "Rakshasa", yoni: "Tiger" },
  { name: "Swati", deity: "Vayu", gana: "Deva", yoni: "Buffalo" },
  { name: "Vishakha", deity: "Indra-Agni", gana: "Rakshasa", yoni: "Tiger" },
  { name: "Anuradha", deity: "Mitra", gana: "Deva", yoni: "Deer" },
  { name: "Jyeshtha", deity: "Indra", gana: "Rakshasa", yoni: "Deer" },
  { name: "Mula", deity: "Nirriti", gana: "Rakshasa", yoni: "Dog" },
  { name: "Purva Ashadha", deity: "Apas", gana: "Manushya", yoni: "Monkey" },
  { name: "Uttara Ashadha", deity: "Vishvedevas", gana: "Manushya", yoni: "Mongoose" },
  { name: "Shravana", deity: "Vishnu", gana: "Deva", yoni: "Monkey" },
  { name: "Dhanishta", deity: "Vasus", gana: "Rakshasa", yoni: "Lion" },
  { name: "Shatabhisha", deity: "Varuna", gana: "Rakshasa", yoni: "Horse" },
  { name: "Purva Bhadrapada", deity: "Aja Ekapada", gana: "Manushya", yoni: "Lion" },
  { name: "Uttara Bhadrapada", deity: "Ahirbudhnya", gana: "Manushya", yoni: "Cow" },
  { name: "Revati", deity: "Pushan", gana: "Deva", yoni: "Elephant" },
];

export const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
];

export const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];

export const WEEKDAYS = [
  { name: "Sunday", sanskrit: "Ravivara", lord: "Sun" },
  { name: "Monday", sanskrit: "Somavara", lord: "Moon" },
  { name: "Tuesday", sanskrit: "Mangalavara", lord: "Mars" },
  { name: "Wednesday", sanskrit: "Budhavara", lord: "Mercury" },
  { name: "Thursday", sanskrit: "Guruvara", lord: "Jupiter" },
  { name: "Friday", sanskrit: "Shukravara", lord: "Venus" },
  { name: "Saturday", sanskrit: "Shanivara", lord: "Saturn" },
] as const;

// Exaltation sign and own signs, for the dignity column
export const DIGNITY: Partial<Record<PlanetId, { exalted: number; debilitated: number; own: number[] }>> = {
  Sun: { exalted: 0, debilitated: 6, own: [4] },
  Moon: { exalted: 1, debilitated: 7, own: [3] },
  Mars: { exalted: 9, debilitated: 3, own: [0, 7] },
  Mercury: { exalted: 5, debilitated: 11, own: [2, 5] },
  Jupiter: { exalted: 3, debilitated: 9, own: [8, 11] },
  Venus: { exalted: 11, debilitated: 5, own: [1, 6] },
  Saturn: { exalted: 6, debilitated: 0, own: [9, 10] },
};

export const NAKSHATRA_SPAN = 360 / 27; // 13°20'
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3°20'
