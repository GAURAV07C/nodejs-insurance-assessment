import multer from "multer";
import path from "path";
import fs from "fs";

import { logger } from "../config/logger";

// this is for local upload of files. The files will be stored in the uploads folder in the root directory of the project.

const uploadDirectory = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
  logger.info({ uploadDirectory }, "Created uploads directory");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [".csv", ".xlsx", ".xls"];

  if (!allowedExtensions.includes(extension)) {
    logger.warn({ extension: file.originalname }, "Invalid file type rejected");
    cb(
      new Error("Invalid file type. Only CSV, XLSX and XLS files are allowed."),
    );

    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
