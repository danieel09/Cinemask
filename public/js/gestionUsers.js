document.addEventListener('DOMContentLoaded', async () => {
  const cuerpoTabla = document.getElementById('users-table-body');
  const registroBtn = document.getElementById('add-user-button');
  const token = localStorage.getItem('token');

  try {
    const res = await fetch("/api/usuarios/obtener", {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();
    const usuarios = Array.isArray(data) ? data : (data.usuarios || data.data || []);

    if (usuarios.length === 0) {
      cuerpoTabla.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay usuarios registrados</td></tr>`;
      return;
    }

    cuerpoTabla.innerHTML = usuarios.map((u) => `
      <tr>
        <td>${u.nombre || "-"}</td>
        <td>@${u.username}</td>
        <td>${u.correo}</td>
        <td>${u.rol}</td>
        <td>
          <button style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer;" class="btn-eliminar" onclick="eliminarUsuario('${u._id}', this)">Eliminar</button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Error cargando usuarios:", error);
    cuerpoTabla.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error al cargar los datos</td></tr>`;
  }

  if (registroBtn) {
    registroBtn.addEventListener('click', () => {
      window.location.href = '/signup.html';
    });
  }
});

async function eliminarUsuario(id, boton) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/usuarios/eliminar/${id}`, { 
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.mensaje || "Error al eliminar");
        return;
      }

      if (boton) boton.closest("tr").remove();
    } catch (error) {
      console.error("Error:", error);
    }
  }