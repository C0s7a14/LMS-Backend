import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../middlewares/errorMiddleware.js";

import {
createQuizService,
getQuizByIdService,
listCourseQuizzesService,
submitQuizService,
startQuizAttemptService,
updateQuizService,
deleteQuizService,
} from "../services/quizService.js";

export async function createQuizController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await createQuizService(req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getQuizByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { quizId } = req.params;

    if (!quizId || Number.isNaN(Number(quizId))) {
      throw new AppError("ID do quiz inválido", 400);
    }

    const user = (req as any).user;

    const showCorrectAnswers = user?.role === "admin";

    const result = await getQuizByIdService(
      Number(quizId),
      showCorrectAnswers
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function listCourseQuizzesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    if (!courseId || Number.isNaN(Number(courseId))) {
      throw new AppError("ID do curso inválido", 400);
    }

    const result = await listCourseQuizzesService(Number(courseId));

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function submitQuizController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { quizId } = req.params;

    if (!quizId || Number.isNaN(Number(quizId))) {
      throw new AppError("ID do quiz inválido", 400);
    }

    const user = (req as any).user;

    const userId = Number(user?.id || user?.userId);

    if (!userId || Number.isNaN(userId)) {
      throw new AppError("Usuário autenticado não identificado", 401);
    }

   const result = await submitQuizService(
  Number(quizId),
  userId,
  Number(req.body.tentativa_id),
  req.body.respostas
);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function startQuizAttemptController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { quizId } = req.params;

    if (!quizId || Number.isNaN(Number(quizId))) {
      throw new AppError("ID do quiz inválido", 400);
    }

    const user = (req as any).user;

    const userId = Number(user?.id || user?.userId);

    if (!userId || Number.isNaN(userId)) {
      throw new AppError("Usuário autenticado não identificado", 401);
    }

    const result = await startQuizAttemptService(Number(quizId), userId);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateQuizController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { quizId } = req.params;

    if (!quizId || Number.isNaN(Number(quizId))) {
      throw new AppError("ID do quiz inválido", 400);
    }

    const result = await updateQuizService(Number(quizId), req.body);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteQuizController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { quizId } = req.params;

    if (!quizId || Number.isNaN(Number(quizId))) {
      throw new AppError("ID do quiz inválido", 400);
    }

    const result = await deleteQuizService(Number(quizId));

    return res.json(result);
  } catch (error) {
    next(error);
  }
}