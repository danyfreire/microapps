/**
 * Analítica mínima y privacy-friendly.
 *
 * Deshabilitada por defecto (NEXT_PUBLIC_ANALYTICS_ENABLED !== "true").
 * Los eventos solo se registran cuando se habilita explícitamente, y NUNCA
 * incluyen texto de comidas, imágenes, objetivos ni datos personales.
 *
 * En el MVP no hay backend de analítica: esta función es un stub seguro.
 * Cuando exista un endpoint propio, se reemplaza el cuerpo de `send`.
 */

export type AnalyticsEvent =
  | "app_opened"
  | "estimate_started"
  | "estimate_succeeded"
  | "estimate_failed"
  | "meal_added"
  | "meal_edited"
  | "meal_deleted"
  | "photo_selected"
  | "goal_saved"
  | "pwa_installed";

export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number>,
): void {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
  send(event, props);
}

function send(event: AnalyticsEvent, props?: Record<string, string | number>): void {
  // Pendiente: envío a un endpoint propio. Nunca incluir texto de comidas ni imágenes.
  void event;
  void props;
}
