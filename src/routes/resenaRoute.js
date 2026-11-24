const express = require("express");
const router = express.Router();
const resenaController = require("../controllers/resenaController");

router.post("/crear", resenaController.crearResena);
router.get("/obtener", resenaController.obtenerResenas);
router.get("/obtener/:id", resenaController.obtenerResenaPorId);
router.put("/actualizar/:id", resenaController.actualizarResena);
router.delete("/eliminar/:id", resenaController.eliminarResena);
router.get("/obtenerPorUsuario/:usuarioId", resenaController.obtenerDiarioUsuario);

module.exports = router;