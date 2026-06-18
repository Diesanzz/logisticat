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

        await pool.query(`
            INSERT INTO movimientos (id_producto, nombre_producto, tipo, cantidad, unidad, motivo)
            VALUES (?, ?, 'entrada', ?, ?, ?)
        `, [
            resultado.insertId,
            nombre,
            cantidad,
            unidad,
            "Registro inicial de producto"
        ]);

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

async function actualizarProducto(req, res) {
    try {
        const id = Number(req.params.id);

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
                message: "Todos los campos son obligatorios."
            });
        }

        if (Number(cantidad) <= 0) {
            return res.status(400).json({
                ok: false,
                message: "La cantidad debe ser mayor a cero."
            });
        }

        if(new Date(fechaCaducidad) < new Date(fechaIngreso)) {
            return res.status(400).json({
                ok: false,
                message: "La fecha de caducidad no puede ser menor que la fecha de caducidad."
            });
        }

        const [resultado] = await pool.query(`
            UPDATE productos
            SET
                nombre = ?,
                cantidad = ?,
                unidad = ?,
                fecha_ingreso = ?,
                fecha_caducidad = ?
            WHERE id_producto = ?
            `, [
                nombre,
                cantidad,
                unidad,
                fechaIngreso,
                fechaCaducidad,
                id
            ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                message: "Producto no encontrado."
            });
        }

        await pool.query(`
            INSERT INTO movimientos (id_producto, nombre_producto, tipo, cantidad, unidad, motivo)
            VALUES (?, ?, 'entrada', ?, ?, ?)
            `, [
                id,
                nombre,
                cantidad,
                unidad,
                "Actualización de producto"
            ]);

        res.json({
            ok: true,
            message: "Producto actualizado correctamente."
        });        
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al actualizar producto",
            error: error.message
        });
    }
}

async function registrarMerma(req, res) {
    try {
        const { id } = req.params;
        const { motivo, cantidad } = req.body;

        if (!motivo) {
            return res.status(400).json({
                ok: false,
                message: "El motivo de salida es obligatorio"
            });
        }

        if (!cantidad || Number(cantidad) <= 0) {
            return res.status(400).json({
                ok: false,
                message: "La cantidad a retirar debe ser mayor a 0"
            });
        }

        const motivoNormalizado = motivo.toLowerCase();

        const motivosValidos = ["consumo", "daño", "caducidad"];

        if (!motivosValidos.includes(motivoNormalizado)) {
            return res.status(400).json({
                ok: false,
                message: "Motivo de salida no válido"
            });
        }

        const [productos] = await pool.query(
            `
            SELECT 
                id_producto,
                nombre,
                cantidad,
                unidad
            FROM productos
            WHERE id_producto = ?
            `,
            [id]
        );

        if (productos.length === 0) {
            return res.status(404).json({
                ok: false,
                message: "Producto no encontrado"
            });
        }

        const producto = productos[0];

        const cantidadActual = Number(producto.cantidad);
        const cantidadRetirar = Number(cantidad);

        if (cantidadRetirar > cantidadActual) {
            return res.status(400).json({
                ok: false,
                message: `No puedes retirar ${cantidadRetirar} ${producto.unidad}. Solo hay ${cantidadActual} ${producto.unidad} disponibles.`
            });
        }

        const tipoMovimiento = motivoNormalizado === "consumo" ? "salida" : "merma";

        await pool.query(
            `
            INSERT INTO movimientos 
            (id_producto, nombre_producto, tipo, cantidad, unidad, motivo)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                producto.id_producto,
                producto.nombre,
                tipoMovimiento,
                cantidadRetirar,
                producto.unidad,
                motivoNormalizado
            ]
        );

        if (tipoMovimiento === "merma") {
            await pool.query(
                `
                INSERT INTO mermas 
                (id_producto, nombre_producto, cantidad, unidad, motivo)
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    producto.id_producto,
                    producto.nombre,
                    cantidadRetirar,
                    producto.unidad,
                    motivoNormalizado
                ]
            );
        }

        if (cantidadRetirar === cantidadActual) {
            await pool.query(
                `
                DELETE FROM productos
                WHERE id_producto = ?
                `,
                [id]
            );
        } else {
            const nuevaCantidad = cantidadActual - cantidadRetirar;

            await pool.query(
                `
                UPDATE productos
                SET cantidad = ?
                WHERE id_producto = ?
                `,
                [nuevaCantidad, id]
            );
        }

        res.json({
            ok: true,
            message: "Salida registrada correctamente"
        });

    } catch (error) {
        console.error("Error al registrar salida:", error);

        res.status(500).json({
            ok: false,
            message: "Error al registrar salida",
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
    actualizarProducto,
    registrarMerma,
    eliminarProducto
};