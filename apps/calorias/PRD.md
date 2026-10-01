# PRD â€” Microapp de CalorÃ­as

**Nombre provisional:** Calo  
**Estado:** Draft v0.1  
**Fecha:** 2026-09-30  
**Producto:** Microapp web/PWA para registro rÃ¡pido de calorÃ­as  
**Repositorio:** `danyfreire/microapps`  
**Ruta:** `apps/calorias/`

## 1. Resumen

Calo es una microapp para registrar comidas y estimar calorÃ­as/macronutrientes con la menor fricciÃ³n posible.

La propuesta central es deliberadamente simple:

> Abrir â†’ decir, escribir o fotografiar lo que comiste â†’ ver una estimaciÃ³n â†’ agregar al dÃ­a.

El usuario no debe crear una cuenta, entregar una tarjeta ni completar un onboarding largo antes de probar el valor principal.

La experiencia nace de un problema observado: varias apps de calorÃ­as piden al usuario datos personales y tiempo antes de revelar que ciertas funciones requieren pago. Calo convierte esa frustraciÃ³n en una promesa explÃ­cita de producto: **sin paywall sorpresa**.

## 2. Problema

Las apps tradicionales de nutriciÃ³n suelen tener una o varias de estas fricciones:

- onboarding largo antes de entregar valor;
- creaciÃ³n obligatoria de cuenta;
- pago o prueba revelados tarde;
- bases de alimentos difÃ­ciles de usar;
- UX centrada en alimentos de EE. UU.;
- demasiadas funciones para quien solo quiere saber cuÃ¡nto estÃ¡ comiendo;
- registro manual repetitivo.

Para un usuario casual, el problema principal no es â€œgestionar nutriciÃ³n avanzadaâ€, sino registrar comidas rÃ¡pidamente y entender su consumo aproximado del dÃ­a.

## 3. Usuario objetivo

### Primario

Adultos hispanohablantes que quieren llevar un control simple de calorÃ­as sin convertirlo en un proyecto personal complejo.

CaracterÃ­sticas frecuentes:

- quieren empezar inmediatamente;
- no desean ingresar tarjeta para probar;
- comen platos preparados y comida local;
- prefieren escribir o hablar naturalmente;
- aceptan una estimaciÃ³n razonable si se comunica que no es una mediciÃ³n exacta.

### Usuario inicial de validaciÃ³n

Persona que actualmente busca una app para contar calorÃ­as y abandona cuando descubre un cobro despuÃ©s del onboarding.

## 4. Jobs To Be Done

### JTBD principal

â€œCuando termino de comer, quiero registrar rÃ¡pidamente lo que comÃ­ y saber aproximadamente cuÃ¡ntas calorÃ­as llevo hoy, sin buscar ingrediente por ingrediente.â€

### JTBD secundarios

- â€œQuiero ver si estoy cerca de mi objetivo diario.â€
- â€œQuiero registrar comida local usando palabras normales.â€
- â€œQuiero corregir fÃ¡cilmente una estimaciÃ³n si la porciÃ³n fue diferente.â€
- â€œQuiero usar la app antes de decidir si vale la pena pagar por extras.â€

## 5. Propuesta de valor

### Promesa

**Cuenta tus calorÃ­as sin tarjeta, sin registro obligatorio y sin paywall sorpresa.**

### Diferenciadores iniciales

1. Valor antes del registro.
2. Lenguaje natural en espaÃ±ol.
3. Buen soporte para platos latinoamericanos y ecuatorianos.
4. Registro de comida en segundos.
5. Modelo gratuito Ãºtil por sÃ­ mismo.
6. MonetizaciÃ³n transparente y opcional.

## 6. Objetivos del MVP

El MVP debe validar si una experiencia extremadamente simple genera uso repetido.

Objetivos:

- permitir registrar una comida en menos de 20 segundos;
- ofrecer entrada por texto desde la primera versiÃ³n;
- permitir foto si el costo/precisiÃ³n lo permite;
- mostrar calorÃ­as y macros estimados;
- llevar el total del dÃ­a;
- funcionar sin crear cuenta;
- persistir el dÃ­a localmente en el dispositivo;
- ser instalable como PWA;
- estar desplegado en Vercel;
- medir activaciÃ³n y recurrencia sin recopilar datos sensibles innecesarios.

## 7. No objetivos del MVP

No construir inicialmente:

- planes nutricionales clÃ­nicos;
- recomendaciones mÃ©dicas;
- diagnÃ³stico;
- integraciÃ³n con wearables;
- recetas completas;
- comunidad;
- gamificaciÃ³n compleja;
- coaching;
- catÃ¡logo manual gigante de alimentos;
- sincronizaciÃ³n multi-dispositivo;
- CRM;
- marketplace;
- conteo de micronutrientes avanzado;
- dietas terapÃ©uticas;
- suscripciÃ³n obligatoria.

## 8. Flujos principales

### 8.1 Primera visita

1. Usuario abre la app.
2. Ve inmediatamente â€œÂ¿QuÃ© comiste?â€
3. Puede escribir o usar foto.
4. Obtiene estimaciÃ³n.
5. Puede editar cantidad o resultado.
6. Toca â€œAgregar a mi dÃ­aâ€.
7. Ve su total diario.
8. Solo despuÃ©s de haber recibido valor puede configurar un objetivo opcional.

### 8.2 Registro por texto

Ejemplos de entradas:

- â€œArroz con menestra, carne y 3 patacones.â€
- â€œUn bolÃ³n mixto y cafÃ© con leche.â€
- â€œDos panes de yuca.â€
- â€œUn encebollado grande.â€

Salida mÃ­nima:

- kcal estimadas;
- proteÃ­na;
- carbohidratos;
- grasa;
- nivel de confianza;
- breve desglose opcional;
- botÃ³n â€œAgregarâ€.

### 8.3 Registro por foto

1. Usuario toma/sube foto.
2. Sistema detecta componentes probables.
3. Presenta estimaciÃ³n editable.
4. Usuario confirma o corrige.
5. Agrega al dÃ­a.

### 8.4 Objetivo diario

El usuario puede opcionalmente indicar un objetivo diario de kcal.

En MVP:

- no se calcula automÃ¡ticamente a partir de peso/altura/sexo;
- no se exige onboarding de salud;
- el usuario puede ingresar su propio objetivo;
- se explica que es un valor personal configurable.

## 9. Requisitos funcionales

### FR-01 â€” Registro inmediato

La home debe permitir empezar sin autenticaciÃ³n.

### FR-02 â€” Entrada por texto

Aceptar lenguaje natural en espaÃ±ol y devolver una estimaciÃ³n estructurada.

### FR-03 â€” Entrada por foto

Permitir subir/capturar una imagen desde mÃ³vil.

### FR-04 â€” Resultado editable

El usuario debe poder cambiar:

- descripciÃ³n;
- cantidad/porciÃ³n;
- kcal;
- macros.

### FR-05 â€” Diario

Mostrar entradas del dÃ­a y total acumulado.

### FR-06 â€” Persistencia local

Guardar el diario en local storage o IndexedDB.

### FR-07 â€” Borrar datos

Permitir eliminar una comida, limpiar el dÃ­a y borrar todos los datos locales.

### FR-08 â€” Objetivo opcional

Permitir guardar un objetivo de kcal local.

### FR-09 â€” PWA

La app debe ser instalable y funcionar correctamente en mÃ³vil.

### FR-10 â€” Transparencia

Si en el futuro existe Pro, el precio y sus limitaciones deben mostrarse antes de pedir tarjeta o iniciar cualquier prueba.

## 10. EstimaciÃ³n nutricional

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
- permitir correcciÃ³n;
- no presentar la estimaciÃ³n como exacta;
- evitar recomendaciones mÃ©dicas.

## 11. Seguridad y lÃ­mites

Calo es una herramienta de registro general y no un dispositivo mÃ©dico.

Debe incluir mensajes claros:

- las calorÃ­as son estimadas;
- la foto no permite conocer con exactitud ingredientes ni cantidades;
- no sustituye asesorÃ­a profesional;
- no generar recomendaciones clÃ­nicas;
- no promover restricciones extremas.

Si una solicitud exige consejo mÃ©dico o manejo de una condiciÃ³n, la app debe mostrar una respuesta neutral indicando que esa funciÃ³n no forma parte del producto.

## 12. MonetizaciÃ³n â€” hipÃ³tesis, no requisito de MVP

El tracking bÃ¡sico debe seguir siendo Ãºtil gratis.

Posibles funciones Pro futuras:

- anÃ¡lisis de foto con mayor lÃ­mite;
- historial largo;
- tendencias semanales/mensuales;
- favoritos;
- plantillas de comidas frecuentes;
- exportaciÃ³n;
- sincronizaciÃ³n;
- anÃ¡lisis nutricional mÃ¡s detallado.

Modelos a probar:

1. compra de crÃ©ditos para anÃ¡lisis de foto;
2. pago Ãºnico;
3. Pro mensual/anual;
4. combinaciÃ³n de gratuito + crÃ©ditos.

### Regla de producto

**Nunca ocultar un cobro hasta despuÃ©s de que el usuario haya completado un onboarding.**

## 13. MÃ©tricas de producto

### North Star inicial

**Comidas registradas por usuario activo por semana.**

### ActivaciÃ³n

Usuario que:

1. abre la app;
2. obtiene una estimaciÃ³n;
3. agrega al menos una comida al diario.

### MÃ©tricas MVP

- % visita â†’ primera estimaciÃ³n;
- % estimaciÃ³n â†’ agregado al diario;
- tiempo hasta primera comida registrada;
- comidas por usuario/dÃ­a;
- retorno D1;
- retorno D7;
- uso texto vs foto;
- % de estimaciones editadas;
- costo IA por comida;
- errores de estimaciÃ³n reportados.

## 14. Criterios de Ã©xito de validaciÃ³n

La primera versiÃ³n se considera prometedora si, durante una prueba pequeÃ±a:

- usuarios entienden la app sin explicaciÃ³n;
- la mayorÃ­a logra registrar su primera comida;
- el tiempo a valor es menor a 1 minuto;
- algunos usuarios regresan voluntariamente al dÃ­a siguiente;
- las personas describen platos normalmente en vez de adaptar su lenguaje a la app;
- el costo de inferencia permite un modelo gratuito sostenible.

No se definirÃ¡ pricing final hasta observar uso real.

## 15. AnalÃ­tica y privacidad

Recolectar el mÃ­nimo posible.

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

Evitar enviar a analÃ­tica:

- texto completo de comidas, salvo consentimiento explÃ­cito;
- imÃ¡genes;
- datos personales;
- objetivos individuales.

## 16. Roadmap

### Fase 0 â€” ValidaciÃ³n

- prototipo navegable;
- prueba con 3â€“5 personas;
- registrar fricciones;
- validar lenguaje y propuesta.

### Fase 1 â€” MVP

- PWA;
- texto;
- diario;
- kcal + macros;
- objetivo opcional;
- persistencia local;
- deploy Vercel.

### Fase 1.1

- foto;
- estimaciÃ³n visual;
- correcciones de porciÃ³n;
- platos frecuentes.

### Fase 2

Solo si hay recurrencia:

- cuenta opcional;
- sincronizaciÃ³n;
- historial extendido;
- Pro/crÃ©ditos.

## 17. Preguntas abiertas

- Nombre final del producto.
- Motor IA inicial.
- PrecisiÃ³n/costo de foto.
- Si el registro por voz aporta suficiente valor para V1.
- QuÃ© funciones justifican pago sin degradar el core gratuito.
- QuÃ© tanto valoran los usuarios un catÃ¡logo local curado vs estimaciÃ³n IA.

## 18. Principio rector

> **La primera interacciÃ³n debe demostrar valor, no pedir compromiso.**


