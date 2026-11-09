/**
 * ARCHIVO: back/control/ControlClientes.js
 * CAPA:    control (lógica y reglas de negocio)
 * HISTORIAS: Crear cliente/dueño y Consultar cliente
 * AUTOR:   Renzo Gallardo
 *
 * LO LLAMA: server.js
 * LLAMA A:  modelo/Cliente.js y persistencia/ArchivoJson.js
 *
 * Todos los métodos devuelven: { ok: true o false, mensaje: '...', datos: ... }
 */

const ArchivoJson = require('../persistencia/ArchivoJson');
const Cliente = require('../modelo/Cliente');

class ControlClientes {

  constructor() {
    this.archivo = new ArchivoJson('clientes'); // back/datos/clientes.json
  }

  // HU Crear cliente: valida → verifica que no exista → guarda
  async crear(datos) {
    // 1. Valida que estén los datos obligatorios
    if (datos.cedula == '' || datos.nombre == '' || datos.apellido == '' || datos.telefono == '') {
      return { ok: false, mensaje: 'Datos inválidos: cédula, nombre, apellido y teléfono son obligatorios' };
    }

    // 2. Verifica que no exista otro cliente con la misma cédula
    const clientes = await this.archivo.leerTodos();
    for (const cliente of clientes) {
      if (cliente.cedula == datos.cedula) {
        return { ok: false, mensaje: 'El cliente ya está registrado' };
      }
    }

    // 3. Crea el cliente y lo guarda
    const nuevoCliente = new Cliente(datos);
    await this.archivo.agregar(nuevoCliente);
    return { ok: true, mensaje: 'Cliente registrado con éxito' };
  }

  // HU Consultar cliente: devuelve los clientes cuya cédula o nombre contengan el texto buscado
  async consultar(textoBuscado) {
    const clientes = await this.archivo.leerTodos();
    const encontrados = [];
    for (const cliente of clientes) {
      const texto = cliente.cedula + ' ' + cliente.nombre + ' ' + cliente.apellido;
      if (texto.toLowerCase().includes(textoBuscado.toLowerCase())) {
        encontrados.push(cliente);
      }
    }
    return { ok: true, datos: encontrados };
  }
}

module.exports = ControlClientes;
