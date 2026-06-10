const express = require("express");
const router = express.Router();

const {
    obtenerProductos,
    crearProducto,
    registrarMerma,
    eliminarProducto
} = require("../controllers/productos.controller");

router.get("/", obtenerProductos);
router.post("/", crearProducto);
router.post("/:id/merma", registrarMerma);
router.delete("/:id", eliminarProducto);

module.exports = router;