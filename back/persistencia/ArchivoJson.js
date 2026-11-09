/**
 * ARCHIVO: back/persistencia/ArchivoJson.js
 * CAPA:    persistencia (acceso a la base de datos)
 *
 * QUÉ ES:  La ÚNICA clase que lee y guarda los datos.
 *          Cada "tabla" es una LISTA de registros guardada con un nombre.
 *          Ejemplo: 'clientes'  →  [ {id: 1, cedula: "123", ...}, ... ]
 *
 * DÓNDE SE GUARDA:
 *   - En Vercel (la demo):  en la base de datos en línea Upstash Redis.
 *     (Vercel no permite guardar archivos, por eso se usa esta base de datos.)
 *   - En la laptop:         en los archivos de la carpeta back/datos/.
 *
 * LA USAN: todas las clases de back/control/
 *
 * async / await: leer o guardar tarda un poquito; "await" espera a que termine.
 */

const fs = require('fs');                    // para leer y escribir archivos (laptop)
const { Redis } = require('@upstash/redis'); // para hablar con la base de datos en línea (Vercel)

// Vercel pone la variable VERCEL = '1' cuando el programa corre allá
const EN_VERCEL = process.env.VERCEL == '1';

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
    this.ruta = __dirname + '/../datos/' + nombre + '.json';
  }

  // Devuelve la lista completa
  async leerTodos() {
    if (EN_VERCEL) {
      const redis = Redis.fromEnv();             // se conecta a la base de datos en línea
      const lista = await redis.get(this.nombre);
      if (lista == null) {
        return DATOS_INICIALES[this.nombre];    // todavía no se ha guardado nada
      }
      return lista;
    }

    const texto = fs.readFileSync(this.ruta, 'utf8'); // laptop: lee el archivo
    return JSON.parse(texto);                         // convierte el texto en una lista
  }

  // Guarda la lista completa
  async guardarTodos(lista) {
    if (EN_VERCEL) {
      const redis = Redis.fromEnv();
      await redis.set(this.nombre, lista);
      return;
    }

    const texto = JSON.stringify(lista, null, 2); // laptop: convierte la lista en texto
    fs.writeFileSync(this.ruta, texto);           // y la escribe en el archivo
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

  // Agrega un registro nuevo con un id automático y guarda
  async agregar(registro) {
    const lista = await this.leerTodos();
    registro.id = lista.length + 1;
    lista.push(registro);
    await this.guardarTodos(lista);
  }
}

module.exports = ArchivoJson; // permite usar esta clase en otros archivos con require()
