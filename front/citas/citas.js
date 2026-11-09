/**
 * ARCHIVO: front/citas/citas.js
 * HISTORIAS: Crear cita médica y Consultar citas del día
 * AUTOR:   Mouriss ElJawich
 *
 * RECORRIDO DE "CREAR CITA MÉDICA":
 *   1. Interfaz ............ citas.html
 *   2. Valida campos ....... ValidadorCita.validar()
 *   3. Front → back ........ conexion.enviar('POST', '/citas')
 *   4. Recibe en el back ... app.post('/api/citas')     (back/server.js)
 *   5. Lógica .............. ControlCitas.crear()       (horario laboral y cruce de horarios)
 *   6. Guarda .............. ArchivoJson.agregar()  →  back/datos/citas.json
 */

class ValidadorCita {
  validar(datos) {
    const errores = [];
    if (datos.clienteId == '') {
      errores.push({ campo: 'clienteId', mensaje: 'Seleccione el cliente' });
    }
    if (datos.mascotaId == '') {
      errores.push({ campo: 'mascotaId', mensaje: 'Seleccione la mascota' });
    }
    if (datos.veterinarioId == '') {
      errores.push({ campo: 'veterinarioId', mensaje: 'Seleccione el veterinario' });
    }
    if (datos.tipo == '') {
      errores.push({ campo: 'tipo', mensaje: 'Seleccione el tipo de consulta' });
    }
    if (datos.fecha == '') {
      errores.push({ campo: 'fecha', mensaje: 'Seleccione la fecha' });
    } else if (datos.fecha < fechaDeHoy()) {
      errores.push({ campo: 'fecha', mensaje: 'La fecha no puede ser anterior a hoy' });
    }
    if (datos.hora == '') {
      errores.push({ campo: 'hora', mensaje: 'Seleccione la hora' });
    }
    return errores;
  }
}


// ---------- Al abrir la pantalla ----------
exigirSesion(['secretaria', 'veterinario']);
dibujarEncabezado();
document.getElementById('fechaConsulta').value = fechaDeHoy(); // por defecto: las citas de hoy
consultarCitas();

// Regla: solo la secretaria crea citas → al veterinario se le esconde el botón
if (leerSesion().rol != 'secretaria') {
  document.getElementById('botonNuevo').hidden = true;
}


// Abre el formulario y llena las listas de clientes y veterinarios
async function abrirFormularioCita() {
  const clientes = await conexion.enviar('GET', '/clientes?buscar=');
  const veterinarios = await conexion.enviar('GET', '/empleados?rol=veterinario');

  const opcionesClientes = [];
  for (const cliente of clientes.datos) {
    opcionesClientes.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
  }

  const opcionesVeterinarios = [];
  for (const veterinario of veterinarios.datos) {
    opcionesVeterinarios.push({ valor: veterinario.id, texto: veterinario.nombre + ' ' + veterinario.apellido });
  }

  mostrarFormulario('seccionFormulario', 'formulario');
  llenarSelect('selectCliente', opcionesClientes);
  llenarSelect('selectVeterinario', opcionesVeterinarios);
  llenarSelect('selectMascota', []); // vacía hasta que se elija un cliente
}


// Al elegir un cliente, carga solo SUS mascotas
async function cargarMascotasDelCliente() {
  const clienteId = document.getElementById('selectCliente').value;
  const respuesta = await conexion.enviar('GET', '/mascotas?buscar=&clienteId=' + clienteId);

  const opciones = [];
  for (const mascota of respuesta.datos) {
    opciones.push({ valor: mascota.id, texto: mascota.nombre + ' (' + mascota.especie + ')' });
  }
  llenarSelect('selectMascota', opciones);
}


// HU Crear cita médica: se ejecuta al presionar OK
async function guardarCita() {
  const datos = leerFormulario('formulario');

  const errores = new ValidadorCita().validar(datos);
  if (mostrarErrores('formulario', errores) == false) {
    return;
  }

  if (confirm('¿Desea guardar la cita?') == false) {
    return;
  }

  // El back revisa que el veterinario y la mascota estén libres a esa hora
  const respuesta = await conexion.enviar('POST', '/citas', datos);
  alert(respuesta.mensaje); // "Cita registrada con éxito" o "Cruce de horarios detectado..."

  if (respuesta.ok) {
    ocultarFormulario('seccionFormulario');
    document.getElementById('fechaConsulta').value = datos.fecha; // muestra el día de la cita nueva
    consultarCitas();
  }
}


// HU Consultar citas del día
async function consultarCitas() {
  const fecha = document.getElementById('fechaConsulta').value;
  const respuesta = await conexion.enviar('GET', '/citas?fecha=' + fecha);

  dibujarTabla('tabla', respuesta.datos, [
    { titulo: 'Hora',        campo: 'hora' },
    { titulo: 'Mascota',     campo: 'mascota' },
    { titulo: 'Veterinario', campo: 'veterinario' },
    { titulo: 'Tipo',        campo: 'tipo' },
    { titulo: 'Estado',      campo: 'estado' }
  ]);
}
