# Calo

Microapp web/PWA para registrar comidas y estimar calorías y macronutrientes con la menor fricción posible.

> **Cuenta tus calorías sin tarjeta, sin registro obligatorio y sin paywall sorpresa.**

Flujo principal: **abrir → escribir qué comiste → estimar → revisar/editar → agregar a mi día → ver el total diario.**

## Estado

Fase 1 (MVP). Texto → estimación, diario local, kcal + macros, objetivo opcional, PWA instalable. La estimación por foto está preparada a nivel de interfaz y API pero **no bloquea esta entrega** (ver *Estimación por foto*).

## Principios

- Valor inmediato: la pantalla inicial ya es la herramienta.
- Local-first: diario en IndexedDB, ajustes en localStorage. Sin cuenta, sin email, sin registro.
- Sin onboarding obligatorio y sin recomendaciones médicas.
- Las calorías son **estimaciones**, no mediciones; se muestra la incertidumbre (confianza + rango + supuestos).
- IA detrás de una interfaz desacoplada, con salida validada con Zod.

## Stack

- Next.js (App Router) + TypeScript + React
- Tailwind CSS v4
- Zod (schemas y validación)
- PWA (manifest + service worker)
- Vitest + fake-indexeddb (tests)
- Persistencia: IndexedDB (diario) y localStorage (ajustes)

## Requisitos

- Node.js 18.18+ (probado con Node 26)
- npm

## Primeros pasos

```bash
npm install
npm run dev        # http://localhost:3000
```

Sin configuración adicional, la app funciona con un **estimador mock/dev** (claramente identificado en la UI como "Estimación de desarrollo (sin IA)").

## Variables de entorno

Copia `.env.example` a `.env.local` y configura según tu proveedor:

| Variable            | Descripción                                                      | Default      |
| ------------------- | ---------------------------------------------------------------- | ------------ |
| `AI_PROVIDER`       | Proveedor de IA. Vacío (mock/dev) o `openai`.                    | *(vacío)*    |
| `AI_API_KEY`        | Clave del proveedor. Si está vacía, se usa el estimador mock.    | *(vacío)*    |
| `AI_MODEL`          | Modelo del proveedor (solo OpenAI).                              | `gpt-4o-mini` |
| `ANALYTICS_ENABLED` | Analítica. Deshabilitada por defecto; nunca envía texto/fotos.   | `false`      |

Las claves **no** deben usar el prefijo `NEXT_PUBLIC_*` (quedarían expuestas al cliente).

### Estimador mock/dev vs proveedor real

- Sin `AI_API_KEY`: se usa `MockEstimator`, un estimador de desarrollo basado en una tabla curativa de platos comunes (con foco ecuatoriano/latinoamericano) y heurísticas de texto. Sirve para probar el flujo completo del MVP sin costo ni configuración.
- Con `AI_PROVIDER=openai` + `AI_API_KEY`: se usa `OpenAIEstimator` (chat + visión), que implementa la misma interfaz `NutritionEstimator`. Para cambiar de proveedor solo hay que añadir una nueva implementación de esa interfaz y registrarla en `src/lib/ai/provider.ts`.

## Scripts

```bash
npm run dev              # servidor de desarrollo
npm run build            # build de producción
npm run start            # servir el build
npm run lint             # ESLint
npm run typecheck        # TypeScript (tsc --noEmit)
npm run test             # Vitest (una sola vez)
npm run test:watch       # Vitest en modo watch
npm run generate:icons   # regenera los iconos PNG de la PWA
```

## Arquitectura

```
Browser / PWA
   │
   │-- Diario + ajustes locales (IndexedDB + localStorage)
   │
   +--> /api/estimate/text
   |       +--> NutritionEstimator (interfaz)
   |             +--> MockEstimator   (dev, sin API key)
   |             +--> OpenAIEstimator (real, con API key)
   |
   +--> /api/estimate/image   (preparado; requiere proveedor con visión)
```

- `src/domain/` — modelos y schemas Zod (`Meal`, `NutritionEstimate`, `DailySettings`) y cálculos (`sumMeals`, `localDayKey`).
- `src/lib/ai/` — interfaz del estimador, proveedores y validación con reintento (`estimator.ts`).
- `src/lib/storage.ts` — persistencia local (IndexedDB + localStorage).
- `src/components/` — UI (composer, panel de estimación, progreso diario, lista, navegación).
- `src/app/` — rutas (home, ajustes) y Route Handlers (`/api/estimate/*`).

## Flujo de estimación

1. El usuario escribe qué comió y toca **Estimar**.
2. `POST /api/estimate/text` llama al `NutritionEstimator`.
3. La respuesta se **valida con Zod**; si falla, se reintenta una sola vez; si vuelve a fallar, se muestra un error recuperable (nunca se inventan valores en el frontend).
4. El usuario revisa la estimación (kcal, proteína, carbohidratos, grasa, confianza, supuestos), puede **editarla** y toca **Agregar a mi día**.
5. La comida se guarda en IndexedDB y el total diario se actualiza.

## Estimación por foto (pendiente, no bloqueante)

- `POST /api/estimate/image` existe y valida multipart/form-data (máx. 5 MB).
- Con el proveedor mock responde `501` con un mensaje claro; con OpenAI, usaría visión.
- La UI muestra el botón de foto y un aviso "próximamente". No guarda imágenes en el servidor.

## Privacidad

- Diario y objetivo se guardan solo en el dispositivo.
- Sin cuenta, sin email, sin identidad en los requests.
- Las imágenes no se persisten en el servidor.
- La analítica está deshabilitada por defecto y nunca envía texto de comidas ni fotos.

## Roadmap (ver PRD.md)

- Fase 1.1: estimación por foto (visión), correcciones de porción, platos frecuentes.
- Fase 2: cuenta opcional, sincronización, historial extendido, Pro/créditos.

## Documentos

- [PRD.md](./PRD.md)
- [DESIGN.md](./DESIGN.md)
