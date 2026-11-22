const Watchlist = require("../models/watchlist");

exports.agregar = async (req, res) => {
  try {
    const { usuarioId, peliculaId, tipo = "movie", titulo, anio, posterUrl } = req.body;

    if (!usuarioId || !peliculaId || !titulo) {
      return res.status(400).json({
        success: false,
        mensaje: "usuarioId, peliculaId y titulo son obligatorios"
      });
    }

    const existe = await Watchlist.findOne({
      usuarioId: String(usuarioId),
      peliculaId: String(peliculaId),
      tipo
    });

    if (existe) {
      return res.status(400).json({
        success: false,
        mensaje: "Este título ya está en tu watchlist"
      });
    }

    const nuevoItem = new Watchlist({
      usuarioId: String(usuarioId),
      peliculaId: String(peliculaId),
      tipo,
      titulo,
      anio: anio || "—",
      posterUrl: posterUrl || ""
    });

    await nuevoItem.save();

    res.status(201).json({
      success: true,
      mensaje: "Agregado a tu watchlist",
      item: nuevoItem
    });
  } catch (error) {
    console.error("Error al agregar a watchlist:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al agregar a watchlist",
      error: error.message
    });
  }
};

exports.obtenerWatchlist = async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId || req.params.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        mensaje: "El usuarioId es obligatorio"
      });
    }

    const watchlist = await Watchlist.find({ usuarioId: String(usuarioId) }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      watchlist
    });
  } catch (error) {
    console.error("Error al obtener watchlist:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener watchlist",
      error: error.message
    });
  }
};

exports.verificarEstado = async (req, res) => {
  try {
    const { usuarioId, peliculaId } = req.params;
    const { tipo = "movie" } = req.query;

    const item = await Watchlist.findOne({
      usuarioId: String(usuarioId),
      peliculaId: String(peliculaId),
      tipo
    });

    res.status(200).json({
      success: true,
      enWatchlist: !!item,
      item: item || null
    });
  } catch (error) {
    console.error("Error al verificar estado en watchlist:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al verificar estado",
      error: error.message
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, tipo = "movie" } = req.query;

    let eliminado = null;

    if (usuarioId) {
      eliminado = await Watchlist.findOneAndDelete({
        usuarioId: String(usuarioId),
        peliculaId: String(id),
        tipo
      });
    } else {
      eliminado = await Watchlist.findByIdAndDelete(id);
    }

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        mensaje: "Elemento no encontrado en la watchlist"
      });
    }

    res.status(200).json({
      success: true,
      mensaje: "Eliminado de tu watchlist"
    });
  } catch (error) {
    console.error("Error al eliminar de watchlist:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar elemento",
      error: error.message
    });
  }
};