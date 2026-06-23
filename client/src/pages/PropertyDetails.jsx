import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import ContactForm from '../components/ContactForm';
import { MapPin, BedDouble, Bath, Maximize, ArrowLeft, Calendar, Phone, Mail, Award, X, ChevronLeft, ChevronRight } from 'lucide-react';
import L from 'leaflet';

const PropertyDetails = () => {
  const { id } = useParams();
  const { showToast } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeImageIndex = 0;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const mapInitializedRef = useRef(false);
  const mapRef = useRef(null);
  
  const thumbsRef = useRef(null);
  const [showPrevBtn, setShowPrevBtn] = useState(false);
  const [showNextBtn, setShowNextBtn] = useState(false);

  // States and variables for swiping in lightbox
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const checkScrollLimits = () => {
    if (thumbsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = thumbsRef.current;
      setShowPrevBtn(scrollLeft > 2);
      setShowNextBtn(scrollLeft < scrollWidth - clientWidth - 2);
    }
  };

  const scrollThumbsLeft = () => {
    if (thumbsRef.current) {
      thumbsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollThumbsRight = () => {
    if (thumbsRef.current) {
      thumbsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('lightbox-overlay')) {
      if (touchStart && touchEnd && Math.abs(touchStart - touchEnd) > 10) {
        return;
      }
      closeLightbox();
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, property]);

  useEffect(() => {
    checkScrollLimits();
    
    const thumbsEl = thumbsRef.current;
    if (thumbsEl) {
      thumbsEl.addEventListener('scroll', checkScrollLimits);
      window.addEventListener('resize', checkScrollLimits);
      
      const observer = new ResizeObserver(checkScrollLimits);
      observer.observe(thumbsEl);
      
      return () => {
        thumbsEl.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
        observer.disconnect();
      };
    }
  }, [property, loading]);

  // Helper for resolving image urls
  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/properties/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProperty(data);
        } else {
          showToast(data.error || 'Error al cargar propiedad', 'error');
        }
      } catch (error) {
        console.error('Error fetching property detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id]);

  // Leaflet map initialization
  useEffect(() => {
    if (!property || loading) return;

    // Use actual database coordinates or fallback to Ushuaia center
    const lat = property.latitud ? parseFloat(property.latitud) : -54.8019;
    const lng = property.longitud ? parseFloat(property.longitud) : -68.303;

    // Check if map container exists and clear previous leaflet instance if needed
    const container = L.DomUtil.get('property-map');
    if (container) {
      container._leaflet_id = null;
    }

    try {
      const map = L.map('property-map').setView([lat, lng], 15);
      mapRef.current = map;

      // Use consistent voyager tiles matching Home map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      // Premium custom marker matching the home map style
      const customMapIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-pin"></div>
          <div class="marker-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 13px; height: 13px;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -34]
      });

      const marker = L.marker([lat, lng], { icon: customMapIcon }).addTo(map);
      marker.bindPopup(`<b>${property.titulo}</b><br/>${property.direccion}`).openPopup();

      mapInitializedRef.current = true;
    } catch (e) {
      console.error('Leaflet initialization error:', e);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [property, loading]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14, 74, 71, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Propiedad no encontrada</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px 0' }}>
          La propiedad que estás buscando no existe o fue dada de baja.
        </p>
        <Link to="/" className="btn-secondary">Volver al Inicio</Link>
      </div>
    );
  }

  const imagesList = property.images && property.images.length > 0 ? property.images : [{ url: null }];
  const mainImage = imagesList[activeImageIndex];

  return (
    <div className="container" style={{ paddingTop: '30px' }}>
      {/* Back button */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 600, marginBottom: '24px', transition: 'var(--transition-smooth)' }} className="back-link">
        <ArrowLeft size={16} />
        <span>Volver al catálogo</span>
      </Link>

      <div className="details-layout">
        {/* Main Details Area */}
        <div className="details-main-col">
          {/* Gallery Carousel */}
          <div className="gallery-container">
            <div className="gallery-main-wrapper" onClick={() => openLightbox(activeImageIndex)}>
              <img 
                src={getImageUrl(mainImage.url)} 
                alt={property.titulo} 
                className="gallery-main-img" 
              />
              <div className="gallery-zoom-overlay">
                <Maximize size={20} />
                <span>Ver pantalla completa</span>
              </div>
            </div>
            {imagesList.length > 1 && (
              <div className="gallery-thumbs-container">
                <button 
                  className={`thumb-nav-btn prev ${showPrevBtn ? 'visible' : ''}`}
                  onClick={scrollThumbsLeft}
                  aria-label="Imagen anterior"
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="gallery-thumbs" ref={thumbsRef}>
                  {imagesList.map((img, index) => (
                    <img
                      key={img.id || index}
                      src={getImageUrl(img.url)}
                      alt={`${property.titulo} thumbnail ${index + 1}`}
                      className={`gallery-thumb ${activeImageIndex === index ? 'active' : ''}`}
                      onClick={() => {
                        openLightbox(index);
                      }}
                    />
                  ))}
                </div>

                <button 
                  className={`thumb-nav-btn next ${showNextBtn ? 'visible' : ''}`}
                  onClick={scrollThumbsRight}
                  aria-label="Siguiente imagen"
                  type="button"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="detail-main-info">
            <div className="detail-header">
              <div>
                <h1 className="detail-title">{property.titulo}</h1>
                <p className="card-address" style={{ marginTop: '6px', fontSize: '16px' }}>
                  <MapPin size={16} className="logo-accent" />
                  <span>{property.direccion}</span>
                </p>
              </div>
              <div className="detail-price-wrapper">
                <span className="badge-operacion" style={{ backgroundColor: property.tipo === 'Alquiler' ? '#0e4a47' : property.tipo === 'Venta en pozo' ? '#e29578' : '#2d3748', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {property.tipo || 'Venta'}
                </span>
                <span className="detail-price-amount">
                  {property.moneda === 'USD' ? 'USD $' : '$'}{Number(property.precio).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="detail-amenity-grid">
              <div className="detail-amenity-card">
                <BedDouble size={24} style={{ color: 'var(--primary-color)' }} />
                <span className="detail-amenity-value">{property.dormitorios}</span>
                <span className="detail-amenity-label">Dormitorios</span>
              </div>
              <div className="detail-amenity-card">
                <Bath size={24} style={{ color: 'var(--primary-color)' }} />
                <span className="detail-amenity-value">{property.banos}</span>
                <span className="detail-amenity-label">Baños</span>
              </div>
              <div className="detail-amenity-card">
                <Maximize size={24} style={{ color: 'var(--primary-color)' }} />
                <span className="detail-amenity-value">{property.m2}</span>
                <span className="detail-amenity-label">Metros (m²)</span>
              </div>
            </div>

            <h2 className="detail-description-title">Descripción</h2>
            <p className="detail-description">
              {property.descripcion || 'Sin descripción disponible por el momento.'}
            </p>
          </div>

          {/* Map Location */}
          <div className="map-section">
            <h2 className="map-title">Ubicación aproximada</h2>
            <div className="map-wrapper">
              <div id="property-map" style={{ width: '100%', height: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Sidebar Panel (Contact form and agent profile) */}
        <div className="contact-sidebar">
          {/* Agent details */}
          <div className="sidebar-card" style={{ paddingBottom: '20px' }}>
            <h3 className="sidebar-title" style={{ fontSize: '16px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Agente Responsable
            </h3>
            <div className="agent-profile">
              <div className="agent-avatar">
                {property.agent ? property.agent.nombre.charAt(0) : 'U'}
              </div>
              <div className="agent-info">
                <span className="agent-name">{property.agent ? property.agent.nombre : 'Inmobiliaria Ushuaia'}</span>
                <span className="agent-role">{property.agent ? property.agent.rol : 'Martillero Responsable'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} />
                <span>+54 2901 445588</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} />
                <span>{property.agent ? property.agent.email : 'contacto@ushuaia.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={14} />
                <span>Matrícula N° 846 TDF</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">Contactar Agente</h3>
            <ContactForm propertyId={property.id} />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="lightbox-overlay" 
          onClick={handleOverlayClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {imagesList.length > 1 && (
            <div 
              className="lightbox-nav-zone prev" 
              onClick={(e) => { 
                e.stopPropagation(); 
                prevImage(); 
              }}
            >
              <button 
                className="lightbox-nav-btn prev" 
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={42} />
              </button>
            </div>
          )}

          {imagesList.length > 1 && (
            <div 
              className="lightbox-nav-zone next" 
              onClick={(e) => { 
                e.stopPropagation(); 
                nextImage(); 
              }}
            >
              <button 
                className="lightbox-nav-btn next" 
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={42} />
              </button>
            </div>
          )}

          <button className="lightbox-close-btn" onClick={closeLightbox} aria-label="Cerrar">
            <X size={28} />
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getImageUrl(imagesList[lightboxIndex].url)} 
              alt={`${property.titulo} pantalla completa ${lightboxIndex + 1}`} 
              className="lightbox-img" 
            />
            {imagesList.length > 1 && (
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {imagesList.length}
              </div>
            )}
          </div>

          {/* Mini carousel inside lightbox */}
          {imagesList.length > 1 && (
            <div className="lightbox-thumbs-carousel" onClick={(e) => e.stopPropagation()}>
              {imagesList.map((img, index) => (
                <img
                  key={img.id || index}
                  src={getImageUrl(img.url)}
                  alt={`Preview ${index + 1}`}
                  className={`lightbox-thumb-preview ${lightboxIndex === index ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
