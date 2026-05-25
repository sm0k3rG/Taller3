const ICONOS: Record<string, string> = {
  refrigerador: '🧊',
  microondas: '📻',
  lavadora: '🫧',
  'aire acondicionado': '❄️',
  'computador de escritorio': '💻',
  'hervidor eléctrico': '☕',
  horno: '🔥',
  computador: '💻',
  secadora: '👕',
}

export function iconoDispositivo(nombre: string): string {
  const clave = nombre.trim().toLowerCase()
  for (const [patron, icono] of Object.entries(ICONOS)) {
    if (clave.includes(patron)) return icono
  }
  return '⚡'
}
