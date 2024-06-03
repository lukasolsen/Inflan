import { Router } from "express";
import UserRoute from "./user/user";

const Route = Router();

Route.use("/users", UserRoute);

export default Route;
