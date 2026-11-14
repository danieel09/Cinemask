document.addEventListener('DOMContentLoaded', () => {
  const formRecovery = document.querySelector('.recovery-form');

  if (formRecovery) {
    formRecovery.addEventListener('submit', async (e) => {
      e.preventDefault();
      const correo = document.getElementById('correo').value.trim();

      try {
        const respuesta = await fetch('/api/auth/olvidar-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
          alert(data.mensaje || 'Error al enviar el código de recuperación');
          return;
        }

        alert('Revisa tu bandeja de entrada en Gmail para obtener el código de recuperación');

        sessionStorage.setItem('correoRecuperacion', correo);

        window.location.href = '/correoRecuperar.html';

      } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión con el servidor');
      }
    });
  }
});