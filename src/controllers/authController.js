const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ 
        mensaje: 'Por favor, ingresa correo y contraseña' 
      });
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    
    if (!usuario) {
      return res.status(404).json({ 
        mensaje: 'El correo no está registrado' 
      });
    }

    const esCorrecto = await bcrypt.compare(password, usuario.password);
    if (!esCorrecto) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        edad: usuario.edad,
        pais: usuario.pais,
        correo: usuario.correo,
        rol: usuario.rol,
        username: usuario.username
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor', 
      error: error.message 
    });
  }
};