import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Example: Create a new quiz attempt
async function createQuizAttempt(userId: string, quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) throw new Error("Quiz not found");

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score: 0,
      totalPoints,
      isCompleted: false,
    },
  });
}

// Example: Submit an answer for a question
async function submitAnswer(
  attemptId: string,
  questionId: string,
  userAnswer: string
) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) throw new Error("Question not found");

  const isCorrect = question.correctAnswer === userAnswer;

  const answer = await prisma.answer.create({
    data: {
      attemptId,
      questionId,
      userAnswer,
      isCorrect,
    },
  });

  if (isCorrect) {
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: { increment: question.points },
      },
    });
  }

  return answer;
}

// Example: Complete a quiz attempt
async function completeQuizAttempt(attemptId: string) {
  return prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });
}

// Example: Get user statistics
async function getUserStatistics(userId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: { answers: true },
  });

  const totalQuizzes = attempts.length;
  const completedQuizzes = attempts.filter((a) => a.isCompleted).length;
  const allAnswers = attempts.flatMap((a) => a.answers);
  const correctAnswers = allAnswers.filter((a) => a.isCorrect).length;
  const wrongAnswers = allAnswers.length - correctAnswers;

  const averageAccuracy =
    allAnswers.length > 0 ? (correctAnswers / allAnswers.length) * 100 : 0;

  // Update or create user statistics
  return prisma.userStatistics.upsert({
    where: { userId },
    update: {
      totalQuizzes,
      completedQuizzes,
      correctAnswers,
      wrongAnswers,
      averageAccuracy,
      lastUpdated: new Date(),
    },
    create: {
      userId,
      totalQuizzes,
      completedQuizzes,
      correctAnswers,
      wrongAnswers,
      averageAccuracy,
    },
  });
}
