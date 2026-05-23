import { Router, RequestHandler } from "express";
import { dispositivoController } from "./dispositivo.controller";

const router: Router = Router();

router.get("/", (req, res, next) =>
  dispositivoController.getAll(req, res, next)
);

router.get("/:id", (req, res, next) =>
  dispositivoController.getById(req, res, next)
);

router.post("/", (req, res, next) =>
  dispositivoController.create(req, res, next)
);

router.put("/:id", (req, res, next) =>
  dispositivoController.update(req, res, next)
);

router.delete("/:id", (req, res, next) =>
  dispositivoController.delete(req, res, next)
);

export default router;