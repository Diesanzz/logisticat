const inventoryTable = document.getElementById("inventoryTable");
const productForm = document.getElementById("productForm");
const movementsTable = document.getElementById("movementsTable");

const productModal = document.getElementById("productModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const totalProductos = document.getElementById("totalProductos");
const porCaducar = document.getElementById("porCaducar");
const vencidos = document.getElementById("vencidos");
const mermaTotal = document.getElementById("mermaTotal");

const API_URL = "http://localhost:3000/api/productos";
const REPORTES_URL = "http://localhost:3000/api/reportes/resumen";
const MOVIMIENTOS_URL = "http://localhost:3000/api/movimientos";

let productos = [];
let mermasRegistradas = 0;

openModalBtn.addEventListener("click", () => {
    productModal.classList.add("show");
});

closeModalBtn.addEventListener("click", () => {
    productModal.classList.remove("show");
});

productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
        productModal.classList.remove("show");
    }
});

productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nuevoProducto = {
        nombre: document.getElementById("nombre").value.trim(),
        cantidad: Number(document.getElementById("cantidad").value),
        unidad: document.getElementById("unidad").value,
        fechaIngreso: document.getElementById("fechaIngreso").value,
        fechaCaducidad: document.getElementById("fechaCaducidad").value
    };

    if (new Date(nuevoProducto.fechaCaducidad) < new Date(nuevoProducto.fechaIngreso)) {
        alert("La fecha de caducidad no puede ser menor que la fecha de ingreso.");
        return;
    }

    try {
        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoProducto)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.message || "Error al registrar el producto.");
            return;
        }

        productForm.reset();
        productModal.classList.remove("show");

        await obtenerProductosDesdeAPI();

    } catch (error) {
        console.error("Error al conectar con el backend:", error);
        alert("No se pudo conectar con el servidor. Revisa que el backend esté encendido.");
    }
});

async function obtenerProductosDesdeAPI() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.message || "Error al obtener productos.");
            return;
        }

        productos = datos.productos;
        renderizarInventario();
        await obtenerMovimientosDesdeAPI();

    } catch (error) {
        console.error("Error al obtener productos:", error);
        alert("No se pudo conectar con el backend. Revisa que npm run dev esté activo.");
    }
}

function calcularDiasRestantes(fechaCaducidad) {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad);

    hoy.setHours(0, 0, 0, 0);
    caducidad.setHours(0, 0, 0, 0);

    const diferencia = caducidad - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    return dias;
}

function obtenerEstado(diasRestantes) {
    if (diasRestantes < 0) {
        return {
            texto: "Vencido",
            clase: "expired"
        };
    }

    if (diasRestantes <= 2) {
        return {
            texto: "Por vencer",
            clase: "expired"
        };
    }

    if (diasRestantes >= 3 && diasRestantes <= 7) {
        return {
            texto: "Por caducar",
            clase: "warning"
        };
    }

    return {
        texto: "Activo",
        clase: "active"
    };
}

function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);

    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

function renderizarInventario() {
    inventoryTable.innerHTML = "";

    productos.forEach((producto) => {
        const diasRestantes = calcularDiasRestantes(producto.fechaCaducidad);
        const estado = obtenerEstado(diasRestantes);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.cantidad} ${producto.unidad}</td>
            <td>${formatearFecha(producto.fechaIngreso)}</td>
            <td>${formatearFecha(producto.fechaCaducidad)}</td>
            <td>${diasRestantes}</td>
            <td>
                <span class="status ${estado.clase}">
                    ${estado.texto}
                </span>
            </td>
            <td>
                <button class="merma-btn" onclick="registrarMerma(${producto.id})">
                    Registrar salida
                </button>
            </td>
        `;

        inventoryTable.appendChild(row);
    });

    obtenerResumenDesdeAPI();
}

function actualizarEstadisticas() {
    const total = productos.length;

    const productosPorCaducar = productos.filter((producto) => {
        const dias = calcularDiasRestantes(producto.fechaCaducidad);
        return dias >= 0 && dias <= 7;
    }).length;

    const productosVencidos = productos.filter((producto) => {
        const dias = calcularDiasRestantes(producto.fechaCaducidad);
        return dias < 0;
    }).length;

    const porcentajeMerma = total === 0
        ? 0
        : Math.round((mermasRegistradas / (total + mermasRegistradas)) * 100);

    totalProductos.textContent = total;
    porCaducar.textContent = productosPorCaducar;
    vencidos.textContent = productosVencidos;
    mermaTotal.textContent = `${porcentajeMerma}%`;
}

async function obtenerResumenDesdeAPI() {
    try {
        const respuesta = await fetch(REPORTES_URL);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.message || "Error al obtener el resumen del dashboard.");
            return;
        }

        const resumen = datos.resumen;

        totalProductos.textContent = resumen.totalProductos;
        porCaducar.textContent = resumen.productosPorCaducar;
        vencidos.textContent = resumen.productosVencidos;
        mermaTotal.textContent = `${resumen.porcentajeMerma}%`;
    } catch (error) {
        console.error("Error al obtener resumen:", error);
        alert("No se pudo conectar con la API de reportes.");
    }
}

async function obtenerMovimientosDesdeAPI() {
    try {
        const respuesta = await fetch(MOVIMIENTOS_URL);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.message || "Error al obtener movimientos.");
            return;
        }

        renderizarMovimientos(datos.movimientos);

    } catch (error) {
        console.error("Error al obtener movimientos:", error);
        alert("No se pudo conectar con la API de movimientos.");
    }
}

function renderizarMovimientos(movimientos) {
    movementsTable.innerHTML = "";

    if (movimientos.length === 0) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="S">No hay movimientos registrados todavía.</td>
        `;

        movementsTable.appendChild(row);
        return;
    }

    movimientos.forEach((movimientos) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${movimientos.nombreProducto}</td>
            <td>
                <span class="type-badge ${movimientos.tipo}">
                    ${movimientos.tipo}
                </span>
            </td>
            <td>${movimientos.cantidad} ${movimientos.unidad}</td>
            <td>${movimientos.motivo || "Sin motivo"}</td>
            <td>${formatearFecha(movimientos.fechaMovimiento)}</td>
        `;

        movementsTable.appendChild(row);
    });
}

async function registrarMerma(idProducto) {
    const motivo = prompt("Motivo de la salida: consumo, daño o caducidad");

    if (!motivo) {
        return;
    }

    const motivoNormalizado = motivo.toLowerCase().trim();

    if (
        motivoNormalizado !== "consumo" &&
        motivoNormalizado !== "daño" &&
        motivoNormalizado !== "caducidad"
    ) {
        alert("Motivo inválido. Usa: consumo, daño o caducidad.");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${idProducto}/merma`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                motivo: motivoNormalizado
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.message || "Error al registrar merma.");
            return;
        }

        mermasRegistradas++;

        await obtenerProductosDesdeAPI();

    } catch (error) {
        console.error("Error al registrar merma:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

obtenerProductosDesdeAPI(); 