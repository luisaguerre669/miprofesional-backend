# AUDITORÍA INTEGRAL — MiProfesional

**Fecha:** 2026-07-07  
**Alcance:** Full-stack marketplace de servicios profesionales  
**Modo:** Solo inspección — sin modificaciones  
**Proyecto:** `D:\proyecto_verdent\MiProfesional`

---

## 1. ARQUITECTURA DETECTADA

```
miprofesional.online (Vercel Edge)
        │
        ├── Frontend SPA ─── React 18 + Vite 5 + Tailwind 3 + Capacitor 8
        │   ├── PWA (sw.js, manifest.json, splash screens)
        │   ├── react-router-dom v6 (17 rutas públicas + 14 protegidas)
        │   ├── i18next (es-AR, español únicamente)
        │   ├── Socket.IO client (chat en tiempo real)
        │   ├── react-leaflet (OpenStreetMap)
        │   ├── DOMPurify (XSS sanitization)
        │   └── Axios (HTTP client)
        │
        └── Backend API ─── Node.js + Express 4 + MongoDB (Mongoose 7)
            ├── Puerto: 10000
            ├── Socket.IO server (chat + presencia)
            ├── JWT (jsonwebtoken + bcryptjs)
            ├── Mercado Pago SDK (pagos)
            ├── Nodemailer (emails SMTP)
            ├── Passport (Google OAuth2)
            ├── node-cron (suscripciones)
            ├── Multer (upload archivos)
            ├── Helmet + CORS + express-rate-limit
            └── Winston-style logger (archivos + consola)

landing/ ─── Página estática HTML con redirect permanente a miprofesional.online
```

### Frontend — Mapa de Páginas (31 páginas en 17 rutas)

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | Home | Público |
| `/login` | Login (email + SMS + Google) | Público |
| `/register` | Registro (3 roles) | Público |
| `/search` | Buscador de profesionales | Público |
| `/service/:id` | Detalle del servicio | Público |
| `/categoria/:slug` | Categoría | Público |
| `/categorias` | Todas las categorías | Público |
| `/forgot-password` | Recuperar contraseña | Público |
| `/reset-password` | Restablecer contraseña | Público |
| `/verify-email` | Verificar email | Público |
| `/payment/*` | Resultado pago MP | Público |
| `/dashboard/*` | Dashboards (client/professional/company) | Protegido por rol |
| `/messages`, `/chat/:id` | Mensajería | Protegido |
| `/profile` | Perfil | Protegido |
| `/cv`, `/candidatos` | CV | Protegido (empresa) |
| `/admin` | Admin panel | Protegido (admin) |
| `/subscriptions` | Suscripciones | Protegido |

### Backend — Endpoints Detectados (16 familias)

| Endpoint | Estado | Middleware |
|----------|--------|-----------|
| `GET /health` | ✅ Operativo | Ninguno |
| `GET /api/health` | ✅ Operativo | Ninguno |
| `POST /api/auth/register` | ✅ Operativo | rateLimiter + sanitizer |
| `POST /api/auth/login` | ✅ Operativo | rateLimiter |
| `GET /api/auth/me` | ✅ Operativo | authenticate |
| `GET /api/auth/google` | ⚠️ Configurado | passport |
| `GET /api/auth/google/callback` | ⚠️ Configurado | passport |
| `GET/POST /api/bookings/*` | ⚠️ Sin uso activo | authenticate |
| `GET /api/categories` | ✅ Operativo (15 categorías) | Ninguno |
| `GET /api/professionals` | ✅ Operativo (0 profesionales) | opcionalAuth |
| `GET /api/professionals/favorites` | ⚠️ Sin uso | authenticate |
| `GET/POST /api/chat/*` | ✅ Socket.IO activo | authenticate |
| `GET/POST /api/users/*` | ⚠️ Sin uso activo | authenticate |
| `POST /api/upload/*` | ⚠️ Sin uso | authenticate |
| `GET /api/admin/*` | ⚠️ Sin uso | admin |
| `GET/POST /api/analytics/*` | ⚠️ Sin uso | authenticate |
| `POST /api/reviews/*` | ⚠️ Sin uso | authenticate |
| `GET /api/identity/*` | ⚠️ Sin uso | authenticate |
| `POST /api/subscription/*` | ⚠️ Sin uso | authenticate |
| `POST /api/payments/webhook` | ⚠️ Configurado | Ninguno |
| `POST /api/payments/create` | ⚠️ Configurado | authenticate |
| `POST /api/mercadopago/webhook` | ⚠️ Configurado | Ninguno |

---

## 2. SERVICIOS UTILIZADOS

### PaaS / Hosting

| Servicio | Uso | Plan/Tier | Estado |
|----------|-----|-----------|--------|
| **Render** | Backend API (Node.js) | Free Tier (Oregon) | ✅ Operativo |
| **Vercel** | Frontend SPA + Landing | Free (Hobby) | ✅ Operativo |
| **Cloudflare** | Proxy/CDN del backend | Free | ✅ Operativo |
| **Capacitor** | Wrapper nativo Android/iOS | Local build | ⚠️ No generado |

### BaaS / DBaaS

| Servicio | Uso | Estado |
|----------|-----|--------|
| **MongoDB Atlas** | Base de datos principal | ✅ Operativo (cluster zhkc2iq) |
| **Firebase** | **NO SE USA** — 0 archivos de configuración, 0 referencias | ❌ No implementado |

### APIs Externas

| API | Uso | Estado |
|-----|-----|--------|
| **Mercado Pago** | Pagos y suscripciones | ⚠️ Credenciales placeholder |
| **Google OAuth 2.0** | Login social | ⚠️ Sin clientID/secret configurados |
| **OpenStreetMap** (Leaflet) | Mapas + geocoding+ | ✅ Integrado (gratuito) |
| **Email SMTP** (Gmail) | Notificaciones | ❌ SMTP_USER vacío, SMTP_PASS vacío |
| **Nominatim** (OSM) | Geocoding inverso | ✅ Integrado en utils/geocode.js |

### Servicios Configurados PERO No Utilizados

| Servicio | Evidencia | Motivo |
|----------|-----------|--------|
| **Passport Google OAuth** | `passport-google-oauth20` en package.json, login page tiene botón Google | GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET vacíos en .env.production.example |
| **Mercado Pago Webhook** | paymentService.js + webhookController.js | MERCADOPAGO_ACCESS_TOKEN = "cambiar_por_token_real" |
| **SMS Login** | Login.jsx tiene pestaña SMS, AuthContext.jsx lo referencia | No hay backend real para envío de SMS |
| **Email Service** | emailService.js completo con cola de eventos | SMTP_USER y SMTP_PASS vacíos, log-only mode |
| **Landing page** | landing/index.html completo, vercel.json con redirect | Solo redirecciona a miprofesional.online |

---

## 3. ESTADO DE CADA SERVICIO

| Componente | Estado | Detalle |
|------------|--------|---------|
| Backend API (Render) | ✅ **Operativo** | Node v26.3.0, uptime OK, DB connected |
| Frontend SPA (Vercel) | ✅ **Operativo** | Edge cached, PWA soportado |
| MongoDB Atlas | ✅ **Operativo** | `miprofesional-cluster.zhkc2iq.mongodb.net` |
| Dominio `miprofesional.online` | ✅ **Operativo** | SSL válido (Cloudflare) |
| SSL/TLS | ✅ **Operativo** | Cloudflare edge, HSTS activo |
| Socket.IO Chat | ✅ **Operativo** | Conexiones activas en logs |
| Rate Limiting | ✅ **Operativo** | 100 req/window, detectado 429 en logs |
| CORS | ✅ **Configurado** | Whitelist dinámica + Render CORS |
| Helmet Security Headers | ✅ **Activo** | No X-Powered-By, HSTS presente |
| JWT Auth | ⚠️ **Advertencia** | Secretos hardcodeados no aleatorios |
| Mercado Pago | ❌ **Crítico** | Placeholder ACCESS_TOKEN |
| SMTP Email | ❌ **Crítico** | SMTP_USER y PASS vacíos |
| Google OAuth | ❌ **Inactivo** | Sin clientID/secret |
| SMS Login | ❌ **Inactivo** | Sin backend de SMS |
| Firebase | ❌ **No implementado** | Sin archivos de configuración |
| Capacitor Android | ⚠️ **No generado** | `capacitor.config.ts` existe, `android/` no |
| Upload Files | ⚠️ **Sin uso** | `uploads/` directorio vacío |
| TypeScript | ⚠️ **Configurado incorrectamente** | DevDependency pero sin tsconfig.json |
| Logging (archivos) | ✅ **Operativo** | Winston-style con rotación |

---

## 4. PROBLEMAS ENCONTRADOS

### 🔴 CRÍTICOS

#### P4.1 — Credenciales en texto plano en archivo versionado
- **Archivo:** `backend/env-local-config.txt`
- **Contenido expuesto:**
  ```
  MONGODB_URI=mongodb+srv://miprofesional_luis:Luisaguerre1966@miprofesional-cluster.zhkc2iq.mongodb.net/miprofesional
  JWT_SECRET=MI_PROFESIONAL_JWT_SECRET_KEY_2024_SUPER_SEGURA_PRODUCTION_CHANGE_ME
  JWT_REFRESH_SECRET=MI_PROFESIONAL_REFRESH_SECRET_KEY_2024
  ```
- **Riesgo:** Cualquier persona con acceso al repositorio tiene acceso completo a la base de datos MongoDB Atlas y puede firmar JWTs arbitrarios.
- **Acción inmediata:** Rotar ambos secretos y eliminar el archivo del historial git.

#### P4.2 — Mercado Pago ACCESS_TOKEN es placeholder
- **Archivo:** `backend/.env` línea `MERCADOPAGO_ACCESS_TOKEN=cambiar_por_token_real_de_mercadopago`
- **Impacto:** Todos los pagos fallan. El sistema de suscripciones está completamente roto.
- **Render no tiene el token configurado** (sync: false en render.yaml).

#### P4.3 — SMTP_USER y SMTP_PASS vacíos
- **Archivo:** `backend/.env` líneas 20-21
- **Impacto:** El sistema de verificación de email, recuperación de contraseña y notificaciones no envía correos. El logger solo registra "link available in logs".

#### P4.4 — Rutas backend no montadas en server.js local
- **Archivo:** `backend/src/server.js`
- **Problema:** Solo monta `authRoutes` y `bookingsRoutes`. Las otras 18 rutas (categories, professionals, chat, payments, mercadopago, subscription, cv, admin, analytics, audit, reviews, ratings, identity, geocode, upload, users, notifications, health) están importadas pero **nunca** montadas.
- **Contradicción:** El endpoint `/` en Render reporta 16 endpoints. La versión desplegada tiene un `server.js` **diferente** al local. Esto indica que se desplegó manualmente sin commitear los cambios.

#### P4.5 — `lastReminderSent` enum bug
- **Archivo:** `backend/src/models/User.js` (campo `subscription.lastReminderSent`)
- **Problema:** Está definido como enum pero acepta `null` como default. Cuando un usuario se registra sin suscripción, el valor queda `null`, y en `reminderService.js` se asigna `'7d'` o `'1d'` que **no** están en el enum definido. Esto causa error 500 al guardar.
- **Evidencia:** Logs de registro muestran errores de validación en `lastReminderSent`.

#### P4.6 — Webhook signature verification bypass
- **Archivo:** `backend/src/services/paymentService.js` línea 33
- **Código:** `if (!signature || !secret) { return true; }`
- **Impacto:** Si MERCADOPAGO_WEBHOOK_SECRET está vacío (placeholder), **cualquier webhook es aceptado sin verificar firma**. Un atacante puede enviar webhooks falsos.
- **Evidencia:** El .env tiene `MERCADOPAGO_WEBHOOK_SECRET=cambiar_por_webhook_secret_real`.

### 🟡 ADVERTENCIAS

#### P4.7 — NoSQL injection no mitigado
- **Archivo:** `backend/src/middleware/inputSanitizer.js`
- **Problema:** Solo sanitiza HTML tags y `${}`. No protege contra operadores MongoDB como `$regex`, `$where`, `$gt`, `$ne`, `$or`.
- **Impacto:** Un atacante podría inyectar operadores MongoDB en queries si algún endpoint los usa directamente con `req.body`.

#### P4.8 — JWT secrets no aleatorios en .env
- **Archivo:** `backend/.env`
- **Contenido:** `JWT_SECRET=c298bdcfb6b121e3ebb949245c35ef886542ddd91c59ff5962b17adab87b2ea13508a2f9e2e973e1b8e2c26d6e6c3ae4`
- **Riesgo:** Parece un hash generado, pero está hardcodeado en el repo. Si alguien accede al repo, puede firmar tokens arbitrarios.

#### P4.9 — Sin protección de OPTIONS preflight en rate limiter
- **Evidencia:** Logs muestran 429 en OPTIONS requests a `/api/professionals/search`. El rate limiter cuenta OPTIONS contra el límite de búsqueda.

#### P4.10 — Sin HTTPS enforcement en código
- **Dependencia:** Cloudflare + Render manejan HTTPS, pero la app Express no fuerza HTTPS. Si alguien accede directamente por IP de Render, lo haría sin SSL.

#### P4.11 — TypeScript instalado pero no usado
- **Evidencia:** `"typescript": "^6.0.3"` en frontend/package.json devDependencies. No hay `tsconfig.json`. Todos los archivos son `.jsx`/`.js`. El compilador TypeScript nunca se ejecuta.

#### P4.12 — Proyecto Android de Capacitor no generado
- **Evidencia:** `capacitor.config.ts` existe con `appId: "com.miprofesional.app"`, pero no hay directorio `android/`. No se puede publicar en Google Play sin ejecutar `npx cap add android`.

### 🟢 OBSERVACIONES MENORES

#### P4.13 — 0 profesionales registrados
- **Evidencia:** Logs muestran "Professionals retrieved: count:0". La base de datos no tiene datos de producción.

#### P4.14 — Landing page con redirect permanente
- **Archivo:** `landing/vercel.json` — redirige todo el tráfico a `miprofesional.online`. OK, pero la landing está desplegada como proyecto separado en Vercel.

#### P4.15 — env-local-config.txt presente en backup
- **Archivo:** `D:\Backup mi profesional\Backup_2026-06-05-164352\MiProfesional\backend\env-local-config.txt`
- Contiene las mismas credenciales en texto plano.

#### P4.16 — `D:\miprofesional-backend-temp` existe
- Directorio temporal desconocido fuera del workspace principal. Posible deploy manual.

---

## 5. RIESGOS DE SEGURIDAD

| # | Riesgo | Severidad | Impacto |
|---|--------|-----------|---------|
| R1 | Exposición de MongoDB Atlas credentials en texto plano | 🔴 Crítico | Acceso total a BD |
| R2 | Exposición de JWT_SECRET en texto plano | 🔴 Crítico | Falsificación de tokens |
| R3 | Placeholder MP ACCESS_TOKEN | 🔴 Crítico | Pagos no funcionales |
| R4 | SMTP vacío — sin verificación de email | 🔴 Crítico | Usuarios no verificables |
| R5 | Webhook signature bypass | 🟡 Alto | Webhooks falsos aceptados |
| R6 | NoSQL injection posible | 🟡 Alto | Exfiltración de datos |
| R7 | JWT secrets hardcodeados en repo | 🟡 Alto | Token forgery |
| R8 | Sin HTTPS en app layer | 🟡 Medio | Riesgo en conexión directa |
| R9 | Rate limiter bloquea OPTIONS | 🟡 Bajo | Degradación menor |
| R10 | CORS con Access-Control-Allow-Origin: * en Vercel | 🟡 Medio | Frontend accesible desde cualquier origen |

---

## 6. CONFIGURACIONES VENCIDAS O INCORRECTAS

| Configuración | Valor actual | Valor esperado | Problema |
|--------------|-------------|----------------|----------|
| NODE_ENV en .env | `development` | `production` en Render | Correcto (local), Render lo sobreescribe |
| CORS_ORIGIN local | `http://localhost:5173` | `https://www.miprofesional.online` | Solo para desarrollo |
| JWT_EXPIRES_IN en .env | `24h` | `1h` en Render.yaml | Diferencia local vs deploy |
| MERCADOPAGO_ACCESS_TOKEN | `cambiar_por_token_real` | Token real de MP | No funcional |
| SMTP_USER | `""` (vacío) | Email válido con app password | Sin correos |
| SMTP_PASS | `""` (vacío) | App password de Google | Sin correos |
| GOOGLE_CLIENT_ID | No definido | Client ID de Google Cloud | Google login roto |
| MONGO_SERVER_TIMEOUT | 5s (local) | 15s (Render) | Diferencia local vs deploy |
| Rate limit búsquedas | 10/min | Posiblemente bajo para prod | Ajustar según uso |
| tsconfig.json | No existe | Debería existir para TS 6.0 | No compila TS |

---

## 7. DEPENDENCIAS ROTAS

| Dependencia | Versión | Problema |
|-------------|---------|----------|
| `typescript` | `^6.0.3` | No hay tsconfig.json. TypeScript 6.0 aún no es estable (actual estable es 5.x). Versión probablemente incorrecta. |
| `@capacitor/android` | `^8.3.4` | No hay proyecto Android generado. Dependencia no utilizada. |
| `@capacitor/ios` | `^8.3.4` | No hay proyecto iOS generado. Dependencia no utilizada. |
| `passport-google-oauth20` | `^2.0.0` | Sin GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET configurados. Dependencia no funcional. |
| `mercadopago` | `^2.12.1` | ACCESS_TOKEN placeholder. Librería no funcional. |
| `nodemailer` | `^8.0.7` | SMTP_USER/PASS vacíos. Librería en modo log-only. |
| `express-rate-limit` | `^6.10.0` | Middleware montado pero bloquea OPTIONS. |
| `eslint` + plugins | Varias | Configuración eslint no encontrada. Dependencias posiblemente no funcionales. |

---

## 8. COSTOS ESTIMADOS DE INFRAESTRUCTURA

| Servicio | Plan Actual | Costo/mes | Plan Recomendado | Costo/mes |
|----------|------------|-----------|-----------------|-----------|
| Render Backend | Free | $0 USD | Starter ($7/mo) | $7 USD |
| Vercel Frontend | Hobby | $0 USD | Pro ($20/mo) | $20 USD |
| MongoDB Atlas | M0 Free (512MB) | $0 USD | M2 ($9/mo) o M5 ($25/mo) | $9-25 USD |
| Cloudflare | Free | $0 USD | Pro ($20/mo) | $20 USD |
| Dominio (Namecheap/Cloudflare) | - | ~$10 USD/año | - | ~$0.83 USD/mes |
| Google Play | $25 única | $0 USD | - | $0 USD |
| Google OAuth | Free | $0 USD | - | $0 USD |
| OpenStreetMap | Free | $0 USD | - | $0 USD |
| **TOTAL** | | **$0 USD/mes** | | **$37-53 USD/mes** |

Para producción real con SSL dedicado, zero-downtime y soporte, se recomienda al menos **$37 USD/mes**.

---

## 9. NIVEL DE PREPARACIÓN PARA PRODUCCIÓN

| Componente | % Preparación | Notas |
|-----------|:----------:|-------|
| Frontend SPA | 85% | ✅ PWA, SEO, rendimiento. Falta: TypeScript, tests, lazy loading adicional |
| Backend API | 60% | ⚠️ Routes locales no montadas, tokens placeholder, sin tests automáticos en CI |
| Base de Datos | 70% | ⚠️ Conectada, pero sin índices optimizados ni backups automáticos visibles |
| Autenticación | 75% | ✅ JWT, bcrypt. Falta: refresh token rotation, email verification real |
| Pagos | 20% | ❌ Sin credenciales reales de MP |
| Notificaciones | 15% | ❌ SMTP vacío, sin push notifications reales |
| Chat | 60% | ✅ Socket.IO funcional. Falta: persistencia de mensajes offline, notificaciones push |
| Mapas | 80% | ✅ OpenStreetMap/Leaflet integrado. Falta: clustering para muchos marcadores |
| Seguridad | 50% | ⚠️ Helmet + rate limit OK. Credenciales expuestas, NoSQL injection, sin audits |
| Monitoreo | 30% | ❌ Sin APM, sin alertas, logs locales solamente |
| CI/CD | 20% | ❌ Render auto-deploy configurado pero sin pipeline de tests |
| Mobile (Capacitor) | 10% | ❌ Config exists, Android/iOS projects no generados |
| Google Play Ready | 0% | ❌ Sin proyecto Android, sin signing key, sin store listing |

### PORCENTAJE GENERAL DE PREPARACIÓN: **45%**

---

## 10. LISTA PRIORIZADA DE ACCIONES PARA PUBLICAR EN GOOGLE PLAY

### Fase 1 — Críticas (requerido para cualquier release)
1. **Rotar contraseña de MongoDB Atlas** — cambiar contraseña de `miprofesional_luis` en Atlas, actualizar en todos los lugares.
2. **Rotar JWT_SECRET y JWT_REFRESH_SECRET** — generar secretos criptográficamente aleatorios (64+ chars cada uno).
3. **Eliminar `env-local-config.txt`** del repositorio y del backup. Agregar a `.gitignore`.
4. **Configurar Mercado Pago producción** — obtener ACCESS_TOKEN, PUBLIC_KEY y WEBHOOK_SECRET reales.
5. **Configurar SMTP real** — app password de Gmail (o SendGrid/Mailgun para producción).

### Fase 2 — App Functionality (para que la app funcione correctamente)
6. **Sincronizar server.js local con el desplegado** — commitar la versión que tiene los 16 endpoints montados.
7. **Corregir bug de `lastReminderSent`** en modelo User.js (cambiar de enum a string).
8. **Eliminar bypass de webhook signature** en `paymentService.js`.
9. **Agregar protección NoSQL injection** a `inputSanitizer.js`.
10. **Configurar Google OAuth** — crear proyecto en Google Cloud Console, configurar redirect URI.

### Fase 3 — Capacitor/Android (específico para Google Play)
11. **Generar proyecto Android:** `npx cap add android` en `frontend/`.
12. **Configurar AndroidManifest.xml** — permisos de geolocalización, internet, cámara (si aplica).
13. **Configurar Google Play Services** — agregar google-services.json para Firebase Cloud Messaging (opcional para notificaciones push).
14. **Generar signing key** — `keytool -genkey -v -keystore miprofesional.keystore -alias miprofesional`.
15. **Configurar Gradle** — versionName, versionCode, applicationId (`com.miprofesional.app`).
16. **Probar build de release:** `cd android && ./gradlew bundleRelease`.
17. **Probar APK de release** en dispositivo físico o emulador.

### Fase 4 — Google Play Console
18. **Crear cuenta de desarrollador Google Play** ($25 USD única).
19. **Crear ficha de aplicación:**
    - Título: "MiProfesional"
    - Descripción corta y completa (ES/EN)
    - Capturas de pantalla (8+ screenshots)
    - Icono de 512x512px, feature graphic de 1024x500px
    - Categoría: "Productividad" o "Negocios"
20. **Configurar contenido:**
    - Política de privacidad (URL funcional)
    - Clasificación de contenido (IARC)
    - APK objetivos (API level 34+)
21. **Revisión de políticas:** Asegurar que no infringe políticas de Google Play (permisos, contenido, pagos).

### Fase 5 — Pre-lanzamiento
22. **Configurar App Signing by Google Play.**
23. **Subir bundle/app bundle:** `aab` via Google Play Console.
24. **Configurar precios y distribución:** Gratis o con suscripciones (usar Play Billing en vez de Mercado Pago para pagos in-app).
25. **Pruebas internas/cerradas/abiertas** antes del lanzamiento público.

### Fase 6 — Post-lanzamiento
26. **Configurar Firebase Cloud Messaging** para notificaciones push (reemplazar dependencia de SMTP para notificaciones urgentes).
27. **Configurar Crashlytics** en Firebase para monitoreo de crashes.
28. **Implementar feature flags** para releases graduales.
29. **Monitorear reviews y métricas** en Google Play Console.

---

## NOTAS ADICIONALES

- **Firebase:** No se encontraron archivos de configuración (`firebase.json`, `.firebaserc`, `google-services.json`) ni referencias en `package.json`. Firebase **no está implementado** en este proyecto.
- **EmailJS:** No se encontraron referencias en dependencias ni en código fuente.
- **WebSockets:** Socket.IO está correctamente implementado para chat en tiempo real con presencia de usuarios.
- **Geolocalización:** Implementada vía Leaflet/OpenStreetMap en frontend y geocode.js (Nominatim) en backend.
- **Servicio de identidad:** El endpoint `/api/identity` existe en rutas configuradas pero sin uso activo.
- **3 servicios en Render:** `miprofesional-backend`, `miprofesional-auth`, `miprofesional-gateway` están definidos en `render-manifest.json` pero todos apuntan al mismo código base. La arquitectura de "strangler fig" mencionada en los docs parece no estar implementada activamente (gateway y auth service probablemente no deployados).
- **Node.js v26.3.0** en producción — versión extremadamente reciente. Verificar compatibilidad con dependencias.

---

*Auditoría completada el 2026-07-07. Sin modificaciones realizadas.*
