// ===== PESTAÑAS DE ACCESO Y BOTÓN "VER CONTRASEÑA" =====
const pestanas = {
    login: { tab: document.getElementById("tab-login"), panel: document.getElementById("form-login") },
    registro: { tab: document.getElementById("tab-registro"), panel: document.getElementById("form-registro") },
};

// Muestra un formulario y oculta el otro
function mostrarPestana(nombre) {
    for (const clave in pestanas) {
        const activa = clave === nombre;
        pestanas[clave].tab.setAttribute("aria-selected", activa);
        pestanas[clave].tab.tabIndex = activa ? 0 : -1;
        pestanas[clave].panel.hidden = !activa;
    }
}

pestanas.login.tab.addEventListener("click", () => mostrarPestana("login"));
pestanas.registro.tab.addEventListener("click", () => mostrarPestana("registro"));

// Flechas izquierda/derecha para moverse entre pestañas con el teclado
document.querySelector(".pestanas").addEventListener("keydown", (evento) => {
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
    const siguiente = pestanas.login.tab.tabIndex === 0 ? "registro" : "login";
    mostrarPestana(siguiente);
    pestanas[siguiente].tab.focus();
});

// Los enlaces #registro y #acceso abren la pestaña que corresponde
function revisarEnlace() {
    if (location.hash === "#registro") {
        mostrarPestana("registro");
        document.getElementById("acceso").scrollIntoView();
    } else if (location.hash === "#acceso") {
        mostrarPestana("login");
    }
}

window.addEventListener("hashchange", revisarEnlace);
revisarEnlace();

// Botón para mostrar u ocultar la contraseña
document.querySelectorAll(".ver-clave").forEach((boton) => {
    boton.addEventListener("click", () => {
        const campo = boton.previousElementSibling;
        const oculta = campo.type === "password";
        campo.type = oculta ? "text" : "password";
        boton.setAttribute("aria-pressed", oculta);
        boton.setAttribute("aria-label", oculta ? "Ocultar contraseña" : "Mostrar contraseña");
    });
});
