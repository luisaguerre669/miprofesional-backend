# AUDITORIA TECNICA COMPLETA - MiProfesional

> Proyecto referido por el usuario como "MiProfesionalYa". **La marca "MiProfesionalYa" NO existe en el código**: el nombre real es **MiProfesional** (`MiProfesional/frontend/index.html`, `capacitor.config.ts` appName). No se modificó ningún archivo del proyecto en esta auditoría.

- Fecha: 2026-08-13
- Modo: **solo lectura** (GET a endpoints públicos en vivo + inspección estática). Sin fixes, sin deploys, sin migraciones, sin escribir en la base ni en Mercado Pago.
- Verificación en vivo: `https://miprofesional-backend.onrender.com` y `https://www.miprofesional.online` responden correctamente.

> **ACTUALIZACIÓN (2026-09-13):** la **promoción de lanzamiento (700 cupos / 60-90 días gratis) fue ELIMINADA por completo** del backend (`src/` y legado `MiProfesional/backend`) y del frontend (`plansConfig`, `MainBanner`, `Home`, `ProfessionalDashboard`, `Register`, `SubscriptionPage`, `EmpresasPage`, `CompanyDashboard`, `TermsPage`, `i18n`). Se borraron `src/routes/promo.js`, `src/models/PromoCounter.js`, `hooks/usePromo.js`, `utils/promoLabels.js` y se desconectó `/api/promo`. Desde el alta, Profesionales, Comercios y Empresas inician el flujo de pago de Mercado Pago (son redirigidos a `/subscriptions`). El Cliente sigue 100% gratuito. Toda mención histórica a la promo en esta auditoría corresponde al estado previo.

---

## A. RESUMEN EJECUTIVO

### El proyecto está VIVO y funcionando, pero hay discrepancias críticas entre lo que dice el repo y lo que corre en producción.

1. **El backend desplegado en Render es el de la RAÍZ (`D:\proyecto_verdent\src`, v2.0.0)**, NO el de `D:\proyecto_verdent\MiProfesional\backend` que sugiere `render.yaml`. El `render.yaml` está desactualizado/engañoso (dice `rootDir: MiProfesional/backend`).
2. **El plan Profesional en producción sigue en $5.000** (debe ser $10.000). Comercio en $10.000 y Empresa en $20.000. **Ya no se otorgan días de prueba** (promoción de 60/90 días eliminada por completo).
3. **Categoría "Belleza y Cuidado" rota en producción**: `GET /api/categories/slug/belleza-y-cuidado` → **404**. No existe como categoría de primer nivel en la BD en vivo (solo existe como subcategoría `prof-belleza`). Sin embargo el frontend tiene enlaces duros a `/categoria/belleza-y-cuidado` (Home.jsx:66, Layout.jsx:310, Register.jsx:259).
4. ~~Feature 700 cupos~~ **Promoción de lanzamiento ELIMINADA por completo** (backend + frontend), incluyendo `/api/promo/status`: `src/routes/promo.js` y `src/models/PromoCounter.js` fueron borrados, igual que los hooks/textos del frontend. Nuevos Profesionales/Comercios/Empresas pagan desde el alta vía Mercado Pago.
5. **No existen tests** en todo el repo (0 archivos de test). Jest/Supertest configurados en devDeps pero sin jest.config y sin ningún test.
6. **Android NO existe**: no hay carpeta `android/`. Solo iOS en `frontend/ios/`. appId fue cambiado de `online.miprofesional.app` a `com.miprofesional.app` sin re-sincronizar iOS.
7. `src/server.js` y `src/scripts/categoryData.js` tienen **cambios sin commitear** (categorías premium 32). El deploy de Render está por detrás del working tree.

**Puntaje de preparación general: ~45%** (igual que auditoría previa; el estado de producción confirma que no hay que tocar nada más antes de actualizar la app Android).

---

## B. ARQUITECTURA REAL DETECTADA

### Hay DOS backends en el repo:

| Backend | Ruta | Estado | Quién lo usa |
|---|---|---|---|
| **A (RAÍZ, ACTIVO)** | `D:\proyecto_verdent\src` | Es el que corre en Render (verificado en vivo, v2.0.0) | Producción |
| **B** | `D:\proyecto_verdent\MiProfesional\backend` | Parálisis / duplicado. Render.yaml dice que se usa pero NO es el que responde | Solo repo |

### Prueba de que el backend vivo es el de raíz (A):
- `GET https://miprofesional-backend.onrender.com/` → endpoints listados: `/api/health`, `/api/auth`, `/api/professionals`, `/api/categories`, `/api/bookings`, `/api/chat`, `/api/users`, `/api/upload`, `/api/admin`, `/api/analytics`, `/api/reviews`, `/api/identity`, `/api/subscription`, **`/api/v1/mercadopago`** → coinciden EXACTAMENTE con los montados en `src/server.js` (líneas 173-189).
- `GET /api/payments`, `/api/geocode`, `/api/audit` → **404**. El backend B monta esos (vía `mount()` en `MiProfesional/backend/src/server.js:42`), así que NO es el que corre.
- `GET /health` → `version: "2.0.0"`, `developer: "LUIS AGUERRE"` → coincide con `src/routes/health.js:23` (y con `MiProfesional/backend/src/routes/health.js` también, pero la prueba anterior desambigua).

### Frontend:
- `MiProfesional/frontend` (Vite + React). Desplegado en Vercel: `https://www.miprofesional.online` (verificado, responde, título "MiProfesional - Marketplace de Servicios Profesionales").
- `vercel.json` raíz es un redirect estático a `/`, **no** es el deploy real. El deploy real es `MiProfesional/frontend/vercel.json` (vite).

---

## C. ESTRUCTURA DEL REPOSITORIO

```
D:\proyecto_verdent\
├── src\                        → Backend A (ACTIVO, corre en Render) v2.0.0
│   ├── server.js               → entrada principal (main del package.json)
│   ├── routes\                 → 18 routers (auth, categories, professionals, subscription, mercadopago.routes, etc. — `promo.js` **ELIMINADO el 2026-09-13**)
│   ├── models\                 → User, Professional, Category, Payment, PaymentAudit, Booking, Review, Message, Conversation, Notification, ContactRequest, CurriculumVitae (`PromoCounter.js` **ELIMINADO el 2026-09-13**)
│   ├── middleware\             → auth, rateLimiter, inputSanitizer (NoSQL sanitizer)
│   ├── services\               → paymentService, emailTemplates, eventBus, cron (subscriptionCron activo)
│   ├── config\                 → db, email, plans?? (NO existe plans.js en raíz — precios hardcodeados en subscription.js)
│   └── scripts\                → seed.js, seed-comercio.js, categoryData.js (categorías 32 — diffs sin commitear)
├── MiProfesional\
│   ├── backend\                → Backend B (duplicado, NO desplegado pese a render.yaml)
│   │   └── src\                → server.js con mount() genérico; models incluye AuditLog, AnalyticsEvent (no en A)
│   └── frontend\               → Vite+React (desplegado en Vercel)
│       ├── vercel.json         → deploy real del frontend
│       ├── capacitor.config.ts → appId com.miprofesional.app, appName MiProfesional, sin server.url
│       └── ios\                → proyecto Xcode existente
├── render.yaml                 → dice rootDir: MiProfesional/backend (DESACTUALIZADO)
├── vercel.json                 → redirect estático raíz (no es el deploy real)
├── .env                        → secretos viejos (NO rotados)
├── env-local-config.txt        → SECRETOS EN TEXTO PLANO (aún presente en raíz, aunque borrado en MiProfesional/backend)
├── docs\                       → README-STRANGLER, deploy-instructions (referencian archivos que no existen)
└── AUDITORIA_TECNICA_COMPLETA_MIPROFESIONAL.md  (este reporte)
```

---

## D. FRONTEND (WEB) — MAPA DE RUTAS (App.jsx)

### Públicas
| Ruta | Página |
|---|---|
| `/` | Home |
| `/login` | Login |
| `/register` | Register |
| `/search` | Search |
| `/service/:id` | ServiceDetail |
| `/categoria/:slug` | CategoryPage |
| `/categorias` | Categories |
| `/profesionales/:slug` | ProfessionalProfile |
| `/verify-email` | VerifyEmail |
| `/forgot-password`, `/reset-password` | Password flows |
| `/terms` | Terms |
| `/empresas` | EmpresasPage |
| `/comercios` | ComerciosPage (ARCHIVO SIN COMMITEAR `ComerciosPage.jsx` es untracked) |
| `/payment/success`, `/payment/failure`, `/payment/pending` | Redirects de pago MP |

### Protegidas
`/dashboard/client`, `/dashboard/professional`, `/dashboard/company`, `/messages`, `/chat/:userId`, `/profile`, `/cv`, `/candidatos`, `/cv-search`, `/admin/*`, `/subscriptions`, `/settings`, `/notifications`.

### Notas de frontend
- ~~utils/promoLabels.js~~ **eliminado** (promo). ComerciosPage.jsx y hooks quedan como cambios locales sin commitear → la sección Comercios nueva puede no estar en Vercel aún.
- Home.jsx, CategoryPage.jsx, MainBanner.jsx, EmpresasPage.jsx, ProfessionalDashboard.jsx, Register.jsx, Search.jsx, App.jsx: **modificados sin commitear** (working tree adelantado respecto del deploy).

---

## E. BACKEND / API

### Endpoints públicos verificados en vivo
- `GET /health` → OK, db conectada, Node v26.5.0, memoria ~115MB.
- `GET /` → OK.
- `GET /api/subscription/plans` → OK (devuelve planes, ver sección G).
- `GET /api/categories` → OK, 11 categorías de primer nivel en vivo.
- `GET /api/categories/slug/profesionales` → OK (con subcategorías).
- `GET /api/categories/slug/belleza-y-cuidado` → **404** (la categoría no existe en vivo).
- `GET /api/promo/status` → **eliminado** (feature de promoción de lanzamiento suprimida por completo).
- `GET /api/v1/mercadopago/webhook` → OK (`{ok:true, version:"2.0.0"}`).
- `GET /api/v1/mercadopago/payments/stats` → 401 (protegido, correcto).
- `GET /api/auth/me` (sin token) → 401 (correcto).
- `GET /api/payments`, `/api/geocode`, `/api/audit` → 404 (confirma que B no corre).

### Backend A — riesgos detectados
- `src/routes/subscription.js:13-15` — precios hardcodeados: `PRO_PRICE=5000`, `COMMERCE_PRICE=10000`, `COMPANY_PRICE=20000`. No hay `src/config/plans.js`.
- ~~`src/routes/subscription.js:20` — trialLabel distinguiendo 60 días vía `getTrialDays()`~~ **ELIMINADO (2026-09-13)**: ya no hay `trialLabel` ni `trialDays`/cupos en `/api/subscription/plans`.
- `src/routes/subscription.js:261` — regex de external_reference para parsear plan/userId: `^pre_(professional|commerce|company)_(.+)_\d+$` — si el formato cambia, se pierde el match y cae a fallback.
- `src/routes/subscription.js:330-331` — webhook de subscription responde **siempre 200** aunque falle el procesamiento (`catch` devuelve `{ok:true}`). Con MP es lo correcto (evita reintentos en cascada) pero hay que auditar manualmente (se guarda log vía logger).
- `src/server.js` — hay cambios sin commitear (promo routes agregadas, línea 184). El deploy actual de Render no las tiene.

### Backend B — no desplegado, pero con modelos únicos
- Tiene `AuditLog` y `AnalyticsEvent` que A **no** tiene.
- Tiene `/api/mercadopago` y `/api/payments` (controller Payment con Preference) que A no monta (A usa `/api/v1/mercadopago`).
- Duplicidad de lógica = riesgo de drift (uno u otro se corrige, el otro queda viejo).

---

## F. MONGODB — MODELOS

### Modelos comunes A+B
`User`, `Professional`, `Category`, `CurriculumVitae`, `Payment`, `PaymentAudit`, `Booking`, `Review`, `Message`, `Conversation`, `Notification`, `ContactRequest`.

### Solo en A (raíz, activo) — **`PromoCounter` ELIMINADO (2026-09-13)**
~~`PromoCounter` (key `first_700`, count). Usado en `auth.js` (register profesional/commerce/company → `incrementPromo`, `getTrialDays`), `subscription.js` (`getTrialDays`, `getRemainingSpots`), `routes/promo.js`.~~ El modelo, su uso en `auth.js`/`subscription.js` y `routes/promo.js` fueron eliminados por completo junto con toda la promo.

### Solo en B
`AuditLog`, `AnalyticsEvent`.

### Roles reales
`client`, `professional`, `company` (dashboard company acepta `company|employer|admin`). No existen modelos Commerce/Company/Employer separados — se maneja por `User.role` + campos de `Professional`.

### Índices
- `Professional.js` — ~~`index({ promoApplied: 1 })`~~ **ELIMINADO (2026-09-13)** junto con el campo `promoApplied` del esquema.
- NO VERIFICADO: estado real de colecciones/índices en MongoDB Atlas (solo lectura de código; no se consultó la BD).

---

## G. MERCADO PAGO Y SUSCRIPCIONES

### Estado en vivo (verificado)
`GET /api/subscription/plans` → (coincide EXACTO con `src/routes/subscription.js`):

| Plan | id | Precio vivo | Precio objetivo | Trial vivo | Trial objetivo | ¿OK? |
|---|---|---|---|---|---|---|
| Profesional | professional | **$5.000** | **$10.000** | 60 días | 60 días | ❌ precio |
| Comercio | commerce | $10.000 | $10.000 | **60 días** | **90 días** | ❌ trial |
| Empresa | company | $20.000 | $20.000 | 60 días | 60 días | ✅ |

- Los 3 planes ya **no** muestran cupos ni días gratis (promoción eliminada el 2026-09-13; antes mostraban "quedan 700 cupos" vía `getRemainingSpots`).
- Código actual en `src/routes/subscription.js` = **trial eliminado**; precios vigentes $5.000 (Prof), $10.000 (Com), $20.000 (Emp).
- ~~Comercio usa `trialDays` global (60) — no tiene trial diferenciado de 90 días~~ **Obsoleto**: ya no existe `trialDays` ni `trialLabel` con cupos.

### Integración
- SDK `mercadopago@^2.12.1` (A y B).
- `MercadoPagoConfig` + `PreApproval` (subscription.js) para suscripción recurrente mensual.
- `PaymentService` / `PaymentAudit` para idempotencia de webhooks.
- Webhook `/api/v1/mercadopago/webhook` → verifica firma (fix previo), responde OK.
- `paymentService.js:112` — usa `webhookData.api_version` para validar versión de API.

---

## H. AUTENTICACIÓN Y SEGURIDAD

### Correcto
- `GET /api/auth/me` sin token → 401 (no 403).
- `GET /api/v1/mercadopago/payments/stats` → 401 sin token (protegido).
- Sanitizer NoSQL activo en B (`inputSanitizer.js`) y en A (misma clase de middleware).
- Rate limiter salta OPTIONS (fix previo en B; verificar en A).
- JWT con `expiresIn: 1h`, refresh `7d` (render.yaml).

### Riesgos
1. 🔴 **`env-local-config.txt` en la raíz aún existe** (`D:\proyecto_verdent\env-local-config.txt`) con secretos en texto plano. Se borró en `MiProfesional/backend/` pero la raíz lo conserva. Respaldos viejos: `D:\Backup mi profesional\Backup_2026-06-05-164352\...\env-local-config.txt`.
2. 🔴 **`.env` raíz no fue rotado** — la rotación de JWT (fix previo) se hizo en `MiProfesional/backend/.env`, pero el `.env` de la raíz (que es el backend que corre) **no** fue actualizado.
3. ✅ Promoción de lanzamiento eliminada por completo: `promo.js`, `PromoCounter.js` y toda la UI de cupos/días gratis fueron removidos (backend y frontend).
4. 🟠 Duplicidad de secretos entre A y B aumenta superficie de exposición.

---

## I. PRODUCCIÓN Y DESPLIEGUE

### Render
- URL: `https://miprofesional-backend.onrender.com`.
- `render.yaml` dice `rootDir: MiProfesional/backend` → **NO coincide con la realidad** (el que responde es `src/` de raíz). Debe corregirse el archivo para que refleje el deploy real, o aclarar que Render usa config manual en dashboard.
- `healthCheckPath: /health` → OK (verificado).
- `autoDeploy: true` → cuando se commitea, Render despliega... pero el working tree tiene cambios sin commitear que aún no están en producción.
- `MERCADOPAGO_WEBHOOK_SECRET` en render.yaml → confirmar que está set en dashboard (sync: false).

### Vercel
- URL frontend: `https://www.miprofesional.online` (verificado, responde).
- Deploy real: `MiProfesional/frontend/vercel.json` (framework vite).
- `vercel.json` raíz = redirect estático, engañoso.

### Dominios
- BACKEND_URL: `https://miprofesional-backend.onrender.com`
- FRONTEND_URL: `https://www.miprofesional.online`
- VITE_API_URL: `https://miprofesional-backend.onrender.com/api`

---

## J. CAPACITOR / ANDROID / iOS

### Config (capacitor.config.ts)
- `appId: "com.miprofesional.app"` (cambiado desde `online.miprofesional.app`).
- `appName: "MiProfesional"`.
- `webDir: "dist"`.
- NO `server.url` (app nativa offline-first; las llamadas van a BACKEND_URL).
- Plugins: SplashScreen, Keyboard, StatusBar.

### Estado
- 🔴 **NO existe `android/`** → no hay AndroidManifest, no hay firma/keystore, no hay APK/AAB. La app **no se puede publicar en Google Play aún** (falta `npx cap add android` + firma).
- 🟠 Proyecto iOS existe en `frontend/ios/`, pero el appId se cambió a `com.miprofesional.app` sin re-sync → iOS puede seguir con el appId viejo. NO VERIFICADO en detalle.
- `frontend/ios/` tiene Capacitor SDK instalado (fix previo "remove Capacitor from web build graph" fue solo para web).

---

## K. TESTS Y CALIDAD

- 🔴 **CERO tests en todo el repo** (0 archivos `*.test.js` / `*.spec.js` / `__tests__`). `npm test` fallaría ("No tests found").
- Jest + Supertest en devDependencies del root `package.json` pero **sin jest.config** y sin tests.
- ESLint declarado pero **sin archivo de config** (`.eslintrc` / `eslint.config.*` no encontrado).
- Docs: `README-STRANGLER.md` (arquitectura strangler/auth-service) y `deploy-instructions.md` referencian `test-cloud-production.js` que **no existe**.

---

## L. WEB vs ANDROID — MATRIZ FUNCIONAL

| Funcionalidad | Web (producción) | Android |
|---|---|---|
| Home con categorías | ✅ (11 categorías) | ❌ sin app |
| Categoría Belleza y Cuidado | ❌ 404 en backend | ❌ |
| Búsqueda | ✅ | ❌ |
| Registro/Login | ✅ | ❌ |
| Chat | ✅ | ❌ |
| Suscripciones (planes) | ✅ (precios viejos) | ❌ |
| Mercado Pago (success/failure/pending) | ✅ | ❌ |
| Notificaciones push (FCM) | NO aplica | ❌ NO configurado |
| Geolocalización | ✅ (coords) | NO VERIFICADO (plugin Geolocation) |
| Pagos en app | Web redirect a MP | ❌ (Capacitor no tiene deep-link MP configurado) |

**Nota**: la app web funciona; Android es una app desde cero en términos de Google Play.

---

## M. PROBLEMAS ENCONTRADOS — CLASIFICACIÓN

### 🔴 CRÍTICOS
1. `render.yaml` apunta al backend equivocado (`MiProfesional/backend`) — la realidad es que corre `src/` de raíz. Riesgo: deploy futuro "correcto" según archivo rompería producción.
2. Precios desactualizados en producción: Plan Profesional **$5.000** (debe $10.000) — `src/routes/subscription.js:13`.
3. ~~Trial de Comercio 60/90 días~~ **Eliminado**: la promoción y los períodos de prueba fueron removidos por completo (ya no se otorgan días gratis en el alta).
4. Categoría `belleza-y-cuidado` rota en producción (404) pero enlazada desde Home.jsx:66, Layout.jsx:310, Register.jsx:259. La categoría no fue creada/migrada en la BD en vivo.
5. ~~Feature 700 cupos~~ **Eliminada por completo** (`promo.js`, `PromoCounter.js` y UI de cupos removidos; ya no existe `/api/promo/status`).
6. **No existe Android** (carpeta `android/`) → bloquea Google Play.
7. `env-local-config.txt` con secretos aún presente en la raíz del repo.

### 🟠 ALTOS
8. `.env` raíz no rotado (JWT/MP secretos viejos siguen en el backend activo).
9. Backend duplicado (A vs B) con drift de modelos y rutas → riesgo de corregir el que no corre.
10. Cambios sin commitear en categorías premium (32) → el deploy no refleja el working tree.
11. Sin tests ni CI → cualquier cambio de precios/categorías puede romper producción sin detección.
12. ComerciosPage.jsx y hooks untracked → sección Comercios puede no estar desplegada.

### 🟡 MEDIOS
13. `docs/` con referencias a archivos inexistentes (`test-cloud-production.js`, README-STRANGLER).
14. `vercel.json` raíz engañoso (static redirect nombrado "miprofesional-backend").
15. Precios hardcodeados en `subscription.js` (sin `config/plans.js`) → difícil de mantener.
16. `GET /api/categories` devuelve 11 categorías; el código (categoryData.js) tiene 32 → la BD en vivo no se migró con las categorías nuevas.

### 🔵 BAJOS
17. Webhook de subscription responde siempre 200 en catch (correcto para MP, pero requiere monitoreo de logs).
18. Indentación inconsistente en `server.js` (líneas 183-189) — menor.

### 🟢 CORRECTO / OK
- Health y DB conectada en producción.
- `/api/auth/me` y stats MP devuelven 401 sin auth (protección correcta).
- Webhook MP responde OK y verifica firma.
- Frontend web desplegado y respondiendo.
- Promo y 700 cupos: **ELIMINADOS** (véase nota de actualización al inicio del documento).

---

## N. PLAN DE CORRECCIÓN (FASE 1-4)

### FASE 1 — Críticas (bloquean cualquier release)
1. Decidir backend único: **el backend canónico es `src/` (raíz)**. Actualizar `render.yaml` para que apunte a la raíz (rootDir: `.`) o documentar que Render usa config del dashboard.
2. **Commitear** `src/routes/categories.js`, `src/scripts/categoryData.js`, `ComerciosPage.jsx`, hooks. (Los archivos de promo `promo.js`, `PromoCounter.js` y `promoLabels.js` ya fueron eliminados por completo.)
3. **Corregir precios en vivo**: definir el precio final de `PRO_PRICE` en `src/routes/subscription.js` (hoy $5.000). Ya no aplica trial por plan (promoción eliminada el 2026-09-13). Mover precios a `src/config/plans.js`.
4. **Crear/migrar categoría "Belleza y Cuidado"** en la BD en vivo (o alinear los slugs del frontend a las categorías reales). Ejecutar migración `src/scripts/migrate-commerce-subcategories.js` (untracked).
5. **Rotar secretos en el `.env` de la raíz** (JWT_SECRET, JWT_REFRESH_SECRET, MERCADOPAGO_ACCESS_TOKEN) y eliminar `env-local-config.txt` de la raíz. Agregar a `.gitignore` si no está.
6. **Crear la app Android**: `npx cap add android`, configurar manifest, permisos (Internet, geolocalización si aplica), y firma (keystore).

### FASE 2 — Funcionalidad de la app
7. Alinear el frontend desplegado con el working tree (redeploy Vercel).
8. Desplegar las categorías nuevas (32) y la sección Comercios.
9. Verificar deep-link de pago MP en Capacitor (o mantener flujo web).
10. Revisar integración de geolocalización en Android.

### FASE 3 — Capacitor/Android específico
11. Sincronizar appId en iOS (`com.miprofesional.app`) — `npx cap sync`.
12. Probar app Android en dispositivo/emulador contra `BACKEND_URL` (sin `server.url`, la app usa la API remota directamente).
13. Configurar iconos/splash (plugins ya declarados).

### FASE 4 — Google Play Console
14. Cuenta de desarrollador, DUNS (si aplica), Data Safety, Política de privacidad (Terms ya existen), API target, prueba cerrada, Firma de Play App (AAB).
15. Subir AAB firmado con keystore seguro.

---

## O. CHECKLIST FINAL GOOGLE PLAY (estado actual)

| Requisito | Estado |
|---|---|
| Proyecto Android (`android/`) | 🔴 NO existe |
| AAB firmado | 🔴 No |
| appId definitivo | 🟡 `com.miprofesional.app` (confirmar con keystore) |
| Iconos/splash/adaptive | 🟡 No generados |
| Permisos AndroidManifest | 🔴 No configurados |
| Data Safety / Privacy policy | 🔴 Falta (Terms existen en web) |
| Tests | 🔴 0 |
| Backend canónico unificado | 🔴 Dos backends + render.yaml incorrecto |
| Precios (Prof $5.000 / Com $10.000 / Emp $20.000) | 🟡 Confirmados; ya no hay días de prueba (promoción eliminada) |
| Categoría Belleza y Cuidado | 🔴 404 en vivo |
| Feature 700 cupos (promoción) | ✅ Eliminada por completo (backend + frontend) |
| Frontend web OK | ✅ |
| Backend v2.0.0 con DB conectada | ✅ |
| Webhooks MP OK | ✅ |

---

## RECOMENDACIÓN

**No publicar aún en Google Play.** Hay que completar Fase 1 (unificar backend, commitear features, corregir precios, rotar secretos, crear Android) antes de armar el AAB. El frontend web y el backend v2.0.0 están operativos; la deuda es de configuración/despliegue, no de funcionalidad base.
