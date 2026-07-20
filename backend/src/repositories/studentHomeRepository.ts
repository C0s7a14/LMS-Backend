import { pool } from "../database/connection.js";

export async function getStudentHomeRepository(userId: number) {
  const [statsRows]: any = await pool.execute(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM cursos c
        WHERE c.status = 'publicado'
      ) AS totalCursosDisponiveis,

      (
        SELECT COUNT(DISTINCT m.curso_id)
        FROM matriculas m
        INNER JOIN cursos c ON c.id = m.curso_id
        WHERE m.usuario_id = ?
        AND c.status = 'publicado'
      ) AS totalCursosMatriculados,

      (
        SELECT COUNT(DISTINCT cert.curso_id)
        FROM certificados cert
        INNER JOIN cursos c ON c.id = cert.curso_id
        WHERE cert.usuario_id = ?
        AND c.status = 'publicado'
      ) AS totalCursosConcluidos,

      (
        SELECT COALESCE(
          ROUND(
            SUM(
              CASE
                WHEN pa.segundos_assistidos > 0 THEN pa.segundos_assistidos / 3600
                WHEN pa.concluida = 1 THEN COALESCE(a.duracao, 0) / 60
                ELSE 0
              END
            ),
            1
          ),
          0
        )
        FROM progresso_aulas pa
        INNER JOIN aulas a ON a.id = pa.aula_id
        INNER JOIN modulos mo ON mo.id = a.modulo_id
        INNER JOIN cursos c ON c.id = mo.curso_id
        WHERE pa.usuario_id = ?
        AND c.status = 'publicado'
        AND MONTH(pa.atualizado_em) = MONTH(CURRENT_DATE())
        AND YEAR(pa.atualizado_em) = YEAR(CURRENT_DATE())
      ) AS horasEstudoMes,

      (
        SELECT
          CASE
            WHEN COUNT(DISTINCT a.id) = 0 THEN 0
            ELSE ROUND(
              (
                COUNT(DISTINCT CASE WHEN pa.concluida = 1 THEN a.id END)
                / COUNT(DISTINCT a.id)
              ) * 100
            )
          END
        FROM cursos c
        INNER JOIN modulos mo ON mo.curso_id = c.id
        INNER JOIN aulas a ON a.modulo_id = mo.id
        LEFT JOIN progresso_aulas pa
          ON pa.aula_id = a.id
          AND pa.usuario_id = ?
        WHERE c.status = 'publicado'
        AND a.status = 'publicada'
      ) AS progressoGeral
    `,
    [userId, userId, userId, userId]
  );

  const [coursesRows]: any = await pool.execute(
    `
    SELECT
      c.id,
      c.titulo,
      c.descricao,

      COALESCE(
        NULLIF(c.thumbnail, ''),
        device.imagem_url
      ) AS thumbnail,

      device.nome AS dispositivo_nome,

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

    LEFT JOIN (
      SELECT
        cd.curso_id,
        MAX(d.nome) AS nome,
        MAX(d.imagem_url) AS imagem_url
      FROM curso_dispositivos cd
      INNER JOIN dispositivos d ON d.id = cd.dispositivo_id
      GROUP BY cd.curso_id
    ) device ON device.curso_id = c.id

    LEFT JOIN (
      SELECT
        mo.curso_id,
        COUNT(DISTINCT a.id) AS total_aulas,
        COUNT(DISTINCT CASE WHEN pa.concluida = 1 THEN a.id END) AS aulas_concluidas
      FROM modulos mo
      INNER JOIN aulas a ON a.modulo_id = mo.id
      LEFT JOIN progresso_aulas pa
        ON pa.aula_id = a.id
        AND pa.usuario_id = ?
      WHERE a.status = 'publicada'
      GROUP BY mo.curso_id
    ) progress ON progress.curso_id = c.id

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
    ) course_attempt ON course_attempt.curso_id = c.id

            WHERE c.status = 'publicado'
            AND (
        COALESCE(progress.aulas_concluidas, 0) > 0
        OR course_attempt.status = 'em_andamento'
        )
        AND COALESCE(course_attempt.status, '') NOT IN ('aprovado', 'em_revisao', 'bloqueado')
        AND NOT EXISTS (
        SELECT 1
        FROM certificados cert
        WHERE cert.usuario_id = ?
        AND cert.curso_id = c.id
        )
            ORDER BY c.id DESC
            LIMIT 3
            `,
   [userId, userId, userId, userId]
  );

  const [nextLessonsRows]: any = await pool.execute(
    `
    SELECT
      c.id AS curso_id,
      c.titulo AS curso_titulo,

      mo.id AS modulo_id,
      mo.titulo AS modulo_titulo,

      a.id AS aula_id,
      a.titulo AS aula_titulo,
      a.duracao,

      device.nome AS dispositivo_nome

    FROM cursos c

    INNER JOIN modulos mo ON mo.curso_id = c.id
    INNER JOIN aulas a ON a.modulo_id = mo.id

    LEFT JOIN progresso_aulas pa
      ON pa.aula_id = a.id
      AND pa.usuario_id = ?
      AND pa.concluida = 1

    LEFT JOIN (
      SELECT
        cd.curso_id,
        MAX(d.nome) AS nome
      FROM curso_dispositivos cd
      INNER JOIN dispositivos d ON d.id = cd.dispositivo_id
      GROUP BY cd.curso_id
    ) device ON device.curso_id = c.id

    WHERE c.status = 'publicado'
    AND a.status = 'publicada'
    AND pa.id IS NULL

    ORDER BY c.id DESC, mo.ordem ASC, a.ordem ASC
    LIMIT 3
    `,
    [userId]
  );

  const [reviewRows]: any = await pool.execute(
    `
    SELECT
      c.id AS curso_id,
      c.titulo AS curso_titulo,
      ct.id AS curso_tentativa_id,
      ct.numero_tentativa,
      ct.nota_final,
      ct.status

    FROM curso_tentativas ct
    INNER JOIN cursos c ON c.id = ct.curso_id

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
    AND ct.status = 'em_revisao'
    AND c.status = 'publicado'

    ORDER BY ct.atualizado_em DESC
    LIMIT 3
    `,
    [userId, userId]
  );

  return {
    stats: statsRows[0],
    cursosEmAndamento: coursesRows,
    proximasAulas: nextLessonsRows,
    revisoesPendentes: reviewRows,
  };
}