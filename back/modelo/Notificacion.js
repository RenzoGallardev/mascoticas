/**
 * RESUMEN: Modelo de Notificaciones. Define los datos de la notificación, valida que el cliente tenga Telegram y accede a la BD con ArchivoJson.
 *
 * ARCHIVO:  back/modelo/Notificacion.js
 * CAPA MVC: Modelo (entidad + reglas de negocio + acceso a datos)
 * HISTORIAS: Crear notificación y Consultar notificación
 * AUTOR:    Niyerlin Muñoz
 *
 * LO LLAMA: back/control/ControlNotificaciones.js
 * LLAMA A:  back/modelo/Cliente.js, back/modelo/Mascota.js y back/persistencia/ArchivoJson.js
 *
 * NOTA: en este sprint la notificación solo se GUARDA con estado "Pendiente"
 *       (así lo dice el diagrama). El envío real por Telegram queda para después.
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Cliente = require('./Cliente');
const Mascota = require('./Mascota');

const archivo = new ArchivoJson('notificaciones');

class Notificacion {
  constructor(datos) {
    this.clienteId = datos.clienteId;
    this.mascotaId = datos.mascotaId;
    this.servicio = datos.servicio; // 'Cita médica' o 'Peluquería'
    this.fecha = datos.fecha;
    this.hora = datos.hora;
    this.mensaje = datos.mensaje;   // el texto que se le enviaría al cliente por Telegram
    this.estado = 'Pendiente';      // regla de la HU: pendiente, enviada o fallida. Nace "Pendiente".
  }

  // HU Crear notificación: valida campos → revisa Telegram del cliente → arma mensaje → guarda
  static async crear(datos) {
    // 1. Valida que estén todos los campos obligatorios
    if (!datos.clienteId || !datos.mascotaId || !datos.servicio || !datos.fecha || !datos.hora) {
      return { ok: false, mensaje: 'Debe completar todos los campos requeridos' };
    }

    // 2. Regla de negocio: el cliente debe existir y tener cuenta de Telegram
    const cliente = await Cliente.buscarPorId(datos.clienteId);
    if (cliente == null || !cliente.telegram) {
      return { ok: false, mensaje: 'El cliente no posee cuenta de telegram' };
    }

    // 3. Arma el mensaje con: cliente, mascota, servicio, fecha y hora (regla de la HU)
    const mascota = await Mascota.buscarPorId(datos.mascotaId);
    if (mascota == null) {
      return { ok: false, mensaje: 'La mascota seleccionada no existe' };
    }

    const mensaje = 'Hola ' + cliente.nombre + ', le recordamos: ' + datos.servicio +
                    ' para ' + mascota.nombre + ' el ' + datos.fecha + ' a las ' + datos.hora;

    // 4. Crea la entidad Notificacion (nace con estado "Pendiente") y la guarda
    const nuevaNotificacion = new Notificacion({ ...datos, mensaje });
    await archivo.agregar(nuevaNotificacion);
    return { ok: true, mensaje: 'Notificación creada exitosamente' };
  }

  // HU Consultar notificación: devuelve todas las notificaciones registradas
  static async consultar() {
    const notificaciones = await archivo.leerTodos();
    return { ok: true, datos: notificaciones };
  }
}

module.exports = Notificacion;
