/**
 * RESUMEN: El código de la pantalla Empleados: valida el formulario y lo manda al back con comun.js. Lo activan los botones de empleados.html.
 *
 * ARCHIVO: public/empleados/empleados.js
 * HISTORIAS: Crear empleado y Consultar empleado
 * AUTOR:   Ángel Araujo
 *
 * RECORRIDO DE "CREAR EMPLEADO":
 *   1. Interfaz ............ empleados.html
 *   2. Valida campos ....... ValidadorEmpleado.validar()
 *   3. Front → back ........ conexion.enviar('POST', '/empleados')
 *   4. Recibe en el back ... app.post('/api/empleados')     (server.js)    
 *   5. Lógica .............. ControlEmpleados.crear()       (revisa que no esté registrado)
 *   6. Guarda .............. ArchivoJson.agregar()  →  base de datos Redis, lista "empleados"
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


// ---------- Al abrir la pantalla ----------
exigirSesion(['secretaria', 'veterinario']);
dibujarEncabezado();
consultarEmpleados();

// Regla: crear empleado es exclusivo de la secretaria → al veterinario se le esconde el botón
if (leerSesion().rol != 'secretaria') {
  document.getElementById('botonNuevo').hidden = true;
}


// HU Crear empleado: se ejecuta al presionar OK
async function guardarEmpleado() {
  const datos = leerFormulario('formulario');

  const errores = new ValidadorEmpleado().validar(datos);
  if (mostrarErrores('formulario', errores) == false) {
    return;
  }

  if (confirm('¿Desea guardar el empleado?') == false) {
    return;
  }

  const respuesta = await conexion.enviar('POST', '/empleados', datos);
  alert(respuesta.mensaje);

  if (respuesta.ok) {
    ocultarFormulario('seccionFormulario');
    consultarEmpleados();
  }
}


// HU Consultar empleado (se puede filtrar por rol)
async function consultarEmpleados() {
  const rol = document.getElementById('filtroRol').value;
  const respuesta = await conexion.enviar('GET', '/empleados?rol=' + rol);

  dibujarTabla('tabla', respuesta.datos, [
    { titulo: 'Cédula',   campo: 'cedula' },
    { titulo: 'Nombre',   campo: 'nombre' },
    { titulo: 'Apellido', campo: 'apellido' },
    { titulo: 'Rol',      campo: 'rol' },
    { titulo: 'Usuario',  campo: 'usuario' },
    { titulo: 'Teléfono', campo: 'telefono' }
  ]);
}
