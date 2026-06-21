const express = require("express");
const router = express.Router();

const {
    obtenerConfiguracion,
    actualizarConfiguracionHistorial,
    limpiarHistorialAntiguo
} = require("../controllers/configuracion.controller");

router.get("/", obtenerConfiguracion);
router.put("/historial", actualizarConfiguracionHistorial);
router.delete("/historial/limpiar", limpiarHistorialAntiguo);

module.exports = router;