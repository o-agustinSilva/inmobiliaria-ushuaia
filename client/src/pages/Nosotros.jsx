import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Compass, Award, ArrowRight, Mountain } from 'lucide-react';

const Nosotros = () => {
  return (
    <div className="nosotros-page">
      {/* Hero Section */}
      <section className="nosotros-hero">
        <div className="container">
          <div className="nosotros-hero-content">
            <div className="nosotros-badge">Sobre Nosotros</div>
            <h1 className="nosotros-title">Tu inmobiliaria en el Fin del Mundo</h1>
            <p className="nosotros-subtitle">
              Conectamos sueños con hogares reales en los paisajes más extraordinarios de Ushuaia.
            </p>
          </div>
        </div>
        <div className="hero-wave"></div>
      </section>

      {/* Main Content Info */}
      <section className="nosotros-intro-section">
        <div className="container">
          <div className="nosotros-intro-grid">
            <div className="nosotros-intro-text">
              <h2 className="section-title-accent">Quiénes Somos</h2>
              <p className="intro-paragraph">
                En <strong>Inmobiliaria Ushuaia</strong>, entendemos que adquirir, vender o alquilar un inmueble es uno de los pasos más importantes en la vida de una persona o familia. Por eso, combinamos profesionalismo, transparencia y un profundo conocimiento local para brindar un servicio personalizado y de alta calidad.
              </p>
              <p className="intro-paragraph">
                Ubicados en la ciudad más austral de la Argentina, conocemos cada rincón de Ushuaia y los desafíos y virtudes de su mercado inmobiliario único. Estamos aquí para guiarte de forma segura en todo el proceso.
              </p>
            </div>
            <div className="nosotros-intro-visual">
              <div className="visual-card-glass">
                <Mountain size={48} className="visual-icon" />
                <h3>Trayectoria & Confianza</h3>
                <p>Martilleros públicos matriculados en Tierra del Fuego.</p>
                <span className="visual-tag">Mat. N° 846 TDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="nosotros-values-section">
        <div className="container">
          <h2 className="nosotros-section-title">Nuestros Pilares</h2>
          <p className="nosotros-section-subtitle">Lo que nos guía en cada transacción y relación con nuestros clientes.</p>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon-wrapper">
                <Compass size={28} />
              </div>
              <h3>Conocimiento Local</h3>
              <p>
                Analizamos de forma constante el mercado local en Ushuaia, asesorándote sobre las mejores zonas residenciales y de inversión comercial.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon-wrapper">
                <ShieldCheck size={28} />
              </div>
              <h3>Transparencia Total</h3>
              <p>
                Creemos en las relaciones a largo plazo. Te brindamos información clara y honesta respecto a costos, contratos y tasaciones.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon-wrapper">
                <Award size={28} />
              </div>
              <h3>Excelencia Profesional</h3>
              <p>
                Todas nuestras operaciones están respaldadas por profesionales matriculados y contratos sólidos bajo las normativas legales vigentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="nosotros-cta">
        <div className="container">
          <div className="cta-box-glass">
            <h2>¿Buscás tu próximo hogar en Ushuaia?</h2>
            <p>Explorá nuestro catálogo de casas, departamentos y terrenos en venta, alquiler o en pozo.</p>
            <div className="cta-buttons">
              <Link to="/?tipo=Venta" className="btn-primary-glow">
                <span>Comprar Propiedades</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/?tipo=Alquiler" className="btn-secondary-light">
                <span>Alquileres</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Nosotros;
