import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { generateQuizQuestions } from "../service/openaiService";

export const quizHandle = async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    console.log(topic);

    // const questions = await generateQuizQuestions(topic, 5);
    //res.json({ topic, questions });
    res.status(200).json({ topic });
  } catch (error) {
    res.status(500).json({ message: "Error generating quiz", error });
  }
};

export const fetchQuiz = async (req: Request, res: Response) => {
  try {
    const { topic_id } = req.body;
    if (!topic_id)
      return res.status(400).json({ message: "Topic ID is required" });

    // Fetch the topic to ensure it exists
    const topic = await prisma.topic.findUnique({
      where: { id: topic_id },
    });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Fetch quizzes with their questions for the given topic
    const quizzes = await prisma.quiz.findMany({
      where: {
        topicId: topic_id,
        isPublished: true,
      },
      include: {
        questions: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    console.log(quizzes[0].questions);
    if (quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found for this topic" });
    }

    // Transform data to match the desired format
    const formattedQuestions = quizzes.flatMap((quiz) => {
      return quiz.questions.map((question) => {
        // Parse options string into array
        let options;

        try {
          // Handle the exact format you provided
          if (typeof question.options === "string") {
            options = JSON.parse(question.options);
          } else {
            // Already parsed by Prisma into an object/array
            options = question.options;
          }
        } catch (error) {
          console.error("Error parsing options:", error, question.options);
          options = [];
        }

        return {
          type: "multiple", // You might want to make this dynamic if you have different question types
          category: topic.name,
          question: question.text,
          correct_answer: question.correctAnswer,
          options: options,
          // You can include additional fields if needed
        };
      });
    });

    res.status(200).json({
      topic: topic.name,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({
      message: "Error fetching quiz",
      error: (error as Error).message,
    });
  }
};

export const saveQuizResult = async (req: Request, res: Response) => {
  try {
    const { userId, quizId, score, totalPoints, answers } = req.body;

    // Validate required fields
    if (
      !userId ||
      !quizId ||
      score === undefined ||
      !totalPoints ||
      !answers ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        message:
          "Missing required fields. Please provide userId, quizId, score, totalPoints, and answers array.",
      });
    }
  } catch (error) {
    console.error("Error saving quiz result:", error);
    res.status(500).json({
      message: "Error saving quiz result",
      error: (error as Error).message,
    });
  }
};
