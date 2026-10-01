import type { NutritionEstimate, ProviderId } from "@/domain/schemas";
import { MockEstimator } from "./mockEstimator";
import { OpenAIEstimator } from "./openaiEstimator";

/**
 * Interfaz desacoplada del proveedor de IA (Decisión C del DESIGN).
 * La UI y el dominio nunca dependen de un proveedor concreto.
 */
export interface NutritionEstimator {
  readonly id: ProviderId;
  estimateFromText(input: string): Promise<NutritionEstimate>;
  estimateFromImage(image: Blob, context?: string): Promise<NutritionEstimate>;
}

/**
 * Selecciona el proveedor según las variables de entorno (solo servidor).
 *
 * - `AI_PROVIDER=openai` + `AI_API_KEY` -> proveedor real (OpenAI).
 * - Cualquier otra combinación -> `MockEstimator` (dev, claramente identificado).
 *
 * El mock nunca bloquea el MVP: funciona sin API key.
 */
export function getEstimator(): NutritionEstimator {
  const provider = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
  const apiKey = (process.env.AI_API_KEY ?? "").trim();

  if (provider === "openai" && apiKey) {
    return new OpenAIEstimator({
      apiKey,
      model: process.env.AI_MODEL || "gpt-4o-mini",
    });
  }

  return new MockEstimator();
}

export function isMockActive(): boolean {
  const provider = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
  const apiKey = (process.env.AI_API_KEY ?? "").trim();
  return !(provider === "openai" && apiKey);
}
