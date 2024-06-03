import { Role, User } from "@prisma/client";
import prisma from "../../data-source";

/**
 * Fetch all users
 * @returns {Promise<User[]>} - List of users
 */
export const fetchUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

/**
 * Fetch user by id
 * @param id
 * @returns {Promise<User | null>} - User object or null
 */
export const fetchUserById = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

/**
 * Fetch user by email
 * @param email
 * @param password
 * @param username
 * @param name
 * @param role
 * @returns
 */
export const createUser = async (
  email: string,
  password: string,
  username: string,
  name: string,
  role: Role
): Promise<User> => {
  return prisma.user.create({
    data: {
      email,
      password,
      username,
      name,
      role,
    },
  });
};

export const fetchUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const fetchUserByUsername = async (
  username: string
): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      username,
    },
  });
};
