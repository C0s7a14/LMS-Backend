import { getAdminDashboardRepository } from "../repositories/adminDashboardRepository.js";

export async function getAdminDashboardService() {
  const data = await getAdminDashboardRepository();

  return {
    resumo: {
      totalUsuarios: Number(data.stats?.totalUsuarios || 0),
      totalAlunos: Number(data.stats?.totalAlunos || 0),
      totalClientes: Number(data.stats?.totalClientes || 0),
      totalAdmins: Number(data.stats?.totalAdmins || 0),

      totalCursos: Number(data.stats?.totalCursos || 0),
      cursosPublicados: Number(data.stats?.cursosPublicados || 0),
      cursosRascunho: Number(data.stats?.cursosRascunho || 0),
      cursosArquivados: Number(data.stats?.cursosArquivados || 0),

      totalDispositivos: Number(data.stats?.totalDispositivos || 0),
      certificadosEmitidos: Number(data.stats?.certificadosEmitidos || 0),
      revisoesPendentes: Number(data.stats?.revisoesPendentes || 0),
    },

    ultimosCursos: data.ultimosCursos.map((course: any) => ({
      id: course.id,
      titulo: course.titulo,
      descricao: course.descricao,
      status: course.status,
      criado_em: course.criado_em,
      criador: course.criador,
      dispositivo_nome: course.dispositivo_nome,
      total_aulas: Number(course.total_aulas || 0),
    })),

    ultimosUsuarios: data.ultimosUsuarios.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      criado_em: user.criado_em,
    })),

    revisoesPendentes: data.revisoesPendentes.map((review: any) => ({
      curso_tentativa_id: review.curso_tentativa_id,
      usuario_id: review.usuario_id,
      aluno_nome: review.aluno_nome,
      aluno_email: review.aluno_email,
      curso_id: review.curso_id,
      curso_titulo: review.curso_titulo,
      numero_tentativa: Number(review.numero_tentativa || 0),
      nota_final: review.nota_final,
      status: review.status,
      atualizado_em: review.atualizado_em,
    })),

    ultimosCertificados: data.ultimosCertificados.map((cert: any) => ({
      id: cert.id,
      usuario_id: cert.usuario_id,
      aluno_nome: cert.aluno_nome,
      aluno_email: cert.aluno_email,
      curso_id: cert.curso_id,
      curso_titulo: cert.curso_titulo,
      validation_code: cert.validation_code,
      emitido_em: cert.emitido_em,
    })),
  };
}