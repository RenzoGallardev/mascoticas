/**
 * RESUMEN: Punto de entrada y enrutador MVC. Conecta las rutas HTTP (/api/...) con cada Controlador y sirve la Vista de public/.
 *
 * ARCHIVO: server.js   ← AQUÍ EMPIEZA EL SERVIDOR (Vercel exige que se llame "server.js")
 *
 * ARQUITECTURA MVC:
 *   Vista (public/)  →  server.js (rutas)  →  Controlador (back/control/)  →  Modelo (back/modelo/ + ArchivoJson)
 */

const path = require('path');
const express = require('express');

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
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autorización: solo el rol "secretaria" puede crear registros
function soloSecretaria(req, res, next) {
  if (req.headers.rol != 'secretaria') {
    return res.json({ ok: false, mensaje: 'Acceso permitido solo a usuarios con rol de secretaria' });
  }
  next();
}

// Redirige la raíz a la Vista unificada
app.get('/', (req, res) => res.redirect('/mascoticas.html'));

// ---------- Inicio de sesión ----------
app.post('/api/sesion', (req, res) => controlEmpleados.iniciarSesion(req, res));

// ---------- Clientes (Renzo Gallardo) ----------
app.post('/api/clientes', soloSecretaria, (req, res) => controlClientes.crear(req, res));
app.get('/api/clientes', (req, res) => controlClientes.consultar(req, res));

// ---------- Mascotas (Ian Carmona) ----------
app.post('/api/mascotas', soloSecretaria, (req, res) => controlMascotas.crear(req, res));
app.get('/api/mascotas', (req, res) => controlMascotas.consultar(req, res));

// ---------- Empleados (Ángel Araujo) ----------
app.post('/api/empleados', soloSecretaria, (req, res) => controlEmpleados.crear(req, res));
app.get('/api/empleados', (req, res) => controlEmpleados.consultar(req, res));

// ---------- Citas (Mouriss ElJawich) ----------
app.post('/api/citas', soloSecretaria, (req, res) => controlCitas.crear(req, res));
app.get('/api/citas', (req, res) => controlCitas.consultarDelDia(req, res));

// ---------- Notificaciones (Niyerlin Muñoz) ----------
app.post('/api/notificaciones', soloSecretaria, (req, res) => controlNotificaciones.crear(req, res));
app.get('/api/notificaciones', (req, res) => controlNotificaciones.consultar(req, res));

// ---------- Rutas de pantallas anteriores (ej. /inicio/login.html) ----------
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && req.path !== '/mascoticas.html') {
    return res.redirect('/mascoticas.html');
  }
  next();
});

// ---------- Manejo global de errores (ej. fallo de conexión con Redis) ----------
app.use((error, req, res, next) => {
  console.log(error);
  res.json({ ok: false, mensaje: 'Fallo en la conexión con la base de datos' });
});

app.listen(3000, () => console.log('Servidor MVC de Mascoticas listo en http://localhost:3000'));
