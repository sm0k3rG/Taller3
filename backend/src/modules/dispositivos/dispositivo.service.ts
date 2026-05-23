import { eq } from "drizzle-orm";
import { getDb } from "../../db/connection";  // ← cambia el import
import { dispositivos } from "../../db/schema";
import { AppError } from "../../middlewares/error.middleware";
import {
  CreateDispositivoDto,
  DispositivoResponse,
  UpdateDispositivoDto,
} from "./dispositivo.model";

function normalize(row: Record<string, any>): DispositivoResponse {
  return {
    id: Number(row["id"] ?? row["ID"]),
    name: String(row["name"] ?? row["NAME"]),
    consumoKw: parseFloat(row["consumoKw"] ?? row["CONSUMO_KW"]),
  };
}

export class DispositivoService {
  async findAll(): Promise<DispositivoResponse[]> {
    const rows = await getDb().select().from(dispositivos);
    return rows.map(normalize);
  }

  async findById(id: number): Promise<DispositivoResponse> {
    const rows = await getDb()
      .select()
      .from(dispositivos)
      .where(eq(dispositivos.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new AppError(404, `Dispositivo con ID ${id} no encontrado`);
    }

    return normalize(rows[0]);
  }

  async create(dto: CreateDispositivoDto): Promise<DispositivoResponse> {
    if (!dto.name || dto.name.trim() === "") {
      throw new AppError(400, "El nombre del dispositivo es requerido");
    }
    if (dto.consumoKw === undefined || dto.consumoKw <= 0) {
      throw new AppError(400, "El consumo en kW debe ser un valor positivo");
    }

    const result = await getDb().insert(dispositivos).values({
      name: dto.name.trim(),
      consumoKw: dto.consumoKw.toFixed(1),
    });

    const insertId = (result[0] as { insertId: number }).insertId;
    return this.findById(insertId);
  }

  async update(id: number, dto: UpdateDispositivoDto): Promise<DispositivoResponse> {
    await this.findById(id);

    if (dto.consumoKw !== undefined && dto.consumoKw <= 0) {
      throw new AppError(400, "El consumo en kW debe ser un valor positivo");
    }

    const updateData: Record<string, string> = {};
    if (dto.name !== undefined) updateData["name"] = dto.name.trim();
    if (dto.consumoKw !== undefined) updateData["consumoKw"] = dto.consumoKw.toFixed(1);

    if (Object.keys(updateData).length === 0) {
      throw new AppError(400, "No se proporcionaron campos para actualizar");
    }

    await getDb().update(dispositivos).set(updateData).where(eq(dispositivos.id, id));
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await getDb().delete(dispositivos).where(eq(dispositivos.id, id));
  }
}

export const dispositivoService = new DispositivoService();