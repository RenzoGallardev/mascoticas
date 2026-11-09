/**
 * ARCHIVO: back/control/ControlNotificaciones.js
 * CAPA:    control (lógica y reglas de negocio)
 * HISTORIAS: Crear notificación y Consultar notificación
 * AUTOR:   Niyerlin Muñoz
 *
 * LO LLAMA: server.js
 * LLAMA A:  modelo/Notificacion.js y persistencia/ArchivoJson.js
 *
 * NOTA: en este sprint la notificación solo se GUARDA con estado "Pendiente"
 *       (así lo dice el diagrama). El envío real por Telegram queda para después.
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Notificacion = require('../modelo/Notificacion');

class ControlNotificaciones {

  constructor() {
    this.archivo = new ArchivoJson('notificaciones');
    this.archivoClientes = new ArchivoJson('clientes');
    this.archivoMascotas = new ArchivoJson('mascotas');
  }

  // HU Crear notificación
  async crear(datos) {
    // 1. Valida que estén todos los campos
    if (datos.clienteId == '' || datos.mascotaId == '' || datos.servicio == '' || datos.fecha == '' || datos.hora == '') {
      return { ok: false, mensaje: 'Debe completar todos los campos requeridos' };
    }

    // 2. Regla: el cliente debe tener cuenta de Telegram
    const cliente = await this.archivoClientes.buscarPorId(datos.clienteId);
    if (cliente.telegram == '') {
      return { ok: false, mensaje: 'El cliente no posee cuenta de telegram' };
    }

    // 3. Arma el mensaje con: cliente, mascota, servicio, fecha y hora (regla de la HU)
    const mascota = await this.archivoMascotas.buscarPorId(datos.mascotaId);
    datos.mensaje = 'Hola ' + cliente.nombre + ', le recordamos: ' + datos.servicio +
                    ' para ' + mascota.nombre + ' el ' + datos.fecha + ' a las ' + datos.hora;

    // 4. Crea la notificación (nace con estado "Pendiente") y la guarda
    const nuevaNotificacion = new Notificacion(datos);
    await this.archivo.agregar(nuevaNotificacion);
    return { ok: true, mensaje: 'Notificación creada exitosamente' };
  }

  // HU Consultar notificación: devuelve todas
  async consultar() {
    const notificaciones = await this.archivo.leerTodos();
    return { ok: true, datos: notificaciones };
  }
}

module.exports = ControlNotificaciones;
