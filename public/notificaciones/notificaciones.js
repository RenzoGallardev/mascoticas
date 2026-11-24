/**
 * RESUMEN: El código de la pantalla Notificaciones: valida el formulario y lo manda al back con comun.js. Lo activan los botones de notificaciones.html.
 *
 * ARCHIVO: public/notificaciones/notificaciones.js
 * HISTORIAS: Crear notificación y Consultar notificación
 * AUTOR:   Niyerlin Muñoz
 *
 * RECORRIDO DE "CREAR NOTIFICACIÓN":
 *   1. Interfaz ............ notificaciones.html
 *   2. Botón OK ............ PantallaNotificaciones.guardarNotificacion()   (este archivo)
 *   3. Valida campos ....... ValidadorNotificacion.validar()
 *   4. Front → back ........ conexion.enviar('POST', '/notificaciones')
 *   5. Recibe en el back ... app.post('/api/notificaciones')   (server.js)    
 *   6. Lógica .............. ControlNotificaciones.crear()     (el cliente debe tener Telegram)
 *   7. Guarda .............. ArchivoJson.agregar()  →  base de datos Redis, lista "notificaciones" (estado "Pendiente")
 */

class ValidadorNotificacion {
  validar(datos) {
    const errores = [];
    if (datos.clienteId == '') {
      errores.push({ campo: 'clienteId', mensaje: 'Seleccione el cliente' });
    }
    if (datos.mascotaId == '') {
      errores.push({ campo: 'mascotaId', mensaje: 'Seleccione la mascota' });
    }
    if (datos.servicio == '') {
      errores.push({ campo: 'servicio', mensaje: 'Seleccione el tipo de servicio' });
    }
    if (datos.fecha == '') {
      errores.push({ campo: 'fecha', mensaje: 'Seleccione la fecha' });
    }
    if (datos.hora == '') {
      errores.push({ campo: 'hora', mensaje: 'Seleccione la hora' });
    }
    return errores;
  }
}


// Clase de la pantalla: tiene los métodos que llaman los botones de notificaciones.html
class PantallaNotificaciones {

  constructor() {
    this.listaClientes = []; // se guardan aquí para revisar si tienen Telegram
  }


  // Abre el formulario. Si no hay clientes registrados, avisa (como dice el diagrama)
  async abrirFormularioNotificacion() {
    const respuesta = await conexion.enviar('GET', '/clientes?buscar=');
    this.listaClientes = respuesta.datos;

    if (this.listaClientes.length == 0) {
      alert('No existe cliente ni mascota registrada');
      return;
    }

    const opciones = [];
    for (const cliente of this.listaClientes) {
      opciones.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
    }
    ayudante.mostrarFormulario('seccionFormulario', 'formulario');
    ayudante.llenarSelect('selectCliente', opciones);
    ayudante.llenarSelect('selectMascota', []);
  }


  // Al elegir un cliente: revisa que tenga Telegram y carga sus mascotas
  async alElegirCliente() {
    const clienteId = document.getElementById('selectCliente').value;

    // Busca el cliente elegido en la lista
    let clienteElegido = null;
    for (const cliente of this.listaClientes) {
      if (cliente.id == clienteId) {
        clienteElegido = cliente;
      }
    }

    // Regla: el cliente debe tener cuenta de Telegram
    if (clienteElegido != null && clienteElegido.telegram == '') {
      alert('El cliente no posee cuenta de telegram');
      document.getElementById('selectCliente').value = '';
      ayudante.llenarSelect('selectMascota', []);
      return;
    }

    const respuesta = await conexion.enviar('GET', '/mascotas?buscar=&clienteId=' + clienteId);
    const opciones = [];
    for (const mascota of respuesta.datos) {
      opciones.push({ valor: mascota.id, texto: mascota.nombre + ' (' + mascota.especie + ')' });
    }
    ayudante.llenarSelect('selectMascota', opciones);
  }


  // HU Crear notificación: se ejecuta al presionar OK
  async guardarNotificacion() {
    const datos = ayudante.leerFormulario('formulario');

    const errores = new ValidadorNotificacion().validar(datos);
    if (ayudante.mostrarErrores('formulario', errores) == false) {
      return;
    }

    if (confirm('¿Desea crear la notificación?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/notificaciones', datos);
    alert(respuesta.mensaje); // "Notificación creada exitosamente" o el error

    if (respuesta.ok) {
      ayudante.ocultarFormulario('seccionFormulario');
      this.consultarNotificaciones();
    }
  }


  // HU Consultar notificación
  async consultarNotificaciones() {
    const respuesta = await conexion.enviar('GET', '/notificaciones');

    ayudante.dibujarTabla('tabla', respuesta.datos, [
      { titulo: 'Fecha',    campo: 'fecha' },
      { titulo: 'Hora',     campo: 'hora' },
      { titulo: 'Servicio', campo: 'servicio' },
      { titulo: 'Mensaje',  campo: 'mensaje' },
      { titulo: 'Estado',   campo: 'estado' }
    ]);
  }
}


// ---------- Al abrir la pantalla ----------
const pantalla = new PantallaNotificaciones(); // el objeto que usan los botones de notificaciones.html
sesion.exigirSesion(['secretaria']);
ayudante.dibujarEncabezado();
pantalla.consultarNotificaciones();
