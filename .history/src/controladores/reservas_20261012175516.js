
function crearControladorReservas(servicioReservas) {
  
  
  function inicio(req, res) {
    res.render("inicio", { titulo: "Reserva de Salas de Estudio" });
  }

  function estado(req, res) {
    res.json({
      cantidad: servicioReservas.contar(),
      idSolicitud: res.locals.solicitudId,
    });
  }

  function listar(req, res) {
    res.render("reservas/lista", {
      titulo: "Listado de Reservas",
      reservas: servicioReservas.listar(),
    });
  }

 
  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva Reserva",
      error: null,
      valores: {}, 
    });
  }

  
  function mostrarDetalle(req, res) {
    const id = Number(req.params.id);
    const reserva = servicioReservas.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }

    res.render("reservas/detalle", {
      titulo: "Detalle de Reserva",
      reserva,
    });
  }

  function crear(req, res) {
    servicioReservas.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  return {
    inicio,
    estado,
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
  };
}

module.exports = { crearControladorReservas };
