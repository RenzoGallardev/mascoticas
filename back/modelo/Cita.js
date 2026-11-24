/**
 * RESUMEN: El molde de una cita: solo dice qué datos tiene. Lo usa ControlCitas.
 *
 * ARCHIVO: back/modelo/Cita.js
 * CAPA:    modelo (entidad)
 * QUÉ ES:  Define QUÉ DATOS tiene una cita médica.
 * LA USA:  back/control/ControlCitas.js
 * HISTORIA: Crear cita médica — Autor: Mouriss ElJawich
 */
class Cita {
  constructor(datos) {
    this.mascotaId = datos.mascotaId;
    this.veterinarioId = datos.veterinarioId;
    this.tipo = datos.tipo;        // General, Control, Vacunación o Especialidad
    this.fecha = datos.fecha;      // formato "2026-11-10"
    this.hora = datos.hora;        // formato "08:00"
    this.estado = 'Agendada';      // regla de la HU: toda cita nace con un estado inicial
  }
}

module.exports = Cita;
