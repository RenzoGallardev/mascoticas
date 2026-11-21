/**
 * RESUMEN: Modelo de Clientes. Define los datos del cliente, valida sus reglas de negocio y accede a la BD mediante ArchivoJson.
 *
 * ARCHIVO:  back/modelo/Cliente.js
 * CAPA MVC: Modelo (entidad + reglas de negocio + acceso a datos)
 * HISTORIAS: Crear cliente/dueño y Consultar cliente
 * AUTOR:    Renzo Gallardo
 *
 * LO LLAMA: back/control/ControlClientes.js (y los modelos Mascota y Notificacion)
 * LLAMA A:  back/persistencia/ArchivoJson.js
 *
 * Todos los métodos de operación devuelven: { ok: true o false, mensaje: '...', datos: ... }
 */

const ArchivoJson = require('../persistencia/ArchivoJson');

const archivo = new ArchivoJson('clientes'); // lista "clientes" en la base de datos Redis

class Cliente {
  constructor(datos) {
    this.cedula = datos.cedula;
    this.nombre = datos.nombre;
    this.apellido = datos.apellido;
    this.telefono = datos.telefono;
    this.correo = datos.correo || '';
    this.direccion = datos.direccion || '';
    this.telegram = datos.telegram || ''; // usuario de Telegram (lo necesita "Crear notificación")
  }

  // Busca un cliente por su id (lo usan también los modelos Mascota y Notificacion)
  static async buscarPorId(id) {
    return await archivo.buscarPorId(id);
  }

  // HU Crear cliente: valida campos obligatorios → verifica que la cédula no exista → guarda
  static async crear(datos) {
    // 1. Valida que estén los datos obligatorios
    if (!datos.cedula || !datos.nombre || !datos.apellido || !datos.telefono) {
      return { ok: false, mensaje: 'Datos inválidos: cédula, nombre, apellido y teléfono son obligatorios' };
    }

    // 2. Regla de negocio: verifica que no exista otro cliente con la misma cédula
    const clientes = await archivo.leerTodos();
    for (const cliente of clientes) {
      if (cliente.cedula == datos.cedula) {
        return { ok: false, mensaje: 'El cliente ya está registrado' };
      }
    }

    // 3. Crea la entidad Cliente y la guarda en persistencia
    const nuevoCliente = new Cliente(datos);
    await archivo.agregar(nuevoCliente);
    return { ok: true, mensaje: 'Cliente registrado con éxito' };
  }

  // HU Consultar cliente: devuelve los clientes cuya cédula o nombre contengan el texto buscado
  static async consultar(textoBuscado = '') {
    const filtro = (textoBuscado || '').toLowerCase();
    const clientes = await archivo.leerTodos();
    const encontrados = [];

    for (const cliente of clientes) {
      const texto = cliente.cedula + ' ' + cliente.nombre + ' ' + cliente.apellido;
      if (texto.toLowerCase().includes(filtro)) {
        encontrados.push(cliente);
      }
    }

    return { ok: true, datos: encontrados };
  }
}

module.exports = Cliente;
