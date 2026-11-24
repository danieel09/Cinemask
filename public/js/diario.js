let entradasOriginales = [];

document.addEventListener("DOMContentLoaded", () => {
  const usuarioGuardado = verificarAccesoUsuario({
    contenedorSelector: ".diario-container",
    titulo: "MI DIARIO",
    mensaje: "Inicia sesión para guardar y ver las reseñas de películas y series que has visto."
  });
  if (!usuarioGuardado) return;

  cargarDiario();
});

function obtenerSesion() {
  const token = localStorage.getItem("token");
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
  const usuarioId =
    localStorage.getItem("usuarioId") ||
    usuarioGuardado?._id ||
    usuarioGuardado?.id;

  return { token, usuarioId };
}

function obtenerTimestampVista(item) {
  const soloFecha = String(item.fechaVista || "").split("T")[0];
  const [anio, mes, dia] = soloFecha.split("-").map(Number);

  if (!anio || !mes || !dia) return 0;

  let horas = 0;
  let minutos = 0;

  if (item.horaVista) {
    const match = String(item.horaVista)
      .trim()
      .match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM|a\.?\s*m\.?|p\.?\s*m\.?))?$/i);
    if (match) {
      horas = Number(match[1]);
      minutos = Number(match[2]);
      const periodo = match[3]?.toLowerCase().replace(/[\s.]/g, "");
      if (periodo === "pm" && horas < 12) horas += 12;
      if (periodo === "am" && horas === 12) horas = 0;
    }
  }

  return new Date(anio, mes - 1, dia, horas, minutos).getTime();
}

function actualizarContador() {
  const cantidad = document.getElementById("statTotal");
  if (cantidad) {
    cantidad.textContent = entradasOriginales.length;
  }
}

async function cargarDiario() {
  const loader = document.getElementById("diarioLoader");
  const lista = document.getElementById("diarioLista");
  const { token, usuarioId } = obtenerSesion();

  try {
    const res = await fetch(`api/resenas/obtenerPorUsuario/${usuarioId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.mensaje || "No se pudo cargar el diario");
    }

    entradasOriginales = (json.data || []).sort((a, b) => {
      const diff = obtenerTimestampVista(b) - obtenerTimestampVista(a);
      if (diff !== 0) return diff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    actualizarContador();
    renderizarLista(entradasOriginales);
  } catch (error) {
    loader.innerHTML = `<p style="color:#f3b3b6;">Error al cargar tu diario: ${escapeHTML(error.message)}</p>`;
  } finally {
    if (entradasOriginales.length > 0 || document.querySelector("#diarioLista .diario-estado")) {
      loader.hidden = true;
      lista.hidden = false;
    }
  }
}

function renderizarLista(entradas) {
  const loader = document.getElementById("diarioLoader");
  const lista = document.getElementById("diarioLista");

  loader.hidden = true;
  lista.hidden = false;

  if (!entradas.length) {
    lista.innerHTML = `
      <div class="diario-estado">
        <p>Aún no tienes películas o series registradas en tu diario.</p>
      </div>
    `;
    return;
  }

  lista.innerHTML = entradas
    .map((item) => {
      const tieneTexto = Boolean(item.comentario && item.comentario.trim());
      let bloqueComentario = "";

      if (tieneTexto && item.contieneSpoilers) {
        bloqueComentario = `
          <div class="diario-spoiler-box" id="spoiler-box-${item._id}">
            <span>Esta reseña contiene spoilers.</span>
            <button type="button" class="btn-ver-spoiler" onclick="revelarSpoiler('${item._id}')">
              Mostrar
            </button>
          </div>
          <p class="diario-resena" id="resena-texto-${item._id}" hidden>${escapeHTML(item.comentario)}</p>
        `;
      } else if (tieneTexto) {
        bloqueComentario = `<p class="diario-resena">${escapeHTML(item.comentario)}</p>`;
      }

      return `
        <article class="diario-card" id="card-${item._id}">
          <img
            src="${item.posterUrl || "img/placeholder-poster.png"}"
            alt="${escapeHTML(item.titulo)}"
            class="diario-poster"
          />

          <div class="diario-info">
            <h3 class="diario-titulo">${escapeHTML(item.titulo)}</h3>
            <span class="diario-anio">${escapeHTML(String(item.anio || "—"))}</span>

            <div
              class="diario-rating"
              style="--rating: ${Number(item.calificacion) || 0};"
              aria-label="Calificación: ${item.calificacion} de 5"
            ></div>

            ${bloqueComentario}

            <div class="diario-meta">
              <span>${formatearFecha(item.fechaVista)}</span>
              <span>•</span>
              <span>${escapeHTML(item.horaVista || "")}</span>
            </div>
          </div>

          <button
            type="button"
            class="diario-btn-eliminar"
            onclick="eliminarEntradaDiario('${item._id}')"
            title="Eliminar entrada"
            aria-label="Eliminar entrada"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </article>
      `;
    })
    .join("");
}

function revelarSpoiler(id) {
  document.getElementById(`spoiler-box-${id}`)?.remove();
  const texto = document.getElementById(`resena-texto-${id}`);
  if (texto) texto.hidden = false;
}

async function eliminarEntradaDiario(id) {
  if (!confirm("¿Seguro que deseas eliminar este registro de tu diario?")) return;

  const { token } = obtenerSesion();

  try {
    const res = await fetch(`api/resenas/eliminar/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    const textoRespuesta = await res.text();
    let json = {};
    try {
      json = textoRespuesta ? JSON.parse(textoRespuesta) : {};
    } catch (_) {}

    if (!res.ok || json.success === false) {
      throw new Error(json.mensaje || `Error ${res.status} al eliminar`);
    }

    entradasOriginales = entradasOriginales.filter((item) => String(item._id) !== String(id));
    actualizarContador();
    aplicarFiltros();
    mostrarToast("Registro eliminado del diario");
  } catch (error) {
    mostrarToast(`Error: ${error.message}`);
  }
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return "";

  const soloFecha = String(fechaStr).split("T")[0];
  const [anio, mes, dia] = soloFecha.split("-");

  if (anio && mes && dia) {
    const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
    if (!isNaN(fecha)) {
      return fecha.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    }
  }

  return soloFecha;
}

function mostrarToast(mensaje) {
  const toast = document.getElementById("diarioToast");
  toast.textContent = mensaje;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 3000);
}

function escapeHTML(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}