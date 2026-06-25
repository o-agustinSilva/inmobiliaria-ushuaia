import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const FilterBar = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  activeCurrency,
  onCurrencyChange
}) => {
  return (
    <div className="container" style={{ position: 'relative', zIndex: 10 }}>
      <div className="filter-bar" id="filter-bar">
        <div className="filter-group search-group">
          <span className="filter-label">Buscar</span>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={onFilterChange}
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
            onChange={onFilterChange}
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
            onChange={onFilterChange}
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
                onClick={() => onCurrencyChange('USD')}
              >
                USD
              </button>
              <button
                type="button"
                className={`currency-btn ${activeCurrency === 'ARS' ? 'active' : ''}`}
                onClick={() => onCurrencyChange('ARS')}
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
              onChange={onFilterChange}
              placeholder="Mínimo"
              className="filter-input"
            />
            <span className="price-range-separator">-</span>
            <input
              type="number"
              name="maxPrecio"
              value={filters.maxPrecio}
              onChange={onFilterChange}
              placeholder="Máximo"
              className="filter-input"
            />
          </div>
        </div>

        {/* Botón de Limpiar Filtros */}
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="btn-clear-filters"
          title="Limpiar todos los filtros"
        >
          <RotateCcw size={16} />
          <span>Limpiar Filtros</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
