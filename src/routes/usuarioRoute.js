const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarioController");

router.post("/registro", usuariosController.registro);

module.exports = router;