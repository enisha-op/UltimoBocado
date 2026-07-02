const API_URL = "http://localhost:3000/api";
let pedidosCargados = [];

async function cargarPedidosDesdeBD() {
    const mensajePedidos = document.getElementById("mensajePedidos");

    try {
        const respuesta = await fetch(API_URL + "/pedidos");
        const datos = await respuesta.json();

        pedidosCargados = datos.pedidos;
        mostrarPedidos(pedidosCargados);
    } catch (error) {
        mensajePedidos.textContent = "No se pudieron cargar los pedidos desde la base de datos.";
        mensajePedidos.style.color = "red";
    }
}

function obtenerClaseEstado(estado) {
    if (estado === "En proceso") {
        return "status-pill status-pending";
    } else if (estado === "Listo para recojo") {
        return "status-pill status-ready";
    } else {
        return "status-pill status-done";
    }
}

function mostrarPedidos(listaPedidos) {
    const tablaPedidos = document.getElementById("tablaPedidos");
    const mensajePedidos = document.getElementById("mensajePedidos");
    const resumenPedidos = document.getElementById("resumenPedidos");

    tablaPedidos.innerHTML = "";

    if (listaPedidos.length === 0) {
        tablaPedidos.innerHTML = `
            <tr>
                <td colspan="7">Aún no tienes reservas registradas.</td>
            </tr>
        `;

        mensajePedidos.textContent = "Cuando confirmes una reserva desde Mi Carrito, aparecerá en esta tabla.";
        mensajePedidos.style.color = "red";
        resumenPedidos.textContent = "No hay pedidos registrados por el momento.";
        return;
    }

    let totalGeneral = 0;

    listaPedidos.forEach(function(pedido) {
        const numeroPedido = "UB-" + String(pedido.id_pedido).padStart(3, "0");
        const estado = pedido.estado;
        const claseEstado = obtenerClaseEstado(estado);
        const totalPedido = parseFloat(pedido.total);

        totalGeneral = totalGeneral + totalPedido;

        tablaPedidos.innerHTML += `
            <tr>
                <td>${numeroPedido}</td>
                <td>${pedido.cliente}</td>
                <td>${pedido.platos || "Sin detalle"}</td>
                <td>${pedido.cantidad || 0}</td>
                <td>S/ ${totalPedido.toFixed(2)}</td>
                <td>${pedido.fecha}</td>
                <td><span class="${claseEstado}">${estado}</span></td>
            </tr>
        `;
    });

    resumenPedidos.textContent = "Tienes " + listaPedidos.length + " pedido(s) registrado(s). Total acumulado: S/ " + totalGeneral.toFixed(2) + ".";
    mensajePedidos.textContent = "Tus pedidos se cargaron correctamente desde la base de datos.";
    mensajePedidos.style.color = "green";
}

function filtrarPedidos() {
    const estadoSeleccionado = document.getElementById("filtroEstado").value;

    if (estadoSeleccionado === "todos") {
        mostrarPedidos(pedidosCargados);
    } else {
        const pedidosFiltrados = pedidosCargados.filter(function(pedido) {
            return pedido.estado === estadoSeleccionado;
        });

        mostrarPedidos(pedidosFiltrados);
    }
}

async function limpiarHistorial() {
    const confirmar = confirm("¿Deseas eliminar el historial de pedidos de la base de datos?");

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(API_URL + "/pedidos", {
            method: "DELETE"
        });

        const datos = await respuesta.json();

        if (datos.ok) {
            pedidosCargados = [];
            mostrarPedidos([]);
            alert("Historial de pedidos eliminado.");
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor.");
    }
}

cargarPedidosDesdeBD();