import React from 'react';
import { BedDouble, Bath, Maximize } from 'lucide-react';

const PropertyAmenities = ({ dormitorios, banos, m2 }) => {
  return (
    <div className="detail-amenity-grid">
      <div className="detail-amenity-card">
        <BedDouble size={24} style={{ color: 'var(--primary-color)' }} />
        <span className="detail-amenity-value">{dormitorios}</span>
        <span className="detail-amenity-label">Dormitorios</span>
      </div>
      <div className="detail-amenity-card">
        <Bath size={24} style={{ color: 'var(--primary-color)' }} />
        <span className="detail-amenity-value">{banos}</span>
        <span className="detail-amenity-label">Baños</span>
      </div>
      <div className="detail-amenity-card">
        <Maximize size={24} style={{ color: 'var(--primary-color)' }} />
        <span className="detail-amenity-value">{m2}</span>
        <span className="detail-amenity-label">Metros (m²)</span>
      </div>
    </div>
  );
};

export default PropertyAmenities;
