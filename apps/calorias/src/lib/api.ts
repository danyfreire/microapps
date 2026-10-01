import type { NutritionEstimate, ProviderId } from "@/domain/schemas";

export interface EstimateTextResult {
  estimate: NutritionEstimate;
  provider: ProviderId;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Llama al endpoint de estimación por texto y tipa la respuesta. */
export async function estimateText(text: string): Promise<EstimateTextResult> {
  const res = await fetch("/api/estimate/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    estimate?: NutritionEstimate;
    provider?: ProviderId;
    error?: string;
  };

  if (!res.ok) {
    throw new ApiError(body.error ?? "No se pudo estimar la comida.", res.status);
  }
  return body as EstimateTextResult;
}
