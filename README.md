# Mascoticas — Equipo 57-7

Sistema interno para un consultorio veterinario. Primer Sprint.

## Publicarlo en Vercel (para la presentación)

Son **2 proyectos en Vercel**, uno por contenedor, y los dos salen del mismo repositorio de GitHub.

**A. Proyecto del back**
1. En vercel.com: **Add New → Project** → elegir el repositorio de GitHub.
2. **Project Name:** `mascoticas-back`.
3. **Root Directory:** `back`.
4. **Deploy.**
5. En ese proyecto, ir a **Storage → Create Database → Upstash for Redis** (plan gratis) → **Connect**.
   Esa es la base de datos en línea; Vercel no deja guardar archivos.
6. Ir a **Deployments → ⋯ → Redeploy**, para que el back tome la base de datos.
7. Probar: abrir `https://<dirección-del-back>/api/empleados?rol=` → debe mostrar `"ok":true`.

**B. Proyecto del front**
1. **Add New → Project** → el mismo repositorio.
2. **Project Name:** `mascoticas`.
3. **Root Directory:** `front`.
4. **Framework Preset:** `Other`.
5. **Deploy.**

⚠ Si Vercel le dio al back una dirección distinta de `https://mascoticas-back.vercel.app`, hay que cambiarla en `front/comun/comun.js` (línea `DIRECCION_BACK`) y subir el cambio a GitHub. Vercel se actualiza solo.

**El link de la presentación es el del proyecto front.**

## Correrlo en la laptop (opcional, para probar)

1. **Back** (una sola vez: `npm install`):
   ```
   cd back
   npm install
   npm start
   ```
   Debe decir: `Back de Mascoticas listo en http://localhost:3000`. **No cierres esa ventana.**

2. **Front**: en VS Code, clic derecho sobre `front/index.html` → **Open with Live Server**.

### Usuarios de prueba (están en `back/datos/empleados.json`)
| Usuario | Clave | Rol |
|---|---|---|
| secretaria | secretaria123 | secretaria (hace todo) |
| veterinario | veterinario123 | veterinario (solo consulta) |

## Carpetas

```
front/                 ← CONTENEDOR 1: lo que se ve (HTML + JavaScript)
  comun/               código que usan todas las pantallas (conexión con el back, tablas, estilos)
  inicio/              login y menú principal
  clientes/            Renzo   — Crear cliente, Consultar cliente
  mascotas/            Ian     — Registrar mascota, Consultar mascota
  empleados/           Ángel   — Crear empleado, Consultar empleado
  citas/               Jawi    — Crear cita médica, Consultar citas del día
  notificaciones/      Niyerlin— Crear notificación, Consultar notificación
  imagenes/            logo

back/                  ← CONTENEDOR 2: recibe las peticiones y guarda los datos
  server.js            RECIBE todas las peticiones del front (las "rutas")
  control/             LÓGICA: reglas de negocio (una clase por módulo)
  modelo/              ENTIDADES: qué datos tiene un cliente, una mascota, etc.
  persistencia/        ArchivoJson: la única clase que lee/guarda datos (Redis en Vercel, archivos .json en la laptop)
  datos/               datos con los que arranca el sistema (y la "base de datos" en la laptop)
```

## El recorrido (lo que pregunta la profe en la defensa)

Todas las historias siguen **el mismo camino**. Ejemplo con *Crear cliente*:

| # | Pregunta de la profe | Respuesta | Archivo |
|---|---|---|---|
| 1 | ¿Dónde está la interfaz? | Formulario "Registrar cliente" | `front/clientes/clientes.html` |
| 2 | ¿Qué método valida los campos? | `ValidadorCliente.validar()` | `front/clientes/clientes.js` |
| 3 | ¿Qué método comunica el front con el back? | `ConexionBack.enviar('POST', '/clientes')` | `front/comun/comun.js` |
| 4 | ¿Quién recibe en el back? | `app.post('/api/clientes')` | `back/server.js` |
| 5 | ¿Y qué hace después? | `ControlClientes.crear()`: revisa que la cédula no exista | `back/control/ControlClientes.js` |
| 6 | ¿Quién guarda? | `ArchivoJson.agregar()` | `back/persistencia/ArchivoJson.js` |
| 7 | ¿Dónde queda? | En Vercel: base de datos Upstash Redis. En la laptop: `back/datos/clientes.json` | |

Para las demás historias, cambia "clientes" por "mascotas", "empleados", "citas" o "notificaciones".

### Preguntas típicas
- **¿Por qué validan en el front y también en el back?** En el front se revisa el formato (campos vacíos, números) para no mandar datos malos al back. En el back se revisan las reglas que necesitan los datos guardados (cédula repetida, cruce de horarios) y el rol (solo la secretaria crea).
- **¿Quién habla con la base de datos?** Solo `ArchivoJson` (carpeta `persistencia`).
- **¿Cómo sabe el back quién está usando el sistema?** Al iniciar sesión se guarda el rol en el navegador, y `ConexionBack` lo manda en cada petición. El back revisa que sea `secretaria` antes de crear.
- **¿Dónde están las reglas del Brief?**
  - Horario de 8–12 y 2–6, y no dos citas a la misma hora: `ControlCitas.crear()`
  - Mascota con dueño existente: `ControlMascotas.crear()`
  - Cliente con Telegram: `ControlNotificaciones.crear()`
  - Solo la secretaria crea: `back/server.js` (la línea `if (req.headers.rol != 'secretaria')`)
