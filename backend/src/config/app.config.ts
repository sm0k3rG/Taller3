export const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV,
  },
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  red: {
    capacidadMaximaKw: Number(process.env.CAPACIDAD_MAXIMA_KW),
    umbralAlertaPorcentaje: Number(process.env.UMBRAL_ALERTA_PORCENTAJE),
  },
} as const;