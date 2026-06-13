const express = require("express");
const router = express.Router();

const {
    obtenerMovimientos
} = require("../controllers/movimientos.controller");

router.get("/", obtenerMovimientos);

module.exports = router;