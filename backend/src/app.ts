import express from "express";
import cors from "cors";
import simemRoutes from "./routes/simem.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/simem", simemRoutes);

export default app;