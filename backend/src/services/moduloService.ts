import type { ResultSetHeader } from "mysql2";
import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";

interface CreateModuloDTO {
  curso_id: number;
  titulo: string;
  ordem?: number;
}

interface UpdateModuloDTO {
  titulo?: string;
  ordem?: number;
}

export async function createModuloService(data: CreateModuloDTO) {
  const { curso_id, titulo, ordem } = data;

  const [courseRows]: any = await pool.query(
    "SELECT id FROM cursos WHERE id = ?",
    [curso_id]
  );

  if (courseRows.length === 0) {
    throw new AppError("Curso não encontrado", 404);
  }

  const [result] = await pool.query<ResultSetHeader>(
    `
      INSERT INTO modulos (
        curso_id,
        titulo,
        ordem
      )
      VALUES (?, ?, ?)
    `,
    [
      curso_id,
      titulo,
      ordem || 0,
    ]
  );

  return {
    message: "Módulo criado com sucesso",
    moduloId: result.insertId,
  };
}

export async function getModulosByCourseService(courseId: number) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        curso_id,
        titulo,
        ordem
      FROM modulos
      WHERE curso_id = ?
      ORDER BY ordem ASC, id ASC
    `,
    [courseId]
  );

  return rows;
}

export async function getModuloByIdService(moduloId: number) {
  const [rows]: any = await pool.query(
    `
      SELECT
        id,
        curso_id,
        titulo,
        ordem
      FROM modulos
      WHERE id = ?
    `,
    [moduloId]
  );

  if (rows.length === 0) {
    throw new AppError("Módulo não encontrado", 404);
  }

  return rows[0];
}

export async function updateModuloService(
  moduloId: number,
  data: UpdateModuloDTO
) {
  const modulo = await getModuloByIdService(moduloId);

  const titulo = data.titulo ?? modulo.titulo;
  const ordem = data.ordem ?? modulo.ordem;

  await pool.query(
    `
      UPDATE modulos
      SET
        titulo = ?,
        ordem = ?
      WHERE id = ?
    `,
    [
      titulo,
      ordem,
      moduloId,
    ]
  );

  return {
    message: "Módulo atualizado com sucesso",
  };
}

export async function deleteModuloService(moduloId: number) {
  await getModuloByIdService(moduloId);

  await pool.query(
    "DELETE FROM modulos WHERE id = ?",
    [moduloId]
  );

  return {
    message: "Módulo deletado com sucesso",
  };
}