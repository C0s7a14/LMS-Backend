import { ResultSetHeader } from "mysql2";
import { pool } from "../database/connection.js";

interface CreateAulaDTO {
  modulo_id: number;
  titulo: string;
  descricao?: string;
  conteudo?: string;
  video_url?: string;
  pdf_url?: string;
  duracao?: number;
  ordem?: number;
  status?: "rascunho" | "publicada";
}

interface UpdateAulaDTO {
  titulo?: string;
  descricao?: string;
  conteudo?: string;
  video_url?: string;
  pdf_url?: string;
  duracao?: number;
  ordem?: number;
  status?: "rascunho" | "publicada";
}

export async function createAulaService(data: CreateAulaDTO) {
  const {
    modulo_id,
    titulo,
    descricao,
    conteudo,
    video_url,
    pdf_url,
    duracao,
    ordem,
    status,
  } = data;

  const [moduleExists]: any = await pool.query(
    "SELECT id FROM modulos WHERE id = ?",
    [modulo_id]
  );

  if (moduleExists.length === 0) {
    throw new Error("Módulo não encontrado");
  }

  const [result] = await pool.query<ResultSetHeader>(
    `
      INSERT INTO aulas (
        modulo_id,
        titulo,
        descricao,
        conteudo,
        video_url,
        pdf_url,
        duracao,
        ordem,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      modulo_id,
      titulo,
      descricao || null,
      conteudo || null,
      video_url || null,
      pdf_url || null,
      duracao || null,
      ordem || 0,
      status || "publicada",
    ]
  );

  return {
    message: "Aula criada com sucesso",
    aulaId: result.insertId,
  };
}

export async function getAulasByModuloService(moduloId: number) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        modulo_id,
        titulo,
        descricao,
        conteudo,
        video_url,
        pdf_url,
        duracao,
        ordem,
        status,
        criado_em
      FROM aulas
      WHERE modulo_id = ?
      ORDER BY ordem ASC, id ASC
    `,
    [moduloId]
  );

  return rows;
}

export async function getAulaByIdService(aulaId: number) {
  const [rows]: any = await pool.query(
    `
      SELECT
        id,
        modulo_id,
        titulo,
        descricao,
        conteudo,
        video_url,
        pdf_url,
        duracao,
        ordem,
        status,
        criado_em
      FROM aulas
      WHERE id = ?
    `,
    [aulaId]
  );

  if (rows.length === 0) {
    throw new Error("Aula não encontrada");
  }

  return rows[0];
}

export async function updateAulaService(
  aulaId: number,
  data: UpdateAulaDTO
) {
  const aula = await getAulaByIdService(aulaId);

  const titulo = data.titulo ?? aula.titulo;
  const descricao = data.descricao ?? aula.descricao;
  const conteudo = data.conteudo ?? aula.conteudo;
  const video_url = data.video_url ?? aula.video_url;
  const pdf_url = data.pdf_url ?? aula.pdf_url;
  const duracao = data.duracao ?? aula.duracao;
  const ordem = data.ordem ?? aula.ordem;
  const status = data.status ?? aula.status;

  await pool.query(
    `
      UPDATE aulas
      SET
        titulo = ?,
        descricao = ?,
        conteudo = ?,
        video_url = ?,
        pdf_url = ?,
        duracao = ?,
        ordem = ?,
        status = ?
      WHERE id = ?
    `,
    [
      titulo,
      descricao,
      conteudo,
      video_url,
      pdf_url,
      duracao,
      ordem,
      status,
      aulaId,
    ]
  );

  return {
    message: "Aula atualizada com sucesso",
  };
}

export async function deleteAulaService(aulaId: number) {
  await getAulaByIdService(aulaId);

  await pool.query(
    "DELETE FROM aulas WHERE id = ?",
    [aulaId]
  );

  return {
    message: "Aula deletada com sucesso",
  };
}

export async function completeAulaService(
  usuarioId: number,
  aulaId: number,
  segundosAssistidos = 0
) {
  await getAulaByIdService(aulaId);

  await pool.query(
    `
      INSERT INTO progresso_aulas (
        usuario_id,
        aula_id,
        concluida,
        segundos_assistidos
      )
      VALUES (?, ?, true, ?)
      ON DUPLICATE KEY UPDATE
        concluida = true,
        segundos_assistidos = VALUES(segundos_assistidos),
        atualizado_em = CURRENT_TIMESTAMP
    `,
    [
      usuarioId,
      aulaId,
      segundosAssistidos,
    ]
  );

  return {
    message: "Aula marcada como concluída",
  };
}