require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const conectarDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const rutasPelis = require("./src/routes/PeliculaRoute");
const rutasSeries = require("./src/routes/SerieRoute");
const rutasAuth = require("./src/routes/authRoute");

app.use("/api/peliculas", rutasPelis);
app.use("/api/series", rutasSeries);
app.use('/api/auth', rutasAuth);

// Iniciar base de datos y servidor
async function iniciarServidor() {
  await conectarDB();
  app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
  });
}

iniciarServidor();

