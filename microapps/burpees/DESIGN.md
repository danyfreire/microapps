# DESIGN — Burpee League

## 1. Objetivo de diseño
Burpee League debe sentirse como una microapp rápida, competitiva y confiable.
La interfaz prioriza acción y contexto social, no análisis complejo.

Principios:
- mobile-first;
- tres destinos principales;
- registrar en segundos;
- mostrar siempre una consecuencia clara;
- no convertir validación en burocracia;
- distinguir progreso personal de logro Rx;
- español completo desde el primer release.

La identidad visual definitiva aún no está congelada.
Este documento sí congela arquitectura UX, jerarquía y copy funcional.

## 2. Navegación
Barra inferior:
- Inicio
- Ranking
- Perfil

No agregar tabs permanentes para:
- validaciones;
- notificaciones;
- compartir;
- registrar.

Esas acciones viven en Inicio, modales/hojas y estados contextuales.
## 3. Entrada por invitación
URL compartida a reto/grupo.

Antes de login mostrar:
- nombre del reto: Reto 10K;
- promesa: 10.000 burpees en 365 días;
- nombre del grupo;
- snapshot corto del ranking semanal;
- CTA: "UNIRME AL RETO".

Copy de apoyo:
"Empieza cuando quieras. Tienes 365 días desde tu primer registro."

Objetivo: entender producto antes de crear cuenta.

## 4. Onboarding
Paso 1: autenticación simple.
Paso 2: elegir @username.
Paso 3: confirmar unión al grupo/reto.
Paso 4: llevar directo a registrar primeros burpees.

No pedir datos fitness adicionales.

Antes del primer registro:
"Tu reto comienza con tu primer registro."
## 5. Home — jerarquía
Orden visual recomendado:

### Bloque Reto 10K
- Total grande: "4.850 / 10.000"
- barra de progreso;
- "Día 171 de 365";
- "4.620 Rx · 95% verificado".

### Bloque Esta semana
- puesto en grupo;
- rival inmediato;
- diferencia accionable.

Ejemplo:
"#2 en Los del Box"
"Carlos · 285 Rx"
"Tú · 240 Rx"
"46 Rx para tomar el #1"

### CTA principal
"REGISTRAR BURPEES"

### Contexto secundario
Solo uno o dos avisos relevantes:
- "120 sin verificar";
- "2 validaciones esperando".
## 6. Home — estados
### Nuevo
0 / 10.000.
No mostrar derrota ni puesto lejano.
CTA: "REGISTRAR MIS PRIMEROS BURPEES".

### Normal
Progreso + competencia + CTA.

### Pendiente
Mostrar cantidad sin verificar como contexto, sin alarmismo.

### Juez
Mostrar tarjeta breve de validación pendiente.

### Logro
Después de evento relevante, priorizar feedback:
"¡SUBISTE AL #2!" o milestone Rx.

El layout base debe permanecer estable; cambian módulos contextuales.

## 7. Registrar burpees
Abrir bottom sheet/modal, no nueva pantalla.

Título:
"¿Cuántos hiciste?"

Input numérico grande.
Controles rápidos:
-10, -1, +1, +10.

Mostrar fecha con opciones:
- Hoy
- Ayer

CTA dinámico:
"REGISTRAR 50"
## 8. Confirmación de registro
Después de guardar:
"+50 BURPEES"
nuevo Total / 10K.

No llamar Rx todavía.

Después, dentro del mismo flujo:
"¿Alguien los vio?"
"Conviértelos en Rx para que cuenten en el ranking."

Acciones:
- selector/buscador @usuario;
- "PEDIR VALIDACIÓN";
- "AHORA NO".

Cerrar el paso no deshace el registro.

## 9. Registro extraordinario
Si la cantidad es anormalmente alta:
"¿5.000 burpees?"
"Confirma que la cantidad es correcta."

Acciones:
- CORREGIR
- SÍ, REGISTRAR

No mostrar juicio moral ni bloquear por máximo arbitrario.
## 10. Validación como juez
Tarjeta compacta en Inicio o pantalla modal.

"VALIDACIÓN PENDIENTE"
"Dany registró 50 burpees."
"¿Los confirmas?"

Acciones:
- NO
- ✓ RX

Un toque por decisión.
No comentarios obligatorios.
No fotos.
No formularios.

Si valida:
"50 Rx confirmados."

Si rechaza:
el solicitante ve que no fue confirmado, sin abrir disputa dentro del MVP.

## 11. Overtake
Cuando una validación cambia el puesto:
"🔥 ¡SUBISTE AL #2!"
"Superaste a Andrés."

Acciones:
- COMPARTIR
- LISTO

Este feedback debe sentirse más importante que un toast normal.
## 12. Ranking
Encabezado:
"RANKING"

Primer selector:
- MI GRUPO
- GLOBAL

Segundo selector/contexto:
- ESTA SEMANA
- 10K RX

### Ranking semanal
Mostrar alrededor de 5–10 posiciones útiles.
Resaltar usuario actual.

Debajo de su fila:
"35 Rx para tomar el #1."
y, si aplica:
"Andrés está 15 Rx detrás de ti."

### Ranking 10K Rx
Solo usuarios que completaron.
Mostrar:
1. María — 219 días
2. Carlos — 241 días
3. Andrés — 278 días

Usuario no finalizado:
"Tu reto sigue activo. Día 171 de 365."
## 13. Perfil
El perfil es vitrina deportiva, no settings.

Cabecera:
@dany
4.900 burpees
4.670 Rx
95% verificado
Día 171 / 365

### Logros
- 1.000 Rx
- 2.500 Rx
- 5.000 Rx
- 10.000 Rx
- mejor semana
- mejor puesto semanal

### Historial
Lista cronológica corta.
Cada fila:
fecha · cantidad · estado.

Ejemplos:
"Hoy · 50 Rx ✓"
"Ayer · 70 Rx ✓"
"28 sep · 40 sin verificar"
## 14. Detalle de registro
Al tocar historial mostrar:
- cantidad;
- fecha de actividad;
- estado;
- validador si existe;
- fecha de validación.

Si Personal y aún dentro de ventana:
"PEDIR VALIDACIÓN"

Si Pending:
"VALIDACIÓN PENDIENTE"
opción de cancelar/cambiar testigo según reglas aprobadas.

Si Rx:
no mostrar Editar.
Acción destructiva separada:
"ANULAR REGISTRO"

Explicar que un Rx anulado deja de contar en rankings.

## 15. Sharing
No usar un botón de compartir permanente como centro del producto.
Ofrecerlo al ocurrir un momento relevante.

Cards oficiales Rx:
- #1 semanal;
- adelantamiento;
- milestone;
- mejor semana;
- 10K Rx.
## 16. Card social
Formato prioritario 9:16.
Debe incluir:
- logro grande;
- @username;
- valor Rx relevante;
- grupo si aplica;
- sello "✓ VERIFICADO RX";
- branding discreto Burpee League.

Ejemplos de copy:
"#1 DEL BOX ESTA SEMANA"
"340 Rx"

"10.000 RX"
"Completado en 243 días"

Progreso personal puede compartirse con transparencia:
"6.240 / 10.000"
"5.880 Rx · 94% verificado"

Nunca presentar Total no verificado como récord oficial.

## 17. Copy y tono
Español natural, corto y competitivo.
Evitar anglicismos innecesarios.
Mantener "Rx" por contexto cultural del público.

Usar:
- Reto
- Grupo
- Ranking
- Verificado Rx
- Registrar burpees
- Te faltan X Rx para superar a Y
Evitar:
- Crew
- Challenge
- Leaderboard
- Log workout
- lenguaje administrativo excesivo.

El tono puede ser juguetón en momentos de logro, pero no insultante ni agresivo.

## 18. i18n
Todo copy visible debe venir de recursos de idioma desde el inicio.
Locale inicial: es.
No mostrar selector de idioma en MVP.

Evitar construir frases concatenando fragmentos difíciles de traducir.
Usar templates con variables:
"Te faltan {count} Rx para superar a {name}."

## 19. Responsive
Prioridad: móvil vertical.
Debe funcionar correctamente en desktop, pero desktop no define la UX.

Targets:
- CTA accesible con pulgar;
- inputs grandes;
- ranking legible sin tablas densas;
- modales/bottom sheets cómodos;
- safe areas en dispositivos móviles.
## 20. Estados de sistema
Cada flujo debe definir:
- loading;
- empty;
- success;
- recoverable error;
- offline/network error cuando aplique.

Ejemplos:
Ranking vacío:
"Todavía nadie tiene Rx esta semana."

Sin rival alcanzable:
"Eres #1 esta semana. Mantén la ventaja."

Sin Rx:
"Tus burpees cuentan para tu reto. Pide una validación para entrar al ranking."

## 21. Accesibilidad mínima
- contraste suficiente;
- targets táctiles amplios;
- no depender solo de color para estados;
- labels accesibles en botones/iconos;
- feedback textual además de animación;
- tamaño de texto adaptable.

## 22. Visual direction — no congelada
La dirección puede ser oscura/deportiva y enérgica, pero no está aprobada aún.
No bloquear implementación del piloto por branding final.
Priorizar jerarquía, velocidad y claridad.

No introducir estética que dependa de marcas registradas de terceros.
## 23. Prioridad del piloto
El piloto no necesita diseño exhaustivo de todos los logros.

Debe verse y sentirse correctamente:
1. invitación/entrada;
2. Home;
3. registrar;
4. pedir/confirmar Rx;
5. ranking semanal;
6. historial básico.

El test principal de UX:
una persona nueva debe poder entender en segundos:
- qué es 10K;
- qué es Total;
- qué es Rx;
- qué necesita para subir en ranking.

## 24. Regla para nuevas pantallas
Antes de agregar una pantalla principal, preguntar:
"¿Esto puede resolverse como estado, modal o sección de una de las tres pantallas?"

Si sí, no crear nueva navegación.

## 25. Criterio de diseño
Cada interacción debe reforzar al menos uno:
- progreso;
- confianza;
- rivalidad;
- recompensa;
- distribución.

Si no refuerza ninguno, reconsiderar su presencia.
