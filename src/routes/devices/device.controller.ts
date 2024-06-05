import prisma from "../../data-source";

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
      Category: true,
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
      Category: true,
    },
    where: {
      id,
    },
  });
};

type DeviceData = {
  dateOfPurchase: Date;
  expectedLifeTime: number;
  producer: string;
  purchasePrice: number;
  specification: string;
  name: string;
};

export const editDevice = async (id: number, data: DeviceData) => {
  await prisma.deviceDetails.update({
    where: {
      id,
    },
    data: {
      description: data.name,
      dateOfPurchase: data.dateOfPurchase,
      expectedLifeTime: data.expectedLifeTime,
      producer: data.producer,
      purchasePrice: data.purchasePrice,
      specification: data.specification,

      device: {
        update: {
          name: data.name,
        },
      },
    },
    include: {
      device: true,
    },
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

export const removeDevice = async (id: number) => {
  return prisma.deviceDetails.delete({
    where: {
      id,
    },
  });
};

export const createDevice = async (data: DeviceData) => {
  return prisma.deviceDetails.create({
    data: {
      description: data.name,
      dateOfPurchase: data.dateOfPurchase,
      expectedLifeTime: data.expectedLifeTime,
      producer: data.producer,
      purchasePrice: data.purchasePrice,
      specification: data.specification,
      device: {
        create: {
          name: data.name,
        },
      },
    },
    include: {
      device: true,
    },
  });
};
