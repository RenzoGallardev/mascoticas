/**
 * RESUMEN: Controlador de Citas. Recibe peticiones HTTP, delega al Modelo Cita y responde JSON.
 *
 * ARCHIVO:  back/control/ControlCitas.js
 * CAPA MVC: Controlador
 * HISTORIAS: Crear cita médica y Consultar citas del día
 * AUTOR:    Mouriss ElJawich
 */

const Cita = require('../modelo/Cita');

class ControlCitas {
  async crear(req, res) {
    res.json(await Cita.crear(req.body));
  }

  async consultarDelDia(req, res) {
    res.json(await Cita.consultarDelDia(req.query.fecha));
  }
}

module.exports = ControlCitas;
