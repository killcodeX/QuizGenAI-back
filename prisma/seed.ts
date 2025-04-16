import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create sample topics
  const jsTopicData = await prisma.topic.create({
    data: {
      name: "JavaScript",
      description: "Core JavaScript programming concepts",
    },
  });

  const jsIITopicData = await prisma.topic.create({
    data: {
      name: "JavaScript II",
      description: "Advanced JavaScript programming concepts",
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
      name: "Games",
      description: "Video game knowledge and trivia",
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
        create: [
          {
            text: "What is hoisting in JavaScript?",
            options: JSON.stringify([
              "Moving declarations to the top of the scope",
              "Removing unused variables",
              "Optimizing the code execution",
              "A way to organize imports",
            ]),
            correctAnswer: "0",
            explanation:
              "Hoisting is JavaScript's default behavior of moving declarations to the top of the scope.",
            orderIndex: 0,
          },
          // Add more questions
        ],
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
