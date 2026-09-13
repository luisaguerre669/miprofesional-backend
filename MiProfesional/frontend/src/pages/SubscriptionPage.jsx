import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, ArrowRight, Crown, Building2, Briefcase, Store, Sparkles, CreditCard, Clock } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { PRICES, SEMESTER_PLANS, SEMESTER_DISCOUNT_PCT, SEMESTER_AVAILABLE_IN_MP, formatARS } from '../config/plansConfig';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  const isCompany = user?.role === 'company' || user?.role === 'employer';

  useEffect(() => {
    Promise.all([
      api.get('/subscription/plans'),
      api.get('/subscription/status'),
    ])
      .then(([plansRes, subRes]) => {
        setPlans(Array.isArray(plansRes.data?.data) ? plansRes.data.data : []);
        setSubscription(subRes.data?.data ?? subRes.data ?? null);
      })
      .catch(() => setMessage({ type: 'error', text: 'Error al cargar los datos.' }))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (planId) => {
    setActionLoading(planId);
    setMessage(null);
    try {
      const res = await api.post('/subscription/create-preapproval', { plan: planId });
      const initPoint = res.data?.data?.initPoint || res.data?.initPoint;
      if (initPoint) {
        window.location.href = initPoint;
      } else {
        setMessage({ type: 'error', text: 'Error al redirigir al pago.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al procesar la solicitud.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    setMessage(null);
    try {
      await api.post('/subscription/cancel');
      setSubscription((prev) => ({ ...prev, status: 'inactive' }));
      setMessage({ type: 'success', text: 'Suscripción cancelada.' });
    } catch {
      setMessage({ type: 'error', text: 'Error al cancelar la suscripción.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = subscription?.status ?? 'inactive';
  const isActive = currentStatus === 'active' || currentStatus === 'trial';
  const currentPlan = subscription?.plan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planes MiProfesionalYa</h1>
          <p className="text-gray-500">
            {isCompany
              ? 'Elegí el plan ideal para encontrar los mejores talentos'
              : 'Elegí el plan ideal para potenciar tu presencia profesional'}
          </p>
        </div>

        {message && (
          <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {message.text}
          </div>
        )}

        {isActive && (
          <div className="mb-8 bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-primary-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary-800">
                Suscripción activa
              </p>
              <p className="text-xs text-primary-700 mt-0.5">
                Plan {currentPlan === 'company' ? 'Empresa' : currentPlan === 'professional' ? 'Profesional' : 'Mensual'}
                {subscription?.endDate && ` · Vence el ${new Date(subscription.endDate).toLocaleDateString('es-AR')}`}
                {subscription?.daysRemaining > 0 && ` · ${subscription.daysRemaining} días restantes`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(plan => {
            const isCurrentPlan = currentPlan === plan.id && isActive;
            const iconMap = { professional: Briefcase, commerce: Store, company: Building2 };
            const Icon = iconMap[plan.id] || Briefcase;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 transition-all ${
                  plan.highlighted
                    ? 'border-amber-400 shadow-xl shadow-amber-500/10'
                    : isCurrentPlan
                      ? 'border-primary-500 shadow-lg'
                      : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-full z-10 shadow-lg flex items-center gap-1">
                    <Crown size={12} /> Recomendado
                  </span>
                )}
                {isCurrentPlan && (
                  <span className="absolute -top-3 right-4 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                    Plan actual
                  </span>
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.id === 'company' ? 'bg-purple-100' : plan.id === 'commerce' ? 'bg-amber-100' : 'bg-primary-50'
                    }`}>
                      <Icon size={24} className={
                        plan.id === 'company' ? 'text-purple-600' : plan.id === 'commerce' ? 'text-amber-600' : 'text-primary-600'
                      } />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-500">{plan.forRole === 'company' ? 'Para empresas' : plan.forRole === 'commerce' ? 'Para comercios' : 'Para profesionales'}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900">${plan.price.toLocaleString('es-AR')}</span>
                      <span className="text-gray-500 text-sm">ARS</span>
                    </div>
                    <p className="text-xs text-gray-400">Suscripción mensual</p>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                  <ul className="text-sm space-y-2.5 mb-6">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{b}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading === 'cancel'}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
                    >
                      {actionLoading === 'cancel' ? (
                        <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Cancelando...</span>
                      ) : 'Cancelar Suscripción'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={actionLoading === plan.id}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                        plan.highlighted
                          ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-500/25'
                          : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/25'
                      }`}
                    >
                      {actionLoading === plan.id ? (
                        <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Procesando...</span>
                      ) : (
                        <>{plan.cta} <ArrowRight size={16} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={20} className="text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Pago semestral</h2>
          </div>
          <p className="text-center text-sm text-gray-500 mb-6">
            Pagá 6 meses por adelantado y ahorrá un {SEMESTER_DISCOUNT_PCT}%. Descuento aplicado sobre el valor mensual.
          </p>

          {!SEMESTER_AVAILABLE_IN_MP && (
            <div className="mb-6 mx-auto max-w-lg flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 justify-center">
              <Clock size={16} /> Próximamente. Esta modalidad de pago aún no está habilitada.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(SEMESTER_PLANS).map(([planId, sem]) => {
              const monthly = PRICES[planId] || 0;
              const iconMap = { professional: Briefcase, commerce: Store, company: Building2 };
              const Icon = iconMap[planId] || Briefcase;
              const nameMap = { professional: 'Profesional', commerce: 'Comercio', company: 'Empresa' };
              return (
                <div
                  key={planId}
                  className={`relative bg-white rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center ${
                    SEMESTER_AVAILABLE_IN_MP ? 'border-gray-300' : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    planId === 'company' ? 'bg-purple-100' : planId === 'commerce' ? 'bg-amber-100' : 'bg-primary-50'
                  }`}>
                    <Icon size={24} className={
                      planId === 'company' ? 'text-purple-600' : planId === 'commerce' ? 'text-amber-600' : 'text-primary-600'
                    } />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{nameMap[planId]}</h3>
                  <p className="text-xs text-gray-400 mb-4">{formatARS(monthly)}/mes · 6 meses</p>
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-3xl font-black text-gray-900">{formatARS(sem.discounted)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="line-through text-gray-400">{formatARS(sem.total6)}</span>{' '}
                    <span className="font-semibold text-green-600">Ahorrás {formatARS(sem.savings)}</span>
                  </p>
                  <button
                    disabled
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gray-200 text-gray-500"
                  >
                    Próximamente
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-600">
            ¿Necesitás factura? Contactanos a <strong className="text-gray-900">facturacion@miprofesional.online</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Los pagos son procesados de forma segura por Mercado Pago.
          </p>
        </div>
      </div>
    </div>
  );
}
