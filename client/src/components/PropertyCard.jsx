import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize } from 'lucide-react';

const getTipoClass = (tipo) => {
  switch (tipo) {
    case 'Alquiler':
      return 'badge-tipo-alquiler';
    case 'Venta en pozo':
      return 'badge-tipo-pozo';
    case 'Venta':
    default:
      return 'badge-tipo-venta';
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
          <div className="card-image-badges">
            <span className={`card-image-badge ${getTipoClass(tipo)}`}>
              {tipo || 'Venta'}
            </span>
            {estado !== 'Aprobado' && (
              <span className={`card-image-badge ${statusClasses[estado]}`}>
                {estado}
              </span>
            )}
          </div>
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

        <div className="card-price-bottom">
          {moneda === 'USD' ? 'USD $' : '$'}{Number(precio).toLocaleString('es-AR')}
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
