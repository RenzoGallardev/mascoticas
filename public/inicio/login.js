/**
 * RESUMEN: Manda usuario y clave al back (con comun.js). Si están bien, guarda la sesión y abre el menú.
 *
 * ARCHIVO: public/inicio/login.js
 * QUÉ HACE: Envía usuario y clave al back. Si son correctos, recuerda la sesión y abre el menú.
 * RECORRIDO: login.html → PantallaLogin.entrar() → conexion.enviar('POST', '/sesion')
 *            → server.js → ControlEmpleados.iniciarSesion() → base de datos Redis (lista "empleados")
 */

// Clase de la pantalla: tiene el método que llama el botón "Entrar" de login.html
class PantallaLogin {

  // Se ejecuta al presionar "Entrar"
  async entrar() {
    const datos = ayudante.leerFormulario('formulario');
    if (datos.usuario == '' || datos.clave == '') {
      alert('Ingrese usuario y clave');
      return;
    }

    const respuesta = await conexion.enviar('POST', '/sesion', datos);
    if (respuesta.ok == false) {
      alert(respuesta.mensaje);
      return;
    }

    sesion.guardarSesion(respuesta.datos); // recuerda nombre y rol
    location.href = 'menu.html';
  }
}


// ---------- Al abrir la pantalla ----------
const pantalla = new PantallaLogin(); // el objeto que usa el botón de login.html
