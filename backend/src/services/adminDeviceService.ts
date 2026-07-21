import {
  deleteAdminDeviceRepository,
  findAdminDeviceByIdRepository,
  updateAdminDeviceRepository,
} from "../repositories/adminDeviceRepository.js";

interface UpdateAdminDeviceDTO {
  nome: string;
  modelo?: string;
  tipo?: string;
  descricao?: string;
  imagem_url?: string;
}

export async function updateAdminDeviceService(
  deviceId: number,
  data: UpdateAdminDeviceDTO
) {
  if (!deviceId || Number.isNaN(deviceId)) {
    throw new Error("Dispositivo inválido.");
  }

  if (!data.nome || !data.nome.trim()) {
    throw new Error("Informe o nome do dispositivo.");
  }

  const device = await findAdminDeviceByIdRepository(deviceId);

  if (!device) {
    throw new Error("Dispositivo não encontrado.");
  }

  const updatedDevice = await updateAdminDeviceRepository(deviceId, {
    nome: data.nome.trim(),
    modelo: data.modelo?.trim() || null,
    tipo: data.tipo?.trim() || null,
    descricao: data.descricao?.trim() || null,
    imagem_url: data.imagem_url?.trim() || null,
  });

  return updatedDevice;
}

export async function deleteAdminDeviceService(deviceId: number) {
  if (!deviceId || Number.isNaN(deviceId)) {
    throw new Error("Dispositivo inválido.");
  }

  const device = await findAdminDeviceByIdRepository(deviceId);

  if (!device) {
    throw new Error("Dispositivo não encontrado.");
  }

  await deleteAdminDeviceRepository(deviceId);

  return {
    message: "Dispositivo excluído com sucesso.",
  };
}