import type { Confidence } from "@/domain/schemas";

export function formatNumber(n: number): string {
  // Separador de miles fijo (español: punto) para evitar diferencias de ICU.
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatKcal(n: number): string {
  return `${formatNumber(n)} kcal`;
}

export function formatGrams(n: number): string {
  return `${formatNumber(n)} g`;
}

export function confidenceLabel(confidence: Confidence): string {
  switch (confidence) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "low":
      return "Baja";
  }
}
