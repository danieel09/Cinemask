
function verificarAccesoUsuario({
  contenedorSelector = "main",
  titulo = "ACCESO RESTRINGIDO",
  mensaje = "Inicia sesión para acceder a esta sección.",
  textoBoton = "Iniciar Sesión",
  urlLogin = "index.html"
} = {}) {
  let usuarioGuardado = null;

  try {
    usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
  } catch (e) {
    usuarioGuardado = null;
  }

  if (!usuarioGuardado || usuarioGuardado.role === "guest") {
    const contenedor = document.querySelector(contenedorSelector);
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="invitado-wrapper">
          <section class="invitado-card">
            <h1 class="invitado-titulo">${titulo}</h1>
            <p class="invitado-mensaje">${mensaje}</p>
            <a href="${urlLogin}" class="invitado-boton">${textoBoton}</a>
          </section>
        </div>
      `;
    }
    return null;
  }

  return usuarioGuardado;
}