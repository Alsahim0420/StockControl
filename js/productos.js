// ===== VISTA DE PRODUCTOS =====
let productos = [];
let proveedores = [];
let editandoId = null; // null = agregando uno nuevo

const lista = document.getElementById("lista-productos");
const plantilla = document.getElementById("plantilla-producto");
const buscar = document.getElementById("buscar");
const soloBajos = document.getElementById("solo-bajos");
const dialogo = document.getElementById("dialogo-producto");
const form = document.getElementById("form-producto");

// Stock bajo: llegó al mínimo o menos
function esBajo(producto) {
    return producto.cantidad <= producto.minimo;
}

// ----- Cargar datos -----
async function cargar() {
    const [resProductos, resProveedores] = await Promise.all([
        clienteSupabase.from("productos").select("*, proveedores(nombre)").order("nombre"),
        clienteSupabase.from("proveedores").select("id, nombre").order("nombre"),
    ]);

    if (resProductos.error || resProveedores.error) {
        document.getElementById("resumen").textContent = "No se pudo cargar el inventario. Recarga la página.";
        return;
    }
    productos = resProductos.data;
    proveedores = resProveedores.data;
    pintar();
}

// ----- Dibujar la tabla y el resumen -----
function pintar() {
    const texto = buscar.value.trim().toLowerCase();
    const visibles = productos.filter((p) => {
        const coincide = p.nombre.toLowerCase().includes(texto) || (p.codigo || "").toLowerCase().includes(texto);
        return coincide && (!soloBajos.checked || esBajo(p));
    });

    lista.replaceChildren(...visibles.map(crearFila));

    // Resumen arriba
    const valor = productos.reduce((total, p) => total + p.cantidad * p.precio, 0);
    document.getElementById("resumen").textContent = productos.length === 0
        ? "Tu inventario está vacío."
        : `${productos.length} ${productos.length === 1 ? "producto" : "productos"}. Valor del inventario: ${formatoPrecio.format(valor)}.`;

    // Aviso de stock bajo
    const bajos = productos.filter(esBajo).length;
    document.getElementById("alerta-stock").hidden = bajos === 0;
    document.getElementById("alerta-texto").textContent = bajos === 1
        ? "1 producto tiene stock bajo."
        : `${bajos} productos tienen stock bajo.`;

    document.getElementById("vacio").hidden = productos.length > 0;
    document.getElementById("sin-resultados").hidden = productos.length === 0 || visibles.length > 0;
}

function crearFila(producto) {
    const fila = plantilla.content.firstElementChild.cloneNode(true);
    fila.querySelector(".celda-nombre").textContent = producto.nombre;
    fila.querySelector(".celda-codigo").textContent = producto.codigo || "";
    fila.querySelector(".celda-proveedor").textContent = producto.proveedores ? producto.proveedores.nombre : "—";
    fila.querySelector(".celda-precio").textContent = formatoPrecio.format(producto.precio);
    fila.querySelector(".celda-minimo").textContent = producto.minimo;
    fila.querySelector(".celda-cantidad").textContent = producto.cantidad;

    // Barra: llena cuando hay el triple del mínimo o más
    const tope = Math.max(producto.minimo * 3, 1);
    fila.querySelector(".barra").style.setProperty("--nivel", Math.min(producto.cantidad / tope, 1));
    fila.classList.toggle("bajo", esBajo(producto));

    fila.querySelector('[data-paso="-1"]').disabled = producto.cantidad === 0;
    fila.querySelectorAll(".paso").forEach((boton) => {
        boton.addEventListener("click", () => cambiarCantidad(producto, Number(boton.dataset.paso)));
    });
    fila.querySelector(".editar").addEventListener("click", () => abrirDialogo(producto));
    fila.querySelector(".borrar").addEventListener("click", () => eliminar(producto));
    return fila;
}

// ----- Entradas y salidas: botones + y − -----
async function cambiarCantidad(producto, paso) {
    const nueva = producto.cantidad + paso;
    if (nueva < 0) return;

    const anterior = producto.cantidad;
    producto.cantidad = nueva; // Se ve al instante
    pintar();

    const { error } = await clienteSupabase.from("productos").update({ cantidad: nueva }).eq("id", producto.id);
    if (error) {
        producto.cantidad = anterior;
        pintar();
        avisar("No se pudo guardar la cantidad. Intenta de nuevo.", "error");
    }
}

// ----- Agregar o editar -----
function abrirDialogo(producto = null) {
    editandoId = producto ? producto.id : null;
    document.getElementById("dialogo-titulo").textContent = producto ? "Editar producto" : "Agregar producto";
    form.reset();
    form.querySelector(".mensaje").textContent = "";

    // Opciones de proveedor
    const selector = form.proveedor_id;
    selector.replaceChildren(new Option("Sin proveedor", ""), ...proveedores.map((p) => new Option(p.nombre, p.id)));

    if (producto) {
        form.nombre.value = producto.nombre;
        form.codigo.value = producto.codigo || "";
        form.precio.value = producto.precio;
        form.cantidad.value = producto.cantidad;
        form.minimo.value = producto.minimo;
        selector.value = producto.proveedor_id || "";
    }
    dialogo.showModal();
}

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = form.querySelector('[type="submit"]');
    boton.disabled = true;

    const datos = {
        nombre: form.nombre.value.trim(),
        codigo: form.codigo.value.trim() || null,
        precio: Number(form.precio.value),
        cantidad: Number(form.cantidad.value),
        minimo: Number(form.minimo.value),
        proveedor_id: form.proveedor_id.value || null,
    };

    const consulta = editandoId
        ? clienteSupabase.from("productos").update(datos).eq("id", editandoId)
        : clienteSupabase.from("productos").insert(datos);
    const { error } = await consulta;

    boton.disabled = false;
    if (error) {
        form.querySelector(".mensaje").textContent = "No se pudo guardar: " + error.message;
        form.querySelector(".mensaje").className = "mensaje mensaje-error";
        return;
    }
    dialogo.close();
    avisar(editandoId ? "Producto actualizado." : "Producto agregado.");
    cargar();
});

// ----- Eliminar -----
async function eliminar(producto) {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    const { error } = await clienteSupabase.from("productos").delete().eq("id", producto.id);
    if (error) {
        avisar("No se pudo eliminar el producto.", "error");
        return;
    }
    productos = productos.filter((p) => p.id !== producto.id);
    pintar();
    avisar("Producto eliminado.");
}

// ----- Eventos de la página -----
document.getElementById("nuevo-producto").addEventListener("click", () => abrirDialogo());
document.getElementById("vacio-agregar").addEventListener("click", () => abrirDialogo());
dialogo.querySelector("[data-cerrar]").addEventListener("click", () => dialogo.close());
buscar.addEventListener("input", pintar);
soloBajos.addEventListener("change", pintar);
document.getElementById("ver-bajos").addEventListener("click", () => {
    soloBajos.checked = true;
    pintar();
});

usuarioActual.then(cargar);
