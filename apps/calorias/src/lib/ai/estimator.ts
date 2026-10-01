import {
  nutritionEstimateSchema,
  type NutritionEstimate,
} from "@/domain/schemas";
import { EstimateValidationError } from "./errors";
import type { NutritionEstimator } from "./provider";

/**
 * Valida la salida del proveedor con Zod. Si falla, reintenta una sola vez;
 * si vuelve a fallar, lanza un error recuperable (nunca se inventan valores).
 */
export async function estimateFromTextValidated(
  estimator: NutritionEstimator,
  input: string,
): Promise<NutritionEstimate> {
  return withRetry(() => estimator.estimateFromText(input));
}

export async function estimateFromImageValidated(
  estimator: NutritionEstimator,
  image: Blob,
  context?: string,
): Promise<NutritionEstimate> {
  return withRetry(() => estimator.estimateFromImage(image, context));
}

async function withRetry(fn: () => Promise<unknown>): Promise<NutritionEstimate> {
  let raw: unknown;
  try {
    raw = await fn();
  } catch (error) {
    // Los errores del proveedor (red, API) se propagan tal cual; no se reintentan.
    throw error;
  }

  const first = nutritionEstimateSchema.safeParse(raw);
  if (first.success) return first.data;

  // Un único reintento estructurado.
  let second: unknown;
  try {
    second = await fn();
  } catch (error) {
    throw error;
  }

  const retry = nutritionEstimateSchema.safeParse(second);
  if (retry.success) return retry.data;

  throw new EstimateValidationError();
}
