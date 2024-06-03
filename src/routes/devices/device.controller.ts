import prisma from "../../data-source";
import { DeviceDetails, Devices } from "@prisma/client";

/**
 * Fetch all devices
 * @returns {Promise<Device[]>} - List of devices
 */
export const fetchDevices = async (options: {
  limit: number;
  offset: number;
}): Promise<DeviceDetails[]> => {
  return prisma.deviceDetails.findMany({
    include: {
      device: true,
    },
    skip: options.offset,
    take: options.limit,
  });
};

/**
 * Fetch device by id
 * @param id
 * @returns {Promise<Device | null>} - Device object or null
 */
export const fetchDeviceById = async (
  id: number
): Promise<DeviceDetails | null> => {
  return prisma.deviceDetails.findUnique({
    include: {
      device: true,
    },
    where: {
      id,
    },
  });
};
