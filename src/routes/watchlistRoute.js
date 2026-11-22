const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlistController");

router.get("/verificar/:usuarioId/:peliculaId", watchlistController.verificarEstado);
router.post("/agregar", watchlistController.agregar);
router.get("/obtener", watchlistController.obtenerWatchlist);
router.delete("/eliminar/:id", watchlistController.eliminar);

module.exports = router;