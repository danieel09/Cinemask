const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/SerieController");

router.get("/populares", seriesController.obtenerPopulares);
router.get("/tendencia", seriesController.obtenerTendencia);
router.get("/buscar", seriesController.buscarSerie);
router.get("/:id", seriesController.obtenerDetalle);

module.exports = router;