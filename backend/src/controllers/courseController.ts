import { Request, Response } from "express";

import {
  createCourseService,
  getCoursesService,
  getCoursesByIdService,
  deleteCoursesService,
  updateCourseService
} from "../services/courseService.js";

export async function createCourseController(
  req: Request,
  res: Response
) {

  try {

    const {
      titulo,
      descricao,
      thumbnail,
      criado_por,
    } = req.body;

    const result =
      await createCourseService({
        titulo,
        descricao,
        thumbnail,
        criado_por,
      });

    return res.status(201).json(result);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message,
    });

  }
}

export async function getCoursesController(
  req: Request,
  res: Response
) {

  try {

    const courses =
      await getCoursesService();

    return res.json(courses);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message,
    });

  }
}

export async function getCourseByIdController(
  req: Request,
  res: Response
) {

  try {

    const { id } = req.params;

    const course =
      await getCoursesByIdService(
        Number(id)
      );

    return res.json(course);

  } catch (error: any) {

    return res.status(404).json({
      error: error.message,
    });

  }
}

export async function deleteCourseController(
  req: Request,
  res: Response
) {

  try {

    const { id } = req.params;

    const result =
      await deleteCoursesService(
        Number(id)
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message,
    });

  }
}

export async function updateCourseController(
  req: Request,
  res: Response
) {

  try {

    const { id } = req.params;

    const {
      titulo,
      descricao,
      thumbnail
    } = req.body;

    const result =
      await updateCourseService(
        Number(id),
        titulo,
        descricao,
        thumbnail
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message
    });

  }
}