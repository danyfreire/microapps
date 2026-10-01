import { describe, expect, it, vi } from "vitest";
import type { NutritionEstimate } from "@/domain/schemas";
import { EstimateValidationError } from "./errors";
import { estimateFromTextValidated } from "./estimator";
import { extractJson } from "./openaiEstimator";
import type { NutritionEstimator } from "./provider";

const valid: NutritionEstimate = {
  dish: "Arroz con pollo",
  estimatedCalories: 550,
  proteinGrams: 30,
  carbsGrams: 60,
  fatGrams: 18,
  confidence: "medium",
  assumptions: ["1 plato"],
};

function fakeEstimator(responses: unknown[]) {
  const estimateFromText = vi.fn<(input: string) => Promise<NutritionEstimate>>();
  for (const r of responses) {
    estimateFromText.mockResolvedValueOnce(r as NutritionEstimate);
  }
  const estimator: NutritionEstimator = {
    id: "mock",
    estimateFromText,
    estimateFromImage: vi.fn(),
  };
  return { estimator, estimateFromText };
}

describe("estimateFromTextValidated", () => {
  it("devuelve la estimación cuando es válida (sin reintento)", async () => {
    const { estimator, estimateFromText } = fakeEstimator([valid]);
    const result = await estimateFromTextValidated(estimator, "arroz con pollo");
    expect(result).toEqual(valid);
    expect(estimateFromText).toHaveBeenCalledTimes(1);
  });

  it("reintenta una vez si la primera respuesta es inválida", async () => {
    const { estimator, estimateFromText } = fakeEstimator([
      { ...valid, confidence: "nope" },
      valid,
    ]);
    const result = await estimateFromTextValidated(estimator, "arroz con pollo");
    expect(result).toEqual(valid);
    expect(estimateFromText).toHaveBeenCalledTimes(2);
  });

  it("lanza EstimateValidationError si ambas respuestas son inválidas", async () => {
    const { estimator } = fakeEstimator([
      { ...valid, estimatedCalories: -1 },
      { ...valid, estimatedCalories: -1 },
    ]);
    await expect(estimateFromTextValidated(estimator, "arroz con pollo")).rejects.toBeInstanceOf(
      EstimateValidationError,
    );
  });

  it("propaga los errores del proveedor sin reintento", async () => {
    const estimator: NutritionEstimator = {
      id: "mock",
      estimateFromText: vi.fn().mockRejectedValue(new Error("red")),
      estimateFromImage: vi.fn(),
    };
    await expect(estimateFromTextValidated(estimator, "arroz")).rejects.toThrow("red");
    expect(estimator.estimateFromText).toHaveBeenCalledTimes(1);
  });
});

describe("extractJson", () => {
  it("extrae JSON puro", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("tolera fences de markdown", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("lanza si no hay JSON", () => {
    expect(() => extractJson("no hay json")).toThrow();
  });
});
