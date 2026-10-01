import type {
  NutritionComponent,
  NutritionUnitOption,
} from "./schemas";

export interface NutritionTotals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export function getSelectedUnit(component: NutritionComponent): NutritionUnitOption {
  return (
    component.unitOptions.find((option) => option.id === component.unitId) ??
    component.unitOptions[0]
  );
}

export function calculateComponent(component: NutritionComponent): NutritionTotals {
  const unit = getSelectedUnit(component);
  return {
    calories: unit.caloriesPerUnit * component.quantity,
    proteinGrams: unit.proteinGramsPerUnit * component.quantity,
    carbsGrams: unit.carbsGramsPerUnit * component.quantity,
    fatGrams: unit.fatGramsPerUnit * component.quantity,
  };
}

export function calculateComponents(components: NutritionComponent[]): NutritionTotals {
  const raw = components.reduce<NutritionTotals>(
    (totals, component) => {
      const value = calculateComponent(component);
      return {
        calories: totals.calories + value.calories,
        proteinGrams: totals.proteinGrams + value.proteinGrams,
        carbsGrams: totals.carbsGrams + value.carbsGrams,
        fatGrams: totals.fatGrams + value.fatGrams,
      };
    },
    { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 },
  );

  return {
    calories: Math.round(raw.calories),
    proteinGrams: round1(raw.proteinGrams),
    carbsGrams: round1(raw.carbsGrams),
    fatGrams: round1(raw.fatGrams),
  };
}

export function formatPortionQuantity(quantity: number): string {
  const fractions: Array<[number, string]> = [
    [0.25, "¼"],
    [1 / 3, "⅓"],
    [0.5, "½"],
    [2 / 3, "⅔"],
    [0.75, "¾"],
  ];

  for (const [value, label] of fractions) {
    if (Math.abs(quantity - value) < 0.02) return label;
  }

  if (Number.isInteger(quantity)) return String(quantity);
  return quantity.toLocaleString("es", { maximumFractionDigits: 2 });
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
