const mongoose = require("mongoose");

const usuariosSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre no puede superar 100 caracteres"]
    },

    edad: {
      type: Number,
      required: [true, "La edad es obligatoria"],
      min: [18, "La edad no puede ser menor a 18"],
      default: 0
    },

    pais: {
      type: String,
      required: [true, "El país es obligatorio"],
      trim: true
    },

    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    rol: {
        type: String,
        enum: ['usuario', 'administrador'],
        default: 'usuario'
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

  //Para olvidar contraseña
  codigoVerificacion: {
        type: String,
        default: null
    },
    expiracionCodigo: {
        type: Date,
        default: null
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Usuario",
  usuariosSchema,
  "usuarios"
);