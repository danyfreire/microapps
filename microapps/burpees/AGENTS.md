# AGENTS.md — Burpee League

## Propósito
Este archivo define cómo deben trabajar los agentes dentro de este repositorio.
Antes de modificar producto, diseño, arquitectura o código, leer:
1. `AGENTS.md`
2. `PRD.md`
3. `DESIGN.md`
4. `ARCHITECTURE.md` cuando exista.

## Jerarquía de verdad
- `PRD.md` manda sobre comportamiento y alcance de producto.
- `DESIGN.md` manda sobre UX, interacción y lenguaje visible.
- `ARCHITECTURE.md` manda sobre decisiones técnicas aprobadas.
- El código existente no invalida una decisión explícita de los documentos.
- Ante contradicción o ausencia material, no inventar: escalar al Product Owner.

## Product Owner
El Product Owner decide cambios de producto, alcance, monetización y excepciones.
Los agentes deben resolver autónomamente lo documentado y escalar solo decisiones reales.
## Roles

### Architect
Responsable de traducir PRD/DESIGN a arquitectura implementable.
Puede:
- crear y mantener `ARCHITECTURE.md` y ADRs;
- definir stack, esquema, interfaces, seguridad, i18n, despliegue y estrategia de pruebas;
- señalar riesgos y proponer alternativas.
No puede:
- cambiar requisitos del PRD para facilitar la implementación;
- ampliar el alcance sin aprobación;
- implementar features salvo asignación explícita.

### Developer
Responsable de implementar slices aprobados.
Puede:
- modificar código, migraciones, tests y configuración;
- crear ramas/commits/PRs;
- proponer mejoras técnicas.
No puede:
- redefinir comportamiento de producto;
- editar PRD/DESIGN para justificar una implementación diferente;
- aprobar su propio trabajo como QA.
### QA
Responsable de verificar el comportamiento contra PRD, DESIGN y criterios de aceptación.
Puede:
- ejecutar pruebas manuales y automatizadas;
- agregar tests de regresión;
- registrar defectos y solicitar cambios;
- actualizar `QA.md`.
No puede:
- cambiar requisitos esperados para hacer pasar una prueba;
- modificar código funcional para ocultar un defecto;
- aprobar una feature con criterios críticos fallando.

## Flujo de trabajo
Preferir slices verticales pequeños:
1. Architect concreta implicaciones técnicas.
2. Developer implementa en workspace/rama aislada.
3. Developer solicita review.
4. QA prueba criterios y casos borde.
5. Si falla, vuelve a Developer con reproducción concreta.
6. Si pasa, queda listo para integración.

No usar GitHub como cola de microestados del agente. GitHub conserva estado durable.
El orquestador/Kanban conserva estado operativo y handoffs.
## Cuándo escalar al Product Owner
Escalar solo si:
- PRD/DESIGN no definen un comportamiento necesario;
- dos documentos se contradicen;
- la solución requiere ampliar o reducir alcance;
- implica gasto, servicio nuevo o credenciales no disponibles;
- implica acción destructiva o sensible;
- un límite técnico obliga a alterar el producto;
- hay fallos repetidos sin recuperación documentada.

No escalar decisiones técnicas rutinarias cubiertas por la arquitectura.

## Guardrails de producto
- La interfaz visible del MVP es solo en español.
- Preparar textos para i18n; no hardcodear copy repetido en componentes.
- No añadir cámara, IA, computer vision, wearables, chat, feed social, nutrición ni múltiples ejercicios.
- No usar marcas de terceros como identidad del producto.
- Burpee League es nombre de trabajo hasta decisión explícita.
## Reglas esenciales del dominio
- Reto base: 10.000 burpees en un máximo de 365 días desde el primer registro.
- Total = progreso personal; incluye todos los registros válidos del usuario.
- Rx = burpees verificados por otra persona identificada.
- Rankings y logros sociales oficiales usan Rx.
- Una persona nunca puede auto-validarse.
- Un registro Rx no se edita; se anula y se reemplaza.
- Se puede registrar actividad de hoy o ayer.
- La validación puede solicitarse hasta 7 días después del registro.
- Un registro tiene un único validador activo a la vez.
- Los burpees pertenecen al usuario/reto, no al grupo.
- Un mismo registro Rx aparece en todos los rankings de grupos relevantes sin duplicarse.

## Calidad mínima
- Mobile-first y responsive.
- Estados loading, empty, error y success explícitos.
- Validación de entrada en cliente y servidor.
- Migraciones reproducibles para cambios de esquema.
- Tests de reglas de negocio críticas.
- No introducir secretos en el repo.
- Antes de entregar: build, lint/typecheck y tests relevantes deben pasar.
## Git
- `main` debe permanecer integrable.
- Una tarea/slice por rama o worktree.
- Commits descriptivos y pequeños.
- PR debe enlazar la tarea y resumir cambios, pruebas y riesgos.
- No force-push a `main`.
- No mergear trabajo con QA crítico pendiente.

## Documentación operativa
Cuando una decisión técnica nueva sea duradera, documentarla en ARCHITECTURE/ADR.
Cuando aparezca un caso de prueba durable, documentarlo en QA.
No duplicar requisitos completos entre documentos: referenciar la fuente de verdad.

## Principios
"Tu total mide tu progreso. Tus Rx miden tu posición frente a los demás."
"Puedes registrar cualquier cosa. La app solo certifica socialmente lo verificado."
"El reto es personal. La competencia es social."
"Cada semana tienes una nueva oportunidad de ganar."
