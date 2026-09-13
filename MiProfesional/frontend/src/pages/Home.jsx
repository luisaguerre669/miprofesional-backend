import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { isNativeAndroid } from '../utils/platform';
import { getAccurateLocation } from '../utils/geolocation';
import MapRenderFix from '../components/map/MapRenderFix';
import {
  Search, ArrowRight, Star, MapPin, Sparkles,
  ChevronLeft, ChevronRight, Shield, Clock,
  UserPlus, Plus, AlertTriangle, Building2,
  Briefcase, Crown, User, CheckCircle, Store, FileText,
  Scale, LineChart, Megaphone, Calculator, Menu, X
} from 'lucide-react';
import Logo, { LogoIcon } from '../components/Logo';
import AdBanner from '../components/ads/AdBanner';
import NegociosDestacados from '../components/ads/NegociosDestacados';
import MainBanner from '../components/MainBanner';
import { resolveIcon, getInlineGradient } from '../utils/categoryIcons';
import { PRICES, PLAN_DETAILS, formatARS, BRAND } from '../config/plansConfig';
import logoAsset from '../assets/mi-profesionalya-logo-exact.png';
import './Home.css';

const customIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div style="background:#1f4fd8;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

const userIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div style="background:#2f66e8;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

const colorClasses = {
  pink: { tag: 'text-pink-300', bg: 'bg-pink-500', hover: 'hover:bg-pink-600', shadow: 'shadow-pink-500/25' },
  blue: { tag: 'text-blue-300', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', shadow: 'shadow-blue-500/25' },
  emerald: { tag: 'text-emerald-300', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', shadow: 'shadow-emerald-500/25' },
  purple: { tag: 'text-purple-300', bg: 'bg-purple-500', hover: 'hover:bg-purple-600', shadow: 'shadow-purple-500/25' },
  amber: { tag: 'text-amber-300', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', shadow: 'shadow-amber-500/25' },
  orange: { tag: 'text-orange-300', bg: 'bg-orange-500', hover: 'hover:bg-orange-600', shadow: 'shadow-orange-500/25' },
};

const promoSlides = [
  {
    id: 'belleza',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80',
    tag: 'Belleza',
    title: 'Belleza y ',
    titleAccent: 'Cuidado Personal',
    desc: 'Encontra los mejores profesionales de estetica, peluqueria, masajes y cuidado personal cerca de tu zona.',
    link: '/categoria/prof-belleza',
    color: 'pink',
    subcategories: ['Peluqueria', 'Manicuria', 'Unas', 'Masajista', 'Cosmetologia', 'Barbero', 'Maquilladora', 'Depilacion'],
  },
  {
    id: 'profesional',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
    tag: 'Para Profesionales',
    title: 'Publica tu perfil ',
    titleAccent: 'y crece',
    desc: 'Mostra tus servicios a miles de clientes potenciales. Publica tu perfil y hace crecer tu negocio.',
    link: '/register?role=professional',
    color: 'emerald',
  },
  {
    id: 'salud',
    image: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=1200&q=80',
    tag: 'Cuidado de tu Salud',
    title: 'Medicos y ',
    titleAccent: 'especialistas',
    desc: 'Encontra medicos, psicologos, kinesiologos y profesionales de la salud a domicilio o consulta.',
    link: '/categoria/prof-salud',
    color: 'purple',
  },
  {
    id: 'hogar',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
    tag: 'Servicios para tu Hogar',
    title: 'Reparaciones y ',
    titleAccent: 'mantenimiento',
    desc: 'Plomeros, electricistas, pintores y mas profesionales para cuidar tu hogar.',
    link: '/categoria/prof-servicios',
    color: 'amber',
  },
];

const steps = [
  { icon: MapPin, title: '1. Buscá', desc: 'Filtrá por rubro y ubicacion. Encontrá profesionales, comercios y empresas verificados cerca tuyo.' },
  { icon: Search, title: '2. Compará', desc: 'Revisá perfiles, precios, fotos y valoraciones de otros usuarios para elegir con confianza.' },
  { icon: Clock, title: '3. Contactá', desc: 'Conectate directo con el profesional o negocio y coordiná. Sin comisiones ni intermediarios.' },
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85';
const PROFESSIONAL_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=85',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=85',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&q=85',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&q=85',
];


function ProfessionalsImage() {
  return (
    <div className="relative mx-auto w-[220px] sm:w-[260px] lg:w-[320px]">
      <div className="brand-stage relative overflow-hidden rounded-[28px] border border-white/10 shadow-[0_28px_60px_rgba(5,18,19,0.45)] p-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(217,167,57,0.2),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        <div className="premium-card relative rounded-[22px] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="h-3 w-14 rounded-full bg-slate-300/80" />
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f4d50]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d9a739]" />
            </div>
          </div>

          <div className="flex items-center justify-center py-10">
            <div className="brand-mark h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] p-2 sm:p-3">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="hero-mp-1" x1="10" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#d9a739" />
                    <stop offset="0.32" stopColor="#f5dfa2" />
                    <stop offset="0.63" stopColor="#1b5e5f" />
                    <stop offset="1" stopColor="#0a1d20" />
                  </linearGradient>
                  <linearGradient id="hero-mp-2" x1="28" y1="10" x2="72" y2="74" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff4cf" />
                    <stop offset="0.5" stopColor="#d9a739" />
                    <stop offset="1" stopColor="#8c6219" />
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="92" height="92" rx="18" fill="#edf3f0" opacity="0.9" />
                <path d="M22 66L41 28H54L46 48H58L74 28H82L62 66H50L56 52H46L39 66H22Z" fill="url(#hero-mp-1)" />
                <path d="M29 73C35 62 41 56 48 50C52 46 57 42 59 38C60 35 60 31 60 28" stroke="url(#hero-mp-2)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M61 35C69 41 75 47 78 54C80 58 81 63 79 67C77 71 73 72 69 73C63 74 58 72 53 69" stroke="url(#hero-mp-2)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.28em] text-slate-500 font-semibold">Profesional</div>
              <div className="text-xs font-semibold text-slate-700">Cerca tuyo</div>
            </div>
            <div className="rounded-full border border-[#d9a739]/70 bg-[#f5e9c3] px-2.5 py-1 text-[10px] font-bold text-[#7a5814]">
              Premium
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEAM_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80';

const StarRating = ({ rating = 0, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size} className={i <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
    ))}
  </div>
);

const PROVINCES = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba',
  'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucuman'
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPros, setFeaturedPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [bannerSide1, setBannerSide1] = useState(true);
  const [bannerSide2] = useState(true);
  const promoSlidesForPlatform = promoSlides;
  const activePromoIndex = promoSlidesForPlatform.length ? carouselIndex % promoSlidesForPlatform.length : 0;

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [urgentPros, setUrgentPros] = useState([]);
  const [urgentProsLoading, setUrgentProsLoading] = useState(true);
  const { user } = useAuth();
  const [homeMenuOpen, setHomeMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/professionals?featured=true&limit=8')
      .then(r => setFeaturedPros(r.data.data || []))
      .catch(e => console.error('Error al cargar destacados:', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/professionals', { params: { disponibilidad: '24-7', limit: 6 } })
      .then(r => setUrgentPros(r.data.data || []))
      .catch(e => console.error('Error al cargar profesionales 24-7:', e))
      .finally(() => setUrgentProsLoading(false));
  }, []);

  useEffect(() => {
    api.get('/categories/tree')
      .then(r => {
        const data = r.data.data || [];

        // Fallback estático para Belleza si no está en la BD (usa la subcategoría real prof-belleza)
        const hasBelleza = data.some(c => c.slug === 'belleza-y-cuidado' || c.slug === 'prof-belleza');
        if (!hasBelleza) {
          data.push({
            _id: 'belleza-static',
            title: 'Belleza y Cuidado',
            slug: 'prof-belleza',
            description: 'Peluqueria, manicuria, masajes y cuidado personal',
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
            icon: 'Sparkles',
            metadata: { color: '#ec4899' },
            sortOrder: 15,
            subcategories: [
              { name: 'Peluqueria', slug: 'peluqueria' },
              { name: 'Manicuria', slug: 'manicuria' },
              { name: 'Unas', slug: 'unas' },
              { name: 'Masajista', slug: 'masajista' },
              { name: 'Cosmetologia', slug: 'cosmetologia' },
              { name: 'Barbero', slug: 'barbero' },
              { name: 'Maquilladora', slug: 'maquilladora' },
              { name: 'Depilacion', slug: 'depilacion' },
            ],
          });
        }

        setCategories(data);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(i => (i + 1) % promoSlidesForPlatform.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promoSlidesForPlatform.length]);

  const [manualCity, setManualCity] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [locationMode, setLocationMode] = useState(''); // 'gps' | 'city' | 'manual'
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: '', number: '', neighborhood: '', city: '', province: '' });

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`, {
        headers: { 'User-Agent': 'MiProfesional/1.0' }
      });
      const data = await res.json();
      if (data?.display_name) {
        const parts = data.display_name.split(',');
        const short = parts.slice(0, 3).join(',').trim();
        setUserAddress(short);
      } else {
        setUserAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setUserAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }, []);

  const geocodeFullAddress = useCallback(async (fields) => {
    setGeoLoading(true);
    setGeoError('');
    try {
      const streetAddr = [fields.street, fields.number].filter(Boolean).join(' ');
      const res = await api.get('/professionals/geocode', {
        params: {
          address: streetAddr || `${fields.neighborhood}`,
          city: fields.city,
          state: fields.province,
          country: 'Argentina'
        }
      });
      if (res.data?.success && res.data?.data) {
        const loc = { lat: res.data.data.latitude, lng: res.data.data.longitude };
        setUserLocation(loc);
        setUserAddress(res.data.data.displayName || `${streetAddr}, ${fields.city}`);
        setLocationMode('city');
        setShowCityInput(false);
      } else {
        setGeoError(res.data?.message || 'No se pudo encontrar la direccion. Verifica los datos.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al buscar la ubicacion. Intenta de nuevo.';
      setGeoError(msg);
    }
    setGeoLoading(false);
  }, []);

  const saveAddressToProfile = useCallback(async () => {
    if (!user || !addressForm.city) return;
    try {
      await api.put('/users/profile', {
        address: {
          street: addressForm.street,
          number: addressForm.number,
          neighborhood: addressForm.neighborhood,
          city: addressForm.city,
          state: addressForm.province,
          country: 'Argentina'
        }
      });
    } catch { /* non-critical */ }
  }, [user, addressForm]);

  const getLocation = useCallback(async () => {
    setGeoLoading(true);
    setGeoError('');
    try {
      const result = await getAccurateLocation();
      if (result.error) {
        setGeoError(result.error);
        setShowFullAddress(true);
        setShowCityInput(true);
      } else {
        setUserLocation({ lat: result.lat, lng: result.lng });
        setLocationMode('gps');
        setGeoError('');
        setShowCityInput(false);
        reverseGeocode(result.lat, result.lng);
      }
    } catch (err) {
      setGeoError('Error inesperado al obtener ubicacion.');
      setShowCityInput(true);
    }
    setGeoLoading(false);
  }, [reverseGeocode]);

  // Use stored address if logged in, otherwise show address input
  useEffect(() => {
    const coords = user?.coordinates?.coordinates;
    const hasCoords = coords && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0);
    if (hasCoords) {
      setUserLocation({ lat: coords[1], lng: coords[0] });
      setLocationMode('city');
      const addr = user.address || {};
      if (addr.street || addr.city) {
        setUserAddress([addr.street, addr.number].filter(Boolean).join(' ') + (addr.city ? `, ${addr.city}` : ''));
      }
      setShowCityInput(false);
    } else {
      setShowCityInput(true);
      setShowFullAddress(true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (featuredPros.length === 0) return;
    const timer = setInterval(() => setCarouselIndex(prev => (prev + 1) % featuredPros.length), 5000);
    return () => clearInterval(timer);
  }, [featuredPros]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    else window.location.href = '/search';
  };

  const visiblePros = featuredPros.slice(carouselIndex, carouselIndex + 3);
  if (visiblePros.length < 3 && featuredPros.length > 0) {
    const remaining = featuredPros.slice(0, 3 - visiblePros.length);
    visiblePros.push(...remaining);
  }

  const renderMap = () => {
    if (geoLoading) {
      return (
        <div className="h-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">Obteniendo ubicacion...</p>
          </div>
        </div>
      );
    }
    if (geoError && !userLocation) {
      return (
        <div className="h-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <MapPin size={28} className="mx-auto text-red-300 mb-2" />
            <p className="text-red-500 font-medium text-sm mb-1">Error de ubicacion</p>
            <p className="text-gray-400 text-xs mb-4 max-w-[200px] mx-auto">{geoError}</p>
            <button onClick={getLocation}
              className="px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-sm">
              Reintentar ubicacion
            </button>
            <button onClick={() => { setShowCityInput(true); setShowFullAddress(true); }}
              className="block mx-auto mt-2 text-xs text-gray-400 hover:text-gray-600 underline">
              Ingresar direccion manualmente
            </button>
          </div>
        </div>
      );
    }
    if (showCityInput) {
      return (
        <div className="h-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4 w-full max-w-xs">
            <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium text-sm mb-3">
              {showFullAddress ? 'Ingresa tu direccion exacta' : 'Selecciona tu ubicacion'}
            </p>
            {showFullAddress ? (
              <div className="space-y-2 text-left">
                <div className="flex gap-2">
                  <input type="text" value={addressForm.street} onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))}
                    placeholder="Calle" className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <input type="text" value={addressForm.number} onChange={e => setAddressForm(f => ({ ...f, number: e.target.value }))}
                    placeholder="Numero" className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <input type="text" value={addressForm.neighborhood} onChange={e => setAddressForm(f => ({ ...f, neighborhood: e.target.value }))}
                  placeholder="Barrio (opcional)" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                <div className="flex gap-2">
                  <input type="text" value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Ciudad" className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <select value={addressForm.province} onChange={e => setAddressForm(f => ({ ...f, province: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    <option value="">Provincia</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <button onClick={() => geocodeFullAddress(addressForm)}
                  disabled={!addressForm.city || !addressForm.province || geoLoading}
                  className="w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2">
                  {geoLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MapPin size={14} />}
                  {geoLoading ? 'Buscando...' : 'Ubicar direccion'}
                </button>
                <button onClick={() => setShowFullAddress(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline w-full text-center">Usar solo ciudad</button>
              </div>
            ) : (
              <div className="space-y-2">
                <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Provincia</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="text" value={manualCity} onChange={e => setManualCity(e.target.value)}
                  placeholder="Ciudad (ej: La Plata)"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                <button onClick={() => { if (manualCity.trim() && selectedProvince) { setAddressForm(f => ({ ...f, city: manualCity, province: selectedProvince })); setShowFullAddress(true); } }}
                  disabled={!manualCity.trim() || !selectedProvince || geoLoading}
                  className="w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2">
                  {geoLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MapPin size={14} />}
                  {geoLoading ? 'Buscando...' : 'Siguiente: direccion exacta'}
                </button>
                <button onClick={() => setShowFullAddress(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline w-full text-center">Ingresar direccion completa</button>
              </div>
            )}
            {geoError && <p className="text-red-500 text-xs mt-2">{geoError}</p>}
            <button onClick={() => { setShowCityInput(false); getLocation(); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline mt-3">Intentar con GPS</button>
          </div>
        </div>
      );
    }
    if (!userLocation) {
      return (
        <div className="h-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium text-sm mb-3">Activa tu ubicacion</p>
            <button onClick={getLocation}
              className="px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-sm">
              Activar ubicacion
            </button>
            <button onClick={() => { setShowCityInput(true); setShowFullAddress(true); }}
              className="block mx-auto mt-2 text-xs text-gray-400 hover:text-gray-600 underline">
              Ingresar direccion manualmente
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
        <MapContainer key={`${userLocation.lat}-${userLocation.lng}`} center={[userLocation.lat, userLocation.lng]} zoom={13} className="h-full w-full" zoomControl={false}>
          <MapRenderFix />
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup><div className="text-center"><p className="font-semibold text-sm">Tu ubicacion</p><p className="text-xs text-gray-500">{userAddress || 'Estas aqui'}</p></div></Popup>
          </Marker>
          {featuredPros.slice(0, 5).map((pro) => {
            const raw = pro.location?.coordinates?.coordinates || pro.location?.coordinates;
            return raw && raw.length === 2 ? (
              <Marker key={pro._id} position={[raw[1], raw[0]]} icon={customIcon}>
                <Popup>
                  <div className="text-center min-w-[180px]">
                    <img src={pro.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.businessName || pro.profession)}&background=0f7a5a&color=fff`}
                      alt="" className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" />
                    <p className="font-semibold text-sm">{pro.businessName || pro.profession}</p>
                    <p className="text-xs text-gray-500 mb-2">{pro.profession}</p>
                    <StarRating rating={pro.stats?.rating || 0} size={11} />
                    <Link to={`/service/${pro._id}`} className="block mt-2 text-xs text-primary-600 font-medium hover:underline">Ver perfil</Link>
                  </div>
                </Popup>
              </Marker>
            ) : null;
          })}
        </MapContainer>
        <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-col items-center gap-1.5">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-3 text-sm">
            <MapPin size={14} className="text-primary-500 shrink-0" />
            <span className="text-gray-600 text-xs truncate max-w-[140px]">{userAddress || 'Profesionales cerca de tu ubicacion'}</span>
            {locationMode === 'gps' && <span className="text-[10px] text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded font-medium">GPS</span>}
            {locationMode === 'city' && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Ciudad</span>}
            <button onClick={() => { setShowCityInput(true); setShowFullAddress(true); }} className="text-xs text-gray-400 hover:text-gray-600 underline ml-auto">cambiar</button>
          </div>
          {user && locationMode === 'city' && (
            <button onClick={saveAddressToProfile}
              className="text-[11px] bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg shadow-lg transition-all flex items-center gap-1.5">
              <MapPin size={12} /> Guardar direccion en mi perfil
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{BRAND.name} — Marketplace de Servicios Profesionales en Argentina</title>
        <meta name="description" content={BRAND.description} />
        <meta name="keywords" content="profesionales, servicios, albanil, plomero, electricista, medico, comercios, empresas, argentina, marketplace" />
        <meta property="og:title" content={`${BRAND.name} — Encuentra Profesionales Cerca Tuyo`} />
        <meta property="og:description" content={BRAND.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={BRAND.url} />
        <link rel="canonical" href={BRAND.url} />
      </Helmet>

      <header className="home-header">
        <nav className="home-nav" aria-label="Navegación principal">
          <Link to="/" className="home-logo-link" aria-label="MiProfesionalYa inicio">
            <img src={logoAsset} alt="MiProfesionalYa" />
          </Link>
          <button className="home-menu-toggle" type="button" aria-label="Abrir menú" aria-expanded={homeMenuOpen} onClick={() => setHomeMenuOpen(open => !open)}>
            {homeMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className={`home-nav-links${homeMenuOpen ? ' is-open' : ''}`}>
            <Link to="/" onClick={() => setHomeMenuOpen(false)}>Inicio</Link>
            <a href="#como-funciona" onClick={() => setHomeMenuOpen(false)}>Cómo funciona</a>
            <Link to="/search" onClick={() => setHomeMenuOpen(false)}>Profesionales</Link>
            <Link to="/login" onClick={() => setHomeMenuOpen(false)}>Iniciar sesión</Link>
            <Link to="/register" className="home-nav-cta" onClick={() => setHomeMenuOpen(false)}>Registrarse</Link>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-texture" />
        <div className="hero-veil" />
        <div className="hero-inner">
          <div className="hero-content">
            <p className="eyebrow">Marketplace de servicios profesionales</p>
            <h1>Encontrá al profesional que necesitás</h1>
            <p>Profesionales y servicios cerca tuyo, en un solo lugar.</p>
            <form className="hero-search" role="search" onSubmit={handleSearch}>
              <input type="text" className="query" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="¿Qué profesional o servicio estás buscando?" />
              <input type="text" className="loc" placeholder="¿Dónde?" />
              <button type="submit">Buscar</button>
            </form>
            <div className="hero-quickcats">
              <span>Plomería</span><span>Electricidad</span><span>Legal</span><span>Medicina</span><span>Contabilidad</span>
            </div>
          </div>
          <div className="hero-photo">
            <div className="hero-photo-frame">
              <img src={HERO_IMAGE} alt="Profesionales trabajando en equipo" />
              <div className="hero-photo-tag">Profesionales verificados</div>
            </div>
          </div>
        </div>
      </section>

      <section className="approved-features" id="como-funciona">
        <div className="approved-section-heading">
          <p className="eyebrow">Cómo funciona</p>
          <h2>Conectamos clientes con expertos de confianza</h2>
          <p>Encontrá profesionales, revisá su experiencia y contactalos con claridad desde un solo lugar.</p>
        </div>
        <div className="approved-feature-grid">
          {[
            ['https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=85', 'Buscar profesionales', 'Filtrá por categoría, zona y experiencia para encontrar el perfil más adecuado.'],
            ['https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=85', 'Crear perfil', 'Presentá tus servicios y experiencia en un espacio claro y profesional.'],
            ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=85', 'CV y experiencia', 'Destacá tus capacidades y antecedentes de trabajo relevantes.'],
            ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85', 'Servicios', 'Exhibí tus áreas de atención y modo de trabajo para que te encuentren.'],
            ['https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=85', 'Conocer al profesional', 'Revisá perfiles, credenciales y experiencia antes de elegir.'],
            ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=85', 'Contactar fácilmente', 'Comunicáte directamente para coordinar el servicio con rapidez.'],
          ].map(([image, title, description]) => (
            <article className="approved-feature-card" key={title}>
              <img src={image} alt="" loading="lazy" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="trust">
        <div className="item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
          <span><span className="label">Identidad verificada</span><span className="sub">Cada profesional pasa control</span></span>
        </div>
        <div className="item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>
          <span><span className="label">Pagos protegidos</span><span className="sub">Transacciones seguras</span></span>
        </div>
        <div className="item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          <span><span className="label">Respuesta rápida</span><span className="sub">Contacto directo y ágil</span></span>
        </div>
        <div className="item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.6-9.3-9.1C1.2 8.4 3 5 6.5 5c2 0 3.4 1.1 4 2.2C11.1 6.1 12.5 5 14.5 5 18 5 19.8 8.4 18.3 11.9 16 16.4 12 21 12 21z"/></svg>
          <span><span className="label">Cobertura nacional</span><span className="sub">Presencia en todo el país</span></span>
        </div>
      </div>

      <div className="ornament" style={{ marginTop: '52px' }}><div className="line" /><div className="diamond" /><div className="line" /></div>

      <div className="section-head" id="categorias">
        <p className="eyebrow">Explorá por rubro</p>
        <h2>Categorías</h2>
        <p>Las áreas más buscadas en MiProfesional, organizadas para encontrar rápido lo que necesitás.</p>
      </div>
      <div className="categories">
        <div className="cat-card">
          <div className="cat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10z"/></svg></div>
          <h4>Plomería</h4><div className="count">210 profesionales</div>
        </div>
        <div className="cat-card">
          <div className="cat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></div>
          <h4>Electricidad</h4><div className="count">185 profesionales</div>
        </div>
        <div className="cat-card">
          <div className="cat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v18M6 7h12M4 11l3-5 3 5M14 11l3-5 3 5M4 11a3 3 0 006 0M14 11a3 3 0 006 0M8 21h8"/></svg></div>
          <h4>Legal</h4><div className="count">96 profesionales</div>
        </div>
        <div className="cat-card">
          <div className="cat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.6-9.3-9.1C1.2 8.4 3 5 6.5 5c2 0 3.4 1.1 4 2.2C11.1 6.1 12.5 5 14.5 5 18 5 19.8 8.4 18.3 11.9 16 16.4 12 21 12 21z"/></svg></div>
          <h4>Medicina</h4><div className="count">142 profesionales</div>
        </div>
        <div className="cat-card">
          <div className="cat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 20h8M12 18v2"/></svg></div>
          <h4>Contabilidad</h4><div className="count">78 profesionales</div>
        </div>
        <div className="cat-card">
          <div className="cat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 21l6-6M13 3l8 8-4 4-8-8 4-4zM7 15l4 4-3 3-4-4z"/></svg></div>
          <h4>Construcción</h4><div className="count">164 profesionales</div>
        </div>
      </div>

      <div className="ornament" style={{ marginTop: '70px' }}><div className="line" /><div className="diamond" /><div className="line" /></div>

      <div className="section-head" id="profesionales">
        <p className="eyebrow">Los mejor calificados</p>
        <h2>Profesionales destacados</h2>
        <p>Perfiles verificados, con historial de trabajos y calificación real de otros clientes.</p>
      </div>
      <div className="pros-grid">
        <div className="pro-card">
          <div className="pro-photo">
            <img src={PROFESSIONAL_IMAGES[0]} alt="Perfil de profesional destacado" />
            <div className="pro-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
          </div>
          <div className="pro-info">
            <div className="pname">Nombre Apellido</div>
            <div className="prole">Plomería</div>
            <div className="pro-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.5 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.7z"/></svg> 4.9 · 120 reseñas</div>
            <Link to="/search" className="pro-link">Ver profesionales →</Link>
          </div>
        </div>
        <div className="pro-card">
          <div className="pro-photo">
            <img src={PROFESSIONAL_IMAGES[1]} alt="Perfil de profesional destacada" />
            <div className="pro-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
          </div>
          <div className="pro-info">
            <div className="pname">Nombre Apellido</div>
            <div className="prole">Electricidad</div>
            <div className="pro-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.5 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.7z"/></svg> 4.8 · 86 reseñas</div>
            <Link to="/search" className="pro-link">Ver profesionales →</Link>
          </div>
        </div>
        <div className="pro-card">
          <div className="pro-photo">
            <img src={PROFESSIONAL_IMAGES[2]} alt="Perfil de profesional destacado" />
            <div className="pro-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
          </div>
          <div className="pro-info">
            <div className="pname">Nombre Apellido</div>
            <div className="prole">Abogacía</div>
            <div className="pro-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.5 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.7z"/></svg> 5.0 · 54 reseñas</div>
            <Link to="/search" className="pro-link">Ver profesionales →</Link>
          </div>
        </div>
        <div className="pro-card">
          <div className="pro-photo">
            <img src={PROFESSIONAL_IMAGES[3]} alt="Perfil de profesional destacada" />
            <div className="pro-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
          </div>
          <div className="pro-info">
            <div className="pname">Nombre Apellido</div>
            <div className="prole">Medicina general</div>
            <div className="pro-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.5 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.7z"/></svg> 4.9 · 93 reseñas</div>
            <Link to="/search" className="pro-link">Ver profesionales →</Link>
          </div>
        </div>
      </div>

      <section className="pros-cta" id="para-profesionales">
        <div className="pros-cta-bg" />
        <div className="pros-cta-veil" />
        <div className="pros-cta-inner">
          <p className="eyebrow" style={{ color: 'var(--gold-1)', fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase' }}>¿Sos un profesional?</p>
          <h2>Sumate a la red de profesionales verificados</h2>
          <p>Creá tu perfil, mostrá tu experiencia y empezá a recibir clientes que te necesitan.</p>
          <div className="cta-buttons">
            <Link to="/register?role=professional" className="btn-gold">Registrarme como profesional</Link>
            <Link to="/search" className="btn-outline">Buscar un profesional</Link>
          </div>
        </div>
      </section>

      <div className="final-cta">
        <div className="final-cta-inner">
          <div className="final-cta-text">
            <p className="eyebrow">Empezá ahora</p>
            <h4>¿Necesitás un profesional hoy mismo?</h4>
            <p>Buscá, comparalos y coordiná en minutos.</p>
          </div>
          <Link to="/search" className="btn-gold">Buscar profesional</Link>
        </div>
      </div>

      <footer>
        <div className="footer-bg" />
        <div className="footer-veil" />
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={logoAsset} alt="MiProfesionalYa" />
            <p>Marketplace de servicios profesionales que conecta clientes con expertos verificados en toda la Argentina.</p>
          </div>
          <div>
            <h5>Navegación</h5>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><a href="#categorias">Categorías</a></li>
              <li><a href="#profesionales">Profesionales</a></li>
              <li><a href="#para-profesionales">Sumate</a></li>
            </ul>
          </div>
          <div>
            <h5>Contacto</h5>
            <ul>
              <li><Link to="/terms">Ayuda y soporte</Link></li>
              <li><Link to="/terms">Términos y condiciones</Link></li>
              <li><Link to="/terms">Privacidad</Link></li>
              <li><a href="#">contacto@miprofesional.online</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 www.miprofesional.online — Todos los derechos reservados</p>
          <div className="fsocial"><a href="#">f</a><a href="#">X</a><a href="#">◎</a></div>
        </div>
      </footer>
    </>
  );
};

export default Home;
