import {
  getAdminReportSummaryRepository,
  getCoursePerformanceRepository,
  getMonthlyCertificatesRepository,
  getQuizPerformanceRepository,
} from "../repositories/adminReportRepository.js";

export async function getAdminReportsService() {
  const summary = await getAdminReportSummaryRepository();
  const courses = await getCoursePerformanceRepository();
  const quizzes = await getQuizPerformanceRepository();
  const monthlyCertificates = await getMonthlyCertificatesRepository();

  return {
    summary: {
      total_alunos: Number(summary.total_alunos || 0),
      total_clientes: Number(summary.total_clientes || 0),
      total_cursos: Number(summary.total_cursos || 0),
      cursos_publicados: Number(summary.cursos_publicados || 0),
      total_matriculas: Number(summary.total_matriculas || 0),
      certificados_emitidos: Number(summary.certificados_emitidos || 0),
    },
    courses,
    quizzes,
    monthlyCertificates,
  };
}