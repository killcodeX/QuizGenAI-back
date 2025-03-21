import { Request, Response, NextFunction } from "express";

// Custom Error Interface
interface CustomError extends Error {
  status?: number;
}

// Global Error Handler Middleware
const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
