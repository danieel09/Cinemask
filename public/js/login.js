document.addEventListener('DOMContentLoaded', () => {
  const formSignin = document.querySelector('.signin-form');
  const btnGuest = document.getElementById('btnGuest');
  const btnSignup = document.getElementById('btnSignup');

  if (formSignin) {
    formSignin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const correo = document.getElementById('correo').value.trim();
      const password = document.getElementById('password').value;

      try {
        const respuesta = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo, password })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
          alert(data.mensaje || 'Error al iniciar sesión');
          return;
        }

        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        //window.location.href = '/password.html';

      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
      }
    });
  }

  if (btnGuest) {
    btnGuest.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('usuario', JSON.stringify({ role: 'guest', nombre: 'Invitado' }));
      //window.location.href = '/inicio.html';
    });
  }

  if(btnSignup) {
    btnSignup.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/signup.html';
    });
  }
});