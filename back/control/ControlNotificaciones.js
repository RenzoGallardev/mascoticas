/**
 * RESUMEN: Controlador de Notificaciones. Recibe las peticiones HTTP de la Vista, valida permisos, llama al Modelo Notificacion y responde JSON.
 *
 * ARCHIVO:  back/control/ControlNotificaciones.js
 * CAPA MVC: Controlador (coordina peticiones entre la Vista y el Modelo)
 * HISTORIAS: Crear notificación y Consultar notificación
 * AUTOR:    Niyerlin Muñoz
 *
 * LO LLAMA: server.js (enrutador)
 * LLAMA A:  back/modelo/Notificacion.js
 */

const Notificacion = require('../modelo/Notificacion');

const SOLO_SECRETARIA = { ok: false, mensaje: 'Acceso permitido solo a usuarios con rol de secretaria' };

class ControlNotificaciones {

  // POST /api/notificaciones — HU Crear notificación
  async crear(req, res) {
    if (req.headers.rol != 'secretaria') {
      return res.json(SOLO_SECRETARIA);
    }
    const respuesta = await Notificacion.crear(req.body);
    res.json(respuesta);
  }

  // GET /api/notificaciones — HU Consultar notificación
  async consultar(req, res) {
    const respuesta = await Notificacion.consultar();
    res.json(respuesta);
  }
}

module.exports = ControlNotificaciones;
