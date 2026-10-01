# PRD — Microapp de Calorías

**Nombre provisional:** Calo  
**Estado:** Draft v0.1  
**Fecha:** 2026-09-30  
**Producto:** Microapp web/PWA para registro rápido de calorías  
**Repositorio:** `danyfreire/microapps`  
**Ruta:** `apps/calorias/`

## 1. Resumen

Calo es una microapp para registrar comidas y estimar calorías/macronutrientes con la menor fricción posible.

La propuesta central es deliberadamente simple:

> Abrir → decir, escribir o fotografiar lo que comiste → ver una estimación → agregar al día.

El usuario no debe crear una cuenta, entregar una tarjeta ni completar un onboarding largo antes de probar el valor principal.

La experiencia nace de un problema observado: varias apps de calorías piden al usuario datos personales y tiempo antes de revelar que ciertas funciones requieren pago. Calo convierte esa frustración en una promesa explícita de producto: **sin paywall sorpresa**.

## 2. Problema

Las apps tradicionales de nutrición suelen tener una o varias de estas fricciones:

- onboarding largo antes de entregar valor;
- creación obligatoria de cuenta;
- pago o prueba revelados tarde;
- bases de alimentos difíciles de usar;
- UX centrada en alimentos de EE. UU.;
- demasiadas funciones para quien solo quiere saber cuánto está comiendo;
- registro manual repetitivo.

Para un usuario casual, el problema principal no es “gestionar nutrición avanzada”, sino registrar comidas rápidamente y entender su consumo aproximado del día.

## 3. Usuario objetivo

### Primario

Adultos hispanohablantes que quieren llevar un control simple de calorías sin convertirlo en un proyecto personal complejo.

Características frecuentes:

- quieren empezar inmediatamente;
- no desean ingresar tarjeta para probar;
- comen platos preparados y comida local;
- prefieren escribir o hablar naturalmente;
- aceptan una estimación razonable si se comunica que no es una medición exacta.

### Usuario inicial de validación

Persona que actualmente busca una app para contar calorías y abandona cuando descubre un cobro después del onboarding.

## 4. Jobs To Be Done

### JTBD principal

“Cuando termino de comer, quiero registrar rápidamente lo que comí y saber aproximadamente cuántas calorías llevo hoy, sin buscar ingrediente por ingrediente.”

### JTBD secundarios

- “Quiero ver si estoy cerca de mi objetivo diario.”
- “Quiero registrar comida local usando palabras normales.”
- “Quiero corregir fácilmente una estimación si la porción fue diferente.”
- “Quiero usar la app antes de decidir si vale la pena pagar por extras.”

## 5. Propuesta de valor

### Promesa

**Cuenta tus calorías sin tarjeta, sin registro obligatorio y sin paywall sorpresa.**

### Diferenciadores iniciales

1. Valor antes del registro.
2. Lenguaje natural en español.
3. Buen soporte para platos latinoamericanos y ecuatorianos.
4. Registro de comida en segundos.
5. Modelo gratuito útil por sí mismo.
6. Monetización transparente y opcional.

### Principio de gamificación

Calo puede usar gamificación ligera para mejorar recurrencia, pero debe premiar **el hábito de registrar**, no clasificar moralmente la comida.

Reglas:

- celebrar consistencia, regreso y registro diario;
- no etiquetar alimentos como “buenos” o “malos”;
- no castigar visualmente exceder una meta;
- no usar culpa, vergüenza ni mensajes punitivos por romper una racha;
- una futura mascota/personaje debe reflejar acompañamiento y constancia, no juzgar lo que el usuario comió.

## 6. Objetivos del MVP

El MVP debe validar si una experiencia extremadamente simple genera uso repetido.

Objetivos:

- permitir registrar una comida en menos de 20 segundos;
- ofrecer entrada por texto desde la primera versión;
- permitir foto si el costo/precisión lo permite;
- mostrar calorías y macros estimados;
- llevar el total del día;
- funcionar sin crear cuenta;
- persistir el día localmente en el dispositivo;
- ser instalable como PWA;
- estar desplegado en Vercel;
- medir activación y recurrencia sin recopilar datos sensibles innecesarios.

## 7. No objetivos del MVP

No construir inicialmente:

- planes nutricionales clínicos;
- recomendaciones médicas;
- diagnóstico;
- integración con wearables;
- recetas completas;
- comunidad;
- gamificación compleja;
- coaching;
- catálogo manual gigante de alimentos;
- sincronización multi-dispositivo;
- CRM;
- marketplace;
- conteo de micronutrientes avanzado;
- dietas terapéuticas;
- suscripción obligatoria.

## 8. Flujos principales

### 8.1 Primera visita

1. Usuario abre la app.
2. Ve inmediatamente “¿Qué comiste?”
3. Puede escribir o usar foto.
4. Obtiene estimación.
5. Puede editar cantidad o resultado.
6. Toca “Agregar a mi día”.
7. Ve su total diario.
8. Solo después de haber recibido valor puede configurar un objetivo opcional.

### 8.2 Registro por texto

Ejemplos de entradas:

- “Arroz con menestra, carne y 3 patacones.”
- “Un bolón mixto y café con leche.”
- “Dos panes de yuca.”
- “Un encebollado grande.”

Salida mínima:

- kcal estimadas;
- proteína;
- carbohidratos;
- grasa;
- nivel de confianza;
- breve desglose opcional;
- botón “Agregar”.

### 8.3 Registro por foto

1. Usuario toma/sube foto.
2. Sistema detecta componentes probables.
3. Presenta estimación editable.
4. Usuario confirma o corrige.
5. Agrega al día.

### 8.4 Objetivo diario

El usuario puede opcionalmente indicar un objetivo diario de kcal.

En MVP:

- no se calcula automáticamente a partir de peso/altura/sexo;
- no se exige onboarding de salud;
- el usuario puede ingresar su propio objetivo;
- se explica que es un valor personal configurable.

## 9. Requisitos funcionales

### FR-01 — Registro inmediato

La home debe permitir empezar sin autenticación.

### FR-02 — Entrada por texto

Aceptar lenguaje natural en español y devolver una estimación estructurada.

### FR-03 — Entrada por foto

Permitir subir/capturar una imagen desde móvil.

### FR-04 — Resultado editable

El usuario debe poder cambiar:

- descripción;
- cantidad/porción;
- kcal;
- macros.

### FR-05 — Diario

Mostrar entradas del día y total acumulado.

### FR-06 — Persistencia local

Guardar el diario en local storage o IndexedDB.

### FR-07 — Borrar datos

Permitir eliminar una comida, limpiar el día y borrar todos los datos locales.

### FR-08 — Objetivo opcional

Permitir guardar un objetivo de kcal local.

### FR-09 — PWA

La app debe ser instalable y funcionar correctamente en móvil.

### FR-10 — Transparencia

Si en el futuro existe Pro, el precio y sus limitaciones deben mostrarse antes de pedir tarjeta o iniciar cualquier prueba.

## 10. Estimación nutricional

Las cifras son estimaciones, no mediciones.

El motor debe devolver:

```json
{
  "dish": "Arroz con menestra, carne y patacones",
  "estimatedCalories": 780,
  "proteinGrams": 35,
  "carbsGrams": 95,
  "fatGrams": 28,
  "confidence": "medium",
  "assumptions": [
    "1 taza de arroz cocido",
    "3/4 taza de menestra",
    "150 g de carne",
    "3 patacones"
  ]
}
```

Principios:

- preferir rangos cuando la incertidumbre sea alta;
- exponer supuestos;
- permitir corrección;
- no presentar la estimación como exacta;
- evitar recomendaciones médicas.

## 11. Seguridad y límites

Calo es una herramienta de registro general y no un dispositivo médico.

Debe incluir mensajes claros:

- las calorías son estimadas;
- la foto no permite conocer con exactitud ingredientes ni cantidades;
- no sustituye asesoría profesional;
- no generar recomendaciones clínicas;
- no promover restricciones extremas.

Si una solicitud exige consejo médico o manejo de una condición, la app debe mostrar una respuesta neutral indicando que esa función no forma parte del producto.

## 12. Monetización — hipótesis, no requisito de MVP

El tracking básico debe seguir siendo útil gratis.

Posibles funciones Pro futuras:

- análisis de foto con mayor límite;
- historial largo;
- tendencias semanales/mensuales;
- favoritos;
- plantillas de comidas frecuentes;
- exportación;
- sincronización;
- análisis nutricional más detallado.

Modelos a probar:

1. compra de créditos para análisis de foto;
2. pago único;
3. Pro mensual/anual;
4. combinación de gratuito + créditos.

### Regla de producto

**Nunca ocultar un cobro hasta después de que el usuario haya completado un onboarding.**

## 13. Métricas de producto

### North Star inicial

**Comidas registradas por usuario activo por semana.**

### Activación

Usuario que:

1. abre la app;
2. obtiene una estimación;
3. agrega al menos una comida al diario.

### Métricas MVP

- % visita → primera estimación;
- % estimación → agregado al diario;
- tiempo hasta primera comida registrada;
- comidas por usuario/día;
- retorno D1;
- retorno D7;
- uso texto vs foto;
- % de estimaciones editadas;
- costo IA por comida;
- errores de estimación reportados.

## 14. Criterios de éxito de validación

La primera versión se considera prometedora si, durante una prueba pequeña:

- usuarios entienden la app sin explicación;
- la mayoría logra registrar su primera comida;
- el tiempo a valor es menor a 1 minuto;
- algunos usuarios regresan voluntariamente al día siguiente;
- las personas describen platos normalmente en vez de adaptar su lenguaje a la app;
- el costo de inferencia permite un modelo gratuito sostenible.

No se definirá pricing final hasta observar uso real.

## 15. Analítica y privacidad

Recolectar el mínimo posible.

Eventos permitidos:

- session_started;
- estimation_requested;
- estimation_completed;
- meal_added;
- meal_edited;
- meal_deleted;
- photo_used;
- goal_set;
- install_prompt_accepted.

Evitar enviar a analítica:

- texto completo de comidas, salvo consentimiento explícito;
- imágenes;
- datos personales;
- objetivos individuales.

## 16. Roadmap

### Fase 0 — Validación

- prototipo navegable;
- prueba con 3–5 personas;
- registrar fricciones;
- validar lenguaje y propuesta.

### Fase 1 — MVP

- PWA;
- texto;
- diario;
- kcal + macros;
- objetivo opcional;
- persistencia local;
- deploy Vercel.

### Fase 1.1 — Retención ligera

- racha diaria de registro no punitiva;
- mensajes positivos por consistencia;
- pequeños hitos y progreso visual;
- estado motivacional local, sin IA ni backend obligatorio.

### Fase 1.2 — Entrada visual y conveniencia

- foto;
- estimación visual;
- correcciones de porción;
- platos frecuentes.

### Fase 2

Solo si hay recurrencia:

- cuenta opcional;
- sincronización;
- historial extendido;
- Pro/créditos.

## 17. Preguntas abiertas

- Nombre final del producto.
- Motor IA inicial.
- Precisión/costo de foto.
- Si el registro por voz aporta suficiente valor para V1.
- Qué funciones justifican pago sin degradar el core gratuito.
- Qué tanto valoran los usuarios un catálogo local curado vs estimación IA.

## 18. Principio rector

> **La primera interacción debe demostrar valor, no pedir compromiso.**
