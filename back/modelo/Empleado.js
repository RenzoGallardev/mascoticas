/**
 * RESUMEN: El molde de un empleado: solo dice qué datos tiene. Lo usa ControlEmpleados.
 *
 * ARCHIVO: back/modelo/Empleado.js
 * CAPA:    modelo (entidad)
 * QUÉ ES:  Define QUÉ DATOS tiene un empleado (secretaria o veterinario).
 *          Cada empleado tiene su propio usuario y clave para entrar al sistema.
 * LA USA:  back/control/ControlEmpleados.js
 * HISTORIA: Crear empleado — Autor: Ángel Araujo
 */
class Empleado {
  constructor(datos) {
    this.cedula = datos.cedula;
    this.nombre = datos.nombre;
    this.apellido = datos.apellido;
    this.telefono = datos.telefono;
    this.correo = datos.correo;
    this.rol = datos.rol;          // 'secretaria' o 'veterinario'
    this.usuario = datos.usuario;
    this.clave = datos.clave;
  }
}

module.exports = Empleado;
