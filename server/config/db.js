const { Sequelize } = require('sequelize');

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'inmobiliaria_db';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql',
  logging: false, // Turn off logging for clean console, or set to console.log for debugging
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
