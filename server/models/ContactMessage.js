const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  propiedad_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = ContactMessage;
