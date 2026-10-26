# Trabajo Práctico 08 - Endpoints persistentes de reservas de salas

**Alumno:** José María Carrizo  
**Repositorio sugerido:** `tp-08-salas-http-mongodb`  
**Punto de partida:** Copia funcional individual del TP 07 (`tp-07-salas-mongodb`).  

---

## 1. Descripción y Objetivos

En esta unidad se migró el almacenamiento en memoria y archivos JSON del sitio web a una base de datos persistente en la nube mediante **MongoDB Atlas**.  
Tanto el sitio web HTML como la nueva **API JSON** consumen un **único servicio asíncrono** (`reservas-mongo.js`), garantizando que ambas interfaces compartan la misma colección de documentos y las mismas reglas de validación.

### Cambios principales respecto al TP 07:
* **Persistencia unificada:** El sitio web y la API leen y escriben en MongoDB Atlas. Se eliminó la dependencia de arreglos en memoria y semillas JSON.
* **Qué dejó de importarse:** Se retiraron del arranque en `src/index.js` y `src/app.js` la carga de datos de `datos/salas.json` y la fábrica del servicio en memoria `src/servicios/reservas.js` (conservados únicamente como referencia histórica).
* **Nuevo campo en el esquema:** Se incorporó el campo `estado` con opciones `["pendiente", "confirmada"]` y valor predeterminado `"pendiente"`. El cliente no lo asigna en la creación; el esquema de Mongoose lo establece automáticamente.
* **Manejo de errores asíncronos:** Con Express 5, las operaciones asíncronas de los controladores se esperan con `await`, y cualquier fallo es capturado por un middleware centralizado de 4 parámetros `(error, req, res, next)`.

---

## 2. Tecnologías y Versiones

* **Node.js:** v24+
* **Express:** 5.3.0
* **Mongoose:** 9.10.3
* **Motor de plantillas:** EJS + express-ejs-layouts
* **Base de datos:** MongoDB Atlas Free Tier (M0)
  * **Base de datos:** `reservas_salas_u8`
  * **Colección:** `reservas`

---

## 3. Configuración del Entorno

La conexión utiliza variables de entorno cargadas desde un archivo local privado `.env` (el cual está excluido en `.gitignore`).

### Plantilla de configuración (`.env.example`):
```dotenv
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u8?retryWrites=true&w=majority
```

---

## 4. Estructura del Proyecto

```text
tp-08-salas-http-mongodb/
├── datos/
│   └── salas.json               # Referencia estática (ya no se carga al iniciar)
├── public/
│   └── css/estilos.css          # Estilos visuales del sitio HTML
├── scripts/
│   ├── comprobar-conexion.js    # Script de diagnóstico de red y conexión a Atlas
│   ├── crear-reserva.js         # Script de consola para inserción puntual
│   └── listar-reservas.js       # Script de consola para listado puntual
├── src/
│   ├── config/
│   │   ├── base-datos.js        # Módulo de conexión y desconexión Mongoose (con DNS)
│   │   └── entorno.js           # Lectura y validación de variables de entorno
│   ├── controladores/
│   │   └── reservas.js          # Controladores async para HTML y JSON
│   ├── middleware/
│   │   ├── errores.js           # Manejador centralizado de errores (400, 404, 500)
│   │   ├── reservas.js          # Validación estricta de entrada HTTP
│   │   └── solicitudes.js       # Registro de peticiones (morgan, IDs y duración)
│   ├── modelos/
│   │   └── reserva.js           # Esquema de Mongoose con default y enums
│   ├── rutas/
│   │   ├── reservas.js          # Router para navegación y formularios HTML
│   │   └── reservas-api.js      # Router para recursos REST JSON (/api/reservas)
│   ├── servicios/
│   │   ├── reservas.js          # Servicio en memoria histórico (desacoplado)
│   │   └── reservas-mongo.js    # Servicio asíncrono activo con Mongoose
│   ├── app.js                   # Ensamblado de Express, parsers y enrutadores
│   └── index.js                 # Arranque persistente, conexión previa y graceful shutdown
└── views/                       # Plantillas EJS del sitio web
```

---

## 5. Arranque y Cierre del Servidor

### Comando de inicio:
```bash
node --env-file=.env src/index.js
```

### Ciclo de vida y cierre ordenado (*Graceful Shutdown*):
1. **Conexión previa:** El servidor ejecuta `await conectarBaseDatos()` antes de llamar a `app.listen()`. Si la base de datos no está disponible, no abre el puerto.
2. **Conexión persistente:** Se mantiene un único pool de conexiones abierto durante toda la vida del servidor (no se conecta ni desconecta por cada petición).
3. **Señales SIGINT / SIGTERM:** Ante una señal de interrupción, el servidor deja de aceptar peticiones nuevas, espera a que finalicen las solicitudes en curso y desconecta limpiamente de MongoDB Atlas.

---

## 6. Contrato de la API JSON

| Método | Endpoint | Descripción | Respuesta Exitosa |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reservas` | Listar todas las reservas | `200 OK` + Array JSON (o `[]`) |
| `GET` | `/api/reservas/:id` | Consultar reserva por ID | `200 OK` + Objeto JSON |
| `POST` | `/api/reservas` | Crear una nueva reserva | `201 Created` + Objeto JSON + Header `Location` |
| `GET` | `/api/reservas?sala=Sala%20Norte` | Filtro por igualdad exacta de sala | `200 OK` + Array con coincidencias |

### Ejemplo de JSON para creación (`POST /api/reservas`):
```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2
}
```

### Respuesta del servidor (`201 Created`):
* **Header `Location`:** `/api/reservas/6adf6706b7e6df02ac66b222`
* **Body:**
```json
{
  "id": "6adf6706b7e6df02ac66b222",
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2,
  "estado": "pendiente"
}
```

---

## 7. Matriz de Pruebas y Resultados Observados

| Caso de Prueba | Solicitud / Método | Estado Esperado | Resultado Observado | Estado |
| :--- | :--- | :---: | :--- | :---: |
| Listado inicial en base nueva | `GET /api/reservas` | `200 OK` | Devuelve arreglo vacío `[]`. Cantidad inicial = 0. | Superado |
| Creación válida por POST | `POST /api/reservas` | `201 Created` | Reserva guardada con `id: 6adf6706b7e6df02ac66b222`, `estado: "pendiente"` y cabecera `Location`. | Superado |
| Consulta por Location / ID | `GET /api/reservas/:id` | `200 OK` | Recupera exactamente el documento de "Ana Ejemplo" con sus campos completos. | Superado |
| **Persistencia tras reinicio** | `GET /api/reservas/:id` | `200 OK` | Tras apagar (`Ctrl+C`) y reiniciar el servidor, se envía el mismo GET y se recupera el mismo ID sin repetir el POST. | Superado |
| Identificador mal formado | `GET /api/reservas/1` | `400 Bad Request` | Devuelve JSON: `{"error": "El identificador debe tener 24 caracteres hexadecimales."}` sin tumbar el proceso. | Superado |
| ID bien formado inexistente | `GET /api/reservas/000000000000000000000000` | `404 Not Found` | Devuelve JSON: `{"error": "Reserva no encontrada."}`. | Superado |
| Filtro exacto por sala | `GET /api/reservas?sala=Sala%20Norte` | `200 OK` | Devuelve arreglo con las reservas pertenecientes a Sala Norte. | Superado |
| Filtro sin coincidencias | `GET /api/reservas?sala=Sala%20Sur` | `200 OK` | Devuelve `[]` (lista vacía, no es 404). | Superado |
| Parámetro repetido en query | `GET /api/reservas?sala=Sala%20Norte&sala=Sala%20Sur` | `400 Bad Request` | Devuelve JSON: `{"error": "Criterio de sala inválido."}`. | Superado |
| POST datos inválidos (personas 7 / email vacío) | `POST /api/reservas` | `400 Bad Request` | Devuelve JSON de error de validación. La cantidad en la base no aumenta. | Superado |
| Continuidad del sitio web HTML | Navegador: `/`, `/reservas`, `/reservas/nueva` | `200` / `302` / `400` | El sitio web renderiza correctamente, lista los documentos de Atlas y maneja errores en formularios. | Superado |
| Endpoint `/estado` | `GET /estado` | `200 OK` | Devuelve conteo persistente desde MongoDB con `Reserva.countDocuments()`. | Superado |

---

## 8. Procedimiento para Reproducir las Pruebas en Postman

1. **Iniciar el servidor:** Ejecutar `node --env-file=.env src/index.js`.
2. **Listado inicial:** Crear solicitud `GET http://localhost:3000/api/reservas`, Body en `none`. Pulsar Send y verificar `200 OK` con `[]`.
3. **Creación:** Crear solicitud `POST http://localhost:3000/api/reservas`, Body `raw` -> `JSON`, ingresar el cuerpo de ejemplo. Comprobar `201 Created` y la cabecera `Location` en la pestaña Headers inferior.
4. **Consulta individual:** Crear solicitud `GET` a la dirección informada en `Location`. Verificar `200 OK`.
5. **Reinicio y persistencia:** Detener el servidor en la terminal (`Ctrl + C`), volver a iniciarlo con `node --env-file=.env src/index.js` y reenviar la solicitud GET del paso anterior. Debe responder `200 OK` con el mismo recurso.
6. **Casos negativos:** Probar `GET /api/reservas/1` (debe dar 400), `GET /api/reservas/000000000000000000000000` (debe dar 404) y enviar un POST con `personas: 7` (debe dar 400).