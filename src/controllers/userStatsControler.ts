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
    // console.log("================== GETTING USER STATS ==================");
    // console.log(`Getting stats for email: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("User not found");
      return res.status(200).json({ message: "User does not exist" });
    }

    // console.log(`Found user with ID: ${user.id}`);

    // CRITICAL: First, let's directly query answers to check what's in the database
    const directAnswers = await prisma.answer.findMany({
      where: {
        attemptId: {
          in: await prisma.quizAttempt
            .findMany({
              where: { userId: user.id },
              select: { id: true },
            })
            .then((attempts) => attempts.map((a) => a.id)),
        },
      },
      include: {
        quizAttempt: {
          select: {
            id: true,
            quizId: true,
          },
        },
      },
    });

    // console.log(
    //   `Direct answer query found ${directAnswers.length} answer records`
    // );

    if (directAnswers.length > 0) {
      // Sample the first few answers to see their structure
      const sampleAnswers = directAnswers.slice(
        0,
        Math.min(3, directAnswers.length)
      );
      sampleAnswers.forEach((answer, i) => {
        console.log(`Sample answer ${i + 1}:`, {
          id: answer.id,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
          typeOfIsCorrect: typeof answer.isCorrect,
          rawValue: JSON.stringify(answer.isCorrect),
          attemptId: answer.attemptId,
        });
      });

      // Check isCorrect data distribution
      const trueValues = directAnswers.filter(
        (a) => a.isCorrect === true
      ).length;
      const falseValues = directAnswers.filter(
        (a) => a.isCorrect === false
      ).length;
      const stringTrueValues = directAnswers.filter(
        (a) => String(a.isCorrect) === "true"
      ).length;
      const stringFalseValues = directAnswers.filter(
        (a) => String(a.isCorrect) === "false"
      ).length;
      const oneValues = directAnswers.filter(
        (a) => String(a.isCorrect) === "1"
      ).length;
      const zeroValues = directAnswers.filter(
        (a) => String(a.isCorrect) === "0"
      ).length;

      // console.log("isCorrect value distribution in database:");
      // console.log(`- true (boolean): ${trueValues}`);
      // console.log(`- false (boolean): ${falseValues}`);
      // console.log(`- "true" (string): ${stringTrueValues}`);
      // console.log(`- "false" (string): ${stringFalseValues}`);
      // console.log(`- 1 (number): ${oneValues}`);
      // console.log(`- 0 (number): ${zeroValues}`);

      // CRITICAL FIX: Determine the most likely data format for isCorrect
      let correctAnswerFormat = "boolean";
      if (stringTrueValues > trueValues) correctAnswerFormat = "string";
      else if (oneValues > trueValues) correctAnswerFormat = "number";

      console.log(
        `Detected isCorrect format appears to be: ${correctAnswerFormat}`
      );
    }

    // Get quiz attempts data
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                correctAnswer: true,
                options: true,
              },
            },
          },
        },
      },
    });

    // console.log(
    //   `Found ${quizAttempts.length} quiz attempts for user ${user.id}`
    // );

    // Calculate statistics with improved data type handling
    const totalQuizzes = quizAttempts.length;
    const completedQuizzes = quizAttempts.filter((qa) => qa.isCompleted).length;

    // CRITICAL FIX: Use the isCorrect flag from the database
    // This avoids the issue of comparing user answer text with correct answer index
    let correctAnswers = 0;
    let wrongAnswers = 0;

    quizAttempts.forEach((qa, index) => {
      // console.log(
      //   `\nQuiz attempt ${index + 1} (ID: ${qa.id}): Has ${
      //     qa.answers.length
      //   } answers`
      // );

      // Count correct answers using isCorrect flag, since this was already
      // properly calculated during the save process
      const correctInThisAttempt = qa.answers.filter((a) => {
        // IMPROVED: Primary way to check is using the isCorrect flag
        if (
          a.isCorrect === true ||
          String(a.isCorrect).toLowerCase() === "true" ||
          String(a.isCorrect) === "1"
        ) {
          return true;
        }

        // DEBUG: Log when using fallback comparison
        if (
          a.question &&
          a.userAnswer &&
          a.question.options &&
          a.question.correctAnswer
        ) {
          //console.log(`Using fallback comparison for answer ${a.id}:`);

          // Parse question options if needed
          let options;
          try {
            if (typeof a.question.options === "string") {
              options = JSON.parse(a.question.options);
            } else {
              options = a.question.options;
            }
          } catch (error) {
            console.error(`Failed to parse options for answer ${a.id}`);
            return false;
          }

          // Find the index of the user's answer in the options array
          const userAnswerIndex = options.findIndex(
            (option: string) => option === a.userAnswer
          );

          // Convert both to strings and compare
          const userAnswerIndexStr = String(userAnswerIndex);
          const correctAnswerStr = String(a.question.correctAnswer);

          const isCorrect = userAnswerIndexStr === correctAnswerStr;

          // console.log(
          //   `User answer: "${a.userAnswer}" (index: ${userAnswerIndex})`
          // );
          // console.log(`Correct answer index: "${a.question.correctAnswer}"`);
          // console.log(`Is correct: ${isCorrect}`);

          return isCorrect;
        }

        return false;
      }).length;

      //console.log(`Correct answers in this attempt: ${correctInThisAttempt}`);
      correctAnswers += correctInThisAttempt;
      wrongAnswers += qa.answers.length - correctInThisAttempt;
    });

    // Double-check with direct calculation from raw answer data
    const directCorrectCount = directAnswers.filter((a) => {
      return (
        a.isCorrect === true ||
        String(a.isCorrect).toLowerCase() === "true" ||
        String(a.isCorrect) === "1"
      );
    }).length;

    const directWrongCount = directAnswers.length - directCorrectCount;

    // console.log("\nComparing calculation methods:");
    // console.log(
    //   `- From quiz attempts: Correct=${correctAnswers}, Wrong=${wrongAnswers}, Total=${
    //     correctAnswers + wrongAnswers
    //   }`
    // );
    // console.log(
    //   `- From direct answers: Correct=${directCorrectCount}, Wrong=${directWrongCount}, Total=${
    //     directCorrectCount + directWrongCount
    //   }`
    // );

    // CRITICAL FIX: If there's a discrepancy, use the direct counts
    if (correctAnswers !== directCorrectCount) {
      //console.log("Using direct answer counts due to discrepancy");
      correctAnswers = directCorrectCount;
      wrongAnswers = directWrongCount;
    }

    const totalAnswers = correctAnswers + wrongAnswers;
    const averageAccuracy =
      totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

    // console.log(
    //   `Final statistics: Correct answers: ${correctAnswers}, Wrong answers: ${wrongAnswers}, Total: ${totalAnswers}`
    // );

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

    //console.log("================== END GETTING USER STATS ==================");

    res.json({
      performance: stats,
      topicDistribution,
      popularTopics,
      favoriteTopics: mappedFavoriteTopics,
      recommendedQuizzes: finalRecommendedQuizzes,
    });
  } catch (error: any) {
    console.error("Error in getUserStats:", error);
    res.status(500).json({ error: error.message });
  }
};
