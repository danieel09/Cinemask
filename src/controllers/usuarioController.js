const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

exports.registro = async (req, res) => {
  try {
    const { nombre, edad, pais, correo, password, username, rol } = req.body;

    if (!nombre || !edad || !pais || !correo || !password || !username || !rol) {
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
      rol: rol
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
        username: nuevoUsuario.username,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, edad, pais } = req.body;

    if (!nombre || !edad || !pais) {
      return res.status(400).json({ mensaje: 'Nombre, edad y país son obligatorios' });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    usuario.nombre = nombre.trim();
    usuario.edad = Number(edad);
    usuario.pais = pais;

    await usuario.save();

    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        edad: usuario.edad,
        pais: usuario.pais,
        correo: usuario.correo,
        username: usuario.username,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en actualización de usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-password');
    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error en obtención de usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en eliminación de usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
};
