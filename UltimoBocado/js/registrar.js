const API_URL = "http://localhost:3000/api";

async function registrarUsuario() {
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const confirmar = document.getElementById("confirmar").value.trim();
    const terminos = document.getElementById("terminos").checked;

    const mensajeRegistro = document.getElementById("mensajeRegistro");
    const mensajeExitoRegistro = document.getElementById("mensajeExitoRegistro");
    const btnRegistrar = document.getElementById("btnRegistrar");

    mensajeRegistro.textContent = "";
    mensajeExitoRegistro.style.display = "none";

    if (nombre === "") {
        mensajeRegistro.textContent = "Por favor, ingresa tu nombre completo.";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (nombre.length < 5) {
        mensajeRegistro.textContent = "El nombre debe tener al menos 5 caracteres.";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (correo === "") {
        mensajeRegistro.textContent = "Por favor, ingresa tu correo electrónico.";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (!correo.includes("@") || !correo.includes(".")) {
        mensajeRegistro.textContent = "Ingresa un correo válido. Ejemplo: usuario@correo.com";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (contrasena === "") {
        mensajeRegistro.textContent = "Por favor, crea una contraseña.";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (contrasena.length < 6) {
        mensajeRegistro.textContent = "La contraseña debe tener al menos 6 caracteres.";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (confirmar === "") {
        mensajeRegistro.textContent = "Confirma tu contraseña para continuar.";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (contrasena !== confirmar) {
        mensajeRegistro.textContent = "Las contraseñas no coinciden.";
        mensajeRegistro.style.color = "red";
        return;
    }

    if (!terminos) {
        mensajeRegistro.textContent = "Marca la opción de aceptación para completar tu registro.";
        mensajeRegistro.style.color = "red";
        return;
    }

    try {
        const respuesta = await fetch(API_URL + "/registrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: nombre,
                correo: correo,
                contrasena: contrasena
            })
        });

        const datos = await respuesta.json();

        if (!datos.ok) {
            mensajeRegistro.textContent = datos.mensaje;
            mensajeRegistro.style.color = "red";
            mensajeExitoRegistro.style.display = "none";
            return;
        }

        mensajeRegistro.textContent = "";

        mensajeExitoRegistro.style.display = "flex";
        btnRegistrar.style.display = "none";

        document.getElementById("formRegistro").reset();
        document.getElementById("seguridadClave").textContent = "";

    } catch (error) {
        mensajeRegistro.textContent = "No se pudo conectar con el servidor.";
        mensajeRegistro.style.color = "red";
        mensajeExitoRegistro.style.display = "none";
    }
}

function revisarSeguridadClave() {
    const contrasena = document.getElementById("contrasena").value;
    const seguridadClave = document.getElementById("seguridadClave");
    const mensajeRegistro = document.getElementById("mensajeRegistro");

    mensajeRegistro.textContent = "";

    if (contrasena.length === 0) {
        seguridadClave.textContent = "";
        return;
    }

    if (contrasena.length < 6) {
        seguridadClave.textContent = "Seguridad de contraseña: baja";
        seguridadClave.style.color = "red";
    } else if (contrasena.length < 10) {
        seguridadClave.textContent = "Seguridad de contraseña: media";
        seguridadClave.style.color = "#d86b1f";
    } else {
        seguridadClave.textContent = "Seguridad de contraseña: alta";
        seguridadClave.style.color = "green";
    }
}

function mostrarOcultarContrasenas() {
    const contrasena = document.getElementById("contrasena");
    const confirmar = document.getElementById("confirmar");

    if (contrasena.type === "password") {
        contrasena.type = "text";
        confirmar.type = "text";
    } else {
        contrasena.type = "password";
        confirmar.type = "password";
    }
}

function limpiarMensajeRegistro() {
    const mensajeRegistro = document.getElementById("mensajeRegistro");

    mensajeRegistro.textContent = "";
}