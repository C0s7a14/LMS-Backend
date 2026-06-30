import { pool } from "../database/connection.js";

export async function getCourseContentService(
  courseId: number,
  usuarioId: number
) {
  const [courseRows]: any = await pool.query(
    `
      SELECT
        id,
        titulo,
        descricao,
        thumbnail,
        criado_em
      FROM cursos
      WHERE id = ?
    `,
    [courseId]
  );

  if (courseRows.length === 0) {
    throw new Error("Curso não encontrado");
  }

  const course = courseRows[0];

  const [moduleRows]: any = await pool.query(
    `
      SELECT
        id,
        curso_id,
        titulo,
        ordem
      FROM modulos
      WHERE curso_id = ?
      ORDER BY ordem ASC, id ASC
    `,
    [courseId]
  );

  const [lessonRows]: any = await pool.query(
    `
      SELECT
        a.id,
        a.modulo_id,
        a.titulo,
        a.descricao,
        a.conteudo,
        a.video_url,
        a.pdf_url,
        a.duracao,
        a.ordem,
        a.status,
        a.criado_em,
        COALESCE(pa.concluida, false) AS concluida,
        COALESCE(pa.segundos_assistidos, 0) AS segundos_assistidos
      FROM aulas a
      INNER JOIN modulos m
        ON m.id = a.modulo_id
      LEFT JOIN progresso_aulas pa
        ON pa.aula_id = a.id
        AND pa.usuario_id = ?
      WHERE m.curso_id = ?
      ORDER BY m.ordem ASC, a.ordem ASC, a.id ASC
    `,
    [usuarioId, courseId]
  );

  const modules = moduleRows.map((module: any) => {
    const aulas = lessonRows
      .filter((lesson: any) => lesson.modulo_id === module.id)
      .map((lesson: any) => ({
        id: lesson.id,
        modulo_id: lesson.modulo_id,
        titulo: lesson.titulo,
        descricao: lesson.descricao,
        conteudo: lesson.conteudo,
        video_url: lesson.video_url,
        pdf_url: lesson.pdf_url,
        duracao: lesson.duracao,
        ordem: lesson.ordem,
        status: lesson.status,
        criado_em: lesson.criado_em,
        concluida: Boolean(lesson.concluida),
        segundos_assistidos: lesson.segundos_assistidos,
      }));

    return {
      id: module.id,
      curso_id: module.curso_id,
      titulo: module.titulo,
      ordem: module.ordem,
      aulas,
    };
  });

  const totalAulas = lessonRows.length;

  const aulasConcluidas = lessonRows.filter(
    (lesson: any) => Boolean(lesson.concluida)
  ).length;

  const progresso =
    totalAulas === 0
      ? 0
      : Number(((aulasConcluidas / totalAulas) * 100).toFixed(2));

  return {
    id: course.id,
    titulo: course.titulo,
    descricao: course.descricao,
    thumbnail: course.thumbnail,
    criado_em: course.criado_em,
    progresso,
    total_aulas: totalAulas,
    aulas_concluidas: aulasConcluidas,
    modulos: modules,
  };
}