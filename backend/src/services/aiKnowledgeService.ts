import fs from "fs";
import { PDFParse } from "pdf-parse";

import {
  createAiPromptRepository,
  createDeviceDocumentRepository,
  deleteDeviceDocumentRepository,
  deleteDocumentChunksRepository,
  getAiKnowledgeSummaryRepository,
  getAiPromptsRepository,
  getDeviceDocumentsRepository,
  getDocumentByIdRepository,
  insertDocumentChunksRepository,
  updateAiPromptRepository,
  updateDocumentStatusRepository,
  getAiDevicesRepository,
} from "../repositories/aiKnowledgeRepository.js";

async function extractTextFromPdf(buffer: Buffer) {
  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

function splitTextIntoChunks(text: string, maxLength = 1200) {
  const cleanedText = text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: string[] = [];

  for (let index = 0; index < cleanedText.length; index += maxLength) {
    chunks.push(cleanedText.slice(index, index + maxLength));
  }

  return chunks;
}

export async function getAiPromptsService() {
  return await getAiPromptsRepository();
}

export async function createAiPromptService(data: {
  nome: string;
  conteudo: string;
  dispositivo_id?: number | null;
  ativo?: boolean;
  criado_por: number;
}) {
  if (!data.nome || !data.conteudo) {
    throw new Error("Nome e conteúdo do prompt são obrigatórios.");
  }

  return await createAiPromptRepository({
    nome: data.nome,
    conteudo: data.conteudo,
    dispositivo_id: data.dispositivo_id || null,
    ativo: data.ativo ?? true,
    criado_por: data.criado_por,
  });
}

export async function updateAiPromptService(
  promptId: number,
  data: {
    nome: string;
    conteudo: string;
    dispositivo_id?: number | null;
    ativo?: boolean;
  }
) {
  if (!data.nome || !data.conteudo) {
    throw new Error("Nome e conteúdo do prompt são obrigatórios.");
  }

  return await updateAiPromptRepository(promptId, {
    nome: data.nome,
    conteudo: data.conteudo,
    dispositivo_id: data.dispositivo_id || null,
    ativo: data.ativo ?? true,
  });
}

export async function getDeviceDocumentsService(deviceId: number) {
  return await getDeviceDocumentsRepository(deviceId);
}

export async function createDeviceDocumentService(data: {
  dispositivo_id: number;
  titulo: string;
  descricao?: string | null;
  arquivo_url: string;
  nome_arquivo_original: string;
  tipo_arquivo: string;
  tamanho_bytes?: number | null;
  criado_por: number;
}) {
  if (!data.dispositivo_id) {
    throw new Error("Dispositivo é obrigatório.");
  }

  if (!data.titulo) {
    throw new Error("Título do documento é obrigatório.");
  }

  if (!data.arquivo_url) {
    throw new Error("Arquivo PDF é obrigatório.");
  }

  return await createDeviceDocumentRepository(data);
}

export async function deleteDeviceDocumentService(documentId: number) {
  await deleteDeviceDocumentRepository(documentId);

  return {
    message: "Documento removido com sucesso.",
  };
}

export async function processDeviceDocumentService(documentId: number) {
  const document = await getDocumentByIdRepository(documentId);

  if (!document) {
    throw new Error("Documento não encontrado.");
  }

  if (!fs.existsSync(document.arquivo_url)) {
    await updateDocumentStatusRepository(documentId, "erro");
    throw new Error("Arquivo PDF não encontrado no servidor.");
  }

  try {
    const fileBuffer = fs.readFileSync(document.arquivo_url);
    const pdfText = await extractTextFromPdf(fileBuffer);

    const chunksText = splitTextIntoChunks(pdfText);

    await deleteDocumentChunksRepository(documentId);

    const chunks = chunksText.map((content, index) => ({
      documento_id: document.id,
      dispositivo_id: document.dispositivo_id,
      conteudo: content,
      pagina: null,
      chunk_index: index + 1,
    }));

    await insertDocumentChunksRepository(chunks);

    await updateDocumentStatusRepository(documentId, "processado");

    return {
      message: "Documento processado com sucesso.",
      documento_id: documentId,
      total_chunks: chunks.length,
    };
  } catch (error) {
    await updateDocumentStatusRepository(documentId, "erro");
    throw error;
  }
}

export async function getAiKnowledgeSummaryService() {
  const summary = await getAiKnowledgeSummaryRepository();

  return {
    totalPrompts: Number(summary?.totalPrompts || 0),
    totalDocumentos: Number(summary?.totalDocumentos || 0),
    totalChunks: Number(summary?.totalChunks || 0),
    totalConversas: Number(summary?.totalConversas || 0),
  };
}

export async function getAiDevicesService() {
  const devices = await getAiDevicesRepository();

  return devices.map((device: any) => ({
    id: device.id,
    nome: device.nome,
    modelo: device.modelo,
    tipo: device.tipo,
    descricao: device.descricao,
    imagem_url: device.imagem_url,
    criado_em: device.criado_em,

    total_documentos: Number(device.total_documentos || 0),
    documentos_processados: Number(device.documentos_processados || 0),
    total_chunks: Number(device.total_chunks || 0),
  }));
}