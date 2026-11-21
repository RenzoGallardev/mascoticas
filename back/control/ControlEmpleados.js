/**
 * RESUMEN: Controlador de Empleados y Sesión. Recibe peticiones HTTP, delega al Modelo Empleado y responde JSON.
 *
 * ARCHIVO:  back/control/ControlEmpleados.js
 * CAPA MVC: Controlador
 * HISTORIAS: Crear empleado, Consultar empleado e Iniciar sesión
 * AUTOR:    Ángel Araujo
 */

const Empleado = require('../modelo/Empleado');

class ControlEmpleados {
  async iniciarSesion(req, res) {
    res.json(await Empleado.autenticar(req.body.usuario, req.body.clave));
  }

  async crear(req, res) {
    res.json(await Empleado.crear(req.body));
  }

  async consultar(req, res) {
    res.json(await Empleado.consultar(req.query.rol));
  }
}

module.exports = ControlEmpleados;
