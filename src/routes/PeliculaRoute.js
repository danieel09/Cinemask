const express = require("express");
const router = express.Router();
const peliculasController = require("../controllers/PeliculaController");

router.get("/populares", peliculasController.obtenerPopulares);
router.get("/tendencia", peliculasController.obtenerTendencia);
router.get("/mejor-calificadas", peliculasController.obtenerMejorCalificadas);
router.get("/cartelera", peliculasController.obtenerCartelera);
router.get("/buscar", peliculasController.buscarPelicula);
router.get("/:id", peliculasController.obtenerDetalle);

module.exports = router;