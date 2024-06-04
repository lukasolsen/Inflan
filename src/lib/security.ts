import { User } from "@prisma/client";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
  return crypto.createHmac("sha256", password).digest("hex");
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return hash === (await hashPassword(password));
};

export const generateJWT = async (id: number) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

export const sanitizeUser = (user: User) => {
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...sanitizedUser } = user;

  return sanitizedUser;
};

export const verifyEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
