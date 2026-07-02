const API_URL = "http://localhost:3000/api";
let comidas = [];

async function cargarComidas() {
    const mensajeMenu = document.getElementById("mensajeMenu");

    try {
        const respuesta = await fetch(API_URL + "/comidas");
        const datos = await respuesta.json();

        comidas = datos.comidas;
        mostrarComidas(comidas);
    } catch (error) {
        mensajeMenu.textContent = "No se pudo cargar el menú desde la base de datos.";
        mensajeMenu.style.color = "red";
    }
}

function mostrarComidas(lista) {
    const listaComidas = document.getElementById("listaComidas");
    const contadorMenu = document.getElementById("contadorMenu");
    const mensajeMenu = document.getElementById("mensajeMenu");

    listaComidas.innerHTML = "";

    if (lista.length === 0) {
        listaComidas.innerHTML = `
            <article class="card">
                <h3 class="text-green">No hay platos con ese filtro</h3>
                <p>Prueba cambiando el local o el rango de precio.</p>
            </article>
        `;

        contadorMenu.textContent = "No se encontraron opciones disponibles.";
        mensajeMenu.textContent = "Por ahora no hay platos que coincidan con tu búsqueda.";
        mensajeMenu.style.color = "red";
        return;
    }

    lista.forEach(function(comida) {
        listaComidas.innerHTML += `
            <article class="card">
                <img class="food-img" src="${comida.imagen}" alt="${comida.nombre}">
                <span class="small-tag mt-10">${comida.local_aliado}</span>

                <h3 class="text-green mt-10">${comida.nombre}</h3>

                <p>${comida.descripcion}</p>

                <div class="price-row">
                    <span class="old-price">S/ ${comida.precio_original.toFixed(2)}</span>
                    <span class="new-price text-orange">S/ ${comida.precio_oferta.toFixed(2)}</span>
                </div>

                <button class="btn btn-full text-center" onclick="agregarAlPedido('${comida.nombre}')">
                    Añadir al pedido
                </button>
            </article>
        `;
    });

    contadorMenu.textContent = "Se encontraron " + lista.length + " opciones disponibles.";
    mensajeMenu.textContent = "Elige una opción y continúa con tu reserva.";
    mensajeMenu.style.color = "#315c46";
}

function filtrarMenu() {
    const localSeleccionado = document.getElementById("filtroLocal").value;
    const precioSeleccionado = document.getElementById("filtroPrecio").value;

    let resultado = comidas;

    if (localSeleccionado !== "todos") {
        resultado = resultado.filter(function(comida) {
            return comida.local_aliado === localSeleccionado;
        });
    }

    if (precioSeleccionado === "menor10") {
        resultado = resultado.filter(function(comida) {
            return comida.precio_oferta < 10;
        });
    } else if (precioSeleccionado === "mayor10") {
        resultado = resultado.filter(function(comida) {
            return comida.precio_oferta >= 10;
        });
    }

    mostrarComidas(resultado);
}

function agregarAlPedido(nombreComida) {
    localStorage.setItem("platoSeleccionado", nombreComida);

    alert("Agregaste al pedido: " + nombreComida);

    window.location.href = "form_pedido.html";
}

cargarComidas();

