/**
 * RESUMEN: Controlador de Mascotas. Recibe peticiones HTTP, delega al Modelo Mascota y responde JSON.
 *
 * ARCHIVO:  back/control/ControlMascotas.js
 * CAPA MVC: Controlador
 * HISTORIAS: Registrar mascota y Consultar mascota
 * AUTOR:    Ian Carmona
 */

const Mascota = require('../modelo/Mascota');

class ControlMascotas {
  async crear(req, res) {
    res.json(await Mascota.crear(req.body));
  }

  async consultar(req, res) {
    res.json(await Mascota.consultar(req.query.buscar, req.query.clienteId));
  }
}

module.exports = ControlMascotas;
