// ===== PROTECCIÓN DE LAS PÁGINAS INTERNAS =====
// Si no hay sesión, devuelve al usuario a la página de inicio.
// "usuarioActual" se resuelve con el usuario para que cada página cargue sus datos.
const usuarioActual = clienteSupabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
        window.location.href = "index.html#acceso";
        return new Promise(() => {}); // Nunca sigue: la página se está yendo
    }
    const usuario = data.session.user;

    // Nombre del negocio en la barra superior
    const negocio = document.getElementById("usuario-negocio");
    if (negocio) {
        negocio.textContent = usuario.user_metadata.negocio || usuario.email;
    }
    return usuario;
});

// Botón "Cerrar sesión" del menú
document.getElementById("cerrar-sesion").addEventListener("click", async (evento) => {
    evento.preventDefault();
    await clienteSupabase.auth.signOut();
    window.location.href = "index.html";
});

// ===== AYUDAS COMPARTIDAS =====

// 30000 -> "$ 30.000"
const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

// Muestra un aviso corto abajo de la pantalla
function avisar(texto, tipo = "exito") {
    let aviso = document.getElementById("aviso");
    if (!aviso) {
        aviso = document.createElement("p");
        aviso.id = "aviso";
        aviso.setAttribute("role", "status");
        document.body.appendChild(aviso);
    }
    aviso.textContent = texto;
    aviso.className = "aviso aviso-" + tipo + " visible";
    clearTimeout(aviso.temporizador);
    aviso.temporizador = setTimeout(() => aviso.classList.remove("visible"), 3000);
}
