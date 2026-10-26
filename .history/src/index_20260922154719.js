const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");

const app = express();
const PORT = 3000;

// 1. Datos iniciales en memoria
const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

let reservas = [
    { id: 1, estudiante: "Ana López", email: "ana@mail.com", sala: "Sala Norte", fecha: "2026-10-15", turno: "Mañana", personas: 2 },
    { id: 2, estudiante: "Carlos Ruiz", email: "carlos@mail.com", sala: "Sala Sur", fecha: "2026-10-15", turno: "Tarde", personas: 4 },
    { id: 3, estudiante: "María Sol", email: "maria@mail.com", sala: "Sala Multimedia", fecha: "2026-10-16", turno: "Noche", personas: 6 },
    { id: 4, estudiante: "Juan Perez", email: "juan@mail.com", sala: "Sala Norte", fecha: "2026-10-17", turno: "Mañana", personas: 1 }
];

// 2. Middlewares personalizados globales
let numeroDeSolicitud = 0;

function identificarSolicitud(req, res, next) {
    numeroDeSolicitud += 1;
    res.locals.solicitudId = `BIB-${String(numeroDeSolicitud).padStart(4, "0")}`;
    next();
}

function medirDuracion(req, res, next) {
    const inicio = process.hrtime.bigint();
    res.on("finish", () => {
        const fin = process.hrtime.bigint();
        const milisegundos = Number(fin - inicio) / 1_000_000;
        console.log(`[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${milisegundos.toFixed(2)} ms`);
    });
    next();
}

// 3. Middlewares de área y validación
function prepararAreaReservas(req, res, next) {
    res.locals.seccion = "Reservas de salas";
    next();
}

function validarReserva(req, res, next) {
    const estudiante = String(req.body.estudiante ?? "").trim();
    const email = String(req.body.email ?? "").trim();
    const sala = String(req.body.sala ?? "").trim();
    const fecha = String(req.body.fecha ?? "").trim();
    const turno = String(req.body.turno ?? "").trim();
    const personas = Number(req.body.personas);

    // Reglas de negocio obligatorias
    if (!estudiante || !email || !fecha || 
        !salasPermitidas.includes(sala) || 
        !turnosPermitidos.includes(turno) || 
        !Number.isInteger(personas) || personas < 1 || personas > 6 || 
        !email.includes("@")) {
        
        return res.status(400).render("reservas/nueva", {
            titulo: "Nueva reserva",
            error: "Revisa los campos. El correo debe contener '@', la sala y el turno deben ser válidos, y la cantidad de personas debe ser entre 1 y 6.",
            valores: req.body
        });
    }

    req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
    next();
}

function crearReserva(req, res) {
    const ultimoId = reservas.reduce((maxId, r) => Math.max(maxId, r.id), 0);
    reservas.push({ id: ultimoId + 1, ...req.reservaValidada });
    res.redirect("/reservas");
}

// 4. Configuración del motor de plantillas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.set("layout", "layouts/main");

// 5. Registro ordenado del pipeline de middlewares
app.use(morgan("dev"));
app.use(identificarSolicitud);
app.use(medirDuracion);
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 6. Rutas de aplicación
app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Inicio - Sistema de Reservas" });
});

app.get("/estado", (req, res) => {
    res.json({
        servicio: "activo",
        reservas: reservas.length,
        solicitudId: res.locals.solicitudId
    });
});

// 7. Router de reservas
const reservasRouter = express.Router();
reservasRouter.use(prepararAreaReservas);

reservasRouter.get("/", (req, res) => {
    res.render("reservas/lista", { titulo: "Listado de Reservas", reservas });
});

// /nueva debe ir antes de /:id para evitar colisiones
reservasRouter.get("/nueva", (req, res) => {
    res.render("reservas/nueva", { titulo: "Nueva Reserva", error: null, valores: {} });
});

reservasRouter.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) {
        return res.status(404).render("no-encontrado", { 
            titulo: "Reserva no encontrada", 
            mensaje: "No existe una reserva con ese identificador." 
        });
    }
    res.render("reservas/detalle", { titulo: "Detalle de Reserva", reserva });
});

reservasRouter.post("/", validarReserva, crearReserva);

// Montaje del router bajo /reservas
app.use("/reservas", reservasRouter);

// 8. Middleware de ruta no encontrada (404 al final de la pila)
app.use((req, res) => {
    res.status(404).render("no-encontrado", { 
        titulo: "Página no encontrada", 
        mensaje: "La dirección solicitada no existe." 
    });
});

app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});
