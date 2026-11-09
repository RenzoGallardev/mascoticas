# Mascoticas — Equipo 57-7

Sistema interno para un consultorio veterinario. Primer Sprint.

## Publicarlo en Vercel (una sola vez)

1. En vercel.com: **Add New → Project** → elegir el repositorio `mascoticas` → **Deploy**.
2. En el proyecto: **Storage → Create Database → Upstash for Redis** (gratis) → **Connect**.
   (Es la base de datos en línea. Vercel no deja guardar archivos.)
3. **Deployments → ⋯ → Redeploy**.

Listo. El link que da Vercel es el de la presentación. Cada vez que se sube algo a GitHub, Vercel se actualiza solo.

## Correrlo en la laptop (opcional)

```
npm install
npm start
```
Abrir **http://localhost:3000**

### Usuarios de prueba (están en `back/datos/empleados.json`)
| Usuario | Clave | Rol |
|---|---|---|
| secretaria | secretaria123 | secretaria (hace todo) |
| veterinario | veterinario123 | veterinario (solo consulta) |

## Carpetas

```
public/                ← FRONT: las páginas (HTML + JavaScript). Vercel exige el nombre "public".
  comun/               código que usan todas las pantallas (conexión con el back, tablas, estilos)
  inicio/              login y menú principal
  clientes/            Renzo    — Crear cliente, Consultar cliente
  mascotas/            Ian      — Registrar mascota, Consultar mascota
  empleados/           Ángel    — Crear empleado, Consultar empleado
  citas/               Jawi     — Crear cita médica, Consultar citas del día
  notificaciones/      Niyerlin — Crear notificación, Consultar notificación
  imagenes/            logo

server.js              ← BACK: la "puerta". RECIBE todas las peticiones del front (rutas /api/...)
back/                  ← BACK: el resto
  control/             LÓGICA: reglas de negocio (una clase por módulo)
  modelo/              ENTIDADES: qué datos tiene un cliente, una mascota, etc.
  persistencia/        ArchivoJson: la única clase que lee y guarda datos
  datos/               datos con los que arranca el sistema
```

Front y back siguen separados: el front solo habla con el back pidiendo direcciones `/api/...`.

## El recorrido (lo que pregunta la profe en la defensa)

Todas las historias siguen **el mismo camino**. Ejemplo con *Crear cliente*:

| # | Pregunta de la profe | Respuesta | Archivo |
|---|---|---|---|
| 1 | ¿Dónde está la interfaz? | Formulario "Registrar cliente" | `public/clientes/clientes.html` |
| 2 | ¿Qué método valida los campos? | `ValidadorCliente.validar()` | `public/clientes/clientes.js` |
| 3 | ¿Qué método comunica el front con el back? | `conexion.enviar('POST', '/clientes')` | `public/comun/comun.js` |
| 4 | ¿Quién recibe en el back? | `app.post('/api/clientes')` | `server.js` |
| 5 | ¿Y qué hace después? | `ControlClientes.crear()`: revisa que la cédula no exista | `back/control/ControlClientes.js` |
| 6 | ¿Quién guarda? | `ArchivoJson.agregar()` | `back/persistencia/ArchivoJson.js` |
| 7 | ¿Dónde queda? | En Vercel: base de datos Upstash Redis. En la laptop: `back/datos/clientes.json` | |

Para las demás historias, cambia "clientes" por "mascotas", "empleados", "citas" o "notificaciones".

### Preguntas típicas
- **¿Por qué validan en el front y también en el back?** En el front se revisa el formato (campos vacíos, números) para no mandar datos malos al back. En el back se revisan las reglas que necesitan los datos guardados (cédula repetida, cruce de horarios) y el rol (solo la secretaria crea).
- **¿Quién habla con la base de datos?** Solo `ArchivoJson` (carpeta `back/persistencia`).
- **¿Cómo sabe el back quién está usando el sistema?** Al iniciar sesión se guarda el rol en el navegador, y `conexion.enviar` lo manda en cada petición. El back revisa que sea `secretaria` antes de crear.
- **¿Dónde están las reglas del Brief?**
  - Horario de 8–12 y 2–6, y no dos citas a la misma hora: `ControlCitas.crear()`
  - Mascota con dueño existente: `ControlMascotas.crear()`
  - Cliente con Telegram: `ControlNotificaciones.crear()`
  - Solo la secretaria crea: `server.js` (la línea `if (req.headers.rol != 'secretaria')`)
