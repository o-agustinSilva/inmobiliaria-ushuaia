import React, { useState, useEffect, useRef } from 'react';
import { Maximize, ChevronLeft, ChevronRight } from 'lucide-react';

const PropertyGallery = ({ imagesList, getImageUrl, propertyTitulo, openLightbox }) => {
  const thumbsRef = useRef(null);
  const [showPrevBtn, setShowPrevBtn] = useState(false);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const activeImageIndex = 0;
  const mainImage = imagesList[activeImageIndex];

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
  }, [imagesList]);

  return (
    <div className="gallery-container">
      <div className="gallery-main-wrapper" onClick={() => openLightbox(activeImageIndex)}>
        <img
          src={getImageUrl(mainImage.url)}
          alt={propertyTitulo}
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
                alt={`${propertyTitulo} thumbnail ${index + 1}`}
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
  );
};

export default PropertyGallery;
