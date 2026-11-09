/**
 * ARCHIVO: back/persistencia/ArchivoJson.js
 * CAPA:    persistencia (acceso a la base de datos)
 *
 * QUÉ ES:  La ÚNICA clase que lee y guarda datos en la base de datos.
 *          La base de datos es Upstash Redis (en línea, conectada desde Vercel).
 *          Cada "tabla" es una LISTA guardada con un nombre.
 *          Ejemplo: 'clientes'  →  [ {id: 1, cedula: "123", ...}, ... ]
 *
 * LA USAN: todas las clases de back/control/
 *
 * async / await: hablar con la base de datos tarda un poquito; "await" espera la respuesta.
 */

const { Redis } = require('@upstash/redis'); // librería para hablar con la base de datos
const redis = Redis.fromEnv();               // se conecta con los datos que Vercel puso en el proyecto

// Datos con los que arranca el sistema (ej: la secretaria y el veterinario de prueba)
const DATOS_INICIALES = {
  clientes: require('../datos/clientes.json'),
  mascotas: require('../datos/mascotas.json'),
  empleados: require('../datos/empleados.json'),
  citas: require('../datos/citas.json'),
  notificaciones: require('../datos/notificaciones.json')
};

class ArchivoJson {

  // nombre = nombre de la "tabla". Ejemplo: 'clientes'
  constructor(nombre) {
    this.nombre = nombre;
  }

  // Devuelve la lista completa
  async leerTodos() {
    const lista = await redis.get(this.nombre);
    if (lista == null) {
      return DATOS_INICIALES[this.nombre]; // todavía no se ha guardado nada
    }
    return lista;
  }

  // Busca un registro por su id. Si no lo encuentra, devuelve null
  async buscarPorId(id) {
    const lista = await this.leerTodos();
    for (const registro of lista) {
      if (registro.id == id) {   // "==" compara aunque uno sea texto ("3") y el otro número (3)
        return registro;
      }
    }
    return null;
  }

  // Agrega un registro nuevo con un id automático y guarda la lista
  async agregar(registro) {
    const lista = await this.leerTodos();
    registro.id = lista.length + 1;
    lista.push(registro);
    await redis.set(this.nombre, lista);
  }
}

module.exports = ArchivoJson; // permite usar esta clase en otros archivos con require()
