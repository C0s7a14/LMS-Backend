import { createCourseRepository, getCourseByIdRepository, deleteCoursesRepository, getCoursesRepository, updateCourseRepository } from "../repositories/courseRepository.js";


interface CreateCoursesDTO {
    titulo: string;
    descricao: string;
    thumbnail: string;
    criado_por: number;
}


export async function createCourseService(
    data: CreateCoursesDTO
){
        const courseId =
        await createCourseRepository(
            data.titulo,
            data.descricao,
            data.thumbnail,
            data.criado_por
        );


        return{
            message: "Criado com sucesso",
            courseId
        };
}



export async function getCoursesService(){
    return await getCoursesRepository();
}

export async function getCoursesByIdService(
    id:number
){
    const course = 
    await getCourseByIdRepository(id);

    if(!course){
        throw new Error("Curso não encontrado")
    }

    return course;
}


export async function deleteCoursesService(
    id: number
){
    const course =
    await getCourseByIdRepository(id);

    if (!course){
            throw new Error ("Curso não encontrado")
    }

    await deleteCoursesRepository(id);


    return {
        message:"Curso deletado com sucesso"
    }
}


export async function updateCourseService(
  id: number,
  titulo: string,
  descricao: string,
  thumbnail: string
) {

  const course =
    await getCourseByIdRepository(id);

  if (!course) {
    throw new Error(
      "Curso não encontrado"
    );
  }

  await updateCourseRepository(
    id,
    titulo,
    descricao,
    thumbnail
  );

  return {
    message: "Curso atualizado com sucesso"
  };
}
