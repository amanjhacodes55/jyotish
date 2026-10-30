import type { PlanetId } from "./constants";

// Short readings shown next to the chart. Classical keywords, written plainly.

export const SIGN_TRAITS: { element: string; quality: string; text: string }[] = [
  { element: "Fire", quality: "Movable", text: "Direct, brave and quick to start. You lead from the front and learn by doing, though patience has to be practised." },
  { element: "Earth", quality: "Fixed", text: "Steady, sensual and loyal. You build slowly and keep what you build, and you value comfort, beauty and good food." },
  { element: "Air", quality: "Dual", text: "Curious, witty and restless. You think in conversations, juggle many interests and need variety to stay happy." },
  { element: "Water", quality: "Movable", text: "Caring, intuitive and protective. Home and family matter deeply, and your moods move like the tides." },
  { element: "Fire", quality: "Fixed", text: "Warm, proud and generous. You like to shine and to be relied on, and you carry yourself with natural dignity." },
  { element: "Earth", quality: "Dual", text: "Careful, practical and helpful. You notice details others miss and feel best when things are useful and in order." },
  { element: "Air", quality: "Movable", text: "Graceful, fair and sociable. You seek balance and partnership and have a gift for diplomacy and taste." },
  { element: "Water", quality: "Fixed", text: "Intense, private and determined. You feel deeply, see through pretence and do not give up easily." },
  { element: "Fire", quality: "Dual", text: "Optimistic, honest and free-spirited. Learning, travel and big ideas call to you, along with a strong sense of right." },
  { element: "Earth", quality: "Movable", text: "Ambitious, disciplined and patient. You take responsibility early and climb steadily toward long-term goals." },
  { element: "Air", quality: "Fixed", text: "Original, humane and independent. You think about the group and the future, and you do things your own way." },
  { element: "Water", quality: "Dual", text: "Gentle, imaginative and compassionate. You sense what others feel, and art, faith and dreams come naturally." },
];

export const NAKSHATRA_TRAITS: { symbol: string; text: string }[] = [
  { symbol: "Horse's head", text: "Swift, healing energy. Quick to act and quick to help." },
  { symbol: "Yoni", text: "Bearing and restraint. Carries heavy responsibilities and transforms through them." },
  { symbol: "Razor or flame", text: "Sharp and purifying. Cuts through confusion; can be blunt." },
  { symbol: "Chariot", text: "Growth, charm and creativity. Loves beauty and fertile, settled things." },
  { symbol: "Deer's head", text: "Searching and gentle. A seeker who is always curious about the next thing." },
  { symbol: "Teardrop", text: "Storm and renewal. Strong feelings that clear the air and lead to insight." },
  { symbol: "Quiver of arrows", text: "Return and restoration. Bounces back and finds the way home." },
  { symbol: "Cow's udder", text: "Nourishing and dependable. One of the most auspicious stars; a natural carer." },
  { symbol: "Coiled serpent", text: "Penetrating and perceptive. Understands hidden motives; protective of its own." },
  { symbol: "Throne", text: "Lineage and dignity. Honours tradition and draws natural authority." },
  { symbol: "Front legs of a bed", text: "Pleasure and rest. Warm, sociable and fond of enjoyment." },
  { symbol: "Back legs of a bed", text: "Patronage and friendship. Generous, reliable and good in partnerships." },
  { symbol: "Hand", text: "Skill and craft. Clever with the hands, practical and resourceful." },
  { symbol: "Bright jewel", text: "Design and brilliance. An eye for form, beauty and making things." },
  { symbol: "Young shoot in the wind", text: "Independence and flexibility. Bends without breaking; good in trade." },
  { symbol: "Triumphal arch", text: "Purpose and determination. Sets a goal and works until it is reached." },
  { symbol: "Lotus", text: "Devotion and friendship. Thrives through cooperation, even in hard places." },
  { symbol: "Earring", text: "Seniority and protection. Capable, resourceful and responsible for others." },
  { symbol: "Bunch of roots", text: "Getting to the root. Deep inquiry that undoes the old to start afresh." },
  { symbol: "Winnowing fan", text: "Invincibility and conviction. Persuasive, proud and hard to defeat." },
  { symbol: "Elephant's tusk", text: "Lasting victory. Principled and patient; wins in the end." },
  { symbol: "Ear", text: "Listening and learning. Gains wisdom by hearing well; a good teacher." },
  { symbol: "Drum", text: "Rhythm and wealth. Musical, generous and celebrated in groups." },
  { symbol: "Empty circle", text: "Healing and secrecy. A hundred physicians: independent, scientific, private." },
  { symbol: "Front of a funeral cot", text: "Fire and intensity. Idealistic, transformative and sometimes extreme." },
  { symbol: "Back of a funeral cot", text: "Depth and calm. Wise, controlled and quietly strong." },
  { symbol: "Fish or drum", text: "Safe journeys. Kind, nurturing and protective, the last and gentlest star." },
];

export const DASHA_THEMES: Record<PlanetId, string> = {
  Sun: "Authority, father, government and self-confidence come forward.",
  Moon: "Mind, mother, home and emotional life take centre stage.",
  Mars: "Energy, courage, property, siblings and competition are emphasised.",
  Mercury: "Learning, communication, trade and quick thinking flourish.",
  Jupiter: "Wisdom, teachers, children, wealth and faith grow.",
  Venus: "Love, marriage, comfort, art and luxury are highlighted.",
  Saturn: "Hard work, discipline, delays and lasting results through effort.",
  Rahu: "Ambition, foreign links, unconventional paths and sudden change.",
  Ketu: "Detachment, spirituality, research and letting go of the old.",
};
