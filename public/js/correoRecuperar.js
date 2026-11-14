document.addEventListener('DOMContentLoaded', () => {
  const formRecuperar = document.querySelector('.recovery-form');
  
  const signinBtn = document.getElementById('signin-link');
  const correoGuardado = sessionStorage.getItem('correoRecuperacion');

  signinBtn.style.visibility = 'hidden';

  if (!correoGuardado) {
    alert('Por favor, ingresa tu correo primero.');
    window.location.href = '/correo.html';
    return;
  }

  if (formRecuperar) {
    formRecuperar.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const codigo = document.getElementById('codigo').value.trim();
      const nuevaPassword = document.getElementById('nueva-contrasena').value;

      try {
        const respuesta = await fetch('/api/auth/restablecer-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: correoGuardado,
            codigo: codigo,
            nuevaPassword: nuevaPassword
          })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
          alert(data.mensaje || 'Error al actualizar la contraseña');
          return;
        }
        alert('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión con tu nueva contraseña.');
        sessionStorage.removeItem('correoRecuperacion');
        signinBtn.style.visibility = 'visible';

      } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión con el servidor');
      }
    });
  }
});