import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface TopicStat {
  id: string;
  name: string;
  description: string | null;
  attemptCount: bigint;
  userCount: bigint;
}

interface TopicDistribution {
  id: string;
  name: string;
  count: bigint;
}

export const fetchUserQuizHistory = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Fetch all quiz attempts for the user with related quiz information
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    // Format the quiz history in the requested format
    const formattedQuizHistory = quizAttempts.map((attempt) => {
      // Format the score as "X/Y"
      const scoreFormatted = `${attempt.score}/${attempt.totalPoints}`;

      // Format the date
      const dateFormatted = new Date(
        attempt.completedAt || attempt.startedAt
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      return {
        id: attempt.id, // This is the attempt ID
        quizId: attempt.quiz.id, // ADDED: Include the actual quiz ID
        title: attempt.quiz.title,
        score: scoreFormatted,
        date: dateFormatted,
      };
    });

    res.status(200).json({
      success: true,
      quizHistory: formattedQuizHistory,
    });
  } catch (error: any) {
    console.error("Error fetching user quiz history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const fetchPopularTopics = async (req: Request, res: Response) => {
  try {
    // Get all quiz attempts with their related quizzes and topics
    const quizAttempts = await prisma.quizAttempt.findMany({
      include: {
        quiz: {
          include: {
            topic: true,
          },
        },
      },
    });

    // Count attempts by topic
    const topicCountMap = new Map();
    const topicUserMap = new Map();

    quizAttempts.forEach((attempt) => {
      const topicId = attempt.quiz.topic.id;
      const topic = attempt.quiz.topic;
      const userId = attempt.userId;

      // Count attempts
      if (!topicCountMap.has(topicId)) {
        topicCountMap.set(topicId, {
          topic,
          count: 0,
          users: new Set(),
        });
      }

      topicCountMap.get(topicId).count += 1;
      topicCountMap.get(topicId).users.add(userId);
    });

    // Convert to array and sort
    let popularTopics = Array.from(topicCountMap.values())
      .map(({ topic, count, users }) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description || "",
        attemptCount: count,
        uniqueUsers: users.size,
      }))
      .sort((a, b) => b.attemptCount - a.attemptCount)
      .slice(0, 5);

    // If we don't have 5 topics with attempts, get additional popular topics by favorites
    if (popularTopics.length < 5) {
      const existingTopicIds = popularTopics.map((topic) => topic.id);
      const neededCount = 5 - popularTopics.length;

      // Find most favorited topics not already in our list
      const favoritedTopics = await prisma.userFavorite.groupBy({
        by: ["topicId"],
        where: {
          topicId: {
            notIn: existingTopicIds,
          },
        },
        _count: {
          topicId: true,
        },
        orderBy: {
          _count: {
            topicId: "desc",
          },
        },
        take: neededCount,
      });

      // Get the full topic data for these favorites
      if (favoritedTopics.length > 0) {
        const additionalTopics = await prisma.topic.findMany({
          where: {
            id: {
              in: favoritedTopics.map((t) => t.topicId),
            },
          },
        });

        for (const topic of additionalTopics) {
          const favoriteCount =
            favoritedTopics.find((t) => t.topicId === topic.id)?._count
              .topicId || 0;

          popularTopics.push({
            id: topic.id,
            name: topic.name,
            description: topic.description || "",
            attemptCount: 0,
            uniqueUsers: favoriteCount,
          });
        }
      }
    }

    // If we still don't have 5 topics, get any remaining topics
    if (popularTopics.length < 5) {
      const existingTopicIds = popularTopics.map((topic) => topic.id);
      const neededCount = 5 - popularTopics.length;

      const additionalTopics = await prisma.topic.findMany({
        where: {
          id: {
            notIn: existingTopicIds,
          },
        },
        take: neededCount,
      });

      popularTopics = popularTopics.concat(
        additionalTopics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          description: topic.description || "",
          attemptCount: 0,
          uniqueUsers: 0,
        }))
      );
    }

    res.status(200).json({
      success: true,
      popularTopics,
    });
  } catch (error: any) {
    console.error("Error fetching popular topics:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: "User does not exist" });
    }

    // Get quiz attempts data
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        answers: true,
      },
    });

    // Calculate statistics
    const totalQuizzes = quizAttempts.length;
    const completedQuizzes = quizAttempts.filter((qa) => qa.isCompleted).length;
    const correctAnswers = quizAttempts.reduce(
      (sum, qa) => sum + qa.answers.filter((a) => a.isCorrect).length,
      0
    );
    const wrongAnswers = quizAttempts.reduce(
      (sum, qa) => sum + qa.answers.filter((a) => !a.isCorrect).length,
      0
    );
    const totalAnswers = correctAnswers + wrongAnswers;
    const averageAccuracy =
      totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

    // Get unique topics attempted
    const uniqueTopics = await prisma.quiz.findMany({
      where: {
        attempts: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        topicId: true,
      },
      distinct: ["topicId"],
    });

    const attemptedTopicsCount = uniqueTopics.length;

    // Update or create user statistics
    const stats = await prisma.userStatistics.upsert({
      where: { userId: user.id },
      update: {
        totalQuizzes,
        completedQuizzes,
        correctAnswers,
        wrongAnswers,
        averageAccuracy,
        topicsAttempted: attemptedTopicsCount,
        lastUpdated: new Date(),
      },
      create: {
        userId: user.id,
        totalQuizzes,
        completedQuizzes,
        correctAnswers,
        wrongAnswers,
        averageAccuracy,
        topicsAttempted: attemptedTopicsCount,
        lastUpdated: new Date(),
      },
    });

    // Get the topic distribution with raw query
    const rawTopicDistribution = await prisma.$queryRaw<TopicDistribution[]>`
        SELECT t.id, t.name, COUNT(*) as count
        FROM "QuizAttempt" qa
        JOIN "Quiz" q ON qa."quizId" = q.id
        JOIN "Topic" t ON q."topicId" = t.id
        WHERE qa."userId" = ${user.id}
        GROUP BY t.id, t.name
      `;

    // Convert BigInt values to regular numbers and include topic ID
    const topicDistribution = rawTopicDistribution.map(
      (item: TopicDistribution) => ({
        id: item.id,
        name: item.name,
        count: Number(item.count),
      })
    );

    // Get top 5 most attempted topics by the user
    const topAttemptedTopics = await prisma.$queryRaw<
      { id: string; name: string; count: BigInt }[]
    >`
        SELECT t.id, t.name, COUNT(*) as count
        FROM "QuizAttempt" qa
        JOIN "Quiz" q ON qa."quizId" = q.id
        JOIN "Topic" t ON q."topicId" = t.id
        WHERE qa."userId" = ${user.id}
        GROUP BY t.id, t.name
        ORDER BY count DESC
        LIMIT 5
      `;

    // Convert BigInt values to regular numbers
    const popularTopics = topAttemptedTopics.map((item) => ({
      id: item.id,
      name: item.name,
      count: Number(item.count),
    }));

    // Get favorite topics with full topic information
    const favoriteTopics = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        topic: true,
      },
    });

    // Map favorite topics to include the topic properties directly
    const mappedFavoriteTopics = favoriteTopics.map((f) => ({
      id: f.topic.id, // Ensure the topic ID is included
      name: f.topic.name,
      description: f.topic.description,
      favoriteId: f.id, // Include the favorite relationship ID if needed
    }));

    const recommendedQuizzes = await prisma.quiz.findMany({
      where: {
        topicId: {
          in: favoriteTopics.map((f) => f.topicId),
        },
        attempts: {
          none: {
            userId: user.id,
          },
        },
      },
      take: 5,
      include: {
        topic: true,
      },
    });

    // If there are no favorite topics, get some recommended quizzes based on attempt history
    let finalRecommendedQuizzes = recommendedQuizzes;
    if (finalRecommendedQuizzes.length === 0 && topicDistribution.length > 0) {
      // Get topics the user has attempted
      const attemptedTopicNames = topicDistribution.map((t) => t.name);

      // Find quizzes from topics the user has attempted but not taken yet
      finalRecommendedQuizzes = await prisma.quiz.findMany({
        where: {
          topic: {
            name: {
              in: attemptedTopicNames,
            },
          },
          attempts: {
            none: {
              userId: user.id,
            },
          },
        },
        take: 5,
        include: {
          topic: true,
        },
      });
    }

    // If still no recommended quizzes, get quizzes from popular topics (that the user hasn't attempted)
    if (finalRecommendedQuizzes.length === 0 && popularTopics.length > 0) {
      const popularTopicIds = popularTopics.map((t) => t.id);

      finalRecommendedQuizzes = await prisma.quiz.findMany({
        where: {
          topicId: {
            in: popularTopicIds,
          },
          attempts: {
            none: {
              userId: user.id,
            },
          },
        },
        take: 5,
        include: {
          topic: true,
        },
      });
    }

    res.json({
      performance: stats,
      topicDistribution,
      popularTopics,
      favoriteTopics: mappedFavoriteTopics, // Updated to use our mapped format with IDs
      recommendedQuizzes: finalRecommendedQuizzes,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
