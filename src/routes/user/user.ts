import { Router } from "express";
import {
  createUser,
  fetchUserByEmail,
  fetchUserById,
  fetchUserByUsername,
  fetchUsers,
} from "./user.controller";
import {
  comparePassword,
  generateJWT,
  hashPassword,
  sanitizeUser,
  verifyEmail,
} from "../../lib/security";
import { Role } from "@prisma/client";

const UserRoute = Router();

UserRoute.get("/", async (req, res) => {
  const users = await fetchUsers();

  const sanitizedUsers = users.map((user) => sanitizeUser(user));

  res.json(sanitizedUsers);
});

UserRoute.get("/me", async (req, res) => {
  res.json(sanitizeUser(req.user));
});

UserRoute.get("/:id", async (req, res) => {
  const { id } = req.params;

  const user = await fetchUserById(Number(id));

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.json(sanitizeUser(user));
});

UserRoute.post("/register", async (req, res) => {
  const { email, password, username, name } = req.body;

  if (!email || !password || !username || !name) {
    return res
      .status(400)
      .send("Email, password, username, and name are required");
  }

  if (!verifyEmail(email)) {
    return res.status(400).send("Invalid email");
  }

  const existingUser = await fetchUserByEmail(email);

  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  const existingUsername = await fetchUserByUsername(username);
  if (existingUsername) {
    return res.status(400).send("Username already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser(
    email,
    hashedPassword,
    username,
    name,
    Role.USER
  );

  res.json(sanitizeUser(user));
});

UserRoute.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  const user = await fetchUserByUsername(username);

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    return res.status(401).send("Invalid credentials");
  }

  const token = await generateJWT(user.id);

  res.json({ token });
});

export default UserRoute;
