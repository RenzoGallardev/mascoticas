/**
 * ARCHIVO: front/notificaciones/notificaciones.js
 * HISTORIAS: Crear notificación y Consultar notificación
 * AUTOR:   Niyerlin Muñoz
 *
 * RECORRIDO DE "CREAR NOTIFICACIÓN":
 *   1. Interfaz ............ notificaciones.html
 *   2. Valida campos ....... ValidadorNotificacion.validar()
 *   3. Front → back ........ conexion.enviar('POST', '/notificaciones')
 *   4. Recibe en el back ... app.post('/api/notificaciones')   (back/server.js)
 *   5. Lógica .............. ControlNotificaciones.crear()     (el cliente debe tener Telegram)
 *   6. Guarda .............. ArchivoJson.agregar()  →  back/datos/notificaciones.json (estado "Pendiente")
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


// ---------- Al abrir la pantalla ----------
exigirSesion(['secretaria']);
dibujarEncabezado();
consultarNotificaciones();

let listaClientes = []; // se guardan aquí para revisar si tienen Telegram


// Abre el formulario. Si no hay clientes registrados, avisa (como dice el diagrama)
async function abrirFormularioNotificacion() {
  const respuesta = await conexion.enviar('GET', '/clientes?buscar=');
  listaClientes = respuesta.datos;

  if (listaClientes.length == 0) {
    alert('No existe cliente ni mascota registrada');
    return;
  }

  const opciones = [];
  for (const cliente of listaClientes) {
    opciones.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
  }
  mostrarFormulario('seccionFormulario', 'formulario');
  llenarSelect('selectCliente', opciones);
  llenarSelect('selectMascota', []);
}


// Al elegir un cliente: revisa que tenga Telegram y carga sus mascotas
async function alElegirCliente() {
  const clienteId = document.getElementById('selectCliente').value;

  // Busca el cliente elegido en la lista
  let clienteElegido = null;
  for (const cliente of listaClientes) {
    if (cliente.id == clienteId) {
      clienteElegido = cliente;
    }
  }

  // Regla: el cliente debe tener cuenta de Telegram
  if (clienteElegido != null && clienteElegido.telegram == '') {
    alert('El cliente no posee cuenta de telegram');
    document.getElementById('selectCliente').value = '';
    llenarSelect('selectMascota', []);
    return;
  }

  const respuesta = await conexion.enviar('GET', '/mascotas?buscar=&clienteId=' + clienteId);
  const opciones = [];
  for (const mascota of respuesta.datos) {
    opciones.push({ valor: mascota.id, texto: mascota.nombre + ' (' + mascota.especie + ')' });
  }
  llenarSelect('selectMascota', opciones);
}


// HU Crear notificación: se ejecuta al presionar OK
async function guardarNotificacion() {
  const datos = leerFormulario('formulario');

  const errores = new ValidadorNotificacion().validar(datos);
  if (mostrarErrores('formulario', errores) == false) {
    return;
  }

  if (confirm('¿Desea crear la notificación?') == false) {
    return;
  }

  const respuesta = await conexion.enviar('POST', '/notificaciones', datos);
  alert(respuesta.mensaje); // "Notificación creada exitosamente" o el error

  if (respuesta.ok) {
    ocultarFormulario('seccionFormulario');
    consultarNotificaciones();
  }
}


// HU Consultar notificación
async function consultarNotificaciones() {
  const respuesta = await conexion.enviar('GET', '/notificaciones');

  dibujarTabla('tabla', respuesta.datos, [
    { titulo: 'Fecha',    campo: 'fecha' },
    { titulo: 'Hora',     campo: 'hora' },
    { titulo: 'Servicio', campo: 'servicio' },
    { titulo: 'Mensaje',  campo: 'mensaje' },
    { titulo: 'Estado',   campo: 'estado' }
  ]);
}
