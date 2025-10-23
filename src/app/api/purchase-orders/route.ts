// src\app\api\purchase-orders\route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const storeOwnerId = searchParams.get("storeOwnerId");
        const supplierId = searchParams.get("supplierId");

        // باید شرط فیلتر را بر اساس رابطه‌ی PurchaseOrderItem → Product → Supplier بنویسی:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (storeOwnerId) where.storeOwnerId = storeOwnerId;
        // "سفارشاتی را برگردان که حداقل یک آیتم دارد که محصولش مربوط به این تأمین‌کننده است."
        if (supplierId) {
            where.items = {
                some: {
                    product: {
                        supplierId: supplierId,
                    },
                },
            };
        }
        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            include: { supplier: true }, // ← اضافه کردن این خط
                        },
                    }
                }, storeOwner: true
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(purchaseOrders);
    } catch (error) {
        console.error("Error fetching purchase orders:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { storeOwnerId, items, totalPrice } = body;
        if (!storeOwnerId || !items || !totalPrice)
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        //         items: {
        //   "storeOwnerId": "654321",
        //   "totalPrice": 250000,
        //   "items": [
        //     {
        //       "product": { "connect": { "id": "PRODUCT_ID" } },
        //       "quantity": 2,
        //       "unitPrice": 100000,
        //       "totalPrice": 200000
        //     }
        //   ]
        // }

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                storeOwnerId,
                totalPrice: parseFloat(totalPrice),
                status: "PENDING",
                items: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    create: items.map((item: any) => ({
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        colorsSelect: item.colorsSelect,
                        product: { connect: { id: item.productId } },
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: { include: { supplier: true } },
                    },
                },
                storeOwner: true,
            },
        });

        return NextResponse.json(purchaseOrder, { status: 201 });
    } catch (error) {
        console.error("Error creating purchase order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { status } = body;
        if (!status) return NextResponse.json({ error: "Status is required" }, { status: 400 });

        const updatedOrder = await prisma.purchaseOrder.update({
            where: { id: params.id },
            data: { status },
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating purchase order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
