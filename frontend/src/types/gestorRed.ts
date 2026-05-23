export type ResultadoCapacidad = 'Permitido' | 'Denegado'

export interface DispositivoCatalogo {
  id: number
  nombre: string
  consumoKw: number
}

export interface DispositivoConectado {
  instanceId: string
  dispositivoId: number | null
  nombre: string
  consumoKw: number
}

export interface EstadoDomicilio {
  domicilio: string
  capacidadMaxKw: number
  consumoActualKw: number
  porcentajeUso: number
  resultado: ResultadoCapacidad
  dispositivosConectados: DispositivoConectado[]
  cantidadActivos: number
}

export interface RespuestaConexion extends EstadoDomicilio {
  mensaje?: string
}
