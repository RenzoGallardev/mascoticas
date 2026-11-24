/**
 * RESUMEN: El código de la pantalla Empleados: valida el formulario y lo manda al back con comun.js. Lo activan los botones de empleados.html.
 *
 * ARCHIVO: public/empleados/empleados.js
 * HISTORIAS: Crear empleado y Consultar empleado
 * AUTOR:   Ángel Araujo
 *
 * RECORRIDO DE "CREAR EMPLEADO":
 *   1. Interfaz ............ empleados.html
 *   2. Botón OK ............ PantallaEmpleados.guardarEmpleado()   (este archivo)
 *   3. Valida campos ....... ValidadorEmpleado.validar()
 *   4. Front → back ........ conexion.enviar('POST', '/empleados')
 *   5. Recibe en el back ... app.post('/api/empleados')     (server.js)    
 *   6. Lógica .............. ControlEmpleados.crear()       (revisa que no esté registrado)
 *   7. Guarda .............. ArchivoJson.agregar()  →  base de datos Redis, lista "empleados"
 */

class ValidadorEmpleado {
  validar(datos) {
    const errores = [];
    if (datos.cedula == '') {
      errores.push({ campo: 'cedula', mensaje: 'La cédula es obligatoria' });
    } else if (isNaN(datos.cedula)) {
      errores.push({ campo: 'cedula', mensaje: 'La cédula solo debe tener números' });
    }
    if (datos.rol == '') {
      errores.push({ campo: 'rol', mensaje: 'El rol es obligatorio' });
    }
    if (datos.nombre == '') {
      errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio' });
    }
    if (datos.apellido == '') {
      errores.push({ campo: 'apellido', mensaje: 'El apellido es obligatorio' });
    }
    if (datos.usuario == '') {
      errores.push({ campo: 'usuario', mensaje: 'El usuario es obligatorio' });
    }
    if (datos.clave.length < 6) {
      errores.push({ campo: 'clave', mensaje: 'La clave debe tener al menos 6 caracteres' });
    }
    return errores;
  }
}


// Clase de la pantalla: tiene los métodos que llaman los botones de empleados.html
class PantallaEmpleados {

  // HU Crear empleado: se ejecuta al presionar OK
  async guardarEmpleado() {
    const datos = ayudante.leerFormulario('formulario');

    const errores = new ValidadorEmpleado().validar(datos);
    if (ayudante.mostrarErrores('formulario', errores) == false) {
      return;
    }

    if (confirm('¿Desea guardar el empleado?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/empleados', datos);
    alert(respuesta.mensaje);

    if (respuesta.ok) {
      ayudante.ocultarFormulario('seccionFormulario');
      this.consultarEmpleados();
    }
  }


  // HU Consultar empleado (se puede filtrar por rol)
  async consultarEmpleados() {
    const rol = document.getElementById('filtroRol').value;
    const respuesta = await conexion.enviar('GET', '/empleados?rol=' + rol);

    ayudante.dibujarTabla('tabla', respuesta.datos, [
      { titulo: 'Cédula',   campo: 'cedula' },
      { titulo: 'Nombre',   campo: 'nombre' },
      { titulo: 'Apellido', campo: 'apellido' },
      { titulo: 'Rol',      campo: 'rol' },
      { titulo: 'Usuario',  campo: 'usuario' },
      { titulo: 'Teléfono', campo: 'telefono' }
    ]);
  }
}


// ---------- Al abrir la pantalla ----------
const pantalla = new PantallaEmpleados(); // el objeto que usan los botones de empleados.html
sesion.exigirSesion(['secretaria', 'veterinario']);
ayudante.dibujarEncabezado();
pantalla.consultarEmpleados();

// Regla: crear empleado es exclusivo de la secretaria → al veterinario se le esconde el botón
if (sesion.leerSesion().rol != 'secretaria') {
  document.getElementById('botonNuevo').hidden = true;
}
