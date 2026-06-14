import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Search, SlidersHorizontal, Mountain, Star, ShieldCheck } from 'lucide-react';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Absolute max prices calculated from DB properties
  const [maxPrices, setMaxPrices] = useState({ USD: 500000, ARS: 5000000 });
  const [maxPricesLoaded, setMaxPricesLoaded] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    dormitorios: '',
    maxPrecio: '',
    tipo: '',
    moneda: '' // Default empty to show both USD and ARS initially
  });

  // Fetch all properties on mount once to find the dynamic maximum price bounds
  useEffect(() => {
    const fetchMaxBounds = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/properties`);
        if (res.ok) {
          const data = await res.json();
          const usdPrices = data.filter(p => p.moneda === 'USD' && p.estado === 'Aprobado').map(p => parseFloat(p.precio));
          const arsPrices = data.filter(p => p.moneda === 'ARS' && p.estado === 'Aprobado').map(p => parseFloat(p.precio));

          const maxUsd = usdPrices.length > 0 ? Math.max(...usdPrices) : 500000;
          const maxArs = arsPrices.length > 0 ? Math.max(...arsPrices) : 5000000;

          setMaxPrices({
            USD: Math.ceil(maxUsd / 10000) * 10000,
            ARS: Math.ceil(maxArs / 50000) * 50000
          });
          setMaxPricesLoaded(true);
        }
      } catch (e) {
        console.error("Error fetching max price bounds:", e);
      }
    };
    fetchMaxBounds();
  }, []);

  // Synchronize state when URL parameters (tipo) change
  useEffect(() => {
    const newTipo = tipoParam || '';
    const newMoneda = newTipo === 'Alquiler' ? 'ARS' : newTipo !== '' ? 'USD' : '';

    setFilters(prev => ({
      ...prev,
      tipo: newTipo,
      moneda: newMoneda,
      maxPrecio: '' // Reset price filter when type changes
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

      const activeCurrency = filters.moneda || 'USD';
      const maxLimit = maxPrices[activeCurrency] || 500000;
      if (filters.maxPrecio && parseFloat(filters.maxPrecio) < maxLimit) {
        queryParams.append('maxPrecio', filters.maxPrecio);
      }

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
    // Wait until the max prices are resolved before fetching the catalog to avoid partial/wrong bounds
    fetchProperties();
  }, [filters, maxPricesLoaded]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Automatically set matching default currency when tipo changes in home dropdown
    if (name === 'tipo') {
      const matchingMoneda = value === 'Alquiler' ? 'ARS' : value !== '' ? 'USD' : '';
      setFilters(prev => ({
        ...prev,
        tipo: value,
        moneda: matchingMoneda,
        maxPrecio: ''
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const activeCurrency = filters.moneda || 'USD';
  const sliderMaxVal = maxPrices[activeCurrency] || 500000;
  const activePriceValue = filters.maxPrecio === '' ? sliderMaxVal : parseFloat(filters.maxPrecio);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    if (val >= sliderMaxVal) {
      setFilters(prev => ({ ...prev, maxPrecio: '' })); // No limit
    } else {
      // If the slider is manually moved, activate the currency filter for that currency
      setFilters(prev => ({ ...prev, maxPrecio: val, moneda: activeCurrency }));
    }
  };

  return (
    <div className="home-page">
      {/* Hero Header */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Encontrá tu hogar en el Fin del Mundo</h1>
          <p className="hero-subtitle">
            Casas, departamentos y cabañas con las mejores vistas del Canal Beagle y la cordillera en Ushuaia.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="filter-bar" id="filter-bar">
          <div className="filter-group">
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

          <div className="filter-group filter-price-slider">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="filter-label">Precio Máximo</span>
              <div className="currency-toggle-group">
                <button
                  type="button"
                  className={`currency-btn ${activeCurrency === 'USD' ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, moneda: 'USD', maxPrecio: '' }))}
                >
                  USD
                </button>
                <button
                  type="button"
                  className={`currency-btn ${activeCurrency === 'ARS' ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, moneda: 'ARS', maxPrecio: '' }))}
                >
                  ARS
                </button>
              </div>
            </div>
            <div className="price-slider-wrapper">
              <input
                type="range"
                min={0}
                max={sliderMaxVal}
                step={activeCurrency === 'USD' ? 10000 : 50000}
                value={activePriceValue}
                onChange={handleSliderChange}
                className="price-slider"
              />
              <div className="price-slider-values">
                <span className="price-slider-current">
                  {filters.maxPrecio === '' ? 'Cualquier precio' : `Hasta ${activeCurrency === 'USD' ? 'USD $' : '$'}${parseFloat(filters.maxPrecio).toLocaleString('es-AR')}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <section className="container-wide" id="catalog-section" style={{ minHeight: '300px' }}>
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
              onClick={() => {
                setSearchParams({});
                setFilters({ search: '', dormitorios: '', maxPrecio: '', tipo: '', moneda: '' });
              }}
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

      {/* Ushuaia Section */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '60px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(14, 74, 71, 0.05)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <Mountain size={28} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '18px' }}>El Fin del Mundo</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px' }}>
                Ushuaia ofrece paisajes inigualables entre montañas y el mar. Vivir aquí es una experiencia única y natural.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(14, 74, 71, 0.05)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <Star size={28} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Asesoramiento Premium</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px' }}>
                Martilleros matriculados dedicados a encontrar tu propiedad ideal o ayudarte a concretar la mejor venta.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(14, 74, 71, 0.05)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Seguridad Jurídica</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px' }}>
                Operaciones transparentes y contratos sólidos avalados por profesionales de amplia trayectoria local.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
