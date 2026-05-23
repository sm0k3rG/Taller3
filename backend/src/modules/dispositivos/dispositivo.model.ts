export interface CreateDispositivoDto {
  name: string;
  consumoKw: number;
}

export interface UpdateDispositivoDto {
  name?: string;
  consumoKw?: number;
}

export interface DispositivoResponse {
  id: number;
  name: string;
  consumoKw: number;
}