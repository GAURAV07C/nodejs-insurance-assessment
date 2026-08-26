import {Request, Response} from "express";
import fs from "fs/promises";

import { processUploadFile } from "../services/upload.service";
import { logger } from "../config/logger";

export const uploadInsuranceData = async (req: Request, res: Response) => {
    try {
        logger.info("Upload request received");

        if (!req.file) {
            logger.warn("No file uploaded");
            return res.status(400).json({success:false,error: "No file uploaded"});
        }

        const filePath = req.file.path;
        logger.info({ filePath, originalName: req.file.originalname }, "Processing uploaded file");

        try{
            const result = await processUploadFile(filePath);
            logger.info({ totalRows: result.totalRows }, "Upload processed successfully");

            res.status(200).json({success:true, message: "File processed successfully", data:{
                totalRows: result.totalRows,
                processedPolicies: result.insertedPolicies,
            }});
        } finally {
            await fs.unlink(filePath).catch((err) => {
                logger.error({ err }, "Error deleting uploaded file");
            });
        }
    } catch (error) {
        logger.error({ err: error }, "Failed to process uploaded file");
        res.status(500).json({ error: "Failed to process uploaded file" });
    }
}
