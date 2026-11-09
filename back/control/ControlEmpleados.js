/**
 * ARCHIVO: back/control/ControlEmpleados.js
 * CAPA:    control (lógica y reglas de negocio)
 * HISTORIAS: Crear empleado y Consultar empleado
 *            (+ Iniciar sesión, que NO es historia: es el requisito no funcional de seguridad)
 * AUTOR:   Ángel Araujo
 *
 * LO LLAMA: back/server.js
 * LLAMA A:  modelo/Empleado.js y persistencia/ArchivoJson.js
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Empleado = require('../modelo/Empleado');

class ControlEmpleados {

  constructor() {
    this.archivo = new ArchivoJson('empleados');
  }

  // Inicio de sesión: busca un empleado con ese usuario y esa clave
  async iniciarSesion(usuario, clave) {
    const empleados = await this.archivo.leerTodos();
    for (const empleado of empleados) {
      if (empleado.usuario == usuario && empleado.clave == clave) {
        const sesion = { nombre: empleado.nombre + ' ' + empleado.apellido, rol: empleado.rol };
        return { ok: true, datos: sesion };
      }
    }
    return { ok: false, mensaje: 'Usuario o clave incorrectos' };
  }

  // HU Crear empleado
  async crear(datos) {
    // 1. Valida que los datos básicos estén completos
    if (datos.cedula == '' || datos.nombre == '' || datos.apellido == '' ||
        datos.rol == '' || datos.usuario == '' || datos.clave == '') {
      return { ok: false, mensaje: 'Debe completar todos los campos requeridos del empleado' };
    }

    // 2. Verifica que el empleado no esté registrado (misma cédula o mismo usuario)
    const empleados = await this.archivo.leerTodos();
    for (const empleado of empleados) {
      if (empleado.cedula == datos.cedula) {
        return { ok: false, mensaje: 'El empleado ya se encuentra registrado en el sistema' };
      }
      if (empleado.usuario == datos.usuario) {
        return { ok: false, mensaje: 'Ese nombre de usuario ya está en uso' };
      }
    }

    // 3. Crea el empleado y lo guarda
    const nuevoEmpleado = new Empleado(datos);
    await this.archivo.agregar(nuevoEmpleado);
    return { ok: true, mensaje: 'Empleado creado exitosamente' };
  }

  // HU Consultar empleado: si llega un rol, devuelve solo los de ese rol
  async consultar(rol) {
    const empleados = await this.archivo.leerTodos();
    const encontrados = [];
    for (const empleado of empleados) {
      if (rol == '' || empleado.rol == rol) {
        // Se copian los datos SIN la clave (la clave nunca se envía al front)
        encontrados.push({
          id: empleado.id,
          cedula: empleado.cedula,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          telefono: empleado.telefono,
          correo: empleado.correo,
          rol: empleado.rol,
          usuario: empleado.usuario
        });
      }
    }
    return { ok: true, datos: encontrados };
  }
}

module.exports = ControlEmpleados;
