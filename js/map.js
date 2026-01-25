// ==============================
// MAPA BASE - VERSION LIMPIA
// Solo: mapa, íconos, marcadores
// ==============================

let map;
let markersLayer;

// Íconos oficiales
const iconTerreno = L.icon({
  iconUrl: "img/icons/terreno.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconLotizacion = L.icon({
  iconUrl: "img/icons/lotizacion.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// ==============================
// Inicializar mapa
// ==============================
function initMap() {
  map = L.map("map").setView([-13.431, -72.039], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

// ==============================
// Crear marcador individual
// ==============================
function createMarker(terreno) {
  if (!terreno.ubicacion || !terreno.ubicacion.lat || !terreno.ubicacion.lng) {
    console.warn("Terreno sin ubicación válida:", terreno.id);
    return;
  }

  const icono =
    terreno.tipo === "lotizacion"
      ? iconLotizacion
      : iconTerreno;

  const marker = L.marker(
    [terreno.ubicacion.lat, terreno.ubicacion.lng],
    { icon: icono }
  );

  marker.on("click", () => {
    if (typeof showTerrenoInfo === "function") {
      showTerrenoInfo(terreno);
    } else {
      console.error("showTerrenoInfo no está definido");
    }
  });

  marker.addTo(markersLayer);
}

// ==============================
// Limpiar todos los marcadores
// ==============================
function clearMarkers() {
  if (markersLayer) {
    markersLayer.clearLayers();
  }
}

// ==============================
// Exponer funciones al resto del sistema
// ==============================
window.initMap = initMap;
window.createMarker = createMarker;
window.clearMarkers = clearMarkers;
