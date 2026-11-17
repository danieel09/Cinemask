document.addEventListener("DOMContentLoaded", () => {
    const formProfile = document.querySelector('.profile-form');

  const usuarioGuardado = verificarAccesoUsuario({
    contenedorSelector: ".profile-screen",
    titulo: "MI PERFIL",
    mensaje: "Inicia sesión para ver y editar la información de tu perfil."
  });
  if (!usuarioGuardado) return;

  document.getElementById("userBadge").innerHTML = 
    `<span>@${usuarioGuardado.username} (${usuarioGuardado.rol})</span>`;

  document.getElementById("username").value = usuarioGuardado.username || "";
  document.getElementById("nombre").value = usuarioGuardado.nombre || "";
  document.getElementById("edad").value = usuarioGuardado.edad || "";
  document.getElementById("correo").value = usuarioGuardado.correo || "";

  const selectPais = document.getElementById("pais");
  if (usuarioGuardado.pais) {
    const paisNormalizado = usuarioGuardado.pais.trim().toLowerCase();
    const opcion = Array.from(selectPais.options).find(
      opt => opt.value.toLowerCase() === paisNormalizado
    );
    selectPais.value = opcion ? opcion.value : "Otro";
  }

  if (formProfile) {
    formProfile.addEventListener('submit', async (e) => {
      e.preventDefault();

      const datosActualizados = {
        nombre: document.getElementById("nombre").value.trim(),
        edad: Number(document.getElementById("edad").value),
        pais: document.getElementById("pais").value
      };

      try {
      const userId = usuarioGuardado.id || usuarioGuardado._id;
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/usuarios/actualizar/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(datosActualizados)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Error al actualizar perfil");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor");
    }
  });
  }
});