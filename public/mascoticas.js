/**
 * RESUMEN: Lógica unificada y simplificada de la capa Vista (MVC) de Mascoticas.
 *          Incluye conexión con Controladores, sesión, ayudantes comunes,
 *          los 5 Validadores, las 7 Vistas y el navegador entre pantallas.
 *
 * ARCHIVO:  public/mascoticas.js
 * CAPA MVC: Vista (lógica de presentación unificada)
 */

const DIRECCION_BACK = '/api';


// ==================== 1. CONEXIÓN CON EL CONTROLADOR ====================

class ConexionBack {
  async enviar(metodo, ruta, datos) {
    const opciones = {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'rol': leerSesion().rol || ''
      }
    };
    if (metodo == 'POST') opciones.body = JSON.stringify(datos);

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

const guardarSesion = (datos) => {
  sessionStorage.setItem('nombre', datos.nombre);
  sessionStorage.setItem('rol', datos.rol);
};

const leerSesion = () => ({
  nombre: sessionStorage.getItem('nombre'),
  rol: sessionStorage.getItem('rol')
});

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
  const datos = {};
  for (const campo of document.getElementById(idFormulario).elements) {
    if (campo.name) datos[campo.name] = campo.value.trim();
  }
  return datos;
}

function limpiarErroresFormulario(idFormulario) {
  for (const campo of document.getElementById(idFormulario).elements) {
    campo.classList.remove('campo-error');
  }
}

function mostrarErrores(idFormulario, errores) {
  const formulario = document.getElementById(idFormulario);
  limpiarErroresFormulario(idFormulario);
  if (errores.length == 0) return true;

  let mensaje = 'Datos inválidos:';
  for (const error of errores) {
    formulario.elements[error.campo].classList.add('campo-error');
    mensaje += '\n- ' + error.mensaje;
  }
  alert(mensaje);
  return false;
}

function dibujarTabla(idTabla, filas, columnas) {
  let html = '<tr>' + columnas.map((c) => '<th>' + c.titulo + '</th>').join('') + '</tr>';
  if (filas.length == 0) {
    html += '<tr><td colspan="' + columnas.length + '">No hay registros</td></tr>';
  } else {
    html += filas.map((fila) =>
      '<tr>' + columnas.map((c) => '<td>' + fila[c.campo] + '</td>').join('') + '</tr>'
    ).join('');
  }
  document.getElementById(idTabla).innerHTML = html;
}

function llenarSelect(idSelect, opciones) {
  document.getElementById(idSelect).innerHTML =
    '<option value="">-- Seleccione --</option>' +
    opciones.map((o) => '<option value="' + o.valor + '">' + o.texto + '</option>').join('');
}

function filtrarLista(idTexto, idSelect) {
  const texto = document.getElementById(idTexto).value.toLowerCase();
  for (const opcion of document.getElementById(idSelect).options) {
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

const fechaDeHoy = () => new Date().toLocaleDateString('en-CA');

// Motor declarativo reutilizado por los 5 Validadores
function validarCampos(datos, reglas) {
  const errores = [];
  for (const regla of reglas) {
    const valor = datos[regla.campo] || '';
    if (regla.obligatorio && valor == '') {
      errores.push({ campo: regla.campo, mensaje: regla.obligatorio });
    } else if (regla.numerico && valor != '' && isNaN(valor)) {
      errores.push({ campo: regla.campo, mensaje: regla.numerico });
    } else if (regla.correo && valor != '' && !valor.includes('@')) {
      errores.push({ campo: regla.campo, mensaje: regla.correo });
    } else if (regla.minLongitud && valor.length < regla.minLongitud.min) {
      errores.push({ campo: regla.campo, mensaje: regla.minLongitud.mensaje });
    } else if (regla.desdeHoy && valor != '' && valor < fechaDeHoy()) {
      errores.push({ campo: regla.campo, mensaje: regla.desdeHoy });
    }
  }
  return errores;
}

// Flujo común para crear registros desde cualquier Vista
async function guardarRegistro({ form, seccion, validador, pregunta, ruta, alGuardar }) {
  const datos = leerFormulario(form);
  if (!mostrarErrores(form, validador.validar(datos))) return;
  if (!confirm(pregunta)) return;

  const respuesta = await conexion.enviar('POST', ruta, datos);
  alert(respuesta.mensaje);
  if (respuesta.ok) {
    ocultarFormulario(seccion);
    await alGuardar(datos);
  }
}

// Flujo común para consultar y dibujar tablas
async function consultarTabla(idTabla, ruta, columnas) {
  const respuesta = await conexion.enviar('GET', ruta);
  if (!respuesta.ok) {
    alert(respuesta.mensaje);
    return;
  }
  dibujarTabla(idTabla, respuesta.datos, columnas);
}

// Ayudantes comunes para llenar <select> de clientes y mascotas
async function obtenerClientes() {
  const respuesta = await conexion.enviar('GET', '/clientes?buscar=');
  if (!respuesta.ok) {
    alert(respuesta.mensaje);
    return null;
  }
  return respuesta.datos;
}

function opcionesDeClientes(clientes) {
  return clientes.map((c) => ({ valor: c.id, texto: c.cedula + ' - ' + c.nombre + ' ' + c.apellido }));
}

async function cargarSelectMascotas(idSelect, clienteId) {
  if (!clienteId) {
    llenarSelect(idSelect, []);
    return;
  }
  const respuesta = await conexion.enviar('GET', '/mascotas?buscar=&clienteId=' + encodeURIComponent(clienteId));
  if (!respuesta.ok) {
    alert(respuesta.mensaje);
    return;
  }
  llenarSelect(idSelect, respuesta.datos.map((m) => ({ valor: m.id, texto: m.nombre + ' (' + m.especie + ')' })));
}


// ==================== 3. VALIDADORES DE FORMULARIOS ====================

// Clientes — Renzo Gallardo
class ValidadorCliente {
  validar(datos) {
    return validarCampos(datos, [
      { campo: 'cedula',   obligatorio: 'La cédula es obligatoria',   numerico: 'La cédula solo debe tener números' },
      { campo: 'nombre',   obligatorio: 'El nombre es obligatorio' },
      { campo: 'apellido', obligatorio: 'El apellido es obligatorio' },
      { campo: 'telefono', obligatorio: 'El teléfono es obligatorio', numerico: 'El teléfono solo debe tener números' },
      { campo: 'correo',   correo: 'El correo no es válido' }
    ]);
  }
}

// Mascotas — Ian Carmona
class ValidadorMascota {
  validar(datos) {
    return validarCampos(datos, [
      { campo: 'clienteId', obligatorio: 'Debe seleccionar el dueño (no hay mascotas sin dueño)' },
      { campo: 'nombre',    obligatorio: 'El nombre es obligatorio' },
      { campo: 'especie',   obligatorio: 'La especie es obligatoria' }
    ]);
  }
}

// Empleados — Ángel Araujo
class ValidadorEmpleado {
  validar(datos) {
    return validarCampos(datos, [
      { campo: 'cedula',   obligatorio: 'La cédula es obligatoria', numerico: 'La cédula solo debe tener números' },
      { campo: 'rol',      obligatorio: 'El rol es obligatorio' },
      { campo: 'nombre',   obligatorio: 'El nombre es obligatorio' },
      { campo: 'apellido', obligatorio: 'El apellido es obligatorio' },
      { campo: 'usuario',  obligatorio: 'El usuario es obligatorio' },
      { campo: 'clave',    minLongitud: { min: 6, mensaje: 'La clave debe tener al menos 6 caracteres' } }
    ]);
  }
}

// Citas — Mouriss ElJawich
class ValidadorCita {
  validar(datos) {
    return validarCampos(datos, [
      { campo: 'clienteId',     obligatorio: 'Seleccione el cliente' },
      { campo: 'mascotaId',     obligatorio: 'Seleccione la mascota' },
      { campo: 'veterinarioId', obligatorio: 'Seleccione el veterinario' },
      { campo: 'tipo',          obligatorio: 'Seleccione el tipo de consulta' },
      { campo: 'fecha',         obligatorio: 'Seleccione la fecha', desdeHoy: 'La fecha no puede ser anterior a hoy' },
      { campo: 'hora',          obligatorio: 'Seleccione la hora' }
    ]);
  }
}

// Notificaciones — Niyerlin Muñoz
class ValidadorNotificacion {
  validar(datos) {
    return validarCampos(datos, [
      { campo: 'clienteId', obligatorio: 'Seleccione el cliente' },
      { campo: 'mascotaId', obligatorio: 'Seleccione la mascota' },
      { campo: 'servicio',  obligatorio: 'Seleccione el tipo de servicio' },
      { campo: 'fecha',     obligatorio: 'Seleccione la fecha' },
      { campo: 'hora',      obligatorio: 'Seleccione la hora' }
    ]);
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
    if (!datos.usuario || !datos.clave) {
      alert('Ingrese usuario y clave');
      return;
    }

    const respuesta = await conexion.enviar('POST', '/sesion', datos);
    if (!respuesta.ok) {
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
    for (const boton of document.querySelectorAll('#vista-menu .solo-secretaria')) {
      boton.hidden = sesion.rol != 'secretaria';
    }
  }
}

// ---------- Vista: Clientes (Renzo Gallardo) ----------
class VistaClientes {
  constructor() { this.validador = new ValidadorCliente(); }

  abrir() {
    ocultarFormulario('seccionFormClientes');
    this.consultar();
  }

  guardar() {
    return guardarRegistro({
      form: 'formClientes',
      seccion: 'seccionFormClientes',
      validador: this.validador,
      pregunta: '¿Desea guardar el cliente?',
      ruta: '/clientes',
      alGuardar: () => this.consultar()
    });
  }

  consultar() {
    const texto = document.getElementById('buscarClientes').value;
    return consultarTabla('tablaClientes', '/clientes?buscar=' + encodeURIComponent(texto), [
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
  constructor() { this.validador = new ValidadorMascota(); }

  abrir() {
    ocultarFormulario('seccionFormMascotas');
    document.getElementById('botonNuevoMascotas').hidden = leerSesion().rol != 'secretaria';
    this.consultar();
  }

  async abrirFormulario() {
    const clientes = await obtenerClientes();
    if (!clientes) return;
    if (clientes.length == 0) {
      alert('Primero debe registrar al dueño en Clientes');
      return;
    }
    mostrarFormulario('seccionFormMascotas', 'formMascotas');
    llenarSelect('selectDuenoMascotas', opcionesDeClientes(clientes));
  }

  guardar() {
    return guardarRegistro({
      form: 'formMascotas',
      seccion: 'seccionFormMascotas',
      validador: this.validador,
      pregunta: '¿Desea guardar la mascota?',
      ruta: '/mascotas',
      alGuardar: () => this.consultar()
    });
  }

  consultar() {
    const texto = document.getElementById('buscarMascotas').value;
    return consultarTabla('tablaMascotas', '/mascotas?buscar=' + encodeURIComponent(texto) + '&clienteId=', [
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
  constructor() { this.validador = new ValidadorEmpleado(); }

  abrir() {
    ocultarFormulario('seccionFormEmpleados');
    document.getElementById('botonNuevoEmpleados').hidden = leerSesion().rol != 'secretaria';
    this.consultar();
  }

  guardar() {
    return guardarRegistro({
      form: 'formEmpleados',
      seccion: 'seccionFormEmpleados',
      validador: this.validador,
      pregunta: '¿Desea guardar el empleado?',
      ruta: '/empleados',
      alGuardar: () => this.consultar()
    });
  }

  consultar() {
    const rol = document.getElementById('filtroRolEmpleados').value;
    return consultarTabla('tablaEmpleados', '/empleados?rol=' + encodeURIComponent(rol), [
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
  constructor() { this.validador = new ValidadorCita(); }

  abrir() {
    ocultarFormulario('seccionFormCitas');
    document.getElementById('botonNuevoCitas').hidden = leerSesion().rol != 'secretaria';
    document.getElementById('fechaConsultaCitas').value = fechaDeHoy();
    this.consultar();
  }

  async abrirFormulario() {
    const clientes = await obtenerClientes();
    const veterinarios = await conexion.enviar('GET', '/empleados?rol=veterinario');
    if (!clientes || !veterinarios.ok) {
      if (!veterinarios.ok) alert(veterinarios.mensaje);
      return;
    }

    mostrarFormulario('seccionFormCitas', 'formCitas');
    llenarSelect('selectClienteCitas', opcionesDeClientes(clientes));
    llenarSelect('selectVeterinarioCitas', veterinarios.datos.map((v) => ({ valor: v.id, texto: v.nombre + ' ' + v.apellido })));
    llenarSelect('selectMascotaCitas', []);
  }

  cargarMascotasDelCliente() {
    return cargarSelectMascotas('selectMascotaCitas', document.getElementById('selectClienteCitas').value);
  }

  guardar() {
    return guardarRegistro({
      form: 'formCitas',
      seccion: 'seccionFormCitas',
      validador: this.validador,
      pregunta: '¿Desea guardar la cita?',
      ruta: '/citas',
      alGuardar: (datos) => {
        document.getElementById('fechaConsultaCitas').value = datos.fecha;
        return this.consultar();
      }
    });
  }

  consultar() {
    const fecha = document.getElementById('fechaConsultaCitas').value;
    return consultarTabla('tablaCitas', '/citas?fecha=' + encodeURIComponent(fecha), [
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
    const clientes = await obtenerClientes();
    if (!clientes) return;
    this.listaClientes = clientes;

    if (clientes.length == 0) {
      alert('No existe cliente ni mascota registrada');
      return;
    }

    mostrarFormulario('seccionFormNotificaciones', 'formNotificaciones');
    llenarSelect('selectClienteNotificaciones', opcionesDeClientes(clientes));
    llenarSelect('selectMascotaNotificaciones', []);
  }

  alElegirCliente() {
    const clienteId = document.getElementById('selectClienteNotificaciones').value;
    const elegido = this.listaClientes.find((c) => c.id == clienteId);

    if (elegido && !elegido.telegram) {
      alert('El cliente no posee cuenta de telegram');
      document.getElementById('selectClienteNotificaciones').value = '';
      llenarSelect('selectMascotaNotificaciones', []);
      return;
    }

    return cargarSelectMascotas('selectMascotaNotificaciones', clienteId);
  }

  guardar() {
    return guardarRegistro({
      form: 'formNotificaciones',
      seccion: 'seccionFormNotificaciones',
      validador: this.validador,
      pregunta: '¿Desea crear la notificación?',
      ruta: '/notificaciones',
      alGuardar: () => this.consultar()
    });
  }

  consultar() {
    return consultarTabla('tablaNotificaciones', '/notificaciones', [
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

  if (config.roles != null) {
    if (!config.roles.includes(leerSesion().rol)) {
      navegar('login');
      return;
    }
    dibujarEncabezado();
  } else {
    ocultarEncabezado();
  }

  for (const vista of document.querySelectorAll('.vista')) {
    vista.hidden = true;
  }
  document.getElementById('vista-' + destino).hidden = false;
  document.title = config.titulo;

  if (location.hash != '#' + destino) {
    history.replaceState(null, '', '#' + destino);
  }

  config.vista.abrir();
}

window.addEventListener('DOMContentLoaded', () => {
  const inicial = location.hash.replace('#', '');
  if (leerSesion().rol && PANTALLAS[inicial] && inicial != 'login') {
    navegar(inicial);
  } else if (leerSesion().rol) {
    navegar('menu');
  } else {
    navegar('login');
  }
});
