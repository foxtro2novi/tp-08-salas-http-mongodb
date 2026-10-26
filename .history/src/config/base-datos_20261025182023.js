const mongoose = require("mongoose");
const dns = require("node:dns");
const { leerUriMongo } = require("./entorno");

// Servidores DNS autorizados usados en clase para resolver consultas SRV de Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectarBaseDatos() {
  await mongoose.connect(leerUriMongo(), {
    serverSelectionTimeoutMS: 5000,
  });
}

async function desconectarBaseDatos() {
  await mongoose.disconnect();
}

module.exports = { conectarBaseDatos, desconectarBaseDatos };
