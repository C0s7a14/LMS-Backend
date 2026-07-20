import { getStudentHomeRepository } from "../repositories/studentHomeRepository.js";

export async function getStudentHomeService(userId: number) {
  const data = await getStudentHomeRepository(userId);

  const totalCursosDisponiveis = Number(data.stats?.totalCursosDisponiveis || 0);
  const totalCursosMatriculados = Number(data.stats?.totalCursosMatriculados || 0);

  return {
    resumo: {
      totalCursosDisponiveis,

      totalCursosMatriculados:
        totalCursosMatriculados > 0
          ? totalCursosMatriculados
          : totalCursosDisponiveis,

      totalCursosConcluidos: Number(data.stats?.totalCursosConcluidos || 0),

      horasEstudoMes: Number(data.stats?.horasEstudoMes || 0),

      progressoGeral: Number(data.stats?.progressoGeral || 0),
    },

    cursosEmAndamento: data.cursosEmAndamento.map((course: any) => ({
      id: course.id,
      titulo: course.titulo,
      descricao: course.descricao,
      thumbnail: course.thumbnail,
      dispositivo_nome: course.dispositivo_nome,
      total_aulas: Number(course.total_aulas || 0),
      aulas_concluidas: Number(course.aulas_concluidas || 0),
      progresso: Number(course.progresso || 0),
      curso_status: course.curso_status,
    })),

    proximasAulas: data.proximasAulas.map((lesson: any) => ({
      curso_id: lesson.curso_id,
      curso_titulo: lesson.curso_titulo,
      modulo_id: lesson.modulo_id,
      modulo_titulo: lesson.modulo_titulo,
      aula_id: lesson.aula_id,
      aula_titulo: lesson.aula_titulo,
      duracao: Number(lesson.duracao || 0),
      dispositivo_nome: lesson.dispositivo_nome,
    })),

    revisoesPendentes: data.revisoesPendentes.map((review: any) => ({
      curso_id: review.curso_id,
      curso_titulo: review.curso_titulo,
      curso_tentativa_id: review.curso_tentativa_id,
      numero_tentativa: Number(review.numero_tentativa || 0),
      nota_final: review.nota_final,
      status: review.status,
    })),
  };
}