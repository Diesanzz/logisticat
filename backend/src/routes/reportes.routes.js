const express = require("express");
const router = express.Router();

const {
    obtenerResumen
} = require("../controllers/reportes.controller");

router.get("/resumen", obtenerResumen);

module.exports = router;