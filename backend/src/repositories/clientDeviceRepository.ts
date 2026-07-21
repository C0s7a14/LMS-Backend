import fs from "fs";
import path from "path";
import { pool } from "../database/connection.js";

export async function findClientByIdRepository(clientId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      id,
      name,
      email,
      role
    FROM users
    WHERE id = ?
      AND role = 'client'
    LIMIT 1
    `,
    [clientId]
  );

  return rows[0];
}

export async function findDeviceByIdRepository(deviceId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      id,
      nome,
      modelo,
      tipo,
      descricao,
      imagem_url,
      criado_em
    FROM dispositivos
    WHERE id = ?
    LIMIT 1
    `,
    [deviceId]
  );

  return rows[0];
}

export async function getClientDevicesRepository(clientId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      d.id,
      d.nome,
      d.modelo,
      d.tipo,
      d.descricao,
      d.imagem_url,
      d.criado_em
    FROM dispositivos d
    INNER JOIN cliente_dispositivos cd
      ON cd.dispositivo_id = d.id
    WHERE cd.cliente_id = ?
    ORDER BY d.nome ASC
    `,
    [clientId]
  );

  return rows;
}

export async function getAdminClientDevicesRepository(clientId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      d.id,
      d.nome,
      d.modelo,
      d.tipo,
      d.descricao,
      d.imagem_url,
      d.criado_em
    FROM dispositivos d
    INNER JOIN cliente_dispositivos cd
      ON cd.dispositivo_id = d.id
    WHERE cd.cliente_id = ?
    ORDER BY d.nome ASC
    `,
    [clientId]
  );

  return rows;
}

export async function linkDeviceToClientRepository(
  clientId: number,
  deviceId: number
) {
  await pool.execute(
    `
    INSERT IGNORE INTO cliente_dispositivos (
      cliente_id,
      dispositivo_id
    )
    VALUES (?, ?)
    `,
    [clientId, deviceId]
  );
}

export async function unlinkDeviceFromClientRepository(
  clientId: number,
  deviceId: number
) {
  await pool.execute(
    `
    DELETE FROM cliente_dispositivos
    WHERE cliente_id = ?
      AND dispositivo_id = ?
    `,
    [clientId, deviceId]
  );
}

export async function findClientDeviceDetailsRepository(
  clientId: number,
  deviceId: number
) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      d.id,
      d.nome,
      d.modelo,
      d.tipo,
      d.descricao,
      d.imagem_url,
      d.criado_em
    FROM dispositivos d
    INNER JOIN cliente_dispositivos cd
      ON cd.dispositivo_id = d.id
    WHERE d.id = ?
      AND cd.cliente_id = ?
    LIMIT 1
    `,
    [deviceId, clientId]
  );

  return rows[0];
}

export async function listClientDeviceDocumentsRepository(
  clientId: number,
  deviceId: number
) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      doc.id,
      doc.dispositivo_id,
      doc.titulo,
      doc.descricao,
      doc.nome_arquivo_original,
      doc.status,
      doc.criado_em,
      COUNT(chunks.id) AS total_chunks
    FROM dispositivo_documentos doc
    INNER JOIN cliente_dispositivos cd
      ON cd.dispositivo_id = doc.dispositivo_id
    LEFT JOIN ai_document_chunks chunks
      ON chunks.documento_id = doc.id
    WHERE doc.dispositivo_id = ?
      AND cd.cliente_id = ?
    GROUP BY
      doc.id,
      doc.dispositivo_id,
      doc.titulo,
      doc.descricao,
      doc.nome_arquivo_original,
      doc.status,
      doc.criado_em
    ORDER BY doc.criado_em DESC
    `,
    [deviceId, clientId]
  );

  return rows;
}

export async function findClientDeviceDocumentForDownloadRepository(
  clientId: number,
  documentId: number
) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      doc.*
    FROM dispositivo_documentos doc
    INNER JOIN cliente_dispositivos cd
      ON cd.dispositivo_id = doc.dispositivo_id
    WHERE doc.id = ?
      AND cd.cliente_id = ?
    LIMIT 1
    `,
    [documentId, clientId]
  );

  return rows[0];
}

export function resolveDocumentPath(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, "/");

  const possiblePaths = [
    filePath,

    path.resolve(process.cwd(), filePath),

    path.resolve(process.cwd(), normalizedPath),

    path.resolve(process.cwd(), normalizedPath.replace(/^\/+/, "")),

    path.resolve(
      process.cwd(),
      "uploads",
      "ai-documents",
      path.basename(normalizedPath)
    ),
  ];

  const existingPath = possiblePaths.find((candidatePath) =>
    fs.existsSync(candidatePath)
  );

  return existingPath || path.resolve(process.cwd(), normalizedPath);
}

export function fileExists(filePath: string) {
  return fs.existsSync(filePath);
}