import { Request, Response } from "express";
import { loginService, registerService } from "../services/authService.js";


export async function registerController(
    req: Request,
    res: Response
){
    try {
        const { name, email, senha , role} = req.body;

        await registerService({
            name,
            email,
            senha,
            role,
        });


        return res.status(201).json({
            message: "Usuário criado com sucesso"
        });
    
    } catch (error: any){
        return res.status(400).json({
            error: error.message
        });
    }
    
}



export async function loginController(
    req: Request,
    res: Response
){
    try{

        const {email, senha} = req.body;

        const result = await loginService({
            email,
            senha,
        });

        return res.json(result);
    } catch (error: any){
        return res.status(400).json({
            error: error.message,
        });
    }
}

