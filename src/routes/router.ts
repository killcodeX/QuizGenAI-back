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
  authMiddleware as RequestHandler,
  fetchPopularTopics as RequestHandler
);

router.post(
  "/history",
  authMiddleware as RequestHandler,
  fetchUserQuizHistory as RequestHandler
);

router.post(
  "/stats",
  authMiddleware as RequestHandler,
  getUserStats as RequestHandler
);

router.post(
  "/generate",
  authMiddleware as RequestHandler,
  quizHandle as RequestHandler
);

router.post(
  "/quizes",
  authMiddleware as RequestHandler,
  fetchQuiz as RequestHandler
);

router.post(
  "/save-quiz-result",
  authMiddleware as RequestHandler,
  saveQuizResult as RequestHandler
);

export default router;
