import type { ConsultaCapacidadResponse, ResultadoCapacidad } from '@/types/capacidad'

/**
 * Contrato esperado del Backend (Gestor de Red Eléctrica):
 * POST {VITE_API_URL}/capacidad
 * Body: { "domicilio": "<id o dirección>" }
 * Response JSON: { "resultado": "Permitido" | "Denegado" }
 */
function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    throw new Error('VITE_API_URL no está configurada. Defínela en .env o en build args de Docker.')
  }
  return base.replace(/\/$/, '')
}

function normalizarResultado(valor: string): ResultadoCapacidad {
  const texto = valor.trim().toLowerCase()
  if (texto === 'permitido') return 'Permitido'
  if (texto === 'denegado') return 'Denegado'
  throw new Error(`Respuesta del backend no reconocida: "${valor}"`)
}

function extraerResultado(data: ConsultaCapacidadResponse | string): ResultadoCapacidad {
  if (typeof data === 'string') {
    return normalizarResultado(data)
  }

  const crudo = data.resultado ?? data.estado ?? data.decision ?? data.message
  if (!crudo) {
    throw new Error('El backend no devolvió un resultado válido (Permitido/Denegado).')
  }

  return normalizarResultado(crudo)
}

export async function consultarCapacidad(domicilio: string): Promise<ResultadoCapacidad> {
  const identificador = domicilio.trim()
  if (!identificador) {
    throw new Error('Ingrese el ID o la dirección del domicilio.')
  }

  const response = await fetch(`${getApiBaseUrl()}/capacidad`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domicilio: identificador }),
  })

  if (!response.ok) {
    throw new Error(`Error del servidor (${response.status}): no se pudo consultar la capacidad.`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const data = (await response.json()) as ConsultaCapacidadResponse
    return extraerResultado(data)
  }

  const texto = await response.text()
  return extraerResultado(texto)
}
