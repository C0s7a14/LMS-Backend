import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../repositories/userRepository.js";

export async function getUsersService() {

  return await getUsers();
}

export async function getUserByIdService(
  id: number
) {

  const user =
    await getUserById(id);

  if (!user) {

    throw new Error(
      "Usuário não encontrado"
    );
  }

  return user;
}

export async function updateUserService(
  id: number,
  data: any
) {

  const user =
    await getUserById(id);

  if (!user) {

    throw new Error(
      "Usuário não encontrado"
    );
  }

  await updateUser(
    id,
    data
  );

  return {
    message:
      "Usuário atualizado com sucesso"
  };
}
export async function deleteUserService(
  id: number
) {

  const user =
    await getUserById(id);

  if (!user) {

    throw new Error(
      "Usuário não encontrado"
    );
  }

  await deleteUser(id);

  return {
    message:
      "Usuário deletado com sucesso"
  };
}