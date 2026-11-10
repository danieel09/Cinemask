const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

exports.registro = async (req, res) => {
  try {
    const { nombre, edad, pais, correo, password, username } = req.body;

    if (!nombre || !edad || !pais || !correo || !password || !username) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const usuarioExistente = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const usernameExistente = await Usuario.findOne({ username: username });
    if (usernameExistente) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      edad,
      pais,
      correo: correo.toLowerCase(),
      password: passwordHash,
      username: username,
      rol: 'administrador' //-> Mandarlo desde pantalla de registro 
    });

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        edad: nuevoUsuario.edad,
        pais: nuevoUsuario.pais,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        username: nuevoUsuario.username
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};