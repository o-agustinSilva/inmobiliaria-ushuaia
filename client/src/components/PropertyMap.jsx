import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Helper component to handle programmatic map actions
const MapController = ({ activeProperty, isFullscreen }) => {
  const map = useMap();

  // Fly to active property coordinates
  useEffect(() => {
    if (activeProperty && activeProperty.latitud && activeProperty.longitud) {
      const coords = [parseFloat(activeProperty.latitud), parseFloat(activeProperty.longitud)];
      map.flyTo(coords, 14, {
        duration: 1.2
      });
    }
  }, [activeProperty, map]);

  // Handle map container resizing on fullscreen toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  return null;
};

// Custom premium map marker (blue teardrop with a white circular base and a dark green house icon inside)
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

const PropertyMap = ({ properties }) => {
  const navigate = useNavigate();
  const [activeProperty, setActiveProperty] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter properties that have coordinates set
  const mappedProperties = properties.filter(
    (prop) => prop.latitud && prop.longitud && prop.estado === 'Aprobado'
  );

  // Cycle to previous property
  const handlePrev = () => {
    if (mappedProperties.length === 0) return;
    if (!activeProperty) {
      setActiveProperty(mappedProperties[mappedProperties.length - 1]);
      return;
    }
    const currentIndex = mappedProperties.findIndex((p) => p.id === activeProperty.id);
    const prevIndex = (currentIndex - 1 + mappedProperties.length) % mappedProperties.length;
    setActiveProperty(mappedProperties[prevIndex]);
  };

  // Cycle to next property
  const handleNext = () => {
    if (mappedProperties.length === 0) return;
    if (!activeProperty) {
      setActiveProperty(mappedProperties[0]);
      return;
    }
    const currentIndex = mappedProperties.findIndex((p) => p.id === activeProperty.id);
    const nextIndex = (currentIndex + 1) % mappedProperties.length;
    setActiveProperty(mappedProperties[nextIndex]);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Resolve image URL (Unsplash vs Express server path)
  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  return (
    <section className="mapa-seccion">
      <div className="container">
        <h2 className="mapa-header-title">Mapa de Propiedades</h2>

        <div className={`mapa-outer-container ${isFullscreen ? 'fullscreen' : ''}`}>
          {/* Top-Right Control Overlay (Navigation) */}
          <div className="mapa-controls-top-right">
            <button
              onClick={handlePrev}
              disabled={mappedProperties.length === 0}
              className="mapa-btn-nav"
              title="Propiedad Anterior"
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>
            <button
              onClick={handleNext}
              disabled={mappedProperties.length === 0}
              className="mapa-btn-nav"
              title="Propiedad Siguiente"
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Bottom-Right Control Overlay (Fullscreen toggle) */}
          <div className="mapa-controls-bottom-right">
            <button
              onClick={toggleFullscreen}
              className="mapa-btn-fullscreen"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={16} />
                  <span>Pantalla Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 size={16} />
                  <span>Pantalla Completa</span>
                </>
              )}
            </button>
          </div>

          {/* Leaflet Map */}
          <MapContainer
            center={[-54.8019, -68.303]} // Ushuaia Center coordinates
            zoom={13}
            zoomControl={true}
            className="mapa-element"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Draggable/interactive Markers */}
            {mappedProperties.map((prop) => (
              <Marker
                key={prop.id}
                position={[parseFloat(prop.latitud), parseFloat(prop.longitud)]}
                icon={customMapIcon}
                eventHandlers={{
                  click: () => {
                    setActiveProperty(prop);
                  }
                }}
              />
            ))}

            {/* Controlled Active Popup */}
            {activeProperty && activeProperty.latitud && activeProperty.longitud && (
              <Popup
                position={[parseFloat(activeProperty.latitud), parseFloat(activeProperty.longitud)]}
                onClose={() => setActiveProperty(null)}
                closeOnClick={false}
              >
                <div 
                  className="map-popup-card"
                  onClick={() => navigate(`/property/${activeProperty.id}`)}
                >
                  <img
                    src={
                      activeProperty.images && activeProperty.images.length > 0
                        ? getImageUrl(activeProperty.images.find((img) => img.es_principal)?.url || activeProperty.images[0].url)
                        : getImageUrl(null)
                    }
                    alt={activeProperty.titulo}
                    className="map-popup-img"
                  />
                  <div className="map-popup-info">
                    <span className="map-popup-category">
                      {activeProperty.tipo}
                    </span>
                    <h4 className="map-popup-title" title={activeProperty.titulo}>
                      {activeProperty.titulo}
                    </h4>
                    <p className="map-popup-price">
                      {activeProperty.moneda === 'USD' ? 'USD $' : '$'}
                      {Number(activeProperty.precio).toLocaleString('es-AR')}
                    </p>
                    <span className="map-popup-link">Ver detalles</span>
                  </div>
                </div>
              </Popup>
            )}

            {/* Programmatic Map Actions controller */}
            <MapController
              activeProperty={activeProperty}
              isFullscreen={isFullscreen}
            />
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default PropertyMap;
