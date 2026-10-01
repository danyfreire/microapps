# PRD — Burpee League

## 1. Estado
Versión: 2.0 consolidada para piloto.
Idioma de producto: español.
Nombre de trabajo: Burpee League.

## 2. Visión
Burpee League es una microapp social para personas que practican functional fitness y entrenamientos afines.
Convierte un reto personal de burpees en una competencia recurrente con personas cercanas.

La aplicación no busca ser un workout tracker completo.
Su foco es una sola conducta:
registrar burpees, convertir parte de ellos en Rx y usar esos Rx para competir.

## 3. Propuesta central
Reto largo:
**10.000 burpees en un máximo de 365 días desde el primer registro.**

Juego corto:
**competir semanalmente por burpees Rx con tu gente.**

Principios:
- Tu total mide tu progreso.
- Tus Rx miden tu posición frente a los demás.
- Puedes registrar cualquier cosa; la app solo certifica socialmente lo verificado.
- El reto es personal. La competencia es social.
## 4. Usuario inicial
Persona que:
- practica functional fitness, HIIT o entrenamiento similar;
- hace burpees con cierta frecuencia;
- conoce otras personas que entrenan;
- responde a competencia amistosa;
- comparte ocasionalmente logros deportivos.

La unidad social inicial es el grupo/box, no una red global de desconocidos.

## 5. Hipótesis principal
Ver una distancia concreta contra alguien conocido provoca acción.

Señal cualitativa fuerte:
"Hice 30 más porque me faltaban 20 para pasarlo."

North Star experimental:
usuarios que registran, tienen al menos un rival activo y regresan dentro de la misma semana.

## 6. El reto 10K
Cada intento comienza con el primer registro.
Duración máxima: 365 días.
No está atado a año calendario.
Si el usuario completa 10.000 Total, completa su progreso personal.
Si completa 10.000 Rx, obtiene resultado oficial social.
## 7. Total, Rx e Índice Rx
### Total
Suma de burpees registrados y no anulados.
Representa progreso personal hacia 10K.

### Rx
Suma de burpees confirmados por otro usuario identificado.
Es la moneda competitiva.

### Índice Rx
Rx / Total expresado como porcentaje.
Es señal de reputación; no multiplica puntos.

Ejemplo:
- Total: 6.320
- Rx: 5.980
- Índice Rx: 94,6%

No existen ponderaciones tipo "un Rx vale dos".
Un burpee siempre vale un burpee.

## 8. Niveles de confianza
- Personal: autodeclarado.
- Rx: confirmado por otro usuario.
- Box Rx: confirmado dentro de una dinámica oficial de box, futuro.

En MVP, Rx y Box Rx cuentan igual en rankings.
No habrá video, cámara ni IA de validación.
## 9. Competencia semanal
Usuarios pueden comenzar su reto en fechas distintas.
Por eso la competencia cotidiana usa semanas calendario comunes.

Periodo:
lunes 00:00 a domingo 23:59 según zona horaria definida para el producto/grupo.

Ranking semanal:
ordena por burpees Rx cuya fecha de actividad cae en esa semana.

Ejemplo:
1. Carlos — 325 Rx
2. Dany — 290 Rx
3. Andrés — 275 Rx

La Home debe transformar ranking en acción:
"Te faltan 36 Rx para tomar el #1."

Cada lunes el ranking semanal empieza de cero.
Los burpees acumulados siguen contando hacia el reto 10K.

## 10. Resultado histórico 10K Rx
Cuando Rx alcanza 10.000 dentro de 365 días:
- se guarda fecha de finalización;
- se calcula cantidad de días desde el primer registro;
- el resultado queda disponible para ranking histórico.

Ranking 10K Rx:
ordena por menor cantidad de días para completar 10.000 Rx.
## 11. Grupos / Box
Un grupo representa el círculo social relevante del usuario.
En MVP, un box puede ser técnicamente un grupo; no requiere verificación institucional.

Los burpees pertenecen al usuario/reto, no al grupo.
Si un usuario pertenece a varios grupos, el mismo registro Rx aparece en todos los rankings aplicables sin duplicarse.

El ranking principal de Home prioriza el grupo seleccionado como contexto.
El ranking global es secundario.

## 12. Rival automático
No existe selección manual de rival en MVP.
La aplicación deriva el rival a partir del ranking relevante, normalmente la persona inmediatamente por encima.

Ejemplos:
- "Carlos está 35 Rx delante."
- "Te faltan 36 Rx para superarlo."
- "¡Subiste al #2!"

El rival sirve para convertir posición en una acción concreta.

## 13. Entrada y onboarding
Entrada ideal: link a un reto/grupo, no "descarga la app".
Antes de autenticarse el visitante puede entender:
- reto 10K;
- grupo;
- ranking semanal visible;
- CTA para unirse.
Onboarding mínimo:
1. autenticación con proveedor disponible o magic link;
2. elegir @username único;
3. quedar unido al grupo/reto desde el link;
4. registrar primeros burpees.

No pedir edad, peso, nivel, foto ni objetivos adicionales.

El reto no empieza al crear cuenta ni al abrir el link.
Empieza con el primer registro.

## 14. Registro de burpees
Registrar debe tomar segundos.
Datos mínimos:
- cantidad;
- fecha de actividad;
- usuario;
- reto.

Fechas permitidas en MVP:
- hoy;
- ayer.

No permitir backfill libre de meses anteriores.

Al guardar:
- aumenta Total inmediatamente;
- no aumenta Rx hasta validación.

Registros extraordinariamente altos pueden requerir confirmación adicional de cantidad, pero no un máximo arbitrario.
## 15. Validación Rx
Después de registrar, la app pregunta opcionalmente:
"¿Alguien los vio?"

El usuario puede:
- elegir un @usuario/testigo;
- pedir validación;
- elegir "Ahora no".

El registro nunca se pierde por no pedir Rx.

El validador recibe:
"Dany registró 50 burpees. ¿Los confirmas?"
Acciones:
- NO
- ✓ RX

Un usuario nunca puede validarse a sí mismo.

Una misma persona puede validar repetidamente a otra.
Dos usuarios pueden validarse mutuamente si entrenaron juntos.
No hay algoritmo de reputación del validador en MVP.
## 16. Cold start
El primer usuario puede registrar normalmente.
Sus Rx permanecen en 0 hasta que otra persona confirme.

Puede invitar a un testigo que todavía no tenga cuenta mediante un link.
Para convertir la validación en Rx, el testigo debe quedar identificado mínimamente.

Después de validar, se puede invitar al testigo a iniciar su propio reto.
La validación funciona también como loop de adquisición.

## 17. Ventana temporal y estados
Se puede solicitar Rx hasta 7 días después de la fecha del registro.

Estados:
- PERSONAL
- VERIFICATION_PENDING
- RX_VERIFIED
- REJECTED / UNVERIFIED
- VOIDED

Efectos:
- PERSONAL/PENDING/REJECTED cuentan para Total, no ranking.
- RX_VERIFIED cuenta para Total, Rx, ranking y logros sociales.
- VOIDED no cuenta.
## 18. Edición y anulación
Registro Personal o Pendiente puede editarse dentro de las reglas de fecha.
Registro Rx no se edita.

Si un Rx necesita corrección:
1. se anula;
2. se crea un nuevo registro;
3. el nuevo registro requiere su propia validación.

Eliminar/anular un Rx recalcula:
- Rx total;
- rankings;
- logros derivados cuando corresponda.

## 19. Un validador por registro
MVP usa un único validador activo por registro.
Si no responde, el usuario puede cancelar/reemplazar la solicitud según UX aprobada.
No se requieren múltiples testigos.

La fecha que determina ranking es la fecha de actividad, no la fecha de validación.

Una validación tardía dentro de la ventana puede modificar el ranking de la semana correspondiente.

## 20. Sharing
La app distingue progreso personal y logros certificados.

Progreso personal puede compartir:
- Total;
- día del reto;
- Rx;
- Índice Rx.
Logros sociales oficiales solo usan Rx:
- #1 semanal;
- adelantamiento;
- milestone Rx;
- mejor semana;
- 10K Rx completado;
- tiempo oficial 10K Rx.

La app nunca genera una card oficial que certifique un logro usando datos no verificados.

Formato social prioritario: 9:16 para Stories/Status.

## 21. Navegación del MVP
Tres destinos:
- Inicio
- Ranking
- Perfil

Acciones como registrar, pedir Rx, validar y compartir ocurren en modales/hojas o estados contextuales.

## 22. Inicio
Debe mostrar:
- progreso Total / 10K;
- día actual de 365;
- Rx e Índice Rx;
- posición semanal en grupo;
- rival/distancia accionable;
- CTA Registrar burpees;
- pendientes de Rx o validaciones a resolver cuando aplique.
## 23. Ranking
Vistas principales:
- grupo: Esta semana;
- grupo: 10K Rx históricos;
- global: secundario.

No necesitamos mostrar listas enormes.
Priorizar contexto alrededor del usuario y posiciones relevantes.

## 24. Perfil
Debe ser vitrina deportiva + historial.
Mostrar:
- username;
- Total;
- Rx;
- Índice Rx;
- día del reto;
- milestones;
- mejor semana;
- mejor puesto;
- historial de registros y estado.

## 25. Notificaciones
Solo notificaciones con contexto competitivo o operativo:
- alguien te superó;
- estás cerca de superar;
- validaron tu registro;
- tienes una validación pendiente;
- oportunidad concreta de puesto.

Evitar recordatorios genéricos sin contexto.
## 26. Piloto
Objetivo: validar el loop completo con mínima superficie.

Incluye:
- autenticación básica;
- un reto 10K/365;
- un grupo piloto;
- registro manual;
- Total;
- solicitud/confirmación Rx;
- ranking semanal Rx;
- distancia al rival;
- historial básico.

No requiere todavía creación libre de grupos ni cards sociales sofisticadas.

Pregunta:
¿La rivalidad verificada hace que la gente vuelva y haga/registre más burpees?

## 27. MVP público
Después de validar piloto:
- creación/unión a grupos por link/código;
- Home completo;
- ranking grupo/global;
- perfil;
- índice Rx;
- milestones;
- cards sociales;
- notificaciones competitivas.
## 28. Roadmap
### Fase 0 — Piloto
Registrar → verificar → competir → volver.

### Fase 1 — Producto público
Grupos + invitaciones + perfil + sharing + logros.

### Fase 2 — Retención
Mejor historial, varios retos, récords semanales, notificaciones y Box Rx.

### Fase 3 — Boxes
Box oficial, QR, admin, ranking interno, box vs box y dashboard sencillo.

### Fase 4 — Monetización
Retos patrocinados, branding de box y oferta B2B.
No banners invasivos en MVP.

## 29. Fuera de alcance
- cámara/computer vision;
- IA;
- wearables;
- chat/feed;
- programación de entrenamiento;
- nutrición/calorías/macros;
- múltiples ejercicios;
- marketplace;
- moderación compleja;
- monedas virtuales;
- sistema de puntos artificial.
## 30. Idioma e internacionalización
MVP visible solo en español.
El código debe quedar preparado para i18n desde el inicio.
No construir selector de idioma todavía.
Inglés se agrega después sin rediseñar el producto.

## 31. Métricas
Activation:
usuario entra, registra y tiene al menos un contexto competitivo.

Competitive Active User:
durante una semana registra, tiene rival activo y vuelve.

Otras:
- frecuencia de registro;
- porcentaje de registros que llegan a Rx;
- visitas a ranking;
- overtakes;
- retorno después de ser superado;
- sharing de logros;
- D1/D7 y luego D30.

## 32. Señales cualitativas
Positivas:
- "Hice más porque me faltaban pocos para pasarlo."
- "Vi que me pasó y volví."
- "Invité a alguien para competir/validar."

Negativas:
- ranking no cambia comportamiento;
- usuarios solo registran una vez;
- validación es demasiada fricción;
- grupos quedan inactivos;
- engagement depende solo de recordatorios.

## 33. Regla de decisión
Toda nueva feature debe responder:
"¿Hace que competir sea más divertido, más confiable, más personal o más compartible?"

Si no, probablemente no pertenece a esta microapp.
