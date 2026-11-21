/**
 * RESUMEN: Modelo de Citas. Define los datos de una cita médica, valida horario laboral y cruces, y accede a la BD con ArchivoJson.
 *
 * ARCHIVO:  back/modelo/Cita.js
 * CAPA MVC: Modelo (entidad + reglas de negocio + acceso a datos)
 * HISTORIAS: Crear cita médica y Consultar citas del día
 * AUTOR:    Mouriss ElJawich
 *
 * LO LLAMA: back/control/ControlCitas.js
 * LLAMA A:  back/modelo/Mascota.js, back/modelo/Empleado.js y back/persistencia/ArchivoJson.js
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Mascota = require('./Mascota');
const Empleado = require('./Empleado');

const archivo = new ArchivoJson('citas');

// Regla del Brief: solo de 8:00 a 12:00 y de 2:00 a 6:00 (bloques de 1 hora)
const HORAS_PERMITIDAS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

class Cita {
  constructor(datos) {
    this.mascotaId = datos.mascotaId;
    this.veterinarioId = datos.veterinarioId;
    this.tipo = datos.tipo;     // General, Control, Vacunación o Especialidad
    this.fecha = datos.fecha;   // formato "2026-11-10"
    this.hora = datos.hora;     // formato "08:00"
    this.estado = 'Agendada';   // regla de la HU: toda cita nace con un estado inicial
  }

  // HU Crear cita médica: valida campos y horario → verifica que no haya cruce → guarda
  static async crear(datos) {
    // 1. Valida datos obligatorios
    if (!datos.mascotaId || !datos.veterinarioId || !datos.tipo || !datos.fecha || !datos.hora) {
      return { ok: false, mensaje: 'Datos inválidos: todos los campos son obligatorios' };
    }
    if (!HORAS_PERMITIDAS.includes(datos.hora)) {
      return { ok: false, mensaje: 'Datos inválidos: la hora debe estar entre 8:00-12:00 o 2:00-6:00' };
    }

    // 2. Regla de negocio: ni el veterinario ni la mascota pueden tener otra cita a esa misma hora
    const citas = await archivo.leerTodos();
    for (const cita of citas) {
      const mismaHora = cita.fecha == datos.fecha && cita.hora == datos.hora;
      const mismoVeterinario = cita.veterinarioId == datos.veterinarioId;
      const mismaMascota = cita.mascotaId == datos.mascotaId;
      if (mismaHora && (mismoVeterinario || mismaMascota)) {
        return { ok: false, mensaje: 'Cruce de horarios detectado: el veterinario o la mascota ya tienen una cita a esa hora' };
      }
    }

    // 3. Crea la entidad Cita (nace con estado "Agendada") y la guarda
    const nuevaCita = new Cita(datos);
    await archivo.agregar(nuevaCita);
    return { ok: true, mensaje: 'Cita registrada con éxito' };
  }

  // HU Consultar citas del día: devuelve las citas de esa fecha con nombre de mascota y veterinario
  static async consultarDelDia(fecha = '') {
    const fechaBuscada = fecha || '';
    const citas = await archivo.leerTodos();
    const delDia = [];

    for (const cita of citas) {
      if (cita.fecha == fechaBuscada) {
        const mascota = await Mascota.buscarPorId(cita.mascotaId);
        const veterinario = await Empleado.buscarPorId(cita.veterinarioId);
        delDia.push({
          ...cita,
          mascota: mascota ? mascota.nombre : '',
          veterinario: veterinario ? veterinario.nombre + ' ' + veterinario.apellido : ''
        });
      }
    }

    return { ok: true, datos: delDia };
  }
}

module.exports = Cita;
