import prisma from "../../data-source";
import { DeviceDetails, Devices } from "@prisma/client";

/**
 * Fetch all devices
 * @returns {Promise<Device[]>} - List of devices
 */
export const fetchDevices = async (options: {
  limit: number;
  offset: number;
}) => {
  return prisma.deviceDetails.findMany({
    include: {
      device: true,
    },
    skip: options.offset,
    take: options.limit,
    orderBy: {
      device: {
        id: "asc",
      },
    },
  });
};

/**
 * Fetch device by id
 * @param id
 * @returns {Promise<Device | null>} - Device object or null
 */
export const fetchDeviceById = async (id: number) => {
  return prisma.deviceDetails.findUnique({
    include: {
      device: {
        include: {
          owner: true,
        },
      },
    },
    where: {
      id,
    },
  });
};

export const editDevice = async (id: number, data: DeviceDetails) => {
  return prisma.deviceDetails.update({
    where: {
      id,
    },
    data,
  });
};

/**
 * Return device
 * @param id
 * @returns {Promise<DeviceDetails>} - Device object
 */
export const returnDevice = async (id: number) => {
  return prisma.deviceDetails.update({
    where: {
      id,
    },
    data: {
      device: {
        update: {
          ownerId: null,
        },
      },
    },
  });
};

/**
 * Rent device
 * @param id
 * @param userId
 * @returns {Promise<DeviceDetails>} - Device object
 */
export const rentDevice = async (id: number, userId: number) => {
  return prisma.deviceDetails.update({
    where: {
      id,
    },
    data: {
      device: {
        update: {
          ownerId: userId,
        },
      },
    },
  });
};
