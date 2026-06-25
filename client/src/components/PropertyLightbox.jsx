import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PropertyLightbox = ({ initialIndex, imagesList, getImageUrl, propertyTitulo, onClose }) => {
  const [lightboxIndex, setLightboxIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
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
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, imagesList.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
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

      <button className="lightbox-close-btn" onClick={onClose} aria-label="Cerrar">
        <X size={28} />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={getImageUrl(imagesList[lightboxIndex].url)}
          alt={`${propertyTitulo} pantalla completa ${lightboxIndex + 1}`}
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
  );
};

export default PropertyLightbox;
