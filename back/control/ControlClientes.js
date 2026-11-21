/**
 * RESUMEN: Controlador de Clientes. Recibe peticiones HTTP, delega al Modelo Cliente y responde JSON.
 *
 * ARCHIVO:  back/control/ControlClientes.js
 * CAPA MVC: Controlador
 * HISTORIAS: Crear cliente/dueño y Consultar cliente
 * AUTOR:    Renzo Gallardo
 */

const Cliente = require('../modelo/Cliente');

class ControlClientes {
  async crear(req, res) {
    res.json(await Cliente.crear(req.body));
  }

  async consultar(req, res) {
    res.json(await Cliente.consultar(req.query.buscar));
  }
}

module.exports = ControlClientes;
