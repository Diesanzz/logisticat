const pool = require("../database/connection");

async function obtenerProductos(req, res) {
    try {
        const [productos] = await pool.query(`
            SELECT 
                id_producto AS id,
                nombre,
                cantidad,
                unidad,
                fecha_ingreso AS fechaIngreso,
                fecha_caducidad AS fechaCaducidad
            FROM productos
            ORDER BY fecha_caducidad ASC
        `);

        res.json({
            ok: true,
            productos
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al obtener productos",
            error: error.message
        });
    }
}

async function crearProducto(req, res) {
    try {
        const {
            nombre,
            cantidad,
            unidad,
            fechaIngreso,
            fechaCaducidad
        } = req.body;

        if (!nombre || !cantidad || !unidad || !fechaIngreso || !fechaCaducidad) {
            return res.status(400).json({
                ok: false,
                message: "Todos los campos son obligatorios"
            });
        }

        if (new Date(fechaCaducidad) < new Date(fechaIngreso)) {
            return res.status(400).json({
                ok: false,
                message: "La fecha de caducidad no puede ser menor que la fecha de ingreso"
            });
        }

        const [resultado] = await pool.query(`
            INSERT INTO productos (nombre, cantidad, unidad, fecha_ingreso, fecha_caducidad)
            VALUES (?, ?, ?, ?, ?)
        `, [nombre, cantidad, unidad, fechaIngreso, fechaCaducidad]);

        res.status(201).json({
            ok: true,
            message: "Producto creado correctamente",
            producto: {
                id: resultado.insertId,
                nombre,
                cantidad: Number(cantidad),
                unidad,
                fechaIngreso,
                fechaCaducidad
            }
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al crear producto",
            error: error.message
        });
    }
}

async function registrarMerma(req, res) {
    try {
        const id = Number(req.params.id);
        const { motivo } = req.body;

        const motivosValidos = ["consumo", "daño", "caducidad"];

        if (!motivo || !motivosValidos.includes(motivo.toLowerCase().trim())) {
            return res.status(400).json({
                ok: false,
                message: "Motivo inválido. Usa: consumo, daño o caducidad"
            });
        }

        const [productos] = await pool.query(`
            SELECT 
                id_producto,
                nombre,
                cantidad,
                unidad
            FROM productos
            WHERE id_producto = ?
        `, [id]);

        if (productos.length === 0) {
            return res.status(404).json({
                ok: false,
                message: "Producto no encontrado"
            });
        }

        const producto = productos[0];
        const motivoNormalizado = motivo.toLowerCase().trim();

        await pool.query(`
            INSERT INTO mermas (id_producto, nombre_producto, cantidad, unidad, motivo)
            VALUES (?, ?, ?, ?, ?)
        `, [
            producto.id_producto,
            producto.nombre,
            producto.cantidad,
            producto.unidad,
            motivoNormalizado
        ]);

        await pool.query(`
            DELETE FROM productos
            WHERE id_producto = ?
        `, [id]);

        res.json({
            ok: true,
            message: "Merma registrada correctamente"
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al registrar merma",
            error: error.message
        });
    }
}

async function eliminarProducto(req, res) {
    try {
        const id = Number(req.params.id);

        const [resultado] = await pool.query(`
            DELETE FROM productos
            WHERE id_producto = ?
        `, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                message: "Producto no encontrado"
            });
        }

        res.json({
            ok: true,
            message: "Producto eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al eliminar producto",
            error: error.message
        });
    }
}

module.exports = {
    obtenerProductos,
    crearProducto,
    registrarMerma,
    eliminarProducto
};