import { z } from "zod";

export const CONFIDENCE_VALUES = ["low", "medium", "high"] as const;
export const SOURCE_VALUES = ["text", "image", "manual"] as const;

export const confidenceSchema = z.enum(CONFIDENCE_VALUES);
export const sourceSchema = z.enum(SOURCE_VALUES);

export type Confidence = z.infer<typeof confidenceSchema>;
export type Source = z.infer<typeof sourceSchema>;

/**
 * Resultado de una estimación nutricional. Siempre se valida con Zod antes
 * de aceptarlo (ver src/lib/ai/estimator.ts).
 */
export const nutritionEstimateSchema = z.object({
  dish: z.string().trim().min(1, "Falta la descripción").max(200),
  estimatedCalories: z.number().int().min(0).max(20000),
  calorieRange: z
    .object({
      min: z.number().int().min(0),
      max: z.number().int().min(0),
    })
    .optional(),
  proteinGrams: z.number().min(0).max(1000),
  carbsGrams: z.number().min(0).max(2000),
  fatGrams: z.number().min(0).max(1000),
  confidence: confidenceSchema,
  assumptions: z.array(z.string().trim().max(200)).max(20),
});

export type NutritionEstimate = z.infer<typeof nutritionEstimateSchema>;

/** Comida guardada en el diario local. */
export const mealSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  label: z.string().trim().min(1, "Falta la descripción").max(200),
  calories: z.number().int().min(0).max(20000),
  proteinGrams: z.number().min(0).max(1000),
  carbsGrams: z.number().min(0).max(2000),
  fatGrams: z.number().min(0).max(1000),
  source: sourceSchema,
  confidence: confidenceSchema.optional(),
  assumptions: z.array(z.string()).max(20).optional(),
});

export type Meal = z.infer<typeof mealSchema>;

/** Ajustes simples persistidos en localStorage. */
export const dailySettingsSchema = z.object({
  calorieGoal: z.number().int().min(0).max(20000).optional(),
});

export type DailySettings = z.infer<typeof dailySettingsSchema>;

export const estimateTextRequestSchema = z.object({
  text: z.string().trim().min(1, "Texto vacío").max(1000),
});

export const providerIdSchema = z.enum(["mock", "openai"]);
export type ProviderId = z.infer<typeof providerIdSchema>;

export const estimateTextResponseSchema = z.object({
  estimate: nutritionEstimateSchema,
  provider: providerIdSchema,
});
