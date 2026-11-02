// ===== INICIO DE SESIÓN Y REGISTRO (index.html) =====

// Muestra un mensaje debajo del formulario (tipo: "error" o "exito")
function mostrarMensaje(formulario, texto, tipo) {
    const mensaje = formulario.querySelector(".mensaje");
    mensaje.textContent = texto;
    mensaje.className = "mensaje mensaje-" + tipo;
}

// Si ya hay una sesión abierta, entra directo a la plataforma
clienteSupabase.auth.getSession().then(({ data }) => {
    if (data.session) {
        window.location.href = "productos.html";
    }
});

// Formulario de inicio de sesión
const formLogin = document.getElementById("form-login");

formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = formLogin.querySelector("button");
    boton.disabled = true;

    const { error } = await clienteSupabase.auth.signInWithPassword({
        email: formLogin.correo.value,
        password: formLogin.clave.value,
    });

    boton.disabled = false;

    if (error) {
        mostrarMensaje(formLogin, "Correo o contraseña incorrectos.", "error");
        return;
    }
    window.location.href = "productos.html";
});

// Formulario de registro
const formRegistro = document.getElementById("form-registro");

formRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = formRegistro.querySelector("button");
    boton.disabled = true;

    const { data, error } = await clienteSupabase.auth.signUp({
        email: formRegistro.correo.value,
        password: formRegistro.clave.value,
        options: {
            // Datos extra que se guardan junto al usuario
            data: {
                nombre: formRegistro.nombre.value,
                negocio: formRegistro.negocio.value,
                plan: formRegistro.plan.value,
            },
        },
    });

    boton.disabled = false;

    if (error) {
        mostrarMensaje(formRegistro, "No se pudo crear la cuenta: " + error.message, "error");
        return;
    }

    // Con la confirmación por correo activada no hay sesión hasta confirmar
    if (!data.session) {
        mostrarMensaje(formRegistro, "¡Cuenta creada! Revisa tu correo para confirmarla y luego inicia sesión.", "exito");
        formRegistro.reset();
        return;
    }
    window.location.href = "productos.html";
});
