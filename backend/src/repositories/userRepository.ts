import {pool} from "../database/connection.js"


interface CreateUserDTO{
    name: string;
    email: string;
    senha: string;
    role?: "student" | "cliente" | "admin";
}

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