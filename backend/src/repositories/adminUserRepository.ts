import { pool } from "../database/connection.js";

export async function updateUserRoleRepository(
  userId: number,
  role: "student" | "client" | "admin"
) {
  const [result]: any = await pool.execute(
    `
    UPDATE users
    SET role = ?
    WHERE id = ?
    `,
    [role, userId]
  );

  return result;
}

export async function findUserByIdRepository(userId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      id,
      name,
      email,
      role,
      criado_em
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0];
}