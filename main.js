const STORAGE_KEY = "frutas";

class Producto {
  constructor(fruta, precio, calidad, id = crypto.randomUUID()) {
    this.id = id;
    this.fruta = fruta;
    this.precio = precio;
    this.calidad = calidad;
  }
}

const frutasIniciales = [
  new Producto("Manzana", 2500, "Excelente"),
  new Producto("Frutilla", 2000, "Buena"),
  new Producto("Pera", 500, "Regular"),
];



function cargarFrutas() {
  try {
    const guardadas =
      JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? frutasIniciales;

    return guardadas.map(
      ({ id, fruta, precio, calidad }) =>
        new Producto(fruta, precio, calidad, id),
    );
  } catch (error) {
    return [...frutasIniciales];
  }
}

function guardarFrutas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frutas));
}

let frutas = cargarFrutas();
guardarFrutas(); 

const formFruta = document.getElementById("form-fruta");
const inputFruta = document.getElementById("fruta");
const inputPrecio = document.getElementById("precio");
const inputCalidad = document.getElementById("calidad");
const inputBuscar = document.getElementById("input-buscar");
const contenedorFrutas = document.getElementById("contenedor-frutas");
const feedback = document.getElementById("feedback");
const btnVaciar = document.getElementById("btn-vaciar");

const lblTotalVariedades = document.getElementById("total-variedades");
const lblValorTotal = document.getElementById("valor-total");


let timeoutFeedback;

function mostrarFeedback(mensaje, esError = false) {
  feedback.textContent = mensaje;
  feedback.className = esError ? "feedback error" : "feedback";

  clearTimeout(timeoutFeedback); 
  timeoutFeedback = setTimeout(() => feedback.classList.add("hidden"), 3000);
}


function actualizarResumenGlobal() {
  lblTotalVariedades.textContent = frutas.length;

  const total = frutas.reduce((acc, { precio }) => acc + precio, 0);
  lblValorTotal.textContent = `$${total.toLocaleString("es-CL")}`;
}

function renderizarFrutas() {
  const termino = inputBuscar.value.toLowerCase().trim();
  const lista = frutas.filter(({ fruta }) =>
    fruta.toLowerCase().includes(termino),
  );

  contenedorFrutas.innerHTML = "";

  if (lista.length === 0) {
    const mensaje = termino
      ? "No se encontraron frutas."
      : "El catálogo está vacío.";
    contenedorFrutas.innerHTML = `<p style="text-align:center; color:#64748b;">${mensaje}</p>`;
  } else {
    lista.forEach((item) => {
      const { id, fruta, precio, calidad } = item;

      const card = document.createElement("div");
      card.classList.add("card-fruta");
      card.innerHTML = `
        <div class="fruta-detalle">
          <h3>${fruta}</h3>
          <p>Calidad: ${calidad}</p>
          <p>Precio: $${precio.toLocaleString("es-CL")}</p>
        </div>
        <button class="btn-vender" data-id="${id}">Vendido</button>
      `;
      contenedorFrutas.appendChild(card);
    });
  }

  actualizarResumenGlobal();
}


function ejecutarVenta(id) {
  const productoEncontrado = frutas.find((p) => p.id === id);
  if (!productoEncontrado) return;

  const { fruta } = productoEncontrado; 

  frutas = frutas.filter((p) => p.id !== id); 
  guardarFrutas(); 
  renderizarFrutas(); 

  mostrarFeedback(`"${fruta}" fue removida del catálogo.`);
}

function vaciarCatalogo() {
  frutas = [];
  guardarFrutas(); 
  renderizarFrutas();
  mostrarFeedback("Catálogo vaciado.");
}



contenedorFrutas.addEventListener("click", (e) => {
  const id = e.target.closest(".btn-vender")?.dataset.id; 
  if (id) ejecutarVenta(id);
});

formFruta.addEventListener("submit", (e) => {
  e.preventDefault();

  const nuevaFruta = inputFruta.value.trim();
  const nuevoPrecio = Number(inputPrecio.value);
  const nuevaCalidad = inputCalidad.value;

  if (!nuevaFruta || nuevoPrecio <= 0) {
    mostrarFeedback(
      !nuevaFruta
        ? "Por favor ingresa el nombre de la fruta."
        : "Por favor ingresa un precio válido.",
      true,
    );
    return;
  }

  frutas.push(new Producto(nuevaFruta, nuevoPrecio, nuevaCalidad)); 
  guardarFrutas(); 
  formFruta.reset();
  renderizarFrutas(); 

  mostrarFeedback(`"${nuevaFruta}" añadida al inventario.`);
});

inputBuscar.addEventListener("input", renderizarFrutas);

btnVaciar.addEventListener("click", vaciarCatalogo);

document.addEventListener("DOMContentLoaded", renderizarFrutas);
