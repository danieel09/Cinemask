document.addEventListener('DOMContentLoaded', () => {
  const formSignup = document.querySelector('.signup-form');
  const navbar = document.getElementById('navbar-container');

  const contenedorRol = document.getElementById('contenedorRol');
  const btnlogin = document.getElementById('btnsignup-in');
  const btnsignup = document.getElementById('btnsignup');
  const h1Signup = document.getElementById('h1Signup');
  const titleSignup = document.getElementById('titleSignup');

  const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuarioSesion && usuarioSesion.rol === 'administrador';

  if (esAdmin && contenedorRol) {
    contenedorRol.style.display = 'block';
    btnlogin.style.display = 'none';
    btnsignup.textContent = 'Registrar';
    h1Signup.textContent = 'Registrar Usuario';
    titleSignup.textContent = 'Registrar Usuario | CINEMASK';
    navbar.style.display = 'block';
  }

  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const edad = document.getElementById('edad').value.trim();
      const pais = document.getElementById('pais').value.trim();
      const correo = document.getElementById('correo').value.trim();
      const password = document.getElementById('password').value;
      const username = document.getElementById('username').value.trim();
      const rol = document.getElementById('rol').value.trim();

      try {
        const respuesta = await fetch('/api/usuarios/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, edad, pais, correo, password, username, rol })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
          alert(data.mensaje || 'Error al registrar usuario');
          return;
        }

        if (esAdmin) {
          alert('Usuario registrado correctamente');
          window.location.href = '/gestionUsers.html';
        } else {
          alert('Cuenta creada con éxito. Ahora inicia sesión.');
          window.location.href = '/index.html';
        }

      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
      }
    });
  }
});