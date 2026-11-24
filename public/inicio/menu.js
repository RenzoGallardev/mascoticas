/**
 * RESUMEN: Saluda al usuario y esconde los botones que su rol no puede usar.
 *
 * ARCHIVO: public/inicio/menu.js
 * QUÉ HACE: Saluda al usuario y esconde los módulos que su rol no puede usar.
 *           (Matriz de impacto: Clientes y Notificaciones son solo de la secretaria)
 */

exigirSesion(['secretaria', 'veterinario']);
dibujarEncabezado();

const sesion = leerSesion();
document.getElementById('bienvenida').textContent = 'Bienvenido(a), ' + sesion.nombre;

if (sesion.rol != 'secretaria') {
  const botones = document.querySelectorAll('.solo-secretaria'); // busca los botones marcados
  for (const boton of botones) {
    boton.hidden = true;
  }
}
