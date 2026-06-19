import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cambio de página: scroll instantáneo para evitar el efecto de "serrucho"
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
