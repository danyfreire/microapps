# A/B v2 — Burpee League: ciclo de validación Rx

**Tipo:** experimento descartable, NO es diseño aprobado de producción.
**Fuentes de verdad:** `microapps/burpees/AGENTS.md`, `PRD.md`, `DESIGN.md` (PRD §§7,14–19).
**Objetivo:** probar registrar → solicitar Rx → aprobar/rechazar → cancelar/anular, permisos, ventana de siete días y resumen Total/Rx.

## Entrega de cada agente
Solo crear estos dos archivos en su rama:
- `microapps/burpees/rx-lifecycle.cjs`
- `microapps/burpees/rx-lifecycle.test.cjs`

Node.js 22, CommonJS, sin dependencias, sin UI, base de datos, servicios ni edición de PRD/DESIGN/AGENTS. Exportar **exactamente**:
```js
createPersonalRecord(input, today)
applyRxAction(record, action, context)
summarizeUser(records, userId)
```

## Contrato de valores
Todas las fechas son **fecha civil** `YYYY-MM-DD` (no instantes). `today` se inyecta, no se usa la fecha del equipo.
`input={id,userId,quantity,activityDate}`. Cantidad: entero positivo sin máximo arbitrario. `activityDate`: solo hoy o ayer respecto a `today` (admitir cruces de año). Crear devuelve:
```js
{ id, userId, quantity, activityDate,
  createdDate:today, status:'PERSONAL',
  validatorId:null, validatedBy:null }
```
Errores para cantidad inválida: `INVALID_QUANTITY`; fecha incorrecta: `INVALID_ACTIVITY_DATE`.

`applyRxAction(record,action,context)`: `context={actorId,today}`, acción con `type`:
- `REQUEST`: `action.witnessId` string no vacío; solo propietario desde `PERSONAL`, testigo distinto del propietario y transcurridos 0–7 días civiles **inclusive** desde `createdDate`. Devuelve `VERIFICATION_PENDING` con `validatorId=witnessId`.
- `APPROVE` y `REJECT`: solo desde `VERIFICATION_PENDING`, actor = validador activo. `APPROVE` devuelve `RX_VERIFIED` y `validatedBy=actorId`; `REJECT` devuelve `REJECTED` sin Rx. **Para el experimento, los 7 días limitan pedir la validación, no la respuesta**.
- `CANCEL`: solo propietario desde `VERIFICATION_PENDING`, retorna `PERSONAL` y `validatorId=null`; permite pedir a otro testigo dentro de la ventana.
- `VOID`: solo propietario de registro no `VOIDED`, devuelve `VOIDED` y deja de sumar Total/Rx.
- Cualquier operación devuelve objeto nuevo sin mutar el registro, el contexto ni la acción.

`Error.code` obligatorio: actor incorrecto `FORBIDDEN`; testigo propio `SELF_VERIFICATION`; faltante `INVALID_WITNESS`; solicitud antes de creación o posterior al día 7 `WINDOW_EXPIRED`; transición no permitida, intento doble y acción sobre `VOIDED`: `INVALID_STATE`. No hay API de edición, reintento desde `REJECTED` ni reversión de VOID.

`summarizeUser(records,userId)` devuelve `{total,rx,rxIndex}`:
- Solo registros de ese usuario; cada id se cuenta una vez (si se repite, gana su primera aparición).
- Total: cantidad de todo estado excepto VOIDED; Rx: exclusivamente RX_VERIFIED.
- `rxIndex=total===0 ? 0 : rx/total*100`, como número. Una unidad Rx vale un burpee.
- No mutar entradas.

**Convenciones de benchmark, no decisiones de producto:** usar `createdDate` como inicio de ventana; límite solo en solicitud y no en respuesta; no reintentar desde rechazado; conservar campos de auditoría al anular. Estos puntos requieren revisión futura del PO antes de implementarse en producción.

## Comparabilidad
A: agente normal, **sin Superpowers disponible**. B: mismo modelo con Superpowers, plan/TDD/red-green-review/verificación. Ambas sesiones deben ser independientes y ciegas al código contrario, empezar desde el mismo SHA y usar iguales permisos, presupuesto y herramientas. Solo varía la metodología.

Bajo ninguna circunstancia convertir este contrato en código de producción, fusionarlo a `main`, ni declarar que la metodología ganó sin ejecuciones independientes. Crear PRs `draft` hacia la rama baseline y ejecutar el mismo evaluador. Medir: errores, 35 tests comunes, pruebas propias, tiempo, tokens/costo **solo cuando haya telemetría**, iteraciones e intervenciones. Si no se dispone de agentes independientes, registrar PREPARADO/PENDIENTE y no fingir una ejecución.
