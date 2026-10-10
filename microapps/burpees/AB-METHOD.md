# Experimento B — Proceso guiado por Superpowers

**Base:** main @ `062482d210aa6fb0c6a3c377c49bcfff639dc64e`. **Ámbito:** mismo módulo y mismas restricciones que A.

Proceso observado en esta conversación:
1. Delimitar contrato, reglas y pruebas de aceptación.
2. Red: escribir pruebas antes del módulo, ejecutar `node --test` y observar error por `MODULE_NOT_FOUND` (exit 1).
3. Green: crear implementación mínima, volver a ejecutar: **8/8** tests (exit 0).
4. Verificación adicional común: **12/12** pruebas (exit 0).
5. Revisión de límites, fechas, duplicados, empates y no mutación de entradas.

No se instalaron dependencias ni se tocaron documentos existentes.

**Limitación:** es una demostración del protocolo Superpowers guiada desde una sola conversación, no una competición entre dos sesiones de agentes aisladas. No inferir diferencias de costo o calidad causadas por la metodología.
