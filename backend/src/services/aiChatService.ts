import axios from "axios";

import {
  createAiConversationRepository,
  createAiMessageRepository,
  getActivePromptRepository,
  getAiConversationByIdRepository,
  getAiConversationMessagesRepository,
  getClientAiConversationsRepository,
  searchRelevantChunksRepository,
} from "../repositories/aiChatRepository.js";

function buildContext(chunks: any[]) {
  return chunks
    .map((chunk, index) => {
      return `
[Fonte ${index + 1}]
Documento: ${chunk.documento_titulo}
Arquivo: ${chunk.nome_arquivo_original}
Trecho:
${chunk.conteudo}
`;
    })
    .join("\n\n");
}

async function generateAiAnswer(data: {
  prompt: string;
  pergunta: string;
  contexto: string;
}) {
  const aiApiUrl = process.env.AI_API_URL;

  if (!data.contexto.trim()) {
    return "Não encontrei essa informação na base técnica disponível para este dispositivo.";
  }

  if (!aiApiUrl) {
    return `Com base nos documentos técnicos cadastrados, encontrei estes trechos relacionados à sua pergunta:\n\n${data.contexto.slice(
      0,
      1800
    )}`;
  }

  const response = await axios.post(`${aiApiUrl}/ai/chat`, {
    prompt: data.prompt,
    question: data.pergunta,
    context: data.contexto,
  });

  return response.data?.answer || response.data?.resposta || "";
}

export async function sendClientAiMessageService(data: {
  usuario_id: number;
  dispositivo_id: number;
  pergunta: string;
  conversa_id?: number | null;
}) {
  if (!data.dispositivo_id) {
    throw new Error("Dispositivo é obrigatório.");
  }

  if (!data.pergunta?.trim()) {
    throw new Error("Pergunta é obrigatória.");
  }

  const prompt = await getActivePromptRepository(data.dispositivo_id);

  if (!prompt) {
    throw new Error("Nenhum prompt ativo encontrado para o agente IA.");
  }

  const chunks = await searchRelevantChunksRepository({
    dispositivo_id: data.dispositivo_id,
    pergunta: data.pergunta,
    limit: 5,
  });

  const contexto = buildContext(chunks);

  let conversationId = data.conversa_id || null;

  if (conversationId) {
    const conversation = await getAiConversationByIdRepository(conversationId);

    if (!conversation || conversation.usuario_id !== data.usuario_id) {
      throw new Error("Conversa não encontrada.");
    }
  }

  if (!conversationId) {
    const title =
      data.pergunta.length > 60
        ? `${data.pergunta.slice(0, 60)}...`
        : data.pergunta;

    const conversation = await createAiConversationRepository({
      usuario_id: data.usuario_id,
      dispositivo_id: data.dispositivo_id,
      titulo: title,
    });

    conversationId = conversation.id;
  }

  await createAiMessageRepository({
    conversa_id: conversationId,
    role: "user",
    conteudo: data.pergunta,
  });

  const resposta = await generateAiAnswer({
    prompt: prompt.conteudo,
    pergunta: data.pergunta,
    contexto,
  });

  await createAiMessageRepository({
    conversa_id: conversationId,
    role: "assistant",
    conteudo: resposta,
  });

  return {
    conversa_id: conversationId,
    resposta,
    fontes: chunks.map((chunk) => ({
      documento_id: chunk.documento_id,
      documento_titulo: chunk.documento_titulo,
      nome_arquivo_original: chunk.nome_arquivo_original,
      pagina: chunk.pagina,
      chunk_index: chunk.chunk_index,
    })),
  };
}

export async function getClientAiConversationsService(userId: number) {
  return await getClientAiConversationsRepository(userId);
}

export async function getAiConversationMessagesService(data: {
  conversationId: number;
  userId: number;
}) {
  return await getAiConversationMessagesRepository(data);
}