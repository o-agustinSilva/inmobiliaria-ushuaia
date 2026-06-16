const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const User = require('./User');
const Property = require('./Property');
const PropertyImage = require('./PropertyImage');
const ContactMessage = require('./ContactMessage');

// Associations
User.hasMany(Property, { foreignKey: 'usuario_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'usuario_id', as: 'agent' });

Property.hasMany(PropertyImage, { foreignKey: 'propiedad_id', as: 'images', onDelete: 'CASCADE' });
PropertyImage.belongsTo(Property, { foreignKey: 'propiedad_id', as: 'property' });

Property.hasMany(ContactMessage, { foreignKey: 'propiedad_id', as: 'messages', onDelete: 'SET NULL' });
ContactMessage.belongsTo(Property, { foreignKey: 'propiedad_id', as: 'property' });

// Database initialization and seed helper
async function initDb(force = false) {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ force });
    console.log('Database tables synchronized.');

    // Seed if empty
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding initial database data...');

      // Create admin and internal users
      const salt = await bcrypt.genSalt(10);
      const superAdminPassword = await bcrypt.hash('superadmin123', salt);
      const martilleroPassword = await bcrypt.hash('martillero123', salt);
      const agentPassword = await bcrypt.hash('agente123', salt);

      const superadmin = await User.create({
        nombre: 'Administrador General (Vos)',
        email: 'superadmin@inmobiliariaushuaia.com',
        password_hash: superAdminPassword,
        rol: 'SuperAdmin'
      });

      const martillero = await User.create({
        nombre: 'Dueño Juan Perez',
        email: 'martillero@inmobiliariaushuaia.com',
        password_hash: martilleroPassword,
        rol: 'Martillero'
      });

      const agent = await User.create({
        nombre: 'Agente Laura Gomez',
        email: 'agente@inmobiliariaushuaia.com',
        password_hash: agentPassword,
        rol: 'Agente'
      });

      // Seed Properties
      const p1 = await Property.create({
        titulo: 'Casa Alpina Premium con Vista al Canal Beagle',
        direccion: 'Av. Alem 1420, Ushuaia',
        precio: 250000,
        descripcion: 'Hermosa casa de estilo alpino ubicada en una de las mejores zonas residenciales de Ushuaia. Cuenta con amplios ventanales con vista directa al Canal Beagle y la cordillera. Calefacción central por losa radiante, cochera cubierta y un amplio jardín parquizado.',
        dormitorios: 3,
        banos: 2,
        m2: 180,
        estado: 'Aprobado',
        usuario_id: agent.id,
        tipo: 'Venta',
        moneda: 'USD',
        latitud: -54.7995,
        longitud: -68.3210
      });

      const p2 = await Property.create({
        titulo: 'Departamento Céntrico Moderno a Estrenar',
        direccion: 'San Martín 450, Ushuaia',
        precio: 120000,
        descripcion: 'Moderno departamento de 2 ambientes en pleno centro comercial de Ushuaia. Ideal para vivienda o inversión de alquiler temporario. Equipamiento de primera calidad, caldera dual individual y excelentes terminaciones.',
        dormitorios: 1,
        banos: 1,
        m2: 45,
        estado: 'Aprobado',
        usuario_id: agent.id,
        tipo: 'Venta',
        moneda: 'USD',
        latitud: -54.8064,
        longitud: -68.3035
      });

      const p3 = await Property.create({
        titulo: 'Cabaña de Troncos Rústica en Bosque de Ushuaia',
        direccion: 'Camino del Valle Grande 2300, Ushuaia',
        precio: 185000,
        descripcion: 'Cabaña construida íntegramente en madera de lenga y troncos seleccionados, rodeada de bosque nativo y con hermosas vistas al glaciar Martial. Cuenta con hogar a leña tradicional, deck exterior y acceso a senderos de montaña.',
        dormitorios: 2,
        banos: 1,
        m2: 95,
        estado: 'Pendiente', // Starts as pending to test Martillero approval!
        usuario_id: agent.id,
        tipo: 'Venta',
        moneda: 'USD',
        latitud: -54.7890,
        longitud: -68.3610
      });

      const p4 = await Property.create({
        titulo: 'Duplex de Categoría en Barrio Ecológico',
        direccion: 'Las Lenga 180, Ushuaia',
        precio: 160000,
        descripcion: 'Espacioso duplex con diseño bioclimático, aberturas de PVC termopanel y excelente aislación térmica. Cuenta con cocina integrada, living comedor y dos dormitorios en planta alta con vestidor.',
        dormitorios: 2,
        banos: 2,
        m2: 110,
        estado: 'Aprobado',
        usuario_id: martillero.id,
        tipo: 'Venta',
        moneda: 'USD',
        latitud: -54.8020,
        longitud: -68.3300
      });

      // 3 ALQUILERES (ARS $950.000 a $1.200.000)
      const p5 = await Property.create({
        titulo: 'Hermosa Cabaña de Montaña (Alquiler Mensual)',
        direccion: 'Gobernador Campos 980, Ushuaia',
        precio: 950000,
        descripcion: 'Encantadora cabaña de madera totalmente amueblada y equipada. Ubicada en una zona tranquila y residencial con espectacular vista a la montaña. Living con hogar a leña, cocina completa and un dormitorio amplio en loft. Ideal para profesionales o parejas.',
        dormitorios: 1,
        banos: 1,
        m2: 65,
        estado: 'Aprobado',
        usuario_id: agent.id,
        tipo: 'Alquiler',
        moneda: 'ARS',
        latitud: -54.8075,
        longitud: -68.3120
      });

      const p6 = await Property.create({
        titulo: 'Departamento Premium Vista Canal Beagle (Alquiler)',
        direccion: 'Maipú 720, Ushuaia',
        precio: 1100000,
        descripcion: 'Moderno departamento de categoría sobre la costanera de Ushuaia. Cuenta con un gran ventanal al canal, terminaciones de alta gama, calefacción por radiadores y cochera cubierta. Totalmente equipado para mudarse de inmediato.',
        dormitorios: 2,
        banos: 1,
        m2: 80,
        estado: 'Aprobado',
        usuario_id: agent.id,
        tipo: 'Alquiler',
        moneda: 'ARS',
        latitud: -54.8090,
        longitud: -68.3050
      });

      const p7 = await Property.create({
        titulo: 'Cabaña Alpina Familiar en Entorno Boscoso',
        direccion: 'Los Ñires 1420, Barrio Pipo, Ushuaia',
        precio: 1200000,
        descripcion: 'Espaciosa cabaña familiar de diseño alpino tradicional, rodeada de bosque natural de lengas. Living con gran estufa a leña, cocina comedor diario, tres dormitorios y jardín privado amplio. Calefacción central.',
        dormitorios: 3,
        banos: 2,
        m2: 125,
        estado: 'Aprobado',
        usuario_id: martillero.id,
        tipo: 'Alquiler',
        moneda: 'ARS',
        latitud: -54.8250,
        longitud: -68.3680
      });

      // 3 VENTAS (USD $80.000 a $190.000)
      const p8 = await Property.create({
        titulo: 'Moderna Villa de Piedra y Madera de Lenga',
        direccion: 'Héroes de Malvinas 2500, Ushuaia',
        precio: 185000,
        descripcion: 'Exclusiva propiedad a estrenar con arquitectura de vanguardia, combinando hormigón visto, piedra local y madera noble. Increíble vista panorámica. Amplio living comedor con cocina integrada, suite principal y jardín de invierno.',
        dormitorios: 3,
        banos: 3,
        m2: 195,
        estado: 'Aprobado',
        usuario_id: agent.id,
        tipo: 'Venta',
        moneda: 'USD',
        latitud: -54.7950,
        longitud: -68.2750
      });

      const p9 = await Property.create({
        titulo: 'Duplex de Estilo Patagónico en Zona Residencial',
        direccion: 'Karukinka 840, Ushuaia',
        precio: 135000,
        descripcion: 'Excelente oportunidad. Cómodo duplex en impecable estado de conservación en barrio tranquilo de Ushuaia. Cuenta con cochera semicubierta en el frente, living-comedor amplio, patio con parrilla y dos dormitorios con placards en la planta alta.',
        dormitorios: 2,
        banos: 2,
        m2: 95,
        estado: 'Aprobado',
        usuario_id: agent.id,
        tipo: 'Venta',
        moneda: 'USD',
        latitud: -54.8030,
        longitud: -68.3220
      });

      const p10 = await Property.create({
        titulo: 'Cabaña Familiar Panorámica en la Loma',
        direccion: 'Luis Fernando Martial 850, Ushuaia',
        precio: 190000,
        descripcion: 'Gran propiedad emplazada en el camino al Glaciar Martial, con vistas incomparables hacia la bahía de Ushuaia. Construcción sumamente sólida con troncos macizos, amplio deck aterrazado, living en doble altura y cochera para dos autos.',
        dormitorios: 4,
        banos: 3,
        m2: 220,
        estado: 'Aprobado',
        usuario_id: martillero.id,
        tipo: 'Venta',
        moneda: 'USD',
        latitud: -54.7920,
        longitud: -68.3450
      });

      const p11 = await Property.create({
        titulo: 'Edificio Martial - Semipiso en Pozo',
        direccion: 'Gdor. Deloqui 350, Ushuaia',
        precio: 95000,
        descripcion: 'Excelente oportunidad de inversión en pozo. Semipiso de 2 ambientes con balcón terraza y vista parcial al canal. Edificio de categoría con salón de usos múltiples (SUM), gimnasio y seguridad 24 hs. Financiación a medida.',
        dormitorios: 1,
        banos: 1,
        m2: 52,
        estado: 'Aprobado',
        usuario_id: martillero.id,
        tipo: 'Venta en pozo',
        moneda: 'USD',
        latitud: -54.8055,
        longitud: -68.3015
      });

      const p12 = await Property.create({
        titulo: 'Fideicomiso Bahía - Duplex en Construcción',
        direccion: 'Av. Perito Moreno 1800, Ushuaia',
        precio: 145000,
        descripcion: 'Últimas unidades disponibles. Duplex de categoría financiados en pozo. Amplio living comedor, cocina de diseño, patio propio con parrilla y cochera. Excelente retorno de inversión en zona de alta demanda.',
        dormitorios: 2,
        banos: 2,
        m2: 88,
        estado: 'Aprobado',
        usuario_id: agent.id,
        tipo: 'Venta en pozo',
        moneda: 'USD',
        latitud: -54.7980,
        longitud: -68.2680
      });

      // Seed Images
      await PropertyImage.create({
        propiedad_id: p1.id,
        url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p1.id,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        es_principal: false
      });

      await PropertyImage.create({
        propiedad_id: p2.id,
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        es_principal: true
      });

      await PropertyImage.create({
        propiedad_id: p3.id,
        url: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80',
        es_principal: true
      });

      await PropertyImage.create({
        propiedad_id: p4.id,
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        es_principal: true
      });

      // Nuevas imágenes de IA para las propiedades de alquiler y venta
      await PropertyImage.create({
        propiedad_id: p5.id,
        url: '/uploads/rent_house_1.png',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p6.id,
        url: '/uploads/rent_house_2.png',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p7.id,
        url: '/uploads/rent_house_3.png',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p8.id,
        url: '/uploads/sale_house_1.png',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p9.id,
        url: '/uploads/sale_house_2.png',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p10.id,
        url: '/uploads/sale_house_3.png',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p11.id,
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        es_principal: true
      });
      await PropertyImage.create({
        propiedad_id: p12.id,
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        es_principal: true
      });

      // Seed Contact Message
      await ContactMessage.create({
        propiedad_id: p1.id,
        nombre: 'Agustín',
        apellido: 'Martínez',
        email: 'agustin@gmail.com',
        telefono: '+54 2901 445566',
        mensaje: 'Hola! Estoy muy interesado en la casa alpina de Av. Alem. ¿Cuándo podría coordinar una visita para verla? Gracias.'
      });

      console.log('Database successfully seeded!');
    }
  } catch (error) {
    console.error('Unable to initialize the database:', error);
  }
}

module.exports = {
  sequelize,
  User,
  Property,
  PropertyImage,
  ContactMessage,
  initDb
};
