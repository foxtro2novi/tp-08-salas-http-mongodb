const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");
const { Reserva } = require("../src/modelos/reserva");

async function main() {
  try {
    await conectarBaseDatos();
    const nuevaReserva = await Reserva.create({
      estudiante: "Sofía Albarracín",
      email: "sofia.albarracin@estudiantes.edu.ar",
      sala: "Sala Multimedia",
      fecha: "2026-11-15",
      turno: "Tarde",
      personas: 8,
    });
    console.log(
      "Reserva guardada con éxito. _id:",
      nuevaReserva._id.toString(),
    );
  } finally {
    await desconectarBaseDatos();
  }
}

main().catch((error) => {
  console.error("No se pudo crear la reserva:", error.name);
  if (error.errors) {
    console.error("Campos a revisar:", Object.keys(error.errors).join(", "));
  }
  console.error("Revisar datos, configuración y disponibilidad de MongoDB.");
  process.exitCode = 1;
});
