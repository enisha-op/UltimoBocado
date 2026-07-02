const API_URL = "http://localhost:3000/api";

function obtenerPlatosSeleccionados() {
    const platosMarcados = document.querySelectorAll('input[name="plato"]:checked');
    const platos = [];

    platosMarcados.forEach(function(plato) {
        platos.push({
            nombre: plato.value,
            precio: parseFloat(plato.dataset.precio)
        });
    });

    return platos;
}

function calcularTotal(platos, cantidad) {
    let subtotal = 0;

    platos.forEach(function(plato) {
        subtotal = subtotal + plato.precio;
    });

    return subtotal * cantidad;
}

function actualizarResumenPedido() {
    const cliente = document.getElementById("cliente").value.trim();
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const resumenReserva = document.getElementById("resumenReserva");
    const totalReserva = document.getElementById("totalReserva");

    const platos = obtenerPlatosSeleccionados();
    const total = calcularTotal(platos, cantidad);

    if (platos.length === 0) {
        resumenReserva.textContent = "Aún no has seleccionado platos.";
        totalReserva.textContent = "0.00";
        return;
    }

    const nombresPlatos = platos.map(function(plato) {
        return plato.nombre;
    });

    if (cliente === "") {
        resumenReserva.textContent = "Has seleccionado: " + nombresPlatos.join(", ") + ".";
    } else {
        resumenReserva.textContent = cliente + ", estás reservando: " + nombresPlatos.join(", ") + ".";
    }

    totalReserva.textContent = total.toFixed(2);
}

async function registrarReserva(event) {
    event.preventDefault();

    const cliente = document.getElementById("cliente").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const notas = document.getElementById("notas").value.trim();
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const mensajeReserva = document.getElementById("mensajeReserva");

    const platos = obtenerPlatosSeleccionados();

    if (cliente === "") {
        mensajeReserva.textContent = "Por favor, ingresa tu nombre completo.";
        mensajeReserva.style.color = "red";
        return;
    }

    if (telefono === "") {
        mensajeReserva.textContent = "Por favor, ingresa tu número de teléfono.";
        mensajeReserva.style.color = "red";
        return;
    }

    if (telefono.length !== 9 || isNaN(telefono)) {
        mensajeReserva.textContent = "Ingresa un número de teléfono válido de 9 dígitos.";
        mensajeReserva.style.color = "red";
        return;
    }

    if (platos.length === 0) {
        mensajeReserva.textContent = "Selecciona al menos un plato para continuar con la reserva.";
        mensajeReserva.style.color = "red";
        return;
    }

    const nombresPlatos = platos.map(function(plato) {
        return plato.nombre;
    });

    try {
        const respuesta = await fetch(API_URL + "/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cliente: cliente,
                telefono: telefono,
                notas: notas,
                platos: nombresPlatos,
                cantidad: cantidad
            })
        });

        const datos = await respuesta.json();

        if (!datos.ok) {
            mensajeReserva.textContent = datos.mensaje;
            mensajeReserva.style.color = "red";
            return;
        }

        mensajeReserva.textContent = "Reserva registrada correctamente. Puedes revisarla en Mis Pedidos.";
        mensajeReserva.style.color = "green";

        alert("Reserva generada correctamente. N° de pedido: UB-" + String(datos.id_pedido).padStart(3, "0"));

        document.getElementById("formReserva").reset();
        document.getElementById("resumenReserva").textContent = "Aún no has seleccionado platos.";
        document.getElementById("totalReserva").textContent = "0.00";

        window.location.href = "pedidos.html";
    } catch (error) {
        mensajeReserva.textContent = "No se pudo conectar con el servidor.";
        mensajeReserva.style.color = "red";
    }
}

function cargarPlatoDesdeMenu() {
    const platoSeleccionado = localStorage.getItem("platoSeleccionado");

    if (platoSeleccionado !== null) {
        const platos = document.querySelectorAll('input[name="plato"]');

        platos.forEach(function(plato) {
            if (plato.value === platoSeleccionado) {
                plato.checked = true;
            }
        });

        actualizarResumenPedido();

        localStorage.removeItem("platoSeleccionado");
    }
}

window.addEventListener("load", cargarPlatoDesdeMenu);