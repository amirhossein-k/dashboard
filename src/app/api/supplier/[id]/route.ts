// src\app\api\supplier\[id]\route.ts
import { db as prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params?: { id?: string } }
) {
    const id = params?.id;
    if (!id) {
        return new Response("Supplier ID is required", { status: 400 });
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
            },
        });
        return new Response(JSON.stringify(products), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
