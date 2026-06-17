const pool = require("../database/connection");

async function obtenerAlertasCaducidad(req, res) {
    try {
        const [alertas] = await pool.query(`
            SELECT 
                id_producto AS id,
                nombre,
                cantidad,
                unidad,
                fecha_ingreso AS fechaIngreso,
                fecha_caducidad AS fechaCaducidad,
                DATEDIFF(fecha_caducidad, CURDATE()) AS diasRestantes,
                CASE
                    WHEN DATEDIFF(fecha_caducidad, CURDATE()) < 0 THEN 'vencido'
                    WHEN DATEDIFF(fecha_caducidad, CURDATE()) <= 2 THEN 'critico'
                    WHEN DATEDIFF(fecha_caducidad, CURDATE()) <= 7 THEN 'advertencia'
                    ELSE 'vigente'
                END AS nivelAlerta
            FROM productos
            WHERE fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY fecha_caducidad ASC
        `);

        res.json({
            ok: true,
            alertas
        });
    } catch (error) {
        console.error("Error al obtener alertas:", error);

        res.status(500).json({
            ok: false,
            message: "Error al obtener alertas de caducidad",
            error: error.message
        });
    }
}

module.exports = {
    obtenerAlertasCaducidad
};