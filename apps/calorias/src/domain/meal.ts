import type { Meal, NutritionEstimate } from "./schemas";

/** Genera un id único para una comida, con respaldo sin `crypto.randomUUID`. */
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Convierte una comida guardada en la forma de una estimación (para reeditarla). */
export function mealToEstimate(meal: Meal): NutritionEstimate {
  return {
    dish: meal.label,
    estimatedCalories: meal.calories,
    proteinGrams: meal.proteinGrams,
    carbsGrams: meal.carbsGrams,
    fatGrams: meal.fatGrams,
    confidence: meal.confidence ?? "low",
    assumptions: meal.assumptions ?? [],
    components: meal.components,
  };
}
