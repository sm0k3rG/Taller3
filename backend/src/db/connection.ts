import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let db: MySql2Database<typeof schema>;

export function getDb(): MySql2Database<typeof schema> {
  if (!db) {
    const pool = mysql.createPool({
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    db = drizzle(pool, { schema, mode: "default" });
  }

  return db;
}

export async function testConnection(): Promise<void> {
  const pool = mysql.createPool({
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
  });

  const connection = await pool.getConnection();
  connection.release();
  await pool.end();
  console.log("✅ Conexión a base de datos establecida correctamente");
}