import type { Request, Response, NextFunction } from "express";

import {
  getAiConversationMessagesService,
  getClientAiConversationsService,
  sendClientAiMessageService,
} from "../services/aiChatService.js";

export async function sendClientAiMessageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    const { dispositivo_id, pergunta, conversa_id } = req.body;

    const result = await sendClientAiMessageService({
      usuario_id: userId,
      dispositivo_id: Number(dispositivo_id),
      pergunta,
      conversa_id: conversa_id ? Number(conversa_id) : null,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getClientAiConversationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    const conversations = await getClientAiConversationsService(userId);

    return res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
}

export async function getAiConversationMessagesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    const conversationId = Number(req.params.conversationId);

    const messages = await getAiConversationMessagesService({
      conversationId,
      userId,
    });

    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}