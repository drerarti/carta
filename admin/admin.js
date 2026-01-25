// ==============================
// ADMIN.JS - PANEL ADMINISTRATIVO v1 (CON CHECKLIST)
// Compatible con tu terrenos.json
// ==============================

let terrenosExistentes = [];
let lotesGenerados = [];

// ---------- UTILIDADES ----------
function pad(num, size) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

function descargarArchivo(nombre, contenido) {
  const blob = new Blob([contenido], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- CARGAR TERRENOS EXISTENTES ----------
async function cargarTerrenosExistentes() {
  try {
    const response = await fetch("../data/terrenos.json");
    const data = await response.json();

    terrenosExistentes = data.terrenos || [];

    const siguienteTerreno = obtenerSiguienteId("T");
    const siguienteLotizacion = obtenerSiguienteId("L");

    const inputTerrenoId = document.getElementById("terreno-id");
    const inputLotizacionId = document.getElementById("lotizacion-id");

    if (inputTerrenoId) inputTerrenoId.value = siguienteTerreno;
    if (inputLotizacionId) inputLotizacionId.value = siguienteLotizacion;

  } catch (error) {
    console.error("No se pudo cargar terrenos.json:", error);
  }
}

function obtenerSiguienteId(prefijo) {
  let max = 0;

  terrenosExistentes.forEach(t => {
    if (t.id && t.id.startsWith(prefijo + "-")) {
      const num = parseInt(t.id.split("-")[1]);
      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  });

  const siguiente = max + 1;
  return `${prefijo}-${pad(siguiente, 3)}`;
}

// ---------- UI: SELECTOR DE MODO ----------
function bindSelectorModo() {
  const radios = document.querySelectorAll("input[name='modo']");
  const formTerreno = document.getElementById("form-terreno");
  const formLotizacion = document.getElementById("form-lotizacion");

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "terreno") {
        formTerreno.classList.remove("hidden");
        formLotizacion.classList.add("hidden");
      } else {
        formTerreno.classList.add("hidden");
        formLotizacion.classList.remove("hidden");
      }
    });
  });
}

// ---------- GENERAR LOTES ----------
function generarLotes() {
  const cantidad = parseInt(document.getElementById("lotes-cantidad").value);
  const letraInicial = document.getElementById("lotes-letra-inicial").value.toUpperCase();
  const areaDefault = parseFloat(document.getElementById("lotes-area-default").value) || 0;
  const precioDefault = parseFloat(document.getElementById("lotes-precio-default").value) || 0;

  const lotizacionId = document.getElementById("lotizacion-id").value;

  if (!cantidad || !letraInicial) {
    alert("Define cantidad de lotes y letra inicial");
    return;
  }

  lotesGenerados = [];
  const tbody = document.querySelector("#tabla-lotes tbody");
  tbody.innerHTML = "";

  let letra = letraInicial.charCodeAt(0);

  for (let i = 0; i < cantidad; i++) {
    const letraActual = String.fromCharCode(letra + i);
    const idLote = `${lotizacionId}-${letraActual}`;

    const lote = {
      id: idLote,
      area_m2: areaDefault,
      precio: precioDefault,
      estado: "disponible",
      imagenes: [
        `img/lotizaciones/${lotizacionId}/lotes/${idLote}/${idLote}_1.jpg`
      ],
      // Para 360: dejamos la ruta por defecto vacía; si el usuario quiere 360 lo llenará manualmente en el JSON final
      vista360: ""
    };

    lotesGenerados.push(lote);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${lote.id}</td>
      <td>${lote.area_m2}</td>
      <td>${lote.precio}</td>
      <td>${lote.estado}</td>
    `;

    tbody.appendChild(tr);
  }
}

// ---------- CONSTRUIR TERRENO ----------
function construirTerrenoJSON() {
  const id = document.getElementById("terreno-id").value;

  const terreno = {
    id: id,
    nombre: document.getElementById("terreno-nombre").value,
    tipo: "terreno_individual",
    uso: document.getElementById("terreno-uso").value,

    estado_legal: {
      documento: document.getElementById("terreno-doc").value,
      titulo_propiedad: document.getElementById("terreno-titulo").value === "true",
      observaciones: document.getElementById("terreno-obs").value
    },

    ubicacion: {
      lat: parseFloat(document.getElementById("terreno-lat").value),
      lng: parseFloat(document.getElementById("terreno-lng").value),
      referencia: document.getElementById("terreno-ref").value
    },

    area_m2: parseFloat(document.getElementById("terreno-area").value),
    precio: parseFloat(document.getElementById("terreno-precio").value),

    servicios: [],

    imagenes: [],

    beneficios: {
      club_campestre: false,
      impacto_social: false
    },

    financiacion: {
      disponible: document.getElementById("terreno-fin-disponible").value === "true",
      cuotas_maximas: parseInt(document.getElementById("terreno-cuotas").value) || 0,
      inicial_minima: parseInt(document.getElementById("terreno-inicial").value) || 0
    },

    visualizacion: {
      panoramica: false,
      modelo_3d: false,
      proyeccion: []
    },

    estado: "disponible",

    oculto: {
      contacto_interno: "",
      fecha_registro: new Date().toISOString().slice(0, 10),
      notas_legales: ""
    }
  };

  // Rutas de imágenes (no sube archivos; solo genera rutas para checklist)
  const files = document.getElementById("terreno-imagenes").files;

  for (let i = 0; i < files.length; i++) {
    terreno.imagenes.push(
      `img/terrenos/${id}/${id}_${i + 1}.jpg`
    );
  }

  // Si se sube 360, sugerimos ruta (archivo opcional)
  const file360 = document.getElementById("terreno-360").files;
  if (file360 && file360.length) {
    terreno.vista360 = `img/360/${id}/${id}_360.jpg`;
  } else {
    terreno.vista360 = "";
  }

  return terreno;
}

// ---------- CONSTRUIR LOTIZACIÓN ----------
function construirLotizacionJSON() {
  const id = document.getElementById("lotizacion-id").value;

  const lotizacion = {
    id: id,
    nombre: document.getElementById("lotizacion-nombre").value,
    tipo: "lotizacion",
    uso: document.getElementById("lotizacion-uso").value,

    estado_legal: {
      documento: document.getElementById("lotizacion-documento").value,
      titulo_propiedad: document.getElementById("lotizacion-titulo").value === "true",
      observaciones: ""
    },

    ubicacion: {
      lat: parseFloat(document.getElementById("lotizacion-lat").value),
      lng: parseFloat(document.getElementById("lotizacion-lng").value),
      referencia: document.getElementById("lotizacion-ref").value
    },

    beneficios: {
      club_campestre: true,
      impacto_social: true
    },

    financiacion: {
      disponible: true,
      cuotas_maximas: 0,
      inicial_minima: 0
    },

    imagenes: [],

    lotes: lotesGenerados,

    visualizacion: {
      panoramica: true,
      modelo_3d: false,
      proyeccion: []
    },

    estado: "disponible",

    oculto: {
      porcentaje_acciones: 100,
      fecha_registro: new Date().toISOString().slice(0, 10),
      notas_legales: ""
    }
  };

  // Rutas de imágenes generales (solo genera rutas)
  const files = document.getElementById("lotizacion-imagenes").files;

  for (let i = 0; i < files.length; i++) {
    lotizacion.imagenes.push(
      `img/lotizaciones/${id}/general/general_${i + 1}.jpg`
    );
  }

  return lotizacion;
}

// ---------- VALIDACIONES ----------
function validarTerreno() {
  const errores = [];

  const nombre = document.getElementById("terreno-nombre").value.trim();
  const lat = document.getElementById("terreno-lat").value;
  const lng = document.getElementById("terreno-lng").value;
  const area = document.getElementById("terreno-area").value;
  const precio = document.getElementById("terreno-precio").value;
  const imagenes = document.getElementById("terreno-imagenes").files;

  if (!nombre) errores.push("Falta el nombre del terreno");
  if (!lat || isNaN(lat)) errores.push("Latitud inválida");
  if (!lng || isNaN(lng)) errores.push("Longitud inválida");
  if (!area || area <= 0) errores.push("Área debe ser mayor a 0");
  if (!precio || precio <= 0) errores.push("Precio debe ser mayor a 0");
  if (!imagenes || imagenes.length === 0) errores.push("Debe subir al menos una imagen");

  return errores;
}

function validarLotizacion() {
  const errores = [];

  const nombre = document.getElementById("lotizacion-nombre").value.trim();
  const lat = document.getElementById("lotizacion-lat").value;
  const lng = document.getElementById("lotizacion-lng").value;
  const imagenes = document.getElementById("lotizacion-imagenes").files;

  if (!nombre) errores.push("Falta el nombre de la lotización");
  if (!lat || isNaN(lat)) errores.push("Latitud inválida");
  if (!lng || isNaN(lng)) errores.push("Longitud inválida");
  if (!lotesGenerados.length) errores.push("Debe generar los lotes antes de exportar");
  if (!imagenes || imagenes.length === 0) errores.push("Debe subir al menos una imagen general");

  return errores;
}

// ---------- GENERAR CHECKLIST ----------
function generarChecklist(registro, modo) {
  const carpetas = [];
  const archivos = [];

  if (modo === "terreno") {
    const id = registro.id;
    carpetas.push(`img/terrenos/${id}/`);

    registro.imagenes.forEach((ruta, i) => {
      archivos.push(`${ruta}`);
    });

    if (registro.vista360 && registro.vista360.trim() !== "") {
      carpetas.push(`img/360/${id}/`);
      archivos.push(registro.vista360);
    }
  }

  if (modo === "lotizacion") {
    const id = registro.id;

    // Carpeta general
    carpetas.push(`img/lotizaciones/${id}/general/`);

    registro.imagenes.forEach(ruta => {
      archivos.push(ruta);
    });

    // Lotes
    registro.lotes.forEach(lote => {
      const loteId = lote.id;
      carpetas.push(`img/lotizaciones/${id}/lotes/${loteId}/`);

      lote.imagenes.forEach(ruta => {
        archivos.push(ruta);
      });

      // Vista 360 solo si existe (campo puede estar vacío)
      if (lote.vista360 && lote.vista360.trim() !== "") {
        carpetas.push(`img/360/${loteId}/`);
        archivos.push(lote.vista360);
      }
    });
  }

  let texto = "";
  texto += "CARPETAS A CREAR:\n";
  carpetas.forEach(c => {
    texto += `- ${c}\n`;
  });

  texto += "\nARCHIVOS ESPERADOS (renombrar así):\n";
  archivos.forEach(a => {
    texto += `- ${a}\n`;
  });

  return texto;
}

// ---------- EXPORTAR JSON (VALIDA + CHECKLIST) ----------
function exportarJSON() {
  const modo = document.querySelector("input[name='modo']:checked").value;
  const contenedorErrores = document.getElementById("admin-errores");
  const contenedorChecklist = document.getElementById("admin-checklist");
  if (contenedorErrores) contenedorErrores.innerHTML = "";
  if (contenedorChecklist) contenedorChecklist.innerHTML = "";

  let errores = [];

  if (modo === "terreno") {
    errores = validarTerreno();
  } else {
    errores = validarLotizacion();
  }

  if (errores.length) {
    const ul = document.createElement("ul");
    ul.style.color = "#b91c1c";
    ul.style.fontWeight = "600";

    errores.forEach(err => {
      const li = document.createElement("li");
      li.textContent = err;
      ul.appendChild(li);
    });

    if (contenedorErrores) contenedorErrores.appendChild(ul);
    return; // BLOQUEAR EXPORTACIÓN
  }

  let resultado = null;

  if (modo === "terreno") {
    resultado = construirTerrenoJSON();
  } else {
    resultado = construirLotizacionJSON();
  }

  const jsonTexto = JSON.stringify(resultado, null, 2);

  // Generar checklist
  const checklist = generarChecklist(resultado, modo);

  if (contenedorChecklist) {
    const pre = document.createElement("pre");
    pre.textContent = checklist;
    pre.style.background = "#f8fafc";
    pre.style.padding = "15px";
    pre.style.borderRadius = "8px";
    pre.style.border = "1px solid #e5e7eb";
    pre.style.maxHeight = "300px";
    pre.style.overflow = "auto";

    contenedorChecklist.appendChild(pre);
  }

  descargarArchivo(`${resultado.id}.json`, jsonTexto);
}

// ---------- INICIALIZACIÓN ----------
document.addEventListener("DOMContentLoaded", () => {
  cargarTerrenosExistentes();
  bindSelectorModo();

  const btnGenerarLotes = document.getElementById("btn-generar-lotes");
  if (btnGenerarLotes) {
    btnGenerarLotes.addEventListener("click", generarLotes);
  }

  const btnExportar = document.getElementById("btn-exportar-json");
  if (btnExportar) {
    btnExportar.addEventListener("click", exportarJSON);
  }
});
