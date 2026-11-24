/**
 * RESUMEN: El molde de una notificación: solo dice qué datos tiene. Lo usa ControlNotificaciones.
 *
 * ARCHIVO: back/modelo/Notificacion.js
 * CAPA:    modelo (entidad)
 * QUÉ ES:  Define QUÉ DATOS tiene una notificación para un cliente.
 * LA USA:  back/control/ControlNotificaciones.js
 * HISTORIA: Crear notificación — Autor: Niyerlin Muñoz
 */
class Notificacion {
  constructor(datos) {
    this.clienteId = datos.clienteId;
    this.mascotaId = datos.mascotaId;
    this.servicio = datos.servicio;   // 'Cita médica' o 'Peluquería'
    this.fecha = datos.fecha;
    this.hora = datos.hora;
    this.mensaje = datos.mensaje;     // el texto que se le enviaría al cliente por Telegram
    this.estado = 'Pendiente';        // regla de la HU: pendiente, enviada o fallida. Nace "Pendiente".
  }
}

module.exports = Notificacion;
