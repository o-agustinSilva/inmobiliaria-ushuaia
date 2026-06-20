import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    dormitorios: '',
    minPrecio: '',
    maxPrecio: '',
    tipo: '',
    moneda: '' // Default empty to show both USD and ARS initially
  });

  // Synchronize state when URL parameters (tipo) change
  useEffect(() => {
    const newTipo = tipoParam || '';
    const newMoneda = newTipo === 'Alquiler' ? 'ARS' : newTipo !== '' ? 'USD' : '';

    setFilters(prev => ({
      ...prev,
      tipo: newTipo,
      moneda: newMoneda,
      minPrecio: '',
      maxPrecio: '' // Reset price filters when type changes
    }));

    if (tipoParam) {
      const catalogSection = document.getElementById('filter-bar');
      if (catalogSection) {
        setTimeout(() => {
          catalogSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [tipoParam]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.dormitorios) queryParams.append('dormitorios', filters.dormitorios);
      if (filters.tipo) queryParams.append('tipo', filters.tipo);
      if (filters.moneda) queryParams.append('moneda', filters.moneda);
      if (filters.minPrecio) queryParams.append('minPrecio', filters.minPrecio);
      if (filters.maxPrecio) queryParams.append('maxPrecio', filters.maxPrecio);

      const res = await fetch(`${API_BASE_URL}/properties?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Automatically set matching default currency when tipo changes in home dropdown
    if (name === 'tipo') {
      const matchingMoneda = value === 'Alquiler' ? 'ARS' : value !== '' ? 'USD' : '';
      setFilters(prev => ({
        ...prev,
        tipo: value,
        moneda: matchingMoneda,
        minPrecio: '',
        maxPrecio: ''
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setFilters({
      search: '',
      dormitorios: '',
      minPrecio: '',
      maxPrecio: '',
      tipo: '',
      moneda: ''
    });
  };

  const hasActiveFilters = filters.search !== '' ||
                           filters.dormitorios !== '' ||
                           filters.minPrecio !== '' ||
                           filters.maxPrecio !== '' ||
                           filters.tipo !== '';

  const activeCurrency = filters.moneda || 'USD';

  return (
    <div className="home-page">
      {/* Hero Header compacto con diseño diagonal asimétrico */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-left-content">
            <h1 className="hero-title">Encontrá tu hogar en el Fin del Mundo</h1>
            <p className="hero-subtitle">
              Casas, departamentos y cabañas con las mejores vistas en Ushuaia.
            </p>
          </div>
        </div>
      </section>

      {/* Barra de Filtros y Búsqueda */}
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="filter-bar" id="filter-bar">
          <div className="filter-group search-group">
            <span className="filter-label">Buscar</span>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Ciudad, calle o título..."
                className="filter-input"
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Operación</span>
            <select
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">Todas</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Venta">Venta</option>
              <option value="Venta en pozo">Venta en pozo</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Dormitorios</span>
            <select
              name="dormitorios"
              value={filters.dormitorios}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">Cualquiera</option>
              <option value="1">1 Dormitorio</option>
              <option value="2">2 Dormitorios</option>
              <option value="3">3 Dormitorios</option>
              <option value="4">4+ Dormitorios</option>
            </select>
          </div>

          {/* Rango de Precios Numérico (Mínimo / Máximo) */}
          <div className="filter-group price-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="filter-label">Rango de Precio</span>
              <div className="currency-toggle-group">
                <button
                  type="button"
                  className={`currency-btn ${activeCurrency === 'USD' ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, moneda: 'USD' }))}
                >
                  USD
                </button>
                <button
                  type="button"
                  className={`currency-btn ${activeCurrency === 'ARS' ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, moneda: 'ARS' }))}
                >
                  ARS
                </button>
              </div>
            </div>
            <div className="price-range-inputs">
              <input
                type="number"
                name="minPrecio"
                value={filters.minPrecio}
                onChange={handleFilterChange}
                placeholder="Mínimo"
                className="filter-input"
              />
              <span className="price-range-separator">-</span>
              <input
                type="number"
                name="maxPrecio"
                value={filters.maxPrecio}
                onChange={handleFilterChange}
                placeholder="Máximo"
                className="filter-input"
              />
            </div>
          </div>

          {/* Botón de Limpiar Filtros */}
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="btn-clear-filters"
            title="Limpiar todos los filtros"
          >
            <RotateCcw size={16} />
            <span>Limpiar Filtros</span>
          </button>
        </div>
      </div>

      {/* Sección del Catálogo (Ancho Completo) */}
      <section className="container-wide" id="catalog-section" style={{ minHeight: '300px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '24px' }}>
          Propiedades Destacadas
        </h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(14, 74, 71, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <SlidersHorizontal size={40} style={{ margin: '0 auto 16px auto', display: 'block', strokeWidth: 1.5 }} />
            <p style={{ fontSize: '16px' }}>No encontramos propiedades que coincidan con tu búsqueda.</p>
            <button
              onClick={handleClearFilters}
              className="btn-secondary"
              style={{ marginTop: '16px' }}
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Property Map */}
      <PropertyMap properties={properties} />
    </div>
  );
};

export default Home;
