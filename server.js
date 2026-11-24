/**
 * RESUMEN: La puerta del back. Recibe lo que manda el front (/api/...) y se lo pasa al Control que toca.
 *
 * ARCHIVO: server.js   ← AQUÍ EMPIEZA EL BACK (Vercel exige que se llame "server.js")
 *
 * QUÉ HACE: RECIBE todas las peticiones que manda el front (las que empiezan por /api).
 *           Según la dirección (ruta) que llega, llama al método del control que corresponde
 *           y le devuelve la respuesta al front.
 *
 * RECORRIDO:  front (public/)  →  server.js (ruta)  →  back/control  →  back/persistencia  →  datos
 *
 * CÓMO SE ARRANCA:  Vercel lo arranca solo (las páginas de public/ también las publica Vercel)
 */

const express = require('express'); // librería para recibir peticiones del front

const ControlClientes = require('./back/control/ControlClientes');
const ControlMascotas = require('./back/control/ControlMascotas');
const ControlEmpleados = require('./back/control/ControlEmpleados');
const ControlCitas = require('./back/control/ControlCitas');
const ControlNotificaciones = require('./back/control/ControlNotificaciones');

const controlClientes = new ControlClientes();
const controlMascotas = new ControlMascotas();
const controlEmpleados = new ControlEmpleados();
const controlCitas = new ControlCitas();
const controlNotificaciones = new ControlNotificaciones();

const app = express();
app.use(express.json()); // convierte los datos que llegan del front en un objeto (queda en req.body)

// Si alguien entra a la dirección principal (sin nada después), lo manda a la pantalla de login
app.get('/', function (req, res) {
  res.redirect('/inicio/login.html');
});

// Respuesta cuando alguien que no es secretaria intenta crear algo
const SOLO_SECRETARIA = { ok: false, mensaje: 'Acceso permitido solo a usuarios con rol de secretaria' };

/*
 * RUTAS
 *   app.get(...)  = consultar        app.post(...) = crear
 *   req.body          = datos del formulario
 *   req.query         = datos que van en la dirección después del "?"  (ej: /api/clientes?buscar=ana)
 *   req.headers.rol   = rol de quien inició sesión (lo manda el front en cada petición)
 *   res.json(...)     = lo que se le responde al front
 */

// ---------- Inicio de sesión ----------
app.post('/api/sesion', async function (req, res) {
  const respuesta = await controlEmpleados.iniciarSesion(req.body.usuario, req.body.clave);
  res.json(respuesta);
});

// ---------- Clientes (Renzo Gallardo) ----------
app.post('/api/clientes', async function (req, res) {
  if (req.headers.rol != 'secretaria') return res.json(SOLO_SECRETARIA);
  const respuesta = await controlClientes.crear(req.body);
  res.json(respuesta);
});

app.get('/api/clientes', async function (req, res) {
  const respuesta = await controlClientes.consultar(req.query.buscar);
  res.json(respuesta);
});

// ---------- Mascotas (Ian Carmona) ----------
app.post('/api/mascotas', async function (req, res) {
  if (req.headers.rol != 'secretaria') return res.json(SOLO_SECRETARIA);
  const respuesta = await controlMascotas.crear(req.body);
  res.json(respuesta);
});

app.get('/api/mascotas', async function (req, res) {
  const respuesta = await controlMascotas.consultar(req.query.buscar, req.query.clienteId);
  res.json(respuesta);
});

// ---------- Empleados (Ángel Araujo) ----------
app.post('/api/empleados', async function (req, res) {
  if (req.headers.rol != 'secretaria') return res.json(SOLO_SECRETARIA);
  const respuesta = await controlEmpleados.crear(req.body);
  res.json(respuesta);
});

app.get('/api/empleados', async function (req, res) {
  const respuesta = await controlEmpleados.consultar(req.query.rol);
  res.json(respuesta);
});

// ---------- Citas (Mouriss ElJawich) ----------
app.post('/api/citas', async function (req, res) {
  if (req.headers.rol != 'secretaria') return res.json(SOLO_SECRETARIA);
  const respuesta = await controlCitas.crear(req.body);
  res.json(respuesta);
});

app.get('/api/citas', async function (req, res) {
  const respuesta = await controlCitas.consultarDelDia(req.query.fecha);
  res.json(respuesta);
});

// ---------- Notificaciones (Niyerlin Muñoz) ----------
app.post('/api/notificaciones', async function (req, res) {
  if (req.headers.rol != 'secretaria') return res.json(SOLO_SECRETARIA);
  const respuesta = await controlNotificaciones.crear(req.body);
  res.json(respuesta);
});

app.get('/api/notificaciones', async function (req, res) {
  const respuesta = await controlNotificaciones.consultar();
  res.json(respuesta);
});

// ---------- Si algo falla al leer o escribir en la base de datos (Redis) ----------
app.use(function (error, req, res, next) {
  console.log(error);
  res.json({ ok: false, mensaje: 'Fallo en la conexión con la base de datos' });
});

// ---------- Arranca el servidor ----------
app.listen(3000, function () {
  console.log('Back de Mascoticas listo');
});
