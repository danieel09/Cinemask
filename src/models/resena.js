const mongoose = require("mongoose");

const resenaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    username: {
      type: String,
      required: true
    },
    peliculaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pelicula",
      required: true
    },
    titulo: {
      type: String,
      required: true
    },
    anio: {
      type: Number,
      required: false
    },
    posterUrl: {
      type: String,
      required: false
    },
    calificacion: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comentario: {
      type: String,
      required: false
    },
    contieneSpoilers: {
      type: Boolean,
      required: true
    },
    fechaVista: {
        type: Date, 
        required: true
    },
    horaVista: {
        type: String, 
        required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Resena",
  resenaSchema,
  "resenas"
);