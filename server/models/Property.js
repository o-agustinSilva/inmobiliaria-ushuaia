const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dormitorios: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  banos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  m2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Alquilado', 'Vendido'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('Alquiler', 'Venta', 'Venta en pozo'),
    allowNull: false,
    defaultValue: 'Venta'
  },
  moneda: {
    type: DataTypes.ENUM('ARS', 'USD'),
    allowNull: false,
    defaultValue: 'USD'
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Property;
