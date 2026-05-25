/**
 * Catálogo equivalente a la tabla `dispositivos` (gestor_red_electrica).
 * En producción puede leerse desde MySQL; para el taller se usa este catálogo fijo.
 */
const CATALOGO_DISPOSITIVOS = [
  { id: 1, nombre: 'Refrigerador', consumoKw: 0.8 },
  { id: 2, nombre: 'Microondas', consumoKw: 1.2 },
  { id: 3, nombre: 'Lavadora', consumoKw: 2.0 },
  { id: 4, nombre: 'Aire Acondicionado', consumoKw: 0.7 },
  { id: 5, nombre: 'Computador de Escritorio', consumoKw: 2.7 },
  { id: 6, nombre: 'Hervidor Eléctrico', consumoKw: 0.3 },
]

module.exports = { CATALOGO_DISPOSITIVOS }
