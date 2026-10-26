function validarReserva(req, res, next) {
  const estudiante = String(req.body.estudiante ?? "").trim();
  const email = String(req.body.email ?? "").trim();
  const sala = String(req.body.sala ?? "").trim();
  const fecha = String(req.body.fecha ?? "").trim();
  const turno = String(req.body.turno ?? "").trim();
  
  const personas = Number(req.body.personas);

  const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"]; 
  const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

  if (
    !estudiante ||
    !email.includes("@") ||
    !salasPermitidas.includes(sala) ||
    !fecha ||
    !turnosPermitidos.includes(turno) ||
    !Number.isInteger(personas) ||
    personas < 1 ||
    personas > 6
  ) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva Reserva",
      error: "Completá todos los campos con valores válidos.",
      valores: req.body,
    });
  }

  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  
  next(); 
}

module.exports = { validarReserva };
