/**
 * RESUMEN: El cerebro de Mascotas: revisa que el dueño exista y le pide a ArchivoJson que guarde. Lo llama server.js.
 *
 * ARCHIVO: back/control/ControlMascotas.js
 * CAPA:    control (lógica y reglas de negocio)
 * HISTORIAS: Registrar mascota y Consultar mascota
 * AUTOR:   Ian Carmona
 *
 * LO LLAMA: server.js
 * LLAMA A:  modelo/Mascota.js y persistencia/ArchivoJson.js
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Mascota = require('../modelo/Mascota');

class ControlMascotas {

  constructor() {
    this.archivo = new ArchivoJson('mascotas');
    this.archivoClientes = new ArchivoJson('clientes'); // para revisar que el dueño exista
  }

  // HU Registrar mascota
  async crear(datos) {
    // 1. Valida que estén los datos obligatorios
    if (datos.clienteId == '' || datos.nombre == '' || datos.especie == '') {
      return { ok: false, mensaje: 'Datos inválidos: dueño, nombre y especie son obligatorios' };
    }

    // 2. Regla: toda mascota debe tener un dueño que exista
    const dueno = await this.archivoClientes.buscarPorId(datos.clienteId);
    if (dueno == null) {
      return { ok: false, mensaje: 'El dueño seleccionado no existe' };
    }

    // 3. Crea la mascota y la guarda
    const nuevaMascota = new Mascota(datos);
    await this.archivo.agregar(nuevaMascota);
    return { ok: true, mensaje: 'Mascota registrada con éxito' };
  }

  // HU Consultar mascota: busca por nombre o especie.
  // Si llega un clienteId, devuelve solo las mascotas de ese dueño (lo usan Citas y Notificaciones).
  async consultar(textoBuscado, clienteId) {
    const mascotas = await this.archivo.leerTodos();
    const encontradas = [];
    for (const mascota of mascotas) {
      const texto = mascota.nombre + ' ' + mascota.especie;
      const coincideTexto = texto.toLowerCase().includes(textoBuscado.toLowerCase());
      const coincideDueno = clienteId == '' || mascota.clienteId == clienteId;

      if (coincideTexto && coincideDueno) {
        // Se agrega el nombre del dueño para mostrarlo en la tabla
        const dueno = await this.archivoClientes.buscarPorId(mascota.clienteId);
        mascota.dueno = dueno.nombre + ' ' + dueno.apellido;
        encontradas.push(mascota);
      }
    }
    return { ok: true, datos: encontradas };
  }
}

module.exports = ControlMascotas;
