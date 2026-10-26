const express = require("express");
const morgan = require("morgan");
const path = require("node:path");

const { crearRouterReservas } = require("./rutas/reservas");
const { crearIdentificadorSolicitud, medirDuracion } = require("./middleware/solicitudes");

function crearApp({ servicioReservas, formatoRegistro }) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));

  // Pipeline Global
  app.use(morgan(formatoRegistro));
  app.use(crearIdentificadorSolicitud());
  app.use(medirDuracion);

  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  const { crearControladorReservas } = require("./controladores/reservas");
  const controladorReservas = crearControladorReservas(servicioReservas);
  const reservasRouter = crearRouterReservas(controladorReservas);

  app.use("/reservas", reservasRouter);

  app.get("/", controladorReservas.inicio);
  app.get("/estado", controladorReservas.estado);

  // 404 final
  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  return app;
}

module.exports = { crearApp };
