const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: String,
      required: [true, "El ID de usuario es obligatorio"],
      trim: true
    },

    peliculaId: {
      type: String,
      required: [true, "El ID de la película o serie es obligatorio"],
      trim: true
    },

    tipo: {
      type: String,
      enum: ["movie", "tv"],
      default: "movie"
    },

    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true
    },

    anio: {
      type: String,
      default: "—",
      trim: true
    },

    posterUrl: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

watchlistSchema.index({ usuarioId: 1, peliculaId: 1, tipo: 1 }, { unique: true });

module.exports = mongoose.model(
  "Watchlist",
  watchlistSchema,
  "watchlist"
);