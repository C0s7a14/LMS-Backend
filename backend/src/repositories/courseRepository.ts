import { pool } from "../database/connection.js";

export async function createCourseRepository(
  titulo: string,
  descricao: string,
  thumbnail: string,
  criado_por: number
) {
  const [result]: any = await pool.execute(
    `
    INSERT INTO cursos
    (titulo, descricao, thumbnail, criado_por) 
    VALUES (?, ?, ?, ?)
    `,
    [titulo, descricao, thumbnail, criado_por]
  );

  return result.insertId;
}

export async function getCoursesRepository(userId: number, userRole: string) {
  const [courses]: any = await pool.execute(
    `
    SELECT
      c.id,
      c.titulo,
      c.descricao,

      COALESCE(
        NULLIF(c.thumbnail, ''),
        device.dispositivo_imagem
      ) AS thumbnail,

      c.criado_por,
      c.criado_em,
      c.status AS curso_publicacao_status,
      u.name AS criador,

      COALESCE(progress.total_aulas, 0) AS total_aulas,
      COALESCE(progress.aulas_concluidas, 0) AS aulas_concluidas,

      CASE
        WHEN COALESCE(progress.total_aulas, 0) = 0 THEN 0
        ELSE ROUND(
          (COALESCE(progress.aulas_concluidas, 0) / progress.total_aulas) * 100
        )
      END AS progresso,

      COALESCE(course_attempt.status, 'sem_tentativa') AS curso_status

    FROM cursos c

    INNER JOIN users u 
      ON u.id = c.criado_por

    LEFT JOIN (
      SELECT
        cd.curso_id,
        MAX(d.imagem_url) AS dispositivo_imagem
      FROM curso_dispositivos cd
      INNER JOIN dispositivos d 
        ON d.id = cd.dispositivo_id
      GROUP BY cd.curso_id
    ) device 
      ON device.curso_id = c.id

    LEFT JOIN (
      SELECT
        m.curso_id,
        COUNT(DISTINCT a.id) AS total_aulas,
        COUNT(DISTINCT pa.aula_id) AS aulas_concluidas
      FROM modulos m
      LEFT JOIN aulas a 
        ON a.modulo_id = m.id
      LEFT JOIN progresso_aulas pa 
        ON pa.aula_id = a.id
        AND pa.usuario_id = ?
        AND pa.concluida = 1
      GROUP BY m.curso_id
    ) progress 
      ON progress.curso_id = c.id

    LEFT JOIN (
      SELECT 
        ct.curso_id,
        ct.status
      FROM curso_tentativas ct
      INNER JOIN (
        SELECT 
          curso_id,
          MAX(numero_tentativa) AS ultima_tentativa
        FROM curso_tentativas
        WHERE usuario_id = ?
        GROUP BY curso_id
      ) latest
        ON latest.curso_id = ct.curso_id
        AND latest.ultima_tentativa = ct.numero_tentativa
      WHERE ct.usuario_id = ?
    ) course_attempt 
      ON course_attempt.curso_id = c.id

    WHERE
      (? = 'admin' OR c.status = 'publicado')

    ORDER BY c.id DESC
    `,
    [userId, userId, userId, userRole]
  );

  return courses;
}

export async function getCourseByIdRepository(id: number) {
  const [courses]: any = await pool.execute(
    `
    SELECT * 
    FROM cursos
    WHERE id = ?
    `,
    [id]
  );

  return courses[0];
}

export async function deleteCoursesRepository(id: number) {
  await pool.execute(
    `
    DELETE FROM cursos
    WHERE id = ?
    `,
    [id]
  );
}

export async function updateCourseRepository(
  id: number,
  titulo: string,
  descricao: string,
  thumbnail: string
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
    [titulo, descricao, thumbnail, id]
  );
}