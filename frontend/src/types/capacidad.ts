export type ResultadoCapacidad = 'Permitido' | 'Denegado'

export interface ConsultaCapacidadResponse {
  resultado?: string
  estado?: string
  decision?: string
  message?: string
}
