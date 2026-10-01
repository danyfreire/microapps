import { describe, expect, it } from "vitest";
import {
  estimateTextRequestSchema,
  mealSchema,
  nutritionEstimateSchema,
  type NutritionEstimate,
} from "./schemas";

const validEstimate: NutritionEstimate = {
  dish: "Arroz con menestra",
  estimatedCalories: 500,
  proteinGrams: 20,
  carbsGrams: 60,
  fatGrams: 15,
  confidence: "medium",
  assumptions: ["1 taza de arroz"],
};

describe("nutritionEstimateSchema", () => {
  it("acepta una estimación válida", () => {
    expect(nutritionEstimateSchema.safeParse(validEstimate).success).toBe(true);
  });

  it("acepta un calorieRange opcional", () => {
    const result = nutritionEstimateSchema.safeParse({
      ...validEstimate,
      calorieRange: { min: 400, max: 600 },
    });
    expect(result.success).toBe(true);
  });

  it("rechaza calorías negativas", () => {
    const result = nutritionEstimateSchema.safeParse({
      ...validEstimate,
      estimatedCalories: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un confidence inválido", () => {
    const result = nutritionEstimateSchema.safeParse({
      ...validEstimate,
      confidence: "maybe",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza dish vacío", () => {
    const result = nutritionEstimateSchema.safeParse({ ...validEstimate, dish: "   " });
    expect(result.success).toBe(false);
  });
});

describe("mealSchema", () => {
  const validMeal = {
    id: "abc",
    createdAt: "2026-10-01T12:00:00.000Z",
    label: "Bolón mixto",
    calories: 350,
    proteinGrams: 10,
    carbsGrams: 50,
    fatGrams: 15,
    source: "text",
  };

  it("acepta una comida válida", () => {
    expect(mealSchema.safeParse(validMeal).success).toBe(true);
  });

  it("rechaza label vacío", () => {
    expect(mealSchema.safeParse({ ...validMeal, label: "" }).success).toBe(false);
  });

  it("rechaza un source inválido", () => {
    expect(mealSchema.safeParse({ ...validMeal, source: "voice" }).success).toBe(false);
  });
});

describe("estimateTextRequestSchema", () => {
  it("rechaza texto vacío", () => {
    expect(estimateTextRequestSchema.safeParse({ text: "   " }).success).toBe(false);
  });

  it("recorta espacios", () => {
    const result = estimateTextRequestSchema.parse({ text: "  arroz  " });
    expect(result.text).toBe("arroz");
  });
});
