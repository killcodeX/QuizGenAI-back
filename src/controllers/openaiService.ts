import { Request, Response, NextFunction } from "express";
import { generateQuizQuestions } from "../service/openaiService";

export const quizHandle = async (req: Request, res: Response) => {
  try {
    const { topic, numQuestions } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const questions = await generateQuizQuestions(topic, numQuestions || 5);
    res.json({ topic, questions });
  } catch (error) {
    res.status(500).json({ message: "Error generating quiz", error });
  }
};
