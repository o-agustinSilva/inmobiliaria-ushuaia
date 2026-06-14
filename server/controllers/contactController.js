const { ContactMessage, Property } = require('../models');

const submitMessage = async (req, res) => {
  const { propiedad_id, nombre, apellido, email, telefono, mensaje } = req.body;

  try {
    if (!nombre || !apellido || !email || !telefono || !mensaje) {
      return res.status(400).json({ error: 'Todos los campos de contacto son requeridos.' });
    }

    const newMessage = await ContactMessage.create({
      propiedad_id: propiedad_id ? parseInt(propiedad_id) : null,
      nombre,
      apellido,
      email,
      telefono,
      mensaje
    });

    res.status(201).json({
      message: 'Mensaje de contacto enviado con éxito. Nos comunicaremos a la brevedad.',
      contactMessage: newMessage
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ error: 'Error del servidor al enviar el mensaje de contacto.' });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'titulo', 'direccion', 'precio']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error listing contact messages:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los mensajes de contacto.' });
  }
};

module.exports = {
  submitMessage,
  getMessages
};
