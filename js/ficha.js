// js/ficha.js

const params = new URLSearchParams(window.location.search);
const terrenoId = params.get("terreno");
const loteId = params.get("lote");

fetch("data/terrenos.json")
  .then(res => res.json())
  .then(data => {
    let terrenoSeleccionado = null;
    let loteSeleccionado = null;

    data.terrenos.forEach(t => {
      if (t.id === terrenoId) {
        terrenoSeleccionado = t;

        if (t.lotes && loteId) {
          t.lotes.forEach(l => {
            if (l.id === loteId) {
              loteSeleccionado = l;
            }
          });
        }
      }
    });

    if (!terrenoSeleccionado) {
      document.body.innerHTML = "<h2>No se encontró el terreno</h2>";
      return;
    }

    renderFicha(terrenoSeleccionado, loteSeleccionado);
  })
  .catch(err => {
    console.error("Error cargando datos de terrenos:", err);
    document.body.innerHTML = "<h2>Error cargando datos de terrenos</h2>";
  });


function renderFicha(terreno, lote) {

  // Datos base
  const nombreEl = document.getElementById("ficha-nombre");
  const tipoEl = document.getElementById("ficha-tipo");
  const areaEl = document.getElementById("ficha-area");
  const precioEl = document.getElementById("ficha-precio");
  const estadoEl = document.getElementById("ficha-estado");
  const refEl = document.getElementById("ficha-referencia");
  const docEl = document.getElementById("ficha-documento");
  const galeriaEl = document.getElementById("ficha-galeria");

  const fuente = lote || terreno;

  nombreEl.textContent = lote
    ? `${terreno.nombre} — Lote ${lote.id}`
    : terreno.nombre;

  tipoEl.textContent = terreno.tipo;
  areaEl.textContent = fuente.area_m2 ? fuente.area_m2 + " m²" : "—";
  precioEl.textContent = fuente.precio ? "$" + fuente.precio : "—";
  estadoEl.textContent = fuente.estado || "—";

  refEl.textContent = terreno.ubicacion?.referencia || "—";
  docEl.textContent = terreno.estado_legal?.documento || "—";

  // Galería de imágenes
  galeriaEl.innerHTML = "";
// Imagen principal (hero)
const heroImg = document.getElementById("ficha-hero-img");

const imagenPrincipal = (fuente.imagenes && fuente.imagenes[0]) 
  || (terreno.imagenes && terreno.imagenes[0]) 
  || "";

if (heroImg && imagenPrincipal) {
  heroImg.src = imagenPrincipal;
}

// Uso
const usoEl = document.getElementById("ficha-uso");
usoEl.textContent = terreno.uso || "—";

// Beneficios
const beneficiosEl = document.getElementById("ficha-beneficios");
beneficiosEl.innerHTML = "";

if (terreno.beneficios) {
  if (terreno.beneficios.club_campestre) {
    beneficiosEl.innerHTML += `<span class="ficha-badge">Club campestre</span>`;
  }
  if (terreno.beneficios.impacto_social) {
    beneficiosEl.innerHTML += `<span class="ficha-badge">Impacto social</span>`;
  }
}

  const imagenes = fuente.imagenes || terreno.imagenes || [];

  imagenes.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "ficha-img";
    galeriaEl.appendChild(img);
  });

  // QR SIMPLE (sin librerías)
  const qrContainer = document.getElementById("qr-container");
  const urlMapa = window.location.origin + "/?terreno=" + terreno.id;

  const qrImg = document.createElement("img");
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlMapa)}`;
  qrImg.alt = "QR del terreno";

  qrContainer.appendChild(qrImg);
}
