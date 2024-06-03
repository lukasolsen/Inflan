import { Router } from "express";

const Route = Router();

Route.get("/", (req, res) => {
  res.send("Hello World");
});

export default Route;
