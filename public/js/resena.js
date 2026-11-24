document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id') || params.get('tmdbId');
  const mediaType = (params.get('tipo') || 'movie').toLowerCase();

  const titleEl = document.getElementById('movie-title');
  const yearEl = document.getElementById('movie-year');
  const posterEl = document.getElementById('movie-poster');
  const posterPlaceholder = document.getElementById('poster-placeholder');

  const form = document.getElementById('review-form');
  const submitButton = document.getElementById('submit-review');
  const statusEl = document.getElementById('form-status');
  const ratingInput = document.getElementById('rating-value');
  const ratingStars = [...document.querySelectorAll('.rating-star')];
  const dateInput = document.getElementById('viewed-date');
  const includeComment = document.getElementById('include-comment');
  const commentInput = document.getElementById('review-comment');

  let currentMovie = null;

  function setStatus(message, type = '') {
    statusEl.textContent = message;
    statusEl.className = `form-status${type ? ` is-${type}` : ''}`;
  }

  function getCurrentLocalDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
  }

  function configurarCalendarioSinFuturo() {
    const hoy = getCurrentLocalDate();
    dateInput.max = hoy;
    dateInput.value = hoy;
  }

  function formatYear(movie) {
    const date = movie.release_date || movie.first_air_date || movie.fechaEstreno || '';
    const match = String(date).match(/\d{4}/);
    return movie.anioEstreno || movie.year || (match ? match[0] : 'Año no disponible');
  }

  function resolvePoster(rawPoster) {
    if (typeof rawPoster !== 'string' || !rawPoster.trim()) return '';
    const value = rawPoster.trim();
    if (/^https?:\/\//i.test(value)) return value;
    return `https://image.tmdb.org/t/p/w500/${value.replace(/^\/+/, '')}`;
  }

  function updateRating(value) {
    ratingInput.value = String(value);
    ratingStars.forEach((star) => {
      const selected = Number(star.dataset.rating) <= value;
      star.classList.toggle('is-selected', selected);
      star.setAttribute('aria-pressed', String(Number(star.dataset.rating) === value));
    });
  }

  async function loadMovie() {
    if (!movieId) {
      throw new Error('No se indicó una película. Vuelve a la ficha y pulsa “Reseñar película”.');
    }

    const resource = mediaType === 'tv' ? 'series' : 'peliculas';
    const response = await fetch(`/api/${resource}/${encodeURIComponent(movieId)}`);
    const json = await response.json();

    if (!response.ok || json.success === false) {
      throw new Error(json.message || 'No se pudo cargar la información de la película.');
    }

    const movie = json.data || json.pelicula || json;
    currentMovie = {
      id: movie._id || movie.peliculaId || movie.id || movieId,
      title: movie.title || movie.name || movie.titulo || 'Sin título',
      year: formatYear(movie),
      posterUrl: resolvePoster(movie.poster_path || movie.posterUrl || movie.poster)
    };

    titleEl.textContent = currentMovie.title;
    yearEl.textContent = currentMovie.year;
    document.title = `Reseña de ${currentMovie.title} | CINEMASK`;

    if (currentMovie.posterUrl) {
      posterEl.src = currentMovie.posterUrl;
      posterEl.alt = `Póster de ${currentMovie.title}`;
      posterEl.hidden = false;
      posterPlaceholder.hidden = true;
      posterEl.addEventListener('error', () => {
        posterEl.hidden = true;
        posterPlaceholder.hidden = false;
        posterPlaceholder.textContent = 'Póster no disponible';
      }, { once: true });
    } else {
      posterPlaceholder.textContent = 'Póster no disponible';
    }

    submitButton.disabled = false;
  }

  configurarCalendarioSinFuturo();

  ratingStars.forEach((star, index) => {
    star.addEventListener('click', () => updateRating(Number(star.dataset.rating)));
    star.addEventListener('mouseenter', () => {
      ratingStars.forEach((item, itemIndex) => item.classList.toggle('is-preview', itemIndex <= index));
    });
    star.addEventListener('focus', () => {
      ratingStars.forEach((item, itemIndex) => item.classList.toggle('is-preview', itemIndex <= index));
    });
    star.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + ratingStars.length) % ratingStars.length;
      ratingStars[nextIndex].focus();
      updateRating(nextIndex + 1);
    });
  });

  document.querySelector('.rating-stars').addEventListener('mouseleave', () => {
    ratingStars.forEach((star) => star.classList.remove('is-preview'));
  });

  includeComment.addEventListener('change', () => {
    commentInput.disabled = !includeComment.checked;
    if (!includeComment.checked) {
      commentInput.value = '';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentMovie) return;

    const rating = Number(ratingInput.value);
    if (!rating) {
      setStatus('Selecciona una calificación de 1 a 5 estrellas.', 'error');
      ratingStars[0].focus();
      return;
    }

    const formData = new FormData(form);
    const fechaVista = String(formData.get('fechaVista') || '').trim();
    const hoy = getCurrentLocalDate();

    if (!fechaVista) {
      setStatus('Selecciona la fecha en que viste la película.', 'error');
      dateInput.focus();
      return;
    }

    if (fechaVista > hoy) {
      dateInput.value = hoy;
      setStatus('No puedes seleccionar una fecha futura.', 'error');
      dateInput.focus();
      return;
    }

    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch (_) {
      user = null;
    }

    const userId = user?.id || user?._id;
    const username = user?.username || user?.nombreUsuario || user?.nombre;
    if (!userId || !username) {
      setStatus('Inicia sesión para publicar una reseña.', 'error');
      return;
    }

    const comentarioFinal = includeComment.checked
      ? String(formData.get('comentario') || '').trim()
      : '';

    const parsedYear = Number.parseInt(currentMovie.year, 10);

    const payload = {
      usuarioId: String(userId),
      username: String(username),
      peliculaId: String(currentMovie.id),
      titulo: currentMovie.title,
      ...(Number.isFinite(parsedYear) ? { anio: parsedYear } : {}),
      ...(currentMovie.posterUrl ? { posterUrl: currentMovie.posterUrl } : {}),
      calificacion: rating,
      comentario: comentarioFinal,
      contieneSpoilers: formData.get('contieneSpoilers') === 'true',
      fechaVista,
      horaVista: new Date().toTimeString().slice(0, 5)
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando…';
    setStatus('Enviando tu reseña…');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/resenas/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const json = await response.json();

      if (!response.ok || json.success === false) {
        throw new Error(json.mensaje || json.message || 'No se pudo publicar la reseña.');
      }

      setStatus('¡Tu reseña se publicó correctamente!', 'success');
      form.reset();
      includeComment.checked = true;
      commentInput.disabled = false;
      configurarCalendarioSinFuturo();
      updateRating(0);

      window.location.href = 'home.html';
      
    } catch (error) {
      setStatus(error.message || 'Ocurrió un error al enviar la reseña.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar';
    }
  });

  loadMovie().catch((error) => {
    titleEl.textContent = 'No se pudo cargar la película';
    posterPlaceholder.textContent = 'Información no disponible';
    setStatus(error.message, 'error');
  });
});