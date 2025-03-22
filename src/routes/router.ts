import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import authMiddleware from "../middleware/authMiddleware";
import { quizHandle } from "../controllers/openaiService";

const router = Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.get(
  "/protected",
  authMiddleware as RequestHandler,
  (async (req: Request, res: Response) => {
    res.json({ message: "Hello World" });
  }) as RequestHandler
);

router.post(
  "/generate",
  authMiddleware as RequestHandler,
  quizHandle as RequestHandler
);

export default router;
