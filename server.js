require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const conectarDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const rutasPelis = require("./src/routes/PeliculaRoute");
const rutasSeries = require("./src/routes/SerieRoute");
const rutasAuth = require("./src/routes/authRoute");
const rutasUsuarios = require("./src/routes/usuarioRoute");
const rutasWatchlist = require("./src/routes/watchlistRoute");

app.use("/api/usuarios", rutasUsuarios);
app.use("/api/peliculas", rutasPelis);
app.use("/api/series", rutasSeries);
app.use('/api/auth', rutasAuth);
app.use('/api/watchlist', rutasWatchlist);

async function iniciarServidor() {
  await conectarDB();
  app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
  });

  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`¡Conectado exitosamente a la BD: ${mongoose.connection.name}!`);
  })
  .catch((err) => console.error('Error de conexión:', err));
}

iniciarServidor();

