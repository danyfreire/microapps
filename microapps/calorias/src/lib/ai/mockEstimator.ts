import type { NutritionEstimate } from "@/domain/schemas";
import { PhotoUnavailableError } from "./errors";
import type { NutritionEstimator } from "./provider";

/**
 * Estimador de desarrollo/mock.
 *
 * NO es un motor nutricional real: usa una tabla pequeña y curativa de platos
 * comunes (con foco ecuatoriano/latinoamericano) y heurísticas de texto para
 * producir una estimación aproximada que permita probar el flujo completo del
 * MVP sin API key. Siempre se identifica como `provider: "mock"` en la API.
 */

interface FoodEntry {
  id: string;
  /** Palabras clave en minúsculas y SIN acentos (se comparan contra texto normalizado). */
  keywords: string[];
  portionLabel: string;
  kcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  /** Permite multiplicar por una cantidad explícita (ej. "3 patacones"). */
  countable?: boolean;
}

const FOODS: FoodEntry[] = [
  { id: "arroz", keywords: ["arroz"], portionLabel: "1 taza de arroz cocido", kcal: 205, proteinGrams: 4, carbsGrams: 45, fatGrams: 0.4 },
  { id: "arroz_con_pollo", keywords: ["arroz con pollo"], portionLabel: "1 plato de arroz con pollo", kcal: 550, proteinGrams: 30, carbsGrams: 60, fatGrams: 18 },
  { id: "menestra", keywords: ["menestra", "lenteja", "lentejas", "frijol", "frijoles", "frejol", "frejoles", "poroto", "porotos", "garbanzo", "garbanzos"], portionLabel: "3/4 taza de menestra", kcal: 180, proteinGrams: 10, carbsGrams: 32, fatGrams: 1 },
  { id: "carne", keywords: ["carne", "res", "bistec", "churrasco"], portionLabel: "150 g de carne", kcal: 320, proteinGrams: 39, carbsGrams: 0, fatGrams: 18 },
  { id: "pollo", keywords: ["pollo"], portionLabel: "150 g de pollo", kcal: 250, proteinGrams: 31, carbsGrams: 0, fatGrams: 14 },
  { id: "pescado", keywords: ["pescado", "tilapia", "corvina", "atun"], portionLabel: "150 g de pescado", kcal: 200, proteinGrams: 30, carbsGrams: 0, fatGrams: 8 },
  { id: "camaron", keywords: ["camaron", "camarones"], portionLabel: "100 g de camarón", kcal: 100, proteinGrams: 21, carbsGrams: 1, fatGrams: 1 },
  { id: "patacon", keywords: ["patacon", "patacones"], portionLabel: "1 patacón", kcal: 170, proteinGrams: 1, carbsGrams: 26, fatGrams: 8, countable: true },
  { id: "bolon", keywords: ["bolon", "bolones"], portionLabel: "1 bolón", kcal: 350, proteinGrams: 10, carbsGrams: 50, fatGrams: 15, countable: true },
  { id: "pan_yuca", keywords: ["pan de yuca", "panes de yuca"], portionLabel: "1 pan de yuca", kcal: 140, proteinGrams: 4, carbsGrams: 25, fatGrams: 3, countable: true },
  { id: "pan", keywords: ["pan"], portionLabel: "1 pan", kcal: 80, proteinGrams: 3, carbsGrams: 15, fatGrams: 1, countable: true },
  { id: "encebollado", keywords: ["encebollado"], portionLabel: "1 plato de encebollado", kcal: 450, proteinGrams: 35, carbsGrams: 45, fatGrams: 12 },
  { id: "ceviche", keywords: ["ceviche", "cebiche"], portionLabel: "1 plato de ceviche", kcal: 250, proteinGrams: 25, carbsGrams: 18, fatGrams: 8 },
  { id: "seco", keywords: ["seco de pollo", "seco de carne", "seco de chivo"], portionLabel: "1 plato de seco", kcal: 500, proteinGrams: 30, carbsGrams: 55, fatGrams: 16 },
  { id: "huevo", keywords: ["huevo", "huevos"], portionLabel: "1 huevo", kcal: 70, proteinGrams: 6, carbsGrams: 0.6, fatGrams: 5, countable: true },
  { id: "queso", keywords: ["queso"], portionLabel: "30 g de queso", kcal: 110, proteinGrams: 7, carbsGrams: 1, fatGrams: 9 },
  { id: "aguacate", keywords: ["aguacate", "palta"], portionLabel: "1/2 aguacate", kcal: 120, proteinGrams: 1.5, carbsGrams: 6, fatGrams: 11 },
  { id: "papa", keywords: ["papa", "papas"], portionLabel: "150 g de papa", kcal: 130, proteinGrams: 3, carbsGrams: 30, fatGrams: 0.2 },
  { id: "yuca", keywords: ["yuca"], portionLabel: "100 g de yuca", kcal: 160, proteinGrams: 1.4, carbsGrams: 38, fatGrams: 0.3 },
  { id: "maduro", keywords: ["maduro", "platano maduro"], portionLabel: "1 plátano maduro", kcal: 180, proteinGrams: 1.5, carbsGrams: 45, fatGrams: 0.5, countable: true },
  { id: "sopa", keywords: ["sopa", "caldo"], portionLabel: "1 tazón de sopa", kcal: 140, proteinGrams: 8, carbsGrams: 18, fatGrams: 4 },
  { id: "fideos", keywords: ["fideos", "tallarin", "tallarines", "pasta", "espagueti"], portionLabel: "1 taza de fideos", kcal: 220, proteinGrams: 8, carbsGrams: 42, fatGrams: 2 },
  { id: "tortilla", keywords: ["tortilla", "tortillas"], portionLabel: "1 tortilla", kcal: 90, proteinGrams: 3, carbsGrams: 15, fatGrams: 2.5, countable: true },
  { id: "arepa", keywords: ["arepa", "arepas"], portionLabel: "1 arepa", kcal: 150, proteinGrams: 3, carbsGrams: 28, fatGrams: 2.5, countable: true },
  { id: "empanada", keywords: ["empanada", "empanadas"], portionLabel: "1 empanada", kcal: 250, proteinGrams: 7, carbsGrams: 30, fatGrams: 12, countable: true },
  { id: "cafe", keywords: ["cafe con leche", "cafe", "cafe con panela"], portionLabel: "1 taza de café con leche", kcal: 60, proteinGrams: 3, carbsGrams: 6, fatGrams: 2 },
  { id: "leche", keywords: ["leche"], portionLabel: "1 vaso de leche", kcal: 150, proteinGrams: 8, carbsGrams: 12, fatGrams: 8 },
  { id: "jugo", keywords: ["jugo", "batido", "smoothie", "licuado"], portionLabel: "1 vaso de jugo", kcal: 130, proteinGrams: 1, carbsGrams: 31, fatGrams: 0.3 },
  { id: "gaseosa", keywords: ["gaseosa", "cola", "refresco", "soda"], portionLabel: "1 vaso de gaseosa", kcal: 140, proteinGrams: 0, carbsGrams: 36, fatGrams: 0 },
  { id: "cerveza", keywords: ["cerveza"], portionLabel: "1 vaso de cerveza", kcal: 150, proteinGrams: 1.5, carbsGrams: 13, fatGrams: 0 },
  { id: "chocolate", keywords: ["chocolate"], portionLabel: "30 g de chocolate", kcal: 160, proteinGrams: 2, carbsGrams: 18, fatGrams: 9 },
  { id: "galletas", keywords: ["galletas", "galleta"], portionLabel: "4 galletas", kcal: 140, proteinGrams: 2, carbsGrams: 20, fatGrams: 6 },
  { id: "helado", keywords: ["helado"], portionLabel: "1 bola de helado", kcal: 140, proteinGrams: 3, carbsGrams: 17, fatGrams: 7 },
];

/** Minúsculas, sin acentos, espacios colapsados. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Extrae una cantidad explícita (ej. "3") que preceda inmediatamente a un alimento. */
function extractQuantity(prefix: string): number {
  const match = prefix.match(/(\d+)\s*(?:[a-z]+\s+){0,2}$/);
  if (!match) return 1;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

interface RawMatch {
  food: FoodEntry;
  count: number;
  length: number;
  index: number;
}

export interface MatchedFood {
  food: FoodEntry;
  count: number;
}

/**
 * Encuentra alimentos conocidos en el texto normalizado.
 * Las coincidencias más largas ganan sobre las más cortas (evita contar
 * "pan" y "pan de yuca" dos veces).
 */
export function matchFoods(normalized: string): MatchedFood[] {
  const raw: RawMatch[] = [];

  for (const food of FOODS) {
    for (const keyword of food.keywords) {
      const re = new RegExp(`\\b${escapeRegExp(keyword)}`, "g");
      let match: RegExpExecArray | null;
      while ((match = re.exec(normalized)) !== null) {
        raw.push({
          food,
          count: extractQuantity(normalized.slice(0, match.index)),
          length: keyword.length,
          index: match.index,
        });
      }
    }
  }

  raw.sort((a, b) => b.length - a.length || a.index - b.index);

  const selected: MatchedFood[] = [];
  const taken: Array<[number, number]> = [];

  for (const item of raw) {
    const start = item.index;
    const end = item.index + item.length;
    const overlaps = taken.some(([s, e]) => start < e && end > s);
    if (overlaps) continue;
    taken.push([start, end]);
    selected.push({ food: item.food, count: item.count });
  }

  return selected;
}

export class MockEstimator implements NutritionEstimator {
  readonly id = "mock" as const;

  async estimateFromText(input: string): Promise<NutritionEstimate> {
    const normalized = normalizeText(input);
    const matched = matchFoods(normalized);
    const dish = input.trim().slice(0, 200) || "Comida";

    if (matched.length === 0) {
      return {
        dish,
        estimatedCalories: 450,
        calorieRange: { min: 300, max: 650 },
        proteinGrams: 20,
        carbsGrams: 45,
        fatGrams: 18,
        confidence: "low",
        assumptions: ["Porción promedio asumida (no se reconoció el plato)"],
      };
    }

    let kcal = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    const assumptions: string[] = [];

    for (const { food, count } of matched) {
      const mult = food.countable ? count : 1;
      kcal += food.kcal * mult;
      protein += food.proteinGrams * mult;
      carbs += food.carbsGrams * mult;
      fat += food.fatGrams * mult;
      assumptions.push(count > 1 && food.countable ? `${count} × ${food.portionLabel}` : food.portionLabel);
    }

    const estimatedCalories = Math.round(kcal);
    const confidence = matched.length >= 2 ? "medium" : "low";

    return {
      dish,
      estimatedCalories,
      calorieRange: {
        min: Math.round(estimatedCalories * 0.8),
        max: Math.round(estimatedCalories * 1.2),
      },
      proteinGrams: Math.round(protein),
      carbsGrams: Math.round(carbs),
      fatGrams: Math.round(fat),
      confidence,
      assumptions,
    };
  }

  async estimateFromImage(_image: Blob, _context?: string): Promise<NutritionEstimate> {
    throw new PhotoUnavailableError();
  }
}
