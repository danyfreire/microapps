import { indexedDB as fakeIndexedDB } from "fake-indexeddb";
import { beforeAll, describe, expect, it } from "vitest";
import type { Meal } from "@/domain/schemas";
import {
  clearAllData,
  clearDay,
  clearSettings,
  deleteMeal,
  getMeals,
  getSettings,
  putMeal,
  saveSettings,
} from "./storage";

beforeAll(() => {
  globalThis.indexedDB = fakeIndexedDB as unknown as IDBFactory;
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: localStorageMock,
  };
});

let counter = 0;
function meal(label: string, calories: number): Meal {
  counter += 1;
  return {
    id: `m${counter}`,
    createdAt: `2026-10-01T12:00:00.${String(counter).padStart(3, "0")}Z`,
    label,
    calories,
    proteinGrams: 10,
    carbsGrams: 20,
    fatGrams: 5,
    source: "manual",
  };
}

describe("storage (IndexedDB)", () => {
  it("guarda y lee comidas por día, ordenadas por fecha", async () => {
    const day = "2026-11-01";
    await putMeal(day, meal("Arroz", 200));
    await putMeal(day, meal("Pollo", 300));
    const meals = await getMeals(day);
    expect(meals).toHaveLength(2);
    expect(meals[0].label).toBe("Arroz");
    expect(meals[1].label).toBe("Pollo");
  });

  it("no mezcla días distintos", async () => {
    await putMeal("2026-11-02", meal("A", 100));
    await putMeal("2026-11-03", meal("B", 200));
    expect(await getMeals("2026-11-02")).toHaveLength(1);
    expect(await getMeals("2026-11-03")).toHaveLength(1);
  });

  it("elimina una comida del día correcto", async () => {
    const day = "2026-11-04";
    const m = meal("Eliminar", 150);
    await putMeal(day, m);
    await deleteMeal(day, m.id);
    expect(await getMeals(day)).toHaveLength(0);
  });

  it("limpia un día entero", async () => {
    const day = "2026-11-05";
    await putMeal(day, meal("Uno", 100));
    await putMeal(day, meal("Dos", 200));
    await clearDay(day);
    expect(await getMeals(day)).toHaveLength(0);
  });

  it("borra todos los datos", async () => {
    const day = "2026-11-06";
    await putMeal(day, meal("Todo", 100));
    await clearAllData();
    expect(await getMeals(day)).toHaveLength(0);
  });
});

describe("settings (localStorage)", () => {
  it("guarda y lee el objetivo", () => {
    saveSettings({ calorieGoal: 2000 });
    expect(getSettings().calorieGoal).toBe(2000);
  });

  it("limpia los ajustes", () => {
    saveSettings({ calorieGoal: 2000 });
    clearSettings();
    expect(getSettings().calorieGoal).toBeUndefined();
  });

  it("ignora ajustes inválidos", () => {
    saveSettings({ calorieGoal: -5 });
    expect(getSettings().calorieGoal).toBeUndefined();
  });
});
