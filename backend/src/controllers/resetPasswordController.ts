import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { pool } from "../database/connection.js";

import { AppError } from "../middlewares/errorMiddleware.js";

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      throw new AppError("Token não enviado", 400);
    }

    if (!newPassword) {
      throw new AppError("Nova senha não enviada", 400);
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM password_resets WHERE token = ?`,
      [token]
    );

    if (rows.length === 0) {
      throw new AppError("Token inválido", 400);
    }

    const reset = rows[0];

    if (new Date(reset.expires_at) < new Date()) {
      throw new AppError("Token expirado", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET senha = ? WHERE id = ?",
      [hashed, reset.user_id]
    );

    await pool.query(
      "DELETE FROM password_resets WHERE user_id = ?",
      [reset.user_id]
    );

    return res.json({
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    next(error);
  }
}