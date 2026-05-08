import { Router, Request, Response } from "express";
import { getReservasBogotaCundinamarca } from "../services/simem.service";

const router = Router();

const formatDate = (date: Date) => date.toISOString().split("T")[0];

router.get("/bogota-cundinamarca", async (req: Request, res: Response) => {
  try {
    const end = new Date();
    const start = new Date();
start.setDate(end.getDate() - 7);
    const startDate = String(req.query.startDate || formatDate(start));
    const endDate = String(req.query.endDate || formatDate(end));

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