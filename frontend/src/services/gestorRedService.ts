import type {
  DispositivoCatalogo,
  EstadoDomicilio,
  RespuestaConexion,
  ResultadoCapacidad,
} from '@/types/gestorRed'

function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    throw new Error('VITE_API_URL no está configurada.')
  }
  return base.replace(/\/$/, '')
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let mensaje = `Error del servidor (${response.status})`
    try {
      const data = (await response.json()) as { error?: string }
      if (data.error) mensaje = data.error
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(mensaje)
  }
  return (await response.json()) as T
}

export async function obtenerCatalogo(): Promise<DispositivoCatalogo[]> {
  const data = await parseJson<{ dispositivos: DispositivoCatalogo[] }>(
    await fetch(`${getApiBaseUrl()}/dispositivos`),
  )
  return data.dispositivos
}

export async function obtenerEstado(): Promise<EstadoDomicilio> {
  return parseJson<EstadoDomicilio>(await fetch(`${getApiBaseUrl()}/estado`))
}

async function parseConexion(response: Response): Promise<RespuestaConexion> {
  const data = (await response.json()) as RespuestaConexion
  if (response.status === 409) return data
  if (!response.ok) {
    throw new Error(
      (data as unknown as { error?: string }).error ??
        `Error del servidor (${response.status})`,
    )
  }
  return data
}

export async function conectarCatalogo(dispositivoId: number): Promise<RespuestaConexion> {
  const response = await fetch(`${getApiBaseUrl()}/conectar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dispositivoId }),
  })
  return parseConexion(response)
}

export async function conectarPersonalizado(
  nombre: string,
  consumoKw: number,
): Promise<RespuestaConexion> {
  const response = await fetch(`${getApiBaseUrl()}/conectar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, consumoKw }),
  })
  return parseConexion(response)
}

export async function desconectarDispositivo(instanceId: string): Promise<EstadoDomicilio> {
  return parseJson<EstadoDomicilio>(
    await fetch(`${getApiBaseUrl()}/conectar/${instanceId}`, { method: 'DELETE' }),
  )
}

export async function actualizarCapacidadMaxima(capacidadMaxKw: number): Promise<EstadoDomicilio> {
  return parseJson<EstadoDomicilio>(
    await fetch(`${getApiBaseUrl()}/domicilio/capacidad`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capacidadMaxKw }),
    }),
  )
}

export function esDenegado(resultado: ResultadoCapacidad): boolean {
  return resultado === 'Denegado'
}
