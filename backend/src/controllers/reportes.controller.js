const {
    obtenerProductosData,
    obtenerMermaData
} = require("./productos.controller");

function calcularDiasRestantes(fechaCaducidad) {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad + "T00:00:00");

    hoy.setHours(0, 0, 0, 0);

    const diferencia = caducidad - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    return dias;
}

function obtenerResumen(req, res) {
    const productos = obtenerProductosData();
    const merma = obtenerMermaData();

    const totalProductos = productos.length;

    const productosPorCaducar = productos.filter((producto) => {
        const dias = calcularDiasRestantes(producto.fechaCaducidad);
        return dias >= 0 && dias <= 7;
    }).length;

    const productosVencidos = productos.filter((producto) => {
        const dias = calcularDiasRestantes(producto.fechaCaducidad);
        return dias < 0;
    }).length;

    const totalMermas = merma.length;

    const porcentajeMerma = totalProductos + totalMermas === 0
    ? 0
    : Math.round((totalMermas / (totalProductos + totalMermas)) *100);

    res.json({
        ok: true,
        resumen: {
            totalProductos,
            productosPorCaducar,
            productosVencidos,
            totalMermas,
            porcentajeMerma
        }
    });
}

module.exports = {
    obtenerResumen
};