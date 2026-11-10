/**
 * RESUMEN: El molde de un cliente: solo dice qué datos tiene. Lo usa ControlClientes.
 *
 * ARCHIVO: back/modelo/Cliente.js
 * CAPA:    modelo (entidad)
 * QUÉ ES:  Define QUÉ DATOS tiene un cliente (dueño de mascota).
 *          Solo se guardan estos campos; cualquier otro dato que llegue se ignora.
 * LA USA:  back/control/ControlClientes.js
 * HISTORIA: Crear cliente/dueño — Autor: Renzo Gallardo
 */
class Cliente {
  constructor(datos) {
    this.cedula = datos.cedula;
    this.nombre = datos.nombre;
    this.apellido = datos.apellido;
    this.telefono = datos.telefono;
    this.correo = datos.correo;
    this.direccion = datos.direccion;
    this.telegram = datos.telegram;   // usuario de Telegram (lo necesita "Crear notificación")
  }
}

module.exports = Cliente;
