/**
 * RESUMEN: El molde de una mascota: solo dice qué datos tiene. Lo usa ControlMascotas.
 *
 * ARCHIVO: back/modelo/Mascota.js
 * CAPA:    modelo (entidad)
 * QUÉ ES:  Define QUÉ DATOS tiene una mascota.
 *          clienteId = el id de su dueño (toda mascota debe tener dueño).
 * LA USA:  back/control/ControlMascotas.js
 * HISTORIA: Registrar mascota — Autor: Ian Carmona
 */
class Mascota {
  constructor(datos) {
    this.clienteId = datos.clienteId;
    this.nombre = datos.nombre;
    this.especie = datos.especie;
    this.raza = datos.raza;
    this.sexo = datos.sexo;
    this.fechaNacimiento = datos.fechaNacimiento;
  }
}

module.exports = Mascota;
