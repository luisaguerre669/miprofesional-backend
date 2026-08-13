import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Store, Shield, ChevronLeft, ChevronRight, Sparkles, Gift, AlertTriangle, XCircle } from 'lucide-react';
import { usePromo } from '../hooks/usePromo';
import { getPromoLabel } from '../utils/promoLabels';
import './MainBanner.css';

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', alt: 'Comercios de barrio' },
  { src: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80', alt: 'Negocio local' },
  { src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80', alt: 'Profesionales' },
  { src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80', alt: 'Servicios' },
];

const trustItems = [
  { icon: Shield, text: 'Comercios verificados' },
  { icon: Store, text: 'Pizzerías, farmacias, panaderías...' },
  { icon: Search, text: 'Búsqueda rápida' },
  { icon: MapPin, text: 'Cerca de tu zona' },
];

export default function MainBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const promo = usePromo();
  const promoLabel = getPromoLabel(promo.remaining);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const prev = () => setCurrentSlide(s => (s === 0 ? galleryImages.length - 1 : s - 1));
  const next = () => setCurrentSlide(s => (s === galleryImages.length - 1 ? 0 : s + 1));

  return (
    <section className="main-banner" role="banner" aria-label="Banner principal">
      <div className="main-banner-bg" />

      <div className="main-banner-overlay">
        <div className="main-banner-content">
          <div className="main-banner-text">
            <span className="main-banner-tag">
              <Store size={14} /> Comercios de cercanía
            </span>
            <h1 className="main-banner-title">
              Comercios y profesionales{' '}
              <span className="main-banner-title-accent">de tu zona</span>
            </h1>
            <p className="main-banner-desc">
              Encontrá pizzerías, farmacias, panaderías, veterinarias, ópticas y muchos más
              comercios de barrio. También profesionales verificados cerca de tu hogar.
            </p>

            <div className="main-banner-actions">
              <Link to="/search?primaryCategory=comercio" className="main-banner-btn main-banner-btn-primary" tabIndex={0}>
                <Store size={18} />
                Ver comercios
              </Link>
              <Link to="/register?role=professional" className="main-banner-btn main-banner-btn-secondary" tabIndex={0}>
                Sumar mi comercio
              </Link>
            </div>

            <div className="main-banner-trust">
              {trustItems.map((item, i) => (
                <div key={i} className="main-banner-trust-item">
                  <item.icon size={14} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="main-banner-gallery">
            {isMobile ? (
              <div className="main-banner-gallery-single">
                <img
                  src={galleryImages[currentSlide].src}
                  alt={galleryImages[currentSlide].alt}
                  loading="lazy"
                />
                <div className="main-banner-gallery-controls">
                  <button onClick={prev} aria-label="Anterior" className="gallery-nav-btn"><ChevronLeft size={20} /></button>
                  <div className="gallery-dots">
                    {galleryImages.map((_, i) => (
                      <span key={i} className={`gallery-dot ${i === currentSlide ? 'active' : ''}`} />
                    ))}
                  </div>
                  <button onClick={next} aria-label="Siguiente" className="gallery-nav-btn"><ChevronRight size={20} /></button>
                </div>
              </div>
            ) : (
              <div className="main-banner-gallery-grid">
                {galleryImages.map((img, i) => (
                  <div key={i} className={`main-banner-gallery-card ${i === 0 ? 'gallery-card-featured' : ''}`}>
                    <img src={img.src} alt={img.alt} loading={i === 0 ? 'eager' : 'lazy'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROMO BANNER */}
      {promoLabel.done ? (
        <div className="main-banner-promo-slot" aria-label="Promocion finalizada">
          <span className="promo-slot-label">Promoción de lanzamiento</span>
          <div className="promo-slot-finished block no-underline">
            <div className="promo-slot-content">
              <XCircle size={18} className="text-gray-400" />
              <span className="promo-slot-text text-gray-400">
                <strong>PROMOCIÓN DE LANZAMIENTO</strong> — Los 700 cupos fueron asignados. La promoción ha finalizado.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`main-banner-promo-slot ${promoLabel.critical ? 'promo-urgent' : promoLabel.urgent ? 'promo-low' : ''}`} aria-label="Promocion 60 dias gratis">
          <span className="promo-slot-label">Promoción de lanzamiento</span>
          <Link to="/register" className="promo-slot-active block no-underline">
            <div className="promo-slot-content">
              {promoLabel.critical ? <AlertTriangle size={18} className="text-red-500" /> : <Gift size={18} />}
              <span className="promo-slot-text">
                <strong>PROMOCIÓN DE LANZAMIENTO</strong> — 60 DÍAS GRATIS para los primeros 700 suscriptores entre Profesionales, Comercios y Empresas.
              </span>
              <span className="promo-slot-counter">{promoLabel.label}</span>
              <span className="promo-slot-cta">Registrarme ahora →</span>
            </div>
          </Link>
        </div>
      )}
    </section>
  );
}
