const pool = require("../database/connection");

async function obtenerMovimientos(req, res) {
    try {
        const [movimientos] = await pool.query(`
            SELECT
                id_movimiento AS id,
                id_producto AS idProducto,
                nombre_producto AS nombreProducto,
                tipo,
                cantidad,
                unidad,
                motivo,
                fecha_movimiento AS fechaMovimiento
            FROM movimientos
            ORDER BY fecha_movimiento DESC
        `);

        res.json({
            ok: true,
            movimientos
        });
    } catch (error) {
        console.error("Error al obtener movimientos:", error);

        res.status(500).json({
            ok: false,
            message: "Error al obtener movimientos",
            error: error.message
        });
    }
}

module.exports = {
    obtenerMovimientos
};