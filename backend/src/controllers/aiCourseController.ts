import { Request, Response, NextFunction } from "express";

import { AppError } from "../middlewares/errorMiddleware.js";

import {
  extractCoursePdfTextService,
  generateCourseFromPdfService,
  applyGeneratedCourseService,
} from "../services/aiCoursePdfService.js";


function validateNumberId(id: string | string[] | undefined, message: string) {
  if (!id || Array.isArray(id) || Number.isNaN(Number(id))) {
    throw new AppError(message, 400);
  }

  return Number(id);
}

function getUploadedFile(req: Request) {
  const files = req.files as Express.Multer.File[] | undefined;

  const file = req.file || files?.[0];

  return file;
}

export async function extractPdfFromCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = validateNumberId(
      req.params.courseId,
      "ID do curso inválido"
    );

    const file = getUploadedFile(req);

    console.log("Arquivo recebido:", file?.originalname);
    console.log("Mimetype:", file?.mimetype);

    const result = await extractCoursePdfTextService(courseId, file);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateCourseFromPdfController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = validateNumberId(
      req.params.courseId,
      "ID do curso inválido"
    );

    const file = getUploadedFile(req);

    console.log("Gerando curso com IA a partir do PDF:", file?.originalname);

    const result = await generateCourseFromPdfService(courseId, file);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function applyGeneratedCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = validateNumberId(
      req.params.courseId,
      "ID do curso inválido"
    );

    const generatedCourse =
      req.body.generated_course || req.body.generatedCourse;

    const replaceExisting = Boolean(req.body.replaceExisting);

    const result = await applyGeneratedCourseService(
      courseId,
      generatedCourse,
      replaceExisting
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}