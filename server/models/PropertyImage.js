const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PropertyImage = sequelize.define('PropertyImage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  propiedad_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  es_principal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'PropertyImages'
});

module.exports = PropertyImage;
