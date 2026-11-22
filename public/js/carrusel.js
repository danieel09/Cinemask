const IMG_W500 = "https://image.tmdb.org/t/p/w500";
const IMG_ORIG = "https://image.tmdb.org/t/p/original";
const usuarioSesion = JSON.parse(localStorage.getItem("usuario") || "null");

function crearTarjetaMedia(item, tipoForzado) {
  const id = item.peliculaId || item.id;
  const tipo = item.tipo || item.media_type || (tipoForzado !== "wt" ? tipoForzado : "movie");
  const titulo = item.titulo || item.title || item.name || "Sin título";
  const fecha = item.anio || (item.release_date || item.first_air_date || "").slice(0, 4);

  let poster = "https://via.placeholder.com/300x450/181818/ffffff?text=Sin+Poster";
  if (item.posterUrl) {
    poster = item.posterUrl.startsWith("http") ? item.posterUrl : `${IMG_W500}${item.posterUrl}`;
  } else if (item.poster_path) {
    poster = `${IMG_W500}${item.poster_path}`;
  }

  const card = document.createElement("article");
  card.className = "media-card";
  card.innerHTML = `
    <div class="poster-wrapper">
      <img src="${poster}" alt="${titulo}" loading="lazy" />
    </div>
    <div class="card-info">
      <h3 class="card-title" title="${titulo}">${titulo}</h3>
      <div class="card-meta">
        <span>${fecha || "—"}</span>
        <span>${tipo === "tv" ? "Serie" : "Película"}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    const paginaDetalle = tipo === "movie" || tipo === "tv" ? "pelicula.html" : "detalle.html";
    window.location.href = `${paginaDetalle}?id=${id}&tipo=${tipo}`;
  });

  return card;
}

async function cargarCarrusel(rutaEndpoint, trackId, tipoPorDefecto) {
  const track = document.getElementById(trackId);
  if (!track) return;

  try {
    let url = rutaEndpoint;
    const headers = { "Content-Type": "application/json" };

    if (trackId === "track-movies-watchlist") {
      const userId = usuarioSesion?.id || usuarioSesion?._id;
      const token = localStorage.getItem("token");

      if (!userId) return; 

      url = `${rutaEndpoint}?usuarioId=${userId}`;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const res = await fetch(url, { headers });
    const json = await res.json();

    if (!res.ok || json.success === false) {
      throw new Error(json.mensaje || json.message || "Error al cargar catálogo");
    }

    const resultados = json.watchlist || json.data?.results || [];
    track.innerHTML = "";

    if (resultados.length === 0) {
      track.innerHTML = `<p style="color:#888; font-size:0.9rem;">Aún no tienes elementos en tu watchlist.</p>`;
      return;
    }

    resultados.forEach((item) => {
      track.appendChild(crearTarjetaMedia(item, tipoPorDefecto));
    });
  } catch (error) {
    track.innerHTML = `<p style="color:#888; font-size:0.85rem;">Error: ${error.message}</p>`;
  }
}

cargarCarrusel("/api/peliculas/populares", "track-movies-popular", "movie");
cargarCarrusel("/api/peliculas/tendencia", "track-movies-trending", "movie");
cargarCarrusel("/api/series/populares", "track-tv-popular", "tv");
cargarCarrusel("/api/series/tendencia", "track-tv-trending", "tv");
cargarCarrusel("/api/peliculas/mejor-calificadas", "track-top-rated", "movie");
cargarCarrusel("/api/peliculas/cartelera", "track-now-playing", "movie");
cargarCarrusel("/api/watchlist/obtener", "track-movies-watchlist", "wt");