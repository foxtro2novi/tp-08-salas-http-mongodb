function crearControladorReservas(servicio) {
  function inicio(req, res) {
    res.render("inicio", { titulo: "Inicio - Sistema de Reservas" });
  }

  async function estado(req, res) {
    const cantidad = await servicio.contar();
    res.json({
      servicio: "activo",
      reservas: cantidad,
      solicitudId: res.locals.solicitudId,
    });
  }

  // Controladores para la Web (HTML)
  async function listar(req, res) {
    const reservas = await servicio.listar();
    res.render("reservas/lista", {
      titulo: "Listado de Reservas",
      reservas,
    });
  }

  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: null,
      valores: {},
    });
  }

  async function mostrarDetalle(req, res) {
    // El ID en MongoDB es un string hexadecimal de 24 caracteres, no un Number
    const reserva = await servicio.obtenerPorId(req.params.id);
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

  async function crear(req, res) {
    await servicio.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  // Controladores para la API JSON
  async function listarApi(req, res) {
    const reservas = await servicio.listar(req.query.sala);
    res.json(reservas);
  }

  async function obtenerApi(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    res.json(reserva);
  }

  async function crearApi(req, res) {
    const reserva = await servicio.crear(req.reservaValidada);
    res.location(`/api/reservas/${reserva.id}`).status(201).json(reserva);
  }

  return {
    inicio,
    estado,
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    listarApi,
    obtenerApi,
    crearApi,
  };
}

module.exports = { crearControladorReservas };
