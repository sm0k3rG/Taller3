const express = require('express')
const {
  CATALOGO_DISPOSITIVOS,
  crearEstado,
  conectarDesdeCatalogo,
  conectarPersonalizado,
  desconectar,
  actualizarCapacidadMaxima,
} = require('./domicilioStore')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    message: 'Backend del Gestor de Red Eléctrica listo',
    replica: process.env.REPLICA_NAME || 'Instancia Base',
  })
})

/** Catálogo (tabla dispositivos) */
app.get('/dispositivos', (req, res) => {
  res.json({ dispositivos: CATALOGO_DISPOSITIVOS })
})

/** Estado del único domicilio del taller */
app.get('/estado', (req, res) => {
  res.json(crearEstado())
})

/** Compatibilidad con requerimiento original del taller */
app.post('/capacidad', (req, res) => {
  const estado = crearEstado()
  res.json({
    resultado: estado.resultado,
    domicilio: req.body?.domicilio || 'Domicilio Taller',
    consumoActualKw: estado.consumoActualKw,
    capacidadMaxKw: estado.capacidadMaxKw,
  })
})

/** Conectar dispositivo del catálogo o personalizado */
app.post('/conectar', (req, res) => {
  const { dispositivoId, nombre, consumoKw } = req.body ?? {}

  let resultado
  if (dispositivoId !== undefined && dispositivoId !== null) {
    resultado = conectarDesdeCatalogo(dispositivoId)
  } else {
    resultado = conectarPersonalizado(nombre, consumoKw)
  }

  if (resultado.error && resultado.status) {
    return res.status(resultado.status).json({ error: resultado.error })
  }

  res.status(200).json({
    resultado: resultado.resultado,
    mensaje: resultado.mensaje,
    ...resultado.estado,
  })
})

app.delete('/conectar/:instanceId', (req, res) => {
  const resultado = desconectar(req.params.instanceId)

  if (!resultado.ok) {
    return res.status(resultado.status).json({ error: resultado.error })
  }

  res.json({
    resultado: resultado.resultado,
    mensaje: resultado.mensaje,
    ...resultado.estado,
  })
})

app.patch('/domicilio/capacidad', (req, res) => {
  const resultado = actualizarCapacidadMaxima(req.body?.capacidadMaxKw)

  if (!resultado.ok) {
    return res.status(resultado.status).json({ error: resultado.error })
  }

  res.json(resultado.estado)
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
