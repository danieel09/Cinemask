const express = require("express");
const router = express.Router();
const peliculasController = require("../controllers/PeliculaController");

router.get("/populares", peliculasController.obtenerPopulares);

router.get("/buscar", peliculasController.buscarPelicula);

module.exports = router;