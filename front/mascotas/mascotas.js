/**
 * ARCHIVO: front/mascotas/mascotas.js
 * HISTORIAS: Registrar mascota y Consultar mascota
 * AUTOR:   Ian Carmona
 *
 * RECORRIDO DE "REGISTRAR MASCOTA":
 *   1. Interfaz ............ mascotas.html
 *   2. Valida campos ....... ValidadorMascota.validar()
 *   3. Front → back ........ conexion.enviar('POST', '/mascotas')
 *   4. Recibe en el back ... app.post('/api/mascotas')      (back/server.js)
 *   5. Lógica .............. ControlMascotas.crear()        (revisa que el dueño exista)
 *   6. Guarda .............. ArchivoJson.agregar()  →  back/datos/mascotas.json
 */

class ValidadorMascota {
  validar(datos) {
    const errores = [];
    if (datos.clienteId == '') {
      errores.push({ campo: 'clienteId', mensaje: 'Debe seleccionar el dueño (no hay mascotas sin dueño)' });
    }
    if (datos.nombre == '') {
      errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio' });
    }
    if (datos.especie == '') {
      errores.push({ campo: 'especie', mensaje: 'La especie es obligatoria' });
    }
    return errores;
  }
}


// ---------- Al abrir la pantalla ----------
exigirSesion(['secretaria', 'veterinario']);
dibujarEncabezado();
consultarMascotas();

// Regla: solo la secretaria registra mascotas → al veterinario se le esconde el botón
if (leerSesion().rol != 'secretaria') {
  document.getElementById('botonNuevo').hidden = true;
}


// Abre el formulario y llena la lista de dueños con los clientes registrados
async function abrirFormularioMascota() {
  const respuesta = await conexion.enviar('GET', '/clientes?buscar=');
  if (respuesta.datos.length == 0) {
    alert('Primero debe registrar al dueño en Clientes');
    return;
  }

  const opciones = [];
  for (const cliente of respuesta.datos) {
    opciones.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
  }
  mostrarFormulario('seccionFormulario', 'formulario');
  llenarSelect('selectDueno', opciones);
}


// HU Registrar mascota: se ejecuta al presionar OK
async function guardarMascota() {
  const datos = leerFormulario('formulario');

  const errores = new ValidadorMascota().validar(datos);
  if (mostrarErrores('formulario', errores) == false) {
    return;
  }

  if (confirm('¿Desea guardar la mascota?') == false) {
    return;
  }

  const respuesta = await conexion.enviar('POST', '/mascotas', datos);
  alert(respuesta.mensaje);

  if (respuesta.ok) {
    ocultarFormulario('seccionFormulario');
    consultarMascotas();
  }
}


// HU Consultar mascota
async function consultarMascotas() {
  const texto = document.getElementById('textoBuscar').value;
  const respuesta = await conexion.enviar('GET', '/mascotas?buscar=' + texto + '&clienteId=');

  dibujarTabla('tabla', respuesta.datos, [
    { titulo: 'Nombre',     campo: 'nombre' },
    { titulo: 'Especie',    campo: 'especie' },
    { titulo: 'Raza',       campo: 'raza' },
    { titulo: 'Sexo',       campo: 'sexo' },
    { titulo: 'Nacimiento', campo: 'fechaNacimiento' },
    { titulo: 'Dueño',      campo: 'dueno' }
  ]);
}
