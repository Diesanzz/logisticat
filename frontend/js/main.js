const inventoryTable = document.getElementById("inventoryTable");
const productForm = document.getElementById("productForm");

const productModal = document.getElementById("productModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const totalProductos = document.getElementById("totalProductos");
const porCaducar = document.getElementById("porCaducar");
const vencidos = document.getElementById("vencidos");
const mermaTotal = document.getElementById("mermaTotal");

let productos = [
    {
        nombre: "Café Molido",
        cantidad: 14,
        unidad: "kg",
        fechaIngreso: "2026-03-10",
        fechaCaducidad: "2026-09-10"
    },
    {
        nombre: "Leche Deslactosada",
        cantidad: 23,
        unidad: "L",
        fechaIngreso: "2026-03-14",
        fechaCaducidad: "2026-09-20"
    },
    {
        nombre: "Queso tipo Philadelphia",
        cantidad: 7,
        unidad: "pieza",
        fechaIngreso: "2026-03-01",
        fechaCaducidad: "2026-03-18"
    },
    {
        nombre: "Polvo de chocolate para bebida",
        cantidad: 4,
        unidad: "kg",
        fechaIngreso: "2026-01-05",
        fechaCaducidad: "2027-03-05"
    },
    {
        nombre: "Jamón de pierna Kirkland",
        cantidad: 5,
        unidad: "kg",
        fechaIngreso: "2026-03-12",
        fechaCaducidad: "2026-03-14"
    },
    {
        nombre: "Crema batida Lyncott",
        cantidad: 3,
        unidad: "ml",
        fechaIngreso: "2026-03-08",
        fechaCaducidad: "2026-03-10"
    },
];

let mermasRegistradas = 0;

openModalBtn.addEventListener("click", () => {
    productModal.classList.add("show");
});

closeModalBtn.addEventListener("click", () => {
    productModal.classList.remove("show");
});

productModal.addEventListener("click", (event) =>{
    if (event.target === productModal) {
        productModal.classList.remove("show");
    }
});

productForm.addEventListener("submit", (event) => {
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

    productos.push(nuevoProducto);

    console.log("Producto agregado:", nuevoProducto);
    console.log("Lista actual:", productos);


    productForm.reset();
    productModal.classList.remove("show");

    renderizarInventario();
});

function calcularDiasRestantes(fechaCaducidad) {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad + "T00:00:00");

    hoy.setHours(0, 0, 0, 0);

    const diferencia = caducidad - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    return dias;
}

function obtenerEstado (diasRestantes) {
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

    const productosOrdenados = [...productos].sort((a, b) => {
        return new Date(a.fechaCaducidad) - new Date (b.fechaCaducidad);
    });

    productosOrdenados.forEach((productos, index) => {
        const diasRestantes = calcularDiasRestantes(productos.fechaCaducidad);
        const estado = obtenerEstado(diasRestantes);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${productos.nombre}</td>
            <td>${productos.cantidad} ${productos.unidad}</td>
            <td>${formatearFecha(productos.fechaIngreso)}</td>
            <td>${formatearFecha(productos.fechaCaducidad)}</td>
            <td>${diasRestantes}</td>
            <td>
                <span class="status ${estado.clase}">
                    ${estado.texto}
                </span>
            </td>
            <td>
                <button class="merma-btn" onclick="registrarMerma(${index})">>
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

    const porcentajeMerma = total === 0 ? 0 : Math.round((mermasRegistradas / (total + mermasRegistradas)) * 100);

    totalProductos.textContent = total;
    porCaducar.textContent = productosPorCaducar;
    vencidos.textContent = productosVencidos;
    mermaTotal.textContent = `${porcentajeMerma}%`;
}

function registrarMerma(index) {
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

    productos.splice(index, 1);
    mermasRegistradas++;

    renderizarInventario();
}

renderizarInventario();