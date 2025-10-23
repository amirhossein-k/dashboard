// src\app\api\purchase-orders\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

// PUT /api/purchase-orders/[id] - Update purchase order
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status, invoiceUrl, trackingCode } = body;
        // ساخت آبجکت داینامیک برای بروزرسانی

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {};
        if (status) updateData.status = status;
        if (invoiceUrl) updateData.invoiceUrl = invoiceUrl;
        if (trackingCode) updateData.trackingCode = trackingCode;

        const purchaseOrder = await prisma.purchaseOrder.update({
            where: { id },
            data: updateData,
            include: {
                items: {
                    include: {
                        product: {
                            include: { supplier: true },
                        },
                    },
                },
                storeOwner: true,
            },
        });

        return NextResponse.json(purchaseOrder);
    } catch (error) {
        console.error('Error updating purchase order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



// GET /api/purchase-orders/[id] - Get single purchase order
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { supplier: true }
                        }
                    }
                },
                storeOwner: true
            }
        });

        if (!purchaseOrder) {
            return NextResponse.json(
                { error: 'Purchase order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(purchaseOrder);
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

