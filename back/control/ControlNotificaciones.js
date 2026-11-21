/**
 * RESUMEN: Controlador de Notificaciones. Recibe peticiones HTTP, delega al Modelo Notificacion y responde JSON.
 *
 * ARCHIVO:  back/control/ControlNotificaciones.js
 * CAPA MVC: Controlador
 * HISTORIAS: Crear notificación y Consultar notificación
 * AUTOR:    Niyerlin Muñoz
 */

const Notificacion = require('../modelo/Notificacion');

class ControlNotificaciones {
  async crear(req, res) {
    res.json(await Notificacion.crear(req.body));
  }

  async consultar(req, res) {
    res.json(await Notificacion.consultar());
  }
}

module.exports = ControlNotificaciones;
