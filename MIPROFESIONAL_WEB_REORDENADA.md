# MiProfesionalYa — FASE DE ORDENAMIENTO Y REDISEÑO FUNCIONAL (WEB)

> Fase ejecutada sobre `MiProfesional/frontend` (Vite + React, desplegado en Vercel) para dejarlo como versión maestra, limpia, coherente y mobile-first, fuente de la futura app Android.
>
> **Alcance**: solo código local controlado. Sin deploy, sin APK/AAB, sin Google Play, sin migraciones destructivas en MongoDB, sin rotar secretos, sin modificar credenciales de Mercado Pago.
>
> - Fecha: 2026-08-13
> - Backend de producción: `D:\proyecto_verdent\src` (raíz, v2.0.0, corre en Render)
> - Frontend publicado: `MiProfesional/frontend` (Vercel)
> - Verificación en vivo: `https://miprofesional-backend.onrender.com` y `https://www.miprofesional.online`
>
> **ACTUALIZACIÓN (2026-09-13):** la **promoción de lanzamiento (700 cupos / 60-90 días gratis) fue ELIMINADA por completo** (backend `src/` y legado, y frontend): se borraron `src/routes/promo.js`, `src/models/PromoCounter.js`, `hooks/usePromo.js`, `utils/promoLabels.js` y toda la UI de cupos/imágenes de promoción. Ya **no existen días gratis ni período de prueba** para Profesionales, Comercios ni Empresas: desde el alta deben **pagar mediante el flujo de pago de Mercado Pago** (el registro los redirige a `/subscriptions`). **El Cliente continúa gratuito** y **los precios no se modificaron** ($5.000 / $10.000 / $20.000). Los cambios permanecen **solo locales** (sin commit ni push). Las menciones históricas de cupos/prueba en este documento corresponden al estado previo.

---

## 1. CORRECCIÓN DEL REPORTE PREVIO: EL PRECIO DE $5.000 ES CORRECTO

El informe `AUDITORIA_TECNICA_COMPLETA_MIPROFESIONAL.md` marcaba como error que el Plan Profesional estuviera en **$5.000/mes** (afirmaba que debía ser $10.000).

**Corrección confirmada por el cliente**: el precio correcto es **$5.000/mes**. El reporte previo estaba equivocado en ese punto. El código backend actual (`src/routes/subscription.js:13-15`) ya refleja el modelo comercial correcto:

| Plan | Precio mensual | Prueba / promoción |
|---|---|---|
| Cliente | Gratis | — |
| Profesional | **$5.000** | ~~60 días / primeros 700~~ **ELIMINADA (2026-09-13)** |
| Comercio | **$10.000** | ~~90 días~~ **ELIMINADA (2026-09-13)** |
| Empresa | **$20.000** | ~~60 días~~ **ELIMINADA (2026-09-13)** |

> Los precios no se modificaron. Las columnas de días gratis/cupos correspondían a la promoción de lanzamiento, **hoy eliminada**: Profesionales, Comercios y Empresas pagan desde el alta vía Mercado Pago.

---

## 2. FUENTE ÚNICA DE PRECIOS Y PROMOCIONES (CREADA)

Se creó `MiProfesional/frontend/src/config/plansConfig.js` como **única fuente de verdad** del frontend para precios y marca:

- `BRAND` → `MiProfesionalYa`, tagline "Todo lo que necesitás, cerca tuyo.", url `miprofesional.online`.
- `PRICES` → `{ client: 0, professional: 5000, commerce: 10000, company: 20000 }`.
- ~~`TRIAL_DAYS` (60/90/60 días)~~ **ELIMINADO (2026-09-13)**: ya no existe en `plansConfig`; no se otorga ni muestra prueba gratuita.
- ~~`PROMO` (total 700, "60 días gratis para los primeros 700 profesionales")~~ **ELIMINADO (2026-09-13)**: sin cupos ni contador ni textos de promo.
- `SEMESTER_DISCOUNT_PCT` = 10 y `SEMESTER_PLANS` precalculados (ver punto 3).
- `SEMESTER_AVAILABLE_IN_MP = false`.
- `PLAN_DETAILS` (4 planes) + `formatARS` / `formatARSDecimal`.

Se reemplazaron todos los precios hardcodeados del frontend por esta config en: `Layout.jsx`, `EmpresasPage.jsx`, `TermsPage.jsx`, `Register.jsx`, `Home.jsx`, `ProfessionalDashboard.jsx`, `MainBanner.jsx` y `SubscriptionPage.jsx`.

---

## 3. PLAN SEMESTRAL (6 MESES): PREPARADO EN FRONTEND, PENDIENTE EN MERCADO PAGO

- **Frontend**: `plansConfig.js` precalcula el plan de 6 meses de contado con 10% de descuento:
  - Profesional: 6×$5.000 = $30.000 → **$27.000** (ahorro $3.000)
  - Comercio: 6×$10.000 = $60.000 → **$54.000** (ahorro $6.000)
  - Empresa: 6×$20.000 = $120.000 → **$108.000** (ahorro $12.000)
- **UI**: `SubscriptionPage.jsx` ahora muestra la sección "Pago semestral" con las 3 tarjetas (precio mensual, total 6 meses tachado, precio con descuento y ahorro), pero **deshabilitadas con badge "Próximamente"** porque `SEMESTER_AVAILABLE_IN_MP = false`.
- **Backend**: **no existe** plan semestral. `src/routes/subscription.js` solo implementa suscripción mensual recurrente vía PreApproval de Mercado Pago. Hasta que el backend lo soporte, **NO se ofrece como pago real** en la UI.

---

## 4. CATEGORÍAS: ENLACES ROTOS CORREGIDOS

### Categorías raíz reales en vivo (11, verificadas con GET /api/categories/tree)
`profesionales`, `24-7`, `empresas`, `comercio`, `legales-y-administracion`, `construccion-y-hogar`, `hogar-diseno`, `tecnologia`, `mascotas`, `educacion`, `seguridad`.

### Problema detectado
El frontend enlazaba slugs de primer nivel que **no existen** en la BD en vivo:
- `/categoria/belleza-y-cuidado` → **404** (existe solo como subcategoría `prof-belleza` de `profesionales`).
- `/categoria/salud` → **404** (existe como `prof-salud`).
- `/categoria/servicios-generales` → **404** (existe como `prof-servicios`).
- `/categoria/servicios-24-7` → funcionaba por un fallback del backend (`categories.js:445-449` redirige `servicios-24-7` ↔ `24-7`), pero se normalizó al canónico `/categoria/24-7`.

### Correcciones aplicadas (verificadas contra la API en vivo)
| Archivo | Antes | Ahora |
|---|---|---|
| `Home.jsx` promoSlides | `belleza-y-cuidado`, `salud`, `servicios-generales` | `prof-belleza`, `prof-salud`, `prof-servicios` |
| `Home.jsx` banner 24-7 (×3) | `servicios-24-7` | `24-7` |
| `Home.jsx` fallback estático Belleza | `belleza-y-cuidado` | `prof-belleza` |
| `Layout.jsx` footer | `belleza-y-cuidado`, `salud`, `servicios-generales` | `prof-belleza`, `prof-salud`, `prof-servicios` |
| `Register.jsx` GROUP_TO_SLUG | slugs inexistentes (bloqueaban registro) | raíces reales (ver punto 5) |

**Documentado**: no existe categoría raíz "Belleza y Cuidado" en la BD en vivo; es una subcategoría (`prof-belleza`). Los enlaces ahora apuntan a la subcategoría real, que resuelve correctamente vía `/api/categories/slug/prof-belleza`. Pendiente de decisión del negocio si se quiere crear la raíz (requiere migración en MongoDB).

---

## 5. REGISTRO DE PROFESIONALES: MAPEO DE GRUPOS CORREGIDO

`Register.jsx` mapeaba cada grupo de profesión a un slug de categoría para asignar `categoryId` en el alta. Los grupos con slug inexistente hacían que `findCategoryId()` devolviera `undefined` y **bloquearan el registro** con "categoría requerida" (líneas 152-160).

Se corrigió el mapa `GROUP_TO_SLUG` a raíces reales:
- `Servicios Generales` → `profesionales` (antes `servicios-generales`)
- `Belleza y Cuidado` → `profesionales` (antes `belleza-y-cuidado`)
- `Bienestar y Deporte` → `profesionales` (antes `bienestar-y-deportes`)
- `Automotor` → `profesionales` (antes `automotores`)
- `Transporte y Turismo` → `profesionales` (antes `transporte`)
- `Gastronomia` → **agregado** (no tenía entrada, bloqueaba registro de chefs/cocineros)
- `24-7` → `24-7` (antes `servicios-24-7`)

---

## 6. IDENTIDAD VISUAL: MARCA "MiProfesionalYa" UNIFICADA

| Archivo | Cambio |
|---|---|
| `index.html` | title, description, keywords, Open Graph, Twitter Card, apple-mobile-web-app-title y application-name → **MiProfesionalYa** con tagline |
| `public/manifest.json` | name y short_name → MiProfesionalYa |
| `components/Logo.jsx` | texto "MiProfesional" + "Marketplace" → `BRAND.name` + `BRAND.tagline` |
| `Layout.jsx` | copyright → `BRAND.name`; links legales `#` rotos → `/terms` (4 enlaces) |
| `CategoryPage`, `CategoriesPage`, `Search`, `ServiceDetail`, `Login`, `AdminPanel`, `SubscriptionPage` | Helmet/títulos/OG → MiProfesionalYa |
| `ComerciosPage`, `AdBanner` | textos → MiProfesionalYa |
| `TermsPage` | encabezado visible → MiProfesionalYa (el cuerpo legal conserva el nombre registrado "MiProfesional") |

No quedan links `to="#"` en el frontend.

---

## 7. HOME REORDENADO (JERARQUÍA A–J)

`Home.jsx` fue reordenado con jerarquía explícita (orden verificado por grep):

A. Hero (tagline BRAND, botón "Dejar currículum" → `/cv`)
B. Promoción de lanzamiento → Urgent Banner
C. Buscar cerca tuyo (mapa + ads)
D. Para Profesionales / Comercios / Empresas (4 tarjetas)
E. Categorías ("Explorá por categorías")
F. Comercios del barrio (banner amber)
G. Negocios destacados + FEATURED PROS + URGENCIAS + MainBanner
H. Cómo funciona (Buscá / Compará / Contactá)
I. Precios
J. CTA final (gradiente, crear cuenta / publicar servicio)

Banners duplicados eliminados. ~~El texto de promo del banner general (60 días gratis para los primeros 700)~~ **ELIMINADO (2026-09-13)**: ya no existe ningún texto de promo ni cupos en los banners.

---

## 8. DISCREPANCIA BACKEND DETECTADA: TRIAL POR PLAN vs GLOBAL (RESUELTA: PROMO ELIMINADA)

- ~~La API viva `/api/subscription/plans` devolvía `trialDays` para los tres planes.~~ **La promoción y los períodos de prueba fueron eliminados por completo** (backend `src/` y frontend): ya no existe `PromoCounter.js`, `promo.js`, ni `trialDays` en los planes. Profesionales, Comercios y Empresas pagan desde el alta vía Mercado Pago.
- El frontend ya no muestra días de prueba en ninguna página (`plansConfig`, `SubscriptionPage`, `Register`, dashboards, banner).

---

## 9. AUDITORÍA DE GEOLOCALIZACIÓN (HALLAZGOS)

Flujo revisado: `utils/geolocation.js` → `getAccurateLocation()` → `Home.jsx`, `Search.jsx`, `LocationPicker.jsx`, `NearbyProfessionals.jsx`, `ProfessionalsMap.jsx`.

- **Correcto**: GPS del navegador (con 3 intentos de precisión), fallbacks a coordenadas, y la búsqueda de `Search.jsx` envía `location` como `{latitude, longitude}`; el backend la procesa con `maxDistance` (default 50 km) vía índice geoespacial.
- **RESUELTO** ✅ **`/api/geocode/reverse`** (2026-08-13): Service worker en vivo daba 404 (los endpoints vivían en `MiProfesional/backend`, que NO es el backend desplegado — Render corre `src/` raíz). Implementado `src/routes/geocode.js` (GET `/search`, GET `/reverse`) y montado en `src/server.js` bajo `/api/geocode`. Contrato idéntico al backend B que el frontend ya esperaba: `{ success, data: { latitude, longitude, displayName, street, number, city, state, neighborhood } }`.
- **RESUELTO** ✅ **`/api/geocode/search`**: mismo fix que arriba → responde en vivo desde el `src/` raíz.
- **RESUELTO** ✅ **`/api/professionals/geocode` → `success:false`**: **causa raíz: timeout de 8 s** (`AbortSignal.timeout(8000)`) vs cold start de Render ~25 s + primer fetch a Nominatim 32 s. Verificado en vivo: 1er intento 32 s → success, 2-4to ~200 ms. Fix: `src/utils/geocode.js` reescrito con `fetchWithRetry` (3 intentos, timeout 15 s, backoff 1 s), headers con `User-Agent` explícito de Nominatim, validación de coordenadas, y manejo de errores que devuelve `null` (nunca lanza). `geocodeAddress` mantiene su firma → no rompe hooks `pre('save')` de `User.js`/`Professional.js`. Sin resultados o fallo → `{ success: true, data: null }` (200, no 500).
- `Home.jsx` igualmente usa Nominatim directo del navegador (sin depender del backend).
- **Pruebas**: `src/tests/geocode.test.js` (node --test, `npm run test:geocode`) → **13/13 pass** (search real, reverse real, 400s, data:null, errores 403/500/network con fetch mockeado). Verificar en vivo tras redeploy: `GET /api/geocode/search?q=La Plata`, `GET /api/geocode/reverse?lat=-34.92&lng=-57.95`, `GET /api/professionals/geocode?city=La Plata&country=Argentina`.
- **Pendiente para producción (pub)**: push y redeploy de `src/` raíz en Render (render.yaml tiene autoDeploy, así que commit + push bastan).

---

## 10. SECRETOS Y RIESGOS DOCUMENTADOS (NO SE ROTARON EN ESTA FASE)

Por restricción de la fase, **no se rotaron secretos ni se eliminaron archivos**. Se documenta:

- 🔴 `env-local-config.txt` en la raíz (`D:\proyecto_verdent\env-local-config.txt`) sigue trackeado en git (commit `2682f0e`) con secretos en texto plano.
- 🔴 `MiProfesional/backend/env-local-config.txt` también existe trackeado (commit `0f1b5e4`).
- 🔴 `.env` raíz no rotado (es el del backend activo).
- 🟠 `render.yaml` sigue diciendo `rootDir: MiProfesional/backend`, pero el backend que corre en Render es `src/` de raíz → **desactualizado/engañoso**.
- 🟠 Backend duplicado (A=raíz activo, B=`MiProfesional/backend` sin deploy) con drift de modelos/rutas.
- 🟠 Sin tests (0), sin ESLint config, sin CI.
- ✅ Promoción de lanzamiento ELIMINADA por completo (backend + frontend): `src/routes/promo.js`, `src/models/PromoCounter.js`, `hooks/usePromo.js` y `utils/promoLabels.js` ya no existen; quedan 0 textos/contadores/trials. Todo nuevo Profesional/Comercio/Empresa paga desde el alta vía Mercado Pago.
- 🟡 Chunk principal >500 kB en el build (warning de Vite, no bloquea).

**Acción recomendada fuera de esta fase**: purgar secretos del historial de git, rotar JWT/MP en el `.env` de raíz, corregir `render.yaml`, y crear Android.

---

## 11. MODELO ECONÓMICO: MERCADO PAGO SOLO PARA SERVICIOS PROPIOS (IMPLEMENTADO)

Regla central del modelo de negocios (directiva del dueño, 2026-08-14): **MiProfesionalYa NO recibe, cobra, administra, retiene, custodia ni distribuye dinero por los trabajos entre clientes y profesionales**. Dos circuitos económicos totalmente independientes:

| Circuito | Partes | Medio de pago | Comisión |
|---|---|---|---|
| **A. Servicios de la plataforma** | Usuario ↔ MiProfesionalYa | Mercado Pago (exclusivo) | No aplica |
| **B. Trabajos contratados** | Cliente ↔ Profesional | Directo, por el medio que elijan | 0% para MiProfesionalYa |

### Lo que MiProfesionalYa cobra (circuito A, vía Mercado Pago)
- Suscripciones: Plan Profesional ($5.000/mes), Plan Comercio ($10.000/mes), Plan Empresa ($20.000/mes) — implementado en `src/routes/subscription.js` (PreApproval recurrente).
- Futuro: publicidad (anuncios, banners, posicionamiento destacado). Relación ANUNCIANTE ↔ MIPROFESIONALYA, siempre separada del circuito cliente↔profesional.

### Lo que MiProfesionalYa NO hace (circuito B)
- No actúa como agente de pago, intermediario financiero, depositario, escrow, fiduciario ni partícipe de los pagos entre cliente y profesional.
- No percibe comisión sobre el valor de los trabajos. Sin split, sin retención, sin refunds intermediados.
- La reserva (`POST /api/bookings`) solo registra fecha, hora y un precio informativo; no genera ningún checkout ni preferencia de pago.

### Implementación
1. **Checkbox obligatorio de registro** (`Register.jsx`): para Profesional/Comercio/Empresa, texto específico: "Declaro conocer y aceptar que MiProfesionalYa es una plataforma de conexión entre clientes y profesionales. Los pagos por los trabajos o servicios contratados se acuerdan y realizan directamente entre el cliente y el profesional, sin intervención de MiProfesionalYa." con marca "[ ] Acepto y comprendo esta condición." (no checkbox genérico). Imposible finalizar el registro sin aceptar (bloqueado en UI y validado en submit).
2. **Trazabilidad auditable** (`src/models/User.js` → `legalAcceptances[]`): por cada aceptación se guarda kind (`terms`/`privacyPolicy`/`paymentModel`), accepted, version, acceptedAt (fecha/hora), userType, ipAddress y textSnapshot del texto aceptado. No es un simple `acceptedTerms: true`.
3. **Enforcement server-side** (`src/routes/auth.js` /register): rechaza con 400 el registro de profesional/empresa sin `paymentModelAccepted: true`. Se persiste en usuario nuevo y en reactivación de cuenta.
4. **Términos y Condiciones** (`TermsPage.jsx`): nueva sección 6 "Pagos y ausencia de intermediación financiera entre usuarios" con la distinción de circuitos, la prohibición expresa y un párrafo de delimitación (sin excluir obligaciones legales aplicables; no constituye asesoramiento legal).
5. **Información a clientes** (`ServiceDetail.jsx`): nota junto a la tarifa ("El pago por el servicio contratado se acuerda directamente con el profesional...") y en el modal de reserva.
6. **Footer** (`Layout.jsx`): texto actualizado que declara el modelo y que MiProfesional solo cobra sus propias suscripciones vía Mercado Pago.
7. **Versiones**: `paymentModelVersion`, `termsVersion`, `policyVersion` = `v1` (constantes en `Register.jsx`).

### Revisión técnica de contradicciones (2026-08-14)
- **Único circuito MP real**: suscripciones (`src/routes/subscription.js` → `/create-preapproval` + webhook). ✅ Conforme.
- **Reservas**: `confirmBooking` en `src/services/paymentService.js:262-273` es un stub (lógica comentada, no ejecuta). Ningún flujo crea preference/checkout para bookings. `Booking.paymentId` no se puebla. ✅ Sin contradicción.
- **Vestigios inertes documentados** (NO se eliminaron por directiva "no borrar sin autorización"): enum `['subscription','booking','service']` en `src/models/Payment.js:37`; `detectPaymentType` (reconoce `booking`/`reserva`) y `confirmBooking` en `paymentService.js`; `mercadopago.routes.js` webhook general. Proposición: marcarlos como deshabilitados o removerlos en una futura limpieza autorizada.
- **Discrepancia existente reportada** (fuera de alcance, previa a esta fase): `SubscriptionPage.jsx:34` llama `POST /subscription/create-preference`, endpoint inexistente en el backend (solo existe `/create-preapproval`) → probable 404 en el checkout de suscripción. Requiere decisión de negocio (params de `plansConfig.js`).

---

## VERIFICACIÓN FINAL

- `npm run build` en `MiProfesional/frontend` → **éxito** (sin errores; solo warning de chunk >500 kB).
- Enlaces de categoría verificados contra la API en vivo: `prof-belleza`, `prof-salud`, `prof-servicios`, `24-7`, `construccion-y-hogar`, `profesionales` → todos resuelven.
- Sin referencias restantes a slugs inexistentes (`belleza-y-cuidado`, `servicios-generales`, `salud`, `automotores`, `transporte`, `bienestar-y-deportes`) como enlace.
- Sin links `to="#"` en el frontend.
- Precios coherentes entre `plansConfig.js` y la API viva ($5.000/$10.000/$20.000).

## Siguiente paso sugerido (fuera de esta fase)

Backend: trial por plan (90 días Comercio), plan semestral en Mercado Pago, endpoints de geocode reverse/forward, commit de promo y categorías. Luego sí: crear `android/` y encarar Google Play.
