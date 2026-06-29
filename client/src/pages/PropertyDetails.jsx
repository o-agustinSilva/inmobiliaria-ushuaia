import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { MapPin, ArrowLeft } from 'lucide-react';
import L from 'leaflet';
import PropertyGallery from '../components/PropertyGallery';
import PropertyLightbox from '../components/PropertyLightbox';
import PropertyAmenities from '../components/PropertyAmenities';
import AgentSidebar from '../components/AgentSidebar';

const PropertyDetails = () => {
  const { id } = useParams();
  const { showToast } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const mapInitializedRef = useRef(false);
  const mapRef = useRef(null);

  const openLightbox = (index) => {
    setLightboxInitialIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

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
      const map = L.map('property-map', { attributionControl: false }).setView([lat, lng], 15);
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
          <PropertyGallery
            imagesList={imagesList}
            getImageUrl={getImageUrl}
            propertyTitulo={property.titulo}
            openLightbox={openLightbox}
          />

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
            <PropertyAmenities
              dormitorios={property.dormitorios}
              banos={property.banos}
              m2={property.m2}
            />

            <h2 className="detail-description-title">Descripción</h2>
            {property.descripcion ? (
              <div 
                className="detail-description" 
                dangerouslySetInnerHTML={{ __html: property.descripcion }}
              />
            ) : (
              <p className="detail-description">Sin descripción disponible por el momento.</p>
            )}
          </div>

          {/* Map Location */}
          <div className="map-section">
            <h2 className="map-title">Ubicación</h2>
            <div className="map-wrapper">
              <div id="property-map" style={{ width: '100%', height: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Sidebar Panel (Contact form and agent profile) */}
        <AgentSidebar
          agent={property.agent}
          propertyId={property.id}
        />
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <PropertyLightbox
          initialIndex={lightboxInitialIndex}
          imagesList={imagesList}
          getImageUrl={getImageUrl}
          propertyTitulo={property.titulo}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
