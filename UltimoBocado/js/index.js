const saludoInicio = document.getElementById("saludoInicio");
const mensajeDia = document.getElementById("mensajeDia");
const fraseImpacto = document.getElementById("fraseImpacto");

const horaActual = new Date().getHours();

if (horaActual < 12) {
    saludoInicio.textContent = "Buenos días, bienvenida a Último Bocado";
} else if (horaActual < 18) {
    saludoInicio.textContent = "Buenas tardes, bienvenida a Último Bocado";
} else {
    saludoInicio.textContent = "Buenas noches, bienvenida a Último Bocado";
}

mensajeDia.textContent = "Hoy también puedes ahorrar y ayudar a que menos comida termine desperdiciada.";

const mensajesImpacto = [
    "Un plato rescatado también es una oportunidad para cuidar el planeta.",
    "Comprar comida próxima a vencer ayuda a los negocios y también a tu bolsillo.",
    "Pequeñas decisiones, como elegir una oferta responsable, generan un gran cambio.",
    "Rescatar comida no significa comer menos calidad, significa aprovechar mejor los alimentos."
];

function mostrarFraseImpacto() {
    const posicion = Math.floor(Math.random() * mensajesImpacto.length);

    fraseImpacto.textContent = mensajesImpacto[posicion];
    fraseImpacto.style.fontWeight = "bold";
    fraseImpacto.style.color = "#d86b1f";
}

