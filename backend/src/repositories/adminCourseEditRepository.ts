import { pool } from "../database/connection.js";

export async function findAdminCourseByIdRepository(courseId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      id,
      titulo,
      descricao,
      thumbnail,
      status,
      criado_por,
      criado_em
    FROM cursos
    WHERE id = ?
    LIMIT 1
    `,
    [courseId]
  );

  return rows[0];
}

export async function updateAdminCourseRepository(
  courseId: number,
  data: {
    titulo: string;
    descricao: string | null;
    thumbnail: string | null;
  }
) {
  await pool.execute(
    `
    UPDATE cursos
    SET
      titulo = ?,
      descricao = ?,
      thumbnail = ?
    WHERE id = ?
    `,
    [data.titulo, data.descricao, data.thumbnail, courseId]
  );

  return await findAdminCourseByIdRepository(courseId);
}