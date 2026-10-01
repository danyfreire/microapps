# ARCHITECTURE.md — Burpee League

## Estado
Versión: 1.0 (Slice 1)
Fecha: 2026-10-01
Piloto: Slice 1 — Autenticación básica, registro y Total

---

## 1. Visión de arquitectura

Arquitectura mínima viable para el piloto que valide:
1. Un usuario puede autenticarse
2. Un usuario puede iniciar un reto 10K con su primer registro
3. Un usuario puede registrar burpees (hoy/oayer)
4. La app muestra el Total acumulado

El piloto no incluye: grupos dinámicos, rankings complejos, sharing, logros, ni notificaciones push.

---

## 2. Stack tecnológico

### 2.1 Propuesta

| Capa | Tecnología | Justificación |
|------|------------|----------------|
| Frontend | Next.js 14 (App Router) + React | SSR para SEO de páginas públicas (invitación), SPA para app auth |
| Estilos | Tailwind CSS | PRD requiere mobile-first, prototyping rápido |
| Base de datos | PostgreSQL | Decisión PO: PostgreSQL desde el inicio |
| Auth | Magic Link (NextAuth con Email provider) | Decisión PO: magic link, no credentials |
| API | Next.js API Routes (REST) | Simplicidad para MVP |
| Validación | Zod | Schema validation en cliente y servidor |

### 2.2 Alternativas consideradas

- **Supabase/Firebase**: descartado — requiere infraestructura externa no aprobada
- **SQLite + PostgreSQL dual**: descartado — decisión PO es PostgreSQL desde inicio
- **Credentials auth**: descartado — decisión PO es magic link
- **Expo/React Native**: postergado — PWA con Next.js cubre necesidades del piloto

### 2.3 Decisiones tomadas

Las siguientes decisiones fueron tomadas por el Product Owner el 2026-10-01:

- **Auth**: Magic Link (no credentials/email+password)
- **DB**: PostgreSQL desde el inicio
- **@username**: mutable conceptualmente (el modelo no debe asumir inmutabilidad)
- **Grupo piloto**: entidad real persistida en DB, sembrada al despliegue
- **Límite diario**: no existe; cantidades extraordinarias requieren confirmación UX
- **Índice Rx**: SUM(cantidad RX_VERIFIED) / SUM(cantidad no VOIDED) * 100

---

## 3. Modelo de datos

### 3.1 Entidades

```
User
├── id: UUID (PK)
├── email: string (unique)
├── username: string (unique)
├── createdAt: timestamp
├── currentChallengeId: FK → Challenge
├── pilotGroupId: FK → PilotGroup (nullable)
└── (para Slice 1: un solo challenge por usuario)

PilotGroup
├── id: UUID (PK)
├── name: string
├── code: string (unique)
├── createdAt: timestamp
└── isActive: boolean

Challenge
├── id: UUID (PK)
├── userId: FK → User
├── targetBurpees: integer (default 10000)
├── maxDays: integer (default 365)
├── startDate: timestamp (nullable - se define con primer registro)
├── endDate: timestamp (nullable)
├── totalBurpees: integer (computed)
└── status: enum (ACTIVE, COMPLETED, EXPIRED)

BurpeeRecord
├── id: UUID (PK)
├── challengeId: FK → Challenge
├── userId: FK → User
├── quantity: integer
├── activityDate: date (hoy o ayer)
├── status: enum (PERSONAL, VERIFICATION_PENDING, RX_VERIFIED, REJECTED, VOIDED)
├── createdAt: timestamp
├── validatedBy: FK → User (nullable)
├── validatedAt: timestamp (nullable)
└── (un validador por registro según PRD)

ValidationRequest
├── id: UUID (PK)
├── recordId: FK → BurpeeRecord
├── validatorId: FK → User
├── status: enum (PENDING, APPROVED, REJECTED)
├── createdAt: timestamp
└── respondedAt: timestamp
```

### 3.2 Notas

- **Un usuario = un reto activo** en Slice 1 (no múltiples retos paralelos)
- **Grupo piloto**: entidad real en tabla `PilotGroup`, sembrada al despliegue (no hardcoded)
- **Índice Rx**: `SUM(quantity WHERE status=RX_VERIFIED) / SUM(quantity WHERE status!=VOIDED) * 100`
- **Total** = suma de quantity de registros no VOIDED

---

## 4. Flujos de Slice 1

### 4.1 Autenticación (Magic Link)

```
Pantalla login → NextAuth Email provider
  → usuario ingresa email
  → sistema envía magic link por SMTP
  → usuario hace click en link → sesión creada
  → sesión persistente (30 días)
```

- No se usa password
- Magic link enviado por email (SMTP configurable)
- El email sirve como identificador único

### 4.2 Onboarding (solo primera vez)

```
1. Login con email (magic link)
2. En onboarding: elegir @username único
3. Redirigir a Home (el reto inicia con primer registro)
```

### 4.3 Primer registro (inicia reto)

```
1. Usuario presiona "REGISTRAR MIS PRIMEROS BURPEES"
2. Bottom sheet: cantidad (input numérico), fecha (hoy por defecto)
3. Submit → POST /api/records
   - Si es primer registro del usuario:
     - Crear Challenge con startDate = activityDate
   - Crear BurpeeRecord status = PERSONAL
4. Mostrar confirmación: "+{N} BURPEES", nuevo Total/10K
5. Preguntar "¿Alguien los vio?" (opcional)
   - Si selecciona usuario → crear ValidationRequest
   - Si "Ahora no" → cerrar sin acción
```

### 4.4 Registro subsecuente

```
1. CTA "REGISTRAR BURPEES" en Home
2. Same flow que 4.3, pero Challenge ya existe
3. Actualizar Challenge.totalBurpees
```

### 4.5 Mostrar Total

```
Home → Bloque "Reto 10K":
- Total grande: "{total} / 10.000"
- Barra de progreso
- "Día {N} de 365"
- "{rx} Rx · {index}% verificado" (si hay registros)
```

---

## 5. API

### 5.1 Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Crear cuenta |
| POST | /api/auth/[...nextauth] | Login/logout |
| GET | /api/me | Usuario actual + challenge + total |
| POST | /api/records | Crear registro |
| GET | /api/records | Historial del usuario (limit 20) |
| GET | /api/challenges/:id | Detalle del reto |
| POST | /api/validations | Solicitar validación |
| POST | /api/validations/:id/respond | Aprobar/rechazar |

### 5.2 Formato de respuesta

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "..." }
}
```

---

## 6. Frontend: estructura de páginas

```
/                     → Landing pública (invitación) - SEO
/login                → Login
/register             → Registro + username
/home                 → Home (requiere auth)
/ranking              → Ranking (placeholder en Slice 1)
/perfil               → Perfil (solo stats básicos)
/api/*                → API routes
```

### 6.1 Componentes clave

- `<BottomNav />` — Inicio, Ranking, Perfil
- `<BurpeeInput />` — Input numérico grande con +1/-1/+10/-10
- `<TotalDisplay />` — Bloque 10K con progreso
- `<ValidationPrompt />` — "¿Alguien los vio?"
- `<RecordCard />` — Fila de historial

### 6.2 Estados definidos

Cada flujo debe manejar:
- `loading` — skeleton/spinner
- `empty` — "No tienes registros aún"
- `success` — feedback positivo
- `error` — mensaje recoverable

---

## 7. Seguridad

- Magic link con tokens de un solo uso
- JWT con httpOnly cookies
- CSRF protection via NextAuth
- Input validation con Zod en servidor
- No exponer IDs sequenciales (usar UUID)
- Rate limiting en endpoint de magic link (prevención abuso)

---

## 8. i18n

- Locale hardcoded a `es` en Slice 1
- Todos los textos en `/locales/es.json`
- Usar placeholders: `"{count} Rx para tomar el #1"`

---

## 9. Configuración de despliegue

### 9.1 Variables de entorno

```
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/burpees

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# SMTP para magic links
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=...
EMAIL_SERVER_PASSWORD=...
EMAIL_FROM=noreply@burpeeleague.com
```

### 9.2 Build y run

```bash
npm run build
npm start
```

### 9.3 Verificación pre-deploy

- [ ] Build pasa sin errores
- [ ] Lint/typecheck pasa
- [ ] Tests de integración críticos pasan
- [ ] Migrations aplicadas

---

## 10. Riesgo técnico

| Riesgo | Mitigación |
|--------|------------|
| SMTP para magic links requiere servicio externo | Usar nodemailer con proveedor estándar |
| Fecha de actividad restringida a hoy/ayer | Validar en API y Zod |
| Un validador por registro | Foreign key + lógica de negocio |

---

## 11. Dependencias externas

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | ^14.0 | Framework |
| react | ^18 | UI |
| @auth/core | ^4 | NextAuth (Email provider) |
| @prisma/client | ^5.x | PostgreSQL ORM |
| prisma | ^5.x | Migration tool |
| zod | ^3 | Validación |
| nodemailer | ^6 | Envío de magic links |
| tailwindcss | ^3 | Estilos |

---

## 12. Fuera de alcance de Slice 1

- Grupos dinámicos (tabla Group)
- Rankings complejos
- Logros y milestones
- Sharing cards
- Notificaciones push
- Video/fotos para validación
- Múltiples idiomas
- Analytics

---

## 13. Criterios de aceptación de arquitectura

- [ ] Stack definido y aprobado
- [ ] Modelo de datos cubriendo entidades necesarias
- [ ] Flujos de autenticación, registro y consulta definidos
- [ ] Endpoints REST documentados
- [ ] Seguridad básica cubierta
- [ ] i18n preparado (locale único)
- [ ] Variables de entorno definidas
- [ ] Tests mínimos identificados

---

## 14. Decisiones del Product Owner (2026-10-01)

| # | Pregunta | Decisión PO |
|---|----------|-------------|
| 1 | Auth | Magic link (no credentials) |
| 2 | DB | PostgreSQL desde el inicio |
| 3 | Username | Mutable conceptualmente; UI de cambio no requerida para piloto |
| 4 | Grupo piloto | Entidad real en DB, sembrada al despliegue |
| 5 | Límite diario | Sin límite; cantidades extraordinarias requieren confirmación UX |
| 6 | Índice Rx | SUM(qty RX_VERIFIED) / SUM(qty no VOIDED) * 100 |

---

*Documento actualizado por Architect para reflejar decisiones del Product Owner.*