const pool = require("../database/connection");

async function obtenerRecomendaciones(req, res) {
    try {
        const [productos] = await pool.query(`
            SELECT 
                id_producto AS id,
                nombre,
                cantidad,
                unidad,
                fecha_caducidad AS fechaCaducidad,
                DATEDIFF(fecha_caducidad, CURDATE()) AS diasRestantes
            FROM productos
        `);

        const [mermas] = await pool.query(`
            SELECT 
                id_merma AS id,
                nombre_producto AS nombreProducto,
                cantidad,
                unidad,
                motivo,
                fecha_registro AS fechaRegistro
            FROM mermas
            WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        const [movimientos] = await pool.query(`
            SELECT 
                id_movimiento AS id,
                nombre_producto AS nombreProducto,
                tipo,
                cantidad,
                unidad,
                motivo,
                fecha_movimiento AS fechaMovimiento
            FROM movimientos
            WHERE fecha_movimiento >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        const recomendaciones = [];

        const productosVencidos = productos.filter((producto) => {
            return producto.diasRestantes < 0;
        });

        const productosCriticos = productos.filter((producto) => {
            return producto.diasRestantes >= 0 && producto.diasRestantes <= 2;
        });

        const productosPorCaducar = productos.filter((producto) => {
            return producto.diasRestantes >= 3 && producto.diasRestantes <= 7;
        });

        if (productosVencidos.length > 0) {
            recomendaciones.push({
                tipo: "error",
                icono: "⚠️",
                titulo: "Productos vencidos detectados",
                mensaje: `Hay ${productosVencidos.length} producto(s) vencido(s). Registra su salida por caducidad para evitar que se usen por error.`
            });
        }

        if (productosCriticos.length > 0) {
            recomendaciones.push({
                tipo: "warning",
                icono: "⏰",
                titulo: "Productos críticos por caducar",
                mensaje: `${productosCriticos.length} producto(s) caducan en 48 horas o menos. Prioriza su uso o revisa si deben retirarse.`
            });
        }

        if (productosPorCaducar.length > 0) {
            recomendaciones.push({
                tipo: "warning",
                icono: "📦",
                titulo: "Prioriza productos próximos a vencer",
                mensaje: `${productosPorCaducar.length} producto(s) vencen en los próximos 7 días. Úsalos primero para reducir mermas.`
            });
        }

        if (mermas.length >= 5) {
            recomendaciones.push({
                tipo: "error",
                icono: "🗑️",
                titulo: "Merma elevada este mes",
                mensaje: `Se registraron ${mermas.length} mermas en los últimos 30 días. Revisa compras, almacenamiento y rotación de productos.`
            });
        }

        const mermasPorProducto = {};

        mermas.forEach((merma) => {
            const nombre = merma.nombreProducto;

            if (!mermasPorProducto[nombre]) {
                mermasPorProducto[nombre] = 0;
            }

            mermasPorProducto[nombre]++;
        });

        const productoConMasMermas = Object.entries(mermasPorProducto)
            .sort((a, b) => b[1] - a[1])[0];

        if (productoConMasMermas && productoConMasMermas[1] >= 2) {
            recomendaciones.push({
                tipo: "warning",
                icono: "📉",
                titulo: "Producto con mermas frecuentes",
                mensaje: `${productoConMasMermas[0]} aparece con ${productoConMasMermas[1]} mermas recientes. Considera comprar menor cantidad o revisar su almacenamiento.`
            });
        }

        const salidasConsumo = movimientos.filter((movimiento) => {
            return movimiento.tipo === "salida";
        });

        if (salidasConsumo.length >= 5 && productosVencidos.length === 0) {
            recomendaciones.push({
                tipo: "success",
                icono: "✅",
                titulo: "Buena rotación de inventario",
                mensaje: `Se registraron ${salidasConsumo.length} salidas por consumo en los últimos 30 días. El inventario está teniendo movimiento.`
            });
        }

        if (productos.length === 0) {
            recomendaciones.push({
                tipo: "info",
                icono: "📋",
                titulo: "Inventario vacío",
                mensaje: "Agrega productos para que Logisticat pueda generar recomendaciones útiles."
            });
        }

        if (recomendaciones.length === 0) {
            recomendaciones.push({
                tipo: "success",
                icono: "🌿",
                titulo: "Inventario estable",
                mensaje: "No hay productos vencidos ni alertas importantes. El inventario se encuentra en buen estado."
            });
        }

        res.json({
            ok: true,
            recomendaciones
        });

    } catch (error) {
        console.error("Error al obtener recomendaciones:", error);

        res.status(500).json({
            ok: false,
            message: "Error al obtener recomendaciones",
            error: error.message
        });
    }
}

module.exports = {
    obtenerRecomendaciones
};