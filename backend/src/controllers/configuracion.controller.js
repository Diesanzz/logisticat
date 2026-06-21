const pool = require("../database/connection");

async function obtenerConfiguracion(req, res) {
    try {
        const [configuraciones] = await pool.query(`
            SELECT clave, valor
            FROM configuraciones
        `);

        const configuracion = {};

        configuraciones.forEach((item) => {
            configuracion[item.clave] = item.valor;
        });

        res.json({
            ok: true,
            configuracion
        });

    } catch (error) {
        console.error("Error al obtener configuración:", error);

        res.status(500).json({
            ok: false,
            message: "Error al obtener configuración",
            error: error.message
        });
    }
}

async function actualizarConfiguracionHistorial(req, res) {
    try {
        const { mesesHistorial } = req.body;

        const valoresPermitidos = ["1", "2", "3", "6", "nunca"];

        if (!valoresPermitidos.includes(String(mesesHistorial))) {
            return res.status(400).json({
                ok: false,
                message: "Valor de historial no válido"
            });
        }

        await pool.query(
            `
            INSERT INTO configuraciones (clave, valor)
            VALUES ('meses_historial', ?)
            ON DUPLICATE KEY UPDATE valor = ?
            `,
            [mesesHistorial, mesesHistorial]
        );

        res.json({
            ok: true,
            message: "Configuración de historial actualizada correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar configuración:", error);

        res.status(500).json({
            ok: false,
            message: "Error al actualizar configuración",
            error: error.message
        });
    }
}

async function limpiarHistorialAntiguo(req, res) {
    try {
        const [configuraciones] = await pool.query(
            `
            SELECT valor
            FROM configuraciones
            WHERE clave = 'meses_historial'
            LIMIT 1
            `
        );

        const mesesHistorial = configuraciones.length > 0
            ? configuraciones[0].valor
            : "3";

        if (mesesHistorial === "nunca") {
            return res.json({
                ok: true,
                message: "La configuración actual indica que el historial no debe borrarse"
            });
        }

        const [resultado] = await pool.query(
            `
            DELETE FROM movimientos
            WHERE fecha_movimiento < DATE_SUB(NOW(), INTERVAL ? MONTH)
            `,
            [Number(mesesHistorial)]
        );

        res.json({
            ok: true,
            message: `Historial antiguo eliminado correctamente. Movimientos eliminados: ${resultado.affectedRows}`,
            movimientosEliminados: resultado.affectedRows
        });

    } catch (error) {
        console.error("Error al limpiar historial:", error);

        res.status(500).json({
            ok: false,
            message: "Error al limpiar historial",
            error: error.message
        });
    }
}

module.exports = {
    obtenerConfiguracion,
    actualizarConfiguracionHistorial,
    limpiarHistorialAntiguo
};