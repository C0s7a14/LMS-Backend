import {
  createCourseRepository,
  getCourseByIdRepository,
  getCoursesRepository,
  updateCourseRepository,
} from "../repositories/courseRepository.js";

import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";

interface CreateCoursesDTO {
  titulo: string;
  descricao: string;
  thumbnail: string;
  criado_por: number;
}

export async function createCourseService(data: CreateCoursesDTO) {
  const courseId = await createCourseRepository(
    data.titulo,
    data.descricao,
    data.thumbnail,
    data.criado_por
  );

  return {
    message: "Criado com sucesso",
    courseId,
  };
}

export async function getCoursesService(userId: number, userRole: string) {
  return await getCoursesRepository(userId, userRole);
}

export async function getCoursesByIdService(id: number) {
  const course = await getCourseByIdRepository(id);

  if (!course) {
    throw new AppError("Curso não encontrado", 404);
  }

  return course;
}

export async function deleteCoursesService(id: number) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [courseRows]: any = await connection.query(
      "SELECT id, titulo FROM cursos WHERE id = ?",
      [id]
    );

    if (courseRows.length === 0) {
      throw new AppError("Curso não encontrado", 404);
    }

    const [usageRows]: any = await connection.query(
      `
        SELECT
          (SELECT COUNT(*) FROM matriculas WHERE curso_id = ?) AS total_matriculas,
          (SELECT COUNT(*) FROM certificados WHERE curso_id = ?) AS total_certificados
      `,
      [id, id]
    );

    const totalMatriculas = Number(usageRows[0].total_matriculas || 0);
    const totalCertificados = Number(usageRows[0].total_certificados || 0);

    if (totalMatriculas > 0 || totalCertificados > 0) {
      throw new AppError(
        "Este curso possui alunos matriculados ou certificados emitidos. Arquive o curso em vez de excluir.",
        409
      );
    }

    const [moduleRows]: any = await connection.query(
      "SELECT id FROM modulos WHERE curso_id = ?",
      [id]
    );

    const moduleIds = moduleRows.map((modulo: any) => modulo.id);

    if (moduleIds.length > 0) {
      const [lessonRows]: any = await connection.query(
        "SELECT id FROM aulas WHERE modulo_id IN (?)",
        [moduleIds]
      );

      const lessonIds = lessonRows.map((aula: any) => aula.id);

      const [quizRows]: any = await connection.query(
  "SELECT id FROM quizzes WHERE aula_id IN (?)",
  [lessonIds]
);

      const quizIds = quizRows.map((quiz: any) => quiz.id);

      if (quizIds.length > 0) {
        await connection.query(
          "DELETE FROM respostas_quiz WHERE quiz_id IN (?)",
          [quizIds]
        );

        await connection.query(
          "DELETE FROM quiz_opcoes WHERE quiz_id IN (?)",
          [quizIds]
        );

        await connection.query(
          "DELETE FROM quizzes WHERE id IN (?)",
          [quizIds]
        );
      }

      if (lessonIds.length > 0) {
        await connection.query(
          "DELETE FROM progresso_aulas WHERE aula_id IN (?)",
          [lessonIds]
        );
      }

      await connection.query(
        "DELETE FROM aulas WHERE modulo_id IN (?)",
        [moduleIds]
      );

      await connection.query(
        "DELETE FROM modulos WHERE curso_id = ?",
        [id]
      );
    }

    await connection.query(
      "DELETE FROM curso_dispositivos WHERE curso_id = ?",
      [id]
    );

    await connection.query(
      "DELETE FROM cursos WHERE id = ?",
      [id]
    );

    await connection.commit();

    return {
      message: "Curso deletado com sucesso",
      course: {
        id: courseRows[0].id,
        titulo: courseRows[0].titulo,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateCourseService(
  id: number,
  titulo: string,
  descricao: string,
  thumbnail: string
) {
  const course = await getCourseByIdRepository(id);

  if (!course) {
    throw new AppError("Curso não encontrado", 404);
  }

  await updateCourseRepository(id, titulo, descricao, thumbnail);

  return {
    message: "Curso atualizado com sucesso",
  };
}