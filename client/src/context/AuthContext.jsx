import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('inmo_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Show automatic toasts for user notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    if (token) {
      // Validate token & get profile
      fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Sesión expirada');
        }
        return res.json();
      })
      .then(userData => {
        setUser(userData);
      })
      .catch(err => {
        console.error(err);
        logout();
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('inmo_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Bienvenido/a, ${data.user.nombre}!`, 'success');
      return data.user;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('inmo_token');
    setToken(null);
    setUser(null);
    showToast('Sesión cerrada correctamente.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, toast, showToast }}>
      {children}
      {toast && (
        <div className={`notification-toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
