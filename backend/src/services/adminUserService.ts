import {
  findUserByIdRepository,
  updateUserRoleRepository,
} from "../repositories/adminUserRepository.js";

const allowedRoles = ["student", "client", "admin"] as const;

type UserRole = (typeof allowedRoles)[number];

export async function updateUserRoleService(
  userId: number,
  role: string,
  authenticatedUserId?: number
) {
  if (!userId) {
    throw new Error("Usuário não informado.");
  }

  if (!allowedRoles.includes(role as UserRole)) {
    throw new Error("Role inválida.");
  }

  const user = await findUserByIdRepository(userId);

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  if (authenticatedUserId && authenticatedUserId === userId && role !== "admin") {
    throw new Error("Você não pode remover sua própria permissão de administrador.");
  }

  await updateUserRoleRepository(userId, role as UserRole);

  const updatedUser = await findUserByIdRepository(userId);

  return {
    message: "Role do usuário atualizada com sucesso.",
    user: updatedUser,
  };
}