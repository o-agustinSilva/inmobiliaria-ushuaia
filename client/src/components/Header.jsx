import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Building2, UserCircle2, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { name: 'Inicio', path: '/' },
    { name: 'Comprar', path: '/?tipo=Venta' },
    { name: 'Alquilar', path: '/?tipo=Alquiler' },
    { name: 'Venta en pozo', path: '/?tipo=Venta en pozo' },
    { name: 'Nosotros', path: '/nosotros' }
  ];

  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('tipo');
    
    if (location.pathname === '/nosotros') {
      return 'Nosotros';
    }
    if (location.pathname === '/') {
      if (tipo === 'Venta') return 'Comprar';
      if (tipo === 'Alquiler') return 'Alquilar';
      if (tipo === 'Venta en pozo') return 'Venta en pozo';
      return 'Inicio';
    }
    return '';
  };

  const activeTabName = getActiveTab();

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  return (
    <header className="app-header">
      <div className="container header-container">
        {/* Logo Text (No Logo Image yet) */}
        <Link to="/" className="logo-text" onClick={() => { setIsMenuOpen(false); }}>
          <Building2 size={26} className="logo-accent" />
          <span>INMOBILIARIA <span className="logo-accent">USHUAIA</span></span>
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Generic Tabs (Without deep routing functionality) */}
        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-tabs">
            {tabs.map((tab) => (
              <li key={tab.name}>
                <a
                  href={tab.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(tab);
                    setIsMenuOpen(false);
                  }}
                  className={`nav-link ${activeTabName === tab.name ? 'active' : ''}`}
                >
                  {tab.name}
                </a>
              </li>
            ))}
          </ul>
          
          {/* Mobile-only actions section inside the drawer */}
          <div className="mobile-actions">
            {user ? (
              <>
                <Link to="/admin/dashboard" className="sidebar-menu-btn active" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#fff', width: '100%', justifyContent: 'center' }}>
                  <LayoutDashboard size={18} />
                  <span>Panel ({user.rol})</span>
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn-login" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <LogOut size={18} />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn-login" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                <UserCircle2 size={18} />
                <span>Acceso Interno</span>
              </Link>
            )}
          </div>
        </nav>

        {/* Header Actions (Access to admin portal) - Desktop Only */}
        <div className="header-actions">
          {user ? (
            <>
              <Link to="/admin/dashboard" className="sidebar-menu-btn active" style={{ display: 'flex', gap: '8px', padding: '8px 14px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                <LayoutDashboard size={18} />
                <span style={{ fontSize: '14px' }}>Panel ({user.rol})</span>
              </Link>
              <button onClick={logout} className="btn-icon" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }} title="Cerrar Sesión">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="btn-login" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle2 size={18} />
              <span>Acceso Interno</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
