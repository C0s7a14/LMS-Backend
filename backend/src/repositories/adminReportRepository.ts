import { pool } from "../database/connection.js";

export async function getAdminReportSummaryRepository() {
  const [rows]: any = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_alunos,
      (SELECT COUNT(*) FROM users WHERE role = 'client') AS total_clientes,
      (SELECT COUNT(*) FROM cursos) AS total_cursos,
      (SELECT COUNT(*) FROM cursos WHERE status = 'publicado') AS cursos_publicados,
      (SELECT COUNT(*) FROM matriculas) AS total_matriculas,
      (SELECT COUNT(*) FROM certificados) AS certificados_emitidos
  `);

  return rows[0];
}

export async function getCoursePerformanceRepository() {
  const [rows]: any = await pool.execute(`
    SELECT
      c.id AS curso_id,
      c.titulo,
      c.status,
      COUNT(DISTINCT m.id) AS total_matriculas,
      COUNT(DISTINCT cert.id) AS certificados_emitidos,
      COUNT(DISTINCT a.id) AS total_aulas,
      COUNT(DISTINCT pa.id) AS aulas_concluidas,
      CASE
        WHEN COUNT(DISTINCT m.id) = 0 OR COUNT(DISTINCT a.id) = 0 THEN 0
        ELSE ROUND(
          (COUNT(DISTINCT pa.id) / (COUNT(DISTINCT m.id) * COUNT(DISTINCT a.id))) * 100,
          2
        )
      END AS progresso_medio
    FROM cursos c
    LEFT JOIN matriculas m ON m.curso_id = c.id
    LEFT JOIN certificados cert ON cert.curso_id = c.id
    LEFT JOIN modulos mo ON mo.curso_id = c.id
    LEFT JOIN aulas a ON a.modulo_id = mo.id
    LEFT JOIN progresso_aulas pa 
      ON pa.aula_id = a.id
      AND pa.concluida = 1
    GROUP BY c.id
    ORDER BY total_matriculas DESC, certificados_emitidos DESC
  `);

  return rows;
}

export async function getQuizPerformanceRepository() {
  const [rows]: any = await pool.execute(`
    SELECT
      q.id AS quiz_id,
      q.titulo,
      q.tipo,
      q.status,
      c.titulo AS curso_titulo,
      COUNT(qt.id) AS total_tentativas,
      SUM(CASE WHEN qt.aprovado = 1 THEN 1 ELSE 0 END) AS aprovados,
      SUM(CASE WHEN qt.aprovado = 0 THEN 1 ELSE 0 END) AS reprovados,
      ROUND(AVG(qt.nota), 2) AS media_nota
    FROM quizzes q
    INNER JOIN cursos c ON c.id = q.curso_id
    LEFT JOIN quiz_tentativas qt ON qt.quiz_id = q.id
    GROUP BY q.id
    ORDER BY total_tentativas DESC, media_nota DESC
  `);

  return rows;
}

export async function getMonthlyCertificatesRepository() {
  const [rows]: any = await pool.execute(`
    SELECT
      DATE_FORMAT(emitido_em, '%Y-%m') AS mes,
      COUNT(*) AS total
    FROM certificados
    GROUP BY DATE_FORMAT(emitido_em, '%Y-%m')
    ORDER BY mes ASC
  `);

  return rows;
}

