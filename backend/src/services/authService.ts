import bcrypt from "bcrypt";
import {createUser, findUserByEmail} from "../repositories/userRepository.js"



interface RegisterDTO{
    name: string;
    email: string;
    senha: string;
    role?: "student" | "cliente" | "admin";
}



export async function registerService(data: RegisterDTO){
    const userExists = await findUserByEmail(data.email);

    if(userExists){
        throw new Error("Usuário já existe");
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const user = await createUser({
        ...data,
        senha: hashedPassword,
    });


    return user;
}