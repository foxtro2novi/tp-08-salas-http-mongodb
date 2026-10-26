
const express = require("express");


function crearRouterReservas(controladorReservas) {
  
  const router = express.Router();

  
  
  router.get("/", controladorReservas.listar);

  router.get("/nueva", controladorReservas.mostrarFormulario);

  router.get("/:id", controladorReservas.mostrarDetalle);

  router.post("/", controladorReservas.crear);

  return router;
}

module.exports = { crearRouterReservas };
