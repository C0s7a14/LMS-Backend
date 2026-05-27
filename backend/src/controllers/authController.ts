import { Request, Response } from "express";
import { loginService, registerService, refreshTokenService, logoutService } from "../services/authService.js";


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

export async function refreshController(
    req: Request,
    res: Response
){
    try{
        const {refreshToken} = req.body;
        
        const result = await refreshTokenService(refreshToken);
    
        return res.json(result);
    } catch (error : any){
        return res.status(401).json({
            error: error.message,
        });
        }
}

export async function logoutController(
  req: Request,
  res: Response
) {


  console.log("LOGOUT CONTROLLER");
    
  try {

    console.log(req.body);

    const { refreshToken } = req.body;

    console.log(refreshToken);

    const result =
      await logoutService(
        refreshToken
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message,
    });

  }
}