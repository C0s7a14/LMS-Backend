import {
  findCourseStatusByIdRepository,
  updateCourseStatusRepository,
} from "../repositories/adminCourseStatusRepository.js";

const allowedStatuses = ["rascunho", "publicado", "arquivado"] as const;

type CourseStatus = (typeof allowedStatuses)[number];

export async function updateCourseStatusService(
  courseId: number,
  status: string
) {
  if (!courseId) {
    throw new Error("Curso não informado.");
  }

  if (!allowedStatuses.includes(status as CourseStatus)) {
    throw new Error("Status inválido.");
  }

  const course = await findCourseStatusByIdRepository(courseId);

  if (!course) {
    throw new Error("Curso não encontrado.");
  }

  if (status === "publicado" && Number(course.total_aulas) === 0) {
    throw new Error("Não é possível publicar um curso sem aulas.");
  }

  const updatedCourse = await updateCourseStatusRepository(
    courseId,
    status as CourseStatus
  );

  return {
    message: "Status do curso atualizado com sucesso.",
    course: updatedCourse,
  };
}