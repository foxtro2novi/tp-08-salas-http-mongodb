const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function validarReserva(req, res, next) {
  const valores = req.body ?? {};

  const estudiante =
    typeof valores.estudiante === "string" ? valores.estudiante.trim() : "";
  const email = typeof valores.email === "string" ? valores.email.trim() : "";
  const sala = typeof valores.sala === "string" ? valores.sala.trim() : "";
  const fecha = typeof valores.fecha === "string" ? valores.fecha.trim() : "";
  const turno = typeof valores.turno === "string" ? valores.turno.trim() : "";

  // Validación estricta de personas: tipo numérico o texto numérico, no booleano ni objeto/arreglo
  const personasRecibidas = valores.personas;
  const esTipoValido =
    typeof personasRecibidas === "number" ||
    (typeof personasRecibidas === "string" && personasRecibidas.trim() !== "");

  const personas = esTipoValido ? Number(personasRecibidas) : NaN;

  const emailValido = email.includes("@");
  const salaValida = salasPermitidas.includes(sala);
  const turnoValido = turnosPermitidos.includes(turno);
  const personasValidas =
    Number.isInteger(personas) && personas >= 1 && personas <= 6;

  if (
    !estudiante ||
    !emailValido ||
    !salaValida ||
    !fecha ||
    !turnoValido ||
    !personasValidas
  ) {
    const mensajeError =
      "Datos de reserva inválidos. Verifique campos obligatorios, sala, turno y que personas sea un entero entre 1 y 6.";

    // Si la petición viene por la API, responde JSON
    if (req.baseUrl === "/api/reservas" || req.path.startsWith("/api/")) {
      return res.status(400).json({ error: mensajeError });
    }

    // Si viene por el formulario HTML web, renderiza conservando valores
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: mensajeError,
      valores,
    });
  }

  // Se extraen explícitamente solo los 6 campos admitidos (ignora estado o _id enviados por el cliente)
  req.reservaValidada = {
    estudiante,
    email,
    sala,
    fecha,
    turno,
    personas,
  };

  next();
}

module.exports = {
  prepararAreaReservas,
  validarReserva,
};
