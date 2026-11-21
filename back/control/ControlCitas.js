/**
 * RESUMEN: Controlador de Citas. Recibe las peticiones HTTP de la Vista, valida permisos, llama al Modelo Cita y responde JSON.
 *
 * ARCHIVO:  back/control/ControlCitas.js
 * CAPA MVC: Controlador (coordina peticiones entre la Vista y el Modelo)
 * HISTORIAS: Crear cita médica y Consultar citas del día
 * AUTOR:    Mouriss ElJawich
 *
 * LO LLAMA: server.js (enrutador)
 * LLAMA A:  back/modelo/Cita.js
 */

const Cita = require('../modelo/Cita');

const SOLO_SECRETARIA = { ok: false, mensaje: 'Acceso permitido solo a usuarios con rol de secretaria' };

class ControlCitas {

  // POST /api/citas — HU Crear cita médica
  async crear(req, res) {
    if (req.headers.rol != 'secretaria') {
      return res.json(SOLO_SECRETARIA);
    }
    const respuesta = await Cita.crear(req.body);
    res.json(respuesta);
  }

  // GET /api/citas?fecha=... — HU Consultar citas del día
  async consultarDelDia(req, res) {
    const respuesta = await Cita.consultarDelDia(req.query.fecha);
    res.json(respuesta);
  }
}

module.exports = ControlCitas;
