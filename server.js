require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const rutasPelis = require("./src/routes/PeliculaRoute");
const rutasSeries = require("./src/routes/SerieRoute");

app.use("/api/peliculas", rutasPelis);
app.use("/api/series", rutasSeries);

app.listen(PORT, () => {
  console.log(`API CINEMASK REST corriendo en http://localhost:${PORT}`);
});
