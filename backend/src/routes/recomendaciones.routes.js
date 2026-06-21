const express = require("express");
const router = express.Router();

const {
    obtenerRecomendaciones
} = require("../controllers/recomendaciones.controller");

router.get("/", obtenerRecomendaciones);

module.exports = router;