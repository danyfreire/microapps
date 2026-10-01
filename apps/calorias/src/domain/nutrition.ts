import type { Meal } from "./schemas";

export interface DailyTotals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealCount: number;
}

export function emptyTotals(): DailyTotals {
  return { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, mealCount: 0 };
}

/** Suma los macros de una lista de comidas (sin mutar). */
export function sumMeals(meals: Meal[]): DailyTotals {
  return meals.reduce<DailyTotals>(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      proteinGrams: acc.proteinGrams + meal.proteinGrams,
      carbsGrams: acc.carbsGrams + meal.carbsGrams,
      fatGrams: acc.fatGrams + meal.fatGrams,
      mealCount: acc.mealCount + 1,
    }),
    emptyTotals(),
  );
}

/** Clave del día en hora local, formato YYYY-MM-DD. */
export function localDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Calorías restantes hacia el objetivo (null si no hay objetivo). */
export function remainingCalories(totals: DailyTotals, goal?: number): number | null {
  if (goal == null) return null;
  return goal - totals.calories;
}
