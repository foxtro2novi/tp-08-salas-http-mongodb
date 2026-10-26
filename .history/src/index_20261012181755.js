const path = require("node:path");

const fs = require("node:fs/promises"); 

const { leerConfiguracion } = require("./configuracion");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearApp } = require("./app");

const rutaDatos = path.join(__dirname, "..", "datos", "salas.json");

async function main() {

  const { puerto, formatoRegistro } = leerConfiguracion();

  const contenidoJson = await fs.readFile(rutaDatos, "utf8");
  const datosIniciales = JSON.parse(contenidoJson);

  const servicioReservas = crearServicioReservas(datosIniciales);

  const app = crearApp({ servicioReservas, formatoRegistro });

  app.listen(puerto, () => {
    console.log(`Aplicación modular disponible en http://localhost:${puerto}`);
  });
}

main().catch((error) => {
  console.error("No se pudo iniciar la aplicación:", error);
  process.exitCode = 1;
});
