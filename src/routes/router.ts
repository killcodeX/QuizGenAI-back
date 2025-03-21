import { Router, Request, Response, NextFunction } from "express";

const router = Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.get(
  "/protected",
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World" });
  }
);

export default router;
