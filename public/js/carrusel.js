    const IMG_W500 = "https://image.tmdb.org/t/p/w500";
    const IMG_ORIG = "https://image.tmdb.org/t/p/original";

    function crearTarjetaMedia(item, tipoForzado) {
      const tipo = item.media_type || tipoForzado;
      const titulo = item.title || item.name || "Sin título";
      const fecha = (item.release_date || item.first_air_date || "").slice(0, 4);
      const poster = item.poster_path
        ? `${IMG_W500}${item.poster_path}`
        : "https://via.placeholder.com/300x450/181818/ffffff?text=Sin+Poster";

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
        window.location.href = `${paginaDetalle}?id=${item.id}&tipo=${tipo}`;
      });

      return card;
    }

    async function cargarCarrusel(rutaEndpoint, trackId, tipoPorDefecto) {
        const track = document.getElementById(trackId);
        try {
            const res = await fetch(`${rutaEndpoint}`);
            const json = await res.json();

            if (!res.ok || !json.success) {
            throw new Error(json.message || "Error al cargar catálogo");
            }

            const resultados = json.data.results || [];
            track.innerHTML = "";

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