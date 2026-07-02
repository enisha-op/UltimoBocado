const API_URL = "http://localhost:3000/api";

async function validarLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const recordar = document.getElementById("recordar").checked;
    const mensajeLogin = document.getElementById("mensajeLogin");

    if (usuario === "") {
        mensajeLogin.textContent = "Por favor, ingresa tu correo electrónico.";
        mensajeLogin.style.color = "red";
        return;
    }

    if (!usuario.includes("@")) {
        mensajeLogin.textContent = "Ingresa un correo válido. Ejemplo: usuario@correo.com";
        mensajeLogin.style.color = "red";
        return;
    }

    if (clave === "") {
        mensajeLogin.textContent = "Por favor, ingresa tu contraseña.";
        mensajeLogin.style.color = "red";
        return;
    }

    try {
        const respuesta = await fetch(API_URL + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo: usuario,
                contrasena: clave
            })
        });

        const datos = await respuesta.json();

        if (!datos.ok) {
            mensajeLogin.textContent = datos.mensaje;
            mensajeLogin.style.color = "red";
            return;
        }

        if (recordar) {
            localStorage.setItem("usuarioRecordado", usuario);
        } else {
            localStorage.removeItem("usuarioRecordado");
        }

        localStorage.setItem("usuarioActual", JSON.stringify(datos.usuario));

        mensajeLogin.textContent = "";
        mensajeLogin.style.color = "green";

        const mensajeExitoLogin = document.getElementById("mensajeExitoLogin");
        mensajeExitoLogin.style.display = "flex";

        setTimeout(function() {
            window.location.href = "index.html";
        }, 1800);

    } catch (error) {
        mensajeLogin.textContent = "No se pudo conectar con el servidor.";
        mensajeLogin.style.color = "red";
    }
}

function mostrarOcultarClave() {
    const clave = document.getElementById("clave");

    if (clave.type === "password") {
        clave.type = "text";
    } else {
        clave.type = "password";
    }
}

function limpiarMensajeLogin() {
    document.getElementById("mensajeLogin").textContent = "";
}

function recuperarClave(event) {
    event.preventDefault();
    alert("Por ahora, la recuperación de contraseña se realizará contactando a soporte@ultimobocado.pe");
}

window.onload = function() {
    const usuarioGuardado = localStorage.getItem("usuarioRecordado");

    if (usuarioGuardado !== null) {
        document.getElementById("usuario").value = usuarioGuardado;
        document.getElementById("recordar").checked = true;
    }
};


