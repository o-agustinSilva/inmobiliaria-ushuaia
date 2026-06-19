import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { smoothScrollTo } from '../utils/scroll';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    
    // Si cambió el pathname (ej: de /nosotros a /)
    const pathnameChanged = prevPathname !== pathname;

    // Si estábamos en '/' y vamos a '/' pero sin parámetros (hicieron clic en Inicio)
    const navigatedToInicio = pathname === '/' && search === '';

    if (pathnameChanged) {
      // Cambio de página: instantáneo para evitar el efecto de "serrucho"
      window.scrollTo(0, 0);
    } else if (navigatedToInicio) {
      // Clic en Inicio: suave personalizado
      smoothScrollTo(0, 600);
    }

    prevPathnameRef.current = pathname;
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
