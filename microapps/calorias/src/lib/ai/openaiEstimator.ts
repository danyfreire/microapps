import type { NutritionEstimate } from "@/domain/schemas";
import type { NutritionEstimator } from "./provider";

/**
 * Proveedor real (OpenAI, chat + visión). Solo se instancia cuando
 * `AI_PROVIDER=openai` y `AI_API_KEY` están definidos (ver provider.ts).
 * No acopla a la UI ni al dominio: implementa la misma interfaz que el mock.
 */

const SYSTEM_PROMPT = [
  "Eres un asistente que estima el contenido nutricional de comidas descritas en lenguaje natural, en español y con foco en platos latinoamericanos y ecuatorianos.",
  "Reglas:",
  "- Responde EXCLUSIVAMENTE con un objeto JSON válido, sin markdown ni texto adicional.",
  "- Usa exactamente estos campos: dish (string), estimatedCalories (número), calorieRange (opcional, objeto {min, max}), proteinGrams, carbsGrams, fatGrams (números), confidence (\"low\"|\"medium\"|\"high\"), assumptions (array de strings).",
  "- Asume porciones comunes cuando falte información y declara esos supuestos en assumptions.",
  "- Cuando la incertidumbre sea alta, usa confidence \"low\" y agrega calorieRange.",
  "- No finjas precisión: son estimaciones, no mediciones.",
  "- No des consejo médico ni dietas terapéuticas.",
  "- Prioriza nombres regionales conocidos.",
].join("\n");

export interface OpenAIEstimatorOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export class OpenAIEstimator implements NutritionEstimator {
  readonly id = "openai" as const;

  constructor(private readonly options: OpenAIEstimatorOptions) {}

  async estimateFromText(input: string): Promise<NutritionEstimate> {
    const raw = await this.complete([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ]);
    return extractJson(raw) as NutritionEstimate;
  }

  async estimateFromImage(image: Blob, context?: string): Promise<NutritionEstimate> {
    const dataUrl = await blobToDataUrl(image);
    const prompt = context
      ? `Contexto del usuario: ${context}\n\nEstima la comida que aparece en la imagen.`
      : "Estima la comida que aparece en la imagen.";
    const raw = await this.complete([
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ]);
    return extractJson(raw) as NutritionEstimate;
  }

  private async complete(messages: unknown[]): Promise<string> {
    const baseUrl = this.options.baseUrl ?? "https://api.openai.com/v1";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      body: JSON.stringify({
        model: this.options.model,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Proveedor de IA respondió ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("El proveedor de IA devolvió una respuesta vacía.");
    }
    return content;
  }
}

/** Extrae el primer objeto JSON de una respuesta (tolera fences de markdown). */
export function extractJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No se encontró JSON en la respuesta del proveedor.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const mime = blob.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}
