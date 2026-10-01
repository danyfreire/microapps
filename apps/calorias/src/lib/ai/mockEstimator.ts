import type {
  NutritionComponent,
  NutritionEstimate,
  NutritionUnitOption,
} from "@/domain/schemas";
import { calculateComponents, formatPortionQuantity } from "@/domain/portions";
import { PhotoUnavailableError } from "./errors";
import type { NutritionEstimator } from "./provider";

interface FoodEntry {
  id: string;
  name: string;
  keywords: string[];
  defaultQuantity: number;
  defaultUnitId: string;
  unitOptions: NutritionUnitOption[];
  countable?: boolean;
}

function unit(
  id: string,
  label: string,
  caloriesPerUnit: number,
  proteinGramsPerUnit: number,
  carbsGramsPerUnit: number,
  fatGramsPerUnit: number,
): NutritionUnitOption {
  return {
    id,
    label,
    caloriesPerUnit,
    proteinGramsPerUnit,
    carbsGramsPerUnit,
    fatGramsPerUnit,
  };
}

const FOODS: FoodEntry[] = [
  {
    id: "arroz",
    name: "Arroz cocido",
    keywords: ["arroz"],
    defaultQuantity: 1,
    defaultUnitId: "cup",
    unitOptions: [
      unit("cup", "taza", 205, 4, 45, 0.4),
      unit("g", "g", 205 / 158, 4 / 158, 45 / 158, 0.4 / 158),
    ],
  },
  {
    id: "arroz_con_pollo",
    name: "Arroz con pollo",
    keywords: ["arroz con pollo"],
    defaultQuantity: 1,
    defaultUnitId: "plate",
    unitOptions: [unit("plate", "plato", 550, 30, 60, 18)],
  },
  {
    id: "menestra",
    name: "Menestra",
    keywords: ["menestra", "lenteja", "lentejas", "frijol", "frijoles", "frejol", "frejoles", "poroto", "porotos", "garbanzo", "garbanzos"],
    defaultQuantity: 0.75,
    defaultUnitId: "cup",
    unitOptions: [
      unit("cup", "taza", 240, 13.3, 42.7, 1.3),
      unit("g", "g", 240 / 198, 13.3 / 198, 42.7 / 198, 1.3 / 198),
    ],
  },
  {
    id: "carne",
    name: "Carne de res",
    keywords: ["carne", "res", "bistec", "churrasco"],
    defaultQuantity: 150,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 320 / 150, 39 / 150, 0, 18 / 150)],
  },
  {
    id: "pollo",
    name: "Pollo",
    keywords: ["pollo"],
    defaultQuantity: 150,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 250 / 150, 31 / 150, 0, 14 / 150)],
  },
  {
    id: "pescado",
    name: "Pescado",
    keywords: ["pescado", "tilapia", "corvina", "atun"],
    defaultQuantity: 150,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 200 / 150, 30 / 150, 0, 8 / 150)],
  },
  {
    id: "camaron",
    name: "Camarón",
    keywords: ["camaron", "camarones"],
    defaultQuantity: 100,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 1, 0.21, 0.01, 0.01)],
  },
  {
    id: "patacon",
    name: "Patacón",
    keywords: ["patacon", "patacones"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 170, 1, 26, 8)],
    countable: true,
  },
  {
    id: "bolon",
    name: "Bolón",
    keywords: ["bolon", "bolones"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 350, 10, 50, 15)],
    countable: true,
  },
  {
    id: "pan_yuca",
    name: "Pan de yuca",
    keywords: ["pan de yuca", "panes de yuca"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 140, 4, 25, 3)],
    countable: true,
  },
  {
    id: "pan",
    name: "Pan",
    keywords: ["pan"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 80, 3, 15, 1)],
    countable: true,
  },
  {
    id: "encebollado",
    name: "Encebollado",
    keywords: ["encebollado"],
    defaultQuantity: 1,
    defaultUnitId: "plate",
    unitOptions: [unit("plate", "plato", 450, 35, 45, 12)],
  },
  {
    id: "ceviche",
    name: "Ceviche",
    keywords: ["ceviche", "cebiche"],
    defaultQuantity: 1,
    defaultUnitId: "plate",
    unitOptions: [unit("plate", "plato", 250, 25, 18, 8)],
  },
  {
    id: "seco",
    name: "Seco",
    keywords: ["seco de pollo", "seco de carne", "seco de chivo"],
    defaultQuantity: 1,
    defaultUnitId: "plate",
    unitOptions: [unit("plate", "plato", 500, 30, 55, 16)],
  },
  {
    id: "huevo",
    name: "Huevo",
    keywords: ["huevo", "huevos"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 70, 6, 0.6, 5)],
    countable: true,
  },
  {
    id: "queso",
    name: "Queso",
    keywords: ["queso"],
    defaultQuantity: 30,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 110 / 30, 7 / 30, 1 / 30, 9 / 30)],
  },
  {
    id: "aguacate",
    name: "Aguacate",
    keywords: ["aguacate", "palta"],
    defaultQuantity: 0.5,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 240, 3, 12, 22)],
    countable: true,
  },
  {
    id: "papa",
    name: "Papa",
    keywords: ["papa", "papas"],
    defaultQuantity: 150,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 130 / 150, 3 / 150, 30 / 150, 0.2 / 150)],
  },
  {
    id: "yuca",
    name: "Yuca",
    keywords: ["yuca"],
    defaultQuantity: 100,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 1.6, 0.014, 0.38, 0.003)],
  },
  {
    id: "maduro",
    name: "Plátano maduro",
    keywords: ["maduro", "platano maduro"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 180, 1.5, 45, 0.5)],
    countable: true,
  },
  {
    id: "sopa",
    name: "Sopa",
    keywords: ["sopa", "caldo"],
    defaultQuantity: 1,
    defaultUnitId: "bowl",
    unitOptions: [unit("bowl", "tazón", 140, 8, 18, 4)],
  },
  {
    id: "fideos",
    name: "Pasta cocida",
    keywords: ["fideos", "tallarin", "tallarines", "pasta", "espagueti"],
    defaultQuantity: 1,
    defaultUnitId: "cup",
    unitOptions: [
      unit("cup", "taza", 220, 8, 42, 2),
      unit("g", "g", 220 / 140, 8 / 140, 42 / 140, 2 / 140),
    ],
  },
  {
    id: "tortilla",
    name: "Tortilla",
    keywords: ["tortilla", "tortillas"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 90, 3, 15, 2.5)],
    countable: true,
  },
  {
    id: "arepa",
    name: "Arepa",
    keywords: ["arepa", "arepas"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 150, 3, 28, 2.5)],
    countable: true,
  },
  {
    id: "empanada",
    name: "Empanada",
    keywords: ["empanada", "empanadas"],
    defaultQuantity: 1,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 250, 7, 30, 12)],
    countable: true,
  },
  {
    id: "cafe",
    name: "Café con leche",
    keywords: ["cafe con leche", "cafe con panela", "cafe"],
    defaultQuantity: 1,
    defaultUnitId: "cup",
    unitOptions: [unit("cup", "taza", 60, 3, 6, 2)],
  },
  {
    id: "leche",
    name: "Leche",
    keywords: ["leche"],
    defaultQuantity: 1,
    defaultUnitId: "glass",
    unitOptions: [unit("glass", "vaso", 150, 8, 12, 8)],
  },
  {
    id: "jugo",
    name: "Jugo",
    keywords: ["jugo", "batido", "smoothie", "licuado"],
    defaultQuantity: 1,
    defaultUnitId: "glass",
    unitOptions: [unit("glass", "vaso", 130, 1, 31, 0.3)],
  },
  {
    id: "gaseosa",
    name: "Gaseosa",
    keywords: ["gaseosa", "cola", "refresco", "soda"],
    defaultQuantity: 1,
    defaultUnitId: "glass",
    unitOptions: [unit("glass", "vaso", 140, 0, 36, 0)],
  },
  {
    id: "cerveza",
    name: "Cerveza",
    keywords: ["cerveza"],
    defaultQuantity: 1,
    defaultUnitId: "glass",
    unitOptions: [unit("glass", "vaso", 150, 1.5, 13, 0)],
  },
  {
    id: "chocolate",
    name: "Chocolate",
    keywords: ["chocolate"],
    defaultQuantity: 30,
    defaultUnitId: "g",
    unitOptions: [unit("g", "g", 160 / 30, 2 / 30, 18 / 30, 9 / 30)],
  },
  {
    id: "galletas",
    name: "Galleta",
    keywords: ["galletas", "galleta"],
    defaultQuantity: 4,
    defaultUnitId: "unit",
    unitOptions: [unit("unit", "unidad", 35, 0.5, 5, 1.5)],
    countable: true,
  },
  {
    id: "helado",
    name: "Helado",
    keywords: ["helado"],
    defaultQuantity: 1,
    defaultUnitId: "scoop",
    unitOptions: [unit("scoop", "bola", 140, 3, 17, 7)],
  },
];

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordQuantity(value: string): number | null {
  const tail = value.trim();
  const patterns: Array<[RegExp, number]> = [
    [/(?:un|una)\s*$/, 1],
    [/(?:medio|media)\s*$/, 0.5],
    [/(?:un|una)\s+cuarto\s*$/, 0.25],
    [/tres\s+cuartos\s*$/, 0.75],
    [/dos\s*$/, 2],
    [/tres\s*$/, 3],
    [/cuatro\s*$/, 4],
  ];
  for (const [pattern, quantity] of patterns) {
    if (pattern.test(tail)) return quantity;
  }
  return null;
}

function parseFraction(num: string, den: string): number | null {
  const numerator = Number(num);
  const denominator = Number(den);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return numerator / denominator;
}

function supported(food: FoodEntry, unitId: string): boolean {
  return food.unitOptions.some((option) => option.id === unitId);
}

function extractPortion(prefix: string, food: FoodEntry): {
  quantity: number;
  unitId: string;
  explicit: boolean;
} {
  const tail = prefix.slice(-70).trimEnd();

  if (supported(food, "g")) {
    const grams = tail.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|gramo|gramos)\s*(?:de\s*)?$/);
    if (grams) {
      return {
        quantity: Number(grams[1].replace(",", ".")),
        unitId: "g",
        explicit: true,
      };
    }
  }

  if (supported(food, "cup")) {
    const fraction = tail.match(/(\d+)\s*\/\s*(\d+)\s*(?:de\s+)?tazas?\s*(?:de\s*)?$/);
    if (fraction) {
      const quantity = parseFraction(fraction[1], fraction[2]);
      if (quantity) return { quantity, unitId: "cup", explicit: true };
    }

    const decimal = tail.match(/(\d+(?:[.,]\d+)?)\s*(?:de\s+)?tazas?\s*(?:de\s*)?$/);
    if (decimal) {
      return {
        quantity: Number(decimal[1].replace(",", ".")),
        unitId: "cup",
        explicit: true,
      };
    }

    const words = tail.match(/((?:una?|media|medio|un cuarto|una cuarta|tres cuartos))\s+tazas?\s*(?:de\s*)?$/);
    if (words) {
      const phrase = words[1];
      const quantity =
        phrase.startsWith("med") ? 0.5 :
        phrase.startsWith("tres") ? 0.75 :
        phrase.includes("cuart") ? 0.25 : 1;
      return { quantity, unitId: "cup", explicit: true };
    }
  }

  if (food.countable || supported(food, "unit")) {
    const fraction = tail.match(/(\d+)\s*\/\s*(\d+)\s*(?:de\s*)?$/);
    if (fraction) {
      const quantity = parseFraction(fraction[1], fraction[2]);
      if (quantity) return { quantity, unitId: food.defaultUnitId, explicit: true };
    }

    const numeric = tail.match(/(\d+(?:[.,]\d+)?)\s*(?:de\s*)?$/);
    if (numeric) {
      return {
        quantity: Number(numeric[1].replace(",", ".")),
        unitId: food.defaultUnitId,
        explicit: true,
      };
    }

    const words = wordQuantity(tail);
    if (words != null) {
      return { quantity: words, unitId: food.defaultUnitId, explicit: true };
    }
  }

  return {
    quantity: food.defaultQuantity,
    unitId: food.defaultUnitId,
    explicit: false,
  };
}

interface RawMatch {
  food: FoodEntry;
  keyword: string;
  length: number;
  index: number;
}

export interface MatchedFood {
  food: FoodEntry;
  count: number;
  quantity: number;
  unitId: string;
  explicit: boolean;
}

export function matchFoods(normalized: string): MatchedFood[] {
  const raw: RawMatch[] = [];

  for (const food of FOODS) {
    for (const keyword of food.keywords) {
      const re = new RegExp(`\\b${escapeRegExp(keyword)}`, "g");
      let match: RegExpExecArray | null;
      while ((match = re.exec(normalized)) !== null) {
        raw.push({ food, keyword, length: keyword.length, index: match.index });
      }
    }
  }

  raw.sort((a, b) => b.length - a.length || a.index - b.index);

  const selected: Array<MatchedFood & { index: number }> = [];
  const taken: Array<[number, number]> = [];

  for (const item of raw) {
    const start = item.index;
    const end = item.index + item.length;
    if (taken.some(([s, e]) => start < e && end > s)) continue;

    const portion = extractPortion(normalized.slice(0, item.index), item.food);
    taken.push([start, end]);
    selected.push({
      food: item.food,
      index: item.index,
      count: portion.quantity,
      quantity: portion.quantity,
      unitId: portion.unitId,
      explicit: portion.explicit,
    });
  }

  return selected
    .sort((a, b) => a.index - b.index)
    .map(({ index: _index, ...match }) => match);
}

function toComponent(match: MatchedFood, index: number): NutritionComponent {
  return {
    id: `${match.food.id}-${index}`,
    name: match.food.name,
    quantity: match.quantity,
    unitId: match.unitId,
    unitOptions: match.food.unitOptions,
    assumed: !match.explicit,
  };
}

function describeComponent(component: NutritionComponent): string {
  const option =
    component.unitOptions.find((candidate) => candidate.id === component.unitId) ??
    component.unitOptions[0];
  return `${formatPortionQuantity(component.quantity)} ${option.label} de ${component.name.toLowerCase()}`;
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

    const components = matched.map(toComponent);
    const totals = calculateComponents(components);
    const assumed = components.filter((component) => component.assumed);
    const explicitCount = components.length - assumed.length;

    let confidence: NutritionEstimate["confidence"] = "medium";
    if (explicitCount === components.length) confidence = "high";
    else if (explicitCount === 0 && components.length === 1) confidence = "low";

    return {
      dish,
      estimatedCalories: totals.calories,
      ...(assumed.length > 0
        ? {
            calorieRange: {
              min: Math.round(totals.calories * 0.85),
              max: Math.round(totals.calories * 1.15),
            },
          }
        : {}),
      proteinGrams: totals.proteinGrams,
      carbsGrams: totals.carbsGrams,
      fatGrams: totals.fatGrams,
      confidence,
      assumptions: assumed.map(
        (component) => `Asumí ${describeComponent(component)}`,
      ),
      components,
    };
  }

  async estimateFromImage(_image: Blob, _context?: string): Promise<NutritionEstimate> {
    throw new PhotoUnavailableError();
  }
}
