let productos = [
    {
        id: 1,
        nombre: "Leche Deslactosada",
        cantidad: 23,
        unidad: "L",
        fechaIngreso: "2026-06-08",
        fechaCaducidad: "2026-06-10"
    },
    {
        id: 2,
        nombre: "Queso tipo Philadelphia",
        cantidad: 7,
        unidad: "pieza",
        fechaIngreso: "2026-06-07",
        fechaCaducidad: "2026-06-14"
    },
    {
        id: 3,
        nombre: "Café Molido",
        cantidad: 14,
        unidad: "kg",
        fechaIngreso: "2026-06-01",
        fechaCaducidad: "2026-09-10"
    }
];

let mermas = [];
let siguienteId = 4;

function obtenerProductos(req, res) {
    const productosOrdenados = [...productos].sort((a, b) => {
        return new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad);
    });

    res.json({
        ok: true,
        productos: productosOrdenados
    });
}

function crearProducto(req, res) {
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

    const nuevoProducto = {
        id: siguienteId++,
        nombre,
        cantidad: Number(cantidad),
        unidad,
        fechaIngreso,
        fechaCaducidad
    };

    productos.push(nuevoProducto);

    res.status(201).json({
        ok: true,
        message: "Producto creado correctamente",
        producto: nuevoProducto
    });
}

function registrarMerma(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body;

    const motivosValidos = ["consumo", "daño", "caducidad"];

    if (!motivo || !motivosValidos.includes(motivo.toLowerCase().trim())) {
        return res.status(400).json({
            ok: false,
            message: "Motivo inválido. Usa: consumo, daño o caducidad"
        });
    }

    const productoEncontrado = productos.find((producto) => producto.id === id);

    if (!productoEncontrado) {
        return res.status(404).json({
            ok: false,
            message: "Producto no encontrado"
        });
    }

    const nuevaMerma = {
        id: mermas.length + 1,
        productoId: productoEncontrado.id,
        producto: productoEncontrado.nombre,
        motivo: motivo.toLowerCase().trim(),
        fechaRegistro: new Date().toISOString()
    };

    mermas.push(nuevaMerma);
    productos = productos.filter((producto) => producto.id !== id);

    res.json({
        ok: true,
        message: "Merma registrada correctamente",
        merma: nuevaMerma
    });
}

function eliminarProducto(req, res) {
    const id = Number(req.params.id);

    const existeProducto = productos.some((producto) => producto.id === id);

    if (!existeProducto) {
        return res.status(404).json({
            ok: false,
            message: "Producto no encontrado"
        });
    }

    productos = productos.filter((producto) => producto.id !== id);

    res.json({
        ok: true,
        message: "Producto eliminado correctamente"
    });
}

module.exports = {
    obtenerProductos,
    crearProducto,
    registrarMerma,
    eliminarProducto
};