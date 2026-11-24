document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('page-status');
  const layoutEl = document.getElementById('movie-layout');
  const btnWatchlist = document.getElementById('watchlist-button');
  const btnReview = document.getElementById('review-button');

  const posterImg = document.getElementById('movie-poster');
  const titleEl = document.getElementById('movie-title');
  const yearEl = document.getElementById('movie-year');
  const overviewEl = document.getElementById('movie-overview');

  const durationEl = document.getElementById('movie-duration');
  const directorEl = document.getElementById('movie-director');
  const castEl = document.getElementById('movie-cast');
  const genresEl = document.getElementById('movie-genres');

  const params = new URLSearchParams(window.location.search);
  const mediaId = params.get('id') || params.get('tmdbId');
  const mediaType = (params.get('tipo') || 'movie').toLowerCase();

  const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';
  const FALLBACK_POSTER = 'images/logoCinemask.png';

  let currentMedia = null;
  let watchlistDocId = null;
  let procesandoWatchlist = false;

  function setError(message) {
    if (!statusEl || !layoutEl) return;
    statusEl.textContent = message;
    statusEl.classList.add('is-error');
    statusEl.hidden = false;
    layoutEl.hidden = true;
  }

  function resolvePosterUrl(rawPoster) {
    if (!rawPoster || typeof rawPoster !== 'string') {
      return FALLBACK_POSTER;
    }
    const trimmed = rawPoster.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${TMDB_IMG_W500}${cleanPath}`;
  }

  function resolveYear(media, tipo) {
    if (media.anioEstreno) return String(media.anioEstreno);
    if (media.year) return String(media.year);

    const rawDate = media.release_date || media.first_air_date || media.fechaEstreno || '';
    const match = String(rawDate).match(/\d{4}/);
    const yearStr = match ? match[0] : 'Año no disponible';

    return tipo === 'tv' && match ? `${yearStr}` : yearStr;
  }

  function formatDuration(media, tipo) {
    if (tipo === 'tv') {
      const partes = [];
      if (typeof media.number_of_seasons === 'number' && media.number_of_seasons > 0) {
        partes.push(
          media.number_of_seasons === 1
            ? '1 temporada'
            : `${media.number_of_seasons} temporadas`
        );
      }
      if (Array.isArray(media.episode_run_time) && media.episode_run_time.length > 0) {
        partes.push(`${media.episode_run_time[0]} min/ep`);
      }
      return partes.length > 0 ? partes.join(' • ') : 'No disponible';
    }

    const rawDuration = media.duracion ?? media.runtime;
    if (typeof rawDuration === 'number' && rawDuration > 0) {
      return `${rawDuration} min`;
    }
    if (typeof rawDuration === 'string' && rawDuration.trim()) {
      const trimmed = rawDuration.trim();
      return /^\d+$/.test(trimmed) ? `${trimmed} min` : trimmed;
    }

    return 'No disponible';
  }

  function formatList(value, fallback = 'No disponible') {
    if (Array.isArray(value) && value.length > 0) {
      const formatted = value
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            return (item.name || item.nombre || '').trim();
          }
          return '';
        })
        .filter(Boolean);
      return formatted.length > 0 ? formatted.join(', ') : fallback;
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    return fallback;
  }

  function normalizeMediaPayload(raw, tipo) {
    const media = raw && raw.data ? raw.data : raw?.pelicula || raw || {};
    const credits = media.credits || raw?.credits || {};

    let director = media.director;
    if (!director) {
      if (tipo === 'tv' && Array.isArray(media.created_by) && media.created_by.length > 0) {
        director = media.created_by.map((person) => person.name).filter(Boolean);
      } else if (Array.isArray(credits.crew)) {
        const directors = credits.crew
          .filter((person) => person && person.job === 'Director' && person.name)
          .map((person) => person.name);
        director = directors.length > 0 ? directors : 'No disponible';
      }
    }

    let cast = media.cast || media.reparto;
    if (!cast && Array.isArray(credits.cast)) {
      cast = credits.cast
        .slice(0, 8)
        .map((person) => person && person.name)
        .filter(Boolean);
    }

    const genres = media.generos || media.genres;

    return {
      id: media.id || media._id || media.tmdbId || mediaId,
      title: media.title || media.name || media.titulo || 'Sin título',
      year: resolveYear(media, tipo),
      overview:
        media.overview ||
        media.sinopsis ||
        media.descripcion ||
        'Sin descripción disponible.',
      posterUrl: resolvePosterUrl(
        media.poster_path || media.poster || media.posterUrl
      ),
      duration: formatDuration(media, tipo),
      director: formatList(director, 'No disponible'),
      cast: formatList(cast, 'No disponible'),
      genres: formatList(genres, 'No disponible')
    };
  }

  async function fetchMediaData(id, tipo) {
    const endpoint =
      tipo === 'tv'
        ? `/api/series/${encodeURIComponent(id)}`
        : `/api/peliculas/${encodeURIComponent(id)}`;

    const response = await fetch(endpoint);
    let json;

    try {
      json = await response.json();
    } catch (_) {
      throw new Error('La respuesta del servidor no tiene un formato JSON válido.');
    }

    if (!response.ok || json.success === false) {
      throw new Error(
        json.message ||
          `No se pudo obtener la información de la ${tipo === 'tv' ? 'serie' : 'película'} desde la API.`
      );
    }

    return json;
  }

  function renderMedia(media) {
    currentMedia = media;
    document.title = `${media.title} | CINEMASK`;

    if (posterImg) {
      posterImg.src = media.posterUrl;
      posterImg.alt = `Póster de ${media.title}`;
      posterImg.onerror = () => {
        posterImg.onerror = null;
        posterImg.src = FALLBACK_POSTER;
      };
    }

    if (titleEl) titleEl.textContent = media.title;
    if (yearEl) yearEl.textContent = media.year;
    if (overviewEl) overviewEl.textContent = media.overview;

    if (durationEl) durationEl.textContent = media.duration;
    if (directorEl) directorEl.textContent = media.director;
    if (castEl) castEl.textContent = media.cast;
    if (genresEl) genresEl.textContent = media.genres;

    if (statusEl) statusEl.hidden = true;
    if (layoutEl) layoutEl.hidden = false;
  }

  function obtenerSesion() {
    let usuario = null;
    try {
      usuario = JSON.parse(localStorage.getItem('usuario'));
    } catch (_) {
      usuario = null;
    }
    const token = localStorage.getItem('token');
    const userId = usuario?.id || usuario?._id;
    const esInvitado = !usuario || usuario.role === 'guest' || !userId;

    return { usuario, token, userId, esInvitado };
  }

  async function verificarEstadoWatchlist() {
    const { token, userId, esInvitado } = obtenerSesion();
    if (esInvitado) return;

    try {
      const res = await fetch(
        `/api/watchlist/verificar/${encodeURIComponent(userId)}/${encodeURIComponent(mediaId)}?tipo=${encodeURIComponent(mediaType)}`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );
      const json = await res.json();

      if (res.ok && json.enWatchlist && json.item) {
        watchlistDocId = json.item._id;
        actualizarIconoWatchlist(true);
      } else {
        watchlistDocId = null;
        actualizarIconoWatchlist(false);
      }
    } catch (error) {
      console.error('Error al verificar estado en watchlist:', error);
    }
  }

  if (btnWatchlist) {
    btnWatchlist.addEventListener('click', async () => {
      const { token, userId, esInvitado } = obtenerSesion();

      if (esInvitado) {
        alert('Inicia sesión para guardar títulos en tu Watchlist.');
        return;
      }

      if (!currentMedia || procesandoWatchlist) return;
      procesandoWatchlist = true;

      try {
        if (watchlistDocId) {
          const res = await fetch(`/api/watchlist/eliminar/${encodeURIComponent(watchlistDocId)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` })
            }
          });
          const json = await res.json();

          if (!res.ok || json.success === false) {
            throw new Error(json.mensaje || 'Error al eliminar de watchlist');
          }

          watchlistDocId = null;
          actualizarIconoWatchlist(false);
        } else {
          const res = await fetch('/api/watchlist/agregar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify({
              usuarioId: String(userId),
              peliculaId: String(currentMedia.id),
              tipo: mediaType,
              titulo: currentMedia.title,
              anio: currentMedia.year,
              posterUrl: currentMedia.posterUrl
            })
          });
          const json = await res.json();

          if (!res.ok || json.success === false) {
            throw new Error(json.mensaje || 'Error al agregar a watchlist');
          }

          watchlistDocId = json.item?._id || null;
          actualizarIconoWatchlist(true);
        }
      } catch (error) {
        console.error('Error en toggle watchlist:', error);
        alert(error.message);
      } finally {
        procesandoWatchlist = false;
      }
    });
  }

  if (btnReview) {
    btnReview.addEventListener('click', () => {
      const query = new URLSearchParams({ id: mediaId || '', tipo: mediaType });
      window.location.href = `resena.html?${query.toString()}`;
    });
  }

  if (!mediaId) {
    setError('No se especificó ningún título en la URL (ejemplo: pelicula.html?id=550&tipo=movie).');
    return;
  }

  fetchMediaData(mediaId, mediaType)
    .then((raw) => {
      renderMedia(normalizeMediaPayload(raw, mediaType));
      verificarEstadoWatchlist();
    })
    .catch((error) => setError(error.message));
});

function actualizarIconoWatchlist(enWatchlist) {
  const btn = document.getElementById('watchlist-button');
  if (!btn) return;
  const mark = btn.querySelector('.plus-mark');
  if (!mark) return;

  btn.setAttribute('aria-pressed', String(enWatchlist));
  btn.classList.toggle('is-active', enWatchlist);

  if (enWatchlist) {
    mark.setAttribute('d', 'M47.8 36.2l2.6 2.6 5.2-5.4');
    btn.title = 'Quitar de watchlist';
    btn.setAttribute('aria-label', 'Quitar de watchlist');
  } else {
    mark.setAttribute('d', 'M51.5 31.8v8.4m-4.2-4.2h8.4');
    btn.title = 'Añadir a watchlist';
    btn.setAttribute('aria-label', 'Añadir a watchlist');
  }
}