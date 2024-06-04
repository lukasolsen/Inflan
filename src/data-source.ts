import { PrismaClient } from "@prisma/client";
import consola from "consola";
import { hashPassword } from "./lib/security";
import fs from "fs";

const prisma = new PrismaClient();

async function connectPrisma() {
  try {
    await prisma.$connect();
    consola.success("Prisma connected successfully");
  } catch (error) {
    consola.error("Prisma connection error:", error);
    process.exit(1);
  }
}

async function createAdminUser() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    const adminPass = await hashPassword(
      process.env.DEFAULT_ADMIN_PASSWORD || "root"
    );
    await prisma.user.create({
      data: {
        email: process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com",
        password: adminPass,
        username: "admin",
        name: "Admin",
        role: "ADMIN",
      },
    });

    consola.success("Admin user created successfully");
  } else {
    consola.success("Admin user already exists");
  }
}

async function createDevices() {
  const devices = await prisma.devices.findMany();
  if (devices.length === 0) {
    const data = fs.readFileSync(
      "./data/inventory_data_with_categories.json",
      "utf8"
    );
    const devicesData = JSON.parse(data);

    // Make the categories if they do not exist.
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      devicesData.map(async (device: { Kategori: any }) => {
        const category = await prisma.categories.findUnique({
          where: {
            name: device.Kategori,
          },
        });

        if (!category) {
          await prisma.categories.create({
            data: {
              name: device.Kategori,
            },
          });
        }
      })
    );

    // Create the devices and device details.
    await Promise.all(
      devicesData.map(
        async (device: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [x: string]: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Kategori: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Beskrivelse: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Produsent: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Spesifikasjoner: any;
        }) => {
          const category = await prisma.categories.findUnique({
            where: {
              name: device.Kategori,
            },
          });

          const dev = await prisma.devices.create({
            data: {
              name: device.Beskrivelse,
            },
          });

          if (dev) {
            const dateOfPurchase = new Date(
              device["Innkjøpsdato"]
            ).toISOString();

            await prisma.deviceDetails.create({
              data: {
                deviceId: dev.id,
                categoryId: category?.id || 1,
                description: device.Beskrivelse,
                dateOfPurchase: dateOfPurchase,
                expectedLifeTime: device["Forventet levetid (i år)"],
                producer: device.Produsent,
                purchasePrice: device["Innkjøpspris"],
                specification: device.Spesifikasjoner,
              },
            });

            consola.success("Device created successfully", dev);
          }
        }
      )
    );
  }
}

export const addRequiredFields = async () => {
  try {
    await connectPrisma();
    await createAdminUser();
    await createDevices();
  } catch (error) {
    consola.error("Error adding required fields:", error);
  } finally {
    await prisma.$disconnect();
  }
};

if (prisma) addRequiredFields();

export default prisma;
