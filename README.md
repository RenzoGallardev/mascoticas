# Mascoticas — Equipo 57-7

Sistema interno para un consultorio veterinario. Primer Sprint — **Arquitectura MVC (Modelo - Vista - Controlador)**.

## Link

**[https://mascoticas.vercel.app](https://mascoticas.vercel.app/mascoticas.html)** — se abre desde cualquier dispositivo.

Está publicado en Vercel y conectado a GitHub: cada vez que se sube algo a GitHub, Vercel se actualiza solo.
Los datos se guardan en una base de datos en línea (Upstash Redis, conectada desde la pestaña Storage de Vercel).

## Arquitectura MVC

```
public/                ← VISTA (V): interfaz unificada en 2 archivos (Vercel exige el nombre "public").
  mascoticas.html      todas las pantallas (Login, Menú, Clientes, Mascotas, Empleados, Citas, Notificaciones)
  mascoticas.js        ConexionBack, sesión/ayudantes, los 5 Validador*, las 7 Vista* y navegar()
  styles.css           estilos compartidos (Paleta Mascoticas)
  imagenes/logo.jpg    logo

server.js              ← ENRUTADOR: punto de entrada Express (Vercel exige el nombre "server.js").
                         Redirige "/" a "/mascoticas.html" y dirige cada ruta /api/... al Controlador correspondiente.

back/
  control/             ← CONTROLADOR (C): recibe (req, res), verifica permisos (rol) y llama al Modelo.
                         Nunca accede directamente a la base de datos.
  modelo/              ← MODELO (M): entidades, reglas de negocio, validaciones de dominio y consultas.
                         Es la única capa que se comunica con persistencia (ArchivoJson).
  persistencia/        ← parte del MODELO: ArchivoJson, la única clase que lee y guarda en Redis.
  datos/               ← datos iniciales con los que arranca el sistema (usuarios de prueba).
```

Flujo MVC: **Vista (`public/mascoticas.html` + `public/mascoticas.js`) → Enrutador (`server.js`) → Controlador (`back/control/`) → Modelo (`back/modelo/` + `ArchivoJson`) → Controlador → Vista**.

## El recorrido MVC (lo que pregunta la profe en la defensa)

Todas las historias siguen **el mismo camino**. Ejemplo con *Crear cliente*:

| # | Capa MVC | Pregunta de la profe | Respuesta | Archivo |
|---|---|---|---|---|
| 1 | Vista | ¿Dónde está la interfaz? | Sección `#vista-clientes` (formulario "Registrar cliente") | `public/mascoticas.html` |
| 2 | Vista | ¿Qué clase maneja la pantalla y valida los campos? | `VistaClientes.guardar()` y `ValidadorCliente.validar()` | `public/mascoticas.js` |
| 3 | Vista → Controlador | ¿Qué método comunica la Vista con el Controlador? | `conexion.enviar('POST', '/clientes')` | `public/mascoticas.js` |
| 4 | Enrutador | ¿Quién recibe la ruta y verifica el rol `secretaria`? | `app.post('/api/clientes', soloSecretaria, ...)` | `server.js` |
| 5 | Controlador | ¿Qué hace el Controlador? | `ControlClientes.crear(req, res)`: delega la petición al Modelo y responde JSON | `back/control/ControlClientes.js` |
| 6 | Modelo | ¿Dónde están las reglas de negocio y el guardado? | `Cliente.crear(datos)`: revisa que la cédula no exista y guarda con `ArchivoJson.agregar()` | `back/modelo/Cliente.js` |
| 7 | Modelo (Persistencia) | ¿Quién toca la base de datos? | `ArchivoJson.agregar()` → Upstash Redis, lista `"clientes"` | `back/persistencia/ArchivoJson.js` |

Para las demás historias, cambia "clientes" por "mascotas", "empleados", "citas" o "notificaciones".

### Módulos y responsables
- **Clientes** — Renzo Gallardo (`VistaClientes`, `ValidadorCliente`, `ControlClientes`, `Cliente`)
- **Mascotas** — Ian Carmona (`VistaMascotas`, `ValidadorMascota`, `ControlMascotas`, `Mascota`)
- **Empleados** — Ángel Araujo (`VistaEmpleados`, `ValidadorEmpleado`, `ControlEmpleados`, `Empleado`)
- **Citas** — Mouriss ElJawich (`VistaCitas`, `ValidadorCita`, `ControlCitas`, `Cita`)
- **Notificaciones** — Niyerlin Muñoz (`VistaNotificaciones`, `ValidadorNotificacion`, `ControlNotificaciones`, `Notificacion`)

### Preguntas típicas
- **¿Cómo se separan las responsabilidades en MVC?**
  - **Vista (`public/mascoticas.html` y `public/mascoticas.js`)**: muestra la interfaz, valida formato de formularios y envía acciones al Controlador. No contiene reglas de negocio ni toca datos.
  - **Controlador (`back/control/`)**: recibe las peticiones HTTP `(req, res)`, verifica permisos de rol (`secretaria`) y coordina el llamado al Modelo y la respuesta JSON. No toca `ArchivoJson`.
  - **Modelo (`back/modelo/` + `back/persistencia/`)**: define las entidades, aplica todas las reglas de negocio y es el único que lee y escribe en la base de datos (Redis).
- **¿Por qué validan en la Vista y también en el Modelo?** En la Vista se revisa el formato (campos vacíos, números) para dar respuesta rápida al usuario. En el Modelo se validan las reglas de negocio que requieren los datos guardados (cédula repetida, dueño existente, cruce de horarios, cliente con Telegram).
- **¿Quién habla con la base de datos?** Solo `ArchivoJson` (`back/persistencia/`), llamado únicamente desde los Modelos (`back/modelo/`).
- **¿Cómo sabe el Controlador quién está usando el sistema?** Al iniciar sesión se guarda el rol en el navegador (`sessionStorage`), y `conexion.enviar` lo manda en la cabecera `rol` de cada petición. El Controlador revisa que sea `secretaria` antes de crear.
- **¿Dónde están las reglas del Brief?**
  - Horario de 8–12 y 2–6, y no dos citas a la misma hora: `Cita.crear()` (`back/modelo/Cita.js`)
  - Mascota con dueño existente: `Mascota.crear()` (`back/modelo/Mascota.js`)
  - Cliente con Telegram: `Notificacion.crear()` (`back/modelo/Notificacion.js`)
  - Solo la secretaria crea: middleware `soloSecretaria` en `server.js` (`if (req.headers.rol != 'secretaria')`)
