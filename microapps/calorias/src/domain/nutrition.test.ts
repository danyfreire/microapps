import { describe, expect, it } from "vitest";
import { emptyTotals, localDayKey, remainingCalories, sumMeals } from "./nutrition";
import type { Meal } from "./schemas";

function meal(id: string, calories: number): Meal {
  return {
    id,
    createdAt: "2026-10-01T12:00:00.000Z",
    label: "Comida",
    calories,
    proteinGrams: 10,
    carbsGrams: 20,
    fatGrams: 5,
    source: "manual",
  };
}

describe("sumMeals", () => {
  it("devuelve ceros para una lista vacía", () => {
    expect(sumMeals([])).toEqual(emptyTotals());
  });

  it("suma calorías y macros", () => {
    const totals = sumMeals([meal("a", 200), meal("b", 300)]);
    expect(totals.calories).toBe(500);
    expect(totals.proteinGrams).toBe(20);
    expect(totals.carbsGrams).toBe(40);
    expect(totals.fatGrams).toBe(10);
    expect(totals.mealCount).toBe(2);
  });
});

describe("localDayKey", () => {
  it("formatea la fecha local como YYYY-MM-DD", () => {
    const date = new Date(2026, 9, 1, 8, 30); // 1 de octubre de 2026, hora local
    expect(localDayKey(date)).toBe("2026-10-01");
  });

  it("usa dos dígitos para mes y día", () => {
    expect(localDayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("remainingCalories", () => {
  it("devuelve null sin objetivo", () => {
    expect(remainingCalories(sumMeals([meal("a", 200)]))).toBeNull();
  });

  it("calcula lo restante", () => {
    expect(remainingCalories(sumMeals([meal("a", 200)]), 2000)).toBe(1800);
  });

  it("puede ser negativo al exceder el objetivo", () => {
    expect(remainingCalories(sumMeals([meal("a", 2100)]), 2000)).toBe(-100);
  });
});
