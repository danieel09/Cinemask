const Resena = require("../models/resena");

exports.crearResena = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?._id || req.body.usuarioId;
    const username = req.usuario?.username || req.body.username;

    const {peliculaId, titulo, anio, posterUrl, calificacion, comentario, contieneSpoilers, fechaVista, horaVista} = req.body;

    if (!usuarioId || !username || !peliculaId || !titulo || calificacion === undefined || contieneSpoilers === undefined ||!fechaVista ||!horaVista) {
      return res.status(400).json({
        success: false,
        mensaje: "Faltan campos obligatorios."
      });
    }

    const nuevaResena = new Resena({
      usuarioId,
      username,
      peliculaId,
      titulo,
      anio,
      posterUrl,
      calificacion: Number(calificacion),
      comentario,
      contieneSpoilers: Boolean(contieneSpoilers),
      fechaVista,
      horaVista
    });

    const resenaGuardada = await nuevaResena.save();

    return res.status(201).json({
      success: true,
      mensaje: "Reseña creada correctamente.",
      data: resenaGuardada
    });
    } catch (error) {
        if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            mensaje: "Error de validación en los datos de la reseña.",
            error: error.message
        });
    }

    console.error("Error en crearResena:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor al crear la reseña.",
      error: error.message
    });
  }
};

exports.obtenerResenas = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.peliculaId) filtro.peliculaId = req.query.peliculaId;
    if (req.query.usuarioId) filtro.usuarioId = req.query.usuarioId;

    const resenas = await Resena.find(filtro).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: resenas.length,
      data: resenas
    });
  } catch (error) {
    console.error("Error en obtenerResenas:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al obtener las reseñas.",
      error: error.message
    });
  }
};

exports.obtenerResenaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findById(id);

    if (!resena) {
      return res.status(404).json({
        success: false,
        mensaje: "Reseña no encontrada."
      });
    }

    return res.status(200).json({
      success: true,
      data: resena
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        mensaje: "El ID de la reseña no es válido."
      });
    }

    console.error("Error en obtenerResenaPorId:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al buscar la reseña.",
      error: error.message
    });
  }
};

// DATOS ACTUALIZABLES: calificacion, contieneSpoilers, comentario
exports.actualizarResena = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion, contieneSpoilers, comentario } = req.body;

    const datosActualizables = {};

    if (calificacion !== undefined) {
      datosActualizables.calificacion = Number(calificacion);
    }

    if (contieneSpoilers !== undefined) {
      datosActualizables.contieneSpoilers = Boolean(contieneSpoilers);
    }

    if (comentario !== undefined) {
      datosActualizables.comentario = String(comentario).trim();
    }

    const resenaActualizada = await Resena.findByIdAndUpdate(
      id,
      datosActualizables,
      { new: true, runValidators: true }
    );

    if (!resenaActualizada) {
      return res.status(404).json({
        success: false,
        mensaje: "Reseña no encontrada para actualizar."
      });
    }

    return res.status(200).json({
      success: true,
      mensaje: "Reseña actualizada correctamente.",
      data: resenaActualizada
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        mensaje: "El ID de la reseña no es válido."
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        mensaje: "Error de validación al actualizar la reseña.",
        error: error.message
      });
    }

    console.error("Error en actualizarResena:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al actualizar la reseña.",
      error: error.message
    });
  }
};

exports.eliminarResena = async (req, res) => {
  try {
    const { id } = req.params;
    const resenaEliminada = await Resena.findByIdAndDelete(id);

    if (!resenaEliminada) {
      return res.status(404).json({
        success: false,
        mensaje: "Reseña no encontrada para eliminar."
      });
    }

    return res.status(200).json({
      success: true,
      mensaje: "Reseña eliminada correctamente."
    });
    } catch (error) {
        if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            mensaje: "El ID de la reseña no es válido."
        });
        }

    console.error("Error en eliminarResena:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al eliminar la reseña.",
      error: error.message
    });
  }
};