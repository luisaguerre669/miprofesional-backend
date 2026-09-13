# miprofesional-backend

Backend API for MiProfesional marketplace

## Version
2.0.0

## Dependencies
- axios
- bcryptjs
- compression
- cors
- dotenv
- express
- express-rate-limit
- express-validator
- helmet
- isomorphic-dompurify
- jsonwebtoken
- mercadopago
- mongoose
- morgan
- multer
- node-cron
- nodemailer
- passport
- passport-google-oauth20
- socket.io
- validator

## Dev Dependencies
- eslint
- eslint-config-standard
- eslint-plugin-import
- eslint-plugin-n
- eslint-plugin-promise
- jest
- nodemon
- supertest

## Scripts
- `start`: `node src/server.js`
- `dev`: `nodemon src/server.js`
- `seed`: `node src/scripts/seed.js`
- `test`: `jest`
- `test:watch`: `jest --watch`
- `lint`: `eslint src/`
- `lint:fix`: `eslint src/ --fix`
- `build`: `echo 'No build step required for Node.js'`

## Languages
- JavaScript: 151 files
- JavaScript JSX: 53 files
- Markdown: 33 files
- JSON: 17 files
- HTML: 5 files
- CSS: 2 files
- TypeScript: 1 files

## Project Structure
```
AGENTS.md
backend.err
backup_consolidation/
  root/
    frontend-v2/
    mobile/
      src/
CLOUD_DEPLOYMENT_SUMMARY.md
deploy-instructions.md
DEPLOY_GUIDE.md
diagnostico-mongodb.js
docs/
  README.md
env-local-config.txt
frontend/
index.html
logs/
  app.log
  app.log.1780781581556
minimal-server.js
MiProfesional/
  backend/
    backend.err
    CLOUD_DEPLOYMENT_SUMMARY.md
    deploy-instructions.md
    DEPLOY_GUIDE.md
    diagnostico-mongodb.js
    env-local-config.txt
    logs/
      app.log
    minimal-server.js
    mongodb-diagnostic.js
    mongodb-final-diagnostic.js
    mongodb-uri-corrected.js
    MONGODB_DIAGNOSTIC_REPORT.md
    MONGODB_FINAL_DIAGNOSTIC_REPORT.md
    package-lock.json
    package.json
    PRODUCTION_READINESS_REPORT.md
    README-AUTH-SERVICE.md
    README-STRANGLER.md
    render-deployment-guide.md
    render-environment-config.md
    render-manifest.json
    render.yaml
    RENDER_ENVIRONMENT.md
    SECURITY_SUMMARY.md
    seed-user.js
    src/
      config/
      controllers/
      jobs/
      logs/
      middleware/
      models/
      routes/
      scripts/
      server.js
      services/
      utils/
    VERIFICATION_SYSTEM_DOCUMENTATION.md
  docs/
    PRODUCTION_CHECKLIST.md
  frontend/
    capacitor.config.ts
    index.html
    ios/
      App/
      debug.xcconfig
    package-lock.json
    package.json
    postcss.config.js
    public/
      favicon.svg
      icono-512.png
      icons/
      images/
      manifest.json
      robots.txt
      sitemap.xml
      splash/
      sw.js
    scripts/
      generate-category-svgs.cjs
      generate-pwa-assets.cjs
    src/
      App.jsx
      components/
      context/
      data/
      hooks/
      i18n/
      index.css
      lib/
      main.jsx
      pages/
      utils/
    tailwind.config.js
    vercel.json
    vite.config.js
  IMPLEMENTATION_SUMMARY_24-7.md
  landing/
    index.html
    vercel.json
  MIGRATION_24-7_VALIDATION.md
  package-lock.json
  uploads/
mongodb-diagnostic.js
mongodb-final-diagnostic.js
mongodb-uri-corrected.js
MONGODB_DIAGNOSTIC_REPORT.md
MONGODB_FINAL_DIAGNOSTIC_REPORT.md
n8nac-config.json
package-lock.json
package.json
PRODUCTION_READINESS_REPORT.md
PRODUCTION_SUMMARY.md
promo_video.html
proyecto_verdent-design.html
README-AUTH-SERVICE.md
README-STRANGLER.md
render-deployment-guide.md
render-environment-config.md
render-manifest.json
render.yaml
RENDER_ENVIRONMENT.md
SECURITY_SUMMARY.md
seed-user.js
server.err
src/
  config/
    db.js
    jwt.js
    logger.js
  middleware/
    auth.js
    inputSanitizer.js
    requestId.js
  models/
    Booking.js
    Category.js
    ContactRequest.js
    Conversation.js
    CurriculumVitae.js
    Message.js
    Notification.js
    Payment.js
    PaymentAudit.js
    Professional.js
    Review.js
    User.js
  routes/
    admin.js
    analytics.js
    auth.js
    bookings.js
    categories.js
    chat.js
    cv.js
    health.js
    identity.js
    mercadopago.routes.js
    notifications.js
    professionals.js
    promo.js
    ratings.js
    reviews.js
    subscription.js
    upload.js
    users.js
  scripts/
    categoryData.js
    migrate-commerce-subcategories.js
    migrate-emergencias-to-24-7.js
    migrate-marketplace-categories.js
    runAutoSeed.js
    seed-comercio.js
    seed-professionals.js
    seed.js
    seedCategories.js
  server.js
  services/
    chatService.js
    emailService.js
    emailTemplates.js
    eventBus.js
    paymentService.js
    subscriptionCron.js
  utils/
    categoryGuard.js
    errorStore.js
    geocode.js
    logger.js
vercel.json
VERIFICATION_SYSTEM_DOCUMENTATION.md

```
