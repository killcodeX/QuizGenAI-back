import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import router from "./routes/router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const prisma = new PrismaClient();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/quizgenai", router);

// Global Error Handler (Must be placed after routes)
// app.use(errorHandler);

// Graceful Shutdown for Prisma
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Server Listening
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
