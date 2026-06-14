import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="container footer-content">
        <div className="footer-info">
          <h3 style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: '8px' }}>
            Inmobiliaria Ushuaia
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '350px', marginBottom: '16px' }}>
            Tu inmobiliaria de confianza en el Fin del Mundo. Encontrá tu propiedad ideal en Tierra del Fuego.
          </p>
        </div>

        <div className="footer-center">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} />
              <span>Av. San Martín 450, Ushuaia, Tierra del Fuego, Argentina</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} />
              <span>+54 (2901) 42-1234</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} />
              <span>contacto@inmobiliariaushuaia.com</span>
            </div>
          </div>
        </div>

        <div className="footer-right">
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {currentYear} Inmobiliaria Ushuaia. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={12} className="footer-admin-link" />
            <Link to="/admin/login" className="footer-admin-link" style={{ fontSize: '13px' }}>
              Portal de Administración Interno
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
