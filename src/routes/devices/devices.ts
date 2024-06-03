import { Router } from "express";
import { fetchDeviceById, fetchDevices } from "./device.controller";

const DeviceRoute = Router();

DeviceRoute.get("/", async (req, res) => {
  const devices = await fetchDevices({
    limit: Number(req.query.limit) || 10,
    offset: Number(req.query.offset) || 0,
  });

  res.json(devices);
});

DeviceRoute.get("/:id", async (req, res) => {
  const { id } = req.params;

  const device = await fetchDeviceById(Number(id));

  if (!device) {
    return res.status(404).send("Device not found");
  }

  res.json(device);
});

export default DeviceRoute;
