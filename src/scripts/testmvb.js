import { PrismaClient } from "@prisma/client";

// node src/scripts/testmvb.js

const prisma = new PrismaClient();

// تعریف نمونه‌های برند، مدل و واریانت
const sampleData = [
  {
    brand: {
      id: "689c767ba398a167e20faccd",
      name: "samsung",
    },
    models: [
      {
        id: "689c7742a398a167e20facd8",
        name: "a55",
        variants: [
          { id: "689c851f0374b6eea10f4428", color: "red", inventory: 1 },
          { id: "689c851f0374b6eea10f4429", color: "blue", inventory: 2 },
        ],
      },
      {
        id: "689c7742a398a167e20facd9",
        name: "galaxy s21",
        variants: [
          { id: "689c851f0374b6eea10f4430", color: "black", inventory: 5 },
        ],
      },
    ],
  },
  {
    brand: {
      id: "689c767ba398a167e20facce",
      name: "apple",
    },
    models: [
      {
        id: "689c7742a398a167e20facda",
        name: "iphone 13",
        variants: [
          { id: "689c851f0374b6eea10f4431", color: "silver", inventory: 3 },
          { id: "689c851f0374b6eea10f4432", color: "gold", inventory: 4 },
        ],
      },
    ],
  },
];

async function seedSamples() {
  try {
    console.log("Starting database seeding with sample data...");

    // اضافه کردن برندها، مدل‌ها و واریانت‌ها
    for (const { brand, models } of sampleData) {
      // 1. ایجاد یا به‌روزرسانی برند
      const createdBrand = await prisma.brand.upsert({
        where: { id: brand.id },
        update: { name: brand.name },
        create: {
          id: brand.id,
          name: brand.name,
        },
      });
      console.log(
        `Brand created/updated: ${createdBrand.name} (${createdBrand.id})`
      );

      // 2. ایجاد یا به‌روزرسانی مدل‌ها
      for (const model of models) {
        const createdModel = await prisma.model.upsert({
          where: { id: model.id },
          update: {
            name: model.name,
            brandId: createdBrand.id,
          },
          create: {
            id: model.id,
            name: model.name,
            brandId: createdBrand.id,
          },
        });
        console.log(
          `Model created/updated: ${createdModel.name} (${createdModel.id})`
        );

        // 3. ایجاد یا به‌روزرسانی واریانت‌ها
        for (const variant of model.variants) {
          const createdVariant = await prisma.variant.upsert({
            where: { id: variant.id },
            update: {
              color: variant.color,
              inventory: variant.inventory,
              modelId: createdModel.id,
            },
            create: {
              id: variant.id,
              color: variant.color,
              inventory: variant.inventory,
              modelId: createdModel.id,
            },
          });
          console.log(
            `Variant created/updated: ${createdVariant.color} (Inventory: ${createdVariant.inventory}, ID: ${createdVariant.id})`
          );
        }
      }
    }

    // 4. تست کوئری‌ها برای اطمینان از صحت داده‌ها
    console.log("\nTesting seeded data...");

    console.log("All Brands:");
    const allBrands = await prisma.brand.findMany();
    console.log(allBrands);

    console.log("All Models:");
    const allModels = await prisma.model.findMany({});
    console.log(allModels);

    console.log("Models for brandId 689c767ba398a167e20faccd (Samsung):");
    const samsungModels = await prisma.model.findMany({
      where: { brandId: "689c767ba398a167e20faccd" },
    });
    console.log(samsungModels);

    console.log("Variants for modelId 689c7742a398a167e20facd8 (a55):");
    const a55Variants = await prisma.variant.findMany({
      where: { modelId: "689c7742a398a167e20facd8" },
    });
    console.log(a55Variants);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSamples();
