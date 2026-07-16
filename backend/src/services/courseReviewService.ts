import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";

export async function getCourseReviewStatusService(
  courseId: number,
  userId: number
) {
  const [attemptRows]: any = await pool.query(
    `
    SELECT 
      id,
      usuario_id,
      curso_id,
      numero_tentativa,
      status,
      nota_final,
      max_tentativas,
      iniciado_em,
      finalizado_em
    FROM curso_tentativas
    WHERE usuario_id = ?
      AND curso_id = ?
    ORDER BY numero_tentativa DESC
    LIMIT 1
    `,
    [userId, courseId]
  );

  if (attemptRows.length === 0) {
    return {
      status: "sem_tentativa",
      curso_tentativa: null,
    };
  }

  return {
    status: attemptRows[0].status,
    curso_tentativa: attemptRows[0],
  };
}

export async function completeCourseReviewService(
  courseId: number,
  userId: number
) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [courseRows]: any = await connection.query(
      `
      SELECT id
      FROM cursos
      WHERE id = ?
      LIMIT 1
      `,
      [courseId]
    );

    if (courseRows.length === 0) {
      throw new AppError("Curso não encontrado", 404);
    }

    const [attemptRows]: any = await connection.query(
      `
      SELECT 
        id,
        numero_tentativa,
        status,
        max_tentativas
      FROM curso_tentativas
      WHERE usuario_id = ?
        AND curso_id = ?
      ORDER BY numero_tentativa DESC
      LIMIT 1
      `,
      [userId, courseId]
    );

    const latestAttempt = attemptRows[0];

    if (!latestAttempt) {
      throw new AppError("Nenhuma tentativa encontrada para este curso", 404);
    }

    if (latestAttempt.status !== "em_revisao") {
      throw new AppError(
        "Este curso não está em revisão no momento",
        400
      );
    }

    if (
      Number(latestAttempt.numero_tentativa) >=
      Number(latestAttempt.max_tentativas)
    ) {
      await connection.query(
        `
        UPDATE curso_tentativas
        SET status = 'bloqueado',
            atualizado_em = NOW()
        WHERE id = ?
        `,
        [latestAttempt.id]
      );

      throw new AppError(
        "Limite de tentativas atingido. O curso foi bloqueado para nova tentativa.",
        403
      );
    }

    await connection.query(
      `
      UPDATE curso_tentativas
      SET status = 'reprovado',
          finalizado_em = NOW(),
          atualizado_em = NOW()
      WHERE id = ?
      `,
      [latestAttempt.id]
    );

    const nextAttemptNumber = Number(latestAttempt.numero_tentativa) + 1;

    const [insertResult]: any = await connection.query(
      `
      INSERT INTO curso_tentativas (
        usuario_id,
        curso_id,
        numero_tentativa,
        status,
        max_tentativas
      )
      VALUES (?, ?, ?, 'em_andamento', ?)
      `,
      [
        userId,
        courseId,
        nextAttemptNumber,
        Number(latestAttempt.max_tentativas),
      ]
    );

    await connection.commit();

    return {
      message: "Revisão concluída. Nova tentativa da prova final liberada.",
      curso_tentativa: {
        id: insertResult.insertId,
        curso_id: courseId,
        usuario_id: userId,
        numero_tentativa: nextAttemptNumber,
        status: "em_andamento",
        max_tentativas: Number(latestAttempt.max_tentativas),
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}