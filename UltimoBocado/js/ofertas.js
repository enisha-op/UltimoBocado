const API_URL = "http://localhost:3000/api";
let ofertas = [];

async function cargarOfertas() {
    const mensajeOferta = document.getElementById("mensajeOferta");

    try {
        const respuesta = await fetch(API_URL + "/ofertas");
        const datos = await respuesta.json();

        ofertas = datos.ofertas;
        mostrarOfertas(ofertas);
    } catch (error) {
        mensajeOferta.textContent = "No se pudieron cargar las ofertas desde la base de datos.";
        mensajeOferta.style.color = "red";
    }
}

function mostrarOfertas(lista) {
    const listaOfertas = document.getElementById("listaOfertas");
    const contadorOfertas = document.getElementById("contadorOfertas");

    listaOfertas.innerHTML = "";

    if (lista.length === 0) {
        listaOfertas.innerHTML = `
            <article class="card">
                <h3 class="text-green">No hay ofertas disponibles</h3>
                <p>Prueba seleccionando otra opción de urgencia.</p>
            </article>
        `;

        contadorOfertas.textContent = "No se encontraron ofertas con ese filtro.";
        contadorOfertas.style.color = "red";
        return;
    }

    lista.forEach(function(oferta) {
        const descuento = calcularDescuento(oferta.precio_original, oferta.precio_oferta);

        listaOfertas.innerHTML += `
            <article class="card border-orange">
                <img class="food-img" src="${oferta.imagen}" alt="${oferta.nombre}">

                <span class="urgency mt-10">${oferta.etiqueta}</span>

                <h3 class="text-green mt-10">${oferta.nombre}</h3>

                <p>${oferta.descripcion}</p>

                <p><strong>Local:</strong> ${oferta.local_aliado}</p>

                <p class="text-orange">
                    Ahorro aproximado: ${descuento}%
                </p>

                <div class="price-row">
                    <span class="old-price">S/ ${oferta.precio_original.toFixed(2)}</span>
                    <span class="new-price text-orange">S/ ${oferta.precio_oferta.toFixed(2)}</span>
                </div>

                <button class="btn btn-full text-center" onclick="rescatarOferta('${oferta.nombre}')">
                    Rescatar ahora
                </button>
            </article>
        `;
    });

    contadorOfertas.textContent = "Hay " + lista.length + " ofertas disponibles para rescatar.";
    contadorOfertas.style.color = "#315c46";
}

function calcularDescuento(precioAntes, precioAhora) {
    const descuento = ((precioAntes - precioAhora) / precioAntes) * 100;
    return Math.round(descuento);
}

function filtrarOfertas() {
    const urgenciaSeleccionada = document.getElementById("filtroUrgencia").value;

    if (urgenciaSeleccionada === "todas") {
        mostrarOfertas(ofertas);
    } else {
        const ofertasFiltradas = ofertas.filter(function(oferta) {
            return oferta.urgencia.toLowerCase() === urgenciaSeleccionada;
        });

        mostrarOfertas(ofertasFiltradas);
    }
}

function mostrarOfertaDestacada() {
    const mensajeOferta = document.getElementById("mensajeOferta");

    if (ofertas.length === 0) {
        mensajeOferta.textContent = "Aún no hay ofertas cargadas.";
        mensajeOferta.style.color = "red";
        return;
    }

    const posicion = Math.floor(Math.random() * ofertas.length);
    const oferta = ofertas[posicion];

    mensajeOferta.textContent = "Oferta recomendada: " + oferta.nombre + " por solo S/ " + oferta.precio_oferta.toFixed(2);
    mensajeOferta.style.color = "#df725f";
    mensajeOferta.style.fontWeight = "bold";
}

function rescatarOferta(nombreOferta) {
    localStorage.setItem("platoSeleccionado", nombreOferta);

    alert("Agregaste esta oferta al pedido: " + nombreOferta);

    window.location.href = "form_pedido.html";
}

cargarOfertas();