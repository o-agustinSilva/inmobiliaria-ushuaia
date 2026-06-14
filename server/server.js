const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./models');

// Import Middlewares
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');
const { upload, optimizeImages } = require('./middleware/uploadMiddleware');

// Import Controllers
const authController = require('./controllers/authController');
const propertyController = require('./controllers/propertyController');
const contactController = require('./controllers/contactController');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development server
app.use(cors({
  origin: '*', // Allow all in development, or set specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id']
}));

app.use(express.json());

// Performance Photo Optimization: Serve optimized photos with Cache-Control headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// --- ROUTES ---

// Authentication Routes
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authenticateToken, authController.getProfile);
app.post('/api/auth/users', authenticateToken, authorizeRoles('SuperAdmin', 'Martillero'), authController.createUser);
app.get('/api/auth/users', authenticateToken, authorizeRoles('SuperAdmin', 'Martillero'), authController.listUsers);

// Properties Routes
app.get('/api/properties', propertyController.getProperties);
app.get('/api/properties/stats', authenticateToken, authorizeRoles('SuperAdmin', 'Martillero'), propertyController.getStats);
app.get('/api/properties/:id', propertyController.getPropertyById);

app.post('/api/properties', 
  authenticateToken, 
  upload.array('images', 10), 
  optimizeImages, 
  propertyController.createProperty
);

app.put('/api/properties/:id', 
  authenticateToken, 
  upload.array('images', 10), 
  optimizeImages, 
  propertyController.updateProperty
);

app.put('/api/properties/:id/approve', authenticateToken, authorizeRoles('SuperAdmin', 'Martillero'), propertyController.approveProperty);
app.put('/api/properties/:id/status', authenticateToken, propertyController.changeStatus);
app.delete('/api/properties/:id', authenticateToken, authorizeRoles('SuperAdmin', 'Martillero'), propertyController.deleteProperty);

// Contact Routes
app.post('/api/contact', contactController.submitMessage);
app.get('/api/contact', authenticateToken, authorizeRoles('SuperAdmin', 'Martillero'), contactController.getMessages);

// SuperAdmin System / Maintenance Tools
app.post('/api/admin/reset-db', authenticateToken, authorizeRoles('SuperAdmin'), async (req, res) => {
  try {
    await initDb(true); // Forces table drops and seed
    res.json({ message: 'Base de datos restaurada y sembrada correctamente.' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Error del servidor al resetear la base de datos.' });
  }
});

app.get('/api/admin/system-health', authenticateToken, authorizeRoles('SuperAdmin'), (req, res) => {
  // Return mock server usage
  res.json({
    status: 'online',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: Math.round(Math.random() * 30 + 5) + '%' // Mocked CPU utilization
  });
});

// Database Sync & Server Startup
async function startServer() {
  await initDb(); // Synchronizes tables, seeds if empty
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}

startServer();
