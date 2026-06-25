import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Users, Hammer, KeySquare } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-login helper
  const handleQuickLogin = async (demoRole) => {
    setLoading(true);
    let demoEmail = '';
    let demoPassword = '';

    switch (demoRole) {
      case 'SuperAdmin':
        demoEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || '';
        demoPassword = import.meta.env.VITE_SUPERADMIN_PASSWORD || '';
        break;
      case 'Martillero':
        demoEmail = import.meta.env.VITE_MARTILLERO_EMAIL || '';
        demoPassword = import.meta.env.VITE_MARTILLERO_PASSWORD || '';
        break;
      case 'Agente':
        demoEmail = import.meta.env.VITE_AGENTE_EMAIL || '';
        demoPassword = import.meta.env.VITE_AGENTE_PASSWORD || '';
        break;
      default:
        break;
    }

    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      await login(demoEmail, demoPassword);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-wrapper">
        <h2 className="login-title">Portal de Gestión</h2>
        <p className="login-subtitle">Acceso exclusivo para el personal de Inmobiliaria Ushuaia</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Corporativo</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="usuario@inmobiliariaushuaia.com"
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '48px' }}>
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Demo Fast Login Simulation (Highly Requested) */}
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '32px', paddingTop: '24px' }}>
          <h3 className="demo-selector-title">Simulador de Roles de Prueba</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
            Haz click en cualquiera para entrar instantáneamente con los permisos correspondientes.
          </p>
          <div className="demo-buttons-grid">
            <button
              type="button"
              onClick={() => handleQuickLogin('SuperAdmin')}
              className="btn-demo"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '80px', justifyContent: 'center' }}
            >
              <KeySquare size={18} style={{ color: 'var(--primary-color)' }} />
              <span>SuperAdmin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Martillero')}
              className="btn-demo"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '80px', justifyContent: 'center' }}
            >
              <Hammer size={18} style={{ color: 'var(--secondary-color)' }} />
              <span>Martillero</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Agente')}
              className="btn-demo"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '80px', justifyContent: 'center' }}
            >
              <Users size={18} style={{ color: '#457b9d' }} />
              <span>Agente/Sec</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;