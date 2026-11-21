/**
 * RESUMEN: Modelo de Mascotas. Define los datos de una mascota, valida que tenga dueño y accede a la BD mediante ArchivoJson.
 *
 * ARCHIVO:  back/modelo/Mascota.js
 * CAPA MVC: Modelo (entidad + reglas de negocio + acceso a datos)
 * HISTORIAS: Registrar mascota y Consultar mascota
 * AUTOR:    Ian Carmona
 *
 * LO LLAMA: back/control/ControlMascotas.js (y los modelos Cita y Notificacion)
 * LLAMA A:  back/modelo/Cliente.js y back/persistencia/ArchivoJson.js
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Cliente = require('./Cliente');

const archivo = new ArchivoJson('mascotas');

class Mascota {
  constructor(datos) {
    this.clienteId = datos.clienteId;
    this.nombre = datos.nombre;
    this.especie = datos.especie;
    this.raza = datos.raza || '';
    this.sexo = datos.sexo || '';
    this.fechaNacimiento = datos.fechaNacimiento || '';
  }

  // Busca una mascota por su id (lo usan también los modelos Cita y Notificacion)
  static async buscarPorId(id) {
    return await archivo.buscarPorId(id);
  }

  // HU Registrar mascota: valida datos → verifica que el dueño exista → guarda
  static async crear(datos) {
    // 1. Valida que estén los datos obligatorios
    if (!datos.clienteId || !datos.nombre || !datos.especie) {
      return { ok: false, mensaje: 'Datos inválidos: dueño, nombre y especie son obligatorios' };
    }

    // 2. Regla de negocio: toda mascota debe tener un dueño que exista
    const dueno = await Cliente.buscarPorId(datos.clienteId);
    if (dueno == null) {
      return { ok: false, mensaje: 'El dueño seleccionado no existe' };
    }

    // 3. Crea la entidad Mascota y la guarda
    const nuevaMascota = new Mascota(datos);
    await archivo.agregar(nuevaMascota);
    return { ok: true, mensaje: 'Mascota registrada con éxito' };
  }

  // HU Consultar mascota: busca por nombre o especie.
  // Si llega un clienteId, devuelve solo las mascotas de ese dueño (lo usan Citas y Notificaciones).
  static async consultar(textoBuscado = '', clienteId = '') {
    const filtro = (textoBuscado || '').toLowerCase();
    const idDueno = clienteId || '';
    const mascotas = await archivo.leerTodos();
    const encontradas = [];

    for (const mascota of mascotas) {
      const texto = mascota.nombre + ' ' + mascota.especie;
      const coincideTexto = texto.toLowerCase().includes(filtro);
      const coincideDueno = idDueno == '' || mascota.clienteId == idDueno;

      if (coincideTexto && coincideDueno) {
        // Se agrega el nombre del dueño para mostrarlo en la Vista sin alterar el objeto original
        const dueno = await Cliente.buscarPorId(mascota.clienteId);
        encontradas.push({
          ...mascota,
          dueno: dueno ? dueno.nombre + ' ' + dueno.apellido : ''
        });
      }
    }

    return { ok: true, datos: encontradas };
  }
}

module.exports = Mascota;
