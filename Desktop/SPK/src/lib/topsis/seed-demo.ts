import { calculateTopsis, roundTopsisResult } from "./engine";
import { TopsisAlternative, TopsisCriterion } from "./types";

export const demoCriteria: TopsisCriterion[] = [
  {
    id: "carbohydrate",
    code: "CARBOHYDRATE",
    name: "Karbohidrat",
    weight: 2,
    attribute: "BENEFIT",
  },
  {
    id: "protein",
    code: "PROTEIN",
    name: "Protein",
    weight: 4,
    attribute: "BENEFIT",
  },
  {
    id: "fat",
    code: "FAT",
    name: "Lemak",
    weight: 3,
    attribute: "BENEFIT",
  },
  {
    id: "processing",
    code: "PROCESSING",
    name: "Pengolahan",
    weight: 5,
    attribute: "BENEFIT",
  },
  {
    id: "salt",
    code: "SALT",
    name: "Garam",
    weight: 4,
    attribute: "BENEFIT",
  },
];

export const demoAlternatives: TopsisAlternative[] = [
  {
    id: "kentang-kukus",
    name: "Kentang Kukus",
    scores: {
      carbohydrate: 4,
      protein: 3,
      fat: 4,
      processing: 5,
      salt: 5,
    },
  },
  {
    id: "bubur-kacang-hijau",
    name: "Bubur Kacang Hijau",
    scores: {
      carbohydrate: 3,
      protein: 4,
      fat: 3,
      processing: 4,
      salt: 4,
    },
  },
  {
    id: "kacang-merah",
    name: "Kacang Merah",
    scores: {
      carbohydrate: 3,
      protein: 4,
      fat: 3,
      processing: 4,
      salt: 3,
    },
  },
];

export const journalReferencePreferences = [
  {
    alternativeName: "Kentang Kukus",
    preference: 0.6654,
  },
  {
    alternativeName: "Bubur Kacang Hijau",
    preference: 0.6373,
  },
  {
    alternativeName: "Kacang Merah",
    preference: 0.6013,
  },
];

export function calculateDemoTopsis() {
  return calculateTopsis({
    criteria: demoCriteria,
    alternatives: demoAlternatives,
  });
}

export function calculateRoundedDemoTopsis(fractionDigits = 4) {
  return roundTopsisResult(calculateDemoTopsis(), fractionDigits);
}
