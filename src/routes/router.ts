import { Router, RequestHandler } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { quizHandle, fetchQuiz, saveQuizResult } from "../controllers/quiz";

import {
  fetchPopularTopics,
  fetchUserQuizHistory,
  getUserStats,
} from "../controllers/userStatsControler";

const router = Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.get(
  "/popular",
  authMiddleware as unknown as RequestHandler,
  fetchPopularTopics as unknown as RequestHandler
);

router.post(
  "/history",
  authMiddleware as unknown as RequestHandler,
  fetchUserQuizHistory as unknown as RequestHandler
);

router.post(
  "/stats",
  authMiddleware as unknown as RequestHandler,
  getUserStats as unknown as RequestHandler
);

router.post(
  "/generate",
  authMiddleware as unknown as RequestHandler,
  quizHandle as unknown as RequestHandler
);

router.post(
  "/quizes",
  authMiddleware as unknown as RequestHandler,
  fetchQuiz as unknown as RequestHandler
);

router.post(
  "/save-quiz-result",
  authMiddleware as unknown as RequestHandler,
  saveQuizResult as unknown as RequestHandler
);

export default router;
