const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_ushuaia_2026';

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'nombre', 'email', 'rol']
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error profile:', error);
    res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
};

const createUser = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    // Role hierarchies checks
    // Martillero can only create Martillero and Agente
    if (req.user.rol === 'Martillero' && rol === 'SuperAdmin') {
      return res.status(403).json({ error: 'El Martillero no puede crear usuarios SuperAdmin.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      nombre,
      email,
      password_hash,
      rol
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente.',
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error del servidor al crear usuario.' });
  }
};

// Only SuperAdmin or Martillero can list users
const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'createdAt']
    });
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Error al obtener listado de usuarios.' });
  }
};

module.exports = {
  login,
  getProfile,
  createUser,
  listUsers
};
