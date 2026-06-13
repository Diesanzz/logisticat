const pool = require("../database/connection");

function calcularDiasRestantes(fechaCaducidad) {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad);

    hoy.setHours(0, 0, 0, 0);
    caducidad.setHours(0, 0, 0, 0);

    const diferencia = caducidad - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    return dias;
}

async function obtenerResumen(req, res) {
    try {
        const [productos] = await pool.query(`
            SELECT fecha_caducidad AS fechaCaducidad
            FROM productos
        `);

        const [mermas] = await pool.query(`
            SELECT id_merma
            FROM mermas
        `);

        const totalProductos = productos.length;

        const productosPorCaducar = productos.filter((producto) => {
            const dias = calcularDiasRestantes(producto.fechaCaducidad);
            return dias >= 0 && dias <= 7;
        }).length;

        const productosVencidos = productos.filter((producto) => {
            const dias = calcularDiasRestantes(producto.fechaCaducidad);
            return dias < 0;
        }).length;

        const totalMermas = mermas.length;

        const porcentajeMerma = totalProductos + totalMermas === 0
            ? 0
            : Math.round((totalMermas / (totalProductos + totalMermas)) * 100);

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
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al obtener resumen",
            error: error.message
        });
    }
}

module.exports = {
    obtenerResumen
};