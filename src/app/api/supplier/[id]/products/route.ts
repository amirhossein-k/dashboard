// src/app/api/supplier/[id]/products/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> } // تعریف params به‌صورت Promise
) {
    const params = await context.params; // await برای استخراج id
    const { id } = params;
    if (!id) {
        return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }
    try {
        const products = await prisma.product.findMany({
            where: { supplierId: id },
            select: {
                id: true,
                title: true,
                price: true,
                count: true,
                lastUpdatedBySupplier: true,
                colors: true
            },

        });

        // const


        console.log(`Products for supplier ${id}:`, products);
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect(); // بستن اتصال Prisma
    }
}