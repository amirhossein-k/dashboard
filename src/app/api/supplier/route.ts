// src\app\api\supplier\route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        console.log("Raw suppliers data:", suppliers);
        return NextResponse.json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}