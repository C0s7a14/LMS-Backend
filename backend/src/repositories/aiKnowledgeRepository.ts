import { pool } from "../database/connection.js";

export async function getAiPromptsRepository() {
  const [rows]: any = await pool.execute(
    `
    SELECT
      p.id,
      p.nome,
      p.conteudo,
      p.dispositivo_id,
      d.nome AS dispositivo_nome,
      p.ativo,
      p.criado_por,
      u.name AS criado_por_nome,
      p.criado_em,
      p.atualizado_em
    FROM ai_prompts p
    LEFT JOIN dispositivos d
      ON d.id = p.dispositivo_id
    INNER JOIN users u
      ON u.id = p.criado_por
    ORDER BY p.ativo DESC, p.atualizado_em DESC
    `
  );

  return rows;
}

export async function createAiPromptRepository(data: {
  nome: string;
  conteudo: string;
  dispositivo_id?: number | null;
  ativo: boolean;
  criado_por: number;
}) {
  const [result]: any = await pool.execute(
    `
    INSERT INTO ai_prompts (
      nome,
      conteudo,
      dispositivo_id,
      ativo,
      criado_por
    ) VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.nome,
      data.conteudo,
      data.dispositivo_id || null,
      data.ativo,
      data.criado_por,
    ]
  );

  return {
    id: result.insertId,
    ...data,
  };
}

export async function updateAiPromptRepository(
  promptId: number,
  data: {
    nome: string;
    conteudo: string;
    dispositivo_id?: number | null;
    ativo: boolean;
  }
) {
  await pool.execute(
    `
    UPDATE ai_prompts
    SET
      nome = ?,
      conteudo = ?,
      dispositivo_id = ?,
      ativo = ?
    WHERE id = ?
    `,
    [
      data.nome,
      data.conteudo,
      data.dispositivo_id || null,
      data.ativo,
      promptId,
    ]
  );

  return {
    id: promptId,
    ...data,
  };
}

export async function getDeviceDocumentsRepository(deviceId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      doc.id,
      doc.dispositivo_id,
      d.nome AS dispositivo_nome,
      doc.titulo,
      doc.descricao,
      doc.nome_arquivo_original,
      doc.arquivo_url,
      doc.tipo_arquivo,
      doc.tamanho_bytes,
      doc.status,
      doc.ativo,
      doc.criado_por,
      u.name AS criado_por_nome,
      doc.criado_em,
      doc.atualizado_em,
      COALESCE(chunks.total_chunks, 0) AS total_chunks
    FROM dispositivo_documentos doc
    INNER JOIN dispositivos d
      ON d.id = doc.dispositivo_id
    INNER JOIN users u
      ON u.id = doc.criado_por
    LEFT JOIN (
      SELECT
        documento_id,
        COUNT(*) AS total_chunks
      FROM ai_document_chunks
      GROUP BY documento_id
    ) chunks
      ON chunks.documento_id = doc.id
    WHERE doc.dispositivo_id = ?
    ORDER BY doc.criado_em DESC
    `,
    [deviceId]
  );

  return rows;
}

export async function getDocumentByIdRepository(documentId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      id,
      dispositivo_id,
      titulo,
      descricao,
      nome_arquivo_original,
      arquivo_url,
      tipo_arquivo,
      tamanho_bytes,
      status,
      ativo,
      criado_por,
      criado_em,
      atualizado_em
    FROM dispositivo_documentos
    WHERE id = ?
    `,
    [documentId]
  );

  return rows[0];
}

export async function createDeviceDocumentRepository(data: {
  dispositivo_id: number;
  titulo: string;
  descricao?: string | null;
  nome_arquivo_original: string;
  arquivo_url: string;
  tipo_arquivo: string;
  tamanho_bytes?: number | null;
  criado_por: number;
}) {
  const [result]: any = await pool.execute(
    `
    INSERT INTO dispositivo_documentos (
      dispositivo_id,
      titulo,
      descricao,
      nome_arquivo_original,
      arquivo_url,
      tipo_arquivo,
      tamanho_bytes,
      status,
      ativo,
      criado_por
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', TRUE, ?)
    `,
    [
      data.dispositivo_id,
      data.titulo,
      data.descricao || null,
      data.nome_arquivo_original,
      data.arquivo_url,
      data.tipo_arquivo,
      data.tamanho_bytes || null,
      data.criado_por,
    ]
  );

  return {
    id: result.insertId,
    ...data,
    status: "pendente",
    ativo: true,
  };
}

export async function deleteDeviceDocumentRepository(documentId: number) {
  await pool.execute(
    `
    DELETE FROM dispositivo_documentos
    WHERE id = ?
    `,
    [documentId]
  );
}

export async function deleteDocumentChunksRepository(documentId: number) {
  await pool.execute(
    `
    DELETE FROM ai_document_chunks
    WHERE documento_id = ?
    `,
    [documentId]
  );
}

export async function insertDocumentChunksRepository(
  chunks: {
    documento_id: number;
    dispositivo_id: number;
    conteudo: string;
    pagina?: number | null;
    chunk_index: number;
  }[]
) {
  if (chunks.length === 0) {
    return;
  }

  const values = chunks.map(() => "(?, ?, ?, ?, ?)").join(", ");

  const params = chunks.flatMap((chunk) => [
    chunk.documento_id,
    chunk.dispositivo_id,
    chunk.conteudo,
    chunk.pagina || null,
    chunk.chunk_index,
  ]);

  await pool.execute(
    `
    INSERT INTO ai_document_chunks (
      documento_id,
      dispositivo_id,
      conteudo,
      pagina,
      chunk_index
    ) VALUES ${values}
    `,
    params
  );
}

export async function updateDocumentStatusRepository(
  documentId: number,
  status: "pendente" | "processado" | "erro"
) {
  await pool.execute(
    `
    UPDATE dispositivo_documentos
    SET status = ?
    WHERE id = ?
    `,
    [status, documentId]
  );
}

export async function getAiKnowledgeSummaryRepository() {
  const [rows]: any = await pool.execute(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM ai_prompts
        WHERE ativo = TRUE
      ) AS totalPrompts,

      (
        SELECT COUNT(*)
        FROM dispositivo_documentos
        WHERE ativo = TRUE
      ) AS totalDocumentos,

      (
        SELECT COUNT(*)
        FROM ai_document_chunks
      ) AS totalChunks,

      (
        SELECT COUNT(*)
        FROM ai_conversas
      ) AS totalConversas
    `
  );

  return rows[0];
}


export async function getAiDevicesRepository() {
  const [rows]: any = await pool.execute(
    `
    SELECT
      d.id,
      d.nome,
      d.modelo,
      d.tipo,
      d.descricao,
      d.imagem_url,
      d.criado_em,

      COALESCE(documents.total_documentos, 0) AS total_documentos,
      COALESCE(documents.documentos_processados, 0) AS documentos_processados,
      COALESCE(chunks.total_chunks, 0) AS total_chunks

    FROM dispositivos d

    LEFT JOIN (
      SELECT
        dispositivo_id,
        COUNT(*) AS total_documentos,
        SUM(
          CASE
            WHEN status = 'processado' THEN 1
            ELSE 0
          END
        ) AS documentos_processados
      FROM dispositivo_documentos
      WHERE ativo = TRUE
      GROUP BY dispositivo_id
    ) documents
      ON documents.dispositivo_id = d.id

    LEFT JOIN (
      SELECT
        dispositivo_id,
        COUNT(*) AS total_chunks
      FROM ai_document_chunks
      GROUP BY dispositivo_id
    ) chunks
      ON chunks.dispositivo_id = d.id

    ORDER BY d.id DESC
    `
  );

  return rows;
}