/**
 * RESUMEN: Controlador de Clientes. Recibe las peticiones HTTP de la Vista, valida permisos, llama al Modelo Cliente y responde JSON.
 *
 * ARCHIVO:  back/control/ControlClientes.js
 * CAPA MVC: Controlador (coordina peticiones entre la Vista y el Modelo)
 * HISTORIAS: Crear cliente/dueño y Consultar cliente
 * AUTOR:    Renzo Gallardo
 *
 * LO LLAMA: server.js (enrutador)
 * LLAMA A:  back/modelo/Cliente.js
 */

const Cliente = require('../modelo/Cliente');

const SOLO_SECRETARIA = { ok: false, mensaje: 'Acceso permitido solo a usuarios con rol de secretaria' };

class ControlClientes {

  // POST /api/clientes — HU Crear cliente/dueño
  async crear(req, res) {
    if (req.headers.rol != 'secretaria') {
      return res.json(SOLO_SECRETARIA);
    }
    const respuesta = await Cliente.crear(req.body);
    res.json(respuesta);
  }

  // GET /api/clientes?buscar=... — HU Consultar cliente
  async consultar(req, res) {
    const respuesta = await Cliente.consultar(req.query.buscar);
    res.json(respuesta);
  }
}

module.exports = ControlClientes;
