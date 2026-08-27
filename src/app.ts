import express, { type Express } from "express";
import { logger } from "./config/logger";
import { setupSwagger } from "./config/swagger";
import healthRoutes from "./routes/health.routes";
import uploadRoutes from "./routes/upload.routes";
import policyRoutes from "./routes/policy.routes"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.use("/", healthRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/policies", policyRoutes);

export default app;
