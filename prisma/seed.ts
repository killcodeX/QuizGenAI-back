import { PrismaClient } from "@prisma/client";
import { jsQuizData, dmvQuizData, marvelQuizData, webDevQuizData, videoGamesQuizData } from "./smpleData";
const prisma = new PrismaClient();

async function main() {
  // Create sample topics
  const jsTopicData = await prisma.topic.create({
    data: {
      name: "JavaScript",
      description: "Core JavaScript programming concepts",
    },
  });

  const dmv = await prisma.topic.create({
    data: {
      name: "Pennsylvania DMV",
      description: "Sample questions for the PA driver's permit exam",
    },
  });

  const marvelTopicData = await prisma.topic.create({
    data: {
      name: "Marvel",
      description: "Marvel Cinematic Universe knowledge",
    },
  });

  const gamesTopicData = await prisma.topic.create({
    data: {
      name: "Video Games",
      description: "Video game knowledge and trivia",
    },
  });

  const webDeTopicvData = await prisma.topic.create({
    data: {
      name: "Web Development Basics",
      description: "Introduction to HTML, CSS, and JavaScript",
    },
  });

  const worlWarTopicData = await prisma.topic.create({
    data: {
      name: "World War II",
      description: "Major battles and turning points of the Second World War",
    },
  });

  // Create a sample user
  const userData = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      password: "hashedpassword123", // In reality, you'd hash this
    },
  });

  // Create sample quizzes and questions
  const jsQuiz = await prisma.quiz.create({
    data: {
      title: "JavaScript Fundamentals",
      topicId: jsTopicData.id,
      difficulty: "MEDIUM",
      description: "Test your knowledge of JavaScript basics",
      questions: {
        create: jsQuizData,
      },
    },
  });

  // Create sample quizzes and questions
  const dmvQuiz = await prisma.quiz.create({
    data: {
      title: "Pennsylvania DMV",
      topicId: dmv.id,
      difficulty: "MEDIUM",
      description: "Sample questions for the PA driver's permit exam",
      questions: {
        create: dmvQuizData,
      },
    },
  });

  const marvelQuiz = await prisma.quiz.create({
    data: {
      title: "Marvel",
      topicId: marvelTopicData.id,
      difficulty: "MEDIUM",
      description: "Marvel Cinematic Universe knowledge",
      questions: {
        create: marvelQuizData,
      },
    },
  });

  const webDevQuiz = await prisma.quiz.create({
    data: {
      title: "Web Development Basics",
      topicId: webDeTopicvData.id,
      difficulty: "MEDIUM",
      description: "Introduction to HTML, CSS, and JavaScript",
      questions: {
        create: webDevQuizData,
      },
    },
  });

  const videoGamesQuiz = await prisma.quiz.create({
    data: {
      title: "Video Games",
      topicId: gamesTopicData.id,
      difficulty: "MEDIUM",
      description: "Video game knowledge and trivia",
      questions: {
        create: videoGamesQuizData,
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
