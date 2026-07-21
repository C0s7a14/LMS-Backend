import {
  findAdminCourseByIdRepository,
  updateAdminCourseRepository,
} from "../repositories/adminCourseEditRepository.js";

export async function updateAdminCourseService(
  courseId: number,
  data: {
    titulo?: string;
    descricao?: string;
    thumbnail?: string;
  }
) {
  if (!courseId) {
    throw new Error("Curso não informado.");
  }

  const course = await findAdminCourseByIdRepository(courseId);

  if (!course) {
    throw new Error("Curso não encontrado.");
  }

  if (!data.titulo || !data.titulo.trim()) {
    throw new Error("O título do curso é obrigatório.");
  }

  const updatedCourse = await updateAdminCourseRepository(courseId, {
    titulo: data.titulo.trim(),
    descricao: data.descricao?.trim() || null,
    thumbnail: data.thumbnail?.trim() || null,
  });

  return {
    message: "Curso atualizado com sucesso.",
    course: updatedCourse,
  };
}