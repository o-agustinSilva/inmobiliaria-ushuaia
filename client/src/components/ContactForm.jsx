import React, { useState } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Send } from 'lucide-react';

const ContactForm = ({ propertyId }) => {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    mensaje: 'Hola! Deseo recibir más información sobre esta propiedad y coordinar una visita.'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propiedad_id: propertyId,
          ...formData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar consulta');
      }

      showToast('¡Consulta enviada con éxito! Nos comunicaremos a la brevedad.', 'success');
      // Reset form fields
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        mensaje: 'Hola! Deseo recibir más información sobre esta propiedad y coordinar una visita.'
      });
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form-inner">
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="contact-nombre">Nombre</label>
          <input
            id="contact-nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Juan"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="contact-apellido">Apellido</label>
          <input
            id="contact-apellido"
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Perez"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="form-control"
          required
          placeholder="juan@email.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="contact-telefono">Número de Teléfono</label>
        <input
          id="contact-telefono"
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          className="form-control"
          required
          placeholder="+54 2901 123456"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="contact-mensaje">Mensaje</label>
        <textarea
          id="contact-mensaje"
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          className="form-control"
          rows="4"
          required
        ></textarea>
      </div>

      <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Send size={16} />
        <span>{loading ? 'Enviando...' : 'Enviar Consulta'}</span>
      </button>
    </form>
  );
};

export default ContactForm;
