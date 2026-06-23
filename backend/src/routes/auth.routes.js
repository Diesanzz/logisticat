const express = require("express");
const router = express.Router();

const {
    registrarUsuario,
    iniciarSesion,
    solicitarRecuperacionPassword,
    restablecerPassword
} = require("../controllers/auth.controller");

router.post("/registro", registrarUsuario);
router.post("/login", iniciarSesion);
router.post("/forgot-password", solicitarRecuperacionPassword);
router.post("/reset-password", restablecerPassword);

module.exports = router;