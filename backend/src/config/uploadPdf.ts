import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { AppError } from "../middlewares/errorMiddleware.js";

const storage = multer.memoryStorage();

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  if (file.mimetype !== "application/pdf") {
    cb(new AppError("Envie apenas arquivos PDF", 400));
    return;
  }

  cb(null, true);
}

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});