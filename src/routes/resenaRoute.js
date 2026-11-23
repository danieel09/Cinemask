const express = require("express");
const router = express.Router();
const resenaController = require("../controllers/resenaController");
//pendiente const verificarToken = require("../middlewares/verificarToken");

router.post("/crear", resenaController.crearResena);
router.get("/obtener", resenaController.obtenerResenas);
router.get("/obtener/:id", resenaController.obtenerResenaPorId);
router.put("/actualizar/:id", resenaController.actualizarResena);
router.patch("/actualizar/:id", resenaController.actualizarResena);
router.delete("/eliminar/:id", resenaController.eliminarResena);

module.exports = router;