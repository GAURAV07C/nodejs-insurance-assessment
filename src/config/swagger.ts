import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { type Express } from "express";

import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Insurance Assessment API",
      version: "1.0.0",
      description: "API documentation for the insurance assessment service",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Health", description: "Server health check" },
      { name: "Upload", description: "Insurance data file upload and processing" },
      { name: "Policies", description: "Policy search and aggregation" },
      { name: "Messages", description: "Scheduled message management" },
    ],
  },
  apis: ["./src/**/*.ts", "./dist/**/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });
};
