/**
 * ARCHIVO: back/control/ControlCitas.js
 * CAPA:    control (lógica y reglas de negocio)
 * HISTORIAS: Crear cita médica y Consultar citas del día
 * AUTOR:   Mouriss ElJawich
 *
 * LO LLAMA: back/server.js
 * LLAMA A:  modelo/Cita.js y persistencia/ArchivoJson.js
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Cita = require('../modelo/Cita');

// Regla del Brief: solo de 8:00 a 12:00 y de 2:00 a 6:00 (bloques de 1 hora)
const HORAS_PERMITIDAS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

class ControlCitas {

  constructor() {
    this.archivo = new ArchivoJson('citas');
    this.archivoMascotas = new ArchivoJson('mascotas');
    this.archivoEmpleados = new ArchivoJson('empleados');
  }

  // HU Crear cita médica: valida → verifica que no haya cruce → guarda
  async crear(datos) {
    // 1. Valida datos
    if (datos.mascotaId == '' || datos.veterinarioId == '' || datos.tipo == '' || datos.fecha == '' || datos.hora == '') {
      return { ok: false, mensaje: 'Datos inválidos: todos los campos son obligatorios' };
    }
    if (!HORAS_PERMITIDAS.includes(datos.hora)) {
      return { ok: false, mensaje: 'Datos inválidos: la hora debe estar entre 8:00-12:00 o 2:00-6:00' };
    }

    // 2. Verifica disponibilidad: ni el veterinario ni la mascota pueden tener otra cita a esa misma hora
    const citas = await this.archivo.leerTodos();
    for (const cita of citas) {
      const mismaHora = cita.fecha == datos.fecha && cita.hora == datos.hora;
      const mismoVeterinario = cita.veterinarioId == datos.veterinarioId;
      const mismaMascota = cita.mascotaId == datos.mascotaId;
      if (mismaHora && (mismoVeterinario || mismaMascota)) {
        return { ok: false, mensaje: 'Cruce de horarios detectado: el veterinario o la mascota ya tienen una cita a esa hora' };
      }
    }

    // 3. Crea la cita (nace con estado "Agendada") y la guarda
    const nuevaCita = new Cita(datos);
    await this.archivo.agregar(nuevaCita);
    return { ok: true, mensaje: 'Cita registrada con éxito' };
  }

  // HU Consultar citas del día: devuelve las citas de esa fecha
  async consultarDelDia(fecha) {
    const citas = await this.archivo.leerTodos();
    const delDia = [];
    for (const cita of citas) {
      if (cita.fecha == fecha) {
        // Se agregan los nombres de la mascota y del veterinario para mostrarlos en la tabla
        const mascota = await this.archivoMascotas.buscarPorId(cita.mascotaId);
        const veterinario = await this.archivoEmpleados.buscarPorId(cita.veterinarioId);
        cita.mascota = mascota.nombre;
        cita.veterinario = veterinario.nombre + ' ' + veterinario.apellido;
        delDia.push(cita);
      }
    }
    return { ok: true, datos: delDia };
  }
}

module.exports = ControlCitas;
