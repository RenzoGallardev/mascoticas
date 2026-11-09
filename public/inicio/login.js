/**
 * ARCHIVO: public/inicio/login.js
 * QUÉ HACE: Envía usuario y clave al back. Si son correctos, recuerda la sesión y abre el menú.
 * RECORRIDO: login.html → entrar() → conexion.enviar('POST', '/sesion')
 *            → server.js → ControlEmpleados.iniciarSesion() → base de datos Redis (lista "empleados")
 */

// Se ejecuta al presionar "Entrar"
async function entrar() {
  const datos = leerFormulario('formulario');
  if (datos.usuario == '' || datos.clave == '') {
    alert('Ingrese usuario y clave');
    return;
  }

  const respuesta = await conexion.enviar('POST', '/sesion', datos);
  if (respuesta.ok == false) {
    alert(respuesta.mensaje);
    return;
  }

  guardarSesion(respuesta.datos); // recuerda nombre y rol
  location.href = 'menu.html';
}
