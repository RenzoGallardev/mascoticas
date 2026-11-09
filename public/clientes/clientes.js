/**
 * ARCHIVO: public/clientes/clientes.js
 * HISTORIAS: Crear cliente/dueño y Consultar cliente
 * AUTOR:   Renzo Gallardo
 *
 * RECORRIDO DE "CREAR CLIENTE" (lo que pregunta la profe en la defensa):
 *   1. Interfaz ............ clientes.html (formulario "Registrar cliente")
 *   2. Valida campos ....... ValidadorCliente.validar()             (este archivo)
 *   3. Front → back ........ conexion.enviar('POST', '/clientes')   (comun.js)
 *   4. Recibe en el back ... app.post('/api/clientes')              (server.js)    
 *   5. Lógica .............. ControlClientes.crear()                (back/control)
 *   6. Guarda .............. ArchivoJson.agregar()                  (back/persistencia)
 *   7. Base de datos ....... Upstash Redis, lista "clientes"
 */

// Clase que valida los campos ANTES de enviarlos al back
class ValidadorCliente {

  // Devuelve una lista de errores. Si la lista está vacía, los datos son válidos.
  validar(datos) {
    const errores = [];

    if (datos.cedula == '') {
      errores.push({ campo: 'cedula', mensaje: 'La cédula es obligatoria' });
    } else if (isNaN(datos.cedula)) {   // isNaN = "no es un número"
      errores.push({ campo: 'cedula', mensaje: 'La cédula solo debe tener números' });
    }

    if (datos.nombre == '') {
      errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio' });
    }

    if (datos.apellido == '') {
      errores.push({ campo: 'apellido', mensaje: 'El apellido es obligatorio' });
    }

    if (datos.telefono == '') {
      errores.push({ campo: 'telefono', mensaje: 'El teléfono es obligatorio' });
    } else if (isNaN(datos.telefono)) {
      errores.push({ campo: 'telefono', mensaje: 'El teléfono solo debe tener números' });
    }

    if (datos.correo != '' && !datos.correo.includes('@')) {
      errores.push({ campo: 'correo', mensaje: 'El correo no es válido' });
    }

    return errores;
  }
}


// ---------- Al abrir la pantalla ----------
exigirSesion(['secretaria']);   // regla: solo la secretaria gestiona clientes
dibujarEncabezado();
consultarClientes();            // muestra la lista de clientes


// HU Crear cliente: se ejecuta al presionar OK
async function guardarCliente() {
  const datos = leerFormulario('formulario');

  // 1. Valida datos → si son inválidos, muestra el mensaje y no sigue
  const errores = new ValidadorCliente().validar(datos);
  if (mostrarErrores('formulario', errores) == false) {
    return;
  }

  // 2. Pide confirmación para guardar → si presiona Cancelar, no se guarda
  if (confirm('¿Desea guardar el cliente?') == false) {
    return;
  }

  // 3. Envía los datos al back (el back revisa que no exista y lo guarda)
  const respuesta = await conexion.enviar('POST', '/clientes', datos);
  alert(respuesta.mensaje); // "Cliente registrado con éxito" o el error

  if (respuesta.ok) {
    ocultarFormulario('seccionFormulario');
    consultarClientes();
  }
}


// HU Consultar cliente: pide la lista al back y la muestra en la tabla
async function consultarClientes() {
  const texto = document.getElementById('textoBuscar').value;
  const respuesta = await conexion.enviar('GET', '/clientes?buscar=' + texto);

  dibujarTabla('tabla', respuesta.datos, [
    { titulo: 'Cédula',   campo: 'cedula' },
    { titulo: 'Nombre',   campo: 'nombre' },
    { titulo: 'Apellido', campo: 'apellido' },
    { titulo: 'Teléfono', campo: 'telefono' },
    { titulo: 'Correo',   campo: 'correo' },
    { titulo: 'Telegram', campo: 'telegram' }
  ]);
}
