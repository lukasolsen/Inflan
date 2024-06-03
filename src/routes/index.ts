import { Router } from "express";
import UserRoute from "./user/user";
import DeviceRoute from "./devices/devices";

const Route = Router();

Route.use("/users", UserRoute);
Route.use("/devices", DeviceRoute);

export default Route;
