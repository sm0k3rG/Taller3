const { CATALOGO_DISPOSITIVOS } = require('./data/dispositivos')

let nextInstanceId = 1

/** Un solo domicilio para el taller */
const domicilio = {
  capacidadMaxKw: 10.0,
  conectados: [],
}

function redondearKw(valor) {
  return Math.round(valor * 100) / 100
}

function consumoTotalKw() {
  return redondearKw(
    domicilio.conectados.reduce((suma, item) => suma + item.consumoKw, 0),
  )
}

function calcularResultado(consumoKw = consumoTotalKw()) {
  return consumoKw <= domicilio.capacidadMaxKw ? 'Permitido' : 'Denegado'
}

function buscarEnCatalogo(id) {
  return CATALOGO_DISPOSITIVOS.find((d) => d.id === Number(id))
}

function crearEstado() {
  const consumoActualKw = consumoTotalKw()
  const porcentajeUso = domicilio.capacidadMaxKw
    ? Math.round((consumoActualKw / domicilio.capacidadMaxKw) * 100)
    : 0

  return {
    domicilio: 'Domicilio Taller',
    capacidadMaxKw: domicilio.capacidadMaxKw,
    consumoActualKw,
    porcentajeUso,
    resultado: calcularResultado(consumoActualKw),
    dispositivosConectados: [...domicilio.conectados],
    cantidadActivos: domicilio.conectados.length,
  }
}

function conectarDesdeCatalogo(dispositivoId) {
  const dispositivo = buscarEnCatalogo(dispositivoId)
  if (!dispositivo) {
    return { ok: false, status: 404, error: 'Dispositivo no encontrado en el catálogo.' }
  }

  const conexion = {
    instanceId: `c-${nextInstanceId++}`,
    dispositivoId: dispositivo.id,
    nombre: dispositivo.nombre,
    consumoKw: dispositivo.consumoKw,
  }

  domicilio.conectados.push(conexion)

  const estado = crearEstado()
  const sobrecarga = estado.resultado === 'Denegado'

  return {
    ok: true,
    resultado: estado.resultado,
    mensaje: sobrecarga
      ? 'Dispositivo conectado, pero la red está en sobrecarga (DENEGADO).'
      : 'Dispositivo conectado correctamente.',
    estado,
  }
}

function conectarPersonalizado(nombre, consumoKw) {
  const nombreLimpio = String(nombre ?? '').trim()
  const consumo = Number(consumoKw)

  if (!nombreLimpio) {
    return { ok: false, status: 400, error: 'El nombre del aparato es obligatorio.' }
  }
  if (!Number.isFinite(consumo) || consumo <= 0) {
    return { ok: false, status: 400, error: 'El consumo debe ser un número mayor a 0.' }
  }

  const consumoRedondeado = redondearKw(consumo)

  const conexion = {
    instanceId: `c-${nextInstanceId++}`,
    dispositivoId: null,
    nombre: nombreLimpio,
    consumoKw: consumoRedondeado,
  }

  domicilio.conectados.push(conexion)

  const estado = crearEstado()
  const sobrecarga = estado.resultado === 'Denegado'

  return {
    ok: true,
    resultado: estado.resultado,
    mensaje: sobrecarga
      ? 'Dispositivo conectado, pero la red está en sobrecarga (DENEGADO).'
      : 'Dispositivo personalizado conectado correctamente.',
    estado,
  }
}

function desconectar(instanceId) {
  const indice = domicilio.conectados.findIndex((c) => c.instanceId === instanceId)
  if (indice === -1) {
    return { ok: false, status: 404, error: 'El dispositivo no está conectado.' }
  }

  domicilio.conectados.splice(indice, 1)

  return {
    ok: true,
    resultado: calcularResultado(),
    mensaje: 'Dispositivo desconectado.',
    estado: crearEstado(),
  }
}

function actualizarCapacidadMaxima(capacidadMaxKw) {
  const valor = Number(capacidadMaxKw)
  if (!Number.isFinite(valor) || valor <= 0) {
    return { ok: false, status: 400, error: 'La capacidad máxima debe ser mayor a 0.' }
  }

  domicilio.capacidadMaxKw = redondearKw(valor)

  return {
    ok: true,
    estado: crearEstado(),
  }
}

module.exports = {
  CATALOGO_DISPOSITIVOS,
  crearEstado,
  conectarDesdeCatalogo,
  conectarPersonalizado,
  desconectar,
  actualizarCapacidadMaxima,
}
