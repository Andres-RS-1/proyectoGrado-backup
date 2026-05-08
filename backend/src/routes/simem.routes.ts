import { Router, Request, Response } from "express";
import { getReservasBogotaCundinamarca } from "../services/simem.service";

const router = Router();

router.get("/bogota-cundinamarca", async (req: Request, res: Response) => {
  try {
    const startDate = String(req.query.startDate || "2026-05-01");
    const endDate = String(req.query.endDate || "2026-05-06");

    const data = await getReservasBogotaCundinamarca(startDate, endDate);

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      error: "No se pudo consultar la API de SIMEM",
      detail: error.message,
    });
  }
});

export default router;