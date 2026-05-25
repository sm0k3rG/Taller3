import type { Dispositivo } from '@/types/gestorRed'

function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL
  if (!base) throw new Error('VITE_API_URL no está configurada.')
  return base.replace(/\/$/, '')
}

const baseHeaders = {
  'Content-Type': 'application/json',
  'Connection': 'close',
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let mensaje = `Error del servidor (${response.status})`
    try {
      const data = (await response.json()) as { error?: string }
      if (data.error) mensaje = data.error
    } catch {}
    throw new Error(mensaje)
  }
  return response.json() as Promise<T>
}

// Obtener todos los dispositivos conectados
export async function obtenerDispositivos(): Promise<Dispositivo[]> {
  const data = await parseJson<{ success: boolean; data: Dispositivo[] }>(
    await fetch(`${getApiBaseUrl()}/dispositivos`, {
      headers: baseHeaders,
    })
  )
  return data.data
}

// Conectar un preset o personalizado
export async function conectarDispositivo(name: string, consumoKw: number): Promise<Dispositivo> {
  const data = await parseJson<{ success: boolean; data: Dispositivo }>(
    await fetch(`${getApiBaseUrl()}/dispositivos`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({ name, consumoKw }),
    })
  )
  return data.data
}

// Desconectar
export async function desconectarDispositivo(id: number): Promise<void> {
  await parseJson<{ success: boolean }>(
    await fetch(`${getApiBaseUrl()}/dispositivos/${id}`, { method: 'DELETE', headers: baseHeaders, })
  )
}

export async function obtenerReplica(): Promise<string> {
  try {
    const data = await parseJson<{ replica: string }>(
      await fetch(`${getApiBaseUrl()}/replica`, {
        headers: baseHeaders
      })
    )
    return data.replica
  } catch {
    return 'desconocido'
  }
}