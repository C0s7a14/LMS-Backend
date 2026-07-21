import {
  fileExists,
  findClientByIdRepository,
  findClientDeviceDetailsRepository,
  findClientDeviceDocumentForDownloadRepository,
  findDeviceByIdRepository,
  getAdminClientDevicesRepository,
  getClientDevicesRepository,
  linkDeviceToClientRepository,
  listClientDeviceDocumentsRepository,
  resolveDocumentPath,
  unlinkDeviceFromClientRepository,
} from "../repositories/clientDeviceRepository.js";

export async function getClientDevicesService(clientId: number) {
  if (!clientId || Number.isNaN(clientId)) {
    throw new Error("Cliente inválido.");
  }

  const devices = await getClientDevicesRepository(clientId);

  return devices;
}

export async function getAdminClientDevicesService(clientId: number) {
  if (!clientId || Number.isNaN(clientId)) {
    throw new Error("Cliente inválido.");
  }

  const client = await findClientByIdRepository(clientId);

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  const devices = await getAdminClientDevicesRepository(clientId);

  return devices;
}

export async function linkDeviceToClientService(
  clientId: number,
  deviceId: number
) {
  if (!clientId || Number.isNaN(clientId)) {
    throw new Error("Cliente inválido.");
  }

  if (!deviceId || Number.isNaN(deviceId)) {
    throw new Error("Dispositivo inválido.");
  }

  const client = await findClientByIdRepository(clientId);

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  const device = await findDeviceByIdRepository(deviceId);

  if (!device) {
    throw new Error("Dispositivo não encontrado.");
  }

  await linkDeviceToClientRepository(clientId, deviceId);

  return {
    message: "Dispositivo vinculado ao cliente com sucesso.",
  };
}

export async function unlinkDeviceFromClientService(
  clientId: number,
  deviceId: number
) {
  if (!clientId || Number.isNaN(clientId)) {
    throw new Error("Cliente inválido.");
  }

  if (!deviceId || Number.isNaN(deviceId)) {
    throw new Error("Dispositivo inválido.");
  }

  await unlinkDeviceFromClientRepository(clientId, deviceId);

  return {
    message: "Dispositivo removido do cliente com sucesso.",
  };
}

export async function getClientDeviceDetailsService(
  clientId: number,
  deviceId: number
) {
  if (!deviceId || Number.isNaN(deviceId)) {
    throw new Error("Dispositivo inválido.");
  }

  const device = await findClientDeviceDetailsRepository(clientId, deviceId);

  if (!device) {
    throw new Error("Dispositivo não encontrado ou não vinculado ao cliente.");
  }

  return device;
}

export async function listClientDeviceDocumentsService(
  clientId: number,
  deviceId: number
) {
  const device = await findClientDeviceDetailsRepository(clientId, deviceId);

  if (!device) {
    throw new Error("Dispositivo não encontrado ou não vinculado ao cliente.");
  }

  const documents = await listClientDeviceDocumentsRepository(clientId, deviceId);

  return documents;
}

export async function getClientDeviceDocumentDownloadService(
  clientId: number,
  documentId: number
) {
  if (!documentId || Number.isNaN(documentId)) {
    throw new Error("Documento inválido.");
  }

  const document = await findClientDeviceDocumentForDownloadRepository(
    clientId,
    documentId
  );

  if (!document) {
    throw new Error("Documento não encontrado ou sem permissão de acesso.");
  }

  const savedPath =
  document.caminho_arquivo ||
  document.arquivo_path ||
  document.file_path ||
  document.path ||
  document.caminho ||
  document.url_arquivo ||
  document.arquivo_url ||
  document.nome_arquivo_salvo ||
  document.nome_arquivo_original;

const filePath = resolveDocumentPath(savedPath);

if (!fileExists(filePath)) {
  console.log("Documento encontrado no banco:", document);
  console.log("Caminho usado para buscar o arquivo:", savedPath);
  console.log("Caminho resolvido:", filePath);

  throw new Error("Arquivo não encontrado no servidor.");
}

  return {
    document,
    filePath,
  };
}