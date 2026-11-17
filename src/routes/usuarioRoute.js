const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarioController");

router.post("/registro", usuariosController.registro);
router.get("/obtener", usuariosController.obtenerUsuarios);
router.delete("/eliminar/:id", usuariosController.eliminarUsuario);
router.put("/actualizar/:id", usuariosController.actualizarUsuario);

module.exports = router;