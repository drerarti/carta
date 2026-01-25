// ==============================
// DATA LOADER - VERSION CONSOLIDADA
// Única fuente de verdad para:
// - Carga de datos
// - Filtros
// - Dibujo de marcadores
// ==============================

let terrenosData = [];

// ==============================
// Cargar terrenos desde JSON
// ==============================
async function loadTerrenos() {
  try {
    const response = await fetch("data/terrenos.json");
    const data = await response.json();

    terrenosData = data.terrenos || [];

    aplicarFiltros();

  } catch (error) {
    console.error("Error cargando terrenos.json:", error);
  }
}

// ==============================
// Aplicar filtros simples
// (alineados con tu decisión estratégica)
// ==============================
function aplicarFiltros() {
  // Limpiar mapa
  if (typeof clearMarkers === "function") {
    clearMarkers();
  }

  // Leer filtros actuales (si existen en DOM)
  const tipoSelect = document.getElementById("filter-tipo");
  const usoSelect = document.getElementById("filter-uso");
  const precioInput = document.getElementById("filter-precio");

  const tipo = tipoSelect ? tipoSelect.value : "all";
  const uso = usoSelect ? usoSelect.value : "all";
  const precioMax = precioInput ? parseInt(precioInput.value) : null;

  terrenosData.forEach(terreno => {
    // ==============================
    // FILTRO POR ESTADO
    // ==============================
    if (terreno.estado && terreno.estado !== "disponible") {
      return;
    }

    // ==============================
    // FILTRO POR TIPO
    // ==============================
    if (tipo !== "all" && terreno.tipo !== tipo) {
      return;
    }

    // ==============================
    // FILTRO POR USO
    // ==============================
    if (uso !== "all" && terreno.uso !== uso) {
      return;
    }

    // ==============================
    // PRECIO BASE (terreno o lote mínimo)
    // ==============================
    let precioBase = null;

    if (terreno.tipo === "terreno_individual") {
      precioBase = terreno.precio;
    }

    if (terreno.tipo === "lotizacion" && terreno.lotes && terreno.lotes.length) {
      precioBase = Math.min(...terreno.lotes.map(l => l.precio));
    }

    // ==============================
    // FILTRO POR PRECIO MÁXIMO
    // ==============================
    if (precioMax !== null && precioBase !== null) {
      if (precioBase > precioMax) {
        return;
      }
    }

    // ==============================
    // CREAR MARCADOR
    // ==============================
    if (typeof createMarker === "function") {
      createMarker(terreno);
    } else {
      console.error("createMarker no está definido");
    }
  });
}

// ==============================
// Inicialización
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initMap === "function") {
    initMap();
  } else {
    console.error("initMap no está definido");
  }

  loadTerrenos();

  // ==============================
  // Eventos de filtros simples
  // ==============================
  const tipoSelect = document.getElementById("filter-tipo");
  const usoSelect = document.getElementById("filter-uso");
  const precioInput = document.getElementById("filter-precio");
  const precioValue = document.getElementById("precio-value");

  if (tipoSelect) {
    tipoSelect.addEventListener("change", aplicarFiltros);
  }

  if (usoSelect) {
    usoSelect.addEventListener("change", aplicarFiltros);
  }

  if (precioInput && precioValue) {
    precioInput.addEventListener("input", () => {
      precioValue.textContent = precioInput.value;
      aplicarFiltros();
    });
  }
});
