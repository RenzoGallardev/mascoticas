/**
 * RESUMEN: Guarda y lee la información en Redis (la base de datos). Es el ÚNICO que toca la BD; lo usan solo los Modelos.
 *
 * ARCHIVO:  back/persistencia/ArchivoJson.js
 * CAPA MVC: Modelo (acceso a datos / persistencia)
 *
 * QUÉ ES:   La ÚNICA clase que lee y guarda datos en la base de datos (Upstash Redis).
 *           Cada "tabla" es una LISTA guardada con un nombre (ej. 'clientes').
 * LA USAN:  únicamente las clases del Modelo en back/modelo/.
 */

const { Redis } = require('@upstash/redis');
const redis = Redis.fromEnv();

// Datos con los que arranca el sistema (ej. secretaria y veterinario de prueba)
const DATOS_INICIALES = {
  clientes: require('../datos/clientes.json'),
  mascotas: require('../datos/mascotas.json'),
  empleados: require('../datos/empleados.json'),
  citas: require('../datos/citas.json'),
  notificaciones: require('../datos/notificaciones.json')
};

class ArchivoJson {

  constructor(nombre) {
    this.nombre = nombre;
  }

  async leerTodos() {
    const lista = await redis.get(this.nombre);
    if (lista == null) {
      return [...(DATOS_INICIALES[this.nombre] || [])];
    }
    return lista;
  }

  async buscarPorId(id) {
    const lista = await this.leerTodos();
    return lista.find((registro) => registro.id == id) || null;
  }

  async agregar(registro) {
    const lista = await this.leerTodos();
    registro.id = lista.length + 1;
    lista.push(registro);
    await redis.set(this.nombre, lista);
  }
}

module.exports = ArchivoJson;
