/**
 * RESUMEN: Controlador de Empleados y Sesión. Recibe las peticiones HTTP de la Vista, valida permisos, llama al Modelo Empleado y responde JSON.
 *
 * ARCHIVO:  back/control/ControlEmpleados.js
 * CAPA MVC: Controlador (coordina peticiones entre la Vista y el Modelo)
 * HISTORIAS: Crear empleado y Consultar empleado
 *            (+ Iniciar sesión, requisito no funcional de seguridad)
 * AUTOR:    Ángel Araujo
 *
 * LO LLAMA: server.js (enrutador)
 * LLAMA A:  back/modelo/Empleado.js
 */

const Empleado = require('../modelo/Empleado');

const SOLO_SECRETARIA = { ok: false, mensaje: 'Acceso permitido solo a usuarios con rol de secretaria' };

class ControlEmpleados {

  // POST /api/sesion — Inicio de sesión
  async iniciarSesion(req, res) {
    const respuesta = await Empleado.autenticar(req.body.usuario, req.body.clave);
    res.json(respuesta);
  }

  // POST /api/empleados — HU Crear empleado
  async crear(req, res) {
    if (req.headers.rol != 'secretaria') {
      return res.json(SOLO_SECRETARIA);
    }
    const respuesta = await Empleado.crear(req.body);
    res.json(respuesta);
  }

  // GET /api/empleados?rol=... — HU Consultar empleado
  async consultar(req, res) {
    const respuesta = await Empleado.consultar(req.query.rol);
    res.json(respuesta);
  }
}

module.exports = ControlEmpleados;
