require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const rutasPelis = require("./routes/peliculas");
app.use("/api/peliculas", rutasPelis);

const rutasSeries = require("./routes/series");
app.use("/api/series", rutasSeries);

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`API REST corriendo en http://localhost:${PORT}`);
});
