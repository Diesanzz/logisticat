const express = require("express");
const router = express.Router();

const {
    obtenerAlertasCaducidad
} = require("../controllers/alertas.controller");

router.get("/caducidad", obtenerAlertasCaducidad);

module.exports = router;