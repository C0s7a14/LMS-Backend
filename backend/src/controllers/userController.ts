
import { Request, Response } from "express";

import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService
} from "../services/userService.js";

export async function getUsersController(
  req: Request,
  res: Response
) {

  try {

    const users =
      await getUsersService();

    return res.json(users);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message
    });

  }
}

export async function getUserByIdController(
  req: Request,
  res: Response
) {

  try {

    const { id } = req.params;

    const user =
      await getUserByIdService(
        Number(id)
      );

    return res.json(user);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message
    });

  }
}

export async function updateUserController(
  req: Request,
  res: Response
) {

  try {

    const { id } = req.params;

    const {
      name,
      email,
      senha,
      role
    } = req.body;

    const result =
      await updateUserService(
        Number(id),
        {
          name,
          email,
          senha,
          role
        }
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message
    });

  }
}
export async function deleteUserController(
  req: Request,
  res: Response
) {

  try {

    const { id } = req.params;

    const result =
      await deleteUserService(
        Number(id)
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message
    });

  }
}