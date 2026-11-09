/**
 * ARCHIVO: front/comun/comun.js
 *
 * QUÉ ES: Código que usan TODAS las pantallas:
 *   1. ConexionBack → la ÚNICA clase que habla con el back.
 *   2. Sesión       → recuerda quién inició sesión (nombre y rol).
 *   3. Ayudantes    → leer formularios, mostrar errores, dibujar tablas y listas.
 *
 * Cada página lo carga ANTES de su propio archivo .js
 *
 * Palabras que se repiten:
 *   async / await → la petición al back tarda un poquito; "await" espera la respuesta
 *                   antes de pasar a la siguiente línea. Toda función que usa "await" lleva "async".
 */

// ¿Dónde está el back?
//   - En Vercel (la demo): en el proyecto "back" de Vercel.  ⚠ Si Vercel le da otra dirección, cámbiala aquí.
//   - En la laptop:        en localhost:3000
let DIRECCION_BACK = 'https://mascoticas-back.vercel.app/api';
if (location.hostname == 'localhost' || location.hostname == '127.0.0.1') {
  DIRECCION_BACK = 'http://localhost:3000/api';
}


// ==================== 1. CONEXIÓN CON EL BACK ====================

class ConexionBack {

  // metodo: 'GET' (consultar) o 'POST' (crear)
  // ruta:   ej '/clientes'
  // datos:  los datos del formulario (solo para POST)
  // Devuelve lo que responde el back: { ok, mensaje, datos }
  async enviar(metodo, ruta, datos) {
    const opciones = {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',  // avisa que los datos van en formato JSON
        'rol': leerSesion().rol               // le dice al back quién está usando el sistema
      }
    };
    if (metodo == 'POST') {
      opciones.body = JSON.stringify(datos);  // convierte el objeto en texto para enviarlo
    }

    try {
      const respuesta = await fetch(DIRECCION_BACK + ruta, opciones); // envía la petición
      return await respuesta.json();                                   // convierte la respuesta en objeto
    } catch (error) {
      return { ok: false, mensaje: 'Fallo en la conexión con el servidor' }; // el back está apagado
    }
  }
}

const conexion = new ConexionBack(); // todas las pantallas usan este objeto


// ==================== 2. SESIÓN ====================
// Se guarda en "sessionStorage": una memoria del navegador que se borra al cerrar la pestaña.

function guardarSesion(datos) {
  sessionStorage.setItem('nombre', datos.nombre);
  sessionStorage.setItem('rol', datos.rol);
}

function leerSesion() {
  return {
    nombre: sessionStorage.getItem('nombre'),
    rol: sessionStorage.getItem('rol')
  };
}

// Si nadie inició sesión, o el rol no tiene permiso para esta pantalla, lo devuelve al login
function exigirSesion(rolesPermitidos) {
  const rol = leerSesion().rol;
  if (!rolesPermitidos.includes(rol)) {
    location.href = '../inicio/login.html';
  }
}

function cerrarSesion() {
  if (confirm('¿Desea cerrar sesión?')) {
    sessionStorage.clear();
    location.href = '../inicio/login.html';
  }
}


// ==================== 3. AYUDANTES ====================

// Dibuja la barra de arriba con el logo, el nombre del usuario y "Cerrar sesión"
function dibujarEncabezado() {
  const sesion = leerSesion();
  document.getElementById('encabezado').innerHTML =
    '<a href="../inicio/menu.html"><img src="../imagenes/logo.jpg" alt="Mascoticas"></a>' +
    '<a href="../inicio/menu.html">Menú principal</a>' +
    '<span>' + sesion.nombre + ' (' + sesion.rol + ')</span>' +
    '<button onclick="cerrarSesion()">Cerrar sesión</button>';
}

// Lee todos los campos de un formulario y los devuelve en un objeto.
// Ejemplo: { cedula: '123', nombre: 'Ana', ... }   (la clave es el "name" de cada campo)
function leerFormulario(idFormulario) {
  const formulario = document.getElementById(idFormulario);
  const datos = {};
  for (const campo of formulario.elements) {
    if (campo.name != '') {
      datos[campo.name] = campo.value.trim(); // trim() quita espacios sobrantes
    }
  }
  return datos;
}

// Recibe la lista de errores del validador.
// Pinta en rojo los campos con error y muestra el mensaje "Datos inválidos".
// Devuelve true si NO hubo errores.
function mostrarErrores(idFormulario, errores) {
  const formulario = document.getElementById(idFormulario);

  // Quita el rojo de todos los campos
  for (const campo of formulario.elements) {
    campo.classList.remove('campo-error');
  }

  if (errores.length == 0) {
    return true;
  }

  let mensaje = 'Datos inválidos:';
  for (const error of errores) {
    formulario.elements[error.campo].classList.add('campo-error'); // pinta el campo en rojo
    mensaje = mensaje + '\n- ' + error.mensaje;
  }
  alert(mensaje);
  return false;
}

// Dibuja una tabla.
// filas:    la lista que viene del back
// columnas: ej [ { titulo: 'Cédula', campo: 'cedula' }, ... ]
function dibujarTabla(idTabla, filas, columnas) {
  let html = '<tr>';
  for (const columna of columnas) {
    html = html + '<th>' + columna.titulo + '</th>';
  }
  html = html + '</tr>';

  if (filas.length == 0) {
    html = html + '<tr><td colspan="' + columnas.length + '">No hay registros</td></tr>';
  }

  for (const fila of filas) {
    html = html + '<tr>';
    for (const columna of columnas) {
      html = html + '<td>' + fila[columna.campo] + '</td>';
    }
    html = html + '</tr>';
  }

  document.getElementById(idTabla).innerHTML = html;
}

// Llena una lista desplegable (<select>) con opciones.
// opciones: ej [ { valor: 1, texto: 'Ana Pérez' }, ... ]
function llenarSelect(idSelect, opciones) {
  let html = '<option value="">-- Seleccione --</option>';
  for (const opcion of opciones) {
    html = html + '<option value="' + opcion.valor + '">' + opcion.texto + '</option>';
  }
  document.getElementById(idSelect).innerHTML = html;
}

// Muestra u oculta el formulario de crear
function mostrarFormulario(idSeccion, idFormulario) {
  document.getElementById(idFormulario).reset(); // limpia los campos
  document.getElementById(idSeccion).hidden = false;
}

function ocultarFormulario(idSeccion) {
  document.getElementById(idSeccion).hidden = true;
}

// Botón Salir: pide confirmación antes de cerrar el formulario
function salir() {
  if (confirm('¿Seguro que desea salir? Los datos no guardados se perderán.')) {
    ocultarFormulario('seccionFormulario');
  }
}

// Fecha de hoy en el formato de los campos de fecha: "2026-11-10"
function fechaDeHoy() {
  return new Date().toLocaleDateString('en-CA');
}
