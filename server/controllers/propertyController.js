const { Property, PropertyImage, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Public and internal property listings
const getProperties = async (req, res) => {
  const { search, dormitorios, minPrecio, maxPrecio, estado, tipo, moneda } = req.query;

  try {
    let whereClause = {};

    // Filter by search query (title / address)
    if (search) {
      whereClause[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { direccion: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by bedrooms
    if (dormitorios) {
      whereClause.dormitorios = parseInt(dormitorios);
    }

    // Filter by price range
    if (minPrecio || maxPrecio) {
      whereClause.precio = {};
      if (minPrecio) {
        whereClause.precio[Op.gte] = parseFloat(minPrecio);
      }
      if (maxPrecio) {
        whereClause.precio[Op.lte] = parseFloat(maxPrecio);
      }
    }

    // Filter by operation type (Alquiler / Venta / Venta en pozo)
    if (tipo) {
      whereClause.tipo = tipo;
    }

    // Filter by currency
    if (moneda) {
      whereClause.moneda = moneda;
    }

    // Role-based filtering of publication status
    // If no user is logged in (public view) or role is client, only show approved/rented/sold properties
    const userRole = req.headers['x-user-role'] || (req.user ? req.user.rol : null);
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : (req.user ? req.user.id : null);

    if (!userRole) {
      // Public view: only Approved, Rented, or Sold. No Pending!
      whereClause.estado = { [Op.in]: ['Aprobado', 'Alquilado', 'Vendido'] };
    } else if (userRole === 'Agente') {
      // Agents see all Approved/Rented/Sold, plus their own Pending ones
      whereClause[Op.or] = [
        { estado: { [Op.in]: ['Aprobado', 'Alquilado', 'Vendido'] } },
        { [Op.and]: [{ estado: 'Pendiente' }, { usuario_id: userId }] }
      ];
    } else if (userRole === 'Martillero' || userRole === 'SuperAdmin') {
      // Admin/Owner see everything, or can filter by specific status
      if (estado) {
        whereClause.estado = estado;
      }
    }

    const properties = await Property.findAll({
      where: whereClause,
      include: [
        {
          model: PropertyImage,
          as: 'images'
        },
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'nombre', 'email', 'rol']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Error del servidor al obtener las propiedades.' });
  }
};

const getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findByPk(id, {
      include: [
        {
          model: PropertyImage,
          as: 'images'
        },
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'nombre', 'email', 'rol']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ error: 'Propiedad no encontrada.' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching property detail:', error);
    res.status(500).json({ error: 'Error al obtener el detalle de la propiedad.' });
  }
};

const createProperty = async (req, res) => {
  const { titulo, direccion, precio, descripcion, dormitorios, banos, m2, tipo, moneda } = req.body;

  try {
    if (!titulo || !direccion || !precio || dormitorios === undefined || banos === undefined || m2 === undefined) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes.' });
    }

    // If poster is Agent, status starts as Pending.
    // If Martillero or SuperAdmin, it's auto-approved.
    const initialStatus = (req.user.rol === 'Martillero' || req.user.rol === 'SuperAdmin') ? 'Aprobado' : 'Pendiente';

    const property = await Property.create({
      titulo,
      direccion,
      precio: parseFloat(precio),
      descripcion,
      dormitorios: parseInt(dormitorios),
      banos: parseInt(banos),
      m2: parseInt(m2),
      estado: initialStatus,
      usuario_id: req.user.id,
      tipo: tipo || 'Venta',
      moneda: moneda || 'USD'
    });

    // Save optimized images if uploaded
    if (req.optimizedImages && req.optimizedImages.length > 0) {
      const imageRecords = req.optimizedImages.map((url, index) => ({
        propiedad_id: property.id,
        url,
        es_principal: index === 0 // Make the first image the cover photo
      }));

      await PropertyImage.bulkCreate(imageRecords);
    }

    // Refetch property with images
    const createdProperty = await Property.findByPk(property.id, {
      include: [{ model: PropertyImage, as: 'images' }]
    });

    res.status(201).json({
      message: 'Propiedad registrada con éxito.',
      property: createdProperty
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Error del servidor al crear la propiedad.' });
  }
};

const updateProperty = async (req, res) => {
  const { id } = req.params;
  const { titulo, direccion, precio, descripcion, dormitorios, banos, m2, tipo, moneda } = req.body;

  try {
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Propiedad no encontrada.' });
    }

    // Authorization: Agent can only edit their own
    if (req.user.rol === 'Agente' && property.usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes editar una propiedad de otro agente.' });
    }

    await property.update({
      titulo: titulo || property.titulo,
      direccion: direccion || property.direccion,
      precio: precio ? parseFloat(precio) : property.precio,
      descripcion: descripcion !== undefined ? descripcion : property.descripcion,
      dormitorios: dormitorios !== undefined ? parseInt(dormitorios) : property.dormitorios,
      banos: banos !== undefined ? parseInt(banos) : property.banos,
      m2: m2 !== undefined ? parseInt(m2) : property.m2,
      tipo: tipo || property.tipo,
      moneda: moneda || property.moneda
    });

    // Save extra optimized images if uploaded
    if (req.optimizedImages && req.optimizedImages.length > 0) {
      // Check if primary image already exists
      const hasPrimary = await PropertyImage.findOne({
        where: { propiedad_id: property.id, es_principal: true }
      });

      const imageRecords = req.optimizedImages.map((url, index) => ({
        propiedad_id: property.id,
        url,
        es_principal: !hasPrimary && index === 0
      }));

      await PropertyImage.bulkCreate(imageRecords);
    }

    const updatedProperty = await Property.findByPk(property.id, {
      include: [{ model: PropertyImage, as: 'images' }]
    });

    res.json({
      message: 'Propiedad actualizada con éxito.',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar la propiedad.' });
  }
};

const approveProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Propiedad no encontrada.' });
    }

    await property.update({ estado: 'Aprobado' });

    res.json({
      message: 'Propiedad aprobada exitosamente.',
      property
    });
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({ error: 'Error al aprobar la propiedad.' });
  }
};

const changeStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    if (!estado || !['Pendiente', 'Aprobado', 'Alquilado', 'Vendido'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido proporcionado.' });
    }

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Propiedad no encontrada.' });
    }

    // Agent can only change status of their own properties, and only to Alquilado or Vendido
    if (req.user.rol === 'Agente') {
      if (property.usuario_id !== req.user.id) {
        return res.status(403).json({ error: 'No puedes modificar una propiedad de otro agente.' });
      }
      if (!['Alquilado', 'Vendido'].includes(estado)) {
        return res.status(403).json({ error: 'Como Agente solo puedes cambiar el estado a Alquilado o Vendido.' });
      }
    }

    await property.update({ estado });

    res.json({
      message: `Propiedad marcada como ${estado} con éxito.`,
      property
    });
  } catch (error) {
    console.error('Error changing property status:', error);
    res.status(500).json({ error: 'Error al cambiar el estado de la propiedad.' });
  }
};

const deleteProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Propiedad no encontrada.' });
    }

    // Only Owner/Broker or SuperAdmin can delete
    // (Handled by routes using auth roles, but double checking here)
    if (req.user.rol !== 'Martillero' && req.user.rol !== 'SuperAdmin') {
      return res.status(403).json({ error: 'No tienes permisos para borrar propiedades.' });
    }

    await property.destroy();

    res.json({ message: 'Propiedad eliminada con éxito.' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Error al eliminar la propiedad.' });
  }
};

// Statistics Dashboard
const getStats = async (req, res) => {
  try {
    const total = await Property.count();
    const aprobados = await Property.count({ where: { estado: 'Aprobado' } });
    const pendientes = await Property.count({ where: { estado: 'Pendiente' } });
    const alquilados = await Property.count({ where: { estado: 'Alquilado' } });
    const vendidos = await Property.count({ where: { estado: 'Vendido' } });

    // Aggregate statistics (Ventas en USD, Alquileres en ARS)
    const totalPrecioVendidos = await Property.sum('precio', { where: { estado: 'Vendido', moneda: 'USD' } }) || 0;
    const totalPrecioAlquilados = await Property.sum('precio', { where: { estado: 'Alquilado', moneda: 'ARS' } }) || 0;

    // Properties by agent
    const agentsWithCount = await User.findAll({
      where: { rol: 'Agente' },
      attributes: [
        'id',
        'nombre',
        [sequelize.fn('COUNT', sequelize.col('properties.id')), 'propiedades_count']
      ],
      include: [{
        model: Property,
        as: 'properties',
        attributes: []
      }],
      group: ['User.id']
    });

    res.json({
      counts: {
        total,
        aprobados,
        pendientes,
        alquilados,
        vendidos
      },
      financial: {
        totalPrecioVendidos,
        totalPrecioAlquilados
      },
      agents: agentsWithCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error al calcular las estadísticas del sistema.' });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  approveProperty,
  changeStatus,
  deleteProperty,
  getStats
};
