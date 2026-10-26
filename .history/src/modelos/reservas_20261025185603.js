const mongoose = require("mongoose");

const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /@/,
    },
    sala: {
      type: String,
      required: true,
      enum: salasPermitidas,
    },
    fecha: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (valor) =>
          typeof valor === "string" && valor.trim().length > 0,
        message: "La fecha es obligatoria y no puede quedar vacía.",
      },
    },
    turno: {
      type: String,
      required: true,
      enum: turnosPermitidos,
    },
    personas: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      validate: {
        validator: Number.isInteger,
        message: "La cantidad de personas debe ser un número entero.",
      },
    },
  },
  { collection: "reservas" }
);

const Reserva = mongoose.model("Reserva", reservaSchema);

module.exports = { Reserva };
