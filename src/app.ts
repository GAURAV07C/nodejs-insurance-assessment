import express, { type Express } from "express";
import { setupSwagger } from "./config/swagger";
import healthRoutes from "./routes/health.routes";
import uploadRoutes from "./routes/upload.routes";
import policyRoutes from "./routes/policy.routes"
import messageRoutes from "./routes/message.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.use("/", healthRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/policies", policyRoutes);

app.use("/api/messages", messageRoutes);

app.use(errorHandler);

export default app;
