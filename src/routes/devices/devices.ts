import { Router } from "express";
import {
  editDevice,
  fetchDeviceById,
  fetchDevices,
  rentDevice,
  returnDevice,
} from "./device.controller";
import { sanitizeUser } from "../../lib/security";
import { User } from "@prisma/client";
import { DeviceDetails } from "@prisma/client";

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

  const sanitizedUser = sanitizeUser(device.device?.owner as User);

  res.json({
    ...device,
    device: {
      ...device.device,
      owner: sanitizedUser,
    },
  });
});

DeviceRoute.post("/:id/rent", async (req, res) => {
  const { id } = req.params;

  const device = await fetchDeviceById(Number(id));

  if (!device) {
    return res.status(404).send("Device not found");
  }

  if (device.device?.ownerId === req.user?.id) {
    return res.status(400).send("You already own this device");
  }

  if (device.device?.ownerId !== null) {
    return res.status(400).send("Device already rented");
  }

  await rentDevice(Number(id), req.user?.id as number);

  res.status(201).json("Device returned");
});

DeviceRoute.post("/:id/return", async (req, res) => {
  const { id } = req.params;

  const device = await fetchDeviceById(Number(id));

  if (!device) {
    return res.status(404).send("Device not found");
  }

  if (device.device?.ownerId !== req.user?.id) {
    return res.status(401).send("Unauthorized");
  }

  await returnDevice(Number(id));

  res.status(201).json("Device returned");
});

DeviceRoute.put("/:id", async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "ADMIN") {
    return res.status(401).send("Unauthorized");
  }

  // Check for they're allowed parameters
  const allowedParams = [
    "specification",
    "name",
    "producer",
    "dateOfPurchase",
    "purchasePrice",
    "expectedLifeTime",
  ];

  const keys = Object.keys(req.body);

  const isValid = keys.every((key) => allowedParams.includes(key));

  if (!isValid) {
    return res.status(400).send("Invalid parameters");
  }

  const device = await fetchDeviceById(Number(id));

  if (!device) {
    return res.status(404).send("Device not found");
  }

  const updatedDevice = await editDevice(Number(id), req.body);

  res.json(updatedDevice);
});

export default DeviceRoute;
