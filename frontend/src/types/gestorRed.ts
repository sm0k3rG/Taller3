export interface Dispositivo {
  id: number
  name: string
  consumoKw: number
}

export interface ResumenRed {
  dispositivos: Dispositivo[]
  consumoActualKw: number
  capacidadMaxKw: number
  porcentajeUso: number
  resultado: 'Permitido' | 'Denegado'
}