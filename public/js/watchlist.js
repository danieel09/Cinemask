document.addEventListener("DOMContentLoaded", () => {
  const usuarioGuardado = verificarAccesoUsuario({
    contenedorSelector: ".main-container",
    titulo: "MI WATCHLIST",
    mensaje: "Inicia sesión para guardar y ver tus películas y series pendientes."
  });
});