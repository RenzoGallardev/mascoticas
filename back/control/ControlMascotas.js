/**
 * RESUMEN: Controlador de Mascotas. Recibe las peticiones HTTP de la Vista, valida permisos, llama al Modelo Mascota y responde JSON.
 *
 * ARCHIVO:  back/control/ControlMascotas.js
 * CAPA MVC: Controlador (coordina peticiones entre la Vista y el Modelo)
 * HISTORIAS: Registrar mascota y Consultar mascota
 * AUTOR:    Ian Carmona
 *
 * LO LLAMA: server.js (enrutador)
 * LLAMA A:  back/modelo/Mascota.js
 */

const Mascota = require('../modelo/Mascota');

const SOLO_SECRETARIA = { ok: false, mensaje: 'Acceso permitido solo a usuarios con rol de secretaria' };

class ControlMascotas {

  // POST /api/mascotas — HU Registrar mascota
  async crear(req, res) {
    if (req.headers.rol != 'secretaria') {
      return res.json(SOLO_SECRETARIA);
    }
    const respuesta = await Mascota.crear(req.body);
    res.json(respuesta);
  }

  // GET /api/mascotas?buscar=...&clienteId=... — HU Consultar mascota
  async consultar(req, res) {
    const respuesta = await Mascota.consultar(req.query.buscar, req.query.clienteId);
    res.json(respuesta);
  }
}

module.exports = ControlMascotas;
