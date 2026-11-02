// ===== VISTA DE PROVEEDORES =====
let proveedores = [];
let editandoId = null; // null = agregando uno nuevo

const lista = document.getElementById("lista-proveedores");
const plantilla = document.getElementById("plantilla-proveedor");
const dialogo = document.getElementById("dialogo-proveedor");
const form = document.getElementById("form-proveedor");

// ----- Cargar datos (con cuántos productos tiene cada uno) -----
async function cargar() {
    const { data, error } = await clienteSupabase
        .from("proveedores")
        .select("*, productos(count)")
        .order("nombre");

    if (error) {
        document.getElementById("resumen").textContent = "No se pudieron cargar los proveedores. Recarga la página.";
        return;
    }
    proveedores = data;
    pintar();
}

// ----- Dibujar la tabla -----
function pintar() {
    lista.replaceChildren(...proveedores.map(crearFila));

    document.getElementById("resumen").textContent = proveedores.length === 0
        ? "Aún no has registrado proveedores."
        : `${proveedores.length} ${proveedores.length === 1 ? "proveedor" : "proveedores"} registrados.`;
    document.getElementById("vacio").hidden = proveedores.length > 0;
}

function crearFila(proveedor) {
    const fila = plantilla.content.firstElementChild.cloneNode(true);
    fila.querySelector(".celda-nombre").textContent = proveedor.nombre;
    fila.querySelector(".celda-contacto").textContent = proveedor.contacto || "";

    // Teléfono y correo como enlaces para llamar o escribir
    ponerEnlace(fila.querySelector(".celda-telefono"), proveedor.telefono, "tel:");
    ponerEnlace(fila.querySelector(".celda-correo"), proveedor.correo, "mailto:");

    const dia = fila.querySelector(".dia");
    dia.textContent = proveedor.dia_entrega || "Sin día fijo";
    dia.classList.toggle("dia-vacio", !proveedor.dia_entrega);

    // En celular se lee "2 productos"; en pantalla grande, solo el número
    const cuantos = proveedor.productos[0].count;
    const celdaProductos = fila.querySelector(".celda-productos");
    celdaProductos.textContent = cuantos;
    const palabra = document.createElement("span");
    palabra.className = "solo-movil";
    palabra.textContent = cuantos === 1 ? " producto" : " productos";
    celdaProductos.appendChild(palabra);
    fila.querySelector(".editar").addEventListener("click", () => abrirDialogo(proveedor));
    fila.querySelector(".borrar").addEventListener("click", () => eliminar(proveedor));
    return fila;
}

function ponerEnlace(celda, valor, prefijo) {
    if (!valor) {
        celda.textContent = "—";
        return;
    }
    const enlace = document.createElement("a");
    enlace.href = prefijo + valor.replace(/\s/g, "");
    enlace.textContent = valor;
    celda.appendChild(enlace);
}

// ----- Agregar o editar -----
function abrirDialogo(proveedor = null) {
    editandoId = proveedor ? proveedor.id : null;
    document.getElementById("dialogo-titulo").textContent = proveedor ? "Editar proveedor" : "Agregar proveedor";
    form.reset();
    form.querySelector(".mensaje").textContent = "";

    if (proveedor) {
        form.nombre.value = proveedor.nombre;
        form.contacto.value = proveedor.contacto || "";
        form.telefono.value = proveedor.telefono || "";
        form.correo.value = proveedor.correo || "";
        form.dia_entrega.value = proveedor.dia_entrega || "";
    }
    dialogo.showModal();
}

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = form.querySelector('[type="submit"]');
    boton.disabled = true;

    const datos = {
        nombre: form.nombre.value.trim(),
        contacto: form.contacto.value.trim() || null,
        telefono: form.telefono.value.trim() || null,
        correo: form.correo.value.trim() || null,
        dia_entrega: form.dia_entrega.value || null,
    };

    const consulta = editandoId
        ? clienteSupabase.from("proveedores").update(datos).eq("id", editandoId)
        : clienteSupabase.from("proveedores").insert(datos);
    const { error } = await consulta;

    boton.disabled = false;
    if (error) {
        form.querySelector(".mensaje").textContent = "No se pudo guardar: " + error.message;
        form.querySelector(".mensaje").className = "mensaje mensaje-error";
        return;
    }
    dialogo.close();
    avisar(editandoId ? "Proveedor actualizado." : "Proveedor agregado.");
    cargar();
});

// ----- Eliminar -----
async function eliminar(proveedor) {
    const cuantos = proveedor.productos[0].count;
    const extra = cuantos > 0 ? ` Sus ${cuantos} productos quedarán sin proveedor.` : "";
    if (!confirm(`¿Eliminar a "${proveedor.nombre}"?${extra}`)) return;

    const { error } = await clienteSupabase.from("proveedores").delete().eq("id", proveedor.id);
    if (error) {
        avisar("No se pudo eliminar el proveedor.", "error");
        return;
    }
    proveedores = proveedores.filter((p) => p.id !== proveedor.id);
    pintar();
    avisar("Proveedor eliminado.");
}

// ----- Eventos de la página -----
document.getElementById("nuevo-proveedor").addEventListener("click", () => abrirDialogo());
document.getElementById("vacio-agregar").addEventListener("click", () => abrirDialogo());
dialogo.querySelector("[data-cerrar]").addEventListener("click", () => dialogo.close());

usuarioActual.then(cargar);
