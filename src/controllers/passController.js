const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.recuperacion = async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) {
      return res.status(400).json({ mensaje: 'Por favor, ingresa tu correo electrónico' });
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No existe una cuenta registrada con este correo' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    usuario.codigoVerificacion = codigo;
    usuario.expiracionCodigo = Date.now() + 15 * 60 * 1000;
    await usuario.save();

    await transporter.sendMail({
      from: `"Soporte CINEMASK" <${process.env.EMAIL_USER}>`,
      to: usuario.correo,
      subject: 'Código de recuperación de contraseña - CINEMASK',
      text: `Hola ${usuario.username},\n\nTu código de verificación para restablecer tu contraseña es: ${codigo}\n\nEste código expirará en 15 minutos.\n\nSi no solicitaste este cambio, por favor ignora este correo.\n\nGracias,\nEl equipo de CINEMASK`
    });

    res.status(200).json({ mensaje: 'Código de verificación enviado a tu correo' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ mensaje: 'Error al enviar el correo de recuperación', error: error.message });
  }
};

exports.restablecerPassword = async (req, res) => {
  try {
    const { correo, codigo, nuevaPassword } = req.body;

    if (!correo || !codigo || !nuevaPassword) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    if (usuario.codigoVerificacion !== codigo) {
      return res.status(400).json({ mensaje: 'El código de verificación es incorrecto' });
    }

    if (usuario.expiracionCodigo < Date.now()) {
      return res.status(400).json({ mensaje: 'El código de verificación ha expirado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaPassword, salt);

    usuario.password = passwordHash;
    usuario.codigoVerificacion = null;
    usuario.expiracionCodigo = null;
    await usuario.save();

    res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ mensaje: 'Error interno al actualizar la contraseña', error: error.message });
  }
};