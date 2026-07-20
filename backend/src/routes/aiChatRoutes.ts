import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  getAiConversationMessagesController,
  getClientAiConversationsController,
  sendClientAiMessageController,
} from "../controllers/aiChatController.js";

const router = Router();

router.post(
  "/client/ai/chat",
  authMiddleware,
  roleMiddleware(["client", "admin"]),
  sendClientAiMessageController
);

router.get(
  "/client/ai/conversations",
  authMiddleware,
  roleMiddleware(["client", "admin"]),
  getClientAiConversationsController
);

router.get(
  "/client/ai/conversations/:conversationId",
  authMiddleware,
  roleMiddleware(["client", "admin"]),
  getAiConversationMessagesController
);

export default router;