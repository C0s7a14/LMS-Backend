import { pool } from "../database/connection.js";

export async function getActivePromptRepository(deviceId?: number | null) {
  const [devicePrompts]: any = await pool.execute(
    `
    SELECT
      id,
      nome,
      conteudo,
      dispositivo_id,
      ativo
    FROM ai_prompts
    WHERE ativo = TRUE
    AND dispositivo_id = ?
    ORDER BY atualizado_em DESC
    LIMIT 1
    `,
    [deviceId || null]
  );

  if (devicePrompts.length > 0) {
    return devicePrompts[0];
  }

  const [globalPrompts]: any = await pool.execute(
    `
    SELECT
      id,
      nome,
      conteudo,
      dispositivo_id,
      ativo
    FROM ai_prompts
    WHERE ativo = TRUE
    AND dispositivo_id IS NULL
    ORDER BY atualizado_em DESC
    LIMIT 1
    `
  );

  return globalPrompts[0];
}

export async function searchRelevantChunksRepository(data: {
  dispositivo_id: number;
  pergunta: string;
  limit?: number;
}) {
  const limit = data.limit || 5;

  const [rows]: any = await pool.execute(
    `
    SELECT
      chunk.id,
      chunk.documento_id,
      chunk.dispositivo_id,
      chunk.conteudo,
      chunk.pagina,
      chunk.chunk_index,
      doc.titulo AS documento_titulo,
      doc.nome_arquivo_original
    FROM ai_document_chunks chunk
    INNER JOIN dispositivo_documentos doc
      ON doc.id = chunk.documento_id
    WHERE chunk.dispositivo_id = ?
    AND doc.ativo = TRUE
    AND MATCH(chunk.conteudo) AGAINST(? IN NATURAL LANGUAGE MODE)
    LIMIT ${limit}
    `,
    [data.dispositivo_id, data.pergunta]
  );

  if (rows.length > 0) {
    return rows;
  }

  const words = data.pergunta
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length >= 4)
    .slice(0, 5);

  if (words.length === 0) {
    return [];
  }

  const likeConditions = words.map(() => "chunk.conteudo LIKE ?").join(" OR ");
  const likeParams = words.map((word) => `%${word}%`);

  const [fallbackRows]: any = await pool.execute(
    `
    SELECT
      chunk.id,
      chunk.documento_id,
      chunk.dispositivo_id,
      chunk.conteudo,
      chunk.pagina,
      chunk.chunk_index,
      doc.titulo AS documento_titulo,
      doc.nome_arquivo_original
    FROM ai_document_chunks chunk
    INNER JOIN dispositivo_documentos doc
      ON doc.id = chunk.documento_id
    WHERE chunk.dispositivo_id = ?
    AND doc.ativo = TRUE
    AND (${likeConditions})
    LIMIT ${limit}
    `,
    [data.dispositivo_id, ...likeParams]
  );

  return fallbackRows;
}

export async function createAiConversationRepository(data: {
  usuario_id: number;
  dispositivo_id: number;
  titulo: string;
}) {
  const [result]: any = await pool.execute(
    `
    INSERT INTO ai_conversas (
      usuario_id,
      dispositivo_id,
      titulo
    ) VALUES (?, ?, ?)
    `,
    [data.usuario_id, data.dispositivo_id, data.titulo]
  );

  return {
    id: result.insertId,
    ...data,
  };
}

export async function getAiConversationByIdRepository(conversationId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      id,
      usuario_id,
      dispositivo_id,
      titulo,
      criado_em,
      atualizado_em
    FROM ai_conversas
    WHERE id = ?
    `,
    [conversationId]
  );

  return rows[0];
}

export async function createAiMessageRepository(data: {
  conversa_id: number;
  role: "user" | "assistant";
  conteudo: string;
}) {
  const [result]: any = await pool.execute(
    `
    INSERT INTO ai_mensagens (
      conversa_id,
      role,
      conteudo
    ) VALUES (?, ?, ?)
    `,
    [data.conversa_id, data.role, data.conteudo]
  );

  return {
    id: result.insertId,
    ...data,
  };
}

export async function getClientAiConversationsRepository(userId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      c.id,
      c.usuario_id,
      c.dispositivo_id,
      d.nome AS dispositivo_nome,
      c.titulo,
      c.criado_em,
      c.atualizado_em
    FROM ai_conversas c
    LEFT JOIN dispositivos d
      ON d.id = c.dispositivo_id
    WHERE c.usuario_id = ?
    ORDER BY c.atualizado_em DESC
    `,
    [userId]
  );

  return rows;
}

export async function getAiConversationMessagesRepository(data: {
  conversationId: number;
  userId: number;
}) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      msg.id,
      msg.conversa_id,
      msg.role,
      msg.conteudo,
      msg.criado_em
    FROM ai_mensagens msg
    INNER JOIN ai_conversas conv
      ON conv.id = msg.conversa_id
    WHERE msg.conversa_id = ?
    AND conv.usuario_id = ?
    ORDER BY msg.criado_em ASC
    `,
    [data.conversationId, data.userId]
  );

  return rows;
}