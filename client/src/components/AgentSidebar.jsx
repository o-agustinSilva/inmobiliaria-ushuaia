import React from 'react';
import ContactForm from './ContactForm';
import { Phone, Mail, Award } from 'lucide-react';

const AgentSidebar = ({ agent, propertyId }) => {
  return (
    <div className="contact-sidebar">
      {/* Agent details */}
      <div className="sidebar-card" style={{ paddingBottom: '20px' }}>
        <h3 className="sidebar-title" style={{ fontSize: '16px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Agente Responsable
        </h3>
        <div className="agent-profile">
          <div className="agent-avatar">
            {agent ? agent.nombre.charAt(0) : 'U'}
          </div>
          <div className="agent-info">
            <span className="agent-name">{agent ? agent.nombre : 'Inmobiliaria Ushuaia'}</span>
            <span className="agent-role">{agent ? agent.rol : 'Martillero Responsable'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={14} />
            <span>+54 2901 445588</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={14} />
            <span>{agent ? agent.email : 'contacto@ushuaia.com'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={14} />
            <span>Matrícula N° 846 TDF</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="sidebar-card">
        <h3 className="sidebar-title">Contactar Agente</h3>
        <ContactForm propertyId={propertyId} />
      </div>
    </div>
  );
};

export default AgentSidebar;
