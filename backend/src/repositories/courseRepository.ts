import {pool} from "../database/connection.js";

export async function createCourseRepository(
    titulo: string,
    descricao: string,
    thumbnail: string,
    criado_por: number
){
    const [result]:any = await pool.execute(
        `
       INSERT INTO cursos
       (titulo, descricao, thumbnail, criado_por) 
        VALUES (?, ?, ?, ?)
        `,
        [
            titulo,
            descricao,
            thumbnail,
            criado_por,
        ]
    );

    return result.insertId;
}



export async function getCoursesRepository(){
    const [courses]: any = await pool.execute(
        `
        SELECT
        cursos.*,
        users.name AS criador
        FROM cursos
        JOIN users
        ON users.id = cursos.criado_por
        ORDER BY cursos.id DESC
        `
    );

    return courses;
}



export async function getCourseByIdRepository(
    id: number
){
    const [courses]: any = await pool.execute(
        `
        SELECT * 
        FROM cursos
        WHERE id = ?
        
        `,
        [id]
    );

    return courses[0];
}


export async function deleteCoursesRepository(
    id: number
){
    await pool.execute(
        `
        DELETE FROM cursos
        WHERE id = ?
        `,
        [id]
    );
};

export async function updateCourseRepository(
  id: number,
  titulo: string,
  descricao: string,
  thumbnail: string
) {

  await pool.execute(
    `
      UPDATE cursos
      SET
        titulo = ?,
        descricao = ?,
        thumbnail = ?
      WHERE id = ?
    `,
    [
      titulo,
      descricao,
      thumbnail,
      id
    ]
  );
}