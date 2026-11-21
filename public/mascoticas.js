/**
 * RESUMEN: Lógica unificada de la capa Vista (MVC) de Mascoticas.
 *          Incluye conexión con Controladores, sesión, ayudantes de interfaz,
 *          los 5 Validadores, las 7 Vistas y el navegador entre pantallas.
 *
 * ARCHIVO:  public/mascoticas.js
 * CAPA MVC: Vista (lógica de presentación unificada)
 *
 * RECORRIDO MVC:
 *   Vista (mascoticas.html + mascoticas.js) → conexion.enviar() → server.js
 *   → Controlador (back/control/Control*.js) → Modelo (back/modelo/*.js) → ArchivoJson (Redis)
 */

const DIRECCION_BACK = '/api'; // el servidor está en la misma dirección, bajo /api


// ==================== 1. CONEXIÓN CON EL CONTROLADOR ====================

class ConexionBack {

  // metodo: 'GET' (consultar) o 'POST' (crear)
  // ruta:   ej '/clientes'
  // datos:  los datos del formulario (solo para POST)
  // Devuelve lo que responde el Controlador: { ok, mensaje, datos }
  async enviar(metodo, ruta, datos) {
    const opciones = {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'rol': leerSesion().rol || '' // le dice al Controlador quién está usando el sistema
      }
    };
    if (metodo == 'POST') {
      opciones.body = JSON.stringify(datos);
    }

    try {
      const respuesta = await fetch(DIRECCION_BACK + ruta, opciones);
      return await respuesta.json();
    } catch (error) {
      return { ok: false, mensaje: 'Fallo en la conexión con el servidor' };
    }
  }
}

const conexion = new ConexionBack();


// ==================== 2. SESIÓN Y AYUDANTES DE VISTA ====================

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

function cerrarSesion() {
  if (confirm('¿Desea cerrar sesión?')) {
    sessionStorage.clear();
    navegar('login');
  }
}

function dibujarEncabezado() {
  const sesion = leerSesion();
  const encabezado = document.getElementById('encabezado');
  encabezado.hidden = false;
  encabezado.style.display = '';
  encabezado.innerHTML =
    '<a href="#menu" onclick="navegar(\'menu\'); return false;"><img src="imagenes/logo.jpg" alt="Mascoticas"></a>' +
    '<a href="#menu" onclick="navegar(\'menu\'); return false;">Menú principal</a>' +
    '<span>' + sesion.nombre + ' (' + sesion.rol + ')</span>' +
    '<button onclick="cerrarSesion()">Cerrar sesión</button>';
}

function ocultarEncabezado() {
  const encabezado = document.getElementById('encabezado');
  encabezado.hidden = true;
  encabezado.style.display = 'none';
  encabezado.innerHTML = '';
}

function leerFormulario(idFormulario) {
  const formulario = document.getElementById(idFormulario);
  const datos = {};
  for (const campo of formulario.elements) {
    if (campo.name != '') {
      datos[campo.name] = campo.value.trim();
    }
  }
  return datos;
}

function limpiarErroresFormulario(idFormulario) {
  const formulario = document.getElementById(idFormulario);
  for (const campo of formulario.elements) {
    campo.classList.remove('campo-error');
  }
}

function mostrarErrores(idFormulario, errores) {
  const formulario = document.getElementById(idFormulario);
  limpiarErroresFormulario(idFormulario);

  if (errores.length == 0) {
    return true;
  }

  let mensaje = 'Datos inválidos:';
  for (const error of errores) {
    formulario.elements[error.campo].classList.add('campo-error');
    mensaje = mensaje + '\n- ' + error.mensaje;
  }
  alert(mensaje);
  return false;
}

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

function llenarSelect(idSelect, opciones) {
  let html = '<option value="">-- Seleccione --</option>';
  for (const opcion of opciones) {
    html = html + '<option value="' + opcion.valor + '">' + opcion.texto + '</option>';
  }
  document.getElementById(idSelect).innerHTML = html;
}

function filtrarLista(idTexto, idSelect) {
  const texto = document.getElementById(idTexto).value.toLowerCase();
  const opciones = document.getElementById(idSelect).options;
  for (const opcion of opciones) {
    opcion.hidden = !opcion.text.toLowerCase().includes(texto);
  }
}

function mostrarFormulario(idSeccion, idFormulario) {
  document.getElementById(idFormulario).reset();
  limpiarErroresFormulario(idFormulario);
  document.getElementById(idSeccion).hidden = false;
}

function ocultarFormulario(idSeccion) {
  document.getElementById(idSeccion).hidden = true;
}

function salir(idSeccion) {
  if (confirm('¿Seguro que desea salir? Los datos no guardados se perderán.')) {
    ocultarFormulario(idSeccion);
  }
}

function fechaDeHoy() {
  return new Date().toLocaleDateString('en-CA');
}


// ==================== 3. VALIDADORES DE FORMULARIOS ====================

// Clientes — Renzo Gallardo
class ValidadorCliente {
  validar(datos) {
    const errores = [];

    if (datos.cedula == '') {
      errores.push({ campo: 'cedula', mensaje: 'La cédula es obligatoria' });
    } else if (isNaN(datos.cedula)) {
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

// Mascotas — Ian Carmona
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

// Empleados — Ángel Araujo
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

// Citas — Mouriss ElJawich
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

// Notificaciones — Niyerlin Muñoz
class ValidadorNotificacion {
  validar(datos) {
    const errores = [];
    if (datos.clienteId == '') {
      errores.push({ campo: 'clienteId', mensaje: 'Seleccione el cliente' });
    }
    if (datos.mascotaId == '') {
      errores.push({ campo: 'mascotaId', mensaje: 'Seleccione la mascota' });
    }
    if (datos.servicio == '') {
      errores.push({ campo: 'servicio', mensaje: 'Seleccione el tipo de servicio' });
    }
    if (datos.fecha == '') {
      errores.push({ campo: 'fecha', mensaje: 'Seleccione la fecha' });
    }
    if (datos.hora == '') {
      errores.push({ campo: 'hora', mensaje: 'Seleccione la hora' });
    }
    return errores;
  }
}


// ==================== 4. VISTAS MVC ====================

// ---------- Vista: Inicio de sesión ----------
class VistaLogin {
  abrir() {
    document.getElementById('formLogin').reset();
  }

  async entrar() {
    const datos = leerFormulario('formLogin');
    if (datos.usuario == '' || datos.clave == '') {
      alert('Ingrese usuario y clave');
      return;
    }

    const respuesta = await conexion.enviar('POST', '/sesion', datos);
    if (respuesta.ok == false) {
      alert(respuesta.mensaje);
      return;
    }

    guardarSesion(respuesta.datos);
    navegar('menu');
  }
}

// ---------- Vista: Menú principal ----------
class VistaMenu {
  abrir() {
    const sesion = leerSesion();
    document.getElementById('bienvenida').textContent = 'Bienvenido(a), ' + sesion.nombre;

    const botones = document.querySelectorAll('#vista-menu .solo-secretaria');
    for (const boton of botones) {
      boton.hidden = sesion.rol != 'secretaria';
    }
  }
}

// ---------- Vista: Clientes (Renzo Gallardo) ----------
class VistaClientes {
  constructor() {
    this.validador = new ValidadorCliente();
  }

  abrir() {
    ocultarFormulario('seccionFormClientes');
    this.consultar();
  }

  async guardar() {
    const datos = leerFormulario('formClientes');

    const errores = this.validador.validar(datos);
    if (mostrarErrores('formClientes', errores) == false) {
      return;
    }

    if (confirm('¿Desea guardar el cliente?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/clientes', datos);
    alert(respuesta.mensaje);

    if (respuesta.ok) {
      ocultarFormulario('seccionFormClientes');
      this.consultar();
    }
  }

  async consultar() {
    const texto = document.getElementById('buscarClientes').value;
    const respuesta = await conexion.enviar('GET', '/clientes?buscar=' + encodeURIComponent(texto));
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    dibujarTabla('tablaClientes', respuesta.datos, [
      { titulo: 'Cédula',   campo: 'cedula' },
      { titulo: 'Nombre',   campo: 'nombre' },
      { titulo: 'Apellido', campo: 'apellido' },
      { titulo: 'Teléfono', campo: 'telefono' },
      { titulo: 'Correo',   campo: 'correo' },
      { titulo: 'Telegram', campo: 'telegram' }
    ]);
  }
}

// ---------- Vista: Mascotas (Ian Carmona) ----------
class VistaMascotas {
  constructor() {
    this.validador = new ValidadorMascota();
  }

  abrir() {
    ocultarFormulario('seccionFormMascotas');
    document.getElementById('botonNuevoMascotas').hidden = leerSesion().rol != 'secretaria';
    this.consultar();
  }

  async abrirFormulario() {
    const respuesta = await conexion.enviar('GET', '/clientes?buscar=');
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }
    if (respuesta.datos.length == 0) {
      alert('Primero debe registrar al dueño en Clientes');
      return;
    }

    const opciones = [];
    for (const cliente of respuesta.datos) {
      opciones.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
    }
    mostrarFormulario('seccionFormMascotas', 'formMascotas');
    llenarSelect('selectDuenoMascotas', opciones);
  }

  async guardar() {
    const datos = leerFormulario('formMascotas');

    const errores = this.validador.validar(datos);
    if (mostrarErrores('formMascotas', errores) == false) {
      return;
    }

    if (confirm('¿Desea guardar la mascota?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/mascotas', datos);
    alert(respuesta.mensaje);

    if (respuesta.ok) {
      ocultarFormulario('seccionFormMascotas');
      this.consultar();
    }
  }

  async consultar() {
    const texto = document.getElementById('buscarMascotas').value;
    const respuesta = await conexion.enviar('GET', '/mascotas?buscar=' + encodeURIComponent(texto) + '&clienteId=');
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    dibujarTabla('tablaMascotas', respuesta.datos, [
      { titulo: 'Nombre',     campo: 'nombre' },
      { titulo: 'Especie',    campo: 'especie' },
      { titulo: 'Raza',       campo: 'raza' },
      { titulo: 'Sexo',       campo: 'sexo' },
      { titulo: 'Nacimiento', campo: 'fechaNacimiento' },
      { titulo: 'Dueño',      campo: 'dueno' }
    ]);
  }
}

// ---------- Vista: Empleados (Ángel Araujo) ----------
class VistaEmpleados {
  constructor() {
    this.validador = new ValidadorEmpleado();
  }

  abrir() {
    ocultarFormulario('seccionFormEmpleados');
    document.getElementById('botonNuevoEmpleados').hidden = leerSesion().rol != 'secretaria';
    this.consultar();
  }

  async guardar() {
    const datos = leerFormulario('formEmpleados');

    const errores = this.validador.validar(datos);
    if (mostrarErrores('formEmpleados', errores) == false) {
      return;
    }

    if (confirm('¿Desea guardar el empleado?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/empleados', datos);
    alert(respuesta.mensaje);

    if (respuesta.ok) {
      ocultarFormulario('seccionFormEmpleados');
      this.consultar();
    }
  }

  async consultar() {
    const rol = document.getElementById('filtroRolEmpleados').value;
    const respuesta = await conexion.enviar('GET', '/empleados?rol=' + encodeURIComponent(rol));
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    dibujarTabla('tablaEmpleados', respuesta.datos, [
      { titulo: 'Cédula',   campo: 'cedula' },
      { titulo: 'Nombre',   campo: 'nombre' },
      { titulo: 'Apellido', campo: 'apellido' },
      { titulo: 'Rol',      campo: 'rol' },
      { titulo: 'Usuario',  campo: 'usuario' },
      { titulo: 'Teléfono', campo: 'telefono' }
    ]);
  }
}

// ---------- Vista: Citas (Mouriss ElJawich) ----------
class VistaCitas {
  constructor() {
    this.validador = new ValidadorCita();
  }

  abrir() {
    ocultarFormulario('seccionFormCitas');
    document.getElementById('botonNuevoCitas').hidden = leerSesion().rol != 'secretaria';
    document.getElementById('fechaConsultaCitas').value = fechaDeHoy();
    this.consultar();
  }

  async abrirFormulario() {
    const clientes = await conexion.enviar('GET', '/clientes?buscar=');
    const veterinarios = await conexion.enviar('GET', '/empleados?rol=veterinario');
    if (!clientes.ok || !veterinarios.ok) {
      alert(clientes.mensaje || veterinarios.mensaje);
      return;
    }

    const opcionesClientes = [];
    for (const cliente of clientes.datos) {
      opcionesClientes.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
    }

    const opcionesVeterinarios = [];
    for (const veterinario of veterinarios.datos) {
      opcionesVeterinarios.push({ valor: veterinario.id, texto: veterinario.nombre + ' ' + veterinario.apellido });
    }

    mostrarFormulario('seccionFormCitas', 'formCitas');
    llenarSelect('selectClienteCitas', opcionesClientes);
    llenarSelect('selectVeterinarioCitas', opcionesVeterinarios);
    llenarSelect('selectMascotaCitas', []);
  }

  async cargarMascotasDelCliente() {
    const clienteId = document.getElementById('selectClienteCitas').value;
    if (clienteId == '') {
      llenarSelect('selectMascotaCitas', []);
      return;
    }

    const respuesta = await conexion.enviar('GET', '/mascotas?buscar=&clienteId=' + encodeURIComponent(clienteId));
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    const opciones = [];
    for (const mascota of respuesta.datos) {
      opciones.push({ valor: mascota.id, texto: mascota.nombre + ' (' + mascota.especie + ')' });
    }
    llenarSelect('selectMascotaCitas', opciones);
  }

  async guardar() {
    const datos = leerFormulario('formCitas');

    const errores = this.validador.validar(datos);
    if (mostrarErrores('formCitas', errores) == false) {
      return;
    }

    if (confirm('¿Desea guardar la cita?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/citas', datos);
    alert(respuesta.mensaje);

    if (respuesta.ok) {
      ocultarFormulario('seccionFormCitas');
      document.getElementById('fechaConsultaCitas').value = datos.fecha;
      this.consultar();
    }
  }

  async consultar() {
    const fecha = document.getElementById('fechaConsultaCitas').value;
    const respuesta = await conexion.enviar('GET', '/citas?fecha=' + encodeURIComponent(fecha));
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    dibujarTabla('tablaCitas', respuesta.datos, [
      { titulo: 'Hora',        campo: 'hora' },
      { titulo: 'Mascota',     campo: 'mascota' },
      { titulo: 'Veterinario', campo: 'veterinario' },
      { titulo: 'Tipo',        campo: 'tipo' },
      { titulo: 'Estado',      campo: 'estado' }
    ]);
  }
}

// ---------- Vista: Notificaciones (Niyerlin Muñoz) ----------
class VistaNotificaciones {
  constructor() {
    this.validador = new ValidadorNotificacion();
    this.listaClientes = [];
  }

  abrir() {
    ocultarFormulario('seccionFormNotificaciones');
    this.consultar();
  }

  async abrirFormulario() {
    const respuesta = await conexion.enviar('GET', '/clientes?buscar=');
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    this.listaClientes = respuesta.datos;
    if (this.listaClientes.length == 0) {
      alert('No existe cliente ni mascota registrada');
      return;
    }

    const opciones = [];
    for (const cliente of this.listaClientes) {
      opciones.push({ valor: cliente.id, texto: cliente.cedula + ' - ' + cliente.nombre + ' ' + cliente.apellido });
    }
    mostrarFormulario('seccionFormNotificaciones', 'formNotificaciones');
    llenarSelect('selectClienteNotificaciones', opciones);
    llenarSelect('selectMascotaNotificaciones', []);
  }

  async alElegirCliente() {
    const clienteId = document.getElementById('selectClienteNotificaciones').value;
    if (clienteId == '') {
      llenarSelect('selectMascotaNotificaciones', []);
      return;
    }

    let clienteElegido = null;
    for (const cliente of this.listaClientes) {
      if (cliente.id == clienteId) {
        clienteElegido = cliente;
      }
    }

    if (clienteElegido != null && !clienteElegido.telegram) {
      alert('El cliente no posee cuenta de telegram');
      document.getElementById('selectClienteNotificaciones').value = '';
      llenarSelect('selectMascotaNotificaciones', []);
      return;
    }

    const respuesta = await conexion.enviar('GET', '/mascotas?buscar=&clienteId=' + encodeURIComponent(clienteId));
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    const opciones = [];
    for (const mascota of respuesta.datos) {
      opciones.push({ valor: mascota.id, texto: mascota.nombre + ' (' + mascota.especie + ')' });
    }
    llenarSelect('selectMascotaNotificaciones', opciones);
  }

  async guardar() {
    const datos = leerFormulario('formNotificaciones');

    const errores = this.validador.validar(datos);
    if (mostrarErrores('formNotificaciones', errores) == false) {
      return;
    }

    if (confirm('¿Desea crear la notificación?') == false) {
      return;
    }

    const respuesta = await conexion.enviar('POST', '/notificaciones', datos);
    alert(respuesta.mensaje);

    if (respuesta.ok) {
      ocultarFormulario('seccionFormNotificaciones');
      this.consultar();
    }
  }

  async consultar() {
    const respuesta = await conexion.enviar('GET', '/notificaciones');
    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    dibujarTabla('tablaNotificaciones', respuesta.datos, [
      { titulo: 'Fecha',    campo: 'fecha' },
      { titulo: 'Hora',     campo: 'hora' },
      { titulo: 'Servicio', campo: 'servicio' },
      { titulo: 'Mensaje',  campo: 'mensaje' },
      { titulo: 'Estado',   campo: 'estado' }
    ]);
  }
}


// ==================== 5. NAVEGACIÓN ENTRE VISTAS ====================

const vistaLogin = new VistaLogin();
const vistaMenu = new VistaMenu();
const vistaClientes = new VistaClientes();
const vistaMascotas = new VistaMascotas();
const vistaEmpleados = new VistaEmpleados();
const vistaCitas = new VistaCitas();
const vistaNotificaciones = new VistaNotificaciones();

const PANTALLAS = {
  login:          { titulo: 'Iniciar sesión · Mascoticas', roles: null,                          vista: vistaLogin },
  menu:           { titulo: 'Menú · Mascoticas',           roles: ['secretaria', 'veterinario'], vista: vistaMenu },
  clientes:       { titulo: 'Clientes · Mascoticas',       roles: ['secretaria'],                vista: vistaClientes },
  mascotas:       { titulo: 'Mascotas · Mascoticas',       roles: ['secretaria', 'veterinario'], vista: vistaMascotas },
  empleados:      { titulo: 'Empleados · Mascoticas',      roles: ['secretaria', 'veterinario'], vista: vistaEmpleados },
  citas:          { titulo: 'Citas · Mascoticas',          roles: ['secretaria', 'veterinario'], vista: vistaCitas },
  notificaciones: { titulo: 'Notificaciones · Mascoticas', roles: ['secretaria'],                vista: vistaNotificaciones }
};

function navegar(pantalla) {
  const destino = PANTALLAS[pantalla] ? pantalla : 'login';
  const config = PANTALLAS[destino];

  // Si la pantalla requiere sesión o un rol específico, valida el permiso
  if (config.roles != null) {
    const rol = leerSesion().rol;
    if (!config.roles.includes(rol)) {
      navegar('login');
      return;
    }
    dibujarEncabezado();
  } else {
    ocultarEncabezado();
  }

  // Oculta todas las vistas y muestra solo la activa
  const vistas = document.querySelectorAll('.vista');
  for (const vista of vistas) {
    vista.hidden = true;
  }
  document.getElementById('vista-' + destino).hidden = false;
  document.title = config.titulo;

  if (location.hash != '#' + destino) {
    history.replaceState(null, '', '#' + destino);
  }

  config.vista.abrir();
}

// Al cargar la página: si ya hay sesión, abre la vista del hash o el menú; si no, abre el login
window.addEventListener('DOMContentLoaded', function () {
  const inicial = location.hash.replace('#', '');
  if (leerSesion().rol && PANTALLAS[inicial] && inicial != 'login') {
    navegar(inicial);
  } else if (leerSesion().rol) {
    navegar('menu');
  } else {
    navegar('login');
  }
});
