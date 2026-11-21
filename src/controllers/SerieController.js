exports.obtenerPopulares = async (req, res) => {
  try {
    const { page = 1, language = 'es-ES' } = req.query;
    
    const url = `${process.env.TMDB_BASE_URL}/tv/popular?api_key=${process.env.TMDB_API_KEY}&language=${language}&page=${page}`;

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
    console.error('Error en el servidor:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la petición',
      error: error.message
    });
  }
};

exports.buscarSerie = async (req, res) => {
  try {
    const { query, page = 1, language = 'es-ES' } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'El parámetro "query" es obligatorio.' });
    }

    const url = `${process.env.TMDB_BASE_URL}/search/tv?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}&page=${page}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
};

exports.obtenerTendencia = async (req, res) => {
  try {
    const { page = 1, language = 'es-ES' } = req.query;
    const url = `${process.env.TMDB_BASE_URL}/trending/tv/week?api_key=${process.env.TMDB_API_KEY}&language=${language}&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) return res.status(response.status).json({ success: false, message: 'Error de TMDb', error: data });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.obtenerDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'es-ES' } = req.query;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'El identificador de la serie no es válido.'
      });
    }

    const url = `${process.env.TMDB_BASE_URL}/tv/${id}?api_key=${process.env.TMDB_API_KEY}&language=${encodeURIComponent(language)}&append_to_response=credits`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'No se pudo obtener el detalle de la serie.',
        error: data
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error en obtenerDetalle:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la petición de detalle.',
      error: error.message
    });
  }
};