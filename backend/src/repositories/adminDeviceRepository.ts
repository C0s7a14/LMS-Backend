import { pool } from "../database/connection.js";

export async function findAdminDeviceByIdRepository(deviceId: number) {
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

export async function updateAdminDeviceRepository(
  deviceId: number,
  data: {
    nome: string;
    modelo?: string | null;
    tipo?: string | null;
    descricao?: string | null;
    imagem_url?: string | null;
  }
) {
  await pool.execute(
    `
    UPDATE dispositivos
    SET
      nome = ?,
      modelo = ?,
      tipo = ?,
      descricao = ?,
      imagem_url = ?
    WHERE id = ?
    `,
    [
      data.nome,
      data.modelo || null,
      data.tipo || null,
      data.descricao || null,
      data.imagem_url || null,
      deviceId,
    ]
  );

  return await findAdminDeviceByIdRepository(deviceId);
}

export async function deleteAdminDeviceRepository(deviceId: number) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `
      DELETE c
      FROM ai_document_chunks c
      INNER JOIN dispositivo_documentos d ON d.id = c.documento_id
      WHERE d.dispositivo_id = ?
      `,
      [deviceId]
    );

    await connection.execute(
      `
      DELETE FROM dispositivo_documentos
      WHERE dispositivo_id = ?
      `,
      [deviceId]
    );

    await connection.execute(
      `
      DELETE FROM cliente_dispositivos
      WHERE dispositivo_id = ?
      `,
      [deviceId]
    );

    await connection.execute(
      `
      DELETE FROM curso_dispositivos
      WHERE dispositivo_id = ?
      `,
      [deviceId]
    );

    await connection.execute(
      `
      DELETE FROM dispositivos
      WHERE id = ?
      `,
      [deviceId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}