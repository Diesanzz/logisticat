const inventoryTable = document.getElementById("inventoryTable");
const productForm = document.getElementById("productForm");

const productModal = document.getElementById("productModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const totalProductos = document.getElementById("totalProductos");
const porCaducar = document.getElementById("porCaducar");
const vencidos = document.getElementById("vencidos");
const mermaTotal = document.getElementById("mermaTotal");

const API_URL = "http://localhost:3000/api/productos";

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

    } catch (error) {
        console.error("Error al obtener productos:", error);
        alert("No se pudo conectar con el backend. Revisa que npm run dev esté activo.");
    }
}

function calcularDiasRestantes(fechaCaducidad) {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad + "T00:00:00");

    hoy.setHours(0, 0, 0, 0);

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
    const partes = fecha.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
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
                    Registrar merma
                </button>
            </td>
        `;

        inventoryTable.appendChild(row);
    });

    actualizarEstadisticas();
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

async function registrarMerma(idProducto) {
    const motivo = prompt("Motivo de la merma: consumo, daño o caducidad");

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