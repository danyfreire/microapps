# DESIGN — Microapp de Calorías

**Nombre provisional:** Calo  
**Versión:** 0.1  
**Fecha:** 2026-09-30  
**Objetivo técnico:** MVP PWA desplegable en Vercel con arquitectura simple, barata y reemplazable.

## 1. Principios de diseño

1. **Valor inmediato.** La pantalla inicial ya es la herramienta.
2. **Una acción primaria.** Registrar comida.
3. **Sin onboarding obligatorio.**
4. **Sin cuenta obligatoria.**
5. **Mobile-first.**
6. **Resultados editables.**
7. **La incertidumbre se muestra, no se oculta.**
8. **Nada de dark patterns de suscripción.**
9. **Local-first en MVP.**
10. **IA detrás de una interfaz desacoplada para poder cambiar proveedor.**
11. **Gamificación no punitiva.** Premiar el hábito de registrar, nunca juzgar la comida.

## 2. Stack recomendado

### Frontend

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- PWA manifest + service worker
- Zod para schemas

### Backend

- Next.js Route Handlers / Vercel Functions
- AI provider adapter
- Sin base de datos en MVP si no es necesaria

### Persistencia

MVP:

- localStorage para settings simples;
- IndexedDB para diario y estructuras mayores si se requiere.

Futuro:

- Supabase/Postgres solo cuando exista necesidad de cuenta/sync.

### Deploy

- GitHub
- Vercel
- Root Directory: `apps/calorias`
- variables de entorno para proveedor de IA
- Preview Deployments por branch/PR

## 3. Arquitectura

```text
Browser / PWA
   |
   |-- Local diary + settings
   |
   +--> /api/estimate/text
   |       |
   |       +--> Nutrition Estimator interface
   |                 |
   |                 +--> AI provider
   |
   +--> /api/estimate/image
           |
           +--> Vision Estimator interface
                     |
                     +--> AI provider
```

No persistir imágenes en servidor durante MVP.

## 4. Estructura del proyecto

```text
apps/calorias/
├── PRD.md
├── DESIGN.md
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── public/
│   ├── manifest.webmanifest
│   └── icons/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── diary/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       └── estimate/
│   │           ├── text/route.ts
│   │           └── image/route.ts
│   ├── components/
│   │   ├── MealComposer.tsx
│   │   ├── EstimateCard.tsx
│   │   ├── DailyProgress.tsx
│   │   ├── MealList.tsx
│   │   └── BottomNav.tsx
│   ├── domain/
│   │   ├── meal.ts
│   │   ├── nutrition.ts
│   │   └── schemas.ts
│   ├── lib/
│   │   ├── storage.ts
│   │   ├── analytics.ts
│   │   └── ai/
│   │       ├── provider.ts
│   │       └── estimator.ts
│   └── styles/
└── .env.example
```

## 5. Información arquitectónica

### Decisión A — Local-first

Razón:

- cero fricción de cuenta;
- privacidad;
- menor costo;
- velocidad;
- MVP más pequeño.

Consecuencia:

El usuario pierde el diario si limpia el navegador o cambia de equipo.

Esto es aceptable para validar el producto.

### Decisión B — Catálogo mínimo + cálculo determinístico

V1 no necesita una base nutricional exhaustiva, pero sí un catálogo pequeño de alimentos frecuentes con equivalencias por porción.

El parser convierte lenguaje natural y medidas comunes en componentes estructurados. Ejemplo:

`1/3 taza de arroz + 1 taza de menestra + 100 g de pollo`

Cada componente contiene cantidad, unidad y valores nutricionales por unidad. Kcal y macros se calculan matemáticamente; no se pide al usuario que edite macros.

Si faltan cantidades, se proponen porciones comunes marcadas como asumidas. Una futura capa de IA puede ayudar a interpretar lenguaje libre o alimentos no reconocidos, sin convertirse obligatoriamente en la calculadora nutricional.

### Decisión C — Adapter de IA

No acoplar UI ni dominio a OpenAI/Gemini/otro.

Interfaz conceptual:

```ts
interface NutritionEstimator {
  estimateFromText(input: string): Promise<NutritionEstimate>
  estimateFromImage(image: Blob, context?: string): Promise<NutritionEstimate>
}
```

## 6. Modelo de datos

### Meal

```ts
type Meal = {
  id: string
  createdAt: string
  label: string
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  source: "text" | "image" | "manual"
  confidence?: "low" | "medium" | "high"
  assumptions?: string[]
  components?: NutritionComponent[]
}
```

### DailySettings

```ts
type DailySettings = {
  calorieGoal?: number
}
```

### NutritionComponent

```ts
type NutritionComponent = {
  id: string
  name: string
  quantity: number
  unitId: string
  unitOptions: Array<{
    id: string
    label: string
    caloriesPerUnit: number
    proteinGramsPerUnit: number
    carbsGramsPerUnit: number
    fatGramsPerUnit: number
  }>
  assumed: boolean
}
```

### NutritionEstimate

```ts
type NutritionEstimate = {
  dish: string
  estimatedCalories: number
  calorieRange?: {
    min: number
    max: number
  }
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  confidence: "low" | "medium" | "high"
  assumptions: string[]
  components?: NutritionComponent[]
}
```

## 7. API

### POST /api/estimate/text

Request:

```json
{
  "text": "arroz con menestra, carne y tres patacones"
}
```

Response:

```json
{
  "dish": "Arroz con menestra, carne y patacones",
  "estimatedCalories": 780,
  "calorieRange": {
    "min": 650,
    "max": 900
  },
  "proteinGrams": 35,
  "carbsGrams": 95,
  "fatGrams": 28,
  "confidence": "medium",
  "assumptions": [
    "1 taza de arroz",
    "3/4 taza de menestra",
    "150 g de carne",
    "3 patacones"
  ]
}
```

### POST /api/estimate/image

- multipart/form-data;
- máximo inicial sugerido: 5 MB;
- normalizar tamaño del lado del cliente;
- no guardar archivo;
- borrar buffers al terminar request.

## 8. Prompting / contrato de estimación

El proveedor debe recibir instrucciones para:

- responder exclusivamente JSON validable;
- asumir porciones comunes cuando falte información;
- declarar los supuestos;
- priorizar platos latinoamericanos;
- usar nombres conocidos regionalmente;
- no fingir precisión;
- producir rangos cuando haya incertidumbre;
- no dar consejo médico.

El resultado siempre se valida con Zod.

Si falla:

1. retry estructurado una sola vez;
2. si vuelve a fallar, mostrar error recuperable;
3. nunca inventar valores en frontend.

## 9. UX / Pantallas

### Pantalla 1 — Home / Hoy

Objetivo: registrar una comida.

Layout:

```text
┌────────────────────────────┐
│ Calo                 Hoy   │
│                            │
│  1,240 / 2,000 kcal       │
│  ███████████░░░░░         │
│                            │
│  ¿Qué comiste?             │
│  ┌──────────────────────┐  │
│  │ Ej: bolón mixto...   │  │
│  └──────────────────────┘  │
│                            │
│  [ Estimar ]   [ 📷 Foto ] │
│                            │
│  Comidas de hoy            │
│  • Desayuno      460 kcal  │
│  • Almuerzo      780 kcal  │
│                            │
└────────────────────────────┘
```

No modal inicial.
No onboarding.
No banner de compra.

### Pantalla 2 — Resultado

```text
Arroz con menestra y carne

≈ 780 kcal
650–900 kcal estimadas

35g proteína
95g carbohidratos
28g grasa

Supuse:
• 1 taza de arroz
• 150 g de carne
• 3 patacones

[ Editar ]  [ Agregar a mi día ]
```

El rango debe ser visualmente secundario pero visible.

### Pantalla 3 — Editar

Campos simples:

- nombre;
- calorías;
- proteína;
- carbohidratos;
- grasa.

No obligar al usuario a editar ingredientes.

### Pantalla 4 — Ajustes

- objetivo kcal;
- borrar datos locales;
- privacidad;
- explicación de estimaciones;
- instalar app;
- versión.

## 10. Navegación

MVP puede usar máximo tres destinos:

- Hoy
- Historial
- Ajustes

Si Historial no aporta valor en la primera iteración, omitirlo.

## 11. Diseño visual

Dirección:

- limpia;
- amigable;
- no clínica;
- mucha jerarquía tipográfica;
- botones grandes;
- alto contraste;
- espacios generosos;
- una sola acción principal por estado.

Evitar:

- dashboards cargados;
- medidores que castiguen al usuario;
- rojo agresivo por exceder objetivo;
- copy moralizante sobre comida;
- lenguaje “bueno/malo”;
- streaks punitivos.

### 11.1 Gamificación ligera — V1.1

Objetivo: aumentar retorno sin convertir la comida en un sistema de premio/castigo.

La gamificación debe basarse en **conductas de registro**, no en el tipo de alimento ni en “cumplir” calorías.

Ejemplos de estados:

```text
Sin registro hoy       → estado neutro
Primera comida         → “Ya empezaste tu registro de hoy.”
Día completado         → celebración ligera
3/7/14 días registrando → hito de constancia
```

Reglas UX:

- una racha rota no genera mensajes negativos;
- exceder el objetivo calórico no cambia la interfaz a rojo de alarma;
- no usar “comida buena”, “comida mala”, “pecado”, “fallaste” ni equivalentes;
- una futura mascota/personaje puede cambiar de expresión por la constancia de registro, nunca por lo saludable de una comida;
- esta capa debe funcionar localmente y no requerir IA para generar mensajes básicos.

## 12. Copy principal

Home:

> ¿Qué comiste?

Placeholder:

> Ej: arroz con menestra, carne y 3 patacones

Promesa corta:

> Cuenta tus calorías sin tarjeta ni registro.

Resultado:

> Esta es una estimación. Puedes corregirla antes de agregarla.

## 13. Estados UX

### Loading

> Estimando tu comida…

No usar loaders largos con textos falsos de “analizando nutrientes”.

### Baja confianza

> La porción no está clara. Te muestro un rango para que puedas ajustarlo.

### Error

> No pude estimarlo bien. Intenta describir la porción o escribe los componentes principales.

### Offline

El diario debe seguir disponible.

Las nuevas estimaciones IA requieren conexión.

## 14. Privacidad

### MVP

Por defecto:

- diario local;
- objetivo local;
- imágenes no persistidas;
- requests sin identidad;
- sin cuenta;
- sin email.

No loggear payloads nutricionales en producción salvo debugging temporal y sanitizado.

## 15. Analítica

Preferir analítica privacy-friendly.

Eventos:

```text
app_opened
estimate_started
estimate_succeeded
estimate_failed
meal_added
meal_edited
meal_deleted
photo_selected
goal_saved
pwa_installed
```

No incluir descripción de comida ni imagen como propiedad del evento.

## 16. Cost control

Cada estimación tiene un costo.

Controles:

- modelo económico por defecto;
- compresión/redimensionado de fotos;
- rate limiting por IP/device;
- caché opcional de consultas normalizadas frecuentes;
- límites razonables si foto se vuelve costosa;
- observabilidad de costo por 100 comidas.

Meta arquitectónica:

> El costo de inferencia no puede definir la UX principal.

Si la foto es cara, texto permanece gratuito y foto puede usar créditos.

## 17. Performance

Objetivos:

- LCP < 2.5 s en conexión móvil razonable;
- interfaz usable antes de cargar componentes no críticos;
- JS inicial pequeño;
- compresión de imágenes en cliente;
- respuesta textual ideal < 4 s;
- skeleton de resultado no bloqueante.

## 18. Accesibilidad

- WCAG AA como objetivo;
- targets táctiles >= 44 px;
- labels accesibles;
- soporte teclado;
- no depender solo de color;
- texto escalable;
- input compatible con dictado del sistema operativo.

## 19. Vercel

Configuración objetivo:

- Framework Preset: Next.js
- Root Directory: `apps/calorias`
- Node.js LTS soportado
- Production branch: `main`

Variables previstas:

```text
AI_PROVIDER=
AI_API_KEY=
ANALYTICS_ENABLED=false
```

No exponer claves en `NEXT_PUBLIC_*`.

## 20. Entornos

### Local

`.env.local`

### Preview

Vercel Preview Environment Variables.

### Production

Claves separadas cuando sea posible.

## 21. Observabilidad

Mínimo:

- errores frontend;
- errores de API;
- latencia de estimaciones;
- tokens/costo por request;
- ratio success/failure;
- fotos vs texto.

## 22. Testing

### Unit

- schemas;
- cálculos de totales;
- storage;
- formateo.

### Integration

- text estimator;
- parser/validation;
- manejo de errores.

### E2E

Ruta crítica:

1. abrir;
2. escribir comida;
3. estimar;
4. agregar;
5. comprobar total;
6. recargar;
7. comprobar persistencia.

## 23. Definition of Done — MVP

El MVP está listo para probar cuando:

- funciona en móvil y desktop;
- se puede usar sin cuenta;
- texto → estimación funciona;
- usuario puede editar;
- usuario puede agregar/eliminar;
- total diario persiste;
- objetivo es opcional;
- existe aviso de estimación;
- PWA es instalable;
- deploy Vercel pasa;
- no hay secretos en cliente;
- analítica no captura texto/fotos;
- smoke test E2E pasa.

## 24. Siguiente decisión

Antes de construir funciones avanzadas, probar la UX central con usuarios reales.

La pregunta que manda el roadmap es:

> **¿Volverían mañana a registrar otra comida?**
