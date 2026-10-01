# QA.md — Burpee League

## Estado
Versión: 1.0
Fecha: 2026-10-01
Slice: 1 (Autenticación, Registro y Total)

---

## 1. Criterios de aceptación del Slice 1

Basado en PRD.md, DESIGN.md, ARCHITECTURE.md e IMPLEMENTATION_PLAN.md.

### 1.1 Autenticación

| ID | Criterio | Verificación |
|----|----------|--------------|
| AC-01 | Usuario puede registrarse con email y @username único (autenticación por Magic Link) | POST /api/auth/register retorna 201 y usuario creado, email recibido con link |
| AC-02 | Email duplicado retorna error 409 | POST /api/auth/register con email existente |
| AC-03 | Username duplicado retorna error 409 | POST /api/auth/register con username existente |
| AC-04 | Username inválido (formato) retorna error 400 | Username con caracteres no permitidos |
| AC-05 | Usuario puede hacer login con email (Magic Link) | POST /api/auth/signin retorna email con magic link enviado |
| AC-06 | Email inválido retorna error 400 | Login con email malformado |
| AC-07 | Sesión persiste entre páginas | Middleware protege rutas auth |
| AC-08 | Usuario no autenticado es redirigido a /login | Acceder a /home sin sesión |

### 1.2 Registro de burpees

| ID | Criterio | Verificación |
|----|----------|--------------|
| AC-09 | Primer registro crea Challenge con startDate = activityDate | GET /api/me muestra challenge con startDate correcto |
| AC-10 | Total se calcula como suma de registros no VOIDED | Total = sum(records where status != VOIDED) |
| AC-11 | Registro con fecha inválida (no hoy/ayer) retorna error 400 | POST /api/records con fecha de hace 3 días |
| AC-12 | Cantidad 0 o negativa retorna error 400 | quantity <= 0 |
| AC-13 | Registro sin autenticación retorna 401 | POST /api/records sin sesión |

### 1.3 Total y display

| ID | Criterio | Verificación |
|----|----------|--------------|
| AC-14 | Total muestra progreso hacia 10K | Home muestra "{total} / 10.000" |
| AC-15 | Barra de progreso refleja porcentaje | (total / 10000) * 100% |
| AC-16 | Día actual = dias desde startDate | "Día {N} de 365" |
| AC-17 | Si startDate null, mostrar "Día 1" | Usuario nuevo sin registros |
| AC-18 | Índice Rx = (Rx / Total) * 100 | Porcentaje de verificados |

### 1.4 Grupo piloto

| ID | Criterio | Verificación |
|----|----------|--------------|
| AC-19 | Grupo piloto hardcoded como 'piloto-001' | Código contiene grupo = 'piloto-001' |

### 1.5 Calidad técnica

| ID | Criterio | Verificación |
|----|----------|--------------|
| AC-20 | Build pasa sin errores | npm run build exiting 0 |
| AC-21 | Lint pasa sin errores | npm run lint exiting 0 |
| AC-22 | TypeScript sin errores | tsc --noEmit exiting 0 |
| AC-23 | API retorna formato {success, data, error} | Todas las respuestas followschema |
| AC-24 | Password no expuesta en response | Password hash no en JSON response |
| AC-25 | UUID usado en lugar de IDs secuenciales | IDs son UUIDs |

---

## 2. Casos felices (Happy Path)

| ID | Flujo | Resultado esperado |
|----|-------|--------------------|
| HP-01 | Registro → Login → Home | Usuario ve "0 / 10.000", "Día 1 de 365" |
| HP-02 | Primer registro: 50 burpees hoy | Challenge creado, Total = 50, Day = 1 |
| HP-03 | Segundo registro: 30 burpees ayer | Total = 80, 2 registros en historial |
| HP-04 | Login con credenciales válidas | Redirigido a /home, sesión activa |
| HP-05 | Logout | Redirigido a /login, sesión invalidada |

---

## 3. Casos borde

| ID | Escenario | Entrada | Resultado esperado |
|----|-----------|---------|--------------------|
| BE-01 | Email inválido | "not-an-email" | Error 400: email inválido |
| BE-02 | Email no existe para login | "noexiste@test.com" | Error 400 o email de nuevo usuario enviado |
| BE-03 | Username con espacios | "dan y" | Error 400: formato inválido |
| BE-04 | Username muy largo | "a" * 50 | Error 400: máximo 30 caracteres |
| BE-05 | Registro con fecha mañana | tomorrow | Error 400: fecha no permitida |
| BE-06 | Registro con fecha hace 2 días | date(-2) | Error 400: solo hoy/ayer |
| BE-07 | Cantidad negativa | -10 | Error 400: cantidad inválida |
| BE-08 | Cantidad cero | 0 | Error 400: cantidad inválida |
| BE-09 | Cantidad extraordinariamente alta | 5000 | Confirmación requerida (según DESIGN sec 9) |
| BE-10 | Sin sesión en /home | Sin cookie auth | Redirección a /login |
| BE-11 | Sin sesión en /api/me | Sin cookie auth | 401 Unauthorized |
| BE-12 | Sesión expirada | Cookie expirada | Redirección a /login |
| BE-13 | Registro con cantidad máxima | 10000 | Permite registro (no hay límite arbitrario) |
| BE-14 | Usuario con 365 días | startDate - 366 days | "Día 365 de 365" (capped) |

---

## 4. Pruebas de reglas de dominio

| ID | Regla | Test | Aserción |
|----|-------|------|----------|
| DR-01 | Total = suma de registros no VOIDED | Crear 3 registros: 50 (PERSONAL), 30 (RX_VERIFIED), 20 (VOIDED) | Total = 80 |
| DR-02 | Rx = suma de RX_VERIFIED | Mismos registros que DR-01 | Rx = 30 |
| DR-03 | Índice Rx = (Rx / Total) * 100 | Total=80, Rx=30 | Índice = 37.5% |
| DR-04 | Un usuario = un reto activo | Usuario con challenge activo intenta crear otro | Error o retorna el existente |
| DR-05 | Day = min(días transcurridos, 365) | Registro hace 400 días | Day = 365 |
| DR-06 | Grupo piloto hardcoded | Verificar código | group_id = 'piloto-001' |
| DR-07 | Un validador por registro | Dos usuarios validan el mismo registro | Solo la primera cuenta |
| DR-08 | Auto-validación prohibida | Usuario intenta validarse a sí mismo | Error: no puedes validarte |

---

## 5. Criterios de PASS/FAIL

### 5.1 Criterios de PASS

- [ ] Todos los AC-01 a AC-25 pasan
- [ ] Todos los HP-01 a HP-05 pasan
- [ ] Todos los BE-01 a BE-14 tienen comportamiento definido y documentado
- [ ] Todos los DR-01 a DR-08 pasan
- [ ] Build, lint y typecheck pasan
- [ ] No hay passwords o secrets en logs o responses (Magic Link no usa passwords)

### 5.2 Criterios de FAIL (críticos)

- [ ] Usuario puede registrarse sin validación de email
- [ ] Usuario puede ver passwords de otros usuarios (N/A con Magic Link)
- [ ] Total incluye registros VOIDED
- [ ] Un usuario puede tener múltiples retos activos
- [ ] Auto-validación es posible
- [ ] Fechas distintas de hoy/ayer son aceptadas
- [ ] Rutas auth son accesibles sin sesión
- [ ] API no sigue formato {success, data, error}

### 5.3 Criterios de FAIL (no críticos)

- [ ] UI no muestra estados loading/empty/error
- [ ] Textos hardcoded en lugar de locales/es.json
- [ ] No hay skeleton durante carga

---

## 6. Matriz de trazabilidad

| Requirement PRD | Diseño DESIGN | Arquitectura ARCH | Impl PLAN | Test QA |
|-----------------|---------------|-------------------|-----------|---------|
| 10K en 365 días | Sección 6, 7 | Sección 3, 4 | Fase 3 | AC-14, AC-16, DR-05 |
| Total = suma no anulada | - | Sección 3.1 | - | AC-10, DR-01 |
| Rx = confirmado por otro | Sección 8, 10 | Sección 3.1 | - | DR-02 |
| Registro hoy/ayer | Sección 7 | Sección 4.3 | 3.1 | AC-11, BE-05, BE-06 |
| Validación por testigo | Sección 8, 10 | - | - | DR-07, DR-08 |
| Auth Magic Link | - | Sección 2.1 | Fase 2 | AC-01 a AC-08 |
| 3 destinos navegación | Sección 2 | Sección 6 | Fase 5 | AC-20 |

---

## 7. Entorno de testing

- Local: http://localhost:3000
- Base de datos: SQLite (dev)
- Credenciales de prueba: usar emails/tokens de test en .env.test si existe

---

## 8. Notas para siguiente slice

El Slice 1 no incluye validación Rx (solicitud/confirmación). Los siguientes criterios serán relevantes para Slice 2:

- POST /api/validations crea ValidationRequest
- Estado cambia a VERIFICATION_PENDING
- Validador recibe notificación
- Aprobación cambia estado a RX_VERIFIED y actualiza Rx
- Rechazo cambia estado a REJECTED
- Ventana de 7 días para solicitar validación

---

*Documento creado por QA para Slice 1. Actualizar para cada nuevo slice.*