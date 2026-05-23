import { Request, Response, NextFunction } from "express";
import { dispositivoService } from "./dispositivo.service";

export class DispositivoController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dispositivoService.findAll();
      res.status(200).json({ success: true, data, total: data.length });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "El ID debe ser un número entero" });
        return;
      }
      const data = await dispositivoService.findById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, consumoKw } = req.body;
      const data = await dispositivoService.create({
        name,
        consumoKw: parseFloat(consumoKw),
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "El ID debe ser un número entero" });
        return;
      }
      const { name, consumoKw } = req.body;
      const updateData: { name?: string; consumoKw?: number } = {};
      if (name !== undefined) updateData.name = name;
      if (consumoKw !== undefined) updateData.consumoKw = parseFloat(consumoKw);

      const data = await dispositivoService.update(id, updateData);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "El ID debe ser un número entero" });
        return;
      }
      await dispositivoService.delete(id);
      res.status(200).json({ success: true, message: "Dispositivo eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  }
}

export const dispositivoController = new DispositivoController();