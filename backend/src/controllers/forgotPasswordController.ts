import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { pool } from "../database/connection.js";
import { Resend } from "resend";

import { AppError } from "../middlewares/errorMiddleware.js";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError(
        "Email é obrigatório",
        400
      );
    }

    const [users]: any = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      throw new AppError(
        "Usuário não encontrado",
        404
      );
    }

    const user = users[0];

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + 1
    );

    await pool.query(
      "DELETE FROM password_resets WHERE user_id = ?",
      [user.id]
    );

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Recuperação de senha",
      html: `
        <h1>Recuperação de senha</h1>

        <p>
          Clique abaixo para redefinir sua senha
        </p>

        <a href="http://localhost:5173/reset-password?token=${token}">
          Redefinir senha
        </a>
      `,
    });

    return res.json({
      message: "Email de recuperação enviado",
    });
  } catch (error) {
    next(error);
  }
}