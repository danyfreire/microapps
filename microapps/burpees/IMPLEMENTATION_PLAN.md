# IMPLEMENTATION PLAN — Slice 1: Autenticación, Registro y Total

## Estado
Versión: 1.0
Fecha: 2026-10-01
Slice: 1 de N
Baseline: PRD, DESIGN, ARCHITECTURE.md

---

## 1. Alcance

### 1.1 Funcionalidades obligatorias

|| # | Feature | Descripción |
||---|---------|-------------|
|| 1 | Autenticación | Magic link por email + @username; login con NextAuth Email provider |
|| 2 | Onboarding | Elegir username único, crear cuenta, redirigir a Home |
|| 3 | Registro de burpees | Input numérico, fecha (hoy/ayer), crear BurpeeRecord |
|| 4 | Total | Mostrar progreso 10K con barra, día actual, Total, Rx, Índice Rx |
|| 5 | Grupo piloto | Tabla PilotGroup, sembrada al despliegue |

### 1.2 Fuera de alcance
- Grupos dinámicos
- Rankings complejos (placeholder vacío)
- Validación Rx (siguiente slice)
- Sharing cards
- Notificaciones
- Múltiples idiomas (locale hardcoded `es`)

---

## 2. Dependencias externas

```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "next-auth": "^4.24.0",
  "@auth/prisma-adapter": "^2.0.0",
  "@prisma/client": "^5.10.0",
  "prisma": "^5.10.0",
  "zod": "^3.22.0",
  "nodemailer": "^6.9.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

---

## 3. Estructura de archivos previstos

```
burpees/
├── prisma/
│   └── schema.prisma          # Modelo de datos
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing pública (SEO)
│   │   ├── layout.tsx         # Root layout
│   │   ├── login/
│   │   │   └── page.tsx       # Login
│   │   ├── register/
│   │   │   └── page.tsx       # Registro + username
│   │   ├── home/
│   │   │   ├── page.tsx       # Home (auth required)
│   │   │   └── layout.tsx     # BottomNav wrapper
│   │   ├── ranking/
│   │   │   └── page.tsx       # Ranking placeholder
│   │   ├── perfil/
│   │   │   └── page.tsx       # Perfil stats básicos
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   └── [...nextauth]/route.ts
│   │       ├── me/route.ts
│   │       ├── records/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── challenges/
│   │           └── [id]/route.ts
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── BottomNav.tsx
│   │   ├── BurpeeInput.tsx    # Input numérico +/-1/+10/-10
│   │   ├── TotalDisplay.tsx   # Bloque 10K con progreso
│   │   ├── RecordCard.tsx     # Fila de historial
│   │   └── ValidationPrompt.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma client singleton
│   │   └── utils.ts           # Helpers
│   ├── locales/
│   │   └── es.json            # Textos i18n
│   └── types/
│       └── index.ts           # Shared types
├── public/
│   └── favicon.ico
├── .env
├── .env.example
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── next.config.js
```

---

## 4. Modelo de datos (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Decisión PO: PostgreSQL desde el inicio
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  username      String         @unique
  createdAt     DateTime       @default(now())
  pilotGroupId  String?
  pilotGroup    PilotGroup?    @relation(fields: [pilotGroupId], references: [id])
  challenge     Challenge?
  records       BurpeeRecord[]
  validations   ValidationRequest[]
}

model PilotGroup {
  id        String   @id @default(uuid())
  name      String
  code      String   @unique
  createdAt DateTime @default(now())
  isActive  Boolean  @default(true)
  users     User[]
}

model Challenge {
  id            String        @id @default(uuid())
  userId        String        @unique
  user          User          @relation(fields: [userId], references: [id])
  targetBurpees Int           @default(10000)
  maxDays       Int           @default(365)
  startDate     DateTime?
  endDate       DateTime?
  totalBurpees  Int           @default(0)
  status        ChallengeStatus @default(ACTIVE)
  records       BurpeeRecord[]
}

model BurpeeRecord {
  id            String        @id @default(uuid())
  challengeId   String
  challenge     Challenge     @relation(fields: [challengeId], references: [id])
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  quantity      Int
  activityDate  DateTime
  status        RecordStatus  @default(PERSONAL)
  createdAt     DateTime      @default(now())
  validatedBy   String?
  validatedAt   DateTime?
  validation    ValidationRequest?
}

model ValidationRequest {
  id          String        @id @default(uuid())
  recordId    String        @unique
  record      BurpeeRecord  @relation(fields: [recordId], references: [id])
  validatorId String
  validator   User          @relation(fields: [validatorId], references: [id])
  status      ValidationStatus @default(PENDING)
  createdAt   DateTime      @default(now())
  respondedAt DateTime?
}

enum ChallengeStatus {
  ACTIVE
  COMPLETED
  EXPIRED
}

enum RecordStatus {
  PERSONAL
  VERIFICATION_PENDING
  RX_VERIFIED
  REJECTED
  VOIDED
}

enum ValidationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 5. Tareas de implementación

### Fase 1: Proyecto base

| # | Tarea | Criterio de aceptación |
|---|-------|------------------------|
| 1.1 | Inicializar Next.js 14 con TypeScript y Tailwind | `npm run build` pasa sin errores |
| 1.2 | Configurar ESLint y TypeScript strict | Sin errores de lint |
| 1.3 | Configurar Prisma con schema.sqlite | `npx prisma db push` crea tablas |
| 1.4 | Configurar variables de entorno (.env.example) | DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL |
| 1.5 | Crear estructura de carpetas src/ | Organización según sección 3 |

### Fase 2: Autenticación

| # | Tarea | Criterio de aceptación |
|---|-------|------------------------|
| 2.1 | Configurar NextAuth con Email provider | Magic link enviado por SMTP |
| 2.2 | Implementar API POST /api/auth/register | Crea usuario con email, sin password |
| 2.3 | Validar username único en registro | Retorna error si ya existe |
| 2.4 | Crear página /login | Solo email (magic link), sin password |
| 2.5 | Crear página /register | Email (del magic link) + username |
| 2.6 | Proteger rutas /home, /ranking, /perfil | Redirect a /login si no hay sesión |
| 2.7 | Middleware para autenticación | Sesión persiste entre páginas |

### Fase 3: Registro de burpees

| # | Tarea | Criterio de aceptación |
|---|-------|------------------------|
| 3.1 | API POST /api/records | Crea registro, valida fecha hoy/ayer |
| 3.2 | API GET /api/records | Lista historial (limit 20) |
| 3.3 | API GET /api/me | Retorna usuario + challenge + total |
| 3.4 | Componente BurpeeInput | Input numérico con +/-1, +/-10 |
| 3.5 | Componente TotalDisplay | Muestra 10K, progreso, día, Rx, índice |
| 3.6 | Bottom sheet para registrar | UX según DESIGN sección 7 |
| 3.7 | Crear Challenge con primer registro | startDate = activityDate |
| 3.8 | Actualizar totalBurpees en Challenge | Al crear cada registro |

### Fase 4: Página Home

| # | Tarea | Criterio de aceptación |
|---|-------|------------------------|
| 4.1 | Cargar datos de usuario en Home | Datos de /api/me |
| 4.2 | Mostrar TotalDisplay con progreso | 0/10.000 si nuevo |
| 4.3 | Mostrar "Día N de 365" | Calculado desde startDate |
| 4.4 | Mostrar "@username · Total Rx · Índice%" | Si hay registros |
| 4.5 | CTA "REGISTRAR BURPEES" | Abre bottom sheet |
| 4.6 | Estados: loading, empty, error | Skeleton, mensaje vacío, error handling |
| 4.7 | Historial de registros en Home | Últimos 5 registros |

### Fase 5: Páginas secundarias

| # | Tarea | Criterio de aceptación |
|---|-------|------------------------|
| 5.1 | Página /ranking | Placeholder "Ranking en construcción" |
| 5.2 | Página /perfil | Stats básicos: Total, Rx, Índice Rx, día |
| 5.3 | BottomNav con 3 destinos | Inicio, Ranking, Perfil |
| 5.4 | Links funcionales entre páginas | Navegación fluida |

### Fase 6: i18n y polish

| # | Tarea | Criterio de aceptación |
|---|-------|------------------------|
| 6.1 | Extraer todos los textos a /locales/es.json | No hardcoded strings en UI |
| 6.2 | Validación Zod en cliente y servidor | Errores claros para el usuario |
| 6.3 | Validación de cantidad máxima | Confirmación si > 1000 |
| 6.4 | Toast/success message tras registro | Feedback "+N BURPEES" |
| 6.5 | Responsive design mobile-first | Funciona en 375px de ancho |

---

## 6. Tests

### 6.1 Tests unitarios

| # | Test | Criterio |
|---|------|----------|
| T1 | calculateTotal(records) | Suma correcta excluyendo VOIDED |
| T2 | calculateRxIndex(records) | Porcentaje correcto |
| T3 | calculateDay(startDate) | Día actual de 365 |
| T4 | validateActivityDate(date) | Acepta hoy/ayer, rechaza demás |
| T5 | validateUsername(username) | Formato válido, único |
| T6 | calculateRxIndex(records) | Porcentaje correcto según fórmula PO |

### 6.2 Tests de integración

| # | Test | Flujo |
|---|------|-------|
| T7 | Registro + Login | Usuario se registra, puede hacer login |
| T8 | Primer registro crea reto | POST /api/records crea Challenge con startDate |
| T9 | Total se actualiza | Después de registro, GET /api/me devuelve nuevo total |
| T10 | Historial devuelve registros | GET /api/records sin auth retorna 401 |
| T11 | Redirección sin auth | Acceder a /home sin sesión redirige a /login |

### 6.3 Criterio de pass
- Todos los tests unitarios pasan
- Tests de integración cubran happy path y casos de error principales
- Coverage mínimo: 70% en lógica de dominio

---

## 7. Decisiones del Product Owner

Las siguientes decisiones fueron tomadas por el Product Owner el 2026-10-01:

| # | Decisión | Fuente |
|---|----------|--------|
| D1 | Auth: Magic Link (no credentials) | Decisión PO |
| D2 | DB: PostgreSQL desde el inicio | Decisión PO |
| D3 | Username: mutable conceptualmente | Decisión PO |
| D4 | Grupo piloto: tabla PilotGroup, sembrada al deploy | Decisión PO |
| D5 | Límite diario: sin límite (confirmación UX para cantidades extraordinarias) | Decisión PO |
| D6 | Índice Rx: SUM(qty RX_VERIFIED) / SUM(qty no VOIDED) * 100 | Decisión PO |

---

## 8. Criterios técnicos de calidad

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] TypeScript strict sin advertencias
- [ ] Todos los endpoints API retornan formato `{"success": true/false, "data": ..., "error": ...}`
- [ ] Password nunca en logs ni response
- [ ] Inputs validados con Zod en servidor
- [ ] UUID en lugar de IDs secuenciales
- [ ] Sesión en httpOnly cookie
- [ ] Textos extraídos a `locales/es.json`

---

## 9. Riscos identificados

|| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| SMTP para magic links requiere configuración externa | Media | Medio | Usar servicio SMTP estándar (Gmail, Resend, etc.) |
| Schema evoluciona con slices | Media | Bajo | Migration steps documentados |
| Fecha hoy/ayer confunde zona horaria | Baja | Medio | Usar UTC en DB, mostrar en zona local |

---

## 10. Handoff a QA

Después de implementar, el Developer entrega:
1. Repositorio con código en rama `slice-1-auth-records-total`
2. Build passing
3. Tests passing
4. Este IMPLEMENTATION_PLAN.md marcado como ejecutado

QA recibe:
- Criterios de aceptación de cada tarea (secciones 4.x)
- Casos de prueba derivados de DESIGN y PRD
- Acceso al entorno local para testing

---

*Plan creado por Developer para Slice 1. Sujeto a aprobación implícita si no hay bloqueos en 7 días.*