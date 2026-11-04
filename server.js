require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint propio para obtener películas populares usando FETCH nativo
app.get('/api/peliculas/populares', async (req, res) => {
  try {
    const { page = 1, language = 'es-ES' } = req.query;
    
    // Construimos la URL con los parámetros necesarios
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
    console.error('Error en el servidor:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la petición',
      error: error.message
    });
  }
});

// Endpoint para buscar películas usando FETCH nativo
app.get('/api/peliculas/buscar', async (req, res) => {
  try {
    const { query, page = 1, language = 'es-ES' } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'El parámetro "query" es obligatorio.' });
    }

    const url = `${process.env.TMDB_BASE_URL}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}&page=${page}`;

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
});

app.listen(PORT, () => {
  console.log(`API REST corriendo sin Axios en http://localhost:${PORT}`);
});
