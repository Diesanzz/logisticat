const inventoryTable = document.getElementById("inventoryTable");
const productForm = document.getElementById("productForm");
const movementsTable = document.getElementById("movementsTable");
const toastContainer = document.getElementById("toastContainer");
const alertsTable = document.getElementById("alertsTable");

const productModal = document.getElementById("productModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const movementModal = document.getElementById("movementModal");
const movementForm = document.getElementById("movementForm");
const closeMovementModalBtn = document.getElementById("closeMovementModalBtn");
const motivoSalida = document.getElementById("motivoSalida");

const totalProductos = document.getElementById("totalProductos");
const porCaducar = document.getElementById("porCaducar");
const vencidos = document.getElementById("vencidos");
const mermaTotal = document.getElementById("mermaTotal");
const productosActivosReporte = document.getElementById("productosActivosReporte");
const productosPorCaducarReporte = document.getElementById("productosPorCaducarReporte");
const productosVencidosReporte = document.getElementById("productosVencidosReporte");
const porcentajeMermaReporte = document.getElementById("porcentajeMermaReporte");
const barraMerma = document.getElementById("barraMerma");
const barraMermaTexto = document.getElementById("barraMermaTexto")

const API_URL = "http://localhost:3000/api/productos";
const REPORTES_URL = "http://localhost:3000/api/reportes/resumen";
const MOVIMIENTOS_URL = "http://localhost:3000/api/movimientos";
const ALERTAS_URL = "http://localhost:3000/api/alertas/caducidad";

let productos = [];
let mermasRegistradas = 0;
let productoEditandoId = null;
let productoSalidaId = null;

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

searchInput.addEventListener("input", () => {
    renderizarInventario();    
});

statusFilter.addEventListener("change", () => {
    renderizarInventario();
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
        mostrarToast("La fecha de caducidad no puede ser menor que la fecha de ingreso.", "error");
        return;
    }

    try {
        const url = productoEditandoId
            ? `${API_URL}/${productoEditandoId}`
            : API_URL;

        const metodo = productoEditandoId ? "PUT" : "POST";

        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoProducto)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarToast(datos.message || "Error al registrar el producto.", "error");
            return;
        }

        const mensajeExito = productoEditandoId
            ? "Producto actualizado correctamente."
            : "Producto registrado correctamente.";

        productForm.reset();
        productoEditandoId = null;
        productModal.classList.remove("show");

        mostrarToast(mensajeExito, "success");

        await obtenerProductosDesdeAPI();

    } catch (error) {
        console.error("Error al conectar con el backend:", error);
        mostrarToast("No se pudo conectar con el servidor. Revisa que el backend esté encendido.", "error");
    }
});

closeMovementModalBtn.addEventListener("click", () => {
    movementModal.classList.remove("show");
    productoSalidaId = null;
});

movementModal.addEventListener("click", (event) => {
    if (event.target === movementModal) {
        movementModal.classList.remove("show");
        productoSalidaId = null;
    }
});

movementForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await confirmarSalida();
})

function mostrarToast(mensaje, tipo = "info") {

    console.log("TOAST LLAMADO:", mensaje, tipo);
    
    const toast = document.createElement("div");

    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

async function obtenerProductosDesdeAPI() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarToast(datos.message || "Error al obtener productos.", "error");
            return;
        }

        productos = datos.productos;
        renderizarInventario();
        await obtenerAlertasDesdeAPI();
        await obtenerMovimientosDesdeAPI();

    } catch (error) {
        console.error("Error al obtener productos:", error);
        mostrarToast("No se pudo conectar con el backend. Revisa que npm run dev esté activo.", "error");
    }
}

async function obtenerAlertasDesdeAPI() {
    try {
        const respuesta = await fetch(ALERTAS_URL);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarToast(datos.message || "Error al obtener alertas.", "error");
            return;
        }

        renderizarAlertas(datos.alertas);

    } catch (error) {
        console.error("Error al obtener alertas:", error);
        mostrarToast("No se pudo conectar con la API de alertas.", "error");
    }
}

function renderizarAlertas(alertas) {
    alertsTable.innerHTML = "";

    if (alertas.length === 0) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="5" class="empty-alerts">
                No hay productos próximos a caducar.
            </td>
        `;

        alertsTable.appendChild(row);
        return;
    }

    alertas.forEach((producto) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.cantidad} ${producto.unidad}</td>
            <td>${formatearFecha(producto.fechaCaducidad)}</td>
            <td>${producto.diasRestantes}</td>
            <td>
                <span class="alert-badge ${producto.nivelAlerta}">
                    ${formatearNivelAlerta(producto.nivelAlerta)}
                </span>
            </td>
        `;

        alertsTable.appendChild(row);
    });
}

function formatearNivelAlerta(nivel) {
    if (nivel === "vencido") {
        return "Vencido";
    }

    if (nivel === "critico") {
        return "Crítico";
    }

    if (nivel === "advertencia") {
        return "Advertencia";
    }

    return "Vigente";
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

function obtenerClaveEstado(diasRestantes) {
    if (diasRestantes < 0) {
        return "vencido";
    }

    if (diasRestantes <= 7) {
        return "por-caducar";
    }

    return "activo";
}

function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);

    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

function convertirFechaParaInput(fecha) {
    const fechaObj = new Date(fecha);

    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function renderizarInventario() {
    inventoryTable.innerHTML = "";

    const busqueda = searchInput.value.toLowerCase().trim();
    const filtroEstado = statusFilter.value;

    const productosFiltrados = productos.filter((producto) => {
        const diasRestantes = calcularDiasRestantes(producto.fechaCaducidad);
        const claveEstado = obtenerClaveEstado(diasRestantes);

        const coincideBusqueda = producto.nombre
            .toLowerCase()
            .includes(busqueda);

        const coincideEstado = filtroEstado === "todos" || filtroEstado === claveEstado;

        return coincideBusqueda && coincideEstado;
    });

    if (productosFiltrados.length === 0) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="7">No se encontraron productos con esos filtros.</td>
        `;

        inventoryTable.appendChild(row);
        obtenerResumenDesdeAPI();
        return;
    }

    productosFiltrados.forEach((producto) => {
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
                <div class="action-buttons">
                    <button class="edit-btn" onclick="abrirFormularioEdicion(${producto.id})">
                        Editar
                    </button>

                    <button class="merma-btn" onclick="registrarMerma(${producto.id})">
                        Registrar salida
                    </button>
                </div>
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
            mostrarToast(datos.message || "Error al obtener el resumen del dashboard.", "error");
            return;
        }

        const resumen = datos.resumen;
        const productosActivos = resumen.totalProductos - resumen.productosPorCaducar - resumen.productosVencidos;

        totalProductos.textContent = resumen.totalProductos;
        porCaducar.textContent = resumen.productosPorCaducar;
        vencidos.textContent = resumen.productosVencidos;
        mermaTotal.textContent = `${resumen.porcentajeMerma}%`;
        productosActivosReporte.textContent = productosActivos;
        productosPorCaducarReporte.textContent = resumen.productosPorCaducar;
        productosVencidosReporte.textContent = resumen.productosVencidos;
        porcentajeMermaReporte.textContent = `${resumen.porcentajeMerma}%`;

        barraMerma.style.width = `${resumen.porcentajeMerma}%`;
        barraMermaTexto.textContent = `${resumen.porcentajeMerma}%`;
    } catch (error) {
        console.error("Error al obtener resumen:", error);
        mostrarToast("No se pudo conectar con la API de reportes.", "error");
    }
}

async function obtenerMovimientosDesdeAPI() {
    try {
        const respuesta = await fetch(MOVIMIENTOS_URL);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarToast(datos.message || "Error al obtener movimientos.", "error");
            return;
        }

        renderizarMovimientos(datos.movimientos);

    } catch (error) {
        console.error("Error al obtener movimientos:", error);
        mostrarToast("No se pudo conectar con la API de movimientos.", "error");
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

function abrirFormularioEdicion(idProducto) {
    const producto = productos.find((item) => item.id === idProducto);

    if (!producto) {
        mostrarToast("Producto no encontrado.", "error");
        return;
    }

    productoEditandoId = idProducto;

    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("cantidad").value = producto.cantidad;
    document.getElementById("unidad").value = producto.unidad;
    document.getElementById("fechaIngreso").value = convertirFechaParaInput(producto.fechaIngreso);
    document.getElementById("fechaCaducidad").value = convertirFechaParaInput(producto.fechaCaducidad);

    productModal.classList.add("show");
}

function registrarMerma(idProducto) {
    productoSalidaId = idProducto;
    motivoSalida.value = "";
    movementModal.classList.add("show");
}

async function confirmarSalida() {
    const motivo = motivoSalida.value;

    if (!motivo) {
        mostrarToast("Selecciona un motivo de salida.", "warning");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${productoSalidaId}/merma`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                motivo
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarToast(datos.message || "Error al registrar salida.", "error");
            return;
        }

        movementForm.reset();
        productoSalidaId = null;
        movementModal.classList.remove("show");

        mostrarToast("Salida registrada correctamente.", "success");

        await obtenerProductosDesdeAPI();

    } catch (error) {
        console.error("Error al registrar salida:", error);
        mostrarToast("No se pudo conectar con el servidor.", "error");
    }
}

obtenerProductosDesdeAPI(); 