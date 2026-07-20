import { pool } from "../database/connection.js";

export async function getAdminDashboardRepository() {
  const [statsRows]: any = await pool.execute(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM users
      ) AS totalUsuarios,

      (
        SELECT COUNT(*)
        FROM users
        WHERE role = 'student'
      ) AS totalAlunos,

      (
        SELECT COUNT(*)
        FROM users
        WHERE role = 'client'
      ) AS totalClientes,

      (
        SELECT COUNT(*)
        FROM users
        WHERE role = 'admin'
      ) AS totalAdmins,

      (
        SELECT COUNT(*)
        FROM cursos
      ) AS totalCursos,

      (
        SELECT COUNT(*)
        FROM cursos
        WHERE status = 'publicado'
      ) AS cursosPublicados,

      (
        SELECT COUNT(*)
        FROM cursos
        WHERE status = 'rascunho'
      ) AS cursosRascunho,

      (
        SELECT COUNT(*)
        FROM cursos
        WHERE status = 'arquivado'
      ) AS cursosArquivados,

      (
        SELECT COUNT(*)
        FROM dispositivos
      ) AS totalDispositivos,

      (
        SELECT COUNT(*)
        FROM certificados
      ) AS certificadosEmitidos,

      (
        SELECT COUNT(*)
        FROM curso_tentativas ct
        INNER JOIN (
          SELECT
            usuario_id,
            curso_id,
            MAX(numero_tentativa) AS ultima_tentativa
          FROM curso_tentativas
          GROUP BY usuario_id, curso_id
        ) latest
          ON latest.usuario_id = ct.usuario_id
          AND latest.curso_id = ct.curso_id
          AND latest.ultima_tentativa = ct.numero_tentativa
        WHERE ct.status = 'em_revisao'
      ) AS revisoesPendentes
    `
  );

  const [latestCoursesRows]: any = await pool.execute(
    `
    SELECT
      c.id,
      c.titulo,
      c.descricao,
      c.status,
      c.criado_em,
      u.name AS criador,

      COALESCE(device.nome, 'Sem dispositivo') AS dispositivo_nome,
      COALESCE(aulas.total_aulas, 0) AS total_aulas

    FROM cursos c

    INNER JOIN users u
      ON u.id = c.criado_por

    LEFT JOIN (
      SELECT
        cd.curso_id,
        MAX(d.nome) AS nome
      FROM curso_dispositivos cd
      INNER JOIN dispositivos d
        ON d.id = cd.dispositivo_id
      GROUP BY cd.curso_id
    ) device
      ON device.curso_id = c.id

    LEFT JOIN (
      SELECT
        m.curso_id,
        COUNT(a.id) AS total_aulas
      FROM modulos m
      LEFT JOIN aulas a
        ON a.modulo_id = m.id
      GROUP BY m.curso_id
    ) aulas
      ON aulas.curso_id = c.id

    ORDER BY c.criado_em DESC
    LIMIT 5
    `
  );

  const [latestUsersRows]: any = await pool.execute(
    `
    SELECT
      id,
      name,
      email,
      role,
      criado_em
    FROM users
    ORDER BY criado_em DESC
    LIMIT 5
    `
  );

  const [reviewRows]: any = await pool.execute(
    `
    SELECT
      ct.id AS curso_tentativa_id,
      ct.usuario_id,
      u.name AS aluno_nome,
      u.email AS aluno_email,

      ct.curso_id,
      c.titulo AS curso_titulo,

      ct.numero_tentativa,
      ct.nota_final,
      ct.status,
      ct.atualizado_em

    FROM curso_tentativas ct

    INNER JOIN users u
      ON u.id = ct.usuario_id

    INNER JOIN cursos c
      ON c.id = ct.curso_id

    INNER JOIN (
      SELECT
        usuario_id,
        curso_id,
        MAX(numero_tentativa) AS ultima_tentativa
      FROM curso_tentativas
      GROUP BY usuario_id, curso_id
    ) latest
      ON latest.usuario_id = ct.usuario_id
      AND latest.curso_id = ct.curso_id
      AND latest.ultima_tentativa = ct.numero_tentativa

    WHERE ct.status = 'em_revisao'

    ORDER BY ct.atualizado_em DESC
    LIMIT 5
    `
  );

  const [certificateRows]: any = await pool.execute(
    `
    SELECT
      cert.id,
      cert.usuario_id,
      u.name AS aluno_nome,
      u.email AS aluno_email,

      cert.curso_id,
      c.titulo AS curso_titulo,

      cert.validation_code,
      cert.emitido_em

    FROM certificados cert

    INNER JOIN users u
      ON u.id = cert.usuario_id

    INNER JOIN cursos c
      ON c.id = cert.curso_id

    ORDER BY cert.emitido_em DESC
    LIMIT 5
    `
  );

  return {
    stats: statsRows[0],
    ultimosCursos: latestCoursesRows,
    ultimosUsuarios: latestUsersRows,
    revisoesPendentes: reviewRows,
    ultimosCertificados: certificateRows,
  };
}