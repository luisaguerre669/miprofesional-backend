import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight, Search, MapPin, Star } from 'lucide-react';
import api from '../lib/axios';
import commerceCategories from '../data/commerceCategories';

export default function ComerciosPage() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    api.get('/professionals/search', { params: { primaryCategory: 'comercio', limit: 0 } })
      .then(r => {
        const pros = r.data?.data || [];
        const map = {};
        pros.forEach(p => {
          (p.subCategories || []).forEach(sc => {
            map[sc] = (map[sc] || 0) + 1;
          });
        });
        setCounts(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/90 via-amber-800/70 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-xs font-medium mb-4">
              <Store size={14} /> Comercios
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
              Comercios y negocios<br />
              <span className="text-amber-300">de tu barrio</span>
            </h1>
            <p className="text-white/70 text-sm md:text-lg max-w-xl leading-relaxed mb-6">
              Descubrí pizzerías, farmacias, panaderías, ferreterías y más de 30 rubros comerciales cerca de tu zona.
            </p>
            <form action="/search" method="GET" className="max-w-md">
              <div className="relative flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden focus-within:border-amber-400/50 transition-all">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  name="q"
                  type="text"
                  placeholder="Buscá un comercio: Pizzería, Farmacia..."
                  className="w-full pl-9 pr-2 py-2.5 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm"
                />
                <input type="hidden" name="primaryCategory" value="comercio" />
                <button type="submit" className="px-4 py-2.5 bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-all flex items-center gap-1">
                  Buscar <Search size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Subcategories grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Rubros comerciales</h2>
          <p className="text-gray-500 mt-2">Seleccioná un rubro para explorar los comercios disponibles</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {commerceCategories.map((cat) => {
            const count = counts[cat.slug] || 0;
            return (
              <Link
                key={cat.slug}
                to={`/search?primaryCategory=comercio&subCategory=${encodeURIComponent(cat.slug)}`}
                className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-sm md:text-base font-bold text-white drop-shadow-lg leading-tight">{cat.title}</h3>
                  <p className="text-[11px] text-white/60 mt-0.5 drop-shadow line-clamp-1">{cat.description}</p>
                  {count > 0 ? (
                    <p className="text-[10px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
                      <Store size={9} /> {count} comercio{count !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-[10px] text-white/40 mt-1">Sin comercios aún</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                    {count > 0 ? 'Ver' : 'Sumar'} <ArrowRight size={9} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">¿Tenés un comercio?</h2>
          <p className="text-amber-100 text-sm md:text-base mb-6 max-w-lg mx-auto">
            Sumá tu negocio a MiProfesionalYa y aparecé en las búsquedas de cientos de clientes cerca de tu zona.
          </p>
          <Link
            to="/register?role=professional"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-all shadow-lg"
          >
            Sumar mi comercio <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
