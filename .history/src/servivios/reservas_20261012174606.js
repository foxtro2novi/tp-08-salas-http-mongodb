
function crearServicioReservas(datosIniciales) {
  
  const reservas = [...datosIniciales];
  
  function listar() {
    return [...reservas]; 
  }

  
  function obtenerPorId(id) {
    return reservas.find((reserva) => reserva.id === id) ?? null;
  }

  function contar() {
    return reservas.length;
  }
  function crear(datosValidados) {
    const ultimoId = reservas.reduce(
      (mayor, reserva) => Math.max(mayor, reserva.id),
      0
    );
    
    const nuevaReserva = { id: ultimoId + 1, ...datosValidados };

    reservas.push(nuevaReserva);
    
    return nuevaReserva;
  }

  return { listar, obtenerPorId, contar, crear };
}
module.exports = { crearServicioReservas };