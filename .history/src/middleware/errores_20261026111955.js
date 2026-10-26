function crearManejadorErrores({ vistaFormulario, tituloFormulario }) {
  // eslint-disable-next-line no-unused-vars
  return function manejarErrores(error, req, res, next) {
    if (res.headersSent) {
      return next(error);
    }

    const esValidacion = error.name === "ValidationError";
    const esEntrada =
      esValidacion ||
      error.codigo === "ID_INVALIDO" ||
      error.codigo === "FILTRO_INVALIDO" ||
      error.type === "entity.parse.failed";

    const estado = esEntrada ? 400 : 500;
    let mensaje = esEntrada
      ? "Revisa los datos enviados."
      : "No se pudo completar la operación.";

    if (error.codigo === "ID_INVALIDO") {
      mensaje = "El identificador debe tener 24 caracteres hexadecimales.";
    } else if (error.codigo === "FILTRO_INVALIDO") {
      mensaje = "Criterio de sala inválido.";
    }

    // Registro de diagnóstico en servidor sin exponer secretos
    console.error("Solicitud fallida:", res.locals.solicitudId, error.name);

    // Respuesta para peticiones API
    if (req.baseUrl.startsWith("/api") || req.path.startsWith("/api/")) {
      return res.status(estado).json({
        error: mensaje,
        ...(esValidacion && { campos: Object.keys(error.errors) }),
      });
    }

    // Respuesta para formulario HTML si falló validación de Mongoose
    if (esValidacion && req.method === "POST") {
      return res.status(400).render(vistaFormulario, {
        titulo: tituloFormulario,
        error: mensaje,
        valores: req.body ?? {},
      });
    }

    // Respuesta para páginas web generales
    return res.status(estado).render("no-encontrado", {
      titulo: esEntrada ? "Solicitud inválida" : "Error del servicio",
      mensaje,
    });
  };
}

module.exports = { crearManejadorErrores };
