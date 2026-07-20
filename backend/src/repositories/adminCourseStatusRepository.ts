import { pool } from "../database/connection.js";

export async function findCourseStatusByIdRepository(courseId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      c.id,
      c.titulo,
      c.status,
      COUNT(a.id) AS total_aulas
    FROM cursos c
    LEFT JOIN modulos m ON m.curso_id = c.id
    LEFT JOIN aulas a ON a.modulo_id = m.id
    WHERE c.id = ?
    GROUP BY c.id
    LIMIT 1
    `,
    [courseId]
  );

  return rows[0];
}

export async function updateCourseStatusRepository(
  courseId: number,
  status: "rascunho" | "publicado" | "arquivado"
) {
  await pool.execute(
    `
    UPDATE cursos
    SET status = ?
    WHERE id = ?
    `,
    [status, courseId]
  );

  return await findCourseStatusByIdRepository(courseId);
}