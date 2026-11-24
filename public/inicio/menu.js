/**
 * RESUMEN: Saluda al usuario y esconde los botones que su rol no puede usar.
 *
 * ARCHIVO: public/inicio/menu.js
 * QUÉ HACE: Saluda al usuario y esconde los módulos que su rol no puede usar.
 *           (Matriz de impacto: Clientes y Notificaciones son solo de la secretaria)
 */

// Clase de la pantalla del menú principal
class PantallaMenu {

  // Saluda y esconde los botones que el rol no puede usar
  mostrarMenu() {
    const usuario = sesion.leerSesion();
    document.getElementById('bienvenida').textContent = 'Bienvenido(a), ' + usuario.nombre;

    if (usuario.rol != 'secretaria') {
      const botones = document.querySelectorAll('.solo-secretaria'); // busca los botones marcados
      for (const boton of botones) {
        boton.hidden = true;
      }
    }
  }
}


// ---------- Al abrir la pantalla ----------
const pantalla = new PantallaMenu(); // el objeto de menu.html
sesion.exigirSesion(['secretaria', 'veterinario']);
ayudante.dibujarEncabezado();
pantalla.mostrarMenu();
