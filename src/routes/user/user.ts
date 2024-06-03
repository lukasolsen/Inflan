import { Router } from "express";
import {
  createUser,
  fetchUserByEmail,
  fetchUserById,
  fetchUserByUsername,
  fetchUsers,
} from "./user.controller";
import { comparePassword, generateJWT, sanitizeUser } from "../../lib/security";
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

UserRoute.post("/", async (req, res) => {
  const { email, password, username, name } = req.body;

  const user = await createUser(email, password, username, name, Role.USER);

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
