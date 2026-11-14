const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passwordController = require("../controllers/passController");

router.post("/login", authController.login);
router.post("/olvidar-pass", passwordController.recuperacion);
router.post("/restablecer-pass", passwordController.restablecerPassword);

module.exports = router;