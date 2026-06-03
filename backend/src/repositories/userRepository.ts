import {pool} from "../database/connection.js"


interface CreateUserDTO{
    name: string;
    email: string;
    senha: string;
    role?: "student" | "client" | "admin";
}


interface UpdateUserDTO {
    name?: string;
    email?: string;
    senha?: string;
    role?: "student" | "client" | "admin"

}


     //create
export async function createUser(data: CreateUserDTO){
    const {name, email, senha, role} = data;

    const [result] = await pool.execute(
        `
        INSERT INTO users (name, email, senha, role)
        VALUES (?, ?, ?, ?)
        
        `,
        [name, email, senha, role || "student"]
    );

    return result;
}



  //find by email
export async function findUserByEmail(email:string){
    const [rows]: any = await pool.execute(
        `
        SELECT * FROM users
        WHERE email = ?

        `,
        [email]
    );

    return rows[0]
}


   //find all
   export async function getUsers(){

    const [rows]: any = 
    await pool.execute(
        `
        SELECT
        id,
        name,
        email,
        role,
        criado_em

        FROM users
        `
    );

    return rows;
   }




   //FYND BY ID 

   export async function getUserById(
    id: number
   ){

    const [rows]: any = 
    await pool.execute(
        `
        SELECT
        id,
        name,
        email,
        role,
        criado_em

        FROM users


        WHERE id = ?
        `,
        [id]
    );

    return rows[0]
   }




//UPDATE 
export async function updateUser(
  id: number,
  data: UpdateUserDTO
) {

  const {
    name,
    email,
    senha,
    role
  } = data;

await pool.execute(
  `
  UPDATE users

  SET
    name = ?,
    email = ?,
    senha = ?,
    role = ?

  WHERE id = ?
  `,
  [
    name,
    email,
    senha,
    role,
    id
  ] as any[]
);
}

//DELETE 
export async function deleteUser(
  id: number
) {

  await pool.execute(
    `
    DELETE FROM users

    WHERE id = ?
    `,
    [id]
  );
}