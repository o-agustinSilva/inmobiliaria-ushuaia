import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize } from 'lucide-react';

const getTipoColor = (tipo) => {
  switch (tipo) {
    case 'Alquiler':
      return '#0e4a47'; // var(--primary-color)
    case 'Venta en pozo':
      return '#e29578'; // var(--secondary-color)
    case 'Venta':
    default:
      return '#2d3748'; // dark charcoal
  }
};

const PropertyCard = ({ property }) => {
  const { id, titulo, direccion, precio, dormitorios, banos, m2, estado, images, tipo, moneda } = property;

  // Resolve image URL (Unsplash seed vs local Express upload)
  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  const primaryImage = images && images.find(img => img.es_principal) || (images && images[0]);
  const imageUrl = primaryImage ? getImageUrl(primaryImage.url) : getImageUrl(null);

  // Status labels and styling
  const statusClasses = {
    'Pendiente': 'badge-pendiente',
    'Aprobado': 'badge-aprobado',
    'Alquilado': 'badge-alquilado',
    'Vendido': 'badge-vendido'
  };

  const isSoldOrRented = estado === 'Vendido' || estado === 'Alquilado';
  const displayStatus = estado === 'Vendido' ? 'VENDIDA' : estado === 'Alquilado' ? 'ALQUILADA' : estado;

  return (
    <article className="property-card">
      <Link to={`/property/${id}`} className="card-img-wrapper">
        <img 
          src={imageUrl} 
          alt={titulo} 
          className="card-img" 
          loading="lazy" // Performance photo optimization: Lazy loading
        />
        {isSoldOrRented ? (
          <div className="card-overlay-blur">
            <span className="overlay-status-text">{displayStatus}</span>
          </div>
        ) : (
          <>
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', zIndex: 2 }}>
              <span style={{ backgroundColor: getTipoColor(tipo), color: '#fff', fontSize: '11px', fontWeight: 700, padding: '6px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {tipo || 'Venta'}
              </span>
              {estado !== 'Aprobado' && (
                <span className={statusClasses[estado]} style={{ color: '#fff', fontSize: '11px', fontWeight: 700, padding: '6px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  {estado}
                </span>
              )}
            </div>
            <div className="card-price-tag">
              {moneda === 'USD' ? 'USD $' : '$'}{Number(precio).toLocaleString('es-AR')}
            </div>
          </>
        )}
      </Link>

      <div className="card-content">
        <h3 className="card-title">
          <Link to={`/property/${id}`}>{titulo}</Link>
        </h3>
        
        <p className="card-address">
          <MapPin size={14} className="logo-accent" />
          <span>{direccion}</span>
        </p>

        <div className="card-amenities">
          <div className="amenity-item" title="Dormitorios">
            <BedDouble size={16} />
            <span>{dormitorios} {dormitorios === 1 ? 'Dorm' : 'Dorms'}</span>
          </div>
          <div className="amenity-item" title="Baños">
            <Bath size={16} />
            <span>{banos} {banos === 1 ? 'Baño' : 'Baños'}</span>
          </div>
          <div className="amenity-item" title="Metros cuadrados">
            <Maximize size={16} />
            <span>{m2} m²</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
