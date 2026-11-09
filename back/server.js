/**
 * ARCHIVO: back/server.js   ← AQUÍ EMPIEZA EL BACK (Vercel exige que se llame "server.js")
 *
 * QUÉ HACE: RECIBE todas las peticiones que manda el front.
 *           Según la dirección (ruta) que llega, llama al método del control que corresponde
 *           y le devuelve la respuesta al front.
 *
 * RECORRIDO:  front  →  server.js (ruta)  →  control  →  ArchivoJson  →  datos/*.json
 *
 * CÓMO SE ARRANCA:  npm start     (en la laptop queda en http://localhost:3000; en Vercel arranca solo)
 */

const express = require('express'); // librería para recibir peticiones del front
const cors = require('cors');       // permite que el front (que corre en otra dirección) le hable al back

const ControlClientes = require('./control/ControlClientes');
const ControlMascotas = require('./control/ControlMascotas');
const ControlEmpleados = require('./control/ControlEmpleados');
const ControlCitas = require('./control/ControlCitas');
const ControlNotificaciones = require('./control/ControlNotificaciones');

const controlClientes = new ControlClientes();
const controlMascotas = new ControlMascotas();
const controlEmpleados = new ControlEmpleados();
const controlCitas = new ControlCitas();
const controlNotificaciones = new ControlNotificaciones();

const app = express();
app.use(cors());
app.use(express.json()); // convierte los datos que llegan del front en un objeto (queda en req.body)

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

// ---------- Si algo falla al leer o escribir los archivos .json ----------
app.use(function (error, req, res, next) {
  console.log(error);
  res.json({ ok: false, mensaje: 'Fallo en la conexión con la base de datos' });
});

// ---------- Arranca el servidor ----------
app.listen(3000, function () {
  console.log('Back de Mascoticas listo en http://localhost:3000');
});
