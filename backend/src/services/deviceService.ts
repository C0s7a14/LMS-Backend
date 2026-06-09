import {
  createDeviceRepository,
  getDevicesRepository,
  getDeviceByIdRepository,
  updateDeviceRepository,
  deleteDeviceRepository,
  attachDeviceToCourseRepository,
  findCourseDeviceRelationRepository,
  getDevicesByCourseRepository,
  detachDeviceFromCourseRepository
} from "../repositories/devicesRepository.js";

import {
  getCourseByIdRepository
} from "../repositories/courseRepository.js";

export async function createDeviceService(data: any) {
  const {
    nome
  } = data;

  if (!nome) {
    throw new Error("Nome do dispositivo é obrigatório");
  }

  const result = await createDeviceRepository(data);

  return {
    message: "Dispositivo criado com sucesso",
    deviceId: result.insertId
  };
}

export async function getDevicesService() {
  return await getDevicesRepository();
}

export async function getDeviceByIdService(id: number) {
  const device = await getDeviceByIdRepository(id);

  if (!device) {
    throw new Error("Dispositivo não encontrado");
  }

  return device;
}

export async function updateDeviceService(
  id: number,
  data: any
) {
  const device = await getDeviceByIdRepository(id);

  if (!device) {
    throw new Error("Dispositivo não encontrado");
  }

  await updateDeviceRepository(
    id,
    data
  );

  return {
    message: "Dispositivo atualizado com sucesso"
  };
}

export async function deleteDeviceService(id: number) {
  const device = await getDeviceByIdRepository(id);

  if (!device) {
    throw new Error("Dispositivo não encontrado");
  }

  await deleteDeviceRepository(id);

  return {
    message: "Dispositivo deletado com sucesso"
  };
}

export async function attachDeviceToCourseService(
  curso_id: number,
  dispositivo_id: number
) {
  const course = await getCourseByIdRepository(curso_id);

  if (!course) {
    throw new Error("Curso não encontrado");
  }

  const device = await getDeviceByIdRepository(dispositivo_id);

  if (!device) {
    throw new Error("Dispositivo não encontrado");
  }

  const relation =
    await findCourseDeviceRelationRepository(
      curso_id,
      dispositivo_id
    );

  if (relation) {
    throw new Error("Este dispositivo já está associado a este curso");
  }

  await attachDeviceToCourseRepository(
    curso_id,
    dispositivo_id
  );

  return {
    message: "Dispositivo associado ao curso com sucesso"
  };
}

export async function getDevicesByCourseService(
  curso_id: number
) {
  const course = await getCourseByIdRepository(curso_id);

  if (!course) {
    throw new Error("Curso não encontrado");
  }

  return await getDevicesByCourseRepository(curso_id);
}

export async function detachDeviceFromCourseService(
  curso_id: number,
  dispositivo_id: number
) {
  const relation =
    await findCourseDeviceRelationRepository(
      curso_id,
      dispositivo_id
    );

  if (!relation) {
    throw new Error("Associação entre curso e dispositivo não encontrada");
  }

  await detachDeviceFromCourseRepository(
    curso_id,
    dispositivo_id
  );

  return {
    message: "Dispositivo removido do curso com sucesso"
  };
}