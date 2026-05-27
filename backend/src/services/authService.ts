import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  createUser,
  findUserByEmail,
} from "../repositories/userRepository.js";

import { saveRefreshToken, findRefreshToken, deleteRefreshToken } from "../repositories/tokenRepository.js";

interface RegisterDTO {
  name: string;
  email: string;
  senha: string;
  role?: "student" | "client" | "admin";
}

export async function registerService(data: RegisterDTO) {

  const userExists = await findUserByEmail(data.email);

  if (userExists) {
    throw new Error("Usuário já existe");
  }

  const hashedPassword = await bcrypt.hash(
    data.senha,
    10
  );

  await createUser({
    ...data,
    senha: hashedPassword,
  });
}

interface LoginDTO {
  email: string;
  senha: string;
}

export async function loginService(data: LoginDTO) {

  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const passwordMatch = await bcrypt.compare(
    data.senha,
    user.senha
  );

  if (!passwordMatch) {
    throw new Error("Senha inválida");
  }

  const accessToken = jwt.sign(
  {
    id: user.id,
    role: user.role,
  },
  process.env.JWT_SECRET as string,
  {
    expiresIn: "15m",
  }
);

const refreshToken = jwt.sign(
  {
    id: user.id,
  },
  process.env.JWT_REFRESH_SECRET as string,
  {
    expiresIn: "7d",
  }
);

const expiresAt = new Date();

expiresAt.setDate(
  expiresAt.getDate() + 7
);

await saveRefreshToken(
  user.id,
  refreshToken,
  expiresAt
);

return {
  accessToken,
  refreshToken,

  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
};




}

export async function refreshTokenService(
 refreshToken:string   
){
    if (!refreshToken){
        throw new Error(
            "Refresh token obrigatorio"
        );
    }

    const tokenExists = 
    await findRefreshToken(refreshToken);


    if(!tokenExists){
        throw new Error(
            "Refresh token invalido"
        );
    }


    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
    ) as jwt.JwtPayload;


    const accessToken = jwt.sign(
        {
            id: decoded.id,
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "15m"
        }
    );

    return{
        accessToken,
    }
}

export async function logoutService(
  refreshToken: string
) {

  console.log("SERVICE TOKEN:");
  console.log(refreshToken);

  if (!refreshToken) {
    throw new Error(
      "Refresh token obrigatório"
    );
  }

  await deleteRefreshToken(
    refreshToken
  );

  return {
    message: "Logout realizado",
  };
}