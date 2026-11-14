document.addEventListener("DOMContentLoaded", () => {
      let searchTimeout;
      const searchInput = document.getElementById("searchInput");
      const searchSection = document.getElementById("search-results-section");
      const searchTrack = document.getElementById("track-search");

      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          clearTimeout(searchTimeout);
          const query = e.target.value.trim();

          if (!query) {
            searchSection.style.display = "none";
            return;
          }

          searchTimeout = setTimeout(async () => {
            try {
              const [resPelis, resSeries] = await Promise.all([
                fetch(`/api/peliculas/buscar?query=${encodeURIComponent(query)}`),
                fetch(`/api/series/buscar?query=${encodeURIComponent(query)}`)
              ]);

              const jsonPelis = await resPelis.json();
              const jsonSeries = await resSeries.json();

              const pelis = (jsonPelis.data?.results || []).map(p => ({ ...p, media_type: "movie" }));
              const series = (jsonSeries.data?.results || []).map(s => ({ ...s, media_type: "tv" }));
              const combinados = [...pelis, ...series];

              searchTrack.innerHTML = "";
              document.getElementById("searchCount").textContent = combinados.length;
              combinados.forEach((item) => {
                searchTrack.appendChild(crearTarjetaMedia(item, item.media_type));
              });
              searchSection.style.display = "block";
            } catch (err) {
              console.error("Error en búsqueda:", err);
            }
          }, 400);
        });
      }
    });