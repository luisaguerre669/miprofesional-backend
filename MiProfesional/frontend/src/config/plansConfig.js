// ============================================================
// CONFIGURACIÓN ÚNICA DE PLANES Y PRECIOS
// ============================================================
// Esta es la ÚNICA fuente de verdad para precios y descuento
// semestral del frontend.
// Para cambiar precios, editar SOLO este archivo.
//
// El backend expone /api/subscription/plans. Donde sea posible
// se debe priorizar lo que devuelve la API.
// Estos valores son el contrato mínimo y el fallback coherente.
// ============================================================

export const BRAND = {
  name: 'MiProfesionalYa',
  tagline: 'Todo lo que necesitás, cerca tuyo.',
  description:
    'MiProfesionalYa conecta personas con profesionales, comercios y empresas de su zona. Encontrá lo que necesitás o publicá tus servicios y hacé crecer tu negocio.',
  url: 'https://www.miprofesional.online',
};

// Precios mensuales en ARS (fuente única de verdad del frontend)
export const PRICES = {
  client: 0,
  professional: 5000,
  commerce: 10000,
  company: 20000,
};

// Descuento semestral (10% pagando por adelantado)
export const SEMESTER_DISCOUNT_PCT = 10;

// Cálculos de 6 meses de contado = 10% de descuento
const semesterPrice = (monthly) => {
  const total6 = monthly * 6;
  const discounted = Math.round(total6 * (1 - SEMESTER_DISCOUNT_PCT / 100));
  return { monthly, total6, discounted, savings: total6 - discounted };
};

export const SEMESTER_PLANS = {
  professional: semesterPrice(PRICES.professional), // 30.000 → 27.000
  commerce: semesterPrice(PRICES.commerce), // 60.000 → 54.000
  company: semesterPrice(PRICES.company), // 120.000 → 108.000
};

// Descripciones públicas por plan
export const PLAN_DETAILS = {
  professional: {
    id: 'professional',
    name: 'Profesional',
    icon: 'Briefcase',
    color: 'primary',
    priceLabel: `$${PRICES.professional.toLocaleString('es-AR')}/mes`,
    priceBadge: `$${PRICES.professional.toLocaleString('es-AR')}`,
    period: '/mes',
    benefits: [
      'Perfil visible en el marketplace',
      'CV premium destacado',
      'Estadísticas de perfil',
      'Suscripción recurrente automática',
      'Cancelación sin cargo en cualquier momento',
    ],
    registerUrl: '/register?role=professional',
  },
  commerce: {
    id: 'commerce',
    name: 'Comercio',
    icon: 'Store',
    color: 'amber',
    priceLabel: `$${PRICES.commerce.toLocaleString('es-AR')}/mes`,
    priceBadge: `$${PRICES.commerce.toLocaleString('es-AR')}`,
    period: '/mes',
    benefits: [
      'Perfil visible en la sección Comercios',
      'Subcategoría específica para tu rubro',
      'Fotos y galería de productos',
      'Horarios de atención personalizados',
      'Suscripción recurrente automática',
      'Cancelación sin cargo en cualquier momento',
    ],
    registerUrl: '/register?role=professional',
  },
  company: {
    id: 'company',
    name: 'Empresa',
    icon: 'Building2',
    color: 'purple',
    priceLabel: `$${PRICES.company.toLocaleString('es-AR')}/mes`,
    priceBadge: `$${PRICES.company.toLocaleString('es-AR')}`,
    period: '/mes',
    benefits: [
      'Búsqueda avanzada de candidatos',
      'Acceso a CVs completos',
      'Contacto ilimitado',
      'Panel de administración de empresa',
      'Soporte prioritario',
    ],
    registerUrl: '/register?role=company',
  },
  client: {
    id: 'client',
    name: 'Cliente',
    icon: 'User',
    color: 'blue',
    priceLabel: 'Gratis',
    priceBadge: '$0',
    period: '',
    benefits: [
      'Buscar profesionales cerca tuyo',
      'Buscar comercios y empresas',
      'Subir tu currículum gratis',
      'Contacto directo sin comisiones',
    ],
    registerUrl: '/register',
  },
};

// Nota: la modalidad de 6 meses de contado (10% de descuento) está
// PREPARADA a nivel de frontend. La integración real de Mercado Pago
// aún NO ofrece planes semestrales; solo suscripciones mensuales
// recurrentes. Hasta que el backend lo soporte, NO se ofrece como
// pago real en la UI.
export const SEMESTER_AVAILABLE_IN_MP = false;

// Formateo de moneda ARS
export const formatARS = (value) => `$${Number(value || 0).toLocaleString('es-AR')}`;

export const formatARSDecimal = (value) =>
  `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
