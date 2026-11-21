document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('page-status');
  const layoutEl = document.getElementById('movie-layout');

  const posterImg = document.getElementById('movie-poster');
  const titleEl = document.getElementById('movie-title');
  const yearEl = document.getElementById('movie-year');
  const overviewEl = document.getElementById('movie-overview');

  const durationEl = document.getElementById('movie-duration');
  const directorEl = document.getElementById('movie-director');
  const castEl = document.getElementById('movie-cast');
  const genresEl = document.getElementById('movie-genres');

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id') || params.get('tmdbId');

  const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';
  const FALLBACK_POSTER = 'images/logoCinemask.png';

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

  function resolveYear(movie) {
    if (movie.anioEstreno) return String(movie.anioEstreno);
    if (movie.year) return String(movie.year);
    const rawDate = movie.release_date || movie.fechaEstreno || '';
    const match = String(rawDate).match(/\d{4}/);
    return match ? match[0] : 'Año no disponible';
  }

  function formatDuration(movie) {
    const rawDuration = movie.duracion ?? movie.runtime;

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

  function normalizeMoviePayload(raw) {
    const movie = raw && raw.data ? raw.data : raw?.pelicula || raw || {};
    const credits = movie.credits || raw?.credits || {};

    let director = movie.director;
    if (!director && Array.isArray(credits.crew)) {
      const directors = credits.crew
        .filter((person) => person && person.job === 'Director' && person.name)
        .map((person) => person.name);
      director = directors.length > 0 ? directors : 'No disponible';
    }

    let cast = movie.cast || movie.reparto;
    if (!cast && Array.isArray(credits.cast)) {
      cast = credits.cast
        .slice(0, 8)
        .map((person) => person && person.name)
        .filter(Boolean);
    }

    const genres = movie.generos || movie.genres;

    return {
      id: movie.id || movie._id || movie.tmdbId || movieId,
      title: movie.title || movie.titulo || 'Sin título',
      year: resolveYear(movie),
      overview:
        movie.overview ||
        movie.sinopsis ||
        movie.descripcion ||
        'Sin descripción disponible.',
      posterUrl: resolvePosterUrl(
        movie.poster_path || movie.poster || movie.posterUrl
      ),
      duration: formatDuration(movie),
      director: formatList(director, 'No disponible'),
      cast: formatList(cast, 'No disponible'),
      genres: formatList(genres, 'No disponible')
    };
  }

  async function fetchMovieData(id) {
    const response = await fetch(`/api/peliculas/${encodeURIComponent(id)}`);
    let json;

    try {
      json = await response.json();
    } catch (_) {
      throw new Error('La respuesta del servidor no tiene un formato JSON válido.');
    }

    if (!response.ok || json.success === false) {
      throw new Error(
        json.message || 'No se pudo obtener la información de la película desde la API.'
      );
    }

    return json;
  }

  function renderMovie(movie) {
    document.title = `${movie.title} | CINEMASK`;

    if (posterImg) {
      posterImg.src = movie.posterUrl;
      posterImg.alt = `Póster de ${movie.title}`;
      posterImg.onerror = () => {
        posterImg.onerror = null;
        posterImg.src = FALLBACK_POSTER;
      };
    }

    if (titleEl) titleEl.textContent = movie.title;
    if (yearEl) yearEl.textContent = movie.year;
    if (overviewEl) overviewEl.textContent = movie.overview;

    if (durationEl) durationEl.textContent = movie.duration;
    if (directorEl) directorEl.textContent = movie.director;
    if (castEl) castEl.textContent = movie.cast;
    if (genresEl) genresEl.textContent = movie.genres;

    if (statusEl) statusEl.hidden = true;
    if (layoutEl) layoutEl.hidden = false;
  }

  if (!movieId) {
    setError('No se especificó ninguna película en la URL (ejemplo: pelicula.html?id=550).');
    return;
  }

  fetchMovieData(movieId)
    .then((raw) => renderMovie(normalizeMoviePayload(raw)))
    .catch((error) => setError(error.message));
});