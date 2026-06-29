import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { 
  Building2, Users, FileText, Activity, BarChart3, Plus, 
  Trash2, Check, RefreshCw, LogOut, CheckCircle, ShieldAlert, 
  FolderEdit, Mail, DollarSign, Tag, ClipboardList
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Mini Map Recenter component
const MiniMapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
};

// Custom mini map pin style (red pin)
const miniMapIcon = L.divIcon({
  className: 'custom-map-marker-draggable',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      background: #e63946;
      position: absolute;
      transform: rotate(-45deg);
      left: 50%;
      top: 50%;
      margin: -14px 0 0 -14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      border: 2px solid white;
    "></div>
    <div style="
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: white;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    "></div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});


const Dashboard = () => {
  const { user, token, logout, showToast } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!token && !localStorage.getItem('inmo_token')) {
      navigate('/personal');
    }
  }, [token]);

  // Set default tab based on role
  const getInitialTab = () => {
    if (user?.rol === 'Agente') return 'mis-propiedades';
    if (user?.rol === 'Martillero') return 'estadisticas';
    return 'servidor';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [sysHealth, setSysHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resettingDb, setResettingDb] = useState(false);

  // Form states
  const [propForm, setPropForm] = useState({
    titulo: '',
    direccion: '',
    precio: '',
    dormitorios: '1',
    banos: '1',
    m2: '',
    descripcion: '',
    tipo: 'Venta',
    moneda: 'USD',
    latitud: '',
    longitud: ''
  });
  const [geocoding, setGeocoding] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingPropId, setEditingPropId] = useState(null);

  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Agente'
  });

  // Fetch functions based on active section
  const fetchProperties = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/properties`, {
        headers: {
          'x-user-role': user.rol,
          'x-user-id': user.id,
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) setProperties(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    if (!user || (user.rol !== 'Martillero' && user.rol !== 'SuperAdmin')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/properties/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    if (!user || (user.rol !== 'Martillero' && user.rol !== 'SuperAdmin')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    if (!user || (user.rol !== 'Martillero' && user.rol !== 'SuperAdmin')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSystemHealth = async () => {
    if (!user || user.rol !== 'SuperAdmin') return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/system-health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSysHealth(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchStats();
    fetchMessages();
    fetchUsers();
    fetchSystemHealth();
  }, [activeTab, user]);

  const geocodeAddress = async () => {
    const address = propForm.direccion;
    if (!address) {
      showToast('Por favor escribe una dirección primero.', 'error');
      return;
    }
    setGeocoding(true);
    try {
      const query = encodeURIComponent(`${address}, Ushuaia, Tierra del Fuego, Argentina`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: {
          'Accept-Language': 'es'
        }
      });
      if (!res.ok) throw new Error('Error al conectar con el servicio de geocoding.');
      
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPropForm(prev => ({
          ...prev,
          latitud: parseFloat(lat).toFixed(8),
          longitud: parseFloat(lon).toFixed(8)
        }));
        showToast('Dirección geolocalizada con éxito.', 'success');
      } else {
        const queryFallback = encodeURIComponent(`${address}, Ushuaia`);
        const resFb = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${queryFallback}&limit=1`);
        const dataFb = await resFb.json();
        if (dataFb && dataFb.length > 0) {
          const { lat, lon } = dataFb[0];
          setPropForm(prev => ({
            ...prev,
            latitud: parseFloat(lat).toFixed(8),
            longitud: parseFloat(lon).toFixed(8)
          }));
          showToast('Dirección geolocalizada con éxito.', 'success');
        } else {
          showToast('No se encontró la ubicación exacta. Centrando mapa en Ushuaia para corrección manual.', 'warning');
          setPropForm(prev => ({
            ...prev,
            latitud: '-54.8019',
            longitud: '-68.303'
          }));
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al geolocalizar.', 'error');
    } finally {
      setGeocoding(false);
    }
  };

  const handleAddressBlur = () => {
    if (propForm.direccion && (!propForm.latitud || !propForm.longitud)) {
      geocodeAddress();
    }
  };

  // Form submit handlers
  const handlePropSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('titulo', propForm.titulo);
    formData.append('direccion', propForm.direccion);
    formData.append('precio', propForm.precio);
    formData.append('dormitorios', propForm.dormitorios);
    formData.append('banos', propForm.banos);
    formData.append('m2', propForm.m2);
    formData.append('descripcion', propForm.descripcion);
    formData.append('tipo', propForm.tipo || 'Venta');
    formData.append('moneda', propForm.moneda || 'USD');
    if (propForm.latitud) formData.append('latitud', propForm.latitud);
    if (propForm.longitud) formData.append('longitud', propForm.longitud);

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    try {
      const url = editingPropId 
        ? `${API_BASE_URL}/properties/${editingPropId}`
        : `${API_BASE_URL}/properties`;
      const method = editingPropId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar propiedad');

      showToast(editingPropId ? 'Propiedad editada con éxito' : 'Propiedad subida correctamente', 'success');
      
      // Reset form
      setPropForm({
        titulo: '',
        direccion: '',
        precio: '',
        dormitorios: '1',
        banos: '1',
        m2: '',
        descripcion: '',
        tipo: 'Venta',
        moneda: 'USD',
        latitud: '',
        longitud: ''
      });
      setSelectedFiles([]);
      setEditingPropId(null);
      
      // Switch back to listings list
      setActiveTab('mis-propiedades');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');

      showToast('Usuario interno registrado correctamente.', 'success');
      setUserForm({ nombre: '', email: '', password: '', rol: 'Agente' });
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Status and delete handlers
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Propiedad aprobada y publicada.', 'success');
        fetchProperties();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus })
      });
      if (res.ok) {
        showToast(`Propiedad marcada como ${newStatus}.`, 'success');
        fetchProperties();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta propiedad permanentemente? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Propiedad eliminada correctamente.', 'success');
        fetchProperties();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SuperAdmin reset DB helper
  const handleResetDb = async () => {
    if (!window.confirm('¡ATENCIÓN! Esto borrará todas las propiedades cargadas por usuarios, los mensajes y volverá la base de datos a su estado original. ¿Proceder?')) return;
    setResettingDb(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reset-db`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchProperties();
        fetchStats();
        fetchMessages();
        fetchUsers();
      }
    } catch (err) {
      showToast('Error al resetear base de datos', 'error');
    } finally {
      setResettingDb(false);
    }
  };

  const handleEditClick = (prop) => {
    setEditingPropId(prop.id);
      setPropForm({
        titulo: prop.titulo,
        direccion: prop.direccion,
        precio: prop.precio,
        dormitorios: prop.dormitorios.toString(),
        banos: prop.banos.toString(),
        m2: prop.m2,
        descripcion: prop.descripcion || '',
        tipo: prop.tipo || 'Venta',
        moneda: prop.moneda || 'USD',
        latitud: prop.latitud ? prop.latitud.toString() : '',
        longitud: prop.longitud ? prop.longitud.toString() : ''
      });
    setActiveTab('cargar-propiedad');
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14, 74, 71, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Menus */}
      <aside className="dashboard-sidebar">
        <div style={{ marginBottom: '24px', paddingLeft: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rol actual</span>
          <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '15px' }}>{user.nombre}</h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({user.rol})</span>
        </div>

        {user.rol === 'Agente' && (
          <>
            <button 
              onClick={() => setActiveTab('mis-propiedades')} 
              className={`sidebar-menu-btn ${activeTab === 'mis-propiedades' ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              <span>Mis Propiedades</span>
            </button>
            <button 
              onClick={() => {
                setEditingPropId(null);
                setPropForm({ titulo: '', direccion: '', precio: '', dormitorios: '1', banos: '1', m2: '', descripcion: '', tipo: 'Venta', moneda: 'USD' });
                setActiveTab('cargar-propiedad');
              }} 
              className={`sidebar-menu-btn ${activeTab === 'cargar-propiedad' && !editingPropId ? 'active' : ''}`}
            >
              <Plus size={18} />
              <span>Cargar Propiedad</span>
            </button>
          </>
        )}

        {(user.rol === 'Martillero' || user.rol === 'SuperAdmin') && (
          <>
            <button 
              onClick={() => setActiveTab('estadisticas')} 
              className={`sidebar-menu-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Estadísticas</span>
            </button>
            <button 
              onClick={() => setActiveTab('mis-propiedades')} 
              className={`sidebar-menu-btn ${activeTab === 'mis-propiedades' ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>Gestión de Inmuebles</span>
            </button>
            <button 
              onClick={() => {
                setEditingPropId(null);
                setPropForm({ titulo: '', direccion: '', precio: '', dormitorios: '1', banos: '1', m2: '', descripcion: '', tipo: 'Venta', moneda: 'USD' });
                setActiveTab('cargar-propiedad');
              }} 
              className={`sidebar-menu-btn ${activeTab === 'cargar-propiedad' ? 'active' : ''}`}
            >
              <Plus size={18} />
              <span>Cargar Inmueble</span>
            </button>
            <button 
              onClick={() => setActiveTab('mensajes')} 
              className={`sidebar-menu-btn ${activeTab === 'mensajes' ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Mensajes Recibidos</span>
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')} 
              className={`sidebar-menu-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Usuarios Internos</span>
            </button>
          </>
        )}

        {user.rol === 'SuperAdmin' && (
          <button 
            onClick={() => setActiveTab('servidor')} 
            className={`sidebar-menu-btn ${activeTab === 'servidor' ? 'active' : ''}`}
          >
            <Activity size={18} />
            <span>Mantenimiento y Sys</span>
          </button>
        )}

        <button onClick={logout} className="sidebar-menu-btn" style={{ marginTop: 'auto', color: 'var(--status-vendido)' }}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Workspace Area */}
      <main className="dashboard-content">
        {/* TAB: Estadísticas */}
        {activeTab === 'estadisticas' && stats && (
          <div>
            <div className="dashboard-header">
              <h2 className="dashboard-title">Estadísticas del Negocio</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Métricas acumuladas del sistema</span>
            </div>

            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <span className="stat-value">{stats.counts.total}</span>
                <span className="stat-label">Total Listings</span>
              </div>
              <div className="dashboard-stat-card" style={{ borderLeft: '4px solid var(--status-pendiente)' }}>
                <span className="stat-value" style={{ color: 'var(--status-pendiente)' }}>{stats.counts.pendientes}</span>
                <span className="stat-label">Pendientes Aprobación</span>
              </div>
              <div className="dashboard-stat-card" style={{ borderLeft: '4px solid var(--status-alquilado)' }}>
                <span className="stat-value" style={{ color: 'var(--status-alquilado)' }}>{stats.counts.alquilados}</span>
                <span className="stat-label">Propiedades Alquiladas</span>
              </div>
              <div className="dashboard-stat-card" style={{ borderLeft: '4px solid var(--status-vendido)' }}>
                <span className="stat-value" style={{ color: 'var(--status-vendido)' }}>{stats.counts.vendidos}</span>
                <span className="stat-label">Propiedades Vendidas</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
              <div className="db-form-card">
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={20} className="logo-accent" />
                  <span>Volumen Monetario</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: 500, flexGrow: 1 }}>Total por Ventas Concretadas:</span>
                    <strong style={{ color: 'var(--status-vendido)' }}>USD ${Number(stats.financial.totalPrecioVendidos).toLocaleString('es-AR')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'between' }}>
                    <span style={{ fontWeight: 500, flexGrow: 1 }}>Volumen por Alquileres Activos:</span>
                    <strong style={{ color: 'var(--status-alquilado)' }}>$ {Number(stats.financial.totalPrecioAlquilados).toLocaleString('es-AR')}</strong>
                  </div>
                </div>
              </div>

              <div className="db-form-card">
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} className="logo-accent" />
                  <span>Rendimiento de Agentes</span>
                </h3>
                {stats.agents && stats.agents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats.agents.map((ag) => (
                      <div key={ag.id} style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '14px' }}>
                        <span style={{ flexGrow: 1, fontWeight: 500 }}>{ag.nombre}</span>
                        <span className="card-badge badge-aprobado" style={{ fontSize: '11px' }}>
                          {ag.propiedades_count} {ag.propiedades_count === 1 ? 'Propiedad' : 'Propiedades'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No hay agentes registrados cargando propiedades.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Cargar Propiedad */}
        {activeTab === 'cargar-propiedad' && (
          <div>
            <div className="dashboard-header">
              <h2 className="dashboard-title">
                {editingPropId ? 'Modificar Publicación' : 'Registrar Nueva Propiedad'}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Completa el formulario para subir la ficha técnica</span>
            </div>

            <form onSubmit={handlePropSubmit} className="db-form-card">
              <div className="form-group">
                <label className="form-label" htmlFor="prop-titulo">Título de la Publicación</label>
                <input
                  id="prop-titulo"
                  type="text"
                  value={propForm.titulo}
                  onChange={(e) => setPropForm(prev => ({ ...prev, titulo: e.target.value }))}
                  className="form-control"
                  placeholder="Ej. Casa Alpina de 3 Dormitorios con vista al canal"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prop-direccion">Dirección Física</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="prop-direccion"
                    type="text"
                    value={propForm.direccion}
                    onChange={(e) => setPropForm(prev => ({ ...prev, direccion: e.target.value }))}
                    onBlur={handleAddressBlur}
                    className="form-control"
                    placeholder="Ej. Av. Alem 1420, Ushuaia"
                    required
                  />
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    disabled={geocoding}
                    className="btn-secondary"
                    style={{ whiteSpace: 'nowrap', padding: '0 16px' }}
                  >
                    {geocoding ? 'Buscando...' : 'Geolocalizar'}
                  </button>
                </div>
                {propForm.latitud && propForm.longitud && (
                  <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <span className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600 }}>
                      Ubicación en el Mapa (Arrastra el marcador rojo para corregir con precisión):
                    </span>
                    <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', zIndex: 10 }}>
                      <MapContainer
                        center={[parseFloat(propForm.latitud), parseFloat(propForm.longitud)]}
                        zoom={15}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <Marker
                          position={[parseFloat(propForm.latitud), parseFloat(propForm.longitud)]}
                          draggable={true}
                          icon={miniMapIcon}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const position = marker.getLatLng();
                              setPropForm(prev => ({
                                ...prev,
                                latitud: position.lat.toFixed(8),
                                longitud: position.lng.toFixed(8)
                              }));
                            }
                          }}
                        />
                        <MiniMapRecenter lat={parseFloat(propForm.latitud)} lng={parseFloat(propForm.longitud)} />
                      </MapContainer>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', gap: '16px' }}>
                      <span>Latitud: <strong>{propForm.latitud}</strong></span>
                      <span>Longitud: <strong>{propForm.longitud}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="db-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-tipo">Operación</label>
                  <select
                    id="prop-tipo"
                    value={propForm.tipo}
                    onChange={(e) => {
                      const selectedTipo = e.target.value;
                      setPropForm(prev => ({ 
                        ...prev, 
                        tipo: selectedTipo,
                        moneda: selectedTipo === 'Alquiler' ? 'ARS' : 'USD'
                      }));
                    }}
                    className="form-control"
                  >
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                    <option value="Venta en pozo">Venta en pozo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-moneda">Moneda</label>
                  <select
                    id="prop-moneda"
                    value={propForm.moneda}
                    onChange={(e) => setPropForm(prev => ({ ...prev, moneda: e.target.value }))}
                    className="form-control"
                  >
                    <option value="USD">Dólares (USD)</option>
                    <option value="ARS">Pesos (ARS)</option>
                  </select>
                </div>
              </div>

              <div className="db-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-precio">Precio</label>
                  <input
                    id="prop-precio"
                    type="number"
                    value={propForm.precio}
                    onChange={(e) => setPropForm(prev => ({ ...prev, precio: e.target.value }))}
                    className="form-control"
                    placeholder="Ej. 185000 o 950000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-m2">Superficie Total (m²)</label>
                  <input
                    id="prop-m2"
                    type="number"
                    value={propForm.m2}
                    onChange={(e) => setPropForm(prev => ({ ...prev, m2: e.target.value }))}
                    className="form-control"
                    placeholder="Ej. 110"
                    required
                  />
                </div>
              </div>

              <div className="db-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-dormitorios">Dormitorios</label>
                  <select
                    id="prop-dormitorios"
                    value={propForm.dormitorios}
                    onChange={(e) => setPropForm(prev => ({ ...prev, dormitorios: e.target.value }))}
                    className="form-control"
                  >
                    <option value="0">Monoambiente (0)</option>
                    <option value="1">1 Dormitorio</option>
                    <option value="2">2 Dormitorios</option>
                    <option value="3">3 Dormitorios</option>
                    <option value="4">4+ Dormitorios</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-banos">Baños</label>
                  <select
                    id="prop-banos"
                    value={propForm.banos}
                    onChange={(e) => setPropForm(prev => ({ ...prev, banos: e.target.value }))}
                    className="form-control"
                  >
                    <option value="1">1 Baño</option>
                    <option value="2">2 Baños</option>
                    <option value="3">3+ Baños</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prop-desc">Descripción Detallada (Amenities, Entorno)</label>
                <ReactQuill
                  id="prop-desc"
                  theme="snow"
                  value={propForm.descripcion}
                  onChange={(content) => setPropForm(prev => ({ ...prev, descripcion: content }))}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['clean']
                    ]
                  }}
                  placeholder="Detalles sobre calefacción, cochera, patio, materiales de construcción..."
                />
              </div>

              {/* Photo upload with explanation of conversion/WebP optimizations */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">
                  Subir Fotos de la Propiedad 
                  <span style={{ fontSize: '11px', color: 'var(--status-aprobado)', marginLeft: '8px', fontWeight: 500 }}>
                    (Las fotos se optimizarán automáticamente a WebP de bajo peso en el servidor)
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  className="form-control"
                  style={{ padding: '8px' }}
                />
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {selectedFiles.length} archivos seleccionados listos para optimizar.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flexGrow: 1 }}>
                  {loading ? 'Subiendo e indexando...' : (editingPropId ? 'Actualizar Ficha' : 'Guardar y Publicar')}
                </button>
                {editingPropId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingPropId(null);
                      setActiveTab('mis-propiedades');
                    }} 
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB: Gestión de Propiedades */}
        {activeTab === 'mis-propiedades' && (
          <div>
            <div className="dashboard-header">
              <h2 className="dashboard-title">
                {user.rol === 'Agente' ? 'Mis Publicaciones' : 'Listado General de Propiedades'}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gestión de visibilidad y ficha técnica</span>
            </div>

            {properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <Building2 size={40} style={{ margin: '0 auto 16px auto', display: 'block', opacity: 0.5 }} />
                <p>No tienes propiedades cargadas o el sistema está vacío.</p>
              </div>
            ) : (
              <div className="db-listings-list">
                {properties.map((prop) => {
                  const getImageUrl = (url) => {
                    if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
                  };
                  const primaryImage = prop.images && prop.images.find(img => img.es_principal) || (prop.images && prop.images[0]);
                  const imageUrl = primaryImage ? getImageUrl(primaryImage.url) : getImageUrl(null);

                  return (
                    <div key={prop.id} className="db-list-item">
                      <img src={imageUrl} alt={prop.titulo} className="db-item-img" />
                      <div className="db-item-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="db-item-title">{prop.titulo}</span>
                          <span className={`card-badge ${prop.estado === 'Pendiente' ? 'badge-pendiente' : prop.estado === 'Aprobado' ? 'badge-aprobado' : prop.estado === 'Alquilado' ? 'badge-alquilado' : 'badge-vendido'}`} style={{ fontSize: '10px', padding: '2px 8px', position: 'static' }}>
                            {prop.estado}
                          </span>
                        </div>
                        <div className="db-item-meta">
                          <span>{prop.direccion}</span> • <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{prop.tipo || 'Venta'}</span> • <strong>{prop.moneda === 'USD' ? 'USD $' : '$'}{Number(prop.precio).toLocaleString('es-AR')}</strong>
                          {prop.agent && <span style={{ marginLeft: '12px', fontStyle: 'italic' }}>Cargado por: {prop.agent.nombre}</span>}
                        </div>
                      </div>

                      {/* Action buttons based on Roles */}
                      <div className="db-item-actions">
                        {/* 1. Martillero Approval (if pending) */}
                        {prop.estado === 'Pendiente' && (user.rol === 'Martillero' || user.rol === 'SuperAdmin') && (
                          <button 
                            onClick={() => handleApprove(prop.id)} 
                            className="btn-icon" 
                            style={{ borderColor: 'var(--status-aprobado)', color: 'var(--status-aprobado)' }}
                            title="Aprobar publicación"
                          >
                            <Check size={16} />
                          </button>
                        )}

                        {/* 2. Change Status (Agent only for their own; Martillero/SuperAdmin for all) */}
                        {(user.rol === 'Martillero' || user.rol === 'SuperAdmin' || prop.usuario_id === user.id) && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleStatusChange(prop.id, 'Alquilado')}
                              className="btn-secondary"
                              style={{ fontSize: '11px', padding: '6px 10px', backgroundColor: prop.estado === 'Alquilado' ? 'var(--status-alquilado)' : '', color: prop.estado === 'Alquilado' ? '#fff' : '' }}
                              title="Marcar como alquilada"
                            >
                              Marcar Alquilada
                            </button>
                            <button
                              onClick={() => handleStatusChange(prop.id, 'Vendido')}
                              className="btn-secondary"
                              style={{ fontSize: '11px', padding: '6px 10px', backgroundColor: prop.estado === 'Vendido' ? 'var(--status-vendido)' : '', color: prop.estado === 'Vendido' ? '#fff' : '' }}
                              title="Marcar como vendida"
                            >
                              Marcar Vendida
                            </button>
                          </div>
                        )}

                        {/* 3. Edit properties details (Agent for own; Martillero/SuperAdmin for all) */}
                        {(user.rol === 'Martillero' || user.rol === 'SuperAdmin' || prop.usuario_id === user.id) && (
                          <button 
                            onClick={() => handleEditClick(prop)} 
                            className="btn-icon" 
                            title="Editar detalles"
                          >
                            <FolderEdit size={16} />
                          </button>
                        )}

                        {/* 4. Delete properties (Owner/Martillero & SuperAdmin only) */}
                        {(user.rol === 'Martillero' || user.rol === 'SuperAdmin') && (
                          <button 
                            onClick={() => handleDelete(prop.id)} 
                            className="btn-icon btn-danger-icon" 
                            title="Eliminar propiedad"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: Mensajes */}
        {activeTab === 'mensajes' && (
          <div>
            <div className="dashboard-header">
              <h2 className="dashboard-title">Consultas de Contacto Recibidas</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mensajes enviados por clientes públicos</span>
            </div>

            {messages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>No hay mensajes de contacto en la casilla.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.map((msg) => (
                  <div key={msg.id} className="db-form-card" style={{ padding: '24px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '16px', color: 'var(--primary-color)' }}>{msg.nombre} {msg.apellido}</strong>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {msg.email}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {msg.telefono}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(msg.createdAt).toLocaleString('es-AR')}
                      </span>
                    </div>
                    {msg.property && (
                      <div style={{ fontSize: '12px', backgroundColor: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '4px', display: 'inline-block', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                        Consulta sobre: <strong>{msg.property.titulo}</strong> ({msg.property.direccion})
                      </div>
                    )}
                    <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{msg.mensaje}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Usuarios Internos */}
        {activeTab === 'usuarios' && (
          <div>
            <div className="dashboard-header">
              <h2 className="dashboard-title">Registro de Personal</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Creación y listado de usuarios internos del sistema</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              {/* List */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Usuarios Registrados</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {users.map((u) => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px' }}>
                      <div>
                        <strong>{u.nombre}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                      <span className={`card-badge ${u.rol === 'SuperAdmin' ? 'badge-vendido' : u.rol === 'Martillero' ? 'badge-pendiente' : 'badge-aprobado'}`} style={{ position: 'static', fontSize: '11px', padding: '4px 10px' }}>
                        {u.rol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Form */}
              <div className="db-form-card">
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Crear Usuario de Gestión</h3>
                <form onSubmit={handleUserSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="user-nombre">Nombre Completo</label>
                    <input
                      id="user-nombre"
                      type="text"
                      value={userForm.nombre}
                      onChange={(e) => setUserForm(prev => ({ ...prev, nombre: e.target.value }))}
                      className="form-control"
                      placeholder="Ej. Laura Gomez"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="user-email">Correo Corporativo</label>
                    <input
                      id="user-email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="form-control"
                      placeholder="ejemplo@inmobiliariaushuaia.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="user-pass">Contraseña Inicial</label>
                    <input
                      id="user-pass"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      className="form-control"
                      placeholder="Min 6 caracteres"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" htmlFor="user-role">Rol Asignado</label>
                    <select
                      id="user-role"
                      value={userForm.rol}
                      onChange={(e) => setUserForm(prev => ({ ...prev, rol: e.target.value }))}
                      className="form-control"
                    >
                      <option value="Agente">Agente / Secretaria</option>
                      <option value="Martillero">Dueño / Martillero</option>
                      {user.rol === 'SuperAdmin' && <option value="SuperAdmin">SuperAdmin</option>}
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Mantenimiento (SuperAdmin Only) */}
        {activeTab === 'servidor' && user.rol === 'SuperAdmin' && (
          <div>
            <div className="dashboard-header">
              <h2 className="dashboard-title">Panel de Control de Servidor y Mantenimiento</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Configuración de bajo nivel e infraestructura</span>
            </div>

            <div className="system-health-grid">
              {/* Node / Container state info */}
              <div className="sys-card">
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Activity size={18} style={{ color: 'var(--status-aprobado)' }} />
                  <span>Estado de Contenedores Docker</span>
                </h3>
                {sysHealth ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'between' }}>
                      <span style={{ flexGrow: 1 }}>Server Status:</span>
                      <strong style={{ color: 'var(--status-aprobado)' }}>{sysHealth.status.toUpperCase()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'between' }}>
                      <span style={{ flexGrow: 1 }}>Uptime:</span>
                      <span>{Math.round(sysHealth.uptime)} segundos</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'between' }}>
                      <span style={{ flexGrow: 1 }}>Uso CPU (simulado):</span>
                      <span>{sysHealth.cpu}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'between' }}>
                      <span style={{ flexGrow: 1 }}>Uso Memoria (heap):</span>
                      <span>{Math.round(sysHealth.memory.heapUsed / 1024 / 1024)} MB</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Cargando estado del motor node...</p>
                )}
              </div>

              {/* Reset database options */}
              <div className="sys-card">
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShieldAlert size={18} style={{ color: 'var(--status-vendido)' }} />
                  <span>Herramientas de Mantenimiento</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                  Herramientas administrativas para restablecer la base de datos de pruebas a sus valores iniciales y limpiar los archivos temporales.
                </p>
                <button 
                  onClick={handleResetDb} 
                  className="btn-primary" 
                  style={{ backgroundColor: 'var(--status-vendido)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={resettingDb}
                >
                  <RefreshCw size={16} className={resettingDb ? 'loading-spin' : ''} />
                  <span>{resettingDb ? 'Restaurando...' : 'Reiniciar & Sembrar Base de Datos'}</span>
                </button>
                <style>{`.loading-spin { animation: spin 1.5s linear infinite; }`}</style>
              </div>
            </div>

            {/* Application Mock logs */}
            <div className="db-form-card" style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Logs de la Aplicación Express</h3>
              <div className="sys-val">
                {`[2026-06-12 00:05:12] [Database] Conexión establecida con MySQL en puerto 3306.
[2026-06-12 00:05:15] [Sequelize] Sincronización de tablas finalizada correctamente.
[2026-06-12 00:05:16] [Seeder] Base de datos vacía detectada. Sembrado de datos inicializado...
[2026-06-12 00:05:20] [Seeder] Sembrado completado: 3 usuarios creados, 4 propiedades asociadas.
[2026-06-12 00:20:10] [Express] Servidor escuchando en puerto 5000 en contenedor de red inmo_server.
[2026-06-12 00:22:45] [Auth] Inicio de sesión exitoso: superadmin@inmobiliariaushuaia.com (SuperAdmin)
[2026-06-12 00:23:01] [API] GET /api/admin/system-health 200 OK`}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
