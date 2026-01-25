// js/ui.js
const cardContainer = document.getElementById("card-container");
const closeBtn = document.getElementById("close-panel");
// ======================
// SISTEMA DE ASESOR POR SESIÓN
// ======================

let ASESOR_SESION = null;

// Elegir asesor aleatorio una sola vez por sesión
async function seleccionarAsesorSesion() {
  try {
    const response = await fetch("data/terrenos.json");
    const data = await response.json();

    const asesores = data.asesores || [];

    if (!asesores.length) {
      console.warn("No hay asesores definidos, usando número por defecto");
      ASESOR_SESION = {
        nombre: "Asesor",
        whatsapp: "51924139997"
      };
      return;
    }

    const randomIndex = Math.floor(Math.random() * asesores.length);
    ASESOR_SESION = asesores[randomIndex];

    console.log("Asesor asignado a esta sesión:", ASESOR_SESION);

  } catch (error) {
    console.error("Error cargando asesores:", error);
    ASESOR_SESION = {
      nombre: "Asesor",
      whatsapp: "51924139997"
    };
  }
}

// Llamar una sola vez al cargar la página
seleccionarAsesorSesion();


/* ======================
   BOTÓN CERRAR PANEL
====================== */
function bindCloseButton() {
  const btn = document.getElementById("close-panel");
  if (!btn) return;

  btn.onclick = () => {
    cardContainer.classList.add("hidden");
    cardContainer.innerHTML = `<button class="close-panel" id="close-panel">✕</button>`;
  };
}

bindCloseButton();

/* ======================
   CARRUSEL
====================== */
function updateCarousel(imagenes) {
  const carousel = cardContainer.querySelector(".card-carousel");
  if (!carousel) return;

  const imgs = imagenes && imagenes.length
    ? imagenes
    : ["https://via.placeholder.com/800x600?text=Sin+imagen"];

  carousel.innerHTML = `
    ${imgs.map((img, i) =>
      `<img src="${img}" class="${i === 0 ? "active" : ""}">`
    ).join("")}
    <button class="card-prev">‹</button>
    <button class="card-next">›</button>
  `;

  const images = carousel.querySelectorAll("img");
  let idx = 0;

  carousel.querySelector(".card-next").onclick = () => {
    images[idx].classList.remove("active");
    idx = (idx + 1) % images.length;
    images[idx].classList.add("active");
  };

  carousel.querySelector(".card-prev").onclick = () => {
    images[idx].classList.remove("active");
    idx = (idx - 1 + images.length) % images.length;
    images[idx].classList.add("active");
  };
}

/* ======================
   PANEL TERRENO
====================== */
function showTerrenoInfo(terreno) {
  cardContainer.classList.remove("hidden");

  cardContainer.innerHTML = `
    <button class="close-panel" id="close-panel">✕</button>

    <div class="card-carousel"></div>

    <div class="card-body">
      <h3>${terreno.nombre}</h3>

      <span class="card-tag">
        ${terreno.tipo === "lotizacion" ? "Lotización" : "Terreno"}
      </span>

      <p><strong>Área:</strong> ${
        terreno.area_m2 ? terreno.area_m2 + " m²" : "Varios lotes"
      }</p>

      <p><strong>Precio:</strong> ${
        terreno.precio
          ? "$" + terreno.precio
          : terreno.lotes && terreno.lotes.length
            ? "$" + Math.min(...terreno.lotes.map(l => l.precio))
            : "—"
      }</p>

      <p><strong>Documentación:</strong> ${
        terreno.estado_legal?.documento || "—"
      }</p>

      <a href="#" class="card-whatsapp">Consultar por WhatsApp</a>
      <button class="card-ficha">Ver ficha</button>

      ${
        terreno.lotes && terreno.lotes.length
          ? `<div class="lotes-container"></div>`
          : ""
      }
    </div>
  `;

  bindCloseButton();
  updateCarousel(terreno.imagenes);

  /* ======================
     BOTÓN FICHA (TERRENO)
  ====================== */
  cardContainer.querySelector(".card-ficha").onclick = () => {
    window.open(
      `ficha.html?terreno=${terreno.id}`,
      "_blank"
    );
  };

  /* ======================
     WHATSAPP GENERAL
  ====================== */
  cardContainer.querySelector(".card-whatsapp").onclick = () => {
    const msg = `Hola, estoy interesado en ${terreno.nombre}`;
    const numero = ASESOR_SESION?.whatsapp || "51924139997";

window.open(
  `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`,
  "_blank"
);
  };

  /* ======================
     BOTONES DE LOTES
  ====================== */
  const lotesContainer = cardContainer.querySelector(".lotes-container");

  if (lotesContainer) {
    lotesContainer.innerHTML = "";

    terreno.lotes.forEach((lote, index) => {
      const btn = document.createElement("button");
      btn.className = "lote-btn";
      btn.textContent = `Lote ${lote.id.split("-").pop()} · ${lote.area_m2} m²`;

      if (lote.estado !== "disponible") {
        btn.disabled = true;
      }

      btn.onclick = () => {
        const loteSeleccionado = terreno.lotes[index];

        // Actualizar carrusel
        updateCarousel(loteSeleccionado.imagenes);

        // Actualizar textos
        cardContainer.querySelector("h3").textContent =
          `${terreno.nombre} — Lote ${loteSeleccionado.id.split("-").pop()}`;

        const ps = cardContainer.querySelectorAll(".card-body p");

        ps[0].innerHTML = `<strong>Área:</strong> ${loteSeleccionado.area_m2} m²`;
        ps[1].innerHTML = `<strong>Precio:</strong> $${loteSeleccionado.precio}`;
        ps[2].innerHTML = `<strong>Estado:</strong> ${loteSeleccionado.estado}`;

        /* ======================
           BOTÓN 360 (SI EXISTE)
        ====================== */

        const old360 = cardContainer.querySelector(".btn-360");
        if (old360) old360.remove();

        if (loteSeleccionado.vista360) {
          const btn360 = document.createElement("button");
          btn360.className = "btn-360";
          btn360.textContent = "Ver entorno en 360";

          btn360.onclick = () => {
            open360(loteSeleccionado.vista360);
          };

          cardContainer.querySelector(".card-body").appendChild(btn360);
        }

        /* ======================
           BOTÓN FICHA (LOTE)
        ====================== */

        const btnFicha = cardContainer.querySelector(".card-ficha");
        btnFicha.onclick = () => {
          window.open(
            `ficha.html?terreno=${terreno.id}&lote=${loteSeleccionado.id}`,
            "_blank"
          );
        };

        /* ======================
           WHATSAPP POR LOTE
        ====================== */

        const mensaje = `
Hola, me interesa el Lote ${loteSeleccionado.id.split("-").pop()}
de ${terreno.nombre}

Área: ${loteSeleccionado.area_m2} m²
Precio: $${loteSeleccionado.precio}
        `;

        cardContainer.querySelector(".card-whatsapp").onclick = () => {
          const numero = ASESOR_SESION?.whatsapp || "51924139997";

window.open(
  `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
  "_blank"
);
        };

        // Activo visual
        cardContainer
          .querySelectorAll(".lote-btn")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
      };

      lotesContainer.appendChild(btn);
    });
  }
}

window.showTerrenoInfo = showTerrenoInfo;

/* ======================
   VISOR 360
====================== */
let currentViewer = null;

function open360(imageUrl) {
  const overlay = document.getElementById("viewer-360");
  const panoDiv = document.getElementById("panorama");

  if (!overlay || !panoDiv) {
    console.error("Overlay 360 no encontrado en el DOM");
    return;
  }

  overlay.classList.remove("hidden");
  panoDiv.innerHTML = "";

  currentViewer = pannellum.viewer("panorama", {
    type: "equirectangular",
    panorama: imageUrl,
    autoLoad: true,
    showControls: true,
    hfov: 100
  });
}

document.getElementById("close-360").onclick = () => {
  const overlay = document.getElementById("viewer-360");
  overlay.classList.add("hidden");

  if (currentViewer) {
    currentViewer.destroy();
    currentViewer = null;
  }
};

/* ==============================
   MODO PRESENTACIÓN
============================== */
const btnPresentacion = document.getElementById("btn-presentacion");

let presentationActive = false;

btnPresentacion.onclick = () => {
  presentationActive = !presentationActive;

  if (presentationActive) {
    document.body.classList.add("presentation-mode");
    btnPresentacion.textContent = "Salir presentación";
  } else {
    document.body.classList.remove("presentation-mode");
    btnPresentacion.textContent = "Modo presentación";
  }

  // Forzar a Leaflet a recalcular tamaño del mapa
  setTimeout(() => {
    if (window.map) {
      map.invalidateSize();
    }
  }, 300);
};
