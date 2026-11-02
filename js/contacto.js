// ===== FORMULARIO DE CONTACTO =====
const formContacto = document.getElementById("form-contacto");

formContacto.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = formContacto.querySelector("button");
    const mensaje = formContacto.querySelector(".mensaje");
    boton.disabled = true;

    const { error } = await clienteSupabase.from("mensajes_contacto").insert({
        nombre: formContacto.nombre.value.trim(),
        correo: formContacto.correo.value.trim(),
        motivo: formContacto.motivo.value,
        mensaje: formContacto.mensaje.value.trim(),
    });

    boton.disabled = false;

    if (error) {
        mensaje.textContent = "No se pudo enviar el mensaje. Intenta de nuevo en unos minutos.";
        mensaje.className = "mensaje mensaje-error";
        return;
    }
    mensaje.textContent = "Mensaje enviado. Te respondemos al correo que dejaste.";
    mensaje.className = "mensaje mensaje-exito";
    formContacto.reset();
});
