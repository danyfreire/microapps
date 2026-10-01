# DESIGN â€” Microapp de CalorÃ­as

**Nombre provisional:** Calo  
**VersiÃ³n:** 0.1  
**Fecha:** 2026-09-30  
**Objetivo tÃ©cnico:** MVP PWA desplegable en Vercel con arquitectura simple, barata y reemplazable.

## 1. Principios de diseÃ±o

1. **Valor inmediato.** La pantalla inicial ya es la herramienta.
2. **Una acciÃ³n primaria.** Registrar comida.
3. **Sin onboarding obligatorio.**
4. **Sin cuenta obligatoria.**
5. **Mobile-first.**
6. **Resultados editables.**
7. **La incertidumbre se muestra, no se oculta.**
8. **Nada de dark patterns de suscripciÃ³n.**
9. **Local-first en MVP.**
10. **IA detrÃ¡s de una interfaz desacoplada para poder cambiar proveedor.**

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

No persistir imÃ¡genes en servidor durante MVP.

## 4. Estructura del proyecto

```text
apps/calorias/
â”œâ”€â”€ PRD.md
â”œâ”€â”€ DESIGN.md
â”œâ”€â”€ README.md
â”œâ”€â”€ package.json
â”œâ”€â”€ next.config.ts
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ manifest.webmanifest
â”‚   â””â”€â”€ icons/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ diary/page.tsx
â”‚   â”‚   â”œâ”€â”€ settings/page.tsx
â”‚   â”‚   â””â”€â”€ api/
â”‚   â”‚       â””â”€â”€ estimate/
â”‚   â”‚           â”œâ”€â”€ text/route.ts
â”‚   â”‚           â””â”€â”€ image/route.ts
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ MealComposer.tsx
â”‚   â”‚   â”œâ”€â”€ EstimateCard.tsx
â”‚   â”‚   â”œâ”€â”€ DailyProgress.tsx
â”‚   â”‚   â”œâ”€â”€ MealList.tsx
â”‚   â”‚   â””â”€â”€ BottomNav.tsx
â”‚   â”œâ”€â”€ domain/
â”‚   â”‚   â”œâ”€â”€ meal.ts
â”‚   â”‚   â”œâ”€â”€ nutrition.ts
â”‚   â”‚   â””â”€â”€ schemas.ts
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ storage.ts
â”‚   â”‚   â”œâ”€â”€ analytics.ts
â”‚   â”‚   â””â”€â”€ ai/
â”‚   â”‚       â”œâ”€â”€ provider.ts
â”‚   â”‚       â””â”€â”€ estimator.ts
â”‚   â””â”€â”€ styles/
â””â”€â”€ .env.example
```

## 5. InformaciÃ³n arquitectÃ³nica

### DecisiÃ³n A â€” Local-first

RazÃ³n:

- cero fricciÃ³n de cuenta;
- privacidad;
- menor costo;
- velocidad;
- MVP mÃ¡s pequeÃ±o.

Consecuencia:

El usuario pierde el diario si limpia el navegador o cambia de equipo.

Esto es aceptable para validar el producto.

### DecisiÃ³n B â€” Sin catÃ¡logo nutricional propio en V1

RazÃ³n:

Construir y mantener una base exhaustiva no es el valor inicial.

El motor estima desde lenguaje natural y devuelve supuestos editables.

MÃ¡s adelante se puede aÃ±adir una capa de datos estructurados para alimentos recurrentes.

### DecisiÃ³n C â€” Adapter de IA

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
}
```

### DailySettings

```ts
type DailySettings = {
  calorieGoal?: number
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
- mÃ¡ximo inicial sugerido: 5 MB;
- normalizar tamaÃ±o del lado del cliente;
- no guardar archivo;
- borrar buffers al terminar request.

## 8. Prompting / contrato de estimaciÃ³n

El proveedor debe recibir instrucciones para:

- responder exclusivamente JSON validable;
- asumir porciones comunes cuando falte informaciÃ³n;
- declarar los supuestos;
- priorizar platos latinoamericanos;
- usar nombres conocidos regionalmente;
- no fingir precisiÃ³n;
- producir rangos cuando haya incertidumbre;
- no dar consejo mÃ©dico.

El resultado siempre se valida con Zod.

Si falla:

1. retry estructurado una sola vez;
2. si vuelve a fallar, mostrar error recuperable;
3. nunca inventar valores en frontend.

## 9. UX / Pantallas

### Pantalla 1 â€” Home / Hoy

Objetivo: registrar una comida.

Layout:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Calo                 Hoy   â”‚
â”‚                            â”‚
â”‚  1,240 / 2,000 kcal       â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘         â”‚
â”‚                            â”‚
â”‚  Â¿QuÃ© comiste?             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Ej: bolÃ³n mixto...   â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                            â”‚
â”‚  [ Estimar ]   [ ðŸ“· Foto ] â”‚
â”‚                            â”‚
â”‚  Comidas de hoy            â”‚
â”‚  â€¢ Desayuno      460 kcal  â”‚
â”‚  â€¢ Almuerzo      780 kcal  â”‚
â”‚                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

No modal inicial.
No onboarding.
No banner de compra.

### Pantalla 2 â€” Resultado

```text
Arroz con menestra y carne

â‰ˆ 780 kcal
650â€“900 kcal estimadas

35g proteÃ­na
95g carbohidratos
28g grasa

Supuse:
â€¢ 1 taza de arroz
â€¢ 150 g de carne
â€¢ 3 patacones

[ Editar ]  [ Agregar a mi dÃ­a ]
```

El rango debe ser visualmente secundario pero visible.

### Pantalla 3 â€” Editar

Campos simples:

- nombre;
- calorÃ­as;
- proteÃ­na;
- carbohidratos;
- grasa.

No obligar al usuario a editar ingredientes.

### Pantalla 4 â€” Ajustes

- objetivo kcal;
- borrar datos locales;
- privacidad;
- explicaciÃ³n de estimaciones;
- instalar app;
- versiÃ³n.

## 10. NavegaciÃ³n

MVP puede usar mÃ¡ximo tres destinos:

- Hoy
- Historial
- Ajustes

Si Historial no aporta valor en la primera iteraciÃ³n, omitirlo.

## 11. DiseÃ±o visual

DirecciÃ³n:

- limpia;
- amigable;
- no clÃ­nica;
- mucha jerarquÃ­a tipogrÃ¡fica;
- botones grandes;
- alto contraste;
- espacios generosos;
- una sola acciÃ³n principal por estado.

Evitar:

- dashboards cargados;
- medidores que castiguen al usuario;
- rojo agresivo por exceder objetivo;
- copy moralizante sobre comida;
- lenguaje â€œbueno/maloâ€;
- streaks punitivos.

## 12. Copy principal

Home:

> Â¿QuÃ© comiste?

Placeholder:

> Ej: arroz con menestra, carne y 3 patacones

Promesa corta:

> Cuenta tus calorÃ­as sin tarjeta ni registro.

Resultado:

> Esta es una estimaciÃ³n. Puedes corregirla antes de agregarla.

## 13. Estados UX

### Loading

> Estimando tu comidaâ€¦

No usar loaders largos con textos falsos de â€œanalizando nutrientesâ€.

### Baja confianza

> La porciÃ³n no estÃ¡ clara. Te muestro un rango para que puedas ajustarlo.

### Error

> No pude estimarlo bien. Intenta describir la porciÃ³n o escribe los componentes principales.

### Offline

El diario debe seguir disponible.

Las nuevas estimaciones IA requieren conexiÃ³n.

## 14. Privacidad

### MVP

Por defecto:

- diario local;
- objetivo local;
- imÃ¡genes no persistidas;
- requests sin identidad;
- sin cuenta;
- sin email.

No loggear payloads nutricionales en producciÃ³n salvo debugging temporal y sanitizado.

## 15. AnalÃ­tica

Preferir analÃ­tica privacy-friendly.

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

No incluir descripciÃ³n de comida ni imagen como propiedad del evento.

## 16. Cost control

Cada estimaciÃ³n tiene un costo.

Controles:

- modelo econÃ³mico por defecto;
- compresiÃ³n/redimensionado de fotos;
- rate limiting por IP/device;
- cachÃ© opcional de consultas normalizadas frecuentes;
- lÃ­mites razonables si foto se vuelve costosa;
- observabilidad de costo por 100 comidas.

Meta arquitectÃ³nica:

> El costo de inferencia no puede definir la UX principal.

Si la foto es cara, texto permanece gratuito y foto puede usar crÃ©ditos.

## 17. Performance

Objetivos:

- LCP < 2.5 s en conexiÃ³n mÃ³vil razonable;
- interfaz usable antes de cargar componentes no crÃ­ticos;
- JS inicial pequeÃ±o;
- compresiÃ³n de imÃ¡genes en cliente;
- respuesta textual ideal < 4 s;
- skeleton de resultado no bloqueante.

## 18. Accesibilidad

- WCAG AA como objetivo;
- targets tÃ¡ctiles >= 44 px;
- labels accesibles;
- soporte teclado;
- no depender solo de color;
- texto escalable;
- input compatible con dictado del sistema operativo.

## 19. Vercel

ConfiguraciÃ³n objetivo:

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

MÃ­nimo:

- errores frontend;
- errores de API;
- latencia de estimaciones;
- tokens/costo por request;
- ratio success/failure;
- fotos vs texto.

## 22. Testing

### Unit

- schemas;
- cÃ¡lculos de totales;
- storage;
- formateo.

### Integration

- text estimator;
- parser/validation;
- manejo de errores.

### E2E

Ruta crÃ­tica:

1. abrir;
2. escribir comida;
3. estimar;
4. agregar;
5. comprobar total;
6. recargar;
7. comprobar persistencia.

## 23. Definition of Done â€” MVP

El MVP estÃ¡ listo para probar cuando:

- funciona en mÃ³vil y desktop;
- se puede usar sin cuenta;
- texto â†’ estimaciÃ³n funciona;
- usuario puede editar;
- usuario puede agregar/eliminar;
- total diario persiste;
- objetivo es opcional;
- existe aviso de estimaciÃ³n;
- PWA es instalable;
- deploy Vercel pasa;
- no hay secretos en cliente;
- analÃ­tica no captura texto/fotos;
- smoke test E2E pasa.

## 24. Siguiente decisiÃ³n

Antes de construir funciones avanzadas, probar la UX central con usuarios reales.

La pregunta que manda el roadmap es:

> **Â¿VolverÃ­an maÃ±ana a registrar otra comida?**

