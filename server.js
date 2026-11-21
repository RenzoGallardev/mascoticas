/**
 * RESUMEN: Punto de entrada y enrutador MVC. Conecta las rutas HTTP (/api/...) con cada Controlador y sirve las Vistas de public/.
 *
 * ARCHIVO: server.js   ← AQUÍ EMPIEZA EL SERVIDOR (Vercel exige que se llame "server.js")
 *
 * QUÉ HACE: Solo configura Express y dirige cada petición al Controlador que le corresponde.
 *           NO contiene reglas de negocio ni lógica de permisos (eso vive en Controladores y Modelos).
 *
 * ARQUITECTURA MVC:
 *   Vista (public/)  →  server.js (rutas)  →  Controlador (back/control/)  →  Modelo (back/modelo/ + ArchivoJson)
 *
 * CÓMO SE ARRANCA: Vercel lo arranca solo (y en local con "npm start" también sirve public/).
 */

const path = require('path');
const express = require('express'); // librería para recibir peticiones HTTP

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
app.use(express.json()); // convierte el cuerpo JSON de las peticiones en req.body
app.use(express.static(path.join(__dirname, 'public'))); // sirve las Vistas (HTML, JS, CSS) en local

// Si alguien entra a la dirección principal, lo manda a la Vista unificada de Mascoticas
app.get('/', function (req, res) {
  res.redirect('/mascoticas.html');
});

/*
 * ENRUTAMIENTO MVC:
 *   Cada ruta delega directamente (req, res) al método del Controlador correspondiente.
 */

// ---------- Inicio de sesión ----------
app.post('/api/sesion', (req, res) => controlEmpleados.iniciarSesion(req, res));

// ---------- Clientes (Renzo Gallardo) ----------
app.post('/api/clientes', (req, res) => controlClientes.crear(req, res));
app.get('/api/clientes', (req, res) => controlClientes.consultar(req, res));

// ---------- Mascotas (Ian Carmona) ----------
app.post('/api/mascotas', (req, res) => controlMascotas.crear(req, res));
app.get('/api/mascotas', (req, res) => controlMascotas.consultar(req, res));

// ---------- Empleados (Ángel Araujo) ----------
app.post('/api/empleados', (req, res) => controlEmpleados.crear(req, res));
app.get('/api/empleados', (req, res) => controlEmpleados.consultar(req, res));

// ---------- Citas (Mouriss ElJawich) ----------
app.post('/api/citas', (req, res) => controlCitas.crear(req, res));
app.get('/api/citas', (req, res) => controlCitas.consultarDelDia(req, res));

// ---------- Notificaciones (Niyerlin Muñoz) ----------
app.post('/api/notificaciones', (req, res) => controlNotificaciones.crear(req, res));
app.get('/api/notificaciones', (req, res) => controlNotificaciones.consultar(req, res));

// ---------- Rutas de pantallas anteriores (ej. /inicio/login.html) ----------
app.use(function (req, res, next) {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && req.path !== '/mascoticas.html') {
    return res.redirect('/mascoticas.html');
  }
  next();
});

// ---------- Manejo global de errores (ej. fallo de conexión con Redis) ----------
app.use(function (error, req, res, next) {
  console.log(error);
  res.json({ ok: false, mensaje: 'Fallo en la conexión con la base de datos' });
});

// ---------- Arranca el servidor ----------
app.listen(3000, function () {
  console.log('Servidor MVC de Mascoticas listo en http://localhost:3000');
});
