/**
 * RESUMEN: Modelo de Empleados. Define los datos del empleado, maneja autenticación y reglas de negocio, y accede a la BD con ArchivoJson.
 *
 * ARCHIVO:  back/modelo/Empleado.js
 * CAPA MVC: Modelo (entidad + reglas de negocio + acceso a datos)
 * HISTORIAS: Crear empleado y Consultar empleado (+ Iniciar sesión)
 * AUTOR:    Ángel Araujo
 *
 * LO LLAMA: back/control/ControlEmpleados.js (y el modelo Cita)
 * LLAMA A:  back/persistencia/ArchivoJson.js
 */

const ArchivoJson = require('../persistencia/ArchivoJson');

const archivo = new ArchivoJson('empleados');

class Empleado {
  constructor(datos) {
    this.cedula = datos.cedula;
    this.nombre = datos.nombre;
    this.apellido = datos.apellido;
    this.telefono = datos.telefono || '';
    this.correo = datos.correo || '';
    this.rol = datos.rol; // 'secretaria' o 'veterinario'
    this.usuario = datos.usuario;
    this.clave = datos.clave;
  }

  // Busca un empleado por su id (lo usa también el modelo Cita)
  static async buscarPorId(id) {
    return await archivo.buscarPorId(id);
  }

  // Inicio de sesión: busca un empleado con ese usuario y esa clave
  static async autenticar(usuario, clave) {
    const empleados = await archivo.leerTodos();
    for (const empleado of empleados) {
      if (empleado.usuario == usuario && empleado.clave == clave) {
        const sesion = { nombre: empleado.nombre + ' ' + empleado.apellido, rol: empleado.rol };
        return { ok: true, datos: sesion };
      }
    }
    return { ok: false, mensaje: 'Usuario o clave incorrectos' };
  }

  // HU Crear empleado: valida campos → verifica cédula/usuario únicos → guarda
  static async crear(datos) {
    // 1. Valida que los datos básicos estén completos
    if (!datos.cedula || !datos.nombre || !datos.apellido ||
        !datos.rol || !datos.usuario || !datos.clave) {
      return { ok: false, mensaje: 'Debe completar todos los campos requeridos del empleado' };
    }

    // 2. Regla de negocio: verifica que el empleado no esté registrado (misma cédula o mismo usuario)
    const empleados = await archivo.leerTodos();
    for (const empleado of empleados) {
      if (empleado.cedula == datos.cedula) {
        return { ok: false, mensaje: 'El empleado ya se encuentra registrado en el sistema' };
      }
      if (empleado.usuario == datos.usuario) {
        return { ok: false, mensaje: 'Ese nombre de usuario ya está en uso' };
      }
    }

    // 3. Crea la entidad Empleado y la guarda
    const nuevoEmpleado = new Empleado(datos);
    await archivo.agregar(nuevoEmpleado);
    return { ok: true, mensaje: 'Empleado creado exitosamente' };
  }

  // HU Consultar empleado: si llega un rol, devuelve solo los de ese rol (sin exponer la clave)
  static async consultar(rol = '') {
    const filtroRol = rol || '';
    const empleados = await archivo.leerTodos();
    const encontrados = [];

    for (const empleado of empleados) {
      if (filtroRol == '' || empleado.rol == filtroRol) {
        // Se copian los datos SIN la clave (la clave nunca se envía a la Vista)
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

module.exports = Empleado;
