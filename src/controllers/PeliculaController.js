
exports.obtenerPopulares = async (req, res) => {
  try {
    const { page = 1, language = 'es-ES' } = req.query;
    const url = `${process.env.TMDB_BASE_URL}/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=${language}&page=${page}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'Error devuelto por TMDb',
        error: data
      });
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error en obtenerPopulares:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la petición',
      error: error.message
    });
  }
};

exports.buscarPelicula = async (req, res) => {
  try {
    const { query, page = 1, language = 'es-ES' } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "query" es obligatorio.'
      });
    }

    const url = `${process.env.TMDB_BASE_URL}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}&page=${page}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'Error devuelto por TMDb',
        error: data
      });
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error en buscarPelicula:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
};

const consultarTmdbPeliculas = async (endpoint, req, res) => {
  try {
    const { page = 1, language = 'es-ES' } = req.query;
    const url = `${process.env.TMDB_BASE_URL}${endpoint}?api_key=${process.env.TMDB_API_KEY}&language=${language}&page=${page}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'Error devuelto por TMDb',
        error: data
      });
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la petición',
      error: error.message
    });
  }
};

exports.obtenerTendencia = (req, res) => {
  consultarTmdbPeliculas('/trending/movie/week', req, res);
};

exports.obtenerMejorCalificadas = (req, res) => {
  consultarTmdbPeliculas('/movie/top_rated', req, res);
};

exports.obtenerCartelera = (req, res) => {
  consultarTmdbPeliculas('/movie/now_playing', req, res);
};