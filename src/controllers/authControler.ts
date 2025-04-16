import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// user signup
export const signUp = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password for normal signup users
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });
    res.json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

// user signIn
export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.password) {
    return res.status(400).json({ message: "Invalid login method" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT Token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );

  res.json({ message: "Login successful", token });
};

// user google auth

export const googleAuth = async (req: Request, res: Response) => {
  const { email, name, googleId } = req.body;

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user if they don't exist
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          // No password for Google users
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing email user
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google authentication successful",
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error authenticating with Google" });
  }
};

export const delUser = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(200).json({ message: "User do not exist" });
    }

    const deleteUser = await prisma.user.delete({
      where: {
        email: email,
      },
    });

    res.json({
      message: "Account removed successfully",
      user: deleteUser,
    });
  } catch (error) {
    res.status(500).json({ message: "System Error" });
  }
};
