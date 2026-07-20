import {
  getClientDevicesRepository,
  linkDeviceToClientRepository,
  unlinkDeviceFromClientRepository,
} from "../repositories/clientDeviceRepository.js";

export async function getClientDevicesService(clientId: number) {
  return await getClientDevicesRepository(clientId);
}

export async function linkDeviceToClientService(
  clientId: number,
  deviceId: number
) {
  if (!clientId || !deviceId) {
    throw new Error("Cliente e dispositivo são obrigatórios.");
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
  if (!clientId || !deviceId) {
    throw new Error("Cliente e dispositivo são obrigatórios.");
  }

  await unlinkDeviceFromClientRepository(clientId, deviceId);

  return {
    message: "Dispositivo removido do cliente com sucesso.",
  };
}