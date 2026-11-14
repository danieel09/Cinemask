document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("navbar-container");
  if (!contenedor) return;

  const paginaActual = window.location.pathname.split("/").pop() || "home.html";

  contenedor.innerHTML = `
    <header class="navbar">
      <div class="nav-left">
        <a href="home.html" class="brand-logo" title="Volver al inicio">
          <img src="images/logoCinemask.png" alt="Logo CINEMASK" class="logo-img" />
          <span>CINEMASK</span>
        </a>

        <ul class="nav-links">
          <li><a href="home.html" class="${paginaActual === 'home.html' ? 'active' : ''}"></a></li>
          <li><a href="diario.html" class="${paginaActual === 'diario.html' ? 'active' : ''}">Diario</a></li>
          <li><a href="watchlist.html" class="${paginaActual === 'watchlist.html' ? 'active' : ''}">Watchlist</a></li>
          <li><a href="perfil.html" class="${paginaActual === 'perfil.html' ? 'active' : ''}">Perfil</a></li>
          <li><a style="display: none;" href="gestionUsers.html" class="${paginaActual === 'gestionUsers.html' ? 'active' : ''}">Gestión de Usuarios</a></li>
        </ul>
      </div>

      <div class="nav-right">
        <div class="search-box">
          <input
            type="text"
            id="searchInput"
            placeholder="Buscar película o serie..."
            autocomplete="off"
          />
        </div>

        <div class="user-pill" id="userBadge">
          <span>@usuario</span>
        </div>

        <button class="btn-logout" id="logoutBtn">Salir</button>
      </div>
    </header>
  `;

  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
  if (usuarioGuardado) {
    const nombre = usuarioGuardado.username || usuarioGuardado.nombre || "usuario";
    document.getElementById("userBadge").innerHTML = `<span>@${nombre}</span>`;
    if (usuarioGuardado.rol === "administrador") {
      document.querySelector('li a[href="gestionUsers.html"]').style.display = "block";
    }
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
});