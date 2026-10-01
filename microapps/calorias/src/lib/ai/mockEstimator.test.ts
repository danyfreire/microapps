import { describe, expect, it } from "vitest";
import { nutritionEstimateSchema } from "@/domain/schemas";
import { matchFoods, MockEstimator, normalizeText } from "./mockEstimator";

describe("normalizeText", () => {
  it("quita acentos y pasa a minúsculas", () => {
    expect(normalizeText("Café con Leche")).toBe("cafe con leche");
  });

  it("colapsa espacios", () => {
    expect(normalizeText("  arroz   con   menestra  ")).toBe("arroz con menestra");
  });
});

describe("matchFoods", () => {
  it("detecta alimentos conocidos", () => {
    const foods = matchFoods("arroz con menestra y pollo");
    expect(foods.map((f) => f.food.id).sort()).toEqual(["arroz", "menestra", "pollo"]);
  });

  it("extrae cantidades explícitas", () => {
    const foods = matchFoods("3 patacones");
    expect(foods).toHaveLength(1);
    expect(foods[0].food.id).toBe("patacon");
    expect(foods[0].count).toBe(3);
  });

  it("no cuenta dos veces una coincidencia contenida en otra más larga", () => {
    const foods = matchFoods("pan de yuca");
    const ids = foods.map((f) => f.food.id);
    expect(ids).toContain("pan_yuca");
    expect(ids).not.toContain("pan");
  });
});

describe("MockEstimator", () => {
  const estimator = new MockEstimator();

  it("siempre devuelve una estimación validable con Zod", async () => {
    for (const text of ["arroz con menestra, carne y 3 patacones", "bolón mixto", "zzz no existe"]) {
      const result = await estimator.estimateFromText(text);
      expect(nutritionEstimateSchema.safeParse(result).success).toBe(true);
    }
  });

  it("multiplica por cantidad para alimentos contables", async () => {
    const result = await estimator.estimateFromText("3 patacones");
    expect(result.estimatedCalories).toBe(3 * 170);
    expect(result.assumptions.some((a) => a.includes("3 ×"))).toBe(true);
  });

  it("usa confianza baja para un plato no reconocido", async () => {
    const result = await estimator.estimateFromText("algo muy raro que no reconozco");
    expect(result.confidence).toBe("low");
  });

  it("rechaza la estimación por imagen (no disponible en mock)", async () => {
    await expect(estimator.estimateFromImage(new Blob())).rejects.toThrow(
      /no está disponible/i,
    );
  });
});
