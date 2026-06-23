const pool = require("../database/connection");

async function obtenerResumen(req, res) {
    try {
        const [totalProductosResult] = await pool.query(`
            SELECT COUNT(*) AS totalProductos
            FROM productos
        `);

        const [porCaducarResult] = await pool.query(`
            SELECT COUNT(*) AS productosPorCaducar
            FROM productos
            WHERE fecha_caducidad >= CURDATE()
            AND fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `);

        const [vencidosResult] = await pool.query(`
            SELECT COUNT(*) AS productosVencidos
            FROM productos
            WHERE fecha_caducidad < CURDATE()
        `);

        /*
            Reporte mensual:
            - Consumo cuenta como salida normal.
            - Daño y caducidad cuentan como merma real.
            - Se calcula solo con movimientos del mes actual.
        */

        const [salidasMensualesResult] = await pool.query(`
            SELECT COUNT(*) AS totalSalidasMensuales
            FROM movimientos
            WHERE tipo IN ('salida', 'merma')
            AND MONTH(fecha_movimiento) = MONTH(CURDATE())
            AND YEAR(fecha_movimiento) = YEAR(CURDATE())
        `);

        const [mermasMensualesResult] = await pool.query(`
            SELECT COUNT(*) AS totalMermasMensuales
            FROM movimientos
            WHERE tipo = 'merma'
            AND motivo IN ('daño', 'caducidad')
            AND MONTH(fecha_movimiento) = MONTH(CURDATE())
            AND YEAR(fecha_movimiento) = YEAR(CURDATE())
        `);

        const totalProductos = totalProductosResult[0].totalProductos || 0;
        const productosPorCaducar = porCaducarResult[0].productosPorCaducar || 0;
        const productosVencidos = vencidosResult[0].productosVencidos || 0;

        const totalSalidasMensuales = salidasMensualesResult[0].totalSalidasMensuales || 0;
        const totalMermasMensuales = mermasMensualesResult[0].totalMermasMensuales || 0;

        const porcentajeMerma = totalSalidasMensuales > 0
            ? ((totalMermasMensuales / totalSalidasMensuales) * 100).toFixed(2)
            : 0;

        res.json({
            totalProductos,
            productosPorCaducar,
            productosVencidos,
            totalMermas: totalMermasMensuales,
            totalSalidasMensuales,
            porcentajeMerma
        });

    } catch (error) {
        console.error("Error al obtener resumen:", error);
        res.status(500).json({
            message: "Error al obtener el resumen de reportes."
        });
    }
}

module.exports = {
    obtenerResumen
};