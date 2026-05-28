import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { pool } from "../database/connection.js";

export async function resetPassword(req: Request, res: Response) {
 
  try {
    const { token, newPassword } = req.body;

    const [rows]: any = await pool.query(
      `SELECT * FROM password_resets WHERE token = ?`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Token inválido" });
    }

    const reset = rows[0];

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ message: "Token expirado" });
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

    return res.json({ message: "Senha alterada com sucesso" });

  } catch (error) {
   
    console.error("Erro ao resetar senha:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}