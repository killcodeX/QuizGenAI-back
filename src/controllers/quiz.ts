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
    const { topic_id, quiz_id } = req.body;

    // 1. If quiz_id is provided (fetch from history)
    if (quiz_id) {
      const quiz = await prisma.quiz.findUnique({
        where: {
          id: quiz_id,
          isPublished: true,
        },
        include: {
          topic: true,
          questions: {
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      });

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const formattedQuestions = quiz.questions.map((question) => {
        let options;

        try {
          if (typeof question.options === "string") {
            options = JSON.parse(question.options);
          } else {
            options = question.options;
          }
        } catch (error) {
          console.error("Error parsing options:", error);
          options = [];
        }

        return {
          type: "multiple",
          category: quiz.topic.name,
          questionId: question.id,
          question: question.text,
          correct_answer: question.correctAnswer,
          options,
        };
      });

      return res.status(200).json({
        topic: quiz.topic.name,
        quizId: quiz.id,
        title: quiz.title,
        questions: formattedQuestions,
      });
    }

    // 2. If topic_id is provided (generate new quiz)
    if (!topic_id) {
      return res
        .status(400)
        .json({ message: "Topic ID or Quiz ID is required" });
    }

    // Find a random quiz for the given topic
    const quizzes = await prisma.quiz.findMany({
      where: {
        topicId: topic_id,
        isPublished: true,
      },
      include: {
        topic: true,
        questions: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!quizzes || quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No published quiz found for this topic" });
    }

    // Pick a random quiz
    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

    const formattedQuestions = randomQuiz.questions.map((question) => {
      let options;

      try {
        if (typeof question.options === "string") {
          options = JSON.parse(question.options);
        } else {
          options = question.options;
        }
      } catch (error) {
        console.error("Error parsing options:", error);
        options = [];
      }

      return {
        type: "multiple",
        category: randomQuiz.topic.name,
        questionId: question.id,
        question: question.text,
        correct_answer: question.correctAnswer,
        options,
      };
    });

    return res.status(200).json({
      topic: randomQuiz.topic.name,
      quizId: randomQuiz.id,
      title: randomQuiz.title,
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
    const { userId, quizId, score, totalPoints, selectedAnswers } = req.body;
    // console.log(
    //   "Saving quiz result:",
    //   userId,
    //   quizId,
    //   score,
    //   totalPoints,
    //   selectedAnswers
    // );

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields
    if (
      !userId ||
      !quizId ||
      score === undefined ||
      !totalPoints ||
      !selectedAnswers ||
      typeof selectedAnswers !== "object"
    ) {
      return res.status(400).json({
        message:
          "Missing required fields. Please provide userId, quizId, score, totalPoints, and selectedAnswers object.",
      });
    }

    // Create the quiz attempt record first
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        totalPoints,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Then add each answer separately
    const answerPromises = Object.entries(selectedAnswers).map(
      async ([questionId, answerIndex]) => {
        // Find corresponding question
        const question = await prisma.question.findUnique({
          where: { id: questionId },
        });

        if (!question) {
          console.warn(`Question ${questionId} not found`);
          return null;
        }

        // Parse options
        let options;
        try {
          if (typeof question.options === "string") {
            options = JSON.parse(question.options);
          } else {
            options = question.options;
          }
        } catch (error) {
          console.error(`Failed to parse options for question ${questionId}`);
          return null;
        }

        // Get selected answer text using the index
        const userAnswer =
          Array.isArray(options) && options[answerIndex as number]
            ? options[answerIndex as number]
            : "Unknown";

        // Check if answer is correct
        const isCorrect = userAnswer === question.correctAnswer;

        // Create the answer record
        return prisma.answer.create({
          data: {
            attemptId: quizAttempt.id,
            questionId,
            userAnswer,
            isCorrect,
          },
        });
      }
    );

    // Wait for all answers to be created
    const answers = await Promise.all(answerPromises);

    // Get the complete attempt with answers
    const completeAttempt = await prisma.quizAttempt.findUnique({
      where: { id: quizAttempt.id },
      include: { answers: true },
    });

    res.status(201).json({
      message: "Quiz result saved successfully",
      attempt: completeAttempt,
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    res.status(500).json({
      message: "Error saving quiz result",
      error: (error as Error).message,
    });
  }
};
