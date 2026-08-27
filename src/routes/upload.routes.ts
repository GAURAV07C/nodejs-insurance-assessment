import {Router} from "express";

import { upload } from "../middleware/upload.middleware";
import { uploadInsuranceData } from "../controllers/upload.controller";

const router = Router();

/**
 * @openapi
 * /api/upload:
 *   post:
 *     summary: Upload insurance data file
 *     description: Upload a CSV/XLSX/XLS file containing insurance data to be processed.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The insurance data file (CSV, XLSX or XLS)
 *     responses:
 *       200:
 *         description: File processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 totalRows:
 *                   type: number
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to process uploaded file
 */
router.post("/", upload.single("file"), uploadInsuranceData);

export default router;