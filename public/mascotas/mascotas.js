/**
 * RESUMEN: El código de la pantalla Mascotas: valida el formulario y lo manda al back con comun.js. Lo activan los botones de mascotas.html.
 *
 * ARCHIVO: public/mascotas/mascotas.js
 * HISTORIAS: Registrar mascota y Consultar mascota
 * AUTOR:   Ian Carmona
 *
 * RECORRIDO DE "REGISTRAR MASCOTA":
 *   1. Interfaz ............ mascotas.html
 *   2. Botón OK ............ PantallaMascotas.guardarMascota()   (este archivo)
 *   3. Valida campos ....... ValidadorMascota.validar()
 *   4. Front → back ........ conexion.enviar('POST', '/mascotas')
 *   5. Recibe en el back ... app.post('/api/mascotas')      (server.js)    
 *   6. Lógica .............. ControlMascotas.crear()        (revisa que el dueño exista)
 *   7. Guarda .............. ArchivoJson.agregar()  →  base de datos Redis, lista "mascotas"
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


// Clase de la pantalla: tiene los métodos que llaman los botones de mascotas.html
class PantallaMascotas {

  // Abre el formulario y llena la lista de dueños con los clientes registrados
  async abrirFormularioMascota() {
    const respuesta = await conexion.enviar('GET', '/clientes?buscar=');
    if (respuesta.datos.length == 0) {
      alert('Primero debe registrar al dueño en Clientes');
      return;
    }

    const opciones = [];
    for (const cliente of respuesta.datos) {
      opciones.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
    }
    ayudante.mostrarFormulario('seccionFormulario', 'formulario');
    ayudante.llenarSelect('selectDueno', opciones);
  }


  // HU Registrar mascota: se ejecuta al presionar OK
  async guardarMascota() {
    const datos = ayudante.leerFormulario('formulario');

    const errores = new ValidadorMascota().validar(datos);
    if (ayudante.mostrarErrores('formulario', errores) == false) {
      return;
    }

    if (confirm('¿Desea guardar la mascota?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/mascotas', datos);
    alert(respuesta.mensaje);

    if (respuesta.ok) {
      ayudante.ocultarFormulario('seccionFormulario');
      this.consultarMascotas();
    }
  }


  // HU Consultar mascota
  async consultarMascotas() {
    const texto = document.getElementById('textoBuscar').value;
    const respuesta = await conexion.enviar('GET', '/mascotas?buscar=' + texto + '&clienteId=');

    ayudante.dibujarTabla('tabla', respuesta.datos, [
      { titulo: 'Nombre',     campo: 'nombre' },
      { titulo: 'Especie',    campo: 'especie' },
      { titulo: 'Raza',       campo: 'raza' },
      { titulo: 'Sexo',       campo: 'sexo' },
      { titulo: 'Nacimiento', campo: 'fechaNacimiento' },
      { titulo: 'Dueño',      campo: 'dueno' }
    ]);
  }
}


// ---------- Al abrir la pantalla ----------
const pantalla = new PantallaMascotas(); // el objeto que usan los botones de mascotas.html
sesion.exigirSesion(['secretaria', 'veterinario']);
ayudante.dibujarEncabezado();
pantalla.consultarMascotas();

// Regla: solo la secretaria registra mascotas → al veterinario se le esconde el botón
if (sesion.leerSesion().rol != 'secretaria') {
  document.getElementById('botonNuevo').hidden = true;
}
