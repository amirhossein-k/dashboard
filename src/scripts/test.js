// scripts/test.js

// node src/scripts/test.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // 1. ایجاد یا به‌روزرسانی برند
    const brand = await prisma.brand.upsert({
      where: { id: "689c767ba398a167e20faccd" },
      update: { name: "samsung" },
      create: {
        id: "689c767ba398a167e20faccd",
        name: "samsung",
      },
    });
    console.log("Brand created/updated:", brand);

    // 2. ایجاد یا به‌روزرسانی مدل
    const model = await prisma.model.upsert({
      where: { id: "689c7742a398a167e20facd8" },
      update: {
        name: "a55",
        brandId: brand.id, // اطمینان از استفاده از ObjectId
      },
      create: {
        id: "689c7742a398a167e20facd8",
        name: "a90",
        brandId: brand.id,
      },
    });
    console.log("Model created/updated:", model);

    // 3. ایجاد یا به‌روزرسانی واریانت
    const variant = await prisma.variant.upsert({
      where: { id: "689c851f0374b6eea10f4428" },
      update: {
        color: "red",
        inventory: 1,
        modelId: model.id,
      },
      create: {
        id: "689c851f0374b6eea10f4428",
        color: "red",
        inventory: 1,
        modelId: model.id,
      },
    });
    console.log("Variant created/updated:", variant);

    // 4. تست کوئری برای اطمینان از صحت داده‌ها
    console.log("Testing all models...");
    const allModels = await prisma.model.findMany({});
    console.log("All Models:", allModels);

    console.log("Testing models with brandId...");
    const models = await prisma.model.findMany({
      where: { brandId: "689c767ba398a167e20faccd" },
    });
    console.log("Models for brandId 689c767ba398a167e20faccd:", models);

    console.log("Testing brand existence...");
    const brandCheck = await prisma.brand.findUnique({
      where: { id: "689c767ba398a167e20faccd" },
    });
    console.log("Brand:", brandCheck);

    console.log("Testing raw query...");
    const rawModels = await prisma.$runCommandRaw({
      aggregate: "Model",
      pipeline: [
        {
          $match: {
            brandId: { $oid: "689c767ba398a167e20faccd" },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            brandId: { $toString: "$brandId" },
          },
        },
      ],
      cursor: {},
    });
    console.log("Raw Models:", rawModels);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
